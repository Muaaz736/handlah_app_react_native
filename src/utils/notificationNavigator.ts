import { useSelector } from "react-redux";

export interface NavigationTarget {
  screen: string;
  params?: Record<string, any>;
}

export const ROUTE_KEY_TO_TARGET: Record<string, NavigationTarget> = {
  IdentityHub: { screen: 'IdentityHub' },
  Wallet: { screen: 'Wallet' },
  HealthTracker: { screen: 'HealthTracker' },
  Pets: { screen: 'Pets' },
  BankingFinance: { screen: 'BankingFinance' },
  Loans: { screen: 'Loans' },
  Insurance: { screen: 'Insurance' },
  Warranties: { screen: 'Warranties' },
  PersonalProperty: { screen: 'PersonalProperty' },
  Utilities: { screen: 'Utilities' },
  Legal: { screen: 'Legal' },
  Bookmarks: { screen: 'Bookmarks' },
  Subscriptions: { screen: 'Subscriptions' },
  SocialMedia: { screen: 'SocialMedia' },
  Vehicles: { screen: 'Vehicles' },
  RealEstate: { screen: 'RealEstate' },
  // Bottom-tab screens — must navigate via Dashboard
  Reminders: { screen: 'Dashboard', params: { screen: 'Reminders', params: { segment: 'reminders' } } },
  Connections: { screen: 'Dashboard', params: { screen: 'Connections' } },
  Business: { screen: 'Dashboard', params: { screen: 'Business' } },
  Licenses: { screen: 'Licenses' },
  BusinessContact: { screen: 'BusinessContact' },
  Projects: { screen: 'Projects' },
  ComplianceVault: { screen: 'ComplianceVault' },
};

const ENTITY_TYPE_TO_TARGET: Record<string, NavigationTarget> = {
  IdentityHub: { screen: 'IdentityHub' },
  Wallet: { screen: 'Wallet' },
  HealthTracker: { screen: 'HealthTracker' },
  Pet: { screen: 'Pets' },
  BankAccount: { screen: 'BankingFinance' },
  Loan: { screen: 'Loans' },
  Insurance: { screen: 'Insurance' },
  Warranty: { screen: 'Warranties' },
  Property: { screen: 'PersonalProperty' },
  Utility: { screen: 'Utilities' },
  LegalDocument: { screen: 'Legal' },
  Bookmark: { screen: 'Bookmarks' },
  Subscription: { screen: 'Subscriptions' },
  UserSocialNetwork: { screen: 'SocialMedia' },
  Vehicle: { screen: 'Vehicles' },
  RealEstate: { screen: 'RealEstate' },
  // Bottom-tab screens
  Reminder: { screen: 'Dashboard', params: { screen: 'Reminders', params: { segment: 'reminders' } } },
  Connection: { screen: 'Dashboard', params: { screen: 'Connections' } },
  Business: { screen: 'Dashboard', params: { screen: 'Business' } },
  BusinessLicense: { screen: 'Licenses' },
  BusinessContact: { screen: 'BusinessContact' },
  BusinessProject: { screen: 'Projects' },
  ComplianceFolder: { screen: 'ComplianceVault' },
};

const NOTIFICATION_TYPE_TO_TARGET: Record<string, NavigationTarget> = {
  reminder: { screen: 'Dashboard', params: { screen: 'Reminders', params: { segment: 'reminders' } } },
  missed_deadline: { screen: 'Dashboard', params: { screen: 'Reminders', params: { segment: 'reminders' } } },
  vehicle_transfer_request: { screen: 'Vehicles' },
  vehicle_transfer_accepted: { screen: 'Vehicles' },
  vehicle_transfer_rejected: { screen: 'Vehicles' },
  shared_data_updated: { screen: 'Dashboard', params: { screen: 'Connections' } },
  connection_request: { screen: 'Dashboard', params: { screen: 'Connections' } },
  subscription_activated: { screen: 'StoragePlan' },
  trial_will_end: { screen: 'StoragePlan' },
};

