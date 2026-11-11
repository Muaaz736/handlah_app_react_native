import { createSlice } from '@reduxjs/toolkit';
import {
  showErrorToast,
  showSuccessToast,
} from '../../components/common';
import {
  getBusinessContactsAsync,
  addBusinessContactAsync,
  updateBusinessContactAsync,
  deleteBusinessContactAsync,
} from '../services/businessContactsService';
import { ASYNC_STATUS } from '../../config/constants';
import { 
  BusinessContactsState, 
  BusinessContactItemAPI, 
  BusinessContactItem 
} from '../../types/reduxTypes/businessContactsSlice.types';

// Transform API response to app format
const transformContactFromAPI = (apiContact: BusinessContactItemAPI): BusinessContactItem => ({
  id: apiContact.id,
  businessId: apiContact.businessid,
  businessName: apiContact.businessname,
  fullName: apiContact.fullname,
  role: apiContact.role,
  companyTeam: apiContact.companyteam,
  status: apiContact.status,
  emailAddress: apiContact.emailaddress,
  phoneNumber: apiContact.phonenumber,
  manager: apiContact.manager,
  location: apiContact.location,
  tags: apiContact.tags,
  contactType: apiContact.contacttype,
  isPrimary: apiContact.isprimary,
  isReference: apiContact.isreference,
  createdAt: apiContact.createdat,
  updatedAt: apiContact.updatedat,
});

const initialState: BusinessContactsState = {
  // Get business contacts
  get_business_contacts_status: ASYNC_STATUS.IDLE,
  get_business_contacts_data: null,
  get_business_contacts_error: null,

  // Add business contact
  add_business_contact_status: ASYNC_STATUS.IDLE,
  add_business_contact_data: null,
  add_business_contact_error: null,

  // Update business contact
  update_business_contact_status: ASYNC_STATUS.IDLE,
  update_business_contact_data: null,
  update_business_contact_error: null,

  // Delete business contact
  delete_business_contact_status: ASYNC_STATUS.IDLE,
  delete_business_contact_data: null,
  delete_business_contact_error: null,
};

const businessContactsSlice = createSlice({
  name: 'businessContacts',
  initialState,
  reducers: {
    resetAddBusinessContactStatus: (state) => {
      state.add_business_contact_status = ASYNC_STATUS.IDLE;
      state.add_business_contact_error = null;
    },
    resetUpdateBusinessContactStatus: (state) => {
      state.update_business_contact_status = ASYNC_STATUS.IDLE;
      state.update_business_contact_error = null;
    },
    resetDeleteBusinessContactStatus: (state) => {
      state.delete_business_contact_status = ASYNC_STATUS.IDLE;
      state.delete_business_contact_error = null;
    },
  },
  extraReducers: (builder) => {
    // =========>>>>>>> Get Business Contacts
    builder.addCase(getBusinessContactsAsync.pending, (state) => {
      state.get_business_contacts_status = ASYNC_STATUS.LOADING;
      state.get_business_contacts_error = null;
    });
    builder.addCase(getBusinessContactsAsync.fulfilled, (state, { payload }) => {
      state.get_business_contacts_status = ASYNC_STATUS.SUCCEEDED;
      // Transform API data to app format
      const transformedData = Array.isArray(payload) 
        ? payload.map(transformContactFromAPI) 
        : [];
      state.get_business_contacts_data = transformedData;
      state.get_business_contacts_error = null;
    });
    builder.addCase(getBusinessContactsAsync.rejected, (state, action) => {
      state.get_business_contacts_status = ASYNC_STATUS.ERROR;
      state.get_business_contacts_error = action.payload as string;
      showErrorToast(action.payload as string);
    });

    // =========>>>>>>> Add Business Contact
    builder.addCase(addBusinessContactAsync.pending, (state) => {
      state.add_business_contact_status = ASYNC_STATUS.LOADING;
      state.add_business_contact_error = null;
    });
    builder.addCase(addBusinessContactAsync.fulfilled, (state, { payload }) => {
      state.add_business_contact_status = ASYNC_STATUS.SUCCEEDED;
      const transformedData = payload?.data ? transformContactFromAPI(payload.data as any) : null;
      state.add_business_contact_data = transformedData;
      state.add_business_contact_error = null;

      // Add the new contact to the list
      if (transformedData) {
        if (Array.isArray(state.get_business_contacts_data)) {
          state.get_business_contacts_data = [
            ...state.get_business_contacts_data,
            transformedData,
          ];
        } else {
          state.get_business_contacts_data = [transformedData];
        }
      }

      showSuccessToast(payload?.message || 'Business contact added successfully');
    });
    builder.addCase(addBusinessContactAsync.rejected, (state, action) => {
      state.add_business_contact_status = ASYNC_STATUS.ERROR;
      state.add_business_contact_error = action.payload as string;
      showErrorToast(action.payload as string);
    });

    // =========>>>>>>> Update Business Contact
    builder.addCase(updateBusinessContactAsync.pending, (state) => {
      state.update_business_contact_status = ASYNC_STATUS.LOADING;
      state.update_business_contact_error = null;
    });
    builder.addCase(updateBusinessContactAsync.fulfilled, (state, { payload }) => {
      state.update_business_contact_status = ASYNC_STATUS.SUCCEEDED;
      const transformedData = payload?.data ? transformContactFromAPI(payload.data as any) : null;
      state.update_business_contact_data = transformedData;
      state.update_business_contact_error = null;

      // Update the contact in the list
      if (transformedData && Array.isArray(state.get_business_contacts_data)) {
        state.get_business_contacts_data = state.get_business_contacts_data.map((contact) =>
          contact?.id === transformedData.id ? transformedData : contact
        );
      }

      showSuccessToast(payload?.message || 'Business contact updated successfully');
    });
    builder.addCase(updateBusinessContactAsync.rejected, (state, action) => {
      state.update_business_contact_status = ASYNC_STATUS.ERROR;
      state.update_business_contact_error = action.payload as string;
      showErrorToast(action.payload as string);
    });

    // =========>>>>>>> Delete Business Contact
    builder.addCase(deleteBusinessContactAsync.pending, (state) => {
      state.delete_business_contact_status = ASYNC_STATUS.LOADING;
      state.delete_business_contact_error = null;
    });
    builder.addCase(deleteBusinessContactAsync.fulfilled, (state, { payload }) => {
      state.delete_business_contact_status = ASYNC_STATUS.SUCCEEDED;
      state.delete_business_contact_data = payload || null;
      state.delete_business_contact_error = null;

      // Remove the deleted contact from the list
      if (payload?.deletedId && Array.isArray(state.get_business_contacts_data)) {
        state.get_business_contacts_data = state.get_business_contacts_data.filter(
          (contact) => contact?.id !== payload.deletedId
        );
      }

      showSuccessToast(payload?.message || 'Business contact deleted successfully');
    });
    builder.addCase(deleteBusinessContactAsync.rejected, (state, action) => {
      state.delete_business_contact_status = ASYNC_STATUS.ERROR;
      state.delete_business_contact_error = action.payload as string;
      showErrorToast(action.payload as string);
    });
  },
});

export const {
  resetAddBusinessContactStatus,
  resetUpdateBusinessContactStatus,
  resetDeleteBusinessContactStatus,
} = businessContactsSlice.actions;

export default businessContactsSlice.reducer;
