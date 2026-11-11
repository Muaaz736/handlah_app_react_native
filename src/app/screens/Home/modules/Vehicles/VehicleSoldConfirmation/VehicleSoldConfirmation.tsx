import {
    ScrollView,
    Text,
    View,
    KeyboardAvoidingView
} from 'react-native';
import React, { useState, useCallback, useEffect, useMemo, useRef } from 'react';
import { SafeAreaView } from 'react-native-safe-area-context';
import { makeCommonStyles } from '../Vehicles.styles';
import { makeVehicleSoldConfirmationStyles, makeDropdownStyles } from './VehicleSoldConfirmation.styles';

import {
    AuthHeader,
    CustomInput,
    PrimaryButton
} from '../../../../../../components/common';
import { useNavigation, useRoute, RouteProp, CommonActions, StackActions } from '@react-navigation/native';
import { useDispatch, useSelector } from 'react-redux';
import { useTranslation } from 'react-i18next';
import FONTS from '../../../../../../utils/fonts';
import { useUserRole } from '../../../../../../hooks/useUserRole';
import { isIOS } from '../../../../../../utils/helpers';
import { RouteParams } from './VehicleSoldConfirmation.types';
import { getBusinessesByUsernameAsync, updateVehicleSaleTransferAsync } from '../../../../../../redux/services/assetsService';
import { resetGetBusinessesByUsernameData, resetUpdateVehicleSaleTransferStatus } from '../../../../../../redux/slices/assetsSlice';
import { ASYNC_STATUS } from '../../../../../../config/constants';
import MixedMediaUploader from '../../../../../../components/common/MixedMediaUploader';
import { BuyerItemsPicker, useBuyerItems } from '../../../../../../components/vehicles/BuyerItemsPicker';
import { AppDispatch } from '../../../../../../types/store.types';
import { RoleTheme } from '../../../../../../types/roleManager.types';


interface Business {
    id: number;
    businessname: string;
    description?: string;
}

