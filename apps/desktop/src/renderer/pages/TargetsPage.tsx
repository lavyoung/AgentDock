import {type JSX, useEffect, useState} from "react";

import {Button} from "../components/Button";
import {Modal} from "../components/Modal";
import {useI18n} from "../i18n/useI18n";
import {getDeployModeLabelKey, useAppStore} from "../stores/useAppStore";
import "./Pages.css";

function getPillForMode(mode: "copy" | "merge"): string {
    return mode === "copy" ? "badge badge-blue" : "badge badge-orange";
}

export function TargetsPage(): JSX.Element {
    const {t} = useI18n();
    const targets = useAppStore((s) => s.targets);
    const selectedTarget = useAppStore((s) => s.selectedTarget);
    const targetName = useAppStore((s) => s.targetName);
    const targetPath = useAppStore((s) => s.targetPath);
    const targetDeployMode = useAppStore((s) => s.targetDeployMode);
    const targetEnabled = useAppStore((s) => s.targetEnabled);
    const refreshTargets = useAppStore((s) => s.refreshTargets);
    const openTarget = useAppStore((s) => s.openTarget);
    const saveTarget = useAppStore((s) => s.saveTarget);
    const deleteTarget = useAppStore((s) => s.deleteTarget);
    const resetTargetForm = useAppStore((s) => s.resetTargetForm);
    const setTargetName = useAppStore((s) => s.setTargetName);
    const setTargetPath = useAppStore((s) => s.setTargetPath);
    const setTargetDeployMode = useAppStore((s) => s.setTargetDeployMode);
    const setTargetEnabled = useAppStore((s) => s.setTargetEnabled);
    const pushToast = useAppStore((s) => s.pushToast);

    const [deleteCandidate, setDeleteCandidate] = useState<string | null>(null);

    useEffect(() => {
        refreshTargets().catch((error) => pushToast("error", String(error)));
    }, [refreshTargets, pushToast]);

    async function handleSave(): Promise<void> {
        try {
            await saveTarget();
            pushToast("success", selectedTarget ? t("targetSaved") : t("targetCreated"));
        } catch (error) {
            pushToast("error", String(error));
        }
    }

    async function handleDelete(): Promise<void> {
        const id = deleteCandidate;
        setDeleteCandidate(null);
        if (!id) {
            return;
        }

        try {
            await deleteTarget();
            pushToast("success", t("targetDeleted"));
        } catch (error) {
            pushToast("error", String(error));
        }
    }

    return (
        <div className="view page-targets">
            <div className="page-topbar">
                <h1 className="page-topbar-title">{t("targetsTitle")}</h1>
            </div>

            <div className="page-body targets-grid">
                <section className="left-card targets-card">
                    <header className="left-card-header">
                        <h3>{t("targetList")}</h3>
                        <Button type="button" variant="secondary" size="sm" onClick={resetTargetForm}>
                            + {t("newTarget")}
                        </Button>
                    </header>
                    <div className="left-card-body targets-card-body">
                        {targets.length === 0 ? (
                            <div className="targets-empty-state">{t("targetsEmpty")}</div>
                        ) : (
                            targets.map((target) => {
                                const isActive = selectedTarget?.id === target.id;
                                return (
                                    <button
                                        key={target.id}
                                        type="button"
                                        onClick={() => void openTarget(target.id)}
                                        className={`target-list-item ${isActive ? "active" : ""}`}
                                        aria-pressed={isActive}
                                    >
                                        <div className="target-list-item-header">
                                            <span className="target-list-item-title">{target.name}</span>
                                            <span className={getPillForMode(target.deployMode)}>
                                                {t(getDeployModeLabelKey(target.deployMode) as never)}
                                            </span>
                                        </div>
                                        <div className="target-list-item-path">{target.path}</div>
                                        <div className="target-list-item-status">
                                            <span className={`sync-pill ${target.enabled ? "synced" : "pending"}`}>
                                                <span className="pill-dot" />
                                                {target.enabled ? t("enabledYes") : t("enabledNo")}
                                            </span>
                                        </div>
                                    </button>
                                );
                            })
                        )}
                    </div>
                </section>

                <section className="left-card targets-card">
                    <header className="left-card-header">
                        <h3>{selectedTarget ? t("targetEditor") : t("createTarget")}</h3>
                    </header>
                    <div className="left-card-body targets-editor-body">
                        <div className="field">
                            <label htmlFor="target-name">{t("targetNameLabel")}</label>
                            <input
                                id="target-name"
                                value={targetName}
                                onChange={(event) => setTargetName(event.target.value)}
                            />
                        </div>
                        <div className="field">
                            <label htmlFor="target-path">{t("targetPathLabel")}</label>
                            <input
                                id="target-path"
                                value={targetPath}
                                onChange={(event) => setTargetPath(event.target.value)}
                            />
                            <p className="targets-field-hint">{t("targetPathHint")}</p>
                        </div>
                        <div className="field">
                            <label htmlFor="target-mode">{t("targetDeployModeLabel")}</label>
                            <select
                                id="target-mode"
                                value={targetDeployMode}
                                onChange={(event) =>
                                    setTargetDeployMode(event.target.value as "copy" | "merge")
                                }
                            >
                                <option value="copy">{t("deployModeCopy")}</option>
                                <option value="merge">{t("deployModeMerge")}</option>
                            </select>
                        </div>

                        <div className="targets-toggle-row">
                            <span>{t("targetEnabledLabel")}</span>
                            <button
                                type="button"
                                className="toggle"
                                data-state={targetEnabled ? "on" : "off"}
                                role="switch"
                                aria-checked={targetEnabled}
                                aria-label={t("targetEnabledLabel")}
                                onClick={() => setTargetEnabled(!targetEnabled)}
                                disabled={!selectedTarget}
                            >
                                <span />
                            </button>
                        </div>

                        <div className="targets-form-actions">
                            <Button type="button" variant="primary" onClick={() => void handleSave()}>
                                {selectedTarget ? t("targetFormSave") : t("targetFormCreate")}
                            </Button>
                            <Button type="button" variant="secondary" onClick={resetTargetForm}>
                                {t("cancel")}
                            </Button>
                            {selectedTarget ? (
                                <Button
                                    type="button"
                                    variant="danger"
                                    className="targets-delete-button"
                                    onClick={() => setDeleteCandidate(selectedTarget.id)}
                                >
                                    {t("deleteTarget")}
                                </Button>
                            ) : null}
                        </div>
                    </div>
                </section>
            </div>

            <Modal
                open={Boolean(deleteCandidate)}
                title={t("confirmDeleteTarget")}
                onClose={() => setDeleteCandidate(null)}
                width={420}
                footer={(
                    <>
                        <Button type="button" variant="secondary" onClick={() => setDeleteCandidate(null)}>
                            {t("cancel")}
                        </Button>
                        <Button type="button" variant="danger" onClick={() => void handleDelete()}>
                            {t("deleteTarget")}
                        </Button>
                    </>
                )}
            >
                <p className="targets-delete-copy">{t("confirmDeleteTarget")}</p>
            </Modal>
        </div>
    );
}
