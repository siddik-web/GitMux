import fs from 'node:fs';
import path from 'node:path';

export function ensureDir(dir) {
  fs.mkdirSync(dir, { recursive: true });
}

export function readText(file, fallback = '') {
  try {
    return fs.readFileSync(file, 'utf8');
  } catch {
    return fallback;
  }
}

export function writeText(file, text) {
  ensureDir(path.dirname(file));
  fs.writeFileSync(file, text, 'utf8');
}

export function exists(file) {
  return fs.existsSync(file);
}

export function upsertManagedBlock(file, start, end, content) {
  const current = readText(file, '');
  const block = `${start}\n${content.trim()}\n${end}`;
  const pattern = new RegExp(`${escapeRegExp(start)}[\\s\\S]*?${escapeRegExp(end)}`, 'm');
  const next = pattern.test(current)
    ? current.replace(pattern, block)
    : `${current.trim()}${current.trim() ? '\n\n' : ''}${block}\n`;
  writeText(file, next.endsWith('\n') ? next : `${next}\n`);
}

function escapeRegExp(value) {
  return value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}
