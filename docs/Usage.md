# Usage

English | [中文](../docs_zh-CN/Usage.md)

Developed against Pi 0.85.1; expected to support 0.8x.x.

- [Configuration Guidebook](Configuration.md)

## Getting started

1. Write identity self-description documents under the user or project `roles/` directory. Paths and ID rules: [Identity files section](Configuration.md#identity-files).
2. Set `role.default` in the matching-level `settings.json` (`role.fallback` optional). Keys and defaults: [`settings.json` section](Configuration.md#settingsjson).
3. Start Pi. `--role {id}` or `PI_ROLE` overrides that start; omit both to follow the configuration startup chain.
4. Switch identity in the session with `/role` (below). `/resume` keeps the identity recorded for that session; `/new` follows the startup chain. Rules: [Session record](Configuration.md#session-record).

## `/role`

Does not write `settings.json`. Does not write identity files. Identity is stored with the session.

**One limitation**: Recorded at the next turn start (no assistant reply required). If no message is sent, `/resume` does not see that switch.

| Call                       | Behavior                                      |
| -------------------------- | --------------------------------------------- |
| `/role`                    | Selector: discovered IDs, last row `none`     |
| `/role {id}`               | Argument as ID; completions from the same set |
| `/role` + invalid argument | Notify; keep the current binding              |
| `/role none`               | Legal; later turns do not prepend identity    |

## Compatibility

### `npm:pi-subagents` notes

pi-subagents usually ships its own identity; this extension's effect overlaps and conflicts with it.

This extension does not handle subagents. Whether a child session loads ambient extensions (including this one) is decided by pi-subagents.

| Child session      | Default      |
| ------------------ | ------------ |
| Background (async) | Load ambient |
| Foreground         | Do not load  |

Agent `extensions`: omit to load ambient; empty to load none; a list to load exactly those. Details: pi-subagents `docs/agents.md`.
