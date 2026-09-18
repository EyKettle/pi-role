# role extension

[![Conventional Commits](https://img.shields.io/badge/Conventional%20Commits-1.0.0-%23FE5196?logo=conventionalcommits&logoColor=white)](https://conventionalcommits.org) [![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

English | [中文](README.zh-CN.md)

> [!note]
> AI-generated artifacts. May include low-quality code.

A [Pi](https://github.com/earendil-works/pi) extension that prepends a
first-person identity document to the system prompt.

## Docs

- [Usage Manual](docs/Usage.md)
- [Configuration Guidebook](docs/Configuration.md)

## Install

Clone into Pi's user-extension directory.

```bash
git clone https://github.com/EyKettle/pi-role.git ~/.pi/agent/extensions/role
cd ~/.pi/agent/extensions/role
npm install
```

Pi loads `index.ts` from each directory under `~/.pi/agent/extensions/`.
Reload Pi after installing.

## Develop

```bash
npm install
npm test
npm run typecheck
```

`private: true` is intentional. This extension is not ready to publish.
