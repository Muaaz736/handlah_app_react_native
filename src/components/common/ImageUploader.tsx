import React, { useState, useEffect, useRef, useMemo } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  TouchableWithoutFeedback,
  Image,
  StyleSheet,
  Alert,
  ActivityIndicator,
  Modal,
  Dimensions,
  StatusBar,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import ImageCropPicker from 'react-native-image-crop-picker';
import FontAwesome6 from 'react-native-vector-icons/FontAwesome6';
import Ionicons from 'react-native-vector-icons/Ionicons';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import NetInfo from '@react-native-community/netinfo';
import ReactNativeBlobUtil from 'react-native-blob-util';
import colors from '../../utils/colors';
import { useTranslation } from 'react-i18next';
import { useDispatch } from 'react-redux';
import { useUserRole } from '../../hooks/useUserRole';
import { ImageAsset, ImageUploaderProps } from '../../types/common.types';
import {
  imageUploadAsync,
  getImageAsync,
  getBulkSignedUrlsAsync,
} from '../../redux/services/authService';
import { BASEURL } from '../../config/apiHandle';
import { showInfoToast } from './CustomToast';
import { storeOfflineImageUri } from '../../services/offline/OfflineQueueService';
import { AppDispatch } from '../../redux/store';
import { makeImageUploaderStyles } from './ImageUploader.styles';
import { RoleTheme } from '../../types/roleManager.types';


interface ImageEntry {
  key: string;
  localUri: string;
  imageId: string;
  uploading: boolean;
  error: boolean;
}


