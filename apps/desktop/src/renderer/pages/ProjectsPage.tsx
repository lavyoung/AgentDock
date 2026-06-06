import {type JSX, useEffect, useMemo, useState} from "react";

import type {SyncHistoryEntry} from "../../../../../packages/core/src/types/sync";
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
    const scenarios = useAppStore((s) => s.scenarios);
    const targets = useAppStore((s) => s.targets);
    const refreshScenarios = useAppStore((s) => s.refreshScenarios);
    const refreshTargets = useAppStore((s) => s.refreshTargets);
    const resetProjectForm = useAppStore((s) => s.resetProjectForm);
    const toggleSelectedProjectTarget = useAppStore((s) => s.toggleSelectedProjectTarget);
    const pushToast = useAppStore((s) => s.pushToast);
    const [isProjectModalOpen, setIsProjectModalOpen] = useState(false);

    const selectedProject =
        projects.find((project) => project.id === selectedProjectId) ?? projects[0] ?? null;
    const selectedScenario = useMemo(
        () =>
            selectedProject?.defaultScenarioId
                ? scenarios.find((scenario) => scenario.id === selectedProject.defaultScenarioId) ?? null
                : null,
        [scenarios, selectedProject]
    );
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
                                </header>
                                <div className="left-card-body">
                                    {selectedScenario ? (
                                        <>
                                            <div className="projects-note-card">
                                                <p>{t("projectScenarioSummaryDesc")}</p>
                                            </div>
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
                                        </>
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
                                    {selectedProject ? (
                                        <span className="badge badge-gray">
                                            {selectedProject.targetIds.length}
                                        </span>
                                    ) : null}
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
                                                                        {entry.outputs.slice(0, 4).map((output) => (
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

                            </div>
                        </div>
                    </>
                )}
            </div>

            <ProjectModal open={isProjectModalOpen} onClose={() => setIsProjectModalOpen(false)} />
        </div>
    );
}
