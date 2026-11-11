
import { API_ENDPOINTS, TYPE_CONSTANTS } from '../../config/constants';
import createApiThunk from '../../utils/createApiThunk';
import { appendShareQueryParams } from '../../utils/shareQuery';
import {
  DeleteSocialNetworkResponse,
  SocialNetworkSetupPayload,
  SocialNetworkSetupResponse,
  SocialNetworkTypesResponse,
  UpdateSocialNetworkParams,
  UserSocialNetworksResponse,
} from '../../types/reduxTypes/essentialsSlice.types';

export interface BookmarksParams {
  businessId?: number;
  userId?: number;
  sharedWithUserId?: number;
  ownerId?: number;
}

export interface LegalDocumentsParams {
  businessId?: number;
  userId?: number;
  sharedWithUserId?: number;
  ownerId?: number;
}

// Bookmarks
export const bookmarksAsync = createApiThunk(
  TYPE_CONSTANTS.BOOKMARKS_ASYNC,
  'get',
  (arg?: BookmarksParams | number) => {
    let url: string = API_ENDPOINTS.AUTH.BOOKMARKS;
    if (typeof arg === 'number') {
      url = `${API_ENDPOINTS.AUTH.BOOKMARKS}?businessId=${arg}`;
      return appendShareQueryParams(url, arg);
    }

    if (arg?.businessId && arg?.userId) {
      url = `${API_ENDPOINTS.AUTH.BOOKMARKS}?businessId=${arg.businessId}&userId=${arg.userId}`;
      return appendShareQueryParams(url, arg);
    }

    if (arg?.businessId) {
      url = `${API_ENDPOINTS.AUTH.BOOKMARKS}?businessId=${arg.businessId}`;
      return appendShareQueryParams(url, arg);
    }

    if (arg?.userId) {
      url = `${API_ENDPOINTS.AUTH.BOOKMARKS}?userId=${arg.userId}`;
      return appendShareQueryParams(url, arg);
    }

    return appendShareQueryParams(url, arg);
  },
  'Failed to fetch bookmarks. Please try again.',
);

export const createBookmarkAsync = createApiThunk(
  TYPE_CONSTANTS.CREATE_BOOKMARK_ASYNC,
  'post',
  API_ENDPOINTS.AUTH.BOOKMARKS,
  'Failed to create bookmark. Please try again.',
);

export const updateBookmarkAsync = createApiThunk(
  TYPE_CONSTANTS.UPDATE_BOOKMARK_ASYNC,
  'put',
  (arg: any) => `${API_ENDPOINTS.AUTH.BOOKMARK_DETAIL}/${arg.id}`,
  'Failed to update bookmark. Please try again.',
  { getBody: (arg: any) => arg.data },
);

export const deleteBookmarkAsync = createApiThunk(
  TYPE_CONSTANTS.DELETE_BOOKMARK_ASYNC,
  'delete',
  (id: any) => `${API_ENDPOINTS.AUTH.BOOKMARK_DELETE}/${id}`,
  'Failed to delete bookmark. Please try again.',
);

// Social Networks
export const socialNetworkTypesAsync = createApiThunk<SocialNetworkTypesResponse>(
  TYPE_CONSTANTS.SOCIAL_NETWORK_TYPES_ASYNC,
  'get',
  API_ENDPOINTS.AUTH.SOCIAL_NETWORK_TYPES,
  'Failed to fetch social network types. Please try again.',
);

export const socialNetworkSetupAsync = createApiThunk<SocialNetworkSetupResponse, SocialNetworkSetupPayload>(
  TYPE_CONSTANTS.SOCIAL_NETWORK_SETUP_ASYNC,
  'post',
  API_ENDPOINTS.AUTH.SOCIAL_NETWORK_SETUP,
  'Failed to setup social network. Please try again.',
);

export const updateSocialNetworkSetupAsync = createApiThunk<SocialNetworkSetupResponse, UpdateSocialNetworkParams>(
  TYPE_CONSTANTS.UPDATE_SOCIAL_NETWORK_SETUP_ASYNC,
  'put',
  (arg) => `${API_ENDPOINTS.AUTH.SOCIAL_NETWORK_SETUP}/${arg.id}`,
  'Failed to update social network. Please try again.',
  { getBody: (arg) => arg.data },
);

