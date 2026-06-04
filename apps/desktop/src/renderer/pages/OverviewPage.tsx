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
                <h1 style={{fontSize: "20px", fontWeight: 600, color: "var(--fg-primary)", margin: 0}}>
                    {t("overviewTitle")}
                </h1>
            </div>

            <div className="page-body" style={{padding: "32px", display: "flex", flexDirection: "column", gap: "24px", maxWidth: "1024px"}}>
                <div style={{display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: "16px"}}>
                    <div className="overview-stat-card">
                        <div className="overview-stat-label">
                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="14" height="14" style={{color: "#22c55e"}} aria-hidden="true">
                                <path d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4"/>
                            </svg>
                            <span>{t("overviewTotalSkills")}</span>
                        </div>
                        <div className="overview-stat-value">{enabledCount}</div>
                    </div>
                    <div className="overview-stat-card">
                        <div className="overview-stat-label">
                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="14" height="14" style={{color: "#3b82f6"}} aria-hidden="true">
                                <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
                            </svg>
                            <span>{t("overviewTotalRules")}</span>
                        </div>
                        <div className="overview-stat-value" style={{color: "var(--fg-faint)"}}>
                            -
                            <span style={{fontSize: "12px", fontWeight: 400, marginLeft: "4px"}}>
                                {t("overviewRulesPending")}
                            </span>
                        </div>
                    </div>
                    <div className="overview-stat-card">
                        <div className="overview-stat-label">
                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="14" height="14" style={{color: "#a855f7"}} aria-hidden="true">
                                <rect x="3" y="3" width="18" height="18" rx="2" ry="2"/>
                                <line x1="3" y1="9" x2="21" y2="9"/>
                                <line x1="9" y1="21" x2="9" y2="9"/>
                            </svg>
                            <span>{t("overviewTotalScenarios")}</span>
                        </div>
                        <div className="overview-stat-value">1</div>
                    </div>
                    <div className="overview-stat-card">
                        <div className="overview-stat-label">
                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="14" height="14" style={{color: "#f97316"}} aria-hidden="true">
                                <rect x="4" y="4" width="16" height="16" rx="2" ry="2"/>
                                <rect x="9" y="9" width="6" height="6"/>
                                <line x1="9" y1="1" x2="9" y2="4"/>
                                <line x1="15" y1="1" x2="15" y2="4"/>
                                <line x1="9" y1="20" x2="9" y2="23"/>
                                <line x1="15" y1="20" x2="15" y2="23"/>
                                <line x1="20" y1="9" x2="23" y2="9"/>
                                <line x1="20" y1="14" x2="23" y2="14"/>
                                <line x1="1" y1="9" x2="4" y2="9"/>
                                <line x1="1" y1="14" x2="4" y2="14"/>
                            </svg>
                            <span>{t("overviewTotalAgents")}</span>
                        </div>
                        <div className="overview-stat-value">
                            {activatedAgents}{" "}
                            <span style={{color: "var(--fg-faint)", fontSize: "16px", fontWeight: 400}}>
                                / {AGENT_ROWS.length}
                            </span>
                        </div>
                    </div>
                </div>

                <div style={{background: "var(--bg-card)", border: "1px solid var(--bd)", borderRadius: "12px", overflow: "hidden"}}>
                    <div style={{padding: "16px 20px", borderBottom: "1px solid var(--bd-soft)", display: "flex", alignItems: "center", gap: "8px"}}>
                        <span style={{width: "4px", height: "16px", background: "var(--accent)", borderRadius: "2px"}} aria-hidden="true" />
                        <h2 style={{fontSize: "15px", fontWeight: 500, color: "var(--fg-primary)", margin: 0}}>
                            {t("overviewAgentBreakdown")}
                        </h2>
                    </div>

                    <div className="overview-agent-row header">
                        <div>AGENT</div>
                        <div>{t("overviewRefSkills")}</div>
                        <div>{t("overviewRefRules")}</div>
                        <div style={{textAlign: "right"}}>{t("overviewStatusEnabled")}</div>
                    </div>

                    {AGENT_ROWS.map((agent) => (
                        <div key={agent.name} className="overview-agent-row">
                            <div style={{display: "flex", alignItems: "center", gap: "10px"}}>
                                <span
                                    className={`mini-radio ${agent.active ? "active" : "empty"}`}
                                    aria-label={agent.active ? t("overviewAgentActive") : t("overviewAgentInactive")}
                                />
                                <span style={{color: "var(--fg-primary)", fontWeight: 500, fontSize: "13px"}}>
                                    {agent.name}
                                </span>
                            </div>
                            <div style={{color: agent.refSkills > 0 ? "var(--fg-secondary)" : "var(--fg-faint)", fontSize: "13px"}}>
                                {agent.refSkills || ""}
                            </div>
                            <div style={{color: "var(--fg-faint)", fontSize: "13px"}}>
                                {agent.refRules || ""}
                            </div>
                            <div style={{textAlign: "right"}}>
                                {agent.active ? (
                                    <span className="badge badge-green">{t("overviewStatusEnabled")}</span>
                                ) : (
                                    <span className="badge badge-gray">{t("overviewStatusUninstalled")}</span>
                                )}
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}