// Maps URL path segments to NavigationTarget. Last-resort fallback.
const URL_SEGMENT_TO_TARGET: Record<string, NavigationTarget> = {
  'identity-hub': { screen: 'IdentityHub' },
  wallet: { screen: 'Wallet' },
  'health-tracker': { screen: 'HealthTracker' },
  pets: { screen: 'Pets' },
  'banking-finance': { screen: 'BankingFinance' },
  loans: { screen: 'Loans' },
  insurance: { screen: 'Insurance' },
  warranties: { screen: 'Warranties' },
  'personal-property': { screen: 'PersonalProperty' },
  utilities: { screen: 'Utilities' },
  legal: { screen: 'Legal' },
  bookmarks: { screen: 'Bookmarks' },
  subscriptions: { screen: 'Subscriptions' },
  'social-media': { screen: 'SocialMedia' },
  vehicles: { screen: 'Vehicles' },
  'real-estate': { screen: 'RealEstate' },
  licenses: { screen: 'Licenses' },
  contacts: { screen: 'BusinessContact' },
  projects: { screen: 'Projects' },
  compliance: { screen: 'ComplianceVault' },
  // Bottom-tab screens
  reminders: { screen: 'Dashboard', params: { screen: 'Reminders', params: { segment: 'reminders' } } },
  connections: { screen: 'Dashboard', params: { screen: 'Connections' } },
};

export interface NotificationData {
  routeKey?: string;
  routekey?: string;
  entityType?: string;
  entitytype?: string;
  entityId?: string;
  entityid?: string;
  parentEntityId?: string;
  parententityid?: string;
  resourceType?: string;
  resourcetype?: string;
  businessId?: string;
  business_id?: string;
  connectionTabSource?: string;
  ownerId?: string;
  sharedWithUserId?: string;
  accessLevel?: string;
  accessType?: string;
  module?: string;
  action?: string;
  type?: string;
  [key: string]: string | undefined;
}

const CONNECTION_SHARE_PARAM_KEYS = ['connectionTabSource', 'ownerId', 'sharedWithUserId', 'accessLevel', 'accessType'] as const;

const buildConnectionShareParams = (data: FullNotificationData): Record<string, any> => {
  const params: Record<string, any> = {};
  for (const key of CONNECTION_SHARE_PARAM_KEYS) {
    const value = data[key];
    if (value === undefined || value === null || value === '') continue;
    params[key] = key === 'ownerId' || key === 'sharedWithUserId' ? Number(value) : value;
  }
  return params;
};

export const buildSharedBusinessFromNotification = (
  data: FullNotificationData,
): { id: number; businessname?: string } | null => {
  const businessId = data.businessId || data.business_id;
  if (data.connectionTabSource !== 'shared_with_you' || !businessId) return null;
  return {
    id: Number(businessId),
    businessname: data.businessName || data.business_name,
  };
};

export const BUSINESS_MODULE_SCREENS = new Set([
  'Licenses', 'Projects', 'BusinessContact', 'ComplianceVault',
]);

export interface FullNotificationData extends NotificationData {
  notificationType?: string;
  url?: string;
}

const ENTITY_TYPE_TO_MODAL_SCREEN: Record<string, string> = {
  warranty: 'Warranties',
  insurance: 'Insurance',
  loan: 'Loans',
  utility: 'Utilities',
  subscription: 'Subscriptions',
  vehicle: 'Vehicles',
  social_media: 'SocialMedia',
  social_network: 'SocialMedia',
  bank_account: 'BankingFinance',
  banking: 'BankingFinance',
  legal_document: 'Legal',
  legal: 'Legal',
  bookmark: 'Bookmarks',
  personal_property: 'PersonalProperty',
  pet: 'Pets',
  pet_vaccination: 'Pets',
  pet_medication: 'Pets',
  pet_vet_appointment: 'Pets',
  pet_illness: 'Pets',
  wallet: 'Wallet',
  real_estate: 'RealEstate',
  service_work_history: 'RealEstate',
  vehicle_service_record: 'Vehicles',
  vehicle_accident: 'Vehicles',
  vehicle_accident_repair_start: 'Vehicles',
  vehicle_accident_repair_end: 'Vehicles',
  business_license: 'Licenses',
  business_project: 'Projects',
  business_contact: 'BusinessContact',
  driver_license: 'IdentityHub',
  passport: 'IdentityHub',
  license_certification: 'IdentityHub',
  child_medication: 'HealthTracker',
  child_medication_schedule: 'HealthTracker',
  child_caregiver: 'HealthTracker',
  child_doctor: 'HealthTracker',
  child_appointment: 'HealthTracker',
  child_illness: 'HealthTracker',
  child_surgery: 'HealthTracker',
  compliance_record: 'ComplianceVault',
};

