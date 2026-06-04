import {type JSX} from "react";

import {useI18n} from "../i18n/useI18n";
import {useAppStore} from "../stores/useAppStore";
import "./Pages.css";

interface AgentRow {
    name: string;
    active: boolean;
    installed: boolean;
    refSkills: number;
    refRules: number;
}

const AGENT_ROWS: AgentRow[] = [
    {name: "OpenCode", active: true, installed: true, refSkills: 12, refRules: 0},
    {name: "Claude Code", active: false, installed: false, refSkills: 0, refRules: 0},
    {name: "Gemini CLI", active: false, installed: false, refSkills: 0, refRules: 0},
    {name: "Windsurf", active: false, installed: false, refSkills: 0, refRules: 0},
    {name: "CodeBuddy", active: false, installed: false, refSkills: 0, refRules: 0},
    {name: "Cursor CLI", active: false, installed: false, refSkills: 0, refRules: 0},
    {name: "Copilot CLI", active: false, installed: false, refSkills: 0, refRules: 0},
];

export function OverviewPage(): JSX.Element {
    const {t} = useI18n();
    const assets = useAppStore((s) => s.assets);
    const enabledCount = assets.filter((a) => a.status === "active").length;
    const activatedAgents = AGENT_ROWS.filter((a) => a.active).length;

    return (
        <div className="view page-overview">
            <div className="page-topbar">
                <h1 className="page-topbar-title">{t("overviewTitle")}</h1>
            </div>

            <div className="page-body overview-page-body">
                <div className="overview-stats-grid">
                    <div className="overview-stat-card">
                        <div className="overview-stat-label">
                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="14" height="14" className="overview-icon overview-icon-green" aria-hidden="true">
                                <path d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                            </svg>
                            <span>{t("overviewTotalSkills")}</span>
                        </div>
                        <div className="overview-stat-value">{enabledCount}</div>
                    </div>

                    <div className="overview-stat-card">
                        <div className="overview-stat-label">
                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="14" height="14" className="overview-icon overview-icon-blue" aria-hidden="true">
                                <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
                            </svg>
                            <span>{t("overviewTotalRules")}</span>
                        </div>
                        <div className="overview-stat-value overview-stat-value-muted">
                            -
                            <span className="overview-stat-suffix">{t("overviewRulesPending")}</span>
                        </div>
                    </div>

                    <div className="overview-stat-card">
                        <div className="overview-stat-label">
                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="14" height="14" className="overview-icon overview-icon-purple" aria-hidden="true">
                                <rect x="3" y="3" width="18" height="18" rx="2" ry="2" />
                                <line x1="3" y1="9" x2="21" y2="9" />
                                <line x1="9" y1="21" x2="9" y2="9" />
                            </svg>
                            <span>{t("overviewTotalScenarios")}</span>
                        </div>
                        <div className="overview-stat-value">1</div>
                    </div>

                    <div className="overview-stat-card">
                        <div className="overview-stat-label">
                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="14" height="14" className="overview-icon overview-icon-orange" aria-hidden="true">
                                <rect x="4" y="4" width="16" height="16" rx="2" ry="2" />
                                <rect x="9" y="9" width="6" height="6" />
                                <line x1="9" y1="1" x2="9" y2="4" />
                                <line x1="15" y1="1" x2="15" y2="4" />
                                <line x1="9" y1="20" x2="9" y2="23" />
                                <line x1="15" y1="20" x2="15" y2="23" />
                                <line x1="20" y1="9" x2="23" y2="9" />
                                <line x1="20" y1="14" x2="23" y2="14" />
                                <line x1="1" y1="9" x2="4" y2="9" />
                                <line x1="1" y1="14" x2="4" y2="14" />
                            </svg>
                            <span>{t("overviewTotalAgents")}</span>
                        </div>
                        <div className="overview-stat-value">
                            {activatedAgents}
                            <span className="overview-stat-ratio">/ {AGENT_ROWS.length}</span>
                        </div>
                    </div>
                </div>

                <section className="overview-panel">
                    <div className="overview-panel-header">
                        <span className="overview-panel-accent" aria-hidden="true" />
                        <h2>{t("overviewAgentBreakdown")}</h2>
                    </div>

                    <div className="overview-agent-row header">
                        <div>AGENT</div>
                        <div>{t("overviewRefSkills")}</div>
                        <div>{t("overviewRefRules")}</div>
                        <div className="overview-agent-status-header">{t("overviewStatusEnabled")}</div>
                    </div>

                    {AGENT_ROWS.map((agent) => (
                        <div key={agent.name} className="overview-agent-row">
                            <div className="overview-agent-name">
                                <span
                                    className={`mini-radio ${agent.active ? "active" : "empty"}`}
                                    aria-label={agent.active ? t("overviewAgentActive") : t("overviewAgentInactive")}
                                />
                                <span className="overview-agent-name-text">{agent.name}</span>
                            </div>
                            <div className={`overview-agent-value ${agent.refSkills > 0 ? "has-value" : ""}`}>
                                {agent.refSkills || ""}
                            </div>
                            <div className="overview-agent-value">{agent.refRules || ""}</div>
                            <div className="overview-agent-status">
                                {agent.active ? (
                                    <span className="badge badge-green">{t("overviewStatusEnabled")}</span>
                                ) : (
                                    <span className="badge badge-gray">{t("overviewStatusUninstalled")}</span>
                                )}
                            </div>
                        </div>
                    ))}
                </section>
            </div>
        </div>
    );
}
