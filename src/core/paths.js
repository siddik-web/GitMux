import path from 'node:path';
import { homeDir } from '../utils/platform.js';

export const GITMUX_DIR = path.join(homeDir(), '.gitmux');
export const CONFIG_FILE = path.join(GITMUX_DIR, 'config.json');
export const SSH_DIR = path.join(homeDir(), '.ssh');
export const GITMUX_SSH_DIR = path.join(SSH_DIR, 'gitmux');
export const SSH_CONFIG_FILE = path.join(SSH_DIR, 'config');
export const GIT_CONFIG_FILE = path.join(homeDir(), '.gitconfig');