// Screens that read `openEntityId` from route params to auto-open a record's detail modal.
const MODAL_OPEN_SUPPORTED_SCREENS = new Set([
  'Warranties', 'Insurance', 'Loans', 'Utilities', 'Subscriptions',
  'Vehicles', 'SocialMedia', 'BankingFinance', 'Legal', 'Bookmarks',
  'PersonalProperty', 'Pets', 'Wallet', 'RealEstate',
  'Licenses', 'Projects', 'BusinessContact', 'IdentityHub',
]);

export const ENTITY_TYPE_TO_EDIT_SCREEN: Record<string, string> = {
  loan: 'Loans',
  insurance: 'Insurance',
  warranty: 'Warranties',
  subscription: 'Subscriptions',
  utility: 'Utilities',
  bookmark: 'Bookmarks',
  personal_property: 'PersonalProperty',
  bank_account: 'BankingFinance',
  banking: 'BankingFinance',
  social_media: 'SocialMedia',
  social_network: 'SocialMedia',
  legal_document: 'Legal',
  legal: 'Legal',
  vehicle: 'Vehicles',
  business_project: 'Projects',
};

interface SubRecordEditConfig {
  screen: string;
  param: string;
  includeParentEntityId?: boolean;
}

const SUB_RECORD_VIEW_TARGETS: Record<string, SubRecordEditConfig> = {
  pet_vet_appointment: { screen: 'Pets', param: 'openAppointmentIdForView' },
  pet_appointment: { screen: 'Pets', param: 'openAppointmentIdForView' },
  pet_vaccination: { screen: 'Pets', param: 'openVaccinationIdForView' },
  pet_medication: { screen: 'Pets', param: 'openMedicationIdForView' },
  pet_illness: { screen: 'Pets', param: 'openIllnessIdForView' },
  child_medication: { screen: 'HealthTracker', param: 'openMedicationIdForView' },
  child_caregiver: { screen: 'HealthTracker', param: 'openCaregiverIdForView' },
  child_doctor: { screen: 'HealthTracker', param: 'openDoctorIdForView' },
  child_appointment: { screen: 'HealthTracker', param: 'openAppointmentIdForView' },
  child_illness: { screen: 'HealthTracker', param: 'openIllnessIdForView' },
  child_surgery: { screen: 'HealthTracker', param: 'openSurgeryIdForView' },
  compliance_record: { screen: 'ComplianceVault', param: 'openRecordIdForView' },
};

const SUB_RECORD_EDIT_TARGETS: Record<string, SubRecordEditConfig> = {
  pet_vet_appointment: { screen: 'Pets', param: 'openAppointmentIdForEdit', includeParentEntityId: false },
  pet_appointment: { screen: 'Pets', param: 'openAppointmentIdForEdit', includeParentEntityId: false },
  pet_vaccination: { screen: 'Pets', param: 'openVaccinationIdForEdit' },
  pet_medication: { screen: 'Pets', param: 'openMedicationIdForEdit' },
  pet_illness: { screen: 'Pets', param: 'openIllnessIdForEdit' },
  child_medication: { screen: 'HealthTracker', param: 'openMedicationIdForEdit' },
  child_caregiver: { screen: 'HealthTracker', param: 'openCaregiverIdForEdit' },
  child_doctor: { screen: 'HealthTracker', param: 'openDoctorIdForEdit' },
  child_appointment: { screen: 'HealthTracker', param: 'openAppointmentIdForEdit' },
  child_illness: { screen: 'HealthTracker', param: 'openIllnessIdForEdit' },
  child_surgery: { screen: 'HealthTracker', param: 'openSurgeryIdForEdit' },
  vehicle_accident: { screen: 'Vehicles', param: 'openAccidentIdForEdit' },
  vehicle_service_record: { screen: 'Vehicles', param: 'openServiceRecordIdForEdit' },
  service_work_history: { screen: 'RealEstate', param: 'openServiceIdForEdit' },
};

