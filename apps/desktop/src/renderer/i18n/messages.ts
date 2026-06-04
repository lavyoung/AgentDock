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
    save: string;
    restore: string;
    close: string;
    cancel: string;
    toggleEnabled: string;
    assetsTitle: string;
    assetsUnit: string;
    assetsList: string;
    assetsEditor: string;
    assetsEmpty: string;
    assetsActions: string;
    selectAsset: string;
    skillsSearchPlaceholder: string;
    skillsCheckAll: string;
    skillsUpdateAll: string;
    commonTabAll: string;
    commonTabEnabled: string;
    commonTabDisabled: string;
    commonBack: string;
    assetsFilterAll: string;
    assetsFilterSkill: string;
    assetsFilterAgentsMd: string;
    assetsFilterRule: string;
    assetTypeSkill: string;
    assetTypeAgentsMd: string;
    assetTypeRule: string;
    assetStatusActive: string;
    deployModeCopy: string;
    deployModeMerge: string;
    targetsTitle: string;
    targetsUnit: string;
    targetsEmpty: string;
    targetsName: string;
    targetsPath: string;
    targetsBrowse: string;
    targetsDeployMode: string;
    settingsTitle: string;
    settingsLanguage: string;
    settingsLanguageZh: string;
    settingsTheme: string;
    settingsThemeDark: string;
    settingsThemeLight: string;
    settingsThemeSystem: string;
    settingsData: string;
    settingsDataPath: string;
    settingsBrowse: string;
    settingsAutoUpdate: string;
    settingsAutoUpdateDesc: string;
    settingsNotifications: string;
    settingsNotificationsDesc: string;
    settingsSound: string;
    settingsAbout: string;
    settingsVersion: string;
    settingsCopyright: string;
    settingsGeneral: string;
    overviewTitle: string;
    overviewTotalSkills: string;
    overviewTotalRules: string;
    overviewTotalScenarios: string;
    overviewTotalAgents: string;
    overviewRulesPending: string;
    overviewAgentBreakdown: string;
    overviewRefSkills: string;
    overviewRefRules: string;
    overviewStatusEnabled: string;
    overviewStatusUninstalled: string;
    overviewAgentActive: string;
    overviewAgentInactive: string;
    demoSkillTitle: string;
    demoSkillDescription: string;
    demoSkillContent: string;
    demoAgentsTitle: string;
    demoAgentsDescription: string;
    demoAgentsContent: string;
    navOverview: string;
    navAssets: string;
    navInstall: string;
    navScenarios: string;
    navScenariosCategory: string;
    navTargets: string;
    navSettings: string;
    navWorkspacesCategory: string;
    navDefaultScenario: string;
    navLinkedProjects: string;
    actionNewScenario: string;
    actionNewProject: string;
    skillsBackup: string;
    skillsNewAsset: string;
    newAssetTitle: string;
    newAssetType: string;
    newAssetTypeSkillDesc: string;
    newAssetTypeAgentsMdDesc: string;
    newAssetTitleLabel: string;
    newAssetIdLabel: string;
    newAssetDescLabel: string;
    newAssetContentLabel: string;
    newAssetContentHint: string;
    newAssetResetTemplate: string;
    newAssetPreview: string;
    newAssetPreviewHint: string;
    newAssetCreate: string;
    newAssetValidationTitle: string;
    newAssetValidationId: string;
    newAssetValidationContent: string;
    newAssetCreated: string;
    installTitle: string;
    installSubtitle: string;
    projectsTitle: string;
    projectsSubtitle: string;
    scenariosTitle: string;
    scenariosEmpty: string;
    scenariosComingSoon: string;
    newScenario: string;
    scenarioBuiltIn: string;
    scenarioBuiltInDesc: string;
    scenarioSkills: string;
    scenarioRules: string;
    scenarioAgentFiles: string;
    scenarioAgent: string;
    scenarioProjects: string;
    scenarioRecentActivity: string;
    scenarioActivityNote: string;
    scenarioUsedSkills: string;
    scenarioAppliedRules: string;
    scenarioAddSkill: string;
    scenarioAddRule: string;
    scenarioAddAgentFile: string;
    scenarioAddAgent: string;
    scenarioEditScenario: string;
    scenarioDeleteScenario: string;
    scenarioListSubtitle: string;
    scenarioRemoveAsset: string;
    scenarioBackToScenarios: string;
    newScenarioTitle: string;
    newScenarioHelp: string;
    newScenarioName: string;
    newScenarioDescPlaceholder: string;
    newScenarioPreviewHint: string;
    newScenarioDescLabel: string;
    newScenarioCountSuffix: string;
    newScenarioItemSuffix: string;
    scenarioNotFound: string;
    breadcrumbAriaLabel: string;
    scenarioNoProjects: string;
    scenarioBadgeLabel: string;
    rulesTitle: string;
    rulesEmpty: string;
    newDemoRule: string;
    toastRuleNameRequired: string;
    toastScenarioNameRequired: string;
    toastScenarioCreated: string;
    severityError: string;
    severityWarning: string;
    severityInfo: string;
    assetPickerTitle: string;
    assetPickerEmpty: string;
    assetPickerAlreadyAdded: string;
    savedSuccess: string;
    saveFailed: string;
    panelVersion: string;
    panelSynced: string;
    assetView: string;
    panelTabOverview: string;
    panelTabContent: string;
    panelTabHistory: string;
    panelFieldId: string;
    panelFieldType: string;
    panelFieldVersion: string;
    panelFieldTags: string;
    panelFieldPath: string;
    panelFieldTitle: string;
    panelFieldDescription: string;
    panelNoTags: string;
    assetContent: string;
    panelContentStats: string;
    panelHistoryDesc: string;
    noSnapshotsYet: string;
    snapshotMessageBeforeAssetUpdate: string;
    snapshotRestored: string;
    snapshotRestoreFailed: string;
    deleteAsset: string;
    confirmDeleteAsset: string;
    assetDeleted: string;
    assetDeleteFailed: string;
    saveAndSnapshot: string;
    targetList: string;
    newTarget: string;
    enabledYes: string;
    enabledNo: string;
    targetEditor: string;
    createTarget: string;
    targetNameLabel: string;
    targetPathLabel: string;
    targetPathHint: string;
    targetDeployModeLabel: string;
    targetEnabledLabel: string;
    targetFormSave: string;
    targetFormCreate: string;
    targetFormReset: string;
    targetSaved: string;
    targetCreated: string;
    targetDeleted: string;
    deleteTarget: string;
    confirmDeleteTarget: string;
};

