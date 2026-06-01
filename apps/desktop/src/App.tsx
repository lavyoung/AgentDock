import {useEffect, useEffectEvent, useState} from "react";

import type {AssetDetail, AssetRecord} from "./core/types/asset";
import type {SnapshotRecord} from "./core/types/snapshot";
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
    | "errorSnapshotsRestore";

function App() {
    const {formatDateTime, locale, setLocale, t} = useI18n();
    const [assets, setAssets] = useState<AssetRecord[]>([]);
    const [selectedAsset, setSelectedAsset] = useState<AssetDetail | null>(null);
    const [snapshots, setSnapshots] = useState<SnapshotRecord[]>([]);
    const [editorTitle, setEditorTitle] = useState("");
    const [editorDescription, setEditorDescription] = useState("");
    const [editorContent, setEditorContent] = useState("");

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

    const showErrorEvent = useEffectEvent(showError);

    async function refreshAssets(): Promise<void> {
        try {
            setAssets(await agentdockClient.assets.list());
        } catch (error) {
            showError("errorAssetsList", error);
        }
    }

    async function refreshSnapshots(assetId: string): Promise<void> {
        try {
            setSnapshots(await agentdockClient.snapshots.list(assetId));
        } catch (error) {
            showError("errorSnapshotsList", error);
        }
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

        async function loadAssets(): Promise<void> {
            try {
                const result = await agentdockClient.assets.list();

                if (isActive) {
                    setAssets(result);
                }
            } catch (error) {
                if (isActive) {
                    showErrorEvent("errorAssetsList", error);
                }
            }
        }

        void loadAssets();

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
                <button onClick={() => void refreshAssets()}>{t("refresh")}</button>
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
                                        {t("typeLabel")}: {asset.type}
                                    </div>
                                    <div>
                                        {t("nameLabel")}: {asset.name}
                                    </div>
                                    <div>
                                        {t("versionLabel")}: {asset.version}
                                    </div>
                                    <div>
                                        {t("statusLabel")}: {asset.status}
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
        </main>
    );
}

export default App;
