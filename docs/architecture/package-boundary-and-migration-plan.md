# AgentDock Package Boundary And Migration Plan

## 文档目的

本文件定义 AgentDock 在 `Prototype / Phase 1` 到后续 Tauri 迁移阶段的包边界、目录职责与迁移策略。

目标不是追求目录形式上的完美，而是保证：

- 平台能力不重新回流到业务层
- 领域模型能被 Electron 与未来 Tauri 复用
- 迁移时尽量只替换 Native / Platform 层

---

## 1. 核心结论

AgentDock 长期应采用：

```text
apps/* 负责应用壳
packages/* 负责通用业务逻辑与共享契约
```

其中：

- `apps/desktop` 负责 Electron 壳、桌面端 UI 和平台接入
- `packages/core` 负责平台无关的业务逻辑
- `packages/shared` 负责跨层共享类型与 contract
- `packages/schema` 预留给 schema / validation
- `packages/adapters` 预留给应用适配器

当前阶段已经开始进行物理迁移：

- `packages/core` 已承载当前平台无关的 Asset / Target / Snapshot 逻辑
- `packages/shared` 已承载当前 `agentdockApi` 共享 contract

---

## 2. 当前产品模型

### 2.1 Asset

需要被管理和同步的内容，例如：

- Skill
- AGENTS.md

### 2.2 Application

表示被 AgentDock 接管的应用，例如：

- Codex
- Claude
- Cursor
- Gemini

Phase 1 当前先优先支持：

- `codex`

### 2.3 ApplicationLocation

表示一个 Application 下的可同步位置，例如：

- Codex Global Skills
- Project Codex Skills
- Project AGENTS.md

### 2.4 Sync Matrix

表示：

```text
Asset -> ApplicationLocation
```

的关系，而不是简单：

```text
Asset -> 任意目录
```

### 2.5 Target

当前已经实现的 `Target` 保留为底层路径实体与目录配置基础能力。

在后续演进中：

- `Target` 负责路径记录、目录元数据与校验基础
- `ApplicationLocation` 负责面向用户的同步落点语义

也就是说，`Target` 更偏底层资源，`ApplicationLocation` 更偏产品模型。

---

## 3. 为什么要这样设计

### 3.1 为未来迁移 Tauri 做准备

如果业务逻辑直接依赖 Electron、Node 文件系统、better-sqlite3，那么迁移 Tauri 时会变成重写业务层。

正确做法是：

- 业务逻辑只依赖抽象接口
- Electron / Tauri 只提供具体实现

这样迁移时，主要替换：

```text
platform/electron -> platform/tauri or Rust implementation
```

而不是重写：

```text
Asset / Application / Sync / Merge 等核心逻辑
```

### 3.2 为多应用适配做准备

未来会有：

- Codex
- Claude
- Cursor
- Gemini
- Custom Folder

这些应用的目录规则和同步格式差异，不应写死在 Electron 主进程或 React 页面里，而应建立在统一业务模型和 adapter 机制之上。

### 3.3 为项目理解做准备

清晰的项目理解路径应当是：

1. `apps/desktop` 是桌面应用壳
2. `packages/shared` 是共享 contract
3. `packages/core` 是业务逻辑
4. `packages/adapters` 是应用适配层

这比把平台实现、业务逻辑、共享类型混放在一个目录里更容易维护和 onboarding。

---

## 4. 推荐目标目录结构

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
        application/
        target/
        sync/
        snapshot/
        managed-block/
        ports/
        types/

    shared/
      src/
        agentdockApi.ts
        types/

    schema/
      src/

    adapters/
      src/
        codex/
        claude/
        cursor/
        gemini/
        custom-folder/

  docs/
    architecture/
    mvp/
    product/
