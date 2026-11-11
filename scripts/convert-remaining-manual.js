#!/usr/bin/env node
/**
 * Handles the remaining .tsx files that convert-all-remaining.js couldn't process:
 *
 * 1. Files missing `useUserRole` — adds the hook + import + useMemo style calls
 * 2. Mixed default+named imports: `import localStyles, { dropdownStyles } from '...'`
 * 3. DashboardPreviewUI: `import { s, CHIP_W, CHIP_H }` where `s` is the style
 *
 * Skips class components (ErrorBoundary) and already-converted files.
 */

const fs = require('fs');
const path = require('path');

const SRC_ROOT = path.join(__dirname, '../src');

// ─────────────────────────────────────────────────────────────
// Utilities (shared with convert-all-remaining.js)
// ─────────────────────────────────────────────────────────────

function capitalize(s) { return s.charAt(0).toUpperCase() + s.slice(1); }

const stylesExportCache = new Map();

function getStylesExports(stylesFilePath) {
  if (stylesExportCache.has(stylesFilePath)) return stylesExportCache.get(stylesFilePath);
  let content;
  try { content = fs.readFileSync(stylesFilePath, 'utf8'); } catch { return { makeExports: [], nameMap: {}, constExports: [] }; }

  const makeExports = [];
  const makeRe = /export const (make\w+)\s*=/g;
  let m;
  while ((m = makeRe.exec(content)) !== null) makeExports.push(m[1]);

  // Constants (non-make, non-StyleSheet exports)
  const constExports = [];
  const constRe = /export const (\w+)\s*=/g;
  while ((m = constRe.exec(content)) !== null) {
    if (!m[1].startsWith('make')) constExports.push(m[1]);
  }

  const nameMap = {};
  for (const makeName of makeExports) {
    const withoutMake = makeName.slice(4);
    const camel = withoutMake.charAt(0).toLowerCase() + withoutMake.slice(1);
    nameMap[camel] = makeName;
  }
  if (makeExports.length === 1) {
    nameMap['styles'] = makeExports[0];
    nameMap['s'] = makeExports[0];
    nameMap['localStyles'] = makeExports[0];
  } else {
    const nonCommon = makeExports.filter(n => !n.toLowerCase().includes('common'));
    nameMap['styles'] = nonCommon[0] || makeExports[0];
    nameMap['localStyles'] = nonCommon[0] || makeExports[0];
    nameMap['s'] = nonCommon[0] || makeExports[0];
  }

  const result = { makeExports, nameMap, constExports };
  stylesExportCache.set(stylesFilePath, result);
  return result;
}

function resolveStylesPath(tsxFilePath, importPath) {
  const dir = path.dirname(tsxFilePath);
  const resolved = path.resolve(dir, importPath);
  for (const ext of ['.styles.ts', '.ts', '']) {
    if (fs.existsSync(resolved + ext)) return resolved + ext;
  }
  return null;
}

function getRelativePath(fromFile, toFile) {
  const rel = path.relative(path.dirname(fromFile), toFile).replace(/\\/g, '/').replace(/\.ts$/, '');
  return rel.startsWith('.') ? rel : './' + rel;
}

function getHookImportPath(tsxFilePath) {
  const hooksPath = path.join(SRC_ROOT, 'hooks/useUserRole');
  return getRelativePath(tsxFilePath, hooksPath);
}

function getIndent(line) { return (line.match(/^(\s*)/) || ['', ''])[1]; }

