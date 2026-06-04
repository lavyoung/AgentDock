import {type JSX, useEffect, useMemo, useState} from "react";

import type {AssetType, CreateAssetInput} from "../../../../../packages/core/src/types/asset";
import {Button} from "../components/Button";
import {DetailPanel} from "../components/DetailPanel";
import {Modal} from "../components/Modal";
import {useI18n} from "../i18n/useI18n";
import {useAppStore} from "../stores/useAppStore";
import "./Pages.css";

type NewAssetDraft = {
    type: "skill" | "agents-md";
    title: string;
    name: string;
    description: string;
    content: string;
};

const ASSET_ID_PATTERN = /^[a-z0-9-]+$/;

function getDefaultContent(type: NewAssetDraft["type"]): string {
    if (type === "agents-md") {
        return [
            "# AGENTS.md",
            "",
            "## Project rules",
            "",
            "- Follow the project's directory structure and naming conventions",
            "- Keep changes focused and easy to review",
            "- Avoid introducing unrelated dependencies",
            "",
            "## Collaboration notes",
            "",
            "- Understand existing implementation before making changes",
            "- Preserve user-authored content outside AgentDock managed blocks",
            "",
        ].join("\n");
    }

    return [
        "# New Skill",
        "",
        "## Use case",
        "",
        "Describe when this Skill should be used.",
        "",
        "## Instructions",
        "",
        "- Add the key steps the agent should follow",
        "- Keep the scope focused and reusable",
        "",
    ].join("\n");
}

function createSuggestedAssetId(title: string): string {
    return title
        .toLowerCase()
        .trim()
        .replace(/[^a-z0-9\s-]/g, "")
        .replace(/\s+/g, "-")
        .replace(/-+/g, "-")
        .replace(/^-|-$/g, "");
}

function createInitialDraft(type: NewAssetDraft["type"] = "skill"): NewAssetDraft {
    return {
        type,
        title: "",
        name: "",
        description: "",
        content: getDefaultContent(type),
    };
}

function getPreviewMeta(type: NewAssetDraft["type"]): {
    badgeLabel: string;
    badgeClass: string;
    iconClass: string;
    fileName: string;
} {
    if (type === "agents-md") {
        return {
            badgeLabel: "AGENTS.md",
            badgeClass: "badge badge-purple",
            iconClass: "icon-tile icon-tile-purple",
            fileName: "AGENTS.md",
        };
    }

    return {
        badgeLabel: "Skill",
        badgeClass: "badge badge-blue",
        iconClass: "icon-tile icon-tile-blue",
        fileName: "SKILL.md",
    };
}

