import { createSlice, PayloadAction } from '@reduxjs/toolkit';

export interface BusinessOnboardingState {
  // Step 01 & 02 - Life situation selections (business-specific)
  lifeSelections: string[];

  // Step 03 - Frustrations
  frustrationSelections: string[];

  // Step 03 - Reminder preferences
  reminderPreferences: string[];

  // Step 04 - What user already has
  existingItems: {
    scannedDocs?: string[];
    uploadedFiles?: string[];
    aiScanData?: string;
  };

  // Current step (1-5 for business flow)
  currentStep: number;

  // All accumulated items for dashboard
  accumulatedItems: Array<{
    type: string;
    name: string;
    category: string;
  }>;
}

const initialState: BusinessOnboardingState = {
  lifeSelections: [],
  frustrationSelections: [],
  reminderPreferences: [],
  existingItems: {},
  currentStep: 1,
  accumulatedItems: [],
};

const businessOnboardingSlice = createSlice({
  name: 'businessOnboarding',
  initialState,
  reducers: {
    setBusinessLifeSelections: (state, action: PayloadAction<string[]>) => {
      state.lifeSelections = action.payload;
    },

    setBusinessFrustrationSelections: (state, action: PayloadAction<string[]>) => {
      state.frustrationSelections = action.payload;
    },

    setBusinessReminderPreferences: (state, action: PayloadAction<string[]>) => {
      state.reminderPreferences = action.payload;
    },

    setBusinessExistingItems: (
      state,
      action: PayloadAction<BusinessOnboardingState['existingItems']>,
    ) => {
      state.existingItems = action.payload;
    },

    setBusinessCurrentStep: (state, action: PayloadAction<number>) => {
      state.currentStep = action.payload;
    },

    addBusinessAccumulatedItem: (
      state,
      action: PayloadAction<{ type: string; name: string; category: string }>,
    ) => {
      state.accumulatedItems.push(action.payload);
    },

    resetBusinessForNextItem: (state) => {
      state.lifeSelections = [];
      state.frustrationSelections = [];
      state.reminderPreferences = [];
      state.existingItems = {};
      state.currentStep = 1;
    },

    resetBusinessOnboarding: () => {
      return initialState;
    },
  },
});

export const {
  setBusinessLifeSelections,
  setBusinessFrustrationSelections,
  setBusinessReminderPreferences,
  setBusinessExistingItems,
  setBusinessCurrentStep,
  addBusinessAccumulatedItem,
  resetBusinessForNextItem,
  resetBusinessOnboarding,
} = businessOnboardingSlice.actions;

export default businessOnboardingSlice.reducer;
