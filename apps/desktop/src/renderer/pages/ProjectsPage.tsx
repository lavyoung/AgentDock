import {type JSX, useMemo, useState} from "react";

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

export function ProjectsPage(): JSX.Element {
    const {t} = useI18n();
    const projects = useAppStore((s) => s.projects);
    const selectedProjectId = useAppStore((s) => s.selectedProjectId);
    const scenarios = useAppStore((s) => s.scenarios);
    const openProject = useAppStore((s) => s.openProject);
    const openScenario = useAppStore((s) => s.openScenario);
    const setView = useAppStore((s) => s.setView);
    const resetProjectForm = useAppStore((s) => s.resetProjectForm);
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

                        <div className="projects-layout">
                            <section className="left-card">
                                <header className="left-card-header">
                                    <h3>{t("projectsTitle")}</h3>
                                </header>
                                <div className="left-card-body projects-list">
                                    {projects.map((project) => {
                                        const scenario = project.defaultScenarioId
                                            ? scenarios.find((item) => item.id === project.defaultScenarioId) ?? null
                                            : null;
                                        return (
                                            <button
                                                key={project.id}
                                                type="button"
                                                className={`project-list-item ${selectedProject?.id === project.id ? "active" : ""}`}
                                                onClick={() => openProject(project.id)}
                                            >
                                                <div className="project-list-item-header">
                                                    <strong>{project.name}</strong>
                                                    <span className="badge badge-blue">
                                                        {project.syncMode === "manual"
                                                            ? t("projectSyncModeManual")
                                                            : t("projectSyncModePreviewFirst")}
                                                    </span>
                                                </div>
                                                <div className="project-list-item-path">{project.path}</div>
                                                <div className="project-list-item-meta">
                                                    {scenario ? scenario.title || scenario.name : t("projectScenarioNone")}
                                                </div>
                                            </button>
                                        );
                                    })}
                                </div>
                            </section>

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
                                                    </div>
                                                </div>

                                                <div className="project-detail-grid">
                                                    <div className="field">
                                                        <label>ID</label>
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
                                        <h3>{t("projectWorkflowTitle")}</h3>
                                    </header>
                                    <div className="left-card-body">
                                        <div className="projects-note-card">
                                            <p>{t("projectWorkflowDesc")}</p>
                                        </div>
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
