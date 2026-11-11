import { useNavigation } from '@react-navigation/native';
import React, { useCallback, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useDispatch, useSelector } from 'react-redux';
import { useUserRole } from '../../../../../hooks/useUserRole';
import {
    addAccumulatedItem,
    resetNewOnboarding,
    setCurrentStep
} from '../../../../../redux/slices/newOnboardingSlice';
import { AppDispatch } from '../../../../../types/store.types';
import { ICONS } from '../../../../../utils/Images';
import { DashboardPreviewLayout, Module } from '../../DashboardPreviewUI/DashboardPreviewUI';

// Personal module mapping (selection key → Module objects)
const MODULE_MAPPING: Record<string, Module[]> = {
    'own-house': [
        { id: 'real-estate', route: '/real-estate', name: 'Real Estate', icon: ICONS.REAL_ESTATE_ICON, category: 'Assets' },
    ],
    'own-vehicle': [
        { id: 'vehicles', route: '/vehicles', name: 'Vehicles', icon: ICONS.VEHICLE_ICON, category: 'Assets' },
    ],
    'cards-loans': [
        { id: 'banking',  route: '/banking-finance', name: 'Banking & Finance', icon: ICONS.BANKING_FINANCE_ICON, category: 'Assets' },
        { id: 'loans',    route: '/loans',            name: 'Loans',            icon: ICONS.LOANS_PAYMENT_ICON,  category: 'Liabilities' },
    ],
    'health-records': [
        { id: 'health-tracker', route: '/health-tracker', name: 'Health Tracker', icon: ICONS.HEALTH_TRACKER_ICON, category: 'Essentials' },
    ],
    'own-pet': [
        { id: 'pets', route: '/pets', name: 'Pets', icon: ICONS.PETS_ICON, category: 'Essentials' },
    ],
    'bills-payments': [
        { id: 'utilities', route: '/utilities', name: 'Utilities', icon: ICONS.UTILITIES_ICON, category: 'Liabilities' },
    ],
    'insurance-policies': [
        { id: 'insurance', route: '/insurances', name: 'Insurance', icon: ICONS.INSURANCE_ICON, category: 'Liabilities' },
    ],
    'maintenance': [
        { id: 'utilities-m', route: '/utilities', name: 'Utilities', icon: ICONS.UTILITIES_ICON, category: 'Liabilities' },
    ],
    'medical-records': [
        { id: 'health-tracker', route: '/health-tracker', name: 'Health Tracker', icon: ICONS.HEALTH_TRACKER_ICON, category: 'Essentials' },
    ],
    'important-docs': [
        { id: 'legal', route: '/legal', name: 'Legal', icon: ICONS.LEGAL_ICON, category: 'Essentials' },
    ],
    'compliance': [
        { id: 'compliance', route: '/business', name: 'Business', icon: ICONS.PROJECTS_ICON, category: 'Business' },
    ],
};

const NewOnboardingStep05: React.FC<{
    onBack: () => void;
    onComplete: () => void;
}> = ({ onBack, onComplete }) => {
    const dispatch        = useDispatch<AppDispatch>();
    const { t }           = useTranslation();
    const { themeColors } = useUserRole();
    const navigation      = useNavigation<any>();
    const [isSubmitting, setIsSubmitting] = useState(false);

    const lifeSelections: string[] = useSelector(
        (state: any) => state.newOnboarding_slice?.lifeSelections ?? [],
    );
    const frustrationSelections: string[] = useSelector(
        (state: any) => state.newOnboarding_slice?.frustrationSelections ?? [],
    );
    const reminderPreferences: string[] = useSelector(
        (state: any) => state.newOnboarding_slice?.reminderPreferences ?? [],
    );
    const accumulatedItems = useSelector(
        (state: any) => state.newOnboarding_slice?.accumulatedItems ?? [],
    );
    const setupChoice = useSelector(
        (state: any) => state.newOnboarding_slice?.setupChoice,
    );
    const isBothFlow = setupChoice === 'both';

    // Build deduplicated module list from user selections
    const generatedModules = useMemo<Module[]>(() => {
        const map = new Map<string, Module>();
        lifeSelections.forEach(sel => {
            (MODULE_MAPPING[sel] ?? []).forEach(mod => map.set(mod.id, mod));
        });
        return Array.from(map.values());
    }, [lifeSelections]);

    const handleAddAnotherItem = useCallback(() => {
        dispatch(addAccumulatedItem({
            type: 'personal',
            name: `Item ${accumulatedItems.length + 1}`,
            category: 'Personal',
        }));
        // dispatch(resetForNextItem());
        dispatch(setCurrentStep(4));
    }, [accumulatedItems, dispatch]);

    const handleSaveAndContinue = useCallback(async () => {
        if (isSubmitting) return;
        setIsSubmitting(true);
        try {
            if (isBothFlow) {
                // Personal done — proceed to Business onboarding next
                navigation.navigate('BusinessOnboarding');
            } else {
                // Personal-only — go to Dashboard
                dispatch(resetNewOnboarding());
                navigation.reset({ index: 0, routes: [{ name: 'Dashboard' }] });
            }
        } catch (_) {
            // noop
        } finally {
            setIsSubmitting(false);
        }
    }, [
        isSubmitting,
        isBothFlow,
        dispatch,
        navigation,
    ]);

    return (
        <DashboardPreviewLayout
            modules={generatedModules}
            accentColor={themeColors.primary}
            secondaryColor={themeColors.secondary}
            label="Personal"
            badge="Step 05 of 05"
            spaceType="Personal"
            saveLabel={isBothFlow ? 'Continue to Business' : t('onboarding.dashboard.save')}
            onSave={handleSaveAndContinue}
            isSaveLoading={isSubmitting}
            addAnotherLabel={t('onboarding.dashboard.add_another')}
            onAddAnother={handleAddAnotherItem}
        />
    );
};

export default NewOnboardingStep05;
