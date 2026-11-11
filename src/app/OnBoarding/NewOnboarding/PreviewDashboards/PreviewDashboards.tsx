import React, { useCallback, useMemo, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigation } from '@react-navigation/native';
import { resetNewOnboarding } from '../../../../redux/slices/newOnboardingSlice';
import { resetBusinessOnboarding } from '../../../../redux/slices/businessOnboardingSlice';
import { setUserRole } from '../../../../redux/slices/userRoleSlice';
import { USER_ROLES, ROLE_THEMES } from '../../../../utils/roleManager';
import { ICONS } from '../../../../utils/Images';
import { DashboardPreviewLayout, Module } from '../DashboardPreviewUI/DashboardPreviewUI';
import { AppDispatch } from '../../../../types/store.types';
import { Stage } from './PreviewDashboards.types';

// Module mappings (duplicated here so PreviewDashboards has no runtime dep on
const PERSONAL_MODULE_MAPPING: Record<string, Module[]> = {
    'own-house': [{ id: 'real-estate', route: '/real-estate', name: 'Real Estate', icon: ICONS.REAL_ESTATE_ICON, category: 'Assets' }],
    'own-vehicle': [{ id: 'vehicles', route: '/vehicles', name: 'Vehicles', icon: ICONS.VEHICLE_ICON, category: 'Assets' }],
    'cards-loans': [
        { id: 'banking', route: '/banking-finance', name: 'Banking & Finance', icon: ICONS.BANKING_FINANCE_ICON, category: 'Assets' },
        { id: 'loans', route: '/loans', name: 'Loans', icon: ICONS.LOANS_PAYMENT_ICON, category: 'Liabilities' },
    ],
    'health-records': [{ id: 'health-tracker', route: '/health-tracker', name: 'Health Tracker', icon: ICONS.HEALTH_TRACKER_ICON, category: 'Essentials' }],
    'own-pet': [{ id: 'pets', route: '/pets', name: 'Pets', icon: ICONS.PETS_ICON, category: 'Essentials' }],
    'bills-payments': [{ id: 'utilities', route: '/utilities', name: 'Utilities', icon: ICONS.UTILITIES_ICON, category: 'Liabilities' }],
    'insurance-policies': [{ id: 'insurance', route: '/insurances', name: 'Insurance', icon: ICONS.INSURANCE_ICON, category: 'Liabilities' }],
    'maintenance': [{ id: 'utilities-m', route: '/utilities', name: 'Utilities', icon: ICONS.UTILITIES_ICON, category: 'Liabilities' }],
    'medical-records': [{ id: 'health-tracker', route: '/health-tracker', name: 'Health Tracker', icon: ICONS.HEALTH_TRACKER_ICON, category: 'Essentials' }],
    'important-docs': [{ id: 'legal', route: '/legal', name: 'Legal', icon: ICONS.LEGAL_ICON, category: 'Essentials' }],
    'compliance': [{ id: 'compliance', route: '/business', name: 'Business', icon: ICONS.PROJECTS_ICON, category: 'Business' }],
};

const BUSINESS_MODULE_MAPPING: Record<string, Module[]> = {
    'own-house': [{ id: 'real-estate', route: '/real-estate', name: 'Real Estate', icon: ICONS.REAL_ESTATE_ICON, category: 'Assets' }],
    'own-vehicle': [{ id: 'vehicles', route: '/vehicles', name: 'Vehicles', icon: ICONS.VEHICLE_ICON, category: 'Assets' }],
    'cards-loans': [
        { id: 'banking', route: '/banking-finance', name: 'Banking & Finance', icon: ICONS.BANKING_FINANCE_ICON, category: 'Assets' },
        { id: 'loans', route: '/loans', name: 'Loans', icon: ICONS.LOANS_PAYMENT_ICON, category: 'Liabilities' },
    ],
    'documents': [{ id: 'legal', route: '/legal', name: 'Legal Documents', icon: ICONS.LEGAL_ICON, category: 'Essentials' }],
    'projects': [{ id: 'projects', route: '/business', name: 'Projects', icon: ICONS.PROJECTS_ICON, category: 'Business' }],
    'business-contacts': [{ id: 'business-contacts', route: '/business', name: 'Business Contacts', icon: ICONS.BUSINESS_CONTACT_ICON, category: 'Business' }],
    'bills-payments': [{ id: 'utilities', route: '/utilities', name: 'Utilities', icon: ICONS.UTILITIES_ICON, category: 'Liabilities' }],
    'insurance-policies': [{ id: 'insurance', route: '/insurances', name: 'Insurance', icon: ICONS.INSURANCE_ICON, category: 'Liabilities' }],
    'maintenance': [{ id: 'maintenance', route: '/utilities', name: 'Maintenance', icon: ICONS.UTILITIES_ICON, category: 'Liabilities' }],
    'licenses': [{ id: 'licenses', route: '/business', name: 'Licenses', icon: ICONS.COMPLIANCE_VAULT_ICON, category: 'Business' }],
    'important-docs': [{ id: 'important-docs', route: '/legal', name: 'Important Docs', icon: ICONS.LEGAL_ICON, category: 'Essentials' }],
    'compliance': [{ id: 'compliance', route: '/business', name: 'Compliance', icon: ICONS.COMPLIANCE_VAULT_ICON, category: 'Business' }],
};

// Helpers
const buildModules = (
    selections: string[],
    mapping: Record<string, Module[]>,
): Module[] => {
    const map = new Map<string, Module>();
    selections.forEach(sel => {
        (mapping[sel] ?? []).forEach(mod => map.set(mod.id, mod));
    });
    return Array.from(map.values());
};

// Component

const PreviewDashboards: React.FC = () => {
    const dispatch = useDispatch<AppDispatch>();
    const navigation = useNavigation<any>();
    const [stage, setStage] = useState<Stage>('personal');

    const personalSelections: string[] = useSelector(
        (state: any) => state.newOnboarding_slice?.lifeSelections ?? [],
    );
    const businessSelections: string[] = useSelector(
        (state: any) => state.businessOnboarding_slice?.lifeSelections ?? [],
    );

    const personalModules = useMemo(
        () => buildModules(personalSelections, PERSONAL_MODULE_MAPPING),
        [personalSelections],
    );
    const businessModules = useMemo(
        () => buildModules(businessSelections, BUSINESS_MODULE_MAPPING),
        [businessSelections],
    );

    const personalTheme = ROLE_THEMES[USER_ROLES.PERSONAL];
    const businessTheme = ROLE_THEMES[USER_ROLES.BUSINESS];

    const handlePersonalSave = useCallback(() => setStage('business'), []);

    const handleBusinessSave = useCallback(() => {
        dispatch(resetNewOnboarding());
        dispatch(resetBusinessOnboarding());
        dispatch(setUserRole(USER_ROLES.PERSONAL));
        navigation.popToTop();
    }, [dispatch, navigation]);

    if (stage === 'personal') {
        return (
            <DashboardPreviewLayout
                modules={personalModules}
                accentColor={personalTheme.primary}
                secondaryColor={personalTheme.secondary}
                label="Personal"
                badge="Preview"
                saveLabel="Save & Continue"
                onSave={handlePersonalSave}
            />
        );
    }

    return (
        <DashboardPreviewLayout
            modules={businessModules}
            accentColor={businessTheme.primary}
            secondaryColor={businessTheme.secondary}
            label="Business"
            badge="Preview"
            saveLabel="Save & Finish"
            onSave={handleBusinessSave}
        />
    );
};

export default PreviewDashboards;
