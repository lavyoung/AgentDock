import {type JSX, useMemo, useState} from "react";

import {Button} from "./Button";
import {Modal} from "./Modal";
import {agentdockClient} from "../client/agentdockClient";
import {useI18n} from "../i18n/useI18n";
import {type ProjectSyncMode, useAppStore} from "../stores/useAppStore";
import "../pages/Pages.css";

type ProjectModalProps = {
    open: boolean;
    onClose: () => void;
};

function createPreviewId(name: string): string {
    return name
        .toLowerCase()
        .trim()
        .replace(/[^a-z0-9\s-]/g, "")
        .replace(/\s+/g, "-")
        .replace(/-+/g, "-")
        .replace(/^-|-$/g, "");
}

export function ProjectModal({open, onClose}: ProjectModalProps): JSX.Element {
    const {t} = useI18n();
    const scenarios = useAppStore((s) => s.scenarios);
    const projectName = useAppStore((s) => s.projectName);
    const projectPath = useAppStore((s) => s.projectPath);
    const projectDefaultScenarioId = useAppStore((s) => s.projectDefaultScenarioId);
    const projectSyncMode = useAppStore((s) => s.projectSyncMode);
    const projectAgentLabel = useAppStore((s) => s.projectAgentLabel);
    const setProjectName = useAppStore((s) => s.setProjectName);
    const setProjectPath = useAppStore((s) => s.setProjectPath);
    const setProjectDefaultScenarioId = useAppStore((s) => s.setProjectDefaultScenarioId);
    const setProjectSyncMode = useAppStore((s) => s.setProjectSyncMode);
    const createProject = useAppStore((s) => s.createProject);
    const resetProjectForm = useAppStore((s) => s.resetProjectForm);
    const pushToast = useAppStore((s) => s.pushToast);
    const [isSubmitting, setIsSubmitting] = useState(false);

    const selectedScenario = useMemo(
        () => scenarios.find((scenario) => scenario.id === projectDefaultScenarioId) ?? null,
        [projectDefaultScenarioId, scenarios]
    );

    function handleClose(): void {
        if (isSubmitting) {
            return;
        }

        onClose();
    }

    async function handleBrowseProjectPath(): Promise<void> {
        try {
            const selectedPath = await agentdockClient.app.pickPath({
                mode: "directory",
                title: t("projectPathLabel"),
                defaultPath: projectPath,
                buttonLabel: t("targetsBrowse"),
            });
            if (!selectedPath) {
                return;
            }

            setProjectPath(selectedPath);
        } catch (error) {
            pushToast("error", String(error));
        }
    }

    async function handleCreate(): Promise<void> {
        if (!projectName.trim()) {
            pushToast("error", t("projectValidationName"));
            return;
        }

        if (!projectPath.trim()) {
            pushToast("error", t("projectValidationPath"));
            return;
        }

        try {
            setIsSubmitting(true);
            const created = await createProject();
            pushToast("success", t("projectCreated").replace("{name}", created.name));
            onClose();
        } catch (error) {
            pushToast("error", String(error));
        } finally {
            setIsSubmitting(false);
        }
    }

    return (
        <Modal
            open={open}
            title={t("newProjectTitle")}
            onClose={handleClose}
            size="lg"
            footer={(
                <>
                    <Button
                        variant="secondary"
                        onClick={() => {
                            resetProjectForm();
                            handleClose();
                        }}
                        disabled={isSubmitting}
                    >
                        {t("cancel")}
                    </Button>
                    <Button
                        variant="primary"
                        onClick={() => void handleCreate()}
                        disabled={isSubmitting}
                    >
                        {isSubmitting ? `${t("projectCreate")}...` : t("projectCreate")}
                    </Button>
                </>
            )}
        >
            <div className="new-project-layout">
                <div className="new-project-form">
                    <p className="form-hint">{t("newProjectHelp")}</p>
                    <div className="field">
                        <label htmlFor="project-name">{t("projectNameLabel")}</label>
                        <input
                            id="project-name"
                            type="text"
                            value={projectName}
                            onChange={(event) => setProjectName(event.target.value)}
                            placeholder={t("projectNamePlaceholder")}
                            autoFocus
                        />
                    </div>
                    <div className="field">
                        <label htmlFor="project-path">{t("projectPathLabel")}</label>
                        <div className="settings-input-row">
                            <input
                                id="project-path"
                                type="text"
                                value={projectPath}
                                onChange={(event) => setProjectPath(event.target.value)}
                                placeholder={t("projectPathPlaceholder")}
                            />
                            <Button
                                type="button"
                                variant="secondary"
                                size="sm"
                                onClick={() => void handleBrowseProjectPath()}
                            >
                                {t("targetsBrowse")}
                            </Button>
                        </div>
                        <div className="field-hint">{t("projectPathHint")}</div>
                    </div>
                    <div className="field-row">
                        <div className="field">
                            <label htmlFor="project-scenario">{t("projectScenarioLabel")}</label>
                            <select
                                id="project-scenario"
                                value={projectDefaultScenarioId ?? ""}
                                onChange={(event) =>
                                    setProjectDefaultScenarioId(event.target.value || null)
                                }
                            >
                                <option value="">{t("projectScenarioNone")}</option>
                                {scenarios.map((scenario) => (
                                    <option key={scenario.id} value={scenario.id}>
                                        {scenario.title || scenario.name}
                                    </option>
                                ))}
                            </select>
                        </div>
                        <div className="field">
                            <label htmlFor="project-sync-mode">{t("projectSyncModeLabel")}</label>
                            <select
                                id="project-sync-mode"
                                value={projectSyncMode}
                                onChange={(event) =>
                                    setProjectSyncMode(event.target.value as ProjectSyncMode)
                                }
                            >
                                <option value="manual">{t("projectSyncModeManual")}</option>
                                <option value="preview-first">{t("projectSyncModePreviewFirst")}</option>
                            </select>
                        </div>
                    </div>
                    <div className="field">
                        <label htmlFor="project-agent">{t("projectAgentLabel")}</label>
                        <input
                            id="project-agent"
                            type="text"
                            value={projectAgentLabel}
                            readOnly
                        />
                        <div className="field-hint">{t("projectAgentHint")}</div>
                    </div>
                </div>

                <div className="new-project-preview">
                    <div className="new-project-preview-card">
                        <div className="new-project-preview-title">{t("projectPreview")}</div>
                        <div className="new-project-preview-subtitle">{t("projectPreviewHint")}</div>
                        <div className="new-project-preview-list">
                            <div className="new-project-preview-item">
                                <span>{t("projectNameLabel")}</span>
                                <strong>{projectName.trim() || "-"}</strong>
                            </div>
                            <div className="new-project-preview-item">
                                <span>{t("panelFieldId")}</span>
                                <strong>{createPreviewId(projectName) || "-"}</strong>
                            </div>
                            <div className="new-project-preview-item">
                                <span>{t("projectScenarioLabel")}</span>
                                <strong>{selectedScenario ? selectedScenario.title || selectedScenario.name : t("projectScenarioNone")}</strong>
                            </div>
                            <div className="new-project-preview-item">
                                <span>{t("projectSyncModeLabel")}</span>
                                <strong>
                                    {projectSyncMode === "manual"
                                        ? t("projectSyncModeManual")
                                        : t("projectSyncModePreviewFirst")}
                                </strong>
                            </div>
                            <div className="new-project-preview-item">
                                <span>{t("projectPathLabel")}</span>
                                <strong className="mono">{projectPath.trim() || "-"}</strong>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </Modal>
    );
}
