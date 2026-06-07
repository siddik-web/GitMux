import fs from 'node:fs';
import path from 'node:path';
import { findProfileForPath } from './config.js';
import { gitConfigGet, isGitRepo, remoteUrl } from './git.js';
import { detectProviderFromRemote } from './providers.js';
import { normalizePath } from '../utils/platform.js';

export function scanRepos(root, config, maxDepth = 6) {
  const start = normalizePath(root);
  const repos = [];
  walk(start, 0);
  return repos;

  function walk(dir, depth) {
    if (depth > maxDepth) return;
    if (fs.existsSync(path.join(dir, '.git'))) {
      repos.push(inspectRepo(dir, config));
      return;
    }
    let entries = [];
    try {
      entries = fs.readdirSync(dir, { withFileTypes: true });
    } catch {
      return;
    }
    for (const entry of entries) {
      if (!entry.isDirectory()) continue;
      if (['node_modules', 'vendor', '.cache', '.next', 'dist', 'build', '.idea'].includes(entry.name)) continue;
      walk(path.join(dir, entry.name), depth + 1);
    }
  }
}

export function inspectRepo(repoPath, config) {
  const matched = findProfileForPath(config, repoPath);
  const email = isGitRepo(repoPath) ? gitConfigGet('user.email', repoPath) : '';
  const name = isGitRepo(repoPath) ? gitConfigGet('user.name', repoPath) : '';
  const remote = isGitRepo(repoPath) ? remoteUrl(repoPath) : '';
  const provider = detectProviderFromRemote(remote);
  const issues = [];

  if (!matched) issues.push('No workspace profile matched');
  if (matched && email && email !== matched.profile.email) issues.push(`Wrong email: ${email}`);
  if (matched && remote && matched.profile.provider !== provider && !remote.includes(matched.profile.sshHost)) {
    issues.push(`Provider mismatch: ${provider || 'unknown'}`);
  }
  if (matched && remote && !remote.includes(matched.profile.sshHost)) issues.push('Remote does not use profile SSH alias');
  if (remote.startsWith('https://')) issues.push('HTTPS remote detected');

  return {
    path: repoPath,
    name: path.basename(repoPath),
    matchedWorkspace: matched?.workspace || null,
    expectedProfile: matched?.profile || null,
    gitName: name,
    gitEmail: email,
    remote,
    provider,
    healthy: issues.length === 0,
    issues
  };
}
