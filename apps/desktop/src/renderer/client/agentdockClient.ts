import type {AgentdockApi} from "../../shared/agentdockApi";

function getApi(): AgentdockApi {
    return window.agentdock;
}

export const agentdockClient: AgentdockApi = {
    app: {
        get name() {
            return getApi().app.name;
        },
    },
    assets: {
        list() {
            return getApi().assets.list();
        },
        get(id) {
            return getApi().assets.get(id);
        },
        create(input) {
            return getApi().assets.create(input);
        },
        update(id, input) {
            return getApi().assets.update(id, input);
        },
    },
    snapshots: {
        list(assetId) {
            return getApi().snapshots.list(assetId);
        },
        restore(snapshotId) {
            return getApi().snapshots.restore(snapshotId);
        },
    },
};
