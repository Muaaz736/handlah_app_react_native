import { createSlice } from '@reduxjs/toolkit';
import {
  showErrorToast,
  showSuccessToast,
} from '../../components/common';
import {
  getBusinessProjectsAsync,
  addBusinessProjectAsync,
  updateBusinessProjectAsync,
  deleteBusinessProjectAsync,
} from '../services/businessProjectsService';
import { ASYNC_STATUS } from '../../config/constants';
import { 
  BusinessProjectsState, 
  BusinessProjectItemAPI, 
  BusinessProjectItem 
} from '../../types/reduxTypes/businessProjectsSlice.types';

// Transform API response to app format
const transformProjectFromAPI = (apiProject: BusinessProjectItemAPI): BusinessProjectItem => ({
  id: apiProject.id,
  businessId: apiProject.businessid,
  clientIds: apiProject.clientids || [],
  clients: (apiProject.clients || []).map(c => ({ clientId: c.clientid, name: c.name, email: c.email })),
  projectName: apiProject.projectname,
  description: apiProject.description || '',
  startDate: apiProject.startdate,
  endDate: apiProject.enddate,
  projectStatus: apiProject.projectstatus,
  additionalDetails: apiProject.additionaldetails || '',
  notes: apiProject.notes || '',
  attachmentUrls: apiProject.attachmenturls || [],
  amount: apiProject.amount || 0,
});

const initialState: BusinessProjectsState = {
  // Get business projects
  get_business_projects_status: ASYNC_STATUS.IDLE,
  get_business_projects_data: [],
  get_business_projects_error: null,

  // Add business project
  add_business_project_status: ASYNC_STATUS.IDLE,
  add_business_project_data: null,
  add_business_project_error: null,

  // Update business project
  update_business_project_status: ASYNC_STATUS.IDLE,
  update_business_project_data: null,
  update_business_project_error: null,

  // Delete business project
  delete_business_project_status: ASYNC_STATUS.IDLE,
  delete_business_project_error: null,
};

const businessProjectsSlice = createSlice({
  name: 'businessProjects',
  initialState,
  reducers: {
    resetAddBusinessProjectStatus: (state) => {
      state.add_business_project_status = ASYNC_STATUS.IDLE;
      state.add_business_project_error = null;
    },
    resetUpdateBusinessProjectStatus: (state) => {
      state.update_business_project_status = ASYNC_STATUS.IDLE;
      state.update_business_project_error = null;
    },
    resetDeleteBusinessProjectStatus: (state) => {
      state.delete_business_project_status = ASYNC_STATUS.IDLE;
      state.delete_business_project_error = null;
    },
  },
  extraReducers: (builder) => {
    // =========>>>>>>> Get Business Projects
    builder
      .addCase(getBusinessProjectsAsync.pending, (state) => {
        state.get_business_projects_status = ASYNC_STATUS.LOADING;
      })
      .addCase(getBusinessProjectsAsync.fulfilled, (state, action) => {
        state.get_business_projects_status = ASYNC_STATUS.SUCCEEDED;
        // Transform array of API projects to app format
        state.get_business_projects_data = action.payload.map(transformProjectFromAPI);
      })
      .addCase(getBusinessProjectsAsync.rejected, (state, action) => {
        state.get_business_projects_status = ASYNC_STATUS.ERROR;
        state.get_business_projects_error = action.error.message || 'Failed to fetch projects';
        showErrorToast(action.error.message || 'Failed to fetch projects');
      });

    // =========>>>>>>> Add Business Project
    builder
      .addCase(addBusinessProjectAsync.pending, (state) => {
        state.add_business_project_status = ASYNC_STATUS.LOADING;
      })
      .addCase(addBusinessProjectAsync.fulfilled, (state, action) => {
        state.add_business_project_status = ASYNC_STATUS.SUCCEEDED;
        const transformedProject = transformProjectFromAPI(action.payload);
        state.add_business_project_data = transformedProject;
        // Add to list
        state.get_business_projects_data.push(transformedProject);
        showSuccessToast('Business project added successfully');
      })
      .addCase(addBusinessProjectAsync.rejected, (state, action) => {
        state.add_business_project_status = ASYNC_STATUS.ERROR;
        state.add_business_project_error = action.error.message || 'Failed to add project';
        showErrorToast(action.error.message || 'Failed to add project');
      });

    // =========>>>>>>> Update Business Project
    builder
      .addCase(updateBusinessProjectAsync.pending, (state) => {
        state.update_business_project_status = ASYNC_STATUS.LOADING;
      })
      .addCase(updateBusinessProjectAsync.fulfilled, (state, action) => {
        state.update_business_project_status = ASYNC_STATUS.SUCCEEDED;
        const transformedProject = transformProjectFromAPI(action.payload);
        state.update_business_project_data = transformedProject;
        // Update in list
        const index = state.get_business_projects_data.findIndex(p => p.id === transformedProject.id);
        if (index !== -1) {
          state.get_business_projects_data[index] = transformedProject;
        }
        showSuccessToast('Business project updated successfully');
      })
      .addCase(updateBusinessProjectAsync.rejected, (state, action) => {
        state.update_business_project_status = ASYNC_STATUS.ERROR;
        state.update_business_project_error = action.error.message || 'Failed to update project';
        showErrorToast(action.error.message || 'Failed to update project');
      });

    // =========>>>>>>> Delete Business Project
    builder
      .addCase(deleteBusinessProjectAsync.pending, (state) => {
        state.delete_business_project_status = ASYNC_STATUS.LOADING;
      })
      .addCase(deleteBusinessProjectAsync.fulfilled, (state, action) => {
        state.delete_business_project_status = ASYNC_STATUS.SUCCEEDED;
        // Remove from list - action.meta.arg contains the id
        state.get_business_projects_data = state.get_business_projects_data.filter(
          p => p.id !== action.meta.arg
        );
        showSuccessToast('Business project deleted successfully');
      })
      .addCase(deleteBusinessProjectAsync.rejected, (state, action) => {
        state.delete_business_project_status = ASYNC_STATUS.ERROR;
        state.delete_business_project_error = action.error.message || 'Failed to delete project';
        showErrorToast(action.error.message || 'Failed to delete project');
      });
  },
});

export const {
  resetAddBusinessProjectStatus,
  resetUpdateBusinessProjectStatus,
  resetDeleteBusinessProjectStatus,
} = businessProjectsSlice.actions;

export default businessProjectsSlice.reducer;
