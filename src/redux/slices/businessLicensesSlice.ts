import { createSlice } from '@reduxjs/toolkit';
import {
  showErrorToast,
  showSuccessToast,
} from '../../components/common';
import {
  getBusinessLicensesAsync,
  getBusinessLicenseByIdAsync,
  addBusinessLicenseAsync,
  updateBusinessLicenseAsync,
  deleteBusinessLicenseAsync,
  getComplianceFoldersAsync,
  getComplianceFolderByIdAsync,
  addComplianceFolderAsync,
  updateComplianceFolderAsync,
  deleteComplianceFolderAsync,
  getComplianceRecordsAsync,
  getComplianceRecordByIdAsync,
  addComplianceRecordAsync,
  updateComplianceRecordAsync,
  deleteComplianceRecordAsync,
} from '../services/businessLicensesService';
import { ASYNC_STATUS } from '../../config/constants';
import {
  BusinessLicensesState,
  BusinessLicenseItemAPI,
  BusinessLicenseItem,
  ComplianceFolderItemAPI,
  ComplianceFolderItem,
  ComplianceRecordItemAPI,
  ComplianceRecordItem,
} from '../../types/reduxTypes/businessLicensesSlice.types';


// Transform API response to app format
const transformLicenseFromAPI = (apiLicense: BusinessLicenseItemAPI): BusinessLicenseItem => ({
  id: apiLicense.id,
  businessId: apiLicense.businessid,
  vendorProvider: apiLicense.vendorprovider,
  product: apiLicense.product,
  plan: apiLicense.plan,
  seats: apiLicense.seats,
  renewalDate: apiLicense.renewaldate,
  autoRenew: apiLicense.autorenew,
  cost: apiLicense.cost,
  period: apiLicense.period,
  licenseKey: apiLicense.licensekey,
  notes: apiLicense.notes,
  username: apiLicense.username,
  password: apiLicense.password,
  createdAt: apiLicense.createdat,
  updatedAt: apiLicense.updatedat,
  licenseKind: apiLicense.licensekind || 'software',
  licenseNumber: apiLicense.licensenumber ?? null,
  state: apiLicense.state ?? null,
  jurisdiction: apiLicense.jurisdiction ?? null,
  holderName: apiLicense.holdername ?? null,
  status: apiLicense.status ?? null,
  issueDate: apiLicense.issuedate ?? null,
  location: apiLicense.location ?? null,
});

const transformFolderFromAPI = (apiFolder: ComplianceFolderItemAPI): ComplianceFolderItem => ({
  id: apiFolder.id,
  businessId: apiFolder.businessid,
  folderName: apiFolder.foldername,
  description: apiFolder.description,
  color: apiFolder.color,
  sortOrder: apiFolder.sortorder,
  createdAt: apiFolder.createdat,
  updatedAt: apiFolder.updatedat,
  complianceRecords: Array.isArray(apiFolder.compliancerecords)
    ? apiFolder.compliancerecords.map(transformRecordFromAPI)
    : undefined,
  accesslevel: apiFolder.accesslevel,
  ismoduleaccess: apiFolder.ismoduleaccess,
});

const transformRecordFromAPI = (apiRecord: ComplianceRecordItemAPI): ComplianceRecordItem => ({
  id: apiRecord.id,
  businessId: apiRecord.businessid,
  complianceFolderId: apiRecord.compliancefolderid,
  title: apiRecord.title,
  type: apiRecord.type,
  status: apiRecord.status,
  dueDate: apiRecord.duedate,
  notes: apiRecord.notes,
  documentUrl: apiRecord.documenturl,
  createdAt: apiRecord.createdat,
  updatedAt: apiRecord.updatedat,
  accesslevel: apiRecord.accesslevel,
  ismoduleaccess: apiRecord.ismoduleaccess,
});

