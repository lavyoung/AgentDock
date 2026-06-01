import {useEffect, useEffectEvent, useState} from "react";

import type {AssetDetail, AssetRecord, AssetStatus, AssetType,} from "./core/types/asset";
import type {SnapshotRecord} from "./core/types/snapshot";
import type {TargetDeployMode, TargetRecord,} from "./core/types/target";
import {agentdockClient} from "./renderer/client/agentdockClient";
import type {Locale} from "./renderer/i18n/messages";
import {useI18n} from "./renderer/i18n/useI18n";

type ErrorMessageKey =
    | "errorAssetsList"
    | "errorAssetsGet"
    | "errorAssetsUpdate"
    | "errorAssetsCreateSkill"
    | "errorAssetsCreateAgents"
    | "errorSnapshotsList"
    | "errorSnapshotsRestore"
    | "errorTargetsList"
    | "errorTargetsGet"
    | "errorTargetsCreate"
    | "errorTargetsUpdate"
    | "errorTargetsDelete";

function App() {
    const {formatDateTime, locale, setLocale, t} = useI18n();
    const [assets, setAssets] = useState<AssetRecord[]>([]);
    const [selectedAsset, setSelectedAsset] = useState<AssetDetail | null>(null);
    const [snapshots, setSnapshots] = useState<SnapshotRecord[]>([]);
    const [editorTitle, setEditorTitle] = useState("");
    const [editorDescription, setEditorDescription] = useState("");
    const [editorContent, setEditorContent] = useState("");
    const [targets, setTargets] = useState<TargetRecord[]>([]);
    const [selectedTarget, setSelectedTarget] = useState<TargetRecord | null>(null);
    const [targetName, setTargetName] = useState("");
    const [targetPath, setTargetPath] = useState("");
    const [targetDeployMode, setTargetDeployMode] = useState<TargetDeployMode>("copy");
    const [targetEnabled, setTargetEnabled] = useState(true);

    function getErrorMessage(scopeKey: ErrorMessageKey, error: unknown): string {
        const action = t(scopeKey);
        const suffix = t("errorPrefix");

        if (locale === "zh-CN") {
            return `${action}${suffix}: ${String(error)}`;
        }

        return `${action} ${suffix}: ${String(error)}`;
    }

    function showError(scopeKey: ErrorMessageKey, error: unknown): void {
        const message = getErrorMessage(scopeKey, error);
        console.error(message, error);
        window.alert(message);
    }

    function getSnapshotMessage(message: string): string {
        if (message === "asset.update.before" || message === "Before asset update") {
            return t("snapshotMessageBeforeAssetUpdate");
        }

        return message;
    }

    function getAssetTypeLabel(type: AssetType): string {
        switch (type) {
            case "skill":
                return t("assetTypeSkill");
            case "agents-md":
                return t("assetTypeAgentsMd");
        }
    }

    function getAssetStatusLabel(status: AssetStatus | string): string {
        switch (status) {
            case "active":
                return t("assetStatusActive");
            default:
                return status;
        }
    }

    function getDeployModeLabel(mode: TargetDeployMode): string {
        switch (mode) {
            case "copy":
                return t("deployModeCopy");
            case "merge":
                return t("deployModeMerge");
        }
    }

    function getEnabledLabel(enabled: boolean): string {
        return enabled ? t("enabledYes") : t("enabledNo");
    }

    function resetTargetForm(): void {
        setSelectedTarget(null);
        setTargetName("");
        setTargetPath("");
        setTargetDeployMode("copy");
        setTargetEnabled(true);
    }

    function fillTargetForm(target: TargetRecord): void {
        setSelectedTarget(target);
        setTargetName(target.name);
        setTargetPath(target.path);
        setTargetDeployMode(target.deployMode);
        setTargetEnabled(target.enabled);
    }

    const showErrorEvent = useEffectEvent(showError);

    async function refreshAssets(): Promise<void> {
        try {
            setAssets(await agentdockClient.assets.list());
        } catch (error) {
            showError("errorAssetsList", error);
        }
    }

    async function refreshTargets(): Promise<void> {
        try {
            setTargets(await agentdockClient.targets.list());
        } catch (error) {
            showError("errorTargetsList", error);
        }
    }

    async function refreshSnapshots(assetId: string): Promise<void> {
        try {
            setSnapshots(await agentdockClient.snapshots.list(assetId));
        } catch (error) {
            showError("errorSnapshotsList", error);
        }
    }

    async function refreshAll(): Promise<void> {
        await refreshAssets();
        await refreshTargets();
    }

    async function openAsset(id: string): Promise<void> {
        try {
            const detail = await agentdockClient.assets.get(id);

            if (!detail) {
                setSelectedAsset(null);
                setEditorTitle("");
                setEditorDescription("");
                setEditorContent("");
                setSnapshots([]);
                return;
            }

            setSelectedAsset(detail);
            setEditorTitle(detail.title);
            setEditorDescription(detail.description);
            setEditorContent(detail.content);

            await refreshSnapshots(id);
        } catch (error) {
            showError("errorAssetsGet", error);
        }
    }

    async function openTarget(id: string): Promise<void> {
        try {
            const target = await agentdockClient.targets.get(id);

            if (!target) {
                resetTargetForm();
                return;
            }

            fillTargetForm(target);
        } catch (error) {
            showError("errorTargetsGet", error);
        }
    }

    async function saveAsset(): Promise<void> {
        if (!selectedAsset) {
            return;
        }

        try {
            const updated = await agentdockClient.assets.update(selectedAsset.id, {
                title: editorTitle,
                description: editorDescription,
                content: editorContent,
            });

            if (updated) {
                setSelectedAsset(updated);
            }

            await refreshAssets();
            await refreshSnapshots(selectedAsset.id);
        } catch (error) {
            showError("errorAssetsUpdate", error);
        }
    }

    async function saveTarget(): Promise<void> {
        try {
            if (!selectedTarget) {
                const created = await agentdockClient.targets.create({
                    name: targetName,
                    path: targetPath,
                    deployMode: targetDeployMode,
                });

                fillTargetForm(created);
                await refreshTargets();
                return;
            }

            const updated = await agentdockClient.targets.update(selectedTarget.id, {
                name: targetName,
                path: targetPath,
                enabled: targetEnabled,
                deployMode: targetDeployMode,
            });

            fillTargetForm(updated);
            await refreshTargets();
        } catch (error) {
            showError(
                selectedTarget ? "errorTargetsUpdate" : "errorTargetsCreate",
                error
            );
        }
    }

    async function deleteTarget(): Promise<void> {
        if (!selectedTarget) {
            return;
        }

        if (!window.confirm(t("confirmDeleteTarget"))) {
            return;
        }

        try {
            await agentdockClient.targets.delete(selectedTarget.id);
            resetTargetForm();
            await refreshTargets();
        } catch (error) {
            showError("errorTargetsDelete", error);
        }
    }

    async function restoreSelectedSnapshot(snapshotId: string): Promise<void> {
        if (!selectedAsset) {
            return;
        }

        if (!window.confirm(t("confirmRestore"))) {
            return;
        }

        try {
            await agentdockClient.snapshots.restore(snapshotId);
            await openAsset(selectedAsset.id);
            await refreshAssets();
        } catch (error) {
            showError("errorSnapshotsRestore", error);
        }
    }

    async function createDemoSkill(): Promise<void> {
        try {
            const timestamp = Date.now();

            await agentdockClient.assets.create({
                type: "skill",
                name: `frontend-review-${timestamp}`,
                title: t("demoSkillTitle"),
                description: t("demoSkillDescription"),
                content: t("demoSkillContent"),
            });

            await refreshAssets();
        } catch (error) {
            showError("errorAssetsCreateSkill", error);
        }
    }

    async function createDemoAgentsMd(): Promise<void> {
        try {
            const timestamp = Date.now();

            await agentdockClient.assets.create({
                type: "agents-md",
                name: `frontend-agents-${timestamp}`,
                title: t("demoAgentsTitle"),
                description: t("demoAgentsDescription"),
                content: t("demoAgentsContent"),
            });

            await refreshAssets();
        } catch (error) {
            showError("errorAssetsCreateAgents", error);
        }
    }

    useEffect(() => {
        let isActive = true;

        async function loadInitialData(): Promise<void> {
            try {
                const [assetResult, targetResult] = await Promise.all([
                    agentdockClient.assets.list(),
                    agentdockClient.targets.list(),
                ]);

                if (isActive) {
                    setAssets(assetResult);
                    setTargets(targetResult);
                }
            } catch (error) {
                if (isActive) {
                    showErrorEvent("errorAssetsList", error);
                }
            }
        }

        void loadInitialData();

        return () => {
            isActive = false;
        };
    }, []);

    function renderLocaleButton(nextLocale: Locale, label: string): JSX.Element {
        const isActive = locale === nextLocale;

        return (
            <button
                key={nextLocale}
                onClick={() => setLocale(nextLocale)}
                style={{
                    padding: "6px 10px",
                    borderRadius: 999,
                    border: isActive ? "1px solid #08060d" : "1px solid #cfcad6",
                    background: isActive ? "#08060d" : "transparent",
                    color: isActive ? "#ffffff" : "inherit",
                }}
            >
                {label}
            </button>
        );
    }

    return (
        <main style={{padding: 24}}>
            <div
                style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    gap: 16,
                    flexWrap: "wrap",
                }}
            >
                <div>
                    <h1>{t("appTitle")}</h1>
                    <p>{t("currentScope")}</p>
                </div>

                <div style={{display: "flex", alignItems: "center", gap: 8}}>
                    <span>{t("localeLabel")}:</span>
                    {renderLocaleButton("en", t("localeEnglish"))}
                    {renderLocaleButton("zh-CN", t("localeChinese"))}
                </div>
            </div>

            <div style={{display: "flex", gap: 8, margin: "24px 0", flexWrap: "wrap"}}>
                <button onClick={() => void createDemoSkill()}>{t("newDemoSkill")}</button>
                <button onClick={() => void createDemoAgentsMd()}>
                    {t("newDemoAgents")}
                </button>
                <button onClick={() => void refreshAll()}>{t("refresh")}</button>
            </div>

            <div
                style={{
                    display: "grid",
                    gridTemplateColumns: "360px 1fr",
                    gap: 24,
                }}
            >
                <section>
                    <h2>{t("assets")}</h2>

                    {assets.length === 0 ? (
                        <p>{t("noAssetsYet")}</p>
                    ) : (
                        <ul style={{paddingLeft: 16}}>
                            {assets.map((asset) => (
                                <li key={asset.id} style={{marginBottom: 12}}>
                                    <button onClick={() => void openAsset(asset.id)}>
                                        {asset.title}
                                    </button>
                                    <div>
                                        {t("typeLabel")}: {getAssetTypeLabel(asset.type)}
                                    </div>
                                    <div>
                                        {t("nameLabel")}: {asset.name}
                                    </div>
                                    <div>
                                        {t("versionLabel")}: {asset.version}
                                    </div>
                                    <div>
                                        {t("statusLabel")}: {getAssetStatusLabel(asset.status)}
                                    </div>
                                </li>
                            ))}
                        </ul>
                    )}
                </section>

                <section>
                    <h2>{t("editor")}</h2>

                    {!selectedAsset ? (
                        <p>{t("selectAsset")}</p>
                    ) : (
                        <div style={{display: "flex", flexDirection: "column", gap: 12}}>
                            <div>
                                <label htmlFor="asset-title">{t("titleLabel")}</label>
                                <input
                                    id="asset-title"
                                    value={editorTitle}
                                    onChange={(event) => setEditorTitle(event.target.value)}
                                    style={{display: "block", width: "100%", padding: 8}}
                                />
                            </div>

                            <div>
                                <label htmlFor="asset-description">
                                    {t("descriptionLabel")}
                                </label>
                                <input
                                    id="asset-description"
                                    value={editorDescription}
                                    onChange={(event) =>
                                        setEditorDescription(event.target.value)
                                    }
                                    style={{display: "block", width: "100%", padding: 8}}
                                />
                            </div>

                            <div>
                                <label htmlFor="asset-content">{t("contentLabel")}</label>
                                <textarea
                                    id="asset-content"
                                    value={editorContent}
                                    onChange={(event) => setEditorContent(event.target.value)}
                                    rows={18}
                                    style={{
                                        display: "block",
                                        width: "100%",
                                        padding: 8,
                                        fontFamily: "monospace",
                                    }}
                                />
                            </div>

                            <div>
                                <button onClick={() => void saveAsset()}>{t("save")}</button>
                            </div>

                            <p style={{fontSize: 12, opacity: 0.7}}>
                                {t("filePathLabel")}: {selectedAsset.path}
                            </p>

                            <hr />

                            <section>
                                <h3>{t("snapshots")}</h3>

                                {snapshots.length === 0 ? (
                                    <p>{t("noSnapshotsYet")}</p>
                                ) : (
                                    <ul style={{paddingLeft: 16}}>
                                        {snapshots.map((snapshot) => (
                                            <li key={snapshot.id} style={{marginBottom: 10}}>
                                                <div>
                                                    <strong>
                                                        {formatDateTime(snapshot.created_at)}
                                                    </strong>
                                                </div>
                                                <div>{getSnapshotMessage(snapshot.message)}</div>
                                                <div
                                                    style={{
                                                        fontSize: 12,
                                                        opacity: 0.7,
                                                    }}
                                                >
                                                    {snapshot.snapshot_path}
                                                </div>

                                                <button
                                                    style={{marginTop: 6}}
                                                    onClick={() =>
                                                        void restoreSelectedSnapshot(snapshot.id)
                                                    }
                                                >
                                                    {t("restore")}
                                                </button>
                                            </li>
                                        ))}
                                    </ul>
                                )}
                            </section>
                        </div>
                    )}
                </section>
            </div>

            <hr style={{margin: "32px 0"}} />

            <div
                style={{
                    display: "grid",
                    gridTemplateColumns: "360px 1fr",
                    gap: 24,
                }}
            >
                <section>
                    <div
                        style={{
                            display: "flex",
                            justifyContent: "space-between",
                            alignItems: "center",
                            gap: 12,
                        }}
                    >
                        <h2>{t("targetList")}</h2>
                        <button onClick={resetTargetForm}>{t("newTarget")}</button>
                    </div>

                    {targets.length === 0 ? (
                        <p>{t("noTargetsYet")}</p>
                    ) : (
                        <ul style={{paddingLeft: 16}}>
                            {targets.map((target) => (
                                <li key={target.id} style={{marginBottom: 12}}>
                                    <button onClick={() => void openTarget(target.id)}>
                                        {target.name}
                                    </button>
                                    <div>
                                        {t("targetPathLabel")}: {target.path}
                                    </div>
                                    <div>
                                        {t("targetDeployModeLabel")}:{" "}
                                        {getDeployModeLabel(target.deployMode)}
                                    </div>
                                    <div>
                                        {t("targetEnabledLabel")}:{" "}
                                        {getEnabledLabel(target.enabled)}
                                    </div>
                                </li>
                            ))}
                        </ul>
                    )}
                </section>

                <section>
                    <h2>
                        {selectedTarget ? t("targetEditor") : t("createTarget")}
                    </h2>

                    <div style={{display: "flex", flexDirection: "column", gap: 12}}>
                        <div>
                            <label htmlFor="target-name">{t("targetNameLabel")}</label>
                            <input
                                id="target-name"
                                value={targetName}
                                onChange={(event) => setTargetName(event.target.value)}
                                style={{display: "block", width: "100%", padding: 8}}
                            />
                        </div>

                        <div>
                            <label htmlFor="target-path">{t("targetPathLabel")}</label>
                            <input
                                id="target-path"
                                value={targetPath}
                                onChange={(event) => setTargetPath(event.target.value)}
                                style={{display: "block", width: "100%", padding: 8}}
                            />
                            <p style={{fontSize: 12, opacity: 0.7}}>{t("targetPathHint")}</p>
                        </div>

                        <div>
                            <label htmlFor="target-mode">{t("targetDeployModeLabel")}</label>
                            <select
                                id="target-mode"
                                value={targetDeployMode}
                                onChange={(event) =>
                                    setTargetDeployMode(
                                        event.target.value as TargetDeployMode
                                    )
                                }
                                style={{display: "block", width: "100%", padding: 8}}
                            >
                                <option value="copy">{t("deployModeCopy")}</option>
                                <option value="merge">{t("deployModeMerge")}</option>
                            </select>
                        </div>

                        <label
                            htmlFor="target-enabled"
                            style={{display: "flex", alignItems: "center", gap: 8}}
                        >
                            <input
                                id="target-enabled"
                                type="checkbox"
                                checked={targetEnabled}
                                disabled={!selectedTarget}
                                onChange={(event) =>
                                    setTargetEnabled(event.target.checked)
                                }
                            />
                            <span>{t("targetEnabledLabel")}</span>
                        </label>

                        <div style={{display: "flex", gap: 8, flexWrap: "wrap"}}>
                            <button onClick={() => void saveTarget()}>
                                {selectedTarget ? t("targetFormSave") : t("targetFormCreate")}
                            </button>
                            <button onClick={resetTargetForm}>{t("targetFormReset")}</button>
                            {selectedTarget ? (
                                <button onClick={() => void deleteTarget()}>
                                    {t("deleteTarget")}
                                </button>
                            ) : null}
                        </div>

                        {!selectedTarget ? <p>{t("selectTarget")}</p> : null}
                    </div>
                </section>
            </div>
        </main>
    );
}

export default App;
