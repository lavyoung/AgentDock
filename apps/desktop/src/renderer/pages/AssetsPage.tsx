import {type JSX, useEffect, useMemo} from "react";

import {useI18n} from "../i18n/useI18n";
import {useAppStore} from "../stores/useAppStore";
import {DetailPanel} from "../components/DetailPanel";
import "./Pages.css";

export function AssetsPage(): JSX.Element {
    const {t} = useI18n();
    const assets = useAppStore((s) => s.assets);
    const assetFilter = useAppStore((s) => s.assetFilter);
    const assetTypeFilter = useAppStore((s) => s.assetTypeFilter);
    const assetSearch = useAppStore((s) => s.assetSearch);
        const refreshAssets = useAppStore((s) => s.refreshAssets);
    const createDemoSkill = useAppStore((s) => s.createDemoSkill);
    const createDemoAgentsMd = useAppStore((s) => s.createDemoAgentsMd);
    void createDemoAgentsMd;
    const setAssetFilter = useAppStore((s) => s.setAssetFilter);
    const setAssetTypeFilter = useAppStore((s) => s.setAssetTypeFilter);
    const setAssetSearch = useAppStore((s) => s.setAssetSearch);

    useEffect(() => {
        void refreshAssets();
    }, [refreshAssets]);

    const filtered = useMemo(() => {
        return assets.filter((a) => {
            const enabled = a.status === "active";
            if (assetFilter === "enabled" && !enabled) return false;
            if (assetFilter === "disabled" && enabled) return false;
            if (assetTypeFilter !== "all" && a.type !== assetTypeFilter) return false;
            if (assetSearch) {
                const q = assetSearch.toLowerCase();
                if (
                    !a.title.toLowerCase().includes(q) &&
                    !a.description?.toLowerCase().includes(q) &&
                    !a.name.toLowerCase().includes(q)
                )
                    return false;
            }
            return true;
        });
    }, [assets, assetFilter, assetTypeFilter, assetSearch]);

    const visibleCount = filtered.length;
    const totalCount = assets.length;

    return (
        <div className="view page-assets-view">
            {/* ---- Header (proto: h-16 px-8) ---- */}
            <div className="page-topbar">
                <div className="page-topbar-left">
                    <h1 className="page-topbar-title">
                        {t("assetsTitle")}
                    </h1>
                    <span className="page-topbar-count" style={{color: "var(--fg-faint)", fontSize: "14px"}} aria-label="Showing">
                        {visibleCount} / {totalCount} {t("assetsUnit")}
                    </span>
                </div>
                <div className="page-topbar-actions" style={{display: "flex", alignItems: "center", gap: "8px"}}>
                    {/* Proto: 备份 + 检查全部 */}
                    <button
                        type="button"
                        className="btn btn-tool"
                        aria-label={t("skillsBackup")}
                        style={{height: "36px", padding: "0 14px", background: "var(--bg-card)", border: "1px solid var(--bd)", color: "var(--fg-muted)", borderRadius: "6px", display: "flex", alignItems: "center", gap: "6px", fontSize: "13px", cursor: "pointer"}}
                    >
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="16" height="16" aria-hidden="true">
                            <path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4M17 8l-5-5-5 5M12 3v12"/>
                        </svg>
                        <span>{t("skillsBackup")}</span>
                    </button>
                    <button
                        type="button"
                        className="btn btn-tool"
                        onClick={() => void refreshAssets()}
                        aria-label={t("skillsCheckAll")}
                        style={{height: "36px", padding: "0 14px", background: "var(--bg-card)", border: "1px solid var(--bd)", color: "var(--fg-muted)", borderRadius: "6px", display: "flex", alignItems: "center", gap: "6px", fontSize: "13px", cursor: "pointer"}}
                    >
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="16" height="16" aria-hidden="true">
                            <path d="M9 11l3 3L22 4"/><path d="M21 12v7a2 2 0 01-2 2H5a2 2 0 01-2-2V5a2 2 0 012-2h11"/>
                        </svg>
                        <span>{t("skillsCheckAll")}</span>
                    </button>
                    <button
                        type="button"
                        className="btn btn-primary"
                        aria-label={t("skillsNewAsset")}
                        style={{height: "36px", padding: "0 14px", background: "var(--accent)", color: "#fff", borderRadius: "6px", display: "flex", alignItems: "center", gap: "6px", fontSize: "13px", fontWeight: 500, cursor: "pointer", border: "none"}}
                        onClick={() => void createDemoSkill()}
                    >
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="16" height="16" aria-hidden="true">
                            <path d="M12 5v14M5 12h14"/>
                        </svg>
                        <span>{t("skillsNewAsset")}</span>
                    </button>
                    <button
                        type="button"
                        className="btn btn-outline-emerald"
                        aria-label={t("skillsUpdateAll")}
                        style={{height: "36px", padding: "0 14px", border: "1px solid rgba(34,197,94,.40)", color: "var(--accent)", borderRadius: "6px", display: "flex", alignItems: "center", gap: "6px", fontSize: "13px", cursor: "pointer", background: "transparent"}}
                    >
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="16" height="16" aria-hidden="true">
                            <path d="M1 4v6h6M23 20v-6h-6"/><path d="M20.49 9A9 9 0 005.64 5.64L1 10m22 4l-4.64 4.36A9 9 0 013.51 15"/>
                        </svg>
                        <span>{t("skillsUpdateAll")}</span>
                    </button>
                </div>
            </div>

            {/* ---- Body ---- */}
            <div className="page-body">
                {/* Search + Filters */}
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
                            onChange={(e) => setAssetSearch(e.target.value)}
                        />
                    </div>
                    <div className="tab-group" role="tablist" aria-label="Status filter">
                        <button
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
                    <div className="tab-group" role="tablist" aria-label="类型过滤">
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

                {/* Grid */}
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

            {/* Detail Panel */}
            <DetailPanel />
        </div>
    );
}

function AssetCard({asset}: {asset: {id: string; type: string; title: string; description?: string; status: string; name: string; version: string}}) {
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
        isRule ? `rule-card-severity-${isRule ? "error" : ""}` : "",
    ]
        .filter(Boolean)
        .join(" ");

    const Icon = () => (
        <svg
            className="w-5 h-5"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            aria-hidden="true"
        >
            <path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z" />
            <polyline points="14 2 14 8 20 8" />
            <line x1="16" y1="13" x2="8" y2="13" />
            <line x1="16" y1="17" x2="8" y2="17" />
            <polyline points="10 9 9 9 8 9" />
        </svg>
    );

    return (
        <div
            className={cardClass}
            data-enabled={isEnabled}
            data-asset-type={asset.type}
            onClick={() => void openDetailPanel(asset.id)}
            role="button"
            tabIndex={0}
            onKeyDown={(e) => {
                if (e.key === "Enter" || e.key === " ") void openDetailPanel(asset.id);
            }}
        >
            <div className="skill-card-top">
                <div className={iconBg}>
                    <Icon />
                </div>
                <span className={badgeClass}>
                    {isAgentsMd ? "AGENTS.md" : isRule ? "Rule" : "AI"}
                </span>
            </div>
            <div className="skill-card-body">
                <h3 className="skill-card-title">{asset.title}</h3>
                <p className="skill-card-desc">
                    {asset.description || t("selectAsset")}
                </p>
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
                    onClick={(e) => {
                        e.stopPropagation();
                        void toggleAssetStatus(asset.id);
                    }}
                >
                    <span />
                </button>
            </div>
        </div>
    );
}