const initialState: BusinessLicensesState = {
  // Get business licenses (list)
  get_business_licenses_status: ASYNC_STATUS.IDLE,
  get_business_licenses_data: null,
  get_business_licenses_error: null,

  // Get business license by ID
  get_business_license_status: ASYNC_STATUS.IDLE,
  get_business_license_data: null,
  get_business_license_error: null,

  // Add business license
  add_business_license_status: ASYNC_STATUS.IDLE,
  add_business_license_data: null,
  add_business_license_error: null,

  // Update business license
  update_business_license_status: ASYNC_STATUS.IDLE,
  update_business_license_data: null,
  update_business_license_error: null,

  // Delete business license
  delete_business_license_status: ASYNC_STATUS.IDLE,
  delete_business_license_data: null,
  delete_business_license_error: null,

  // Get compliance folders (list)
  get_compliance_folders_status: ASYNC_STATUS.IDLE,
  get_compliance_folders_data: null,
  get_compliance_folders_error: null,

  // Get compliance folder by ID
  get_compliance_folder_status: ASYNC_STATUS.IDLE,
  get_compliance_folder_data: null,
  get_compliance_folder_error: null,

  // Add compliance folder
  add_compliance_folder_status: ASYNC_STATUS.IDLE,
  add_compliance_folder_data: null,
  add_compliance_folder_error: null,

  // Update compliance folder
  update_compliance_folder_status: ASYNC_STATUS.IDLE,
  update_compliance_folder_data: null,
  update_compliance_folder_error: null,

  // Delete compliance folder
  delete_compliance_folder_status: ASYNC_STATUS.IDLE,
  delete_compliance_folder_data: null,
  delete_compliance_folder_error: null,

  // Get compliance records (list)
  get_compliance_records_status: ASYNC_STATUS.IDLE,
  get_compliance_records_data: null,
  get_compliance_records_error: null,

  // Get compliance record by ID
  get_compliance_record_status: ASYNC_STATUS.IDLE,
  get_compliance_record_data: null,
  get_compliance_record_error: null,

  // Add compliance record
  add_compliance_record_status: ASYNC_STATUS.IDLE,
  add_compliance_record_data: null,
  add_compliance_record_error: null,

  // Update compliance record
  update_compliance_record_status: ASYNC_STATUS.IDLE,
  update_compliance_record_data: null,
  update_compliance_record_error: null,

  // Delete compliance record
  delete_compliance_record_status: ASYNC_STATUS.IDLE,
  delete_compliance_record_data: null,
  delete_compliance_record_error: null,
};

