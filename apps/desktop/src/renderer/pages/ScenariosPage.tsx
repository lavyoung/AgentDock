import {type JSX, useEffect, useState} from "react";

import {listSupportedApplications} from "../../../../../packages/core/src/application/applicationCatalog";
import {useI18n} from "../i18n/useI18n";
import {useAppStore} from "../stores/useAppStore";
import "./Pages.css";

// --- Helper sub-components ---

function isActionKey(key: string): boolean {
    return key === "Enter" || key === " ";
}

type AvailableAgent = {
    id: string;
    name: string;
    description: string;
    enabled: boolean;
};

function useAvailableAgents(): AvailableAgent[] {
    const applications = useAppStore((s) => s.applications);

    if (applications.length > 0) {
        return applications.map((application) => ({
            id: application.id,
            name: application.name,
            description: application.description,
            enabled:
                application.enabled &&
                application.enabled_locations > 0 &&
                application.existing_locations > 0,
        }));
    }

    return listSupportedApplications().map((application) => ({
        id: application.id,
        name: application.name,
        description: application.description,
        enabled: false,
    }));
}

function ScenarioCard({
    scenario,
    onClick,
}: {
    scenario: {id: string; name: string; title: string; description: string; isBuiltIn: boolean; skillIds: string[]; ruleIds: string[]; agentFileIds: string[]};
    onClick: () => void;
}): JSX.Element {
    const {t} = useI18n();
    const total = scenario.skillIds.length + scenario.ruleIds.length + scenario.agentFileIds.length;
    return (
        <div
            className="scenario-card"
            onClick={onClick}
            role="button"
            tabIndex={0}
            onKeyDown={(event) => {
                if (isActionKey(event.key)) {
                    event.preventDefault();
                    onClick();
                }
            }}
        >
            <div className="scenario-card-header">
                <div className="scenario-card-icon scenario-card-icon--default">
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M12 3l1.5 4.5H18l-3.75 2.73 1.43 4.41L12 12l-3.68 2.64 1.43-4.41L6 7.5h4.5L12 3z"/>
                    </svg>
                </div>
                <div className="scenario-card-body">
                    <div className="scenario-card-title">{scenario.title || scenario.name}</div>
                    <div className="scenario-card-id">{scenario.id}</div>
                </div>
            </div>
            {scenario.description && (
                <p className="scenario-card-desc">{scenario.description}</p>
            )}
            <div className="scenario-card-badges">
                <span className="scenario-badge scenario-badge-skills">
                    {t("scenarioSkills")} {scenario.skillIds.length}
                </span>
                <span className="scenario-badge scenario-badge-rules">
                    {t("scenarioRules")} {scenario.ruleIds.length}
                </span>
                <span className="scenario-badge scenario-badge-agent-files">
                    {t("scenarioAgentFiles")} {scenario.agentFileIds.length}
                </span>
            </div>
            <div className="scenario-card-stat">
                {t("newScenarioCountSuffix")} <strong>{total}</strong> {t("newScenarioItemSuffix")}
                {scenario.isBuiltIn && <span className="scenario-built-in-tag">{t("scenarioBuiltIn")}</span>}
            </div>
        </div>
    );
}

function SkillMini({
    name,
    meta,
    tone,
    onRemove,
    showRemove,
}: {
    name: string;
    meta: string;
    tone: "skill" | "agent-file";
    onRemove?: () => void;
    showRemove?: boolean;
}): JSX.Element {
    const {t} = useI18n();

    return (
        <div className="skill-mini">
            <div className={`skill-mini-icon ${tone === "skill" ? "skill-mini-icon-skill" : "skill-mini-icon-agent-file"}`}>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"/>
                </svg>
            </div>
            <div className="skill-mini-body">
                <div className="skill-mini-title">{name}</div>
                <div className="skill-mini-meta">{meta}</div>
            </div>
            {showRemove && onRemove && (
                <button className="skill-mini-remove" onClick={(e) => { e.stopPropagation(); onRemove(); }} aria-label={t("scenarioRemoveAsset")}>
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
                    </svg>
                </button>
            )}
        </div>
    );
}

