## 项目说明

本项目为 **AgentDock**。

AgentDock 是一个本地优先的 Agent 资产管理工具，用于集中管理并同步：

* Skills
* AGENTS.md
* Rules
* Prompts
* Profiles
* Targets
* Sync Matrix

当前阶段是 **Prototype / Phase 1**，使用 Electron 进行快速验证。

长期目标架构为：

```text
Tauri + React + TypeScript + Rust + SQLite
```

当前 Electron 版本只用于验证产品闭环，不应被设计成最终架构。

---

## 当前阶段目标

当前阶段只关注快速跑通以下闭环：

```text
创建 Asset
  ↓
保存到本地 Registry
  ↓
配置 Target
  ↓
配置同步矩阵
  ↓
预览同步内容
  ↓
同步到目标目录
```

当前优先支持：

* Skill Asset
* AGENTS.md Asset
* 本地 Registry
* Target 目录
* Sync Matrix
* 手动同步
* 本地快照
* AGENTS.md 托管区块合并

暂不实现：

* Git 备份
* 外部 Skill 市场
* 安全扫描
* 团队协作
* 云同步
* 完整插件系统
* 复杂三方合并

---

## 核心架构约束

### 1. Electron 只能作为平台壳

Electron 相关代码只能放在：

```text
apps/desktop/src/main/
apps/desktop/src/preload/
apps/desktop/src/platform/electron/
```

不要在以下目录直接引用 Electron API：

```text
apps/desktop/src/renderer/
apps/desktop/src/core/
packages/
```

禁止在业务逻辑中直接使用：

```ts
import { app, BrowserWindow, ipcMain, dialog } from "electron";
```

如需使用 Electron 能力，必须通过 platform 层封装。

---

### 2. React UI 不得直接依赖 Electron

React 页面中不要直接调用：

```ts
window.electron
ipcRenderer
electronAPI
```

统一通过客户端封装访问本地能力：

```ts
agentdockClient.assets.list()
agentdockClient.assets.create()
agentdockClient.targets.list()
agentdockClient.sync.preview()
agentdockClient.sync.run()
```

当前 Electron 版本中：

```text
agentdockClient -> preload -> ipcRenderer.invoke -> Electron Main
```

后续 Tauri 版本中：

```text
agentdockClient -> Tauri invoke -> Rust Command
```

React 页面不应感知底层是 Electron 还是 Tauri。

---

### 3. Core 层保持平台无关

`core/` 目录用于放业务模型和业务规则。

允许包含：

* Asset 模型
* Target 模型
* Sync 规则
* Snapshot 规则
* Managed Block 合并逻辑
* 数据结构转换
* 校验规则
* 纯函数

不允许包含：

* Electron API
* Tauri API
* Node 专属 API
* 浏览器 DOM API
* UI 组件
* 路由逻辑

Core 层应尽量保持可测试、可迁移。

---

### 4. 文件系统能力必须抽象

不要在业务代码里随处直接使用：

```ts
fs
fs-extra
path
crypto
chokidar
```

应通过接口封装。

推荐接口：

```ts
export interface FileSystemPort {
  exists(path: string): Promise<boolean>;
  readText(path: string): Promise<string>;
  writeText(path: string, content: string): Promise<void>;
  ensureDir(path: string): Promise<void>;
  copyFile(from: string, to: string): Promise<void>;
  copyDir(from: string, to: string): Promise<void>;
  remove(path: string): Promise<void>;
  checksum(path: string): Promise<string>;
}
```

当前 Electron 版本实现：

```text
NodeFileSystemPort
```

后续 Tauri 版本实现：

```text
RustFileSystemPort
```

业务层只能依赖接口，不依赖具体实现。

---

### 5. 数据库访问必须隔离

当前可以使用：

```text
SQLite + better-sqlite3
```

但数据库访问必须集中在 Repository 层。

不要在 UI、SyncService、AssetService 中直接写 SQL。

