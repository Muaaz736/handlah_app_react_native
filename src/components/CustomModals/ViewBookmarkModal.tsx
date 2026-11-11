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
  Alert,
} from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import colors from '../../utils/colors';
import { downloadAndOpenDocument, getDocumentUrl } from '../../utils/helpers';
import { useTranslation } from 'react-i18next';
import { useUserRole } from '../../hooks/useUserRole';
import {
  ViewBookmarkModalProps,
  BookmarkType,
} from '../../types/ViewBookmarkModal.types';
import { makeViewBookmarkModalStyles } from './ViewBookmarkModal.styles';
import { MixedMediaDisplayer } from '../common';
import { RoleTheme } from '../../types/roleManager.types';
import { RecordViewTabs, type RecordLinkTabsProp } from '../recordLinks/RecordViewTabs';

const ViewBookmarkModal: React.FC<ViewBookmarkModalProps & RecordLinkTabsProp> = ({ linkTabs, visible, onClose, bookmark }) => {
  const { t } = useTranslation();
  const { themeColors } = useUserRole();
  const styles = useMemo(() => makeViewBookmarkModalStyles(themeColors as RoleTheme), [themeColors]);
  const [isPasswordVisible, setIsPasswordVisible] = useState(false);
  useEffect(() => {
    if (!visible) setIsPasswordVisible(false);
  }, [visible]);

  if (!bookmark) return null;

  const getTypeLabel = (type: BookmarkType): string => {
    switch (type) {
      case 0:
        return t('bookmarks.types.document');
      case 1:
        return t('bookmarks.types.notes');
      case 2:
        return t('bookmarks.types.url');
      case 3:
        return t('bookmarks.types.other');
      case 'Document':
        return t('bookmarks.types.document');
      case 'Notes':
        return t('bookmarks.types.notes');
      case 'Link':
      case 'URL':
        return t('bookmarks.types.url');
      case 'Other':
        return t('bookmarks.types.other');
      default:
        return type as string;
    }
  };

  const handleOpenLink = (): void => {
    if (!bookmark?.urllink) return;

    // Ensure URL has proper protocol
    let formattedUrl = bookmark.urllink.trim();
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
      .catch((err: Error) => {
        console.error('Error opening URL:', err);
        Alert.alert(t('common.error') || 'Error', t('common.invalid_url'));
      });
  };


  const handleDownloadDocument = async (documentId: string) => {
    onClose(); // Close modal immediately on document click
    if (!documentId) {
      Alert.alert(t('common.error') || 'Error', t('bookmarks.no_document') || 'No document available');
      return;
    }

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

  return (
    <Modal
      visible={visible && bookmark !== null}
      transparent={true}
      animationType="fade"
      onRequestClose={onClose}
    >
      <TouchableWithoutFeedback onPress={onClose}>
        <View style={styles.overlay}>
          <TouchableWithoutFeedback>
            <View style={styles.modalContainer}>
              {/* Header */}
              <View style={styles.header}>
                <View style={[styles.typeTag, { backgroundColor: themeColors.primary }]}>
                  <Text style={styles.typeTagText}>{getTypeLabel(bookmark.type)}</Text>
                </View>
                <TouchableOpacity onPress={onClose} style={styles.closeIcon}>
                  <Ionicons name="close" size={24} color={colors.gray} />
                </TouchableOpacity>
              </View>

              {/* Title */}
              <Text style={styles.title}>{bookmark.sitename || bookmark.title || t('bookmarks.bookmark_details')}</Text>

              {/* Content */}
              <ScrollView style={styles.contentScroll} showsVerticalScrollIndicator={false}>
            <RecordViewTabs {...linkTabs} onNavigate={linkTabs?.onNavigate ?? onClose}>
                <View style={styles.infoContainer}>
                  {/* Username and Password - Show for all types */}
                  {bookmark.username && (
                    <View style={styles.infoSection}>
                      <Text style={styles.label}>{t('bookmarks.username') || 'Username'}:</Text>
                      <Text style={styles.value}>{bookmark.username}</Text>
                    </View>
                  )}

                  {bookmark.password && (
                    <View style={styles.infoSection}>
                      <Text style={styles.label}>{t('bookmarks.password') || 'Password'}:</Text>
                      <View style={styles.secretValueRow}>
                        <Text style={[styles.value, styles.secretValue]} numberOfLines={1}>
                          {isPasswordVisible ? bookmark.password : '•'.repeat(Math.min(bookmark.password.length, 12))}
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
                    </View>
                  )}

                  {/* URL Type */}
                  {(bookmark.type === 2 || bookmark.type === 'Link' || bookmark.type === 'URL') && bookmark.urllink && (
                    <View style={styles.infoSection}>
                      <Text style={styles.label}>{t('bookmarks.url')}:</Text>
                      <TouchableOpacity onPress={handleOpenLink}>
                        <Text style={[styles.linkValue, { color: themeColors.primary }]}>
                          {bookmark.urllink}
                        </Text>
                      </TouchableOpacity>
                    </View>
                  )}

                  {/* Document Type */}
                  {(bookmark.type === 0 || bookmark.type === 'Document') && bookmark.documentid?.length > 0 && (
                    <MixedMediaDisplayer attachmentIds={bookmark.documentid as string[]} showDocHeading={false} />
                  )}
                </View>
            </RecordViewTabs>
              </ScrollView>

              {/* Close Button */}
              <TouchableOpacity
                style={[styles.closeButton, { backgroundColor: themeColors.primary }]}
                onPress={onClose}
              >
                <Text style={[styles.closeButtonText, { color: themeColors.text }]}>
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

export default ViewBookmarkModal;
