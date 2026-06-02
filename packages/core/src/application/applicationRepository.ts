import type {ApplicationId, ApplicationLocationRecord, ApplicationRecord,} from "../types/application";

export interface ApplicationRepository {
    listApplications(): ApplicationRecord[];
    findApplicationById(id: ApplicationId): ApplicationRecord | null;
    upsertApplication(application: ApplicationRecord): void;
    listLocations(applicationId: ApplicationId): ApplicationLocationRecord[];
    findLocationById(id: string): ApplicationLocationRecord | null;
    findLocationByKey(
        applicationId: ApplicationId,
        locationKey: string
    ): ApplicationLocationRecord | null;
    createLocation(location: ApplicationLocationRecord): void;
    updateLocation(location: ApplicationLocationRecord): void;
}
