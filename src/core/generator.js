import path from 'node:path';
import { GITMUX_SSH_DIR, GIT_CONFIG_FILE, SSH_CONFIG_FILE } from './paths.js';
import { getProvider } from './providers.js';
import { ensureDir, upsertManagedBlock, writeText } from '../utils/fs-safe.js';
import { isWindows, toGitConfigPath } from '../utils/platform.js';

const SSH_START = '# >>> GitMux managed block >>>';
const SSH_END = '# <<< GitMux managed block <<<';
const GIT_START = '# >>> GitMux managed block >>>';
const GIT_END = '# <<< GitMux managed block <<<';

export function generateAll(config) {
  generateSshConfig(config);
  generateGitConfig(config);
  generateProfileGitConfigs(config);
}

export function generateSshConfig(config) {
  ensureDir(GITMUX_SSH_DIR);
  const lines = [];
  for (const profile of Object.values(config.profiles)) {
    const provider = getProvider(profile.provider);
    if (!provider) continue;
    lines.push(`Host ${profile.sshHost}`);
    lines.push(`  HostName ${provider.hostName}`);
    lines.push(`  User ${provider.user}`);
    lines.push(`  IdentityFile ${profile.sshKey}`);
    lines.push('  IdentitiesOnly yes');
    lines.push('');
  }
  upsertManagedBlock(SSH_CONFIG_FILE, SSH_START, SSH_END, lines.join('\n'));
}

export function generateGitConfig(config) {
  const lines = [];
  for (const workspace of config.workspaces) {
    const profileFile = profileConfigPath(workspace.profile);
    const gitdir = `${toGitConfigPath(workspace.path).replace(/\/$/, '')}/`;
    const condition = isWindows() ? `gitdir/i:${gitdir}` : `gitdir:${gitdir}`;
    lines.push(`[includeIf "${condition}"]`);
    lines.push(`  path = ${toGitConfigPath(profileFile)}`);
    lines.push('');
  }
  upsertManagedBlock(GIT_CONFIG_FILE, GIT_START, GIT_END, lines.join('\n'));
}

export function generateProfileGitConfigs(config) {
  for (const profile of Object.values(config.profiles)) {
    const provider = getProvider(profile.provider);
    const lines = [];
    lines.push('[user]');
    lines.push(`  name = ${profile.gitName}`);
    lines.push(`  email = ${profile.email}`);
    lines.push('');
    if (provider) {
      lines.push(`[url "git@${profile.sshHost}:"]`);
      lines.push(`  insteadOf = git@${provider.hostName}:`);
      lines.push(`  insteadOf = https://${provider.hostName}/`);
      lines.push('');
    }
    writeText(profileConfigPath(profile.name), lines.join('\n'));
  }
}

export function profileConfigPath(profileName) {
  return path.join(path.dirname(GIT_CONFIG_FILE), `.gitconfig-gitmux-${profileName}`);
}
