import test from 'node:test';
import assert from 'node:assert/strict';
import { parseFlags } from '../src/cli.js';

test('parses string flags', () => {
  assert.deepEqual(parseFlags(['--provider', 'bitbucket', '--email', 'a@b.com']), {
    provider: 'bitbucket',
    email: 'a@b.com'
  });
});

test('parses boolean flags', () => {
  assert.deepEqual(parseFlags(['--fix', '--quiet']), {
    fix: true,
    quiet: true
  });
});
