import React, { useCallback, useMemo } from 'react';
import {
  View,
  Text,
  Modal,
  ScrollView,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
  Image,
} from 'react-native';
import { useTranslation } from 'react-i18next';
import colors, { getColorWithOpacity } from '../../utils/colors';
import { useLocationNameMaps, nameFromMap } from '../../utils/locationNames';
import Ionicons from 'react-native-vector-icons/Ionicons';
import Feather from 'react-native-vector-icons/Feather';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import { ICONS } from '../../utils/Images';
import { useUserRole } from '../../hooks/useUserRole';
import { useSubscriptionGate } from '../../hooks/useSubscriptionGate';
import type { ViewRealEstateModalProps } from '../../types/viewRealEstateModal.types';
import { useFocusEffect, useNavigation } from '@react-navigation/native';
import { formatDate, downloadAndOpenDocument, getDocumentUrl } from '../../utils/helpers';
import { MixedMediaDisplayer, RemoteImage } from '../common';
import { propertyTypes } from '../../utils/staticData';
import { useDispatch, useSelector } from 'react-redux';
import { getDropdownOptionsAsync } from '../../redux/services/authService';
import { AppDispatch } from '../../types/store.types';
import { makeViewRealEstateModalStyles } from './ViewRealEstateModal.styles';
import { RoleTheme } from '../../types/roleManager.types';
import { darkenColor } from '../../utils/roleManager';
import { formatBillingAmount } from '../../utils/billingFrequency';
import { dropdownLabel, useDropdownOptions } from '../../hooks/useDropdownOptions';
import { optionSubtype, UTILITY_SUBTYPE } from '../../utils/expenseTypes';
import { RecordViewTabs, type RecordLinkTabsProp } from '../recordLinks/RecordViewTabs';
import { LinkedRecordsButton } from '../recordLinks/LinkedRecordsButton';

