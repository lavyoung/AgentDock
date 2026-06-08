# AgentDock Scenario / Project / Agent 收敛执行计划

Updated: 2026-06-05

## 背景

当前 Phase 1 原型已经具备可用闭环，但在“场景决定同步到哪里”这件事上，用户心智曾经被拆散为：

```text
Scenario -> Project -> Target
          \-> Agent
```

这会让用户难以理解：

- `Scenario` 已经在管理资产组合
- `Project` 和 `Agent` 又都像同步落点
- `Target` 还以独立菜单存在，概念层级过多

更自然的目标语义应当是：

```text
Scenario -> 管理哪些资产
Scenario -> 同步到哪些 Project / Agent
```

因此本计划用于追踪一次“概念收敛”改造：

- `Scenario` 保持为资产编排中心
- `Project` 与 `Agent` 作为同级同步目标
- `Target` 退出用户主心智，只保留为过渡兼容层

## 目标模型

### 场景定义

一个 `Scenario` 应支持：

1. 关联 0..n 个 Skill
2. 关联 0..n 个 Rule
3. 关联 0..n 个 `AGENTS.md` 资产
4. 关联 0..n 个 Project
5. 关联 0..n 个 Agent
6. 允许不关联任何 Project / Agent，仅作为预设存在

### 概念收敛

- `Scenario`：管理资产组合与同步落点
- `Project`：一种同步目标，落到本地项目目录
- `Agent`：一种同步目标，落到 Agent 托管根目录
- `Target`：内部兼容层，不再作为用户可见一级概念

## 非目标

本轮不做以下事项：

- 不重做完整数据库结构
- 不引入复杂多目标适配器插件系统
- 不重构整套同步引擎
- 不一次性移除所有旧字段导致历史数据不可读

## 分阶段执行

### Phase A. 信息架构与界面收敛

目标：先让用户看到的概念变顺。

- [x] A1. 隐藏侧边栏一级菜单中的 `Target`
- [x] A2. 收窄 `Projects` 页中与左侧导航重复的内容
- [x] A3. 在 `Scenarios` 详情中将“关联项目”和“关联 Agent”明确为同级区块
- [x] A4. 保持既有暗色主题和场景详情页风格一致
- [x] A5. 文案统一为“场景关联项目 / 场景关联 Agent / 同步目标”

验收标准：

- 用户无需进入 `Target` 页面也能理解主流程
- 场景详情能清楚表达“资产”和“同步落点”是两层语义
- 项目详情不再承担重复导航

### Phase B. 交互收敛

目标：让场景真正成为关系管理中心。

- [x] B1. 场景详情支持新增 / 移除关联 Project
- [x] B2. 场景详情支持新增 / 移除关联 Agent
- [x] B3. Project 详情只保留必要摘要，不再承担关系管理入口
- [x] B4. Agent Settings 保持“注册与配置”职责，不承担业务关联
- [x] B5. 校验“空关联场景”仍可正常保存与展示

验收标准：

- 一个场景可同时关联多个 Project 与多个 Agent
- 用户可以只关联 Project、只关联 Agent，或都不关联
- 修改场景后，能直观看到影响的同步落点

### Phase C. 同步链路收敛

目标：淡化 `Target`，让同步链路围绕 `Scenario / Project / Agent` 展开。

- [x] C1. 明确 `Project.targetIds` 暂时保留为兼容层
- [x] C2. 将用户可见同步入口从 `Project` 详情迁移到 `Scenario` 详情
- [x] C3. 评估 Agent 同步日志是否复用项目轻量历史模型
- [x] C4. 清理 UI 中对 `Sync Matrix / Target` 的过度暴露
- [x] C5. 梳理过渡期数据兼容策略，避免破坏现有原型可用性

验收标准：

- 用户不理解 `Target` 也能完成主要同步流程
- 同步入口、状态和结果展示围绕 `Project / Agent` 理解
- 旧数据结构仍可安全读取

### Phase D. 数据结构收敛

目标：在不破坏原型可用性的前提下，让模型逐步贴近产品语义。

候选方向一：

```ts
type ScenarioRecord = {
  projectIds: string[];
  agentAppIds: string[];
};
```

候选方向二：

```ts
type ScenarioBinding =
  | { kind: "project"; id: string }
  | { kind: "agent"; id: string };
```

当前结论：

- [x] D1. Phase 1 继续保留 `projectIds / agentAppIds`
- [x] D2. 暂不引入统一 binding 结构
- [x] D3. 待同步链路稳定后，再决定是否升级模型

验收标准：

- 不为抽象而抽象
- 优先保证当前原型改动成本小、回归风险低

## 建议实施顺序

1. 先做 Phase A
2. 再做 Phase B
3. 然后做 Phase C
4. 最后确认 Phase D 结论

## 影响范围

- `apps/desktop/src/renderer/components/Sidebar.tsx`
- `apps/desktop/src/renderer/pages/ScenariosPage.tsx`
- `apps/desktop/src/renderer/pages/ProjectsPage.tsx`
- `apps/desktop/src/renderer/pages/SettingsPage.tsx`
- `apps/desktop/src/renderer/stores/useAppStore.ts`
- `apps/desktop/src/renderer/i18n/messages.ts`
- `apps/desktop/src/renderer/pages/Pages.css`
- `packages/core/src/types/sync.ts`

## 风险点

- `Target` 入口隐藏后，旧同步心智可能需要额外文案引导
- `Project.targetIds` 仍存在时，UI 语义与底层实现会短期不完全一致
- Agent 作为同步目标后，Settings 与 Scenario 页的职责边界必须保持清晰
- 若过早重构同步服务，容易影响现有 preview / run 闭环

## 每轮执行检查

- [ ] 不回退用户现有未提交改动
- [ ] 每轮改动后运行 `pnpm build`
- [ ] 继续清理 UTF-8 / 文案问题
- [ ] 保持场景详情页视觉主题一致
- [ ] 每轮结束补一条建议的 git commit message

## 当前状态

`Phase A`、`Phase B`、`Phase C`、`Phase D` 当前阶段任务均已完成。

当前实现状态：

1. `Target` 已从顶层导航隐藏
2. 场景详情已成为项目 / Agent 关系管理中心
3. 同步入口已迁移到场景详情页
4. 项目页保留目录配置与同步历史，不再承担同步发起入口
5. `Project.targetIds` 仍作为过渡兼容结构保留
6. `scenario.projectIds` 与 `scenario.agentAppIds` 暂不升级为统一 binding

## 收尾补记

本轮收尾额外完成：

- 移除项目页里只用于解释“同步已迁移”的过渡说明卡
- 将项目页和场景页的同步文案进一步收口为正式语义
- 修复本计划文件的 UTF-8 编码，恢复可追踪状态
- 绑定到场景的项目如未额外配置同步目录，将默认以项目根目录作为同步落点
- 同步引擎已支持按上次输出记录自动生成删除计划，用于清理场景移除后的残留文件与托管区块
- 场景同步区块现已同时展示并支持执行项目与 Agent 两类同步目标

## 下一步建议

- 进入下一轮产品收尾与体验优化
- 继续观察 `Project.targetIds` 这层兼容结构是否仍有必要保留
- 若后续要做更深层重构，再单独开启一次“同步引擎 / 数据模型重构”任务
