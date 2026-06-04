import {type JSX, useState} from "react";

import {ProjectModal} from "../components/ProjectModal";
import {useI18n} from "../i18n/useI18n";
import {useAppStore} from "../stores/useAppStore";
import "./Pages.css";

export function ProjectsPage(): JSX.Element {
    const {t} = useI18n();
    const projects = useAppStore((s) => s.projects);
    const selectedProjectId = useAppStore((s) => s.selectedProjectId);
    const scenarios = useAppStore((s) => s.scenarios);
    const openProject = useAppStore((s) => s.openProject);
    const resetProjectForm = useAppStore((s) => s.resetProjectForm);
    const [isProjectModalOpen, setIsProjectModalOpen] = useState(false);

    const selectedProject =
        projects.find((project) => project.id === selectedProjectId) ?? projects[0] ?? null;
    const selectedScenario = selectedProject?.defaultScenarioId
        ? scenarios.find((scenario) => scenario.id === selectedProject.defaultScenarioId) ?? null
        : null;

    return (
        <div className="view page-assets-view">
            <div className="page-topbar">
                <div className="page-topbar-left">
                    <h1 className="page-topbar-title">{t("navLinkedProjects")}</h1>
                </div>
                <div className="page-topbar-actions">
                    <button
                        type="button"
                        className="btn btn-primary"
                        onClick={() => {
                            resetProjectForm();
                            setIsProjectModalOpen(true);
                        }}
                    >
                        {t("actionNewProject")}
                    </button>
                </div>
            </div>

            <div className="page-body projects-layout">
                <section className="left-card">
                    <header className="left-card-header">
                        <h3>{t("projectsTitle")}</h3>
                    </header>
                    <div className="left-card-body projects-list">
                        {projects.length === 0 ? (
                            <div className="assets-empty projects-empty-inline">
                                <p>{t("projectsEmpty")}</p>
                            </div>
                        ) : (
                            projects.map((project) => (
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
                                </button>
                            ))
                        )}
                    </div>
                </section>

                <section className="left-card">
                    <header className="left-card-header">
                        <h3>{selectedProject ? selectedProject.name : t("projectsSubtitle")}</h3>
                    </header>
                    <div className="left-card-body">
                        {selectedProject ? (
                            <div className="project-detail-grid">
                                <div className="field">
                                    <label>ID</label>
                                    <div className="field-readonly">{selectedProject.id}</div>
                                </div>
                                <div className="field">
                                    <label>{t("projectScenarioLabel")}</label>
                                    <div className="field-readonly">
                                        {selectedScenario ? selectedScenario.title || selectedScenario.name : t("projectScenarioNone")}
                                    </div>
                                </div>
                                <div className="field">
                                    <label>{t("projectPathLabel")}</label>
                                    <div className="field-readonly">{selectedProject.path}</div>
                                </div>
                                <div className="field">
                                    <label>{t("projectSyncModeLabel")}</label>
                                    <div className="field-readonly">
                                        {selectedProject.syncMode === "manual"
                                            ? t("projectSyncModeManual")
                                            : t("projectSyncModePreviewFirst")}
                                    </div>
                                </div>
                                <div className="field">
                                    <label>{t("projectAgentLabel")}</label>
                                    <div className="field-readonly">{selectedProject.agentLabel}</div>
                                </div>
                                <div className="field">
                                    <label>{t("projectPreview")}</label>
                                    <div className="field-readonly">{t("projectPreviewHint")}</div>
                                </div>
                            </div>
                        ) : (
                            <div className="assets-empty projects-empty-inline">
                                <p>{t("projectsSubtitle")}</p>
                            </div>
                        )}
                    </div>
                </section>
            </div>

            <ProjectModal
                open={isProjectModalOpen}
                onClose={() => setIsProjectModalOpen(false)}
            />
        </div>
    );
}
