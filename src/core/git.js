import { run, runStatus } from '../utils/exec.js';

export function isGitRepo(cwd = process.cwd()) {
  return runStatus('git', ['rev-parse', '--is-inside-work-tree'], { cwd }).code === 0;
}

export function gitRoot(cwd = process.cwd()) {
  return run('git', ['rev-parse', '--show-toplevel'], { cwd });
}

export function gitConfigGet(key, cwd = process.cwd()) {
  return run('git', ['config', '--get', key], { cwd });
}

export function gitConfigSetLocal(key, value, cwd = process.cwd()) {
  return runStatus('git', ['config', '--local', key, value], { cwd });
}

export function remoteUrl(cwd = process.cwd(), name = 'origin') {
  return run('git', ['remote', 'get-url', name], { cwd });
}

export function remoteSetUrl(url, cwd = process.cwd(), name = 'origin') {
  return runStatus('git', ['remote', 'set-url', name, url], { cwd });
}