export const deleteSocialNetworkSetupAsync = createApiThunk<DeleteSocialNetworkResponse, number | string>(
  TYPE_CONSTANTS.DELETE_SOCIAL_NETWORK_SETUP_ASYNC,
  'delete',
  (id) => `${API_ENDPOINTS.AUTH.SOCIAL_NETWORK_SETUP}/${id}`,
  'Failed to delete social network. Please try again.',
  { transformResponse: (data, id) => ({ ...data, deletedId: id }) },
);

export interface UserSocialNetworksParams {
  businessId?: number;
  userId?: number;
  sharedWithUserId?: number;
  ownerId?: number;
}

export const userSocialNetworksAsync = createApiThunk<
  UserSocialNetworksResponse,
  UserSocialNetworksParams | undefined
>(
  TYPE_CONSTANTS.USER_SOCIAL_NETWORKS_ASYNC,
  'get',
  (arg?: UserSocialNetworksParams) => {
    let url: string = API_ENDPOINTS.AUTH.USER_SOCIAL_NETWORKS;
    if (arg?.businessId) {
      if (arg?.userId) {
        url = `${API_ENDPOINTS.AUTH.USER_SOCIAL_NETWORKS}?businessId=${arg.businessId}&userId=${arg.userId}`;
        return appendShareQueryParams(url, arg);
      } else {
        url = `${API_ENDPOINTS.AUTH.USER_SOCIAL_NETWORKS}?businessId=${arg.businessId}`;
        return appendShareQueryParams(url, arg);
      }
    }

    if (arg?.userId) {
      url = `${API_ENDPOINTS.AUTH.USER_SOCIAL_NETWORKS}?userId=${arg.userId}`;
      return appendShareQueryParams(url, arg);
    }

    return appendShareQueryParams(url, arg);
  },
  'Failed to fetch social networks. Please try again.',
);

// Legal Documents
export const legalDocumentsAsync = createApiThunk(
  TYPE_CONSTANTS.LEGAL_DOCUMENTS_ASYNC,
  'get',
  (arg?: LegalDocumentsParams | number) => {
    let url: string = API_ENDPOINTS.AUTH.LEGAL_DOCUMENTS;
    if (typeof arg === 'number') {
      url = `${API_ENDPOINTS.AUTH.LEGAL_DOCUMENTS}?businessId=${arg}`;
      return appendShareQueryParams(url, arg);
    }

    if (arg?.businessId && arg?.userId) {
      url = `${API_ENDPOINTS.AUTH.LEGAL_DOCUMENTS}?businessId=${arg.businessId}&userId=${arg.userId}`;
      return appendShareQueryParams(url, arg);
    }

    if (arg?.businessId) {
      url = `${API_ENDPOINTS.AUTH.LEGAL_DOCUMENTS}?businessId=${arg.businessId}`;
      return appendShareQueryParams(url, arg);
    }

    if (arg?.userId) {
      url = `${API_ENDPOINTS.AUTH.LEGAL_DOCUMENTS}?userId=${arg.userId}`;
      return appendShareQueryParams(url, arg);
    }

    return appendShareQueryParams(url, arg);
  },
  'Failed to fetch legal documents. Please try again.',
);

export const createLegalDocumentAsync = createApiThunk(
  TYPE_CONSTANTS.CREATE_LEGAL_DOCUMENT_ASYNC,
  'post',
  API_ENDPOINTS.AUTH.LEGAL_DOCUMENTS,
  'Failed to create legal document. Please try again.',
);

export const updateLegalDocumentAsync = createApiThunk(
  TYPE_CONSTANTS.UPDATE_LEGAL_DOCUMENT_ASYNC,
  'put',
  (arg: any) => `${API_ENDPOINTS.AUTH.LEGAL_DOCUMENTS}/${arg.id}`,
  'Failed to update legal document. Please try again.',
  { getBody: (arg: any) => arg.data },
);

export const deleteLegalDocumentAsync = createApiThunk(
  TYPE_CONSTANTS.DELETE_LEGAL_DOCUMENT_ASYNC,
  'delete',
  (id: any) => `${API_ENDPOINTS.AUTH.LEGAL_DOCUMENTS}/${id}`,
  'Failed to delete legal document. Please try again.',
);

// Pets
export const getPetsAsync = createApiThunk(
  TYPE_CONSTANTS.GET_PETS_ASYNC,
  'get',
  (arg: any) => {
    let url: string = API_ENDPOINTS.AUTH.PETS;
    if (arg?.userId) {
      url = `${API_ENDPOINTS.AUTH.PETS}?userId=${arg.userId}`;
    }
    return appendShareQueryParams(url, arg);
  },
  'Failed to fetch pets. Please try again.',
);

