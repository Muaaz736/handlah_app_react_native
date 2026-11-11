import { createSlice } from '@reduxjs/toolkit';
import {
    showErrorToast,
    showSuccessToast,
} from '../../components/common';

import { ASYNC_STATUS } from '../../config/constants';
import { addLoanAsync, deleteLoanAsync, getLoanAsync, linkLoanAsync, updateLoanAsync, getUtilitiesAsync, addUtilityAsync, updateUtilityAsync, deleteUtilityAsync, linkUtilityAsync, getInsurancesAsync, addInsuranceAsync, addInsurancesBulkAsync, updateInsuranceAsync, deleteInsuranceAsync, linkInsuranceAsync, getWarrantiesAsync, addWarrantyAsync, addWarrantiesBulkAsync, updateWarrantyAsync, deleteWarrantyAsync, linkWarrantyAsync } from '../services/liabilitiesService';
import { LiabilitiesState } from '../../types/reduxTypes/liabilities.types';

const initialState: LiabilitiesState = {


    get_loan_status: ASYNC_STATUS.IDLE,
    get_loan_data: null,
    get_loan_error: null,

    add_loan_status: ASYNC_STATUS.IDLE,
    add_loan_data: null,
    add_loan_error: null,

    update_loan_status: ASYNC_STATUS.IDLE,
    update_loan_data: null,
    update_loan_error: null,

    delete_loan_status: ASYNC_STATUS.IDLE,
    delete_loan_data: null,
    delete_loan_error: null,

    link_loan_status: ASYNC_STATUS.IDLE,
    link_loan_data: null,
    link_loan_error: null,

    add_loans_bulk_status: ASYNC_STATUS.IDLE,
    add_loans_bulk_data: null,
    add_loans_bulk_error: null,

    // Utilities Initial State

    get_utilities_status: ASYNC_STATUS.IDLE,
    get_utilities_data: null,
    get_utilities_error: null,

    add_utility_status: ASYNC_STATUS.IDLE,
    add_utility_data: null,
    add_utility_error: null,

    update_utility_status: ASYNC_STATUS.IDLE,
    update_utility_data: null,
    update_utility_error: null,

    delete_utility_status: ASYNC_STATUS.IDLE,
    delete_utility_data: null,
    delete_utility_error: null,

    link_utility_status: ASYNC_STATUS.IDLE,
    link_utility_data: null,
    link_utility_error: null,

    // Insurance Initial State

    get_insurances_status: ASYNC_STATUS.IDLE,
    get_insurances_data: null,
    get_insurances_error: null,

    add_insurance_status: ASYNC_STATUS.IDLE,
    add_insurance_data: null,
    add_insurance_error: null,

    update_insurance_status: ASYNC_STATUS.IDLE,
    update_insurance_data: null,
    update_insurance_error: null,

    delete_insurance_status: ASYNC_STATUS.IDLE,
    delete_insurance_data: null,
    delete_insurance_error: null,

    link_insurance_status: ASYNC_STATUS.IDLE,
    link_insurance_data: null,
    link_insurance_error: null,

    add_insurances_bulk_status: ASYNC_STATUS.IDLE,
    add_insurances_bulk_data: null,
    add_insurances_bulk_error: null,

    // Warranties Initial State

    get_warranties_status: ASYNC_STATUS.IDLE,
    get_warranties_data: null,
    get_warranties_error: null,

    add_warranty_status: ASYNC_STATUS.IDLE,
    add_warranty_data: null,
    add_warranty_error: null,

    update_warranty_status: ASYNC_STATUS.IDLE,
    update_warranty_data: null,
    update_warranty_error: null,

    delete_warranty_status: ASYNC_STATUS.IDLE,
    delete_warranty_data: null,
    delete_warranty_error: null,

    link_warranty_status: ASYNC_STATUS.IDLE,
    link_warranty_data: null,
    link_warranty_error: null,

    add_warranties_bulk_status: ASYNC_STATUS.IDLE,
    add_warranties_bulk_data: null,
    add_warranties_bulk_error: null,

};

