import React, { useCallback, useMemo, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import {
    resetBusinessForNextItem,
    setBusinessCurrentStep,
    addBusinessAccumulatedItem,
    resetBusinessOnboarding,
} from '../../../../../redux/slices/businessOnboardingSlice';
import { resetNewOnboarding } from '../../../../../redux/slices/newOnboardingSlice';
import { useUserRole } from '../../../../../hooks/useUserRole';
import { useNavigation } from '@react-navigation/native';
import { useTranslation } from 'react-i18next';
import { ICONS } from '../../../../../utils/Images';
import { DashboardPreviewLayout, Module } from '../../DashboardPreviewUI/DashboardPreviewUI';
import { AppDispatch } from '../../../../../types/store.types';
import { submitOnboardingAsync } from '../../../../../redux/services/onboardingService';
import { checkAuthAsync } from '../../../../../redux/services/authService';
import { buildBusinessPayload } from '../../../../../utils/onboardingTransforms';

// Business module mapping  (selection key → Module objects)

const BUSINESS_MODULE_MAPPING: Record<string, Module[]> = {
    'own-house': [
        { id: 'real-estate', route: '/real-estate', name: 'Real Estate', icon: ICONS.REAL_ESTATE_ICON, category: 'Assets' },
    ],
    'own-vehicle': [
        { id: 'vehicles', route: '/vehicles', name: 'Vehicles', icon: ICONS.VEHICLE_ICON, category: 'Assets' },
    ],
    'cards-loans': [
        { id: 'banking', route: '/banking-finance', name: 'Banking & Finance', icon: ICONS.BANKING_FINANCE_ICON, category: 'Assets' },
        { id: 'loans',   route: '/loans',           name: 'Loans',            icon: ICONS.LOANS_PAYMENT_ICON,  category: 'Liabilities' },
    ],
    'documents': [
        { id: 'legal', route: '/legal', name: 'Legal Documents', icon: ICONS.LEGAL_ICON, category: 'Essentials' },
    ],
    'projects': [
        { id: 'projects', route: '/business', name: 'Projects', icon: ICONS.PROJECTS_ICON, category: 'Business' },
    ],
    'business-contacts': [
        { id: 'business-contacts', route: '/business', name: 'Business Contacts', icon: ICONS.BUSINESS_CONTACT_ICON, category: 'Business' },
    ],
    'bills-payments': [
        { id: 'utilities', route: '/utilities', name: 'Utilities', icon: ICONS.UTILITIES_ICON, category: 'Liabilities' },
    ],
    'insurance-policies': [
        { id: 'insurance', route: '/insurances', name: 'Insurance', icon: ICONS.INSURANCE_ICON, category: 'Liabilities' },
    ],
    'maintenance': [
        { id: 'maintenance', route: '/utilities', name: 'Maintenance', icon: ICONS.UTILITIES_ICON, category: 'Liabilities' },
    ],
    'licenses': [
        { id: 'licenses', route: '/business', name: 'Licenses', icon: ICONS.COMPLIANCE_VAULT_ICON, category: 'Business' },
    ],
    'important-docs': [
        { id: 'important-docs', route: '/legal', name: 'Important Docs', icon: ICONS.LEGAL_ICON, category: 'Essentials' },
    ],
    'compliance': [
        { id: 'compliance', route: '/business', name: 'Compliance', icon: ICONS.COMPLIANCE_VAULT_ICON, category: 'Business' },
    ],
};

// Component

const BusinessStep05: React.FC<{
    onBack: () => void;
    onComplete: () => void;
}> = ({ onBack, onComplete }) => {
    const dispatch        = useDispatch<AppDispatch>();
    const { t }           = useTranslation();
    const { themeColors } = useUserRole();
    const navigation      = useNavigation<any>();
    const [isSubmitting, setIsSubmitting] = useState(false);

    const lifeSelections: string[] = useSelector(
        (state: any) => state.businessOnboarding_slice?.lifeSelections ?? [],
    );
    const frustrationSelections: string[] = useSelector(
        (state: any) => state.businessOnboarding_slice?.frustrationSelections ?? [],
    );
    const reminderPreferences: string[] = useSelector(
        (state: any) => state.businessOnboarding_slice?.reminderPreferences ?? [],
    );
    const accumulatedItems = useSelector(
        (state: any) => state.businessOnboarding_slice?.accumulatedItems ?? [],
    );
    const setupChoice = useSelector(
        (state: any) => state.newOnboarding_slice?.setupChoice,
    );
    const selectedBusinessId = useSelector(
        (state: any) => state.business_slice?.selectedBusinessId ?? null,
    );
    const isBothFlow = setupChoice === 'both';

    // Build deduplicated module list from business selections
    const generatedModules = useMemo<Module[]>(() => {
        const map = new Map<string, Module>();
        lifeSelections.forEach(sel => {
            (BUSINESS_MODULE_MAPPING[sel] ?? []).forEach(mod => map.set(mod.id, mod));
        });
        return Array.from(map.values());
    }, [lifeSelections]);

    const handleAddAnotherItem = useCallback(() => {
        dispatch(addBusinessAccumulatedItem({
            type: 'business',
            name: `Item ${accumulatedItems.length + 1}`,
            category: 'Business',
        }));
        // dispatch(resetBusinessForNextItem());
        dispatch(setBusinessCurrentStep(5));
    }, [accumulatedItems, dispatch]);

    const handleSave = useCallback(async () => {
        if (isSubmitting) return;
        setIsSubmitting(true);
        try {
            // Business onboarding done — whether solo or the second leg of Both
            dispatch(resetBusinessOnboarding());
            dispatch(resetNewOnboarding());
            navigation.reset({ index: 0, routes: [{ name: 'Dashboard' }] });
        } catch (_) {
            // noop
        } finally {
            setIsSubmitting(false);
        }
    }, [
        isSubmitting,
        dispatch,
        navigation,
    ]);

    return (
        <DashboardPreviewLayout
            modules={generatedModules}
            accentColor={themeColors.primary}
            secondaryColor={themeColors.secondary}
            label="Business"
            badge="Step 05 of 05"
            spaceType="Business"
            businessId={selectedBusinessId}
            saveLabel={t('onboarding.dashboard.save')}
            onSave={handleSave}
            isSaveLoading={isSubmitting}
            addAnotherLabel={t('onboarding.dashboard.add_another')}
            onAddAnother={handleAddAnotherItem}
        />
    );
};

export default BusinessStep05;
