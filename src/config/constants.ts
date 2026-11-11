import { isIOS } from '../utils/helpers';
import { ENV } from './env';

export const SAVE_TOKENS_CONSTANT = {
    ACCESS_TOKEN: '@handlah_access_token',
    REFRESH_TOKEN: '@handlah_refresh_token',
    VERIFICATION_TOKEN: '@handlah_verification_token',
} as const;

// export const API_ENDPOINTS = {
//     AUTH: {
//         LOGIN: 'login',
//         REGISTER: 'register',
//         CHECK_AUTH: 'check-auth',
//         UPDATE_ME: 'auth/me',
//         COUNTRIES: 'api/countries',
//         STATES: 'states/country',
//         VERIFY_OTP: 'verify-code',
//         VERIFY_FORGOT: 'verify-reset-password',
//         FORGOT_RESET_PASSWORD: 'reset-password',
//         SUBSCRIBE_PLAN: 'subscribe',
//         RESEND_EMAIL_OTP: 'send-verification-code',
//         VERIFY_EMAIL_OTP: 'verify-email-otp',
//         CHANGE_PHONE_OTP: 'change-phone-otp',
//         CHANGE_EMAIL_OTP: 'change-email-otp',
//         REFRESH_TOKEN: 'auth/refresh-token',
//         LOGOUT: 'api/auth/logout',
//         CHANGE_PASSWORD: 'api/auth/change-password',
//         FORGOT_PASSWORD: 'forgot-password',
//         RESET_PASSWORD: 'auth/reset-password',
//         DRIVER_LICENSE: 'api/identity/driver-licenses',
//         IMAGE_UPLOAD: 'api/image',
//         PASSPORT: 'api/identity/passports',
//         LICENSES: 'api/identity/licenses',
//         IDENTITY_HUB: 'api/identity/hub/overview',
//         SOCIAL_NETWORK_TYPES: 'api/social-network-types',
//         SOCIAL_NETWORK_SETUP: 'usersocialnetworksetup',
//         USER_SOCIAL_NETWORKS: 'usersocialnetworksetup',
//         BOOKMARKS: 'api/bookmarks',
//         BOOKMARK_DELETE: 'api/bookmarks',
//         BOOKMARK_DETAIL: 'bookmarks',
//         SUBSCRIPTIONS: 'api/subscriptions',
//         SUBSCRIPTION_DETAIL: 'api/subscriptions',
//         LEGAL_DOCUMENTS: 'api/legal-documents',
//         WALLET: 'api/wallet',
//         PETS: 'pets',
//         PET_VACCINATIONS: 'vaccinations',
//         PET_MEDICATIONS: 'medications',
//         PET_VET_APPOINTMENTS: 'vet-appointments',
//         PET_ILLNESSES: 'illnesses',
//         EDIT_HISTORY: 'api/edit-history',
//         UPDATE_TIMEZONE: '/api/identity/timezone'
//     },
//     LIABILITIES: {
//         GET_LOAN: 'api/loans',
//         ADD_LOAN: 'api/loans',
//         UPDATE_LOAN: 'api/loans',
//         DELETE_LOAN: 'api/loans',
//         // Utilities endpoints
//         GET_UTILITIES: 'api/utilities',
//         ADD_UTILITY: 'api/utilities',
//         UPDATE_UTILITY: 'api/utilities',
//         DELETE_UTILITY: 'api/utilities',
//         // Insurance endpoints
//         GET_INSURANCES: 'api/insurances',
//         ADD_INSURANCE: 'api/insurances',
//         ADD_INSURANCES_BULK: 'api/insurances/bulk',
//         UPDATE_INSURANCE: 'api/insurances',
//         DELETE_INSURANCE: 'api/insurances',
//         // Warranties endpoints
//         GET_WARRANTIES: 'api/warranties',
//         ADD_WARRANTY: 'api/warranties',
//         ADD_WARRANTIES_BULK: 'api/warranties/bulk',
//         UPDATE_WARRANTY: 'api/warranties',
//         DELETE_WARRANTY: 'api/warranties',
//     },
//     HEALTH_TRACKER: {
//         // Children endpoints
//         CHILDREN: 'children',
//         // Child sub-resources (use with childId)
//         CHILD_MEDICATIONS: 'medications',
//         CHILD_DOCTORS: 'doctors',
//         CHILD_CAREGIVERS: 'caregivers',
//         CHILD_APPOINTMENTS: 'appointments',
//     },
//     USER: {
//         PROFILE: 'user/profile',
//         UPDATE_PROFILE: 'user/update-profile',
//         CHANGE_PASSWORD: 'user/change-password',
//     },
//     ASSETS: {
//         ADD_BANK_ACCOUNT: 'bankaccounts',
//         GET_BANK_ACCOUNT: 'bankaccounts',
//         PERSONAL_PROPERTY: 'api/properties',
//         BUSINESS_PROPERTY: 'api/properties?businessId=',
//         MOVE_PERSONAL_PROPERTY: 'api/real-estates',
//         VEHICLES: 'api/vehicles',
//         BUSINESS_VEHICLES: 'api/vehicles?businessId=',
//         VEHICLE_SERVICE_RECORDS: 'service-records',
//         VEHICLE_SERVICE_RECORDS_BULK: 'service-records',
//         VEHICLE_ACCIDENTS: 'accidents',
//         VEHICLE_ACCIDENTS_BULK: 'accidents/bulk',
//         VEHICLE_TRANSFERS_MARK_AS_SOLD: 'transfers/mark-as-sold',
//         VEHICLE_TRANSFERS_SHARE: 'transfers/share',
//     },
//     VEHICLE_TRANSFERS: {
//         INCOMING: 'api/vehicle-transfers/incoming',
//         ACCEPT: 'api/vehicle-transfers',
//         REJECT: 'api/vehicle-transfers',
//     },
//     REAL_STATE: {
//         REAL_STATE_OVERVIEW: '/api/real-estates',
//         BUSINESS_REAL_STATE_OVERVIEW: '/api/real-estates?businessId=',
//         REAL_STATE_LOAN_MORTGAGE: 'api/loans',
//         REAL_STATE_ADD_LOAN_MORTGAGE: '/api/loans/bulk',
//         REAL_STATE_UTILITIES: 'api/utilities',
//         REAL_STATE_ADD_UTILITIES: 'api/utilities/bulk',
//         REAL_STATE_INSURANCE: 'api/insurances',
//         REAL_STATE_ADD_INSURANCE: 'api/insurances/bulk',
//         REAL_STATE_WARRANTIES: 'api/warranties',
//         REAL_STATE_ADD_WARRANTIES: 'api/warranties/bulk',
//         REAL_STATE_PERSONAL_PROPERTY: 'api/properties',
//         REAL_STATE_ADD_PERSONAL_PROPERTY: 'api/properties/bulk',
//         REAL_STATE_SERVICE_WORK_HISTORY: 'api/service-work-histories',
//         REAL_STATE_ADD_SERVICE_WORK_HISTORY: 'api/service-work-histories/bulk',
//     },
//     BUSINESS: {
//         GET_BUSINESSES: 'businesses',
//         CREATE_BUSINESS: 'businesses',
//         UPDATE_BUSINESS: 'businesses',
//         DELETE_BUSINESS: 'businesses',
//         BUSINESSES_BY_USERNAME: 'businesses/by-username',
//         // Business Contacts
//         GET_BUSINESS_CONTACTS: 'api/business-contacts',
//         ADD_BUSINESS_CONTACT: 'api/business-contacts',
//         UPDATE_BUSINESS_CONTACT: 'api/business-contacts',
//         DELETE_BUSINESS_CONTACT: 'api/business-contacts',
//         // Business Licenses
//         GET_BUSINESS_LICENSES: 'business-licenses',
//         GET_BUSINESS_LICENSE: 'business-licenses',
//         ADD_BUSINESS_LICENSE: 'business-licenses',
//         UPDATE_BUSINESS_LICENSE: 'business-licenses',
//         DELETE_BUSINESS_LICENSE: 'business-licenses',

//         // Compliance Folders
//         GET_COMPLIANCE_FOLDERS: 'api/compliance-folders',
//         GET_COMPLIANCE_FOLDER: 'api/compliance-folders',
//         ADD_COMPLIANCE_FOLDER: 'api/compliance-folders',
//         UPDATE_COMPLIANCE_FOLDER: 'api/compliance-folders',
//         DELETE_COMPLIANCE_FOLDER: 'api/compliance-folders',

