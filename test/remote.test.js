import test from 'node:test';
import assert from 'node:assert/strict';
import { rewriteRemote } from '../src/core/remote.js';

const bitbucketWork = {
  provider: 'bitbucket',
  sshHost: 'bitbucket-work'
};

const githubPersonal = {
  provider: 'github',
  sshHost: 'github-personal'
};

test('rewrites Bitbucket SSH remote to profile alias', () => {
  assert.equal(
    rewriteRemote('git@bitbucket.org:team/repo.git', bitbucketWork),
    'git@bitbucket-work:team/repo.git'
  );
});

test('rewrites Bitbucket HTTPS remote to profile alias', () => {
  assert.equal(
    rewriteRemote('https://bitbucket.org/team/repo.git', bitbucketWork),
    'git@bitbucket-work:team/repo.git'
  );
});

test('rewrites GitHub SSH remote to profile alias', () => {
  assert.equal(
    rewriteRemote('git@github.com:user/repo.git', githubPersonal),
    'git@github-personal:user/repo.git'
  );
});

test('keeps already rewritten remote', () => {
  assert.equal(
    rewriteRemote('git@github-personal:user/repo.git', githubPersonal),
    'git@github-personal:user/repo.git'
  );
});