const ViewRealEstateModal: React.FC<ViewRealEstateModalProps & RecordLinkTabsProp> = ({ linkTabs,
  visible,
  onClose,
  property,
  isLoading,
  onEditLoan,
  onEditUtility,
  onEditInsurance,
  onEditWarranty,
  onEditProperty,
  onEditService,
  onDeleteLoan,
  onDeleteUtility,
  onDeleteInsurance,
  onDeleteWarranty,
  onDeleteProperty,
  onDeleteService,
  actionable = true,
  ownerUserId,
  canDelete,
}) => {
  const { themeColors, isBusinessRole } = useUserRole();
  const styles = useMemo(() => makeViewRealEstateModalStyles(themeColors as RoleTheme), [themeColors]);
  const { checkSubscription, GateModal } = useSubscriptionGate();
  const { t } = useTranslation();
  const navigation = useNavigation<any>();
  const { get_dropdown_options_data } = useSelector((state: any) => state.user_auth);
  const dispatch = useDispatch<AppDispatch>();
  // Resolve state/country IDs -> names for the address line.
  const { countryNames, stateNames } = useLocationNameMaps(property ? [property] : [] as any);

  useFocusEffect(useCallback(() => {
    dispatch(getDropdownOptionsAsync('UtilityType'));
  }, [dispatch]));

  const utilityTypeOptions = useDropdownOptions(visible ? 'UtilityType' : null);
  const expenseGroups = useMemo(() => {
    const all: any[] = property?.utilities || [];
    const isUtility = (u: any) =>
      optionSubtype(utilityTypeOptions.find(o => String(o.value) === String(u.utilitytype ?? u.utilityType))) === UTILITY_SUBTYPE;
    const utilities = all.filter(isUtility);
    const expenses = all.filter(u => !isUtility(u));
    return [
      { key: 'utilities', title: t('modals.utilities'), items: utilities },
      // The Expenses section only appears once there's a non-utility expense, so the add button stays on Utilities.
      ...(expenses.length ? [{ key: 'expenses', title: t('business.sections.expenses'), items: expenses }] : []),
    ];
  }, [property?.utilities, utilityTypeOptions, t]);

  if (!property) return null;

  const handleEditLoan = (loan: any): void => {
    if (onEditLoan) {
      onEditLoan(loan);
    }
  };

  const handleDeleteLoan = (loan: any): void => {
    if (onDeleteLoan) {
      onDeleteLoan(loan);
    }
  };

  const handleEditUtility = (utility: any): void => {
    if (onEditUtility) {
      onEditUtility(utility);
    }
  };

  const handleDeleteUtility = (utility: any): void => {
    if (onDeleteUtility) {
      onDeleteUtility(utility);
    }
  };

  const handleEditInsurance = (rental: any): void => {
    if (onEditInsurance) {
      onEditInsurance(rental);
    }
  };

  const handleDeleteRental = (rental: any): void => {
    if (onDeleteInsurance) {
      onDeleteInsurance(rental);
    }
  };

  const handleEditWarranty = (warranty: any): void => {
    if (onEditWarranty) {
      onEditWarranty(warranty);
    }
  };

  const handleDeleteWarranty = (warranty: any): void => {
    if (onDeleteWarranty) {
      onDeleteWarranty(warranty);
    }
  };

  const handleEditProperty = (propertyItem: any): void => {
    if (onEditProperty) {
      onEditProperty(propertyItem);
    }
  };

  const handleDeleteProperty = (propertyItem: any): void => {
    if (onDeleteProperty) {
      onDeleteProperty(propertyItem);
    }
  };

  const handleEditService = (service: any): void => {
    if (onEditService) {
      onEditService(service);
    }
  };

  const handleDeleteService = (service: any): void => {
    if (onDeleteService) {
      onDeleteService(service);
    }
  };

  const handleAddNew = (screenName: string, params?: any): void => {
    onClose();
    checkSubscription(
      () => (navigation as any).navigate(screenName, { addNew: true, ...params, ...(ownerUserId ? { ownerUserId } : {}) }),
      isBusinessRole() ? 'business' : 'personal',
    );
  };

  const navigateToHistory = (entityType: string, entityId: number): void => {
    (navigation as any).navigate('EditHistoryList', {
      entityType,
      entityId,
      title: t('edit_history.title'),
    });
    onClose();
  };

  // Helper function to format currency
  const formatCurrency = (amount: number | string | null | undefined): string => {
    if (!amount) return '$0.00';
    const numAmount = typeof amount === 'string' ? parseFloat(amount) : amount;
    if (isNaN(numAmount)) return '$0.00';
    return `$${numAmount.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
  };

  const familyName: any = propertyTypes.find((item) => item.value === property?.type)?.label || 'Property'

  const handleDownloadDocument = async (documentId: string) => {
    onClose(); // Close modal immediately on document click

    try {
      const fullUrl = getDocumentUrl(documentId);
      await downloadAndOpenDocument(fullUrl || 'document.pdf');
    } catch (error) {
      console.error('Download error:', error);
      Alert.alert(
        t('common.error') || 'Error',
        t('bookmarks.download_failed') || 'Failed to download document'
      );
    }
  };

  // Normalise attachment value to array (handles string | string[] | null)
  const toIds = (val: any): string[] => {
    if (!val) return [];
    if (Array.isArray(val)) return val.filter(Boolean);
    return [val];
  };

  const renderAttachments = (val: any, label: string) => {
    const ids = toIds(val);
    if (ids.length === 0) return null;
    return (
      <>
        {ids.map((id, i) => (
          <TouchableOpacity
            key={i}
            style={styles.attachmentRow}
            onPress={() => handleDownloadDocument(id)}
          >
            <Text style={[styles.attachmentText, { color: themeColors.primary }]}>
              {label}{ids.length > 1 ? ` ${i + 1}` : ''}
            </Text>
            <Ionicons name="download-outline" size={16} color={themeColors.primary} />
          </TouchableOpacity>
        ))}
      </>
    );
  };


  return (
    <>
    <Modal
      visible={visible}
      transparent={true}
      animationType="fade"
      onRequestClose={onClose}
    >
      <View style={styles.overlay}>
        <View style={styles.modalContainer}>
          {/* Close Button Top Right */}
          <TouchableOpacity
            style={styles.closeIconButton}
            onPress={onClose}
            activeOpacity={0.7}
          >
            <Ionicons name="close" size={24} color={colors.black} />
          </TouchableOpacity>

          {isLoading ? (
            <View style={styles.loadingContainer}>
              <ActivityIndicator size="large" color={themeColors.primary} />
              <Text style={styles.loadingText}>{t('common.loading') || 'Loading...'}</Text>
            </View>
          ) : (
            <ScrollView
              style={styles.scrollView}
              contentContainerStyle={styles.scrollContent}
              showsVerticalScrollIndicator={false}
            >
            <RecordViewTabs {...linkTabs} onNavigate={linkTabs?.onNavigate ?? onClose}>
              {/* Property Card */}
              <MixedMediaDisplayer
                attachmentIds={
                  [
                    ...(Array.isArray(property?.attachmenturl) ? property.attachmenturl : property?.attachmenturl ? [property.attachmenturl] : []),
                    ...(Array.isArray(property?.documenturl) ? property.documenturl : property?.documenturl ? [property.documenturl] : [])
                  ]
                }
              />
              <View style={styles.propertyCard}>
                {/* Property Image and Header */}
                <View style={styles.propertyHeader}>
                  <View style={styles.propertyHeaderText}>
                    <Text style={styles.propertyTitle}>{property.nickname || 'Property'}</Text>
                    <View
                      style={[
                        styles.typeBadge,
                        { backgroundColor: themeColors?.isDark ? darkenColor(themeColors.primary, 0.4) : getColorWithOpacity(themeColors.primary, 0.5) },
                      ]}
                    >
                      <Text style={styles.typeBadgeText}>{familyName}</Text>
                    </View>
                  </View>
                </View>

                {/* Property Details Grid */}
                <View style={styles.detailsGrid}>
                  <View style={styles.detailItem}>
                    <Text style={styles.detailLabel}>{t('modals.purchase_date')}</Text>
                    <Text style={styles.detailValue}>{formatDate(property.purchasedate)}</Text>
                  </View>
                  <View style={styles.detailItem}>
                    <Text style={styles.detailLabel}>{t('modals.purchase_price')}</Text>
                    <Text style={styles.detailValue}>{formatCurrency(property.purchaseprice)}</Text>
                  </View>
                  <View style={styles.detailItem}>
                    <Text style={styles.detailLabel}>{t('modals.end_sell_date')}</Text>
                    <Text style={styles.detailValue}>{formatDate(property.endselldate)}</Text>
                  </View>
                  <View style={styles.detailItem}>
                    <Text style={styles.detailLabel}>{t('modals.est_current_value')}</Text>
                    <Text style={styles.detailValue}>{formatCurrency(property.estcurrentvalue)}</Text>
                  </View>
                </View>

                {/* Address — state/country IDs resolved to names */}
                <Text style={styles.address}>
                  {[
                    property.streetaddress,
                    property.aptsuite,
                    property.city,
                    nameFromMap(stateNames, property.state),
                    property.zip,
                    nameFromMap(countryNames, property.country),
                  ]
                    .filter(Boolean)
                    .join(', ')}
                </Text>

                {/* Notes */}
                {!!property?.notes && (
                  <View style={styles.notesContainer}>
                    <Text style={styles.notesLabel}>{t('common.notes') || 'Notes'}</Text>
                    <Text style={styles.notesText}>{property.notes}</Text>
                  </View>
                )}

                {/* Purchase & Financing Section */}
                <View style={styles.section}>
                  <View style={styles.sectionTitleContainer}>
                    <Text style={styles.sectionTitle}>{t('modals.purchase_financing_loan')}</Text>
                    {actionable && (
                      <TouchableOpacity style={[styles.addBtn, { backgroundColor: themeColors?.isDark ? darkenColor(themeColors.primary, 0.4) : getColorWithOpacity(themeColors.primary, 0.5) }]} onPress={() => handleAddNew('AddLoanMortgage', { realEstateId: property.id })}>
                        <Feather name="plus" size={18} color={themeColors.textPrimary} />
                      </TouchableOpacity>
                    )}
                  </View>
                  {
                    (property?.loans || []).map((loan: any, index: number) => (
                      <View key={index} style={styles.itemCard}>
                        <View style={styles.itemHeader}>
                          <Text style={styles.itemName}>{loan.lenderprovider || 'Lender Provider'}</Text>
                          <View
                            style={[
                              styles.amountBadge,
                              { backgroundColor: themeColors?.isDark ? darkenColor(themeColors.primary, 0.4) : getColorWithOpacity(themeColors.primary, 0.5) },
                            ]}
                          >
                            <Text style={styles.amountText}>{formatCurrency(loan.monthlypayment)}</Text>
                          </View>
                          <View style={styles.itemActions}>
                            <TouchableOpacity style={styles.actionButton} onPress={() => navigateToHistory('Loan', loan.id)}>
                              <MaterialIcons name="history" size={24} color={themeColors.secondary} />
                            </TouchableOpacity>
                            {actionable && (
                              <TouchableOpacity style={styles.actionButton} onPress={() => handleEditLoan(loan)}>
                                <Image
                                  source={ICONS.EDIT_ICON}
                                  style={[
                                    styles.actionIcon,
                                    { tintColor: themeColors.secondary },
                                  ]}
                                />
                              </TouchableOpacity>
                            )}
                            {canDelete && (
                              <TouchableOpacity style={styles.actionButton} onPress={() => handleDeleteLoan(loan)}>
                                <Image
                                  source={ICONS.DELETE_ICON}
                                  style={[
                                    styles.actionIcon,
                                    { tintColor: themeColors.secondary },
                                  ]}
                                />
                              </TouchableOpacity>
                            )}
                          </View>
                        </View>

                        {loan.lenderlocation && <Text style={styles.itemSubtitle}>{loan.lenderlocation}</Text>}
                        {loan.lenderphonenumber && <Text style={styles.itemDetail}>{t('common.phone_label')}: {loan.lenderphonenumber}</Text>}
                        {loan.lenderemail && <Text style={styles.itemDetail}>{t('common.email_label')}: {loan.lenderemail}</Text>}
                        {loan.accountnumber && <Text style={styles.itemDetail}>
                          {t('common.acc_label')}: {loan.accountnumber} {loan.balance && `${t('common.balance_label')}: ${formatCurrency(loan.balance)}`}
                        </Text>}
                        {loan.estbalance && <Text style={styles.itemDetail}>{t('common.est_balance')}: {formatCurrency(loan.estbalance)}</Text>}
                        {(loan.startdate || loan.enddate) && <Text style={styles.itemDetail}>
                          {formatDate(loan.startdate)} - {formatDate(loan.enddate)} {loan.dueday && `${t('common.due_day')}: ${loan.dueday}`}
                        </Text>}
                        {loan.ratepercent && <Text style={styles.itemDetail}>{t('common.rate_percent')}: {loan.ratepercent} {loan.bestname && loan.bestname}</Text>}
                        {loan.uploadattachments && loan.uploadattachments.length > 0 && (
                          <MixedMediaDisplayer attachmentIds={toIds(loan.uploadattachments)} showDocHeading={false} />
                        )}
                      </View>
                    ))
                  }
                </View>

                {/* Utilities, then other expenses (split by the expense type's category, as on the web) */}
                {expenseGroups.map(group => (
                <View key={group.key} style={styles.section}>
                  <View style={styles.sectionTitleContainer}>
                    <Text style={styles.sectionTitle}>{group.title}</Text>
                    {actionable && (
                      <TouchableOpacity style={[styles.addBtn, { backgroundColor: themeColors?.isDark ? darkenColor(themeColors.primary, 0.4) : getColorWithOpacity(themeColors.primary, 0.5) }]} onPress={() => handleAddNew('AddUtilities', { realEstateId: property.id })}>
                        <Feather name="plus" size={18} color={themeColors.textPrimary} />
                      </TouchableOpacity>
                    )}
                  </View>
                  {group.items.map((utility: any, index: number) => (
                    <View key={index} style={styles.itemCard}>
                      <View style={styles.itemHeader}>
                        <Text style={styles.itemName}>{utility.vendor || t('common.vendor')}</Text>
                        <View
                          style={[
                            styles.amountBadge,
                            { backgroundColor: themeColors?.isDark ? darkenColor(themeColors.primary, 0.4) : getColorWithOpacity(themeColors.primary, 0.5) },
                          ]}
                        >
                          <Text style={styles.amountText}>{formatBillingAmount(formatCurrency(utility.averagemonthlyamount), utility.billingfrequency, true)}</Text>
                        </View>
                        <View style={styles.itemActions}>
                          <TouchableOpacity style={styles.actionButton} onPress={() => navigateToHistory('Utility', utility.id)}>
                            <MaterialIcons name="history" size={24} color={themeColors.secondary} />
                          </TouchableOpacity>
                          {actionable && (
                            <TouchableOpacity style={styles.actionButton} onPress={() => handleEditUtility(utility)}>
                              <Image
                                source={ICONS.EDIT_ICON}
                                style={[
                                  styles.actionIcon,
                                  { tintColor: themeColors.secondary },
                                ]}
                              />
                            </TouchableOpacity>
                          )}
                          {canDelete && (
                            <TouchableOpacity style={styles.actionButton} onPress={() => handleDeleteUtility(utility)}>
                              <Image
                                source={ICONS.DELETE_ICON}
                                style={[
                                  styles.actionIcon,
                                  { tintColor: themeColors.secondary },
                                ]}
                              />
                            </TouchableOpacity>
                          )}
                        </View>
                      </View>

                      {utility.utilitytype && <Text style={styles.itemSubtitle}>{(dropdownLabel(utilityTypeOptions, utility.utilitytype) ?? get_dropdown_options_data?.find((option: any) => String(option.value) === String(utility.utilitytype))?.label) || '-'}</Text>}
                      {utility.enddate && <Text style={styles.itemDetail}>
                        {t('common.end_label')}: {formatDate(utility.enddate)} {utility.accountnumber && `${t('common.acc_label')}: ${utility.accountnumber}`}
                      </Text>}
                      {utility.phonenumber && <Text style={styles.itemDetail}>
                        {t('common.phone_label')}: {utility.phonenumber} {utility.dueday && `${t('common.due_day')}: ${utility.dueday}`}
                      </Text>}
                      {utility.website && <Text style={styles.itemDetail}>
                        {t('common.website_label')}: {utility.website}
                      </Text>}
                      {utility.uploadattachments && utility.uploadattachments.length > 0 && (
                        <MixedMediaDisplayer attachmentIds={toIds(utility.uploadattachments)} showDocHeading={false} />
                      )}
                    </View>))}
                </View>
                ))}

                {/* Insurance Section */}
                <View style={styles.section}>
                  <View style={styles.sectionTitleContainer}>
                    <Text style={styles.sectionTitle}>{t('modals.insurance')}</Text>
                    {actionable && (
                      <TouchableOpacity style={[styles.addBtn, { backgroundColor: themeColors?.isDark ? darkenColor(themeColors.primary, 0.4) : getColorWithOpacity(themeColors.primary, 0.5) }]} onPress={() => handleAddNew('AddInsurance', { realEstateId: property.id })}>
                        <Feather name="plus" size={18} color={themeColors.textPrimary} />
                      </TouchableOpacity>
                    )}
                  </View>
                  {(property?.insurances || []).map((insurance: any, index: number) => (
                    <View key={index} style={styles.itemCard}>
                      <View style={styles.itemHeader}>
                        <Text style={styles.itemName}>{insurance.itemname || 'Item Name'}</Text>
                        <View
                          style={[
                            styles.amountBadge,
                            { backgroundColor: themeColors?.isDark ? darkenColor(themeColors.primary, 0.4) : getColorWithOpacity(themeColors.primary, 0.5) },
                          ]}
                        >
                          <Text style={styles.amountText}>{formatCurrency(insurance.annualpremium)}</Text>
                        </View>
                        <View style={styles.itemActions}>
                          <TouchableOpacity style={styles.actionButton} onPress={() => navigateToHistory('Insurance', insurance.id)}>
                            <MaterialIcons name="history" size={24} color={themeColors.secondary} />
                          </TouchableOpacity>
                          {actionable && (
                            <TouchableOpacity style={styles.actionButton} onPress={() => handleEditInsurance(insurance)}>
                              <Image
                                source={ICONS.EDIT_ICON}
                                style={[
                                  styles.actionIcon,
                                  { tintColor: themeColors.secondary },
                                ]}
                              />
                            </TouchableOpacity>
                          )}
                          {canDelete && (
                            <TouchableOpacity style={styles.actionButton} onPress={() => handleDeleteRental(insurance)}>
                              <Image
                                source={ICONS.DELETE_ICON}
                                style={[
                                  styles.actionIcon,
                                  { tintColor: themeColors.secondary },
                                ]}
                              />
                            </TouchableOpacity>
                          )}
                        </View>
                      </View>

                      {insurance.insurancecarrier && <Text style={styles.itemSubtitle}>{insurance.insurancecarrier}</Text>}
                      {insurance.agentphone && <Text style={styles.itemDetail}>{t('common.phone_label')}: {insurance.agentphone}</Text>}
                      {insurance.agentemail && <Text style={styles.itemDetail}>{t('common.email_label')}: {insurance.agentemail}</Text>}
                      {insurance.policynumber && <Text style={styles.itemDetail}>
                        {t('common.policy_hash')}: {insurance.policynumber}
                      </Text>}
                      {(insurance.startdate || insurance.enddate) && <Text style={styles.itemDetail}>
                        {formatDate(insurance.startdate)} - {formatDate(insurance.enddate)} {insurance.dueday && `${t('common.due_day')}: ${insurance.dueday}`}
                      </Text>}
                      {insurance.renewaldate && <Text style={styles.itemDetail}>{t('common.renewal')}: {formatDate(insurance.renewaldate)}</Text>}
                      {insurance.agent && <Text style={styles.itemDetail}>{t('common.agent_label')}: {insurance.agent}</Text>}
                      {insurance.uploadattachments && insurance.uploadattachments.length > 0 && (
                        <MixedMediaDisplayer attachmentIds={toIds(insurance.uploadattachments)} showDocHeading={false} />
                      )}
                    </View>))}
                </View>

                {/* Warranty Section */}
                <View style={styles.section}>
                  <View style={styles.sectionTitleContainer}>
                    <Text style={styles.sectionTitle}>{t('modals.warranty')}</Text>
                    {actionable && (
                      <TouchableOpacity style={[styles.addBtn, { backgroundColor: themeColors?.isDark ? darkenColor(themeColors.primary, 0.4) : getColorWithOpacity(themeColors.primary, 0.5) }]} onPress={() => handleAddNew('AddWarranties', { realEstateId: property.id })}>
                        <Feather name="plus" size={18} color={themeColors.textPrimary} />
                      </TouchableOpacity>
                    )}
                  </View>
                  {(property?.warranties || []).map((warranty: any, index: number) => (
                    <View key={index} style={styles.itemCard}>
                      <View style={styles.itemHeader}>
                        <Text style={styles.itemName}>{warranty.itemname || 'Item Name'}</Text>
                        <View
                          style={[
                            styles.dateBadge,
                            { backgroundColor: themeColors?.isDark ? darkenColor(themeColors.primary, 0.4) : getColorWithOpacity(themeColors.primary, 0.5) },
                          ]}
                        >
                          <Text style={styles.dateBadgeText}>{formatDate(warranty.expiration)}</Text>
                        </View>
                        <View style={styles.itemActions}>
                          <TouchableOpacity style={styles.actionButton} onPress={() => navigateToHistory('Warranty', warranty.id)}>
                            <MaterialIcons name="history" size={24} color={themeColors.secondary} />
                          </TouchableOpacity>
                          {actionable && (
                            <TouchableOpacity style={styles.actionButton} onPress={() => handleEditWarranty(warranty)}>
                              <Image
                                source={ICONS.EDIT_ICON}
                                style={[
                                  styles.actionIcon,
                                  { tintColor: themeColors.secondary },
                                ]}
                              />
                            </TouchableOpacity>
                          )}
                          {canDelete && (
                            <TouchableOpacity style={styles.actionButton} onPress={() => handleDeleteWarranty(warranty)}>
                              <Image
                                source={ICONS.DELETE_ICON}
                                style={[
                                  styles.actionIcon,
                                  { tintColor: themeColors.secondary },
                                ]}
                              />
                            </TouchableOpacity>
                          )}
                        </View>
                      </View>

                      {warranty.warrantyprovider && <Text style={styles.itemSubtitle}>{warranty.warrantyprovider}</Text>}
                      {(warranty.expiration || warranty.startdate) && <Text style={styles.itemDetail}>
                        Exp: {formatDate(warranty.expiration)} - Start: {formatDate(warranty.startdate)}
                      </Text>}
                      {warranty.notes && <Text style={styles.itemDetail}>
                        {warranty.notes}
                      </Text>}
                      {!!warranty.website && (
                        <Text style={[styles.attachmentText, { color: themeColors.primary }]}>{warranty.website}</Text>
                      )}
                      {warranty.uploadattachments && warranty.uploadattachments.length > 0 && (
                        <MixedMediaDisplayer attachmentIds={toIds(warranty.uploadattachments)} showDocHeading={false} />
                      )}
                    </View>
                  ))}
                </View>

                {/* Personal Property / Business Property Section */}
                <View style={styles.section}>
                  <View style={styles.sectionTitleContainer}>
                    <Text style={styles.sectionTitle}>
                      {isBusinessRole()
                        ? t('modals.business_property_at_address')
                        : t('modals.personal_property_at_address')}
                    </Text>
                    {actionable && (
                      <TouchableOpacity style={[styles.addBtn, { backgroundColor: themeColors?.isDark ? darkenColor(themeColors.primary, 0.4) : getColorWithOpacity(themeColors.primary, 0.5) }]} onPress={() => handleAddNew('AddPersonalPropertyAtAddress', { realEstateId: property.id })}>
                        <Feather name="plus" size={18} color={themeColors.textPrimary} />
                      </TouchableOpacity>
                    )}
                  </View>

                  {(property?.properties || []).map((propertyItem: any, index: number) => (
                    <View key={index} style={styles.itemCard}>
                      <View style={styles.itemHeader}>
                        <Text style={styles.itemName}>{propertyItem.name || 'Item Name'}</Text>
                        <View
                          style={[
                            styles.categoryBadge,
                            { backgroundColor: themeColors?.isDark ? darkenColor(themeColors.primary, 0.4) : getColorWithOpacity(themeColors.primary, 0.5) },
                          ]}
                        >
                          <Text style={styles.categoryBadgeText}>{propertyItem.category || 'Category'}</Text>
                        </View>
                        <View style={styles.itemActions}>
                          <TouchableOpacity style={styles.actionButton} onPress={() => navigateToHistory('Property', propertyItem.id)}>
                            <MaterialIcons name="history" size={24} color={themeColors.secondary} />
                          </TouchableOpacity>
                          {actionable && (
                            <TouchableOpacity style={styles.actionButton} onPress={() => handleEditProperty(propertyItem)}>
                              <Image
                                source={ICONS.EDIT_ICON}
                                style={[
                                  styles.actionIcon,
                                  { tintColor: themeColors.secondary },
                                ]}
                              />
                            </TouchableOpacity>
                          )}
                          {canDelete && (
                            <TouchableOpacity style={styles.actionButton} onPress={() => handleDeleteProperty(propertyItem)}>
                              <Image
                                source={ICONS.DELETE_ICON}
                                style={[
                                  styles.actionIcon,
                                  { tintColor: themeColors.secondary },
                                ]}
                              />
                            </TouchableOpacity>
                          )}
                        </View>
                      </View>

                      {propertyItem.modelserial && <Text style={styles.itemDetail}>{t('common.model_serial')}: {propertyItem.modelserial}</Text>}
                      {(propertyItem.purchasedate || propertyItem.price) && <Text style={styles.itemDetail}>
                        {t('common.purchase_date_label')}: {formatDate(propertyItem.purchasedate)} {t('common.price_label')}: {formatCurrency(propertyItem.price)}
                      </Text>}
                      {propertyItem.datesolddiscarded && <Text style={styles.itemDetail}>{t('common.end_date')}: {formatDate(propertyItem.datesolddiscarded)}</Text>}
                      {propertyItem.attachment && propertyItem.attachment.length > 0 && (
                        <MixedMediaDisplayer attachmentIds={toIds(propertyItem.attachment)} showDocHeading={false} />
                      )}
                    </View>))}
                </View>

                {/* Services & Work History Section */}
                <View style={styles.section}>
                  <View style={styles.sectionTitleContainer}>
                    <Text style={styles.sectionTitle}>{t('modals.services_work_history')}</Text>
                    {actionable && (
                      <TouchableOpacity style={[styles.addBtn, { backgroundColor: themeColors?.isDark ? darkenColor(themeColors.primary, 0.4) : getColorWithOpacity(themeColors.primary, 0.5) }]} onPress={() => handleAddNew('AddServicesWorkHistory', { realEstateId: property.id })}>
                        <Feather name="plus" size={18} color={themeColors.textPrimary} />
                      </TouchableOpacity>
                    )}
                  </View>
                  {(property?.serviceworkhistories || []).map((serviceItem: any, index: number) => (
                    <View key={index} style={styles.itemCard}>
                      <View style={styles.itemHeader}>
                        <Text style={styles.itemName}>{serviceItem.vendorcontractor || t('common.vendor_contractor')}</Text>
                        <View
                          style={[
                            styles.amountBadge,
                            { backgroundColor: themeColors?.isDark ? darkenColor(themeColors.primary, 0.4) : getColorWithOpacity(themeColors.primary, 0.5) },
                          ]}
                        >
                          <Text style={styles.amountText}>{formatCurrency(serviceItem.cost)}</Text>
                        </View>
                        <View style={styles.itemActions}>
                          <LinkedRecordsButton
                            record={serviceItem?.id ? { moduleKey: 'realestateservice', id: Number(serviceItem.id) } : null}
                            canEdit={!!actionable && !ownerUserId}
                            ownerUserId={ownerUserId ?? null}
                          />
                          <TouchableOpacity style={styles.actionButton} onPress={() => navigateToHistory('ServiceWorkHistory', serviceItem.id)}>
                            <MaterialIcons name="history" size={24} color={themeColors.secondary} />
                          </TouchableOpacity>
                          {actionable && (
                            <TouchableOpacity style={styles.actionButton} onPress={() => handleEditService(serviceItem)}>
                              <Image
                                source={ICONS.EDIT_ICON}
                                style={[
                                  styles.actionIcon,
                                  { tintColor: themeColors.secondary },
                                ]}
                              />
                            </TouchableOpacity>
                          )}
                          {canDelete && (
                            <TouchableOpacity style={styles.actionButton} onPress={() => handleDeleteService(serviceItem)}>
                              <Image
                                source={ICONS.DELETE_ICON}
                                style={[
                                  styles.actionIcon,
                                  { tintColor: themeColors.secondary },
                                ]}
                              />
                            </TouchableOpacity>
                          )}
                        </View>
                      </View>

                      {(serviceItem.tags || serviceItem.date) && (
                        <Text style={styles.itemSubtitle}>
                          {serviceItem.tags && serviceItem.tags} {serviceItem.date && `• ${t('common.date_label')}: ${formatDate(serviceItem.date)}`}
                        </Text>
                      )}
                      {serviceItem.paymentmethod && <Text style={styles.itemSubtitle}>{t('common.payment_method')}: {serviceItem.paymentmethod}</Text>}
                      {serviceItem.description && <Text style={styles.itemDetail}>
                        {serviceItem.description}
                      </Text>}
                      {serviceItem.attachment && serviceItem.attachment.length > 0 && (
                        <MixedMediaDisplayer attachmentIds={toIds(serviceItem.attachment)} showDocHeading={false} />
                      )}
                    </View>))}
                </View>

                {/* Close Button */}
                <TouchableOpacity
                  style={[
                    styles.closeButton,
                    { backgroundColor: themeColors.primary },
                  ]}
                  onPress={onClose}
                >
                  <Text style={styles.closeButtonText}>{t('common.close')}</Text>
                </TouchableOpacity>
              </View>
            </RecordViewTabs>
            </ScrollView>
          )}
        </View>
      </View>
    </Modal>
    {GateModal}
    </>
  );
};

export default ViewRealEstateModal;
