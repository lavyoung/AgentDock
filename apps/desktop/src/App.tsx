import {type JSX, useEffect} from "react";

import {Sidebar} from "./renderer/components/Sidebar";
import {ToastContainer} from "./renderer/components/Toast";
import {AssetsPage} from "./renderer/pages/AssetsPage";
import {InstallPage} from "./renderer/pages/InstallPage";
import {OverviewPage} from "./renderer/pages/OverviewPage";
import {ProjectsPage} from "./renderer/pages/ProjectsPage";
import {ScenariosPage} from "./renderer/pages/ScenariosPage";
import {SettingsPage} from "./renderer/pages/SettingsPage";
import {TargetsPage} from "./renderer/pages/TargetsPage";
import {useAppStore} from "./renderer/stores/useAppStore";

import "./App.css";

function App(): JSX.Element {
    const view = useAppStore((s) => s.view);

    useEffect(() => {
        try {
            window.electron?.windowReady();
        } catch {
            /* ignore in mock/dev fallback */
        }
    }, []);

    return (
        <div className="app-shell">
            <Sidebar />
            <main className="app-main">
                {view === "overview" && <OverviewPage />}
                {view === "assets" && <AssetsPage />}
                {view === "install" && <InstallPage />}
                {view === "scenarios" && <ScenariosPage />}
                {view === "targets" && <TargetsPage />}
                {view === "projects" && <ProjectsPage />}
                {view === "settings" && <SettingsPage />}
            </main>
            <ToastContainer />
        </div>
    );
}

export default App;