//         // Compliance Records
//         GET_COMPLIANCE_RECORDS: 'api/compliance-records',
//         GET_COMPLIANCE_RECORD: 'api/compliance-records',
//         ADD_COMPLIANCE_RECORD: 'api/compliance-records',
//         UPDATE_COMPLIANCE_RECORD: 'api/compliance-records',
//         DELETE_COMPLIANCE_RECORD: 'api/compliance-records',

//         // Business Projects
//         GET_BUSINESS_PROJECTS: 'api/business-projects',
//         ADD_BUSINESS_PROJECT: 'api/business-projects',
//         UPDATE_BUSINESS_PROJECT: 'api/business-projects',
//         DELETE_BUSINESS_PROJECT: 'api/business-projects',
//     },

//     REMINDERS: {
//         GET_REMINDERS: 'api/reminders',
//         ADD_AD_HOC_REMINDER: 'api/reminders/ad-hoc',
//         MARK_COMPLETED: 'api/reminders',
//     },
//     SEARCH: {
//         GLOBAL_SEARCH: 'api/search',
//     },
//     APP_TABS: {
//         GET_APP_TABS: 'api/app-tabs',
//         ADD_FAVORITE: 'api/app-tabs/favorites',
//         DELETE_FAVORITE: 'api/app-tabs/favorites',
//     },

//     CONNECTIONS: {
//         GET_CONNECTION_TYPES: 'api/connection-types',
//         GET_CONNECTIONS: 'api/connections',
//         GET_HANDLAH_USERS: 'api/handlah-users',
//         REQUEST: 'api/connections/request',
//         UPDATE_CONNECTION: 'api/connections',
//         GET_REQUESTS_SENT: 'api/connections/requests?type=sent&targetAccountType=',
//         GET_REQUESTS_RECEIVED: 'api/connections/requests?type=received&targetAccountType=',
//         GET_EMERGENCY_CONNECTIONS: 'api/connections/emergency?targetAccountType=',
//         REQUEST_ACTION: 'api/connections/requests/',
//         EMERGENCY_ACCESS_REQUEST: 'api/connections/emergency/',
//     },
//     SHARING: {
//         GET_SHARING_SUMMARY: 'sharing-summary',
//         EMERGENCY_ACCESS: 'emergency-access',
//         SEND_EMERGENCY_CONNECTION_REQUEST: 'api/connections/emergency/request',
//         SHARING_SERVICE: 'api/sharing',
//         SHARING_SYNC: '/api/sharing/sync'
//     },
//     NOTIFICATIONS: {
//         FCM_TOKENS: 'api/fcm-tokens',
//     },

//     PRIVACY: {
//         SUBMIT_APPEAL: 'api/privacy/appeal',
//         DATA_ACCESS_REQUEST: 'api/privacy/data-access-request',
//         DATA_DELETION_REQUEST: 'api/privacy/data-deletion-request',
//     },
// } as const;