const resolveWithSuffixFallback = <T>(map: Record<string, T>, entityType: string): T | undefined => {
  if (Object.prototype.hasOwnProperty.call(map, entityType)) return map[entityType];
  let bestKey: string | undefined;
  for (const key of Object.keys(map)) {
    if (entityType.startsWith(`${key}_`) && (!bestKey || key.length > bestKey.length)) {
      bestKey = key;
    }
  }
  return bestKey ? map[bestKey] : undefined;
};

export const resolveEntityEditTarget = (item: {
  entityType?: string;
  entityId?: number | string | null;
  parentId?: number | string | null;
}): NavigationTarget | null => {
  const entityType = item.entityType?.toLowerCase();
  if (!entityType) return null;

  const subRecordConfig = resolveWithSuffixFallback(SUB_RECORD_EDIT_TARGETS, entityType);
  if (subRecordConfig) {
    const params: Record<string, any> = { [subRecordConfig.param]: item.entityId };
    if (subRecordConfig.includeParentEntityId !== false) {
      params.openParentEntityId = item.parentId ?? undefined;
    }
    return { screen: subRecordConfig.screen, params };
  }

  const editScreen = resolveWithSuffixFallback(ENTITY_TYPE_TO_EDIT_SCREEN, entityType);
  if (editScreen) {
    return { screen: editScreen, params: { openEntityIdForEdit: item.entityId } };
  }

  return null;
};

export const resolveAttentionItemTarget = (item: {
  entityType?: string;
  entityId?: number | string | null;
  routeKey?: string;
  parentId?: number | string | null;
}): NavigationTarget | null => {
  const target = resolveScreenFromNotification({
    entityType: item.entityType,
    entityId: item.entityId != null ? String(item.entityId) : undefined,
    routeKey: item.routeKey,
    parentEntityId: item.parentId != null ? String(item.parentId) : undefined,
    notificationType: 'reminder',
  });
  if (target?.params && Object.keys(target.params).length > 0) return target;

  const routeKey = item.routeKey;
  if (routeKey && routeKey !== 'Unknown') {
    const exact = ROUTE_KEY_TO_TARGET[routeKey];
    if (exact) return exact;
    const ci = Object.keys(ROUTE_KEY_TO_TARGET).find(
      k => k.toLowerCase() === routeKey.toLowerCase(),
    );
    if (ci) return ROUTE_KEY_TO_TARGET[ci];
    return { screen: routeKey };
  }

  return target ?? { screen: 'Dashboard', params: { screen: 'Reminders', params: { segment: 'reminders' } } };
};

