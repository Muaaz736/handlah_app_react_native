import React, { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import {
    Alert,
    Dimensions,
    Image,
    Modal,
    Platform,
    PermissionsAndroid,
    ScrollView,
    StatusBar,
    StyleSheet,
    Text,
    TouchableOpacity,
    TouchableWithoutFeedback,
    View,
    ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import ImageCropPicker from 'react-native-image-crop-picker';
import { pick, types, DocumentPickerResponse, errorCodes, isErrorWithCode } from '@react-native-documents/picker';
import Ionicons from 'react-native-vector-icons/Ionicons';
import FontAwesome6 from 'react-native-vector-icons/FontAwesome6';
import NetInfo from '@react-native-community/netinfo';
import ReactNativeBlobUtil from 'react-native-blob-util';
import { useDispatch, useSelector } from 'react-redux';
import { useTranslation } from 'react-i18next';
import colors from '../../utils/colors';
import {
    imageUploadAsync,
    getBulkSignedUrlsAsync,
} from '../../redux/services/authService';
import { showInfoToast } from './CustomToast';
import { storeOfflineImageUri, getOfflineImageUri } from '../../services/offline/OfflineQueueService';
import { useUserRole } from '../../hooks/useUserRole';
import { ImageAsset } from '../../types/common.types';
import { AppDispatch } from '../../types/store.types';
import { makeMixedMediaUploaderStyles } from './MixedMediaUploader.styles';
import { requestCameraPermission, requestGalleryPermission } from '../../services/permissions/permissionService';
import { RoleTheme } from '../../types/roleManager.types';

type MediaType = 'image' | 'document';

interface MediaEntry {
    key: string;
    mediaId: string;
    localUri: string;
    fileName: string;
    fileType: MediaType;
    uploading: boolean;
    error: boolean;
}

interface MixedMediaUploaderProps {
    mediaIds?: string[];
    onMediaChange?: (ids: string[]) => void;
    label?: string;
    placeholder?: string;
    uploadType?: 'box' | 'placeholder' | 'button';
    containerStyle?: any;
    labelStyle?: any;
    disabled?: boolean;
    removable?: boolean;
    autoUpload?: boolean;
    maxItems?: number;
    onMediaSelect?: (media: ImageAsset | DocumentPickerResponse) => void;
}

const MixedMediaUploader: React.FC<MixedMediaUploaderProps> = ({
    mediaIds = [],
    onMediaChange,
    label,
    placeholder = 'Upload',
    uploadType = 'placeholder',
    containerStyle,
    labelStyle,
    disabled = false,
    removable = true,
    autoUpload = true,
    maxItems = 5,
    onMediaSelect,
}) => {
    const { t } = useTranslation();
    const dispatch = useDispatch<AppDispatch>();
    const { themeColors } = useUserRole();
    const styles = useMemo(() => makeMixedMediaUploaderStyles(themeColors as RoleTheme), [themeColors]);

    const { image_upload_status } = useSelector((state: any) => state.user_auth);

    const [entries, setEntries] = useState<MediaEntry[]>([]);
    const [isBulkResolving, setIsBulkResolving] = useState(false);
    const [uploadModalVisible, setUploadModalVisible] = useState(false);
    const [previewVisible, setPreviewVisible] = useState(false);
    const [previewUri, setPreviewUri] = useState<string | null>(null);
    const modalClosingRef = useRef(false);
    const pendingNotifyRef = useRef<MediaEntry[] | null>(null);

    // Flush queued notifyParent after entries state settles (avoids setState-during-render)
    useEffect(() => {
        if (pendingNotifyRef.current !== null) {
            const next = pendingNotifyRef.current;
            pendingNotifyRef.current = null;
            skipInitCountRef.current += 1;
            const ids = next
                .filter(e => e.mediaId && !e.uploading && !e.error)
                .map(e => e.mediaId);
            onMediaChange?.(ids);
        }
    }, [entries]);

    // Pending action fired after modal fully dismisses
    const [pendingAction, setPendingAction] = useState<'camera' | 'gallery' | 'document' | null>(null);
    const skipInitCountRef = useRef(0);

    // Initialize entries from parent mediaIds
    useEffect(() => {
        if (skipInitCountRef.current > 0) {
            skipInitCountRef.current -= 1;
            return;
        }
        initEntriesFromIds(mediaIds);
    }, [JSON.stringify(mediaIds)]);

    const scheduleAfterModalClose = (action: 'camera' | 'gallery' | 'document') => {
        modalClosingRef.current = true;
        setUploadModalVisible(false);

        // Use a longer delay and ensure modal is completely gone
        setTimeout(() => {
            modalClosingRef.current = false;
            setPendingAction(action);
        }, 500);
    };

    useEffect(() => {
        if (uploadModalVisible || !pendingAction || modalClosingRef.current) return;

        const action = pendingAction;
        setPendingAction(null);

        setTimeout(() => {
            if (action === 'camera') {
                handleCameraCapture();
            } else if (action === 'gallery') {
                handleGalleryPick();
            } else if (action === 'document') {
                handleDocumentPick();
            }
        }, 200);
    }, [uploadModalVisible, pendingAction]);

    const initEntriesFromIds = async (ids: string[]) => {
        if (!ids.length) { setEntries([]); return; }

        const offlineIds = ids.filter(id => id.startsWith('offline_'));
        const serverIds = ids.filter(id => !id.startsWith('offline_'));
        const resolved: MediaEntry[] = [];

        for (const id of offlineIds) {
            try {
                const entry = await getOfflineImageUri(id);
                resolved.push({
                    key: id, mediaId: id,
                    localUri: entry?.localUri ?? '',
                    fileName: entry?.fileName ?? 'Media',
                    fileType: getMediaTypeFromFileName(entry?.fileName || ''),
                    uploading: false, error: !entry?.localUri,
                });
            } catch {
                resolved.push({ key: id, mediaId: id, localUri: '', fileName: 'Media', fileType: 'image', uploading: false, error: true });
            }
        }

        if (serverIds.length) {
            try {
                setIsBulkResolving(true);
                const response = await dispatch(getBulkSignedUrlsAsync({ ids: serverIds })).unwrap();
                const urlMap: Record<string, { url: string; fileName: string }> = {};
                const responseArray: any[] = Array.isArray(response) ? response : response?.data ?? response?.urls ?? [];

                responseArray.forEach((item: any) => {
                    if (item?.id) {
                        urlMap[item.id] = {
                            url: item.signedurl || item.signedUrl || item.url || '',
                            fileName: item.filename || item.fileName || 'Media',
                        };
                    }
                });

                serverIds.forEach((id, index) => {
                    const resolvedData = urlMap[id] ?? {
                        url: typeof responseArray[index] === 'string' ? responseArray[index] : '',
                        fileName: 'Media',
                    };
                    resolved.push({
                        key: id, mediaId: id,
                        localUri: resolvedData.url,
                        fileName: resolvedData.fileName,
                        fileType: getMediaTypeFromFileName(resolvedData.fileName),
                        uploading: false, error: !resolvedData.url,
                    });
                });
            } catch {
                serverIds.forEach(id => {
                    resolved.push({ key: id, mediaId: id, localUri: '', fileName: 'Media', fileType: 'image', uploading: false, error: true });
                });
            } finally {
                setIsBulkResolving(false);
            }
        }

        setEntries(resolved);
    };

    const notifyParent = (nextEntries: MediaEntry[]) => {
        pendingNotifyRef.current = nextEntries;
    };

    const getMediaTypeFromFileName = (fileName: string): MediaType => {
        const ext = (fileName?.split('.').pop() || '').toLowerCase();
        return ['jpg', 'jpeg', 'png', 'gif', 'bmp', 'webp'].includes(ext) ? 'image' : 'document';
    };

    // extract name from URI as last resort
    const resolveFileName = (media: any): string => {
        const fromField = media.fileName || media.name;
        if (fromField && fromField.trim().length > 0) return fromField.trim();

        // URI fallback — decode percent-encoding so "%20" becomes spaces etc.
        const rawSegment = media.uri?.split('/').pop()?.split('?')[0];
        if (rawSegment) {
            try { return decodeURIComponent(rawSegment); } catch { return rawSegment; }
        }

        return `media_${Date.now()}`;
    };

    const getDocumentIcon = (fileName: string) => {
        const ext = (fileName?.split('.').pop() || '').toUpperCase();
        let name = 'file';
        let color: string = colors.gray;
        if (ext === 'PDF') { name = 'file-pdf'; color = '#E74C3C'; }
        else if (['DOC', 'DOCX'].includes(ext)) { name = 'file-word'; color = '#2B579A'; }
        else if (['XLS', 'XLSX'].includes(ext)) { name = 'file-excel'; color = '#217346'; }
        else if (['PPT', 'PPTX'].includes(ext)) { name = 'file-powerpoint'; color = '#D24726'; }
        else if (['ZIP', 'RAR', '7Z'].includes(ext)) { name = 'file-zipper'; color = '#FFA500'; }
        else if (ext === 'TXT') { name = 'file-lines'; }
        return { name, color };
    };

    // Upload Logic
    const uploadMediaToServer = async (
        mediaData: ImageAsset | DocumentPickerResponse | { uri: string; type: string; name: string },
        entryKey: string,
    ) => {
        const networkState = await NetInfo.fetch();

        if (networkState.isConnected === false) {
            const offlineId = `offline_${Date.now()}`;
            const tempUri = (mediaData as any).uri || '';

            if (tempUri) {
                try {
                    const originalName = resolveFileName(mediaData);
                    const ext = originalName.split('.').pop() || 'jpg';
                    const mimeType = (mediaData as any).type || 'application/octet-stream';
                    const permanentDir = `${ReactNativeBlobUtil.fs.dirs.DocumentDir}/offline_media`;
                    const permanentPath = `${permanentDir}/${offlineId}.${ext}`;

                    const dirExists = await ReactNativeBlobUtil.fs.isDir(permanentDir);
                    if (!dirExists) await ReactNativeBlobUtil.fs.mkdir(permanentDir);

                    const sourcePath = tempUri.replace('file://', '');
                    await ReactNativeBlobUtil.fs.cp(sourcePath, permanentPath);
                    const permanentUri = `file://${permanentPath}`;

                    await storeOfflineImageUri(offlineId, permanentUri, mimeType, originalName);
                    setEntries(prev => {
                        const next = prev.map(e =>
                            e.key === entryKey ? { ...e, mediaId: offlineId, uploading: false, localUri: permanentUri } : e,
                        );
                        notifyParent(next);
                        return next;
                    });
                } catch {
                    const mimeType = (mediaData as any).type || 'application/octet-stream';
                    const originalName = resolveFileName(mediaData);
                    await storeOfflineImageUri(offlineId, tempUri, mimeType, originalName);
                    setEntries(prev => {
                        const next = prev.map(e =>
                            e.key === entryKey ? { ...e, mediaId: offlineId, uploading: false } : e,
                        );
                        notifyParent(next);
                        return next;
                    });
                }
            } else {
                setEntries(prev => { const next = prev.filter(e => e.key !== entryKey); notifyParent(next); return next; });
            }

            showInfoToast('Media saved locally. It will be uploaded when internet is available.', 'Offline');
            return;
        }

        try {
            const formData = new FormData();
            const fileName = resolveFileName(mediaData);
            const mimeType = (mediaData as any).type || 'application/octet-stream';
            formData.append('file', { uri: (mediaData as any).uri, type: mimeType, name: fileName } as any);

            const result = await dispatch(imageUploadAsync(formData as any)).unwrap();

            if (result?.id) {
                setEntries(prev => {
                    const next = prev.map(e =>
                        e.key === entryKey
                            ? { ...e, mediaId: result.id, fileName: result.filename || fileName, uploading: false, fileType: getMediaTypeFromFileName(result.filename || fileName) }
                            : e,
                    );
                    notifyParent(next);
                    return next;
                });
            }
        } catch {
            setEntries(prev => { const next = prev.filter(e => e.key !== entryKey); notifyParent(next); return next; });
        }
    };

    // File Picker Handlers
    const handleCameraCapture = async () => {
        const granted = await requestCameraPermission();
        if (!granted) return;

        try {
            const image = await ImageCropPicker.openCamera({
                cropping: true, width: 800, height: 800,
                cropperToolbarTitle: 'Crop Image', compressImageQuality: 0.8,
                includeBase64: false,
            });
            handleMediaSelected({
                uri: image.path, type: image.mime,
                fileName: image.path.split('/').pop() || 'image.jpg',
                fileSize: image.size, width: image.width, height: image.height,
            } as ImageAsset);
        } catch (err: any) {
            if (err.code && err.code !== 'E_PICKER_CANCELLED') {
                Alert.alert(t('common.error') || 'Error', t('common.camera_error') || 'Failed to capture photo');
            }
        }
    };

    const handleGalleryPick = async () => {
        const granted = await requestGalleryPermission();
        if (!granted) return;
        try {
            const image = await ImageCropPicker.openPicker({
                cropping: true, width: 800, height: 800,
                cropperToolbarTitle: 'Crop Image', compressImageQuality: 0.8, mediaType: 'photo',
            });
            handleMediaSelected({
                uri: image.path, type: image.mime,
                fileName: image.path.split('/').pop() || 'image.jpg',
                fileSize: image.size, width: image.width, height: image.height,
            } as ImageAsset);
        } catch (err: any) {
            if (err.code && err.code !== 'E_PICKER_CANCELLED') {
                Alert.alert(t('common.error') || 'Error', t('common.gallery_error') || 'Failed to select image');
            }
        }
    };

    const handleDocumentPick = async () => {
        try {
            const result = await pick({
                allowMultiSelection: false,
                type: [types.pdf, types.doc, types.docx, types.xls, types.xlsx, types.ppt, types.pptx, types.zip],
                transitionStyle: 'coverVertical',
            });
            if (result?.length > 0) handleMediaSelected(result[0]);
        } catch (err: any) {
            const isCancelled = isErrorWithCode(err) && err.code === errorCodes.OPERATION_CANCELED;
            if (!isCancelled) {
                Alert.alert(t('common.error') || 'Error', t('common.document_pick_failed') || 'Failed to pick document.');
            }
        }
    };

    const handleMediaSelected = (media: ImageAsset | DocumentPickerResponse) => {
        if (entries.length >= maxItems) {
            Alert.alert(
                t('common.limit_reached') || 'Limit Reached',
                t('common.max_media_reached', { max: maxItems }) || `You can upload a maximum of ${maxItems} items.`,
            );
            return;
        }

        const key = `local_${Date.now()}`;
        const fileName = resolveFileName(media); // ← uses the fixed resolver
        const fileType = getMediaTypeFromFileName(fileName);

        const newEntry: MediaEntry = {
            key, mediaId: '', localUri: (media as any).uri || '',
            fileName, fileType, uploading: true, error: false,
        };

        setEntries(prev => [...prev, newEntry]);
        onMediaSelect?.(media);
        if (autoUpload) uploadMediaToServer(media, key);
    };

    const handleRemoveEntry = (keyToRemove: string) => {
        Alert.alert(
            t('common.remove_media') || 'Remove Media',
            t('common.remove_media_confirm') || 'Are you sure you want to remove this media?',
            [
                { text: t('common.cancel') || 'Cancel', style: 'cancel' },
                {
                    text: t('common.remove') || 'Remove', style: 'destructive',
                    onPress: () => {
                        setEntries(prev => { const next = prev.filter(e => e.key !== keyToRemove); notifyParent(next); return next; });
                    },
                },
            ],
        );
    };

    const handleViewMedia = (entry: MediaEntry) => {
        if (entry.fileType === 'image' && entry.localUri) {
            setPreviewUri(entry.localUri);
            setPreviewVisible(true);
        }
    };

    // Rendering
    const canAddMore = entries.length < maxItems;
    const itemSize = Math.floor((Dimensions.get('window').width - 40 - 8) / 2);

    const renderImageEntry = (entry: MediaEntry) => {
        return (
            <TouchableOpacity
                key={entry.key}
                style={[styles.thumbnailWrapper, { width: itemSize, height: itemSize }]}
                onPress={() => handleViewMedia(entry)}
                activeOpacity={0.7}
            >
                {entry.uploading ? (
                    <View style={[styles.thumbnailPlaceholder, { backgroundColor: themeColors?.isDark ? themeColors.surface : colors.lightGray }]}>
                        <ActivityIndicator size="small" color={themeColors.primary} />
                    </View>
                ) : entry.error || !entry.localUri ? (
                    <View style={[styles.thumbnailPlaceholder, { backgroundColor: colors.lightGray }]}>
                        <Ionicons name="alert-circle" size={32} color={colors.error} />
                    </View>
                ) : (
                    <Image source={{ uri: entry.localUri }} style={styles.thumbnail} resizeMode="cover" />
                )}
                {removable && !entry.uploading && (
                    <TouchableOpacity style={styles.thumbnailRemoveBtn} onPress={() => handleRemoveEntry(entry.key)} activeOpacity={0.7}>
                        <Ionicons name="close-circle" size={22} color={colors.error} />
                    </TouchableOpacity>
                )}
            </TouchableOpacity>
        );
    };

    const renderDocumentEntry = (entry: MediaEntry) => {
        const { name: iconName, color: iconColor } = getDocumentIcon(entry.fileName);
        const displayName = entry.fileName.split('/').pop() || entry.fileName;

        return (
            <View key={entry.key} style={styles.documentEntry}>
                <FontAwesome6 name={iconName} size={32} color={iconColor} />
                <View style={styles.documentInfo}>
                    <Text style={styles.documentName} numberOfLines={2}>
                        {displayName}
                    </Text>
                    {entry.uploading && (
                        <View style={styles.uploadingBadge}>
                            <ActivityIndicator size="small" color={themeColors.primary} />
                            <Text style={styles.uploadingText}>{t('common.uploading') || 'Uploading...'}</Text>
                        </View>
                    )}
                    {entry.error && (
                        <Text style={styles.errorText}>{t('common.upload_failed') || 'Upload failed'}</Text>
                    )}
                </View>
                {removable && !entry.uploading && (
                    <TouchableOpacity style={styles.removeBtn} onPress={() => handleRemoveEntry(entry.key)} activeOpacity={0.7}>
                        <Ionicons name="close-circle" size={24} color={colors.error} />
                    </TouchableOpacity>
                )}
            </View>
        );
    };

    const renderUploadModal = () => (
        <Modal
            visible={uploadModalVisible}
            transparent={true}
            animationType="slide"
            onRequestClose={() => setUploadModalVisible(false)}
        >
            <SafeAreaView style={styles.modalContainer}>
                <View style={styles.modalContent}>
                    <View style={styles.modalHeader}>
                        <Text style={styles.modalTitle}>
                            {t('common.choose_upload_option') || 'Choose Upload Option'}
                        </Text>
                        <TouchableOpacity onPress={() => setUploadModalVisible(false)} style={styles.modalCloseBtn}>
                            <Ionicons name="close" size={24} color={themeColors.textPrimary} />
                        </TouchableOpacity>
                    </View>

                    <ScrollView contentContainerStyle={styles.modalOptions}>
                        <TouchableOpacity
                            style={styles.modalOption}
                            onPress={() => scheduleAfterModalClose('camera')}
                            activeOpacity={0.7}
                        >
                            <Ionicons name="camera" size={40} color={themeColors.primary} />
                            <Text style={styles.modalOptionText}>{t('common.camera') || 'Camera'}</Text>
                        </TouchableOpacity>

                        <TouchableOpacity
                            style={styles.modalOption}
                            onPress={() => scheduleAfterModalClose('gallery')}
                            activeOpacity={0.7}
                        >
                            <Ionicons name="image" size={40} color={themeColors.primary} />
                            <Text style={styles.modalOptionText}>{t('common.gallery') || 'Gallery'}</Text>
                        </TouchableOpacity>

                        <TouchableOpacity
                            style={styles.modalOption}
                            onPress={() => scheduleAfterModalClose('document')}
                            activeOpacity={0.7}
                        >
                            <Ionicons name="document" size={40} color={themeColors.primary} />
                            <Text style={styles.modalOptionText}>{t('legal.title')}</Text>
                        </TouchableOpacity>
                    </ScrollView>
                </View>
            </SafeAreaView>
        </Modal>
    );

    const renderPreviewModal = () => (
        <Modal
            visible={previewVisible}
            transparent={false}
            animationType="fade"
            onRequestClose={() => setPreviewVisible(false)}
            statusBarTranslucent
        >
            <StatusBar barStyle="light-content" />
            <SafeAreaView style={styles.previewOverlay}>
                <TouchableWithoutFeedback onPress={() => setPreviewVisible(false)}>
                    <View style={StyleSheet.absoluteFill} />
                </TouchableWithoutFeedback>
                {previewUri && (
                    <Image source={{ uri: previewUri }} style={styles.previewImg} resizeMode="contain" />
                )}
                <TouchableOpacity
                    style={styles.previewCloseBtn}
                    onPress={() => setPreviewVisible(false)}
                    activeOpacity={0.8}
                    hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
                >
                    <Ionicons name="close" size={28} color={colors.white} />
                </TouchableOpacity>
            </SafeAreaView>
        </Modal>
    );

    if (isBulkResolving) {
        return (
            <View style={[styles.container, containerStyle]}>
                {label && <Text style={[styles.label, labelStyle]}>{label}</Text>}
                <View style={styles.loadingContainer}>
                    <ActivityIndicator size="large" color={themeColors.primary} />
                    <Text style={styles.loadingText}>{t('common.loading') || 'Loading...'}</Text>
                </View>
            </View>
        );
    }

    // Get filtered entries
    const imageEntries = entries.filter(entry => entry.fileType === 'image');
    const documentEntries = entries.filter(entry => entry.fileType === 'document');

    return (
        <View style={[styles.container, containerStyle]}>
            {label && <Text style={[styles.label, labelStyle]}>{label} {`(${entries.length}/${maxItems})`}</Text>}

            {/* Images Section - Grid Layout */}
            {imageEntries.length > 0 && (
                <View style={styles.mediaGrid}>
                    {imageEntries.map(renderImageEntry)}
                </View>
            )}

            {/* Documents Section - List Layout */}
            {documentEntries.length > 0 && (
                <View style={styles.documentsSection}>
                    {documentEntries.map(renderDocumentEntry)}
                </View>
            )}

            {canAddMore && (
                <TouchableOpacity
                    style={[styles.uploadAddButton, disabled && styles.disabled]}
                    onPress={() => setUploadModalVisible(true)}
                    activeOpacity={0.7}
                    disabled={disabled}
                >
                    <Ionicons name="add-circle-outline" size={40} color={themeColors.primary} />
                    <Text style={styles.uploadAddText}>{t('common.add_media') || 'Add Media'}</Text>
                </TouchableOpacity>
            )}
            {renderUploadModal()}
            {renderPreviewModal()}
        </View>
    );
};

export default MixedMediaUploader;