export const API_ENDPOINTS = {
    PURCHASES: {
        SYNC: 'revenuecat/sync',
    },
    ONBOARDING: {
        SUBMIT: 'onboarding',
        STATUS: 'onboarding/status',
    },
    DASHBOARD: {
        GET: 'dashboard',
        MARK_DONE: 'dashboard/mark-done',
    },
    // The new reminder engine. Used only when ENV.REMINDERS_V2 is on.
    DASHBOARD_V2: {
        GET: 'v2/dashboard',
        MARK_DONE: 'v2/dashboard/mark-done',
    },
    INSIGHTS: {
        GET: 'insights',
        SUMMARY: 'insights/summary',
        DISMISS: 'insights/dismiss',
        SNOOZE: 'insights/snooze',
        // DELETE /insights/dismiss/{insightId} — same base path as DISMISS
        UNDISMISS: 'insights/dismiss',
    },
    AUTH: {
        LOGIN: 'login',
        REGISTER: 'register',
        CHECK_AUTH: 'check-auth',
        UPDATE_ME: 'auth/me',
        COUNTRIES: 'countries',
        COUNTRY_BY_ID: 'countries',
        STATES: 'states/country',
        STATE_BY_ID: 'states',
        VERIFY_OTP: 'verify-code',
        VERIFY_FORGOT: 'verify-reset-password',
        FORGOT_RESET_PASSWORD: 'reset-password',
        SUBSCRIBE_PLAN: 'subscribe',
        RESEND_EMAIL_OTP: 'send-verification-code',
        VERIFY_EMAIL_OTP: 'verify-email-otp',
        CHANGE_PHONE_OTP: 'change-phone-otp',
        CHANGE_EMAIL_OTP: 'change-email-otp',
        CHANGE_EMAIL_SEND_OTP: 'auth/change-email/send-otp',
        CHANGE_EMAIL_VERIFY_OTP: 'auth/change-email/verify-otp',
        CHANGE_PHONE_SEND_OTP: 'auth/change-phone/send-otp',
        CHANGE_PHONE_VERIFY_OTP: 'auth/change-phone/verify-otp',
        REFRESH_TOKEN: 'auth/refresh-token',
        LOGOUT: 'auth/logout',
        CHANGE_PASSWORD: 'auth/change-password',
        FORGOT_PASSWORD: 'forgot-password',
        RESET_PASSWORD: 'auth/reset-password',
        DRIVER_LICENSE: 'identity/driver-licenses',
        IMAGE_UPLOAD: 'image',
        IMAGES_SIGNED_URLS: 'images/signed-urls',
        MODULE_GUIDES: 'module-guides',
        PASSPORT: 'identity/passports',
        LICENSES: 'identity/licenses',
        IDENTITY_HUB: 'identity/hub/overview',
        SOCIAL_NETWORK_TYPES: 'social-network-types',
        SOCIAL_NETWORK_SETUP: 'usersocialnetworksetup',
        USER_SOCIAL_NETWORKS: 'usersocialnetworksetup',
        BOOKMARKS: 'bookmarks',
        BOOKMARK_DELETE: 'bookmarks',
        BOOKMARK_DETAIL: 'bookmarks',
        SUBSCRIPTIONS: 'subscriptions',
        SUBSCRIPTION_DETAIL: 'subscriptions',
        LEGAL_DOCUMENTS: 'legal-documents',
        WALLET: 'wallet',
        WALLET_TOGGLE: 'wallet/toggle',
        DELETE_ACCOUNT: 'auth/delete-account',
        CANCEL_ACCOUNT_DELETION: 'auth/cancel-account-deletion',
        PETS: 'pets',
        PET_VACCINATIONS: 'vaccinations',
        PET_MEDICATIONS: 'medications',
        PET_VET_APPOINTMENTS: 'vet-appointments',
        PET_ILLNESSES: 'illnesses',
        EDIT_HISTORY: 'edit-history',
        UPDATE_TIMEZONE: 'identity/timezone',
        GOOGLE_SIGNIN: '/auth/google-signin',
        APPLE_SIGNIN: '/auth/apple-signin',
        UPDATE_USERNAME: 'auth/username',
        MFA_SETTINGS: 'auth/mfa',
        MFA_SEND_OTP: 'auth/mfa/send-otp',
        MFA_VERIFY: 'auth/mfa/verify',
        BIOMETRIC_REGISTER: 'auth/biometric/register',
        BIOMETRIC_DEVICE: 'auth/biometric/device',
    },
    LIABILITIES: {
        GET_LOAN: 'loans',
        ADD_LOAN: 'loans',
        UPDATE_LOAN: 'loans',
        DELETE_LOAN: 'loans',
        LINK_LOAN: 'loans',
        // Utilities endpoints
        GET_UTILITIES: 'utilities',
        ADD_UTILITY: 'utilities',
        UPDATE_UTILITY: 'utilities',
        DELETE_UTILITY: 'utilities',
        LINK_UTILITY: 'utilities',
        // Insurance endpoints
        GET_INSURANCES: 'insurances',
        ADD_INSURANCE: 'insurances',
        ADD_INSURANCES_BULK: 'insurances/bulk',
        UPDATE_INSURANCE: 'insurances',
        DELETE_INSURANCE: 'insurances',
        LINK_INSURANCE: 'insurances',
        // Warranties endpoints
        GET_WARRANTIES: 'warranties',
        ADD_WARRANTY: 'warranties',
        ADD_WARRANTIES_BULK: 'warranties/bulk',
        UPDATE_WARRANTY: 'warranties',
        DELETE_WARRANTY: 'warranties',
        LINK_WARRANTY: 'warranties',
    },
    HEALTH_TRACKER: {
        // Children endpoints
        CHILDREN: 'children',
        CHILDREN_AS_CAREGIVER: 'children/as-caregiver',
        // Child sub-resources (use with childId)
        CHILD_MEDICATIONS: 'medications',
        CHILD_DOCTORS: 'doctors',
        CHILD_CAREGIVERS: 'caregivers',
        CHILD_APPOINTMENTS: 'appointments',
        CHILD_ILLNESSES: 'illnesses',
        CHILD_SURGERIES: 'surgeries',
    },
    USER: {
        PROFILE: 'user/profile',
        UPDATE_PROFILE: 'user/update-profile',
        CHANGE_PASSWORD: 'user/change-password',
        NOTIFICATION_PREFERENCES: 'user/notification-preferences',
    },
    ASSETS: {
        ADD_BANK_ACCOUNT: 'bankaccounts',
        GET_BANK_ACCOUNT: 'bankaccounts',
        PERSONAL_PROPERTY: 'properties',
        BUSINESS_PROPERTY: 'properties?businessId=',
        MOVE_PERSONAL_PROPERTY: 'real-estates',
        VEHICLES: 'vehicles',
        BUSINESS_VEHICLES: 'vehicles?businessId=',
        VEHICLE_SERVICE_RECORDS: 'service-records',
        VEHICLE_SERVICE_RECORDS_BULK: 'service-records',
        VEHICLE_ACCIDENTS: 'accidents',
        VEHICLE_ACCIDENTS_BULK: 'accidents/bulk',
        VEHICLE_TRANSFERS_MARK_AS_SOLD: 'transfers/mark-as-sold',
        VEHICLE_TRANSFERS_SHARE: 'transfers/share',
        VEHICLE_SALE_TRANSFER: 'vehicle-transfers',
    },
    // Team & approvals: GET businesses/{id}/team, POST businesses/{id}/approval-requests,
    // POST business-approval-requests/{id}/vote | cancel
    BUSINESS_TEAM: {
        BUSINESSES: 'businesses',
        APPROVALS: 'business-approval-requests',
    },
    VEHICLE_TRANSFERS: {
        // GET vehicle-transfers/vehicles/{vehicleId}/items — what can be sent to the buyer
        ITEMS: 'vehicle-transfers/vehicles',
        INCOMING: 'vehicle-transfers/incoming',
        ACCEPT: 'vehicle-transfers',
        REJECT: 'vehicle-transfers',
    },
    REAL_STATE: {
        REAL_STATE_OVERVIEW: '/real-estates',
        BUSINESS_REAL_STATE_OVERVIEW: '/real-estates?businessId=',
        REAL_STATE_LOAN_MORTGAGE: 'loans',
        REAL_STATE_ADD_LOAN_MORTGAGE: '/loans/bulk',
        REAL_STATE_UTILITIES: 'utilities',
        REAL_STATE_ADD_UTILITIES: 'utilities/bulk',
        REAL_STATE_INSURANCE: 'insurances',
        REAL_STATE_ADD_INSURANCE: 'insurances/bulk',
        REAL_STATE_WARRANTIES: 'warranties',
        REAL_STATE_ADD_WARRANTIES: 'warranties/bulk',
        REAL_STATE_PERSONAL_PROPERTY: 'properties',
        REAL_STATE_ADD_PERSONAL_PROPERTY: 'properties/bulk',
        REAL_STATE_SERVICE_WORK_HISTORY: 'service-work-histories',
        REAL_STATE_ADD_SERVICE_WORK_HISTORY: 'service-work-histories/bulk',
    },
    BUSINESS: {
        GET_BUSINESSES: 'businesses',
        CREATE_BUSINESS: 'businesses',
        UPDATE_BUSINESS: 'businesses',
        DELETE_BUSINESS: 'businesses',
        BUSINESSES_BY_USERNAME: 'businesses/by-username',
        // Business Contacts
        GET_BUSINESS_CONTACTS: 'business-contacts',
        ADD_BUSINESS_CONTACT: 'business-contacts',
        UPDATE_BUSINESS_CONTACT: 'business-contacts',
        DELETE_BUSINESS_CONTACT: 'business-contacts',
        // Business Licenses
        GET_BUSINESS_LICENSES: 'business-licenses',
        GET_BUSINESS_LICENSE: 'business-licenses',
        ADD_BUSINESS_LICENSE: 'business-licenses',
        UPDATE_BUSINESS_LICENSE: 'business-licenses',
        DELETE_BUSINESS_LICENSE: 'business-licenses',

        // Compliance Folders
        GET_COMPLIANCE_FOLDERS: 'compliance-folders',
        GET_COMPLIANCE_FOLDER: 'compliance-folders',
        ADD_COMPLIANCE_FOLDER: 'compliance-folders',
        UPDATE_COMPLIANCE_FOLDER: 'compliance-folders',
        DELETE_COMPLIANCE_FOLDER: 'compliance-folders',

        // Compliance Records
        GET_COMPLIANCE_RECORDS: 'compliance-records',
        GET_COMPLIANCE_RECORD: 'compliance-records',
        ADD_COMPLIANCE_RECORD: 'compliance-records',
        UPDATE_COMPLIANCE_RECORD: 'compliance-records',
        DELETE_COMPLIANCE_RECORD: 'compliance-records',

        // Business Projects
        GET_BUSINESS_PROJECTS: 'business-projects',
        ADD_BUSINESS_PROJECT: 'business-projects',
        UPDATE_BUSINESS_PROJECT: 'business-projects',
        DELETE_BUSINESS_PROJECT: 'business-projects',
    },

    REMINDERS: {
        GET_REMINDERS: 'reminders',
        GET_REMINDER_BY_ID: 'reminders',
        ADD_AD_HOC_REMINDER: 'reminders/ad-hoc',
        MARK_COMPLETED: 'reminders',
        UPDATE_REMINDER: 'reminders', // PUT reminders/{id}
        DELETE_REMINDER: 'reminders', // DELETE reminders/{id}
        SET_ACTIVE: 'reminders', // PATCH reminders/{id}/active
        UPDATE_BATCH: 'reminders/batch', // PUT reminders/batch/{batchId}
        DELETE_BATCH: 'reminders/batch', // DELETE reminders/batch/{batchId}
        SET_BATCH_ACTIVE: 'reminders/batch', // PATCH reminders/batch/{batchId}/active
    },
    REMINDERS_V2: {
        LIST: 'v2/reminders',
        BY_ID: 'v2/reminders',
        COMPLETE: 'v2/reminders/occurrences', // POST {id}/complete
        DISMISS: 'v2/reminders/occurrences', // POST {id}/dismiss
        DELETE: 'v2/reminders/occurrences', // POST {id}/delete
        ROW: 'v2/reminders/intervals', // POST {rowId}/complete | dismiss | delete
        CUSTOM_CREATE: 'v2/reminders/custom',
        CUSTOM_BY_ID: 'v2/reminders/custom', // GET / PUT {seriesId}
        CUSTOM_OCCURRENCES: 'v2/reminders/custom/occurrences', // POST {id}/activate | deactivate
    },
    SEARCH: {
        GLOBAL_SEARCH: 'search',
    },
    APP_TABS: {
        GET_APP_TABS: 'app-tabs',
        GET_FAVORITE_TABS: 'app-tabs/favorites',
        ADD_FAVORITE: 'app-tabs/favorites',
        DELETE_FAVORITE: 'app-tabs/favorites',
    },

    CONNECTIONS: {
        GET_CONNECTION_TYPES: 'connection-types',
        GET_CONNECTIONS: 'connections',
        GET_HANDLAH_USERS: 'handlah-users',
        GET_CONNECTED_USERS: 'connections/users',
        REQUEST: 'connections/request',
        UPDATE_CONNECTION: 'connections',
        GET_REQUESTS_SENT: 'connections/requests?type=sent&targetAccountType=',
        GET_REQUESTS_RECEIVED: 'connections/requests?type=received&targetAccountType=',
        GET_EMERGENCY_CONNECTIONS: 'connections/emergency?targetAccountType=',
        REQUEST_ACTION: 'connections/requests/',
        EMERGENCY_ACCESS_REQUEST: 'connections/emergency/',
        SOCIAL_NETWORK_CONNECTIONS: 'usersocialnetworksetup/connections',
        CHECK_CONNECTION: (userId: number, targetAccountType: string) => `connections/check?userId=${userId}&targetAccountType=${targetAccountType}`,
        CHECK_REQUEST: (userId: number, targetAccountType: string) => `connections/check-request?targetUserId=${userId}&targetAccountType=${targetAccountType}`,
    },
    SHARING: {
        GET_SHARING_SUMMARY: 'sharing-summary',
        EMERGENCY_ACCESS: 'emergency-access',
        SEND_EMERGENCY_CONNECTION_REQUEST: 'connections/emergency/request',
        SHARING_SERVICE: 'sharing',
        SHARING_SYNC: '/sharing/sync',
        SHARED_BY_USERS: (arg: any) => {
            if (arg.businessId) {
                return `/sharing/modules/${arg.module}/users?businessId=${arg.businessId || ''}`
            } else {
                return `/sharing/modules/${arg.module}/users`;
            }
        },
    },
    NOTIFICATIONS: {
        FCM_TOKENS: 'fcm-tokens',
        GET_NOTIFICATIONS: 'notifications',
        MARK_SINGLE_SEEN: 'notifications', // PATCH notifications/{id}/seen
        MARK_ALL_SEEN: 'notifications/seen-all', // PATCH notifications/seen-all
        MARK_SEEN: 'notifications/mark-seen',
        DELETE_ALL: 'notifications', // DELETE notifications
    },

    PRIVACY: {
        SUBMIT_APPEAL: 'privacy/appeal',
        DATA_ACCESS_REQUEST: 'privacy/data-access-request',
        DATA_DELETION_REQUEST: 'privacy/data-deletion-request',
    },
    DROPDOWN_OPTIONS: 'dropdown-options',
    DROPDOWN_OPTION_BY_ID: 'dropdown-options/id',
    HOME: {
        MODULE_COUNTS: 'home/module-counts',
    },
    CONTENT: {
        GET_PRIVACY_POLICY: 'content/privacy-policy',
        GET_TERMS: 'content/terms',
    },
    FAQS: {
        GET_FAQS: 'faqs',
    },
    SUPPORT: {
        GET_CATEGORIES: 'support/categories',
        GET_TICKETS: 'support/tickets',
        GET_TICKET: (id: number) => `support/tickets/${id}`,
        CREATE_TICKET: 'support/tickets',
        REOPEN_TICKET: (id: number) => `support/tickets/${id}/reopen`,
        REPLY_TICKET: (id: number) => `support/tickets/${id}/reply`,
        EDIT_REPLY: (ticketId: number, replyId: number) => `support/tickets/${ticketId}/replies/${replyId}`,
        DELETE_REPLY: (ticketId: number, replyId: number) => `support/tickets/${ticketId}/replies/${replyId}`,
    },
    THEME: 'theme',
} as const;

