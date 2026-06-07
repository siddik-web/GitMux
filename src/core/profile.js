import path from 'node:path';
import { GITMUX_SSH_DIR } from './paths.js';
import { getProvider } from './providers.js';
import { normalizePath } from '../utils/platform.js';

export function buildProfile({ name, provider, email, gitName, sshKey }) {
  if (!name) throw new Error('Profile name is required');
  if (!provider) throw new Error('Provider is required. Supported: github, bitbucket, gitlab');
  if (!email) throw new Error('Email is required');

  const providerInfo = getProvider(provider);
  if (!providerInfo) throw new Error(`Unsupported provider: ${provider}`);

  return {
    name,
    provider,
    gitName: gitName || process.env.USER || process.env.USERNAME || 'GitMux User',
    email,
    sshHost: `${provider}-${name}`,
    sshKey: normalizePath(sshKey || path.join(GITMUX_SSH_DIR, `${provider}-${name}`))
  };
}