export const addPetAsync = createApiThunk<any, any>(
  TYPE_CONSTANTS.ADD_PET_ASYNC,
  'post',
  API_ENDPOINTS.AUTH.PETS,
  'Failed to add pet. Please try again.',
);

export const editPetAsync = createApiThunk<any, { id: number; data: any }>(
  TYPE_CONSTANTS.EDIT_PET_ASYNC,
  'put',
  (arg) => `${API_ENDPOINTS.AUTH.PETS}/${arg.id}`,
  'Failed to update pet. Please try again.',
  { getBody: (arg) => arg.data },
);

export const deletePetAsync = createApiThunk<any, number>(
  TYPE_CONSTANTS.DELETE_PET_ASYNC,
  'delete',
  (id) => `${API_ENDPOINTS.AUTH.PETS}/${id}`,
  'Failed to delete pet. Please try again.',
  { transformResponse: (data, id) => data || { success: true, id } },
);

export const addPetVaccinationAsync = createApiThunk<any, { petId: number; data: any }>(
  TYPE_CONSTANTS.ADD_PET_VACCINATION_ASYNC,
  'post',
  (arg) => `${API_ENDPOINTS.AUTH.PETS}/${arg.petId}/${API_ENDPOINTS.AUTH.PET_VACCINATIONS}`,
  'Failed to add vaccination. Please try again.',
  { getBody: (arg) => arg.data },
);

export const editPetVaccinationAsync = createApiThunk<any, { petId: number; vaccinationId: number; data: any }>(
  TYPE_CONSTANTS.EDIT_PET_VACCINATION_ASYNC,
  'put',
  (arg) => `${API_ENDPOINTS.AUTH.PETS}/${arg.petId}/${API_ENDPOINTS.AUTH.PET_VACCINATIONS}/${arg.vaccinationId}`,
  'Failed to edit vaccination. Please try again.',
  { getBody: (arg) => arg.data },
);

export const deletePetVaccinationAsync = createApiThunk<any, { petId: number; vaccinationId: number }>(
  TYPE_CONSTANTS.DELETE_PET_VACCINATION_ASYNC,
  'delete',
  (arg) => `${API_ENDPOINTS.AUTH.PETS}/${arg.petId}/${API_ENDPOINTS.AUTH.PET_VACCINATIONS}/${arg.vaccinationId}`,
  'Failed to delete vaccination. Please try again.',
);

export const addPetMedicationAsync = createApiThunk<any, { petId: number; data: any }>(
  TYPE_CONSTANTS.ADD_PET_MEDICATION_ASYNC,
  'post',
  (arg) => `${API_ENDPOINTS.AUTH.PETS}/${arg.petId}/${API_ENDPOINTS.AUTH.PET_MEDICATIONS}`,
  'Failed to add medication. Please try again.',
  { getBody: (arg) => arg.data },
);

export const editPetMedicationAsync = createApiThunk<any, { petId: number; medicationId: number; data: any }>(
  TYPE_CONSTANTS.EDIT_PET_MEDICATION_ASYNC,
  'put',
  (arg) => `${API_ENDPOINTS.AUTH.PETS}/${arg.petId}/${API_ENDPOINTS.AUTH.PET_MEDICATIONS}/${arg.medicationId}`,
  'Failed to edit medication. Please try again.',
  { getBody: (arg) => arg.data },
);

export const deletePetMedicationAsync = createApiThunk<any, { petId: number; medicationId: number }>(
  TYPE_CONSTANTS.DELETE_PET_MEDICATION_ASYNC,
  'delete',
  (arg) => `${API_ENDPOINTS.AUTH.PETS}/${arg.petId}/${API_ENDPOINTS.AUTH.PET_MEDICATIONS}/${arg.medicationId}`,
  'Failed to delete medication. Please try again.',
);

export const addPetVetAppointmentAsync = createApiThunk<any, { petId: number; data: any }>(
  TYPE_CONSTANTS.ADD_PET_VET_APPOINTMENT_ASYNC,
  'post',
  (arg) => `${API_ENDPOINTS.AUTH.PETS}/${arg.petId}/${API_ENDPOINTS.AUTH.PET_VET_APPOINTMENTS}`,
  'Failed to add vet appointment. Please try again.',
  { getBody: (arg) => arg.data },
);

