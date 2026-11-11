import React, { useCallback, useRef, useState } from 'react';
import SubscriptionGateModal from '../components/common/SubscriptionGateModal';
import { usePurchases } from '../services/purchases/PurchasesProvider';
import { AccessArea, canAccess } from '../services/purchases/accessPolicy';
import { USER_ROLES } from '../utils/roleManager';
import { useUserRole } from './useUserRole';
import { useBusinessUpgrade } from './useBusinessUpgrade';
import type { UserRole } from '../types/useUserRole.types';

export type SubscriptionFeatureType = AccessArea;

/** The part of the app a role shows. */
export const areaForRole = (role: UserRole | number): AccessArea =>
  role === USER_ROLES.BUSINESS ? 'business' : 'personal';

/**
 * Every subscription check in the app goes through here; the rules live in accessPolicy.
 * premium_personal opens Personal only, premium_business opens Personal and Business.
 */
export const useSubscriptionGate = () => {
  const { access, openPaywall } = usePurchases();
  const { changeUserRole } = useUserRole();
  const { upgrade } = useBusinessUpgrade();
  const [visible, setVisible] = useState(false);
  const [gateArea, setGateArea] = useState<AccessArea>('personal');
  // The role the user was switching to when the paywall opened; taken after a successful upgrade.
  const pendingRole = useRef<UserRole | null>(null);

  const isAllowed = useCallback(
    (featureType: SubscriptionFeatureType = 'personal') => canAccess(access, featureType),
    [access],
  );

  const checkSubscription = (
    action: () => void,
    featureType: SubscriptionFeatureType = 'personal',
  ) => {
    if (isAllowed(featureType)) {
      action();
    } else {
      pendingRole.current = null;
      setGateArea(featureType);
      setVisible(true);
    }
  };

  /** Switches Personal / Business, or shows the paywall when the plan does not include that side. */
  const switchRole = (role: UserRole | number): boolean => {
    const area = areaForRole(role);
    if (!isAllowed(area)) {
      pendingRole.current = role as UserRole;
      setGateArea(area);
      setVisible(true);
      return false;
    }
    changeUserRole(role as UserRole);
    return true;
  };

  // Personal subscribers blocked from Business get the upgrade; everyone else the paywall.
  const isUpgrade = gateArea === 'business' && access.personal;

  const GateModal = (
    <SubscriptionGateModal
      visible={visible}
      reason={isUpgrade ? 'upgrade' : 'subscribe'}
      onClose={() => setVisible(false)}
      onUpgrade={async () => {
        const role = pendingRole.current;
        pendingRole.current = null;
        const ok = isUpgrade
          ? await upgrade()
          : ['purchased', 'restored'].includes(await openPaywall());
        if (ok && role != null) {
          changeUserRole(role);
        }
      }}
    />
  );

  return { checkSubscription, isAllowed, switchRole, GateModal };
};
