
const fs = require('fs');
const path = require('path');

const SRC_ROOT = path.join(__dirname, '../src');

function findTsxFiles(dir) {
  const results = [];
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const fullPath = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      results.push(...findTsxFiles(fullPath));
    } else if (entry.name.endsWith('.tsx')) {
      results.push(fullPath);
    }
  }
  return results;
}

function capitalize(s) {
  return s.charAt(0).toUpperCase() + s.slice(1);
}

/**
 * Find the line number (0-indexed) of the last `useUserRole()` destructuring or call.
 * Returns -1 if not found.
 */
function findUserRoleLine(lines) {
  for (let i = 0; i < lines.length; i++) {
    // Match patterns like:
    //   const { themeColors } = useUserRole();
    //   const { themeColors, isBusinessRole } = useUserRole();
    if (/const\s*\{[^}]*\}\s*=\s*useUserRole\s*\(/.test(lines[i])) {
      return i;
    }
  }
  return -1;
}

/**
 * Determine indentation from a line.
 */
function getIndent(line) {
  const match = line.match(/^(\s*)/);
  return match ? match[1] : '';
}

function transform(content, filePath) {
  let result = content;


  const styleImportRe = /import\s*\{\s*(\w+Styles)\s+as\s+(\w+)\s*\}\s*from\s*'([^']+\.styles)'/g;
  const styleImportRe2 = /import\s*\{\s*(\w+Styles)\s*\}\s*from\s*'([^']+\.styles)'/g;

  let modified = false;
  const foundStyles = []; // { oldName, localName, path, makeName }

  // Find all style imports (named, with alias)
  let m;
  while ((m = styleImportRe.exec(result)) !== null) {
    const [full, exportedName, localName, importPath] = m;
    // If exportedName starts with 'make', it's already converted - skip
    if (exportedName.startsWith('make')) continue;
    const makeName = 'make' + capitalize(exportedName);
    foundStyles.push({ full, exportedName, localName, importPath, makeName });
  }

  // Find style imports without alias
  while ((m = styleImportRe2.exec(result)) !== null) {
    const [full, exportedName, importPath] = m;
    if (exportedName.startsWith('make')) continue;
    const makeName = 'make' + capitalize(exportedName);
    // localName same as exportedName in this case, we'll rename to 'styles'
    foundStyles.push({ full, exportedName, localName: exportedName, importPath, makeName });
  }

  if (foundStyles.length === 0) return null; // nothing to do

  // ── Check if the component uses useUserRole / themeColors
  const hasUserRole = /useUserRole\s*\(/.test(result);
  if (!hasUserRole) {
    // Can't safely inject useMemo without knowing where themeColors comes from
    return null;
  }

  // ── Process each found style import
  for (const { full, exportedName, localName, importPath, makeName } of foundStyles) {
    // Rename the import from `exportedName as localName` to `makeName`
    const newImport = full
      .replace(exportedName, makeName)
      .replace(` as ${localName}`, ''); // remove alias since we'll create `styles` via useMemo

    result = result.replace(full, newImport);

    // ── Add `useMemo` to React import if not present
    if (!/\buseMemo\b/.test(result.slice(0, result.indexOf('export') > 0 ? result.indexOf('export') : 1000))) {
      result = result.replace(
        /import React,\s*\{([^}]+)\}/,
        (match, hooks) => {
          const hooksClean = hooks.trim();
          return `import React, { ${hooksClean}, useMemo }`;
        }
      );
      // Also handle `import React from 'react'` without braces
      if (!/\buseMemo\b/.test(result.slice(0, 500))) {
        result = result.replace(
          /from 'react';/,
          (match) => match // leave as-is, useMemo might be imported differently
        );
      }
    }

    // ── Insert the useMemo styles line after useUserRole() call
    const lines = result.split('\n');
    const userRoleLine = findUserRoleLine(lines);

    if (userRoleLine >= 0) {
      const indent = getIndent(lines[userRoleLine]);
      // Check if `styles` is already defined via useMemo in this component
      const alreadyHasStyles = lines.slice(userRoleLine, Math.min(userRoleLine + 5, lines.length)).some(
        l => /const styles\s*=\s*useMemo/.test(l)
      );

      if (!alreadyHasStyles) {
        // Insert after userRoleLine
        lines.splice(
          userRoleLine + 1,
          0,
          `${indent}const styles = useMemo(() => ${makeName}(themeColors), [themeColors]);`
        );
        result = lines.join('\n');
        modified = true;
      }
    }
  }

  return modified || result !== content ? result : null;
}

const files = findTsxFiles(SRC_ROOT);
console.log(`Scanning ${files.length} .tsx files...`);

let converted = 0;
let failed = 0;
let skipped = 0;

for (const file of files) {
  try {
    const original = fs.readFileSync(file, 'utf8');

    // Quick check: does it import from a .styles file using old-style xxxStyles?
    if (!/\w+Styles\s+(as\s+\w+\s*)?from\s*'[^']+\.styles'/.test(original)) {
      skipped++;
      continue;
    }

    const transformed = transform(original, file);
    if (transformed && transformed !== original) {
      fs.writeFileSync(file, transformed, 'utf8');
      converted++;
      console.log(`✓ ${path.relative(SRC_ROOT, file)}`);
    } else {
      skipped++;
    }
  } catch (e) {
    console.error(`✗ ${path.relative(SRC_ROOT, file)}: ${e.message}`);
    failed++;
  }
}

console.log(`\nDone: ${converted} converted, ${failed} failed, ${skipped} skipped`);
