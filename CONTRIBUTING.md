# Contributing

Thanks for helping improve GitMux.

## Development

```bash
npm install
npm link
gm --help
npm test
```

## Principles

- Do not break existing user config.
- Use managed blocks for generated config.
- Keep normal Git workflow intact.
- Support Windows as a first-class platform.
- Prefer clear repair messages over magic behavior.

## Pull requests

Please include:

- Problem description
- Before/after behavior
- Test coverage where possible
- Windows impact if the feature touches paths or shell behavior