const ImageUploader: React.FC<ImageUploaderProps> = ({
  imageUri,
  imageIds,
  onImageSelect,
  onImageUploaded,
  label,
  placeholder = 'Upload',
  uploadType = 'placeholder',
  containerStyle,
  labelStyle,
  imageStyle,
  imageQuality = 0.8,
  maxWidth = 800,
  maxHeight = 800,
  includeBase64 = false,
  iconType = 'fontawesome',
  iconName,
  iconSize = 24,
  iconColor = colors.black,
  disabled = false,
  showFileName = false,
  removable = false,
  onRemove,
  alertTitle,
  alertMessage,
  cameraButtonText,
  galleryButtonText,
  autoUpload = true,
  multiple = false,
  maxImages = 5,
  imageId,
  shape = 'default',
  circleSize = 112,
}) => {
  const { t } = useTranslation();
  const dispatch = useDispatch<AppDispatch>();
  const { themeColors } = useUserRole();
  const styles = useMemo(() => makeImageUploaderStyles(themeColors as RoleTheme), [themeColors]);
  iconColor = themeColors.textPrimary;

  const [localImageUri, setLocalImageUri] = useState(imageUri);
  const [isUploading, setIsUploading] = useState(false);
  const [isResolving, setIsResolving] = useState(false);
  const [previewVisible, setPreviewVisible] = useState(false);

  const [entries, setEntries] = useState<ImageEntry[]>([]);
  const [isBulkResolving, setIsBulkResolving] = useState(false);
  const [previewUri, setPreviewUri] = useState<string | null>(null);

  const skipInitCountRef = useRef(0);


  // Single-image: resolve signed URL when imageUri changes
  useEffect(() => {
    if (!multiple) {
      resolveImageUri(imageUri);
    }
  }, [imageUri, multiple]);

  // Single-image: an image that is already uploaded (by id) is looked up once and shown
  useEffect(() => {
    if (multiple || !imageId) return;
    let cancelled = false;
    (async () => {
      try {
        setIsResolving(true);
        const response = await dispatch(getImageAsync(imageId)).unwrap();
        const signedUrl = response?.signedurl || response?.signedUrl || response?.url;
        if (!cancelled && signedUrl) setLocalImageUri(signedUrl);
      } catch {
        // leave the empty state; the person can pick a new picture
      } finally {
        if (!cancelled) setIsResolving(false);
      }
    })();
    return () => { cancelled = true; };
  }, [imageId, multiple]);

  // Multiple-image: bulk-resolve when imageIds array changes (external only)
  useEffect(() => {
    if (!multiple) return;

    if (skipInitCountRef.current > 0) {
      skipInitCountRef.current -= 1;
      return;
    }

    initEntriesFromIds(imageIds ?? []);
  }, [multiple, JSON.stringify(imageIds)]);


  const resolveImageUri = async (uri: string | undefined) => {
    if (!uri) { setLocalImageUri(''); return; }

    if (uri.includes(`${BASEURL}image/`)) {
      const imageId = uri.replace(`${BASEURL}image/`, '').split('?')[0];
      if (imageId) {
        try {
          setIsResolving(true);
          const response = await dispatch(getImageAsync(imageId)).unwrap();
          const signedUrl = response?.signedurl || response?.signedUrl || response?.url;
          setLocalImageUri(signedUrl || uri);
        } catch {
          setLocalImageUri(uri);
        } finally {
          setIsResolving(false);
        }
        return;
      }
    }
    setLocalImageUri(uri);
  };

  const initEntriesFromIds = async (ids: string[]) => {
    if (!ids.length) { setEntries([]); return; }

    const offlineIds = ids.filter(id => id.startsWith('offline_'));
    const serverIds  = ids.filter(id => !id.startsWith('offline_'));

    const resolved: ImageEntry[] = [];

    for (const id of offlineIds) {
      const { getOfflineImageUri } = await import('../../services/offline/OfflineQueueService');
      const entry = await getOfflineImageUri(id);
      resolved.push({
        key: id,
        localUri: entry?.localUri ?? '',
        imageId: id,
        uploading: false,
        error: !entry?.localUri,
      });
    }

    if (serverIds.length) {
      try {
        setIsBulkResolving(true);
        const response = await dispatch(getBulkSignedUrlsAsync({ ids: serverIds })).unwrap();

        const urlMap: Record<string, string> = {};
        const responseArray: any[] = Array.isArray(response)
          ? response
          : response?.data ?? response?.urls ?? [];

        responseArray.forEach((item: any) => {
          if (typeof item === 'string') {
          } else if (item?.id) {
            urlMap[item.id] = item.signedurl || item.signedUrl || item.url || '';
          }
        });

        serverIds.forEach((id, index) => {
          const resolvedUrl =
            urlMap[id] ??
            (typeof responseArray[index] === 'string' ? responseArray[index] : '') ??
            '';
          resolved.push({
            key: id,
            localUri: resolvedUrl,
            imageId: id,
            uploading: false,
            error: !resolvedUrl,
          });
        });
      } catch {
        serverIds.forEach(id => {
          resolved.push({ key: id, localUri: '', imageId: id, uploading: false, error: true });
        });
      } finally {
        setIsBulkResolving(false);
      }
    }

    setEntries(resolved);
  };

  const notifyParent = (updatedEntries: ImageEntry[]) => {
    if (!onImageUploaded) return;
    const ids = updatedEntries
      .filter(e => e.imageId && !e.uploading && !e.error)
      .map(e => e.imageId);
    skipInitCountRef.current += 1;
    onImageUploaded(multiple ? ids : ids[0] ?? '');
  };


  const uploadImageToServer = async (imageData: ImageAsset, entryKey?: string) => {
    const networkState = await NetInfo.fetch();

    if (networkState.isConnected === false) {
      const offlineId = `offline_${Date.now()}`;
      const tempUri = imageData.uri || '';

      if (tempUri) {
        try {
          const originalName = imageData.fileName || `image_${Date.now()}.jpg`;
          const ext = originalName.split('.').pop() || 'jpg';
          const mimeType = imageData.type || 'image/jpeg';
          const permanentDir = `${ReactNativeBlobUtil.fs.dirs.DocumentDir}/offline_images`;
          const permanentPath = `${permanentDir}/${offlineId}.${ext}`;

          const dirExists = await ReactNativeBlobUtil.fs.isDir(permanentDir);
          if (!dirExists) await ReactNativeBlobUtil.fs.mkdir(permanentDir);

          const sourcePath = tempUri.replace('file://', '');
          await ReactNativeBlobUtil.fs.cp(sourcePath, permanentPath);
          const permanentUri = `file://${permanentPath}`;

          await storeOfflineImageUri(offlineId, permanentUri, mimeType, originalName);

          if (multiple && entryKey) {
            setEntries(prev => {
              const next = prev.map(e =>
                e.key === entryKey
                  ? { ...e, localUri: permanentUri, imageId: offlineId, uploading: false }
                  : e
              );
              notifyParent(next);
              return next;
            });
          } else {
            onImageUploaded && onImageUploaded({ id: offlineId, url: permanentUri } as any);
          }
        } catch (copyError) {
          console.warn('[ImageUploader] Failed to copy image for offline:', copyError);
          const mimeType = imageData.type || 'image/jpeg';
          const originalName = imageData.fileName || `image_${Date.now()}.jpg`;
          await storeOfflineImageUri(offlineId, tempUri, mimeType, originalName);

          if (multiple && entryKey) {
            setEntries(prev => {
              const next = prev.map(e =>
                e.key === entryKey
                  ? { ...e, localUri: tempUri, imageId: offlineId, uploading: false }
                  : e
              );
              notifyParent(next);
              return next;
            });
          } else {
            onImageUploaded && onImageUploaded({ id: offlineId, url: tempUri } as any);
          }
        }
      } else {
        if (multiple && entryKey) {
          setEntries(prev => {
            const next = prev.map(e =>
              e.key === entryKey ? { ...e, imageId: offlineId, uploading: false } : e
            );
            notifyParent(next);
            return next;
          });
        } else {
          onImageUploaded && onImageUploaded({ id: offlineId, url: '' } as any);
        }
      }

      showInfoToast('Image saved locally. It will be uploaded when internet is available.', 'Offline');
      return;
    }

    if (!multiple) setIsUploading(true);

    try {
      const formData = new FormData();
      formData.append('file', {
        uri: imageData.uri,
        type: imageData.type || 'image/jpeg',
        name: imageData.fileName || 'image.jpg',
      });

      const result = await dispatch(imageUploadAsync(formData as any)).unwrap();

      if (result?.id) {
        if (multiple && entryKey) {
          setEntries(prev => {
            const next = prev.map(e =>
              e.key === entryKey ? { ...e, imageId: result.id, uploading: false } : e
            );
            notifyParent(next);
            return next;
          });
        } else {
          onImageUploaded && onImageUploaded(result);
        }
      }
    } catch {
      if (multiple && entryKey) {
        setEntries(prev => {
          const next = prev.filter(e => e.key !== entryKey);
          notifyParent(next);
          return next;
        });
      } else {
        setLocalImageUri('');
      }
    } finally {
      if (!multiple) setIsUploading(false);
    }
  };


  const handlePickedImage = (selectedImage: ImageAsset) => {
    if (multiple) {
      if (entries.length >= maxImages) {
        Alert.alert(
          t('common.limit_reached') || 'Limit Reached',
          t('common.max_images_reached', { max: maxImages }) || `You can upload a maximum of ${maxImages} images.`,
        );
        return;
      }

      const key = `local_${Date.now()}`;
      const newEntry: ImageEntry = {
        key,
        localUri: selectedImage.uri ?? '',
        imageId: '',
        uploading: true,
        error: false,
      };

      setEntries(prev => [...prev, newEntry]);
      onImageSelect && onImageSelect(selectedImage);

      if (autoUpload) uploadImageToServer(selectedImage, key);
    } else {
      setLocalImageUri(selectedImage.uri);
      onImageSelect && onImageSelect(selectedImage);
      if (autoUpload) uploadImageToServer(selectedImage);
    }
  };

  const handleCameraLaunch = () => {
    ImageCropPicker.openCamera({
      cropping: true,
      width: maxWidth,
      height: maxHeight,
      cropperToolbarTitle: 'Crop Image',
      compressImageQuality: imageQuality,
    }).then(image => {
      handlePickedImage({
        uri: image.path,
        type: image.mime,
        fileName: image.path.split('/').pop() || 'image.jpg',
        fileSize: image.size,
        width: image.width,
        height: image.height,
      } as ImageAsset);
    }).catch(err => {
      if (err.code !== 'E_PICKER_CANCELLED') {
        Alert.alert(t('common.error'), t('common.camera_error'));
      }
    });
  };

  const handleGalleryLaunch = () => {
    ImageCropPicker.openPicker({
      cropping: true,
      width: maxWidth,
      height: maxHeight,
      cropperToolbarTitle: 'Crop Image',
      compressImageQuality: imageQuality,
    }).then(image => {
      handlePickedImage({
        uri: image.path,
        type: image.mime,
        fileName: image.path.split('/').pop() || 'image.jpg',
        fileSize: image.size,
        width: image.width,
        height: image.height,
      } as ImageAsset);
    }).catch(err => {
      if (err.code !== 'E_PICKER_CANCELLED') {
        Alert.alert(t('common.error'), t('common.gallery_error'));
      }
    });
  };

  const handleUploadPress = () => {
    if (disabled || isUploading) return;
    Alert.alert(
      alertTitle || t('common.upload_photo') || 'Upload Photo',
      alertMessage || t('common.choose_option') || 'Choose an option to upload your photo',
      [
        { text: cameraButtonText  || t('common.camera')  || 'Camera',  onPress: handleCameraLaunch },
        { text: galleryButtonText || t('common.gallery') || 'Gallery', onPress: handleGalleryLaunch },
        { text: t('common.cancel') || 'Cancel', style: 'cancel' },
      ],
      { cancelable: true },
    );
  };


  const handleRemovePress = () => {
    Alert.alert(
      t('common.remove_image') || 'Remove Image',
      t('common.remove_image_confirm') || 'Are you sure you want to remove this image?',
      [
        { text: t('common.cancel') || 'Cancel', style: 'cancel' },
        {
          text: t('common.remove') || 'Remove',
          style: 'destructive',
          onPress: () => { setLocalImageUri(''); onRemove && onRemove(); },
        },
      ],
    );
  };

  const handleRemoveEntry = (keyToRemove: string) => {
    Alert.alert(
      t('common.remove_image') || 'Remove Image',
      t('common.remove_image_confirm') || 'Are you sure you want to remove this image?',
      [
        { text: t('common.cancel') || 'Cancel', style: 'cancel' },
        {
          text: t('common.remove') || 'Remove',
          style: 'destructive',
          onPress: () => {
            setEntries(prev => {
              const next = prev.filter(e => e.key !== keyToRemove);
              notifyParent(next);
              return next;
            });
            onRemove && onRemove();
          },
        },
      ],
    );
  };


  const renderIcon = () => {
    const defaultIconName =
      iconName || (iconType === 'ionicons' ? 'cloud-upload-outline' : 'arrow-up-from-bracket');

    if (iconType === 'ionicons') return <Ionicons name={defaultIconName} size={iconSize} color={iconColor} />;
    if (iconType === 'material') return <MaterialIcons name={defaultIconName || 'file-upload'} size={iconSize} color={iconColor} />;
    return <FontAwesome6 name={defaultIconName} size={iconSize} color={iconColor} />;
  };

  const renderPreviewModal = (
    visible: boolean,
    uri: string | null,
    onClose: () => void,
  ) => (
    <Modal
      visible={visible}
      transparent={false}
      animationType="fade"
      onRequestClose={onClose}
      statusBarTranslucent
    >
      <StatusBar barStyle="light-content" />
      <SafeAreaView style={styles.previewModal}>
        {/* Background tap-to-close — sits behind everything */}
        <TouchableWithoutFeedback onPress={onClose}>
          <View style={StyleSheet.absoluteFill} />
        </TouchableWithoutFeedback>

        {/* Image — pointerEvents none so taps fall through to background layer */}
        {uri && (
          <Image
            source={{ uri }}
            style={styles.previewImage}
            resizeMode="contain"
          />
        )}

        {/* Close button — rendered last so it sits on top of everything */}
        <TouchableOpacity
          style={styles.previewCloseBtn}
          onPress={onClose}
          activeOpacity={0.8}
          hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
        >
          <Ionicons name="close" size={28} color={colors.white} />
        </TouchableOpacity>
      </SafeAreaView>
    </Modal>
  );


  const renderMultipleContent = () => {
    const canAddMore = entries.length < maxImages;
    const screenWidth = Dimensions.get('window').width;
    const itemSize = Math.floor((screenWidth - 40 - 8) / 2);

    return (
      <>
        {entries.length > 0 && (
          <View style={styles.thumbnailGrid}>
            {entries.map(entry => (
              <View key={entry.key} style={[styles.thumbnailWrapper, { width: itemSize, height: itemSize }]}>
                {entry.uploading ? (
                  <View style={[styles.thumbnailPlaceholder, { width: itemSize, height: itemSize, backgroundColor: colors.lightGray }]}>
                    <ActivityIndicator size="small" color={themeColors.primary} />
                  </View>
                ) : entry.error || !entry.localUri ? (
                  <View style={[styles.thumbnailPlaceholder, { width: itemSize, height: itemSize, backgroundColor: colors.lightGray }]}>
                    <Ionicons name="image-outline" size={24} color={colors.gray} />
                  </View>
                ) : (
                  <TouchableOpacity
                    activeOpacity={0.85}
                    onPress={() => setPreviewUri(entry.localUri)}
                  >
                    <Image
                      source={{ uri: entry.localUri }}
                      style={[styles.thumbnail, { width: itemSize, height: itemSize }, imageStyle]}
                    />
                  </TouchableOpacity>
                )}

                {removable && (
                  <TouchableOpacity
                    style={styles.thumbnailRemoveBtn}
                    onPress={() => handleRemoveEntry(entry.key)}
                    activeOpacity={0.7}
                  >
                    <Ionicons name="close-circle" size={22} color={colors.error} />
                  </TouchableOpacity>
                )}
              </View>
            ))}
          </View>
        )}

        {canAddMore && (
          <TouchableOpacity
            style={[
              styles.uploadPlaceholder,
              styles.multiAddButton,
              disabled && styles.disabled,
            ]}
            onPress={handleUploadPress}
            activeOpacity={0.7}
            disabled={disabled}
          >
            <View style={styles.uploadPlaceholderContent}>
              {renderIcon()}
              <Text style={styles.uploadText}>
                {placeholder}
                {maxImages > 1 && (
                  <Text style={styles.uploadCountHint}>
                    {` (${entries.length}/${maxImages})`}
                  </Text>
                )}
              </Text>
            </View>
          </TouchableOpacity>
        )}

        {renderPreviewModal(!!previewUri, previewUri, () => setPreviewUri(null))}
      </>
    );
  };


  const renderCircleContent = () => {
    const circle = { width: circleSize, height: circleSize, borderRadius: circleSize / 2 };
    if (isUploading || isResolving) {
      return (
        <View style={[circle, { alignItems: 'center', justifyContent: 'center', backgroundColor: themeColors.surface, alignSelf: 'center' }]}>
          <ActivityIndicator size="small" color={themeColors.primary} />
        </View>
      );
    }

    if (localImageUri) {
      return (
        <View style={{ alignSelf: 'center' }}>
          <TouchableOpacity activeOpacity={0.9} onPress={() => setPreviewVisible(true)}>
            <Image source={{ uri: localImageUri }} style={[circle, { backgroundColor: themeColors.surface }]} />
          </TouchableOpacity>
          {/* Change and remove sit on the circle, so the picture itself stays round and the same size */}
          <TouchableOpacity
            style={{ position: 'absolute', right: 0, bottom: 0, width: 34, height: 34, borderRadius: 17, backgroundColor: themeColors.primary, alignItems: 'center', justifyContent: 'center' }}
            onPress={handleUploadPress}
            activeOpacity={0.8}
          >
            <Ionicons name="camera" size={18} color={colors.white} />
          </TouchableOpacity>
          {removable && (
            <TouchableOpacity
              style={{ position: 'absolute', left: 0, bottom: 0, width: 34, height: 34, borderRadius: 17, backgroundColor: themeColors.surface, borderWidth: 1, borderColor: themeColors.border, alignItems: 'center', justifyContent: 'center' }}
              onPress={handleRemovePress}
              activeOpacity={0.8}
            >
              <Ionicons name="trash-outline" size={18} color={colors.error} />
            </TouchableOpacity>
          )}
          {renderPreviewModal(previewVisible, localImageUri, () => setPreviewVisible(false))}
        </View>
      );
    }

    return (
      <TouchableOpacity
        style={[circle, { alignSelf: 'center', alignItems: 'center', justifyContent: 'center', borderWidth: 2, borderStyle: 'dashed', borderColor: themeColors.secondary, backgroundColor: themeColors.surface }, disabled && styles.disabled]}
        onPress={handleUploadPress}
        activeOpacity={0.7}
        disabled={disabled}
      >
        {renderIcon()}
        <Text style={[styles.uploadTextBox, { marginTop: 4 }]}>{placeholder}</Text>
      </TouchableOpacity>
    );
  };

  const renderSingleContent = () => {
    if (shape === 'circle') return renderCircleContent();

    if (isUploading || isResolving) {
      return (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={themeColors.primary} />
          <Text style={styles.loadingText}>
            {isResolving ? t('common.loading') || 'Loading...' : t('common.uploading') || 'Uploading...'}
          </Text>
        </View>
      );
    }

    if (localImageUri) {
      return (
        <View style={styles.imageContainer}>
          <TouchableOpacity activeOpacity={0.9} onPress={() => setPreviewVisible(true)}>
            <Image
              source={{ uri: localImageUri }}
              style={[uploadType === 'box' ? styles.uploadedImageBox : styles.uploadedImage, imageStyle]}
            />
            <View style={styles.previewBadge}>
              <Ionicons name="expand-outline" size={14} color={colors.white} />
              <Text style={styles.previewBadgeText}>{t('common.tap_to_preview') || 'Tap to preview'}</Text>
            </View>
          </TouchableOpacity>

          {removable && (
            <TouchableOpacity style={styles.removeButton} onPress={handleRemovePress} activeOpacity={0.7}>
              <Ionicons name="close-circle" size={28} color={colors.error} />
            </TouchableOpacity>
          )}

          {showFileName && localImageUri && (
            <Text style={styles.fileName} numberOfLines={1}>{localImageUri.split('/').pop()}</Text>
          )}

          {renderPreviewModal(previewVisible, localImageUri, () => setPreviewVisible(false))}
        </View>
      );
    }

    if (uploadType === 'box') {
      return (
        <TouchableOpacity
          style={[styles.uploadBox, { borderColor: themeColors.secondary }, disabled && styles.disabled]}
          onPress={handleUploadPress}
          activeOpacity={0.7}
          disabled={disabled}
        >
          {renderIcon()}
          <Text style={styles.uploadTextBox}>{placeholder}</Text>
        </TouchableOpacity>
      );
    }

    if (uploadType === 'button') {
      return (
        <TouchableOpacity
          style={[styles.uploadButton, disabled && styles.disabled]}
          onPress={handleUploadPress}
          activeOpacity={0.7}
          disabled={disabled}
        >
          {renderIcon()}
          <Text style={styles.uploadButtonText}>{placeholder}</Text>
        </TouchableOpacity>
      );
    }

    return (
      <TouchableOpacity
        style={[styles.uploadPlaceholder, disabled && styles.disabled]}
        onPress={handleUploadPress}
        activeOpacity={0.7}
        disabled={disabled}
      >
        <View style={styles.uploadPlaceholderContent}>
          {renderIcon()}
          <Text style={styles.uploadText}>{placeholder}</Text>
        </View>
      </TouchableOpacity>
    );
  };


  return (
    <View style={[styles.container, containerStyle]}>
      {label && <Text style={[styles.label, labelStyle]}>{label}</Text>}

      {multiple ? (
        isBulkResolving ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color={themeColors.primary} />
            <Text style={styles.loadingText}>{t('common.loading') || 'Loading...'}</Text>
          </View>
        ) : (
          renderMultipleContent()
        )
      ) : (
        renderSingleContent()
      )}
    </View>
  );
};


export default ImageUploader;