推荐结构：

```text
core/
  asset/
    assetRepository.ts
    assetService.ts
  target/
    targetRepository.ts
    targetService.ts
  sync/
    syncRepository.ts
    syncService.ts
```

后续迁移到 Tauri 时，SQLite 仍然保留，但访问实现会迁移到 Rust：

```text
better-sqlite3 -> rusqlite / sqlx
```

因此 SQL 表结构可以稳定，访问层可以替换。

---

### 6. 同步引擎不要耦合文件读写

同步逻辑需要拆成两层：

```text
Sync Planning
Sync Execution
```

`Sync Planning` 负责生成计划，不直接写文件。

示例：

```ts
type SyncPlan = {
  creates: SyncOperation[];
  updates: SyncOperation[];
  merges: SyncOperation[];
  deletes: SyncOperation[];
};
```

`Sync Execution` 才负责调用 FileSystemPort 执行文件操作。

这样后续 Rust 可以优先接管执行层，而不影响 UI 和同步矩阵。

---

### 7. AGENTS.md 合并逻辑必须做成纯函数

托管区块合并逻辑不要直接读写文件。

应写成纯函数：

```ts
mergeManagedBlock({
  originalContent,
  assetId,
  version,
  generatedContent,
});
```

托管区块格式固定为：

```markdown
<!-- agentdock:start asset-id@version -->
Generated content
<!-- agentdock:end asset-id -->
```

要求：

* 只更新 AgentDock 托管区块
* 不覆盖用户手写内容
* 找不到区块时追加到文件末尾
* 区块损坏时返回冲突状态
* 合并逻辑必须有单元测试

---

### 8. Asset 模型保持稳定

当前最小 Asset 类型：

```text
skill
agents-md
```

后续会扩展：

```text
rule
prompt
profile
template
workflow
```

代码中不要把逻辑写死为只有 Skill。

应优先使用统一模型：

```ts
type AssetType =
  | "skill"
  | "agents-md"
  | "rule"
  | "prompt"
  | "profile"
  | "template";
```

当前阶段只实现前两个类型，但结构要为后续扩展预留。

---

### 9. Target 不要绑定具体工具

当前阶段 Target 只是本地目录。

不要过早写死：

```text
Claude
Codex
Cursor
Gemini
```

当前统一为：

```ts
type Target = {
  id: string;
  name: string;
  path: string;
  deployMode: "copy" | "merge";
};
```

后续再引入：

```ts
adapter: "claude" | "codex" | "cursor" | "gemini" | "custom";
```

第一阶段只做 `custom` 目录目标即可。

---

### 10. Adapter 接口先预留，不提前复杂化

可以预留 Adapter 概念，但第一阶段不要做完整插件系统。

推荐先保留接口：

```ts
export interface TargetAdapter {
  id: string;
  name: string;
  plan(asset: Asset, target: Target): Promise<SyncPlan>;
}
```

第一阶段只实现：

```text
CustomFolderAdapter
```

后续再实现：

* Claude Adapter
* Codex Adapter
* Cursor Adapter
* Gemini Adapter

---

## 推荐目录结构

```text
AgentDock/
  apps/
    desktop/
      src/
        renderer/
          App.tsx
          main.tsx
          pages/
          components/
          stores/
          client/
            agentdockClient.ts

        core/
          asset/
          target/
          sync/
          snapshot/
          managed-block/
          registry/

        platform/
          electron/
            ipc.ts
            paths.ts
            fileSystemPort.ts
            database.ts

        main/
          main.ts

        preload/
          preload.ts

  packages/
    shared/
    schema/
    core/

  docs/
    product/
    architecture/
    mvp/

  AGENTS.md
  README.md
  package.json
  pnpm-workspace.yaml
```

---

## 代码风格要求

### TypeScript