const VehicleSoldConfirmation = (): React.ReactElement => {
    const navigation = useNavigation();
    const route = useRoute<RouteProp<{ params: RouteParams }, 'params'>>();
    const { t } = useTranslation();
    const { themeColors, isBusinessRole } = useUserRole();
    const styles = useMemo(
        () => ({
            ...makeCommonStyles(themeColors as RoleTheme),
            ...makeVehicleSoldConfirmationStyles(themeColors as RoleTheme),
            ...makeDropdownStyles(themeColors as RoleTheme),
        }),
        [themeColors]
    );
    const dispatch = useDispatch<AppDispatch>();

    const { soldToUsername, date, vehicleId, transferId, additionalcomments, attachmentids, resetOnBack } = (route?.params as RouteParams) || {};
    // What the buyer gets with the vehicle (as on the website). Only on the first send, not when re-saving documents.
    const isResave = !!(attachmentids && attachmentids.length > 0);
    const buyerItems = useBuyerItems(isResave ? undefined : vehicleId);
    const isBusinessUser = isBusinessRole();


    const [additionalComments, setAdditionalComments] = useState<string>(additionalcomments || '');

    const [ownershipDocumentIds, setOwnershipDocumentIds] = useState<string[]>(attachmentids || []);

    const [businessDropdownOpen, setBusinessDropdownOpen] = useState<boolean>(false);
    const [selectedBusiness, setSelectedBusiness] = useState<Business | null>(null);
    const fetchedUsername = useRef<string>('');

    const assetsState = useSelector((state: any) => state.assets_slice);
    const shareStatus = useMemo(() => assetsState?.update_vehicle_sale_transfer_status, [assetsState]);
    const businessesData: Business[] = useMemo(
        () => assetsState?.get_businesses_by_username_data ?? [],
        [assetsState],
    );
    const isBusinessesLoading = assetsState?.get_businesses_by_username_status === ASYNC_STATUS.LOADING;
    const isSubmitting = shareStatus === ASYNC_STATUS.LOADING;

    useEffect(() => {
        if (isBusinessUser && soldToUsername && fetchedUsername.current !== soldToUsername) {
            fetchedUsername.current = soldToUsername;
            dispatch(getBusinessesByUsernameAsync(soldToUsername));
        }
    }, [isBusinessUser, soldToUsername, dispatch]);

    useEffect(() => {
        if (shareStatus === ASYNC_STATUS.SUCCEEDED) {
            dispatch(resetUpdateVehicleSaleTransferStatus());
            dispatch(resetGetBusinessesByUsernameData());
            navigation.dispatch(
                CommonActions.reset({
                    index: 1,
                    routes: [
                        {
                            name: 'Dashboard'
                        },
                        {
                            name: 'Vehicles'
                        },
                    ]
                })
            );
        }
    }, [shareStatus, dispatch, navigation]);

    const handleShareWithNewOwner = useCallback((): void => {
        if (!transferId) return;

        const mergedIds = [...(attachmentids || []), ...ownershipDocumentIds];
        const uniqueIds = Array.from(new Set(mergedIds));

        dispatch(
            updateVehicleSaleTransferAsync({
                transferId,
                ownershipDocumentUrl: uniqueIds,
                additionalComments: additionalComments || undefined,
                isDraft: false,
                ...(isResave ? {} : { transferItems: buyerItems.toPayload() }),
            }),
        );
    }, [transferId, ownershipDocumentIds, attachmentids, additionalComments, dispatch, isResave, buyerItems]);


    const handleMediaChange = (ids: string[]) => {
        setOwnershipDocumentIds(ids);
    };

    const handleBackPress = useCallback(() => {
        if (resetOnBack) {
            navigation.dispatch(StackActions.pop(2));
        } else {
            navigation.goBack();
        }
    }, [dispatch, navigation, resetOnBack]);

    return (
        <View style={styles.container}>
            <SafeAreaView style={styles.safeArea}>
                <AuthHeader
                    title={t('vehicles.transfer_confirmation')}
                    onBackPress={handleBackPress}
                    containerStyle={{
                        paddingHorizontal: 16,
                        marginBottom: 0,
                        paddingTop: isIOS ? 0 : 20
                    }}
                    backButtonStyle={{ marginBottom: 0 }}
                    titleStyle={{
                        marginBottom: 0,
                        marginTop: 20,
                        textAlign: 'left'
                    }}
                />
                <View style={{ backgroundColor: '#ff7f00' + '20', marginTop: 20, paddingHorizontal: 8, borderRadius: 8, marginHorizontal: 12 }}>
                    {attachmentids && attachmentids.length > 0 && (
                        <Text style={{ color: '#ff7f00', lineHeight: 20 }}>
                            {t('vehicles.transfer_pending_notice', { username: soldToUsername })}
                        </Text>
                    )}
                </View>
                <KeyboardAvoidingView
                    style={{ flex: 1 }}
                    behavior={isIOS ? 'padding' : 'height'}
                    keyboardVerticalOffset={isIOS ? 0 : 20}
                >
                    <ScrollView
                        style={styles.scrollView}
                        contentContainerStyle={styles.scrollContent}
                        showsVerticalScrollIndicator={false}
                        keyboardShouldPersistTaps="handled"
                    >
                        <View style={styles.formContainer}>
                            {/* Sold to confirmation text */}
                            <Text style={[styles.soldToText, { textAlign: 'left' }]}>
                                {t('vehicles.sold_to')}{' '}
                                <Text style={[styles.emailText, { color: themeColors.secondary }]}>
                                    {soldToUsername || ''}
                                </Text>
                            </Text>

                            {/* Transfer of Ownership Upload Section - Single MixedMediaUploader */}
                            <Text style={[styles.sectionLabel, { textAlign: 'left', marginBottom: 8 }]}>
                                {t('vehicles.transfer_of_ownership')}
                            </Text>

                            <MixedMediaUploader
                                mediaIds={ownershipDocumentIds}
                                onMediaChange={handleMediaChange}
                                label={t('vehicles.ownership_documents_or_photos')}
                                placeholder={t('vehicles.add_media') || 'Add Media'}
                                uploadType="box"
                                maxItems={5}
                                removable={true}
                                autoUpload={true}
                                onMediaSelect={() => { }}
                            />

                            {/* Shares history text */}
                            <Text style={[styles.historyText, { textAlign: 'left', marginTop: 16 }]}>
                                {t('vehicles.shares_history_text')}
                            </Text>

                            {/* Additional Notes */}
                            <View style={{ marginVertical: 12 }}>
                                <Text style={[styles.label, { textAlign: 'left' }]}>
                                    {t('vehicles.additional_notes')}
                                </Text>
                                <CustomInput
                                    placeholder={t('vehicles.additional_notes')}
                                    value={additionalComments}
                                    onChangeText={setAdditionalComments}
                                    containerStyle={styles.inputContainerNoMargin}
                                    multiline
                                    numberOfLines={3}
                                    inputStyle={{ textAlign: 'left', paddingTop: 8 }}
                                />
                            </View>

                            {!isResave && <BuyerItemsPicker state={buyerItems} />}

                            {/* Share with New Owner Button */}
                            <PrimaryButton
                                title={attachmentids && attachmentids.length > 0 ? t('common.save') : t('vehicles.confirm_transfer')}
                                onPress={handleShareWithNewOwner}
                                buttonStyle={[styles.shareButton, { backgroundColor: themeColors.primary }]}
                                loading={isSubmitting}
                                disabled={isSubmitting}
                            />
                        </View>
                    </ScrollView>
                </KeyboardAvoidingView>
            </SafeAreaView>
        </View>
    );
};


export default VehicleSoldConfirmation;
