import fs from 'fs';
import path from 'path';

const PUBLIC_DIRS = ['public', 'app', 'components'];
const SECRET_PATTERNS = [/api[_-]?key/i, /secret/i, /token/i];

function scanFile(filePath) {
  const content = fs.readFileSync(filePath, 'utf8');
  for (const pattern of SECRET_PATTERNS) {
    if (pattern.test(content)) {
      return true;
    }
  }
  return false;
}

function walk(dir) {
  let results = [];
  fs.readdirSync(dir).forEach(file => {
    const filePath = path.join(dir, file);
    const stat = fs.statSync(filePath);
    if (stat && stat.isDirectory()) {
      results = results.concat(walk(filePath));
    } else {
      results.push(filePath);
    }
  });
  return results;
}

let found = false;
for (const dir of PUBLIC_DIRS) {
  if (!fs.existsSync(dir)) continue;
  for (const file of walk(dir)) {
    if (scanFile(file)) {
      console.error(`Potential secret in: ${file}`);
      found = true;
    }
  }
}
if (found) {
  process.exit(1);
} else {
  console.log('No secrets found in public files.');
}
import fs from 'fs';
import path from 'path';

const PUBLIC_DIRS = ['public', 'app', 'components'];
const SECRET_PATTERNS = [/api[_-]?key/i, /secret/i, /token/i];

function scanFile(filePath) {
  const content = fs.readFileSync(filePath, 'utf8');
  for (const pattern of SECRET_PATTERNS) {
    if (pattern.test(content)) {
      return true;
    }
  }
  return false;
}

function walk(dir) {
  let results = [];
  fs.readdirSync(dir).forEach(file => {
    const filePath = path.join(dir, file);
    const stat = fs.statSync(filePath);
    if (stat && stat.isDirectory()) {
      results = results.concat(walk(filePath));
    } else {
      results.push(filePath);
    }
  });
  return results;
}

let found = false;
for (const dir of PUBLIC_DIRS) {
  if (!fs.existsSync(dir)) continue;
  for (const file of walk(dir)) {
    if (scanFile(file)) {
      console.error(`Potential secret in: ${file}`);
      found = true;
    }
  }
}
if (found) {
  process.exit(1);
} else {
  console.log('No secrets found in public files.');
}