* 使用 TypeScript。
* 新代码尽量补齐类型。
* 避免使用 `any`，除非是临时 IPC 边界。
* IPC 入参和返回值应定义类型。
* 业务对象应放在 shared/schema 或 core/types 中。
* 函数命名保持直白，不做过度抽象。

### React

* 页面只负责展示和交互。
* 不在组件中写文件系统逻辑。
* 不在组件中写 SQL。
* 不在组件中拼接复杂同步规则。
* 复杂逻辑放到 service、store 或 core 中。

### Rust 预留

当前阶段不要求写 Rust。

但写 TypeScript 逻辑时，需要考虑后续 Rust 迁移：

* 文件操作不要散落
* DB 访问不要散落
* 同步执行不要散落
* 合并规则保持纯函数
* 数据结构保持清晰

---

## 命名约定

### Asset

使用：

```text
Asset
```

不要只使用：

```text
Skill
```

除非逻辑确实只针对 Skill 类型。

### AGENTS.md

统一写法：

```text
AGENTS.md
```

代码命名可使用：

```ts
agentsMd
agentsMdAsset
```

### Sync Matrix

统一写法：

```text
Sync Matrix
```

代码命名可使用：

```ts
syncMatrix
assetTargets
```

### Registry

本地资产库统一称为：

```text
Local Registry
```

---

## 同步规则

### Skill Asset 输出路径

```text
<target-path>/.agentdock/skills/<asset-id>/SKILL.md
```

### AGENTS.md Asset 输出路径

```text
<target-path>/AGENTS.md
```

### AGENTS.md 合并规则

如果目标文件不存在：

* 创建新的 `AGENTS.md`
* 写入托管区块

如果目标文件存在但没有托管区块：

* 保留原内容
* 在文件末尾追加托管区块

如果目标文件已有托管区块：

* 只替换对应 assetId 的托管区块

如果托管区块损坏：

* 不覆盖文件
* 返回 conflict 状态
* 交由 UI 提示用户处理

---

## 快照规则

每次保存 Asset 时创建本地快照。

快照目录示例：

```text
~/.agentdock/registry/assets/frontend-review/
  current/
    asset.yaml
    SKILL.md
  snapshots/
    2026-06-01-103000/
      asset.yaml
      SKILL.md
```

要求：

* 快照只做本地版本能力
* 不依赖 Git
* Git 后续只作为可选备份
* 回滚快照后，对应 Target 状态应变为 pending

---

## 提交前检查

提交代码前至少确认：

* 项目可以启动
* TypeScript 无明显类型错误
* 新增业务逻辑不直接依赖 Electron
* React 页面不直接调用 ipcRenderer
* 文件写入逻辑通过封装调用
* AGENTS.md merge 不覆盖用户手写内容
* README 或文档中相关说明同步更新

---

## 开发命令

```bash
pnpm install
pnpm dev
pnpm build
```

后续加入：

```bash
pnpm lint
pnpm test
```

---

## 当前优先级

优先级从高到低：

1. Asset 创建与编辑
2. 本地 Registry 写入
3. Target 目录配置
4. Sync Matrix
5. 同步预览
6. Skill 输出
7. AGENTS.md 托管区块合并
8. 本地快照
9. 同步日志

暂不处理：

* 外部市场
* Git 备份
* 安全扫描
* 多 Agent Adapter
* 团队协作
* 云同步

---

## 后续迁移原则

迁移到 Tauri 时，应优先替换：

```text
platform/electron/
```

目标变为：

```text
src-tauri/
```

React UI、Asset 模型、Target 模型、Sync Matrix 交互应尽量保留。

迁移目标：

```text
Electron IPC
  ↓
Tauri Commands

Node fs
  ↓
Rust fs

better-sqlite3
  ↓
rusqlite / sqlx

Node checksum
  ↓
Rust sha2

electron-builder
  ↓
Tauri Bundler
```

如果当前阶段严格遵守平台隔离，后续迁移应主要发生在 Native / Platform 层，而不是重写整个项目。
