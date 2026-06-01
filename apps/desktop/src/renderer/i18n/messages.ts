export type Locale = "en" | "zh-CN";

type MessageCatalog = {
    appTitle: string;
    currentScope: string;
    localeLabel: string;
    localeEnglish: string;
    localeChinese: string;
    newDemoSkill: string;
    newDemoAgents: string;
    refresh: string;
    assets: string;
    editor: string;
    snapshots: string;
    noAssetsYet: string;
    selectAsset: string;
    typeLabel: string;
    nameLabel: string;
    versionLabel: string;
    statusLabel: string;
    assetTypeSkill: string;
    assetTypeAgentsMd: string;
    assetStatusActive: string;
    titleLabel: string;
    descriptionLabel: string;
    contentLabel: string;
    save: string;
    filePathLabel: string;
    noSnapshotsYet: string;
    snapshotMessageBeforeAssetUpdate: string;
    restore: string;
    confirmRestore: string;
    errorPrefix: string;
    errorAssetsList: string;
    errorAssetsGet: string;
    errorAssetsUpdate: string;
    errorAssetsCreateSkill: string;
    errorAssetsCreateAgents: string;
    errorSnapshotsList: string;
    errorSnapshotsRestore: string;
    demoSkillTitle: string;
    demoSkillDescription: string;
    demoSkillContent: string;
    demoAgentsTitle: string;
    demoAgentsDescription: string;
    demoAgentsContent: string;
};

export const messages: Record<Locale, MessageCatalog> = {
    en: {
        appTitle: "AgentDock Prototype",
        currentScope: "Current scope: asset registry, local editing, and snapshot restore.",
        localeLabel: "Language",
        localeEnglish: "English",
        localeChinese: "Chinese",
        newDemoSkill: "New Demo Skill",
        newDemoAgents: "New Demo AGENTS.md",
        refresh: "Refresh",
        assets: "Assets",
        editor: "Editor",
        snapshots: "Snapshots",
        noAssetsYet: "No assets yet.",
        selectAsset: "Select an asset to edit.",
        typeLabel: "Type",
        nameLabel: "Name",
        versionLabel: "Version",
        statusLabel: "Status",
        assetTypeSkill: "Skill",
        assetTypeAgentsMd: "AGENTS.md",
        assetStatusActive: "Active",
        titleLabel: "Title",
        descriptionLabel: "Description",
        contentLabel: "Content",
        save: "Save",
        filePathLabel: "File path",
        noSnapshotsYet: "No snapshots yet. Saving an asset will create one.",
        snapshotMessageBeforeAssetUpdate: "Before asset update",
        restore: "Restore",
        confirmRestore: "Restore this snapshot and overwrite the current asset?",
        errorPrefix: "failed",
        errorAssetsList: "Load assets",
        errorAssetsGet: "Open asset",
        errorAssetsUpdate: "Save asset",
        errorAssetsCreateSkill: "Create demo skill",
        errorAssetsCreateAgents: "Create demo AGENTS.md",
        errorSnapshotsList: "Load snapshots",
        errorSnapshotsRestore: "Restore snapshot",
        demoSkillTitle: "Frontend Review",
        demoSkillDescription: "Prototype skill asset for frontend code review.",
        demoSkillContent: `# Frontend Review

## Usage

Use this skill when reviewing React and TypeScript projects.

## Focus

- Component structure
- Type safety
- Maintainability
`,
        demoAgentsTitle: "Frontend AGENTS.md",
        demoAgentsDescription: "Prototype AGENTS.md asset for frontend projects.",
        demoAgentsContent: `# AGENTS.md

## Project Rules

Respect the project structure, naming rules, and code style.

## Development Notes

- Understand the current implementation before editing
- Keep changes focused
- Avoid unrelated dependencies
`,
    },
    "zh-CN": {
        appTitle: "AgentDock 原型",
        currentScope: "当前范围：资产注册、本地编辑与快照恢复。",
        localeLabel: "语言",
        localeEnglish: "英文",
        localeChinese: "中文",
        newDemoSkill: "新建示例 Skill",
        newDemoAgents: "新建示例 AGENTS.md",
        refresh: "刷新",
        assets: "资产",
        editor: "编辑器",
        snapshots: "快照",
        noAssetsYet: "暂无资产。",
        selectAsset: "请选择一个资产进行编辑。",
        typeLabel: "类型",
        nameLabel: "名称",
        versionLabel: "版本",
        statusLabel: "状态",
        assetTypeSkill: "Skill",
        assetTypeAgentsMd: "AGENTS.md",
        assetStatusActive: "启用中",
        titleLabel: "标题",
        descriptionLabel: "描述",
        contentLabel: "内容",
        save: "保存",
        filePathLabel: "文件路径",
        noSnapshotsYet: "暂无快照。保存资产后会自动创建快照。",
        snapshotMessageBeforeAssetUpdate: "更新资产前",
        restore: "恢复",
        confirmRestore: "确认恢复这个快照并覆盖当前资产吗？",
        errorPrefix: "失败",
        errorAssetsList: "加载资产列表",
        errorAssetsGet: "打开资产",
        errorAssetsUpdate: "保存资产",
        errorAssetsCreateSkill: "创建示例 Skill",
        errorAssetsCreateAgents: "创建示例 AGENTS.md",
        errorSnapshotsList: "加载快照列表",
        errorSnapshotsRestore: "恢复快照",
        demoSkillTitle: "前端评审",
        demoSkillDescription: "用于前端代码评审的示例 Skill 资产。",
        demoSkillContent: `# 前端评审

## 使用场景

当你需要评审 React 与 TypeScript 项目时使用。

## 关注点

- 组件结构
- 类型安全
- 可维护性
`,
        demoAgentsTitle: "前端 AGENTS.md",
        demoAgentsDescription: "用于前端项目的示例 AGENTS.md 资产。",
        demoAgentsContent: `# AGENTS.md

## 项目规则

请遵循项目的目录结构、命名规范与代码风格。

## 开发说明

- 修改前先理解现有实现
- 保持变更范围聚焦
- 避免引入无关依赖
`,
    },
};
