import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { showErrorToast, showSuccessToast } from '../../components/common';
import { ASYNC_STATUS } from '../../config/constants';
import {
  AssetsState,
} from '../../types/reduxTypes/assetsSlice.types';
import {
  addBankAccountAsync,
  addPersonalPropertyAsync,
  addRealStateInsuranceAsync,
  addRealStateLoanMortgageAsync,
  addRealStateOverviewAsync,
  addRealStatePersonalPropertyAsync,
  addRealStateServiceWorkHistoryAsync,
  addRealStateUtilitiesAsync,
  addRealStateWarrantiesAsync,
  addVehicleAccidentAsync,
  addVehicleAsync,
  addVehicleServiceRecordsBulkAsync,
  deleteBankAccountAsync,
  deletePersonalPropertyAsync,
  deleteRealStateInsuranceAsync,
  deleteRealStateLoanMortgageAsync,
  deleteRealStateOverviewAsync,
  deleteRealStatePersonalPropertyAsync,
  deleteRealStateServiceWorkHistoryAsync,
  deleteRealStateUtilitiesAsync,
  deleteRealStateWarrantiesAsync,
  deleteVehicleAccidentAsync,
  deleteVehicleAsync,
  deleteVehicleServiceRecordAsync,
  getBankAccountAsync,
  getBusinessPropertyAsync,
  getBusinessRealStateOverviewAsync,
  getBusinessVehiclesAsync,
  getPersonalPropertyAsync,
  getPersonalPropertyByIdAsync,
  getRealStateInsuranceAsync,
  getRealStateInsuranceByIdAsync,
  getRealStateLoanMortgageAsync,
  getRealStateLoanMortgageByIdAsync,
  getRealStateOverviewAsync,
  getRealStateOverviewByIdAsync,
  getRealStatePersonalPropertyAsync,
  getRealStatePersonalPropertyByIdAsync,
  getRealStateServiceWorkHistoryAsync,
  getRealStateServiceWorkHistoryByIdAsync,
  getRealStateUtilitiesAsync,
  getRealStateUtilitiesByIdAsync,
  getRealStateWarrantiesAsync,
  getRealStateWarrantiesByIdAsync,
  getVehicleAccidentsAsync,
  getVehicleByIdAsync,
  getVehiclesAsync,
  getVehicleServiceRecordsAsync,
  markVehicleAsSoldAsync,
  movePersonalPropertyAsync,
  shareVehicleAsync,
  getBusinessesByUsernameAsync,
  getIncomingVehicleTransfersAsync,
  acceptVehicleTransferAsync,
  rejectVehicleTransferAsync,
  updateBankAccountAsync,
  updatePersonalPropertyAsync,
  updateRealStateInsuranceAsync,
  updateRealStateLoanMortgageAsync,
  updateRealStateOverviewAsync,
  updateRealStatePersonalPropertyAsync,
  updateRealStateServiceWorkHistoryAsync,
  updateRealStateUtilitiesAsync,
  updateRealStateWarrantiesAsync,
  updateVehicleAccidentAsync,
  updateVehicleAsync,
  updateVehicleServiceRecordAsync,
  vehicleSaleTransferAsync,
  updateVehicleSaleTransferAsync,
} from '../services/assetsService';

const initialState: AssetsState = {
  add_bank_account_status: ASYNC_STATUS.IDLE,
  add_bank_account_data: null,
  add_bank_account_error: null,

  get_bank_account_status: ASYNC_STATUS.IDLE,
  get_bank_account_data: null,
  get_bank_account_error: null,

  update_bank_account_status: ASYNC_STATUS.IDLE,
  update_bank_account_data: null,
  update_bank_account_error: null,

  delete_bank_account_status: ASYNC_STATUS.IDLE,
  delete_bank_account_data: null,
  delete_bank_account_error: null,

  add_real_state_overview_status: ASYNC_STATUS.IDLE,
  add_real_state_overview_data: null,
  add_real_state_overview_error: null,

  get_real_state_overview_status: ASYNC_STATUS.IDLE,
  get_real_state_overview_data: null,
  get_real_state_overview_error: null,

  get_real_state_overview_by_id_status: ASYNC_STATUS.IDLE,
  get_real_state_overview_by_id_data: null,
  get_real_state_overview_by_id_error: null,

  update_real_state_overview_status: ASYNC_STATUS.IDLE,
  update_real_state_overview_data: null,
  update_real_state_overview_error: null,

  delete_real_state_overview_status: ASYNC_STATUS.IDLE,
  delete_real_state_overview_data: null,
  delete_real_state_overview_error: null,

  add_real_state_loan_mortgage_status: ASYNC_STATUS.IDLE,
  add_real_state_loan_mortgage_data: null,
  add_real_state_loan_mortgage_error: null,

  get_real_state_loan_mortgage_status: ASYNC_STATUS.IDLE,
  get_real_state_loan_mortgage_data: null,
  get_real_state_loan_mortgage_error: null,

  get_real_state_loan_mortgage_by_id_status: ASYNC_STATUS.IDLE,
  get_real_state_loan_mortgage_by_id_data: null,
  get_real_state_loan_mortgage_by_id_error: null,

  update_real_state_loan_mortgage_status: ASYNC_STATUS.IDLE,
  update_real_state_loan_mortgage_data: null,
  update_real_state_loan_mortgage_error: null,

  delete_real_state_loan_mortgage_status: ASYNC_STATUS.IDLE,
  delete_real_state_loan_mortgage_data: null,
  delete_real_state_loan_mortgage_error: null,

  // ====================  Real State Utilities API Initial States ====================
  add_real_state_utilities_status: ASYNC_STATUS.IDLE,
  add_real_state_utilities_data: null,
  add_real_state_utilities_error: null,

  get_real_state_utilities_status: ASYNC_STATUS.IDLE,
  get_real_state_utilities_data: null,
  get_real_state_utilities_error: null,

  get_real_state_utilities_by_id_status: ASYNC_STATUS.IDLE,
  get_real_state_utilities_by_id_data: null,
  get_real_state_utilities_by_id_error: null,

  update_real_state_utilities_status: ASYNC_STATUS.IDLE,
  update_real_state_utilities_data: null,
  update_real_state_utilities_error: null,

  delete_real_state_utilities_status: ASYNC_STATUS.IDLE,
  delete_real_state_utilities_data: null,
  delete_real_state_utilities_error: null,

  add_real_state_insurance_status: ASYNC_STATUS.IDLE,
  add_real_state_insurance_data: null,
  add_real_state_insurance_error: null,

  get_real_state_insurance_status: ASYNC_STATUS.IDLE,
  get_real_state_insurance_data: null,
  get_real_state_insurance_error: null,

  get_real_state_insurance_by_id_status: ASYNC_STATUS.IDLE,
  get_real_state_insurance_by_id_data: null,
  get_real_state_insurance_by_id_error: null,

  update_real_state_insurance_status: ASYNC_STATUS.IDLE,
  update_real_state_insurance_data: null,
  update_real_state_insurance_error: null,

  delete_real_state_insurance_status: ASYNC_STATUS.IDLE,
  delete_real_state_insurance_data: null,
  delete_real_state_insurance_error: null,

  add_real_state_warranties_status: ASYNC_STATUS.IDLE,
  add_real_state_warranties_data: null,
  add_real_state_warranties_error: null,

  get_real_state_warranties_status: ASYNC_STATUS.IDLE,
  get_real_state_warranties_data: null,
  get_real_state_warranties_error: null,

  get_real_state_warranties_by_id_status: ASYNC_STATUS.IDLE,
  get_real_state_warranties_by_id_data: null,
  get_real_state_warranties_by_id_error: null,

  update_real_state_warranties_status: ASYNC_STATUS.IDLE,
  update_real_state_warranties_data: null,
  update_real_state_warranties_error: null,

  delete_real_state_warranties_status: ASYNC_STATUS.IDLE,
  delete_real_state_warranties_data: null,
  delete_real_state_warranties_error: null,

  add_real_state_personal_property_status: ASYNC_STATUS.IDLE,
  add_real_state_personal_property_data: null,
  add_real_state_personal_property_error: null,

  get_real_state_personal_property_status: ASYNC_STATUS.IDLE,
  get_real_state_personal_property_data: null,
  get_real_state_personal_property_error: null,

  get_real_state_personal_property_by_id_status: ASYNC_STATUS.IDLE,
  get_real_state_personal_property_by_id_data: null,
  get_real_state_personal_property_by_id_error: null,

  update_real_state_personal_property_status: ASYNC_STATUS.IDLE,
  update_real_state_personal_property_data: null,
  update_real_state_personal_property_error: null,

  delete_real_state_personal_property_status: ASYNC_STATUS.IDLE,
  delete_real_state_personal_property_data: null,
  delete_real_state_personal_property_error: null,

  add_real_state_service_work_history_status: ASYNC_STATUS.IDLE,
  add_real_state_service_work_history_data: null,
  add_real_state_service_work_history_error: null,

  get_real_state_service_work_history_status: ASYNC_STATUS.IDLE,
  get_real_state_service_work_history_data: null,
  get_real_state_service_work_history_error: null,

  get_real_state_service_work_history_by_id_status: ASYNC_STATUS.IDLE,
  get_real_state_service_work_history_by_id_data: null,
  get_real_state_service_work_history_by_id_error: null,

  update_real_state_service_work_history_status: ASYNC_STATUS.IDLE,
  update_real_state_service_work_history_data: null,
  update_real_state_service_work_history_error: null,

  delete_real_state_service_work_history_status: ASYNC_STATUS.IDLE,
  delete_real_state_service_work_history_data: null,
  delete_real_state_service_work_history_error: null,

  add_personal_property_status: ASYNC_STATUS.IDLE,
  add_personal_property_data: null,
  add_personal_property_error: null,

  get_personal_property_status: ASYNC_STATUS.IDLE,
  get_personal_property_data: null,
  get_personal_property_error: null,

  get_personal_property_by_id_status: ASYNC_STATUS.IDLE,
  get_personal_property_by_id_data: null,
  get_personal_property_by_id_error: null,

  update_personal_property_status: ASYNC_STATUS.IDLE,
  update_personal_property_data: null,
  update_personal_property_error: null,

  delete_personal_property_status: ASYNC_STATUS.IDLE,
  delete_personal_property_data: null,
  delete_personal_property_error: null,

  move_personal_property_status: ASYNC_STATUS.IDLE,
  move_personal_property_data: null,
  move_personal_property_error: null,

  add_vehicle_status: ASYNC_STATUS.IDLE,
  add_vehicle_data: null,
  add_vehicle_error: null,

  get_vehicles_status: ASYNC_STATUS.IDLE,
  get_vehicles_data: null,
  get_vehicles_error: null,

  get_vehicle_by_id_status: ASYNC_STATUS.IDLE,
  get_vehicle_by_id_data: null,
  get_vehicle_by_id_error: null,

  update_vehicle_status: ASYNC_STATUS.IDLE,
  update_vehicle_data: null,
  update_vehicle_error: null,

  delete_vehicle_status: ASYNC_STATUS.IDLE,
  delete_vehicle_data: null,
  delete_vehicle_error: null,

  add_vehicle_service_records_bulk_status: ASYNC_STATUS.IDLE,
  add_vehicle_service_records_bulk_data: null,
  add_vehicle_service_records_bulk_error: null,

  get_vehicle_service_records_status: ASYNC_STATUS.IDLE,
  get_vehicle_service_records_data: null,
  get_vehicle_service_records_error: null,

  update_vehicle_service_record_status: ASYNC_STATUS.IDLE,
  update_vehicle_service_record_data: null,
  update_vehicle_service_record_error: null,

  delete_vehicle_service_record_status: ASYNC_STATUS.IDLE,
  delete_vehicle_service_record_data: null,
  delete_vehicle_service_record_error: null,

  add_vehicle_accidents_bulk_status: ASYNC_STATUS.IDLE,
  add_vehicle_accidents_bulk_data: null,
  add_vehicle_accidents_bulk_error: null,

  get_vehicle_accidents_status: ASYNC_STATUS.IDLE,
  get_vehicle_accidents_data: null,
  get_vehicle_accidents_error: null,

  update_vehicle_accident_status: ASYNC_STATUS.IDLE,
  update_vehicle_accident_data: null,
  update_vehicle_accident_error: null,

  delete_vehicle_accident_status: ASYNC_STATUS.IDLE,
  delete_vehicle_accident_data: null,
  delete_vehicle_accident_error: null,

  mark_vehicle_as_sold_status: ASYNC_STATUS.IDLE,
  mark_vehicle_as_sold_data: null,
  mark_vehicle_as_sold_error: null,

  share_vehicle_status: ASYNC_STATUS.IDLE,
  share_vehicle_data: null,
  share_vehicle_error: null,

  get_businesses_by_username_status: ASYNC_STATUS.IDLE,
  get_businesses_by_username_data: null,
  get_businesses_by_username_error: null,

  incoming_vehicle_transfers_status: ASYNC_STATUS.IDLE,
  incoming_vehicle_transfers_data: null,
  incoming_vehicle_transfers_error: null,

  accept_vehicle_transfer_status: ASYNC_STATUS.IDLE,
  accept_vehicle_transfer_data: null,
  accept_vehicle_transfer_error: null,

  reject_vehicle_transfer_status: ASYNC_STATUS.IDLE,
  reject_vehicle_transfer_data: null,
  reject_vehicle_transfer_error: null,

  vehicle_sale_transfer_status: ASYNC_STATUS.IDLE,
  vehicle_sale_transfer_data: null,
  vehicle_sale_transfer_error: null,

  update_vehicle_sale_transfer_status: ASYNC_STATUS.IDLE,
  update_vehicle_sale_transfer_data: null,
  update_vehicle_sale_transfer_error: null,
};

