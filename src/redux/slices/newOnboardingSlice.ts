import { createSlice, PayloadAction } from '@reduxjs/toolkit';

export interface NewOnboardingState {
  // Step 00
  setupChoice: 'personal' | 'business' | 'both' | null;

  // Step 01 & 02 - Life situation selections
  lifeSelections: string[]; // e.g., ['own-house', 'own-vehicle', ...]

  // Step 03 - Frustrations
  frustrationSelections: string[]; // e.g., ['missing-dates', 'finding-things', ...]

  // Step 03 - Reminder preferences
  reminderPreferences: string[]; // e.g., ['aggressive', 'balanced', ...]

  // Step 04 - What user already has
  existingItems: {
    scannedDocs?: string[];
    uploadedFiles?: string[];
    aiScanData?: string;
  };

  // Current step
  currentStep: number; // 0-5

  // All accumulated items for dashboard
  accumulatedItems: Array<{
    type: string;
    name: string;
    category: string;
  }>;
}

const initialState: NewOnboardingState = {
  setupChoice: null,
  lifeSelections: [],
  frustrationSelections: [],
  reminderPreferences: [],
  existingItems: {},
  currentStep: 0,
  accumulatedItems: [],
};

const newOnboardingSlice = createSlice({
  name: 'newOnboarding',
  initialState,
  reducers: {
    setSetupChoice: (state, action: PayloadAction<'personal' | 'business' | 'both'>) => {
      state.setupChoice = action.payload;
    },

    setLifeSelections: (state, action: PayloadAction<string[]>) => {
      state.lifeSelections = action.payload;
    },

    setFrustrationSelections: (state, action: PayloadAction<string[]>) => {
      state.frustrationSelections = action.payload;
    },

    setReminderPreferences: (state, action: PayloadAction<string[]>) => {
      state.reminderPreferences = action.payload;
    },

    setExistingItems: (state, action: PayloadAction<NewOnboardingState['existingItems']>) => {
      state.existingItems = action.payload;
    },

    setCurrentStep: (state, action: PayloadAction<number>) => {
      state.currentStep = action.payload;
    },

    // Add item to accumulated items (called when user completes Step 04)
    addAccumulatedItem: (state, action: PayloadAction<{ type: string; name: string; category: string }>) => {
      state.accumulatedItems.push(action.payload);
    },

    // Reset life selections and frustration/reminder for "Add another item" flow
    resetForNextItem: (state) => {
      state.lifeSelections = [];
      state.frustrationSelections = [];
      state.reminderPreferences = [];
      state.existingItems = {};
      state.currentStep = 1; // Go back to Step 01
    },

    // Reset entire onboarding
    resetNewOnboarding: (state) => {
      return initialState;
    },

    // Complete onboarding and save
    setAccumulatedItems: (state, action: PayloadAction<NewOnboardingState['accumulatedItems']>) => {
      state.accumulatedItems = action.payload;
    },
  },
});

export const {
  setSetupChoice,
  setLifeSelections,
  setFrustrationSelections,
  setReminderPreferences,
  setExistingItems,
  setCurrentStep,
  addAccumulatedItem,
  resetForNextItem,
  resetNewOnboarding,
  setAccumulatedItems,
} = newOnboardingSlice.actions;

export default newOnboardingSlice.reducer;
