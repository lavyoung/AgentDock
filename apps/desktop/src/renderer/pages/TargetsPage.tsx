import {type JSX, useEffect, useState} from "react";

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
            pushToast("success", selectedTarget ? "已保存" : "已创建");
        } catch (error) {
            pushToast("error", String(error));
        }
    }

    return (
        <div className="view page-targets">
            {/* ---- Header (proto: h-16 px-8) ---- */}
            <div className="page-topbar">
                <h1 style={{fontSize: "20px", fontWeight: 600, color: "var(--fg-primary)", margin: 0}}>
                    {t("targetsTitle")}
                </h1>
            </div>

            <div className="page-body targets-grid">
                {/* === Left: Target list card === */}
                <div className="left-card" style={{background: "var(--bg-card)", border: "1px solid var(--bd-soft)", borderRadius: "12px", overflow: "hidden"}}>
                    <div className="left-card-header" style={{padding: "12px 16px", borderBottom: "1px solid var(--bd-soft)", display: "flex", alignItems: "center", justifyContent: "space-between"}}>
                        <h3 style={{fontSize: "13px", fontWeight: 600, color: "var(--fg-primary)", margin: 0}}>
                            {t("targetList")}
                        </h3>
                        <button
                            type="button"
                            onClick={resetTargetForm}
                            style={{height: "28px", padding: "0 10px", background: "transparent", border: "1px solid var(--bd)", color: "var(--fg-muted)", borderRadius: "6px", fontSize: "12px", cursor: "pointer", fontFamily: "inherit"}}
                        >
                            + {t("newTarget")}
                        </button>
                    </div>
                    <div style={{padding: "8px"}}>
                        {targets.length === 0 ? (
                            <div style={{padding: "32px 16px", textAlign: "center", color: "var(--fg-muted)", fontSize: "13px"}}>
                                {t("targetsEmpty")}
                            </div>
                        ) : (
                            targets.map((target) => {
                                const isActive = selectedTarget?.id === target.id;
                                return (
                                    <button
                                        key={target.id}
                                        type="button"
                                        onClick={() => void openTarget(target.id)}
                                        style={{
                                            width: "100%",
                                            padding: "12px",
                                            background: isActive ? "var(--accent-bg)" : "transparent",
                                            border: "1px solid " + (isActive ? "var(--accent)" : "transparent"),
                                            borderRadius: "8px",
                                            cursor: "pointer",
                                            textAlign: "left",
                                            display: "flex",
                                            flexDirection: "column",
                                            gap: "6px",
                                            marginBottom: "4px",
                                            fontFamily: "inherit",
                                            transition: "background 0.15s, border-color 0.15s",
                                        }}
                                    >
                                        <div style={{display: "flex", alignItems: "center", justifyContent: "space-between", gap: "8px"}}>
                                            <span style={{fontSize: "13px", fontWeight: 500, color: "var(--fg-primary)"}}>
                                                {target.name}
                                            </span>
                                            <span className={getPillForMode(target.deployMode)}>
                                                {t(getDeployModeLabelKey(target.deployMode) as never)}
                                            </span>
                                        </div>
                                        <div style={{fontSize: "11px", color: "var(--fg-faint)", fontFamily: "ui-monospace, monospace", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis"}}>
                                            {target.path}
                                        </div>
                                        <div style={{display: "flex", alignItems: "center", gap: "6px", fontSize: "11px"}}>
                                            <span
                                                className={`sync-pill ${target.enabled ? "synced" : "pending"}`}
                                            >
                                                <span className="pill-dot" />
                                                {target.enabled ? t("enabledYes") : t("enabledNo")}
                                            </span>
                                        </div>
                                    </button>
                                );
                            })
                        )}
                    </div>
                </div>

                {/* === Right: Editor card === */}
                <div className="left-card" style={{background: "var(--bg-card)", border: "1px solid var(--bd-soft)", borderRadius: "12px", overflow: "hidden"}}>
                    <div className="left-card-header" style={{padding: "12px 16px", borderBottom: "1px solid var(--bd-soft)"}}>
                        <h3 style={{fontSize: "13px", fontWeight: 600, color: "var(--fg-primary)", margin: 0}}>
                            {selectedTarget ? t("targetEditor") : t("createTarget")}
                        </h3>
                    </div>
                    <div style={{padding: "20px"}}>
                        <div className="field" style={{marginBottom: "16px"}}>
                            <label htmlFor="target-name" style={{fontSize: "12px", fontWeight: 500, color: "var(--fg-muted)", marginBottom: "6px", display: "block"}}>
                                {t("targetNameLabel")}
                            </label>
                            <input
                                id="target-name"
                                value={targetName}
                                onChange={(event) => setTargetName(event.target.value)}
                                style={{
                                    width: "100%",
                                    padding: "8px 12px",
                                    fontSize: "13px",
                                    background: "var(--bg-input)",
                                    color: "var(--fg-primary)",
                                    border: "1px solid var(--bd)",
                                    borderRadius: "6px",
                                    fontFamily: "inherit",
                                    boxSizing: "border-box",
                                }}
                            />
                        </div>
                        <div className="field" style={{marginBottom: "16px"}}>
                            <label htmlFor="target-path" style={{fontSize: "12px", fontWeight: 500, color: "var(--fg-muted)", marginBottom: "6px", display: "block"}}>
                                {t("targetPathLabel")}
                            </label>
                            <input
                                id="target-path"
                                value={targetPath}
                                onChange={(event) => setTargetPath(event.target.value)}
                                style={{
                                    width: "100%",
                                    padding: "8px 12px",
                                    fontSize: "13px",
                                    background: "var(--bg-input)",
                                    color: "var(--fg-primary)",
                                    border: "1px solid var(--bd)",
                                    borderRadius: "6px",
                                    fontFamily: "inherit",
                                    boxSizing: "border-box",
                                }}
                            />
                            <p style={{fontSize: "11px", color: "var(--fg-faint)", margin: "6px 0 0"}}>
                                {t("targetPathHint")}
                            </p>
                        </div>
                        <div className="field" style={{marginBottom: "16px"}}>
                            <label htmlFor="target-mode" style={{fontSize: "12px", fontWeight: 500, color: "var(--fg-muted)", marginBottom: "6px", display: "block"}}>
                                {t("targetDeployModeLabel")}
                            </label>
                            <select
                                id="target-mode"
                                value={targetDeployMode}
                                onChange={(event) =>
                                    setTargetDeployMode(
                                        event.target.value as "copy" | "merge"
                                    )
                                }
                                style={{
                                    width: "100%",
                                    padding: "8px 12px",
                                    fontSize: "13px",
                                    background: "var(--bg-input)",
                                    color: "var(--fg-primary)",
                                    border: "1px solid var(--bd)",
                                    borderRadius: "6px",
                                    fontFamily: "inherit",
                                    boxSizing: "border-box",
                                }}
                            >
                                <option value="copy">{t("deployModeCopy")}</option>
                                <option value="merge">{t("deployModeMerge")}</option>
                            </select>
                        </div>
                        <div style={{display: "flex", alignItems: "center", justifyContent: "space-between", padding: "12px 0", borderTop: "1px solid var(--bd-soft)"}}>
                            <span style={{fontSize: "13px", color: "var(--fg-secondary)"}}>
                                {t("targetEnabledLabel")}
                            </span>
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
                        <div style={{display: "flex", alignItems: "center", gap: "8px", marginTop: "16px", paddingTop: "16px", borderTop: "1px solid var(--bd-soft)"}}>
                            <button
                                type="button"
                                onClick={() => void handleSave()}
                                style={{
                                    height: "32px",
                                    padding: "0 14px",
                                    background: "var(--accent)",
                                    color: "#fff",
                                    border: "none",
                                    borderRadius: "6px",
                                    fontSize: "13px",
                                    fontWeight: 500,
                                    cursor: "pointer",
                                    fontFamily: "inherit",
                                }}
                            >
                                {selectedTarget ? t("targetFormSave") : t("targetFormCreate")}
                            </button>
                            <button
                                type="button"
                                onClick={resetTargetForm}
                                style={{
                                    height: "32px",
                                    padding: "0 14px",
                                    background: "transparent",
                                    color: "var(--fg-muted)",
                                    border: "1px solid var(--bd)",
                                    borderRadius: "6px",
                                    fontSize: "13px",
                                    cursor: "pointer",
                                    fontFamily: "inherit",
                                }}
                            >
                                {t("targetFormReset")}
                            </button>
                            {selectedTarget ? (
                                <button
                                    type="button"
                                    onClick={() => setDeleteCandidate(selectedTarget.id)}
                                    style={{
                                        height: "32px",
                                        padding: "0 14px",
                                        background: "transparent",
                                        color: "#f87171",
                                        border: "1px solid rgba(239,68,68,0.4)",
                                        borderRadius: "6px",
                                        fontSize: "13px",
                                        cursor: "pointer",
                                        fontFamily: "inherit",
                                        marginLeft: "auto",
                                    }}
                                >
                                    {t("deleteTarget")}
                                </button>
                            ) : null}
                        </div>
                    </div>
                </div>
            </div>

            {deleteCandidate ? (
                <div
                    style={{
                        position: "fixed",
                        inset: 0,
                        background: "rgba(0,0,0,0.55)",
                        backdropFilter: "blur(2px)",
                        zIndex: 300,
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                    }}
                    onClick={() => setDeleteCandidate(null)}
                >
                    <div
                        onClick={(e) => e.stopPropagation()}
                        style={{
                            background: "var(--bg-card)",
                            border: "1px solid var(--bd-soft)",
                            borderRadius: "14px",
                            width: "420px",
                            maxWidth: "90vw",
                            overflow: "hidden",
                        }}
                    >
                        <div style={{padding: "16px 20px", borderBottom: "1px solid var(--bd-soft)"}}>
                            <h2 style={{fontSize: "15px", fontWeight: 600, color: "var(--fg-primary)", margin: 0}}>
                                {t("confirmDeleteTarget")}
                            </h2>
                        </div>
                        <div style={{padding: "20px", display: "flex", justifyContent: "flex-end", gap: "8px"}}>
                            <button
                                type="button"
                                onClick={() => setDeleteCandidate(null)}
                                style={{
                                    height: "32px",
                                    padding: "0 14px",
                                    background: "transparent",
                                    color: "var(--fg-muted)",
                                    border: "1px solid var(--bd)",
                                    borderRadius: "6px",
                                    fontSize: "13px",
                                    cursor: "pointer",
                                    fontFamily: "inherit",
                                }}
                            >
                                {t("targetFormReset")}
                            </button>
                            <button
                                type="button"
                                onClick={async () => {
                                    const id = deleteCandidate;
                                    setDeleteCandidate(null);
                                    if (!id) return;
                                    try {
                                        await deleteTarget();
                                        pushToast("success", "已删除");
                                    } catch (error) {
                                        pushToast("error", String(error));
                                    }
                                }}
                                style={{
                                    height: "32px",
                                    padding: "0 14px",
                                    background: "#dc2626",
                                    color: "#fff",
                                    border: "none",
                                    borderRadius: "6px",
                                    fontSize: "13px",
                                    fontWeight: 500,
                                    cursor: "pointer",
                                    fontFamily: "inherit",
                                }}
                            >
                                {t("deleteTarget")}
                            </button>
                        </div>
                    </div>
                </div>
            ) : null}
        </div>
    );
}