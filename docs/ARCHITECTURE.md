# GitMux Architecture

GitMux has four responsibilities:

1. Store profile/workspace config
2. Generate safe Git and SSH config blocks
3. Inspect repositories for identity risks
4. Fix local repository identity/remotes when possible

## Core concepts

### Profile

A profile represents one account identity.

```json
{
  "name": "work",
  "provider": "bitbucket",
  "gitName": "Md Siddiqur Rahman",
  "email": "work@company.com",
  "sshHost": "bitbucket-work",
  "sshKey": "~/.ssh/gitmux/bitbucket-work"
}
```

### Workspace

A workspace maps a folder to a profile.

```json
{
  "path": "~/Code/Work",
  "profile": "work"
}
```

Any repository under that folder should use the mapped profile.

## Generated files

- `~/.gitmux/config.json` is the source of truth.
- `~/.ssh/config` receives a managed GitMux block.
- `~/.gitconfig` receives managed `includeIf` rules.
- `~/.gitconfig-gitmux-*` stores per-profile Git identity and URL rewrite rules.

## Why includeIf?

Git `includeIf` allows Git config to change based on repository location. This means users can keep normal Git commands while identity changes automatically by folder.

## Why url.insteadOf?

`url.insteadOf` lets GitMux rewrite normal provider URLs into profile-specific SSH aliases.

Example:

```ini
[url "git@bitbucket-work:"]
  insteadOf = git@bitbucket.org:
  insteadOf = https://bitbucket.org/
```

## Guard design

The first guard implementation installs a pre-push hook per repository. Later versions may support a global Git template hook.