export const editPetVetAppointmentAsync = createApiThunk<any, { petId: number; appointmentId: number; data: any }>(
  TYPE_CONSTANTS.EDIT_PET_VET_APPOINTMENT_ASYNC,
  'put',
  (arg) => `${API_ENDPOINTS.AUTH.PETS}/${arg.petId}/${API_ENDPOINTS.AUTH.PET_VET_APPOINTMENTS}/${arg.appointmentId}`,
  'Failed to edit vet appointment. Please try again.',
  { getBody: (arg) => arg.data },
);

export const deletePetVetAppointmentAsync = createApiThunk<any, { petId: number; appointmentId: number }>(
  TYPE_CONSTANTS.DELETE_PET_VET_APPOINTMENT_ASYNC,
  'delete',
  (arg) => `${API_ENDPOINTS.AUTH.PETS}/${arg.petId}/${API_ENDPOINTS.AUTH.PET_VET_APPOINTMENTS}/${arg.appointmentId}`,
  'Failed to delete vet appointment. Please try again.',
);

export const addPetIllnessAsync = createApiThunk<any, { petId: number; data: any }>(
  TYPE_CONSTANTS.ADD_PET_ILLNESS_ASYNC,
  'post',
  (arg) => `${API_ENDPOINTS.AUTH.PETS}/${arg.petId}/${API_ENDPOINTS.AUTH.PET_ILLNESSES}`,
  'Failed to add illness. Please try again.',
  { getBody: (arg) => arg.data },
);

export const editPetIllnessAsync = createApiThunk<any, { petId: number; illnessId: number; data: any }>(
  TYPE_CONSTANTS.EDIT_PET_ILLNESS_ASYNC,
  'put',
  (arg) => `${API_ENDPOINTS.AUTH.PETS}/${arg.petId}/${API_ENDPOINTS.AUTH.PET_ILLNESSES}/${arg.illnessId}`,
  'Failed to edit illness. Please try again.',
  { getBody: (arg) => arg.data },
);

export const deletePetIllnessAsync = createApiThunk<any, { petId: number; illnessId: number }>(
  TYPE_CONSTANTS.DELETE_PET_ILLNESS_ASYNC,
  'delete',
  (arg) => `${API_ENDPOINTS.AUTH.PETS}/${arg.petId}/${API_ENDPOINTS.AUTH.PET_ILLNESSES}/${arg.illnessId}`,
  'Failed to delete illness. Please try again.',
);

// Wallet
export const walletAsync = createApiThunk(
  TYPE_CONSTANTS.WALLET_ASYNC,
  'get',
  (arg?: { userId?: number; businessId?: number; sharedWithUserId?: number; ownerId?: number }) => {
    // Personal wallet by default; with businessId, only that business's items.
    const params: string[] = [];
    if (arg?.userId) params.push(`userId=${arg.userId}`);
    if (typeof arg?.businessId === 'number') params.push(`businessId=${arg.businessId}`);
    const url: string = `${API_ENDPOINTS.AUTH.WALLET}${params.length ? `?${params.join('&')}` : ''}`;
    return appendShareQueryParams(url, arg);
  },
  'Failed to fetch wallet. Please try again.',
);

export const walletToggleAsync = createApiThunk<
  any,
  { module: string; itemId: number; isInWallet: boolean }
>(
  TYPE_CONSTANTS.WALLET_TOGGLE_ASYNC,
  'patch',
  API_ENDPOINTS.AUTH.WALLET_TOGGLE,
  'Failed to update wallet. Please try again.',
  { skipOfflineQueue: true },
);

// Subscriptions
export const subscriptionsAsync = createApiThunk(
  TYPE_CONSTANTS.SUBSCRIPTIONS_ASYNC,
  'get',
  (arg?: { userId?: number; businessId?: number; sharedWithUserId?: number; ownerId?: number }) => {
    // Personal records by default; with businessId, that business's.
    const params: string[] = [];
    if (arg?.userId) params.push(`userId=${arg.userId}`);
    if (typeof arg?.businessId === 'number') params.push(`businessId=${arg.businessId}`);
    const url: string = `${API_ENDPOINTS.AUTH.SUBSCRIPTIONS}${params.length ? `?${params.join('&')}` : ''}`;
    return appendShareQueryParams(url, arg);
  },
  'Failed to fetch subscriptions. Please try again.',
);

export const createSubscriptionAsync = createApiThunk(
  TYPE_CONSTANTS.CREATE_SUBSCRIPTION_ASYNC,
  'post',
  API_ENDPOINTS.AUTH.SUBSCRIPTIONS,
  'Failed to create subscription. Please try again.',
);