export const TYPE_CONSTANTS = {
    SIGNUP_ASYNC: 'SIGNUP_ASYNC',
    LOGIN_ASYNC: 'LOGIN_ASYNC',
    MFA_SETTINGS_ASYNC: 'MFA_SETTINGS_ASYNC',
    MFA_SEND_OTP_ASYNC: 'MFA_SEND_OTP_ASYNC',
    MFA_VERIFY_ASYNC: 'MFA_VERIFY_ASYNC',
    REGISTER_BIOMETRIC_DEVICE_ASYNC: 'REGISTER_BIOMETRIC_DEVICE_ASYNC',
    CHECK_AUTH_ASYNC: 'CHECK_AUTH_ASYNC',
    UPDATE_ME_ASYNC: 'UPDATE_ME_ASYNC',
    VERIFY_FORGOT_ASYNC: 'VERIFY_FORGOT_ASYNC',
    CHANGE_PASSWORD_ASYNC: 'CHANGE_PASSWORD_ASYNC',
    FORGOT_PASSWORD_ASYNC: 'FORGOT_PASSWORD_ASYNC',
    FORGOT_RESET_PASSWORD_ASYNC: 'FORGOT_RESET_PASSWORD_ASYNC',
    COUNTRIES_ASYNC: 'COUNTRIES_ASYNC',
    STATE_ASYNC: 'STATE_ASYNC',
    VERIFY_PHONE_ASYNC: 'VERIFY_PHONE_ASYNC',
    DELETE_USER_ACCOUNT_ASYNC: 'DELETE_USER_ACCOUNT_ASYNC',
    CANCEL_USER_ACCOUNT_DELETION_ASYNC: 'CANCEL_USER_ACCOUNT_DELETION_ASYNC',
    RESEND_EMAIL_OTP_ASYNC: 'RESEND_EMAIL_OTP_ASYNC',
    IDENTITY_HUB_ASYNC: 'IDENTITY_HUB_ASYNC',
    SUBSCRIBE_PLAN_ASYNC: 'SUBCRIBE_PLAN_ASYNC',
    VERIFY_EMAIL_ASYNC: 'VERIFY_EMAIL_ASYNC',
    CHANGE_PHONE_OTP_ASYNC: 'CHANGE_PHONE_OTP_ASYNC',
    CHANGE_EMAIL_OTP_ASYNC: 'CHANGE_EMAIL_OTP_ASYNC',
    CHANGE_EMAIL_SEND_OTP_ASYNC: 'CHANGE_EMAIL_SEND_OTP_ASYNC',
    CHANGE_EMAIL_VERIFY_OTP_ASYNC: 'CHANGE_EMAIL_VERIFY_OTP_ASYNC',
    CHANGE_PHONE_SEND_OTP_ASYNC: 'CHANGE_PHONE_SEND_OTP_ASYNC',
    CHANGE_PHONE_VERIFY_OTP_ASYNC: 'CHANGE_PHONE_VERIFY_OTP_ASYNC',
    DRIVER_LICENSE_ASYNC: 'DRIVER_LICENSE_ASYNC',
    IMAGE_UPLOAD_ASYNC: 'IMAGE_UPLOAD_ASYNC',
    GET_IMAGE_ASYNC: 'GET_IMAGE_ASYNC',
    GET_BULK_SIGNED_URLS_ASYNC: 'GET_BULK_SIGNED_URLS_ASYNC',
    GET_MODULE_GUIDES_ASYNC: 'GET_MODULE_GUIDES_ASYNC',
    PASSPORT_ASYNC: 'PASSPORT_ASYNC',
    LICENSES_ASYNC: 'LICENSES_ASYNC',
    UPDATE_DRIVER_LICENSE_ASYNC: 'UPDATE_DRIVER_LICENSE_ASYNC',
    UPDATE_PASSPORT_ASYNC: 'UPDATE_PASSPORT_ASYNC',
    UPDATE_LICENSE_ASYNC: 'UPDATE_LICENSE_ASYNC',
    DELETE_PASSPORT_ASYNC: 'DELETE_PASSPORT_ASYNC',
    DELETE_DRIVER_LICENSE_ASYNC: 'DELETE_DRIVER_LICENSE_ASYNC',
    DELETE_LICENSE_ASYNC: 'DELETE_LICENSE_ASYNC',
    SOCIAL_NETWORK_TYPES_ASYNC: 'SOCIAL_NETWORK_TYPES_ASYNC',
    SOCIAL_NETWORK_SETUP_ASYNC: 'SOCIAL_NETWORK_SETUP_ASYNC',
    UPDATE_SOCIAL_NETWORK_SETUP_ASYNC: 'UPDATE_SOCIAL_NETWORK_SETUP_ASYNC',
    DELETE_SOCIAL_NETWORK_SETUP_ASYNC: 'DELETE_SOCIAL_NETWORK_SETUP_ASYNC',
    USER_SOCIAL_NETWORKS_ASYNC: 'USER_SOCIAL_NETWORKS_ASYNC',
    BOOKMARKS_ASYNC: 'BOOKMARKS_ASYNC',
    CREATE_BOOKMARK_ASYNC: 'CREATE_BOOKMARK_ASYNC',
    UPDATE_BOOKMARK_ASYNC: 'UPDATE_BOOKMARK_ASYNC',
    DELETE_BOOKMARK_ASYNC: 'DELETE_BOOKMARK_ASYNC',
    SUBSCRIPTIONS_ASYNC: 'SUBSCRIPTIONS_ASYNC',
    CREATE_SUBSCRIPTION_ASYNC: 'CREATE_SUBSCRIPTION_ASYNC',
    UPDATE_SUBSCRIPTION_ASYNC: 'UPDATE_SUBSCRIPTION_ASYNC',
    DELETE_SUBSCRIPTION_ASYNC: 'DELETE_SUBSCRIPTION_ASYNC',
    LEGAL_DOCUMENTS_ASYNC: 'LEGAL_DOCUMENTS_ASYNC',
    CREATE_LEGAL_DOCUMENT_ASYNC: 'CREATE_LEGAL_DOCUMENT_ASYNC',
    UPDATE_LEGAL_DOCUMENT_ASYNC: 'UPDATE_LEGAL_DOCUMENT_ASYNC',
    DELETE_LEGAL_DOCUMENT_ASYNC: 'DELETE_LEGAL_DOCUMENT_ASYNC',
    GET_LOAN_ASYNC: 'GET_LOAN_ASYNC',
    ADD_LOAN_ASYNC: 'ADD_LOAN_ASYNC',
    UPDATE_LOAN_ASYNC: 'UPDATE_LOAN_ASYNC',
    DELETE_LOAN_ASYNC: 'DELETE_LOAN_ASYNC',
    LINK_LOAN_ASYNC: 'LINK_LOAN_ASYNC',
    WALLET_ASYNC: 'WALLET_ASYNC',
    WALLET_TOGGLE_ASYNC: 'WALLET_TOGGLE_ASYNC',
    // Pets
    GET_PETS_ASYNC: 'GET_PETS_ASYNC',
    ADD_PET_ASYNC: 'ADD_PET_ASYNC',
    EDIT_PET_ASYNC: 'EDIT_PET_ASYNC',
    DELETE_PET_ASYNC: 'DELETE_PET_ASYNC',
    ADD_PET_VACCINATION_ASYNC: 'ADD_PET_VACCINATION_ASYNC',
    DELETE_PET_VACCINATION_ASYNC: 'DELETE_PET_VACCINATION_ASYNC',
    ADD_PET_MEDICATION_ASYNC: 'ADD_PET_MEDICATION_ASYNC',
    EDIT_PET_MEDICATION_ASYNC: 'EDIT_PET_MEDICATION_ASYNC',
    DELETE_PET_MEDICATION_ASYNC: 'DELETE_PET_MEDICATION_ASYNC',
    ADD_PET_VET_APPOINTMENT_ASYNC: 'ADD_PET_VET_APPOINTMENT_ASYNC',
    EDIT_PET_VET_APPOINTMENT_ASYNC: 'EDIT_PET_VET_APPOINTMENT_ASYNC',
    DELETE_PET_VET_APPOINTMENT_ASYNC: 'DELETE_PET_VET_APPOINTMENT_ASYNC',
    ADD_PET_ILLNESS_ASYNC: 'ADD_PET_ILLNESS_ASYNC',
    EDIT_PET_ILLNESS_ASYNC: 'EDIT_PET_ILLNESS_ASYNC',
    DELETE_PET_ILLNESS_ASYNC: 'DELETE_PET_ILLNESS_ASYNC',
    EDIT_PET_VACCINATION_ASYNC: 'EDIT_PET_VACCINATION_ASYNC',
    // Utilities
    GET_UTILITIES_ASYNC: 'GET_UTILITIES_ASYNC',
    ADD_UTILITY_ASYNC: 'ADD_UTILITY_ASYNC',
    UPDATE_UTILITY_ASYNC: 'UPDATE_UTILITY_ASYNC',
    DELETE_UTILITY_ASYNC: 'DELETE_UTILITY_ASYNC',
    LINK_UTILITY_ASYNC: 'LINK_UTILITY_ASYNC',
    // Insurance
    GET_INSURANCES_ASYNC: 'GET_INSURANCES_ASYNC',
    ADD_INSURANCE_ASYNC: 'ADD_INSURANCE_ASYNC',
    ADD_INSURANCES_BULK_ASYNC: 'ADD_INSURANCES_BULK_ASYNC',
    UPDATE_INSURANCE_ASYNC: 'UPDATE_INSURANCE_ASYNC',
    DELETE_INSURANCE_ASYNC: 'DELETE_INSURANCE_ASYNC',
    LINK_INSURANCE_ASYNC: 'LINK_INSURANCE_ASYNC',
    // Warranties
    GET_WARRANTIES_ASYNC: 'GET_WARRANTIES_ASYNC',
    ADD_WARRANTY_ASYNC: 'ADD_WARRANTY_ASYNC',
    ADD_WARRANTIES_BULK_ASYNC: 'ADD_WARRANTIES_BULK_ASYNC',
    UPDATE_WARRANTY_ASYNC: 'UPDATE_WARRANTY_ASYNC',
    DELETE_WARRANTY_ASYNC: 'DELETE_WARRANTY_ASYNC',
    LINK_WARRANTY_ASYNC: 'LINK_WARRANTY_ASYNC',
    // Health Tracker - Children
    GET_CHILDREN_ASYNC: 'GET_CHILDREN_ASYNC',
    GET_CHILDREN_AS_CAREGIVER_ASYNC: 'GET_CHILDREN_AS_CAREGIVER_ASYNC',
    GET_CHILD_BY_ID_ASYNC: 'GET_CHILD_BY_ID_ASYNC',
    ADD_CHILD_ASYNC: 'ADD_CHILD_ASYNC',
    UPDATE_CHILD_ASYNC: 'UPDATE_CHILD_ASYNC',
    DELETE_CHILD_ASYNC: 'DELETE_CHILD_ASYNC',
    // Health Tracker - Child Medications
    ADD_CHILD_MEDICATION_ASYNC: 'ADD_CHILD_MEDICATION_ASYNC',
    UPDATE_CHILD_MEDICATION_ASYNC: 'UPDATE_CHILD_MEDICATION_ASYNC',
    DELETE_CHILD_MEDICATION_ASYNC: 'DELETE_CHILD_MEDICATION_ASYNC',
    // Health Tracker - Child Doctors
    ADD_CHILD_DOCTOR_ASYNC: 'ADD_CHILD_DOCTOR_ASYNC',
    GET_CHILD_DOCTORS_ASYNC: 'GET_CHILD_DOCTORS_ASYNC',
    GET_CHILD_DOCTOR_BY_ID_ASYNC: 'GET_CHILD_DOCTOR_BY_ID_ASYNC',
    UPDATE_CHILD_DOCTOR_ASYNC: 'UPDATE_CHILD_DOCTOR_ASYNC',
    DELETE_CHILD_DOCTOR_ASYNC: 'DELETE_CHILD_DOCTOR_ASYNC',
    // Health Tracker - Child Caregivers
    ADD_CHILD_CAREGIVER_ASYNC: 'ADD_CHILD_CAREGIVER_ASYNC',
    UPDATE_CHILD_CAREGIVER_ASYNC: 'UPDATE_CHILD_CAREGIVER_ASYNC',
    DELETE_CHILD_CAREGIVER_ASYNC: 'DELETE_CHILD_CAREGIVER_ASYNC',
    // Health Tracker - Child Appointments
    ADD_CHILD_APPOINTMENT_ASYNC: 'ADD_CHILD_APPOINTMENT_ASYNC',
    UPDATE_CHILD_APPOINTMENT_ASYNC: 'UPDATE_CHILD_APPOINTMENT_ASYNC',
    DELETE_CHILD_APPOINTMENT_ASYNC: 'DELETE_CHILD_APPOINTMENT_ASYNC',
    // Health Tracker - Child Illnesses
    ADD_CHILD_ILLNESS_ASYNC: 'ADD_CHILD_ILLNESS_ASYNC',
    UPDATE_CHILD_ILLNESS_ASYNC: 'UPDATE_CHILD_ILLNESS_ASYNC',
    DELETE_CHILD_ILLNESS_ASYNC: 'DELETE_CHILD_ILLNESS_ASYNC',
    // Health Tracker - Child Surgeries
    ADD_CHILD_SURGERY_ASYNC: 'ADD_CHILD_SURGERY_ASYNC',
    UPDATE_CHILD_SURGERY_ASYNC: 'UPDATE_CHILD_SURGERY_ASYNC',
    DELETE_CHILD_SURGERY_ASYNC: 'DELETE_CHILD_SURGERY_ASYNC',
    // App Tabs
    GET_APP_TABS_ASYNC: 'GET_APP_TABS_ASYNC',
    GET_FAVORITE_TABS_ASYNC: 'GET_FAVORITE_TABS_ASYNC',
    ADD_FAVORITE_TAB_ASYNC: 'ADD_FAVORITE_TAB_ASYNC',
    DELETE_FAVORITE_TAB_ASYNC: 'DELETE_FAVORITE_TAB_ASYNC',
    ADD_BANK_ACCOUNT_ASYNC: 'ADD_BANK_ACCOUNT_ASYNC',
    GET_BANK_ACCOUNT_ASYNC: 'GET_BANK_ACCOUNT_ASYNC',
    UPDATE_BANK_ACCOUNT_ASYNC: 'UPDATE_BANK_ACCOUNT_ASYNC',
    DELETE_BANK_ACCOUNT_ASYNC: 'DELETE_BANK_ACCOUNT_ASYNC',

    // PERSONAL PROPERTY
    ADD_PERSONAL_PROPERTY_ASYNC: 'ADD_PERSONAL_PROPERTY_ASYNC',
    GET_PERSONAL_PROPERTY_ASYNC: 'GET_PERSONAL_PROPERTY_ASYNC',
    GET_BUSINESS_PROPERTY_ASYNC: 'GET_BUSINESS_PROPERTY_ASYNC',
    GET_BUSINESS_REAL_STATE_OVERVIEW_ASYNC:
        'GET_BUSINESS_REAL_STATE_OVERVIEW_ASYNC',
    GET_PERSONAL_PROPERTY_BY_ID_ASYNC: 'GET_PERSONAL_PROPERTY_BY_ID_ASYNC',
    UPDATE_PERSONAL_PROPERTY_ASYNC: 'UPDATE_PERSONAL_PROPERTY_ASYNC',
    DELETE_PERSONAL_PROPERTY_ASYNC: 'DELETE_PERSONAL_PROPERTY_ASYNC',
    MOVE_PERSONAL_PROPERTY_ASYNC: 'MOVE_PERSONAL_PROPERTY_ASYNC',

    // REAL STATE OVERVIEW
    ADD_REAL_STATE_OVERVIEW_ASYNC: 'ADD_REAL_STATE_OVERVIEW_ASYNC',
    GET_REAL_STATE_OVERVIEW_ASYNC: 'GET_REAL_STATE_OVERVIEW_ASYNC',
    GET_REAL_STATE_OVERVIEW_BY_ID_ASYNC: 'GET_REAL_STATE_OVERVIEW_BY_ID_ASYNC',
    UPDATE_REAL_STATE_OVERVIEW_ASYNC: 'UPDATE_REAL_STATE_OVERVIEW_ASYNC',
    DELETE_REAL_STATE_OVERVIEW_ASYNC: 'DELETE_REAL_STATE_OVERVIEW_ASYNC',
    // REAL STATE LOAN MORTGAGE
    ADD_REAL_STATE_LOAN_MORTGAGE_ASYNC: 'ADD_REAL_STATE_LOAN_MORTGAGE_ASYNC',
    GET_REAL_STATE_LOAN_MORTGAGE_ASYNC: 'GET_REAL_STATE_LOAN_MORTGAGE_ASYNC',
    GET_REAL_STATE_LOAN_MORTGAGE_BY_ID_ASYNC:
        'GET_REAL_STATE_LOAN_MORTGAGE_BY_ID_ASYNC',
    UPDATE_REAL_STATE_LOAN_MORTGAGE_ASYNC:
        'UPDATE_REAL_STATE_LOAN_MORTGAGE_ASYNC',
    DELETE_REAL_STATE_LOAN_MORTGAGE_ASYNC:
        'DELETE_REAL_STATE_LOAN_MORTGAGE_ASYNC',
    // REAL STATE UTILITIES
    ADD_REAL_STATE_UTILITIES_ASYNC: 'ADD_REAL_STATE_UTILITIES_ASYNC',
    GET_REAL_STATE_UTILITIES_ASYNC: 'GET_REAL_STATE_UTILITIES_ASYNC',
    GET_REAL_STATE_UTILITIES_BY_ID_ASYNC: 'GET_REAL_STATE_UTILITIES_BY_ID_ASYNC',
    UPDATE_REAL_STATE_UTILITIES_ASYNC: 'UPDATE_REAL_STATE_UTILITIES_ASYNC',
    DELETE_REAL_STATE_UTILITIES_ASYNC: 'DELETE_REAL_STATE_UTILITIES_ASYNC',
    // REAL STATE INSURANCE
    ADD_REAL_STATE_INSURANCE_ASYNC: 'ADD_REAL_STATE_INSURANCE_ASYNC',
    GET_REAL_STATE_INSURANCE_ASYNC: 'GET_REAL_STATE_INSURANCE_ASYNC',
    GET_REAL_STATE_INSURANCE_BY_ID_ASYNC: 'GET_REAL_STATE_INSURANCE_BY_ID_ASYNC',
    UPDATE_REAL_STATE_INSURANCE_ASYNC: 'UPDATE_REAL_STATE_INSURANCE_ASYNC',
    DELETE_REAL_STATE_INSURANCE_ASYNC: 'DELETE_REAL_STATE_INSURANCE_ASYNC',
    // REAL STATE WARRANTIES
    ADD_REAL_STATE_WARRANTIES_ASYNC: 'ADD_REAL_STATE_WARRANTIES_ASYNC',
    GET_REAL_STATE_WARRANTIES_ASYNC: 'GET_REAL_STATE_WARRANTIES_ASYNC',
    GET_REAL_STATE_WARRANTIES_BY_ID_ASYNC:
        'GET_REAL_STATE_WARRANTIES_BY_ID_ASYNC',
    UPDATE_REAL_STATE_WARRANTIES_ASYNC: 'UPDATE_REAL_STATE_WARRANTIES_ASYNC',
    DELETE_REAL_STATE_WARRANTIES_ASYNC: 'DELETE_REAL_STATE_WARRANTIES_ASYNC',
    // REAL STATE PERSONAL PROPERTY
    ADD_REAL_STATE_PERSONAL_PROPERTY_ASYNC:
        'ADD_REAL_STATE_PERSONAL_PROPERTY_ASYNC',
    GET_REAL_STATE_PERSONAL_PROPERTY_ASYNC:
        'GET_REAL_STATE_PERSONAL_PROPERTY_ASYNC',
    GET_REAL_STATE_PERSONAL_PROPERTY_BY_ID_ASYNC:
        'GET_REAL_STATE_PERSONAL_PROPERTY_BY_ID_ASYNC',
    UPDATE_REAL_STATE_PERSONAL_PROPERTY_ASYNC:
        'UPDATE_REAL_STATE_PERSONAL_PROPERTY_ASYNC',
    DELETE_REAL_STATE_PERSONAL_PROPERTY_ASYNC:
        'DELETE_REAL_STATE_PERSONAL_PROPERTY_ASYNC',
    // REAL STATE SERVICE WORK HISTORIES
    ADD_REAL_STATE_SERVICE_WORK_HISTORY_ASYNC:
        'ADD_REAL_STATE_SERVICE_WORK_HISTORY_ASYNC',
    GET_REAL_STATE_SERVICE_WORK_HISTORY_ASYNC:
        'GET_REAL_STATE_SERVICE_WORK_HISTORY_ASYNC',
    GET_REAL_STATE_SERVICE_WORK_HISTORY_BY_ID_ASYNC:
        'GET_REAL_STATE_SERVICE_WORK_HISTORY_BY_ID_ASYNC',
    UPDATE_REAL_STATE_SERVICE_WORK_HISTORY_ASYNC:
        'UPDATE_REAL_STATE_SERVICE_WORK_HISTORY_ASYNC',
    DELETE_REAL_STATE_SERVICE_WORK_HISTORY_ASYNC:
        'DELETE_REAL_STATE_SERVICE_WORK_HISTORY_ASYNC',

    // VEHICLES
    ADD_VEHICLE_ASYNC: 'ADD_VEHICLE_ASYNC',
    GET_VEHICLES_ASYNC: 'GET_VEHICLES_ASYNC',
    GET_BUSINESS_VEHICLES_ASYNC: 'GET_BUSINESS_VEHICLES_ASYNC',
    GET_VEHICLE_BY_ID_ASYNC: 'GET_VEHICLE_BY_ID_ASYNC',
    UPDATE_VEHICLE_ASYNC: 'UPDATE_VEHICLE_ASYNC',
    DELETE_VEHICLE_ASYNC: 'DELETE_VEHICLE_ASYNC',
    MARK_VEHICLE_AS_SOLD_ASYNC: 'MARK_VEHICLE_AS_SOLD_ASYNC',
    VEHICLE_SALE_TRANSFER_ASYNC: 'VEHICLE_SALE_TRANSFER_ASYNC',
    SHARE_VEHICLE_ASYNC: 'SHARE_VEHICLE_ASYNC',
    GET_BUSINESSES_BY_USERNAME_ASYNC: 'GET_BUSINESSES_BY_USERNAME_ASYNC',
    GET_INCOMING_VEHICLE_TRANSFERS_ASYNC: 'GET_INCOMING_VEHICLE_TRANSFERS_ASYNC',
    ACCEPT_VEHICLE_TRANSFER_ASYNC: 'ACCEPT_VEHICLE_TRANSFER_ASYNC',
    REJECT_VEHICLE_TRANSFER_ASYNC: 'REJECT_VEHICLE_TRANSFER_ASYNC',
    UPDATE_VEHICLE_SALE_TRANSFER_ASYNC: 'UPDATE_VEHICLE_SALE_TRANSFER_ASYNC',

    // VEHICLE SERVICE RECORDS
    ADD_VEHICLE_SERVICE_RECORDS_BULK_ASYNC:
        'ADD_VEHICLE_SERVICE_RECORDS_BULK_ASYNC',
    GET_VEHICLE_SERVICE_RECORDS_ASYNC: 'GET_VEHICLE_SERVICE_RECORDS_ASYNC',
    UPDATE_VEHICLE_SERVICE_RECORD_ASYNC: 'UPDATE_VEHICLE_SERVICE_RECORD_ASYNC',
    DELETE_VEHICLE_SERVICE_RECORD_ASYNC: 'DELETE_VEHICLE_SERVICE_RECORD_ASYNC',

    // VEHICLE ACCIDENTS
    ADD_VEHICLE_ACCIDENTS_ASYNC: 'ADD_VEHICLE_ACCIDENTS_ASYNC',
    GET_VEHICLE_ACCIDENTS_ASYNC: 'GET_VEHICLE_ACCIDENTS_ASYNC',
    UPDATE_VEHICLE_ACCIDENT_ASYNC: 'UPDATE_VEHICLE_ACCIDENT_ASYNC',
    DELETE_VEHICLE_ACCIDENT_ASYNC: 'DELETE_VEHICLE_ACCIDENT_ASYNC',

    // BUSINESS
    GET_BUSINESSES_ASYNC: 'GET_BUSINESSES_ASYNC',
    CREATE_BUSINESS_ASYNC: 'CREATE_BUSINESS_ASYNC',
    UPDATE_BUSINESS_ASYNC: 'UPDATE_BUSINESS_ASYNC',
    DELETE_BUSINESS_ASYNC: 'DELETE_BUSINESS_ASYNC',
    GET_BUSINESS_BY_ID_ASYNC: 'GET_BUSINESS_BY_ID_ASYNC',

    // BUSINESS CONTACTS
    GET_BUSINESS_CONTACTS_ASYNC: 'GET_BUSINESS_CONTACTS_ASYNC',
    ADD_BUSINESS_CONTACT_ASYNC: 'ADD_BUSINESS_CONTACT_ASYNC',
    UPDATE_BUSINESS_CONTACT_ASYNC: 'UPDATE_BUSINESS_CONTACT_ASYNC',
    DELETE_BUSINESS_CONTACT_ASYNC: 'DELETE_BUSINESS_CONTACT_ASYNC',

    // BUSINESS LICENSES
    GET_BUSINESS_LICENSES_ASYNC: 'GET_BUSINESS_LICENSES_ASYNC',
    GET_BUSINESS_LICENSE_ASYNC: 'GET_BUSINESS_LICENSE_ASYNC',
    ADD_BUSINESS_LICENSE_ASYNC: 'ADD_BUSINESS_LICENSE_ASYNC',
    UPDATE_BUSINESS_LICENSE_ASYNC: 'UPDATE_BUSINESS_LICENSE_ASYNC',
    DELETE_BUSINESS_LICENSE_ASYNC: 'DELETE_BUSINESS_LICENSE_ASYNC',

    // COMPLIANCE FOLDERS
    GET_COMPLIANCE_FOLDERS_ASYNC: 'GET_COMPLIANCE_FOLDERS_ASYNC',
    GET_COMPLIANCE_FOLDER_ASYNC: 'GET_COMPLIANCE_FOLDER_ASYNC',
    ADD_COMPLIANCE_FOLDER_ASYNC: 'ADD_COMPLIANCE_FOLDER_ASYNC',
    UPDATE_COMPLIANCE_FOLDER_ASYNC: 'UPDATE_COMPLIANCE_FOLDER_ASYNC',
    DELETE_COMPLIANCE_FOLDER_ASYNC: 'DELETE_COMPLIANCE_FOLDER_ASYNC',

    // COMPLIANCE RECORDS
    GET_COMPLIANCE_RECORDS_ASYNC: 'GET_COMPLIANCE_RECORDS_ASYNC',
    GET_COMPLIANCE_RECORD_ASYNC: 'GET_COMPLIANCE_RECORD_ASYNC',
    ADD_COMPLIANCE_RECORD_ASYNC: 'ADD_COMPLIANCE_RECORD_ASYNC',
    UPDATE_COMPLIANCE_RECORD_ASYNC: 'UPDATE_COMPLIANCE_RECORD_ASYNC',
    DELETE_COMPLIANCE_RECORD_ASYNC: 'DELETE_COMPLIANCE_RECORD_ASYNC',

    // BUSINESS PROJECTS
    GET_BUSINESS_PROJECTS_ASYNC: 'GET_BUSINESS_PROJECTS_ASYNC',
    ADD_BUSINESS_PROJECT_ASYNC: 'ADD_BUSINESS_PROJECT_ASYNC',
    UPDATE_BUSINESS_PROJECT_ASYNC: 'UPDATE_BUSINESS_PROJECT_ASYNC',
    DELETE_BUSINESS_PROJECT_ASYNC: 'DELETE_BUSINESS_PROJECT_ASYNC',

    // EDIT HISTORY
    GET_EDIT_HISTORY_ASYNC: 'GET_EDIT_HISTORY_ASYNC',

    // SEARCH
    GLOBAL_SEARCH_ASYNC: 'GLOBAL_SEARCH_ASYNC',
    // NOTIFICATIONS
    GET_NOTIFICATIONS_ASYNC: 'GET_NOTIFICATIONS_ASYNC',
    MARK_SINGLE_NOTIFICATION_SEEN_ASYNC: 'MARK_SINGLE_NOTIFICATION_SEEN_ASYNC',
    MARK_ALL_NOTIFICATIONS_SEEN_ASYNC: 'MARK_ALL_NOTIFICATIONS_SEEN_ASYNC',
    MARK_NOTIFICATIONS_SEEN_ASYNC: 'MARK_NOTIFICATIONS_SEEN_ASYNC',
    DELETE_ALL_NOTIFICATIONS_ASYNC: 'DELETE_ALL_NOTIFICATIONS_ASYNC',
    GET_NOTIFICATION_PREFERENCES_ASYNC: 'GET_NOTIFICATION_PREFERENCES_ASYNC',
    UPDATE_NOTIFICATION_PREFERENCES_ASYNC: 'UPDATE_NOTIFICATION_PREFERENCES_ASYNC',
    // REMINDERS
    GET_REMINDERS_ASYNC: 'GET_REMINDERS_ASYNC',
    GET_REMINDER_BY_ID_ASYNC: 'GET_REMINDER_BY_ID_ASYNC',
    GET_TODAY_REMINDERS_ASYNC: 'GET_TODAY_REMINDERS_ASYNC',
    GET_UPCOMING_REMINDERS_ASYNC: 'GET_UPCOMING_REMINDERS_ASYNC',
    ADD_AD_HOC_REMINDER_ASYNC: 'ADD_AD_HOC_REMINDER_ASYNC',
    MARK_COMPLETED_REMINDER_ASYNC: 'MARK_COMPLETED_REMINDER_ASYNC',
    UPDATE_REMINDER_ASYNC: 'UPDATE_REMINDER_ASYNC',
    DELETE_REMINDER_ASYNC: 'DELETE_REMINDER_ASYNC',
    SET_REMINDER_ACTIVE_ASYNC: 'SET_REMINDER_ACTIVE_ASYNC',
    UPDATE_BATCH_REMINDER_ASYNC: 'UPDATE_BATCH_REMINDER_ASYNC',
    DELETE_BATCH_REMINDER_ASYNC: 'DELETE_BATCH_REMINDER_ASYNC',
    SET_BATCH_REMINDER_ACTIVE_ASYNC: 'SET_BATCH_REMINDER_ACTIVE_ASYNC',
    DISMISS_REMINDER_ASYNC: 'DISMISS_REMINDER_ASYNC',
    DISMISS_BATCH_REMINDER_ASYNC: 'DISMISS_BATCH_REMINDER_ASYNC',
    // UPDATE USER TIMEZONE
    UPDATE_USER_TIMEZONE_ASYNC: 'UPDATE_USER_TIMEZONE_ASYNC',

    // CONNECTIONS
    GET_CONNECTION_TYPES_ASYNC: 'GET_CONNECTION_TYPES_ASYNC',
    GET_CONNECTIONS_ASYNC: 'GET_CONNECTIONS_ASYNC',
    GET_CONNECTED_USERS_ASYNC: 'GET_CONNECTED_USERS_ASYNC',
    GET_UNSHARED_CONNECTED_USERS_ASYNC: 'GET_UNSHARED_CONNECTED_USERS_ASYNC',
    GET_SHARED_CONNECTED_USERS_ASYNC: 'GET_SHARED_CONNECTED_USERS_ASYNC',
    GET_CONNECTION_BY_ID_ASYNC: 'GET_CONNECTION_BY_ID_ASYNC',
    CHECK_BOTH_SIDES_CONNECTION_ASYNC: 'CHECK_BOTH_SIDES_CONNECTION_ASYNC',
    REMOVE_CONNECTION_ASYNC: 'REMOVE_CONNECTION_ASYNC',
    GET_HANDLAH_USERS_ASYNC: 'GET_HANDLAH_USERS_ASYNC',
    CREATE_CONNECTION_REQUEST_ASYNC: 'CREATE_CONNECTION_REQUEST_ASYNC',
    UPDATE_CONNECTION_ASYNC: 'UPDATE_CONNECTION_ASYNC',
    GET_CONNECTION_REQUESTS_SENT_ASYNC: 'GET_CONNECTION_REQUESTS_SENT_ASYNC',
    GET_CONNECTION_REQUESTS_RECEIVED_ASYNC:
        'GET_CONNECTION_REQUESTS_RECEIVED_ASYNC',
    GET_EMERGENCY_CONNECTIONS_ASYNC: 'GET_EMERGENCY_CONNECTIONS_ASYNC',
    ACCEPT_CONNECTION_REQUEST_ASYNC: 'ACCEPT_CONNECTION_REQUEST_ASYNC',
    DECLINE_CONNECTION_REQUEST_ASYNC: 'DECLINE_CONNECTION_REQUEST_ASYNC',
    APPROVE_EMERGENCY_REQUEST_ASYNC: 'APPROVE_EMERGENCY_REQUEST_ASYNC',
    REJECT_EMERGENCY_REQUEST_ASYNC: 'REJECT_EMERGENCY_REQUEST_ASYNC',
    GET_SOCIAL_NETWORK_CONNECTIONS_ASYNC: 'GET_SOCIAL_NETWORK_CONNECTIONS_ASYNC',
    CHECK_CONNECTION_REQUEST_ASYNC: 'CHECK_CONNECTION_REQUEST_ASYNC',

    // SHARING
    GET_CONNECTIONS_SHARING_SUMMARY: 'GET_CONNECTIONS_SHARING_SUMMARY',
    GET_CONNECTIONS_EMERGENCY_SUMMARY: 'GET_CONNECTIONS_EMERGENCY_SUMMARY',
    REQUEST_EMERGENCY_ACCESS: 'REQUEST_EMERGENCY_ACCESS',
    SHARING_SYNC_ASYNC: 'SHARING_SYNC_ASYNC',
    SHARED_BY_USERS_ASYNC: 'SHARED_BY_USERS_ASYNC',

    // NOTIFICATIONS
    REGISTER_FCM_TOKEN_ASYNC: 'REGISTER_FCM_TOKEN_ASYNC',
    // PRIVACY
    SUBMIT_PRIVACY_APPEAL_ASYNC: 'SUBMIT_PRIVACY_APPEAL_ASYNC',
    SUBMIT_DATA_ACCESS_REQUEST_ASYNC: 'SUBMIT_DATA_ACCESS_REQUEST_ASYNC',
    SUBMIT_DATA_DELETION_REQUEST_ASYNC: 'SUBMIT_DATA_DELETION_REQUEST_ASYNC',

    // Dropdown Options
    GET_DROPDOWN_OPTIONS_ASYNC: 'GET_DROPDOWN_OPTIONS_ASYNC',
    GET_DRIVER_LICENSE_CLASS_OPTIONS_ASYNC:
        'GET_DRIVER_LICENSE_CLASS_OPTIONS_ASYNC',
    GET_MEDICATION_TYPES_ASYNC: 'GET_MEDICATION_TYPES_ASYNC',
    GET_VEHICLE_ACCIDENTS_TYPES_ASYNC: 'GET_VEHICLE_ACCIDENTS_TYPES_ASYNC',
    GET_VEHICLE_REGISTRATION_TYPES_ASYNC: 'GET_VEHICLE_REGISTRATION_TYPES_ASYNC',
    GET_BUSINESS_CONTACT_TYPES_ASYNC: 'GET_BUSINESS_CONTACT_TYPES_ASYNC',
    GET_COMPLIANCE_TYPE_OPTIONS_ASYNC: 'GET_COMPLIANCE_TYPE_OPTIONS_ASYNC',
    GET_SUBSCRIPTION_TYPE_OPTIONS_ASYNC: 'GET_SUBSCRIPTION_TYPE_OPTIONS_ASYNC',

    // GOOGLE SIGN-IN
    GOOGLE_SIGNIN_ASYNC: 'GOOGLE_SIGNIN_ASYNC',
    APPLE_SIGNIN_ASYNC: 'APPLE_SIGNIN_ASYNC',
    UPDATE_USERNAME_ASYNC: 'UPDATE_USERNAME_ASYNC',

    // HOME
    GET_MODULE_COUNTS_ASYNC: 'GET_MODULE_COUNTS_ASYNC',

    // ONBOARDING
    SUBMIT_ONBOARDING_ASYNC: 'SUBMIT_ONBOARDING_ASYNC',
    GET_ONBOARDING_STATUS_ASYNC: 'GET_ONBOARDING_STATUS_ASYNC',
    GET_DASHBOARD_ASYNC: 'GET_DASHBOARD_ASYNC',
    MARK_DASHBOARD_DONE_ASYNC: 'MARK_DASHBOARD_DONE_ASYNC',

    // INSIGHT ENGINE
    GET_INSIGHTS_ASYNC: 'GET_INSIGHTS_ASYNC',
    GET_INSIGHTS_SUMMARY_ASYNC: 'GET_INSIGHTS_SUMMARY_ASYNC',
    DISMISS_INSIGHT_ASYNC: 'DISMISS_INSIGHT_ASYNC',
    SNOOZE_INSIGHT_ASYNC: 'SNOOZE_INSIGHT_ASYNC',
    UNDISMISS_INSIGHT_ASYNC: 'UNDISMISS_INSIGHT_ASYNC',

    // CONTENT
    GET_PRIVACY_POLICY_ASYNC: 'GET_PRIVACY_POLICY_ASYNC',
    GET_TERMS_ASYNC: 'GET_TERMS_ASYNC',

    // FAQS
    GET_FAQS_ASYNC: 'GET_FAQS_ASYNC',

    // SUPPORT
    GET_SUPPORT_CATEGORIES_ASYNC: 'GET_SUPPORT_CATEGORIES_ASYNC',
    GET_SUPPORT_TICKETS_ASYNC: 'GET_SUPPORT_TICKETS_ASYNC',
    GET_SUPPORT_TICKET_ASYNC: 'GET_SUPPORT_TICKET_ASYNC',
    CREATE_SUPPORT_TICKET_ASYNC: 'CREATE_SUPPORT_TICKET_ASYNC',
    REOPEN_SUPPORT_TICKET_ASYNC: 'REOPEN_SUPPORT_TICKET_ASYNC',
    REPLY_SUPPORT_TICKET_ASYNC: 'REPLY_SUPPORT_TICKET_ASYNC',
    EDIT_SUPPORT_REPLY_ASYNC: 'EDIT_SUPPORT_REPLY_ASYNC',
    DELETE_SUPPORT_REPLY_ASYNC: 'DELETE_SUPPORT_REPLY_ASYNC',

    // THEME
    GET_THEME_ASYNC: 'GET_THEME_ASYNC',
    UPDATE_THEME_ASYNC: 'UPDATE_THEME_ASYNC',
} as const;

export const ASYNC_STATUS = {
    IDLE: 'IDLE',
    LOADING: 'LOADING',
    SUCCEEDED: 'SUCCEEDED',
    ERROR: 'ERROR',
} as const;

export const API_TIMEOUT = 55000;

export const GOOGLE_CONFIG = {
    WEB_CLIENT_ID: ENV.GOOGLE_WEB_CLIENT_ID,
    IOS_CLIENT_ID: isIOS ? ENV.GOOGLE_IOS_CLIENT_ID : null,
    ANDROID_CLIENT_ID: !isIOS ? ENV.GOOGLE_ANDROID_CLIENT_ID : null,
    SCOPES: ['profile', 'email'],
    OFFLINE_ACCESS: true,
    FORCE_CODE_FOR_REFRESH_TOKEN: true,
};