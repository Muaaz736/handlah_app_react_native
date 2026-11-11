import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { showErrorToast, showSuccessToast } from '../../components/common';
import {
  bookmarksAsync,
  createBookmarkAsync,
  updateBookmarkAsync,
  deleteBookmarkAsync,
  socialNetworkTypesAsync,
  socialNetworkSetupAsync,
  updateSocialNetworkSetupAsync,
  userSocialNetworksAsync,
  deleteSocialNetworkSetupAsync,
  legalDocumentsAsync,
  createLegalDocumentAsync,
  updateLegalDocumentAsync,
  deleteLegalDocumentAsync,
  subscriptionsAsync,
  createSubscriptionAsync,
  updateSubscriptionAsync,
  deleteSubscriptionAsync,
  walletAsync,
  walletToggleAsync,
  getPetsAsync,
  addPetAsync,
  editPetAsync,
  deletePetAsync,
  addPetVaccinationAsync,
  editPetVaccinationAsync,
  deletePetVaccinationAsync,
  addPetMedicationAsync,
  editPetMedicationAsync,
  deletePetMedicationAsync,
  addPetVetAppointmentAsync,
  editPetVetAppointmentAsync,
  deletePetVetAppointmentAsync,
  addPetIllnessAsync,
  editPetIllnessAsync,
  deletePetIllnessAsync,
  // Health Tracker imports
  getChildrenAsync,
  getChildrenAsCaregiverAsync,
  getChildByIdAsync,
  addChildAsync,
  updateChildAsync,
  deleteChildAsync,
  addChildMedicationAsync,
  getChildDoctorsAsync,
  addChildDoctorAsync,
  getChildDoctorByIdAsync,
  updateChildDoctorAsync,
  addChildCaregiverAsync,
  updateChildCaregiverAsync,
  updateChildMedicationAsync,
  addChildAppointmentAsync,
  updateChildAppointmentAsync,
  deleteChildAppointmentAsync,
  deleteChildCaregiverAsync,
  deleteChildDoctorAsync,
  deleteChildMedicationAsync,
  getAppTabsAsync,
  addFavoriteTabAsync,
  deleteFavoriteTabAsync,
  getFavoriteTabsAsync,
} from '../services/essentialsService';
import { ASYNC_STATUS } from '../../config/constants';
import {
  ApiAppTab,
  ApiAppTabCategory,
  DeleteSocialNetworkResponse,
  EssentialsState,
  SocialNetworkSetupResponse,
  SocialNetworkTypesResponse,
  UserSocialNetworksResponse,
} from '../../types/reduxTypes/essentialsSlice.types';

const initialState: EssentialsState = {
  // ====================  BookMark API Initial States ====================

  bookmarks_status: ASYNC_STATUS.IDLE,
  bookmarks_data: null,
  bookmarks_error: null,

  create_bookmark_status: ASYNC_STATUS.IDLE,
  create_bookmark_data: null,
  create_bookmark_error: null,

  update_bookmark_status: ASYNC_STATUS.IDLE,
  update_bookmark_data: null,
  update_bookmark_error: null,

  delete_bookmark_status: ASYNC_STATUS.IDLE,
  delete_bookmark_data: null,
  delete_bookmark_error: null,

  // ====================  Social Media API Initial States ====================

  social_network_types_status: ASYNC_STATUS.IDLE,
  social_network_types_data: null,
  social_network_types_error: null,

  social_network_setup_status: ASYNC_STATUS.IDLE,
  social_network_setup_data: null,
  social_network_setup_error: null,

  update_social_network_setup_status: ASYNC_STATUS.IDLE,
  update_social_network_setup_data: null,
  update_social_network_setup_error: null,

  user_social_networks_status: ASYNC_STATUS.IDLE,
  user_social_networks_data: null,
  user_social_networks_error: null,

  // ====================  Legal Document API Initial States ====================

  legal_documents_status: ASYNC_STATUS.IDLE,
  legal_documents_data: null,
  legal_documents_error: null,

  create_legal_document_status: ASYNC_STATUS.IDLE,
  create_legal_document_data: null,
  create_legal_document_error: null,

  update_legal_document_status: ASYNC_STATUS.IDLE,
  update_legal_document_data: null,
  update_legal_document_error: null,

  delete_legal_document_status: ASYNC_STATUS.IDLE,
  delete_legal_document_data: null,
  delete_legal_document_error: null,

  // ==================== Subscriptions API Initial States ====================

  subscriptions_status: ASYNC_STATUS.IDLE,
  subscriptions_data: null,
  subscriptions_error: null,

  create_subscription_status: ASYNC_STATUS.IDLE,
  create_subscription_data: null,
  create_subscription_error: null,

  update_subscription_status: ASYNC_STATUS.IDLE,
  update_subscription_data: null,
  update_subscription_error: null,

  delete_subscription_status: ASYNC_STATUS.IDLE,
  delete_subscription_data: null,
  delete_subscription_error: null,

  // ====================  Health Tracker - Children API Initial States ====================

  get_children_status: ASYNC_STATUS.IDLE,
  get_children_data: null,
  get_children_error: null,

  get_children_as_caregiver_status: ASYNC_STATUS.IDLE,
  get_children_as_caregiver_data: null,
  get_children_as_caregiver_error: null,

  get_child_by_id_status: ASYNC_STATUS.IDLE,
  get_child_by_id_data: null,
  get_child_by_id_error: null,

  add_child_status: ASYNC_STATUS.IDLE,
  add_child_data: null,
  add_child_error: null,

  update_child_status: ASYNC_STATUS.IDLE,
  update_child_data: null,
  update_child_error: null,

  delete_child_status: ASYNC_STATUS.IDLE,
  delete_child_data: null,
  delete_child_error: null,

  // ====================  Health Tracker - Child Medications API Initial States ====================

  add_child_medication_status: ASYNC_STATUS.IDLE,
  add_child_medication_data: null,
  add_child_medication_error: null,

  // ====================  Health Tracker - Child Doctors API Initial States ====================

  get_child_doctors_status: ASYNC_STATUS.IDLE,
  get_child_doctors_data: null,
  get_child_doctors_error: null,

  add_child_doctor_status: ASYNC_STATUS.IDLE,
  add_child_doctor_data: null,
  add_child_doctor_error: null,

  get_child_doctor_by_id_status: ASYNC_STATUS.IDLE,
  get_child_doctor_by_id_data: null,
  get_child_doctor_by_id_error: null,

  update_child_doctor_status: ASYNC_STATUS.IDLE,
  update_child_doctor_data: null,
  update_child_doctor_error: null,

  delete_child_doctor_status: ASYNC_STATUS.IDLE,
  delete_child_doctor_data: null,
  delete_child_doctor_error: null,

  // ====================  Health Tracker - Child Caregivers API Initial States ====================

  add_child_caregiver_status: ASYNC_STATUS.IDLE,
  add_child_caregiver_data: null,
  add_child_caregiver_error: null,

  update_child_caregiver_status: ASYNC_STATUS.IDLE,
  update_child_caregiver_data: null,
  update_child_caregiver_error: null,

  delete_child_caregiver_status: ASYNC_STATUS.IDLE,
  delete_child_caregiver_data: null,
  delete_child_caregiver_error: null,

  update_child_medication_status: ASYNC_STATUS.IDLE,
  update_child_medication_data: null,
  update_child_medication_error: null,

  delete_child_medication_status: ASYNC_STATUS.IDLE,
  delete_child_medication_data: null,
  delete_child_medication_error: null,

  // ====================  Health Tracker - Child Appointments API Initial States ====================

  add_child_appointment_status: ASYNC_STATUS.IDLE,
  add_child_appointment_data: null,
  add_child_appointment_error: null,
  update_child_appointment_status: ASYNC_STATUS.IDLE,
  update_child_appointment_data: null,
  update_child_appointment_error: null,

  delete_child_appointment_status: ASYNC_STATUS.IDLE,
  delete_child_appointment_data: null,
  delete_child_appointment_error: null,

  // ====================  Wallet API Initial States ====================

  wallet_status: ASYNC_STATUS.IDLE,
  wallet_data: null,
  wallet_error: null,

  wallet_toggle_status: ASYNC_STATUS.IDLE,
  wallet_toggle_error: null,

  // ====================  Pets API Initial States ====================

  get_pets_status: ASYNC_STATUS.IDLE,
  get_pets_data: null,
  get_pets_error: null,

  add_pet_status: ASYNC_STATUS.IDLE,
  add_pet_data: null,
  add_pet_error: null,

  edit_pet_status: ASYNC_STATUS.IDLE,
  edit_pet_data: null,
  edit_pet_error: null,

  delete_pet_status: ASYNC_STATUS.IDLE,
  delete_pet_data: null,
  delete_pet_error: null,

  add_pet_vaccination_status: ASYNC_STATUS.IDLE,
  add_pet_vaccination_data: null,
  add_pet_vaccination_error: null,

  edit_pet_vaccination_status: ASYNC_STATUS.IDLE,
  edit_pet_vaccination_data: null,
  edit_pet_vaccination_error: null,

  delete_pet_vaccination_status: ASYNC_STATUS.IDLE,
  delete_pet_vaccination_data: null,
  delete_pet_vaccination_error: null,

  add_pet_medication_status: ASYNC_STATUS.IDLE,
  add_pet_medication_data: null,
  add_pet_medication_error: null,

  edit_pet_medication_status: ASYNC_STATUS.IDLE,
  edit_pet_medication_data: null,
  edit_pet_medication_error: null,

  delete_pet_medication_status: ASYNC_STATUS.IDLE,
  delete_pet_medication_data: null,
  delete_pet_medication_error: null,

  add_pet_vet_appointment_status: ASYNC_STATUS.IDLE,
  add_pet_vet_appointment_data: null,
  add_pet_vet_appointment_error: null,

  edit_pet_vet_appointment_status: ASYNC_STATUS.IDLE,
  edit_pet_vet_appointment_data: null,
  edit_pet_vet_appointment_error: null,

  delete_pet_vet_appointment_status: ASYNC_STATUS.IDLE,
  delete_pet_vet_appointment_data: null,
  delete_pet_vet_appointment_error: null,

  add_pet_illness_status: ASYNC_STATUS.IDLE,
  add_pet_illness_data: null,
  add_pet_illness_error: null,

  edit_pet_illness_status: ASYNC_STATUS.IDLE,
  edit_pet_illness_data: null,
  edit_pet_illness_error: null,

  delete_pet_illness_status: ASYNC_STATUS.IDLE,
  delete_pet_illness_data: null,
  delete_pet_illness_error: null,

  // ====================  App Tabs API Initial States ====================

  get_app_tabs_status: ASYNC_STATUS.IDLE,
  get_app_tabs_data: null as ApiAppTabCategory[] | null,
  get_app_tabs_error: null,

  get_favorite_tabs_status: ASYNC_STATUS.IDLE,
  get_favorite_tabs_data: null as ApiAppTab[] | null,
  get_favorite_tabs_error: null,

  // User-defined display order for favorite tabs (ordered appTab IDs as strings).
  // Set synchronously on Save so Home reflects the new order immediately.
  favorite_tab_order: null as string[] | null,

  add_favorite_tab_status: ASYNC_STATUS.IDLE,
  add_favorite_tab_data: null,
  add_favorite_tab_error: null,

  delete_favorite_tab_status: ASYNC_STATUS.IDLE,
  delete_favorite_tab_data: null,
  delete_favorite_tab_error: null,
};

