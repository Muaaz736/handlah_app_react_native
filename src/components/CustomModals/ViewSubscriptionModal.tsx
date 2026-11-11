import React, { useEffect, useMemo, useState } from 'react';
import { enforceHttps } from '../../utils/httpsGuard';
import {
  View,
  Text,
  Modal,
  TouchableOpacity,
  TouchableWithoutFeedback,
  ScrollView,
  Linking,
} from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import colors from '../../utils/colors';
import { useTranslation } from 'react-i18next';
import { useUserRole } from '../../hooks/useUserRole';
import type { ViewSubscriptionModalProps } from '../../types/viewSubscriptionModal.types';
import { makeViewSubscriptionModalStyles } from './ViewSubscriptionModal.styles';
import { RoleTheme } from '../../types/roleManager.types';
import { RecordViewTabs, type RecordLinkTabsProp } from '../recordLinks/RecordViewTabs';

const ViewSubscriptionModal: React.FC<ViewSubscriptionModalProps & RecordLinkTabsProp> = ({ linkTabs, visible, onClose, subscription, socialNetworks = [], paymentMethodOptions = [] }) => {
  const { t, i18n } = useTranslation();
  const isRTL = i18n.language === 'ar';
  const { themeColors } = useUserRole();
  const styles = useMemo(() => makeViewSubscriptionModalStyles(themeColors as RoleTheme), [themeColors]);
  const [isPasswordVisible, setIsPasswordVisible] = useState(false);
  useEffect(() => {
    if (!visible) setIsPasswordVisible(false);
  }, [visible]);

  const resolvePaymentMethod = (value?: string | number): string => {
    if (!value) return '';
    const match = paymentMethodOptions.find(
      (opt: any) => String(opt.value) === String(value),
    );
    return match?.label || '-';
  };



  const getSocialNetworkById = (value?: string | number) => {
    if (!value || !socialNetworks || socialNetworks.length === 0) return null;

    const id = Number(value);
    if (!Number.isNaN(id)) {
      const byId = socialNetworks.find((network: any) => Number(network.id) === id);
      if (byId) return byId;
    }

    const normalized = String(value).toLowerCase();
    return socialNetworks.find((network: any) => {
      const stype = String(network?.stype || '').toLowerCase();
      const networkType = String(network?.networktype || '').toLowerCase();
      return stype === normalized || networkType === normalized;
    });
  };

  const getSocialMediaIcon = (
    socialNetworkTypeValue?: string | number,
  ): { iconName: string; isValid: boolean; platformType?: string; isBrandIcon?: boolean } => {
    const network = getSocialNetworkById(socialNetworkTypeValue);

    if (!network) return { iconName: 'web', isValid: false };

    // Check if it's "Others" type
    if (network.stype?.toLowerCase() === 'others') {
      return { iconName: 'web', isValid: false, platformType: 'Others' };
    }

    const iconMap: Record<string, string> = {
      'facebook': 'facebook',
      'instagram': 'instagram',
      'x': 'twitter',
      'twitter': 'twitter',
      'linkedin': 'linkedin',
      'youtube': 'youtube',
      'tiktok': 'tiktok',
      'snapchat': 'snapchat',
      'pinterest': 'pinterest',
      'whatsapp': 'whatsapp',
      'threads': 'threads',
      'reddit': 'reddit',
      'github': 'github',
      'discord': 'discord',
      'telegram': 'telegram',
    };

    const stype = String(network.stype).toLowerCase();
    const iconName = iconMap[stype];

    return {
      iconName: iconName || 'web',
      isValid: !!iconName,
      platformType: network.networktype,
      isBrandIcon: stype === 'threads' || stype === 'tiktok' || stype === 'telegram',
    };
  };

  const platformInfo = getSocialMediaIcon(
    (subscription as any)?.socialNetworkTypeId ?? (subscription as any)?.socialNetworkTypeName,
  );

  return (
    <Modal
      visible={visible && subscription !== null}
      transparent={true}
      animationType="fade"
      onRequestClose={onClose}
    >
      <TouchableWithoutFeedback onPress={onClose}>
        <View style={styles.overlay}>
          <TouchableWithoutFeedback>
            <View style={styles.modalContainer}>
              {/* Platform Icon Section */}
              {/* <View style={[styles.iconContainer, { backgroundColor: themeColors.primary }]}>
                {subscription?.socialNetworkIcon ? (
                  <SvgXml xml={subscription.socialNetworkIcon} width={24} height={24} />
                ) : (
                  <MaterialCommunityIcons
                    name={getSocialMediaIcon('web').iconName}
                    size={24}
                    color={colors.black}
                  />
                )}
              </View> */}

              <Text style={styles.title}>
                {platformInfo.platformType?.toLowerCase() === 'others'
                  ? t('common.other') || 'Other'
                  : platformInfo.platformType || subscription?.name || ''}
              </Text>

              <ScrollView style={styles.infoContainer} showsVerticalScrollIndicator={false}>
            <RecordViewTabs {...linkTabs} onNavigate={linkTabs?.onNavigate ?? onClose}>
                {/* Subscription Name */}
                {(subscription as any)?.subscriptionname && (
                  <View style={styles.infoRow}>
                    <Text style={styles.label}>{t('subscriptions.subscription_name') || 'Subscription'}:</Text>
                    <Text style={styles.value}>{(subscription as any).subscriptionname}</Text>
                  </View>
                )}

                {/* Username/Email field */}
                <View style={styles.infoRow}>
                  <Text style={styles.label}>
                    {subscription?.email ? `${t('common.email') || 'Email'}:` : `${t('common.username') || 'Username'}:`}
                  </Text>
                  <Text style={[styles.value, !subscription?.email && !subscription?.username?.trim() && styles.placeholderText]}>
                    {subscription?.email || subscription?.username?.trim() || `${t('common.not_provided') || 'Not provided'}`}
                  </Text>
                </View>

                {/* Password field */}
                <View style={styles.infoRow}>
                  <Text style={styles.label}>{t('common.password') || 'Password'}:</Text>
                  {subscription?.password?.trim() ? (
                    <View style={styles.secretValueRow}>
                      <Text style={[styles.value, styles.secretValue]} numberOfLines={1}>
                        {isPasswordVisible ? subscription.password.trim() : '•'.repeat(Math.min(subscription.password.trim().length, 12))}
                      </Text>
                      <TouchableOpacity
                        onPress={() => setIsPasswordVisible((prev) => !prev)}
                        style={styles.secretToggle}
                        hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                      >
                        <Ionicons
                          name={isPasswordVisible ? 'eye-off-outline' : 'eye-outline'}
                          size={18}
                          color={themeColors.primary}
                        />
                      </TouchableOpacity>
                    </View>
                  ) : (
                    <Text style={[styles.value, styles.placeholderText]}>
                      {t('common.not_provided') || 'Not provided'}
                    </Text>
                  )}
                </View>

                {/* Cost */}
                {(subscription as any)?.cost != null && (
                  <View style={styles.infoRow}>
                    <Text style={styles.label}>{t('subscriptions.cost') || 'Cost'}:</Text>
                    <Text style={styles.value}>${(subscription as any).cost}</Text>
                  </View>
                )}

                {/* Billing Frequency */}
                {(subscription as any)?.billingfrequency && (
                  <View style={styles.infoRow}>
                    <Text style={styles.label}>{t('subscriptions.billing_frequency') || 'Billing'}:</Text>
                    <Text style={[styles.value, styles.capitalizeText]}>{(subscription as any).billingfrequency}</Text>
                  </View>
                )}

                {/* Next Renewal Date */}
                {(subscription as any)?.nextrenewaldate && (
                  <View style={styles.infoRow}>
                    <Text style={styles.label}>{t('subscriptions.renewal_date') || 'Renewal Date'}:</Text>
                    <Text style={styles.value}>
                      {new Date((subscription as any).nextrenewaldate).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' })}
                    </Text>
                  </View>
                )}

                {/* Payment Method */}
                {(subscription as any)?.paymentmethod && (
                  <View style={styles.infoRow}>
                    <Text style={styles.label}>{t('subscriptions.payment_method') || 'Payment Method'}:</Text>
                    <Text style={[styles.value, styles.capitalizeText]}>
                      {resolvePaymentMethod((subscription as any).paymentmethod)}
                    </Text>
                  </View>
                )}

                {/* URL field */}
                {(subscription as any)?.url && (
                  <View style={[styles.infoRow, styles.infoRowNotes]}>
                    <Text style={styles.label}>{t('social_media.social_network_url') || 'URL'}:</Text>
                    <TouchableOpacity
                      style={{ flex: 1 }}
                      onPress={() => {
                        const url = (subscription as any).url;
                        if (url) Linking.openURL(enforceHttps(url)).catch(() => { });
                      }}
                    >
                      <Text style={[styles.value, styles.urlText]}>
                        {(subscription as any).url}
                      </Text>
                    </TouchableOpacity>
                  </View>
                )}

                {/* Notes */}
                {(subscription as any)?.notes && (
                  <View style={[styles.infoRow, styles.infoRowNotes]}>
                    <Text style={styles.label}>{t('common.notes') || 'Notes'}:</Text>
                    <Text style={[styles.value, styles.notesText]}>{(subscription as any).notes}</Text>
                  </View>
                )}
            </RecordViewTabs>
              </ScrollView>

              <TouchableOpacity
                style={[
                  styles.closeButton,
                  { backgroundColor: themeColors.primary },
                ]}
                onPress={onClose}
              >
                <Text
                  style={[styles.closeButtonText, { color: colors.white }]}
                >
                  {t('common.close')}
                </Text>
              </TouchableOpacity>
            </View>
          </TouchableWithoutFeedback>
        </View>
      </TouchableWithoutFeedback>
    </Modal>
  );
};

export default ViewSubscriptionModal;