const businessLicensesSlice = createSlice({
  name: 'businessLicenses',
  initialState,
  reducers: {
    resetAddBusinessLicenseStatus: (state) => {
      state.add_business_license_status = ASYNC_STATUS.IDLE;
    },
    resetUpdateBusinessLicenseStatus: (state) => {
      state.update_business_license_status = ASYNC_STATUS.IDLE;
    },
    resetDeleteBusinessLicenseStatus: (state) => {
      state.delete_business_license_status = ASYNC_STATUS.IDLE;
    },
    resetAddComplianceFolderStatus: (state) => {
      state.add_compliance_folder_status = ASYNC_STATUS.IDLE;
    },
    resetUpdateComplianceFolderStatus: (state) => {
      state.update_compliance_folder_status = ASYNC_STATUS.IDLE;
    },
    resetDeleteComplianceFolderStatus: (state) => {
      state.delete_compliance_folder_status = ASYNC_STATUS.IDLE;
    },
    resetAddComplianceRecordStatus: (state) => {
      state.add_compliance_record_status = ASYNC_STATUS.IDLE;
    },
    resetUpdateComplianceRecordStatus: (state) => {
      state.update_compliance_record_status = ASYNC_STATUS.IDLE;
    },
    resetDeleteComplianceRecordStatus: (state) => {
      state.delete_compliance_record_status = ASYNC_STATUS.IDLE;
    },
  },
  extraReducers: (builder) => {
    // =========>>>>>>> Get Business Licenses
    builder.addCase(getBusinessLicensesAsync.pending, (state) => {
      state.get_business_licenses_status = ASYNC_STATUS.LOADING;
      state.get_business_licenses_error = null;
    });
    builder.addCase(getBusinessLicensesAsync.fulfilled, (state, { payload }) => {
      state.get_business_licenses_status = ASYNC_STATUS.SUCCEEDED;
      // Transform API data to app format
      const transformedData = Array.isArray(payload)
        ? payload.map(transformLicenseFromAPI)
        : [];
      state.get_business_licenses_data = transformedData;
      state.get_business_licenses_error = null;
    });
    builder.addCase(getBusinessLicensesAsync.rejected, (state, action) => {
      state.get_business_licenses_status = ASYNC_STATUS.ERROR;
      state.get_business_licenses_error = action.payload as string;
      showErrorToast(action.payload as string);
    });

    // =========>>>>>>> Get Business License by ID
    builder.addCase(getBusinessLicenseByIdAsync.pending, (state) => {
      state.get_business_license_status = ASYNC_STATUS.LOADING;
      state.get_business_license_error = null;
    });
    builder.addCase(getBusinessLicenseByIdAsync.fulfilled, (state, { payload }) => {
      state.get_business_license_status = ASYNC_STATUS.SUCCEEDED;
      // Transform API data to app format if data exists
      const transformedData = payload ? transformLicenseFromAPI(payload as any) : null;
      state.get_business_license_data = transformedData;
    });
    builder.addCase(getBusinessLicenseByIdAsync.rejected, (state, action) => {
      state.get_business_license_status = ASYNC_STATUS.ERROR;
      state.get_business_license_error = action.payload as string;
      showErrorToast(action.payload as string);
    });

    // =========>>>>>>> Add Business License
    builder.addCase(addBusinessLicenseAsync.pending, (state) => {
      state.add_business_license_status = ASYNC_STATUS.LOADING;
      state.add_business_license_error = null;
    });
    builder.addCase(addBusinessLicenseAsync.fulfilled, (state, { payload }) => {
      state.add_business_license_status = ASYNC_STATUS.SUCCEEDED;
      const transformedData = payload?.data ? transformLicenseFromAPI(payload.data as any) : null;
      state.add_business_license_data = transformedData;
      state.add_business_license_error = null;

      // Add the new license to the list
      if (transformedData) {
        if (Array.isArray(state.get_business_licenses_data)) {
          state.get_business_licenses_data = [
            ...state.get_business_licenses_data,
            transformedData,
          ];
        } else {
          state.get_business_licenses_data = [transformedData];
        }
      }

      showSuccessToast(payload?.message || 'Business license added successfully');
    });
    builder.addCase(addBusinessLicenseAsync.rejected, (state, action) => {
      state.add_business_license_status = ASYNC_STATUS.ERROR;
      state.add_business_license_error = action.payload as string;
      showErrorToast(action.payload as string);
    });

    // =========>>>>>>> Update Business License
    builder.addCase(updateBusinessLicenseAsync.pending, (state) => {
      state.update_business_license_status = ASYNC_STATUS.LOADING;
      state.update_business_license_error = null;
    });
    builder.addCase(updateBusinessLicenseAsync.fulfilled, (state, { payload }) => {
      state.update_business_license_status = ASYNC_STATUS.SUCCEEDED;
      const transformedData = payload?.data ? transformLicenseFromAPI(payload.data as any) : null;
      state.update_business_license_data = transformedData;
      state.update_business_license_error = null;

      // Update the license in the list
      if (transformedData && Array.isArray(state.get_business_licenses_data)) {
        state.get_business_licenses_data = state.get_business_licenses_data.map((license: any) =>
          license?.id === transformedData.id ? transformedData : license
        );
      }

      showSuccessToast(payload?.message || 'Business license updated successfully');
    });
    builder.addCase(updateBusinessLicenseAsync.rejected, (state, action) => {
      state.update_business_license_status = ASYNC_STATUS.ERROR;
      state.update_business_license_error = action.payload as string;
      showErrorToast(action.payload as string);
    });

    // =========>>>>>>> Delete Business License
    builder.addCase(deleteBusinessLicenseAsync.pending, (state) => {
      state.delete_business_license_status = ASYNC_STATUS.LOADING;
      state.delete_business_license_error = null;
    });
    builder.addCase(deleteBusinessLicenseAsync.fulfilled, (state, { payload }) => {
      state.delete_business_license_status = ASYNC_STATUS.SUCCEEDED;
      // Only store minimal serializable data (no headers or non-serializable objects)
      const delete_business_license_data = payload || {};
      state.delete_business_license_error = null;

      // Remove the deleted license from the list
      if (payload.deletedId && Array.isArray(state.get_business_licenses_data)) {
        state.get_business_licenses_data = state.get_business_licenses_data.filter(
          (license:any) => license?.id !== payload.deletedId
        );
      }

      showSuccessToast(payload.message || 'Business license deleted successfully');
    });
    builder.addCase(deleteBusinessLicenseAsync.rejected, (state, action) => {
      state.delete_business_license_status = ASYNC_STATUS.ERROR;
      state.delete_business_license_error = action.payload as string;
      showErrorToast(action.payload as string);
    });

    // =========>>>>>>> Get Compliance Folders
    builder.addCase(getComplianceFoldersAsync.pending, (state) => {
      state.get_compliance_folders_status = ASYNC_STATUS.LOADING;
      state.get_compliance_folders_error = null;
    });
    builder.addCase(getComplianceFoldersAsync.fulfilled, (state, { payload }) => {
      state.get_compliance_folders_status = ASYNC_STATUS.SUCCEEDED;
      // Transform API data to app format
      const transformedData = Array.isArray(payload)
        ? payload.map(transformFolderFromAPI)
        : [];
      state.get_compliance_folders_data = transformedData;
      state.get_compliance_folders_error = null;
    });
    builder.addCase(getComplianceFoldersAsync.rejected, (state, action) => {
      state.get_compliance_folders_status = ASYNC_STATUS.ERROR;
      state.get_compliance_folders_error = action.payload as string;
      showErrorToast(action.payload as string);
    });

    // =========>>>>>>> Get Compliance Folder by ID
    builder.addCase(getComplianceFolderByIdAsync.pending, (state) => {
      state.get_compliance_folder_status = ASYNC_STATUS.LOADING;
      state.get_compliance_folder_error = null;
    });
    builder.addCase(getComplianceFolderByIdAsync.fulfilled, (state, { payload }) => {
      state.get_compliance_folder_status = ASYNC_STATUS.SUCCEEDED;
      // Transform API data to app format if data exists
      const transformedData = payload ? transformFolderFromAPI(payload as any) : null;
      state.get_compliance_folder_data = transformedData;
    });
    builder.addCase(getComplianceFolderByIdAsync.rejected, (state, action) => {
      state.get_compliance_folder_status = ASYNC_STATUS.ERROR;
      state.get_compliance_folder_error = action.payload as string;
      showErrorToast(action.payload as string);
    });

    // =========>>>>>>> Add Compliance Folder
    builder.addCase(addComplianceFolderAsync.pending, (state) => {
      state.add_compliance_folder_status = ASYNC_STATUS.LOADING;
      state.add_compliance_folder_error = null;
    });
    builder.addCase(addComplianceFolderAsync.fulfilled, (state, { payload }) => {
      state.add_compliance_folder_status = ASYNC_STATUS.SUCCEEDED;
      const transformedData = payload?.data ? transformFolderFromAPI(payload.data as any) : null;
      state.add_compliance_folder_data = transformedData;
      state.add_compliance_folder_error = null;

      // Add the new folder to the list
      if (transformedData) {
        if (Array.isArray(state.get_compliance_folders_data)) {
          state.get_compliance_folders_data = [
            ...state.get_compliance_folders_data,
            transformedData,
          ];
        } else {
          state.get_compliance_folders_data = [transformedData];
        }
      }

      showSuccessToast(payload?.message || 'Compliance folder added successfully');
    });
    builder.addCase(addComplianceFolderAsync.rejected, (state, action) => {
      state.add_compliance_folder_status = ASYNC_STATUS.ERROR;
      state.add_compliance_folder_error = action.payload as string;
      showErrorToast(action.payload as string);
    });

    // =========>>>>>>> Update Compliance Folder
    builder.addCase(updateComplianceFolderAsync.pending, (state) => {
      state.update_compliance_folder_status = ASYNC_STATUS.LOADING;
      state.update_compliance_folder_error = null;
    });
    builder.addCase(updateComplianceFolderAsync.fulfilled, (state, { payload }) => {
      state.update_compliance_folder_status = ASYNC_STATUS.SUCCEEDED;
      const transformedData = payload?.data ? transformFolderFromAPI(payload.data as any) : null;
      state.update_compliance_folder_data = transformedData;
      state.update_compliance_folder_error = null;

      // Update the folder in the list
      if (transformedData && Array.isArray(state.get_compliance_folders_data)) {
        state.get_compliance_folders_data = state.get_compliance_folders_data.map((folder:any) =>
          folder?.id === transformedData.id ? transformedData : folder
        );
      }

      showSuccessToast(payload?.message || 'Compliance folder updated successfully');
    });
    builder.addCase(updateComplianceFolderAsync.rejected, (state, action) => {
      state.update_compliance_folder_status = ASYNC_STATUS.ERROR;
      state.update_compliance_folder_error = action.payload as string;
      showErrorToast(action.payload as string);
    });

    // =========>>>>>>> Delete Compliance Folder
    builder.addCase(deleteComplianceFolderAsync.pending, (state) => {
      state.delete_compliance_folder_status = ASYNC_STATUS.LOADING;
      state.delete_compliance_folder_error = null;
    });
    builder.addCase(deleteComplianceFolderAsync.fulfilled, (state, { payload }) => {
      state.delete_compliance_folder_status = ASYNC_STATUS.SUCCEEDED;
      // Only store minimal serializable data (no headers or non-serializable objects)
      const delete_compliance_folder_data = payload || {};
      state.delete_compliance_folder_error = null;

      // Remove the deleted folder from the list
      if (payload.deletedId && Array.isArray(state.get_compliance_folders_data)) {
        state.get_compliance_folders_data = state.get_compliance_folders_data.filter(
          (folder:any) => folder?.id !== payload.deletedId
        );
      }

      showSuccessToast(payload.message || 'Compliance folder deleted successfully');
    });
    builder.addCase(deleteComplianceFolderAsync.rejected, (state, action) => {
      state.delete_compliance_folder_status = ASYNC_STATUS.ERROR;
      state.delete_compliance_folder_error = action.payload as string;
      showErrorToast(action.payload as string);
    });

    // =========>>>>>>> Get Compliance Records
    builder.addCase(getComplianceRecordsAsync.pending, (state) => {
      state.get_compliance_records_status = ASYNC_STATUS.LOADING;
      state.get_compliance_records_error = null;
    });
    builder.addCase(getComplianceRecordsAsync.fulfilled, (state, { payload }) => {
      state.get_compliance_records_status = ASYNC_STATUS.SUCCEEDED;
      const transformedData = Array.isArray(payload)
        ? payload.map(transformRecordFromAPI)
        : [];
      state.get_compliance_records_data = transformedData;
      state.get_compliance_records_error = null;
    });
    builder.addCase(getComplianceRecordsAsync.rejected, (state, action) => {
      state.get_compliance_records_status = ASYNC_STATUS.ERROR;
      state.get_compliance_records_error = action.payload as string;
      showErrorToast(action.payload as string);
    });

    // =========>>>>>>> Get Compliance Record by ID
    builder.addCase(getComplianceRecordByIdAsync.pending, (state) => {
      state.get_compliance_record_status = ASYNC_STATUS.LOADING;
      state.get_compliance_record_error = null;
    });
    builder.addCase(getComplianceRecordByIdAsync.fulfilled, (state, { payload }) => {
      state.get_compliance_record_status = ASYNC_STATUS.SUCCEEDED;
      const transformedData = payload ? transformRecordFromAPI(payload as any) : null;
      state.get_compliance_record_data = transformedData;
    });
    builder.addCase(getComplianceRecordByIdAsync.rejected, (state, action) => {
      state.get_compliance_record_status = ASYNC_STATUS.ERROR;
      state.get_compliance_record_error = action.payload as string;
      showErrorToast(action.payload as string);
    });

    // =========>>>>>>> Add Compliance Record
    builder.addCase(addComplianceRecordAsync.pending, (state) => {
      state.add_compliance_record_status = ASYNC_STATUS.LOADING;
      state.add_compliance_record_error = null;
    });
    builder.addCase(addComplianceRecordAsync.fulfilled, (state, { payload }) => {
      state.add_compliance_record_status = ASYNC_STATUS.SUCCEEDED;
      const transformedData = payload?.data ? transformRecordFromAPI(payload.data as any) : null;
      state.add_compliance_record_data = transformedData;
      state.add_compliance_record_error = null;
      if (transformedData) {
        if (Array.isArray(state.get_compliance_records_data)) {
          state.get_compliance_records_data = [...state.get_compliance_records_data, transformedData];
        } else {
          state.get_compliance_records_data = [transformedData];
        }
      }
      showSuccessToast(payload?.message || 'Compliance record added successfully');
    });
    builder.addCase(addComplianceRecordAsync.rejected, (state, action) => {
      state.add_compliance_record_status = ASYNC_STATUS.ERROR;
      state.add_compliance_record_error = action.payload as string;
      showErrorToast(action.payload as string);
    });

    // =========>>>>>>> Update Compliance Record
    builder.addCase(updateComplianceRecordAsync.pending, (state) => {
      state.update_compliance_record_status = ASYNC_STATUS.LOADING;
      state.update_compliance_record_error = null;
    });
    builder.addCase(updateComplianceRecordAsync.fulfilled, (state, { payload }) => {
      state.update_compliance_record_status = ASYNC_STATUS.SUCCEEDED;
      const transformedData = payload?.data ? transformRecordFromAPI(payload.data as any) : null;
      state.update_compliance_record_data = transformedData;
      state.update_compliance_record_error = null;
      if (transformedData && Array.isArray(state.get_compliance_records_data)) {
        state.get_compliance_records_data = state.get_compliance_records_data.map((record: any) =>
          record?.id === transformedData.id ? transformedData : record
        );
      }
      showSuccessToast(payload?.message || 'Compliance record updated successfully');
    });
    builder.addCase(updateComplianceRecordAsync.rejected, (state, action) => {
      state.update_compliance_record_status = ASYNC_STATUS.ERROR;
      state.update_compliance_record_error = action.payload as string;
      showErrorToast(action.payload as string);
    });

    // =========>>>>>>> Delete Compliance Record
    builder.addCase(deleteComplianceRecordAsync.pending, (state) => {
      state.delete_compliance_record_status = ASYNC_STATUS.LOADING;
      state.delete_compliance_record_error = null;
    });
    builder.addCase(deleteComplianceRecordAsync.fulfilled, (state, { payload }) => {
      state.delete_compliance_record_status = ASYNC_STATUS.SUCCEEDED;
      state.delete_compliance_record_error = null;
      if (payload.deletedId && Array.isArray(state.get_compliance_records_data)) {
        state.get_compliance_records_data = state.get_compliance_records_data.filter(
          (record: any) => record?.id !== payload.deletedId
        );
      }
      showSuccessToast(payload.message || 'Compliance record deleted successfully');
    });
    builder.addCase(deleteComplianceRecordAsync.rejected, (state, action) => {
      state.delete_compliance_record_status = ASYNC_STATUS.ERROR;
      state.delete_compliance_record_error = action.payload as string;
      showErrorToast(action.payload as string);
    });
  },
});

export const {
  resetAddBusinessLicenseStatus,
  resetUpdateBusinessLicenseStatus,
  resetDeleteBusinessLicenseStatus,
  resetAddComplianceFolderStatus,
  resetUpdateComplianceFolderStatus,
  resetDeleteComplianceFolderStatus,
  resetAddComplianceRecordStatus,
  resetUpdateComplianceRecordStatus,
  resetDeleteComplianceRecordStatus,
} = businessLicensesSlice.actions;

export default businessLicensesSlice.reducer;
