import {type JSX, useMemo, useState} from "react";

import type {AssetType} from "../../../../../packages/core/src/types/asset";
import {useI18n} from "../i18n/useI18n";
import {useAppStore} from "../stores/useAppStore";
import "./Pages.css";

type StarterTemplate = {
    id: string;
    type: AssetType;
    titleKey: string;
    descriptionKey: string;
    iconClassName: string;
    content: string;
};

const STARTER_TEMPLATES: StarterTemplate[] = [
    {
        id: "frontend-review",
        type: "skill",
        titleKey: "demoSkillTitle",
        descriptionKey: "demoSkillDescription",
        iconClassName: "icon-tile-blue",
        content: "# Frontend Review\n\n## Use case\n\nUse when reviewing React and TypeScript projects.\n\n## Focus areas\n\n- Component structure\n- Type safety\n- Maintainability\n",
    },
    {
        id: "release-readiness",
        type: "skill",
        titleKey: "installStarterReleaseTitle",
        descriptionKey: "installStarterReleaseDesc",
        iconClassName: "icon-tile-orange",
        content: "# Release Readiness\n\n## Goal\n\nUse before cutting a release or shipping a risky change.\n\n## Checklist\n\n- Review changelog scope\n- Validate rollback path\n- Confirm monitoring and ownership\n- Capture known risks\n",
    },
    {
        id: "repository-guardrails",
        type: "skill",
        titleKey: "installStarterGuardrailsTitle",
        descriptionKey: "installStarterGuardrailsDesc",
        iconClassName: "icon-tile-purple",
        content: "# Repository Guardrails\n\n## Default behavior\n\n- Prefer focused edits\n- Verify before merging\n- Preserve existing conventions\n- Avoid unrelated refactors\n",
    },
    {
        id: "workspace-agents",
        type: "agents-md",
        titleKey: "installStarterWorkspaceTitle",
        descriptionKey: "installStarterWorkspaceDesc",
        iconClassName: "icon-tile-emerald",
        content: "# AGENTS.md\n\n## Workspace baseline\n\n- Keep changes focused\n- Respect existing project structure\n- Prefer reversible edits\n- Update shared guidance when behavior changes\n",
    },
];

function getOutputPath(template: StarterTemplate): string {
    if (template.type === "agents-md") {
        return "<target-path>/AGENTS.md";
    }

    return `<target-path>/.agentdock/skills/${template.id}/SKILL.md`;
}

export function InstallPage(): JSX.Element {
    const {t} = useI18n();
    const assets = useAppStore((s) => s.assets);
    const createAsset = useAppStore((s) => s.createAsset);
    const openDetailPanel = useAppStore((s) => s.openDetailPanel);
    const pushToast = useAppStore((s) => s.pushToast);
    const [submittingId, setSubmittingId] = useState<string | null>(null);

    const templates = useMemo(
        () =>
            STARTER_TEMPLATES.map((template) => {
                const existingAsset = assets.find((asset) => asset.name === template.id) ?? null;
                return {template, existingAsset};
            }),
        [assets]
    );

    const installedCount = templates.filter((entry) => entry.existingAsset).length;

    async function handleInstall(template: StarterTemplate): Promise<void> {
        try {
            setSubmittingId(template.id);
            const created = await createAsset({
                type: template.type,
                name: template.id,
                title: t(template.titleKey),
                description: t(template.descriptionKey),
                content: template.content,
            });
            pushToast("success", t("newAssetCreated").replace("{name}", created.title));
        } catch (error) {
            pushToast("error", String(error));
        } finally {
            setSubmittingId(null);
        }
    }

    return (
        <div className="view page-assets-view">
            <div className="page-topbar">
                <div className="page-topbar-left">
                    <h1 className="page-topbar-title">{t("navInstall")}</h1>
                    <span className="page-topbar-count">
                        {installedCount}/{templates.length}
                    </span>
                </div>
            </div>

            <div className="page-body install-page-body">
                <section className="install-hero-card">
                    <div>
                        <p className="install-section-eyebrow">{t("installCatalogTitle")}</p>
                        <h2 className="install-hero-title">{t("installTitle")}</h2>
                        <p className="install-hero-description">{t("installCatalogSubtitle")}</p>
                    </div>
                    <div className="install-hero-meta">
                        <div className="install-stat-card">
                            <span>{t("installStatusInstalled")}</span>
                            <strong>{installedCount}</strong>
                        </div>
                        <div className="install-stat-card">
                            <span>{t("installStatusAvailable")}</span>
                            <strong>{templates.length - installedCount}</strong>
                        </div>
                    </div>
                </section>

                <section className="install-grid">
                    {templates.map(({template, existingAsset}) => {
                        const isSubmitting = submittingId === template.id;
                        const isInstalled = Boolean(existingAsset);
                        return (
                            <article key={template.id} className="install-card">
                                <div className="install-card-top">
                                    <div className={`icon-tile ${template.iconClassName}`}>
                                        <span className="install-card-icon-letter">
                                            {t(template.titleKey).charAt(0).toUpperCase()}
                                        </span>
                                    </div>
                                    <span className={`badge ${isInstalled ? "badge-green" : "badge-gray"}`}>
                                        {isInstalled ? t("installStatusInstalled") : t("installStatusAvailable")}
                                    </span>
                                </div>
                                <div className="install-card-body">
                                    <div className="install-card-heading">
                                        <h3>{t(template.titleKey)}</h3>
                                        <span className="badge badge-blue">
                                            {template.type === "skill" ? t("assetTypeSkill") : t("assetTypeAgentsMd")}
                                        </span>
                                    </div>
                                    <p>{t(template.descriptionKey)}</p>
                                </div>
                                <div className="install-card-output">
                                    <span>{t("installOutputLabel")}</span>
                                    <code>{getOutputPath(template)}</code>
                                </div>
                                <div className="install-card-actions">
                                    <button
                                        type="button"
                                        className={`btn ${isInstalled ? "btn-secondary" : "btn-primary"}`}
                                        disabled={isSubmitting}
                                        onClick={() => {
                                            if (existingAsset) {
                                                void openDetailPanel(existingAsset.id);
                                                return;
                                            }
                                            void handleInstall(template);
                                        }}
                                    >
                                        {isSubmitting
                                            ? `${t("installActionInstall")}...`
                                            : isInstalled
                                                ? t("installActionOpen")
                                                : t("installActionInstall")}
                                    </button>
                                </div>
                            </article>
                        );
                    })}
                </section>

                {installedCount === templates.length ? (
                    <section className="install-empty-banner">
                        <p>{t("installCatalogEmpty")}</p>
                    </section>
                ) : null}
            </div>
        </div>
    );
}
