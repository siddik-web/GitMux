import { loadConfig, saveConfig, addProfile, addWorkspace, findProfileForPath } from './core/config.js';
import { generateAll } from './core/generator.js';
import { buildProfile } from './core/profile.js';
import { sshKeyExists, generateSshKey } from './core/ssh.js';
import { commandExists } from './utils/exec.js';
import { color, symbol } from './utils/colors.js';
import { inspectRepo, scanRepos } from './core/scanner.js';
import { gitConfigSetLocal, isGitRepo, remoteSetUrl } from './core/git.js';
import { rewriteRemote } from './core/remote.js';
import { installGuard } from './core/guard.js';
import { CONFIG_FILE } from './core/paths.js';

export async function main(argv = process.argv.slice(2)) {
  const [command, ...tail] = argv;
  const flags = parseFlags(tail);
  const positionals = tail.filter((item, index) => !item.startsWith('--') && (index === 0 || !tail[index - 1]?.startsWith('--')));
  const subcommand = positionals[0];
  const rest = positionals.slice(1);

  try {
    if (!command || ['help', '--help', '-h'].includes(command)) return help();
    if (['version', '--version', '-v'].includes(command)) return console.log('gitmux 0.1.0');

    if (command === 'init') return cmdInit();
    if (command === 'add') return cmdAdd(subcommand, flags);
    if (command === 'workspace' && subcommand === 'add') return cmdWorkspaceAdd(rest, flags);
    if (command === 'current') return cmdCurrent();
    if (command === 'doctor') return cmdDoctor(flags);
    if (command === 'fix') return cmdFix(flags);
    if (command === 'scan') return cmdScan(subcommand || process.cwd(), flags);
    if (command === 'guard' && subcommand === 'install') return cmdGuardInstall();

    console.error(`${symbol.fail} Unknown command: ${command}`);
    help();
    process.exitCode = 1;
  } catch (error) {
    console.error(`${symbol.fail} ${error.message}`);
    process.exitCode = 1;
  }
}

function help() {
  console.log(`${color.bold('GitMux')} - automatic Git identity routing\n`);
  console.log('Usage:');
  console.log('  gm init');
  console.log('  gm add <name> --provider github|bitbucket --email you@example.com [--name "Your Name"] [--ssh-key path]');
  console.log('  gm workspace add <path> --profile <name>');
  console.log('  gm current');
  console.log('  gm doctor [--fix] [--quiet]');
  console.log('  gm fix');
  console.log('  gm scan <path> [--fix]');
  console.log('  gm guard install');
}

function cmdInit() {
  const config = loadConfig();
  generateAll(config);
  console.log(`${symbol.ok} GitMux initialized`);
  console.log(`${symbol.info} Config: ${CONFIG_FILE}`);
  console.log('Next:');
  console.log('  gm add personal --provider github --email personal@example.com');
  console.log('  gm add work --provider bitbucket --email work@example.com');
}

function cmdAdd(name, flags) {
  if (!name) throw new Error('Profile name is required. Example: gm add work --provider bitbucket --email you@company.com');
  const config = loadConfig();
  const profile = buildProfile({
    name,
    provider: flags.provider,
    email: flags.email,
    gitName: flags.name,
    sshKey: flags['ssh-key']
  });

  addProfile(config, profile);
  saveConfig(config);

  if (!sshKeyExists(profile) && flags['no-key'] !== true) {
    const created = generateSshKey(profile);
    if (created) console.log(`${symbol.ok} SSH key created: ${profile.sshKey}`);
    else console.log(`${symbol.warn} SSH key was not created. Create it manually or pass --ssh-key.`);
  }

  generateAll(config);
  console.log(`${symbol.ok} Profile added: ${profile.name}`);
  console.log(`${symbol.info} Provider: ${profile.provider}`);
  console.log(`${symbol.info} SSH host: ${profile.sshHost}`);
  console.log(`${symbol.info} Public key: ${profile.sshKey}.pub`);
}

