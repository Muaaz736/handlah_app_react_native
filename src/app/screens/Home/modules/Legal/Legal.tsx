
import React, { useCallback, useEffect, useRef, useState, useMemo } from 'react';
import {
    View,
    Text,
    TouchableOpacity,
    Image,
    ScrollView,
    ActivityIndicator,
    Alert,
} from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import Ionicons from 'react-native-vector-icons/Ionicons';
import AntDesign from 'react-native-vector-icons/AntDesign';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import Entypo from 'react-native-vector-icons/Entypo';
import Fontisto from 'react-native-vector-icons/Fontisto';
import { useTranslation } from 'react-i18next';
import { useDispatch, useSelector } from 'react-redux';
import { AuthHeader, PrimaryButton, ShareModal, DeleteConfirmModal, ViewDetailModal } from '../../../../../components/common';
import colors, { getColorWithOpacity } from '../../../../../utils/colors';
import { ICONS } from '../../../../../utils/Images';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useUserRole } from '../../../../../hooks/useUserRole';
import { useSubscriptionGate } from '../../../../../hooks/useSubscriptionGate';
import { useSelectedBusiness } from '../../../../../hooks/useSelectedBusiness';
import { legalDocumentsAsync, deleteLegalDocumentAsync } from '../../../../../redux/services/essentialsService';
import { setCreateLegalDocumentStatus, setUpdateLegalDocumentStatus } from '../../../../../redux/slices/essentialsSlice';
import { ASYNC_STATUS } from '../../../../../config/constants';
import { formatDate, getDocumentUrl, isIOS } from '../../../../../utils/helpers';
import { downloadAndOpenDocument } from '../../../../../utils/helpers';
import { LegalDocument, LegalNavigationProp, ShareData } from './Legal.types';
import { useFocusEffect, useNavigation, useRoute } from '@react-navigation/native';
import { sharingSyncService } from '../../../../../redux/services/sharingService';
import { resetShareSyncStatus } from '../../../../../redux/slices/sharingSlice';
import { getModuleWriteAccess, getEntityWriteAccess } from '../../../../../utils/accessLevel';
import { makeLegalStyles } from './Legal.styles';
import type { DetailModalData } from '../../../../../types/viewDetailModal.types';
import { getDropdownOptionsAsync } from '../../../../../redux/services/authService';
import { AppDispatch } from '../../../../../types/store.types';
import SharedWithMeSection, { SharedWithMeOwner } from '../../../../../components/SharedWithMe/SharedWithMeSection';
import { getLegalDocumentsSharedWithMeAsync } from '../../../../../redux/services/essentialsService';
import { RoleTheme } from '../../../../../types/roleManager.types';
import { darkenColor } from '../../../../../utils/roleManager';


