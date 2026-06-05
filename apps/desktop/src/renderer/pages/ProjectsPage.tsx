import {type JSX, useEffect, useMemo, useState} from "react";

import type {SyncHistoryEntry, SyncPreviewResult, SyncRunResult} from "../../../../../packages/core/src/types/sync";
import {ProjectModal} from "../components/ProjectModal";
import {useI18n} from "../i18n/useI18n";
import {useAppStore} from "../stores/useAppStore";
import "./Pages.css";

function formatDate(value: string): string {
    try {
        return new Intl.DateTimeFormat(undefined, {
            year: "numeric",
            month: "short",
            day: "numeric",
            hour: "2-digit",
            minute: "2-digit",
        }).format(new Date(value));
    } catch {
        return value;
    }
}

function getProjectSyncStatusClass(status: "pending" | "synced" | "conflict"): string {
    if (status === "synced") {
        return "sync-pill synced";
    }

    if (status === "conflict") {
        return "sync-pill drift";
    }

    return "sync-pill pending";
}

function getProjectSyncStatusLabel(
    t: (key: string) => string,
    status: "pending" | "synced" | "conflict"
): string {
    if (status === "synced") {
        return t("projectSyncStatusSynced");
    }

    if (status === "conflict") {
        return t("projectSyncStatusConflict");
    }

    return t("projectSyncStatusPending");
}

function getOperationBadgeClass(operation: "create" | "update" | "merge"): string {
    if (operation === "update") {
        return "badge badge-blue";
    }

    if (operation === "merge") {
        return "badge badge-orange";
    }

    return "badge badge-green";
}

function getOperationLabel(
    t: (key: string) => string,
    operation: "create" | "update" | "merge"
): string {
    if (operation === "update") {
        return t("projectSyncOperationUpdate");
    }

    if (operation === "merge") {
        return t("projectSyncOperationMerge");
    }

    return t("projectSyncOperationCreate");
}

function isSyncRunResult(preview: SyncPreviewResult | null): preview is SyncRunResult {
    return Boolean(preview && "written_count" in preview && "conflicts" in preview);
}

function getHistoryStatusBadgeClass(status: SyncHistoryEntry["status"]): string {
    if (status === "conflict") {
        return "badge badge-red";
    }

    if (status === "warning") {
        return "badge badge-orange";
    }

    return "badge badge-green";
}

function getHistoryStatusLabel(
    t: (key: string) => string,
    status: SyncHistoryEntry["status"]
): string {
    if (status === "conflict") {
        return t("projectSyncStatusConflict");
    }

    if (status === "warning") {
        return t("projectSyncHistoryWarning");
    }

    return t("projectSyncHistorySuccess");
}

