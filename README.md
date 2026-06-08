# 🧭 AgentDock

<p align="center">
  <strong>面向多 AI Agent 工作流的本地优先资产管理器</strong>
</p>

<p align="center">
  <a href="./README.md"><img src="https://img.shields.io/badge/lang-中文-red" /></a>
  <a href="./README.en.md"><img src="https://img.shields.io/badge/lang-English-blue" /></a>
</p>

<p align="center">
  <img src="https://img.shields.io/badge/status-prototype-blue" />
  <img src="https://img.shields.io/github/actions/workflow/status/agentdock/AgentDock/ci.yml?style=flat-square&label=CI" />
  <img src="https://img.shields.io/github/v/release/agentdock/AgentDock?style=flat-square&label=release" />
  <img src="https://img.shields.io/badge/desktop-Electron-lightgrey" />
  <img src="https://img.shields.io/badge/future-Tauri%20%2B%20Rust-orange" />
  <img src="https://img.shields.io/badge/frontend-React%20%2B%20TypeScript-61DAFB" />
  <img src="https://img.shields.io/badge/storage-SQLite-003B57" />
  <img src="https://img.shields.io/badge/license-MIT-brightgreen" />
</p>

---

## 📌 项目简介

**AgentDock** 是一个本地优先的 Agent 资产管理工具，用于集中管理不同 AI 终端和项目中会用到的配置、规则和能力文件。

AgentDock 计划支持：

* 🧩 Skills
* 📄 AGENTS.md
* 📜 Rules
* 💬 Prompts
* 🗂 Profiles
* 🎯 Targets
* 🔁 Sync Matrix

核心目标：

> 在一个地方维护 Agent 相关资产，再按需同步到不同项目、工具或本地目录。

---

## 🚧 当前阶段

当前项目处于 **Prototype / Phase 1** 阶段。

第一阶段使用 **Electron**，主要是为了快速验证产品闭环和本地文件同步能力。

Electron 不是最终目标架构。当前代码已实现：

* Asset 管理流程
* 本地 Registry 结构
* Skill / AGENTS.md Asset 编辑与保存
* 本地快照创建与恢复
* Target 目录管理
* Codex Application Settings 与目录检测
* 中英文界面切换

当前阶段下一步实现：

* Sync Matrix 交互
* 同步预览与手动同步
* AGENTS.md 托管区块合并

长期目标架构：

```text
Tauri + React + TypeScript + Rust + SQLite
```

---

## 🧱 技术栈

### 当前快速验证技术栈

| 类型              | 技术                 |
| --------------- | ------------------ |
| 桌面容器            | Electron           |
| 前端框架            | React              |
| 开发语言            | TypeScript         |
| 构建工具            | Vite               |
| 本地数据库           | SQLite             |
| SQLite 驱动       | better-sqlite3     |
| 包管理器            | pnpm               |
| 状态管理            | Zustand            |
| 编辑器             | CodeMirror 6       |
| Markdown / YAML | gray-matter / yaml |
| Diff            | jsdiff             |
| 文件系统            | fs-extra           |
| 打包              | electron-builder   |

---

### 后续目标技术架构

| 类型     | 技术                   |
| ------ | -------------------- |
| 桌面容器   | Tauri                |
| 前端框架   | React                |
| 前端语言   | TypeScript           |
| 本地核心   | Rust                 |
| 本地数据库  | SQLite               |
| 文件系统   | Rust fs / Tauri fs   |
| Git 集成 | git2-rs / system git |
| 安全扫描   | Rust                 |
| 打包     | Tauri Bundler        |

---

## 🏗 架构说明

### 当前 Prototype 架构

```text
┌──────────────────────────────┐
│          React UI             │
│  Assets / Targets / Sync      │
└───────────────┬──────────────┘
                │
┌───────────────▼──────────────┐
│        Electron Main          │
│  IPC / File System / SQLite   │
└───────────────┬──────────────┘
                │
┌───────────────▼──────────────┐
│          Core Services        │
│  Asset / Target / Sync        │
└───────┬──────────────┬───────┘
        │              │
┌───────▼──────┐ ┌─────▼──────────────┐
│ SQLite Store │ │ Local File Registry │
└──────────────┘ └────────────────────┘
```

---

### 后续 Tauri 架构

