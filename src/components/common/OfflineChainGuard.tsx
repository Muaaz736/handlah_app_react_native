import React, { useMemo } from 'react';
import { View, Text } from 'react-native';
import Feather from 'react-native-vector-icons/Feather';
import { useNetworkStatus } from '../../hooks/useNetworkStatus';
import { useTranslation } from 'react-i18next';
import FONTS from '../../utils/fonts';
import { makeOfflineChainGuardStyles } from './OfflineChainGuard.styles';
import { useUserRole } from '../../hooks/useUserRole';
import { RoleTheme } from '../../types/roleManager.types';

interface OfflineChainGuardProps {
  /**
   * True when this screen is part of a creation-wizard chain
   * (i.e. NOT a standalone add via the detail screen).
   * When true AND the device is offline, the guard activates.
   *
   * Typically: `!addNew && !isEdit && !fromPetsScreen`
   */
  isWizardMode: boolean;
  children: React.ReactNode;
}

/**
 * Wraps a child form's submit area.
 *
 * When `isWizardMode` is true AND the device is offline, it renders an
 * informational banner instead of the children (submit button / skip button).
 * This prevents users from submitting dependent forms that require a
 * server-generated parent ID which doesn't exist yet in offline mode.
 *
 * When online or in standalone add/edit mode, the children render normally.
 */
const OfflineChainGuard: React.FC<OfflineChainGuardProps> = ({
  isWizardMode,
  children,
}) => {
  const { isOffline } = useNetworkStatus();
  const { t } = useTranslation();

const { themeColors } = useUserRole();

const styles = useMemo(() => makeOfflineChainGuardStyles(themeColors as RoleTheme), [themeColors]);

  if (isWizardMode && isOffline) {
    return (
      <View style={styles.container}>
        <View style={styles.banner}>
          <Feather name="wifi-off" size={20} color="#856404" />
          <Text style={styles.title}>{t('offline.chain_guard_title')}</Text>
          <Text style={styles.description}>
            {t('offline.chain_guard_description')}
          </Text>
        </View>
      </View>
    );
  }

  return <>{children}</>;
};

export default OfflineChainGuard;
