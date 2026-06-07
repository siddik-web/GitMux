import os from 'node:os';
import path from 'node:path';

export function homeDir() {
  return os.homedir();
}

export function isWindows() {
  return process.platform === 'win32';
}

export function normalizePath(input) {
  if (!input) return input;
  let value = input.replace(/^~(?=$|[\\/])/, homeDir());
  value = path.resolve(value);
  if (isWindows()) value = value.replace(/\\/g, '/');
  return value;
}

export function toGitConfigPath(input) {
  const value = normalizePath(input);
  if (!isWindows()) return value;
  return value.replace(/\\/g, '/');
}

export function quotePath(input) {
  return input.includes(' ') ? `"${input}"` : input;
}