export function AssetsPage(): JSX.Element {
    const {t} = useI18n();
    const assets = useAppStore((s) => s.assets);
    const assetFilter = useAppStore((s) => s.assetFilter);
    const assetTypeFilter = useAppStore((s) => s.assetTypeFilter);
    const assetSearch = useAppStore((s) => s.assetSearch);
    const refreshAssets = useAppStore((s) => s.refreshAssets);
    const createAsset = useAppStore((s) => s.createAsset);
    const pushToast = useAppStore((s) => s.pushToast);
    const setAssetFilter = useAppStore((s) => s.setAssetFilter);
    const setAssetTypeFilter = useAppStore((s) => s.setAssetTypeFilter);
    const setAssetSearch = useAppStore((s) => s.setAssetSearch);

    const [isNewAssetModalOpen, setIsNewAssetModalOpen] = useState(false);
    const [newAssetDraft, setNewAssetDraft] = useState<NewAssetDraft>(() => createInitialDraft());
    const [assetIdTouched, setAssetIdTouched] = useState(false);
    const [isCreatingAsset, setIsCreatingAsset] = useState(false);

    useEffect(() => {
        void refreshAssets();
    }, [refreshAssets]);

    const filtered = useMemo(() => {
        return assets.filter((asset) => {
            const enabled = asset.status === "active";
            if (assetFilter === "enabled" && !enabled) return false;
            if (assetFilter === "disabled" && enabled) return false;
            if (assetTypeFilter !== "all" && asset.type !== assetTypeFilter) return false;
            if (assetSearch) {
                const query = assetSearch.toLowerCase();
                if (
                    !asset.title.toLowerCase().includes(query) &&
                    !asset.description?.toLowerCase().includes(query) &&
                    !asset.name.toLowerCase().includes(query)
                ) {
                    return false;
                }
            }
            return true;
        });
    }, [assets, assetFilter, assetSearch, assetTypeFilter]);

    const visibleCount = filtered.length;
    const totalCount = assets.length;

    function openNewAssetModal(): void {
        setNewAssetDraft(createInitialDraft());
        setAssetIdTouched(false);
        setIsCreatingAsset(false);
        setIsNewAssetModalOpen(true);
    }

    function closeNewAssetModal(): void {
        if (isCreatingAsset) return;
        setIsNewAssetModalOpen(false);
    }

    function updateDraft<K extends keyof NewAssetDraft>(key: K, value: NewAssetDraft[K]): void {
        setNewAssetDraft((current) => ({...current, [key]: value}));
    }

    function handleAssetTypeChange(type: NewAssetDraft["type"]): void {
        setNewAssetDraft((current) => {
            const previousTemplate = getDefaultContent(current.type);
            const nextTemplate = getDefaultContent(type);
            const shouldReplaceContent = !current.content.trim() || current.content === previousTemplate;

            return {
                ...current,
                type,
                content: shouldReplaceContent ? nextTemplate : current.content,
            };
        });
    }

    function handleTitleChange(value: string): void {
        setNewAssetDraft((current) => ({
            ...current,
            title: value,
            name: assetIdTouched ? current.name : createSuggestedAssetId(value),
        }));
    }

    async function handleCreateAsset(): Promise<void> {
        const title = newAssetDraft.title.trim();
        const name = newAssetDraft.name.trim();
        const content = newAssetDraft.content.trim();

        if (!title) {
            pushToast("error", t("newAssetValidationTitle"));
            return;
        }

        if (!name || !ASSET_ID_PATTERN.test(name)) {
            pushToast("error", t("newAssetValidationId"));
            return;
        }

        if (!content) {
            pushToast("error", t("newAssetValidationContent"));
            return;
        }

        const input: CreateAssetInput = {
            type: newAssetDraft.type,
            name,
            title,
            description: newAssetDraft.description.trim(),
            content: newAssetDraft.content,
        };

        setIsCreatingAsset(true);

        try {
            await createAsset(input);
            pushToast("success", t("newAssetCreated").replace("{name}", title));
            setIsNewAssetModalOpen(false);
        } catch (error) {
            pushToast("error", String(error));
        } finally {
            setIsCreatingAsset(false);
        }
    }

    const previewMeta = getPreviewMeta(newAssetDraft.type);

    return (
        <div className="view page-assets-view">
            <div className="page-topbar">
                <div className="page-topbar-left">
                    <h1 className="page-topbar-title">{t("assetsTitle")}</h1>
                    <span className="page-topbar-count" aria-label="Showing">
                        {visibleCount} / {totalCount} {t("assetsUnit")}
                    </span>
                </div>
                <div className="page-topbar-actions">
                    <button
                        type="button"
                        className="btn btn-tool assets-toolbar-button"
                        aria-label={t("skillsBackup")}
                    >
                        <svg
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="2"
                            width="16"
                            height="16"
                            aria-hidden="true"
                        >
                            <path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4M17 8l-5-5-5 5M12 3v12" />
                        </svg>
                        <span>{t("skillsBackup")}</span>
                    </button>
                    <button
                        type="button"
                        className="btn btn-tool assets-toolbar-button"
                        onClick={() => void refreshAssets()}
                        aria-label={t("skillsCheckAll")}
                    >
                        <svg
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="2"
                            width="16"
                            height="16"
                            aria-hidden="true"
                        >
                            <path d="M9 11l3 3L22 4" />
                            <path d="M21 12v7a2 2 0 01-2 2H5a2 2 0 01-2-2V5a2 2 0 012-2h11" />
                        </svg>
                        <span>{t("skillsCheckAll")}</span>
                    </button>
                    <Button
                        type="button"
                        variant="primary"
                        className="assets-toolbar-button"
                        aria-label={t("skillsNewAsset")}
                        onClick={openNewAssetModal}
                    >
                        <svg
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="2"
                            width="16"
                            height="16"
                            aria-hidden="true"
                        >
                            <path d="M12 5v14M5 12h14" />
                        </svg>
                        <span>{t("skillsNewAsset")}</span>
                    </Button>
                    <button
                        type="button"
                        className="btn btn-outline-emerald assets-toolbar-button"
                        aria-label={t("skillsUpdateAll")}
                    >
                        <svg
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="2"
                            width="16"
                            height="16"
                            aria-hidden="true"
                        >
                            <path d="M1 4v6h6M23 20v-6h-6" />
                            <path d="M20.49 9A9 9 0 005.64 5.64L1 10m22 4l-4.64 4.36A9 9 0 013.51 15" />
                        </svg>
                        <span>{t("skillsUpdateAll")}</span>
                    </button>
                </div>
            </div>

            <div className="page-body">
                <div className="page-filters">
                    <div className="search-wrap">
                        <svg
                            className="search-icon"
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="2"
                            aria-hidden="true"
                        >
                            <circle cx="11" cy="11" r="8" />
                            <line x1="21" y1="21" x2="16.65" y2="16.65" />
                        </svg>
                        <input
                            type="text"
                            className="search-input"
                            placeholder={t("skillsSearchPlaceholder")}
                            aria-label={t("skillsSearchPlaceholder")}
                            value={assetSearch}
                            onChange={(event) => setAssetSearch(event.target.value)}
                        />
                    </div>
                    <div className="tab-group" role="tablist" aria-label="Status filter">
                        <button
                            type="button"
                            className={`tab-btn ${assetFilter === "all" ? "active" : ""}`}
                            onClick={() => setAssetFilter("all")}
                            role="tab"
                            aria-selected={assetFilter === "all"}
                        >
                            {t("commonTabAll")}
                        </button>
                        <button
                            type="button"
                            className={`tab-btn ${assetFilter === "enabled" ? "active" : ""}`}
                            onClick={() => setAssetFilter("enabled")}
                            role="tab"
                            aria-selected={assetFilter === "enabled"}
                        >
                            {t("commonTabEnabled")}
                        </button>
                        <button
                            type="button"
                            className={`tab-btn ${assetFilter === "disabled" ? "active" : ""}`}
                            onClick={() => setAssetFilter("disabled")}
                            role="tab"
                            aria-selected={assetFilter === "disabled"}
                        >
                            {t("commonTabDisabled")}
                        </button>
                    </div>
                    <div className="tab-group" role="tablist" aria-label="Asset type filter">
                        <button
                            type="button"
                            className={`tab-btn ${assetTypeFilter === "all" ? "active" : ""}`}
                            onClick={() => setAssetTypeFilter("all")}
                            role="tab"
                            aria-selected={assetTypeFilter === "all"}
                        >
                            {t("assetsFilterAll")}
                        </button>
                        <button
                            type="button"
                            className={`tab-btn ${assetTypeFilter === "skill" ? "active" : ""}`}
                            onClick={() => setAssetTypeFilter("skill")}
                            role="tab"
                            aria-selected={assetTypeFilter === "skill"}
                        >
                            Skill
                        </button>
                        <button
                            type="button"
                            className={`tab-btn ${assetTypeFilter === "agents-md" ? "active" : ""}`}
                            onClick={() => setAssetTypeFilter("agents-md")}
                            role="tab"
                            aria-selected={assetTypeFilter === "agents-md"}
                        >
                            AGENTS.md
                        </button>
                    </div>
                </div>

                {filtered.length === 0 ? (
                    <div className="assets-empty">
                        <svg
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="1.5"
                            className="empty-icon"
                            aria-hidden="true"
                        >
                            <path d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                        </svg>
                        <p>{t("assetsEmpty")}</p>
                    </div>
                ) : (
                    <div className="skills-grid">
                        {filtered.map((asset) => (
                            <AssetCard key={asset.id} asset={asset} />
                        ))}
                    </div>
                )}
            </div>

            <Modal
                open={isNewAssetModalOpen}
                title={t("newAssetTitle")}
                onClose={closeNewAssetModal}
                width={960}
                footer={(
                    <>
                        <button
                            type="button"
                            className="btn btn-secondary btn-md"
                            onClick={closeNewAssetModal}
                            disabled={isCreatingAsset}
                        >
                            {t("close")}
                        </button>
                        <button
                            type="button"
                            className="btn btn-primary btn-md"
                            onClick={() => void handleCreateAsset()}
                            disabled={isCreatingAsset}
                        >
                            {isCreatingAsset ? `${t("newAssetCreate")}...` : t("newAssetCreate")}
                        </button>
                    </>
                )}
            >
                <div
                    className="new-asset-layout"
                    onKeyDown={(event) => {
                        if ((event.metaKey || event.ctrlKey) && event.key === "Enter") {
                            event.preventDefault();
                            void handleCreateAsset();
                        }
                    }}
                >
                    <div className="new-asset-form">
                        <div className="new-asset-section-title">{t("newAssetType")}</div>
                        <div className="new-asset-type-picker" role="radiogroup" aria-label={t("newAssetType")}>
                            <button
                                type="button"
                                className={`new-asset-type-card ${newAssetDraft.type === "skill" ? "active" : ""}`}
                                role="radio"
                                aria-checked={newAssetDraft.type === "skill"}
                                onClick={() => handleAssetTypeChange("skill")}
                            >
                                <div className="new-asset-type-header">
                                    <div className="icon-tile icon-tile-blue">
                                        <AssetPreviewIcon type="skill" />
                                    </div>
                                    <span className="badge badge-blue">Skill</span>
                                </div>
                                <div className="new-asset-type-title">Skill</div>
                                <p className="new-asset-type-desc">{t("newAssetTypeSkillDesc")}</p>
                            </button>
                            <button
                                type="button"
                                className={`new-asset-type-card ${newAssetDraft.type === "agents-md" ? "active" : ""}`}
                                role="radio"
                                aria-checked={newAssetDraft.type === "agents-md"}
                                onClick={() => handleAssetTypeChange("agents-md")}
                            >
                                <div className="new-asset-type-header">
                                    <div className="icon-tile icon-tile-purple">
                                        <AssetPreviewIcon type="agents-md" />
                                    </div>
                                    <span className="badge badge-purple">AGENTS.md</span>
                                </div>
                                <div className="new-asset-type-title">AGENTS.md</div>
                                <p className="new-asset-type-desc">{t("newAssetTypeAgentsMdDesc")}</p>
                            </button>
                        </div>

                        <div className="new-asset-form-grid">
                            <div className="field field-compact">
                                <label htmlFor="new-asset-title">{t("newAssetTitleLabel")}</label>
                                <input
                                    id="new-asset-title"
                                    type="text"
                                    value={newAssetDraft.title}
                                    onChange={(event) => handleTitleChange(event.target.value)}
                                    autoFocus
                                />
                            </div>
                            <div className="field field-compact">
                                <label htmlFor="new-asset-name">{t("newAssetIdLabel")}</label>
                                <input
                                    id="new-asset-name"
                                    type="text"
                                    value={newAssetDraft.name}
                                    onChange={(event) => {
                                        setAssetIdTouched(true);
                                        updateDraft("name", event.target.value);
                                    }}
                                />
                            </div>
                        </div>

                        <div className="field field-compact">
                            <label htmlFor="new-asset-description">{t("newAssetDescLabel")}</label>
                            <textarea
                                id="new-asset-description"
                                rows={3}
                                value={newAssetDraft.description}
                                onChange={(event) => updateDraft("description", event.target.value)}
                            />
                        </div>

                        <div className="field field-compact new-asset-editor-field">
                            <div className="new-asset-editor-label-row">
                                <label htmlFor="new-asset-content">{t("newAssetContentLabel")}</label>
                                <button
                                    type="button"
                                    className="btn btn-ghost btn-sm"
                                    onClick={() => updateDraft("content", getDefaultContent(newAssetDraft.type))}
                                >
                                    {t("newAssetResetTemplate")}
                                </button>
                            </div>
                            <textarea
                                id="new-asset-content"
                                className="editor"
                                value={newAssetDraft.content}
                                onChange={(event) => updateDraft("content", event.target.value)}
                                spellCheck={false}
                                rows={14}
                            />
                            <span className="field-hint">{t("newAssetContentHint")}</span>
                        </div>
                    </div>

                    <aside className="new-asset-preview-panel">
                        <div className="new-asset-section-title">{t("newAssetPreview")}</div>
                        <div className="new-asset-preview-card">
                            <div className="new-asset-preview-header">
                                <div className={previewMeta.iconClass}>
                                    <AssetPreviewIcon type={newAssetDraft.type} />
                                </div>
                                <span className={previewMeta.badgeClass}>{previewMeta.badgeLabel}</span>
                            </div>
                            <div className="new-asset-preview-body">
                                <div className="new-asset-preview-title">
                                    {newAssetDraft.title.trim() || t("newAssetTitle")}
                                </div>
                                <div className="new-asset-preview-desc">
                                    {newAssetDraft.description.trim() || t("newAssetPreviewHint")}
                                </div>
                            </div>
                            <div className="new-asset-preview-footer">
                                <span className="meta-item">
                                    <svg
                                        viewBox="0 0 24 24"
                                        fill="none"
                                        stroke="currentColor"
                                        strokeWidth="2"
                                        className="meta-icon"
                                        aria-hidden="true"
                                    >
                                        <path d="M4 4h16v16H4z" />
                                        <path d="M8 8h8M8 12h8M8 16h5" />
                                    </svg>
                                    {previewMeta.fileName}
                                </span>
                                <span className="sync-pill pending">
                                    <span className="pill-dot" />
                                    <span>Pending</span>
                                </span>
                            </div>
                            <div className="new-asset-preview-id">
                                {newAssetDraft.name.trim() || "new-asset-id"}
                            </div>
                        </div>
                        <p className="form-hint">{t("newAssetPreviewHint")}</p>
                    </aside>
                </div>
            </Modal>

            <DetailPanel />
        </div>
    );
}

