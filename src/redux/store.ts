import { configureStore } from '@reduxjs/toolkit';
import { persistStore, persistReducer, createMigrate, REHYDRATE } from 'redux-persist';
import AsyncStorage from '@react-native-async-storage/async-storage';
import userRoleReducer, { rehydrateThemeColors } from './slices/userRoleSlice';
import type {
  PersistConfig,
  RootState,
  AppStore,
  AppPersistor,
} from '../types/store.types';
import userAuthReducer from './slices/authSlice';

// Persist auth slice so user_data, user_auth, user_id AND identity hub data survive app restarts.
// Identity hub (driver license, passport, licenses) needs to be cached for IdentityHub module offline.
const authPersistConfig = {
  key: 'auth',
  storage: AsyncStorage,
  // auth_token and user_id are intentionally excluded from AsyncStorage persist.
  // auth_token is stored in the iOS Keychain / Android Keystore via tokenStorage.ts.
  // user_id is stored in the iOS Keychain / Android Keystore via saveUserId().
  // Keeping tokens in AsyncStorage would expose them in plaintext on unencrypted
  // devices and in device backups.
  whitelist: [
    'user_auth',
    'user_data',
    'identity_hub_data',
    'driver_license_data',
    'passport_data',
    'licenses_data',
  ],
};
import essentialsSlice from './slices/essentialsSlice';
import liabilitiesSlice from './slices/liabilitiesSlice';
import assetsSlice from './slices/assetsSlice';
import businessSlice from './slices/businessSlice';
import businessContactsSlice from './slices/businessContactsSlice';
import businessLicensesSlice from './slices/businessLicensesSlice';
import businessProjectsSlice from './slices/businessProjectsSlice';
import connectionSlice from './slices/connectionSlice';
import sharingslice from './slices/sharingSlice';
import reminderSlice from './slices/reminderSlice';
import searchSlice from './slices/searchSlice';
import homeSlice from './slices/homeSlice';
import newOnboardingSlice from './slices/newOnboardingSlice';
import businessOnboardingSlice from './slices/businessOnboardingSlice';
import onboardingReducer from './slices/onboardingSlice';
import insightsReducer from './slices/insightsSlice';
import notificationsSlice from './slices/notificationsSlice';
import contentSlice from './slices/contentSlice';
import faqsSlice from './slices/faqsSlice';
import supportSlice from './slices/supportSlice';

const persistConfig: PersistConfig = {
  key: 'root',
  storage: AsyncStorage,
  whitelist: ['role', 'customColors', 'darkMode'],
};

// v1: older app versions auto-selected the first business silently. Business
// selection is now always explicit, so wipe any selection persisted by those
// older builds — everyone re-lands on "no business selected" exactly once.
const businessMigrations = {
  1: (state: any) => ({
    ...state,
    selectedBusinessId: null,
  }),
};

// Persist business data so business list + selection survive offline/app restarts
const businessPersistConfig = {
  key: 'business',
  version: 1,
  storage: AsyncStorage,
  whitelist: ['selectedBusinessId', 'get_businesses_data'],
  migrate: createMigrate(businessMigrations, { debug: false }),
};

// Persist essentials slice so dropdown/lookup data (social network types, etc.)
// is available when offline — these are fetched once from the API and cached.
const essentialsPersistConfig = {
  key: 'essentials',
  storage: AsyncStorage,
  whitelist: [
    'social_network_types_data',
    'user_social_networks_data',
    'bookmarks_data',
    'subscriptions_data',
    'legal_documents_data',
    'get_pets_data',
    'get_children_data',
    'wallet_data',
    'get_app_tabs_data',
  ],
};

const persistedReducer = persistReducer(persistConfig, userRoleReducer);
const persistedBusinessReducer = persistReducer(
  businessPersistConfig,
  businessSlice,
);
const persistedAuthReducer = persistReducer(authPersistConfig, userAuthReducer);
const persistedEssentialsReducer = persistReducer(
  essentialsPersistConfig,
  essentialsSlice,
);

// Persist liabilities list data so Home screens show cached data offline
const liabilitiesPersistConfig = {
  key: 'liabilities',
  storage: AsyncStorage,
  whitelist: [
    'get_loan_data',
    'get_utilities_data',
    'get_insurances_data',
    'get_warranties_data',
  ],
};
const persistedLiabilitiesReducer = persistReducer(
  liabilitiesPersistConfig,
  liabilitiesSlice,
);

// Persist assets list data so Home screens show cached data offline
const assetsPersistConfig = {
  key: 'assets',
  storage: AsyncStorage,
  whitelist: [
    'get_bank_account_data',
    'get_personal_property_data',
    'get_real_state_overview_data',
    'get_vehicles_data',
  ],
};
const persistedAssetsReducer = persistReducer(
  assetsPersistConfig,
  assetsSlice,
);

// Persist business contacts so the contacts list is available offline
const businessContactsPersistConfig = {
  key: 'businessContacts',
  storage: AsyncStorage,
  whitelist: ['get_business_contacts_data'],
};
const persistedBusinessContactsReducer = persistReducer(
  businessContactsPersistConfig,
  businessContactsSlice,
);

// Persist business licenses + compliance data for offline viewing
const businessLicensesPersistConfig = {
  key: 'businessLicenses',
  storage: AsyncStorage,
  whitelist: [
    'get_business_licenses_data',
    'get_compliance_folders_data',
    'get_compliance_records_data',
  ],
};
const persistedBusinessLicensesReducer = persistReducer(
  businessLicensesPersistConfig,
  businessLicensesSlice,
);

// Persist business projects list for offline viewing
const businessProjectsPersistConfig = {
  key: 'businessProjects',
  storage: AsyncStorage,
  whitelist: ['get_business_projects_data'],
};
const persistedBusinessProjectsReducer = persistReducer(
  businessProjectsPersistConfig,
  businessProjectsSlice,
);

export const store: AppStore = configureStore({
  reducer: {
    userRole: persistedReducer,
    user_auth: persistedAuthReducer,
    liabilities_slice: persistedLiabilitiesReducer,
    essentials_slice: persistedEssentialsReducer,
    assets_slice: persistedAssetsReducer,
    business_slice: persistedBusinessReducer,
    business_contacts_slice: persistedBusinessContactsReducer,
    business_licenses_slice: persistedBusinessLicensesReducer,
    business_projects_slice: persistedBusinessProjectsReducer,
    connection_slice: connectionSlice,
    sharing_slice: sharingslice,
    reminder_slice: reminderSlice,
    search_slice: searchSlice,
    home_slice: homeSlice,
    newOnboarding_slice: newOnboardingSlice,
    businessOnboarding_slice: businessOnboardingSlice,
    onboarding_slice: onboardingReducer,
    insights_slice: insightsReducer,
    notifications_slice: notificationsSlice,
    content_slice: contentSlice,
    faqs_slice: faqsSlice,
    support_slice: supportSlice,
  },
  middleware: getDefaultMiddleware =>
    getDefaultMiddleware({
      serializableCheck: {
        ignoredActions: ['persist/PERSIST', 'persist/REHYDRATE'],
      },
    }),
});

export const persistor: AppPersistor = persistStore(store, null, () => {
  store.dispatch(rehydrateThemeColors());
});

// Export types for use in components
export type { RootState, AppDispatch } from '../types/store.types';