type Catalog = {[K in keyof MessageCatalog]: string};

export const messages: Record<Locale, Catalog> = {
    "zh-CN": {
        appTitle: "AgentDock",
        currentScope: "\u5f53\u524d\u8303\u56f4",
        localeLabel: "\u8bed\u8a00",
        localeEnglish: "English",
        localeChinese: "\u4e2d\u6587",
        newDemoSkill: "\u65b0\u5efa\u793a\u4f8b Skill",
        newDemoAgents: "\u65b0\u5efa\u793a\u4f8b AGENTS.md",
        refresh: "\u5237\u65b0",
        save: "\u4fdd\u5b58",
        restore: "\u6062\u590d",
        close: "\u5173\u95ed",
        cancel: "\u53d6\u6d88",
        toggleEnabled: "\u5207\u6362\u542f\u7528\u72b6\u6001",
        assetsTitle: "\u8d44\u4ea7",
        assetsUnit: "\u9879",
        assetsList: "\u8d44\u4ea7\u5217\u8868",
        assetsEditor: "\u8d44\u4ea7\u7f16\u8f91\u5668",
        assetsEmpty: "\u6682\u65e0\u8d44\u4ea7",
        assetsActions: "\u64cd\u4f5c",
        selectAsset: "\u9009\u62e9\u8d44\u4ea7",
        skillsSearchPlaceholder: "\u641c\u7d22\u6280\u80fd\u540d\u79f0\u3001\u63cf\u8ff0\u3001\u6807\u7b7e\u2026",
        skillsCheckAll: "\u68c0\u67e5\u5168\u90e8",
        skillsUpdateAll: "\u5168\u90e8\u66f4\u65b0",
        commonTabAll: "\u5168\u90e8",
        commonTabEnabled: "\u5df2\u542f\u7528",
        commonTabDisabled: "\u672a\u542f\u7528",
        commonBack: "\u8fd4\u56de",
        assetsFilterAll: "\u5168\u90e8\u7c7b\u578b",
        assetsFilterSkill: "Skill",
        assetsFilterAgentsMd: "AGENTS.md",
        assetsFilterRule: "Rule",
        assetTypeSkill: "Skill",
        assetTypeAgentsMd: "AGENTS.md",
        assetTypeRule: "Rule",
        assetStatusActive: "\u5df2\u542f\u7528",
        deployModeCopy: "\u590d\u5236",
        deployModeMerge: "\u5408\u5e76",
        targetsTitle: "\u76ee\u6807",
        targetsUnit: "\u9879",
        targetsEmpty: "\u6682\u65e0\u76ee\u6807\u3002\u521b\u5efa\u4e00\u4e2a\u76ee\u6807\u76ee\u5f55\u6765\u540c\u6b65\u8d44\u4ea7\u3002",
        targetsName: "\u76ee\u6807\u540d\u79f0",
        targetsPath: "\u76ee\u6807\u8def\u5f84",
        targetsBrowse: "\u6d4f\u89c8",
        targetsDeployMode: "\u90e8\u7f72\u6a21\u5f0f",
        settingsTitle: "\u7cfb\u7edf\u8bbe\u7f6e",
        settingsLanguage: "\u8bed\u8a00",
        settingsLanguageZh: "\u4e2d\u6587",
        settingsTheme: "\u4e3b\u9898\u6a21\u5f0f",
        settingsThemeDark: "\u9ed1\u591c\u6a21\u5f0f",
        settingsThemeLight: "\u767d\u5929\u6a21\u5f0f",
        settingsThemeSystem: "\u8ddf\u968f\u7cfb\u7edf",
        settingsData: "\u6570\u636e\u4e0e\u66f4\u65b0",
        settingsDataPath: "\u6570\u636e\u5b58\u50a8\u8def\u5f84",
        settingsBrowse: "\u6d4f\u89c8",
        settingsAutoUpdate: "\u81ea\u52a8\u66f4\u65b0",
        settingsAutoUpdateDesc: "\u5728\u6709\u65b0\u7248\u672c\u65f6\u81ea\u52a8\u4e0b\u8f7d\u66f4\u65b0",
        settingsNotifications: "\u901a\u77e5\u8bbe\u7f6e",
        settingsNotificationsDesc: "\u5141\u8bb8\u5e94\u7528\u53d1\u9001\u901a\u77e5\u63d0\u9192",
        settingsSound: "\u58f0\u97f3\u63d0\u9192",
        settingsAbout: "\u5173\u4e8e",
        settingsVersion: "\u7248\u672c",
        settingsCopyright: "\u00a9 2025 AgentDock. All rights reserved.",
        settingsGeneral: "\u901a\u7528\u8bbe\u7f6e",
        overviewTitle: "\u603b\u89c8",
        overviewTotalSkills: "\u5df2\u542f\u7528\u6280\u80fd",
        overviewTotalRules: "\u5df2\u914d\u7f6e\u89c4\u5219",
        overviewTotalScenarios: "\u573a\u666f\u6570",
        overviewTotalAgents: "Agent \u6570",
        overviewRulesPending: "\u5f85\u5b9a",
        overviewAgentBreakdown: "Agent \u8d44\u4ea7\u5f15\u7528",
        overviewRefSkills: "\u5f15\u7528 Skills",
        overviewRefRules: "\u89c4\u5219",
        overviewStatusEnabled: "\u5df2\u542f\u7528",
        overviewStatusUninstalled: "\u672a\u5b89\u88c5",
        overviewAgentActive: "\u5df2\u6fc0\u6d3b",
        overviewAgentInactive: "\u672a\u6fc0\u6d3b",
        demoSkillTitle: "\u524d\u7aef\u4ee3\u7801\u5ba1\u67e5",
        demoSkillDescription: "\u793a\u4f8b Skill \u8d44\u4ea7\uff0c\u7528\u4e8e\u524d\u7aef\u4ee3\u7801\u5ba1\u67e5\u3002",
        demoSkillContent: "# Frontend Review\n\n## Use case\n\nUse when reviewing React and TypeScript projects.\n\n## Focus areas\n\n- Component structure\n- Type safety\n- Maintainability\n",
        demoAgentsTitle: "\u524d\u7aef AGENTS.md",
        demoAgentsDescription: "\u793a\u4f8b AGENTS.md \u8d44\u4ea7\uff0c\u7528\u4e8e\u524d\u7aef\u9879\u76ee\u3002",
        demoAgentsContent: "# AGENTS.md\n\n## Project rules\n\nFollow the project's directory structure, naming conventions and code style.\n\n## Development notes\n\n- Understand existing implementation before making changes\n- Keep changes focused\n- Avoid introducing unrelated dependencies\n",
        navOverview: "\u603b\u89c8",
        navAssets: "\u8d44\u4ea7",
        navInstall: "\u5b89\u88c5\u6280\u80fd",
        navScenarios: "\u573a\u666f",
        navScenariosCategory: "\u573a\u666f",
        navTargets: "\u76ee\u6807",
        navSettings: "\u7cfb\u7edf\u8bbe\u7f6e",
        navWorkspacesCategory: "\u5de5\u4f5c\u533a",
        navDefaultScenario: "\u9ed8\u8ba4\u573a\u666f",
        navLinkedProjects: "\u5173\u8054\u9879\u76ee",
        actionNewScenario: "\u65b0\u589e\u573a\u666f",
        actionNewProject: "\u65b0\u589e\u9879\u76ee",
        skillsBackup: "\u5f00\u59cb\u5907\u4efd",
        skillsNewAsset: "\u65b0\u5efa\u8d44\u4ea7",
        newAssetTitle: "\u65b0\u5efa\u8d44\u4ea7",
        newAssetType: "\u8d44\u4ea7\u7c7b\u578b",
        newAssetTypeSkillDesc: "\u9762\u5411\u5177\u4f53\u80fd\u529b\u7684 Skill\uff0c\u540c\u6b65\u5230 .agentdock/skills/<id>/SKILL.md",
        newAssetTypeAgentsMdDesc: "\u9879\u76ee\u7ea7 AGENTS.md \u8d44\u4ea7\uff0c\u540c\u6b65\u65f6\u5408\u5e76\u5230\u76ee\u6807 AGENTS.md",
        newAssetTitleLabel: "\u6807\u9898",
        newAssetIdLabel: "\u8d44\u4ea7 ID",
        newAssetDescLabel: "\u63cf\u8ff0",
        newAssetContentLabel: "\u521d\u59cb\u5185\u5bb9",
        newAssetContentHint: "\u8fd9\u4f1a\u6210\u4e3a\u8d44\u4ea7\u521b\u5efa\u65f6\u7684\u521d\u59cb\u6587\u4ef6\u5185\u5bb9\u3002",
        newAssetResetTemplate: "\u6062\u590d\u9ed8\u8ba4\u6a21\u677f",
        newAssetPreview: "\u9884\u89c8",
        newAssetPreviewHint: "\u521b\u5efa\u540e\u4f1a\u51fa\u73b0\u5728\u8d44\u4ea7\u5217\u8868\u9876\u90e8\uff0c\u5e76\u81ea\u52a8\u6253\u5f00\u8be6\u60c5\u62bd\u5c49\u3002",
        newAssetCreate: "\u521b\u5efa\u8d44\u4ea7",
        newAssetValidationTitle: "\u8bf7\u586b\u5199\u8d44\u4ea7\u6807\u9898",
        newAssetValidationId: "\u8d44\u4ea7 ID \u53ea\u80fd\u4f7f\u7528\u5c0f\u5199\u5b57\u6bcd\u3001\u6570\u5b57\u548c\u8fde\u5b57\u7b26",
        newAssetValidationContent: "\u8bf7\u586b\u5199\u521d\u59cb\u5185\u5bb9",
        newAssetCreated: "\u8d44\u4ea7\u201c{name}\u201d\u5df2\u521b\u5efa",
        installTitle: "\u5b89\u88c5\u6280\u80fd",
        installSubtitle: "\u4ece\u4ed3\u5e93\u6d4f\u89c8\u5e76\u5b89\u88c5\u65b0\u6280\u80fd",
        projectsTitle: "\u5173\u8054\u9879\u76ee",
        projectsSubtitle: "\u7ed1\u5b9a\u5230\u4f60\u7684\u9879\u76ee\u4ed3\u5e93",
        scenariosTitle: "\u573a\u666f",
        scenariosEmpty: "\u6682\u65e0\u573a\u666f\u3002",
        scenariosComingSoon: "\u573a\u666f\u8ba9\u4f60\u53ef\u4ee5\u5c06\u8d44\u4ea7\u5206\u7ec4\u5e76\u6309\u573a\u666f\u542f\u7528/\u7981\u7528\u3002\u8fd9\u662f\u7b2c\u4e8c\u9636\u6bb5\u7684\u529f\u80fd\u3002",
        newScenario: "\u65b0\u5efa\u573a\u666f",
        scenarioBuiltIn: "\u5185\u7f6e\u9ed8\u8ba4\u573a\u666f",
        scenarioBuiltInDesc: "\u9ed8\u8ba4\u573a\u666f\u662f AgentDock \u5185\u7f6e\u7684\u5f00\u7bb1\u5373\u7528\u914d\u7f6e\uff0c\u5305\u542b 12 \u4e2a\u5e38\u7528 Skills \u4e0e OpenCode \u4f5c\u4e3a\u9ed8\u8ba4 Agent\u3002",
        scenarioSkills: "\u6280\u80fd",
        scenarioRules: "\u89c4\u5219",
        scenarioAgentFiles: "Agent \u6587\u4ef6",
        scenarioAgent: "Agent",
        scenarioProjects: "\u5173\u8054\u9879\u76ee",
        scenarioRecentActivity: "\u6700\u8fd1\u6d3b\u52a8",
        scenarioActivityNote: "\u573a\u666f\u53d8\u66f4\u540e\uff0c\u5173\u8054\u7684\u9879\u76ee\u4f1a\u5728\u4e0b\u6b21\u540c\u6b65\u65f6\u88ab\u91cd\u65b0\u8ba1\u7b97\u3002\u5982\u679c\u9879\u76ee\u5904\u4e8e\u201c\u5df2\u540c\u6b65\u201d\u72b6\u6001\uff0c\u9700\u8981\u5148\u5728\u9879\u76ee\u4e2d\u70b9\u201c\u672a\u540c\u6b65\u201d\u624d\u4f1a\u91cd\u65b0\u5e94\u7528\u3002",
        scenarioUsedSkills: "\u4f7f\u7528\u7684\u6280\u80fd",
        scenarioAppliedRules: "\u5e94\u7528\u7684\u89c4\u5219",
        scenarioAddSkill: "\u6dfb\u52a0\u6280\u80fd",
        scenarioAddRule: "\u6dfb\u52a0\u89c4\u5219",
        scenarioAddAgentFile: "\u6dfb\u52a0 Agent \u6587\u4ef6",
        scenarioAddAgent: "\u6dfb\u52a0 Agent",
        scenarioEditScenario: "\u7f16\u8f91\u573a\u666f",
        scenarioDeleteScenario: "\u5220\u9664\u573a\u666f",
        scenarioListSubtitle: "\u9884\u8bbe\u7684\u8d44\u4ea7 + Agent \u7ec4\u5408\uff0c\u521b\u5efa\u9879\u76ee\u65f6\u53ef\u76f4\u63a5\u9009\u7528",
        scenarioRemoveAsset: "\u79fb\u9664",
        scenarioBackToScenarios: "\u573a\u666f",
        newScenarioTitle: "\u65b0\u5efa\u573a\u666f",
        newScenarioHelp: "\u573a\u666f\u662f\u4e00\u7ec4\u9884\u8bbe\u914d\u7f6e\uff08\u5173\u8054\u7684 Agent + \u542f\u7528\u7684\u6280\u80fd\uff09\u3002\u4e00\u4e2a Agent \u53ef\u88ab\u591a\u4e2a\u573a\u666f\u5171\u7528\u3002",
        newScenarioName: "\u573a\u666f\u540d\u79f0",
        newScenarioDescPlaceholder: "\u63cf\u8ff0\u6b64\u573a\u666f\u7684\u7528\u9014\u2026",
        newScenarioPreviewHint: "\u573a\u666f\u521b\u5efa\u540e\u4f1a\u51fa\u73b0\u5728\u4fa7\u680f\u201c\u573a\u666f\u201d\u5206\u7c7b\u4e0b\u3002",
        newScenarioDescLabel: "\u63cf\u8ff0",
        newScenarioCountSuffix: "\u5171",
        newScenarioItemSuffix: "\u9879\u8d44\u4ea7",
        scenarioNotFound: "\u573a\u666f\u672a\u627e\u5230",
        breadcrumbAriaLabel: "\u9762\u5305\u5c51",
        scenarioNoProjects: "\u6682\u65e0\u5173\u8054\u9879\u76ee",
        scenarioBadgeLabel: "\u573a\u666f",
        rulesTitle: "\u89c4\u5219",
        rulesEmpty: "\u6682\u65e0\u89c4\u5219\u3002\u521b\u5efa\u793a\u4f8b\u89c4\u5219\u5f00\u59cb\u4f7f\u7528\u3002",
        newDemoRule: "\u521b\u5efa\u793a\u4f8b\u89c4\u5219",
        toastRuleNameRequired: "\u8bf7\u586b\u5199\u89c4\u5219\u540d\u79f0",
        toastScenarioNameRequired: "\u8bf7\u586b\u5199\u573a\u666f\u540d\u79f0",
        toastScenarioCreated: "\u573a\u666f \u201c{name}\u201d \u5df2\u521b\u5efa",
        severityError: "\u9519\u8bef",
        severityWarning: "\u8b66\u544a",
        severityInfo: "\u63d0\u793a",
        assetPickerTitle: "\u6dfb\u52a0\u8d44\u4ea7",
        assetPickerEmpty: "\u6682\u65e0\u53ef\u6dfb\u52a0\u7684\u8d44\u4ea7",
        assetPickerAlreadyAdded: "\u5df2\u6dfb\u52a0",
        savedSuccess: "\u4fdd\u5b58\u6210\u529f",
        saveFailed: "\u4fdd\u5b58\u5931\u8d25",
        panelVersion: "\u7248\u672c",
        panelSynced: "\u5df2\u540c\u6b65",
        assetView: "\u8d44\u4ea7\u89c6\u56fe",
        panelTabOverview: "\u6982\u89c8",
        panelTabContent: "\u5185\u5bb9",
        panelTabHistory: "\u5386\u53f2",
        panelFieldId: "ID",
        panelFieldType: "\u7c7b\u578b",
        panelFieldVersion: "\u7248\u672c",
        panelFieldTags: "\u6807\u7b7e",
        panelFieldPath: "\u8def\u5f84",
        panelFieldTitle: "\u6807\u9898",
        panelFieldDescription: "\u63cf\u8ff0",
        panelNoTags: "\u6682\u672a\u652f\u6301\u6807\u7b7e",
        assetContent: "\u5185\u5bb9",
        panelContentStats: "{fileName} \u00b7 {lines} \u884c \u00b7 {characters} \u5b57\u7b26",
        panelHistoryDesc: "\u6bcf\u6b21\u4fdd\u5b58\u90fd\u4f1a\u81ea\u52a8\u521b\u5efa\u672c\u5730\u5feb\u7167\uff0c\u53ef\u67e5\u770b\u4e0e\u56de\u6eda",
        noSnapshotsYet: "\u8fd8\u6ca1\u6709\u5feb\u7167",
        snapshotMessageBeforeAssetUpdate: "\u6bcf\u6b21\u4fdd\u5b58\u90fd\u4f1a\u81ea\u52a8\u521b\u5efa\u672c\u5730\u5feb\u7167",
        snapshotRestored: "\u5feb\u7167\u6062\u590d\u6210\u529f",
        snapshotRestoreFailed: "\u5feb\u7167\u6062\u590d\u5931\u8d25",
        deleteAsset: "\u5220\u9664\u8d44\u4ea7",
        confirmDeleteAsset: "\u786e\u5b9a\u8981\u5220\u9664\u6b64\u8d44\u4ea7\u5417\uff1f",
        assetDeleted: "\u8d44\u4ea7\u5df2\u5220\u9664",
        assetDeleteFailed: "\u8d44\u4ea7\u5220\u9664\u5931\u8d25",
        saveAndSnapshot: "\u4fdd\u5b58\u5e76\u521b\u5efa\u5feb\u7167",
        targetList: "\u76ee\u6807\u5217\u8868",
        newTarget: "\u65b0\u5efa\u76ee\u6807",
        enabledYes: "\u5df2\u542f\u7528",
        enabledNo: "\u672a\u542f\u7528",
        targetEditor: "\u76ee\u6807\u7f16\u8f91\u5668",
        createTarget: "\u521b\u5efa\u76ee\u6807",
        targetNameLabel: "\u76ee\u6807\u540d\u79f0",
        targetPathLabel: "\u76ee\u6807\u8def\u5f84",
        targetPathHint: "\u76ee\u6807\u76ee\u5f55\u7684\u7edd\u5bf9\u8def\u5f84",
        targetDeployModeLabel: "\u90e8\u7f72\u6a21\u5f0f",
        targetEnabledLabel: "\u5df2\u542f\u7528",
        targetFormSave: "\u4fdd\u5b58",
        targetFormCreate: "\u521b\u5efa",
        targetFormReset: "\u91cd\u7f6e",
        targetSaved: "\u5df2\u4fdd\u5b58",
        targetCreated: "\u5df2\u521b\u5efa",
        targetDeleted: "\u5df2\u5220\u9664",
        deleteTarget: "\u5220\u9664\u76ee\u6807",
        confirmDeleteTarget: "\u786e\u5b9a\u8981\u5220\u9664\u6b64\u76ee\u6807\u5417\uff1f",
    },
    en: {
        appTitle: "AgentDock",
        currentScope: "Current scope",
        localeLabel: "Language",
        localeEnglish: "English",
        localeChinese: "Chinese",
        newDemoSkill: "New sample Skill",
        newDemoAgents: "New sample AGENTS.md",
        refresh: "Refresh",
        save: "Save",
        restore: "Restore",
        close: "Close",
        cancel: "Cancel",
        toggleEnabled: "Toggle enabled",
        assetsTitle: "Assets",
        assetsUnit: "items",
        assetsList: "Asset list",
        assetsEditor: "Asset editor",
        assetsEmpty: "No assets yet",
        assetsActions: "Actions",
        selectAsset: "Select asset",
        skillsSearchPlaceholder: "Search by name, description, tags...",
        skillsCheckAll: "Check all",
        skillsUpdateAll: "Update all",
        commonTabAll: "All",
        commonTabEnabled: "Enabled",
        commonTabDisabled: "Disabled",
        commonBack: "Back",
        assetsFilterAll: "All types",
        assetsFilterSkill: "Skill",
        assetsFilterAgentsMd: "AGENTS.md",
        assetsFilterRule: "Rule",
        assetTypeSkill: "Skill",
        assetTypeAgentsMd: "AGENTS.md",
        assetTypeRule: "Rule",
        assetStatusActive: "Active",
        deployModeCopy: "Copy",
        deployModeMerge: "Merge",
        targetsTitle: "Targets",
        targetsUnit: "items",
        targetsEmpty: "No targets yet. Create a target directory to sync assets.",
        targetsName: "Target name",
        targetsPath: "Target path",
        targetsBrowse: "Browse",
        targetsDeployMode: "Deploy mode",
        settingsTitle: "Settings",
        settingsLanguage: "Language",
        settingsLanguageZh: "Chinese",
        settingsTheme: "Theme",
        settingsThemeDark: "Dark mode",
        settingsThemeLight: "Light mode",
        settingsThemeSystem: "Follow system",
        settingsData: "Data & updates",
        settingsDataPath: "Data path",
        settingsBrowse: "Browse",
        settingsAutoUpdate: "Auto-update",
        settingsAutoUpdateDesc: "Automatically download updates when available",
        settingsNotifications: "Notifications",
        settingsNotificationsDesc: "Allow the app to send notification reminders",
        settingsSound: "Sound alerts",
        settingsAbout: "About",
        settingsVersion: "Version",
        settingsCopyright: "\u00a9 2025 AgentDock. All rights reserved.",
        settingsGeneral: "General",
        overviewTitle: "Overview",
        overviewTotalSkills: "Enabled skills",
        overviewTotalRules: "Configured rules",
        overviewTotalScenarios: "Scenarios",
        overviewTotalAgents: "Agents",
        overviewRulesPending: "Pending",
        overviewAgentBreakdown: "Agent asset references",
        overviewRefSkills: "Skills",
        overviewRefRules: "Rules",
        overviewStatusEnabled: "Enabled",
        overviewStatusUninstalled: "Uninstalled",
        overviewAgentActive: "Active",
        overviewAgentInactive: "Inactive",
        demoSkillTitle: "Frontend Review",
        demoSkillDescription: "Sample Skill asset for frontend code review.",
        demoSkillContent: "# Frontend Review\n\n## Use case\n\nUse when reviewing React and TypeScript projects.\n\n## Focus areas\n\n- Component structure\n- Type safety\n- Maintainability\n",
        demoAgentsTitle: "Frontend AGENTS.md",
        demoAgentsDescription: "Sample AGENTS.md asset for frontend projects.",
        demoAgentsContent: "# AGENTS.md\n\n## Project rules\n\nFollow the project's directory structure, naming conventions and code style.\n\n## Development notes\n\n- Understand existing implementation before making changes\n- Keep changes focused\n- Avoid introducing unrelated dependencies\n",
        navOverview: "Overview",
        navAssets: "Assets",
        navInstall: "Install Skills",
        navScenarios: "Scenarios",
        navScenariosCategory: "Scenarios",
        navTargets: "Targets",
        navSettings: "Settings",
        navWorkspacesCategory: "Workspaces",
        navDefaultScenario: "Default scenario",
        navLinkedProjects: "Linked projects",
        actionNewScenario: "New scenario",
        actionNewProject: "New project",
        skillsBackup: "Backup now",
        skillsNewAsset: "New asset",
        newAssetTitle: "New asset",
        newAssetType: "Asset type",
        newAssetTypeSkillDesc: "Capability-oriented Skill synced to .agentdock/skills/<id>/SKILL.md",
        newAssetTypeAgentsMdDesc: "Project-level AGENTS.md asset merged into the target AGENTS.md",
        newAssetTitleLabel: "Title",
        newAssetIdLabel: "Asset ID",
        newAssetDescLabel: "Description",
        newAssetContentLabel: "Initial content",
        newAssetContentHint: "This becomes the initial file content when the asset is created.",
        newAssetResetTemplate: "Reset template",
        newAssetPreview: "Preview",
        newAssetPreviewHint: "After creation, the asset is inserted into the list and its detail panel opens automatically.",
        newAssetCreate: "Create asset",
        newAssetValidationTitle: "Please enter an asset title",
        newAssetValidationId: "Asset ID may only contain lowercase letters, numbers, and hyphens",
        newAssetValidationContent: "Please enter initial content",
        newAssetCreated: 'Asset "{name}" created',
        installTitle: "Install Skills",
        installSubtitle: "Browse and install new skills from the registry",
        projectsTitle: "Linked Projects",
        projectsSubtitle: "Link to your project repositories",
        scenariosTitle: "Scenarios",
        scenariosEmpty: "No scenarios yet.",
        scenariosComingSoon: "Scenarios let you group assets and enable/disable them by scenario. This is a Phase 2 feature.",
        newScenario: "New scenario",
        scenarioBuiltIn: "Built-in default scenario",
        scenarioBuiltInDesc: "The default scenario ships out of the box with 12 common Skills and OpenCode as the default Agent.",
        scenarioSkills: "Skills",
        scenarioRules: "Rules",
        scenarioAgentFiles: "Agent files",
        scenarioAgent: "Agent",
        scenarioProjects: "Linked projects",
        scenarioRecentActivity: "Recent activity",
        scenarioActivityNote: "After changing a scenario, linked projects will be recalculated on the next sync. If a project is in the 'synced' state, you need to click 'unsync' in the project first to reapply.",
        scenarioUsedSkills: "Active Skills",
        scenarioAppliedRules: "Applied Rules",
        scenarioAddSkill: "Add skill",
        scenarioAddRule: "Add rule",
        scenarioAddAgentFile: "Add agent file",
        scenarioAddAgent: "Add agent",
        scenarioEditScenario: "Edit scenario",
        scenarioDeleteScenario: "Delete scenario",
        scenarioListSubtitle: "Preset asset and Agent combinations that can be selected directly when creating a project.",
        scenarioRemoveAsset: "Remove",
        scenarioBackToScenarios: "Scenarios",
        newScenarioTitle: "New scenario",
        newScenarioHelp: "A scenario is a preset bundle (default Agent + which skills to enable). After creation, you can attach it to a project.",
        newScenarioName: "Scenario name",
        newScenarioDescPlaceholder: "Describe what this scenario is for...",
        newScenarioPreviewHint: "The scenario will appear under 'Scenarios' in the sidebar after creation.",
        newScenarioDescLabel: "Description",
        newScenarioCountSuffix: "Total",
        newScenarioItemSuffix: "assets",
        scenarioNotFound: "Scenario not found",
        breadcrumbAriaLabel: "Breadcrumb",
        scenarioNoProjects: "No linked projects",
        scenarioBadgeLabel: "Scenario",
        rulesTitle: "Rules",
        rulesEmpty: "No rules yet. Create a sample rule to get started.",
        newDemoRule: "Create sample rule",
        toastRuleNameRequired: "Please fill in the rule name",
        toastScenarioNameRequired: "Please fill in the scenario name",
        toastScenarioCreated: 'Scenario "{name}" created',
        severityError: "Error",
        severityWarning: "Warning",
        severityInfo: "Info",
        assetPickerTitle: "Add asset",
        assetPickerEmpty: "No assets available to add",
        assetPickerAlreadyAdded: "Already added",
        savedSuccess: "Saved successfully",
        saveFailed: "Save failed",
        panelVersion: "Version",
        panelSynced: "Synced",
        assetView: "Asset view",
        panelTabOverview: "Overview",
        panelTabContent: "Content",
        panelTabHistory: "History",
        panelFieldId: "ID",
        panelFieldType: "Type",
        panelFieldVersion: "Version",
        panelFieldTags: "Tags",
        panelFieldPath: "Path",
        panelFieldTitle: "Title",
        panelFieldDescription: "Description",
        panelNoTags: "Tags are not available yet in Phase 1",
        assetContent: "Content",
        panelContentStats: "{fileName} · {lines} lines · {characters} characters",
        panelHistoryDesc: "Each save creates a local snapshot automatically for review and rollback.",
        noSnapshotsYet: "No snapshots yet",
        snapshotMessageBeforeAssetUpdate: "Each save creates a local snapshot automatically.",
        snapshotRestored: "Snapshot restored successfully",
        snapshotRestoreFailed: "Failed to restore snapshot",
        deleteAsset: "Delete asset",
        confirmDeleteAsset: "Are you sure you want to delete this asset?",
        assetDeleted: "Asset deleted",
        assetDeleteFailed: "Failed to delete asset",
        saveAndSnapshot: "Save and create snapshot",
        targetList: "Target list",
        newTarget: "New target",
        enabledYes: "Enabled",
        enabledNo: "Disabled",
        targetEditor: "Target editor",
        createTarget: "Create target",
        targetNameLabel: "Target name",
        targetPathLabel: "Target path",
        targetPathHint: "Absolute path to the target directory",
        targetDeployModeLabel: "Deploy mode",
        targetEnabledLabel: "Enabled",
        targetFormSave: "Save",
        targetFormCreate: "Create",
        targetFormReset: "Reset",
        targetSaved: "Saved",
        targetCreated: "Created",
        targetDeleted: "Deleted",
        deleteTarget: "Delete target",
        confirmDeleteTarget: "Are you sure you want to delete this target?",
    },
};