const assetsSlice = createSlice({
  name: 'assets_slice',
  initialState: initialState,
  reducers: {
    setAddRealStateOverviewStatus: state => {
      state.add_real_state_overview_status = ASYNC_STATUS.IDLE;
    },
    setUpdateRealStateOverviewStatus: state => {
      state.update_real_state_overview_status = ASYNC_STATUS.IDLE;
    },
    setDeleteRealStateOverviewStatus: state => {
      state.delete_real_state_overview_status = ASYNC_STATUS.IDLE;
    },
    setAddRealStateLoanMortgageStatus: state => {
      state.add_real_state_loan_mortgage_status = ASYNC_STATUS.IDLE;
    },
    setUpdateRealStateLoanMortgageStatus: state => {
      state.update_real_state_loan_mortgage_status = ASYNC_STATUS.IDLE;
    },
    setDeleteRealStateLoanMortgageStatus: state => {
      state.delete_real_state_loan_mortgage_status = ASYNC_STATUS.IDLE;
    },
    setAddRealStateUtilitiesStatus: state => {
      state.add_real_state_utilities_status = ASYNC_STATUS.IDLE;
    },
    setUpdateRealStateUtilitiesStatus: state => {
      state.update_real_state_utilities_status = ASYNC_STATUS.IDLE;
    },
    setDeleteRealStateUtilitiesStatus: state => {
      state.delete_real_state_utilities_status = ASYNC_STATUS.IDLE;
    },
    setAddRealStateInsuranceStatus: state => {
      state.add_real_state_insurance_status = ASYNC_STATUS.IDLE;
    },
    setUpdateRealStateInsuranceStatus: state => {
      state.update_real_state_insurance_status = ASYNC_STATUS.IDLE;
    },
    setDeleteRealStateInsuranceStatus: state => {
      state.delete_real_state_insurance_status = ASYNC_STATUS.IDLE;
    },
    setAddRealStateWarrantiesStatus: state => {
      state.add_real_state_warranties_status = ASYNC_STATUS.IDLE;
    },
    setUpdateRealStateWarrantiesStatus: state => {
      state.update_real_state_warranties_status = ASYNC_STATUS.IDLE;
    },
    setDeleteRealStateWarrantiesStatus: state => {
      state.delete_real_state_warranties_status = ASYNC_STATUS.IDLE;
    },
    setAddRealStatePersonalPropertyStatus: state => {
      state.add_real_state_personal_property_status = ASYNC_STATUS.IDLE;
    },
    setUpdateRealStatePersonalPropertyStatus: state => {
      state.update_real_state_personal_property_status = ASYNC_STATUS.IDLE;
    },
    setDeleteRealStatePersonalPropertyStatus: state => {
      state.delete_real_state_personal_property_status = ASYNC_STATUS.IDLE;
    },
    setAddRealStateServiceWorkHistoryStatus: state => {
      state.add_real_state_service_work_history_status = ASYNC_STATUS.IDLE;
    },
    setUpdateRealStateServiceWorkHistoryStatus: state => {
      state.update_real_state_service_work_history_status = ASYNC_STATUS.IDLE;
    },
    setDeleteRealStateServiceWorkHistoryStatus: state => {
      state.delete_real_state_service_work_history_status = ASYNC_STATUS.IDLE;
    },
    setAddPersonalPropertyStatus: state => {
      state.add_personal_property_status = ASYNC_STATUS.IDLE;
    },
    setGetPersonalPropertyStatus: state => {
      state.get_personal_property_status = ASYNC_STATUS.IDLE;
    },
    setGetPersonalPropertyByIdStatus: state => {
      state.get_personal_property_by_id_status = ASYNC_STATUS.IDLE;
    },
    setUpdatePersonalPropertyStatus: state => {
      state.update_personal_property_status = ASYNC_STATUS.IDLE;
    },
    setDeletePersonalPropertyStatus: state => {
      state.delete_personal_property_status = ASYNC_STATUS.IDLE;
    },
    setMovePersonalPropertyStatus: state => {
      state.move_personal_property_status = ASYNC_STATUS.IDLE;
    },
    setGetBankAccountStatus: state => {
      state.add_bank_account_status = ASYNC_STATUS.IDLE;
      state.update_bank_account_status = ASYNC_STATUS.IDLE;
    },
    setAddVehicleStatus: state => {
      state.add_vehicle_status = ASYNC_STATUS.IDLE;
    },
    setUpdateVehicleStatus: state => {
      state.update_vehicle_status = ASYNC_STATUS.IDLE;
    },
    setAddVehicleServiceRecordsStatus: state => {
      state.add_vehicle_service_records_bulk_status = ASYNC_STATUS.IDLE;
    },
    setUpdateVehicleServiceRecordsStatus: state => {
      state.update_vehicle_service_record_status = ASYNC_STATUS.IDLE;
    },
    setUpdateVehicleAccidentStatus: state => {
      state.update_vehicle_accident_status = ASYNC_STATUS.IDLE;
    },
    setAddVehicleAccidentStatus: state => {
      state.add_vehicle_accidents_bulk_status = ASYNC_STATUS.IDLE;
    },
    resetGetVehicleByIdData: state => {
      state.get_vehicle_by_id_data = null;
      state.get_vehicle_by_id_status = ASYNC_STATUS.IDLE;
      state.get_vehicle_by_id_error = null;
    },
    resetMarkVehicleAsSoldStatus: state => {
      state.mark_vehicle_as_sold_status = ASYNC_STATUS.IDLE;
      state.mark_vehicle_as_sold_data = null;
      state.mark_vehicle_as_sold_error = null;
    },
    resetShareVehicleStatus: state => {
      state.share_vehicle_status = ASYNC_STATUS.IDLE;
      state.share_vehicle_data = null;
      state.share_vehicle_error = null;
    },
    resetGetBusinessesByUsernameData: state => {
      state.get_businesses_by_username_status = ASYNC_STATUS.IDLE;
      state.get_businesses_by_username_data = null;
      state.get_businesses_by_username_error = null;
    },
    resetIncomingVehicleTransfersStatus: state => {
      state.incoming_vehicle_transfers_status = ASYNC_STATUS.IDLE;
      state.incoming_vehicle_transfers_data = null;
      state.incoming_vehicle_transfers_error = null;
    },
    resetAcceptVehicleTransferStatus: state => {
      state.accept_vehicle_transfer_status = ASYNC_STATUS.IDLE;
      state.accept_vehicle_transfer_data = null;
      state.accept_vehicle_transfer_error = null;
    },
    resetRejectVehicleTransferStatus: state => {
      state.reject_vehicle_transfer_status = ASYNC_STATUS.IDLE;
      state.reject_vehicle_transfer_data = null;
      state.reject_vehicle_transfer_error = null;
    },
    resetVehicleSaleTransferStatus: state => {
      state.vehicle_sale_transfer_status = ASYNC_STATUS.IDLE;
      state.vehicle_sale_transfer_data = null;
      state.vehicle_sale_transfer_error = null;
    },
    resetUpdateVehicleSaleTransferStatus: state => {
      state.update_vehicle_sale_transfer_status = ASYNC_STATUS.IDLE;
      state.update_vehicle_sale_transfer_data = null;
      state.update_vehicle_sale_transfer_error = null;
    }
  },
  extraReducers: builder => {
    // Add Bank Account handlers
    builder.addCase(addBankAccountAsync.pending, state => {
      state.add_bank_account_status = ASYNC_STATUS.LOADING;
    });
    builder.addCase(addBankAccountAsync.fulfilled, (state, { payload }) => {
      state.add_bank_account_status = ASYNC_STATUS.SUCCEEDED;
      state.add_bank_account_data = payload;
      showSuccessToast(payload?.message || 'Bank account added successfully');
    });
    builder.addCase(addBankAccountAsync.rejected, (state, action) => {
      state.add_bank_account_status = ASYNC_STATUS.ERROR;
      state.add_bank_account_error = action.payload as string;
      showErrorToast(action.payload as string);
    });
    // Get Bank Account handlers
    builder.addCase(getBankAccountAsync.pending, state => {
      state.get_bank_account_status = ASYNC_STATUS.LOADING;
    });
    builder.addCase(getBankAccountAsync.fulfilled, (state, { payload }) => {
      state.get_bank_account_status = ASYNC_STATUS.SUCCEEDED;
      state.get_bank_account_data = payload?.data || payload;
      // showSuccessToast(payload?.message || 'Bank account retrieved successfully');
    });
    builder.addCase(getBankAccountAsync.rejected, (state, action) => {
      state.get_bank_account_status = ASYNC_STATUS.ERROR;
      state.get_bank_account_error = action.payload as string;
      showErrorToast(action.payload as string);
    });
    // Update Bank Account handlers
    builder.addCase(updateBankAccountAsync.pending, state => {
      state.update_bank_account_status = ASYNC_STATUS.LOADING;
    });
    builder.addCase(updateBankAccountAsync.fulfilled, (state, { payload }) => {
      state.update_bank_account_status = ASYNC_STATUS.SUCCEEDED;
      state.update_bank_account_data = payload;
      showSuccessToast(payload?.message || 'Bank account updated successfully');
    });
    builder.addCase(updateBankAccountAsync.rejected, (state, action) => {
      state.update_bank_account_status = ASYNC_STATUS.ERROR;
      state.update_bank_account_error = action.payload as string;
      showErrorToast(action.payload as string);
    });
    // Delete Bank Account handlers
    builder.addCase(deleteBankAccountAsync.pending, state => {
      state.delete_bank_account_status = ASYNC_STATUS.LOADING;
    });
    builder.addCase(deleteBankAccountAsync.fulfilled, (state, { payload }) => {
      state.delete_bank_account_status = ASYNC_STATUS.SUCCEEDED;
      state.delete_bank_account_data = payload;
      showSuccessToast(payload?.message || 'Bank account deleted successfully');
    });
    builder.addCase(deleteBankAccountAsync.rejected, (state, action) => {
      state.delete_bank_account_status = ASYNC_STATUS.ERROR;
      state.delete_bank_account_error = action.payload as string;
      showErrorToast(action.payload as string);
    });

    // Real State Overview handlers==================================
    // Add Real State Overview handlers
    builder.addCase(addRealStateOverviewAsync.pending, state => {
      state.add_real_state_overview_status = ASYNC_STATUS.LOADING;
    });
    builder.addCase(
      addRealStateOverviewAsync.fulfilled,
      (state, { payload }) => {
        state.add_real_state_overview_status = ASYNC_STATUS.SUCCEEDED;
        state.add_real_state_overview_data = payload;
        showSuccessToast(
          payload?.message || 'Real state overview added successfully',
        );
      },
    );
    builder.addCase(addRealStateOverviewAsync.rejected, (state, action) => {
      state.add_real_state_overview_status = ASYNC_STATUS.ERROR;
      state.add_real_state_overview_error = action.payload as string;
      showErrorToast(action.payload as string);
    });
    // Get Real State Overview handlers
    builder.addCase(getRealStateOverviewAsync.pending, state => {
      state.get_real_state_overview_status = ASYNC_STATUS.LOADING;
    });
    builder.addCase(
      getRealStateOverviewAsync.fulfilled,
      (state, { payload }) => {
        state.get_real_state_overview_status = ASYNC_STATUS.SUCCEEDED;
        state.get_real_state_overview_data = payload;
        // showSuccessToast(payload?.message || 'Real state overview retrieved successfully');
      },
    );
    builder.addCase(getRealStateOverviewAsync.rejected, (state, action) => {
      state.get_real_state_overview_status = ASYNC_STATUS.ERROR;
      state.get_real_state_overview_error = action.payload as string;
      if (!(action.meta?.arg as any)?.suppressErrorToast) {
        showErrorToast(action.payload as string);
      }
    });

    // Get Business Real State Overview handlers
    builder.addCase(getBusinessRealStateOverviewAsync.pending, state => {
      state.get_real_state_overview_status = ASYNC_STATUS.LOADING;
    });
    builder.addCase(
      getBusinessRealStateOverviewAsync.fulfilled,
      (state, { payload }) => {
        state.get_real_state_overview_status = ASYNC_STATUS.SUCCEEDED;
        state.get_real_state_overview_data = payload;
        // showSuccessToast(payload?.message || 'Real state overview retrieved successfully');
      },
    );
    builder.addCase(
      getBusinessRealStateOverviewAsync.rejected,
      (state, action) => {
        state.get_real_state_overview_status = ASYNC_STATUS.ERROR;
        state.get_real_state_overview_error = action.payload as string;
        if (!(action.meta?.arg as any)?.suppressErrorToast) {
          showErrorToast(action.payload as string);
        }
      },
    );
    // Get Real State Overview By ID handlers
    builder.addCase(getRealStateOverviewByIdAsync.pending, state => {
      state.get_real_state_overview_by_id_status = ASYNC_STATUS.LOADING;
    });
    builder.addCase(
      getRealStateOverviewByIdAsync.fulfilled,
      (state, { payload }) => {
        state.get_real_state_overview_by_id_status = ASYNC_STATUS.SUCCEEDED;
        state.get_real_state_overview_by_id_data = payload;
      },
    );
    builder.addCase(getRealStateOverviewByIdAsync.rejected, (state, action) => {
      state.get_real_state_overview_by_id_status = ASYNC_STATUS.ERROR;
      state.get_real_state_overview_by_id_error = action.payload as string;
      showErrorToast(action.payload as string);
    });
    // Update Real State Overview handlers
    builder.addCase(updateRealStateOverviewAsync.pending, state => {
      state.update_real_state_overview_status = ASYNC_STATUS.LOADING;
    });
    builder.addCase(
      updateRealStateOverviewAsync.fulfilled,
      (state, { payload }) => {
        state.update_real_state_overview_status = ASYNC_STATUS.SUCCEEDED;
        state.update_real_state_overview_data = payload;
        showSuccessToast(
          payload?.message || 'Real state overview updated successfully',
        );
      },
    );
    builder.addCase(updateRealStateOverviewAsync.rejected, (state, action) => {
      state.update_real_state_overview_status = ASYNC_STATUS.ERROR;
      state.update_real_state_overview_error = action.payload as string;
      showErrorToast(action.payload as string);
    });
    // Delete Real State Overview handlers
    builder.addCase(deleteRealStateOverviewAsync.pending, state => {
      state.delete_real_state_overview_status = ASYNC_STATUS.LOADING;
    });
    builder.addCase(
      deleteRealStateOverviewAsync.fulfilled,
      (state, { payload }) => {
        state.delete_real_state_overview_status = ASYNC_STATUS.SUCCEEDED;
        state.delete_real_state_overview_data = payload;
        showSuccessToast(
          payload?.message || 'Real state overview deleted successfully',
        );
      },
    );
    builder.addCase(deleteRealStateOverviewAsync.rejected, (state, action) => {
      state.delete_real_state_overview_status = ASYNC_STATUS.ERROR;
      state.delete_real_state_overview_error = action.payload as string;
      showErrorToast(action.payload as string);
    });

    // Real State Loan mortgage handlers==================================
    // Add Real State Overview handlers
    builder.addCase(addRealStateLoanMortgageAsync.pending, state => {
      state.add_real_state_loan_mortgage_status = ASYNC_STATUS.LOADING;
    });
    builder.addCase(
      addRealStateLoanMortgageAsync.fulfilled,
      (state, { payload }) => {
        state.add_real_state_loan_mortgage_status = ASYNC_STATUS.SUCCEEDED;
        state.add_real_state_loan_mortgage_data = payload;
        showSuccessToast(
          payload?.message || 'Real state overview added successfully',
        );
      },
    );
    builder.addCase(addRealStateLoanMortgageAsync.rejected, (state, action) => {
      state.add_real_state_loan_mortgage_status = ASYNC_STATUS.ERROR;
      state.add_real_state_loan_mortgage_error = action.payload as string;
      showErrorToast(action.payload as string);
    });
    // Get Real State Loan Mortgage handlers
    builder.addCase(getRealStateLoanMortgageAsync.pending, state => {
      state.get_real_state_loan_mortgage_status = ASYNC_STATUS.LOADING;
    });
    builder.addCase(
      getRealStateLoanMortgageAsync.fulfilled,
      (state, { payload }) => {
        state.get_real_state_loan_mortgage_status = ASYNC_STATUS.SUCCEEDED;
        state.get_real_state_loan_mortgage_data = payload;

        // showSuccessToast(payload?.message || 'Real state overview retrieved successfully');
      },
    );
    builder.addCase(getRealStateLoanMortgageAsync.rejected, (state, action) => {
      state.get_real_state_loan_mortgage_status = ASYNC_STATUS.ERROR;
      state.get_real_state_loan_mortgage_error = action.payload as string;
      showErrorToast(action.payload as string);
    });
    // Get Real State Loan Mortgage By ID handlers
    builder.addCase(getRealStateLoanMortgageByIdAsync.pending, state => {
      state.get_real_state_loan_mortgage_by_id_status = ASYNC_STATUS.LOADING;
    });
    builder.addCase(
      getRealStateLoanMortgageByIdAsync.fulfilled,
      (state, { payload }) => {
        state.get_real_state_loan_mortgage_by_id_status =
          ASYNC_STATUS.SUCCEEDED;
        state.get_real_state_loan_mortgage_by_id_data = payload;
      },
    );
    builder.addCase(
      getRealStateLoanMortgageByIdAsync.rejected,
      (state, action) => {
        state.get_real_state_loan_mortgage_by_id_status = ASYNC_STATUS.ERROR;
        state.get_real_state_loan_mortgage_by_id_error =
          action.payload as string;
        showErrorToast(action.payload as string);
      },
    );
    // Update Real State Loan Mortgage handlers
    builder.addCase(updateRealStateLoanMortgageAsync.pending, state => {
      state.update_real_state_loan_mortgage_status = ASYNC_STATUS.LOADING;
    });
    builder.addCase(
      updateRealStateLoanMortgageAsync.fulfilled,
      (state, { payload }) => {
        state.update_real_state_loan_mortgage_status = ASYNC_STATUS.SUCCEEDED;
        state.update_real_state_loan_mortgage_data = payload;
        showSuccessToast(
          payload?.message || 'Real state loan mortgage updated successfully',
        );
      },
    );
    builder.addCase(
      updateRealStateLoanMortgageAsync.rejected,
      (state, action) => {
        state.update_real_state_loan_mortgage_status = ASYNC_STATUS.ERROR;
        state.update_real_state_loan_mortgage_error = action.payload as string;
        showErrorToast(action.payload as string);
      },
    );
    // Delete Real State Overview handlers
    builder.addCase(deleteRealStateLoanMortgageAsync.pending, state => {
      state.delete_real_state_loan_mortgage_status = ASYNC_STATUS.LOADING;
    });
    builder.addCase(
      deleteRealStateLoanMortgageAsync.fulfilled,
      (state, { payload }) => {
        state.delete_real_state_loan_mortgage_status = ASYNC_STATUS.SUCCEEDED;
        state.delete_real_state_loan_mortgage_data = payload;
        showSuccessToast(
          payload?.message || 'Real state loan mortgage deleted successfully',
        );
      },
    );
    builder.addCase(
      deleteRealStateLoanMortgageAsync.rejected,
      (state, action) => {
        state.delete_real_state_loan_mortgage_status = ASYNC_STATUS.ERROR;
        state.delete_real_state_loan_mortgage_error = action.payload as string;
        showErrorToast(action.payload as string);
      },
    );

    // Real State Utilities handlers==================================
    // Add Real State Overview handlers
    builder.addCase(addRealStateUtilitiesAsync.pending, state => {
      state.add_real_state_utilities_status = ASYNC_STATUS.LOADING;
    });
    builder.addCase(
      addRealStateUtilitiesAsync.fulfilled,
      (state, { payload }) => {
        state.add_real_state_utilities_status = ASYNC_STATUS.SUCCEEDED;
        state.add_real_state_utilities_data = payload;
        showSuccessToast(
          payload?.message || 'Real state overview added successfully',
        );
      },
    );
    builder.addCase(addRealStateUtilitiesAsync.rejected, (state, action) => {
      state.add_real_state_utilities_status = ASYNC_STATUS.ERROR;
      state.add_real_state_utilities_error = action.payload as string;
      showErrorToast(action.payload as string);
    });
    // Get Real State Overview handlers
    builder.addCase(getRealStateUtilitiesAsync.pending, state => {
      state.get_real_state_utilities_status = ASYNC_STATUS.LOADING;
    });
    builder.addCase(
      getRealStateUtilitiesAsync.fulfilled,
      (state, { payload }) => {
        state.get_real_state_utilities_status = ASYNC_STATUS.SUCCEEDED;
        state.get_real_state_utilities_data = payload;

        // showSuccessToast(payload?.message || 'Real state overview retrieved successfully');
      },
    );
    builder.addCase(getRealStateUtilitiesAsync.rejected, (state, action) => {
      state.get_real_state_utilities_status = ASYNC_STATUS.ERROR;
      state.get_real_state_utilities_error = action.payload as string;
      showErrorToast(action.payload as string);
    });
    // Get Real State Utilities By ID handlers
    builder.addCase(getRealStateUtilitiesByIdAsync.pending, state => {
      state.get_real_state_utilities_by_id_status = ASYNC_STATUS.LOADING;
    });
    builder.addCase(
      getRealStateUtilitiesByIdAsync.fulfilled,
      (state, { payload }) => {
        state.get_real_state_utilities_by_id_status = ASYNC_STATUS.SUCCEEDED;
        state.get_real_state_utilities_by_id_data = payload;
      },
    );
    builder.addCase(
      getRealStateUtilitiesByIdAsync.rejected,
      (state, action) => {
        state.get_real_state_utilities_by_id_status = ASYNC_STATUS.ERROR;
        state.get_real_state_utilities_by_id_error = action.payload as string;
        showErrorToast(action.payload as string);
      },
    );
    // Update Real State Overview handlers
    builder.addCase(updateRealStateUtilitiesAsync.pending, state => {
      state.update_real_state_utilities_status = ASYNC_STATUS.LOADING;
    });
    builder.addCase(
      updateRealStateUtilitiesAsync.fulfilled,
      (state, { payload }) => {
        state.update_real_state_utilities_status = ASYNC_STATUS.SUCCEEDED;
        state.update_real_state_utilities_data = payload;
        showSuccessToast(
          payload?.message || 'Real state utilities updated successfully',
        );
      },
    );
    builder.addCase(updateRealStateUtilitiesAsync.rejected, (state, action) => {
      state.update_real_state_utilities_status = ASYNC_STATUS.ERROR;
      state.update_real_state_utilities_error = action.payload as string;
      showErrorToast(action.payload as string);
    });
    // Delete Real State Overview handlers
    builder.addCase(deleteRealStateUtilitiesAsync.pending, state => {
      state.delete_real_state_utilities_status = ASYNC_STATUS.LOADING;
    });
    builder.addCase(
      deleteRealStateUtilitiesAsync.fulfilled,
      (state, { payload }) => {
        state.delete_real_state_utilities_status = ASYNC_STATUS.SUCCEEDED;
        state.delete_real_state_utilities_data = payload;
        showSuccessToast(
          payload?.message || 'Real state utilities deleted successfully',
        );
      },
    );
    builder.addCase(deleteRealStateUtilitiesAsync.rejected, (state, action) => {
      state.delete_real_state_utilities_status = ASYNC_STATUS.ERROR;
      state.delete_real_state_utilities_error = action.payload as string;
      showErrorToast(action.payload as string);
    });
    // Real State Insurance handlers==================================
    // Add Real State Insurance handlers
    builder.addCase(addRealStateInsuranceAsync.pending, state => {
      state.add_real_state_insurance_status = ASYNC_STATUS.LOADING;
    });
    builder.addCase(
      addRealStateInsuranceAsync.fulfilled,
      (state, { payload }) => {
        state.add_real_state_insurance_status = ASYNC_STATUS.SUCCEEDED;
        state.add_real_state_insurance_data = payload;
        showSuccessToast(
          payload?.message || 'Real state insurance added successfully',
        );
      },
    );
    builder.addCase(addRealStateInsuranceAsync.rejected, (state, action) => {
      state.add_real_state_insurance_status = ASYNC_STATUS.ERROR;
      state.add_real_state_insurance_error = action.payload as string;
      showErrorToast(action.payload as string);
    });
    // Get Real State Insurance handlers
    builder.addCase(getRealStateInsuranceAsync.pending, state => {
      state.get_real_state_insurance_status = ASYNC_STATUS.LOADING;
    });
    builder.addCase(
      getRealStateInsuranceAsync.fulfilled,
      (state, { payload }) => {
        state.get_real_state_insurance_status = ASYNC_STATUS.SUCCEEDED;
        state.get_real_state_insurance_data = payload;

        // showSuccessToast(payload?.message || 'Real state overview retrieved successfully');
      },
    );
    builder.addCase(getRealStateInsuranceAsync.rejected, (state, action) => {
      state.get_real_state_insurance_status = ASYNC_STATUS.ERROR;
      state.get_real_state_insurance_error = action.payload as string;
      showErrorToast(action.payload as string);
    });
    // Get Real State Insurance By ID handlers
    builder.addCase(getRealStateInsuranceByIdAsync.pending, state => {
      state.get_real_state_insurance_by_id_status = ASYNC_STATUS.LOADING;
    });
    builder.addCase(
      getRealStateInsuranceByIdAsync.fulfilled,
      (state, { payload }) => {
        state.get_real_state_insurance_by_id_status = ASYNC_STATUS.SUCCEEDED;
        state.get_real_state_insurance_by_id_data = payload;
      },
    );
    builder.addCase(
      getRealStateInsuranceByIdAsync.rejected,
      (state, action) => {
        state.get_real_state_insurance_by_id_status = ASYNC_STATUS.ERROR;
        state.get_real_state_insurance_by_id_error = action.payload as string;
        showErrorToast(action.payload as string);
      },
    );
    // Update Real State Overview handlers
    builder.addCase(updateRealStateInsuranceAsync.pending, state => {
      state.update_real_state_insurance_status = ASYNC_STATUS.LOADING;
    });
    builder.addCase(
      updateRealStateInsuranceAsync.fulfilled,
      (state, { payload }) => {
        state.update_real_state_insurance_status = ASYNC_STATUS.SUCCEEDED;
        state.update_real_state_insurance_data = payload;
        showSuccessToast(
          payload?.message || 'Real state insurance updated successfully',
        );
      },
    );
    builder.addCase(updateRealStateInsuranceAsync.rejected, (state, action) => {
      state.update_real_state_insurance_status = ASYNC_STATUS.ERROR;
      state.update_real_state_insurance_error = action.payload as string;
      showErrorToast(action.payload as string);
    });
    // Delete Real State Overview handlers
    builder.addCase(deleteRealStateInsuranceAsync.pending, state => {
      state.delete_real_state_insurance_status = ASYNC_STATUS.LOADING;
    });
    builder.addCase(
      deleteRealStateInsuranceAsync.fulfilled,
      (state, { payload }) => {
        state.delete_real_state_insurance_status = ASYNC_STATUS.SUCCEEDED;
        state.delete_real_state_insurance_data = payload;
        showSuccessToast(
          payload?.message || 'Real state insurance deleted successfully',
        );
      },
    );
    builder.addCase(deleteRealStateInsuranceAsync.rejected, (state, action) => {
      state.delete_real_state_insurance_status = ASYNC_STATUS.ERROR;
      state.delete_real_state_insurance_error = action.payload as string;
      showErrorToast(action.payload as string);
    });

    // Real State warranties handlers==================================
    // Add Real State Warranties handlers
    builder.addCase(addRealStateWarrantiesAsync.pending, state => {
      state.add_real_state_warranties_status = ASYNC_STATUS.LOADING;
    });
    builder.addCase(
      addRealStateWarrantiesAsync.fulfilled,
      (state, { payload }) => {
        state.add_real_state_warranties_status = ASYNC_STATUS.SUCCEEDED;
        state.add_real_state_warranties_data = payload;
        showSuccessToast(
          payload?.message || 'Real state warranties added successfully',
        );
      },
    );
    builder.addCase(addRealStateWarrantiesAsync.rejected, (state, action) => {
      state.add_real_state_warranties_status = ASYNC_STATUS.ERROR;
      state.add_real_state_warranties_error = action.payload as string;
      showErrorToast(action.payload as string);
    });
    // Get Real State Warranties handlers
    builder.addCase(getRealStateWarrantiesAsync.pending, state => {
      state.get_real_state_warranties_status = ASYNC_STATUS.LOADING;
    });
    builder.addCase(
      getRealStateWarrantiesAsync.fulfilled,
      (state, { payload }) => {
        state.get_real_state_warranties_status = ASYNC_STATUS.SUCCEEDED;
        state.get_real_state_warranties_data = payload;

        // showSuccessToast(payload?.message || 'Real state overview retrieved successfully');
      },
    );
    builder.addCase(getRealStateWarrantiesAsync.rejected, (state, action) => {
      state.get_real_state_warranties_status = ASYNC_STATUS.ERROR;
      state.get_real_state_warranties_error = action.payload as string;
      showErrorToast(action.payload as string);
    });
    // Get Real State Warranties By ID handlers
    builder.addCase(getRealStateWarrantiesByIdAsync.pending, state => {
      state.get_real_state_warranties_by_id_status = ASYNC_STATUS.LOADING;
    });
    builder.addCase(
      getRealStateWarrantiesByIdAsync.fulfilled,
      (state, { payload }) => {
        state.get_real_state_warranties_by_id_status = ASYNC_STATUS.SUCCEEDED;
        state.get_real_state_warranties_by_id_data = payload;
      },
    );
    builder.addCase(
      getRealStateWarrantiesByIdAsync.rejected,
      (state, action) => {
        state.get_real_state_warranties_by_id_status = ASYNC_STATUS.ERROR;
        state.get_real_state_warranties_by_id_error = action.payload as string;
        showErrorToast(action.payload as string);
      },
    );
    // Update Real State Warranties handlers
    builder.addCase(updateRealStateWarrantiesAsync.pending, state => {
      state.update_real_state_warranties_status = ASYNC_STATUS.LOADING;
    });
    builder.addCase(
      updateRealStateWarrantiesAsync.fulfilled,
      (state, { payload }) => {
        state.update_real_state_warranties_status = ASYNC_STATUS.SUCCEEDED;
        state.update_real_state_warranties_data = payload;
        showSuccessToast(
          payload?.message || 'Real state warranties updated successfully',
        );
      },
    );
    builder.addCase(
      updateRealStateWarrantiesAsync.rejected,
      (state, action) => {
        state.update_real_state_warranties_status = ASYNC_STATUS.ERROR;
        state.update_real_state_warranties_error = action.payload as string;
        showErrorToast(action.payload as string);
      },
    );
    // Delete Real State Warranties handlers
    builder.addCase(deleteRealStateWarrantiesAsync.pending, state => {
      state.delete_real_state_warranties_status = ASYNC_STATUS.LOADING;
    });
    builder.addCase(
      deleteRealStateWarrantiesAsync.fulfilled,
      (state, { payload }) => {
        state.delete_real_state_warranties_status = ASYNC_STATUS.SUCCEEDED;
        state.delete_real_state_warranties_data = payload;
        showSuccessToast(
          payload?.message || 'Real state warranties deleted successfully',
        );
      },
    );
    builder.addCase(
      deleteRealStateWarrantiesAsync.rejected,
      (state, action) => {
        state.delete_real_state_warranties_status = ASYNC_STATUS.ERROR;
        state.delete_real_state_warranties_error = action.payload as string;
        showErrorToast(action.payload as string);
      },
    );

    // Real State personal property handlers==================================
    // Add Real State Personal Property handlers
    builder.addCase(addRealStatePersonalPropertyAsync.pending, state => {
      state.add_real_state_personal_property_status = ASYNC_STATUS.LOADING;
    });
    builder.addCase(
      addRealStatePersonalPropertyAsync.fulfilled,
      (state, { payload }) => {
        state.add_real_state_personal_property_status = ASYNC_STATUS.SUCCEEDED;
        state.add_real_state_personal_property_data = payload;
        showSuccessToast(
          payload?.message || 'Real state personal property added successfully',
        );
      },
    );
    builder.addCase(
      addRealStatePersonalPropertyAsync.rejected,
      (state, action) => {
        state.add_real_state_personal_property_status = ASYNC_STATUS.ERROR;
        state.add_real_state_personal_property_error = action.payload as string;
        showErrorToast(action.payload as string);
      },
    );
    // Get Real State Personal Property handlers
    builder.addCase(getRealStatePersonalPropertyAsync.pending, state => {
      state.get_real_state_personal_property_status = ASYNC_STATUS.LOADING;
    });
    builder.addCase(
      getRealStatePersonalPropertyAsync.fulfilled,
      (state, { payload }) => {
        state.get_real_state_personal_property_status = ASYNC_STATUS.SUCCEEDED;
        state.get_real_state_personal_property_data = payload;

        // showSuccessToast(payload?.message || 'Real state overview retrieved successfully');
      },
    );
    builder.addCase(
      getRealStatePersonalPropertyAsync.rejected,
      (state, action) => {
        state.get_real_state_personal_property_status = ASYNC_STATUS.ERROR;
        state.get_real_state_personal_property_error = action.payload as string;
        showErrorToast(action.payload as string);
      },
    );
    // Get Real State Personal Property By ID handlers
    builder.addCase(getRealStatePersonalPropertyByIdAsync.pending, state => {
      state.get_real_state_personal_property_by_id_status =
        ASYNC_STATUS.LOADING;
    });
    builder.addCase(
      getRealStatePersonalPropertyByIdAsync.fulfilled,
      (state, { payload }) => {
        state.get_real_state_personal_property_by_id_status =
          ASYNC_STATUS.SUCCEEDED;
        state.get_real_state_personal_property_by_id_data = payload;
      },
    );
    builder.addCase(
      getRealStatePersonalPropertyByIdAsync.rejected,
      (state, action) => {
        state.get_real_state_personal_property_by_id_status =
          ASYNC_STATUS.ERROR;
        state.get_real_state_personal_property_by_id_error =
          action.payload as string;
        showErrorToast(action.payload as string);
      },
    );
    // Update Real State Personal Property handlers
    builder.addCase(updateRealStatePersonalPropertyAsync.pending, state => {
      state.update_real_state_personal_property_status = ASYNC_STATUS.LOADING;
    });
    builder.addCase(
      updateRealStatePersonalPropertyAsync.fulfilled,
      (state, { payload }) => {
        state.update_real_state_personal_property_status =
          ASYNC_STATUS.SUCCEEDED;
        state.update_real_state_personal_property_data = payload;
        showSuccessToast(
          payload?.message ||
          'Real state personal property updated successfully',
        );
      },
    );
    builder.addCase(
      updateRealStatePersonalPropertyAsync.rejected,
      (state, action) => {
        state.update_real_state_personal_property_status = ASYNC_STATUS.ERROR;
        state.update_real_state_personal_property_error =
          action.payload as string;
        showErrorToast(action.payload as string);
      },
    );
    // Delete Real State Personal Property handlers
    builder.addCase(deleteRealStatePersonalPropertyAsync.pending, state => {
      state.delete_real_state_personal_property_status = ASYNC_STATUS.LOADING;
    });
    builder.addCase(
      deleteRealStatePersonalPropertyAsync.fulfilled,
      (state, { payload }) => {
        state.delete_real_state_personal_property_status =
          ASYNC_STATUS.SUCCEEDED;
        state.delete_real_state_personal_property_data = payload;
        showSuccessToast(
          payload?.message ||
          'Real state personal property deleted successfully',
        );
      },
    );
    builder.addCase(
      deleteRealStatePersonalPropertyAsync.rejected,
      (state, action) => {
        state.delete_real_state_personal_property_status = ASYNC_STATUS.ERROR;
        state.delete_real_state_personal_property_error =
          action.payload as string;
        showErrorToast(action.payload as string);
      },
    );

    // Real State Service work history handlers==================================
    // Add Real State Service Work History handlers
    builder.addCase(addRealStateServiceWorkHistoryAsync.pending, state => {
      state.add_real_state_service_work_history_status = ASYNC_STATUS.LOADING;
    });
    builder.addCase(
      addRealStateServiceWorkHistoryAsync.fulfilled,
      (state, { payload }) => {
        state.add_real_state_service_work_history_status =
          ASYNC_STATUS.SUCCEEDED;
        state.add_real_state_service_work_history_data = payload;
        showSuccessToast(
          payload?.message ||
          'Real state service work history added successfully',
        );
      },
    );
    builder.addCase(
      addRealStateServiceWorkHistoryAsync.rejected,
      (state, action) => {
        state.add_real_state_service_work_history_status = ASYNC_STATUS.ERROR;
        state.add_real_state_service_work_history_error =
          action.payload as string;
        showErrorToast(action.payload as string);
      },
    );
    // Get Real State Service Work History handlers
    builder.addCase(getRealStateServiceWorkHistoryAsync.pending, state => {
      state.get_real_state_service_work_history_status = ASYNC_STATUS.LOADING;
    });
    builder.addCase(
      getRealStateServiceWorkHistoryAsync.fulfilled,
      (state, { payload }) => {
        state.get_real_state_service_work_history_status =
          ASYNC_STATUS.SUCCEEDED;
        state.get_real_state_service_work_history_data = payload;

        // showSuccessToast(payload?.message || 'Real state overview retrieved successfully');
      },
    );
    builder.addCase(
      getRealStateServiceWorkHistoryAsync.rejected,
      (state, action) => {
        state.get_real_state_service_work_history_status = ASYNC_STATUS.ERROR;
        state.get_real_state_service_work_history_error =
          action.payload as string;
        showErrorToast(action.payload as string);
      },
    );
    // Get Real State Service Work History By ID handlers
    builder.addCase(getRealStateServiceWorkHistoryByIdAsync.pending, state => {
      state.get_real_state_service_work_history_by_id_status =
        ASYNC_STATUS.LOADING;
    });
    builder.addCase(
      getRealStateServiceWorkHistoryByIdAsync.fulfilled,
      (state, { payload }) => {
        state.get_real_state_service_work_history_by_id_status =
          ASYNC_STATUS.SUCCEEDED;
        state.get_real_state_service_work_history_by_id_data = payload;
      },
    );
    builder.addCase(
      getRealStateServiceWorkHistoryByIdAsync.rejected,
      (state, action) => {
        state.get_real_state_service_work_history_by_id_status =
          ASYNC_STATUS.ERROR;
        state.get_real_state_service_work_history_by_id_error =
          action.payload as string;
        showErrorToast(action.payload as string);
      },
    );
    // Update Real State Service Work History handlers
    builder.addCase(updateRealStateServiceWorkHistoryAsync.pending, state => {
      state.update_real_state_service_work_history_status =
        ASYNC_STATUS.LOADING;
    });
    builder.addCase(
      updateRealStateServiceWorkHistoryAsync.fulfilled,
      (state, { payload }) => {
        state.update_real_state_service_work_history_status =
          ASYNC_STATUS.SUCCEEDED;
        state.update_real_state_service_work_history_data = payload;
        showSuccessToast(
          payload?.message ||
          'Real state service work history updated successfully',
        );
      },
    );
    builder.addCase(
      updateRealStateServiceWorkHistoryAsync.rejected,
      (state, action) => {
        state.update_real_state_service_work_history_status =
          ASYNC_STATUS.ERROR;
        state.update_real_state_service_work_history_error =
          action.payload as string;
        showErrorToast(action.payload as string);
      },
    );
    // Delete Real State Service Work History handlers
    builder.addCase(deleteRealStateServiceWorkHistoryAsync.pending, state => {
      state.delete_real_state_service_work_history_status =
        ASYNC_STATUS.LOADING;
    });
    builder.addCase(
      deleteRealStateServiceWorkHistoryAsync.fulfilled,
      (state, { payload }) => {
        state.delete_real_state_service_work_history_status =
          ASYNC_STATUS.SUCCEEDED;
        state.delete_real_state_service_work_history_data = payload;
        showSuccessToast(
          payload?.message ||
          'Real state service work history deleted successfully',
        );
      },
    );
    builder.addCase(
      deleteRealStateServiceWorkHistoryAsync.rejected,
      (state, action) => {
        state.delete_real_state_service_work_history_status =
          ASYNC_STATUS.ERROR;
        state.delete_real_state_service_work_history_error =
          action.payload as string;
        showErrorToast(action.payload as string);
      },
    );

    // Personal Property handlers==================================
    // Add Personal Property handlers
    builder.addCase(addPersonalPropertyAsync.pending, state => {
      state.add_personal_property_status = ASYNC_STATUS.LOADING;
    });
    builder.addCase(
      addPersonalPropertyAsync.fulfilled,
      (state, { payload }) => {
        state.add_personal_property_status = ASYNC_STATUS.SUCCEEDED;
        state.add_personal_property_data = payload;
        showSuccessToast(
          payload?.message || 'Personal property added successfully',
        );
      },
    );
    builder.addCase(addPersonalPropertyAsync.rejected, (state, action) => {
      state.add_personal_property_status = ASYNC_STATUS.ERROR;
      state.add_personal_property_error = action.payload as string;
      showErrorToast(action.payload as string);
    });
    // Get Personal Property handlers
    builder.addCase(getPersonalPropertyAsync.pending, state => {
      state.get_personal_property_status = ASYNC_STATUS.LOADING;
    });
    builder.addCase(
      getPersonalPropertyAsync.fulfilled,
      (state, { payload }) => {
        state.get_personal_property_status = ASYNC_STATUS.SUCCEEDED;
        state.get_personal_property_data = payload;
      },
    );
    builder.addCase(getPersonalPropertyAsync.rejected, (state, action) => {
      state.get_personal_property_status = ASYNC_STATUS.ERROR;
      state.get_personal_property_error = action.payload as string;
      if (!(action.meta?.arg as any)?.suppressErrorToast) {
        showErrorToast(action.payload as string);
      }
    });

    // Get Business Property handlers
    builder.addCase(getBusinessPropertyAsync.pending, state => {
      state.get_personal_property_status = ASYNC_STATUS.LOADING;
    });
    builder.addCase(
      getBusinessPropertyAsync.fulfilled,
      (state, { payload }) => {
        state.get_personal_property_status = ASYNC_STATUS.SUCCEEDED;
        state.get_personal_property_data = payload;
      },
    );
    builder.addCase(getBusinessPropertyAsync.rejected, (state, action) => {
      state.get_personal_property_status = ASYNC_STATUS.ERROR;
      state.get_personal_property_error = action.payload as string;
      if (!(action.meta?.arg as any)?.suppressErrorToast) {
        showErrorToast(action.payload as string);
      }
    });
    // Get Personal Property By ID handlers
    builder.addCase(getPersonalPropertyByIdAsync.pending, state => {
      state.get_personal_property_by_id_status = ASYNC_STATUS.LOADING;
    });
    builder.addCase(
      getPersonalPropertyByIdAsync.fulfilled,
      (state, { payload }) => {
        state.get_personal_property_by_id_status = ASYNC_STATUS.SUCCEEDED;
        state.get_personal_property_by_id_data = payload;
      },
    );
    builder.addCase(getPersonalPropertyByIdAsync.rejected, (state, action) => {
      state.get_personal_property_by_id_status = ASYNC_STATUS.ERROR;
      state.get_personal_property_by_id_error = action.payload as string;
      showErrorToast(action.payload as string);
    });
    // Update Personal Property handlers
    builder.addCase(updatePersonalPropertyAsync.pending, state => {
      state.update_personal_property_status = ASYNC_STATUS.LOADING;
    });
    builder.addCase(
      updatePersonalPropertyAsync.fulfilled,
      (state, { payload }) => {
        state.update_personal_property_status = ASYNC_STATUS.SUCCEEDED;
        state.update_personal_property_data = payload;
        showSuccessToast(
          payload?.message || 'Personal property updated successfully',
        );
      },
    );
    builder.addCase(updatePersonalPropertyAsync.rejected, (state, action) => {
      state.update_personal_property_status = ASYNC_STATUS.ERROR;
      state.update_personal_property_error = action.payload as string;
      showErrorToast(action.payload as string);
    });
    // Delete Personal Property handlers
    builder.addCase(deletePersonalPropertyAsync.pending, state => {
      state.delete_personal_property_status = ASYNC_STATUS.LOADING;
    });
    builder.addCase(
      deletePersonalPropertyAsync.fulfilled,
      (state, { payload }) => {
        state.delete_personal_property_status = ASYNC_STATUS.SUCCEEDED;
        state.delete_personal_property_data = payload;
        showSuccessToast(
          payload?.message || 'Personal property deleted successfully',
        );
      },
    );
    builder.addCase(deletePersonalPropertyAsync.rejected, (state, action) => {
      state.delete_personal_property_status = ASYNC_STATUS.ERROR;
      state.delete_personal_property_error = action.payload as string;
      showErrorToast(action.payload as string);
    });
    // Move Personal Property handlers
    builder.addCase(movePersonalPropertyAsync.pending, state => {
      state.move_personal_property_status = ASYNC_STATUS.LOADING;
    });
    builder.addCase(
      movePersonalPropertyAsync.fulfilled,
      (state, { payload }) => {
        state.move_personal_property_status = ASYNC_STATUS.SUCCEEDED;
        state.move_personal_property_data = payload;
        showSuccessToast(payload?.message || 'Property moved successfully');
      },
    );
    builder.addCase(movePersonalPropertyAsync.rejected, (state, action) => {
      state.move_personal_property_status = ASYNC_STATUS.ERROR;
      state.move_personal_property_error = action.payload as string;
      showErrorToast(action.payload as string);
    });

    // Add Vehicle handlers
    builder.addCase(addVehicleAsync.pending, state => {
      state.add_vehicle_status = ASYNC_STATUS.LOADING;
    });
    builder.addCase(addVehicleAsync.fulfilled, (state, { payload }) => {
      state.add_vehicle_status = ASYNC_STATUS.SUCCEEDED;
      state.add_vehicle_data = payload;
      showSuccessToast(payload?.message || 'Vehicle added successfully');
    });
    builder.addCase(addVehicleAsync.rejected, (state, action) => {
      state.add_vehicle_status = ASYNC_STATUS.ERROR;
      state.add_vehicle_error = action.payload as string;
      showErrorToast(action.payload as string);
    });

    // Get Vehicles handlers
    builder.addCase(getVehiclesAsync.pending, state => {
      state.get_vehicles_status = ASYNC_STATUS.LOADING;
    });
    builder.addCase(getVehiclesAsync.fulfilled, (state, { payload }) => {
      state.get_vehicles_status = ASYNC_STATUS.SUCCEEDED;
      state.get_vehicles_data = payload;
    });
    builder.addCase(getVehiclesAsync.rejected, (state, action) => {
      state.get_vehicles_status = ASYNC_STATUS.ERROR;
      state.get_vehicles_error = action.payload as string;
      if (!(action.meta?.arg as any)?.suppressErrorToast) {
        showErrorToast(action.payload as string);
      }
    });

    builder.addCase(getBusinessVehiclesAsync.pending, state => {
      state.get_vehicles_status = ASYNC_STATUS.LOADING;
    });
    builder.addCase(
      getBusinessVehiclesAsync.fulfilled,
      (state, { payload }) => {
        state.get_vehicles_status = ASYNC_STATUS.SUCCEEDED;
        state.get_vehicles_data = payload;
      },
    );
    builder.addCase(getBusinessVehiclesAsync.rejected, (state, action) => {
      state.get_vehicles_status = ASYNC_STATUS.ERROR;
      state.get_vehicles_error = action.payload as string;
      showErrorToast(action.payload as string);
    });

    // Get Vehicle By Id handlers
    builder.addCase(getVehicleByIdAsync.pending, state => {
      state.get_vehicle_by_id_status = ASYNC_STATUS.LOADING;
    });
    builder.addCase(getVehicleByIdAsync.fulfilled, (state, { payload }) => {
      state.get_vehicle_by_id_status = ASYNC_STATUS.SUCCEEDED;
      state.get_vehicle_by_id_data = payload;
    });
    builder.addCase(getVehicleByIdAsync.rejected, (state, action) => {
      state.get_vehicle_by_id_status = ASYNC_STATUS.ERROR;
      state.get_vehicle_by_id_error = action.payload as string;
      showErrorToast(action.payload as string);
    });

    // Update Vehicle handlers
    builder.addCase(updateVehicleAsync.pending, state => {
      state.update_vehicle_status = ASYNC_STATUS.LOADING;
    });
    builder.addCase(updateVehicleAsync.fulfilled, (state, { payload }) => {
      state.update_vehicle_status = ASYNC_STATUS.SUCCEEDED;
      state.update_vehicle_data = payload;
      showSuccessToast(payload?.message || 'Vehicle updated successfully');
    });
    builder.addCase(updateVehicleAsync.rejected, (state, action) => {
      state.update_vehicle_status = ASYNC_STATUS.ERROR;
      state.update_vehicle_error = action.payload as string;
      showErrorToast(action.payload as string);
    });

    // Delete Vehicle handlers
    builder.addCase(deleteVehicleAsync.pending, state => {
      state.delete_vehicle_status = ASYNC_STATUS.LOADING;
    });
    builder.addCase(deleteVehicleAsync.fulfilled, (state, { payload }) => {
      state.delete_vehicle_status = ASYNC_STATUS.SUCCEEDED;
      state.delete_vehicle_data = payload;
      showSuccessToast(payload?.message || 'Vehicle deleted successfully');
    });
    builder.addCase(deleteVehicleAsync.rejected, (state, action) => {
      state.delete_vehicle_status = ASYNC_STATUS.ERROR;
      state.delete_vehicle_error = action.payload as string;
      showErrorToast(action.payload as string);
    });

    // Add Vehicle Service Records Bulk handlers
    builder.addCase(addVehicleServiceRecordsBulkAsync.pending, state => {
      state.add_vehicle_service_records_bulk_status = ASYNC_STATUS.LOADING;
    });
    builder.addCase(
      addVehicleServiceRecordsBulkAsync.fulfilled,
      (state, { payload }) => {
        state.add_vehicle_service_records_bulk_status = ASYNC_STATUS.SUCCEEDED;
        state.add_vehicle_service_records_bulk_data = payload;
        showSuccessToast(
          payload?.message || 'Service records added successfully',
        );
      },
    );
    builder.addCase(
      addVehicleServiceRecordsBulkAsync.rejected,
      (state, action) => {
        state.add_vehicle_service_records_bulk_status = ASYNC_STATUS.ERROR;
        state.add_vehicle_service_records_bulk_error = action.payload as string;
        showErrorToast(action.payload as string);
      },
    );

    // Get Vehicle Service Records handlers
    builder.addCase(getVehicleServiceRecordsAsync.pending, state => {
      state.get_vehicle_service_records_status = ASYNC_STATUS.LOADING;
    });
    builder.addCase(
      getVehicleServiceRecordsAsync.fulfilled,
      (state, { payload }) => {
        state.get_vehicle_service_records_status = ASYNC_STATUS.SUCCEEDED;
        state.get_vehicle_service_records_data = payload;
      },
    );
    builder.addCase(getVehicleServiceRecordsAsync.rejected, (state, action) => {
      state.get_vehicle_service_records_status = ASYNC_STATUS.ERROR;
      state.get_vehicle_service_records_error = action.payload as string;
      showErrorToast(action.payload as string);
    });

    // Update Vehicle Service Record handlers
    builder.addCase(updateVehicleServiceRecordAsync.pending, state => {
      state.update_vehicle_service_record_status = ASYNC_STATUS.LOADING;
    });
    builder.addCase(
      updateVehicleServiceRecordAsync.fulfilled,
      (state, { payload }) => {
        state.update_vehicle_service_record_status = ASYNC_STATUS.SUCCEEDED;
        state.update_vehicle_service_record_data = payload;
        showSuccessToast(
          payload?.message || 'Service record updated successfully',
        );
      },
    );
    builder.addCase(
      updateVehicleServiceRecordAsync.rejected,
      (state, action) => {
        state.update_vehicle_service_record_status = ASYNC_STATUS.ERROR;
        state.update_vehicle_service_record_error = action.payload as string;
        showErrorToast(action.payload as string);
      },
    );

    // Delete Vehicle Service Record handlers
    builder.addCase(deleteVehicleServiceRecordAsync.pending, state => {
      state.delete_vehicle_service_record_status = ASYNC_STATUS.LOADING;
    });
    builder.addCase(
      deleteVehicleServiceRecordAsync.fulfilled,
      (state, { payload }) => {
        state.delete_vehicle_service_record_status = ASYNC_STATUS.SUCCEEDED;
        state.delete_vehicle_service_record_data = payload;
        showSuccessToast(
          payload?.message || 'Service record deleted successfully',
        );
      },
    );
    builder.addCase(
      deleteVehicleServiceRecordAsync.rejected,
      (state, action) => {
        state.delete_vehicle_service_record_status = ASYNC_STATUS.ERROR;
        state.delete_vehicle_service_record_error = action.payload as string;
        showErrorToast(action.payload as string);
      },
    );

    // Add Vehicle Accidents Bulk handlers
    builder.addCase(addVehicleAccidentAsync.pending, state => {
      state.add_vehicle_accidents_bulk_status = ASYNC_STATUS.LOADING;
    });
    builder.addCase(addVehicleAccidentAsync.fulfilled, (state, { payload }) => {
      state.add_vehicle_accidents_bulk_status = ASYNC_STATUS.SUCCEEDED;
      state.add_vehicle_accidents_bulk_data = payload;
      showSuccessToast(payload?.message || 'Accidents added successfully');
    });
    builder.addCase(addVehicleAccidentAsync.rejected, (state, action) => {
      state.add_vehicle_accidents_bulk_status = ASYNC_STATUS.ERROR;
      state.add_vehicle_accidents_bulk_error = action.payload as string;
      showErrorToast(action.payload as string);
    });

    // Get Vehicle Accidents handlers
    builder.addCase(getVehicleAccidentsAsync.pending, state => {
      state.get_vehicle_accidents_status = ASYNC_STATUS.LOADING;
    });
    builder.addCase(
      getVehicleAccidentsAsync.fulfilled,
      (state, { payload }) => {
        state.get_vehicle_accidents_status = ASYNC_STATUS.SUCCEEDED;
        state.get_vehicle_accidents_data = payload;
      },
    );
    builder.addCase(getVehicleAccidentsAsync.rejected, (state, action) => {
      state.get_vehicle_accidents_status = ASYNC_STATUS.ERROR;
      state.get_vehicle_accidents_error = action.payload as string;
      showErrorToast(action.payload as string);
    });

    // Update Vehicle Accident handlers
    builder.addCase(updateVehicleAccidentAsync.pending, state => {
      state.update_vehicle_accident_status = ASYNC_STATUS.LOADING;
    });
    builder.addCase(
      updateVehicleAccidentAsync.fulfilled,
      (state, { payload }) => {
        state.update_vehicle_accident_status = ASYNC_STATUS.SUCCEEDED;
        state.update_vehicle_accident_data = payload;
        showSuccessToast(payload?.message || 'Accident updated successfully');
      },
    );
    builder.addCase(updateVehicleAccidentAsync.rejected, (state, action) => {
      state.update_vehicle_accident_status = ASYNC_STATUS.ERROR;
      state.update_vehicle_accident_error = action.payload as string;
      showErrorToast(action.payload as string);
    });

    // Delete Vehicle Accident handlers
    builder.addCase(deleteVehicleAccidentAsync.pending, state => {
      state.delete_vehicle_accident_status = ASYNC_STATUS.LOADING;
    });
    builder.addCase(
      deleteVehicleAccidentAsync.fulfilled,
      (state, { payload }) => {
        state.delete_vehicle_accident_status = ASYNC_STATUS.SUCCEEDED;
        state.delete_vehicle_accident_data = payload;
        showSuccessToast(payload?.message || 'Accident deleted successfully');
      },
    );
    builder.addCase(deleteVehicleAccidentAsync.rejected, (state, action) => {
      state.delete_vehicle_accident_status = ASYNC_STATUS.ERROR;
      state.delete_vehicle_accident_error = action.payload as string;
      showErrorToast(action.payload as string);
    });

    // Mark Vehicle As Sold handlers
    builder.addCase(markVehicleAsSoldAsync.pending, state => {
      state.mark_vehicle_as_sold_status = ASYNC_STATUS.LOADING;
    });
    builder.addCase(markVehicleAsSoldAsync.fulfilled, (state, { payload }) => {
      state.mark_vehicle_as_sold_status = ASYNC_STATUS.SUCCEEDED;
      state.mark_vehicle_as_sold_data = payload;
      showSuccessToast('Vehicle marked as sold successfully');
    });
    builder.addCase(markVehicleAsSoldAsync.rejected, (state, action) => {
      state.mark_vehicle_as_sold_status = ASYNC_STATUS.ERROR;
      state.mark_vehicle_as_sold_error = action.payload as string;
      showErrorToast(action.payload as string);
    });

    // Share Vehicle handlers
    builder.addCase(shareVehicleAsync.pending, state => {
      state.share_vehicle_status = ASYNC_STATUS.LOADING;
    });
    builder.addCase(shareVehicleAsync.fulfilled, (state, { payload }) => {
      state.share_vehicle_status = ASYNC_STATUS.SUCCEEDED;
      state.share_vehicle_data = payload;
      showSuccessToast(payload?.message || 'Vehicle shared successfully');
    });
    builder.addCase(shareVehicleAsync.rejected, (state, action) => {
      state.share_vehicle_status = ASYNC_STATUS.ERROR;
      state.share_vehicle_error = action.payload as string;
      showErrorToast(action.payload as string);
    });

    // Get Businesses By Username handlers
    builder.addCase(getBusinessesByUsernameAsync.pending, state => {
      state.get_businesses_by_username_status = ASYNC_STATUS.LOADING;
    });
    builder.addCase(
      getBusinessesByUsernameAsync.fulfilled,
      (state, { payload }) => {
        state.get_businesses_by_username_status = ASYNC_STATUS.SUCCEEDED;
        state.get_businesses_by_username_data = payload;
      },
    );
    builder.addCase(getBusinessesByUsernameAsync.rejected, (state, action) => {
      state.get_businesses_by_username_status = ASYNC_STATUS.ERROR;
      state.get_businesses_by_username_error = action.payload as string;
      showErrorToast(action.payload as string);
    });

    // Get Incoming Vehicle Transfers handlers
    builder.addCase(getIncomingVehicleTransfersAsync.pending, state => {
      state.incoming_vehicle_transfers_status = ASYNC_STATUS.LOADING;
    });
    builder.addCase(
      getIncomingVehicleTransfersAsync.fulfilled,
      (state, { payload }) => {
        state.incoming_vehicle_transfers_status = ASYNC_STATUS.SUCCEEDED;
        state.incoming_vehicle_transfers_data = payload;
      },
    );
    builder.addCase(
      getIncomingVehicleTransfersAsync.rejected,
      (state, action) => {
        state.incoming_vehicle_transfers_status = ASYNC_STATUS.ERROR;
        state.incoming_vehicle_transfers_error = action.payload as string;
        showErrorToast(action.payload as string);
      },
    );

    // Accept Vehicle Transfer handlers
    builder.addCase(acceptVehicleTransferAsync.pending, state => {
      state.accept_vehicle_transfer_status = ASYNC_STATUS.LOADING;
    });
    builder.addCase(
      acceptVehicleTransferAsync.fulfilled,
      (state, { payload }) => {
        state.accept_vehicle_transfer_status = ASYNC_STATUS.SUCCEEDED;
        state.accept_vehicle_transfer_data = payload;
        showSuccessToast(
          payload?.message || 'Vehicle transfer accepted successfully',
        );
      },
    );
    builder.addCase(acceptVehicleTransferAsync.rejected, (state, action) => {
      state.accept_vehicle_transfer_status = ASYNC_STATUS.ERROR;
      state.accept_vehicle_transfer_error = action.payload as string;
      showErrorToast(action.payload as string);
    });

    // Reject Vehicle Transfer handlers
    builder.addCase(rejectVehicleTransferAsync.pending, state => {
      state.reject_vehicle_transfer_status = ASYNC_STATUS.LOADING;
    });
    builder.addCase(
      rejectVehicleTransferAsync.fulfilled,
      (state, { payload }) => {
        state.reject_vehicle_transfer_status = ASYNC_STATUS.SUCCEEDED;
        state.reject_vehicle_transfer_data = payload;
        showSuccessToast(
          payload?.message || 'Vehicle transfer rejected successfully',
        );
      },
    );
    builder.addCase(rejectVehicleTransferAsync.rejected, (state, action) => {
      state.reject_vehicle_transfer_status = ASYNC_STATUS.ERROR;
      state.reject_vehicle_transfer_error = action.payload as string;
      showErrorToast(action.payload as string);
    });

    builder.addCase(vehicleSaleTransferAsync.pending, state => {
      state.vehicle_sale_transfer_status = ASYNC_STATUS.LOADING;
    });
    builder.addCase(vehicleSaleTransferAsync.fulfilled, (state, { payload }) => {
      state.vehicle_sale_transfer_status = ASYNC_STATUS.SUCCEEDED;
      state.vehicle_sale_transfer_data = payload.transfer;
      showSuccessToast(payload?.message || 'Vehicle sale transfer successful');
    });
    builder.addCase(vehicleSaleTransferAsync.rejected, (state, action) => {
      state.vehicle_sale_transfer_status = ASYNC_STATUS.ERROR;
      state.vehicle_sale_transfer_error = action.payload as string;
      showErrorToast(action.payload as string);
    });

    builder.addCase(updateVehicleSaleTransferAsync.pending, state => {
      state.update_vehicle_sale_transfer_status = ASYNC_STATUS.LOADING;
    });
    builder.addCase(updateVehicleSaleTransferAsync.fulfilled, (state, { payload }) => {
      state.update_vehicle_sale_transfer_status = ASYNC_STATUS.SUCCEEDED;
      state.update_vehicle_sale_transfer_data = payload.transfer;
      showSuccessToast(payload?.message || 'Vehicle sale transfer successful');
    });
    builder.addCase(updateVehicleSaleTransferAsync.rejected, (state, action) => {
      state.update_vehicle_sale_transfer_status = ASYNC_STATUS.ERROR;
      state.update_vehicle_sale_transfer_error = action.payload as string;
      showErrorToast(action.payload as string);
    });
  },
});

