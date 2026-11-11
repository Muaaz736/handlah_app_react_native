import React, { useCallback, useEffect, useRef } from 'react';
import {
  Modal,
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import { useTranslation } from 'react-i18next';
import { useUserRole } from '../../hooks/useUserRole';
import colors from '../../utils/colors';
import FONTS from '../../utils/fonts';

interface SubscriptionGateModalProps {
  visible: boolean;
  onClose: () => void;
  /** Runs after the sheet has fully closed, so a store sheet or paywall it opens stays open. */
  onUpgrade?: () => void;
  /** "upgrade" = the user has Personal and tried to open Business. */
  reason?: 'subscribe' | 'upgrade';
}

// Longer than the fade-out, for platforms where Modal's onDismiss does not fire.
const DISMISS_FALLBACK_MS = 450;

const SubscriptionGateModal: React.FC<SubscriptionGateModalProps> = ({
  visible,
  onClose,
  onUpgrade,
  reason = 'subscribe',
}) => {
  const { themeColors } = useUserRole();
  const { t } = useTranslation();
  const navigation = useNavigation<any>();
  const afterClose = useRef<(() => void) | null>(null);

  const runAfterClose = useCallback(() => {
    const action = afterClose.current;
    afterClose.current = null;
    action?.();
  }, []);

  useEffect(() => {
    if (visible || !afterClose.current) {
      return undefined;
    }
    const timer = setTimeout(runAfterClose, DISMISS_FALLBACK_MS);
    return () => clearTimeout(timer);
  }, [visible, runAfterClose]);

  const handleManage = () => {
    afterClose.current = onUpgrade ?? (() => navigation.navigate('StoragePlan'));
    onClose();
  };

  const isUpgrade = reason === 'upgrade';

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onClose}
      onDismiss={runAfterClose}
    >
      <TouchableOpacity
        style={styles.overlay}
        activeOpacity={1}
        onPress={onClose}
      />
      <View style={styles.sheet}>
        <View style={styles.handle} />

        <View style={[styles.iconCircle, { backgroundColor: themeColors.primary + '18' }]}>
          <MaterialCommunityIcons
            name="crown-outline"
            size={32}
            color={themeColors.primary}
          />
        </View>

        <Text style={styles.title}>
          {isUpgrade ? t('upgrade_business.gate_title') : 'Feature Not Available'}
        </Text>
        <Text style={styles.subtitle}>
          {isUpgrade
            ? t('upgrade_business.gate_message')
            : 'This feature is not available on your current account. To access all modules, please ensure your account has an active plan.'}
        </Text>

        <TouchableOpacity
          style={[styles.manageBtn, { backgroundColor: themeColors.primary }]}
          onPress={handleManage}
          activeOpacity={0.85}
        >
          <Text style={styles.manageBtnText}>
            {isUpgrade ? t('upgrade_business.gate_cta') : 'OK, Got It'}
          </Text>
        </TouchableOpacity>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.45)',
  },
  sheet: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: colors.white,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    paddingHorizontal: 24,
    paddingTop: 12,
    paddingBottom: 36,
    alignItems: 'center',
  },
  handle: {
    width: 40,
    height: 4,
    borderRadius: 2,
    backgroundColor: colors.border,
    marginBottom: 24,
  },
  iconCircle: {
    width: 64,
    height: 64,
    borderRadius: 32,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  title: {
    fontSize: 18,
    fontFamily: FONTS.display_bold,
    color: colors.text,
    marginBottom: 10,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 14,
    fontFamily: FONTS.display_regular,
    color: colors.textSecondary,
    textAlign: 'center',
    lineHeight: 22,
    marginBottom: 28,
    paddingHorizontal: 8,
  },
  planBadge: {
    fontFamily: FONTS.display_semi_bold,
  },
  manageBtn: {
    width: '100%',
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: 'center',
    marginBottom: 12,
  },
  manageBtnText: {
    fontSize: 15,
    fontFamily: FONTS.display_semi_bold,
    color: colors.white,
  },
  cancelBtn: {
    paddingVertical: 10,
  },
  cancelText: {
    fontSize: 14,
    fontFamily: FONTS.display_medium,
    color: colors.textSecondary,
  },
});

export default SubscriptionGateModal;
