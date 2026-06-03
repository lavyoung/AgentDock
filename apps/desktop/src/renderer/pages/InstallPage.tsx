import {type JSX} from "react";

import {useI18n} from "../i18n/useI18n";
import "./Pages.css";

export function InstallPage(): JSX.Element {
    const {t} = useI18n();

    return (
        <div className="view page-assets-view">
            <div className="page-topbar">
                <h1 className="page-topbar-title">
                    {t("navInstall")}
                </h1>
            </div>
            <div className="page-body empty-state-body">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" width="48" height="48" style={{color: "var(--fg-faint)", opacity: 0.4}} aria-hidden="true">
                    <path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4M7 10l5 5 5-5M12 15V3"/>
                </svg>
                <div style={{textAlign: "center"}}>
                    <p style={{fontSize: "15px", color: "var(--fg-primary)", fontWeight: 500, margin: "0 0 8px"}}>
                        {t("installTitle")}
                    </p>
                    <p style={{fontSize: "13px", color: "var(--fg-muted)", margin: 0}}>
                        {t("installSubtitle")}
                    </p>
                </div>
            </div>
        </div>
    );
}