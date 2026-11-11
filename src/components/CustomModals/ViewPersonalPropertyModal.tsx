import React, { useMemo } from 'react';
import { enforceHttps } from '../../utils/httpsGuard';
import {
  View,
  Text,
  Modal,
  ScrollView,
  TouchableOpacity,
  Linking,
  ActivityIndicator,
  Image,
} from 'react-native';
import colors, { getColorWithOpacity } from '../../utils/colors';
import FONTS from '../../utils/fonts';
import { useTranslation } from 'react-i18next';
import { useUserRole } from '../../hooks/useUserRole';
import type { ViewPersonalPropertyModalProps } from '../../types/viewPersonalPropertyModal.types';
import {
  downloadAndOpenDocument,
  formatDate,
  getDocumentUrl,
} from '../../utils/helpers';
import { RemoteImage } from '../common';
import Feather from 'react-native-vector-icons/Feather';
import AntDesign from 'react-native-vector-icons/AntDesign';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import { ICONS } from '../../utils/Images';
import { useNavigation } from '@react-navigation/native';
import { useSelector } from 'react-redux';
import { makeViewPersonalPropertyModalStyles } from './ViewPersonalPropertyModal.styles';
import { RoleTheme } from '../../types/roleManager.types';
import { darkenColor } from '../../utils/roleManager';
import { RecordViewTabs, type RecordLinkTabsProp } from '../recordLinks/RecordViewTabs';

