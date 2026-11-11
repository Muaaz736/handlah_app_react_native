import {
  Image,
  ScrollView,
  Text,
  View,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { RecordNotesView } from '../../../../../components/notes/RecordNotesView';
import { RECORD_NOTES_BUSINESS } from '../../../../../services/recordNotes';
import React, { useCallback, useMemo, useState } from 'react';
import {
  useNavigation,
  useFocusEffect,
  useRoute,
} from '@react-navigation/native';
import { useTranslation } from 'react-i18next';
import { useDispatch, useSelector } from 'react-redux';
import LinearGradient from 'react-native-linear-gradient';
import { SafeAreaView } from 'react-native-safe-area-context';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import { BusinessDetailsPageNavigationProp } from './BusinessDetailsPage.types';
import { AuthHeader } from '../../../../../components/common';
import colors from '../../../../../utils/colors';
import { ICONS } from '../../../../../utils/Images';
import { useUserRole } from '../../../../../hooks/useUserRole';
import { useSelectedBusiness } from '../../../../../hooks/useSelectedBusiness';
import { useSubscriptionGate } from '../../../../../hooks/useSubscriptionGate';
import { makeBusinessDetailsPageStyles } from './BusinessDetailsPage.styles';
import {
  deleteBusinessAsync,
  getBusinessByIdAsync,
  getBusinessesAsync,
} from '../../../../../redux/services/businessService';
import { ASYNC_STATUS } from '../../../../../config/constants';
import { getModuleWriteAccess, getEntityWriteAccess } from '../../../../../utils/accessLevel';
import { getDropdownOptionsAsync, countriesAsync, statesAsync } from '../../../../../redux/services/authService';
import { RoleTheme } from '../../../../../types/roleManager.types';

const BusinessDetailsPage: React.FC = () => {
  const navigation = useNavigation<BusinessDetailsPageNavigationProp>();
  const route = useRoute<any>();
  const { t } = useTranslation();
  const { themeColors } = useUserRole();
  const styles = useMemo(() => makeBusinessDetailsPageStyles(themeColors as RoleTheme), [themeColors]);

  const { selectedBusiness, selectedBusinessId } = useSelectedBusiness();
  const { checkSubscription, GateModal } = useSubscriptionGate();
  const dispatch = useDispatch();

  const { from, accessLevel, accessType } = route.params || {};
  const isFromEmergencyAccess = from === 'emergency_access';
  const writeAccess = getModuleWriteAccess({ isFromEmergencyAccess, accessType, accessLevel });
  const getItemWriteAccess = (item: any) =>
    getEntityWriteAccess({ isFromEmergencyAccess, accessType, moduleWriteAccess: writeAccess, entity: item });

  const { get_business_by_id_status, get_business_by_id_data } = useSelector(
    (state: any) => state.business_slice,
  );
  const isLoading = get_business_by_id_status === ASYNC_STATUS.LOADING;

  const { get_dropdown_options_data } = useSelector((state: any) => state.user_auth);

  const { countries_data, states_data } = useSelector((state: any) => state.user_auth);

  useFocusEffect(useCallback(() => {
    dispatch(getDropdownOptionsAsync('BusinessEntityType') as any);
    dispatch(countriesAsync() as any);
  }, [dispatch]));

  const buisinessDetails = isFromEmergencyAccess
    ? get_business_by_id_data
    : selectedBusiness;

  // Get delete status from Redux
  const deleteStatus = useSelector(
    (state: any) => state.business_slice?.delete_business_status,
  );
  const isDeleting = deleteStatus === ASYNC_STATUS.LOADING;

  const { currentConnectionUserId, emergencyConnectionBusinessId } =
    useSelector((state: any) => state.connection_slice);

  // Refetch businesses when screen comes into focus (after edit)
  useFocusEffect(
    React.useCallback(() => {
      if (
        isFromEmergencyAccess &&
        currentConnectionUserId &&
        emergencyConnectionBusinessId
      ) {
        dispatch(
          getBusinessByIdAsync({
            userId: currentConnectionUserId,
            id: emergencyConnectionBusinessId,
          }) as any,
        );
      } else {
        dispatch(getBusinessesAsync() as any);
      }
    }, [
      dispatch,
      isFromEmergencyAccess,
      currentConnectionUserId,
      emergencyConnectionBusinessId,
      selectedBusinessId,
    ]),
  );

  React.useEffect(() => {
    const countryId = buisinessDetails?.country?.toString();
    if (countryId) {
      dispatch(statesAsync(countryId) as any);
    }
  }, [dispatch, buisinessDetails?.country]);

  const resolveCountryName = (id: any): string => {
    if (!id) return '-';
    const match = countries_data?.find((c: any) => String(c.id) === String(id));
    return match?.countryname ?? String(id);
  };

  const resolveStateName = (id: any): string => {
    if (!id) return '-';
    const match = states_data?.find((s: any) => String(s.id) === String(id));
    return match?.description ?? String(id);
  };

  const handleEdit = (): void => {
    if (!getItemWriteAccess(buisinessDetails)) {
      return;
    }
    if (!selectedBusiness) {
      Alert.alert(t('common.error'), t('business.no_business_to_edit'));
      return;
    }

    // Navigate to edit screen with business data
    checkSubscription(() => navigation.navigate('AddBusinessDetails' as any, {
      businessDetails: {
        businessName: selectedBusiness.businessname,
        description: selectedBusiness.description,
        ein: selectedBusiness.ein,
        country: selectedBusiness.country,
        countryname: selectedBusiness.countryname || selectedBusiness.countryName,
        stateOfFormation: selectedBusiness.stateofformation,
        statelabel: selectedBusiness.statelabel || selectedBusiness.stateLabel,
        entityType: selectedBusiness.entitytype,
        registeredAgentName: selectedBusiness.registeredagentname,
        registeredAgentAddress: selectedBusiness.registeredagentaddress,
        registeredAgentPhone: selectedBusiness.registeredagentphone,
        principalBusinessAddress: selectedBusiness.principalbusinessaddress,
      },
      businessId: selectedBusiness.id,
      isEdit: true,
    }), 'business');
  };

  const handleDelete = (): void => {
    if (!getItemWriteAccess(buisinessDetails)) {
      return;
    }
    if (!selectedBusiness) {
      Alert.alert(t('common.error'), t('business.no_business_to_delete'));
      return;
    }

    Alert.alert(
      t('business.delete_business'),
      t('business.delete_business_confirm', { name: selectedBusiness.businessname }),
      [
        {
          text: t('common.cancel'),
          style: 'cancel',
        },
        {
          text: t('common.delete'),
          style: 'destructive',
          onPress: async () => {
            try {
              await dispatch(deleteBusinessAsync(selectedBusiness.id) as any);
              // Navigate back after successful deletion
              navigation.goBack();
            } catch (error) {
              console.error('Error deleting business:', error);
            }
          },
        },
      ],
    );
  };

  if (isLoading) {
    return (
      <LinearGradient
        colors={themeColors?.isDark ? [...themeColors.gradient.slice(0, 3), themeColors.background] : themeColors.gradient}
        locations={[0, 0.118, 0.2774, 0.4327, 0.5913]}
        style={styles.gradientContainer}
      >
        <SafeAreaView style={styles.safeArea}>
          <AuthHeader
            onBackPress={() => navigation.goBack()}
            containerStyle={styles.headerContainerStyle}
            backButtonIconStyle={{ tintColor: colors.white }}
            backButtonStyle={{ marginBottom: 0 }}
          />
          <View style={[styles.detailsCard, { margin: 16 }]}>
            <ActivityIndicator size="large" color={themeColors.primary} />
          </View>
        </SafeAreaView>
      </LinearGradient>
    );
  }

  return (
    <LinearGradient
      colors={themeColors?.isDark ? [...themeColors.gradient.slice(0, 3), themeColors.background] : themeColors.gradient}
      locations={[0, 0.118, 0.2774, 0.4327, 0.5913]}
      style={styles.gradientContainer}
    >
      <SafeAreaView style={styles.safeArea}>
        <AuthHeader
          onBackPress={() => navigation.goBack()}
          containerStyle={styles.headerContainerStyle}
          backButtonIconStyle={{ tintColor: themeColors.background }}
          backButtonStyle={{ marginBottom: 0 }}
        />

        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          {/* Header Section */}
          <View style={styles.headerSection}>
            <View style={styles.businessAvatar}>
              <Text style={styles.avatarText}>
                {buisinessDetails?.businessname?.charAt(0).toUpperCase() || 'B'}
              </Text>
            </View>
            <Text style={styles.businessName}>
              {buisinessDetails?.businessname || 'Business Name'}
            </Text>
          </View>

          {/* Details Card */}
          <View style={styles.detailsCard}>
            {/* Business Name and Actions */}
            <View style={styles.cardHeader}>
              <Text style={styles.cardTitle}>
                {buisinessDetails?.businessname || 'Business Name'}
              </Text>
              <View style={styles.actionButtons}>
                <TouchableOpacity
                  style={styles.actionButton}
                  onPress={() =>
                    selectedBusiness?.id &&
                    (navigation as any).navigate('EditHistoryList', {
                      entityType: 'Business',
                      entityId: selectedBusiness.id,
                      title: t('edit_history.title'),
                    })
                  }
                  disabled={isDeleting || !selectedBusiness?.id}
                  activeOpacity={0.7}
                >
                  <MaterialIcons
                    name="history"
                    size={28}
                    color={themeColors.primary}
                  />
                </TouchableOpacity>
                {getItemWriteAccess(buisinessDetails) && (
                  <>
                    <TouchableOpacity
                      style={styles.actionButton}
                      onPress={handleEdit}
                      disabled={isDeleting}
                      activeOpacity={0.7}
                    >
                      <Image
                        source={ICONS.EDIT_ICON}
                        style={[
                          styles.actionIcon,
                          { tintColor: themeColors.primary },
                          isDeleting && styles.disabledIcon,
                        ]}
                      />
                    </TouchableOpacity>
                    <TouchableOpacity
                      style={styles.actionButton}
                      onPress={handleDelete}
                      disabled={isDeleting}
                      activeOpacity={0.7}
                    >
                      <Image
                        source={ICONS.DELETE_ICON}
                        style={[
                          styles.actionIcon,
                          { tintColor: themeColors.primary },
                          isDeleting && styles.disabledIcon,
                        ]}
                      />
                    </TouchableOpacity>
                  </>
                )}
              </View>
            </View>

            {/* Description */}
            <Text style={styles.description}>
              {buisinessDetails?.description || '-'}
            </Text>

            {/* Information Grid */}
            <View style={styles.infoGrid}>
              {/* Row 1: EIN & Country */}
              <View style={styles.infoRow}>
                <View style={styles.infoItem}>
                  <Text style={styles.infoLabel}>
                    {t('business.business_details.ein')}
                  </Text>
                  <Text style={styles.infoValue}>
                    {buisinessDetails?.ein || '-'}
                  </Text>
                </View>
                <View style={styles.infoItem}>
                  <Text style={styles.infoLabel}>
                    {t('business.add_business_details.country')}
                  </Text>
                  <Text style={styles.infoValue}>
                    {buisinessDetails?.countryname || resolveCountryName(buisinessDetails?.country)}
                  </Text>
                </View>
              </View>

              {/* Row: State of Formation */}
              <View style={styles.infoRow}>
                <View style={styles.infoItem}>
                  <Text style={styles.infoLabel}>
                    {t('business.business_details.state_of_information')}
                  </Text>
                  <Text style={styles.infoValue}>
                    {buisinessDetails?.statelabel || resolveStateName(buisinessDetails?.stateofformation)}
                  </Text>
                </View>
              </View>

              {/* Row 2: Entity Type & Agent Name */}
              <View style={styles.infoRow}>
                <View style={styles.infoItem}>
                  <Text style={styles.infoLabel}>
                    {t('business.business_details.entity_type')}
                  </Text>
                  <Text style={styles.infoValue}>
                    {get_dropdown_options_data?.find((option: any) => String(option.value) === String(buisinessDetails?.entitytype))?.label || '-'}
                  </Text>
                </View>
                <View style={styles.infoItem}>
                  <Text style={styles.infoLabel}>
                    {t('business.business_details.registered_agent_name')}
                  </Text>
                  <Text style={styles.infoValue}>
                    {buisinessDetails?.registeredagentname || '-'}
                  </Text>
                </View>
              </View>

              {/* Row 3: Agent Address & Agent Phone */}
              <View style={styles.infoRow}>
                <View style={styles.infoItem}>
                  <Text style={styles.infoLabel}>
                    {t('business.business_details.registered_agent_address')}
                  </Text>
                  <Text style={styles.infoValue}>
                    {buisinessDetails?.registeredagentaddress || '-'}
                  </Text>
                </View>
                <View style={styles.infoItem}>
                  <Text style={styles.infoLabel}>
                    {t('business.business_details.registered_agent_phone')}
                  </Text>
                  <Text style={styles.infoValue}>
                    {buisinessDetails?.registeredagentphone || '-'}
                  </Text>
                </View>
              </View>

              {/* Row 4: Principal Business Address */}
              <View style={styles.fullWidthInfo}>
                <Text style={styles.infoLabel}>
                  {t('business.business_details.principal_business_address')}
                </Text>
                <Text style={styles.infoValue}>
                  {buisinessDetails?.principalbusinessaddress || '-'}
                </Text>
              </View>
            </View>
            {!!buisinessDetails?.id && (
              <View style={{ marginTop: 12 }}>
                <RecordNotesView moduleKey={RECORD_NOTES_BUSINESS} recordId={Number(buisinessDetails.id)} editable={!isFromEmergencyAccess} />
              </View>
            )}
          </View>
        </ScrollView>
      </SafeAreaView>
      {GateModal}
    </LinearGradient>
  );
};

export default BusinessDetailsPage;

// Styles are in BusinessDetailsPage.styles.ts
