import React, { useCallback, useEffect, useState, useMemo } from 'react';
import { enforceHttps } from '../../utils/httpsGuard';
import {
  View,
  Text,
  Modal,
  ScrollView,
  TouchableOpacity,
  TouchableWithoutFeedback,
  ActivityIndicator,
  Dimensions,
  Alert,
  Linking,
} from 'react-native';
import { useTranslation } from 'react-i18next';
import Feather from 'react-native-vector-icons/Feather';
import Ionicons from 'react-native-vector-icons/Ionicons';
import colors from '../../utils/colors';
import { useUserRole } from '../../hooks/useUserRole';
import { MixedMediaDisplayer, RemoteImage } from '../common';
import { downloadAndOpenDocument, getDocumentUrl } from '../../utils/helpers';
import type { ViewDetailModalProps, DetailRowPair, DetailSection, DetailRow } from '../../types/viewDetailModal.types';
import { useDispatch, useSelector } from 'react-redux';
import { useFocusEffect } from '@react-navigation/native';
import { getDropdownOptionsAsync } from '../../redux/services/authService';
import { AppDispatch } from '../../types/store.types';
import { makeViewDetailModalStyles } from './ViewDetailModal.styles';
import { RoleTheme } from '../../types/roleManager.types';
import { RecordViewTabs, type RecordLinkTabsProp } from '../recordLinks/RecordViewTabs';