function AssetCard({
    asset,
}: {
    asset: {
        id: string;
        type: string;
        title: string;
        description?: string;
        status: string;
        name: string;
        version: string;
    };
}): JSX.Element {
    const openDetailPanel = useAppStore((s) => s.openDetailPanel);
    const toggleAssetStatus = useAppStore((s) => s.toggleAssetStatus);
    const {t} = useI18n();
    const isEnabled = asset.status === "active";
    const isRule = asset.type === "rule";
    const isAgentsMd = asset.type === "agents-md";

    const iconBg = isAgentsMd
        ? "icon-tile icon-tile-purple"
        : isRule
            ? "icon-tile icon-tile-red"
            : "icon-tile icon-tile-blue";

    const badgeClass = isAgentsMd
        ? "badge badge-purple"
        : isRule
            ? "badge badge-orange"
            : "badge badge-green";

    const cardClass = [
        "skill-card",
        isRule ? "rule-card" : "",
        isRule ? "rule-card-severity-error" : "",
    ]
        .filter(Boolean)
        .join(" ");

    return (
        <div
            className={cardClass}
            data-enabled={isEnabled}
            data-asset-type={asset.type}
            onClick={() => void openDetailPanel(asset.id)}
            role="button"
            tabIndex={0}
            onKeyDown={(event) => {
                if (event.key === "Enter" || event.key === " ") {
                    void openDetailPanel(asset.id);
                }
            }}
        >
            <div className="skill-card-top">
                <div className={iconBg}>
                    <AssetPreviewIcon type={isAgentsMd ? "agents-md" : "skill"} />
                </div>
                <span className={badgeClass}>
                    {isAgentsMd ? "AGENTS.md" : isRule ? "Rule" : "AI"}
                </span>
            </div>
            <div className="skill-card-body">
                <h3 className="skill-card-title">{asset.title}</h3>
                <p className="skill-card-desc">{asset.description || t("selectAsset")}</p>
            </div>
            <div className="skill-card-footer">
                <div className="skill-card-meta">
                    <span className="meta-item">
                        <svg
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="2"
                            className="meta-icon"
                            aria-hidden="true"
                        >
                            <rect x="2" y="2" width="20" height="8" rx="2" ry="2" />
                            <rect x="2" y="14" width="20" height="8" rx="2" ry="2" />
                            <line x1="6" y1="6" x2="6.01" y2="6" />
                            <line x1="6" y1="18" x2="6.01" y2="18" />
                        </svg>
                        {asset.name}
                    </span>
                    <span className="meta-version">v{asset.version}</span>
                </div>
                <button
                    type="button"
                    className="toggle"
                    data-state={isEnabled ? "on" : "off"}
                    role="switch"
                    aria-checked={isEnabled}
                    aria-label={t("toggleEnabled")}
                    onClick={(event) => {
                        event.stopPropagation();
                        void toggleAssetStatus(asset.id);
                    }}
                >
                    <span />
                </button>
            </div>
        </div>
    );
}

function AssetPreviewIcon({type}: {type: AssetType}): JSX.Element {
    return (
        <svg
            className="w-5 h-5"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            aria-hidden="true"
        >
            {type === "agents-md" ? (
                <>
                    <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                    <polyline points="14 2 14 8 20 8" />
                    <line x1="16" y1="13" x2="8" y2="13" />
                    <line x1="16" y1="17" x2="8" y2="17" />
                    <polyline points="10 9 9 9 8 9" />
                </>
            ) : (
                <>
                    <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z" />
                </>
            )}
        </svg>
    );
}
