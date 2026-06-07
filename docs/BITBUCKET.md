# Bitbucket Setup

GitMux supports Bitbucket SSH profiles.

## Add a Bitbucket work profile

```bash
gm add work --provider bitbucket --email work@company.com --name "Md Siddiqur Rahman"
```

GitMux creates an SSH alias like:

```sshconfig
Host bitbucket-work
  HostName bitbucket.org
  User git
  IdentityFile ~/.ssh/gitmux/bitbucket-work
  IdentitiesOnly yes
```

Add the generated public key to Bitbucket:

```text
~/.ssh/gitmux/bitbucket-work.pub
```

## Work remotes

Normal Bitbucket remote:

```bash
git@bitbucket.org:workspace/repo.git
```

GitMux-routed remote:

```bash
git@bitbucket-work:workspace/repo.git
```

GitMux can rewrite this automatically when your repository is inside a mapped workspace.