export const updateSubscriptionAsync = createApiThunk(
  TYPE_CONSTANTS.UPDATE_SUBSCRIPTION_ASYNC,
  'put',
  (arg: any) => `${API_ENDPOINTS.AUTH.SUBSCRIPTION_DETAIL}/${arg.id}`,
  'Failed to update subscription. Please try again.',
  { getBody: (arg: any) => arg.data },
);

export const deleteSubscriptionAsync = createApiThunk(
  TYPE_CONSTANTS.DELETE_SUBSCRIPTION_ASYNC,
  'delete',
  (id: any) => `${API_ENDPOINTS.AUTH.SUBSCRIPTION_DETAIL}/${id}`,
  'Failed to delete subscription. Please try again.',
);

export const getSubscriptionsSharedWithMeAsync = createApiThunk(
  'GET_SUBSCRIPTIONS_SHARED_WITH_ME_ASYNC',
  'get',
  `${API_ENDPOINTS.AUTH.SUBSCRIPTIONS}?allSharedWithMe=true&groupByOwner=true`,
  'Failed to fetch shared subscriptions. Please try again.',
);

export const getSocialNetworksSharedWithMeAsync = createApiThunk(
  'GET_SOCIAL_NETWORKS_SHARED_WITH_ME_ASYNC',
  'get',
  `${API_ENDPOINTS.AUTH.USER_SOCIAL_NETWORKS}?allSharedWithMe=true&groupByOwner=true`,
  'Failed to fetch shared social networks. Please try again.',
);

export const getBookmarksSharedWithMeAsync = createApiThunk(
  'GET_BOOKMARKS_SHARED_WITH_ME_ASYNC',
  'get',
  `${API_ENDPOINTS.AUTH.BOOKMARKS}?allSharedWithMe=true&groupByOwner=true`,
  'Failed to fetch shared bookmarks. Please try again.',
);

export const getWalletSharedWithMeAsync = createApiThunk(
  'GET_WALLET_SHARED_WITH_ME_ASYNC',
  'get',
  `${API_ENDPOINTS.AUTH.WALLET}?allSharedWithMe=true&groupByOwner=true`,
  'Failed to fetch shared wallet items. Please try again.',
);

export const getLegalDocumentsSharedWithMeAsync = createApiThunk(
  'GET_LEGAL_DOCUMENTS_SHARED_WITH_ME_ASYNC',
  'get',
  `${API_ENDPOINTS.AUTH.LEGAL_DOCUMENTS}?allSharedWithMe=true&groupByOwner=true`,
  'Failed to fetch shared legal documents. Please try again.',
);

// Health Tracker — Children
export const getChildrenAsync = createApiThunk(
  TYPE_CONSTANTS.GET_CHILDREN_ASYNC,
  'get',
  (arg: any) => {
    let url: string = API_ENDPOINTS.HEALTH_TRACKER.CHILDREN;
    if (arg?.currentConnectionUserId) {
      url = `${API_ENDPOINTS.HEALTH_TRACKER.CHILDREN}?userId=${arg.currentConnectionUserId}`;
    }
    return appendShareQueryParams(url, arg);
  },
  'Failed to fetch children. Please try again.',
);

// Health Tracker — Children (as caregiver)
export const getChildrenAsCaregiverAsync = createApiThunk(
  TYPE_CONSTANTS.GET_CHILDREN_AS_CAREGIVER_ASYNC,
  'get',
  (arg: any) => {
    let url: string = API_ENDPOINTS.HEALTH_TRACKER.CHILDREN_AS_CAREGIVER;
    if (arg?.currentConnectionUserId) {
      url = `${API_ENDPOINTS.HEALTH_TRACKER.CHILDREN_AS_CAREGIVER}?userId=${arg.currentConnectionUserId}`;
    }
    return appendShareQueryParams(url, arg);
  },
  'Failed to fetch caregiver children. Please try again.',
);

export const getChildByIdAsync = createApiThunk<any, any>(
  TYPE_CONSTANTS.GET_CHILD_BY_ID_ASYNC,
  'get',
  (arg: any) => {
    let url = `${API_ENDPOINTS.HEALTH_TRACKER.CHILDREN}/${arg.childId}`;
    if (arg?.currentConnectionUserId) {
      url = `${API_ENDPOINTS.HEALTH_TRACKER.CHILDREN}/${arg.childId}?userId=${arg.currentConnectionUserId}`;
    }
    return appendShareQueryParams(url, arg);
  },
  'Failed to fetch child details. Please try again.',
);