function SeverityMini({
    title,
    severity,
    onRemove,
    showRemove,
}: {
    title: string;
    severity: "error" | "warning" | "info";
    onRemove?: () => void;
    showRemove?: boolean;
}): JSX.Element {
    const {t} = useI18n();

    return (
        <div className="skill-mini">
            <div className={`skill-mini-icon severity-mini-icon severity-mini-icon-${severity}`}>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
                </svg>
            </div>
            <div className="skill-mini-body">
                <div className="skill-mini-title">{title}</div>
                <div className={`skill-mini-meta severity-mini-meta severity-mini-meta-${severity}`}>{severity}</div>
            </div>
            {showRemove && onRemove && (
                <button className="skill-mini-remove" onClick={(e) => { e.stopPropagation(); onRemove(); }} aria-label={t("scenarioRemoveAsset")}>
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
                    </svg>
                </button>
            )}
        </div>
    );
}

function AgentMini({
    name,
    desc,
    onRemove,
    showRemove,
}: {
    name: string;
    desc: string;
    onRemove?: () => void;
    showRemove?: boolean;
}): JSX.Element {
    const {t} = useI18n();

    return (
        <div className="detail-row">
            <div className="detail-row-icon detail-row-icon-agent">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <rect x="2" y="3" width="20" height="14" rx="2" ry="2"/><line x1="8" y1="21" x2="16" y2="21"/><line x1="12" y1="17" x2="12" y2="21"/>
                </svg>
            </div>
            <div className="detail-row-body">
                <div className="detail-row-title">{name}</div>
                <div className="detail-row-meta">{desc}</div>
            </div>
            {showRemove && onRemove ? (
                <button
                    type="button"
                    className="skill-mini-remove"
                    onClick={onRemove}
                    aria-label={t("scenarioRemoveAsset")}
                >
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <line x1="18" y1="6" x2="6" y2="18"/>
                        <line x1="6" y1="6" x2="18" y2="18"/>
                    </svg>
                </button>
            ) : (
                <div className="detail-row-arrow">
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <polyline points="9 18 15 12 9 6"/>
                    </svg>
                </div>
            )}
        </div>
    );
}

