export type Locale = "en" | "zh-CN";

type MessageCatalog = {
    appTitle: string;
    currentScope: string;
    localeLabel: string;
    localeEnglish: string;
    localeChinese: string;
    newDemoSkill: string;
    newDemoAgents: string;
    targets: string;
    targetList: string;
    targetEditor: string;
    createTarget: string;
    deleteTarget: string;
    newTarget: string;
    noTargetsYet: string;
    selectTarget: string;
    targetNameLabel: string;
    targetPathLabel: string;
    targetDeployModeLabel: string;
    targetEnabledLabel: string;
    targetPathHint: string;
    targetFormCreate: string;
    targetFormSave: string;
    targetFormReset: string;
    confirmDeleteTarget: string;
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
    deployModeCopy: string;
    deployModeMerge: string;
    enabledYes: string;
    enabledNo: string;
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
    errorTargetsList: string;
    errorTargetsGet: string;
    errorTargetsCreate: string;
    errorTargetsUpdate: string;
    errorTargetsDelete: string;
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
        targets: "Targets",
        targetList: "Target List",
        targetEditor: "Target Editor",
        createTarget: "Create Target",
        deleteTarget: "Delete Target",
        newTarget: "New Target",
        noTargetsYet: "No targets yet.",
        selectTarget: "Select a target to edit, or create a new one.",
        targetNameLabel: "Target Name",
        targetPathLabel: "Target Path",
        targetDeployModeLabel: "Deploy Mode",
        targetEnabledLabel: "Enabled",
        targetPathHint: "Use an existing absolute directory path.",
        targetFormCreate: "Create",
        targetFormSave: "Save Target",
        targetFormReset: "Reset",
        confirmDeleteTarget: "Delete this target?",
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
        deployModeCopy: "Copy",
        deployModeMerge: "Merge",
        enabledYes: "Yes",
        enabledNo: "No",
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
        errorTargetsList: "Load targets",
        errorTargetsGet: "Open target",
        errorTargetsCreate: "Create target",
        errorTargetsUpdate: "Save target",
        errorTargetsDelete: "Delete target",
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
        targets: "目标目录",
        targetList: "目标列表",
        targetEditor: "目标编辑",
        createTarget: "创建目标",
        deleteTarget: "删除目标",
        newTarget: "新目标",
        noTargetsYet: "暂无目标目录。",
        selectTarget: "请选择一个目标进行编辑，或创建一个新目标。",
        targetNameLabel: "目标名称",
        targetPathLabel: "目标路径",
        targetDeployModeLabel: "部署模式",
        targetEnabledLabel: "启用",
        targetPathHint: "请填写一个已存在的绝对目录路径。",
        targetFormCreate: "创建",
        targetFormSave: "保存目标",
        targetFormReset: "重置",
        confirmDeleteTarget: "确认删除这个目标吗？",
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
        deployModeCopy: "复制",
        deployModeMerge: "合并",
        enabledYes: "是",
        enabledNo: "否",
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
        errorTargetsList: "加载目标列表",
        errorTargetsGet: "打开目标",
        errorTargetsCreate: "创建目标",
        errorTargetsUpdate: "保存目标",
        errorTargetsDelete: "删除目标",
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
