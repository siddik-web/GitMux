import { exists } from '../utils/fs-safe.js';
import { runStatus } from '../utils/exec.js';

export function sshKeyExists(profile) {
  return exists(profile.sshKey) && exists(`${profile.sshKey}.pub`);
}

export function generateSshKey(profile) {
  const result = runStatus('ssh-keygen', [
    '-t', 'ed25519',
    '-C', profile.email,
    '-f', profile.sshKey,
    '-N', ''
  ]);
  return result.code === 0;
}

export function testSsh(profile) {
  return runStatus('ssh', ['-T', `git@${profile.sshHost}`]);
}
