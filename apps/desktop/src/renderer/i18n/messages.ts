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
    settingsAgentTitle: string;
    settingsAgentSummaryActive: string;
    settingsAgentSummaryEnabled: string;
    settingsAgentSummaryCustom: string;
    settingsAgentSummarySupported: string;
    settingsAgentActions: string;
    settingsAgentRedetect: string;
    settingsAgentSync: string;
    settingsAgentSyncSuccess: string;
    settingsAgentSyncConflict: string;
    settingsAgentList: string;
    settingsAgentLocations: string;
    settingsAgentLocationsHint: string;
    settingsAgentNoApps: string;
    settingsAgentNoLocations: string;
    settingsAgentKindSkills: string;
    settingsAgentKindAgentsMd: string;
    settingsAgentScopeGlobal: string;
    settingsAgentScopeProject: string;
    settingsAgentExists: string;
    settingsAgentMissing: string;
    settingsAgentOpen: string;
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
    overviewNoEnabledAgents: string;
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
    installCatalogTitle: string;
    installCatalogSubtitle: string;
    installCatalogEmpty: string;
    installActionInstall: string;
    installActionOpen: string;
    installStatusInstalled: string;
    installStatusAvailable: string;
    installOutputLabel: string;
    installStarterReleaseTitle: string;
    installStarterReleaseDesc: string;
    installStarterGuardrailsTitle: string;
    installStarterGuardrailsDesc: string;
    installStarterWorkspaceTitle: string;
    installStarterWorkspaceDesc: string;
    projectsTitle: string;
    projectsSubtitle: string;
    projectsEmpty: string;
    projectsStatsTotal: string;
    projectsStatsLinked: string;
    projectsStatsManual: string;
    projectsStatsPreviewFirst: string;
    newProjectTitle: string;
    newProjectHelp: string;
    projectNameLabel: string;
    projectPathLabel: string;
    projectPathHint: string;
    projectScenarioLabel: string;
    projectScenarioNone: string;
    projectSyncModeLabel: string;
    projectSyncModeManual: string;
    projectSyncModePreviewFirst: string;
    projectAgentLabel: string;
    projectAgentHint: string;
    projectPreview: string;
    projectPreviewHint: string;
    projectCreate: string;
    projectValidationName: string;
    projectValidationPath: string;
    projectCreated: string;
    projectOpen: string;
    projectOpenScenario: string;
    projectCreatedAtLabel: string;
    projectUpdatedAtLabel: string;
    projectScenarioSummary: string;
    projectScenarioSkills: string;
    projectScenarioRules: string;
    projectScenarioAgentFiles: string;
    projectScenarioAgents: string;
    projectNoScenarioLinked: string;
    projectWorkflowTitle: string;
    projectWorkflowDesc: string;
    projectSyncPreviewAction: string;
    projectSyncRunAction: string;
    projectSyncRequiresScenario: string;
    projectSyncRequiresTarget: string;
    projectSyncPreviewReady: string;
    projectSyncRunSuccess: string;
    projectSyncRunConflict: string;
    projectSyncStatusPending: string;
    projectSyncStatusSynced: string;
    projectSyncStatusConflict: string;
    projectSyncLastSynced: string;
    projectSyncTargets: string;
    projectSyncOperations: string;
    projectSyncWarnings: string;
    projectSyncConflicts: string;
    projectSyncConflictReason: string;
    projectSyncConflictPath: string;
    projectSyncWritten: string;
    projectSyncPreviewEmpty: string;
    projectSyncOperationCreate: string;
    projectSyncOperationUpdate: string;
    projectSyncOperationMerge: string;
    projectSyncMatrixTitle: string;
    projectSyncMatrixDesc: string;
    projectSyncMatrixEmpty: string;
    projectSyncMatrixSelected: string;
    projectSyncMatrixNotSelected: string;
    projectSyncHistoryTitle: string;
    projectSyncHistoryDesc: string;
    projectSyncHistoryEmpty: string;
    projectSyncHistorySuccess: string;
    projectSyncHistoryWarning: string;
    projectSyncHistoryOutputs: string;
    projectNamePlaceholder: string;
    projectPathPlaceholder: string;
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
    scenarioAddProject: string;
    scenarioProjectPickerTitle: string;
    scenarioProjectPickerHint: string;
    scenarioProjectPickerEmpty: string;
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
    scenarioNoAgents: string;
    scenarioAgentPickerTitle: string;
    scenarioAgentPickerHint: string;
    scenarioOpenProject: string;
    scenarioBackToScenarios: string;
    newScenarioTitle: string;
    newScenarioHelp: string;
    newScenarioName: string;
    newScenarioNamePlaceholder: string;
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
    assetOpenFailed: string;
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
        settingsAgentTitle: "Agent \u7ba1\u7406",
        settingsAgentSummaryActive: "\u5df2\u6fc0\u6d3b",
        settingsAgentSummaryEnabled: "\u5df2\u542f\u7528\u4f4d\u7f6e",
        settingsAgentSummaryCustom: "\u81ea\u5b9a\u4e49",
        settingsAgentSummarySupported: "\u5df2\u63a5\u5165 Agent",
        settingsAgentActions: "\u64cd\u4f5c",
        settingsAgentRedetect: "\u91cd\u65b0\u68c0\u6d4b",
        settingsAgentSync: "\u540c\u6b65\u8d44\u4ea7",
        settingsAgentSyncSuccess: "\u5df2\u5411 {locations} \u4e2a\u4f4d\u7f6e\u540c\u6b65 {skills} \u4e2a Skills \u548c {agentsMd} \u4e2a AGENTS.md \u8d44\u4ea7\u3002",
        settingsAgentSyncConflict: "\u5176\u4e2d\u6709 {count} \u4e2a\u6258\u7ba1\u533a\u5757\u51b2\u7a81\u9700\u8981\u624b\u52a8\u5904\u7406\u3002",
        settingsAgentList: "Agent \u5217\u8868",
        settingsAgentLocations: "\u6258\u7ba1\u4f4d\u7f6e",
        settingsAgentLocationsHint: "\u57fa\u4e8e\u5f53\u524d\u76ee\u6807\u548c\u672c\u5730\u5de5\u4f5c\u533a\u626b\u63cf Agent \u5de5\u4f5c\u533a\u6839\u76ee\u5f55\uff0c\u540c\u6b65\u65f6\u4f1a\u518d\u63a8\u5bfc Skills / AGENTS.md \u7684\u5177\u4f53\u4f4d\u7f6e\u3002",
        settingsAgentNoApps: "\u5f53\u524d\u8fd8\u6ca1\u6709\u53ef\u7ba1\u7406\u7684 Agent \u5e94\u7528\u3002",
        settingsAgentNoLocations: "\u8fd8\u6ca1\u6709\u68c0\u6d4b\u5230\u4efb\u4f55\u6258\u7ba1\u4f4d\u7f6e\uff0c\u53ef\u4ee5\u5148\u70b9\u201c\u91cd\u65b0\u68c0\u6d4b\u201d\u3002",
        settingsAgentKindSkills: "Skills",
        settingsAgentKindAgentsMd: "AGENTS.md",
        settingsAgentScopeGlobal: "\u5168\u5c40",
        settingsAgentScopeProject: "\u9879\u76ee",
        settingsAgentExists: "\u5df2\u5b58\u5728",
        settingsAgentMissing: "\u5f85\u521b\u5efa",
        settingsAgentOpen: "\u6253\u5f00",
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
        overviewNoEnabledAgents: "\u8fd8\u6ca1\u6709\u542f\u7528\u4efb\u4f55 Agent\u3002\u8bf7\u5148\u5728\u7cfb\u7edf\u8bbe\u7f6e\u4e2d\u542f\u7528\u5e76\u914d\u7f6e Agent \u6839\u76ee\u5f55\u3002",
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
        installCatalogTitle: "\u5165\u95e8\u8d44\u4ea7\u5e93",
        installCatalogSubtitle: "\u5148\u7528\u51e0\u4e2a\u5e38\u7528 starter assets \u628a\u672c\u5730 Registry \u586b\u8d77\u6765\uff0c\u5f8c\u7eed\u518d\u63a5\u5165\u771f\u6b63\u7684\u5e02\u573a/\u4ed3\u5e93\u6d41\u7a0b\u3002",
        installCatalogEmpty: "\u6240\u6709 starter assets \u90fd\u5df2\u7ecf\u5b89\u88c5\u5230\u672c\u5730 Registry \u4e86\u3002",
        installActionInstall: "\u5b89\u88c5",
        installActionOpen: "\u6253\u5f00\u8d44\u4ea7",
        installStatusInstalled: "\u5df2\u5b89\u88c5",
        installStatusAvailable: "\u53ef\u5b89\u88c5",
        installOutputLabel: "\u8f93\u51fa\u4f4d\u7f6e",
        installStarterReleaseTitle: "\u53d1\u7248\u51c6\u5907\u68c0\u67e5",
        installStarterReleaseDesc: "\u9762\u5411\u7248\u672c\u53d1\u5e03\u524d\u7684\u6700\u540e\u68c0\u67e5\uff0c\u8986\u76d6 changelog\u3001risk review \u548c rollback \u63d0\u9192\u3002",
        installStarterGuardrailsTitle: "\u4ed3\u5e93\u62a4\u680f",
        installStarterGuardrailsDesc: "\u7528\u4e8e\u957f\u671f\u9879\u76ee\u7684\u4ee3\u7801\u53d8\u66f4\u62a4\u680f\uff0c\u5f3a\u8c03\u5c0f\u6b65\u63d0\u4ea4\u3001\u53ef\u9a8c\u8bc1\u548c\u4e0d\u7834\u574f\u73b0\u6709\u7ed3\u6784\u3002",
        installStarterWorkspaceTitle: "\u5de5\u4f5c\u533a AGENTS.md",
        installStarterWorkspaceDesc: "\u4e00\u4e2a\u4f5c\u4e3a\u9879\u76ee\u7ea7\u57fa\u7ebf\u7684 AGENTS.md starter\uff0c\u9002\u5408\u5728 sync preview \u524d\u5148\u5efa\u7acb\u6258\u7ba1\u533a\u5757\u3002",
        projectsTitle: "\u5173\u8054\u9879\u76ee",
        projectsSubtitle: "\u7ed1\u5b9a\u5230\u4f60\u7684\u9879\u76ee\u4ed3\u5e93",
        projectsEmpty: "\u8fd8\u6ca1\u6709\u9879\u76ee\uff0c\u5148\u521b\u5efa\u4e00\u4e2a\u5de5\u4f5c\u533a\u6765\u627f\u63a5\u573a\u666f\u548c\u76ee\u6807\u3002",
        projectsStatsTotal: "\u9879\u76ee\u603b\u6570",
        projectsStatsLinked: "\u5df2\u5173\u8054\u573a\u666f",
        projectsStatsManual: "\u624b\u52a8\u540c\u6b65",
        projectsStatsPreviewFirst: "\u9884\u89c8\u540e\u540c\u6b65",
        newProjectTitle: "\u65b0\u5efa\u9879\u76ee",
        newProjectHelp: "\u9879\u76ee\u4f1a\u8bb0\u5f55\u672c\u5730\u8def\u5f84\u3001\u9ed8\u8ba4\u573a\u666f\u4e0e\u540c\u6b65\u6a21\u5f0f\uff0c\u65b9\u4fbf\u540e\u7eed\u9884\u89c8\u548c\u540c\u6b65\u3002",
        projectNameLabel: "\u9879\u76ee\u540d\u79f0",
        projectPathLabel: "\u672c\u5730\u8def\u5f84",
        projectPathHint: "\u586b\u5199\u9879\u76ee\u6839\u76ee\u5f55\u7684\u7edd\u5bf9\u8def\u5f84",
        projectScenarioLabel: "\u9ed8\u8ba4\u573a\u666f",
        projectScenarioNone: "\u6682\u4e0d\u5173\u8054",
        projectSyncModeLabel: "\u540c\u6b65\u6a21\u5f0f",
        projectSyncModeManual: "\u624b\u52a8\u540c\u6b65",
        projectSyncModePreviewFirst: "\u5148\u9884\u89c8\u518d\u540c\u6b65",
        projectAgentLabel: "Agent",
        projectAgentHint: "\u7b2c\u4e00\u9636\u6bb5\u5148\u4fdd\u7559 Agent \u4f4d\u7f6e\uff0c\u540e\u7eed\u518d\u63a5\u5165\u771f\u5b9e\u9009\u62e9\u5668\u3002",
        projectPreview: "\u9884\u89c8",
        projectPreviewHint: "\u521b\u5efa\u540e\u4f1a\u51fa\u73b0\u5728\u4fa7\u680f\u5de5\u4f5c\u533a\u548c Projects \u9875\u9762\u4e2d\u3002",
        projectCreate: "\u521b\u5efa\u9879\u76ee",
        projectValidationName: "\u8bf7\u586b\u5199\u9879\u76ee\u540d\u79f0",
        projectValidationPath: "\u8bf7\u586b\u5199\u9879\u76ee\u8def\u5f84",
        projectCreated: "\u9879\u76ee\u201c{name}\u201d\u5df2\u521b\u5efa",
        projectOpen: "\u6253\u5f00",
        projectOpenScenario: "\u6253\u5f00\u573a\u666f",
        projectCreatedAtLabel: "\u521b\u5efa\u65f6\u95f4",
        projectUpdatedAtLabel: "\u66f4\u65b0\u65f6\u95f4",
        projectScenarioSummary: "\u5173\u8054\u573a\u666f\u6982\u89c8",
        projectScenarioSkills: "\u6280\u80fd",
        projectScenarioRules: "\u89c4\u5219",
        projectScenarioAgentFiles: "Agent \u6587\u4ef6",
        projectScenarioAgents: "Agent",
        projectNoScenarioLinked: "\u8fd8\u6ca1\u6709\u5173\u8054\u573a\u666f\uff0c\u8fd9\u4e2a\u9879\u76ee\u76ee\u524d\u53ea\u4f5c\u4e3a\u672c\u5730\u5de5\u4f5c\u533a\u8bb0\u5f55\u3002",
        projectWorkflowTitle: "\u540c\u6b65\u95ed\u73af",
        projectWorkflowDesc: "\u9879\u76ee\u7528\u6765\u627f\u63a5\u573a\u666f\u548c\u76ee\u6807\u7684\u771f\u5b9e\u95ed\u73af\u3002\u73b0\u5728\u53ef\u4ee5\u5148\u5728\u8fd9\u91cc\u9884\u89c8\u540c\u6b65\u8ba1\u5212\uff0c\u518d\u624b\u52a8\u6267\u884c\u540c\u6b65\u3002",
        projectSyncPreviewAction: "\u9884\u89c8\u540c\u6b65",
        projectSyncRunAction: "\u6267\u884c\u540c\u6b65",
        projectSyncRequiresScenario: "\u8bf7\u5148\u4e3a\u9879\u76ee\u5173\u8054\u4e00\u4e2a\u573a\u666f\u3002",
        projectSyncRequiresTarget: "\u8bf7\u5148\u5728 Sync Matrix \u4e2d\u9009\u62e9\u81f3\u5c11\u4e00\u4e2a\u76ee\u6807\u3002",
        projectSyncPreviewReady: "\u540c\u6b65\u9884\u89c8\u5df2\u751f\u6210\u3002",
        projectSyncRunSuccess: "\u5df2\u5199\u5165 {written} \u4e2a\u540c\u6b65\u64cd\u4f5c\u3002",
        projectSyncRunConflict: "\u5176\u4e2d\u6709 {count} \u4e2a AGENTS.md \u6258\u7ba1\u533a\u5757\u51b2\u7a81\u9700\u8981\u624b\u52a8\u5904\u7406\u3002",
        projectSyncStatusPending: "\u5f85\u540c\u6b65",
        projectSyncStatusSynced: "\u5df2\u540c\u6b65",
        projectSyncStatusConflict: "\u6709\u51b2\u7a81",
        projectSyncLastSynced: "\u4e0a\u6b21\u540c\u6b65",
        projectSyncTargets: "\u76ee\u6807",
        projectSyncOperations: "\u64cd\u4f5c",
        projectSyncWarnings: "\u63d0\u9192",
        projectSyncConflicts: "\u51b2\u7a81",
        projectSyncConflictReason: "\u539f\u56e0",
        projectSyncConflictPath: "\u8f93\u51fa\u8def\u5f84",
        projectSyncWritten: "\u5df2\u5199\u5165",
        projectSyncPreviewEmpty: "\u8fd8\u6ca1\u6709\u751f\u6210\u9884\u89c8\u3002\u5148\u70b9\u201c\u9884\u89c8\u540c\u6b65\u201d\u770b\u770b\u8981\u5199\u5230\u54ea\u4e9b\u76ee\u6807\u3002",
        projectSyncOperationCreate: "\u521b\u5efa",
        projectSyncOperationUpdate: "\u66f4\u65b0",
        projectSyncOperationMerge: "\u5408\u5e76",
        projectSyncMatrixTitle: "\u540c\u6b65\u77e9\u9635",
        projectSyncMatrixDesc: "\u4e3a\u8fd9\u4e2a\u9879\u76ee\u9009\u51fa\u9884\u89c8\u6216\u6267\u884c\u540c\u6b65\u65f6\u8981\u5305\u542b\u7684\u76ee\u6807\u3002",
        projectSyncMatrixEmpty: "\u8fd8\u6ca1\u6709\u53ef\u9009\u7684\u76ee\u6807\uff0c\u53ef\u4ee5\u5148\u5230\u300c\u76ee\u6807\u300d\u9875\u9762\u6dfb\u52a0\u76ee\u5f55\u3002",
        projectSyncMatrixSelected: "\u5df2\u9009\u4e2d",
        projectSyncMatrixNotSelected: "\u672a\u9009\u4e2d",
        projectSyncHistoryTitle: "\u540c\u6b65\u8bb0\u5f55",
        projectSyncHistoryDesc: "\u4fdd\u7559\u6700\u8fd1\u7684\u624b\u52a8\u540c\u6b65\u7ed3\u679c\uff0c\u65b9\u4fbf\u56de\u770b\u5199\u5165\u60c5\u51b5\u4e0e\u51b2\u7a81\u63d0\u793a\u3002",
        projectSyncHistoryEmpty: "\u8fd8\u6ca1\u6709\u540c\u6b65\u8bb0\u5f55\uff0c\u5148\u6267\u884c\u4e00\u6b21\u540c\u6b65\u540e\u518d\u56de\u6765\u67e5\u770b\u3002",
        projectSyncHistorySuccess: "\u6210\u529f",
        projectSyncHistoryWarning: "\u542b\u63d0\u9192",
        projectSyncHistoryOutputs: "\u8fd1\u671f\u5199\u5165",
        projectNamePlaceholder: "\u4f8b\u5982\uff1aFrontend Review Workspace",
        projectPathPlaceholder: "D:\\Projects\\frontend-review",
        scenariosTitle: "\u573a\u666f",
        scenariosEmpty: "\u6682\u65e0\u573a\u666f\u3002",
        scenariosComingSoon: "\u573a\u666f\u8ba9\u4f60\u53ef\u4ee5\u5c06\u8d44\u4ea7\u5206\u7ec4\u5e76\u6309\u573a\u666f\u542f\u7528/\u7981\u7528\u3002\u8fd9\u662f\u7b2c\u4e8c\u9636\u6bb5\u7684\u529f\u80fd\u3002",
        newScenario: "\u65b0\u5efa\u573a\u666f",
        scenarioBuiltIn: "\u5185\u7f6e\u9ed8\u8ba4\u573a\u666f",
        scenarioBuiltInDesc: "\u9ed8\u8ba4\u573a\u666f\u662f AgentDock \u5185\u7f6e\u7684\u5f00\u7bb1\u5373\u7528\u914d\u7f6e\uff0c\u5305\u542b 12 \u4e2a\u5e38\u7528\u6280\u80fd\uff0c\u5e76\u4f7f\u7528 OpenCode \u4f5c\u4e3a\u9ed8\u8ba4 Agent\u3002",
        scenarioSkills: "\u6280\u80fd",
        scenarioRules: "\u89c4\u5219",
        scenarioAgentFiles: "AGENTS.md \u6587\u4ef6",
        scenarioAgent: "Agent",
        scenarioProjects: "\u5173\u8054\u9879\u76ee",
        scenarioAddProject: "\u5173\u8054\u9879\u76ee",
        scenarioProjectPickerTitle: "\u5173\u8054\u9879\u76ee",
        scenarioProjectPickerHint: "\u9009\u62e9\u4e00\u4e2a\u5de5\u4f5c\u533a\u5173\u8054\u5230\u5f53\u524d\u573a\u666f\u3002\u5982\u679c\u8be5\u9879\u76ee\u5df2\u7ed1\u5b9a\u5230\u5176\u4ed6\u573a\u666f\uff0c\u4f1a\u81ea\u52a8\u5207\u6362\u8fc7\u6765\u3002",
        scenarioProjectPickerEmpty: "\u6682\u65e0\u53ef\u5173\u8054\u9879\u76ee",
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
        scenarioListSubtitle: "\u9884\u8bbe\u7684\u8d44\u4ea7\u4e0e Agent \u7ec4\u5408\uff0c\u521b\u5efa\u9879\u76ee\u65f6\u53ef\u4ee5\u76f4\u63a5\u9009\u7528\u3002",
        scenarioRemoveAsset: "\u79fb\u9664",
        scenarioNoAgents: "\u8fd8\u672a\u9009\u62e9 Agent",
        scenarioAgentPickerTitle: "\u9009\u62e9 Agent",
        scenarioAgentPickerHint: "\u7b2c\u4e00\u9636\u6bb5\u5148\u63d0\u4f9b\u53ef\u7528 Agent \u5217\u8868\uff0c\u540e\u7eed\u518d\u63a5\u5165\u5b8c\u6574\u9002\u914d\u5668\u3002",
        scenarioOpenProject: "\u6253\u5f00\u9879\u76ee",
        scenarioBackToScenarios: "\u573a\u666f",
        newScenarioTitle: "\u65b0\u5efa\u573a\u666f",
        newScenarioHelp: "\u573a\u666f\u662f\u4e00\u7ec4\u9884\u8bbe\u914d\u7f6e\uff08\u5173\u8054\u7684 Agent + \u542f\u7528\u7684\u6280\u80fd\uff09\u3002\u4e00\u4e2a Agent \u53ef\u88ab\u591a\u4e2a\u573a\u666f\u5171\u7528\u3002",
        newScenarioName: "\u573a\u666f\u540d\u79f0",
        newScenarioNamePlaceholder: "\u4f8b\u5982\uff1afrontend-review",
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
        assetOpenFailed: "\u6253\u5f00\u8d44\u4ea7\u5931\u8d25\uff1a{message}",
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
        settingsAgentTitle: "Agent management",
        settingsAgentSummaryActive: "Active",
        settingsAgentSummaryEnabled: "Enabled locations",
        settingsAgentSummaryCustom: "Custom",
        settingsAgentSummarySupported: "Integrated Agents",
        settingsAgentActions: "Actions",
        settingsAgentRedetect: "Re-detect",
        settingsAgentSync: "Sync assets",
        settingsAgentSyncSuccess: "Synced {skills} Skills and {agentsMd} AGENTS.md assets to {locations} locations.",
        settingsAgentSyncConflict: "{count} managed block conflicts need manual review.",
        settingsAgentList: "Agent list",
        settingsAgentLocations: "Managed locations",
        settingsAgentLocationsHint: "Scan the current targets and local workspaces for the Agent workspace root, then derive the concrete Skills and AGENTS.md paths from it during sync.",
        settingsAgentNoApps: "No manageable Agent applications are available yet.",
        settingsAgentNoLocations: "No managed locations have been detected yet. Try re-detecting first.",
        settingsAgentKindSkills: "Skills",
        settingsAgentKindAgentsMd: "AGENTS.md",
        settingsAgentScopeGlobal: "Global",
        settingsAgentScopeProject: "Project",
        settingsAgentExists: "Exists",
        settingsAgentMissing: "Missing",
        settingsAgentOpen: "Open",
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
        overviewNoEnabledAgents: "No Agents are enabled yet. Turn one on and configure its root in Settings first.",
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
        installCatalogTitle: "Starter registry",
        installCatalogSubtitle: "Use a few curated starter assets to seed the local Registry now, then swap this page over to a real market or repository flow later.",
        installCatalogEmpty: "All starter assets are already installed in the local Registry.",
        installActionInstall: "Install",
        installActionOpen: "Open asset",
        installStatusInstalled: "Installed",
        installStatusAvailable: "Available",
        installOutputLabel: "Output",
        installStarterReleaseTitle: "Release Readiness",
        installStarterReleaseDesc: "A final pre-release checklist focused on changelog review, risk validation, and rollback reminders.",
        installStarterGuardrailsTitle: "Repository Guardrails",
        installStarterGuardrailsDesc: "Starter guidance for long-lived repos with an emphasis on small diffs, verification, and preserving structure.",
        installStarterWorkspaceTitle: "Workspace AGENTS.md",
        installStarterWorkspaceDesc: "A project-level AGENTS.md baseline that is useful before wiring full sync preview and managed block flows.",
        projectsTitle: "Linked Projects",
        projectsSubtitle: "Link to your project repositories",
        projectsEmpty: "No projects yet. Create a workspace to connect scenarios and targets.",
        projectsStatsTotal: "Total projects",
        projectsStatsLinked: "Linked to scenario",
        projectsStatsManual: "Manual sync",
        projectsStatsPreviewFirst: "Preview before sync",
        newProjectTitle: "New project",
        newProjectHelp: "Projects capture the local path, default scenario, and sync mode so we can preview and sync consistently later.",
        projectNameLabel: "Project name",
        projectPathLabel: "Local path",
        projectPathHint: "Enter the absolute path to the project root",
        projectScenarioLabel: "Default scenario",
        projectScenarioNone: "Not linked yet",
        projectSyncModeLabel: "Sync mode",
        projectSyncModeManual: "Manual sync",
        projectSyncModePreviewFirst: "Preview before sync",
        projectAgentLabel: "Agent",
        projectAgentHint: "Phase 1 keeps the Agent slot reserved; the real picker will be wired in later.",
        projectPreview: "Preview",
        projectPreviewHint: "After creation, the project appears in the workspace sidebar and the Projects page.",
        projectCreate: "Create project",
        projectValidationName: "Please enter a project name",
        projectValidationPath: "Please enter a project path",
        projectCreated: 'Project "{name}" created',
        projectOpen: "Open",
        projectOpenScenario: "Open scenario",
        projectCreatedAtLabel: "Created at",
        projectUpdatedAtLabel: "Updated at",
        projectScenarioSummary: "Scenario summary",
        projectScenarioSkills: "Skills",
        projectScenarioRules: "Rules",
        projectScenarioAgentFiles: "Agent files",
        projectScenarioAgents: "Agents",
        projectNoScenarioLinked: "No scenario is linked yet, so this project currently acts as a local workspace record only.",
        projectWorkflowTitle: "Sync workflow",
        projectWorkflowDesc: "Projects bridge scenarios and targets. You can now preview the sync plan here first, then manually run the sync.",
        projectSyncPreviewAction: "Preview sync",
        projectSyncRunAction: "Run sync",
        projectSyncRequiresScenario: "Link a scenario to this project before previewing sync.",
        projectSyncRequiresTarget: "Select at least one target in the Sync Matrix before running sync.",
        projectSyncPreviewReady: "Sync preview generated.",
        projectSyncRunSuccess: "Wrote {written} sync operations.",
        projectSyncRunConflict: "{count} AGENTS.md managed block conflicts need manual review.",
        projectSyncStatusPending: "Pending",
        projectSyncStatusSynced: "Synced",
        projectSyncStatusConflict: "Conflict",
        projectSyncLastSynced: "Last synced",
        projectSyncTargets: "Targets",
        projectSyncOperations: "Operations",
        projectSyncWarnings: "Warnings",
        projectSyncConflicts: "Conflicts",
        projectSyncConflictReason: "Reason",
        projectSyncConflictPath: "Output path",
        projectSyncWritten: "Written",
        projectSyncPreviewEmpty: "No preview yet. Generate one first to inspect what will be written to each target.",
        projectSyncOperationCreate: "Create",
        projectSyncOperationUpdate: "Update",
        projectSyncOperationMerge: "Merge",
        projectSyncMatrixTitle: "Sync Matrix",
        projectSyncMatrixDesc: "Choose which targets this project should include when previewing or running sync.",
        projectSyncMatrixEmpty: "No targets are available yet. Add one in the Targets page first.",
        projectSyncMatrixSelected: "Selected",
        projectSyncMatrixNotSelected: "Not selected",
        projectSyncHistoryTitle: "Sync history",
        projectSyncHistoryDesc: "Keep the latest manual sync results here so it is easy to review writes, warnings, and conflicts.",
        projectSyncHistoryEmpty: "No sync history yet. Run a sync once to populate this panel.",
        projectSyncHistorySuccess: "Successful",
        projectSyncHistoryWarning: "Warnings",
        projectSyncHistoryOutputs: "Recent outputs",
        projectNamePlaceholder: "e.g. Frontend Review Workspace",
        projectPathPlaceholder: "D:\\Projects\\frontend-review",
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
        scenarioAddProject: "Link project",
        scenarioProjectPickerTitle: "Link project",
        scenarioProjectPickerHint: "Choose a workspace to associate with this scenario. If the project is already linked to another scenario, it will be moved here.",
        scenarioProjectPickerEmpty: "No projects available to link",
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
        scenarioNoAgents: "No agents selected yet",
        scenarioAgentPickerTitle: "Choose agent",
        scenarioAgentPickerHint: "Phase 1 provides a lightweight list of available Agents; the full adapter picker will come later.",
        scenarioOpenProject: "Open project",
        scenarioBackToScenarios: "Scenarios",
        newScenarioTitle: "New scenario",
        newScenarioHelp: "A scenario is a preset bundle (default Agent + which skills to enable). After creation, you can attach it to a project.",
        newScenarioName: "Scenario name",
        newScenarioNamePlaceholder: "e.g. frontend-review",
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
        assetOpenFailed: 'Failed to open asset: {message}',
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
