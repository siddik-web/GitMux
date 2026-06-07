import path from 'node:path';
import { CONFIG_FILE, GITMUX_DIR } from './paths.js';
import { ensureDir, exists, readText, writeText } from '../utils/fs-safe.js';
import { normalizePath } from '../utils/platform.js';

export function defaultConfig() {
  return {
    version: 1,
    profiles: {},
    workspaces: [],
    settings: {
      guard: true,
      managed: true
    }
  };
}

export function loadConfig() {
  ensureDir(GITMUX_DIR);
  if (!exists(CONFIG_FILE)) {
    const cfg = defaultConfig();
    saveConfig(cfg);
    return cfg;
  }
  try {
    return { ...defaultConfig(), ...JSON.parse(readText(CONFIG_FILE)) };
  } catch {
    throw new Error(`Invalid GitMux config: ${CONFIG_FILE}`);
  }
}

export function saveConfig(config) {
  ensureDir(path.dirname(CONFIG_FILE));
  writeText(CONFIG_FILE, `${JSON.stringify(config, null, 2)}\n`);
}

export function addProfile(config, profile) {
  config.profiles[profile.name] = profile;
  return config;
}

export function addWorkspace(config, workspacePath, profileName) {
  const normalized = normalizePath(workspacePath);
  config.workspaces = config.workspaces.filter((item) => item.path !== normalized);
  config.workspaces.push({ path: normalized, profile: profileName });
  config.workspaces.sort((a, b) => b.path.length - a.path.length);
  return config;
}

export function findWorkspace(config, cwd = process.cwd()) {
  const normalized = normalizePath(cwd);
  return config.workspaces.find((item) => {
    const base = normalizePath(item.path);
    return normalized === base || normalized.startsWith(`${base}/`) || normalized.startsWith(`${base}\\`);
  }) || null;
}

export function findProfileForPath(config, cwd = process.cwd()) {
  const workspace = findWorkspace(config, cwd);
  if (!workspace) return null;
  return config.profiles[workspace.profile] ? { workspace, profile: config.profiles[workspace.profile] } : null;
}
