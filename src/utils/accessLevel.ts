/**
 * Access level utilities for module and entity-level access control.
 *
 * When accessType is 'Module': the accessLevel from the sharing summary applies
 * uniformly to the entire module (all entities).
 *
 * When accessType is 'Entity': the summary accessLevel is ignored. Instead,
 * each entity in the API response carries its own `accesslevel` field which
 * determines read/write capability per entity.
 */

/**
 * Get the module-level write access (controls Add button, module-wide actions).
 * For Entity-type access, module-level write is always false (user only has
 * access to specific entities, not the whole module).
 */
export const getModuleWriteAccess = (params: {
    isFromEmergencyAccess: boolean;
    accessType?: string;
    accessLevel?: string;
}): boolean => {
    const { isFromEmergencyAccess, accessType, accessLevel } = params;
    if (isFromEmergencyAccess) return false;
    if (accessType === 'Entity') return false;
    if (accessLevel === undefined || accessLevel === null) return true;
    return accessLevel.toLowerCase() === 'write';
};

/**
 * Get the entity-level write access for a specific item.
 * For Entity-type access, checks the item's own `accesslevel` field.
 * For Module-type access (or owner), falls back to module-level writeAccess.
 */
export const getEntityWriteAccess = (params: {
    isFromEmergencyAccess: boolean;
    accessType?: string;
    moduleWriteAccess: boolean;
    entity: any;
}): boolean => {
    const { isFromEmergencyAccess, accessType, moduleWriteAccess, entity } = params;
    if (isFromEmergencyAccess) return false;
    if (accessType === 'Entity') {
        const entityAccess = entity?.accesslevel || entity?.accessLevel;
        if (entityAccess === undefined || entityAccess === null) return false;
        return entityAccess.toLowerCase() === 'write';
    }
    return moduleWriteAccess;
};
