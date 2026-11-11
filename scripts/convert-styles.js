
const fs = require('fs');
const path = require('path');

const SRC_ROOT = path.join(__dirname, '../src');

/** Find all unconverted .styles.ts files */
function findFiles(dir) {
  const results = [];
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const fullPath = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      results.push(...findFiles(fullPath));
    } else if (entry.name.endsWith('.styles.ts')) {
      const content = fs.readFileSync(fullPath, 'utf8');
      // Only process files that still use the old static pattern
      if (
        /export const \w+Styles\s*=\s*StyleSheet\.create/.test(content) ||
        /export default StyleSheet\.create/.test(content)
      ) {
        results.push(fullPath);
      }
    }
  }
  return results;
}

/**
 * Given a file path, compute the relative path to the types/roleManager.types.ts
 * (needed for the import statement).
 */
function getRoleThemeImportPath(filePath) {
  const fileDir = path.dirname(filePath);
  const typesPath = path.join(SRC_ROOT, 'types', 'roleManager.types');
  let rel = path.relative(fileDir, typesPath).replace(/\\/g, '/');
  if (!rel.startsWith('.')) rel = './' + rel;
  return rel;
}

/** Capitalize first letter */
function capitalize(s) {
  return s.charAt(0).toUpperCase() + s.slice(1);
}

/**
 * Main transform function.
 * Returns the transformed content, or null if it couldn't be parsed.
 */
function transform(content, filePath) {
  let result = content;

 
  result = result.replace(/^import colors from '([^']+colors[^']*)';?\n/m, '');
  // If it has named imports alongside, just remove the `colors,` part:
  result = result.replace(/^import colors, \{ /m, 'import { ');

  // ── 2. Add RoleTheme import (before StyleSheet usage or at end of imports)
  const roleThemeImport = `import type { RoleTheme } from '${getRoleThemeImportPath(filePath)}';`;
  if (!result.includes('RoleTheme')) {
    // Insert before the first `export` or `const` keyword at top level
    result = result.replace(
      /(^import [^\n]+\n)(?!import )/m,
      (match, p1) => {
        // Find last import line
        const lastImportIdx = result.lastIndexOf('\nimport ');
        return match; // We'll insert after all imports
      }
    );
    // Simpler: append after last import line
    const lastImportMatch = result.match(/^(import [^\n]+\n)+/m);
    if (lastImportMatch) {
      const insertAt = lastImportMatch.index + lastImportMatch[0].length;
      result = result.slice(0, insertAt) + roleThemeImport + '\n' + result.slice(insertAt);
    } else {
      result = roleThemeImport + '\n' + result;
    }
  }

  // ── 3. Color substitutions
  //    Order matters: replace compound tokens first to avoid partial matches.
  const colorReplacements = [
    // Colors that map cleanly:
    [/\bcolors\.white\b/g,       'theme.surface'],
    [/\bcolors\.black\b/g,       'theme.textPrimary'],
    [/\bcolors\.text\b/g,        'theme.textPrimary'],
    [/\bcolors\.darkGray\b/g,    'theme.textSecondary'],
    [/\bcolors\.lightGray\b/g,   'theme.surface'],
    [/\bcolors\.border\b/g,      'theme.border'],
    [/\bcolors\.placeholder\b/g, 'theme.placeholder'],
    // colors.gray is used for both text and backgrounds.
    // As text/icon color it maps to textSecondary; as bg it would be surface.
    // Since most occurrences are text/icon, we'll map to textSecondary.
    [/\bcolors\.gray\b/g,        'theme.textSecondary'],
  ];

  for (const [pattern, replacement] of colorReplacements) {
    result = result.replace(pattern, replacement);
  }

  // ── 4. Convert export pattern
  //    Handle named export: `export const xxxStyles = StyleSheet.create({`
  result = result.replace(
    /export const (\w+Styles)\s*=\s*StyleSheet\.create\(\{/g,
    (match, name) => {
      const makeName = 'make' + capitalize(name);
      return `export const ${makeName} = (theme: RoleTheme) =>\n  StyleSheet.create({`;
    }
  );

  //    Handle default export: `export default StyleSheet.create({`
  //    For default exports, we need to infer the name from the filename
  if (/export default StyleSheet\.create\(\{/.test(result)) {
    const baseName = path.basename(filePath, '.styles.ts');
    // Convert PascalCase filename to camelCase + 'Styles'
    const camel = baseName.charAt(0).toLowerCase() + baseName.slice(1);
    const makeName = 'make' + baseName + 'Styles';
    result = result.replace(
      /export default StyleSheet\.create\(\{/g,
      `export const ${makeName} = (theme: RoleTheme) =>\n  StyleSheet.create({`
    );
    
  }

  return result;
}

const files = findFiles(SRC_ROOT);
console.log(`Found ${files.length} files to convert...`);

let converted = 0;
let failed = 0;

for (const file of files) {
  try {
    const original = fs.readFileSync(file, 'utf8');
    const transformed = transform(original, file);
    if (transformed && transformed !== original) {
      fs.writeFileSync(file, transformed, 'utf8');
      converted++;
      console.log(`✓ ${path.relative(SRC_ROOT, file)}`);
    } else {
      console.log(`- ${path.relative(SRC_ROOT, file)} (no change)`);
    }
  } catch (e) {
    console.error(`✗ ${path.relative(SRC_ROOT, file)}: ${e.message}`);
    failed++;
  }
}

console.log(`\nDone: ${converted} converted, ${failed} failed, ${files.length - converted - failed} unchanged`);
