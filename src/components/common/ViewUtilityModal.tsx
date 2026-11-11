import React, { useMemo } from 'react';
import {
  View,
  Text,
  Modal,
  ScrollView,
  TouchableOpacity,
  TouchableWithoutFeedback,
} from 'react-native';
import { useTranslation } from 'react-i18next';
import AntDesign from 'react-native-vector-icons/AntDesign';
import colors, { getColorWithOpacity } from '../../utils/colors';
import { useUserRole } from '../../hooks/useUserRole';
import RemoteImage from './RemoteImage';
import { makeViewUtilityModalStyles } from './ViewUtilityModal.styles';
import MixedMediaDisplayer from './MixedMediaDisplayer';
import { RoleTheme } from '../../types/roleManager.types';
import { darkenColor } from '../../utils/roleManager';
import { billingFrequencyKey, billingFrequencyLabel, formatBillingAmount } from '../../utils/billingFrequency';
import { RecordViewTabs, type RecordLinkTabsProp } from '../recordLinks/RecordViewTabs';
import CopyableText from './CopyableText';

interface ViewUtilityModalProps {
  visible: boolean;
  onClose: () => void;
  utility?: any;
}

const ViewUtilityModal: React.FC<ViewUtilityModalProps & RecordLinkTabsProp> = ({ linkTabs,
  visible,
  onClose,
  utility,
}) => {
  const { t } = useTranslation();
  const { themeColors } = useUserRole();
  const styles = useMemo(() => makeViewUtilityModalStyles(themeColors as RoleTheme), [themeColors]);
  const resolveUtilityTypeLabel = (utility: any): string => {
    if (!utility) return 'N/A';
    const asLabel = (val: any): string => {
      const text = String(val ?? '').trim();
      return text && !/^\d+$/.test(text) ? text : '';
    };
    const typeLabel = asLabel(utility.utilitytypelabel);
    const otherLabel = asLabel(utility.utilitytypeother);
    if (typeLabel.toLowerCase() === 'other') return otherLabel || '-';
    return typeLabel || otherLabel || '-';
  };

  const formatCurrency = (amount: number | string | undefined | null) => {
    if (amount === null || amount === undefined || amount === '')
      return '$0.00';
    const num = typeof amount === 'string' ? parseFloat(amount) : amount;
    if (isNaN(num)) return '$0.00';
    return `$${num.toLocaleString('en-US', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    })}`;
  };

  const formatDate = (dateString: string | Date | null | undefined) => {
    if (!dateString) return 'N/A';
    try {
      const date = new Date(dateString);
      if (isNaN(date.getTime())) return 'N/A';
      const mm = String(date.getMonth() + 1).padStart(2, '0');
      const dd = String(date.getDate()).padStart(2, '0');
      const yyyy = date.getFullYear();
      return `${mm}/${dd}/${yyyy}`;
    } catch {
      return 'N/A';
    }
  };

  if (!utility) return null;

  return (
    <Modal
      visible={visible}
      transparent={true}
      animationType="fade"
      onRequestClose={onClose}
    >
      <View style={styles.overlay}>
        <TouchableWithoutFeedback onPress={onClose}>
          <View style={styles.overlayTouchable} />
        </TouchableWithoutFeedback>

        <View style={styles.modalContainer}>
          {/* Top-right close button */}
          <TouchableOpacity
            style={styles.topCloseButton}
            onPress={onClose}
            hitSlop={{ top: 8, right: 8, bottom: 12, left: 8 }}
            activeOpacity={0.7}
          >
            <AntDesign name="close" size={16} color={colors.black} />
          </TouchableOpacity>

          <ScrollView
            style={styles.scrollView}
            contentContainerStyle={styles.scrollContent}
            showsVerticalScrollIndicator={false}
            bounces={true}
            nestedScrollEnabled={true}
          >
            <RecordViewTabs {...linkTabs} onNavigate={linkTabs?.onNavigate ?? onClose}>
            {/* Header */}
            <View style={styles.accountHeader}>
              <View style={styles.accountTitleWrap}>
                <Text style={styles.accountTitle} numberOfLines={2}>
                  {utility.name || utility.vendor || 'N/A'}
                </Text>
                {utility.name && utility.vendor ? (
                  <Text style={styles.detailLabel} numberOfLines={1}>
                    {utility.vendor}
                  </Text>
                ) : null}
              </View>
              <View
                style={[
                  styles.balanceBadge,
                  { backgroundColor: themeColors?.isDark ? darkenColor(themeColors.primary, 0.4) : getColorWithOpacity(themeColors.primary, 0.5) },
                ]}
              >
                <Text style={styles.balanceText}>
                  {formatBillingAmount(formatCurrency(utility.averagemonthlyamount), utility.billingfrequency, true)}
                </Text>
              </View>
            </View>

            <Text style={styles.subTitle}>
              {resolveUtilityTypeLabel(utility)}
            </Text>

            {/* Utility Type & Due Day */}
            <View style={styles.detailsRow}>
              <View style={styles.detailColumn}>
                <Text style={styles.detailLabel}>
                  {t('utilities.utility_type')}
                </Text>
                <Text style={styles.detailValue}>
                  {resolveUtilityTypeLabel(utility)}
                </Text>
              </View>
              <View style={styles.detailColumn}>
                <Text style={styles.detailLabel}>
                  {t('utilities.due_day_optional')}
                </Text>
                <Text style={styles.detailValue}>
                  {utility.dueday !== null && utility.dueday !== undefined
                    ? String(utility.dueday)
                    : 'N/A'}
                </Text>
              </View>
            </View>

            {/* Account # & Phone */}
            <View style={styles.detailsRow}>
              <View style={styles.detailColumn}>
                <Text style={styles.detailLabel}>
                  {t('utilities.account_number_optional')}
                </Text>
                <CopyableText style={styles.detailValue} value={utility.accountnumber} label={t('utilities.account_number_optional')} />
              </View>
              <View style={styles.detailColumn}>
                <Text style={styles.detailLabel}>
                  {t('utilities.phone_optional')}
                </Text>
                <CopyableText style={styles.detailValue} value={utility.phonenumber} label={t('utilities.phone_optional')} />
              </View>
            </View>

            {/* Start Date & End Date */}
            <View style={styles.detailsRow}>
              <View style={styles.detailColumn}>
                <Text style={styles.detailLabel}>{t('utilities.start_date')}</Text>
                <Text style={styles.detailValue}>
                  {formatDate(utility.startdate || utility.startDate)}
                </Text>
              </View>
              <View style={styles.detailColumn}>
                <Text style={styles.detailLabel}>{t('utilities.end_date')}</Text>
                <Text style={styles.detailValue}>
                  {formatDate(utility.enddate)}
                </Text>
              </View>
            </View>

            {/* Website */}
            {utility.website ? (
              <View style={styles.singleDetailRow}>
                <Text style={styles.detailLabel}>{t('utilities.website')}</Text>
                <CopyableText style={styles.detailValue} value={utility.website} label={t('utilities.website')} />
              </View>
            ) : null}
            {utility.billingfrequency && (
              <View style={styles.detailColumn}>
                <Text style={styles.detailLabel}>
                  {t('utilities.billing_frequency')}
                </Text>
                <Text style={styles.detailValue}>
                  {(() => {
                    const key = billingFrequencyKey(utility.billingfrequency);
                    return key ? billingFrequencyLabel(key) : utility.billingfrequency || 'N/A';
                  })()}
                </Text>
              </View>
            )}

            {/* Linked Real Estate Section */}
            {utility.realestate ? (() => {
              const re = utility.realestate;
              const address = [re.streetaddress, re.aptsuite, re.city, re.state, re.zip, re.country].filter(Boolean).join(', ');
              return (
                <View style={styles.linkedSection}>
                  <Text style={[styles.sectionTitle, { color: themeColors.primary }]}>
                    {t('utilities.linked_real_estate') || 'Linked Real Estate'}
                  </Text>
                  <View style={styles.detailsRow}>
                    <View style={styles.detailColumn}>
                      <Text style={styles.detailLabel}>{t('utilities.property_name') || 'Property Name'}</Text>
                      <Text style={styles.detailValue}>{re.nickname || 'N/A'}</Text>
                    </View>
                  </View>
                  {address ? (
                    <View style={styles.singleDetailRow}>
                      <Text style={styles.detailLabel}>{t('utilities.address') || 'Address'}</Text>
                      <Text style={styles.detailValue}>{address}</Text>
                    </View>
                  ) : null}
                </View>
              );
            })() : null}

            {/* Attachment */}
            {utility.uploadattachments ? (
              <View style={styles.attachmentSection}>
                <Text style={styles.sectionTitle}>
                  {t('common.attachment')}
                </Text>
                <MixedMediaDisplayer attachmentIds={utility.uploadattachments} showDocHeading={false} />
              </View>
            ) : null}

            {/* Close Button */}
            <TouchableOpacity
              style={[
                styles.closeButton,
                { backgroundColor: themeColors.primary },
              ]}
              onPress={onClose}
            >
              <Text style={styles.closeButtonText}>
                {t('banking_finance.close')}
              </Text>
            </TouchableOpacity>
            </RecordViewTabs>
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
};

export default ViewUtilityModal;