```text
┌──────────────────────────────┐
│          React UI             │
│  React + TypeScript + Vite    │
└───────────────┬──────────────┘
                │
┌───────────────▼──────────────┐
│        Tauri Commands         │
│  UI 与 Core 的类型化桥接       │
└───────────────┬──────────────┘
                │
┌───────────────▼──────────────┐
│           Rust Core           │
│  File / Sync / Scan / Git     │
└───────┬──────────────┬───────┘
        │              │
┌───────▼──────┐ ┌─────▼──────────────┐
│   SQLite     │ │ Local File Registry │
└──────────────┘ └────────────────────┘
```

后续 Rust Core 主要负责：

* 文件系统操作
* Asset 同步
* Checksum 计算
* AGENTS.md 托管区块合并
* 本地快照管理
* 安全扫描
* Git 备份集成
* 路径与权限校验

React + TypeScript 主要负责：

* Asset 编辑器
* Target 管理
* 同步矩阵
* Diff 预览
* 设置页面
* 状态展示

---

## 🧠 设计原则

* **本地优先**：核心数据默认保存在本机。
* **Git 可选**：Git 只作为备份和协作能力，不作为核心依赖。
* **资产模型统一**：Skills、AGENTS.md、Rules、Prompts 统一抽象为 Asset。
* **显式同步**：Asset 只会同步到用户选择的 Target。
* **安全合并**：涉及已有文件时优先使用托管区块。
* **适配器预留**：后续通过 Adapter 支持不同 AI 工具的目标格式。

---

## 📂 当前目录结构

AgentDock 当前采用 Monorepo 结构，但已经开始把平台无关逻辑从桌面应用中抽离出来。

```text
AgentDock/
  apps/
    desktop/
      src/
        main/                 # Electron main process
        preload/              # preload bridge
        platform/
          electron/           # Electron / SQLite / fs 实现
        renderer/
          client/             # agentdockClient
          i18n/               # UI internationalization
        App.tsx               # 当前原型主界面
        main.tsx              # React 入口
        global.d.ts           # window API typing

  packages/
    core/
      src/
        asset/                # Asset 业务逻辑与仓储接口
        ports/                # FileSystem / Path 等抽象
        snapshot/             # Snapshot 业务逻辑与仓储接口
        target/               # Target 业务逻辑与仓储接口
        types/                # 领域模型与基础类型

    shared/
      src/
        agentdockApi.ts       # renderer / preload / main 共享 contract

  docs/
    architecture/             # 架构边界与迁移规划
    mvp/                      # Phase 1 里程碑追踪

  AGENTS.md
  README.md
  package.json
  pnpm-workspace.yaml
```

## 📂 目标目录结构

随着 Phase 1 继续推进，目录会逐步演进到下面的结构。这里表示的是目标，不代表当前全部已经落地。

```text
AgentDock/
  apps/
    desktop/
      src/
        main/
        preload/
        platform/
          electron/
        renderer/
          client/
          i18n/
          pages/
          components/
          stores/

  packages/
    core/
      src/
        asset/
        target/
        sync/
        snapshot/
        managed-block/
        ports/
        types/

    shared/
      src/
        agentdockApi.ts

    schema/
      src/

    adapters/
      src/
        custom-folder/
        codex/
        claude/
        cursor/
        gemini/

  docs/
    architecture/
    mvp/
    product/
```

## 🗃 本地数据目录规划

AgentDock 默认将本地数据保存在：

```text
~/.agentdock/
  agentdock.db
  settings.yaml
  registry/
    assets/
    targets/
    deployments/
```

示例：

```text
~/.agentdock/
  agentdock.db
  registry/
    assets/
      frontend-review/
        current/
          asset.yaml
          SKILL.md
        snapshots/

      frontend-agents/
        current/
          asset.yaml
          AGENTS.md
        snapshots/

    deployments/
      lock.yaml
```

---

## 📦 Asset 文件结构

### Skill Asset

```text
registry/assets/frontend-review/
  current/
    asset.yaml
    SKILL.md
  snapshots/
```

```yaml
id: frontend-review
type: skill
name: frontend-review
title: 前端代码审查
description: 用于审查前端项目规范和实现细节
version: 0.1.0
status: active
tags:
  - frontend
  - review
```

---

### AGENTS.md Asset

```text
registry/assets/frontend-agents/
  current/
    asset.yaml
    AGENTS.md
  snapshots/
```