function cmdWorkspaceAdd(args, flags) {
  const workspacePath = args[0];
  const profileName = flags.profile;
  if (!workspacePath) throw new Error('Workspace path is required');
  if (!profileName) throw new Error('--profile is required');

  const config = loadConfig();
  if (!config.profiles[profileName]) throw new Error(`Profile not found: ${profileName}`);
  addWorkspace(config, workspacePath, profileName);
  saveConfig(config);
  generateAll(config);
  console.log(`${symbol.ok} Workspace added: ${workspacePath} -> ${profileName}`);
}

function cmdCurrent() {
  const config = loadConfig();
  const matched = findProfileForPath(config, process.cwd());
  if (!matched) {
    console.log(`${symbol.warn} No GitMux workspace matched this directory`);
    process.exitCode = 1;
    return;
  }
  console.log(color.bold('Current GitMux context'));
  console.log(`Workspace: ${matched.workspace.path}`);
  console.log(`Profile:   ${matched.profile.name}`);
  console.log(`Provider:  ${matched.profile.provider}`);
  console.log(`Git name:  ${matched.profile.gitName}`);
  console.log(`Email:     ${matched.profile.email}`);
  console.log(`SSH host:  ${matched.profile.sshHost}`);
}

function cmdDoctor(flags = {}) {
  const config = loadConfig();
  const report = inspectRepo(process.cwd(), config);
  if (flags.fix) fixRepo(report);

  if (!flags.quiet) printReport(report);
  if (!report.healthy) process.exitCode = 1;
}

function cmdFix() {
  const config = loadConfig();
  const report = inspectRepo(process.cwd(), config);
  fixRepo(report);
  const next = inspectRepo(process.cwd(), config);
  printReport(next);
  if (!next.healthy) process.exitCode = 1;
}

function cmdScan(root, flags = {}) {
  const config = loadConfig();
  const reports = scanRepos(root, config);
  if (flags.fix) reports.forEach(fixRepo);

  console.log(color.bold(`Scanned ${reports.length} repositories`));
  for (const report of reports) {
    const status = report.healthy ? color.green('healthy') : color.yellow('issues');
    console.log(`${status} ${report.path}`);
    for (const issue of report.issues) console.log(`  - ${issue}`);
  }
}

function cmdGuardInstall() {
  const hook = installGuard(process.cwd());
  console.log(`${symbol.ok} Pre-push guard installed: ${hook}`);
}

function printReport(report) {
  console.log(color.bold('GitMux Doctor'));
  console.log(`Repo:     ${report.name}`);
  console.log(`Path:     ${report.path}`);
  console.log(`Profile:  ${report.expectedProfile?.name || 'none'}`);
  console.log(`Provider: ${report.expectedProfile?.provider || report.provider || 'unknown'}`);
  console.log(`Email:    ${report.gitEmail || 'not set'}`);
  console.log(`Remote:   ${report.remote || 'not set'}`);
  if (report.healthy) {
    console.log(`${symbol.ok} Status: Healthy`);
    return;
  }
  console.log(`${symbol.warn} Status: Issues found`);
  for (const issue of report.issues) console.log(`  - ${issue}`);
  console.log('Run: gm doctor --fix');
}

function fixRepo(report) {
  if (!isGitRepo(report.path)) return;
  const profile = report.expectedProfile;
  if (!profile) return;

  gitConfigSetLocal('user.name', profile.gitName, report.path);
  gitConfigSetLocal('user.email', profile.email, report.path);

  if (report.remote) {
    const nextRemote = rewriteRemote(report.remote, profile);
    if (nextRemote !== report.remote) remoteSetUrl(nextRemote, report.path);
  }
}

function parseFlags(args) {
  const flags = {};
  for (let i = 0; i < args.length; i += 1) {
    const arg = args[i];
    if (!arg.startsWith('--')) continue;
    const key = arg.slice(2);
    const next = args[i + 1];
    if (!next || next.startsWith('--')) {
      flags[key] = true;
    } else {
      flags[key] = next;
      i += 1;
    }
  }
  return flags;
}

export { parseFlags };
