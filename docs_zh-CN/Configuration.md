# 配置

[English](../docs/Configuration.md) | 中文

- [使用说明](Usage.md)

## 启动链

| 顺序 | 入口            | 所有者          | 寿命     |
| ---- | --------------- | --------------- | -------- |
| 1    | `--role`        | 本次进程的 CLI  | 该次启动 |
| 2    | `PI_ROLE`       | 进程环境        | 该次启动 |
| 3    | `role.default`  | `settings.json` | 文件     |
| 4    | `role.fallback` | `settings.json` | 文件     |
| 链尽 | `none`          | 内置            | 该次绑定 |

## `settings.json`

| 键              | 默认     |
| --------------- | -------- |
| `role.default`  | `""`     |
| `role.fallback` | `"none"` |

| 级别      | 优先级 | 位置                                    |
| --------- | ------ | --------------------------------------- |
| 项目      | 1      | `{cwd}/{CONFIG_DIR_NAME}/settings.json` |
| 用户/全局 | 2      | `{agentDir}/settings.json`              |

示例配置：

```json
{
  "role": {
    "default": "Orchestrator",
    "fallback": "none"
  }
}
```

## 会话记录

| 条件                       | 行为          |
| -------------------------- | ------------- |
| 未传 `--role` 且会话有记录 | 恢复记录的 ID |
| `--role` 非空              | 走启动链      |
| 无记录（含 `/new`）        | 走启动链      |

## 身份文件

| 树   | 优先级 | 路径                                 | 何时读     |
| ---- | ------ | ------------------------------------ | ---------- |
| 项目 | 1      | `{cwd}/{CONFIG_DIR_NAME}/roles/*.md` | 仅受信项目 |
| 用户 | 2      | `{agentDir}/roles/*.md`              | 总是       |

ID 为文件名 (无后缀)。`none` 是保留内置值，不是文件名；名为 `none.md` 的文件不登记。

建议 PascalCase 文件名（`Reviewer.md` → ID `Reviewer`）。加载器不强制大小写。正文整份 Markdown 原样使用，无额外 frontmatter 协议。
