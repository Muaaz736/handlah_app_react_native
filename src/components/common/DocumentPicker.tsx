import React, { useState, useEffect, useRef, useMemo } from 'react';
import { useUserRole } from '../../hooks/useUserRole';
import {
    View,
    Text,
    TouchableOpacity,
    Alert,
    ActivityIndicator,
    Modal,
    Image,
    TouchableWithoutFeedback,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { pick, types, DocumentPickerResponse, errorCodes, isErrorWithCode } from '@react-native-documents/picker';
import FontAwesome6 from 'react-native-vector-icons/FontAwesome6';
import Ionicons from 'react-native-vector-icons/Ionicons';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import NetInfo from '@react-native-community/netinfo';
import ReactNativeBlobUtil from 'react-native-blob-util';
import colors from '../../utils/colors';
import { useTranslation } from 'react-i18next';
import { useDispatch, useSelector } from 'react-redux';
import { imageUploadAsync, getImageAsync } from '../../redux/services/authService';
import { ASYNC_STATUS } from '../../config/constants';
import { BASEURL } from '../../config/apiHandle';
import { showInfoToast } from './CustomToast';
import { storeOfflineImageUri } from '../../services/offline/OfflineQueueService';
import { downloadAndOpenDocument, getDocumentUrl } from '../../utils/helpers';
import {
    DocumentPickerProps,
    DocumentData,
    UploadedDocumentResult,
} from '../../types/DocumentPicker.types';
import { AppDispatch } from '../../types/store.types';
import { makeDocumentPickerStyles } from './DocumentPicker.styles';
import { RoleTheme } from '../../types/roleManager.types';

/** Internal type for multi-doc entries */
interface DocEntry {
    id: string;
    data: DocumentData;
}

/**
 * Reusable Document Uploader Component
 * @param {object} documentData - Current document data { uri, name, type, size }
 * @param {function} onDocumentSelect - Callback function when document is selected, receives document object
 * @param {function} onDocumentUploaded - Callback function when document is uploaded to server, receives { id, url }
 * @param {string} label - Label text for the uploader (optional)
 * @param {string} placeholder - Placeholder text when no document (default: 'Upload Document')
 * @param {string} uploadType - 'box' | 'placeholder' | 'button' (default: 'placeholder')
 * @param {object} containerStyle - Custom container styles
 * @param {object} labelStyle - Custom label styles
 * @param {array} allowedTypes - Array of document types (default: [types.pdf, types.doc, types.docx])
 * @param {string} iconType - Icon type: 'fontawesome' | 'ionicons' | 'material' (default: 'fontawesome')
 * @param {string} iconName - Custom icon name
 * @param {number} iconSize - Icon size (default: 24)
 * @param {string} iconColor - Icon color (default: colors.black)
 * @param {boolean} disabled - Disable the uploader (default: false)
 * @param {boolean} showFileName - Show file name (default: true)
 * @param {boolean} showFileSize - Show file size (default: true)
 * @param {boolean} removable - Show remove button (default: false)
 * @param {function} onRemove - Callback when remove button is pressed
 * @param {string} alertTitle - Custom alert title for remove confirmation
 * @param {string} alertMessage - Custom alert message for remove confirmation
 * @param {boolean} autoUpload - Automatically upload to server after selection (default: true)
 * @param {boolean} allowMultiple - Allow multiple document selection (default: false)
 */
const DocumentPicker: React.FC<DocumentPickerProps> = ({
    documentData,
    onDocumentSelect,
    onDocumentUploaded,
    label,
    placeholder = 'Upload Document',
    uploadType = 'placeholder',
    containerStyle,
    labelStyle,
    allowedTypes = [types.pdf, types.doc, types.docx],
    iconType = 'fontawesome',
    iconName,
    iconSize = 24,
    iconColor = colors.black,
    disabled = false,
    showFileName = true,
    showFileSize = true,
    removable = false,
    onRemove,
    alertTitle,
    alertMessage,
    autoUpload = true,
    allowMultiple = false,
    multiple = false,
    maxDocuments = 5,
    documentIds,
    onDocumentIdsChange,
}) => {
    const { t } = useTranslation();
    const dispatch = useDispatch<AppDispatch>();

    const { image_upload_status } = useSelector((state: any) => state.user_auth);

const { themeColors } = useUserRole();

const styles = useMemo(() => makeDocumentPickerStyles(themeColors as RoleTheme), [themeColors]);

    // Single-doc state
    const [localDocument, setLocalDocument] = useState<DocumentData | null | undefined>(documentData);
    const [isResolving, setIsResolving] = useState(false);

    // Multi-doc state
    const [entries, setEntries] = useState<DocEntry[]>([]);
    const [isUploadingMulti, setIsUploadingMulti] = useState(false);
    const skipNextInitRef = useRef(false);
    const [imagePreviewVisible, setImagePreviewVisible] = useState(false);
    const [previewImageUri, setPreviewImageUri] = useState('');

    const isUploading: boolean = image_upload_status === ASYNC_STATUS.LOADING;

    // Multi-doc: initialise entries from parent documentIds ──
    useEffect(() => {
        if (!multiple) return;
        if (skipNextInitRef.current) {
            skipNextInitRef.current = false;
            return;
        }
        if (!documentIds || documentIds.length === 0) {
            if (entries.length > 0) setEntries([]);
            return;
        }
        // Only restore when ids genuinely changed
        const currentIds = entries.map(e => e.id).join(',');
        const newIds = documentIds.join(',');
        if (currentIds !== newIds) {
            restoreEntries(documentIds);
        }
    }, [documentIds, multiple]);

    const restoreEntries = async (ids: string[]) => {
        const restored: DocEntry[] = [];
        for (const docId of ids) {
            try {
                const response = await dispatch(getImageAsync(docId)).unwrap();
                restored.push({
                    id: docId,
                    data: {
                        uri: response?.signedurl || response?.signedUrl || '',
                        name: response?.filename || response?.fileName || 'Document',
                        type: response?.contenttype || response?.contentType || 'application/octet-stream',
                        size: response?.filesize || response?.fileSize || null,
                    },
                });
            } catch {
                restored.push({
                    id: docId,
                    data: { uri: '', name: 'Document', type: 'application/octet-stream', size: null },
                });
            }
        }
        setEntries(restored);
    };

    const notifyParent = (nextEntries: DocEntry[]) => {
        skipNextInitRef.current = true;
        onDocumentIdsChange && onDocumentIdsChange(nextEntries.map(e => e.id));
    };

    const handleMultiPick = async () => {
        if (entries.length >= maxDocuments || isUploadingMulti) return;
        try {
            const result: DocumentPickerResponse[] = await pick({
                allowMultiSelection: false,
                type: allowedTypes,
            });
            if (result && result.length > 0) {
                const selected = result[0];
                const docData: DocumentData = {
                    uri: selected.uri,
                    name: selected.name || 'document',
                    type: selected.type || 'application/octet-stream',
                    size: selected.size,
                };
                setIsUploadingMulti(true);
                try {
                    const formData = new FormData();
                    formData.append('file', {
                        uri: docData.uri,
                        type: docData.type,
                        name: docData.name,
                    } as any);
                    const uploadResult = await dispatch(imageUploadAsync(formData as any)).unwrap();
                    if (uploadResult && uploadResult.id) {
                        setEntries(prev => {
                            const next = [...prev, { id: String(uploadResult.id), data: docData }];
                            setTimeout(() => notifyParent(next), 0);
                            return next;
                        });
                    }
                } catch {
                    Alert.alert(
                        t('common.error') || 'Error',
                        t('legal.upload_failed') || 'Failed to upload document',
                    );
                } finally {
                    setIsUploadingMulti(false);
                }
            }
        } catch (error: any) {
            if (isErrorWithCode(error) && error.code === errorCodes.OPERATION_CANCELED) return;
            Alert.alert(
                t('common.error') || 'Error',
                t('common.document_pick_failed') || 'Failed to pick document. Please try again.',
            );
        }
    };

    const handleMultiRemove = (index: number) => {
        Alert.alert(
            alertTitle || t('common.remove_document') || 'Remove Document',
            alertMessage || t('common.remove_document_confirm') || 'Are you sure you want to remove this document?',
            [
                { text: t('common.cancel') || 'Cancel', style: 'cancel' },
                {
                    text: t('common.remove') || 'Remove',
                    style: 'destructive',
                    onPress: () => {
                        setEntries(prev => {
                            const next = prev.filter((_, i) => i !== index);
                            setTimeout(() => notifyParent(next), 0);
                            return next;
                        });
                    },
                },
            ],
        );
    };

    const handleViewDocument = async (entry: DocEntry) => {
        const ext = (entry.data.name?.split('.').pop() || '').toLowerCase();
        const isImage = ['jpg', 'jpeg', 'png', 'gif', 'bmp', 'webp'].includes(ext);
        if (isImage) {
            const uri = entry.data.uri;
            if (uri && uri.startsWith('http')) {
                setPreviewImageUri(uri);
                setImagePreviewVisible(true);
            } else {
                try {
                    const response = await dispatch(getImageAsync(entry.id)).unwrap();
                    const signedUrl = response?.signedurl || response?.signedUrl;
                    if (signedUrl) {
                        setPreviewImageUri(signedUrl);
                        setImagePreviewVisible(true);
                    }
                } catch {
                    Alert.alert(t('common.error') || 'Error', 'Failed to load image');
                }
            }
        } else {
            const fullUrl = getDocumentUrl(entry.id);
            await downloadAndOpenDocument(fullUrl, entry.data.name);
        }
    };

    const getDocIcon = (fileName: string) => {
        const ext = (fileName?.split('.').pop() || '').toUpperCase();
        let name = 'file';
        let color: string = colors.gray;
        if (ext === 'PDF') { name = 'file-pdf'; color = '#E74C3C'; }
        else if (ext === 'DOC' || ext === 'DOCX') { name = 'file-word'; color = '#2B579A'; }
        else if (ext === 'XLS' || ext === 'XLSX') { name = 'file-excel'; color = '#217346'; }
        else if (ext === 'PPT' || ext === 'PPTX') { name = 'file-powerpoint'; color = '#D24726'; }
        else if (['JPG', 'JPEG', 'PNG', 'GIF', 'BMP'].includes(ext)) { name = 'file-image'; color = '#9B59B6'; }
        else if (['ZIP', 'RAR', '7Z'].includes(ext)) { name = 'file-zipper'; color = '#FFA500'; }
        else if (ext === 'TXT') { name = 'file-lines'; }
        return { name, color };
    };

    // Single-doc: existing logic 

    useEffect(() => {
        resolveDocumentData(documentData);
    }, [documentData]);

    const resolveDocumentData = async (docData: DocumentData | null | undefined) => {
        if (!docData || !docData.uri) {
            setLocalDocument(docData);
            return;
        }

        if (docData.uri.includes(`${BASEURL}image/`)) {
            const docId = docData.uri.replace(`${BASEURL}image/`, '').split('?')[0];
            if (docId) {
                try {
                    setIsResolving(true);
                    const response = await dispatch(getImageAsync(docId)).unwrap();
                    setLocalDocument({
                        uri: response?.signedurl || response?.signedUrl || docData.uri,
                        name: response?.filename || docData.name,
                        type: response?.contenttype || docData.type,
                        size: response?.filesize || docData.size,
                    });
                } catch {
                    setLocalDocument(docData);
                } finally {
                    setIsResolving(false);
                }
                return;
            }
        }

        setLocalDocument(docData);
    };

    const uploadDocumentToServer = async (docData: DocumentData): Promise<void> => {
        // Offline check: copy file to permanent storage, store metadata 
        const networkState = await NetInfo.fetch();
        if (networkState.isConnected === false) {
            const offlineId = `offline_${Date.now()}`;
            const tempUri = docData.uri || '';

            if (tempUri) {
                try {
                    const originalName = docData.name || `document_${Date.now()}`;
                    const ext = originalName.split('.').pop() || 'pdf';
                    const mimeType = docData.type || 'application/octet-stream';
                    const permanentDir = `${ReactNativeBlobUtil.fs.dirs.DocumentDir}/offline_images`;
                    const permanentPath = `${permanentDir}/${offlineId}.${ext}`;

                    const dirExists = await ReactNativeBlobUtil.fs.isDir(permanentDir);
                    if (!dirExists) {
                        await ReactNativeBlobUtil.fs.mkdir(permanentDir);
                    }

                    const sourcePath = tempUri.replace('file://', '');
                    await ReactNativeBlobUtil.fs.cp(sourcePath, permanentPath);

                    const permanentUri = `file://${permanentPath}`;

                    await storeOfflineImageUri(offlineId, permanentUri, mimeType, originalName);

                    if (onDocumentUploaded) {
                        onDocumentUploaded({ id: offlineId, url: permanentUri } as any);
                    }
                } catch (copyError) {
                    console.warn('[DocumentPicker] Failed to copy document for offline:', copyError);
                    const mimeType = docData.type || 'application/octet-stream';
                    const originalName = docData.name || `document_${Date.now()}`;
                    await storeOfflineImageUri(offlineId, tempUri, mimeType, originalName);
                    if (onDocumentUploaded) {
                        onDocumentUploaded({ id: offlineId, url: tempUri } as any);
                    }
                }
            }

            showInfoToast(
                'Document saved locally. It will be uploaded when internet is available.',
                'Offline',
            );
            return;
        }

        // Normal online upload
        try {
            const formData = new FormData();
            formData.append('file', {
                uri: docData.uri,
                type: docData.type || 'application/octet-stream',
                name: docData.name || 'document.pdf',
            } as any);

            const result: UploadedDocumentResult = await dispatch(imageUploadAsync(formData as any)).unwrap();

            // result contains { id, url }
            if (result && result.id) {
                onDocumentUploaded && onDocumentUploaded(result);
            }
        } catch (error) {
            // Error is already shown by slice
            // Remove local document on upload failure
            setLocalDocument(null);
        }
    };

    const handleDocumentPick = async (): Promise<void> => {
        if (disabled || isUploading) return;

        try {
            const result: DocumentPickerResponse[] = await pick({
                allowMultiSelection: allowMultiple,
                type: allowedTypes,
            });

            if (result && result.length > 0) {
                const selectedDocument = result[0];

                // Create document object with necessary data
                const docData: DocumentData = {
                    uri: selectedDocument.uri,
                    name: selectedDocument.name || '',
                    type: selectedDocument.type || 'application/octet-stream',
                    size: selectedDocument.size,
                };

                setLocalDocument(docData); // Set local document immediately
                onDocumentSelect && onDocumentSelect(docData);

                if (autoUpload) {
                    uploadDocumentToServer(docData);
                }
            }
        } catch (error: any) {
            if (isErrorWithCode(error) && error.code === errorCodes.OPERATION_CANCELED) {
                // User cancelled — do nothing silently
                return;
            }
            Alert.alert(
                t('common.error') || 'Error',
                t('common.document_pick_failed') || 'Failed to pick document. Please try again.'
            );
        }
    };

    const handleRemovePress = (): void => {
        Alert.alert(
            alertTitle || t('common.remove_document') || 'Remove Document',
            alertMessage || t('common.remove_document_confirm') || 'Are you sure you want to remove this document?',
            [
                {
                    text: t('common.cancel') || 'Cancel',
                    style: 'cancel',
                },
                {
                    text: t('common.remove') || 'Remove',
                    style: 'destructive',
                    onPress: () => {
                        setLocalDocument(null);
                        onRemove && onRemove();
                    },
                },
            ],
        );
    };

    const formatFileSize = (bytes?: number): string => {
        if (!bytes) return '';
        if (bytes < 1024) return bytes + ' B';
        if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
        return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
    };

    const getFileExtension = (fileName?: string): string => {
        if (!fileName) return '';
        const parts = fileName.split('.');
        return parts.length > 1 ? parts[parts.length - 1].toUpperCase() : '';
    };

    const renderIcon = () => {
        const defaultIconName = iconName || (iconType === 'ionicons' ? 'document-text-outline' : 'file-arrow-up');

        if (iconType === 'ionicons') {
            return <Ionicons name={defaultIconName} size={iconSize} color={iconColor} />;
        } else if (iconType === 'material') {
            return <MaterialIcons name={defaultIconName || 'file-upload'} size={iconSize} color={iconColor} />;
        } else {
            return <FontAwesome6 name={defaultIconName} size={iconSize} color={iconColor} />;
        }
    };

    const renderDocumentIcon = () => {
        const extension = getFileExtension(localDocument?.name);
        let iconName = 'file';
        let iconColor = colors.gray;

        if (extension === 'PDF') {
            iconName = 'file-pdf';
            iconColor = '#E74C3C';
        } else if (extension === 'DOC' || extension === 'DOCX') {
            iconName = 'file-word';
            iconColor = '#2B579A';
        } else if (extension === 'XLS' || extension === 'XLSX') {
            iconName = 'file-excel';
            iconColor = '#217346';
        } else if (extension === 'PPT' || extension === 'PPTX') {
            iconName = 'file-powerpoint';
            iconColor = '#D24726';
        } else if (extension === 'TXT') {
            iconName = 'file-lines';
            iconColor = colors.gray;
        } else if (['ZIP', 'RAR', '7Z'].includes(extension)) {
            iconName = 'file-zipper';
            iconColor = '#FFA500';
        } else if (['JPG', 'JPEG', 'PNG', 'GIF', 'BMP'].includes(extension)) {
            iconName = 'file-image';
            iconColor = '#9B59B6';
        }

        return <FontAwesome6 name={iconName} size={40} color={iconColor} />;
    };

    // Render different upload types
    const renderUploadContent = () => {
        if (isUploading || isResolving) {
            return (
                <View style={styles.loadingContainer}>
                    <ActivityIndicator size="large" color={colors.primary} />
                    <Text style={styles.loadingText}>
                        {isResolving ? (t('common.loading') || 'Loading...') : (t('common.uploading') || 'Uploading...')}
                    </Text>
                </View>
            );
        }

        if (localDocument) {
            return (
                <View style={styles.documentContainer}>
                    <View style={[
                        uploadType === 'box' ? styles.documentBoxContent : styles.documentContent,
                    ]}>
                        <View style={styles.documentIconContainer}>
                            {renderDocumentIcon()}
                        </View>
                        <View style={styles.documentInfo}>
                            {showFileName && (
                                <Text style={styles.documentName} numberOfLines={2}>
                                    {localDocument.name}
                                </Text>
                            )}
                            {showFileSize && (
                                <Text style={styles.documentSize}>
                                    {localDocument.size 
                                        ? `${formatFileSize(localDocument.size)} • ${getFileExtension(localDocument.name)}`
                                        : getFileExtension(localDocument.name)
                                    }
                                </Text>
                            )}
                        </View>
                        {removable && (
                            <TouchableOpacity
                                style={styles.removeButton}
                                onPress={handleRemovePress}
                                activeOpacity={0.7}
                            >
                                <Ionicons name="close-circle" size={24} color={colors.error} />
                            </TouchableOpacity>
                        )}
                    </View>
                </View>
            );
        }

        if (uploadType === 'box') {
            return (
                <TouchableOpacity
                    style={[styles.uploadBox, disabled && styles.disabled]}
                    onPress={handleDocumentPick}
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
                    onPress={handleDocumentPick}
                    activeOpacity={0.7}
                    disabled={disabled}
                >
                    {renderIcon()}
                    <Text style={styles.uploadButtonText}>{placeholder}</Text>
                </TouchableOpacity>
            );
        }

        // Default: placeholder type
        return (
            <TouchableOpacity
                style={[styles.uploadPlaceholder, disabled && styles.disabled]}
                onPress={handleDocumentPick}
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

    // Multi-doc rendering ───────────────────────────────────
    const renderMultiDocContent = () => {
        return (
            <>
                {/* Existing document entries */}
                {entries.map((entry, index) => {
                    const icon = getDocIcon(entry.data.name);
                    return (
                        <TouchableOpacity
                            key={`${entry.id}_${index}`}
                            style={styles.multiDocEntry}
                            onPress={() => handleViewDocument(entry)}
                            activeOpacity={0.7}
                        >
                            <FontAwesome6 name={icon.name} size={32} color={icon.color} />
                            <View style={styles.multiDocInfo}>
                                <Text style={styles.multiDocName} numberOfLines={1}>
                                    {entry.data.name}
                                </Text>
                                {!!entry.data.size && (
                                    <Text style={styles.multiDocSize}>
                                        {formatFileSize(entry.data.size)}
                                    </Text>
                                )}
                            </View>
                            <TouchableOpacity
                                onPress={() => handleMultiRemove(index)}
                                hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                            >
                                <Ionicons name="close-circle" size={24} color={colors.error} />
                            </TouchableOpacity>
                        </TouchableOpacity>
                    );
                })}

                {/* Add button or uploading indicator */}
                {entries.length < maxDocuments && (
                    isUploadingMulti ? (
                        <View style={styles.multiDocUploadingBox}>
                            <ActivityIndicator size="large" color={colors.primary} />
                            <Text style={styles.multiDocUploadingText}>
                                {t('common.uploading') || 'Uploading…'}
                            </Text>
                        </View>
                    ) : (
                        <TouchableOpacity
                            style={[styles.multiDocAddButton, disabled && styles.disabled]}
                            onPress={handleMultiPick}
                            activeOpacity={0.7}
                            disabled={disabled}
                        >
                            <FontAwesome6 name="file-arrow-up" size={24} color={colors.gray} />
                            <Text style={styles.multiDocAddText}>
                                {placeholder}
                            </Text>
                        </TouchableOpacity>
                    )
                )}

                {/* Image Preview Modal */}
                <Modal
                    visible={imagePreviewVisible}
                    transparent
                    animationType="fade"
                    onRequestClose={() => setImagePreviewVisible(false)}
                >
                    <TouchableWithoutFeedback onPress={() => setImagePreviewVisible(false)}>
                        <SafeAreaView style={styles.previewOverlay}>
                            <TouchableOpacity
                                style={styles.previewCloseBtn}
                                onPress={() => setImagePreviewVisible(false)}
                            >
                                <Ionicons name="close" size={30} color="white" />
                            </TouchableOpacity>
                            {!!previewImageUri && (
                                <Image
                                    source={{ uri: previewImageUri }}
                                    style={styles.previewImg}
                                    resizeMode="contain"
                                />
                            )}
                        </SafeAreaView>
                    </TouchableWithoutFeedback>
                </Modal>
            </>
        );
    };

    // Branch: multi vs single ───────────────────────────────
    if (multiple) {
        return (
            <View style={[styles.container, containerStyle]}>
                {label && (
                    <Text style={[styles.label, labelStyle]}>
                        {label}{' '}
                        <Text style={styles.multiDocCount}>
                            ({entries.length}/{maxDocuments})
                        </Text>
                    </Text>
                )}
                {renderMultiDocContent()}
            </View>
        );
    }

    return (
        <View style={[styles.container, containerStyle]}>
            {label && <Text style={[styles.label, labelStyle]}>{label}</Text>}
            {renderUploadContent()}
        </View>
    );
};

export default DocumentPicker;