#!/usr/bin/env node
/**
 * Two-pass converter for dark-mode migration:
 *
 * Pass 1 — Fix remaining unconverted .styles.ts files:
 *   Targets files with `export const styles = StyleSheet.create` (lowercase) or
 *   other non-make* exports that the first script missed.
 *
 * Pass 2 — Update all .tsx component files:
 *   For each .tsx that imports from a .styles file, this script:
 *   1. Looks up the actual .styles.ts file to find the make* export name
 *   2. Updates the import statement
 *   3. Adds useMemo call for each converted style
 *
 * Handles all patterns found in the codebase:
 *   import { XxxStyles as alias }         → import { makeXxxStyles } + useMemo alias
 *   import { XxxStyles }                  → import { makeXxxStyles } + useMemo XxxStyles
 *   import { styles }                     → look up .styles file, map to make*, useMemo
 *   import { commonStyles, xStyles }      → handle each separately
 *   import localStyles from '...'         → look up make* fn from .styles file
 *   import { styles, ITEM_WIDTH }         → handle styles, leave ITEM_WIDTH
 */

const fs = require('fs');
const path = require('path');

const SRC_ROOT = path.join(__dirname, '../src');

// ─────────────────────────────────────────────────────────────
// Utilities
// ─────────────────────────────────────────────────────────────

function capitalize(s) {
  return s.charAt(0).toUpperCase() + s.slice(1);
}

function getRoleThemeImportPath(filePath) {
  const fileDir = path.dirname(filePath);
  const typesPath = path.join(SRC_ROOT, 'types', 'roleManager.types');
  let rel = path.relative(fileDir, typesPath).replace(/\\/g, '/');
  if (!rel.startsWith('.')) rel = './' + rel;
  return rel;
}

function findFiles(dir, ext) {
  const results = [];
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const fullPath = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      results.push(...findFiles(fullPath, ext));
    } else if (entry.name.endsWith(ext)) {
      results.push(fullPath);
    }
  }
  return results;
}

const COLOR_REPLACEMENTS = [
  [/\bcolors\.white\b/g,       'theme.surface'],
  [/\bcolors\.black\b/g,       'theme.textPrimary'],
  [/\bcolors\.text\b/g,        'theme.textPrimary'],
  [/\bcolors\.darkGray\b/g,    'theme.textSecondary'],
  [/\bcolors\.lightGray\b/g,   'theme.surface'],
  [/\bcolors\.border\b/g,      'theme.border'],
  [/\bcolors\.placeholder\b/g, 'theme.placeholder'],
  [/\bcolors\.gray\b/g,        'theme.textSecondary'],
];

// ─────────────────────────────────────────────────────────────
// Pass 1: Convert remaining .styles.ts files
// ─────────────────────────────────────────────────────────────

/**
 * Converts lowercase / non-standard export names in .styles.ts files.
 * E.g. `export const styles = StyleSheet.create` → `export const makeXxxStyles = (theme: RoleTheme) => StyleSheet.create`
 * Also handles `export const dropdownStyles`, `export const tutorialHintStyles`, etc.
 */
