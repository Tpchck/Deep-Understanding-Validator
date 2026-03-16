import fs from 'node:fs';
import path from 'node:path';

const PUBLIC_DIRS = ['public', 'app', 'components'];
const SECRET_PATTERNS = [
  /['"][\w-]*(api[_-]?key|api[_-]?secret|auth[_-]?token|password|private[_-]?key)['"]\s*[:=]/i,
  /['"](?:sk|gsk|pk)[-_][\w]+['"]/i,  // common API key prefixes
];

// Lines referencing process.env are expected and safe
const SAFE_PATTERNS = [/process\.env/, /placeholder/i, /example/i];

function scanFile(filePath) {
  const content = fs.readFileSync(filePath, 'utf8');
  const lines = content.split('\n');
  const issues = [];

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    // Skip lines that reference environment variables or are clearly safe
    if (SAFE_PATTERNS.some(p => p.test(line))) continue;
    // Skip comments
    if (line.trim().startsWith('//') || line.trim().startsWith('*')) continue;

    for (const pattern of SECRET_PATTERNS) {
      if (pattern.test(line)) {
        issues.push({ line: i + 1, content: line.trim().slice(0, 80) });
        break;
      }
    }
  }
  return issues;
}

function walk(dir) {
  const results = [];
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      results.push(...walk(full));
    } else if (/\.(ts|tsx|js|jsx)$/.test(entry.name)) {
      results.push(full);
    }
  }
  return results;
}

let found = false;
for (const dir of PUBLIC_DIRS) {
  if (!fs.existsSync(dir)) continue;
  for (const file of walk(dir)) {
    const issues = scanFile(file);
    for (const issue of issues) {
      console.error(`⚠ ${file}:${issue.line} — ${issue.content}`);
      found = true;
    }
  }
}

if (found) {
  console.error('\n✗ Potential secrets found in source files.');
  process.exit(1);
} else {
  console.log('✓ No hardcoded secrets found.');
}
