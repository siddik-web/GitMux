import { readdirSync, statSync, readFileSync } from 'node:fs';
import { join } from 'node:path';

const roots = ['bin', 'src', 'test', 'scripts'];
const errors = [];
function walk(dir) {
  for (const item of readdirSync(dir)) {
    const path = join(dir, item);
    if (statSync(path).isDirectory()) walk(path);
    else if (path.endsWith('.js')) {
      const text = readFileSync(path, 'utf8');
      if (text.includes('\t')) errors.push(`${path}: tabs are not allowed`);
      if (!text.endsWith('\n')) errors.push(`${path}: missing trailing newline`);
    }
  }
}
for (const root of roots) walk(root);
if (errors.length) {
  console.error(errors.join('\n'));
  process.exit(1);
}
console.log('Lint passed');