const essentialsSlice = createSlice({
  name: 'essentials_slice',
  initialState: initialState,
  reducers: {
    setCreateLegalDocumentStatus: state => {
      state.create_legal_document_status = ASYNC_STATUS.IDLE;
    },
    setUpdateLegalDocumentStatus: state => {
      state.update_legal_document_status = ASYNC_STATUS.IDLE;
    },
    setEditDoctoreStatus(state) {
      state.update_child_doctor_status = ASYNC_STATUS.IDLE;
    },
    setUpdateAppointmentStatus(state) {
      state.update_child_appointment_status = ASYNC_STATUS.IDLE;
    },
    setAddPetStatus(state) {
      state.add_pet_status = ASYNC_STATUS.IDLE;
    },
    setDeletePetStatus(state) {
      state.delete_pet_status = ASYNC_STATUS.IDLE;
    },
    setCreateBookmarkStatus(state) {
      state.create_bookmark_status = ASYNC_STATUS.IDLE;
    },
    setAddSocialMediaStatus(state) {
      state.social_network_setup_status = ASYNC_STATUS.IDLE;
    },
    setUpdateSocialMediaStatus(state) {
      state.update_social_network_setup_status = ASYNC_STATUS.IDLE;
    },
    setUpdateBookmarkStatus(state) {
      state.update_bookmark_status = ASYNC_STATUS.IDLE;
    },
   
    setFavoriteTabOrder(state, action: { payload: string[] }) {
      state.favorite_tab_order = action.payload;
      if (state.get_favorite_tabs_data && action.payload.length > 0) {
        const orderMap = new Map(action.payload.map((id, idx) => [id, idx]));
        state.get_favorite_tabs_data = [...state.get_favorite_tabs_data].sort(
          (a, b) =>
            (orderMap.get(String(a.id)) ?? 999) -
            (orderMap.get(String(b.id)) ?? 999),
        );
      }
    },
  },
  extraReducers: builder => {
    // Bookmarks GET handlers
    builder.addCase(bookmarksAsync.pending, state => {
      state.bookmarks_status = ASYNC_STATUS.LOADING;
    });
    builder.addCase(bookmarksAsync.fulfilled, (state, { payload }) => {
      state.bookmarks_status = ASYNC_STATUS.SUCCEEDED;
      state.bookmarks_data = payload?.bookmarks || payload;
    });
    builder.addCase(bookmarksAsync.rejected, (state, action) => {
      state.bookmarks_status = ASYNC_STATUS.ERROR;
      state.bookmarks_error = action.payload as string;
      showErrorToast(action.payload as string);
    });

    // Create Bookmark POST handlers
    builder.addCase(createBookmarkAsync.pending, state => {
      state.create_bookmark_status = ASYNC_STATUS.LOADING;
    });
    builder.addCase(createBookmarkAsync.fulfilled, (state, { payload }) => {
      state.create_bookmark_status = ASYNC_STATUS.SUCCEEDED;
      state.create_bookmark_data = payload;
      showSuccessToast(payload?.message || 'Bookmark created successfully');
    });
    builder.addCase(createBookmarkAsync.rejected, (state, action) => {
      state.create_bookmark_status = ASYNC_STATUS.ERROR;
      state.create_bookmark_error = action.payload as string;
      showErrorToast(action.payload as string);
    });

    // Update Bookmark PUT handlers
    builder.addCase(updateBookmarkAsync.pending, state => {
      state.update_bookmark_status = ASYNC_STATUS.LOADING;
    });
    builder.addCase(updateBookmarkAsync.fulfilled, (state, { payload }) => {
      state.update_bookmark_status = ASYNC_STATUS.SUCCEEDED;
      state.update_bookmark_data = payload;
      showSuccessToast(payload?.message || 'Bookmark updated successfully');
    });
    builder.addCase(updateBookmarkAsync.rejected, (state, action) => {
      state.update_bookmark_status = ASYNC_STATUS.ERROR;
      state.update_bookmark_error = action.payload as string;
      showErrorToast(action.payload as string);
    });

    // Delete Bookmark DELETE handlers
    builder.addCase(deleteBookmarkAsync.pending, state => {
      state.delete_bookmark_status = ASYNC_STATUS.LOADING;
    });
    builder.addCase(deleteBookmarkAsync.fulfilled, (state, { payload }) => {
      state.delete_bookmark_status = ASYNC_STATUS.SUCCEEDED;
      state.delete_bookmark_data = payload;
      showSuccessToast(payload?.message || 'Bookmark deleted successfully');
    });
    builder.addCase(deleteBookmarkAsync.rejected, (state, action) => {
      state.delete_bookmark_status = ASYNC_STATUS.ERROR;
      state.delete_bookmark_error = action.payload as string;
      showErrorToast(action.payload as string);
    });

    // =========>>>>>>> socialNetworkTypesAsync
    builder.addCase(socialNetworkTypesAsync.pending, state => {
      state.social_network_types_status = ASYNC_STATUS.LOADING;
    });
    builder.addCase(
      socialNetworkTypesAsync.fulfilled,
      (state, { payload }: PayloadAction<SocialNetworkTypesResponse>) => {
        state.social_network_types_status = ASYNC_STATUS.SUCCEEDED;
        state.social_network_types_data = payload;
      },
    );
    builder.addCase(socialNetworkTypesAsync.rejected, (state, action) => {
      state.social_network_types_status = ASYNC_STATUS.ERROR;
      state.social_network_types_error = action.payload as string;
      showErrorToast(action.payload as string);
    });

    // =========>>>>>>> socialNetworkSetupAsync
    builder.addCase(socialNetworkSetupAsync.pending, state => {
      state.social_network_setup_status = ASYNC_STATUS.LOADING;
    });
    builder.addCase(
      socialNetworkSetupAsync.fulfilled,
      (state, { payload }: PayloadAction<SocialNetworkSetupResponse>) => {
        state.social_network_setup_status = ASYNC_STATUS.SUCCEEDED;
        state.social_network_setup_data = payload;
        showSuccessToast(
          payload?.message || 'Social network added successfully',
        );
      },
    );
    builder.addCase(socialNetworkSetupAsync.rejected, (state, action) => {
      state.social_network_setup_status = ASYNC_STATUS.ERROR;
      state.social_network_setup_error = action.payload as string;
      showErrorToast(action.payload as string);
    });

    // =========>>>>>>> updateSocialNetworkSetupAsync
    builder.addCase(updateSocialNetworkSetupAsync.pending, state => {
      state.update_social_network_setup_status = ASYNC_STATUS.LOADING;
    });
    builder.addCase(
      updateSocialNetworkSetupAsync.fulfilled,
      (state, { payload }: PayloadAction<SocialNetworkSetupResponse>) => {
        state.update_social_network_setup_status = ASYNC_STATUS.SUCCEEDED;
        state.update_social_network_setup_data = payload;
        showSuccessToast(
          payload?.message || 'Social network updated successfully',
        );
      },
    );
    builder.addCase(updateSocialNetworkSetupAsync.rejected, (state, action) => {
      state.update_social_network_setup_status = ASYNC_STATUS.ERROR;
      state.update_social_network_setup_error = action.payload as string;
      showErrorToast(action.payload as string);
    });

    // User Social Networks GET handlers
    builder.addCase(userSocialNetworksAsync.pending, state => {
      state.user_social_networks_status = ASYNC_STATUS.LOADING;
    });
    builder.addCase(
      userSocialNetworksAsync.fulfilled,
      (state, { payload }: PayloadAction<UserSocialNetworksResponse>) => {
        state.user_social_networks_status = ASYNC_STATUS.SUCCEEDED;
        state.user_social_networks_data = payload;
      },
    );
    builder.addCase(userSocialNetworksAsync.rejected, (state, action) => {
      state.user_social_networks_status = ASYNC_STATUS.ERROR;
      state.user_social_networks_error = action.payload as string;
      showErrorToast(action.payload as string);
    });

    // =========>>>>>>> deleteSocialNetworkSetupAsync
    builder.addCase(deleteSocialNetworkSetupAsync.pending, state => {
      state.social_network_setup_status = ASYNC_STATUS.LOADING;
    });
    builder.addCase(
      deleteSocialNetworkSetupAsync.fulfilled,
      (state, { payload }: PayloadAction<DeleteSocialNetworkResponse>) => {
        state.social_network_setup_status = ASYNC_STATUS.SUCCEEDED;
        showSuccessToast(
          payload?.message || 'Social network deleted successfully',
        );
      },
    );
    builder.addCase(deleteSocialNetworkSetupAsync.rejected, (state, action) => {
      state.social_network_setup_status = ASYNC_STATUS.ERROR;
      state.social_network_setup_error = action.payload as string;
      showErrorToast(action.payload as string);
    });

    // =========>>>>>>> Legal Documents CRUD Handlers

    // Get Legal Documents GET handlers
    builder.addCase(legalDocumentsAsync.pending, state => {
      state.legal_documents_status = ASYNC_STATUS.LOADING;
    });
    builder.addCase(legalDocumentsAsync.fulfilled, (state, { payload }) => {
      state.legal_documents_status = ASYNC_STATUS.SUCCEEDED;
      state.legal_documents_data = payload;
    });
    builder.addCase(legalDocumentsAsync.rejected, (state, action) => {
      state.legal_documents_status = ASYNC_STATUS.ERROR;
      state.legal_documents_error = action.payload as string;
      showErrorToast(action.payload as string);
    });

    // Create Legal Document POST handlers
    builder.addCase(createLegalDocumentAsync.pending, state => {
      state.create_legal_document_status = ASYNC_STATUS.LOADING;
    });
    builder.addCase(
      createLegalDocumentAsync.fulfilled,
      (state, { payload }) => {
        state.create_legal_document_status = ASYNC_STATUS.SUCCEEDED;
        state.create_legal_document_data = payload;
        showSuccessToast(
          payload?.message || 'Legal document created successfully',
        );
      },
    );
    builder.addCase(createLegalDocumentAsync.rejected, (state, action) => {
      state.create_legal_document_status = ASYNC_STATUS.ERROR;
      state.create_legal_document_error = action.payload as string;
      showErrorToast(action.payload as string);
    });

    // Update Legal Document PUT handlers
    builder.addCase(updateLegalDocumentAsync.pending, state => {
      state.update_legal_document_status = ASYNC_STATUS.LOADING;
    });
    builder.addCase(
      updateLegalDocumentAsync.fulfilled,
      (state, { payload }) => {
        state.update_legal_document_status = ASYNC_STATUS.SUCCEEDED;
        state.update_legal_document_data = payload;
        showSuccessToast(
          payload?.message || 'Legal document updated successfully',
        );
      },
    );
    builder.addCase(updateLegalDocumentAsync.rejected, (state, action) => {
      state.update_legal_document_status = ASYNC_STATUS.ERROR;
      state.update_legal_document_error = action.payload as string;
      showErrorToast(action.payload as string);
    });

    // Delete Legal Document DELETE handlers
    builder.addCase(deleteLegalDocumentAsync.pending, state => {
      state.delete_legal_document_status = ASYNC_STATUS.LOADING;
    });
    builder.addCase(
      deleteLegalDocumentAsync.fulfilled,
      (state, { payload }) => {
        state.delete_legal_document_status = ASYNC_STATUS.SUCCEEDED;
        state.delete_legal_document_data = payload;
        showSuccessToast(
          payload?.message || 'Legal document deleted successfully',
        );
      },
    );
    builder.addCase(deleteLegalDocumentAsync.rejected, (state, action) => {
      state.delete_legal_document_status = ASYNC_STATUS.ERROR;
      state.delete_legal_document_error = action.payload as string;
      showErrorToast(action.payload as string);
    });

    // ==================== Subscriptions Handlers ====================

    // Subscriptions GET handlers
    builder.addCase(subscriptionsAsync.pending, state => {
      state.subscriptions_status = ASYNC_STATUS.LOADING;
    });
    builder.addCase(subscriptionsAsync.fulfilled, (state, { payload }) => {
      state.subscriptions_status = ASYNC_STATUS.SUCCEEDED;
      state.subscriptions_data = payload || payload;
    });
    builder.addCase(subscriptionsAsync.rejected, (state, action) => {
      state.subscriptions_status = ASYNC_STATUS.ERROR;
      state.subscriptions_error = action.payload as string;
      showErrorToast(action.payload as string);
    });

    // Create Subscription POST handlers
    builder.addCase(createSubscriptionAsync.pending, state => {
      state.create_subscription_status = ASYNC_STATUS.LOADING;
    });
    builder.addCase(createSubscriptionAsync.fulfilled, (state, { payload }) => {
      state.create_subscription_status = ASYNC_STATUS.SUCCEEDED;
      state.create_subscription_data = payload;
      showSuccessToast(payload?.message || 'Subscription created successfully');
    });
    builder.addCase(createSubscriptionAsync.rejected, (state, action) => {
      state.create_subscription_status = ASYNC_STATUS.ERROR;
      state.create_subscription_error = action.payload as string;
      showErrorToast(action.payload as string);
    });

    // Update Subscription PUT handlers
    builder.addCase(updateSubscriptionAsync.pending, state => {
      state.update_subscription_status = ASYNC_STATUS.LOADING;
    });
    builder.addCase(updateSubscriptionAsync.fulfilled, (state, { payload }) => {
      state.update_subscription_status = ASYNC_STATUS.SUCCEEDED;
      state.update_subscription_data = payload;
      showSuccessToast(payload?.message || 'Subscription updated successfully');
    });
    builder.addCase(updateSubscriptionAsync.rejected, (state, action) => {
      state.update_subscription_status = ASYNC_STATUS.ERROR;
      state.update_subscription_error = action.payload as string;
      showErrorToast(action.payload as string);
    });

    // Delete Subscription DELETE handlers
    builder.addCase(deleteSubscriptionAsync.pending, state => {
      state.delete_subscription_status = ASYNC_STATUS.LOADING;
    });
    builder.addCase(deleteSubscriptionAsync.fulfilled, (state, { payload }) => {
      state.delete_subscription_status = ASYNC_STATUS.SUCCEEDED;
      state.delete_subscription_data = payload;
      showSuccessToast(payload?.message || 'Subscription deleted successfully');
    });
    builder.addCase(deleteSubscriptionAsync.rejected, (state, action) => {
      state.delete_subscription_status = ASYNC_STATUS.ERROR;
      state.delete_subscription_error = action.payload as string;
      showErrorToast(action.payload as string);
    });

    // ==================== Health Tracker - Children Handlers ====================

    // Get Children GET handlers
    builder.addCase(getChildrenAsync.pending, state => {
      state.get_children_status = ASYNC_STATUS.LOADING;
    });
    builder.addCase(getChildrenAsync.fulfilled, (state, { payload }) => {
      state.get_children_status = ASYNC_STATUS.SUCCEEDED;
      state.get_children_data = payload;
    });
    builder.addCase(getChildrenAsync.rejected, (state, action) => {
      state.get_children_status = ASYNC_STATUS.ERROR;
      state.get_children_error = action.payload as string;
      console.log('Testing Is error from there')
    });

    // Get Children (as caregiver) GET handlers
    builder.addCase(getChildrenAsCaregiverAsync.pending, state => {
      state.get_children_as_caregiver_status = ASYNC_STATUS.LOADING;
    });
    builder.addCase(getChildrenAsCaregiverAsync.fulfilled, (state, { payload }) => {
      state.get_children_as_caregiver_status = ASYNC_STATUS.SUCCEEDED;
      state.get_children_as_caregiver_data = payload;
    });
    builder.addCase(getChildrenAsCaregiverAsync.rejected, (state, action) => {
      state.get_children_as_caregiver_status = ASYNC_STATUS.ERROR;
      state.get_children_as_caregiver_error = action.payload as string;
    });

    // Get Child By ID GET handlers
    builder.addCase(getChildByIdAsync.pending, state => {
      state.get_child_by_id_status = ASYNC_STATUS.LOADING;
    });
    builder.addCase(getChildByIdAsync.fulfilled, (state, { payload }) => {
      state.get_child_by_id_status = ASYNC_STATUS.SUCCEEDED;
      state.get_child_by_id_data = payload;
    });
    builder.addCase(getChildByIdAsync.rejected, (state, action) => {
      state.get_child_by_id_status = ASYNC_STATUS.ERROR;
      state.get_child_by_id_error = action.payload as string;
      if (!(action.meta?.arg as any)?.silentError) {
        showErrorToast(action.payload as string);
      }
    });

    // Add Child POST handlers
    builder.addCase(addChildAsync.pending, state => {
      state.add_child_status = ASYNC_STATUS.LOADING;
    });
    builder.addCase(addChildAsync.fulfilled, (state, { payload }) => {
      state.add_child_status = ASYNC_STATUS.SUCCEEDED;
      state.add_child_data = payload;
      showSuccessToast(payload?.message || 'Child added successfully');
    });
    builder.addCase(addChildAsync.rejected, (state, action) => {
      state.add_child_status = ASYNC_STATUS.ERROR;
      state.add_child_error = action.payload as string;
      showErrorToast(action.payload as string);
    });

    // Update Child PUT handlers
    builder.addCase(updateChildAsync.pending, state => {
      state.update_child_status = ASYNC_STATUS.LOADING;
    });
    builder.addCase(updateChildAsync.fulfilled, (state, { payload }) => {
      state.update_child_status = ASYNC_STATUS.SUCCEEDED;
      state.update_child_data = payload;
      showSuccessToast(payload?.message || 'Child updated successfully');
    });
    builder.addCase(updateChildAsync.rejected, (state, action) => {
      state.update_child_status = ASYNC_STATUS.ERROR;
      state.update_child_error = action.payload as string;
      showErrorToast(action.payload as string);
    });

    // Delete Child DELETE handlers
    builder.addCase(deleteChildAsync.pending, state => {
      state.delete_child_status = ASYNC_STATUS.LOADING;
    });
    builder.addCase(deleteChildAsync.fulfilled, (state, { payload }) => {
      state.delete_child_status = ASYNC_STATUS.SUCCEEDED;
      state.delete_child_data = payload;
      showSuccessToast(payload?.message || 'Child deleted successfully');
    });
    builder.addCase(deleteChildAsync.rejected, (state, action) => {
      state.delete_child_status = ASYNC_STATUS.ERROR;
      state.delete_child_error = action.payload as string;
      showErrorToast(action.payload as string);
    });

    // ==================== Health Tracker - Child Medications Handlers ====================

    // Add Child Medication POST handlers
    builder.addCase(addChildMedicationAsync.pending, state => {
      state.add_child_medication_status = ASYNC_STATUS.LOADING;
    });
    builder.addCase(addChildMedicationAsync.fulfilled, (state, { payload }) => {
      state.add_child_medication_status = ASYNC_STATUS.SUCCEEDED;
      state.add_child_medication_data = payload;
      showSuccessToast(payload?.message || 'Medication added successfully');
    });
    builder.addCase(addChildMedicationAsync.rejected, (state, action) => {
      state.add_child_medication_status = ASYNC_STATUS.ERROR;
      state.add_child_medication_error = action.payload as string;
      showErrorToast(action.payload as string);
    });

    // ==================== Health Tracker - Child Doctors Handlers ====================

    // Get Child Doctors GET handlers
    builder.addCase(getChildDoctorsAsync.pending, state => {
      state.get_child_doctors_status = ASYNC_STATUS.LOADING;
    });
    builder.addCase(getChildDoctorsAsync.fulfilled, (state, { payload }) => {
      state.get_child_doctors_status = ASYNC_STATUS.SUCCEEDED;
      state.get_child_doctors_data = payload;
    });
    builder.addCase(getChildDoctorsAsync.rejected, (state, action) => {
      state.get_child_doctors_status = ASYNC_STATUS.ERROR;
      state.get_child_doctors_error = action.payload as string;
      showErrorToast(action.payload as string);
    });

    // Add Child Doctor POST handlers
    builder.addCase(addChildDoctorAsync.pending, state => {
      state.add_child_doctor_status = ASYNC_STATUS.LOADING;
    });
    builder.addCase(addChildDoctorAsync.fulfilled, (state, { payload }) => {
      state.add_child_doctor_status = ASYNC_STATUS.SUCCEEDED;
      state.add_child_doctor_data = payload;
      showSuccessToast(payload?.message || 'Doctor added successfully');
    });
    builder.addCase(addChildDoctorAsync.rejected, (state, action) => {
      state.add_child_doctor_status = ASYNC_STATUS.ERROR;
      state.add_child_doctor_error = action.payload as string;
      showErrorToast(action.payload as string);
    });

    // Get Child Doctor By ID GET handlers
    builder.addCase(getChildDoctorByIdAsync.pending, state => {
      state.get_child_doctor_by_id_status = ASYNC_STATUS.LOADING;
    });
    builder.addCase(getChildDoctorByIdAsync.fulfilled, (state, { payload }) => {
      state.get_child_doctor_by_id_status = ASYNC_STATUS.SUCCEEDED;
      state.get_child_doctor_by_id_data = payload;
    });
    builder.addCase(getChildDoctorByIdAsync.rejected, (state, action) => {
      state.get_child_doctor_by_id_status = ASYNC_STATUS.ERROR;
      state.get_child_doctor_by_id_error = action.payload as string;
      showErrorToast(action.payload as string);
    });

    // Update Child Doctor PUT handlers
    builder.addCase(updateChildDoctorAsync.pending, state => {
      state.update_child_doctor_status = ASYNC_STATUS.LOADING;
    });
    builder.addCase(updateChildDoctorAsync.fulfilled, (state, { payload }) => {
      state.update_child_doctor_status = ASYNC_STATUS.SUCCEEDED;
      state.update_child_doctor_data = payload;
      showSuccessToast(payload?.message || 'Doctor updated successfully');
    });
    builder.addCase(updateChildDoctorAsync.rejected, (state, action) => {
      state.update_child_doctor_status = ASYNC_STATUS.ERROR;
      state.update_child_doctor_error = action.payload as string;
      showErrorToast(action.payload as string);
    });

    // ==================== Health Tracker - Child Caregivers Handlers ====================

    // Add Child Caregiver POST handlers
    builder.addCase(addChildCaregiverAsync.pending, state => {
      state.add_child_caregiver_status = ASYNC_STATUS.LOADING;
    });
    builder.addCase(addChildCaregiverAsync.fulfilled, (state, { payload }) => {
      state.add_child_caregiver_status = ASYNC_STATUS.SUCCEEDED;
      state.add_child_caregiver_data = payload;
      showSuccessToast(payload?.message || 'Caregiver added successfully');
    });
    builder.addCase(addChildCaregiverAsync.rejected, (state, action) => {
      state.add_child_caregiver_status = ASYNC_STATUS.ERROR;
      state.add_child_caregiver_error = action.payload as string;
      showErrorToast(action.payload as string);
    });

    // Update Child Caregiver PUT handlers
    builder.addCase(updateChildCaregiverAsync.pending, state => {
      state.update_child_caregiver_status = ASYNC_STATUS.LOADING;
    });
    builder.addCase(
      updateChildCaregiverAsync.fulfilled,
      (state, { payload }) => {
        state.update_child_caregiver_status = ASYNC_STATUS.SUCCEEDED;
        state.update_child_caregiver_data = payload;
        showSuccessToast(payload?.message || 'Caregiver updated successfully');
      },
    );
    builder.addCase(updateChildCaregiverAsync.rejected, (state, action) => {
      state.update_child_caregiver_status = ASYNC_STATUS.ERROR;
      state.update_child_caregiver_error = action.payload as string;
      showErrorToast(action.payload as string);
    });

    // Update Child Medication PUT handlers
    builder.addCase(updateChildMedicationAsync.pending, state => {
      state.update_child_medication_status = ASYNC_STATUS.LOADING;
    });
    builder.addCase(
      updateChildMedicationAsync.fulfilled,
      (state, { payload }) => {
        state.update_child_medication_status = ASYNC_STATUS.SUCCEEDED;
        state.update_child_medication_data = payload;
        showSuccessToast(payload?.message || 'Medication updated successfully');
      },
    );
    builder.addCase(updateChildMedicationAsync.rejected, (state, action) => {
      state.update_child_medication_status = ASYNC_STATUS.ERROR;
      state.update_child_medication_error = action.payload as string;
      showErrorToast(action.payload as string);
    });

    // ==================== Health Tracker - Child Appointments Handlers ====================

    // Add Child Appointment POST handlers
    builder.addCase(addChildAppointmentAsync.pending, state => {
      state.add_child_appointment_status = ASYNC_STATUS.LOADING;
    });
    builder.addCase(
      addChildAppointmentAsync.fulfilled,
      (state, { payload }) => {
        state.add_child_appointment_status = ASYNC_STATUS.SUCCEEDED;
        state.add_child_appointment_data = payload;
        showSuccessToast(payload?.message || 'Appointment added successfully');
      },
    );
    builder.addCase(addChildAppointmentAsync.rejected, (state, action) => {
      state.add_child_appointment_status = ASYNC_STATUS.ERROR;
      state.add_child_appointment_error = action.payload as string;
      showErrorToast(action.payload as string);
    });

    // Update Child Appointment PUT handlers
    builder.addCase(updateChildAppointmentAsync.pending, state => {
      state.update_child_appointment_status = ASYNC_STATUS.LOADING;
    });
    builder.addCase(
      updateChildAppointmentAsync.fulfilled,
      (state, { payload }) => {
        state.update_child_appointment_status = ASYNC_STATUS.SUCCEEDED;
        state.update_child_appointment_data = payload;
        showSuccessToast(
          payload?.message || 'Appointment updated successfully',
        );
      },
    );
    builder.addCase(updateChildAppointmentAsync.rejected, (state, action) => {
      state.update_child_appointment_status = ASYNC_STATUS.ERROR;
      state.update_child_appointment_error = action.payload as string;
      showErrorToast(action.payload as string);
    });

    // Delete Child Appointment DELETE handlers
    builder.addCase(deleteChildAppointmentAsync.pending, state => {
      state.delete_child_appointment_status = ASYNC_STATUS.LOADING;
    });
    builder.addCase(
      deleteChildAppointmentAsync.fulfilled,
      (state, { payload }) => {
        state.delete_child_appointment_status = ASYNC_STATUS.SUCCEEDED;
        state.delete_child_appointment_data = payload;
        showSuccessToast(
          payload?.message || 'Appointment deleted successfully',
        );
      },
    );
    builder.addCase(deleteChildAppointmentAsync.rejected, (state, action) => {
      state.delete_child_appointment_status = ASYNC_STATUS.ERROR;
      state.delete_child_appointment_error = action.payload as string;
      showErrorToast(action.payload as string);
    });

    // Delete Child Caregiver DELETE handlers
    builder.addCase(deleteChildCaregiverAsync.pending, state => {
      state.delete_child_caregiver_status = ASYNC_STATUS.LOADING;
    });
    builder.addCase(
      deleteChildCaregiverAsync.fulfilled,
      (state, { payload }) => {
        state.delete_child_caregiver_status = ASYNC_STATUS.SUCCEEDED;
        state.delete_child_caregiver_data = payload;
        showSuccessToast(payload?.message || 'Caregiver deleted successfully');
      },
    );
    builder.addCase(deleteChildCaregiverAsync.rejected, (state, action) => {
      state.delete_child_caregiver_status = ASYNC_STATUS.ERROR;
      state.delete_child_caregiver_error = action.payload as string;
      showErrorToast(action.payload as string);
    });

    // Delete Child Doctor DELETE handlers
    builder.addCase(deleteChildDoctorAsync.pending, state => {
      state.delete_child_doctor_status = ASYNC_STATUS.LOADING;
    });
    builder.addCase(deleteChildDoctorAsync.fulfilled, (state, { payload }) => {
      state.delete_child_doctor_status = ASYNC_STATUS.SUCCEEDED;
      state.delete_child_doctor_data = payload;
      showSuccessToast(payload?.message || 'Doctor deleted successfully');
    });
    builder.addCase(deleteChildDoctorAsync.rejected, (state, action) => {
      state.delete_child_doctor_status = ASYNC_STATUS.ERROR;
      state.delete_child_doctor_error = action.payload as string;
      showErrorToast(action.payload as string);
    });

    // Delete Child Medication DELETE handlers
    builder.addCase(deleteChildMedicationAsync.pending, state => {
      state.delete_child_medication_status = ASYNC_STATUS.LOADING;
    });
    builder.addCase(
      deleteChildMedicationAsync.fulfilled,
      (state, { payload }) => {
        state.delete_child_medication_status = ASYNC_STATUS.SUCCEEDED;
        state.delete_child_medication_data = payload;
        showSuccessToast(payload?.message || 'Medication deleted successfully');
      },
    );
    builder.addCase(deleteChildMedicationAsync.rejected, (state, action) => {
      state.delete_child_medication_status = ASYNC_STATUS.ERROR;
      state.delete_child_medication_error = action.payload as string;
      showErrorToast(action.payload as string);
    });

    // ==================== Wallet GET handlers ====================

    builder.addCase(walletAsync.pending, state => {
      state.wallet_status = ASYNC_STATUS.LOADING;
    });
    builder.addCase(walletAsync.fulfilled, (state, { payload }) => {
      state.wallet_status = ASYNC_STATUS.SUCCEEDED;
      state.wallet_data = payload?.data || payload;
    });
    builder.addCase(walletAsync.rejected, (state, action) => {
      state.wallet_status = ASYNC_STATUS.ERROR;
      state.wallet_error = action.payload as string;
      showErrorToast(action.payload as string);
    });

    // ==================== Wallet Toggle handlers ====================

    builder.addCase(walletToggleAsync.pending, state => {
      state.wallet_toggle_status = ASYNC_STATUS.LOADING;
    });
    builder.addCase(walletToggleAsync.fulfilled, (state, { payload }) => {
      state.wallet_toggle_status = ASYNC_STATUS.SUCCEEDED;
      showSuccessToast(payload?.message || 'Wallet updated');
    });
    builder.addCase(walletToggleAsync.rejected, (state, action) => {
      state.wallet_toggle_status = ASYNC_STATUS.ERROR;
      state.wallet_toggle_error = action.payload as string;
      showErrorToast(action.payload as string);
    });

    // ==================== Get Pets GET handlers ====================

    builder.addCase(getPetsAsync.pending, state => {
      state.get_pets_status = ASYNC_STATUS.LOADING;
    });
    builder.addCase(getPetsAsync.fulfilled, (state, { payload }) => {
      state.get_pets_status = ASYNC_STATUS.SUCCEEDED;
      state.get_pets_data = payload;
    });
    builder.addCase(getPetsAsync.rejected, (state, action) => {
      state.get_pets_status = ASYNC_STATUS.ERROR;
      state.get_pets_error = action.payload as string;
      showErrorToast(action.payload as string);
    });

    // ==================== Add Pet POST handlers ====================

    builder.addCase(addPetAsync.pending, state => {
      state.add_pet_status = ASYNC_STATUS.LOADING;
    });
    builder.addCase(addPetAsync.fulfilled, (state, { payload }) => {
      state.add_pet_status = ASYNC_STATUS.SUCCEEDED;
      state.add_pet_data = payload;
      showSuccessToast(payload?.message || 'Pet added successfully');
    });
    builder.addCase(addPetAsync.rejected, (state, action) => {
      state.add_pet_status = ASYNC_STATUS.ERROR;
      state.add_pet_error = action.payload as string;
      showErrorToast(action.payload as string);
    });

    // ==================== Edit Pet PUT handlers ====================

    builder.addCase(editPetAsync.pending, state => {
      state.edit_pet_status = ASYNC_STATUS.LOADING;
    });
    builder.addCase(editPetAsync.fulfilled, (state, { payload }) => {
      state.edit_pet_status = ASYNC_STATUS.SUCCEEDED;
      state.edit_pet_data = payload;
      showSuccessToast(payload?.message || 'Pet updated successfully');
    });
    builder.addCase(editPetAsync.rejected, (state, action) => {
      state.edit_pet_status = ASYNC_STATUS.ERROR;
      state.edit_pet_error = action.payload as string;
      showErrorToast(action.payload as string);
    });

    // ==================== Delete Pet DELETE handlers ====================

    builder.addCase(deletePetAsync.pending, state => {
      state.delete_pet_status = ASYNC_STATUS.LOADING;
    });
    builder.addCase(deletePetAsync.fulfilled, (state, { payload }) => {
      state.delete_pet_status = ASYNC_STATUS.SUCCEEDED;
      state.delete_pet_data = payload;
      showSuccessToast(payload?.message || 'Pet deleted successfully');
    });
    builder.addCase(deletePetAsync.rejected, (state, action) => {
      state.delete_pet_status = ASYNC_STATUS.ERROR;
      state.delete_pet_error = action.payload as string;
      showErrorToast(action.payload as string);
    });

    // ==================== Add Pet Vaccination POST handlers ====================

    builder.addCase(addPetVaccinationAsync.pending, state => {
      state.add_pet_vaccination_status = ASYNC_STATUS.LOADING;
    });
    builder.addCase(addPetVaccinationAsync.fulfilled, (state, { payload }) => {
      state.add_pet_vaccination_status = ASYNC_STATUS.SUCCEEDED;
      state.add_pet_vaccination_data = payload;
      showSuccessToast(payload?.message || 'Vaccination added successfully');
    });
    builder.addCase(addPetVaccinationAsync.rejected, (state, action) => {
      state.add_pet_vaccination_status = ASYNC_STATUS.ERROR;
      state.add_pet_vaccination_error = action.payload as string;
      showErrorToast(action.payload as string);
    });

    // ==================== Edit Pet Vaccination PUT handlers ====================

    builder.addCase(editPetVaccinationAsync.pending, state => {
      state.edit_pet_vaccination_status = ASYNC_STATUS.LOADING;
    });
    builder.addCase(editPetVaccinationAsync.fulfilled, (state, { payload }) => {
      state.edit_pet_vaccination_status = ASYNC_STATUS.SUCCEEDED;
      state.edit_pet_vaccination_data = payload;
      showSuccessToast(payload?.message || 'Vaccination updated successfully');
    });
    builder.addCase(editPetVaccinationAsync.rejected, (state, action) => {
      state.edit_pet_vaccination_status = ASYNC_STATUS.ERROR;
      state.edit_pet_vaccination_error = action.payload as string;
      showErrorToast(action.payload as string);
    });

    // ==================== Delete Pet Vaccination DELETE handlers ====================

    builder.addCase(deletePetVaccinationAsync.pending, state => {
      state.delete_pet_vaccination_status = ASYNC_STATUS.LOADING;
    });
    builder.addCase(
      deletePetVaccinationAsync.fulfilled,
      (state, { payload }) => {
        state.delete_pet_vaccination_status = ASYNC_STATUS.SUCCEEDED;
        state.delete_pet_vaccination_data = payload;
        showSuccessToast(
          payload?.message || 'Vaccination deleted successfully',
        );
      },
    );
    builder.addCase(deletePetVaccinationAsync.rejected, (state, action) => {
      state.delete_pet_vaccination_status = ASYNC_STATUS.ERROR;
      state.delete_pet_vaccination_error = action.payload as string;
      showErrorToast(action.payload as string);
    });

    // ==================== Add Pet Medication POST handlers ====================

    builder.addCase(addPetMedicationAsync.pending, state => {
      state.add_pet_medication_status = ASYNC_STATUS.LOADING;
    });
    builder.addCase(addPetMedicationAsync.fulfilled, (state, { payload }) => {
      state.add_pet_medication_status = ASYNC_STATUS.SUCCEEDED;
      state.add_pet_medication_data = payload;
      showSuccessToast(payload?.message || 'Medication added successfully');
    });
    builder.addCase(addPetMedicationAsync.rejected, (state, action) => {
      state.add_pet_medication_status = ASYNC_STATUS.ERROR;
      state.add_pet_medication_error = action.payload as string;
      showErrorToast(action.payload as string);
    });

    // ==================== Edit Pet Medication PUT handlers ====================

    builder.addCase(editPetMedicationAsync.pending, state => {
      state.edit_pet_medication_status = ASYNC_STATUS.LOADING;
    });
    builder.addCase(editPetMedicationAsync.fulfilled, (state, { payload }) => {
      state.edit_pet_medication_status = ASYNC_STATUS.SUCCEEDED;
      state.edit_pet_medication_data = payload;
      showSuccessToast(payload?.message || 'Medication updated successfully');
    });
    builder.addCase(editPetMedicationAsync.rejected, (state, action) => {
      state.edit_pet_medication_status = ASYNC_STATUS.ERROR;
      state.edit_pet_medication_error = action.payload as string;
      showErrorToast(action.payload as string);
    });

    // ==================== Delete Pet Medication DELETE handlers ====================

    builder.addCase(deletePetMedicationAsync.pending, state => {
      state.delete_pet_medication_status = ASYNC_STATUS.LOADING;
    });
    builder.addCase(
      deletePetMedicationAsync.fulfilled,
      (state, { payload }) => {
        state.delete_pet_medication_status = ASYNC_STATUS.SUCCEEDED;
        state.delete_pet_medication_data = payload;
        showSuccessToast(payload?.message || 'Medication deleted successfully');
      },
    );
    builder.addCase(deletePetMedicationAsync.rejected, (state, action) => {
      state.delete_pet_medication_status = ASYNC_STATUS.ERROR;
      state.delete_pet_medication_error = action.payload as string;
      showErrorToast(action.payload as string);
    });

    // ==================== Add Pet Vet Appointment POST handlers ====================

    builder.addCase(addPetVetAppointmentAsync.pending, state => {
      state.add_pet_vet_appointment_status = ASYNC_STATUS.LOADING;
    });
    builder.addCase(
      addPetVetAppointmentAsync.fulfilled,
      (state, { payload }) => {
        state.add_pet_vet_appointment_status = ASYNC_STATUS.SUCCEEDED;
        state.add_pet_vet_appointment_data = payload;
        showSuccessToast(
          payload?.message || 'Vet appointment added successfully',
        );
      },
    );
    builder.addCase(addPetVetAppointmentAsync.rejected, (state, action) => {
      state.add_pet_vet_appointment_status = ASYNC_STATUS.ERROR;
      state.add_pet_vet_appointment_error = action.payload as string;
      showErrorToast(action.payload as string);
    });

    // ==================== Edit Pet Vet Appointment PUT handlers ====================

    builder.addCase(editPetVetAppointmentAsync.pending, state => {
      state.edit_pet_vet_appointment_status = ASYNC_STATUS.LOADING;
    });
    builder.addCase(
      editPetVetAppointmentAsync.fulfilled,
      (state, { payload }) => {
        state.edit_pet_vet_appointment_status = ASYNC_STATUS.SUCCEEDED;
        state.edit_pet_vet_appointment_data = payload;
        showSuccessToast(
          payload?.message || 'Vet appointment updated successfully',
        );
      },
    );
    builder.addCase(editPetVetAppointmentAsync.rejected, (state, action) => {
      state.edit_pet_vet_appointment_status = ASYNC_STATUS.ERROR;
      state.edit_pet_vet_appointment_error = action.payload as string;
      showErrorToast(action.payload as string);
    });

    // ==================== Delete Pet Vet Appointment DELETE handlers ====================

    builder.addCase(deletePetVetAppointmentAsync.pending, state => {
      state.delete_pet_vet_appointment_status = ASYNC_STATUS.LOADING;
    });
    builder.addCase(
      deletePetVetAppointmentAsync.fulfilled,
      (state, { payload }) => {
        state.delete_pet_vet_appointment_status = ASYNC_STATUS.SUCCEEDED;
        state.delete_pet_vet_appointment_data = payload;
        showSuccessToast(
          payload?.message || 'Vet appointment deleted successfully',
        );
      },
    );
    builder.addCase(deletePetVetAppointmentAsync.rejected, (state, action) => {
      state.delete_pet_vet_appointment_status = ASYNC_STATUS.ERROR;
      state.delete_pet_vet_appointment_error = action.payload as string;
      showErrorToast(action.payload as string);
    });

    // ==================== Add Pet Illness POST handlers ====================

    builder.addCase(addPetIllnessAsync.pending, state => {
      state.add_pet_illness_status = ASYNC_STATUS.LOADING;
    });
    builder.addCase(addPetIllnessAsync.fulfilled, (state, { payload }) => {
      state.add_pet_illness_status = ASYNC_STATUS.SUCCEEDED;
      state.add_pet_illness_data = payload;
      showSuccessToast(payload?.message || 'Illness added successfully');
    });
    builder.addCase(addPetIllnessAsync.rejected, (state, action) => {
      state.add_pet_illness_status = ASYNC_STATUS.ERROR;
      state.add_pet_illness_error = action.payload as string;
      showErrorToast(action.payload as string);
    });

    // ==================== Edit Pet Illness PUT handlers ====================

    builder.addCase(editPetIllnessAsync.pending, state => {
      state.edit_pet_illness_status = ASYNC_STATUS.LOADING;
    });
    builder.addCase(editPetIllnessAsync.fulfilled, (state, { payload }) => {
      state.edit_pet_illness_status = ASYNC_STATUS.SUCCEEDED;
      state.edit_pet_illness_data = payload;
      showSuccessToast(payload?.message || 'Illness updated successfully');
    });
    builder.addCase(editPetIllnessAsync.rejected, (state, action) => {
      state.edit_pet_illness_status = ASYNC_STATUS.ERROR;
      state.edit_pet_illness_error = action.payload as string;
      showErrorToast(action.payload as string);
    });

    // ==================== Delete Pet Illness DELETE handlers ====================

    builder.addCase(deletePetIllnessAsync.pending, state => {
      state.delete_pet_illness_status = ASYNC_STATUS.LOADING;
    });
    builder.addCase(deletePetIllnessAsync.fulfilled, (state, { payload }) => {
      state.delete_pet_illness_status = ASYNC_STATUS.SUCCEEDED;
      state.delete_pet_illness_data = payload;
      showSuccessToast(payload?.message || 'Illness deleted successfully');
    });
    builder.addCase(deletePetIllnessAsync.rejected, (state, action) => {
      state.delete_pet_illness_status = ASYNC_STATUS.ERROR;
      state.delete_pet_illness_error = action.payload as string;
      showErrorToast(action.payload as string);
    });

    // ====================  App Tabs GET handlers ====================

    builder.addCase(getAppTabsAsync.pending, state => {
      state.get_app_tabs_status = ASYNC_STATUS.LOADING;
    });
    builder.addCase(getAppTabsAsync.fulfilled, (state, { payload }) => {
      state.get_app_tabs_status = ASYNC_STATUS.SUCCEEDED;
      state.get_app_tabs_data =
        payload?.tabcategories || payload?.data || payload || null;
    });
    builder.addCase(getAppTabsAsync.rejected, (state, action) => {
      state.get_app_tabs_status = ASYNC_STATUS.ERROR;
      state.get_app_tabs_error = action.payload as string;
      showErrorToast(action.payload as string);
    });

    // ====================  Get Favorite Tabs GET handlers ====================

    builder.addCase(getFavoriteTabsAsync.pending, state => {
      state.get_favorite_tabs_status = ASYNC_STATUS.LOADING;
    });
    builder.addCase(getFavoriteTabsAsync.fulfilled, (state, { payload }) => {
      state.get_favorite_tabs_status = ASYNC_STATUS.SUCCEEDED;
      const raw: ApiAppTab[] = Array.isArray(payload) ? payload : payload?.data ?? [];
      // Apply user-defined order if we have one saved
      if (state.favorite_tab_order && state.favorite_tab_order.length > 0) {
        const orderMap = new Map(state.favorite_tab_order.map((id, idx) => [id, idx]));
        state.get_favorite_tabs_data = [...raw].sort(
          (a, b) =>
            (orderMap.get(String(a.id)) ?? 999) -
            (orderMap.get(String(b.id)) ?? 999),
        );
      } else {
        state.get_favorite_tabs_data = raw;
      }
    });
    builder.addCase(getFavoriteTabsAsync.rejected, (state, action) => {
      state.get_favorite_tabs_status = ASYNC_STATUS.ERROR;
      state.get_favorite_tabs_error = action.payload as string;
    });

    // ====================  Add Favorite Tab POST handlers ====================

    builder.addCase(addFavoriteTabAsync.pending, state => {
      state.add_favorite_tab_status = ASYNC_STATUS.LOADING;
    });
    builder.addCase(addFavoriteTabAsync.fulfilled, (state, { payload }) => {
      state.add_favorite_tab_status = ASYNC_STATUS.SUCCEEDED;
      state.add_favorite_tab_data = payload;
    });
    builder.addCase(addFavoriteTabAsync.rejected, (state, action) => {
      state.add_favorite_tab_status = ASYNC_STATUS.ERROR;
      state.add_favorite_tab_error = action.payload as string;
      showErrorToast(action.payload as string);
    });

    // ====================  Delete Favorite Tab DELETE handlers ====================

    builder.addCase(deleteFavoriteTabAsync.pending, state => {
      state.delete_favorite_tab_status = ASYNC_STATUS.LOADING;
    });
    builder.addCase(deleteFavoriteTabAsync.fulfilled, (state, { payload }) => {
      state.delete_favorite_tab_status = ASYNC_STATUS.SUCCEEDED;
      state.delete_favorite_tab_data = payload;
    });
    builder.addCase(deleteFavoriteTabAsync.rejected, (state, action) => {
      state.delete_favorite_tab_status = ASYNC_STATUS.ERROR;
      state.delete_favorite_tab_error = action.payload as string;
      showErrorToast(action.payload as string);
    });
  },
});

export const {
  setCreateLegalDocumentStatus,
  setUpdateLegalDocumentStatus,
  setEditDoctoreStatus,
  setUpdateAppointmentStatus,
  setAddPetStatus,
  setDeletePetStatus,
  setCreateBookmarkStatus,
  setUpdateBookmarkStatus,
  setAddSocialMediaStatus,
  setUpdateSocialMediaStatus,
  setFavoriteTabOrder,
} = essentialsSlice.actions;
export default essentialsSlice.reducer;