function convertStylesFile(filePath) {
  let content = fs.readFileSync(filePath, 'utf8');
  let modified = false;

  // Skip files that have no StyleSheet.create patterns
  if (!content.includes('StyleSheet.create')) return false;

  // ── Add RoleTheme import if missing
  if (!content.includes('RoleTheme')) {
    const roleThemeImport = `import type { RoleTheme } from '${getRoleThemeImportPath(filePath)}';`;
    // Insert after last import line
    const lastImportMatch = content.match(/^(import [^\n]+\n)+/m);
    if (lastImportMatch) {
      const insertAt = lastImportMatch.index + lastImportMatch[0].length;
      content = content.slice(0, insertAt) + roleThemeImport + '\n' + content.slice(insertAt);
      modified = true;
    }
  }

  // ── Apply color substitutions
  for (const [pattern, replacement] of COLOR_REPLACEMENTS) {
    const before = content;
    content = content.replace(pattern, replacement);
    if (content !== before) modified = true;
  }

  // ── Convert any remaining `export const \w+ = StyleSheet.create({` that's NOT already make*
  // This handles: `export const styles`, `export const dropdownStyles`, `export const s`, etc.
  const exportRe = /export const (\w+)\s*=\s*StyleSheet\.create\(\{/g;
  const baseName = path.basename(filePath, '.styles.ts');

  content = content.replace(exportRe, (match, name) => {
    if (name.startsWith('make')) return match; // already converted
    modified = true;

    let makeName;
    if (name === 'styles' || name === 's') {
      // Use filename to derive the make name
      makeName = 'make' + baseName + 'Styles';
    } else if (name.endsWith('Styles')) {
      makeName = 'make' + capitalize(name);
    } else if (name.endsWith('styles')) {
      // e.g. dropdownStyles → makeDropdownStyles
      makeName = 'make' + name.charAt(0).toUpperCase() + name.slice(1);
    } else {
      // fallback: just prefix make and capitalize
      makeName = 'make' + capitalize(name) + 'Styles';
    }

    return `export const ${makeName} = (theme: RoleTheme) =>\n  StyleSheet.create({`;
  });

  // Also handle default exports
  if (/export default StyleSheet\.create\(\{/.test(content)) {
    const makeName = 'make' + baseName + 'Styles';
    content = content.replace(
      /export default StyleSheet\.create\(\{/g,
      `export const ${makeName} = (theme: RoleTheme) =>\n  StyleSheet.create({`
    );
    modified = true;
  }

  if (modified) {
    fs.writeFileSync(filePath, content, 'utf8');
  }
  return modified;
}

// ─────────────────────────────────────────────────────────────
// Pass 2: Update .tsx files
// ─────────────────────────────────────────────────────────────

/**
 * Read a .styles.ts file and return a map of: oldName → makeXxxStyles
 * Also returns all make* export names.
 */
const stylesExportCache = new Map();

function getStylesExports(stylesFilePath) {
  if (stylesExportCache.has(stylesFilePath)) return stylesExportCache.get(stylesFilePath);

  let content;
  try {
    content = fs.readFileSync(stylesFilePath, 'utf8');
  } catch (e) {
    return { makeExports: [], nameMap: {} };
  }

  // Find all `export const make*` names
  const makeExports = [];
  const makeRe = /export const (make\w+)\s*=/g;
  let m;
  while ((m = makeRe.exec(content)) !== null) {
    makeExports.push(m[1]);
  }

  // Find any remaining non-make StyleSheet exports (shouldn't exist after pass 1)
  const plainExports = [];
  const plainRe = /export const (\w+)\s*=\s*StyleSheet\.create/g;
  while ((m = plainRe.exec(content)) !== null) {
    if (!m[1].startsWith('make')) plainExports.push(m[1]);
  }

  // Also find non-stylesheet named exports (constants like ITEM_WIDTH, CHIP_W, etc.)
  const constExports = [];
  const constRe = /export const (\w+)\s*=/g;
  while ((m = constRe.exec(content)) !== null) {
    if (!m[1].startsWith('make') && !plainExports.includes(m[1])) {
      constExports.push(m[1]);
    }
  }

  const baseName = path.basename(stylesFilePath, '.styles.ts');

  // Build a reverse map: what was the original name that corresponds to each make* fn?
  const nameMap = {};
  for (const makeName of makeExports) {
    // makeXxxStyles → XxxStyles (remove 'make' prefix and get camelCase)
    const withoutMake = makeName.slice(4); // remove 'make'
    const camel = withoutMake.charAt(0).toLowerCase() + withoutMake.slice(1);
    nameMap[camel] = makeName; // e.g. 'xxxStyles' → 'makeXxxStyles'
    // Also map common aliases
    if (camel.endsWith('Styles')) {
      // The original export might have been imported as 'styles'
    }
  }

  // For a single make* export, also map 'styles' and 's' to it
  if (makeExports.length === 1) {
    nameMap['styles'] = makeExports[0];
    nameMap['s'] = makeExports[0];
    // Also map the filename-derived name
    const fileBasedName = baseName.charAt(0).toLowerCase() + baseName.slice(1) + 'Styles';
    nameMap[fileBasedName] = makeExports[0];
    // And lowercase first char of baseName + Styles
    nameMap[baseName + 'Styles'] = makeExports[0];
  } else {
    // Multiple exports: try to match by prefix
    for (const makeName of makeExports) {
      const withoutMake = makeName.slice(4);
      const camelLower = withoutMake.charAt(0).toLowerCase() + withoutMake.slice(1);
      // If the baseName is part of this, also map 'styles' to the first screen-level one
      if (camelLower.toLowerCase().includes(baseName.toLowerCase())) {
        nameMap['styles'] = nameMap['styles'] || makeName;
      }
      if (camelLower === 'commonStyles') {
        nameMap['common'] = makeName; // commonStyles import → makeCommonStyles
      }
    }
    // If 'styles' still not mapped, map to the first make* that isn't makeCommonStyles
    if (!nameMap['styles']) {
      const nonCommon = makeExports.filter(n => !n.includes('Common'));
      if (nonCommon.length > 0) nameMap['styles'] = nonCommon[0];
      else if (makeExports.length > 0) nameMap['styles'] = makeExports[0];
    }
  }

  const result = { makeExports, nameMap, constExports, plainExports };
  stylesExportCache.set(stylesFilePath, result);
  return result;
}

/**
 * Resolve an import path from a .tsx file to the actual .styles.ts file path.
 */
function resolveStylesPath(tsxFilePath, importPath) {
  const dir = path.dirname(tsxFilePath);
  let resolved = path.resolve(dir, importPath);
  // Try common extensions
  for (const ext of ['.styles.ts', '.ts']) {
    if (fs.existsSync(resolved + ext)) return resolved + ext;
  }
  if (fs.existsSync(resolved + '.styles.ts')) return resolved + '.styles.ts';
  return null;
}

/**
 * Find the indentation of a line.
 */
function getIndent(line) {
  return (line.match(/^(\s*)/) || ['', ''])[1];
}

/**
 * Find the line index of `useUserRole()` destructuring in the component.
 */
function findUserRoleLine(lines) {
  for (let i = 0; i < lines.length; i++) {
    if (/const\s*\{[^}]*\}\s*=\s*useUserRole\s*\(/.test(lines[i])) {
      return i;
    }
  }
  return -1;
}

/**
 * Check if useMemo is already imported.
 */
function hasUseMemo(content) {
  // Check in the imports section (first 800 chars)
  return /\buseMemo\b/.test(content.slice(0, 800));
}

/**
 * Add useMemo to React import if needed.
 */
function addUseMemoToImport(content) {
  if (hasUseMemo(content)) return content;

  // Pattern: import React, { Hook1, Hook2 } from 'react';
  content = content.replace(
    /import React,\s*\{\s*([^}]+)\s*\}\s*from\s*'react'/,
    (match, hooks) => {
      const hookList = hooks.trim();
      if (hookList.includes('useMemo')) return match;
      return `import React, { ${hookList}, useMemo } from 'react'`;
    }
  );

  if (!hasUseMemo(content)) {
    // Pattern: import { Hook1, Hook2 } from 'react';  (no default React)
    content = content.replace(
      /import\s*\{\s*([^}]+)\s*\}\s*from\s*'react'/,
      (match, hooks) => {
        const hookList = hooks.trim();
        if (hookList.includes('useMemo')) return match;
        return `import { ${hookList}, useMemo } from 'react'`;
      }
    );
  }

  return content;
}

/**
 * Parse a named import group like `{ XxxStyles as styles, ITEM_WIDTH, dropdownStyles }`
 * Returns array of { name, alias } where alias may be null.
 */
function parseImportGroup(group) {
  const parts = group.split(',').map(p => p.trim()).filter(Boolean);
  return parts.map(part => {
    const asMatch = part.match(/^(\w+)\s+as\s+(\w+)$/);
    if (asMatch) return { name: asMatch[1], alias: asMatch[2] };
    return { name: part, alias: null };
  });
}

/**
 * Main transform for a .tsx file.
 * Returns new content, or null if no changes needed.
 */
function transformTsx(content, filePath) {
  // Quick check: does it import from any .styles file?
  if (!content.includes(".styles'") && !content.includes('.styles"')) return null;

  // Only process if component uses useUserRole
  const hasUserRole = /useUserRole\s*\(/.test(content);
  if (!hasUserRole) return null;

  let result = content;
  let modified = false;

  // ── Find all import lines from .styles files
  // Handle both single-line and multi-line imports
  // Pattern: import { ... } from '...styles'
  //          import name from '...styles'  (default)

  // Collect all style import infos
  const styleImports = []; // { fullMatch, importSpec, importPath }

  // Parse import statements carefully to avoid cross-statement matches.
  // We scan for `import` keyword and then extract the spec and path cleanly.
  const importStartRe = /\bimport\s+/g;
  let im;
  while ((im = importStartRe.exec(result)) !== null) {
    const afterImport = result.slice(im.index + im[0].length);

    let importSpec;
    let rest;

    if (afterImport.startsWith('{')) {
      // Named import: find matching closing brace
      const closeIdx = afterImport.indexOf('}');
      if (closeIdx === -1) continue;
      importSpec = afterImport.slice(0, closeIdx + 1).trim();
      rest = afterImport.slice(closeIdx + 1);
    } else {
      // Default import (no braces): grab identifier
      const defMatch = afterImport.match(/^(\w+)/);
      if (!defMatch) continue;
      importSpec = defMatch[1];
      rest = afterImport.slice(defMatch[1].length);
    }

    // Now rest should be `  from 'path'`
    const fromMatch = rest.match(/^\s+from\s+'([^']+\.styles)'/);
    if (!fromMatch) continue;

    const importPath = fromMatch[1];
    const fullMatch = result.slice(im.index, im.index + im[0].length + importSpec.length + fromMatch[0].length);
    styleImports.push({ fullMatch, importSpec: importSpec.trim(), importPath });
  }

  if (styleImports.length === 0) return null;

  let addedUseMemoLines = []; // useMemo lines to insert

  for (const { fullMatch, importSpec, importPath } of styleImports) {
    // Resolve the .styles.ts file path
    const stylesFilePath = resolveStylesPath(filePath, importPath);
    if (!stylesFilePath) continue;

    const { makeExports, nameMap, constExports } = getStylesExports(stylesFilePath);
    if (makeExports.length === 0) continue; // styles file not yet converted

    // ── Handle default import: `import localStyles from '...'`
    if (!importSpec.startsWith('{') && !importSpec.includes('{')) {
      // It's a default import like: localStyles  or  React
      const localName = importSpec.trim();
      if (localName.startsWith('{')) continue; // not default

      // Find the make* name (should be only one for default-exported files)
      if (makeExports.length === 1) {
        const makeName = makeExports[0];
        const newImport = fullMatch.replace(
          `import ${localName} from '${importPath}'`,
          `import { ${makeName} } from '${importPath}'`
        );
        result = result.replace(fullMatch, newImport);
        addedUseMemoLines.push({ localName, makeName });
        modified = true;
      }
      continue;
    }

    // ── Handle named imports: `import { ... } from '...'`
    const groupMatch = importSpec.match(/^\{([\s\S]*)\}$/);
    if (!groupMatch) continue;
    const group = groupMatch[1];
    const imports = parseImportGroup(group);

    const newImportParts = [];
    let hasChanges = false;

    for (const { name, alias } of imports) {
      // Check if this name is a non-styles constant (like ITEM_WIDTH, CHIP_W)
      if (constExports.includes(name)) {
        // Keep as-is (it's a constant, not a StyleSheet)
        newImportParts.push(alias ? `${name} as ${alias}` : name);
        continue;
      }

      // Try to find the make* name for this import
      let makeName = nameMap[name];

      // Also try camelCase variants
      if (!makeName && name.endsWith('Styles')) {
        // e.g. 'commonStyles' → look for 'makeCommonStyles'
        const potential = 'make' + capitalize(name);
        if (makeExports.includes(potential)) makeName = potential;
      }

      if (!makeName) {
        // Not a styles import we can map - keep as-is
        newImportParts.push(alias ? `${name} as ${alias}` : name);
        continue;
      }

      // Determine the local variable name for useMemo
      const localVarName = alias || name;

      // Add to new import
      newImportParts.push(makeName);
      hasChanges = true;
      addedUseMemoLines.push({ localName: localVarName, makeName });
    }

    if (hasChanges) {
      const newImportGroup = `{ ${newImportParts.join(', ')} }`;
      // Replace the import spec in the full match
      const newFullMatch = fullMatch.replace(
        /\{[\s\S]*\}/,
        newImportGroup
      );
      result = result.replace(fullMatch, newFullMatch);
      modified = true;
    }
  }

  if (addedUseMemoLines.length === 0) return null;

  // ── Add useMemo to React import
  result = addUseMemoToImport(result);

  // ── Insert useMemo style lines after useUserRole() call
  const resultLines = result.split('\n');
  const userRoleLine = findUserRoleLine(resultLines);

  if (userRoleLine >= 0) {
    const indent = getIndent(resultLines[userRoleLine]);

    // Insert all useMemo calls (in reverse order to maintain line numbers)
    // Check which ones are already present
    const toInsert = [];
    for (const { localName, makeName } of addedUseMemoLines) {
      const memoLine = `${indent}const ${localName} = useMemo(() => ${makeName}(themeColors), [themeColors]);`;
      // Check if already exists nearby
      const alreadyExists = resultLines.slice(userRoleLine, Math.min(userRoleLine + 10, resultLines.length)).some(
        l => l.includes(`const ${localName} = useMemo`)
      );
      if (!alreadyExists) {
        toInsert.push(memoLine);
      }
    }

    if (toInsert.length > 0) {
      resultLines.splice(userRoleLine + 1, 0, ...toInsert);
      result = resultLines.join('\n');
      modified = true;
    }
  }

  return modified ? result : null;
}

// ─────────────────────────────────────────────────────────────
// Main
// ─────────────────────────────────────────────────────────────

console.log('\n═══════════════════════════════════════════════');
console.log(' PASS 1: Convert remaining .styles.ts files');
console.log('═══════════════════════════════════════════════\n');

const stylesFiles = findFiles(SRC_ROOT, '.styles.ts');
let pass1Converted = 0;

for (const file of stylesFiles) {
  try {
    const wasModified = convertStylesFile(file);
    if (wasModified) {
      pass1Converted++;
      console.log(`✓ ${path.relative(SRC_ROOT, file)}`);
    }
  } catch (e) {
    console.error(`✗ ${path.relative(SRC_ROOT, file)}: ${e.message}`);
  }
}

console.log(`\nPass 1 done: ${pass1Converted} files updated\n`);

console.log('\n═══════════════════════════════════════════════');
console.log(' PASS 2: Update .tsx component files');
console.log('═══════════════════════════════════════════════\n');

const tsxFiles = findFiles(SRC_ROOT, '.tsx');
let pass2Converted = 0;
let pass2Failed = 0;
let pass2Skipped = 0;

for (const file of tsxFiles) {
  try {
    const original = fs.readFileSync(file, 'utf8');

    // Skip if no .styles imports
    if (!original.includes(".styles'") && !original.includes('.styles"')) {
      pass2Skipped++;
      continue;
    }

    const transformed = transformTsx(original, file);
    if (transformed && transformed !== original) {
      fs.writeFileSync(file, transformed, 'utf8');
      pass2Converted++;
      console.log(`✓ ${path.relative(SRC_ROOT, file)}`);
    } else {
      pass2Skipped++;
    }
  } catch (e) {
    console.error(`✗ ${path.relative(SRC_ROOT, file)}: ${e.message}`);
    pass2Failed++;
  }
}

console.log(`\nPass 2 done: ${pass2Converted} converted, ${pass2Failed} failed, ${pass2Skipped} skipped`);