// --- New Scenario Modal ---
function NewScenarioModal({onClose, onCreate}: {onClose: () => void; onCreate: () => void}): JSX.Element {
    const {t} = useI18n();
    const name = useAppStore((s) => s.scenarioName);
    const description = useAppStore((s) => s.scenarioDescription);
    const setName = useAppStore((s) => s.setScenarioName);
    const setDescription = useAppStore((s) => s.setScenarioDescription);

    return (
        <div className="asset-picker">
            <div className="asset-picker-backdrop" onClick={onClose} />
            <div className="asset-picker-panel">
                <div className="asset-picker-header">
                    <span className="asset-picker-title">{t("newScenarioTitle")}</span>
                    <button type="button" className="icon-btn" onClick={onClose} aria-label={t("close")}>
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
                        </svg>
                    </button>
                </div>
                <div className="asset-picker-body">
                    <p className="form-hint form-hint-spaced">{t("newScenarioHelp")}</p>
                    <div className="new-scenario-form">
                        <div className="form-field">
                            <label className="form-label">{t("newScenarioName")}</label>
                            <input
                                className="form-input"
                                type="text"
                                value={name}
                                onChange={(e) => setName(e.target.value)}
                                placeholder={t("newScenarioNamePlaceholder")}
                                autoFocus
                            />
                        </div>
                        <div className="form-field">
                            <label className="form-label">{t("newScenarioDescLabel")}</label>
                            <textarea
                                className="form-textarea"
                                value={description}
                                onChange={(e) => setDescription(e.target.value)}
                                placeholder={t("newScenarioDescPlaceholder")}
                                rows={3}
                            />
                        </div>
                        <div className="form-hint">{t("newScenarioPreviewHint")}</div>
                        <div className="form-actions">
                            <button type="button" className="btn btn-primary" onClick={onCreate}>{t("newScenario")}</button>
                            <button type="button" className="btn btn-ghost" onClick={onClose}>{t("close")}</button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

// --- Asset Picker Modal ---
function AssetPicker({
    field,
    onClose,
}: {
    field: "skillIds" | "ruleIds" | "agentFileIds";
    onClose: () => void;
}): JSX.Element {
    const {t} = useI18n();
    const assets = useAppStore((s) => s.assets);
    const rules = useAppStore((s) => s.rules);
    const selectedScenario = useAppStore((s) => s.selectedScenario);
    const addAssetToScenario = useAppStore((s) => s.addAssetToScenario);

    const fieldLabel = field === "skillIds" ? t("scenarioUsedSkills") : field === "ruleIds" ? t("scenarioAppliedRules") : t("scenarioAgentFiles");

    const availableAssets = field === "skillIds"
        ? assets.filter((a) => a.type === "skill")
        : field === "ruleIds"
            ? rules
            : assets.filter((a) => a.type === "agents-md");

    const selectedIds = selectedScenario?.[field] ?? [];

    return (
        <div className="asset-picker">
            <div className="asset-picker-backdrop" onClick={onClose} />
            <div className="asset-picker-panel">
                <div className="asset-picker-header">
                    <span className="asset-picker-title">{t("assetPickerTitle")} - {fieldLabel}</span>
                    <button type="button" className="icon-btn" onClick={onClose} aria-label={t("close")}>
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
                        </svg>
                    </button>
                </div>
                <div className="asset-picker-body">
                    {availableAssets.length === 0 ? (
                        <div className="asset-picker-empty">{t("assetPickerEmpty")}</div>
                    ) : (
                        availableAssets.map((asset) => {
                            const isAlready = selectedIds.includes(asset.id);
                            return (
                                <div
                                    key={asset.id}
                                    className={`asset-picker-item ${isAlready ? "is-already" : ""}`}
                                    onClick={() => {
                                        if (!isAlready) {
                                            void addAssetToScenario(field, asset.id);
                                            onClose();
                                        }
                                    }}
                                    onKeyDown={(event) => {
                                        if (!isAlready && isActionKey(event.key)) {
                                            event.preventDefault();
                                            void addAssetToScenario(field, asset.id);
                                            onClose();
                                        }
                                    }}
                                    role="button"
                                    tabIndex={0}
                                    aria-disabled={isAlready}
                                >
                                    <div className={`picker-item-icon ${field === "skillIds" ? "picker-item-icon-skill" : field === "ruleIds" ? "picker-item-icon-rule" : "picker-item-icon-agent-file"}`}>
                                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                            <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"/>
                                        </svg>
                                    </div>
                                    <div className="picker-item-body">
                                        <div className="picker-item-title">{asset.title || asset.name}</div>
                                        <div className="picker-item-meta">{asset.name}</div>
                                    </div>
                                    {isAlready && (
                                        <span className="picker-item-added">{t("assetPickerAlreadyAdded")}</span>
                                    )}
                                </div>
                            );
                        })
                    )}
                </div>
            </div>
        </div>
    );
}

function AgentPicker({onClose}: {onClose: () => void}): JSX.Element {
    const {t} = useI18n();
    const selectedScenario = useAppStore((s) => s.selectedScenario);
    const addAgentAppToScenario = useAppStore((s) => s.addAgentAppToScenario);
    const refreshApplications = useAppStore((s) => s.refreshApplications);
    const availableAgents = useAvailableAgents();
    const selectedIds = selectedScenario?.agentAppIds ?? [];

    useEffect(() => {
        void refreshApplications();
    }, [refreshApplications]);

    return (
        <div className="asset-picker">
            <div className="asset-picker-backdrop" onClick={onClose} />
            <div className="asset-picker-panel">
                <div className="asset-picker-header">
                    <span className="asset-picker-title">{t("scenarioAgentPickerTitle")}</span>
                    <button type="button" className="icon-btn" onClick={onClose} aria-label={t("close")}>
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <line x1="18" y1="6" x2="6" y2="18"/>
                            <line x1="6" y1="6" x2="18" y2="18"/>
                        </svg>
                    </button>
                </div>
                <div className="asset-picker-body">
                    <p className="form-hint form-hint-spaced">{t("scenarioAgentPickerHint")}</p>
                    {availableAgents.map((agent) => {
                        const isAlready = selectedIds.includes(agent.id);
                        return (
                            <div
                                key={agent.id}
                                className={`asset-picker-item ${isAlready || !agent.enabled ? "is-already" : ""}`}
                                onClick={() => {
                                    if (!isAlready && agent.enabled) {
                                        void addAgentAppToScenario(agent.id);
                                        onClose();
                                    }
                                }}
                                onKeyDown={(event) => {
                                    if (!isAlready && agent.enabled && isActionKey(event.key)) {
                                        event.preventDefault();
                                        void addAgentAppToScenario(agent.id);
                                        onClose();
                                    }
                                }}
                                role="button"
                                tabIndex={0}
                                aria-disabled={isAlready || !agent.enabled}
                            >
                                <div className="picker-item-icon picker-item-icon-agent">
                                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                        <rect x="2" y="3" width="20" height="14" rx="2" ry="2"/>
                                        <line x1="8" y1="21" x2="16" y2="21"/>
                                        <line x1="12" y1="17" x2="12" y2="21"/>
                                    </svg>
                                </div>
                                <div className="picker-item-body">
                                    <div className="picker-item-title">
                                        {agent.name}
                                    </div>
                                    <div className="picker-item-meta">
                                        {agent.description}
                                    </div>
                                </div>
                                {isAlready ? (
                                    <span className="picker-item-added">{t("assetPickerAlreadyAdded")}</span>
                                ) : !agent.enabled ? (
                                    <span className="picker-item-added">{t("enabledNo")}</span>
                                ) : null}
                            </div>
                        );
                    })}
                </div>
            </div>
        </div>
    );
}

// --- Scenario Detail View ---
function ScenarioDetail(): JSX.Element {
    const {t} = useI18n();
    const selectedScenario = useAppStore((s) => s.selectedScenario);
    const scenarioDetailView = useAppStore((s) => s.scenarioDetailView);
    const assets = useAppStore((s) => s.assets);
    const rules = useAppStore((s) => s.rules);
    const projects = useAppStore((s) => s.projects);
    const refreshApplications = useAppStore((s) => s.refreshApplications);
    const setView = useAppStore((s) => s.setView);
    const openProject = useAppStore((s) => s.openProject);
    const setScenarioDetailView = useAppStore((s) => s.setScenarioDetailView);
    const removeAssetFromScenario = useAppStore((s) => s.removeAssetFromScenario);
    const removeAgentAppFromScenario = useAppStore((s) => s.removeAgentAppFromScenario);
    const openAssetPicker = useAppStore((s) => s.openAssetPicker);
    const saveScenario = useAppStore((s) => s.saveScenario);
    const deleteScenario = useAppStore((s) => s.deleteScenario);
    const scenarioName = useAppStore((s) => s.scenarioName);
    const scenarioDescription = useAppStore((s) => s.scenarioDescription);
    const setScenarioName = useAppStore((s) => s.setScenarioName);
    const setScenarioDescription = useAppStore((s) => s.setScenarioDescription);
    const availableAgents = useAvailableAgents();
    const [showAgentPicker, setShowAgentPicker] = useState(false);

    useEffect(() => {
        void refreshApplications();
    }, [refreshApplications]);

    if (!selectedScenario) return <div className="page-body"><p>{t("scenarioNotFound")}</p></div>;

    const skillAssets = assets.filter((a) => a.type === "skill" && selectedScenario.skillIds.includes(a.id));
    const ruleAssets = rules.filter((r) => selectedScenario.ruleIds.includes(r.id));
    const agentFileAssets = assets.filter((a) => a.type === "agents-md" && selectedScenario.agentFileIds.includes(a.id));
    const linkedProjects = projects.filter((project) => selectedScenario.projectIds.includes(project.id));
    const linkedAgents = availableAgents.filter((agent) => selectedScenario.agentAppIds.includes(agent.id));

    const isEdit = scenarioDetailView === "edit";

    return (
        <div className={`page page-scenarios-view scenario-detail-view ${isEdit ? "scenario-edit-mode" : ""}`}>
            <div className="page-header">
                <nav className="scenario-breadcrumb" aria-label={t("breadcrumbAriaLabel")}>
                    <button type="button" onClick={() => setView("scenarios")}>{t("scenarioBackToScenarios")}</button>
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <polyline points="9 18 15 12 9 6"/>
                    </svg>
                    <span className="scenario-breadcrumb-current">{selectedScenario.title || selectedScenario.name}</span>
                </nav>

                <header className="scenario-hero">
                    <div className="scenario-hero-left">
                        <div className="scenario-hero-icon scenario-card-icon--default">
                            <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                <path d="M12 3l1.5 4.5H18l-3.75 2.73 1.43 4.41L12 12l-3.68 2.64 1.43-4.41L6 7.5h4.5L12 3z"/>
                            </svg>
                        </div>
                        <div className="scenario-hero-content">
                            {isEdit ? (
                                <input
                                    type="text"
                                    className="form-input scenario-hero-input"
                                    value={scenarioName}
                                    onChange={(e) => setScenarioName(e.target.value)}
                                    placeholder={t("newScenarioNamePlaceholder")}
                                />
                            ) : (
                                <h1 className="scenario-hero-title">{selectedScenario.title || selectedScenario.name}</h1>
                            )}
                            <div className="scenario-hero-meta">
                                <span className="scenario-hero-id">{selectedScenario.id}</span>
                                <span className="scenario-badge scenario-badge-skills">{t("scenarioBadgeLabel")}</span>
                                {selectedScenario.isBuiltIn && (
                                    <span className="scenario-built-in-label">{t("scenarioBuiltIn")}</span>
                                )}
                            </div>
                            {isEdit ? (
                                <textarea
                                    className="form-textarea scenario-hero-textarea"
                                    value={scenarioDescription}
                                    onChange={(e) => setScenarioDescription(e.target.value)}
                                    placeholder={t("newScenarioDescPlaceholder")}
                                    rows={4}
                                />
                            ) : (
                                selectedScenario.description && (
                                    <p className="scenario-hero-desc">{selectedScenario.description}</p>
                                )
                            )}
                        </div>
                    </div>
                    <div className="scenario-hero-actions">
                        {isEdit ? (
                            <>
                                <button type="button" className="btn btn-primary btn-sm" onClick={() => { void saveScenario(); setScenarioDetailView("view"); }}>
                                    {t("save")}
                                </button>
                                <button type="button" className="btn btn-ghost btn-sm" onClick={() => setScenarioDetailView("view")}>
                                    {t("close")}
                                </button>
                            </>
                        ) : (
                            <>
                                <button type="button" className="btn btn-secondary btn-sm" onClick={() => setScenarioDetailView("edit")}>
                                    {t("scenarioEditScenario")}
                                </button>
                                {!selectedScenario.isBuiltIn && (
                                    <button type="button" className="btn btn-danger btn-sm" onClick={() => { void deleteScenario(); }}>
                                        {t("scenarioDeleteScenario")}
                                    </button>
                                )}
                            </>
                        )}
                    </div>
                </header>
            </div>

            <div className="page-body">
                {/* Stats row */}
                <div className="stats-grid scenario-stats-row">
                    <div className="scenario-stat-card">
                        <div className="scenario-stat-label">
                            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#3b82f6" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"/>
                            </svg>
                            {t("scenarioSkills")}
                        </div>
                        <div className="scenario-stat-value">{selectedScenario.skillIds.length}</div>
                    </div>
                    <div className="scenario-stat-card">
                        <div className="scenario-stat-label">
                            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#f59e0b" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
                            </svg>
                            {t("scenarioRules")}
                        </div>
                        <div className="scenario-stat-value">{selectedScenario.ruleIds.length}</div>
                    </div>
                    <div className="scenario-stat-card">
                        <div className="scenario-stat-label">
                            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#8b5cf6" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/>
                            </svg>
                            {t("scenarioAgentFiles")}
                        </div>
                        <div className="scenario-stat-value">{selectedScenario.agentFileIds.length}</div>
                    </div>
                    <div className="scenario-stat-card">
                        <div className="scenario-stat-label">
                            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#34d399" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                <rect x="2" y="3" width="20" height="14" rx="2" ry="2"/><line x1="8" y1="21" x2="16" y2="21"/><line x1="12" y1="17" x2="12" y2="21"/>
                            </svg>
                            {t("scenarioAgent")}
                        </div>
                        <div className="scenario-stat-value">{selectedScenario.agentAppIds.length}</div>
                    </div>
                </div>

                {/* Skills section */}
                <section className="left-card">
                    <header className="left-card-header">
                        <h3>
                            <svg className="scenario-section-icon" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#3b82f6" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"/>
                            </svg>
                            {t("scenarioUsedSkills")}
                        </h3>
                        <div className="scenario-section-meta">
                            <span className="scenario-section-count">{selectedScenario.skillIds.length}</span>
                            <button type="button" className="scenario-section-add" onClick={() => openAssetPicker("skillIds")} title={t("scenarioAddSkill")} aria-label={t("scenarioAddSkill")}>
                                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                    <line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/>
                                </svg>
                            </button>
                        </div>
                    </header>
                    <div className="left-card-body">
                        {skillAssets.length > 0 ? (
                            <div className="skill-mini-grid-cols-3">
                                {skillAssets.map((asset) => (
                                    <SkillMini
                                        key={asset.id}
                                        name={asset.title || asset.name}
                                        meta={asset.name}
                                        tone="skill"
                                        showRemove={isEdit}
                                        onRemove={() => { void removeAssetFromScenario("skillIds", asset.id); }}
                                    />
                                ))}
                            </div>
                        ) : null}
                    </div>
                </section>

                {/* Rules section */}
                <section className="left-card">
                    <header className="left-card-header">
                        <h3>
                            <svg className="scenario-section-icon" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#f59e0b" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
                            </svg>
                            {t("scenarioAppliedRules")}
                        </h3>
                        <div className="scenario-section-meta">
                            <span className="scenario-section-count">{selectedScenario.ruleIds.length}</span>
                            <button type="button" className="scenario-section-add" onClick={() => openAssetPicker("ruleIds")} title={t("scenarioAddRule")} aria-label={t("scenarioAddRule")}>
                                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                    <line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/>
                                </svg>
                            </button>
                        </div>
                    </header>
                    <div className="left-card-body">
                        {ruleAssets.length > 0 ? (
                            <div className="skill-mini-grid-cols-2">
                                {ruleAssets.map((rule) => (
                                    <SeverityMini
                                        key={rule.id}
                                        title={rule.title || rule.name}
                                        severity={rule.severity}
                                        showRemove={isEdit}
                                        onRemove={() => { void removeAssetFromScenario("ruleIds", rule.id); }}
                                    />
                                ))}
                            </div>
                        ) : null}
                    </div>
                </section>

                {/* Agent files section */}
                <section className="left-card">
                    <header className="left-card-header">
                        <h3>
                            <svg className="scenario-section-icon" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#8b5cf6" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/>
                            </svg>
                            {t("scenarioAgentFiles")}
                        </h3>
                        <div className="scenario-section-meta">
                            <span className="scenario-section-count">{selectedScenario.agentFileIds.length}</span>
                            <button type="button" className="scenario-section-add" onClick={() => openAssetPicker("agentFileIds")} title={t("scenarioAddAgentFile")} aria-label={t("scenarioAddAgentFile")}>
                                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                    <line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/>
                                </svg>
                            </button>
                        </div>
                    </header>
                    <div className="left-card-body">
                        {agentFileAssets.length > 0 ? (
                            <div className="skill-mini-grid-cols-2">
                                {agentFileAssets.map((asset) => (
                                    <SkillMini
                                        key={asset.id}
                                        name={asset.title || asset.name}
                                        meta={asset.name}
                                        tone="agent-file"
                                        showRemove={isEdit}
                                        onRemove={() => { void removeAssetFromScenario("agentFileIds", asset.id); }}
                                    />
                                ))}
                            </div>
                        ) : null}
                    </div>
                </section>

                {/* Agents section */}
                <section className="left-card">
                    <header className="left-card-header">
                        <h3>
                            <svg className="scenario-section-icon" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#34d399" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                <rect x="2" y="3" width="20" height="14" rx="2" ry="2"/><line x1="8" y1="21" x2="16" y2="21"/><line x1="12" y1="17" x2="12" y2="21"/>
                            </svg>
                            {t("scenarioAgent")}
                        </h3>
                        <div className="scenario-section-meta">
                            <span className="scenario-section-count">{selectedScenario.agentAppIds.length}</span>
                            <button type="button" className="scenario-section-add" title={t("scenarioAddAgent")} aria-label={t("scenarioAddAgent")} onClick={() => setShowAgentPicker(true)}>
                                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                    <line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/>
                                </svg>
                            </button>
                        </div>
                    </header>
                    <div className="left-card-body scenario-section-stack">
                        {linkedAgents.length > 0 ? (
                            linkedAgents.map((agent) => (
                                <AgentMini
                                    key={agent.id}
                                    name={agent.name}
                                    desc={agent.description}
                                    showRemove={isEdit}
                                    onRemove={() => { void removeAgentAppFromScenario(agent.id); }}
                                />
                            ))
                        ) : (
                            <div className="scenario-empty-copy">{t("scenarioNoAgents")}</div>
                        )}
                    </div>
                </section>

                {/* Projects section */}
                <section className="left-card">
                    <header className="left-card-header">
                        <h3>{t("scenarioProjects")}</h3>
                        <span className="scenario-section-count">{linkedProjects.length}</span>
                    </header>
                    <div className="left-card-body scenario-section-stack">
                        {linkedProjects.length === 0 ? (
                            <div className="scenario-empty-copy">{t("scenarioNoProjects")}</div>
                        ) : (
                            linkedProjects.map((project) => (
                                <div key={project.id} className="detail-row">
                                    <div className="detail-row-icon detail-row-icon-project">
                                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                            <path d="M3 7l9-4 9 4-9 4-9-4z"/>
                                            <path d="M3 17l9 4 9-4"/>
                                            <path d="M3 12l9 4 9-4"/>
                                        </svg>
                                    </div>
                                    <div className="detail-row-body">
                                        <div className="detail-row-title">{project.name}</div>
                                        <div className="detail-row-meta">{project.path}</div>
                                    </div>
                                    <button
                                        type="button"
                                        className="btn btn-ghost btn-sm"
                                        onClick={() => openProject(project.id)}
                                    >
                                        {t("scenarioOpenProject")}
                                    </button>
                                </div>
                            ))
                        )}
                    </div>
                </section>

                {/* Activity note */}
                <section className="left-card">
                    <header className="left-card-header">
                        <h3>{t("scenarioRecentActivity")}</h3>
                    </header>
                    <div className="left-card-body scenario-activity-copy">
                        {t("scenarioActivityNote")}
                    </div>
                </section>
            </div>

            {showAgentPicker ? (
                <AgentPicker onClose={() => setShowAgentPicker(false)} />
            ) : null}
        </div>
    );
}

// --- Main ScenariosPage ---
export function ScenariosPage(): JSX.Element {
    const {t} = useI18n();
    const view = useAppStore((s) => s.view);
    const scenarios = useAppStore((s) => s.scenarios);
    const selectedScenario = useAppStore((s) => s.selectedScenario);
    const assetPickerOpen = useAppStore((s) => s.assetPickerOpen);
    const assetPickerField = useAppStore((s) => s.assetPickerField);
    const refreshScenarios = useAppStore((s) => s.refreshScenarios);
    const refreshApplications = useAppStore((s) => s.refreshApplications);
    const openScenario = useAppStore((s) => s.openScenario);
    const saveScenario = useAppStore((s) => s.saveScenario);
    const closeAssetPicker = useAppStore((s) => s.closeAssetPicker);
    const resetScenarioForm = useAppStore((s) => s.resetScenarioForm);

    const [showNewModal, setShowNewModal] = useState(false);

    useEffect(() => {
        void refreshScenarios();
        void refreshApplications();
    }, [refreshApplications, refreshScenarios]);

    // Detail view
    if (selectedScenario && view === "scenarios") {
        return (
            <>
                <ScenarioDetail />
                {assetPickerOpen && assetPickerField && (
                    <AssetPicker field={assetPickerField} onClose={() => closeAssetPicker()} />
                )}
            </>
        );
    }

    // List view
    return (
        <div className="page page-scenarios-view">
            <div className="page-header scenarios-list-header">
                <div className="scenarios-list-header-row">
                    <div>
                        <h1 className="scenarios-list-title">{t("scenariosTitle")}</h1>
                        <p className="scenarios-list-subtitle">{t("scenarioListSubtitle")}</p>
                    </div>
                    <button type="button" className="btn btn-primary" onClick={() => {
                        resetScenarioForm();
                        setShowNewModal(true);
                    }}>
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/>
                        </svg>
                        {t("newScenario")}
                    </button>
                </div>
            </div>

            <div className="page-body">
                {scenarios.length === 0 ? (
                    <div className="placeholder placeholder-spacious">
                        <div className="placeholder-icon">O</div>
                        <h3>{t("scenariosTitle")}</h3>
                        <p className="empty">{t("scenariosEmpty")}</p>
                        <p className="hint hint-centered">
                            {t("scenariosComingSoon")}
                        </p>
                    </div>
                ) : (
                    <div className="scenarios-grid">
                        {scenarios.map((scenario) => (
                            <ScenarioCard
                                key={scenario.id}
                                scenario={scenario}
                                onClick={() => { void openScenario(scenario.id); }}
                            />
                        ))}
                    </div>
                )}
            </div>

            {showNewModal && (
                <NewScenarioModal
                    onClose={() => setShowNewModal(false)}
                    onCreate={() => {
                        void saveScenario();
                        setShowNewModal(false);
                    }}
                />
            )}
            {assetPickerOpen && assetPickerField && (
                <AssetPicker field={assetPickerField} onClose={() => closeAssetPicker()} />
            )}
        </div>
    );
}
