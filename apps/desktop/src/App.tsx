import {type JSX, useEffect} from "react";

import {Sidebar} from "./renderer/components/Sidebar";
import {ToastContainer} from "./renderer/components/Toast";
import {shellClient} from "./renderer/client/shellClient";
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
        // Tell the host shell that the renderer is mounted. The shell
        // client is a no-op when no real shell is present (mock / dev /
        // Tauri phase 2), so this is safe to call unconditionally.
        shellClient.windowReady();
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