```

---

## 5. 各层职责

## 5.1 `apps/desktop`

职责：

- Electron 启动与窗口管理
- preload 安全桥接
- Electron IPC 注册
- Electron 平台实现装配
- 桌面端 React UI

不应该承载：

- 通用业务规则
- 平台无关同步规划逻辑
- AGENTS.md merge 纯函数
- 应用目录发现规则本身

### 必须留在 `apps/desktop`

- `src/main`
- `src/preload`
- `src/platform/electron`
- 桌面专属 UI 页面
- React i18n runtime

### 为什么 `renderer/i18n` 目前不迁移

当前的 i18n 包含：

- React Provider
- `useI18n()` Hook
- `localStorage` 持久化
- `document.documentElement.lang` 更新

它本质上是桌面端 UI runtime，不是领域层逻辑，也不是跨层 contract，因此当前更适合留在 `apps/desktop/src/renderer/i18n`。

未来如果出现多个前端壳，再考虑拆分：

- `packages/i18n`: 纯字典、locale 类型、key 定义
- app 内保留各自的 React Provider / runtime

---

## 5.2 `packages/core`

职责：

- Asset 业务逻辑
- Application 业务逻辑
- Target 基础逻辑
- Snapshot 业务逻辑
- Sync Planning
- Sync Execution 的平台无关部分
- Managed Block merge 纯函数
- ports 抽象
- 领域模型与通用类型

要求：

- 不直接依赖 Electron
- 不直接依赖 Node 专属实现
- 不直接依赖 DOM
- 不直接依赖 SQLite 驱动实现

`packages/core` 应该是未来最稳定、最可测试、最可迁移的层。

---

## 5.3 `packages/shared`

职责：

- IPC / command contract 类型
- DTO
- 跨层共享类型
- 前后端共享数据结构

当前已经属于这个角色的内容：

- `agentdockApi`

以后无论 Electron 还是 Tauri，UI 与平台壳之间都应该尽量共享这一层 contract。

---

## 5.4 `packages/schema`

职责：

- validation schema
- 结构校验
- 输入输出约束

当前不是必须，但后续一旦引入：

- `zod`
- JSON schema
- form validation

就应该集中到这个包，而不是散在 UI 和 service 里。

---

## 5.5 `packages/adapters`

职责：

- `CodexAdapter`
- `ClaudeAdapter`
- `CursorAdapter`
- `GeminiAdapter`
- `CustomFolderAdapter`

这些 adapter 应该建立在：

- `packages/core` 的 Asset / Application / Sync 模型
- `packages/shared` 的共享 contract

之上，而不是直接耦合到 Electron。

---

## 6. 当前代码与目标结构的映射

### 当前更适合保留在 `apps/desktop`

- `apps/desktop/src/main/*`
- `apps/desktop/src/preload/*`
- `apps/desktop/src/platform/electron/*`
- `apps/desktop/src/App.tsx`
- `apps/desktop/src/renderer/*`

### 已迁移到 `packages/core`

- `packages/core/src/asset/*`
- `packages/core/src/target/*`
- `packages/core/src/snapshot/*`
- `packages/core/src/ports/*`
- `packages/core/src/types/*`

### 下一步应优先补到 `packages/core`

- `application/*`
- `sync/*`
- `managed-block/*`

### 已迁移到 `packages/shared`

- `packages/shared/src/agentdockApi.ts`

### 下一步应优先补到 `packages/shared`

- Application Settings DTO
- Sync preview / run DTO
- 更稳定的跨层 contract 类型

---

## 7. 迁移策略

## 7.1 原则

当前已经完成第一轮物理迁移，因此后续原则是：

```text
继续按目标边界写代码
仅在边界已经稳定的模块上继续迁移
```

这样可以避免：

- 原型期频繁反复搬目录
- 开发节奏被无效重构打断
- 尚未稳定的模块过早抽包

---

## 7.2 下一轮迁移优先级

### Step 1. 建立 `packages/core/application`

优先放入：

- `Application`
- `ApplicationLocation`
- 目录发现规则
- 应用启用状态模型

### Step 2. 建立 `packages/core/sync`

优先放入：

- Sync Matrix 模型
- Sync Planning
- Sync Execution 的平台无关部分

### Step 3. 建立 `packages/core/managed-block`

优先放入：

- `mergeManagedBlock(...)`
- merge 结果模型

### Step 4. 扩展 `packages/shared`

补齐：

- Application Settings DTO
- Sync preview / run DTO
- 更清晰的 IPC contract

### Step 5. 逐步建立 `packages/adapters`

先从：

- `CodexAdapter`

开始，再扩展到其它应用。

---

## 8. 开发约束

从现在开始，所有新代码都应遵循以下规则：

### 8.1 新业务逻辑默认直接放入 `packages/core`

如果暂时不能放入 `packages/core`，也必须满足：

- 不依赖 Electron
- 不依赖 DOM
- 不依赖具体 fs / db 驱动实现
- 通过 ports 注入平台能力

### 8.2 新共享类型默认直接放入 `packages/shared`

所有跨层稳定 contract 都应优先进入 `packages/shared`，不要重新回写到 `apps/desktop`。

### 8.3 平台实现只能放在 `platform/*`

不能把以下实现重新写回业务层：

- Electron API
- `fs-extra`
- `better-sqlite3`
- Node 路径处理细节

### 8.4 页面层不应理解平台细节

React 页面只能通过：

- `agentdockClient`
- store
- UI 层状态

访问业务能力。

### 8.5 Application Discovery 必须允许人工确认

自动检测结果只能是候选结果，不能直接默默接管用户目录。

---

## 9. 对 README 的要求

README 后续应区分两个概念：

### `Current Structure`

描述当前仓库真实存在的目录结构。

### `Target Structure`

描述未来计划演进到的包结构。

不要把“目标结构”直接写成“当前结构”，否则会造成：

- 新人理解偏差
- 目录说明长期失真
- 重构边界混乱

同时 README 的产品描述也应逐步从“Target = 普通目录”过渡到“Application / ApplicationLocation”模型。

---

## 10. 与 Phase 1 的关系

这份文档不替代 Phase 1 计划文档。

职责分工如下：

- `docs/mvp/phase-1-development-plan.md`
  - 负责功能里程碑追踪
- `docs/architecture/package-boundary-and-migration-plan.md`
  - 负责架构边界与迁移策略

后续开发时：

- 功能状态更新到 `mvp` 文档
- 边界策略变化更新到 `architecture` 文档

---

## 11. 更新记录

### 2026-06-01

- 初始化包边界与迁移规划文档
- 明确采用 `apps/* + packages/*` 的长期结构
- 启动第一轮物理迁移，将 `core` 与 `shared` 的稳定模块移入 `packages/`
- 将后续产品主模型明确为 `Application / ApplicationLocation / Sync Matrix`
- 明确 `renderer/i18n` 当前属于 app runtime，不纳入本轮抽包
