import {type JSX, useEffect} from "react";

import type {ApplicationLocationRecord} from "../../../../../packages/core/src/types/application";
import {agentdockClient} from "../client/agentdockClient";
import {useI18n} from "../i18n/useI18n";
import {useAppStore} from "../stores/useAppStore";
import "./Pages.css";

function getLocationKindLabel(
    t: (key: string) => string,
    kind: ApplicationLocationRecord["kind"]
): string {
    return kind === "skills" ? t("settingsAgentKindSkills") : t("settingsAgentKindAgentsMd");
}

function getLocationScopeLabel(
    t: (key: string) => string,
    scope: ApplicationLocationRecord["scope"]
): string {
    return scope === "global" ? t("settingsAgentScopeGlobal") : t("settingsAgentScopeProject");
}

export function SettingsPage(): JSX.Element {
    const {t, locale, setLocale} = useI18n();
    const refreshApplications = useAppStore((s) => s.refreshApplications);
    const applications = useAppStore((s) => s.applications);
    const selectedApplicationId = useAppStore((s) => s.selectedApplicationId);
    const selectedApplicationDetail = useAppStore((s) => s.selectedApplicationDetail);
    const selectedLocation = useAppStore((s) => s.selectedLocation);
    const setView = useAppStore((s) => s.setView);
    const theme = useAppStore((s) => s.theme);
    const setTheme = useAppStore((s) => s.setTheme);
    const openApplication = useAppStore((s) => s.openApplication);
    const setApplicationEnabled = useAppStore((s) => s.setApplicationEnabled);
    const saveApplication = useAppStore((s) => s.saveApplication);
    const detectApplicationLocations = useAppStore((s) => s.detectApplicationLocations);
    const selectLocation = useAppStore((s) => s.selectLocation);
    const setLocationEnabled = useAppStore((s) => s.setLocationEnabled);
    const saveApplicationLocation = useAppStore((s) => s.saveApplicationLocation);
    const locationName = useAppStore((s) => s.locationName);
    const locationPath = useAppStore((s) => s.locationPath);
    const setLocationName = useAppStore((s) => s.setLocationName);
    const setLocationPath = useAppStore((s) => s.setLocationPath);
    const settingsDataPath = useAppStore((s) => s.settingsDataPath);
    const settingsAutoUpdate = useAppStore((s) => s.settingsAutoUpdate);
    const settingsNotifications = useAppStore((s) => s.settingsNotifications);
    const settingsSound = useAppStore((s) => s.settingsSound);
    const setSettingsDataPath = useAppStore((s) => s.setSettingsDataPath);
    const setSettingsAutoUpdate = useAppStore((s) => s.setSettingsAutoUpdate);
    const setSettingsNotifications = useAppStore((s) => s.setSettingsNotifications);
    const setSettingsSound = useAppStore((s) => s.setSettingsSound);
    const runApplicationSync = useAppStore((s) => s.runApplicationSync);
    const pushToast = useAppStore((s) => s.pushToast);

    useEffect(() => {
        void refreshApplications();
    }, [refreshApplications]);

    useEffect(() => {
        if (applications.length > 0 && !selectedApplicationId) {
            void openApplication(applications[0].id);
        }
    }, [applications, openApplication, selectedApplicationId]);

    const locations = selectedApplicationDetail?.locations ?? [];
    const activeApplicationCount = applications.filter((application) => application.enabled).length;
    const enabledLocationCount = locations.filter((location) => location.enabled).length;
    const customLocationCount = locations.filter((location) => location.source === "manual").length;

    async function handleApplicationToggle(
        applicationId: typeof selectedApplicationId,
        nextEnabled: boolean
    ): Promise<void> {
        if (!applicationId) {
            return;
        }

        try {
            if (selectedApplicationId !== applicationId) {
                await openApplication(applicationId);
            }
            setApplicationEnabled(nextEnabled);
            await saveApplication();
        } catch (error) {
            pushToast("error", String(error));
        }
    }

    async function handleLocationToggle(location: ApplicationLocationRecord): Promise<void> {
        try {
            if (selectedApplicationId !== location.application_id) {
                await openApplication(location.application_id);
            }
            selectLocation(location);
            setLocationEnabled(!location.enabled);
            await saveApplicationLocation();
        } catch (error) {
            pushToast("error", String(error));
        }
    }

    async function handleRedetect(): Promise<void> {
        if (!selectedApplicationId) {
            return;
        }

        try {
            await detectApplicationLocations();
        } catch (error) {
            pushToast("error", String(error));
        }
    }

    async function handleSaveSelectedLocation(): Promise<void> {
        if (!selectedLocation) {
            return;
        }

        try {
            await saveApplicationLocation();
        } catch (error) {
            pushToast("error", String(error));
        }
    }

    async function handleBrowseDataPath(): Promise<void> {
        try {
            const selectedPath = await agentdockClient.app.pickPath({
                mode: "directory",
                title: t("settingsDataPath"),
                defaultPath: settingsDataPath,
                buttonLabel: t("settingsBrowse"),
            });
            if (!selectedPath) {
                return;
            }

            setSettingsDataPath(selectedPath);
        } catch (error) {
            pushToast("error", String(error));
        }
    }

    async function handleBrowseSelectedLocation(): Promise<void> {
        if (!selectedLocation) {
            return;
        }

        try {
            const selectedPath = await agentdockClient.app.pickPath({
                mode: "directory",
                title: selectedLocation.name,
                defaultPath: locationPath || selectedLocation.path,
                buttonLabel: t("settingsBrowse"),
            });
            if (!selectedPath) {
                return;
            }

            setLocationPath(selectedPath);
            await saveApplicationLocation();
        } catch (error) {
            pushToast("error", String(error));
        }
    }

    return (
        <div className="view page-settings">
            <div className="page-topbar page-topbar--centered">
                <div className="page-topbar-left">
                    <button
                        type="button"
                        onClick={() => setView("assets")}
                        className="settings-back-button"
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
                <div className="settings-card">
                    <div className="settings-card-header">{t("settingsGeneral")}</div>
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
                                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="theme-icon" aria-hidden="true">
                                        <path d="M21 12.79A9 9 0 1111.21 3 7 7 0 0021 12.79z" />
                                    </svg>
                                    <span className="theme-label">{t("settingsThemeDark")}</span>
                                </button>
                                <button
                                    type="button"
                                    className={`theme-option ${theme === "light" ? "active" : ""}`}
                                    onClick={() => setTheme("light")}
                                >
                                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="theme-icon" aria-hidden="true">
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
                                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="theme-icon" aria-hidden="true">
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

                <div className="settings-card">
                    <div className="settings-card-header">{t("settingsAgentTitle")}</div>
                    <div className="settings-card-body settings-agent-card">
                        <div className="settings-agent-summary">
                            <article className="settings-agent-stat">
                                <span>{t("settingsAgentSummaryActive")}</span>
                                <strong>{activeApplicationCount}</strong>
                            </article>
                            <article className="settings-agent-stat">
                                <span>{t("settingsAgentSummaryEnabled")}</span>
                                <strong>{enabledLocationCount}</strong>
                            </article>
                            <article className="settings-agent-stat">
                                <span>{t("settingsAgentSummaryCustom")}</span>
                                <strong>{customLocationCount}</strong>
                            </article>
                            <article className="settings-agent-stat">
                                <span>{t("settingsAgentSummarySupported")}</span>
                                <strong>{applications.length}</strong>
                            </article>
                        </div>

                        {applications.length === 0 ? (
                            <div className="settings-agent-empty">{t("settingsAgentNoApps")}</div>
                        ) : (
                            <>
                                <div className="settings-agent-toolbar">
                                    <div>
                                        <div className="settings-agent-toolbar-title">
                                            {selectedApplicationDetail?.application.name ?? applications[0].name}
                                        </div>
                                        <div className="settings-row-label-sub">{t("settingsAgentLocationsHint")}</div>
                                    </div>
                                    <div className="settings-agent-toolbar-actions">
                                        <button type="button" className="btn btn-secondary" onClick={() => void handleRedetect()}>
                                            {t("settingsAgentRedetect")}
                                        </button>
                                        <button type="button" className="btn btn-primary" onClick={() => void runApplicationSync()}>
                                            {t("settingsAgentSync")}
                                        </button>
                                    </div>
                                </div>

                                <div className="settings-agent-grid">
                                    <section className="settings-agent-panel">
                                        <div className="settings-agent-panel-title">{t("settingsAgentList")}</div>
                                        <div className="settings-agent-list">
                                            {applications.map((application) => {
                                                const isActive = selectedApplicationId === application.id;
                                                return (
                                                    <button
                                                        key={application.id}
                                                        type="button"
                                                        className={`settings-agent-row ${isActive ? "active" : ""}`}
                                                        onClick={() => void openApplication(application.id)}
                                                    >
                                                        <div className="settings-agent-row-body">
                                                            <div className="settings-agent-row-title">{application.name}</div>
                                                            <div className="settings-agent-row-meta">{application.id}</div>
                                                        </div>
                                                        <span className={`badge ${application.enabled ? "badge-green" : "badge-gray"}`}>
                                                            {application.enabled ? t("enabledYes") : t("enabledNo")}
                                                        </span>
                                                        <button
                                                            type="button"
                                                            className="toggle"
                                                            data-state={application.enabled ? "on" : "off"}
                                                            role="switch"
                                                            aria-checked={application.enabled}
                                                            aria-label={application.name}
                                                            onClick={(event) => {
                                                                event.stopPropagation();
                                                                void handleApplicationToggle(application.id, !application.enabled);
                                                            }}
                                                        >
                                                            <span />
                                                        </button>
                                                    </button>
                                                );
                                            })}
                                        </div>
                                    </section>

                                    <section className="settings-agent-panel">
                                        <div className="settings-agent-panel-title">{t("settingsAgentLocations")}</div>
                                        <div className="settings-row-label-sub">{t("settingsAgentLocationsHint")}</div>
                                        {locations.length === 0 ? (
                                            <div className="settings-agent-empty settings-agent-empty--compact">
                                                {t("settingsAgentNoLocations")}
                                            </div>
                                        ) : (
                                            <div className="settings-agent-location-list">
                                                {locations.map((location) => {
                                                    const isSelected = selectedLocation?.id === location.id;
                                                    return (
                                                        <div
                                                            key={location.id}
                                                            className={`settings-agent-location-row ${isSelected ? "active" : ""}`}
                                                            onClick={() => selectLocation(location)}
                                                        >
                                                            <div className="settings-agent-location-body">
                                                                <div className="settings-agent-location-header">
                                                                    <div className="settings-agent-location-title">{location.name}</div>
                                                                    <div className="settings-agent-location-badges">
                                                                        <span className="badge badge-gray">
                                                                            {getLocationScopeLabel(t, location.scope)}
                                                                        </span>
                                                                        <span className="badge badge-blue">
                                                                            {getLocationKindLabel(t, location.kind)}
                                                                        </span>
                                                                        <span className={`badge ${location.exists ? "badge-green" : "badge-red"}`}>
                                                                            {location.exists ? t("settingsAgentExists") : t("settingsAgentMissing")}
                                                                        </span>
                                                                    </div>
                                                                </div>
                                                                <div className="settings-agent-location-path">{location.path}</div>
                                                            </div>
                                                            <button
                                                                type="button"
                                                                className="toggle"
                                                                data-state={location.enabled ? "on" : "off"}
                                                                role="switch"
                                                                aria-checked={location.enabled}
                                                                aria-label={location.name}
                                                                onClick={(event) => {
                                                                    event.stopPropagation();
                                                                    void handleLocationToggle(location);
                                                                }}
                                                            >
                                                                <span />
                                                            </button>
                                                        </div>
                                                    );
                                                })}
                                            </div>
                                        )}

                                        {selectedLocation ? (
                                            <div className="settings-agent-editor">
                                                <div className="settings-agent-editor-title">{selectedLocation.name}</div>
                                                <div className="settings-agent-editor-grid">
                                                    <label className="form-field">
                                                        <span className="form-label">{t("targetsName")}</span>
                                                        <input
                                                            type="text"
                                                            className="settings-input"
                                                            value={locationName}
                                                            onChange={(event) => setLocationName(event.target.value)}
                                                            onBlur={() => void handleSaveSelectedLocation()}
                                                        />
                                                    </label>
                                                    <label className="form-field">
                                                        <span className="form-label">{t("targetsPath")}</span>
                                                        <div className="settings-input-row">
                                                            <input
                                                                type="text"
                                                                className="settings-input"
                                                                value={locationPath}
                                                                onChange={(event) => setLocationPath(event.target.value)}
                                                                onBlur={() => void handleSaveSelectedLocation()}
                                                            />
                                                            <button
                                                                type="button"
                                                                className="btn btn-secondary btn-sm"
                                                                onClick={() => void handleBrowseSelectedLocation()}
                                                            >
                                                                {t("settingsBrowse")}
                                                            </button>
                                                        </div>
                                                    </label>
                                                </div>
                                            </div>
                                        ) : null}
                                    </section>
                                </div>
                            </>
                        )}
                    </div>
                </div>

                <div className="settings-card">
                    <div className="settings-card-header">{t("settingsData")}</div>
                    <div className="divide-y divide-line-soft">
                        <div className="settings-card-body-item">
                            <div className="settings-row-label">
                                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="settings-row-label-icon" aria-hidden="true">
                                    <path d="M22 19a2 2 0 01-2 2H4a2 2 0 01-2-2V5a2 2 0 012-2h5l2 3h9a2 2 0 012 2z" />
                                </svg>
                                <span>{t("settingsDataPath")}</span>
                            </div>
                            <div className="settings-input-row settings-input-row--wide">
                                <input
                                    type="text"
                                    className="settings-input"
                                    value={settingsDataPath}
                                    onChange={(event) => setSettingsDataPath(event.target.value)}
                                    aria-label={t("settingsDataPath")}
                                />
                                <button
                                    type="button"
                                    className="btn btn-secondary btn-sm"
                                    onClick={() => void handleBrowseDataPath()}
                                >
                                    {t("settingsBrowse")}
                                </button>
                            </div>
                        </div>
                        <div className="settings-card-body-item-toggle">
                            <div className="settings-row-label">
                                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="settings-row-label-icon" aria-hidden="true">
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
                                data-state={settingsAutoUpdate ? "on" : "off"}
                                role="switch"
                                aria-checked={settingsAutoUpdate}
                                aria-label={t("settingsAutoUpdate")}
                                onClick={() => setSettingsAutoUpdate(!settingsAutoUpdate)}
                            >
                                <span />
                            </button>
                        </div>
                    </div>
                </div>

                <div className="settings-card">
                    <div className="settings-card-header">{t("settingsNotifications")}</div>
                    <div className="divide-y divide-line-soft">
                        <div className="settings-card-body-item-toggle">
                            <div className="settings-row-label">
                                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="settings-row-label-icon" aria-hidden="true">
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
                                data-state={settingsNotifications ? "on" : "off"}
                                role="switch"
                                aria-checked={settingsNotifications}
                                aria-label={t("settingsNotifications")}
                                onClick={() => setSettingsNotifications(!settingsNotifications)}
                            >
                                <span />
                            </button>
                        </div>
                        <div className="settings-card-body-item-toggle">
                            <div className="settings-row-label">
                                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="settings-row-label-icon" aria-hidden="true">
                                    <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5" />
                                    <path d="M19.07 4.93a10 10 0 010 14.14M15.54 8.46a5 5 0 010 7.07" />
                                </svg>
                                <span>{t("settingsSound")}</span>
                            </div>
                            <button
                                type="button"
                                className="toggle"
                                data-state={settingsSound ? "on" : "off"}
                                role="switch"
                                aria-checked={settingsSound}
                                aria-label={t("settingsSound")}
                                onClick={() => setSettingsSound(!settingsSound)}
                            >
                                <span />
                            </button>
                        </div>
                    </div>
                </div>

                <div className="settings-card about-card">
                    <div className="about-logo">
                        <span className="about-logo-text">A</span>
                    </div>
                    <div className="about-title">AgentDock</div>
                    <div className="about-version">{t("settingsVersion")} 1.0.0</div>
                    <div className="about-copyright">{t("settingsCopyright")}</div>
                </div>
            </div>
        </div>
    );
}
