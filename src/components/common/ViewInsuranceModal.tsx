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
import { makeViewInsuranceModalStyles } from './ViewInsuranceModal.styles';
import MixedMediaDisplayer from './MixedMediaDisplayer';
import { RoleTheme } from '../../types/roleManager.types';
import { formatBillingAmount } from '../../utils/billingFrequency';
import { RecordViewTabs, type RecordLinkTabsProp } from '../recordLinks/RecordViewTabs';
import CopyableText from './CopyableText';

interface ViewInsuranceModalProps {
  visible: boolean;
  onClose: () => void;
  insurance?: any;
}

const ViewInsuranceModal: React.FC<ViewInsuranceModalProps & RecordLinkTabsProp> = ({ linkTabs,
  visible,
  onClose,
  insurance,
}) => {
  const { t } = useTranslation();
  const { themeColors } = useUserRole();
  const styles = useMemo(() => makeViewInsuranceModalStyles(themeColors as RoleTheme), [themeColors]);

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

  if (!insurance) return null;

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
                  {insurance.itemname || insurance.itemName || 'N/A'}
                </Text>
              </View>
              <View
                style={[
                  styles.balanceBadge,
                  { backgroundColor: getColorWithOpacity(themeColors.primary, 0.5) },
                ]}
              >
                <Text style={styles.balanceText}>
                  {formatBillingAmount(
                    formatCurrency(insurance.annualpremium ?? insurance.annualPremium),
                    (insurance as any).billingfrequency || (insurance as any).billingFrequency ||
                      ((insurance as any).ispaidannually || (insurance as any).isPaidAnnually ? 'annually' : ''),
                  )}
                </Text>
              </View>
            </View>

            <Text style={styles.subTitle}>
              {insurance.insurancecarrier ||
                insurance.insuranceCarrier ||
                'N/A'}
            </Text>

            {/* Policy # & Due Day */}
            <View style={styles.detailsRow}>
              <View style={styles.detailColumn}>
                <Text style={styles.detailLabel}>
                  {t('insurance.policy_number')}
                </Text>
                <CopyableText style={styles.detailValue} value={insurance.policynumber || insurance.policyNumber} label={t('insurance.policy_number')} />
              </View>
              {!insurance.ispaidannually ? (
                <View style={styles.detailColumn}>
                  <Text style={styles.detailLabel}>{t('insurance.due_day')}</Text>
                  <Text style={styles.detailValue}>
                    {insurance.dueday !== null && insurance.dueday !== undefined
                      ? String(insurance.dueday)
                      : 'N/A'}
                  </Text>
                </View>
              ) : (<View style={styles.detailColumn}>
                <Text style={styles.detailLabel}>{t('insurance.payment_type')}</Text>
                <Text style={styles.detailValue}>
                  {insurance.ispaidannually ? t('insurance.annually') : t('insurance.monthly')}
                </Text>
              </View>)}
            </View>

            {/* Start Date & Renewal Date */}
            <View style={styles.detailsRow}>
              <View style={styles.detailColumn}>
                <Text style={styles.detailLabel}>
                  {t('insurance.start_date')}
                </Text>
                <Text style={styles.detailValue}>
                  {formatDate(insurance.startdate || insurance.startDate)}
                </Text>
              </View>
              <View style={styles.detailColumn}>
                <Text style={styles.detailLabel}>
                  {t('insurance.renewal_date')}
                </Text>
                <Text style={styles.detailValue}>
                  {formatDate(insurance.renewaldate || insurance.renewalDate)}
                </Text>
              </View>
            </View>

            {/* End Date */}
            <View style={styles.singleDetailRow}>
              <Text style={styles.detailLabel}>{t('insurance.end_date')}</Text>
              <Text style={styles.detailValue}>
                {formatDate(insurance.enddate || insurance.endDate)}
              </Text>
            </View>

            {/* Agent & Agent Email */}
            {insurance.agent || insurance.agentemail || insurance.agentEmail ? (
              <View style={styles.detailsRow}>
                {insurance.agent ? (
                  <View style={styles.detailColumn}>
                    <Text style={styles.detailLabel}>
                      {t('insurance.agent')}
                    </Text>
                    <Text style={styles.detailValue}>{insurance.agent}</Text>
                  </View>
                ) : null}
                {insurance.agentphone || insurance.agentPhone ? (
                  <View style={styles.detailColumn}>
                    <Text style={styles.detailLabel}>
                      {t('insurance.agent_phone')}
                    </Text>
                    <CopyableText style={styles.detailValue} value={insurance.agentphone || insurance.agentPhone} label={t('insurance.agent_phone')} />
                  </View>
                ) : null}
              </View>
            ) : null}

            {insurance.agentemail || insurance.agentEmail ? (
              <View style={styles.singleDetailRow}>
                <Text style={styles.detailLabel}>
                  {t('insurance.agent_email')}
                </Text>
                <CopyableText style={styles.detailValue} value={insurance.agentemail || insurance.agentEmail} label={t('insurance.agent_email')} />
              </View>
            ) : null}

            {/* Linked Asset Section */}
            {(insurance.realestate || insurance.vehicle || insurance.property) ? (
              <View style={styles.linkedSection}>
                <Text style={[styles.sectionTitle, { color: themeColors.primary }]}>
                  {insurance.realestate
                    ? t('insurance.linked_real_estate') || 'Linked Real Estate'
                    : insurance.vehicle
                      ? t('insurance.linked_vehicle') || 'Linked Vehicle'
                      : t('insurance.linked_property') || 'Linked Property'}
                </Text>

                {/* Real Estate */}
                {insurance.realestate ? (() => {
                  const re = insurance.realestate;
                  const address = [re.streetaddress, re.aptsuite, re.city, re.state, re.zip, re.country].filter(Boolean).join(', ');
                  return (
                    <>
                      <View style={styles.detailsRow}>
                        <View style={styles.detailColumn}>
                          <Text style={styles.detailLabel}>{t('insurance.property_name') || 'Property Name'}</Text>
                          <Text style={styles.detailValue}>{re.nickname || 'N/A'}</Text>
                        </View>

                      </View>
                      {address ? (
                        <View style={styles.singleDetailRow}>
                          <Text style={styles.detailLabel}>{t('insurance.address') || 'Address'}</Text>
                          <Text style={styles.detailValue}>{address}</Text>
                        </View>
                      ) : null}
                    </>
                  );
                })() : null}

                {/* Vehicle */}
                {insurance.vehicle ? (() => {
                  const v = insurance.vehicle;
                  const vehicleName = [v.year, v.make, v.model].filter(Boolean).join(' ');
                  return (
                    <>
                      <View style={styles.detailsRow}>
                        <View style={styles.detailColumn}>
                          <Text style={styles.detailLabel}>{t('insurance.vehicle_name') || 'Vehicle'}</Text>
                          <Text style={styles.detailValue}>{vehicleName || 'N/A'}</Text>
                        </View>
                        {v.nickname ? (
                          <View style={styles.detailColumn}>
                            <Text style={styles.detailLabel}>{t('insurance.nickname') || 'Nickname'}</Text>
                            <Text style={styles.detailValue}>{v.nickname}</Text>
                          </View>
                        ) : null}
                      </View>
                      {(v.plate || v.vin) ? (
                        <View style={styles.detailsRow}>
                          {v.plate ? (
                            <View style={styles.detailColumn}>
                              <Text style={styles.detailLabel}>{t('insurance.license_plate') || 'License Plate'}</Text>
                              <Text style={styles.detailValue}>{v.plate}</Text>
                            </View>
                          ) : null}
                          {v.vin ? (
                            <View style={styles.detailColumn}>
                              <Text style={styles.detailLabel}>{t('insurance.vin') || 'VIN'}</Text>
                              <Text style={styles.detailValue}>{v.vin}</Text>
                            </View>
                          ) : null}
                        </View>
                      ) : null}
                    </>
                  );
                })() : null}

                {/* Personal Property */}
                {insurance.property ? (() => {
                  const p = insurance.property;
                  return (
                    <>
                      <View style={styles.detailsRow}>
                        <View style={styles.detailColumn}>
                          <Text style={styles.detailLabel}>{t('insurance.property_name') || 'Property Name'}</Text>
                          <Text style={styles.detailValue}>{p.name || 'N/A'}</Text>
                        </View>
                        {p.modelserial ? (
                          <View style={styles.detailColumn}>
                            <Text style={styles.detailLabel}>{t('insurance.model_serial') || 'Model / Serial'}</Text>
                            <Text style={styles.detailValue}>{p.modelserial}</Text>
                          </View>
                        ) : null}
                      </View>
                      {p.price !== undefined && p.price !== null ? (
                        <View style={styles.singleDetailRow}>
                          <Text style={styles.detailLabel}>{t('insurance.price') || 'Price'}</Text>
                          <Text style={styles.detailValue}>{formatCurrency(p.price)}</Text>
                        </View>
                      ) : null}
                    </>
                  );
                })() : null}
              </View>
            ) : null}

            {/* Attachment */}
            {insurance.uploadattachments ? (
              <View style={styles.attachmentSection}>
                <Text style={styles.sectionTitle}>
                  {t('common.attachment')}
                </Text>
                <MixedMediaDisplayer attachmentIds={insurance.uploadattachments} showDocHeading={false} />
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

export default ViewInsuranceModal;