export const {
  setAddRealStateOverviewStatus,
  setUpdateRealStateOverviewStatus,
  setDeleteRealStateOverviewStatus,
  setAddRealStateLoanMortgageStatus,
  setUpdateRealStateLoanMortgageStatus,
  setDeleteRealStateLoanMortgageStatus,
  setAddRealStateUtilitiesStatus,
  setUpdateRealStateUtilitiesStatus,
  setDeleteRealStateUtilitiesStatus,
  setAddRealStateInsuranceStatus,
  setUpdateRealStateInsuranceStatus,
  setDeleteRealStateInsuranceStatus,
  setAddRealStateWarrantiesStatus,
  setUpdateRealStateWarrantiesStatus,
  setDeleteRealStateWarrantiesStatus,
  setAddRealStatePersonalPropertyStatus,
  setUpdateRealStatePersonalPropertyStatus,
  setDeleteRealStatePersonalPropertyStatus,
  resetUpdateVehicleSaleTransferStatus,
  setAddRealStateServiceWorkHistoryStatus,
  setUpdateRealStateServiceWorkHistoryStatus,
  setDeleteRealStateServiceWorkHistoryStatus,
  setAddPersonalPropertyStatus,
  setGetPersonalPropertyStatus,
  setGetPersonalPropertyByIdStatus,
  setUpdatePersonalPropertyStatus,
  setDeletePersonalPropertyStatus,
  setMovePersonalPropertyStatus,
  setGetBankAccountStatus,
  setAddVehicleStatus,
  resetVehicleSaleTransferStatus,
  setUpdateVehicleStatus,
  setAddVehicleServiceRecordsStatus,
  setUpdateVehicleServiceRecordsStatus,
  setUpdateVehicleAccidentStatus,
  setAddVehicleAccidentStatus,
  resetGetVehicleByIdData,
  resetMarkVehicleAsSoldStatus,
  resetShareVehicleStatus,
  resetGetBusinessesByUsernameData,
  resetIncomingVehicleTransfersStatus,
  resetAcceptVehicleTransferStatus,
  resetRejectVehicleTransferStatus,
} = assetsSlice.actions;
export default assetsSlice.reducer;