```yaml
id: frontend-agents
type: agents-md
name: frontend-agents
title: 前端项目 AGENTS.md
description: 用于前端项目的 Agent 协作规则
version: 0.1.0
status: active
tags:
  - frontend
  - project
```

---

## 🔁 同步策略

### Skill 同步

当前 Prototype 阶段的默认输出路径：

```text
<target-path>/.agentdock/skills/<asset-id>/SKILL.md
```

示例：

```text
~/projects/demo/.agentdock/skills/frontend-review/SKILL.md
```

---

### AGENTS.md 同步

当前 Prototype 阶段的默认输出路径：

```text
<target-path>/AGENTS.md
```

为了避免覆盖用户手写内容，AgentDock 使用托管区块：

```markdown
<!-- agentdock:start frontend-agents@0.1.0 -->
Generated content
<!-- agentdock:end frontend-agents -->
```

同步时只更新托管区块，不直接覆盖用户手写内容。

---

## 📥 下载安装

最新版本请到 [Releases 页](https://github.com/agentdock/AgentDock/releases) 下载。

| 平台       | 安装包格式                                | 备注 |
| -------- | ----------------------------------- | -- |
| Windows  | `.exe` (NSIS) · `.msi`              | 已签名（EV/OV + signtool） |
| macOS    | `.dmg` (x64 + arm64) · `.zip`       | 已签名 + 已公证（notarytool） |
| Linux    | `.AppImage` · `.deb` · `.rpm`       | 可选 GPG 签名 |

> 跨平台构建流程配置在 `.github/workflows/release.yml`，详细发布流程见
> [`docs/release/README.md`](docs/release/README.md)。维护者打 `vX.Y.Z`
> tag 即可触发。

---

## 🚀 快速开始

### 1. 克隆仓库

```bash
git clone https://github.com/<your-username>/AgentDock.git
cd AgentDock
```

---

### 2. 安装 pnpm

```bash
npm install -g pnpm
```

或：

```bash
corepack enable
corepack prepare pnpm@latest --activate
```

---

### 3. 安装依赖

```bash
pnpm install
```

---

### 4. 启动开发环境

```bash
pnpm dev
```

---

### 5. 构建

```bash
pnpm build
```

---

## 🧪 演示流程

当前 Prototype 可演示以下流程：

1. 创建一个 Skill Asset。
2. 创建一个 AGENTS.md Asset。
3. 在 Local Registry 中打开并编辑 Asset。
4. 保存并自动生成本地快照。
5. 恢复历史快照并验证内容回滚。

后续同步功能完成后的 Skill 输出示例：

```text
<target-path>/.agentdock/skills/<asset-id>/SKILL.md
```

后续同步功能完成后的 AGENTS.md 输出示例：

```text
<target-path>/AGENTS.md
```

---

## 🧭 演进路线

### Phase 1 — Prototype

* Electron 桌面应用
* Skill Asset
* AGENTS.md Asset
* 本地 Registry
* Target 目录
* 同步矩阵
* 手动同步
* 本地快照

### Phase 2 — Core Model

* Rules Asset
* Prompt Asset
* Profile 分组
* 同步预览
* 基础 Diff
* 快照恢复

### Phase 3 — Target Adapters

* Claude Adapter
* Codex Adapter
* Cursor Adapter
* Gemini Adapter
* Custom Folder Adapter

### Phase 4 — Tauri Migration

* 桌面容器迁移到 Tauri
* 文件操作迁移到 Rust
* 同步引擎迁移到 Rust
* 保留 React + TypeScript UI

### Phase 5 — Backup and Market

* 可选 Git 备份
* 本地导入
* ZIP 导入
* Git-based Market
* HTTP Registry

### Phase 6 — Security

* Asset 扫描
* Script 策略
* 信任等级
* 风险提示
* 安全部署规则

---

## 🧰 常用命令

```bash
# 安装依赖
pnpm install

# 启动开发环境
pnpm dev

# 构建
pnpm build

# Lint
pnpm lint

# Test
pnpm test

# 本地打包（不签名、不分平台）
pnpm pack

# 按平台出包（不发布，CI 模式下产物会带签名）
pnpm dist:mac        # macOS .dmg + .zip
pnpm dist:win        # Windows .exe + .msi
pnpm dist:linux      # Linux .AppImage + .deb + .rpm

# 发版（bump version + 打 tag + push，触发 release workflow）
pnpm version:bump 0.1.0
git push origin main
pnpm release:tag
```

---

## 📄 License

MIT
