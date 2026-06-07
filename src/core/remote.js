import { getProvider } from './providers.js';

export function rewriteRemote(remote, profile) {
  if (!remote || !profile) return remote;
  const provider = getProvider(profile.provider);
  if (!provider) return remote;

  if (remote.includes(profile.sshHost)) return remote;

  if (remote.startsWith(`git@${provider.hostName}:`)) {
    return remote.replace(`git@${provider.hostName}:`, `git@${profile.sshHost}:`);
  }

  if (remote.startsWith(`https://${provider.hostName}/`)) {
    return remote.replace(`https://${provider.hostName}/`, `git@${profile.sshHost}:`).replace(/\.git\/?$/, '.git');
  }

  return remote;
}