function findComponentBodyStart(lines) {
  // Find the first function component body: `const Xxx = (...) => {` or `function Xxx(` etc.
  // Returns the line index of the opening `{` of the component body
  for (let i = 0; i < lines.length; i++) {
    // Match: const ComponentName = (...) => { (possibly split across lines)
    if (/const\s+[A-Z]\w*\s*[:=]/.test(lines[i]) && /=>/.test(lines[i]) && lines[i].includes('{')) {
      return i;
    }
    // Match: function ComponentName(
    if (/^function\s+[A-Z]\w*\s*\(/.test(lines[i].trim())) {
      // Find the opening brace
      for (let j = i; j < Math.min(i + 5, lines.length); j++) {
        if (lines[j].includes('{')) return j;
      }
    }
    // Match: export default function ComponentName(
    if (/export\s+(default\s+)?function\s+[A-Z]\w*/.test(lines[i])) {
      for (let j = i; j < Math.min(i + 5, lines.length); j++) {
        if (lines[j].includes('{')) return j;
      }
    }
    // Match: const X: FC = () => {
    if (/const\s+\w+.*:\s*(FC|React\.FC)/.test(lines[i]) && lines[i].includes('=>')) {
      return i;
    }
  }
  return -1;
}

function findInsertionPoint(lines) {
  // Look for a good place to insert: after the last variable declaration at the top of the component
  // Best: after `const navigation = useNavigation()` or similar
  // Default: after `const { ... } = useSubscriptionGate()` or `const { ... } = useSelector`
  // Simplest: find the last hook call at the top (before any JSX/return)
  let insertAfter = -1;
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    if (/const\s*\{[^}]*\}\s*=\s*use\w+\s*\(/.test(line)) {
      insertAfter = i;
    }
    if (/^\s*return\s*[(<]/.test(line)) break; // stop at return
    if (/^\s*\/\//.test(line)) continue; // skip comments
  }
  return insertAfter;
}

// ─────────────────────────────────────────────────────────────
// Transform a tsx file
// ─────────────────────────────────────────────────────────────

function transform(content, filePath) {
  // Skip class components
  if (/class\s+\w+\s+extends\s+(Component|React\.Component|PureComponent)/.test(content)) {
    return null;
  }

  // Does it import from .styles?
  if (!content.includes(".styles'") && !content.includes('.styles"')) return null;

  let result = content;
  let modified = false;
  const addedUseMemoLines = [];

  // ── Parse style imports (handles both single-line and mixed default+named)
  const importBlockRe = /\bimport\s+/g;
  let im;
  const styleImports = [];

  while ((im = importBlockRe.exec(result)) !== null) {
    const pos = im.index + im[0].length;
    const after = result.slice(pos);

    let importSpec = '';
    let rest = '';
    let importText = '';

    // Check for: `defaultName, { named }` pattern
    const mixedMatch = after.match(/^(\w+)\s*,\s*\{([^}]+)\}/);
    if (mixedMatch) {
      const defaultName = mixedMatch[1];
      const namedPart = mixedMatch[2];
      const afterMixed = after.slice(mixedMatch[0].length);
      const fromMatch = afterMixed.match(/^\s+from\s+'([^']+\.styles)'/);
      if (fromMatch) {
        importText = result.slice(im.index, pos + mixedMatch[0].length + fromMatch[0].length);
        styleImports.push({
          fullMatch: importText,
          defaultName,
          namedGroup: namedPart,
          importPath: fromMatch[1],
          isMixed: true,
        });
        continue;
      }
    }

    // Check for: `{ named }` pattern
    if (after.startsWith('{')) {
      const closeIdx = after.indexOf('}');
      if (closeIdx === -1) continue;
      importSpec = after.slice(0, closeIdx + 1).trim();
      rest = after.slice(closeIdx + 1);
    } else {
      // Default import
      const defMatch = after.match(/^(\w+)/);
      if (!defMatch) continue;
      importSpec = defMatch[1];
      rest = after.slice(defMatch[1].length);
    }

    const fromMatch = rest.match(/^\s+from\s+'([^']+\.styles)'/);
    if (!fromMatch) continue;

    const importPath = fromMatch[1];
    const fullMatch = result.slice(im.index, pos + importSpec.length + fromMatch[0].length);
    styleImports.push({ fullMatch, importSpec: importSpec.trim(), importPath, isMixed: false });
  }

  if (styleImports.length === 0) return null;

  // ── Process each style import
  for (const si of styleImports) {
    const stylesFilePath = resolveStylesPath(filePath, si.importPath);
    if (!stylesFilePath) continue;
    const { makeExports, nameMap, constExports } = getStylesExports(stylesFilePath);
    if (makeExports.length === 0) continue;

    if (si.isMixed) {
      // `import localStyles, { dropdownStyles } from '...'`
      // Build new import with all names
      const allParts = [];
      const defaultMakeName = nameMap[si.defaultName] || nameMap['localStyles'];
      if (defaultMakeName) {
        allParts.push(defaultMakeName);
        addedUseMemoLines.push({ localName: si.defaultName, makeName: defaultMakeName });
      }

      const namedImports = si.namedGroup.split(',').map(p => p.trim()).filter(Boolean);
      for (const ni of namedImports) {
        const asMatch = ni.match(/^(\w+)\s+as\s+(\w+)$/);
        const name = asMatch ? asMatch[1] : ni;
        const alias = asMatch ? asMatch[2] : null;
        if (constExports.includes(name)) { allParts.push(alias ? `${name} as ${alias}` : name); continue; }
        const makeName = nameMap[name] || (name.endsWith('Styles') ? ('make' + capitalize(name)) : null);
        if (makeName && makeExports.includes(makeName)) {
          allParts.push(makeName);
          addedUseMemoLines.push({ localName: alias || name, makeName });
        } else {
          allParts.push(alias ? `${name} as ${alias}` : name);
        }
      }

      const newImport = `import { ${allParts.join(', ')} } from '${si.importPath}'`;
      result = result.replace(si.fullMatch, newImport);
      modified = true;

    } else if (si.importSpec.startsWith('{')) {
      // Named import
      const groupMatch = si.importSpec.match(/^\{([\s\S]*)\}$/);
      if (!groupMatch) continue;
      const parts = groupMatch[1].split(',').map(p => p.trim()).filter(Boolean);
      const newParts = [];
      let hasStyleChange = false;

      for (const part of parts) {
        const asMatch = part.match(/^(\w+)\s+as\s+(\w+)$/);
        const name = asMatch ? asMatch[1] : part;
        const alias = asMatch ? asMatch[2] : null;

        if (constExports.includes(name)) { newParts.push(alias ? `${name} as ${alias}` : name); continue; }

        let makeName = nameMap[name];
        if (!makeName && name.endsWith('Styles')) {
          const potential = 'make' + capitalize(name);
          if (makeExports.includes(potential)) makeName = potential;
        }

        if (makeName) {
          newParts.push(makeName);
          addedUseMemoLines.push({ localName: alias || name, makeName });
          hasStyleChange = true;
        } else {
          newParts.push(alias ? `${name} as ${alias}` : name);
        }
      }

      if (hasStyleChange) {
        const newImport = si.fullMatch.replace(/\{[\s\S]*\}/, `{ ${newParts.join(', ')} }`);
        result = result.replace(si.fullMatch, newImport);
        modified = true;
      }

    } else {
      // Default import
      const name = si.importSpec;
      if (name.startsWith('make')) continue; // already converted
      const makeName = nameMap[name] || nameMap['localStyles'] || makeExports[0];
      if (makeName) {
        const newImport = si.fullMatch.replace(`import ${name}`, `import { ${makeName} }`);
        result = result.replace(si.fullMatch, newImport);
        addedUseMemoLines.push({ localName: name, makeName });
        modified = true;
      }
    }
  }

  if (addedUseMemoLines.length === 0) return null;

  // ── Add useUserRole if missing
  const hasUserRole = /useUserRole\s*\(/.test(result);
  let needsUserRoleHook = !hasUserRole;

  if (needsUserRoleHook) {
    // Add import
    const hookImport = `import { useUserRole } from '${getHookImportPath(filePath)}';`;
    // Insert after last import line
    const lastImportMatch = result.match(/^(import [^\n]+\n)+/m);
    if (lastImportMatch) {
      const insertAt = lastImportMatch.index + lastImportMatch[0].length;
      result = result.slice(0, insertAt) + hookImport + '\n' + result.slice(insertAt);
    }
    modified = true;
  }

  // ── Add useMemo to React import if missing
  if (!/\buseMemo\b/.test(result.slice(0, 800))) {
    result = result.replace(
      /import React,\s*\{\s*([^}]+)\s*\}\s*from\s*'react'/,
      (match, hooks) => `import React, { ${hooks.trim()}, useMemo } from 'react'`
    );
    if (!/\buseMemo\b/.test(result.slice(0, 800))) {
      result = result.replace(
        /import\s*\{\s*([^}]+)\s*\}\s*from\s*'react'/,
        (match, hooks) => `import { ${hooks.trim()}, useMemo } from 'react'`
      );
    }
  }

  // ── Inject `const { themeColors } = useUserRole();` and useMemo style calls
  const lines = result.split('\n');

  let insertLine = -1;

  if (needsUserRoleHook) {
    // Find the component function body start and inject useUserRole there
    insertLine = findInsertionPoint(lines);
    if (insertLine < 0) {
      // Fallback: find first `const {` destructuring
      for (let i = 0; i < lines.length; i++) {
        if (/^\s+const\s+/.test(lines[i])) { insertLine = i - 1; break; }
      }
    }
    if (insertLine >= 0) {
      const indent = getIndent(lines[insertLine + 1] || '  ');
      const toInsert = [`${indent}const { themeColors } = useUserRole();`];
      for (const { localName, makeName } of addedUseMemoLines) {
        const alreadyExists = lines.slice(insertLine, Math.min(insertLine + 15, lines.length)).some(
          l => l.includes(`const ${localName} = useMemo`)
        );
        if (!alreadyExists) {
          toInsert.push(`${indent}const ${localName} = useMemo(() => ${makeName}(themeColors), [themeColors]);`);
        }
      }
      lines.splice(insertLine + 1, 0, ...toInsert);
      result = lines.join('\n');
      modified = true;
    }
  } else {
    // Has useUserRole, just find it and insert useMemo after
    for (let i = 0; i < lines.length; i++) {
      if (/const\s*\{[^}]*\}\s*=\s*useUserRole\s*\(/.test(lines[i])) {
        insertLine = i;
        break;
      }
    }
    if (insertLine >= 0) {
      const indent = getIndent(lines[insertLine]);
      const toInsert = [];
      for (const { localName, makeName } of addedUseMemoLines) {
        const alreadyExists = lines.slice(insertLine, Math.min(insertLine + 10, lines.length)).some(
          l => l.includes(`const ${localName} = useMemo`)
        );
        if (!alreadyExists) {
          toInsert.push(`${indent}const ${localName} = useMemo(() => ${makeName}(themeColors), [themeColors]);`);
        }
      }
      if (toInsert.length > 0) {
        lines.splice(insertLine + 1, 0, ...toInsert);
        result = lines.join('\n');
        modified = true;
      }
    }
  }

  return modified ? result : null;
}

// ─────────────────────────────────────────────────────────────
// Target files (those still showing old imports)
// ─────────────────────────────────────────────────────────────

const { execSync } = require('child_process');
let grepOutput;
try {
  grepOutput = execSync(
    `grep -rl "from '.*\\.styles'" "${SRC_ROOT}" --include="*.tsx" | xargs grep -l "Styles as styles\\|from '.*\\.styles'"`,
    { encoding: 'utf8', maxBuffer: 10 * 1024 * 1024 }
  );
} catch (e) {
  grepOutput = e.stdout || '';
}

// Simpler: process all tsx files
function findTsxFiles(dir) {
  const results = [];
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const fullPath = path.join(dir, entry.name);
    if (entry.isDirectory()) results.push(...findTsxFiles(fullPath));
    else if (entry.name.endsWith('.tsx')) results.push(fullPath);
  }
  return results;
}

const tsxFiles = findTsxFiles(SRC_ROOT);
let converted = 0, failed = 0, skipped = 0;

for (const file of tsxFiles) {
  try {
    const original = fs.readFileSync(file, 'utf8');
    if (!original.includes(".styles'") && !original.includes('.styles"')) { skipped++; continue; }

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
