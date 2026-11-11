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
import { useUserRole } from '../../hooks/useUserRole';
import type { ViewBankAccountModalProps } from '../../types/common.types';
import RemoteImage from './RemoteImage';
import { makeViewBankAccountModalStyles } from './ViewBankAccountModal.styles';
import MixedMediaDisplayer from './MixedMediaDisplayer';
import { RoleTheme } from '../../types/roleManager.types';
import { darkenColor } from '../../utils/roleManager';
import { getColorWithOpacity } from '../../utils/colors';
import { dropdownLabel, useDropdownOptions } from '../../hooks/useDropdownOptions';
import { RecordViewTabs, type RecordLinkTabsProp } from '../recordLinks/RecordViewTabs';

const ViewBankAccountModal: React.FC<ViewBankAccountModalProps & RecordLinkTabsProp> = ({ linkTabs,
  visible,
  onClose,
  account,
}) => {
  const { themeColors } = useUserRole();
  const styles = useMemo(() => makeViewBankAccountModalStyles(themeColors as RoleTheme), [themeColors]);
  const { t } = useTranslation();

  // The type's name from the BankAccountType dropdown (admins can add types), as the list and the web show it.
  const accountTypeOptions = useDropdownOptions(visible ? 'BankAccountType' : null);

  // Format currency
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

  // Format date
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

  if (!account) return null;

  const plannedPayments = account.plannedpayments || [];

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
          <ScrollView
            style={styles.scrollView}
            contentContainerStyle={styles.scrollContent}
            showsVerticalScrollIndicator={false}
            bounces={true}
            nestedScrollEnabled={true}
          >
            <RecordViewTabs {...linkTabs} onNavigate={linkTabs?.onNavigate ?? onClose}>
            {/* Account Header */}
            <View style={styles.accountHeader}>
              <View style={styles.accountTitleWrap}>
                <Text style={styles.accountTitle} numberOfLines={2}>
                  {account.accountname || t('banking_finance.account_name')}
                </Text>
              </View>
              <View
                style={[
                  styles.balanceBadge,
                  { backgroundColor: themeColors?.isDark ? darkenColor(themeColors.primary, 0.2) : getColorWithOpacity(themeColors.primary, 0.5) },
                ]}
              >
                <Text style={styles.balanceText}>
                  {formatCurrency(account.currentbalance)}
                </Text>
              </View>
            </View>

            <Text style={styles.bankName}>
              {account.institution || t('banking_finance.na')}
            </Text>

            {/* APR and Due Day */}
            <View style={styles.detailsRow}>
              <View style={styles.detailColumn}>
                <Text style={styles.detailLabel}>
                  {t('banking_finance.apr_percentage')}
                </Text>
                <Text style={styles.detailValue}>
                  {account.apr !== null &&
                    account.apr !== undefined &&
                    account.apr !== ''
                    ? `${account.apr}%`
                    : t('banking_finance.na')}
                </Text>
              </View>
              <View style={styles.detailColumn}>
                <Text style={styles.detailLabel}>
                  {t('banking_finance.due_day')}
                </Text>
                <Text style={styles.detailValue}>
                  {account.dueday !== null &&
                    account.dueday !== undefined &&
                    account.dueday !== ''
                    ? account.dueday
                    : t('banking_finance.na')}
                </Text>
              </View>
            </View>

            <View style={styles.detailsRow}>
              <View style={styles.detailColumn}>
                <Text style={styles.detailLabel}>
                  {t('banking_finance.min_due')}
                </Text>
                <Text style={styles.detailValue}>
                  {account.mindue !== null &&
                    account.mindue !== undefined &&
                    account.mindue !== ''
                    ? formatCurrency(account.mindue)
                    : t('banking_finance.na')}
                </Text>
              </View>
              <View style={styles.detailColumn}>
                <Text style={styles.detailLabel}>
                  {t('banking_finance.type')}
                </Text>
                <Text style={styles.detailValue}>
                  {account.type !== null &&
                    account.type !== undefined &&
                    account.type !== ''
                    ? account.typelabel || dropdownLabel(accountTypeOptions, account.type) || String(account.type)
                    : t('banking_finance.na')}
                </Text>
              </View>
            </View>
            <View style={styles.singleDetailRow}>
              <Text style={styles.detailLabel}>
                {t('banking_finance.last_4_digits')}
              </Text>
              <Text style={styles.detailValue}>
                {account.last4digits !== null &&
                  account.last4digits !== undefined &&
                  account.last4digits !== ''
                  ? account.last4digits
                  : t('banking_finance.na')}
              </Text>
            </View>

            {/* Planned Payments Section */}
            {plannedPayments.length > 0 && (
              <View style={styles.plannedPaymentsSection}>
                <Text style={styles.sectionTitle}>
                  {t('banking_finance.planned_payments')}
                </Text>

                {plannedPayments.map((payment: any, index: number) => (
                  <View
                    key={payment.id || index}
                    style={[
                      styles.paymentCard,
                      index === plannedPayments.length - 1 && {
                        borderBottomWidth: 0,
                        marginBottom: 0,
                        paddingBottom: 0,
                      },
                    ]}
                  >
                    <View style={styles.detailsRow}>
                      <View style={styles.detailColumn}>
                        <Text style={styles.detailLabel}>
                          {t('banking_finance.amount')}
                        </Text>
                        <Text style={styles.detailValue}>
                          {formatCurrency(payment.amount)}
                        </Text>
                      </View>
                      <View style={styles.detailColumn}>
                        <Text style={styles.detailLabel}>
                          {t('banking_finance.due_date')}
                        </Text>
                        <Text style={styles.detailValue}>
                          {formatDate(payment.duedate)}
                        </Text>
                      </View>
                    </View>

                    {payment.description ? (
                      <View style={styles.memoSection}>
                        <Text style={styles.detailLabel}>
                          {t('banking_finance.description')}
                        </Text>
                        <Text style={styles.memoText}>
                          {payment.description}
                        </Text>
                      </View>
                    ) : null}
                  </View>
                ))}
              </View>
            )}

            {/* Memo */}
            {account.memo ? (
              <View style={styles.memoSection}>
                <Text style={styles.detailLabel}>
                  {t('banking_finance.memo')}
                </Text>
                <Text style={styles.memoText}>{account.memo.trim()}</Text>
              </View>
            ) : null}

            {/* Attachments */}
            {(() => {
              const raw = account.attachmenturl;
              const ids: string[] = Array.isArray(raw)
                ? raw.filter(Boolean)
                : raw
                  ? [raw]
                  : [];
              if (!ids.length) return null;
              return (
                <View style={styles.attachmentsSection}>
                  <Text style={styles.detailLabel}>
                    {t('banking_finance.upload_attachments')}
                  </Text>
                  <MixedMediaDisplayer attachmentIds={ids} showDocHeading={false} />
                </View>
              );
            })()}

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

export default ViewBankAccountModal;
