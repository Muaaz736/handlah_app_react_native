import {
    resolveScreenFromNotification,
    resolveEntityEditTarget,
    ROUTE_KEY_TO_TARGET,
    NavigationTarget,
} from '../../../../utils/notificationNavigator';
import { InsightDto } from '../../../../redux/services/insightsService';

export const GETTING_STARTED_CODE = 'ROL-01';

export const isGettingStartedInsight = (
    insight: Pick<InsightDto, 'code' | 'id' | 'routekey'>,
): boolean =>
    insight.code === GETTING_STARTED_CODE ||
    insight.id === GETTING_STARTED_CODE ||
    insight.routekey === '';

const PET_ADD_SCREEN_BY_CODE: Record<string, string> = {
    'PET-02': 'AddPetVaccination',
    'PET-03': 'AddPetMedication',
    'PET-04': 'AddPetVetAppointments',
};

const VEHICLE_ADD_SCREEN_BY_CODE: Record<string, string> = {
    'VEH-06': 'AddServiceRecords', // "Log service history for your {vehicle}"
    'VEH-08': 'AddServiceRecords', // "Log your most recent inspection"
};

// entitytype is generically "child" for every Health Tracker "absence"
// insight (it names the dependent, not the record being added) — the code
// says which add-form is actually meant.
const CHILD_ADD_SCREEN_BY_CODE: Record<string, string> = {
    'HLT-08': 'AddDoctor',
    'HLT-09': 'AddMedication',
    'HLT-10': 'AddSurgery',
    'HLT-11': 'AddAppointment',
};

const IDENTITY_EDIT_SCREENS: Record<string, string> = {
    driver_license: 'IdentityDriverLicenseForm',
    passport: 'IdentityPassportForm',
    license_certification: 'IdentityLicenseCertificationsForm',
};

const isReminderTabFallback = (target: NavigationTarget | null): boolean =>
    !!target && target.screen === 'Dashboard' && target.params?.screen === 'Reminders';

const lookupRouteKey = (routekey: string): NavigationTarget | null => {
    if (!routekey) return null;
    if (ROUTE_KEY_TO_TARGET[routekey]) return ROUTE_KEY_TO_TARGET[routekey];
    const ci = Object.keys(ROUTE_KEY_TO_TARGET).find(k => k.toLowerCase() === routekey.toLowerCase());
    if (ci) return ROUTE_KEY_TO_TARGET[ci];
    return { screen: routekey };
};

const withFocusField = (target: NavigationTarget, targetfield?: string | null): NavigationTarget =>
    targetfield ? { screen: target.screen, params: { ...target.params, focusField: targetfield } } : target;

export const resolveInsightTarget = (insight: InsightDto): NavigationTarget | null => {
    if (isGettingStartedInsight(insight)) return null;

    if (insight.entityid != null && insight.entitytype) {
        const entityTarget = resolveScreenFromNotification({
            entityType: insight.entitytype,
            entityId: String(insight.entityid),
            routeKey: insight.routekey,
            notificationType: 'reminder',
        });
        if (entityTarget && !isReminderTabFallback(entityTarget)) {
            return withFocusField(entityTarget, insight.targetfield);
        }
    }

    const moduleTarget = lookupRouteKey(insight.routekey);
    return moduleTarget ? withFocusField(moduleTarget, insight.targetfield) : null;
};

export const resolveInsightEditTarget = (
    insight: InsightDto,
    space?: { spaceType?: 'Personal' | 'Business'; businessId?: number | null },
): NavigationTarget | null => {
    if (isGettingStartedInsight(insight)) return null;

    const entityType = insight.entitytype?.toLowerCase();

    if (entityType === 'pet' && insight.entityid != null) {
        const addScreen = PET_ADD_SCREEN_BY_CODE[insight.code];
        if (addScreen) {
            return { screen: addScreen, params: { petId: insight.entityid, fromPetsScreen: true } };
        }
    }

    if (entityType === 'vehicle' && insight.entityid != null) {
        const addScreen = VEHICLE_ADD_SCREEN_BY_CODE[insight.code];
        if (addScreen) {
            return { screen: addScreen, params: { vehicleId: insight.entityid, addNew: true } };
        }
    }

    if (entityType === 'child') {
        if (insight.entityid != null) {
            const addScreen = CHILD_ADD_SCREEN_BY_CODE[insight.code];
            if (addScreen) {
                return { screen: addScreen, params: { childId: insight.entityid } };
            }
        } else {
            // "Add a dependent" — no child exists yet to attach a record to.
            return { screen: 'HealthTracker', params: { openAddChildModal: true } };
        }
    }

    if (entityType === 'compliance_record' && insight.entityid != null) {
        // No dedicated edit-screen mapping exists for compliance records
        // (they're record ids inside a folder, not a standalone module), so
        // ComplianceVault resolves the record's folder itself before landing
        // on its edit form — see its `openRecordIdForEdit` handling.
        return { screen: 'ComplianceVault', params: { openRecordIdForEdit: insight.entityid } };
    }

    if (insight.entityid != null && entityType) {
        const identityScreen = IDENTITY_EDIT_SCREENS[entityType];
        if (identityScreen) {
            return {
                screen: identityScreen,
                params: {
                    mode: 'edit',
                    entityId: insight.entityid,
                    fromDashboard: true,
                    dashboardParams: {
                        spaceType: space?.spaceType ?? 'Personal',
                        businessId: space?.businessId ?? null,
                    },
                },
            };
        }

        const parentId = (insight as any).parentid ?? (insight as any).parententityid ?? null;
        const editTarget = resolveEntityEditTarget({
            entityType: insight.entitytype,
            entityId: insight.entityid,
            parentId,
        });
        if (editTarget) return withFocusField(editTarget, insight.targetfield);
    }

    return resolveInsightTarget(insight);
};

export const resolveModuleTarget = (routekey: string): NavigationTarget | null => lookupRouteKey(routekey);
