import {useEffect, useState} from "react";
import "./App.css";

type Asset = {
    id: string;
    type: string;
    name: string;
    title: string;
    description: string;
    version: string;
    status: string;
    path: string;
};

type AssetDetail = Asset & {
    content: string;
};

type Snapshot = {
    id: string;
    asset_id: string;
    snapshot_path: string;
    message: string;
    created_at: string;
};

function App() {
    const [assets, setAssets] = useState<Asset[]>([]);
    const [selectedAsset, setSelectedAsset] = useState<AssetDetail | null>(null);
    const [snapshots, setSnapshots] = useState<Snapshot[]>([]);

    const [editorTitle, setEditorTitle] = useState("");
    const [editorDescription, setEditorDescription] = useState("");
    const [editorContent, setEditorContent] = useState("");

    async function refreshAssets() {
        try {
            const result = await window.agentdock.assets.list();
            setAssets(result);
        } catch (error) {
            console.error("assets:list failed", error);
            alert(`assets:list failed: ${String(error)}`);
        }
    }

    async function refreshSnapshots(assetId: string) {
        try {
            const result = await window.agentdock.snapshots.list(assetId);
            setSnapshots(result);
        } catch (error) {
            console.error("snapshots:list failed", error);
            alert(`snapshots:list failed: ${String(error)}`);
        }
    }

    async function openAsset(id: string) {
        try {
            const detail = await window.agentdock.assets.get(id);

            setSelectedAsset(detail);
            setEditorTitle(detail.title ?? "");
            setEditorDescription(detail.description ?? "");
            setEditorContent(detail.content ?? "");

            await refreshSnapshots(id);
        } catch (error) {
            console.error("assets:get failed", error);
            alert(`assets:get failed: ${String(error)}`);
        }
    }

    async function saveAsset() {
        if (!selectedAsset) return;

        try {
            const updated = await window.agentdock.assets.update(selectedAsset.id, {
                title: editorTitle,
                description: editorDescription,
                content: editorContent,
            });

            setSelectedAsset(updated);

            await refreshAssets();
            await refreshSnapshots(selectedAsset.id);
        } catch (error) {
            console.error("assets:update failed", error);
            alert(`assets:update failed: ${String(error)}`);
        }
    }

    async function createDemoSkill() {
        try {
            const timestamp = Date.now();

            await window.agentdock.assets.create({
                type: "skill",
                name: `frontend-review-${timestamp}`,
                title: "前端代码审查",
                description: "用于审查前端项目规范和实现细节",
                content: `# 前端代码审查

## 使用场景

当需要审查 React、Vue、TypeScript 前端代码时使用。

## 检查重点

- 组件结构
- 类型定义
- 可维护性
- 可访问性
`,
            });

            await refreshAssets();
        } catch (error) {
            console.error("assets:create skill failed", error);
            alert(`assets:create skill failed: ${String(error)}`);
        }
    }

    async function createDemoAgentsMd() {
        try {
            const timestamp = Date.now();

            await window.agentdock.assets.create({
                type: "agents-md",
                name: `frontend-agents-${timestamp}`,
                title: "前端项目 AGENTS.md",
                description: "用于前端项目的 Agent 协作规则",
                content: `# AGENTS.md

## 项目规则

请遵循当前项目的目录结构、命名规范和代码风格。

## 开发要求

- 修改前先理解现有实现
- 保持改动范围清晰
- 不引入无关依赖
`,
            });

            await refreshAssets();
        } catch (error) {
            console.error("assets:create agents-md failed", error);
            alert(`assets:create agents-md failed: ${String(error)}`);
        }
    }

    useEffect(() => {
        refreshAssets();
    }, []);

    return (
        <main style={{ padding: 24 }}>
            <h1>AgentDock Prototype</h1>

            <p>当前阶段：Asset 管理、本地 Registry、编辑保存、本地快照。</p>

            <div style={{ display: "flex", gap: 8, marginBottom: 24 }}>
                <button onClick={createDemoSkill}>New Demo Skill</button>
                <button onClick={createDemoAgentsMd}>New Demo AGENTS.md</button>
                <button onClick={refreshAssets}>Refresh</button>
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
                        <p>暂无 Asset。</p>
                    ) : (
                        <ul style={{ paddingLeft: 16 }}>
                            {assets.map((asset) => (
                                <li key={asset.id} style={{ marginBottom: 12 }}>
                                    <button onClick={() => openAsset(asset.id)}>
                                        {asset.title}
                                    </button>
                                    <div>类型：{asset.type}</div>
                                    <div>名称：{asset.name}</div>
                                    <div>版本：{asset.version}</div>
                                    <div>状态：{asset.status}</div>
                                </li>
                            ))}
                        </ul>
                    )}
                </section>

                <section>
                    <h2>Editor</h2>

                    {!selectedAsset ? (
                        <p>请选择一个 Asset。</p>
                    ) : (
                        <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                            <div>
                                <label>标题</label>
                                <input
                                    value={editorTitle}
                                    onChange={(event) => setEditorTitle(event.target.value)}
                                    style={{ display: "block", width: "100%", padding: 8 }}
                                />
                            </div>

                            <div>
                                <label>描述</label>
                                <input
                                    value={editorDescription}
                                    onChange={(event) =>
                                        setEditorDescription(event.target.value)
                                    }
                                    style={{ display: "block", width: "100%", padding: 8 }}
                                />
                            </div>

                            <div>
                                <label>内容</label>
                                <textarea
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
                                <button onClick={saveAsset}>Save</button>
                            </div>

                            <p style={{ fontSize: 12, opacity: 0.7 }}>
                                文件路径：{selectedAsset.path}
                            </p>

                            <hr />

                            <section>
                                <h3>Snapshots</h3>

                                {snapshots.length === 0 ? (
                                    <p>暂无快照。保存一次后会生成快照。</p>
                                ) : (
                                    <ul style={{ paddingLeft: 16 }}>
                                        {snapshots.map((snapshot) => (
                                            <li key={snapshot.id} style={{ marginBottom: 10 }}>
                                                <div>
                                                    <strong>{snapshot.created_at}</strong>
                                                </div>
                                                <div>{snapshot.message}</div>
                                                <div style={{ fontSize: 12, opacity: 0.7 }}>
                                                    {snapshot.snapshot_path}
                                                </div>
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