import path from 'node:path';
import fs from 'node:fs';
import { exists, writeText } from '../utils/fs-safe.js';
import { gitRoot, isGitRepo } from './git.js';

export function installGuard(cwd = process.cwd()) {
  if (!isGitRepo(cwd)) throw new Error('Not inside a Git repository');
  const root = gitRoot(cwd);
  const hooksDir = path.join(root, '.git', 'hooks');
  const hookFile = path.join(hooksDir, 'pre-push');
  const script = `#!/bin/sh
# GitMux pre-push guard
if command -v gm >/dev/null 2>&1; then
  gm doctor --quiet
  if [ $? -ne 0 ]; then
    echo "GitMux blocked this push. Run: gm doctor --fix"
    exit 1
  fi
fi
exit 0
`;
  writeText(hookFile, script);
  try {
    if (process.platform !== 'win32') {
      fs.chmodSync(hookFile, 0o755);
    }
  } catch {
    // Git Bash on Windows can still execute hook files without chmod in many setups.
  }
  return hookFile;
}

export function hasGuard(cwd = process.cwd()) {
  if (!isGitRepo(cwd)) return false;
  const root = gitRoot(cwd);
  return exists(path.join(root, '.git', 'hooks', 'pre-push'));
}
