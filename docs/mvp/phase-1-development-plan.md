# AgentDock Phase 1 Development Plan

## 文档目的

本文件用于追踪 AgentDock `Prototype / Phase 1` 的开发进度、里程碑、验收标准与后续动作。

后续 Phase 1 开发统一以本文件为基线更新，不再以聊天记录作为唯一状态来源。

---

## 1. Phase 1 目标

Phase 1 只关注跑通以下最小产品闭环：

```text
创建 Asset
  ↓
保存到本地 Registry
  ↓
启用并配置 Application
  ↓
发现并确认可用目录位置
  ↓
配置 Sync Matrix
  ↓
预览同步内容
  ↓
同步到目标目录
```

### Phase 1 必须完成

- Skill Asset
- AGENTS.md Asset
- Local Registry
- Application Settings
- Application Directory Discovery
- Sync Matrix
- 手动同步
- 本地快照
- AGENTS.md 托管区块合并

### Phase 1 暂不处理

- Git 备份
- 外部 Skill 市场
- 云同步
- 安全扫描
- 团队协作
- 完整插件系统
- 复杂三方合并

---

## 2. 当前状态

### 已完成

- Asset 创建、读取、更新
- Skill / AGENTS.md 两类 Asset 本地落盘
- Local Registry 基础目录结构
- SQLite 资产与快照元数据存储
- Snapshot 创建、列表、恢复
- Target 基础增删改查
- Codex Application Settings 与目录检测基础能力
- Electron 平台隔离基础抽象
- Renderer Client 抽象
- UI 中英文国际化基础设施
- `packages/core` 与 `packages/shared` 第一轮物理迁移
- 生产构建路径修复

### 未完成

- Sync Matrix
- 同步预览
- 手动同步执行
- AGENTS.md 托管区块合并
- Phase 1 单元测试补齐

### 当前阶段判断

当前处于：

```text
Phase 1 / 基础能力已完成，应用接管与主同步闭环未完成
```

---

## 3. 当前产品模型

### 3.1 Asset

需要被管理和同步的内容，例如：

- Skill
- AGENTS.md

### 3.2 Application

表示一个被 AgentDock 接管的应用，例如：

- Codex
- Claude
- Cursor

Phase 1 先优先支持：

- `codex`

### 3.3 ApplicationLocation

表示某个 Application 下一个可同步的位置，例如：

- Codex Global Skills
- Project Codex Skills
- Project AGENTS.md

### 3.4 Sync Matrix

表示：

```text
Asset -> ApplicationLocation
```

的映射关系，而不是单纯：

```text
Asset -> 任意目录
```

### 3.5 Target

当前已实现的 `Target` 保留为底层路径实体与目录配置基础能力。

后续 Phase 1 中，`Target` 更偏向：

- 目录记录
- 路径校验
- 位置元数据基础

而面向用户的主模型应逐步转向：

- `Application`
- `ApplicationLocation`

---

## 4. 架构约束

Phase 1 开发必须持续满足以下约束：

- `packages/core` 保持平台无关，不直接依赖 Electron、Node 文件系统、better-sqlite3。
- `apps/desktop/src/platform/electron` 负责 Electron、SQLite、文件系统等平台实现。
- `renderer/` 不直接访问 `ipcRenderer` 或 Electron API，只通过 `agentdockClient` 访问。
- 同步逻辑必须拆为 `Sync Planning` 与 `Sync Execution`。
- `AGENTS.md` 合并逻辑必须是纯函数。
- Application Discovery 必须允许用户确认或覆盖自动检测结果。
- 为后续迁移 Tauri 保持“尽量只换壳”。

---

## 5. Phase 1 里程碑

## M1. Asset Registry Foundation

### 目标

完成 Asset、Registry、Snapshot 的本地管理基础，并完成平台隔离基线。

### 状态

`Done`

### 验收标准

- 可创建 Skill Asset
- 可创建 AGENTS.md Asset
- 可编辑并保存 Asset
- 保存时生成 Snapshot
- 可恢复 Snapshot
- `packages/core` 不直接依赖 Electron / Node 平台能力

---

## M2. Target Management Foundation

### 目标

实现本地目录 Target 的新增、列表、编辑、删除与状态管理，作为后续 ApplicationLocation 的基础能力。

### 状态

`Done`

### 交付项

- `Target` 模型
- Target Repository
- Target Service
- Target IPC
- Target UI

### 验收标准

- 可新增本地目录 Target
- 可查看 Target 列表
- 可编辑 Target 名称、路径、部署模式
- 可删除 Target
- 基础路径合法性校验可用

### 建议拆分

- T1: 定义 `Target` 类型与 Repository 接口
- T2: 实现 Electron SQLite Target Repository
- T3: 实现 Target Service
- T4: 实现 IPC / preload / client 接口
- T5: 实现 Target 管理 UI

---

## M3. Application Settings And Discovery

### 目标

建立被管理 Agent / 应用的配置入口，并支持检测常见全局目录与项目目录。

### 状态

`Done`

### 交付项

- `Application` 模型
- `ApplicationLocation` 模型
- Codex Application Settings
- 目录检测服务
- Application Settings UI

### 验收标准

- 可启用或关闭某个受管应用，例如 `codex`
- 可查看或确认检测到的全局目录
- 可查看或确认当前项目下的本地目录
- 目录检测结果可供后续 Sync Matrix 选择

### 建议拆分

- T6: 定义 `Application` 与 `ApplicationLocation` 类型
- T7: 实现 Codex 目录检测规则
- T8: 持久化应用启用状态与目录位置
- T9: 实现 Application Settings UI

---

## M4. Sync Matrix

### 目标

建立 Asset 与 ApplicationLocation 的映射关系，并支持启用 / 禁用同步。