const Legal = () => {
    const { t, i18n } = useTranslation();
    const { themeColors, isBusinessRole } = useUserRole();
    const styles = useMemo(() => makeLegalStyles(themeColors as RoleTheme), [themeColors]);
    const { checkSubscription, GateModal } = useSubscriptionGate();
    const { selectedBusinessId } = useSelectedBusiness();
    const navigation = useNavigation<LegalNavigationProp>();
    const dispatch = useDispatch<AppDispatch>();

    const route = useRoute<any>();
    const { from, connectionTabSource, sharedWithUserId, ownerId, accessLevel, accessType, openEntityId, openEntityIdForEdit } = route.params || {};
    const isFromEmergencyAccess = from === 'emergency_access';
    const shouldAllowShare = !isFromEmergencyAccess && !accessLevel;
    const writeAccess = getModuleWriteAccess({ isFromEmergencyAccess, accessType, accessLevel });
    const getItemWriteAccess = (item: any) =>
        getEntityWriteAccess({ isFromEmergencyAccess, accessType, moduleWriteAccess: writeAccess, entity: item });
    const getConnectionTabQueryParams = () => {
        if (connectionTabSource === 'yours' && sharedWithUserId) {
            return { sharedWithUserId };
        }
        if (connectionTabSource === 'shared_with_you' && ownerId) {
            return { ownerId };
        }
        return {};
    };

    // Check if user is in business mode
    const isBusiness = isBusinessRole();
    const showSharedWithMe = !isBusiness && !isFromEmergencyAccess && !connectionTabSource;

    const { currentConnectionUserId, emergencyConnectionBusinessId } = useSelector((state: any) => state.connection_slice);

    const { get_dropdown_options_data } = useSelector((state: any) => state.user_auth);

    useFocusEffect(useCallback(() => {
        dispatch(getDropdownOptionsAsync('LegalDocumentType'));
    }, [dispatch]));

    const {
        legal_documents_data,
        legal_documents_status,
        delete_legal_document_status,
        create_legal_document_status,
        update_legal_document_status
    } = useSelector((state: any) => state.essentials_slice);
    const { share_sync_status, selectedSharedBusiness } = useSelector((state: any) => state.sharing_slice);

    const [shareModalVisible, setShareModalVisible] = useState(false);
    const [deleteModalVisible, setDeleteModalVisible] = useState(false);
    const [selectedDocument, setSelectedDocument] = useState<LegalDocument | null>(null);
    const [shareContext, setShareContext] = useState<{
        resourceType: string;
        resourceId?: number;
    }>({ resourceType: 'legaldocument' });
    const sharingLoading = share_sync_status === ASYNC_STATUS.LOADING;
    const currentBusinessId = isFromEmergencyAccess
        ? emergencyConnectionBusinessId
        : (isBusiness && selectedBusinessId ? selectedBusinessId : undefined);
    const [viewModalVisible, setViewModalVisible] = useState(false);
    const [viewModalData, setViewModalData] = useState<DetailModalData | null>(null);


    useFocusEffect(
        React.useCallback(() => {
            const connectionParams = getConnectionTabQueryParams();

            // In business mode with no business selected, skip fetch to avoid showing personal data
            if (isBusiness && !selectedBusinessId && !isFromEmergencyAccess && Object.keys(connectionParams).length === 0) {
                return;
            }

            const params: any = { ...connectionParams };

            if (isBusiness && selectedBusinessId && !isFromEmergencyAccess) {
                if (connectionTabSource === "shared_with_you") {
                    params.businessId = selectedSharedBusiness?.id;
                } else {
                    params.businessId = selectedBusinessId;
                }
            }

            if (isFromEmergencyAccess && currentConnectionUserId) {
                params.userId = currentConnectionUserId;
                params.businessId = emergencyConnectionBusinessId;
            }

            const arg = Object.keys(params).length ? params : undefined;

            dispatch(legalDocumentsAsync(arg));
            // Reset status to prevent showing stale success alerts
            dispatch(setCreateLegalDocumentStatus());
            dispatch(setUpdateLegalDocumentStatus());
        }, [dispatch, delete_legal_document_status, isBusiness, selectedBusinessId, isFromEmergencyAccess, currentConnectionUserId, emergencyConnectionBusinessId])
    );

    // Get documents from Redux
    // In business mode with no business selected, show empty data
    const noBusinessInBusinessMode = isBusiness && !selectedBusinessId && !isFromEmergencyAccess;
    const documents = noBusinessInBusinessMode
        ? []
        : Array.isArray(legal_documents_data?.documents)
            ? legal_documents_data?.documents
            : Array.isArray(legal_documents_data)
                ? legal_documents_data
                : [];

    const handleAddDocument = () => {
        checkSubscription(() => navigation.navigate('AddLegalDocument' as any, accessLevel ? { ownerUserId: currentConnectionUserId } : undefined));
    };

    const handleShare = (resourceId?: number) => {
        checkSubscription(() => {
            setShareContext({ resourceType: 'legaldocument', resourceId });
            setShareModalVisible(true);
        }, isBusiness ? 'business' : 'personal');
    };

    const handleShareDocument = (shareData: ShareData): void => {
        const payload: any = {
            ...shareContext,
            users: shareData
        };

        if (currentBusinessId) {
            payload.businessId = currentBusinessId;
        }

        dispatch(sharingSyncService(payload));
    };

    useEffect(() => {
        if (share_sync_status === ASYNC_STATUS.SUCCEEDED) {
            dispatch(resetShareSyncStatus());
            setShareModalVisible(false);
        }
    }, [share_sync_status, dispatch]);

    useEffect(() => {
        if (share_sync_status === ASYNC_STATUS.ERROR) {
            dispatch(resetShareSyncStatus());
        }
    }, [share_sync_status, dispatch]);

    const handleEditDocument = (document: LegalDocument): void => {
        navigation.navigate('AddLegalDocument', { document, isEdit: true });
    };

    const handleDeleteDocument = (document: LegalDocument): void => {
        setSelectedDocument(document);
        setDeleteModalVisible(true);
    };

    const handleViewPress = (document: any): void => {
        const rawAttachments = document.additionalattachments || document.additionalAttachments;
        const additionalAttachments: string[] = rawAttachments
            ? Array.isArray(rawAttachments) ? rawAttachments : [rawAttachments]
            : [];

        const badgeLabel = document.typeother
            || get_dropdown_options_data?.find((option: any) => String(option.value) === String(document.type))?.label
            || document.typelabel
            || undefined;

        const data: DetailModalData = {
            linkRecord: document?.id ? { moduleKey: 'legaldocument', id: Number(document.id) } : null,
            title: document.name || document.title || t('legal.legal_document'),
            badge: badgeLabel,
            rows: [
                {
                    left: { label: t('legal.effective_date') || 'Effective Date', value: formatDate(document.effectivedate || document.effectiveDate) },
                    right: { label: t('legal.expire_date') || 'Expire Date', value: formatDate(document.enddate || document.endDate) },
                },
            ],
            sections: [
                ...(document.notes ? [{
                    title: t('common.notes') || 'Notes',
                    content: document.notes,
                }] : []),
            ],
            imageIds: document.documenturl || document.documentUrl || undefined,
            documentName: `${document.name || 'Document'}.pdf`,
        };
        setViewModalData(data);
        setViewModalVisible(true);
    };

    const renderSharedLegalItem = (item: any, _owner: SharedWithMeOwner): React.ReactNode => {
        const canWrite = item.accessLevel === 'write' || item.accessLevel === 'full';
        return (
            <TouchableOpacity
                key={item.id}
                style={styles.documentCard}
                onPress={() => handleViewPress(item)}
                activeOpacity={0.7}
            >
                <View style={styles.cardHeader}>
                    <Text style={[styles.documentTitle, { textAlign: 'left' }]}>{item.name}</Text>
                    <View style={styles.badgeContainer}>
                        <View style={[styles.typeBadge, { backgroundColor: themeColors.lightCGreen }]}>
                            <Text style={[styles.typeBadgeText, { textAlign: 'left' }]}>
                                {item.typeother || get_dropdown_options_data?.find((option: any) => String(option.value) === String(item.type))?.label || '-'}
                            </Text>
                        </View>
                        <View style={styles.actionsRow}>
                            <TouchableOpacity
                                style={styles.iconButton}
                                onPress={() => navigation.navigate('EditHistoryList', {
                                    entityType: 'LegalDocument',
                                    entityId: item.id,
                                    title: t('edit_history.title'),
                                })}
                            >
                                <MaterialIcons name="history" size={22} color={themeColors.secondary} />
                            </TouchableOpacity>
                            {canWrite && (
                                <TouchableOpacity
                                    style={styles.iconButton}
                                    onPress={() => handleEditDocument(item as LegalDocument)}
                                >
                                    <Image source={ICONS.EDIT_ICON} style={[styles.actionIcon, { tintColor: themeColors.secondary }]} />
                                </TouchableOpacity>
                            )}
                        </View>
                    </View>
                </View>
                <View style={styles.cardBody}>
                    <View style={styles.datesRow}>
                        <View style={styles.dateItem}>
                            <Text style={[styles.dateLabel, { textAlign: 'left' }]}>{t('legal.effective_date')}</Text>
                            <Text style={[styles.dateValue, { textAlign: 'left' }]}>
                                {formatDate(item.effectivedate || item.effectiveDate)}
                            </Text>
                        </View>
                        <View style={styles.dateItem}>
                            <Text style={[styles.dateLabel, { textAlign: 'left' }]}>{t('legal.expire_date')}</Text>
                            <Text style={[styles.dateValue, { textAlign: 'left' }]}>
                                {formatDate(item.enddate || item.endDate)}
                            </Text>
                        </View>
                    </View>
                </View>
            </TouchableOpacity>
        );
    };

    const autoOpenedRef = useRef(false);
    useEffect(() => {
        if (!openEntityId || autoOpenedRef.current) return;
        if (legal_documents_status !== ASYNC_STATUS.SUCCEEDED) return;
        const docList = Array.isArray(legal_documents_data?.documents)
            ? legal_documents_data.documents
            : Array.isArray(legal_documents_data) ? legal_documents_data : [];
        const target = docList.find((d: any) => Number(d.id) === Number(openEntityId));
        if (target) {
            autoOpenedRef.current = true;
            handleViewPress(target);
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [openEntityId, legal_documents_status]);

    // Auto-open the edit form when navigated here for "Update Record"
    const autoOpenedForEditRef = useRef(false);
    useEffect(() => {
        if (!openEntityIdForEdit || autoOpenedForEditRef.current) return;
        if (legal_documents_status !== ASYNC_STATUS.SUCCEEDED) return;
        const docList = Array.isArray(legal_documents_data?.documents)
            ? legal_documents_data.documents
            : Array.isArray(legal_documents_data) ? legal_documents_data : [];
        const target = docList.find((d: any) => Number(d.id) === Number(openEntityIdForEdit));
        if (target) {
            autoOpenedForEditRef.current = true;
            handleEditDocument(target);
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [openEntityIdForEdit, legal_documents_status]);

    const confirmDelete = async () => {
        if (!selectedDocument?.id) return;

        const action = await dispatch(deleteLegalDocumentAsync(selectedDocument.id as any));

        if (action.type === deleteLegalDocumentAsync.fulfilled.type) {
            setTimeout(() => {
                setDeleteModalVisible(false);
                setSelectedDocument(null);
            }, 300);

            const params: any = { ...getConnectionTabQueryParams() };

            if (isBusiness && selectedBusinessId && !isFromEmergencyAccess) {
                params.businessId = selectedBusinessId;
            }

            if (isFromEmergencyAccess && currentConnectionUserId) {
                params.userId = currentConnectionUserId;
                params.businessId = emergencyConnectionBusinessId;
            }

            const arg = Object.keys(params).length ? params : undefined;

            dispatch(legalDocumentsAsync(arg));
        }
    };

    const handleDownload = async (documentUrl: string | string[], fileName: string) => {
        if (!documentUrl) {
            Alert.alert(t('common.error') || 'Error', t('legal.no_document') || 'No document available');
            return;
        }

        // If array, download the first document
        const firstDoc = Array.isArray(documentUrl) ? documentUrl[0] : documentUrl;
        if (!firstDoc) return;

        try {
            const fullUrl = getDocumentUrl(firstDoc);
            await downloadAndOpenDocument(fullUrl, fileName || 'document.pdf');
        } catch (error) {
            Alert.alert(
                t('common.error') || 'Error',
                t('legal.download_failed') || 'Failed to download document'
            );
        }
    };

    return (
        <LinearGradient
            colors={[...themeColors.gradient.slice(0, 3), themeColors.background]}
            locations={[0, 0.118, 0.2774, 0.4327, 0.5913]}
            style={styles.container}>
            <SafeAreaView style={styles.safeArea}>
                {/* Header — B-037 */}
                <AuthHeader
                    onBackPress={() => navigation.goBack()}
                    containerStyle={[styles.headerContainerStyle, { paddingTop: isIOS ? 0 : 20 }]}
                    backButtonStyle={{ marginBottom: 0 }}
                    titleStyle={{ marginBottom: 0 }}
                    backButtonIconStyle={{ tintColor: themeColors.background }}
                />

                {/* Content */}
                <ScrollView style={styles.scrollView} contentContainerStyle={styles.scrollContent}>
                    {/* Icon */}
                    <View style={styles.iconContainer}>
                        <Image source={ICONS.LEGAL_SCREEN_ICON} style={styles.legalScreenIcon} />
                    </View>

                    {/* Title */}
                    <Text style={styles.title}>{t('legal.title')}</Text>

                    {/* Buttons Row — B-036 / B-041 */}
                    <View style={styles.buttonsRow}>
                        {shouldAllowShare && (
                            <PrimaryButton
                                icon={<Entypo name="plus" size={20} color={themeColors.textPrimary} />}
                                title={t('legal.add_legal_document')}
                                onPress={handleAddDocument}
                                buttonStyle={styles.whiteButton}
                                textStyle={{ color: themeColors.textPrimary }}
                            />
                        )}

                        {documents.length > 0 && shouldAllowShare && (
                            <PrimaryButton
                                icon={<Fontisto name="share-a" size={13} color={colors.black} />}
                                title={t('legal.share')}
                                onPress={() => handleShare()}
                                buttonStyle={[styles.whiteButton, { backgroundColor: themeColors?.isDark ? getColorWithOpacity(themeColors.primary, 0.8) : getColorWithOpacity(themeColors.primary, 0.5)}]}
                                textStyle={{ color: colors.black }}
                            />
                        )}
                    </View>

                    {/* Documents List */}
                    <View style={styles.documentsList}>
                        {legal_documents_status === ASYNC_STATUS.LOADING ? (
                            <ActivityIndicator size="large" color={themeColors.primary} style={styles.loadingIndicator} />
                        ) : documents.length > 0 ? (
                            documents.map((document: any) => (
                                <TouchableOpacity key={document.id} style={styles.documentCard} onPress={() => handleViewPress(document)} activeOpacity={0.7}>
                                    <View style={styles.cardHeader}>
                                        <Text style={[styles.documentTitle, { textAlign: 'left' }]}>{document.name}</Text>
                                        <View style={styles.badgeContainer}>
                                            <View style={[styles.typeBadge, { backgroundColor: getColorWithOpacity(themeColors.primary, 0.5) }]}>
                                                <Text style={[styles.typeBadgeText, { textAlign: 'left' }]}>
                                                    {document.typeother || get_dropdown_options_data?.find((option: any) => String(option.value) === String(document.type))?.label || '-'}
                                                </Text>
                                            </View>
                                            <View style={styles.actionsRow}>
                                                <TouchableOpacity
                                                    style={styles.iconButton}
                                                    onPress={() => navigation.navigate('EditHistoryList', { entityType: 'LegalDocument', entityId: document.id, title: t('edit_history.title') })}>
                                                    <MaterialIcons name="history" size={22} color={themeColors.secondary} />
                                                </TouchableOpacity>
                                                {shouldAllowShare && (
                                                    <TouchableOpacity
                                                        style={styles.iconButton}
                                                        onPress={() => handleShare(document.id)}>
                                                        <Image source={ICONS.SHARE_PRIMARY_ICON} style={[styles.actionIcon, { tintColor: themeColors.secondary }]} />
                                                    </TouchableOpacity>
                                                )}
                                                {getItemWriteAccess(document) && (
                                                    <TouchableOpacity
                                                        style={styles.iconButton}
                                                        onPress={() => handleEditDocument(document)}>
                                                        <Image source={ICONS.EDIT_ICON} style={[styles.actionIcon, { tintColor: themeColors.secondary }]} />
                                                    </TouchableOpacity>
                                                )}
                                                {shouldAllowShare && (
                                                    <TouchableOpacity
                                                        style={styles.iconButton}
                                                        onPress={() => handleDeleteDocument(document)}>
                                                        <Image source={ICONS.DELETE_ICON} style={[styles.actionIcon, { tintColor: themeColors.secondary }]} />
                                                    </TouchableOpacity>
                                                )}
                                            </View>
                                        </View>
                                    </View>
                                    <View style={styles.cardBody}>
                                        <View style={styles.datesRow}>
                                            <View style={styles.dateItem}>
                                                <Text style={[styles.dateLabel, { textAlign: 'left' }]}>{t('legal.effective_date')}</Text>
                                                <Text style={[styles.dateValue, { textAlign: 'left' }]}>
                                                    {formatDate(document.effectivedate || document.effectiveDate)}
                                                </Text>
                                            </View>
                                            <View style={styles.dateItem}>
                                                <Text style={[styles.dateLabel, { textAlign: 'left' }]}>{t('legal.expire_date')}</Text>
                                                <Text style={[styles.dateValue, { textAlign: 'left' }]}>
                                                    {formatDate(document.enddate || document.endDate)}
                                                </Text>
                                            </View>
                                        </View>
                                        {/* {(document.documenturl || document.documentUrl) && (() => {
                                            const docUrls = document.documenturl || document.documentUrl;
                                            const docCount = Array.isArray(docUrls) ? docUrls.length : 1;
                                            return (
                                                <View style={styles.fileRow}>
                                                    <Text style={[styles.fileName, { textAlign: 'left' }]} numberOfLines={1}>
                                                        {document.name}{docCount > 1 ? ` (${docCount} ${t('common.files') || 'files'})` : ''}
                                                    </Text>
                                                    <TouchableOpacity
                                                        onPress={() => handleDownload(
                                                            docUrls,
                                                            `${document.name}.pdf`
                                                        )}>
                                                        <Ionicons name="download-outline" size={20} color={themeColors.secondary} />
                                                    </TouchableOpacity>
                                                </View>
                                            );
                                        })()} */}
                                        {/* Notes — B-040 */}
                                        {!!(document.notes) && (
                                            <Text style={[styles.cardNotes, { textAlign: 'left' }]} numberOfLines={3}>
                                                {document.notes}
                                            </Text>
                                        )}
                                    </View>
                                </TouchableOpacity>
                            ))
                        ) : (
                            <View style={styles.emptyStateContainer}>
                                <View style={styles.emptyIconCircle}>
                                    <AntDesign name="exclamation" size={32} color={colors.gray || '#888'} />
                                </View>
                                <Text style={styles.emptyText}>
                                    {t('legal.no_documents') || 'No Legal Added Yet. Click "+ Add Legal Document" To Get Started.'}
                                </Text>
                            </View>
                        )}
                    </View>
                    {showSharedWithMe && (
                        <SharedWithMeSection
                            thunkAction={getLegalDocumentsSharedWithMeAsync}
                            renderItem={renderSharedLegalItem}
                        />
                    )}
                </ScrollView>
            </SafeAreaView>

            {/* Modals */}
            <ShareModal
                visible={shareModalVisible}
                onClose={() => setShareModalVisible(false)}
                onShare={handleShareDocument}
                title={t('legal.share_legal')}
                loading={sharingLoading}
                resourceType={shareContext.resourceType}
                resourceId={shareContext.resourceId}
                businessId={currentBusinessId}
            />

            <DeleteConfirmModal
                visible={deleteModalVisible}
                onClose={() => setDeleteModalVisible(false)}
                onConfirm={confirmDelete}
                title={t('legal.delete_confirm')}
                isLoading={delete_legal_document_status === ASYNC_STATUS.LOADING}
            />

            <ViewDetailModal
                visible={viewModalVisible}
                onClose={() => {
                    setViewModalVisible(false);
                    setViewModalData(null);
                }}
                data={viewModalData}
            />
            {GateModal}
        </LinearGradient>
    );
};

export default Legal;
