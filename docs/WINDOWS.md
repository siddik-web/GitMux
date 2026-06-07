# Windows Support Guide

GitMux supports Windows through Git for Windows, PowerShell, Git Bash, and Windows Terminal.

## Recommended tools

- Node.js 18+
- Git for Windows
- Windows Terminal
- OpenSSH Client

## PowerShell examples

```powershell
gm init
gm add personal --provider github --email personal@example.com --name "Md Siddiqur Rahman"
gm add work --provider bitbucket --email work@company.com --name "Md Siddiqur Rahman"
gm workspace add "C:\Users\Siddiq\Code\Personal" --profile personal
gm workspace add "C:\Users\Siddiq\Code\Work" --profile work
```

## Git Bash examples

```bash
gm workspace add ~/Code/Personal --profile personal
gm workspace add ~/Code/Work --profile work
```

## Important details

GitMux uses case-insensitive `includeIf` rules on Windows:

```ini
[includeIf "gitdir/i:C:/Users/Siddiq/Code/Work/"]
  path = C:/Users/Siddiq/.gitconfig-gitmux-work
```

This avoids problems where Windows path casing differs between terminals.