const ViewDetailModal: React.FC<ViewDetailModalProps & RecordLinkTabsProp> = ({ linkTabs,
  visible,
  onClose,
  data,
  isLoading = false,
  onViewCredentials,
  onRemoveFromWallet,
  removeFromWalletLoading = false,
}) => {
  const { t } = useTranslation();
  const { themeColors } = useUserRole();
  const styles = useMemo(() => makeViewDetailModalStyles(themeColors as RoleTheme), [themeColors]);
  const { get_dropdown_options_data } = useSelector((state: any) => state.user_auth);
  const dispatch = useDispatch<AppDispatch>();

  // Tracks which secret values (e.g. license keys) are currently revealed.
  const [revealedSecrets, setRevealedSecrets] = useState<Record<string, boolean>>({});
  const toggleSecret = useCallback((key: string) => {
    setRevealedSecrets((prev) => ({ ...prev, [key]: !prev[key] }));
  }, []);

  // Re-mask all secret values whenever the modal closes so they don't stay
  // revealed when it's reopened for another item.
  useEffect(() => {
    if (!visible) setRevealedSecrets({});
  }, [visible]);

  useFocusEffect(useCallback(() => {
    dispatch(getDropdownOptionsAsync('LegalDocumentType'));
  }, [dispatch]));

  if (!data && !isLoading) return null;

  // Renders a detail value, masking it with an eye toggle when the row is secret.
  const renderDetailValue = (row: DetailRow, secretKey: string) => {
    const fallback = t('common.na') || 'N/A';
    if (!row.secret || !row.value) {
      return <Text style={styles.detailValue}>{row.value || fallback}</Text>;
    }
    const isRevealed = revealedSecrets[secretKey];
    return (
      <View style={styles.secretValueRow}>
        <Text style={[styles.detailValue, styles.secretValue]} numberOfLines={1}>
          {isRevealed ? row.value : '•'.repeat(Math.min(row.value.length, 12))}
        </Text>
        <TouchableOpacity
          onPress={() => toggleSecret(secretKey)}
          style={styles.secretToggle}
          hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
        >
          <Ionicons
            name={isRevealed ? 'eye-off-outline' : 'eye-outline'}
            size={18}
            color={themeColors.primary}
          />
        </TouchableOpacity>
      </View>
    );
  };

  const handleOpenUrl = (url: string) => {
    let formattedUrl = url.trim();
    if (!formattedUrl.match(/^https?:\/\//i)) {
      formattedUrl = 'https://' + formattedUrl;
    }
    formattedUrl = enforceHttps(formattedUrl);
    Linking.canOpenURL(formattedUrl)
      .then((supported: boolean) => {
        if (supported) {
          Linking.openURL(formattedUrl);
        } else {
          Alert.alert(t('common.error') || 'Error', t('common.cannot_open_url'));
        }
      })
      .catch(() => {
        Alert.alert(t('common.error') || 'Error', t('common.invalid_url'));
      });
  };

  const handleDownloadDocument = async (docId: string, fileName?: string) => {
    onClose();
    try {
      const fullUrl = getDocumentUrl(docId);
      await downloadAndOpenDocument(fullUrl, fileName || 'document.pdf');
    } catch (error) {
      Alert.alert(
        t('common.error') || 'Error',
        t('common.download_failed') || 'Failed to download document',
      );
    }
  };

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
          {isLoading ? (
            <View style={styles.loadingContainer}>
              <ActivityIndicator size="large" color={themeColors.primary} />
            </View>
          ) : data ? (
            <>
              {/* Header */}
              <View style={[styles.modalHeader, { backgroundColor: themeColors.primary }]}>
                <View style={styles.headerContent}>
                  <Text style={[styles.modalTitle, { color: themeColors.text || colors.white }]} numberOfLines={2}>
                    {data.title}
                  </Text>
                  {data.badge ? (
                    <View style={styles.headerBadge}>
                      <Text style={styles.headerBadgeText}>{get_dropdown_options_data?.find((option: any) => String(option.value) === String(data.badge))?.label || data.badge}</Text>
                    </View>
                  ) : null}
                </View>
                <TouchableOpacity onPress={onClose} style={styles.closeButton}>
                  <Feather name="x" size={22} color={themeColors.text || colors.white} />
                </TouchableOpacity>
              </View>

              <ScrollView
                style={styles.scrollView}
                contentContainerStyle={styles.scrollContent}
                showsVerticalScrollIndicator={false}
                nestedScrollEnabled={true}
              >
            <RecordViewTabs record={data?.linkRecord} {...linkTabs} onNavigate={linkTabs?.onNavigate ?? onClose}>
                {/* Optional Image */}
                <View style={styles.imageContainer}>
                  <MixedMediaDisplayer attachmentIds={data.imageIds} />
                </View>

                {/* Subtitle */}
                {data.subtitle ? (
                  <Text style={styles.subtitle}>{data.subtitle}</Text>
                ) : null}

                {/* Detail Rows – two-column grid */}
                {data.rows.map((pair: DetailRowPair, index: number) => (
                  <View
                    key={`row-${index}`}
                    style={[
                      styles.detailsRow,
                      index < data.rows.length - 1 && styles.detailsRowBorder,
                    ]}
                  >
                    <View style={styles.detailColumn}>
                      <Text style={styles.detailLabel}>{pair.left.label}</Text>
                      {renderDetailValue(pair.left, `row-${index}-left`)}
                    </View>
                    {pair.right ? (
                      <View style={styles.detailColumn}>
                        <Text style={styles.detailLabel}>{pair.right.label}</Text>
                        {renderDetailValue(pair.right, `row-${index}-right`)}
                      </View>
                    ) : null}
                  </View>
                ))}

                {/* URL */}
                {data.url ? (
                  <View style={[styles.singleRow, styles.detailsRowBorder]}>
                    <Text style={styles.detailLabel}>{t('common.url') || 'URL'}</Text>
                    <TouchableOpacity onPress={() => handleOpenUrl(data.url!)}>
                      <Text style={[styles.linkValue, { color: themeColors.primary }]} numberOfLines={1}>
                        {data.url}
                      </Text>
                    </TouchableOpacity>
                  </View>
                ) : null}

                {/* Document Download */}
                {data.documentId ? (
                  <View style={[styles.singleRow, styles.detailsRowBorder]}>
                    <Text style={styles.detailLabel}>{t('common.document_label') || 'Document'}</Text>
                    {(Array.isArray(data.documentId) ? data.documentId : [data.documentId]).map(
                      (docId: string, docIdx: number) => (
                        <TouchableOpacity
                          key={`doc-${docIdx}`}
                          style={[styles.documentRow, docIdx > 0 && { marginTop: 6 }]}
                          onPress={() => handleDownloadDocument(docId, data.documentName || `document_${docIdx + 1}.pdf`)}
                        >
                          <Ionicons name="document-text-outline" size={20} color={themeColors.primary} />
                          <Text style={styles.documentText} numberOfLines={1}>
                            {Array.isArray(data.documentId) && data.documentId.length > 1
                              ? `${data.documentName?.replace(/\.[^.]+$/, '') || 'Document'}_${docIdx + 1}.pdf`
                              : data.documentName || t('common.view_document') || 'View Document'}
                          </Text>
                          <Ionicons name="download-outline" size={20} color={themeColors.primary} />
                        </TouchableOpacity>
                      ),
                    )}
                  </View>
                ) : null}

                {/* Additional Image Attachments */}
                {data.additionalAttachments && data.additionalAttachments.length > 0 ? (
                  <View style={[styles.sectionContainer]}>
                    <Text style={[styles.sectionTitle, { color: themeColors.primary }]}>
                      {t('legal.additional_attachments') || 'Additional Attachments'}
                    </Text>
                    <RemoteImage
                      imageIds={data.additionalAttachments}
                      style={styles.attachmentImage}
                      resizeMode="cover"
                    />
                  </View>
                ) : null}

                {/* Additional Sections */}
                {data.sections?.map((section: DetailSection, sIdx: number) => (
                  <View key={`section-${sIdx}`} style={styles.sectionContainer}>
                    <Text style={[styles.sectionTitle, { color: themeColors.primary }]}>
                      {section.title}
                    </Text>
                    {section.content ? (
                      <Text style={styles.sectionContent}>{section.content}</Text>
                    ) : null}
                    {section.rows?.map((row, rIdx) => (
                      <View key={`section-row-${rIdx}`} style={styles.sectionRow}>
                        <Text style={styles.sectionRowLabel}>{row.label}</Text>
                        <Text style={styles.sectionRowValue}>{row.value || (t('common.na') || 'N/A')}</Text>
                      </View>
                    ))}
                  </View>
                ))}
            </RecordViewTabs>
              </ScrollView>

              {/* View Credentials Button */}
              {onViewCredentials ? (
                <TouchableOpacity
                  style={[styles.credentialsButton, { borderColor: themeColors.primary }]}
                  onPress={onViewCredentials}
                >
                  <Text style={[styles.credentialsButtonText, { color: themeColors.primary }]}>
                    {t('business.add_license.view_credentials_title')}
                  </Text>
                </TouchableOpacity>
              ) : null}

              {/* Remove from Wallet Button */}
              {onRemoveFromWallet ? (
                <TouchableOpacity
                  style={[styles.removeWalletButton, { borderColor: '#E53935' }]}
                  onPress={onRemoveFromWallet}
                  disabled={removeFromWalletLoading}
                  activeOpacity={0.7}
                >
                  {removeFromWalletLoading ? (
                    <ActivityIndicator size="small" color="#E53935" />
                  ) : (
                    <Text style={styles.removeWalletButtonText}>
                      {t('wallet.remove_from_wallet') || 'Remove from Wallet'}
                    </Text>
                  )}
                </TouchableOpacity>
              ) : null}

              {/* Close Button */}
              <TouchableOpacity
                style={[styles.bottomCloseButton, { backgroundColor: themeColors.primary }]}
                onPress={onClose}
              >
                <Text style={[styles.bottomCloseButtonText, { color: themeColors.text || colors.white }]}>
                  {t('common.close') || 'Close'}
                </Text>
              </TouchableOpacity>
            </>
          ) : null}
        </View>
      </View>
    </Modal>
  );
};

export default ViewDetailModal;
