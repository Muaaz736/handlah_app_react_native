import React, { useEffect, useRef, useState } from 'react';
import { useDispatch } from 'react-redux';
import SubscriptionGateModal from '../common/SubscriptionGateModal';
import { usePurchases } from '../../services/purchases/PurchasesProvider';
import { canAccess } from '../../services/purchases/accessPolicy';
import { useUserRole } from '../../hooks/useUserRole';
import { setUserRole } from '../../redux/slices/userRoleSlice';
import { USER_ROLES } from '../../utils/roleManager';
import { navigationRef } from '../../navigation/navigationRef';
import { useBusinessUpgrade } from '../../hooks/useBusinessUpgrade';

/** Stack screens that only exist on the Business side. */
export const BUSINESS_ONLY_ROUTES = new Set([
  'BusinessOnboarding',
  'BusinessContact',
  'AddBusinessContact',
  'Projects',
  'AddProject',
  'ComplianceVault',
  'ComplianceDetail',
  'AddComplianceRecord',
  'Licenses',
  'AddLicense',
  'BusinessDetailsPage',
  'AddBusinessDetails',
  'BusinessTeam',
]);

interface Props {
  /** Only once signup is done; business onboarding during signup stays open. */
  enabled: boolean;
  activeRouteName: string | null;
}

/**
 * Backstop for every way into Business that does not go through the header switch:
 * push and notification taps, reminders, a role saved from an earlier session, or a
 * Business plan that just ended. Without a Business plan the user is put back on
 * Personal and sees the paywall. Buying from that paywall takes them on to Business.
 */
const BusinessAccessGuard: React.FC<Props> = ({ enabled, activeRouteName }) => {
  const dispatch = useDispatch();
  const { userRole } = useUserRole();
  const { access, loaded, openPaywall } = usePurchases();
  const { upgrade } = useBusinessUpgrade();
  const [visible, setVisible] = useState(false);
  const continueToBusiness = useRef(false);

  const hasBusiness = canAccess(access, 'business');
  const wantsBusiness =
    userRole === USER_ROLES.BUSINESS ||
    (activeRouteName != null && BUSINESS_ONLY_ROUTES.has(activeRouteName));

  useEffect(() => {
    // Wait for the first plan lookup, so a Business subscriber is never bounced on launch.
    if (!enabled || !loaded || hasBusiness || !wantsBusiness) {
      return;
    }
    dispatch(setUserRole(USER_ROLES.PERSONAL));
    if (
      activeRouteName != null &&
      BUSINESS_ONLY_ROUTES.has(activeRouteName) &&
      navigationRef.isReady()
    ) {
      navigationRef.reset({ index: 0, routes: [{ name: 'Dashboard' }] });
    }
    setVisible(true);
  }, [enabled, loaded, hasBusiness, wantsBusiness, activeRouteName, dispatch]);

  useEffect(() => {
    if (hasBusiness && continueToBusiness.current) {
      continueToBusiness.current = false;
      dispatch(setUserRole(USER_ROLES.BUSINESS));
    }
  }, [hasBusiness, dispatch]);

  return (
    <SubscriptionGateModal
      visible={visible}
      reason={access.personal ? 'upgrade' : 'subscribe'}
      onClose={() => setVisible(false)}
      onUpgrade={async () => {
        continueToBusiness.current = true;
        const ok = access.personal
          ? await upgrade()
          : ['purchased', 'restored'].includes(await openPaywall());
        if (!ok) {
          continueToBusiness.current = false;
        }
      }}
    />
  );
};

export default BusinessAccessGuard;
