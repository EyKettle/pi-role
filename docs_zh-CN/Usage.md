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

**一处限制**：下一次回合开始时写入会话记录 (不必等待助手回复)。未发送消息则 `/resume` 看不到该次切换。

| 调用               | 行为                           |
| ------------------ | ------------------------------ |
| `/role`            | 选择器：已发现 ID，末行 `none` |
| `/role {id}`       | 以参数为 ID；补全来自同一集合  |
| `/role` + 非法参数 | 通知，保持当前绑定             |
| `/role none`       | 合法；后续回合不前置身份       |

## 状态

状态会以脚注形式显示在底部状态栏中，仅显示身份 ID。

![底部状态栏展示着身份 ID (图示已安装 pi-zentui 插件)](../imgs/identity-status.png)

## 兼容性

### `npm:pi-subagents` 特别说明

pi-subagents 通常自带身份，role 插件作用与其交叉冲突。

但本扩展不负责处理子代理。子会话是否加载 ambient 扩展（含本扩展）由 pi-subagents 决定。

| 子会话        | 默认         |
| ------------- | ------------ |
| 后台（async） | 加载 ambient |
| 前台          | 不加载       |

agent 的 `extensions`：省略则加载 ambient；空则全禁；列表则精确加载。细则见 pi-subagents `docs/agents.md`。