export const addChildAsync = createApiThunk(
  TYPE_CONSTANTS.ADD_CHILD_ASYNC,
  'post',
  API_ENDPOINTS.HEALTH_TRACKER.CHILDREN,
  'Failed to add child. Please try again.',
);

export const updateChildAsync = createApiThunk<any, { id: number; data: any }>(
  TYPE_CONSTANTS.UPDATE_CHILD_ASYNC,
  'put',
  (arg) => `${API_ENDPOINTS.HEALTH_TRACKER.CHILDREN}/${arg.id}`,
  'Failed to update child. Please try again.',
  { getBody: (arg) => arg.data },
);

export const deleteChildAsync = createApiThunk<any, number>(
  TYPE_CONSTANTS.DELETE_CHILD_ASYNC,
  'delete',
  (id) => `${API_ENDPOINTS.HEALTH_TRACKER.CHILDREN}/${id}`,
  'Failed to delete child. Please try again.',
  { transformResponse: (data, id) => data || { success: true, id } },
);

// Health Tracker — Child Medications
export const addChildMedicationAsync = createApiThunk<any, { childId: string; medicationData: any }>(
  TYPE_CONSTANTS.ADD_CHILD_MEDICATION_ASYNC,
  'post',
  (arg) => `${API_ENDPOINTS.HEALTH_TRACKER.CHILDREN}/${arg.childId}/${API_ENDPOINTS.HEALTH_TRACKER.CHILD_MEDICATIONS}`,
  'Failed to add medication. Please try again.',
  { getBody: (arg) => arg.medicationData },
);

export const updateChildMedicationAsync = createApiThunk<any, { childId: string; medicationId: number; medicationData: any }>(
  TYPE_CONSTANTS.UPDATE_CHILD_MEDICATION_ASYNC,
  'put',
  (arg) => `${API_ENDPOINTS.HEALTH_TRACKER.CHILDREN}/${arg.childId}/${API_ENDPOINTS.HEALTH_TRACKER.CHILD_MEDICATIONS}/${arg.medicationId}`,
  'Failed to update medication. Please try again.',
  { getBody: (arg) => arg.medicationData },
);

export const deleteChildMedicationAsync = createApiThunk<any, { childId: string; medicationId: number }>(
  TYPE_CONSTANTS.DELETE_CHILD_MEDICATION_ASYNC,
  'delete',
  (arg) => `${API_ENDPOINTS.HEALTH_TRACKER.CHILDREN}/${arg.childId}/${API_ENDPOINTS.HEALTH_TRACKER.CHILD_MEDICATIONS}/${arg.medicationId}`,
  'Failed to delete medication. Please try again.',
);

// Health Tracker — Child Doctors
export const getChildDoctorsAsync = createApiThunk<any, string>(
  TYPE_CONSTANTS.GET_CHILD_DOCTORS_ASYNC,
  'get',
  (childId) => `${API_ENDPOINTS.HEALTH_TRACKER.CHILDREN}/${childId}/${API_ENDPOINTS.HEALTH_TRACKER.CHILD_DOCTORS}`,
  'Failed to fetch doctors. Please try again.',
);

export const addChildDoctorAsync = createApiThunk<any, { childId: string; doctorData: any }>(
  TYPE_CONSTANTS.ADD_CHILD_DOCTOR_ASYNC,
  'post',
  (arg) => `${API_ENDPOINTS.HEALTH_TRACKER.CHILDREN}/${arg.childId}/${API_ENDPOINTS.HEALTH_TRACKER.CHILD_DOCTORS}`,
  'Failed to add doctor. Please try again.',
  { getBody: (arg) => arg.doctorData },
);

export const getChildDoctorByIdAsync = createApiThunk<any, { childId: string; doctorId: number }>(
  TYPE_CONSTANTS.GET_CHILD_DOCTOR_BY_ID_ASYNC,
  'get',
  (arg) => `${API_ENDPOINTS.HEALTH_TRACKER.CHILDREN}/${arg.childId}/${API_ENDPOINTS.HEALTH_TRACKER.CHILD_DOCTORS}/${arg.doctorId}`,
  'Failed to get doctor details. Please try again.',
);

