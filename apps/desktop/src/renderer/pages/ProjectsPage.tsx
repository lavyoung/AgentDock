import {type JSX} from "react";

import {useI18n} from "../i18n/useI18n";
import "./Pages.css";

export function ProjectsPage(): JSX.Element {
    const {t} = useI18n();

    return (
        <div className="view page-assets-view">
            <div className="page-topbar">
                <h1 className="page-topbar-title">
                    {t("navLinkedProjects")}
                </h1>
            </div>
            <div className="page-body empty-state-body">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" width="48" height="48" style={{color: "var(--fg-faint)", opacity: 0.4}} aria-hidden="true">
                    <path d="M10 13a5 5 0 007.54.54l3-3a5 5 0 00-7.07-7.07l-1.72 1.71"/>
                    <path d="M14 11a5 5 0 00-7.54-.54l-3 3a5 5 0 007.07 7.07l1.71-1.71"/>
                </svg>
                <div style={{textAlign: "center"}}>
                    <p style={{fontSize: "15px", color: "var(--fg-primary)", fontWeight: 500, margin: "0 0 8px"}}>
                        {t("projectsTitle")}
                    </p>
                    <p style={{fontSize: "13px", color: "var(--fg-muted)", margin: 0}}>
                        {t("projectsSubtitle")}
                    </p>
                </div>
            </div>
        </div>
    );
}