const ViewPersonalPropertyModal: React.FC<ViewPersonalPropertyModalProps & RecordLinkTabsProp> = ({ linkTabs,
  visible,
  onClose,
  property,
  isLoading,
  actionable = true,
  ownerUserId,
  onEditProperty,
  onEditLoan,
  onEditInsurance,
  onEditWarranty,
  onDeleteLoan,
  onDeleteInsurance,
  onDeleteWarranty,
}) => {
  const { t } = useTranslation();
  const navigation = useNavigation<any>();
  const { themeColors, userRole } = useUserRole();
  const styles = useMemo(() => makeViewPersonalPropertyModalStyles(themeColors as RoleTheme), [themeColors]);
  const { get_dropdown_options_data } = useSelector((state: any) => state.user_auth);

  const categoryLabel = get_dropdown_options_data?.find(
    (option: any) => String(option.value) === String(property?.category),
  )?.label || '-';

  if (!property) return null;

  const handleDownloadAttachment = async (
    attachmentId: string,
    fileName: string,
  ) => {
    onClose(); // Close modal immediately on attachment click
    try {
      const documentUrl = getDocumentUrl(attachmentId);
      await downloadAndOpenDocument(documentUrl, fileName);
    } catch (error) {
      console.error('Error downloading attachment:', error);
    }
  };

  const handleOpenWebsite = async (url: string) => {
    try {
      const supported = await Linking.canOpenURL(enforceHttps(url));
      if (supported) {
        await Linking.openURL(enforceHttps(url));
      } else {
        console.error(`Cannot open URL: ${url}`);
      }
    } catch (error) {
      console.error('Error opening website:', error);
    }
  };

  const toIds = (val: any): string[] => {
    if (!val) return [];
    if (Array.isArray(val)) return val.filter(Boolean);
    return [val];
  };

  const formatCurrency = (
    amount: number | string | null | undefined,
  ): string => {
    if (!amount) return '$0.00';
    const numAmount = typeof amount === 'string' ? parseFloat(amount) : amount;
    if (isNaN(numAmount)) return '$0.00';
    return `$${numAmount.toLocaleString('en-US', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    })}`;
  };

  const navigateToHistory = (entityType: string, entityId?: number): void => {
    if (!entityId) return;
    navigation.navigate('EditHistoryList', {
      entityType,
      entityId,
      title: t('edit_history.title'),
    });
    onClose();
  };

  const handleAddNew = (screenName: string, params?: any): void => {
    navigation.navigate(screenName, {
      addNew: true,
      ...params,
      ...(ownerUserId ? { ownerUserId } : {}),
    });
    onClose();
  };

  const handleEditPropertyFallback = (): void => {
    if (onEditProperty) {
      onEditProperty(property);
      return;
    }

    if (property?.id) {
      navigation.navigate('EditPersonalProperty', {
        propertyId: property.id,
        ...(ownerUserId ? { ownerUserId } : {}),
      });
      onClose();
    }
  };

  const renderAttachments = (value: any, label: string, prefix: string) => {
    const docs = toIds(value);
    if (docs.length === 0) return null;

    return docs.map((docId, idx) => (
      <TouchableOpacity
        key={`${prefix}-${idx}`}
        style={styles.attachmentRow}
        onPress={() =>
          handleDownloadAttachment(
            docId,
            `${prefix}_${property?.id || 'doc'}_${idx + 1}.pdf`,
          )
        }
      >
        <Feather name="paperclip" size={16} color={themeColors.primary} />
        <Text style={[styles.attachmentText, { color: themeColors.primary }]}>
          {label}
          {docs.length > 1 ? ` (${idx + 1})` : ''}
        </Text>
      </TouchableOpacity>
    ));
  };

  return (
    <Modal
      visible={visible}
      transparent={true}
      animationType="fade"
      onRequestClose={onClose}
    >
      <View style={styles.overlay}>
        <View style={styles.modalContainer}>
          <TouchableOpacity
            style={styles.closeIconButton}
            onPress={onClose}
            activeOpacity={0.7}
          >
            <AntDesign name="close" size={20} color={colors.black} />
          </TouchableOpacity>

          {isLoading ? (
            <View style={styles.loadingContainer}>
              <ActivityIndicator size="large" color={themeColors.primary} />
              <Text style={styles.loadingText}>
                {t('common.loading') || 'Loading...'}
              </Text>
            </View>
          ) : (
            <ScrollView
              style={styles.scrollView}
              contentContainerStyle={styles.scrollContent}
              showsVerticalScrollIndicator={false}
            >
            <RecordViewTabs {...linkTabs} onNavigate={linkTabs?.onNavigate ?? onClose}>
              {toIds(property?.attachment).length > 0 && (
                <RemoteImage
                  imageIds={toIds(property?.attachment)}
                  style={styles.propertyImage}
                  resizeMode="cover"
                />
              )}

              <View style={styles.propertyCard}>
                <View style={styles.propertyHeader}>
                  <View style={styles.propertyInfo}>
                    <Text style={styles.propertyName}>
                      {property?.name || 'N/A'}
                    </Text>
                    <Text style={styles.propertyCategory}>
                      {categoryLabel}
                    </Text>
                  </View>
                  <View
                    style={[
                      styles.priceBadge,
                      { backgroundColor: themeColors?.isDark ? getColorWithOpacity(themeColors.primary, 0.8) : getColorWithOpacity(themeColors.primary, 0.5) },
                    ]}
                  >
                    <Text style={styles.priceText}>
                      {formatCurrency(property?.price)}
                    </Text>
                  </View>
                </View>

                <View style={styles.infoRow}>
                  <View style={styles.infoColumn}>
                    <Text style={styles.infoLabel}>
                      {t('personal_property.serial_number')}
                    </Text>
                    <Text style={styles.infoValue}>
                      {property?.modelserial || 'N/A'}
                    </Text>
                  </View>
                  <View style={styles.infoColumn}>
                    <Text style={styles.infoLabel}>
                      {t('personal_property.purchase_date')}
                    </Text>
                    <Text style={styles.infoValue}>
                      {formatDate(property?.purchasedate)}
                    </Text>
                  </View>
                </View>

                <View style={styles.infoRow}>
                  {property?.datesolddiscarded && (
                    <View style={styles.infoColumn}>
                      <Text style={styles.infoLabel}>
                        {t('personal_property.date_sold_discarded')}
                      </Text>
                      <Text style={styles.infoValue}>
                        {formatDate(property?.datesolddiscarded)}
                      </Text>
                    </View>
                  )}
                  {property?.soldamount && (
                    <View style={styles.infoColumn}>
                      <Text style={styles.infoLabel}>
                        {t('add_personal_property.soldAmount')}
                      </Text>
                      <Text style={styles.infoValue}>
                        {formatCurrency(property?.soldamount)}
                      </Text>
                    </View>
                  )}
                </View>

                <View style={styles.section}>
                  <View style={styles.sectionTitleContainer}>
                    <Text style={styles.sectionTitle}>
                      {t('personal_property.loan')}
                    </Text>
                  </View>
                  {property?.loan ? (
                    <View style={styles.itemCard}>
                      <View style={styles.itemHeader}>
                        <Text style={styles.itemName}>
                          {property.loan.bestname ||
                            property.loan.lenderprovider ||
                            'Loan'}
                        </Text>
                        <View
                          style={[
                            styles.amountBadge,
                            { backgroundColor: themeColors?.isDark ? getColorWithOpacity(themeColors.primary, 0.8) : getColorWithOpacity(themeColors.primary, 0.5) },
                          ]}
                        >
                          <Text style={styles.amountText}>
                            {formatCurrency(property.loan.monthlypayment)}
                          </Text>
                        </View>
                        <View style={styles.itemActions}>
                          <TouchableOpacity
                            style={styles.actionButton}
                            onPress={() =>
                              navigateToHistory('Loan', property.loan?.id)
                            }
                          >
                            <MaterialIcons
                              name="history"
                              size={24}
                              color={themeColors.secondary}
                            />
                          </TouchableOpacity>
                          {actionable && (
                            <>
                              <TouchableOpacity
                                style={styles.actionButton}
                                onPress={() =>
                                  onEditLoan
                                    ? onEditLoan(property.loan)
                                    : handleEditPropertyFallback()
                                }
                              >
                                <Image
                                  source={ICONS.EDIT_ICON}
                                  style={[
                                    styles.actionIcon,
                                    { tintColor: themeColors.secondary },
                                  ]}
                                />
                              </TouchableOpacity>
                              {onDeleteLoan && (
                                <TouchableOpacity
                                  style={styles.actionButton}
                                  onPress={() => onDeleteLoan(property.loan)}
                                >
                                  <Image
                                    source={ICONS.DELETE_ICON}
                                    style={[
                                      styles.actionIcon,
                                      { tintColor: themeColors.secondary },
                                    ]}
                                  />
                                </TouchableOpacity>
                              )}
                            </>
                          )}
                        </View>
                      </View>
                      {property.loan.accountnumber && (
                        <Text style={styles.itemDetail}>
                          {t('personal_property.account_number')}:{' '}
                          {property.loan.accountnumber}
                        </Text>
                      )}
                      {(property.loan.startdate || property.loan.enddate) && (
                        <Text style={styles.itemDetail}>
                          {formatDate(property.loan.startdate)} -{' '}
                          {formatDate(property.loan.enddate)}
                        </Text>
                      )}
                      {!!property.loan.lenderemail && (
                        <Text style={styles.itemDetail}>
                          {property.loan.lenderemail}
                        </Text>
                      )}
                      {renderAttachments(
                        property.loan.uploadattachments,
                        t('personal_property.download_attachment'),
                        'loan',
                      )}
                    </View>
                  ) : (
                    <Text style={styles.emptySectionText}>
                      {t('common.no_data_found') || 'No data available'}
                    </Text>
                  )}
                </View>

                <View style={styles.section}>
                  <View style={styles.sectionTitleContainer}>
                    <Text style={styles.sectionTitle}>
                      {t('personal_property.insurance')}
                    </Text>
                  </View>
                  {property?.insurance ? (
                    <View style={styles.itemCard}>
                      <View style={styles.itemHeader}>
                        <Text style={styles.itemName}>
                          {property.insurance.itemname || 'Insurance'}
                        </Text>
                        <View
                          style={[
                            styles.amountBadge,
                            { backgroundColor: themeColors?.isDark ? getColorWithOpacity(themeColors.primary, 0.8) : getColorWithOpacity(themeColors.primary, 0.5) },
                          ]}
                        >
                          <Text style={styles.amountText}>
                            {formatCurrency(property.insurance.annualpremium)}
                          </Text>
                        </View>
                        <View style={styles.itemActions}>
                          <TouchableOpacity
                            style={styles.actionButton}
                            onPress={() =>
                              navigateToHistory(
                                'Insurance',
                                property.insurance?.id,
                              )
                            }
                          >
                            <MaterialIcons
                              name="history"
                              size={24}
                              color={themeColors.secondary}
                            />
                          </TouchableOpacity>
                          {actionable && (
                            <>
                              <TouchableOpacity
                                style={styles.actionButton}
                                onPress={() =>
                                  onEditInsurance
                                    ? onEditInsurance(property.insurance)
                                    : handleEditPropertyFallback()
                                }
                              >
                                <Image
                                  source={ICONS.EDIT_ICON}
                                  style={[
                                    styles.actionIcon,
                                    { tintColor: themeColors.secondary },
                                  ]}
                                />
                              </TouchableOpacity>
                              {onDeleteInsurance && (
                                <TouchableOpacity
                                  style={styles.actionButton}
                                  onPress={() =>
                                    onDeleteInsurance(property.insurance)
                                  }
                                >
                                  <Image
                                    source={ICONS.DELETE_ICON}
                                    style={[
                                      styles.actionIcon,
                                      { tintColor: themeColors.secondary },
                                    ]}
                                  />
                                </TouchableOpacity>
                              )}
                            </>
                          )}
                        </View>
                      </View>
                      {!!property.insurance.insurancecarrier && (
                        <Text style={styles.itemSubtitle}>
                          {property.insurance.insurancecarrier}
                        </Text>
                      )}
                      {(property.insurance.startdate ||
                        property.insurance.enddate) && (
                          <Text style={styles.itemDetail}>
                            {formatDate(property.insurance.startdate)} -{' '}
                            {formatDate(property.insurance.enddate)}
                          </Text>
                        )}
                      {!!property.insurance.agentemail && (
                        <Text style={styles.itemDetail}>
                          {property.insurance.agentemail}
                        </Text>
                      )}
                      {renderAttachments(
                        property.insurance.uploadattachments,
                        t('personal_property.download_attachment'),
                        'insurance',
                      )}
                    </View>
                  ) : (
                    <Text style={styles.emptySectionText}>
                      {t('common.no_data_found') || 'No data available'}
                    </Text>
                  )}
                </View>

                <View style={styles.section}>
                  <View style={styles.sectionTitleContainer}>
                    <Text style={styles.sectionTitle}>
                      {t('personal_property.warranty')}
                    </Text>
                  </View>
                  {property?.warranty ? (
                    <View style={styles.itemCard}>
                      <View style={styles.itemHeader}>
                        <Text style={styles.itemName}>
                          {property.warranty.itemname || 'Warranty'}
                        </Text>
                        <View
                          style={[
                            styles.dateBadge,
                            { backgroundColor: themeColors?.isDark ? getColorWithOpacity(themeColors.primary, 0.8) : getColorWithOpacity(themeColors.primary, 0.5) },
                          ]}
                        >
                          <Text style={styles.dateBadgeText}>
                            {formatDate(property.warranty.expiration)}
                          </Text>
                        </View>
                        <View style={styles.itemActions}>
                          <TouchableOpacity
                            style={styles.actionButton}
                            onPress={() =>
                              navigateToHistory(
                                'Warranty',
                                property.warranty?.id,
                              )
                            }
                          >
                            <MaterialIcons
                              name="history"
                              size={24}
                              color={themeColors.secondary}
                            />
                          </TouchableOpacity>
                          {actionable && (
                            <>
                              <TouchableOpacity
                                style={styles.actionButton}
                                onPress={() =>
                                  onEditWarranty
                                    ? onEditWarranty(property.warranty)
                                    : handleEditPropertyFallback()
                                }
                              >
                                <Image
                                  source={ICONS.EDIT_ICON}
                                  style={[
                                    styles.actionIcon,
                                    { tintColor: themeColors.secondary },
                                  ]}
                                />
                              </TouchableOpacity>
                              {onDeleteWarranty && (
                                <TouchableOpacity
                                  style={styles.actionButton}
                                  onPress={() =>
                                    onDeleteWarranty(property.warranty)
                                  }
                                >
                                  <Image
                                    source={ICONS.DELETE_ICON}
                                    style={[
                                      styles.actionIcon,
                                      { tintColor: themeColors.secondary },
                                    ]}
                                  />
                                </TouchableOpacity>
                              )}
                            </>
                          )}
                        </View>
                      </View>
                      {(property.warranty.startdate ||
                        property.warranty.expiration) && (
                          <Text style={styles.itemDetail}>
                            {formatDate(property.warranty.startdate)} -{' '}
                            {formatDate(property.warranty.expiration)}
                          </Text>
                        )}
                      {!!property.warranty.website && (
                        <TouchableOpacity
                          onPress={() =>
                            handleOpenWebsite(property.warranty!.website!)
                          }
                        >
                          <Text
                            style={[
                              styles.attachmentText,
                              { color: themeColors.primary },
                            ]}
                          >
                            {property.warranty.website}
                          </Text>
                        </TouchableOpacity>
                      )}
                      {!!property.warranty.notes && (
                        <Text style={styles.itemDetail}>
                          {property.warranty.notes}
                        </Text>
                      )}
                      {renderAttachments(
                        property.warranty.uploadattachments,
                        t('personal_property.download_attachment'),
                        'warranty',
                      )}
                    </View>
                  ) : (
                    <Text style={styles.emptySectionText}>
                      {t('common.no_data_found') || 'No data available'}
                    </Text>
                  )}
                </View>

                <TouchableOpacity
                  style={[
                    styles.closeButton,
                    { backgroundColor: themeColors.primary },
                  ]}
                  onPress={onClose}
                >
                  <Text style={styles.closeButtonText}>
                    {t('common.close')}
                  </Text>
                </TouchableOpacity>
              </View>
            </RecordViewTabs>
            </ScrollView>
          )}
        </View>
      </View>
    </Modal>
  );
};

export default ViewPersonalPropertyModal;