export const resolveScreenFromNotification = (
  data?: FullNotificationData,
): NavigationTarget | null => {
  if (!data) return null;

  const notifType = data.notificationType;

  if (notifType === 'connection_request') {
    return { screen: 'ConnectionsRequest' };
  }

  if (notifType === 'connection_accepted') {
    const connectionId = (data as any).connectionId ?? (data as any).connectionid;
    if (connectionId != null) {
      return { screen: 'ConnectionUserDetails', params: { connectionId: Number(connectionId) } };
    }
    return { screen: 'ConnectionsRequest' };
  }

  // An Owner/Admin approval request (or its outcome) on a business: open its Team & approvals screen.
  if (notifType === 'business_approval_request') {
    const businessId = Number((data as any).businessId ?? (data as any).businessid ?? (data as any).business_id ?? 0);
    if (businessId > 0) return { screen: 'BusinessTeam', params: { businessId } };
  }

  if (notifType === 'subscription_activated' || notifType === 'trial_will_end') {
    return { screen: 'StoragePlan' };
  }

  if (
    notifType === 'vehicle_transfer_request' ||
    notifType === 'vehicle_transfer_accepted' ||
    notifType === 'vehicle_transfer_rejected'
  ) {
    const transferId = data.transferId ? Number(data.transferId) : undefined;
    return { screen: 'Vehicles', params: transferId ? { openTransferId: transferId } : undefined };
  }

  if (notifType === 'missed_deadline' || notifType === 'reminder') {
    const entityType = (data.entityType || data.entitytype || '').toLowerCase();
    const entityId = data.entityId || data.entityid;
    const parentEntityId = data.parentEntityId || data.parententityid;
    const modalScreen = resolveWithSuffixFallback(ENTITY_TYPE_TO_MODAL_SCREEN, entityType);
    if (modalScreen) {
      // Only pass openEntityId for screens that support modal auto-open
      const supportsModalOpen = MODAL_OPEN_SUPPORTED_SCREENS.has(modalScreen);
      const businessId = data.businessId || data.business_id;
      const params: Record<string, any> = {};
      if (supportsModalOpen && entityId) params.openEntityId = Number(entityId);
      if (modalScreen === 'IdentityHub' && entityId) params.openEntityType = entityType;
      if (entityId) {
        const viewConfig = resolveWithSuffixFallback(SUB_RECORD_VIEW_TARGETS, entityType);
        if (viewConfig && viewConfig.screen === modalScreen) params[viewConfig.param] = Number(entityId);
      }
      if (parentEntityId) {
        params.openParentEntityId = Number(parentEntityId);
        if (modalScreen === 'Pets' && entityType) params.openEntityType = entityType;
      }
      if (businessId && BUSINESS_MODULE_SCREENS.has(modalScreen)) params.businessId = Number(businessId);
      return {
        screen: modalScreen,
        params: Object.keys(params).length > 0 ? params : undefined,
      };
    }
    if (notifType === 'reminder') {
      const reminderId = data.reminderId || data.reminderid;
      const rEntityType = data.entityType || data.entitytype;
      const reminderParams: Record<string, any> = {};
      if (reminderId) reminderParams.openReminderId = Number(reminderId);
      if (rEntityType) reminderParams.openReminderEntityType = rEntityType;
      return {
        screen: 'Dashboard',
        params: {
          screen: 'Reminders',
          params: { segment: 'reminders', ...reminderParams },
        },
      };
    }
  }

  const routeKey = data.routeKey || data.routekey;
  if (routeKey) {
    const exact = ROUTE_KEY_TO_TARGET[routeKey] || ROUTE_KEY_TO_TARGET[
      Object.keys(ROUTE_KEY_TO_TARGET).find(k => k.toLowerCase() === routeKey.toLowerCase()) ?? ''
    ];
    if (exact) {
      const shareParams = buildConnectionShareParams(data);
      const entityId = data.entityId || data.entityid;

      if (routeKey === 'ComplianceVault') {
        const resourceType = (data.resourceType || data.resourcetype || '').toLowerCase();
        const entityType = (data.entityType || data.entitytype || '').toLowerCase();
        const parentEntityId = data.parentEntityId || data.parententityid;
        const isComplianceRecord = resourceType === 'compliancerecord' || entityType === 'compliancerecord';
        if (isComplianceRecord && entityId && parentEntityId) {
          // Folder id is already known — go straight into it and open the record's modal
          return {
            screen: 'ComplianceDetail',
            params: {
              folder: { id: Number(parentEntityId) },
              openRecordIdForView: Number(entityId),
              ...shareParams,
            },
          };
        }
        if (isComplianceRecord && entityId) {
          // No parentEntityId given — fall back to ComplianceVault's record->folder auto-open flow
          return { screen: 'ComplianceVault', params: { openRecordIdForView: Number(entityId), ...shareParams } };
        }
      }

      // Auto-open the specific record's detail modal on screens that support it
      if (entityId && MODAL_OPEN_SUPPORTED_SCREENS.has(exact.screen)) {
        shareParams.openEntityId = Number(entityId);
      }

      if (Object.keys(shareParams).length > 0) {
        return { screen: exact.screen, params: { ...exact.params, ...shareParams } };
      }
      return exact;
    }
  }

  const entityType = data.entityType || data.entitytype;
  if (entityType) {
    const exact = ENTITY_TYPE_TO_TARGET[entityType];
    if (exact) return exact;
    const ci = Object.keys(ENTITY_TYPE_TO_TARGET).find(
      k => k.toLowerCase() === entityType.toLowerCase(),
    );
    if (ci) return ENTITY_TYPE_TO_TARGET[ci];
  }

  if (notifType && NOTIFICATION_TYPE_TO_TARGET[notifType]) {
    return NOTIFICATION_TYPE_TO_TARGET[notifType];
  }

  if (data.url) {
    const segments = data.url.toLowerCase().split('/');
    for (const seg of segments) {
      if (seg && URL_SEGMENT_TO_TARGET[seg]) {
        return URL_SEGMENT_TO_TARGET[seg];
      }
    }
  }

  return null;
};
