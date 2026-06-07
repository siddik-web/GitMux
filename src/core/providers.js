export const PROVIDERS = {
  github: {
    name: 'GitHub',
    hostName: 'github.com',
    user: 'git',
    sshPattern: /^git@github\.com:/,
    httpsPattern: /^https:\/\/github\.com\//
  },
  bitbucket: {
    name: 'Bitbucket',
    hostName: 'bitbucket.org',
    user: 'git',
    sshPattern: /^git@bitbucket\.org:/,
    httpsPattern: /^https:\/\/bitbucket\.org\//
  },
  gitlab: {
    name: 'GitLab',
    hostName: 'gitlab.com',
    user: 'git',
    sshPattern: /^git@gitlab\.com:/,
    httpsPattern: /^https:\/\/gitlab\.com\//
  }
};

export function getProvider(name) {
  const key = String(name || '').toLowerCase();
  return PROVIDERS[key] || null;
}

export function detectProviderFromRemote(remote) {
  if (!remote) return null;
  for (const [key, provider] of Object.entries(PROVIDERS)) {
    if (remote.includes(provider.hostName)) return key;
  }
  return null;
}
