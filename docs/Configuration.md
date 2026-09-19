# Configuration

English | [中文](../docs_zh-CN/Configuration.md)

- [Usage Manual](Usage.md)

## Startup chain

| Order     | Entry           | Owner               | Lifetime     |
| --------- | --------------- | ------------------- | ------------ |
| 1         | `--role`        | This process's CLI  | That start   |
| 2         | `PI_ROLE`       | Process environment | That start   |
| 3         | `role.default`  | `settings.json`     | File         |
| 4         | `role.fallback` | `settings.json`     | File         |
| Chain end | `none`          | Built-in            | That binding |

## `settings.json`

| Key             | Default  |
| --------------- | -------- |
| `role.default`  | `""`     |
| `role.fallback` | `"none"` |

| Level       | Priority | Location                                |
| ----------- | -------- | --------------------------------------- |
| Project     | 1        | `{cwd}/{CONFIG_DIR_NAME}/settings.json` |
| User/global | 2        | `{agentDir}/settings.json`              |

Example:

```json
{
  "role": {
    "default": "Orchestrator",
    "fallback": "none"
  }
}
```

## Session record

| Condition                                | Behavior                 |
| ---------------------------------------- | ------------------------ |
| No `--role` and the session has a record | Restore the recorded ID  |
| `--role` is non-empty                    | Follow the startup chain |
| No record (`/new` included)              | Follow the startup chain |

## Identity files

| Tree    | Priority | Path                                 | When read            |
| ------- | -------- | ------------------------------------ | -------------------- |
| Project | 1        | `{cwd}/{CONFIG_DIR_NAME}/roles/*.md` | Trusted project only |
| User    | 2        | `{agentDir}/roles/*.md`              | Always               |

The ID is the filename (no suffix). `none` is a reserved built-in, not a filename; a file named `none.md` is not registered.

PascalCase filenames are suggested (`Reviewer.md` → ID `Reviewer`). The loader does not enforce case. The full Markdown body is used as-is; there is no extra frontmatter protocol.
