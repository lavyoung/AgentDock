import type {AgentdockApi} from "../../../../../packages/shared/src/agentdockApi";

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
    targets: {
        list() {
            return getApi().targets.list();
        },
        get(id) {
            return getApi().targets.get(id);
        },
        create(input) {
            return getApi().targets.create(input);
        },
        update(id, input) {
            return getApi().targets.update(id, input);
        },
        delete(id) {
            return getApi().targets.delete(id);
        },
    },
    applications: {
        list() {
            return getApi().applications.list();
        },
        get(id) {
            return getApi().applications.get(id);
        },
        update(id, input) {
            return getApi().applications.update(id, input);
        },
        refreshLocations(id) {
            return getApi().applications.refreshLocations(id);
        },
        updateLocation(id, input) {
            return getApi().applications.updateLocation(id, input);
        },
    },
};
