import React, { useState, useEffect, useRef, useMemo } from 'react';
import { enforceHttps } from '../../utils/httpsGuard';
import {
  Image,
  ActivityIndicator,
  View,
  ScrollView,
  StyleSheet,
  NativeSyntheticEvent,
  NativeScrollEvent,
  LayoutChangeEvent,
  Modal,
  TouchableOpacity,
  TouchableWithoutFeedback,
  StatusBar,
  Text,
  Alert,
  Linking,
  Platform,
} from 'react-native';
import { useDispatch } from 'react-redux';
import { getImageAsync, getBulkSignedUrlsAsync } from '../../redux/services/authService';
import { getOfflineImageUri } from '../../services/offline/OfflineQueueService';
import colors from '../../utils/colors';
import { SafeAreaView } from 'react-native-safe-area-context';
import Ionicons from 'react-native-vector-icons/Ionicons';
import FontAwesome6 from 'react-native-vector-icons/FontAwesome6';
import { useUserRole } from '../../hooks/useUserRole';
import ReactNativeBlobUtil from 'react-native-blob-util';
import { AppDispatch } from '../../types/store.types';
import { makeMixedMediaDisplayerStyles } from './MixedMediaDisplayer.styles';

interface Attachment {
  id: string;
  type: 'image' | 'document';
  fileName?: string;
  url?: string;
}

interface MediaAttachmentsProps {
  attachmentIds?: string[]; // Mixed array of image and document IDs
  style?: any;
  onImagePress?: (uri: string) => void;
  imageHeight?: number;
  showDocHeading?: boolean;
}

