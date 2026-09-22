# role 插件

[![Conventional Commits](https://img.shields.io/badge/Conventional%20Commits-1.0.0-%23FE5196?logo=conventionalcommits&logoColor=white)](https://conventionalcommits.org) [![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

[English](README.md) | 中文

> [!note]
> AI 生成产物，可能包含低质量代码。

一个用于加载身份自述提示词的 [Pi](https://github.com/earendil-works/pi) 拓展插件。

## 文档

- [使用说明](docs_zh-CN/Usage.md)
- [配置指南](docs_zh-CN/Configuration.md)

## 安装

克隆到 Pi 的用户扩展路径 (如 `~/.pi/agent/extensions`)。

```bash
git clone https://github.com/EyKettle/pi-role.git ~/.pi/agent/extensions/role
cd ~/.pi/agent/extensions/role
pnpm install
```

Pi 会自动加载 `~/.pi/agent/extensions/` 下的 `index.ts` 作为用户插件。
安装后重启 Pi 即可。

## 开发

```bash
pnpm install
pnpm test
pnpm run typecheck
```

`private: true` 是有意为之。该插件尚未做好发布准备。
