import {type JSX, useEffect} from "react";

import {useI18n} from "../i18n/useI18n";
import {useAppStore} from "../stores/useAppStore";
import "./Pages.css";

export function SettingsPage(): JSX.Element {
    const {t, locale, setLocale} = useI18n();
    const refreshApplications = useAppStore((s) => s.refreshApplications);
    const setView = useAppStore((s) => s.setView);
    const theme = useAppStore((s) => s.theme);
    const setTheme = useAppStore((s) => s.setTheme);

    useEffect(() => {
        void refreshApplications();
    }, [refreshApplications]);

    return (
        <div className="view page-settings">
            <div className="page-topbar page-topbar--centered">
                <div className="page-topbar-left">
                    <button
                        type="button"
                        onClick={() => setView("assets")}
                        className="text-zinc-400 text-sm flex items-center gap-1.5"
                        style={{background: "transparent", border: "none", cursor: "pointer", padding: 0}}
                    >
                        <svg
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="2"
                            className="w-4 h-4"
                            aria-hidden="true"
                        >
                            <line x1="19" y1="12" x2="5" y2="12" />
                            <polyline points="12 19 5 12 12 5" />
                        </svg>
                        {t("commonBack")}
                    </button>
                </div>
                <h1 className="page-topbar-title">{t("settingsTitle")}</h1>
                <div className="page-topbar-actions" />
            </div>

            <div className="page-body">
                {/* General settings */}
                <div className="settings-card">
                    <div className="settings-card-header">{t("settingsGeneral")}</div>
                    <div className="divide-y divide-line-soft">
                        {/* Language */}
                        <div className="settings-card-body-item">
                            <div className="settings-row-label">
                                <svg
                                    viewBox="0 0 24 24"
                                    fill="none"
                                    stroke="currentColor"
                                    strokeWidth="2"
                                    className="settings-row-label-icon"
                                    aria-hidden="true"
                                >
                                    <circle cx="12" cy="12" r="10" />
                                    <line x1="2" y1="12" x2="22" y2="12" />
                                    <path d="M12 2a15.3 15.3 0 014 10 15.3 15.3 0 01-4 10 15.3 15.3 0 01-4-10 15.3 15.3 0 014-10z" />
                                </svg>
                                <span>{t("settingsLanguage")}</span>
                            </div>
                            <div className="lang-grid">
                                <button
                                    type="button"
                                    className={`lang-option ${locale === "zh-CN" ? "active" : ""}`}
                                    onClick={() => setLocale("zh-CN")}
                                >
                                    <span className="lang-char">中</span>
                                    <span className="lang-label">{t("settingsLanguageZh")}</span>
                                </button>
                                <button
                                    type="button"
                                    className={`lang-option ${locale === "en" ? "active" : ""}`}
                                    onClick={() => setLocale("en")}
                                >
                                    <span className="lang-char">A</span>
                                    <span className="lang-label">English</span>
                                </button>
                            </div>
                        </div>
                        {/* Theme */}
                        <div className="settings-card-body-item">
                            <div className="settings-row-label">
                                <svg
                                    viewBox="0 0 24 24"
                                    fill="none"
                                    stroke="currentColor"
                                    strokeWidth="2"
                                    className="settings-row-label-icon"
                                    aria-hidden="true"
                                >
                                    <circle cx="12" cy="12" r="5" />
                                    <line x1="12" y1="1" x2="12" y2="3" />
                                    <line x1="12" y1="21" x2="12" y2="23" />
                                    <line x1="4.22" y1="4.22" x2="5.64" y2="5.64" />
                                    <line x1="18.36" y1="18.36" x2="19.78" y2="19.78" />
                                    <line x1="1" y1="12" x2="3" y2="12" />
                                    <line x1="21" y1="12" x2="23" y2="12" />
                                    <line x1="4.22" y1="19.78" x2="5.64" y2="18.36" />
                                    <line x1="18.36" y1="5.64" x2="19.78" y2="4.22" />
                                </svg>
                                <span>{t("settingsTheme")}</span>
                            </div>
                            <div className="theme-grid">
                                <button
                                    type="button"
                                    className={`theme-option ${theme === "dark" ? "active" : ""}`}
                                    onClick={() => setTheme("dark")}
                                >
                                    <svg
                                        viewBox="0 0 24 24"
                                        fill="none"
                                        stroke="currentColor"
                                        strokeWidth="2"
                                        className="theme-icon"
                                        aria-hidden="true"
                                    >
                                        <path d="M21 12.79A9 9 0 1111.21 3 7 7 0 0021 12.79z" />
                                    </svg>
                                    <span className="theme-label">{t("settingsThemeDark")}</span>
                                </button>
                                <button
                                    type="button"
                                    className={`theme-option ${theme === "light" ? "active" : ""}`}
                                    onClick={() => setTheme("light")}
                                >
                                    <svg
                                        viewBox="0 0 24 24"
                                        fill="none"
                                        stroke="currentColor"
                                        strokeWidth="2"
                                        className="theme-icon"
                                        aria-hidden="true"
                                    >
                                        <circle cx="12" cy="12" r="5" />
                                        <line x1="12" y1="1" x2="12" y2="3" />
                                        <line x1="12" y1="21" x2="12" y2="23" />
                                        <line x1="4.22" y1="4.22" x2="5.64" y2="5.64" />
                                        <line x1="18.36" y1="18.36" x2="19.78" y2="19.78" />
                                        <line x1="1" y1="12" x2="3" y2="12" />
                                        <line x1="21" y1="12" x2="23" y2="12" />
                                        <line x1="4.22" y1="19.78" x2="5.64" y2="18.36" />
                                        <line x1="18.36" y1="5.64" x2="19.78" y2="4.22" />
                                    </svg>
                                    <span className="theme-label">{t("settingsThemeLight")}</span>
                                </button>
                                <button
                                    type="button"
                                    className={`theme-option ${theme === "system" ? "active" : ""}`}
                                    onClick={() => setTheme("system")}
                                >
                                    <svg
                                        viewBox="0 0 24 24"
                                        fill="none"
                                        stroke="currentColor"
                                        strokeWidth="2"
                                        className="theme-icon"
                                        aria-hidden="true"
                                    >
                                        <rect x="2" y="3" width="20" height="14" rx="2" ry="2" />
                                        <line x1="8" y1="21" x2="16" y2="21" />
                                        <line x1="12" y1="17" x2="12" y2="21" />
                                    </svg>
                                    <span className="theme-label">{t("settingsThemeSystem")}</span>
                                </button>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Data & Updates */}
                <div className="settings-card">
                    <div className="settings-card-header">{t("settingsData")}</div>
                    <div className="divide-y divide-line-soft">
                        <div className="settings-card-body-item">
                            <div className="settings-row-label">
                                <svg
                                    viewBox="0 0 24 24"
                                    fill="none"
                                    stroke="currentColor"
                                    strokeWidth="2"
                                    className="settings-row-label-icon"
                                    aria-hidden="true"
                                >
                                    <path d="M22 19a2 2 0 01-2 2H4a2 2 0 01-2-2V5a2 2 0 012-2h5l2 3h9a2 2 0 012 2z" />
                                </svg>
                                <span>{t("settingsDataPath")}</span>
                            </div>
                            <div className="flex gap-2 w-full">
                                <input
                                    type="text"
                                    className="settings-input"
                                    defaultValue="/Users/skills/data"
                                    aria-label={t("settingsDataPath")}
                                />
                                <button type="button" className="btn-text-emerald">
                                    {t("settingsBrowse")}
                                </button>
                            </div>
                        </div>
                        <div className="settings-card-body-item-toggle">
                            <div className="settings-row-label">
                                <svg
                                    viewBox="0 0 24 24"
                                    fill="none"
                                    stroke="currentColor"
                                    strokeWidth="2"
                                    className="settings-row-label-icon"
                                    aria-hidden="true"
                                >
                                    <path d="M1 4v6h6M23 20v-6h-6" />
                                    <path d="M20.49 9A9 9 0 005.64 5.64L1 10m22 4l-4.64 4.36A9 9 0 013.51 15" />
                                </svg>
                                <div>
                                    <div>{t("settingsAutoUpdate")}</div>
                                    <div className="settings-row-label-sub">{t("settingsAutoUpdateDesc")}</div>
                                </div>
                            </div>
                            <button
                                type="button"
                                className="toggle"
                                data-state="on"
                                role="switch"
                                aria-checked="true"
                                aria-label={t("settingsAutoUpdate")}
                            >
                                <span />
                            </button>
                        </div>
                    </div>
                </div>

                {/* Notifications */}
                <div className="settings-card">
                    <div className="settings-card-header">{t("settingsNotifications")}</div>
                    <div className="divide-y divide-line-soft">
                        <div className="settings-card-body-item-toggle">
                            <div className="settings-row-label">
                                <svg
                                    viewBox="0 0 24 24"
                                    fill="none"
                                    stroke="currentColor"
                                    strokeWidth="2"
                                    className="settings-row-label-icon"
                                    aria-hidden="true"
                                >
                                    <path d="M18 8A6 6 0 006 8c0 7-3 9-3 9h18s-3-2-3-9" />
                                    <path d="M13.73 21a2 2 0 01-3.46 0" />
                                </svg>
                                <div>
                                    <div>{t("settingsNotifications")}</div>
                                    <div className="settings-row-label-sub">{t("settingsNotificationsDesc")}</div>
                                </div>
                            </div>
                            <button
                                type="button"
                                className="toggle"
                                data-state="on"
                                role="switch"
                                aria-checked="true"
                                aria-label={t("settingsNotifications")}
                            >
                                <span />
                            </button>
                        </div>
                        <div className="settings-card-body-item-toggle">
                            <div className="settings-row-label">
                                <svg
                                    viewBox="0 0 24 24"
                                    fill="none"
                                    stroke="currentColor"
                                    strokeWidth="2"
                                    className="settings-row-label-icon"
                                    aria-hidden="true"
                                >
                                    <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5" />
                                    <path d="M19.07 4.93a10 10 0 010 14.14M15.54 8.46a5 5 0 010 7.07" />
                                </svg>
                                <span>{t("settingsSound")}</span>
                            </div>
                            <button
                                type="button"
                                className="toggle"
                                data-state="off"
                                role="switch"
                                aria-checked="false"
                                aria-label={t("settingsSound")}
                            >
                                <span />
                            </button>
                        </div>
                    </div>
                </div>

                {/* About */}
                <div className="settings-card about-card">
                    <div className="about-logo">
                        <span className="about-logo-text">A</span>
                    </div>
                    <div className="about-title">AgentDock</div>
                    <div className="about-version">
                        {t("settingsVersion")} 1.0.0
                    </div>
                    <div className="about-copyright">{t("settingsCopyright")}</div>
                </div>
            </div>
        </div>
    );
}