const liabilitiesSlice = createSlice({
    name: 'liabilities_slice',
    initialState: initialState,
    reducers: {
        setAddLoanStatus: (state) => {
            state.add_loan_status = ASYNC_STATUS.IDLE;
        },
        setUpdateLoanStatus: (state) => {
            state.update_loan_status = ASYNC_STATUS.IDLE;
        },
        setDeleteLoanStatus: (state) => {
            state.delete_loan_status = ASYNC_STATUS.IDLE;
        },
        setLinkLoanStatus: (state) => {
            state.link_loan_status = ASYNC_STATUS.IDLE;
        },
        setAddInsuranceStatus: (state) => {
            state.add_insurance_status = ASYNC_STATUS.IDLE;
        },
        setUpdateInsuranceStatus: (state) => {
            state.update_insurance_status = ASYNC_STATUS.IDLE;
        },
        setDeleteInsuranceStatus: (state) => {
            state.delete_insurance_status = ASYNC_STATUS.IDLE;
        },
        setLinkInsuranceStatus: (state) => {
            state.link_insurance_status = ASYNC_STATUS.IDLE;
        },
        setAddWarrantyStatus: (state) => {
            state.add_warranty_status = ASYNC_STATUS.IDLE;
        },
        setUpdateWarrantyStatus: (state) => {
            state.update_warranty_status = ASYNC_STATUS.IDLE;
        },
        setDeleteWarrantyStatus: (state) => {
            state.delete_warranty_status = ASYNC_STATUS.IDLE;
        },
        setLinkWarrantyStatus: (state) => {
            state.link_warranty_status = ASYNC_STATUS.IDLE;
        },
        setLinkUtilityStatus: (state) => {
            state.link_utility_status = ASYNC_STATUS.IDLE;
        },
    },
    extraReducers: builder => {

        // =========>>>>>>> loan CRUD Handlers

        // Get loan GET handlers
        builder.addCase(getLoanAsync.pending, (state) => {
            state.get_loan_status = ASYNC_STATUS.LOADING;
        });
        builder.addCase(getLoanAsync.fulfilled, (state, { payload }) => {
            state.get_loan_status = ASYNC_STATUS.SUCCEEDED;
            state.get_loan_data = payload;
        });
        builder.addCase(getLoanAsync.rejected, (state, action) => {
            state.get_loan_status = ASYNC_STATUS.ERROR;
            state.get_loan_error = action.payload as string;
            showErrorToast(action.payload as string);
        });

        // Create Legal Document POST handlers
        builder.addCase(addLoanAsync.pending, (state) => {
            state.add_loan_status = ASYNC_STATUS.LOADING;
        });
        builder.addCase(addLoanAsync.fulfilled, (state, { payload }) => {
            state.add_loan_status = ASYNC_STATUS.SUCCEEDED;
            state.add_loan_data = payload;
            showSuccessToast(payload?.message || 'Loan added successfully');
        });
        builder.addCase(addLoanAsync.rejected, (state, action) => {
            state.add_loan_status = ASYNC_STATUS.ERROR;
            state.add_loan_error = action.payload as string;
            showErrorToast(action.payload as string);
        });

        // Update Loan PUT handlers
        builder.addCase(updateLoanAsync.pending, (state) => {
            state.update_loan_status = ASYNC_STATUS.LOADING;
        });
        builder.addCase(updateLoanAsync.fulfilled, (state, { payload }) => {
            state.update_loan_status = ASYNC_STATUS.SUCCEEDED;
            state.update_loan_data = payload;
            showSuccessToast(payload?.message || 'Loan updated successfully');
        });
        builder.addCase(updateLoanAsync.rejected, (state, action) => {
            state.update_loan_status = ASYNC_STATUS.ERROR;
            state.update_loan_error = action.payload as string;
            showErrorToast(action.payload as string);
        });

        // Delete Loan DELETE handlers
        builder.addCase(deleteLoanAsync.pending, (state) => {
            state.delete_loan_status = ASYNC_STATUS.LOADING;
        });
        builder.addCase(deleteLoanAsync.fulfilled, (state, { payload }) => {
            state.delete_loan_status = ASYNC_STATUS.SUCCEEDED;
            state.delete_loan_data = payload;
            showSuccessToast(payload?.message || 'Loan deleted successfully');
        });
        builder.addCase(deleteLoanAsync.rejected, (state, action) => {
            state.delete_loan_status = ASYNC_STATUS.ERROR;
            state.delete_loan_error = action.payload as string;
            showErrorToast(action.payload as string);
        });

        // Link Loan PUT handlers
        builder.addCase(linkLoanAsync.pending, (state) => {
            state.link_loan_status = ASYNC_STATUS.LOADING;
        });
        builder.addCase(linkLoanAsync.fulfilled, (state, { payload }) => {
            state.link_loan_status = ASYNC_STATUS.SUCCEEDED;
            state.link_loan_data = payload;
            showSuccessToast(payload?.message || 'Loan linked successfully');
        });
        builder.addCase(linkLoanAsync.rejected, (state, action) => {
            state.link_loan_status = ASYNC_STATUS.ERROR;
            state.link_loan_error = action.payload as string;
            showErrorToast(action.payload as string);
        });

        // Add Loans Bulk POST handlers
        // builder.addCase(addLoanAsync.pending, (state) => {
        //     state.add_loans_bulk_status = ASYNC_STATUS.LOADING;
        // });
        // builder.addCase(addLoanAsync.fulfilled, (state, { payload }) => {
        //     state.add_loans_bulk_status = ASYNC_STATUS.SUCCEEDED;
        //     state.add_loans_bulk_data = payload;
        //     showSuccessToast(payload?.message || 'Loans added successfully');
        // });
        // builder.addCase(addLoanAsync.rejected, (state, action) => {
        //     state.add_loans_bulk_status = ASYNC_STATUS.ERROR;
        //     state.add_loans_bulk_error = action.payload as string;
        //     showErrorToast(action.payload as string);
        // });

        // =========>>>>>>> Utilities CRUD Handlers

        // Get Utilities GET handlers
        builder.addCase(getUtilitiesAsync.pending, (state) => {
            state.get_utilities_status = ASYNC_STATUS.LOADING;
        });
        builder.addCase(getUtilitiesAsync.fulfilled, (state, { payload }) => {
            state.get_utilities_status = ASYNC_STATUS.SUCCEEDED;
            state.get_utilities_data = payload;
        });
        builder.addCase(getUtilitiesAsync.rejected, (state, action) => {
            state.get_utilities_status = ASYNC_STATUS.ERROR;
            state.get_utilities_error = action.payload as string;
            showErrorToast(action.payload as string);
        });

        // Add Utility POST handlers
        builder.addCase(addUtilityAsync.pending, (state) => {
            state.add_utility_status = ASYNC_STATUS.LOADING;
        });
        builder.addCase(addUtilityAsync.fulfilled, (state, { payload }) => {
            state.add_utility_status = ASYNC_STATUS.SUCCEEDED;
            state.add_utility_data = payload;
            showSuccessToast(payload?.message || 'Utility added successfully');
        });
        builder.addCase(addUtilityAsync.rejected, (state, action) => {
            state.add_utility_status = ASYNC_STATUS.ERROR;
            state.add_utility_error = action.payload as string;
            showErrorToast(action.payload as string);
        });

        // Update Utility PUT handlers
        builder.addCase(updateUtilityAsync.pending, (state) => {
            state.update_utility_status = ASYNC_STATUS.LOADING;
        });
        builder.addCase(updateUtilityAsync.fulfilled, (state, { payload }) => {
            state.update_utility_status = ASYNC_STATUS.SUCCEEDED;
            state.update_utility_data = payload;
            showSuccessToast(payload?.message || 'Utility updated successfully');
        });
        builder.addCase(updateUtilityAsync.rejected, (state, action) => {
            state.update_utility_status = ASYNC_STATUS.ERROR;
            state.update_utility_error = action.payload as string;
            showErrorToast(action.payload as string);
        });

        // Delete Utility DELETE handlers
        builder.addCase(deleteUtilityAsync.pending, (state) => {
            state.delete_utility_status = ASYNC_STATUS.LOADING;
        });
        builder.addCase(deleteUtilityAsync.fulfilled, (state, { payload }) => {
            state.delete_utility_status = ASYNC_STATUS.SUCCEEDED;
            state.delete_utility_data = payload;
            showSuccessToast(payload?.message || 'Utility deleted successfully');
        });
        builder.addCase(deleteUtilityAsync.rejected, (state, action) => {
            state.delete_utility_status = ASYNC_STATUS.ERROR;
            state.delete_utility_error = action.payload as string;
            showErrorToast(action.payload as string);
        });

        // Link Utility PUT handlers
        builder.addCase(linkUtilityAsync.pending, (state) => {
            state.link_utility_status = ASYNC_STATUS.LOADING;
        });
        builder.addCase(linkUtilityAsync.fulfilled, (state, { payload }) => {
            state.link_utility_status = ASYNC_STATUS.SUCCEEDED;
            state.link_utility_data = payload;
            showSuccessToast(payload?.message || 'Utility linked successfully');
        });
        builder.addCase(linkUtilityAsync.rejected, (state, action) => {
            state.link_utility_status = ASYNC_STATUS.ERROR;
            state.link_utility_error = action.payload as string;
            showErrorToast(action.payload as string);
        });

        // =========>>>>>>> Insurance CRUD Handlers

        // Get Insurances GET handlers
        builder.addCase(getInsurancesAsync.pending, (state) => {
            state.get_insurances_status = ASYNC_STATUS.LOADING;
        });
        builder.addCase(getInsurancesAsync.fulfilled, (state, { payload }) => {
            state.get_insurances_status = ASYNC_STATUS.SUCCEEDED;
            state.get_insurances_data = payload;
        });
        builder.addCase(getInsurancesAsync.rejected, (state, action) => {
            state.get_insurances_status = ASYNC_STATUS.ERROR;
            state.get_insurances_error = action.payload as string;
            showErrorToast(action.payload as string);
        });

        // Add Insurance POST handlers
        builder.addCase(addInsuranceAsync.pending, (state) => {
            state.add_insurance_status = ASYNC_STATUS.LOADING;
        });
        builder.addCase(addInsuranceAsync.fulfilled, (state, { payload }) => {
            state.add_insurance_status = ASYNC_STATUS.SUCCEEDED;
            state.add_insurance_data = payload;
            showSuccessToast(payload?.message || 'Insurance added successfully');
        });
        builder.addCase(addInsuranceAsync.rejected, (state, action) => {
            state.add_insurance_status = ASYNC_STATUS.ERROR;
            state.add_insurance_error = action.payload as string;
            showErrorToast(action.payload as string);
        });

        // Update Insurance PUT handlers
        builder.addCase(updateInsuranceAsync.pending, (state) => {
            state.update_insurance_status = ASYNC_STATUS.LOADING;
        });
        builder.addCase(updateInsuranceAsync.fulfilled, (state, { payload }) => {
            state.update_insurance_status = ASYNC_STATUS.SUCCEEDED;
            state.update_insurance_data = payload;
            showSuccessToast(payload?.message || 'Insurance updated successfully');
        });
        builder.addCase(updateInsuranceAsync.rejected, (state, action) => {
            state.update_insurance_status = ASYNC_STATUS.ERROR;
            state.update_insurance_error = action.payload as string;
            showErrorToast(action.payload as string);
        });

        // Delete Insurance DELETE handlers
        builder.addCase(deleteInsuranceAsync.pending, (state) => {
            state.delete_insurance_status = ASYNC_STATUS.LOADING;
        });
        builder.addCase(deleteInsuranceAsync.fulfilled, (state, { payload }) => {
            state.delete_insurance_status = ASYNC_STATUS.SUCCEEDED;
            state.delete_insurance_data = payload;
            showSuccessToast(payload?.message || 'Insurance deleted successfully');
        });
        builder.addCase(deleteInsuranceAsync.rejected, (state, action) => {
            state.delete_insurance_status = ASYNC_STATUS.ERROR;
            state.delete_insurance_error = action.payload as string;
            showErrorToast(action.payload as string);
        });

        // Link Insurance PUT handlers
        builder.addCase(linkInsuranceAsync.pending, (state) => {
            state.link_insurance_status = ASYNC_STATUS.LOADING;
        });
        builder.addCase(linkInsuranceAsync.fulfilled, (state, { payload }) => {
            state.link_insurance_status = ASYNC_STATUS.SUCCEEDED;
            state.link_insurance_data = payload;
            showSuccessToast(payload?.message || 'Insurance linked successfully');
        });
        builder.addCase(linkInsuranceAsync.rejected, (state, action) => {
            state.link_insurance_status = ASYNC_STATUS.ERROR;
            state.link_insurance_error = action.payload as string;
            showErrorToast(action.payload as string);
        });

        // Add Insurances Bulk POST handlers
        builder.addCase(addInsurancesBulkAsync.pending, (state) => {
            state.add_insurances_bulk_status = ASYNC_STATUS.LOADING;
        });
        builder.addCase(addInsurancesBulkAsync.fulfilled, (state, { payload }) => {
            state.add_insurances_bulk_status = ASYNC_STATUS.SUCCEEDED;
            state.add_insurances_bulk_data = payload;
            showSuccessToast(payload?.message || 'Insurances added successfully');
        });
        builder.addCase(addInsurancesBulkAsync.rejected, (state, action) => {
            state.add_insurances_bulk_status = ASYNC_STATUS.ERROR;
            state.add_insurances_bulk_error = action.payload as string;
            showErrorToast(action.payload as string);
        });

        // =========>>>>>>> Warranties CRUD Handlers

        // Get Warranties GET handlers
        builder.addCase(getWarrantiesAsync.pending, (state) => {
            state.get_warranties_status = ASYNC_STATUS.LOADING;
        });
        builder.addCase(getWarrantiesAsync.fulfilled, (state, { payload }) => {
            state.get_warranties_status = ASYNC_STATUS.SUCCEEDED;
            state.get_warranties_data = payload;
        });
        builder.addCase(getWarrantiesAsync.rejected, (state, action) => {
            state.get_warranties_status = ASYNC_STATUS.ERROR;
            state.get_warranties_error = action.payload as string;
            showErrorToast(action.payload as string);
        });

        // Add Warranty POST handlers
        builder.addCase(addWarrantyAsync.pending, (state) => {
            state.add_warranty_status = ASYNC_STATUS.LOADING;
        });
        builder.addCase(addWarrantyAsync.fulfilled, (state, { payload }) => {
            state.add_warranty_status = ASYNC_STATUS.SUCCEEDED;
            state.add_warranty_data = payload;
            showSuccessToast(payload?.message || 'Warranty added successfully');
        });
        builder.addCase(addWarrantyAsync.rejected, (state, action) => {
            state.add_warranty_status = ASYNC_STATUS.ERROR;
            state.add_warranty_error = action.payload as string;
            showErrorToast(action.payload as string);
        });

        // Update Warranty PUT handlers
        builder.addCase(updateWarrantyAsync.pending, (state) => {
            state.update_warranty_status = ASYNC_STATUS.LOADING;
        });
        builder.addCase(updateWarrantyAsync.fulfilled, (state, { payload }) => {
            state.update_warranty_status = ASYNC_STATUS.SUCCEEDED;
            state.update_warranty_data = payload;
            showSuccessToast(payload?.message || 'Warranty updated successfully');
        });
        builder.addCase(updateWarrantyAsync.rejected, (state, action) => {
            state.update_warranty_status = ASYNC_STATUS.ERROR;
            state.update_warranty_error = action.payload as string;
            showErrorToast(action.payload as string);
        });

        // Delete Warranty DELETE handlers
        builder.addCase(deleteWarrantyAsync.pending, (state) => {
            state.delete_warranty_status = ASYNC_STATUS.LOADING;
        });
        builder.addCase(deleteWarrantyAsync.fulfilled, (state, { payload }) => {
            state.delete_warranty_status = ASYNC_STATUS.SUCCEEDED;
            state.delete_warranty_data = payload;
            showSuccessToast(payload?.message || 'Warranty deleted successfully');
        });
        builder.addCase(deleteWarrantyAsync.rejected, (state, action) => {
            state.delete_warranty_status = ASYNC_STATUS.ERROR;
            state.delete_warranty_error = action.payload as string;
            showErrorToast(action.payload as string);
        });

        // Link Warranty PUT handlers
        builder.addCase(linkWarrantyAsync.pending, (state) => {
            state.link_warranty_status = ASYNC_STATUS.LOADING;
        });
        builder.addCase(linkWarrantyAsync.fulfilled, (state, { payload }) => {
            state.link_warranty_status = ASYNC_STATUS.SUCCEEDED;
            state.link_warranty_data = payload;
            showSuccessToast(payload?.message || 'Warranty linked successfully');
        });
        builder.addCase(linkWarrantyAsync.rejected, (state, action) => {
            state.link_warranty_status = ASYNC_STATUS.ERROR;
            state.link_warranty_error = action.payload as string;
            showErrorToast(action.payload as string);
        });

        // Add Warranties Bulk POST handlers
        builder.addCase(addWarrantiesBulkAsync.pending, (state) => {
            state.add_warranties_bulk_status = ASYNC_STATUS.LOADING;
        });
        builder.addCase(addWarrantiesBulkAsync.fulfilled, (state, { payload }) => {
            state.add_warranties_bulk_status = ASYNC_STATUS.SUCCEEDED;
            state.add_warranties_bulk_data = payload;
            showSuccessToast(payload?.message || 'Warranties added successfully');
        });
        builder.addCase(addWarrantiesBulkAsync.rejected, (state, action) => {
            state.add_warranties_bulk_status = ASYNC_STATUS.ERROR;
            state.add_warranties_bulk_error = action.payload as string;
            showErrorToast(action.payload as string);
        });


    },
});

export const {
    setAddLoanStatus,
    setUpdateLoanStatus,
    setDeleteLoanStatus,
    setLinkLoanStatus,
    setAddInsuranceStatus,
    setUpdateInsuranceStatus,
    setDeleteInsuranceStatus,
    setLinkInsuranceStatus,
    setAddWarrantyStatus,
    setUpdateWarrantyStatus,
    setDeleteWarrantyStatus,
    setLinkWarrantyStatus,
    setLinkUtilityStatus,
} = liabilitiesSlice.actions;
export default liabilitiesSlice.reducer;