export function ProjectsPage(): JSX.Element {
    const {t} = useI18n();
    const projects = useAppStore((s) => s.projects);
    const selectedProjectId = useAppStore((s) => s.selectedProjectId);
    const selectedProjectSyncPreview = useAppStore((s) => s.selectedProjectSyncPreview);
    const scenarios = useAppStore((s) => s.scenarios);
    const targets = useAppStore((s) => s.targets);
    const openScenario = useAppStore((s) => s.openScenario);
    const refreshScenarios = useAppStore((s) => s.refreshScenarios);
    const refreshTargets = useAppStore((s) => s.refreshTargets);
    const setView = useAppStore((s) => s.setView);
    const resetProjectForm = useAppStore((s) => s.resetProjectForm);
    const previewSelectedProjectSync = useAppStore((s) => s.previewSelectedProjectSync);
    const runSelectedProjectSync = useAppStore((s) => s.runSelectedProjectSync);
    const toggleSelectedProjectTarget = useAppStore((s) => s.toggleSelectedProjectTarget);
    const pushToast = useAppStore((s) => s.pushToast);
    const [isProjectModalOpen, setIsProjectModalOpen] = useState(false);
    const [isPreviewing, setIsPreviewing] = useState(false);
    const [isRunningSync, setIsRunningSync] = useState(false);

    const selectedProject =
        projects.find((project) => project.id === selectedProjectId) ?? projects[0] ?? null;
    const selectedScenario = useMemo(
        () =>
            selectedProject?.defaultScenarioId
                ? scenarios.find((scenario) => scenario.id === selectedProject.defaultScenarioId) ?? null
                : null,
        [scenarios, selectedProject]
    );
    const syncConflicts = isSyncRunResult(selectedProjectSyncPreview)
        ? selectedProjectSyncPreview.conflicts
        : [];

    const linkedScenarioCount = projects.filter((project) => project.defaultScenarioId).length;
    const manualCount = projects.filter((project) => project.syncMode === "manual").length;
    const previewFirstCount = projects.filter((project) => project.syncMode === "preview-first").length;

    useEffect(() => {
        refreshScenarios().catch((error) => pushToast("error", String(error)));
        refreshTargets().catch((error) => pushToast("error", String(error)));
    }, [pushToast, refreshScenarios, refreshTargets]);

    function openCreateModal(): void {
        resetProjectForm();
        setIsProjectModalOpen(true);
    }

    async function handlePreviewSync(): Promise<void> {
        try {
            setIsPreviewing(true);
            await previewSelectedProjectSync();
            pushToast("success", t("projectSyncPreviewReady"));
        } catch (error) {
            pushToast("error", String(error));
        } finally {
            setIsPreviewing(false);
        }
    }

    async function handleRunSync(): Promise<void> {
        try {
            setIsRunningSync(true);
            await runSelectedProjectSync();

            const latestPreview = useAppStore.getState().selectedProjectSyncPreview;
            const successMessage = t("projectSyncRunSuccess").replace(
                "{written}",
                String(
                    isSyncRunResult(latestPreview)
                        ? latestPreview.written_count
                        : latestPreview?.operation_count ?? 0
                )
            );

            if (isSyncRunResult(latestPreview) && latestPreview.conflicts.length > 0) {
                pushToast(
                    "error",
                    `${successMessage} ${t("projectSyncRunConflict").replace(
                        "{count}",
                        String(latestPreview.conflicts.length)
                    )}`
                );
                return;
            }

            pushToast("success", successMessage);
        } catch (error) {
            pushToast("error", String(error));
        } finally {
            setIsRunningSync(false);
        }
    }

    return (
        <div className="view page-assets-view">
            <div className="page-topbar">
                <div className="page-topbar-left">
                    <h1 className="page-topbar-title">{t("navLinkedProjects")}</h1>
                    <span className="page-topbar-count">{projects.length}</span>
                </div>
                <div className="page-topbar-actions">
                    <button type="button" className="btn btn-primary" onClick={openCreateModal}>
                        {t("actionNewProject")}
                    </button>
                </div>
            </div>

            <div className="page-body projects-page-body">
                {projects.length === 0 ? (
                    <section className="projects-empty-state">
                        <div className="projects-empty-icon">P</div>
                        <h2>{t("projectsTitle")}</h2>
                        <p>{t("projectsEmpty")}</p>
                        <button type="button" className="btn btn-primary" onClick={openCreateModal}>
                            {t("actionNewProject")}
                        </button>
                    </section>
                ) : (
                    <>
                        <section className="projects-stats-grid">
                            <article className="overview-stat-card">
                                <div className="overview-stat-label">{t("projectsStatsTotal")}</div>
                                <div className="overview-stat-value">{projects.length}</div>
                            </article>
                            <article className="overview-stat-card">
                                <div className="overview-stat-label">{t("projectsStatsLinked")}</div>
                                <div className="overview-stat-value">{linkedScenarioCount}</div>
                            </article>
                            <article className="overview-stat-card">
                                <div className="overview-stat-label">{t("projectsStatsManual")}</div>
                                <div className="overview-stat-value">{manualCount}</div>
                            </article>
                            <article className="overview-stat-card">
                                <div className="overview-stat-label">{t("projectsStatsPreviewFirst")}</div>
                                <div className="overview-stat-value">{previewFirstCount}</div>
                            </article>
                        </section>

                        <div className="projects-layout projects-layout-single">
                            <div className="projects-detail-stack">
                            <section className="left-card">
                                <header className="left-card-header">
                                    <h3>{selectedProject ? selectedProject.name : t("projectsSubtitle")}</h3>
                                </header>
                                <div className="left-card-body">
                                    {selectedProject ? (
                                        <>
                                            <div className="project-hero">
                                                <div className="project-hero-main">
                                                    <h2>{selectedProject.name}</h2>
                                                    <p>{selectedProject.path}</p>
                                                </div>
                                                <div className="project-hero-badges">
                                                    <span className="badge badge-blue">
                                                        {selectedProject.syncMode === "manual"
                                                            ? t("projectSyncModeManual")
                                                            : t("projectSyncModePreviewFirst")}
                                                    </span>
                                                    <span className="badge badge-gray">
                                                        {selectedScenario ? selectedScenario.title || selectedScenario.name : t("projectScenarioNone")}
                                                    </span>
                                                    <span className={getProjectSyncStatusClass(selectedProject.syncStatus)}>
                                                        <span className="pill-dot" />
                                                        {getProjectSyncStatusLabel(t, selectedProject.syncStatus)}
                                                    </span>
                                                </div>
                                            </div>

                                            <div className="project-detail-grid">
                                                <div className="field">
                                                    <label>{t("panelFieldId")}</label>
                                                    <div className="field-readonly">{selectedProject.id}</div>
                                                </div>
                                                <div className="field">
                                                    <label>{t("projectAgentLabel")}</label>
                                                    <div className="field-readonly">{selectedProject.agentLabel}</div>
                                                </div>
                                                <div className="field">
                                                    <label>{t("projectPathLabel")}</label>
                                                    <div className="field-readonly">{selectedProject.path}</div>
                                                </div>
                                                <div className="field">
                                                    <label>{t("projectScenarioLabel")}</label>
                                                    <div className="field-readonly">
                                                        {selectedScenario ? selectedScenario.title || selectedScenario.name : t("projectScenarioNone")}
                                                    </div>
                                                </div>
                                                <div className="field">
                                                    <label>{t("projectCreatedAtLabel")}</label>
                                                    <div className="field-readonly">{formatDate(selectedProject.createdAt)}</div>
                                                </div>
                                                <div className="field">
                                                    <label>{t("projectUpdatedAtLabel")}</label>
                                                    <div className="field-readonly">{formatDate(selectedProject.updatedAt)}</div>
                                                </div>
                                                <div className="field">
                                                    <label>{t("projectSyncLastSynced")}</label>
                                                    <div className="field-readonly">
                                                        {selectedProject.lastSyncedAt ? formatDate(selectedProject.lastSyncedAt) : "-"}
                                                    </div>
                                                </div>
                                            </div>
                                        </>
                                    ) : (
                                        <div className="assets-empty projects-empty-inline">
                                            <p>{t("projectsSubtitle")}</p>
                                        </div>
                                    )}
                                </div>
                            </section>

                            <section className="left-card">
                                <header className="left-card-header">
                                    <h3>{t("projectScenarioSummary")}</h3>
                                    {selectedScenario ? (
                                        <button
                                            type="button"
                                            className="btn btn-secondary btn-sm"
                                            onClick={() => {
                                                setView("scenarios");
                                                void openScenario(selectedScenario.id);
                                            }}
                                        >
                                            {t("projectOpenScenario")}
                                        </button>
                                    ) : null}
                                </header>
                                <div className="left-card-body">
                                    {selectedScenario ? (
                                        <div className="projects-scenario-stats">
                                            <article className="scenario-stat-card">
                                                <div className="scenario-stat-label">{t("projectScenarioSkills")}</div>
                                                <div className="scenario-stat-value">{selectedScenario.skillIds.length}</div>
                                            </article>
                                            <article className="scenario-stat-card">
                                                <div className="scenario-stat-label">{t("projectScenarioRules")}</div>
                                                <div className="scenario-stat-value">{selectedScenario.ruleIds.length}</div>
                                            </article>
                                            <article className="scenario-stat-card">
                                                <div className="scenario-stat-label">{t("projectScenarioAgentFiles")}</div>
                                                <div className="scenario-stat-value">{selectedScenario.agentFileIds.length}</div>
                                            </article>
                                            <article className="scenario-stat-card">
                                                <div className="scenario-stat-label">{t("projectScenarioAgents")}</div>
                                                <div className="scenario-stat-value">{selectedScenario.agentAppIds.length}</div>
                                            </article>
                                        </div>
                                    ) : (
                                        <div className="projects-note-card">
                                            <p>{t("projectNoScenarioLinked")}</p>
                                        </div>
                                    )}
                                </div>
                            </section>

                            <section className="left-card">
                                <header className="left-card-header">
                                    <h3>{t("projectSyncMatrixTitle")}</h3>
                                </header>
                                <div className="left-card-body">
                                    <div className="projects-note-card">
                                        <p>{t("projectSyncMatrixDesc")}</p>
                                    </div>
                                    {targets.length === 0 ? (
                                        <div className="projects-note-card project-sync-empty">
                                            <p>{t("projectSyncMatrixEmpty")}</p>
                                        </div>
                                    ) : selectedProject ? (
                                        <div className="project-target-matrix">
                                            {targets.map((target) => {
                                                const isSelected = selectedProject.targetIds.includes(target.id);
                                                return (
                                                    <button
                                                        key={target.id}
                                                        type="button"
                                                        className={`project-target-row ${isSelected ? "active" : ""} ${target.enabled ? "" : "disabled"}`}
                                                        onClick={() => toggleSelectedProjectTarget(target.id)}
                                                        disabled={!target.enabled}
                                                    >
                                                        <div className="project-target-row-main">
                                                            <div className="project-target-row-title">{target.name}</div>
                                                            <div className="project-target-row-path">{target.path}</div>
                                                        </div>
                                                        <div className="project-target-row-meta">
                                                            <span className={target.deployMode === "copy" ? "badge badge-blue" : "badge badge-orange"}>
                                                                {target.deployMode === "copy" ? t("deployModeCopy") : t("deployModeMerge")}
                                                            </span>
                                                            <span className={target.enabled ? "badge badge-green" : "badge badge-gray"}>
                                                                {target.enabled ? t("enabledYes") : t("enabledNo")}
                                                            </span>
                                                            <span className={getProjectSyncStatusClass(isSelected ? "synced" : "pending")}>
                                                                <span className="pill-dot" />
                                                                {isSelected ? t("projectSyncMatrixSelected") : t("projectSyncMatrixNotSelected")}
                                                            </span>
                                                        </div>
                                                    </button>
                                                );
                                            })}
                                        </div>
                                    ) : (
                                        <div className="projects-note-card project-sync-empty">
                                            <p>{t("projectsSubtitle")}</p>
                                        </div>
                                    )}
                                </div>
                            </section>

                            <section className="left-card">
                                <header className="left-card-header">
                                    <h3>{t("projectSyncHistoryTitle")}</h3>
                                    {selectedProject ? (
                                        <span className="badge badge-gray">
                                            {selectedProject.syncHistory.length}
                                        </span>
                                    ) : null}
                                </header>
                                <div className="left-card-body">
                                    <div className="projects-note-card">
                                        <p>{t("projectSyncHistoryDesc")}</p>
                                    </div>

                                    {selectedProject ? (
                                        selectedProject.syncHistory.length > 0 ? (
                                            <div className="project-sync-history-list">
                                                    {selectedProject.syncHistory.map((entry) => (
                                                        <article
                                                            key={entry.id}
                                                            className="project-sync-history-item"
                                                        >
                                                            <div className="project-sync-history-header">
                                                                <div>
                                                                    <div className="project-sync-history-time">
                                                                        {formatDate(entry.synced_at)}
                                                                    </div>
                                                                    <div className="project-sync-history-meta">
                                                                        {entry.target_count} {t("projectSyncTargets")} ·{" "}
                                                                        {entry.operation_count} {t("projectSyncOperations")}
                                                                    </div>
                                                                </div>
                                                                <span
                                                                    className={getHistoryStatusBadgeClass(
                                                                        entry.status
                                                                    )}
                                                                >
                                                                    {getHistoryStatusLabel(t, entry.status)}
                                                                </span>
                                                            </div>

                                                            <div className="project-sync-history-metrics">
                                                                <span className="project-sync-history-metric">
                                                                    {t("projectSyncWritten")}: {entry.written_count}
                                                                </span>
                                                                <span className="project-sync-history-metric">
                                                                    {t("projectSyncWarnings")}: {entry.warning_count}
                                                                </span>
                                                                <span className="project-sync-history-metric">
                                                                    {t("projectSyncConflicts")}: {entry.conflict_count}
                                                                </span>
                                                            </div>

                                                            {entry.warnings.length > 0 ? (
                                                                <div className="project-sync-history-notes">
                                                                    {entry.warnings.slice(0, 2).map((warning) => (
                                                                        <div
                                                                            key={warning}
                                                                            className="project-sync-history-note warning"
                                                                        >
                                                                            {warning}
                                                                        </div>
                                                                    ))}
                                                                </div>
                                                            ) : null}

                                                            {entry.conflicts.length > 0 ? (
                                                                <div className="project-sync-history-notes">
                                                                    {entry.conflicts.slice(0, 2).map((conflict) => (
                                                                        <div
                                                                            key={`${entry.id}-${conflict.asset_id}-${conflict.output_path}`}
                                                                            className="project-sync-history-note conflict"
                                                                        >
                                                                            <strong>{conflict.asset_name}</strong>
                                                                            <span>{conflict.reason}</span>
                                                                        </div>
                                                                    ))}
                                                                </div>
                                                            ) : null}

                                                            {entry.outputs.length > 0 ? (
                                                                <div className="project-sync-history-outputs">
                                                                    <div className="project-sync-history-label">
                                                                        {t("projectSyncHistoryOutputs")}
                                                                    </div>
                                                                    <div className="project-sync-history-output-list">
                                                                        {entry.outputs.map((output) => (
                                                                            <div
                                                                                key={`${entry.id}-${output.target_id}-${output.asset_id}`}
                                                                                className="project-sync-history-output"
                                                                            >
                                                                                <span className="project-sync-history-output-title">
                                                                                    {output.asset_name} · {output.target_name}
                                                                                </span>
                                                                                <span className="project-sync-history-output-path">
                                                                                    {output.output_path}
                                                                                </span>
                                                                            </div>
                                                                        ))}
                                                                    </div>
                                                                </div>
                                                            ) : null}
                                                        </article>
                                                    ))}
                                                </div>
                                            ) : (
                                                <div className="projects-note-card project-sync-empty">
                                                    <p>{t("projectSyncHistoryEmpty")}</p>
                                                </div>
                                            )
                                        ) : (
                                            <div className="projects-note-card project-sync-empty">
                                                <p>{t("projectsSubtitle")}</p>
                                            </div>
                                        )}
                                    </div>
                                </section>

                                <section className="left-card">
                                    <header className="left-card-header">
                                        <h3>{t("projectWorkflowTitle")}</h3>
                                        {selectedProject ? (
                                            <div className="projects-workflow-actions">
                                                <button
                                                    type="button"
                                                    className="btn btn-secondary btn-sm"
                                                    onClick={() => void handlePreviewSync()}
                                                    disabled={isPreviewing || isRunningSync}
                                                >
                                                    {isPreviewing ? `${t("projectSyncPreviewAction")}...` : t("projectSyncPreviewAction")}
                                                </button>
                                                <button
                                                    type="button"
                                                    className="btn btn-primary btn-sm"
                                                    onClick={() => void handleRunSync()}
                                                    disabled={isRunningSync || isPreviewing}
                                                >
                                                    {isRunningSync ? `${t("projectSyncRunAction")}...` : t("projectSyncRunAction")}
                                                </button>
                                            </div>
                                        ) : null}
                                    </header>
                                    <div className="left-card-body">
                                        <div className="projects-note-card">
                                            <p>{t("projectWorkflowDesc")}</p>
                                        </div>

                                        {selectedProjectSyncPreview ? (
                                            <div className="project-sync-preview">
                                                <div className="projects-scenario-stats">
                                                    <article className="scenario-stat-card">
                                                        <div className="scenario-stat-label">{t("projectSyncTargets")}</div>
                                                        <div className="scenario-stat-value">{selectedProjectSyncPreview.target_count}</div>
                                                    </article>
                                                    <article className="scenario-stat-card">
                                                        <div className="scenario-stat-label">{t("projectSyncOperations")}</div>
                                                        <div className="scenario-stat-value">{selectedProjectSyncPreview.operation_count}</div>
                                                    </article>
                                                    <article className="scenario-stat-card">
                                                        <div className="scenario-stat-label">{t("projectSyncWarnings")}</div>
                                                        <div className="scenario-stat-value">{selectedProjectSyncPreview.warnings.length}</div>
                                                    </article>
                                                    <article className="scenario-stat-card">
                                                        <div className="scenario-stat-label">{t("projectSyncWritten")}</div>
                                                        <div className="scenario-stat-value">
                                                            {isSyncRunResult(selectedProjectSyncPreview)
                                                                ? selectedProjectSyncPreview.written_count
                                                                : 0}
                                                        </div>
                                                    </article>
                                                </div>

                                                {selectedProjectSyncPreview.warnings.length > 0 ? (
                                                    <div className="project-sync-warning-list">
                                                        {selectedProjectSyncPreview.warnings.map((warning) => (
                                                            <div key={warning} className="project-sync-warning-item">
                                                                {warning}
                                                            </div>
                                                        ))}
                                                    </div>
                                                ) : null}

                                                {syncConflicts.length > 0 ? (
                                                    <div className="project-sync-conflict-list" aria-live="polite">
                                                        <div className="project-sync-conflict-summary">
                                                            <span className="badge badge-red">
                                                                {t("projectSyncConflicts")} {syncConflicts.length}
                                                            </span>
                                                            <span className="project-sync-conflict-summary-text">
                                                                {t("projectSyncRunConflict").replace(
                                                                    "{count}",
                                                                    String(syncConflicts.length)
                                                                )}
                                                            </span>
                                                        </div>
                                                        {syncConflicts.map((conflict) => (
                                                            <article
                                                                key={`${conflict.target_id}-${conflict.asset_id}-${conflict.output_path}`}
                                                                className="project-sync-conflict-item"
                                                            >
                                                                <div className="project-sync-conflict-header">
                                                                    <div>
                                                                        <div className="project-sync-item-title">
                                                                            {conflict.asset_name}
                                                                        </div>
                                                                        <div className="project-sync-item-meta">
                                                                            {conflict.target_name} · {conflict.asset_type}
                                                                        </div>
                                                                    </div>
                                                                    <span className="badge badge-red">
                                                                        {t("projectSyncStatusConflict")}
                                                                    </span>
                                                                </div>
                                                                <div className="project-sync-conflict-reason">
                                                                    <strong>{t("projectSyncConflictReason")}</strong>
                                                                    <span>{conflict.reason}</span>
                                                                </div>
                                                                <div className="project-sync-item-path">
                                                                    <strong>{t("projectSyncConflictPath")}</strong>
                                                                    <span>{conflict.output_path}</span>
                                                                </div>
                                                            </article>
                                                        ))}
                                                    </div>
                                                ) : null}

                                                {selectedProjectSyncPreview.items.length === 0 ? (
                                                    <div className="projects-note-card project-sync-empty">
                                                        <p>{t("projectSyncPreviewEmpty")}</p>
                                                    </div>
                                                ) : (
                                                    <div className="project-sync-item-list">
                                                        {selectedProjectSyncPreview.items.map((item) => (
                                                            <article
                                                                key={`${item.target_id}-${item.asset_id}-${item.output_path}`}
                                                                className="project-sync-item"
                                                            >
                                                                <div className="project-sync-item-header">
                                                                    <div>
                                                                        <div className="project-sync-item-title">{item.asset_name}</div>
                                                                        <div className="project-sync-item-meta">
                                                                            {item.target_name} · {item.asset_type}
                                                                        </div>
                                                                    </div>
                                                                    <span className={getOperationBadgeClass(item.operation)}>
                                                                        {getOperationLabel(t, item.operation)}
                                                                    </span>
                                                                </div>
                                                                <div className="project-sync-item-path">{item.output_path}</div>
                                                            </article>
                                                        ))}
                                                    </div>
                                                )}
                                            </div>
                                        ) : (
                                            <div className="projects-note-card project-sync-empty">
                                                <p>{t("projectSyncPreviewEmpty")}</p>
                                            </div>
                                        )}
                                    </div>
                                </section>
                            </div>
                        </div>
                    </>
                )}
            </div>

            <ProjectModal open={isProjectModalOpen} onClose={() => setIsProjectModalOpen(false)} />
        </div>
    );
}
