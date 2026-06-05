import {type JSX, type ReactNode, useEffect, useRef, useState} from "react";

import {ProjectModal} from "./ProjectModal";
import {useI18n} from "../i18n/useI18n";
import {useAppStore, type ViewKey} from "../stores/useAppStore";
import "./Sidebar.css";

function NavPopover({
    triggerId,
    children,
}: {
    triggerId: string;
    children: ReactNode;
}): JSX.Element {
    const [open, setOpen] = useState(false);
    const ref = useRef<HTMLDivElement>(null);

    useEffect(() => {
        function handleClickOutside(event: MouseEvent): void {
            if (ref.current && !ref.current.contains(event.target as Node)) {
                setOpen(false);
            }
        }

        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    useEffect(() => {
        const trigger = document.querySelector(`[data-popover-trigger="${triggerId}"]`);
        if (!trigger) {
            return;
        }

        const handler = (event: Event) => {
            event.stopPropagation();
            setOpen((value) => !value);
        };

        trigger.addEventListener("click", handler);
        return () => trigger.removeEventListener("click", handler);
    }, [triggerId]);

    return (
        <div className="nav-popover-wrapper" ref={ref}>
            <button
                type="button"
                className="more-btn"
                data-popover-trigger={triggerId}
                title="More"
                aria-haspopup="menu"
                aria-expanded={open}
            >
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="16" height="16" aria-hidden="true">
                    <circle cx="12" cy="5" r="1"/>
                    <circle cx="12" cy="12" r="1"/>
                    <circle cx="12" cy="19" r="1"/>
                </svg>
            </button>
            <div className={`popover ${open ? "open" : ""}`} role="menu">
                {children}
            </div>
        </div>
    );
}

function PopoverItem({
    iconPath,
    label,
    action,
    onAction,
}: {
    iconPath: string;
    label: string;
    action: string;
    onAction: (action: string) => void;
}): JSX.Element {
    return (
        <button
            type="button"
            className="popover-item"
            role="menuitem"
            onClick={() => onAction(action)}
        >
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="16" height="16" aria-hidden="true">
                <path d={iconPath} />
            </svg>
            {label}
        </button>
    );
}

const navItems: {key: ViewKey; labelKey: string; iconPath: string; countBadge?: true}[] = [
    {
        key: "overview",
        labelKey: "navOverview",
        iconPath: "M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z M9 22V12h6v10",
    },
    {
        key: "assets",
        labelKey: "navAssets",
        iconPath: "M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4",
        countBadge: true,
    },
    {
        key: "install",
        labelKey: "navInstall",
        iconPath: "M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4M7 10l5 5 5-5M12 15V3",
    },
    {
        key: "targets",
        labelKey: "navTargets",
        iconPath: "M22 19a2 2 0 01-2 2H4a2 2 0 01-2-2V5a2 2 0 012-2h5l2 3h9a2 2 0 012 2z",
    },
];

export function Sidebar(): JSX.Element {
    const view = useAppStore((s) => s.view);
    const setView = useAppStore((s) => s.setView);
    const openScenario = useAppStore((s) => s.openScenario);
    const openScenarioCreateModal = useAppStore((s) => s.openScenarioCreateModal);
    const scenarios = useAppStore((s) => s.scenarios);
    const selectedScenario = useAppStore((s) => s.selectedScenario);
    const openProject = useAppStore((s) => s.openProject);
    const selectedProjectId = useAppStore((s) => s.selectedProjectId);
    const resetProjectForm = useAppStore((s) => s.resetProjectForm);
    const refreshScenarios = useAppStore((s) => s.refreshScenarios);
    const assets = useAppStore((s) => s.assets);
    const projects = useAppStore((s) => s.projects);
    const {t} = useI18n();
    const [isProjectModalOpen, setIsProjectModalOpen] = useState(false);

    const enabledCount = assets.filter((asset) => asset.status === "active").length;

    useEffect(() => {
        void refreshScenarios();
    }, [refreshScenarios]);

    function handleNavAction(action: string): void {
        if (action === "new-scenario") {
            openScenarioCreateModal();
            return;
        }

        if (action === "new-project") {
            resetProjectForm();
            setIsProjectModalOpen(true);
        }
    }

    return (
        <>
            <aside className="sidebar">
                <div className="sidebar-brand">
                    <div className="sidebar-logo">
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                            <circle cx="12" cy="5" r="3"/>
                            <line x1="12" y1="22" x2="12" y2="8"/>
                            <path d="M5 12H2a10 10 0 0020 0h-3"/>
                        </svg>
                    </div>
                    <span className="sidebar-title">AgentDock</span>
                </div>

                <nav className="sidebar-nav" aria-label="Primary navigation">
                    {navItems.map((item) => (
                        <button
                            key={item.key}
                            type="button"
                            className={`nav-item ${view === item.key ? "active" : ""}`}
                            onClick={() => setView(item.key)}
                            aria-current={view === item.key ? "page" : undefined}
                        >
                            <svg
                                viewBox="0 0 24 24"
                                fill="none"
                                stroke="currentColor"
                                strokeWidth="2"
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                className="nav-icon"
                                aria-hidden="true"
                            >
                                <path d={item.iconPath} />
                            </svg>
                            <span className="flex-1">{t(item.labelKey as never)}</span>
                            {item.countBadge ? (
                                <span className="nav-count-badge" aria-label={`${enabledCount} assets`}>
                                    {enabledCount}
                                </span>
                            ) : null}
                        </button>
                    ))}

                    <div className="category-label first">
                        <button
                            type="button"
                            className="category-label-button"
                            onClick={() => setView("scenarios")}
                            aria-label={t("navScenariosCategory")}
                        >
                            {t("navScenariosCategory")}
                        </button>
                        <NavPopover triggerId="popover-scenarios">
                            <PopoverItem
                                iconPath="M12 5v14M5 12h14"
                                label={t("actionNewScenario")}
                                action="new-scenario"
                                onAction={handleNavAction}
                            />
                        </NavPopover>
                    </div>
                    {scenarios.map((scenario) => (
                        <button
                            key={scenario.id}
                            type="button"
                            className={`nav-sub-item ${view === "scenarios" && selectedScenario?.id === scenario.id ? "active" : ""}`}
                            onClick={() => {
                                setView("scenarios");
                                void openScenario(scenario.id);
                            }}
                        >
                            <svg
                                viewBox="0 0 24 24"
                                fill="none"
                                stroke="currentColor"
                                strokeWidth="2"
                                width="14"
                                height="14"
                                aria-hidden="true"
                                className="nav-sub-icon"
                            >
                                <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
                            </svg>
                            <span>{scenario.title || scenario.name}</span>
                        </button>
                    ))}

                    <div className="category-label">
                        <span>{t("navWorkspacesCategory")}</span>
                        <NavPopover triggerId="popover-workspace">
                            <PopoverItem
                                iconPath="M12 5v14M5 12h14"
                                label={t("actionNewProject")}
                                action="new-project"
                                onAction={handleNavAction}
                            />
                        </NavPopover>
                    </div>
                    {projects.map((project) => (
                        <button
                            key={project.id}
                            type="button"
                            className={`nav-sub-item ${view === "projects" && selectedProjectId === project.id ? "active" : ""}`}
                            onClick={() => openProject(project.id)}
                        >
                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="14" height="14" aria-hidden="true">
                                <path d="M3 7l9-4 9 4-9 4-9-4z"/>
                                <path d="M3 17l9 4 9-4"/>
                                <path d="M3 12l9 4 9-4"/>
                            </svg>
                            <span>{project.name}</span>
                        </button>
                    ))}
                </nav>

                <div className="sidebar-footer">
                    <button
                        type="button"
                        className={`nav-item ${view === "settings" ? "active" : ""}`}
                        onClick={() => setView("settings")}
                    >
                        <svg
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="2"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            className="nav-icon"
                            aria-hidden="true"
                        >
                            <circle cx="12" cy="12" r="3"/>
                            <path d="M19.4 15a1.65 1.65 0 00.33 1.82l.06.06a2 2 0 010 2.83 2 2 0 01-2.83 0l-.06-.06a1.65 1.65 0 00-1.82-.33 1.65 1.65 0 00-1 1.51V21a2 2 0 01-2 2 2 2 0 01-2-2v-.09A1.65 1.65 0 009 19.4a1.65 1.65 0 00-1.82.33l-.06.06a2 2 0 01-2.83 0 2 2 0 010-2.83l.06-.06a1.65 1.65 0 00.33-1.82 1.65 1.65 0 00-1.51-1H3a2 2 0 01-2-2 2 2 0 012-2h.09A1.65 1.65 0 004.6 9a1.65 1.65 0 00-.33-1.82l-.06-.06a2 2 0 010-2.83 2 2 0 012.83 0l.06.06a1.65 1.65 0 001.82.33H9a1.65 1.65 0 001-1.51V3a2 2 0 012-2 2 2 0 012 2v.09a1.65 1.65 0 001 1.51 1.65 1.65 0 001.82-.33l.06-.06a2 2 0 012.83 0 2 2 0 010 2.83l-.06.06a1.65 1.65 0 00-.33 1.82V9a1.65 1.65 0 001.51 1H21a2 2 0 012 2 2 2 0 01-2 2h-.09a1.65 1.65 0 00-1.51 1z"/>
                        </svg>
                        <span>{t("navSettings")}</span>
                    </button>
                </div>
            </aside>

            <ProjectModal
                open={isProjectModalOpen}
                onClose={() => setIsProjectModalOpen(false)}
            />
        </>
    );
}
