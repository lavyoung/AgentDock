import {useEffect, useState} from "react";

import type {AssetDetail, AssetRecord} from "./core/types/asset";
import type {SnapshotRecord} from "./core/types/snapshot";
import {agentdockClient} from "./renderer/client/agentdockClient";

function App() {
    const [assets, setAssets] = useState<AssetRecord[]>([]);
    const [selectedAsset, setSelectedAsset] = useState<AssetDetail | null>(null);
    const [snapshots, setSnapshots] = useState<SnapshotRecord[]>([]);
    const [editorTitle, setEditorTitle] = useState("");
    const [editorDescription, setEditorDescription] = useState("");
    const [editorContent, setEditorContent] = useState("");

    function showError(scope: string, error: unknown): void {
        console.error(`${scope} failed`, error);
        window.alert(`${scope} failed: ${String(error)}`);
    }

    async function refreshAssets(): Promise<void> {
        try {
            setAssets(await agentdockClient.assets.list());
        } catch (error) {
            showError("assets:list", error);
        }
    }

    async function refreshSnapshots(assetId: string): Promise<void> {
        try {
            setSnapshots(await agentdockClient.snapshots.list(assetId));
        } catch (error) {
            showError("snapshots:list", error);
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
            showError("assets:get", error);
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
            showError("assets:update", error);
        }
    }

    async function restoreSelectedSnapshot(snapshotId: string): Promise<void> {
        if (!selectedAsset) {
            return;
        }

        if (!window.confirm("Restore this snapshot and overwrite the current asset?")) {
            return;
        }

        try {
            await agentdockClient.snapshots.restore(snapshotId);
            await openAsset(selectedAsset.id);
            await refreshAssets();
        } catch (error) {
            showError("snapshots:restore", error);
        }
    }

    async function createDemoSkill(): Promise<void> {
        try {
            const timestamp = Date.now();

            await agentdockClient.assets.create({
                type: "skill",
                name: `frontend-review-${timestamp}`,
                title: "Frontend Review",
                description: "Prototype skill asset for frontend code review.",
                content: `# Frontend Review

## Usage

Use this skill when reviewing React and TypeScript projects.

## Focus

- Component structure
- Type safety
- Maintainability
`,
            });

            await refreshAssets();
        } catch (error) {
            showError("assets:create skill", error);
        }
    }

    async function createDemoAgentsMd(): Promise<void> {
        try {
            const timestamp = Date.now();

            await agentdockClient.assets.create({
                type: "agents-md",
                name: `frontend-agents-${timestamp}`,
                title: "Frontend AGENTS.md",
                description: "Prototype AGENTS.md asset for frontend projects.",
                content: `# AGENTS.md

## Project Rules

Respect the project structure, naming rules, and code style.

## Development Notes

- Understand the current implementation before editing
- Keep changes focused
- Avoid unrelated dependencies
`,
            });

            await refreshAssets();
        } catch (error) {
            showError("assets:create agents-md", error);
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
                    showError("assets:list", error);
                }
            }
        }

        void loadAssets();

        return () => {
            isActive = false;
        };
    }, []);

    return (
        <main style={{padding: 24}}>
            <h1>AgentDock Prototype</h1>

            <p>
                Current scope: asset registry, local editing, and snapshot restore.
            </p>

            <div style={{display: "flex", gap: 8, margin: "24px 0"}}>
                <button onClick={() => void createDemoSkill()}>New Demo Skill</button>
                <button onClick={() => void createDemoAgentsMd()}>
                    New Demo AGENTS.md
                </button>
                <button onClick={() => void refreshAssets()}>Refresh</button>
            </div>

            <div
                style={{
                    display: "grid",
                    gridTemplateColumns: "360px 1fr",
                    gap: 24,
                }}
            >
                <section>
                    <h2>Assets</h2>

                    {assets.length === 0 ? (
                        <p>No assets yet.</p>
                    ) : (
                        <ul style={{paddingLeft: 16}}>
                            {assets.map((asset) => (
                                <li key={asset.id} style={{marginBottom: 12}}>
                                    <button onClick={() => void openAsset(asset.id)}>
                                        {asset.title}
                                    </button>
                                    <div>Type: {asset.type}</div>
                                    <div>Name: {asset.name}</div>
                                    <div>Version: {asset.version}</div>
                                    <div>Status: {asset.status}</div>
                                </li>
                            ))}
                        </ul>
                    )}
                </section>

                <section>
                    <h2>Editor</h2>

                    {!selectedAsset ? (
                        <p>Select an asset to edit.</p>
                    ) : (
                        <div style={{display: "flex", flexDirection: "column", gap: 12}}>
                            <div>
                                <label htmlFor="asset-title">Title</label>
                                <input
                                    id="asset-title"
                                    value={editorTitle}
                                    onChange={(event) => setEditorTitle(event.target.value)}
                                    style={{display: "block", width: "100%", padding: 8}}
                                />
                            </div>

                            <div>
                                <label htmlFor="asset-description">Description</label>
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
                                <label htmlFor="asset-content">Content</label>
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
                                <button onClick={() => void saveAsset()}>Save</button>
                            </div>

                            <p style={{fontSize: 12, opacity: 0.7}}>
                                File path: {selectedAsset.path}
                            </p>

                            <hr />

                            <section>
                                <h3>Snapshots</h3>

                                {snapshots.length === 0 ? (
                                    <p>No snapshots yet. Saving an asset will create one.</p>
                                ) : (
                                    <ul style={{paddingLeft: 16}}>
                                        {snapshots.map((snapshot) => (
                                            <li
                                                key={snapshot.id}
                                                style={{marginBottom: 10}}
                                            >
                                                <div>
                                                    <strong>{snapshot.created_at}</strong>
                                                </div>
                                                <div>{snapshot.message}</div>
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
                                                    Restore
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
