# 使用

[English](../docs/Usage.md) | 中文

本项目开发基线为 Pi 0.85.1，预计支持 0.8x.x。

- [配置指南](Configuration.md)

## 入门

1. 在用户或项目的 `roles/` 下写入身份自述文档。路径与 ID 规则见 [身份文件说明](Configuration.md#身份文件)。
2. 在对应级别的 `settings.json` 设置 `role.default`（可选 `role.fallback`）。键与默认值见 [`settings.json` 说明](Configuration.md#`settings.json`)。
3. 启动 Pi。可用 `--role {id}` 或环境变量 `PI_ROLE` 覆盖该次启动；不传则走配置启动链。
4. 会话中用 `/role` 切换身份（见下）。`/resume` 保持该会话记录的身份；`/new` 走启动链。规则见 [会话记录](Configuration.md#会话记录)。

## `/role`

不写 `settings.json`，不写身份文件。身份随该会话保存。

**一处限制**：切换后须有一次 agent 回合才会写入记录。

| 调用               | 行为                           |
| ------------------ | ------------------------------ |
| `/role`            | 选择器：已发现 ID，末行 `none` |
| `/role {id}`       | 以参数为 ID；补全来自同一集合  |
| `/role` + 非法参数 | 通知，保持当前绑定             |
| `/role none`       | 合法；后续回合不前置身份       |