export const updateChildDoctorAsync = createApiThunk<any, { childId: string; doctorId: number; doctorData: any }>(
  TYPE_CONSTANTS.UPDATE_CHILD_DOCTOR_ASYNC,
  'put',
  (arg) => `${API_ENDPOINTS.HEALTH_TRACKER.CHILDREN}/${arg.childId}/${API_ENDPOINTS.HEALTH_TRACKER.CHILD_DOCTORS}/${arg.doctorId}`,
  'Failed to update doctor. Please try again.',
  { getBody: (arg) => arg.doctorData },
);

export const deleteChildDoctorAsync = createApiThunk<any, { childId: string; doctorId: number }>(
  TYPE_CONSTANTS.DELETE_CHILD_DOCTOR_ASYNC,
  'delete',
  (arg) => `${API_ENDPOINTS.HEALTH_TRACKER.CHILDREN}/${arg.childId}/${API_ENDPOINTS.HEALTH_TRACKER.CHILD_DOCTORS}/${arg.doctorId}`,
  'Failed to delete doctor. Please try again.',
);

// Health Tracker — Child Caregivers
export const addChildCaregiverAsync = createApiThunk<any, { childId: string; caregiverData: any }>(
  TYPE_CONSTANTS.ADD_CHILD_CAREGIVER_ASYNC,
  'post',
  (arg) => `${API_ENDPOINTS.HEALTH_TRACKER.CHILDREN}/${arg.childId}/${API_ENDPOINTS.HEALTH_TRACKER.CHILD_CAREGIVERS}`,
  'Failed to add caregiver. Please try again.',
  { getBody: (arg) => arg.caregiverData },
);

export const updateChildCaregiverAsync = createApiThunk<any, { childId: string; caregiverId: number; caregiverData: any }>(
  TYPE_CONSTANTS.UPDATE_CHILD_CAREGIVER_ASYNC,
  'put',
  (arg) => `${API_ENDPOINTS.HEALTH_TRACKER.CHILDREN}/${arg.childId}/${API_ENDPOINTS.HEALTH_TRACKER.CHILD_CAREGIVERS}/${arg.caregiverId}`,
  'Failed to update caregiver. Please try again.',
  { getBody: (arg) => arg.caregiverData },
);

export const deleteChildCaregiverAsync = createApiThunk<any, { childId: string; caregiverId: number }>(
  TYPE_CONSTANTS.DELETE_CHILD_CAREGIVER_ASYNC,
  'delete',
  (arg) => `${API_ENDPOINTS.HEALTH_TRACKER.CHILDREN}/${arg.childId}/${API_ENDPOINTS.HEALTH_TRACKER.CHILD_CAREGIVERS}/${arg.caregiverId}`,
  'Failed to delete caregiver. Please try again.',
);

// Health Tracker — Child Appointments
export const addChildAppointmentAsync = createApiThunk<any, { childId: string; appointmentData: any }>(
  TYPE_CONSTANTS.ADD_CHILD_APPOINTMENT_ASYNC,
  'post',
  (arg) => `${API_ENDPOINTS.HEALTH_TRACKER.CHILDREN}/${arg.childId}/${API_ENDPOINTS.HEALTH_TRACKER.CHILD_APPOINTMENTS}`,
  'Failed to add appointment. Please try again.',
  { getBody: (arg) => arg.appointmentData },
);

export const updateChildAppointmentAsync = createApiThunk<any, { childId: string; appointmentId: number; appointmentData: any }>(
  TYPE_CONSTANTS.UPDATE_CHILD_APPOINTMENT_ASYNC,
  'put',
  (arg) => `${API_ENDPOINTS.HEALTH_TRACKER.CHILDREN}/${arg.childId}/${API_ENDPOINTS.HEALTH_TRACKER.CHILD_APPOINTMENTS}/${arg.appointmentId}`,
  'Failed to update appointment. Please try again.',
  { getBody: (arg) => arg.appointmentData },
);

export const deleteChildAppointmentAsync = createApiThunk<any, { childId: string; appointmentId: number }>(TYPE_CONSTANTS.DELETE_CHILD_APPOINTMENT_ASYNC,
  'delete',
  (arg) => `${API_ENDPOINTS.HEALTH_TRACKER.CHILDREN}/${arg.childId}/${API_ENDPOINTS.HEALTH_TRACKER.CHILD_APPOINTMENTS}/${arg.appointmentId}`,
  'Failed to delete appointment. Please try again.',
);

