# GitMux

**One machine. Many Git accounts. Zero switching.**

GitMux is a lightweight CLI that automatically routes Git identity, SSH keys, and remotes for developers who use multiple GitHub, Bitbucket, or GitLab accounts across personal, work, and client projects.

It is designed for normal Git users. You keep using:

```bash
git clone
git pull
git commit
git push
```

GitMux quietly configures Git and SSH so each project folder uses the right account.

---

## Why GitMux exists

Many developers use multiple accounts:

- Personal GitHub account
- Work Bitbucket account
- Client GitHub organization
- Agency repositories
- Open-source account

The painful parts are usually:

- Switching SSH keys manually
- Editing repo remotes
- Accidentally committing with the wrong email
- Pushing to Bitbucket with the wrong SSH key
- Using GitHub + Bitbucket on Windows
- Remembering which folder belongs to which account

GitMux solves this with workspace-based identity routing.

---

## Supported platforms

- Windows 10/11
- Git Bash
- PowerShell
- Windows Terminal
- WSL
- macOS
- Linux

## Supported providers

- GitHub
- Bitbucket
- GitLab basic support

---

## Install locally during development

```bash
npm install
npm link
```

Now both commands are available:

```bash
gitmux --help
gm --help
```

---

## Quick start

### 1. Initialize GitMux

```bash
gm init
```

### 2. Add your personal GitHub profile

```bash
gm add personal --provider github --email personal@example.com --name "Md Siddiqur Rahman"
```

### 3. Add your work Bitbucket profile

```bash
gm add work --provider bitbucket --email work@company.com --name "Md Siddiqur Rahman"
```

### 4. Bind folders to profiles

macOS/Linux/Git Bash:

```bash
gm workspace add ~/Code/Personal --profile personal
gm workspace add ~/Code/Work --profile work
```

PowerShell:

```powershell
gm workspace add "C:\Users\Siddiq\Code\Personal" --profile personal
gm workspace add "C:\Users\Siddiq\Code\Work" --profile work
```

### 5. Keep using normal Git commands

```bash
cd ~/Code/Work/client-project
git pull
git push
```

---

## Main commands

```bash
gm init
gm add <profile> --provider github|bitbucket|gitlab --email <email>
gm workspace add <path> --profile <profile>
gm current
gm doctor
gm doctor --fix
gm fix
gm scan <path>
gm scan <path> --fix
gm guard install
```

---

## Example: GitHub personal + Bitbucket work

```bash
gm init

gm add personal --provider github --email personal@gmail.com --name "Md Siddiqur Rahman"
gm add work --provider bitbucket --email siddiqur@company.com --name "Md Siddiqur Rahman"

gm workspace add ~/Code/Personal --profile personal
gm workspace add ~/Code/Work --profile work
```

When you are inside `~/Code/Work`, GitMux generates Git config so Bitbucket remotes are rewritten through your work SSH alias.

Normal remote:

```bash
git@bitbucket.org:company/project.git
```

GitMux-routed remote:

```bash
git@bitbucket-work:company/project.git
```

You do not need to remember this. GitMux generates `url.insteadOf` rules for you.

---

## Doctor command

Run inside any repo:

```bash
gm doctor
```

GitMux checks:

- Matched workspace
- Expected profile
- Current Git email
- Current Git name
- Remote URL
- Provider mismatch
- HTTPS remote usage
- Missing SSH alias
- Wrong account risk

Fix automatically:

```bash
gm doctor --fix
```

---

## Scan existing repositories

```bash
gm scan ~/Code
```

Fix all detected repo identity and remote issues:

```bash
gm scan ~/Code --fix
```

---

## Pre-push guard

Install in a repository:

```bash
gm guard install
```

Before `git push`, GitMux checks identity safety. If the repo looks risky, it blocks the push and tells you to run:

```bash
gm doctor --fix
```

---

## What GitMux modifies

GitMux uses managed blocks. It does not wipe your existing config.

Files used:

```text
~/.gitmux/config.json
~/.ssh/config
~/.gitconfig
~/.gitconfig-gitmux-personal
~/.gitconfig-gitmux-work
```

SSH config block example:

```sshconfig
# >>> GitMux managed block >>>
Host bitbucket-work
  HostName bitbucket.org
  User git
  IdentityFile ~/.ssh/gitmux/bitbucket-work
  IdentitiesOnly yes
# <<< GitMux managed block <<<
```

Git config block example:

```ini
# >>> GitMux managed block >>>
[includeIf "gitdir:~/Code/Work/"]
  path = ~/.gitconfig-gitmux-work
# <<< GitMux managed block <<<
```

---

## Windows notes

GitMux is Windows-first friendly:

- Uses `%USERPROFILE%` for config paths
- Supports PowerShell and Git Bash style paths
- Uses case-insensitive Git `includeIf` on Windows
- Does not force Unix-only permission behavior
- Keeps SSH keys under `%USERPROFILE%\.ssh\gitmux\`

Recommended Windows setup:

1. Install Git for Windows
2. Use Windows Terminal or Git Bash
3. Run `npm link` from this project
4. Run `gm init`

---

## Roadmap

- Interactive prompts
- Clipboard helper for public SSH keys
- GitHub CLI account awareness
- Bitbucket auth validation
- Shell prompt integration
- Desktop dashboard
- Team profile templates
- Encrypted profile export/import

---

## License

MIT
