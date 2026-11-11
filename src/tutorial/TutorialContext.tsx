import React, {
    createContext,
    useCallback,
    useContext,
    useState,
} from 'react';
import { TutorialStep, SpotlightRect, SpotlightActionBox } from './tutorialTypes';
import { markTutorialComplete } from './tutorialStorage';
import AsyncStorage from '@react-native-async-storage/async-storage';

const NEXT_STEP: Record<TutorialStep, TutorialStep> = {
    you_are_all_set: 'spotlight_identity_hub',
    spotlight_identity_hub: 'spotlight_add_button',
    spotlight_add_button: 'spotlight_passport_choice',
    spotlight_passport_choice: 'passport_form_hint',
    passport_form_hint: 'passport_congratulations',
    passport_congratulations: 'halo_intro',
    halo_intro: 'spotlight_halo_fab',
    spotlight_halo_fab: 'spotlight_ai_assistant',
    spotlight_ai_assistant: 'amazing',
    amazing: 'spotlight_account_tab',
    spotlight_account_tab: 'spotlight_user_guide',
    spotlight_user_guide: 'spotlight_guide_module',
    spotlight_guide_module: 'guide_detail',
    guide_detail: 'complete',
    complete: 'complete',
};

// Context shape
export interface TutorialContextType {
    step: TutorialStep | null;
    spotlightRect: SpotlightRect | null;
    spotlightAction: SpotlightActionBox | null;
    initialize: () => Promise<void>;
    nextStep: () => void;
    skipTutorial: () => void;
    setSpotlightRect: (rect: SpotlightRect | null) => void;
    setSpotlightAction: (action: (() => void) | null) => void;
}

// Context & hook
const TutorialContext = createContext<TutorialContextType | null>(null);

export const useTutorialContext = (): TutorialContextType => {
    const ctx = useContext(TutorialContext);
    if (!ctx) {
        throw new Error('useTutorialContext must be used inside <TutorialProvider>');
    }
    return ctx;
};

// Provider
export const TutorialProvider: React.FC<{ children: React.ReactNode }> = ({
    children,
}) => {
    const [step, setStep] = useState<TutorialStep | null>(null);
    const [spotlightRect, setSpotlightRect] = useState<SpotlightRect | null>(null);
    // Box the action to prevent React from treating functions as state updaters.
    const [spotlightAction, _setSpotlightActionState] = useState<SpotlightActionBox | null>(null);

    const initialize = useCallback(async () => {
        const isNewUser = await AsyncStorage.getItem('tutorial_show') === 'true';
        if (isNewUser) {
            await AsyncStorage.removeItem('tutorial_show');
            setStep('you_are_all_set');
        }
    }, []);

    // nextStep
    const nextStep = useCallback(() => {
        // Clear spotlight data on every step transition
        setSpotlightRect(null);
        _setSpotlightActionState(null);

        setStep(prev => {
            if (!prev) return null;
            const next = NEXT_STEP[prev];
            if (next === 'complete') {
                markTutorialComplete();
                return 'complete';
            }
            return next;
        });
    }, []);

    // skipTutorial
    const skipTutorial = useCallback(() => {
        setStep(null);
        setSpotlightRect(null);
        _setSpotlightActionState(null);
        markTutorialComplete();
    }, []);

    // setSpotlightAction – boxes function so useState doesn't invoke it as updater
    const setSpotlightAction = useCallback((action: (() => void) | null) => {
        _setSpotlightActionState(action ? { fn: action } : null);
    }, []);

    return (
        <TutorialContext.Provider
            value={{
                step,
                spotlightRect,
                spotlightAction,
                initialize,
                nextStep,
                skipTutorial,
                setSpotlightRect,
                setSpotlightAction,
            }}
        >
            {children}
        </TutorialContext.Provider>
    );
};