// Health Tracker — Child Illnesses
export const addChildIllnessAsync = createApiThunk<any, { childId: string; illnessData: any }>(
  TYPE_CONSTANTS.ADD_CHILD_ILLNESS_ASYNC,
  'post',
  (arg) => `${API_ENDPOINTS.HEALTH_TRACKER.CHILDREN}/${arg.childId}/${API_ENDPOINTS.HEALTH_TRACKER.CHILD_ILLNESSES}`,
  'Failed to add illness. Please try again.',
  { getBody: (arg) => arg.illnessData },
);

export const updateChildIllnessAsync = createApiThunk<any, { childId: string; illnessId: number; illnessData: any }>(
  TYPE_CONSTANTS.UPDATE_CHILD_ILLNESS_ASYNC,
  'put',
  (arg) => `${API_ENDPOINTS.HEALTH_TRACKER.CHILDREN}/${arg.childId}/${API_ENDPOINTS.HEALTH_TRACKER.CHILD_ILLNESSES}/${arg.illnessId}`,
  'Failed to update illness. Please try again.',
  { getBody: (arg) => arg.illnessData },
);

export const deleteChildIllnessAsync = createApiThunk<any, { childId: string; illnessId: number }>(
  TYPE_CONSTANTS.DELETE_CHILD_ILLNESS_ASYNC,
  'delete',
  (arg) => `${API_ENDPOINTS.HEALTH_TRACKER.CHILDREN}/${arg.childId}/${API_ENDPOINTS.HEALTH_TRACKER.CHILD_ILLNESSES}/${arg.illnessId}`,
  'Failed to delete illness. Please try again.',
);

// Health Tracker — Child Surgeries
export const addChildSurgeryAsync = createApiThunk<any, { childId: string; surgeryData: any }>(
  TYPE_CONSTANTS.ADD_CHILD_SURGERY_ASYNC,
  'post',
  (arg) => `${API_ENDPOINTS.HEALTH_TRACKER.CHILDREN}/${arg.childId}/${API_ENDPOINTS.HEALTH_TRACKER.CHILD_SURGERIES}`,
  'Failed to add surgery. Please try again.',
  { getBody: (arg) => arg.surgeryData },
);

export const updateChildSurgeryAsync = createApiThunk<any, { childId: string; surgeryId: number; surgeryData: any }>(
  TYPE_CONSTANTS.UPDATE_CHILD_SURGERY_ASYNC,
  'put',
  (arg) => `${API_ENDPOINTS.HEALTH_TRACKER.CHILDREN}/${arg.childId}/${API_ENDPOINTS.HEALTH_TRACKER.CHILD_SURGERIES}/${arg.surgeryId}`,
  'Failed to update surgery. Please try again.',
  { getBody: (arg) => arg.surgeryData },
);

export const deleteChildSurgeryAsync = createApiThunk<any, { childId: string; surgeryId: number }>(
  TYPE_CONSTANTS.DELETE_CHILD_SURGERY_ASYNC,
  'delete',
  (arg) => `${API_ENDPOINTS.HEALTH_TRACKER.CHILDREN}/${arg.childId}/${API_ENDPOINTS.HEALTH_TRACKER.CHILD_SURGERIES}/${arg.surgeryId}`,
  'Failed to delete surgery. Please try again.',
);

// App Tabs
export const getAppTabsAsync = createApiThunk(
  TYPE_CONSTANTS.GET_APP_TABS_ASYNC,
  'get',
  API_ENDPOINTS.APP_TABS.GET_APP_TABS,
  'Failed to fetch app tabs. Please try again.',
);

export const getFavoriteTabsAsync = createApiThunk(
  TYPE_CONSTANTS.GET_FAVORITE_TABS_ASYNC,
  'get',
  API_ENDPOINTS.APP_TABS.GET_FAVORITE_TABS,
  'Failed to fetch favorite tabs. Please try again.',
);

export const addFavoriteTabAsync = createApiThunk<any, { appTabId: number }>(
  TYPE_CONSTANTS.ADD_FAVORITE_TAB_ASYNC,
  'post',
  API_ENDPOINTS.APP_TABS.ADD_FAVORITE,
  'Failed to update favorite tab. Please try again.',
);

export const deleteFavoriteTabAsync = createApiThunk<any, number>(
  TYPE_CONSTANTS.DELETE_FAVORITE_TAB_ASYNC,
  'delete',
  (id) => `${API_ENDPOINTS.APP_TABS.DELETE_FAVORITE}/${id}`,
  'Failed to remove favorite tab. Please try again.',
);