const MixedMediaDisplayer: React.FC<MediaAttachmentsProps> = ({
  attachmentIds = [],
  style,
  onImagePress,
  imageHeight = 180,
  showDocHeading = true,
}) => {
  const { themeColors } = useUserRole();
  const styles = useMemo(() => makeMixedMediaDisplayerStyles(themeColors), [themeColors]);
  const dispatch = useDispatch<AppDispatch>();
  const [attachments, setAttachments] = useState<Attachment[]>([]);
  const [loading, setLoading] = useState(true);
  const [previewUri, setPreviewUri] = useState<string | null>(null);
  const [downloading, setDownloading] = useState<string | null>(null);
  const [activeIndex, setActiveIndex] = useState(0);
  const [itemWidth, setItemWidth] = useState(0);

  useEffect(() => {
    if (attachmentIds.length > 0) {
      resolveAttachments();
    } else {
      setAttachments([]);
      setLoading(false);
    }
  }, [JSON.stringify(attachmentIds)]);

  const resolveAttachments = async () => {
    setLoading(true);
    try {
      const offlineIds: string[] = [];
      const serverIds: string[] = [];

      // Separate offline and server IDs
      attachmentIds.forEach(id => {
        if (id.startsWith('offline_')) {
          offlineIds.push(id);
        } else {
          serverIds.push(id);
        }
      });
      const byId = new Map<string, Attachment>();

      // Resolve offline attachments
      for (const id of offlineIds) {
        try {
          const entry = await getOfflineImageUri(id);
          byId.set(id, {
            id,
            type: getMediaTypeFromFileName(entry?.fileName || ''),
            fileName: entry?.fileName || 'Media',
            url: entry?.localUri,
          });
        } catch (error) {
          console.error('Error resolving offline attachment:', error);
        }
      }

      // Resolve server attachments
      if (serverIds.length > 0) {
        try {
          const response = await dispatch(getBulkSignedUrlsAsync({ ids: serverIds })).unwrap();
          const responseArray: any[] = Array.isArray(response) ? response : response?.data ?? response?.urls ?? [];

          responseArray.forEach((item: any, index: number) => {
            if (item?.id) {
              const fileName = item.filename || item.fileName || `file_${item.id}`;
              byId.set(String(item.id), {
                id: item.id,
                type: getMediaTypeFromFileName(fileName),
                fileName: fileName,
                url: item.signedurl || item.signedUrl || item.url || '',
              });
            } else if (typeof item === 'string') {
              const id = serverIds[index];
              if (id) {
                byId.set(id, { id, type: 'image', url: item });
              }
            }
          });
        } catch (error) {
          console.error('Error resolving server attachments:', error);
        }
      }

      const resolvedAttachments = attachmentIds
        .map(id => byId.get(id))
        .filter((a): a is Attachment => !!a);

      setAttachments(resolvedAttachments);
    } catch (error) {
      console.error('Error resolving attachments:', error);
    } finally {
      setLoading(false);
    }
  };

  const getMediaTypeFromFileName = (fileName: string): 'image' | 'document' => {
    const ext = (fileName?.split('.').pop() || '').toLowerCase();
    const imageExts = ['jpg', 'jpeg', 'png', 'gif', 'bmp', 'webp', 'heic', 'heif'];
    return imageExts.includes(ext) ? 'image' : 'document';
  };

  const getDocumentIcon = (fileName: string) => {
    const ext = (fileName?.split('.').pop() || '').toUpperCase();
    const iconMap: Record<string, { name: string; color: string }> = {
      PDF: { name: 'file-pdf', color: '#E74C3C' },
      DOC: { name: 'file-word', color: '#2B579A' },
      DOCX: { name: 'file-word', color: '#2B579A' },
      XLS: { name: 'file-excel', color: '#217346' },
      XLSX: { name: 'file-excel', color: '#217346' },
      PPT: { name: 'file-powerpoint', color: '#D24726' },
      PPTX: { name: 'file-powerpoint', color: '#D24726' },
      ZIP: { name: 'file-zipper', color: '#FFA500' },
      RAR: { name: 'file-zipper', color: '#FFA500' },
      '7Z': { name: 'file-zipper', color: '#FFA500' },
      TXT: { name: 'file-lines', color: colors.gray },
    };

    const defaultIcon = { name: 'file', color: colors.gray };
    return iconMap[ext] || defaultIcon;
  };

  const handleDownload = async (attachment: Attachment) => {
    if (!attachment.url) {
      Alert.alert('Error', 'No download URL available');
      return;
    }

    setDownloading(attachment.id);
    try {
      const fileName = attachment.fileName || `document_${attachment.id}`;
      const date = new Date();
      const timestamp = `${date.getFullYear()}-${date.getMonth() + 1}-${date.getDate()}_${date.getHours()}-${date.getMinutes()}-${date.getSeconds()}`;
      const displayName = `${fileName.split('.')[0]}_${timestamp}.${fileName.split('.').pop()}`;

      let downloadPath: string;

      if (Platform.OS === 'ios') {
        downloadPath = `${ReactNativeBlobUtil.fs.dirs.DocumentDir}/${displayName}`;
      } else {
        downloadPath = `${ReactNativeBlobUtil.fs.dirs.DownloadDir}/${displayName}`;
      }

      const { config, fs } = ReactNativeBlobUtil;
      const response = await config({
        path: downloadPath,
        addAndroidDownloads: {
          useDownloadManager: true,
          notification: true,
          title: displayName,
          description: 'Downloading document...',
          mime: 'application/octet-stream',
          mediaScannable: true,
        },
      }).fetch('GET', attachment.url);

      if (Platform.OS === 'android') {
        Alert.alert('Success', `Downloaded to Downloads folder`);
      } else {
        Alert.alert('Success', `File saved to Documents`);
      }
    } catch (error) {
      console.error('Download error:', error);
      Alert.alert('Error', 'Failed to download file');
    } finally {
      setDownloading(null);
    }
  };

  const handleOpenDocument = async (attachment: Attachment) => {
    if (!attachment.url) {
      Alert.alert('Error', 'No document URL available');
      return;
    }

    try {
      const supported = await Linking.canOpenURL(enforceHttps(attachment.url));
      if (supported) {
        await Linking.openURL(enforceHttps(attachment.url));
      } else {
        handleDownload(attachment);
      }
    } catch (error) {
      console.error('Error opening document:', error);
      handleDownload(attachment);
    }
  };

  const handleLayout = (e: LayoutChangeEvent) => {
    setItemWidth(e.nativeEvent.layout.width);
  };

  const handleScroll = (e: NativeSyntheticEvent<NativeScrollEvent>) => {
    if (!itemWidth) return;
    const idx = Math.round(e.nativeEvent.contentOffset.x / itemWidth);
    setActiveIndex(Math.max(0, Math.min(idx, images.length - 1)));
  };

  const images = attachments.filter(a => a.type === 'image');
  const documents = attachments.filter(a => a.type === 'document');

  const renderPreviewModal = () => (
    <Modal
      visible={!!previewUri}
      transparent={false}
      animationType="fade"
      onRequestClose={() => setPreviewUri(null)}
      statusBarTranslucent
    >
      <StatusBar barStyle="light-content" />
      <SafeAreaView style={styles.previewModal}>
        <TouchableWithoutFeedback onPress={() => setPreviewUri(null)}>
          <View style={StyleSheet.absoluteFill} />
        </TouchableWithoutFeedback>
        {previewUri && (
          <Image source={{ uri: previewUri }} style={styles.previewImage} resizeMode="contain" />
        )}
        <TouchableOpacity
          style={styles.previewCloseBtn}
          onPress={() => setPreviewUri(null)}
          activeOpacity={0.8}
          hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
        >
          <Ionicons name="close" size={28} color={colors.white} />
        </TouchableOpacity>
      </SafeAreaView>
    </Modal>
  );

  const renderImageSlider = () => {
    if (images.length === 0) return null;

    return (
      <View onLayout={handleLayout} style={[styles.sliderContainer, { height: imageHeight }]}>
        <ScrollView
          horizontal
          pagingEnabled
          showsHorizontalScrollIndicator={false}
          onScroll={handleScroll}
          scrollEventThrottle={16}
        >
          {images.map((image, index) => (
            <TouchableOpacity
              key={image.id}
              style={[{ width: itemWidth }, styles.scrollItem]}
              onPress={() => {
                if (onImagePress) {
                  onImagePress(image.url || '');
                } else {
                  setPreviewUri(image.url || null);
                }
              }}
              activeOpacity={0.9}
            >
              <Image
                source={{ uri: image.url }}
                style={[styles.image, { height: imageHeight, width: itemWidth }]}
                resizeMode="cover"
              />
            </TouchableOpacity>
          ))}
        </ScrollView>

        {/* Dot indicators */}
        {images.length > 1 && (
          <View style={styles.dotsRow}>
            {images.map((_, i) => (
              <View
                key={i}
                style={[
                  styles.dot,
                  i === activeIndex
                    ? { backgroundColor: themeColors.primary, width: 16 }
                    : { backgroundColor: 'rgba(255,255,255,0.5)' },
                ]}
              />
            ))}
          </View>
        )}
      </View>
    );
  };

  const renderDocumentsList = () => {
    if (documents.length === 0) return null;

    return (
      <View style={styles.documentsContainer}>
        {showDocHeading && (
          <Text style={styles.documentsTitle}>Documents</Text>
        )}
        {documents.map((doc) => {
          const { name: iconName, color: iconColor } = getDocumentIcon(doc.fileName || '');
          const displayName = doc.fileName?.split('/').pop() || `Document_${doc.id.slice(-8)}`;

          return (
            <View key={doc.id} style={styles.documentItem}>
              <View style={styles.documentIconContainer}>
                <FontAwesome6 name={iconName} size={32} color={iconColor} />
              </View>

              <View style={styles.documentInfo}>
                <Text style={styles.documentName} numberOfLines={2}>
                  {displayName}
                </Text>
                <Text style={styles.documentType}>
                  {doc.fileName?.split('.').pop()?.toUpperCase() || 'DOCUMENT'}
                </Text>
              </View>

              <TouchableOpacity
                style={styles.downloadButton}
                onPress={() => handleOpenDocument(doc)}
                activeOpacity={0.7}
                disabled={downloading === doc.id}
              >
                {downloading === doc.id ? (
                  <ActivityIndicator size="small" color={themeColors.primary} />
                ) : (
                  <>
                    <Ionicons name="download-outline" size={22} color={themeColors.primary} />
                    <Text style={[styles.downloadText, { color: themeColors.primary }]}>
                      Download
                    </Text>
                  </>
                )}
              </TouchableOpacity>
            </View>
          );
        })}
      </View>
    );
  };

  if (loading) {
    return (
      <View style={[styles.loadingContainer, style]}>
        <ActivityIndicator size="large" color={themeColors.primary} />
        <Text style={styles.loadingText}>Loading attachments...</Text>
      </View>
    );
  }

  if (attachments.length === 0) {
    return null;
  }

  return (
    <View style={[styles.container, style]}>
      {renderImageSlider()}
      {renderDocumentsList()}
      {renderPreviewModal()}
    </View>
  );
};

export default MixedMediaDisplayer;