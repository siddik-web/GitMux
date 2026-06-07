import { execFileSync, spawnSync } from 'node:child_process';

export function run(command, args = [], options = {}) {
  try {
    return execFileSync(command, args, {
      encoding: 'utf8',
      stdio: ['ignore', 'pipe', 'pipe'],
      ...options
    }).trim();
  } catch (error) {
    if (options.throwOnError) throw error;
    return '';
  }
}

export function runStatus(command, args = [], options = {}) {
  const result = spawnSync(command, args, {
    encoding: 'utf8',
    stdio: ['ignore', 'pipe', 'pipe'],
    ...options
  });
  return {
    code: result.status ?? 1,
    stdout: (result.stdout || '').trim(),
    stderr: (result.stderr || '').trim()
  };
}

export function commandExists(command) {
  const lookup = process.platform === 'win32' ? 'where' : 'which';
  return runStatus(lookup, [command]).code === 0;
}