### 状态

`Todo`

### 交付项

- `asset_targets` 或等价关系表读写封装
- Sync Matrix Service
- Sync Matrix UI

### 验收标准

- 可为某个 Asset 选择一个或多个 ApplicationLocation
- 可启用或禁用某个 Asset -> ApplicationLocation 的同步关系
- 可查看同步状态基础字段

### 建议拆分

- T10: 封装同步关系 Repository
- T11: 实现 Sync Matrix Service
- T12: 暴露 Matrix IPC / client
- T13: 增加 Matrix UI

---

## M5. Sync Planning

### 目标

生成同步预览，不直接写文件。

### 状态

`Todo`

### 交付项

- `SyncPlan`
- Skill 输出路径规划
- AGENTS.md 输出路径规划
- Diff / Preview 数据结构

### 验收标准

- 可生成某个 Asset 到某个 ApplicationLocation 的同步计划
- Skill 输出路径符合对应应用规则
- AGENTS.md 输出路径符合对应应用规则
- Preview 层不执行写文件

### 建议拆分

- T14: 定义 `SyncPlan` 与操作模型
- T15: 实现 Skill Asset planning
- T16: 实现 AGENTS.md planning
- T17: 为 UI 提供 preview 数据

---

## M6. AGENTS.md Managed Block Merge

### 目标

实现 AGENTS.md 托管区块纯函数合并。

### 状态

`Todo`

### 交付项

- `mergeManagedBlock(...)` 纯函数
- merge 结果状态模型
- 冲突检测
- 单元测试

### 验收标准

- 只更新 AgentDock 托管区块
- 不覆盖用户手写内容
- 找不到区块时追加到文件末尾
- 区块损坏时返回 `conflict`
- 至少覆盖正常、追加、替换、损坏四类测试

### 建议拆分

- T18: 定义 merge 输入输出模型
- T19: 实现纯函数
- T20: 增加单元测试
- T21: 暴露 preview 所需 merge 结果信息

---

## M7. Sync Execution

### 目标

按 `SyncPlan` 执行真实文件写入。

### 状态

`Todo`

### 交付项

- Sync Executor
- FileSystemPort 写入实现接入
- 执行结果模型
- 手动同步入口

### 验收标准

- 可执行 Skill 文件输出
- 可执行 AGENTS.md 合并写入
- 执行失败能返回明确错误
- UI 可触发手动同步

### 建议拆分

- T22: 实现 Sync Execution Service
- T23: 接 Skill 输出
- T24: 接 AGENTS.md merge 输出
- T25: 暴露 run IPC / client
- T26: 增加手动同步 UI

---

## M8. Phase 1 Hardening

### 目标

补齐测试、文档和回归校验，使 Phase 1 可稳定演示。

### 状态

`Todo`

### 交付项

- 核心单元测试
- README 与演示文档同步
- 回归检查清单

### 验收标准

- 核心逻辑至少具备基础单元测试
- README 反映真实功能状态
- `build` 与 `lint` 持续通过
- 可按演示流程完整走通

### 建议拆分

- T27: Snapshot / Asset 基础测试
- T28: Managed Block merge 测试
- T29: Sync Planning / Execution 测试
- T30: README / docs 收尾

---

## 6. 推荐执行顺序

建议按以下顺序推进：

1. M2 Target Management Foundation
2. M3 Application Settings And Discovery
3. M4 Sync Matrix
4. M5 Sync Planning
5. M6 AGENTS.md Managed Block Merge
6. M7 Sync Execution
7. M8 Phase 1 Hardening

原因：

- 先确认系统要接管哪些应用和哪些目录位置，再建立同步关系。
- 目录发现与应用设置先落地，Planning 才能按真实应用规则生成路径。
- `AGENTS.md` merge 是同步引擎的关键复杂点，建议在执行层前单独稳定。
- 最后统一补测试和文档，可以减少返工。

---

## 7. Phase 1 完成定义

满足以下条件时，可判定 Phase 1 完成：

- 可创建 Skill Asset 与 AGENTS.md Asset
- 可启用至少一个受管应用，例如 Codex
- 可检测并确认至少一个可用目录位置
- 可配置 Asset -> ApplicationLocation 的 Sync Matrix
- 可预览同步结果
- 可手动同步到目标目录
- Skill 输出路径符合对应应用规则
- AGENTS.md 托管区块合并行为符合规范
- Snapshot 功能可用
- `build` / `lint` 通过
- README 与实际实现一致

---

## 8. 风险与注意事项

- 不要把同步执行逻辑直接写进 UI。
- 不要在 `packages/core` 中重新引入 Electron 或 Node 平台依赖。
- `AGENTS.md` merge 必须先稳定再接真实写入。
- Application Discovery 必须允许用户确认或覆盖自动检测结果。
- Target / Location 路径校验要避免误写非预期目录。
- 后续如引入测试框架，优先保证 merge 与 planning 的可测性。

---

## 9. 追踪规则

后续每次推进 Phase 1 时，更新本文件以下内容：

- `当前状态`
- 里程碑 `状态`
- 已完成的 `建议拆分`
- 新发现的风险或阻塞

状态值统一使用：

- `Todo`
- `In Progress`
- `Blocked`
- `Done`

---

## 10. 更新记录

### 2026-06-01

- 初始化 Phase 1 开发计划文档
- 基于当前仓库实现状态标记 M1 为 `Done`
- 完成 M2 Target Management，并接入基础 UI 与中英文文案
- 补充 `Application Settings / Discovery` 里程碑
- 将 Sync Matrix 调整为基于 `ApplicationLocation`
- 完成 M3 `Application Settings And Discovery` 的 Codex 基线实现
