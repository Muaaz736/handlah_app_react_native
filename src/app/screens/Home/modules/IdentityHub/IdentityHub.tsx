import { Image, Modal, ScrollView, Text, View, TouchableOpacity, Alert, ActivityIndicator, } from 'react-native';
import React, { useState, useEffect, useCallback, useRef, useMemo } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useTutorialContext } from '../../../../../tutorial/TutorialContext';
import { useTranslation } from 'react-i18next';
import {
  AuthHeader, PrimaryButton, ShareModal, RemoteImage, MixedMediaDisplayer, CustomScrollableTabs, DeleteConfirmModal, ProfileAvatar,
} from '../../../../../components/common';
import {
  useNavigation, useRoute, useFocusEffect,
} from '@react-navigation/native';
import colors, { getColorWithOpacity } from '../../../../../utils/colors';
import { ICONS } from '../../../../../utils/Images';
import Entypo from 'react-native-vector-icons/Entypo';
import Fontisto from 'react-native-vector-icons/Fontisto';
import Feather from 'react-native-vector-icons/Feather';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import LinearGradient from 'react-native-linear-gradient';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useUserRole } from '../../../../../hooks/useUserRole';
import { useSubscriptionGate } from '../../../../../hooks/useSubscriptionGate';
import { isIOS, isOtherSelected, formatDate } from '../../../../../utils/helpers';
import { useDispatch, useSelector } from 'react-redux';
import {
  identityHubAsync, getDropdownOptionsAsync, deletePassportAsync, deleteDriverLicenseAsync, deleteLicenseAsync,
} from '../../../../../redux/services/authService';
import { ASYNC_STATUS } from '../../../../../config/constants';
import {
  IdentityHubMainNavigationProp, SharedConnection,
} from './identityHub.types';
import { resetShareSyncStatus } from '../../../../../redux/slices/sharingSlice';
import { sharingSyncService, getSharedByUsers } from '../../../../../redux/services/sharingService';
import {
  getModuleWriteAccess, getEntityWriteAccess,
} from '../../../../../utils/accessLevel';
import { AppDispatch } from '../../../../../types/store.types';
import { makeCommonStyles, makeIdentityHubStyles, makeIdentityHubTutorialStyles, makeAddModalStyles } from './IdentityHub.styles';
import { RoleTheme } from '../../../../../types/roleManager.types';
import { darkenColor } from '../../../../../utils/roleManager';
import { LinkedRecordsButton } from '../../../../../components/recordLinks/LinkedRecordsButton';
import CopyableText from '../../../../../components/common/CopyableText';

const IdentityHub: React.FC = () => {
  const navigation = useNavigation<IdentityHubMainNavigationProp>();
  const { t, i18n } = useTranslation();
  const isRTL = i18n.language === 'ar';
  const { themeColors, isBusinessRole } = useUserRole();
  const commonStyles = useMemo(() => makeCommonStyles(themeColors as RoleTheme), [themeColors]);
  const styles = useMemo(() => makeIdentityHubStyles(themeColors as RoleTheme), [themeColors]);
  const identityHubTutorialStyles = useMemo(() => makeIdentityHubTutorialStyles(themeColors as RoleTheme), [themeColors]);
  const addModalStyles = useMemo(() => makeAddModalStyles(themeColors as RoleTheme), [themeColors]);
  const { checkSubscription, GateModal } = useSubscriptionGate();
  const dispatch = useDispatch<AppDispatch>();
  const route = useRoute<any>();

  const { step: tutorialStep, nextStep, setSpotlightRect, setSpotlightAction } = useTutorialContext();
  const addButtonRef = useRef<View>(null);

  useEffect(() => {
    if (tutorialStep === 'spotlight_add_button') {
      const t = setTimeout(() => {
        addButtonRef.current?.measureInWindow((x, y, w, h) => {
          if (w > 0 && h > 0) {
            setSpotlightRect({ x, y, width: w, height: h });
          }
        });
        setSpotlightAction(null);
      }, 350);
      return () => clearTimeout(t);
    }
    return undefined;
  }, [tutorialStep]);
  // End tutorial

  const {
    from,
    connectionTabSource,
    sharedWithUserId,
    ownerId,
    accessLevel,
    accessType,
    openEntityId,
    openEntityType,
  } = route.params || {};
  const isFromEmergencyAccess = from === 'emergency_access';

  const scrollRef = useRef<ScrollView>(null);
  const passportSectionRef = useRef<View>(null);
  const driverLicenseSectionRef = useRef<View>(null);
  const licenseSectionRef = useRef<View>(null);
  const autoOpenedEntityRef = useRef(false);
  const [highlightedSection, setHighlightedSection] = useState<
    'passport' | 'driver_license' | 'license_certification' | null
  >(null);

  const [selectedSharedUser, setSelectedSharedUser] = useState<any>(null);
  const selectedSharedUserRef = useRef<any>(null);

  const writeAccess = getModuleWriteAccess({
    isFromEmergencyAccess,
    accessType: selectedSharedUser ? selectedSharedUser.accesstype : accessType,
    accessLevel: selectedSharedUser ? selectedSharedUser.accesslevel : accessLevel,
  });

  const getItemWriteAccess = (item: any) =>
    getEntityWriteAccess({
      isFromEmergencyAccess,
      accessType: selectedSharedUser ? selectedSharedUser.accesstype : accessType,
      moduleWriteAccess: writeAccess,
      entity: item,
    });

  const shouldAllowShare = !isFromEmergencyAccess && !accessLevel && !selectedSharedUser;

  const getConnectionTabQueryParams = () => {
    if (connectionTabSource === 'yours' && sharedWithUserId) {
      return { sharedWithUserId };
    }
    if (connectionTabSource === 'shared_with_you' && ownerId) {
      return { ownerId };
    }
    return {};
  };

  const [sharedUsers, setSharedUsers] = useState<any[]>([]);
  const [shareModalVisible, setShareModalVisible] = useState<boolean>(false);
  const [showAddModal, setShowAddModal] = useState<boolean>(false);
  const [tutorialEntryKey, setTutorialEntryKey] = useState<string>('identity_hub.passport');
  const [currentLicenseIndex, setCurrentLicenseIndex] = useState<number>(0);
  const [currentPassportIndex, setCurrentPassportIndex] = useState<number>(0);
  const [currentDriverLicenseIndex, setCurrentDriverLicenseIndex] =
    useState<number>(0);
  const [shareContext, setShareContext] = useState<{
    resourceType: string;
    resourceId?: string | number;
  }>({ resourceType: 'identityhub' });

  const [deleteModalConfig, setDeleteModalConfig] = useState<{
    visible: boolean;
    title: string;
    message: string;
    onConfirm: () => void;
  }>({ visible: false, title: '', message: '', onConfirm: () => { } });

  const confirmDelete = (title: string, message: string, onConfirm: () => void) => {
    setDeleteModalConfig({ visible: true, title, message, onConfirm });
  };

  const handleDeletePassport = (id: number) => {
    confirmDelete(
      t('identity_hub.delete_passport') || 'Delete Passport',
      t('identity_hub.delete_passport_confirm') || 'Are you sure you want to delete this passport?',
      async () => {
        setDeleteModalConfig(prev => ({ ...prev, visible: false }));
        await dispatch(deletePassportAsync(id)).unwrap();
        dispatch(identityHubAsync({ ...getConnectionTabQueryParams() }));
        if (currentPassportIndex >= passportsData.length - 1) {
          setCurrentPassportIndex(Math.max(0, passportsData.length - 2));
        }
      },
    );
  };

  const handleDeleteDriverLicense = (id: number) => {
    confirmDelete(
      t('identity_hub.delete_driver_license') || 'Delete Driver License',
      t('identity_hub.delete_driver_license_confirm') || 'Are you sure you want to delete this driver license?',
      async () => {
        setDeleteModalConfig(prev => ({ ...prev, visible: false }));
        await dispatch(deleteDriverLicenseAsync(id)).unwrap();
        dispatch(identityHubAsync({ ...getConnectionTabQueryParams() }));
        if (currentDriverLicenseIndex >= driverLicensesData.length - 1) {
          setCurrentDriverLicenseIndex(Math.max(0, driverLicensesData.length - 2));
        }
      },
    );
  };

  const handleDeleteLicense = (id: number) => {
    confirmDelete(
      t('identity_hub.delete_license') || 'Delete License/Certification',
      t('identity_hub.delete_license_confirm') || 'Are you sure you want to delete this license/certification?',
      async () => {
        setDeleteModalConfig(prev => ({ ...prev, visible: false }));
        await dispatch(deleteLicenseAsync(id)).unwrap();
        dispatch(identityHubAsync({ ...getConnectionTabQueryParams() }));
        if (currentLicenseIndex >= licensesData.length - 1) {
          setCurrentLicenseIndex(Math.max(0, licensesData.length - 2));
        }
      },
    );
  };

  const { identity_hub_status, identity_hub_data } = useSelector(
    (state: any) => state.user_auth,
  );
  const { share_sync_status } = useSelector(
    (state: any) => state.sharing_slice,
  );
  const { currentConnectionUserId } = useSelector(
    (state: any) => state.connection_slice,
  );
  const { selectedBusinessId } = useSelector(
    (state: any) => state.business_slice,
  );
  const isLoading = identity_hub_status === ASYNC_STATUS.LOADING;
  const sharingLoading = share_sync_status === ASYNC_STATUS.LOADING;
  const currentBusinessId = isBusinessRole() ? selectedBusinessId : undefined;

  const [classOptions, setClassOptions] = useState<any[]>([]);
  const [certTypeOptions, setCertTypeOptions] = useState<any[]>([]);
  const [passportTypeOptions, setPassportTypeOptions] = useState<any[]>([]);

  useFocusEffect(
    useCallback(() => {
      dispatch(getDropdownOptionsAsync('DriverLicenseClass')).then(
        (action: any) => {
          const raw = action?.payload?.options || [];
          const formatted = raw.map((o: any) => ({
            label: o.label,
            value: String(o.id),
          }));
          setClassOptions(formatted);
        },
      );
      dispatch(getDropdownOptionsAsync('LicenseCertificationType')).then(
        (action: any) => {
          const raw = action?.payload?.options || [];
          const formatted = raw.map((o: any) => ({
            label: o.label,
            value: String(o.id),
          }));
          setCertTypeOptions(formatted);
        },
      );
      dispatch(getDropdownOptionsAsync('PassportType')).then((action: any) => {
        const raw = action?.payload?.options || [];
        const formatted = raw.map((o: any) => ({ label: o.label, value: String(o.id) }));
        setPassportTypeOptions(formatted);
      });
      if (!accessLevel && !isFromEmergencyAccess) {
        dispatch(getSharedByUsers({ module: 'identityhub' })).then((action: any) => {
          const users = action?.payload?.users || [];
          setSharedUsers(users);
        });
        if (selectedSharedUserRef.current) {
          dispatch(identityHubAsync({ ownerId: selectedSharedUserRef.current.ownerid }));
        }
      }
    }, [dispatch]),
  );

  const resolveDriverLicenseClass = (classValue: any): string => {
    if (!classValue && classValue !== 0) return '-';
    const match = classOptions.find(
      (opt: any) => String(opt.value) === String(classValue),
    );
    return match?.label || '-';
  };

  const resolveLicenseCertType = (typeValue: any): string => {
    if (!typeValue && typeValue !== 0) return '-';
    const match = certTypeOptions.find(
      (opt: any) => String(opt.value) === String(typeValue),
    );
    return match?.label || '-';
  };

  const resolvePassportType = (typeValue: any): string => {
    if (!typeValue && typeValue !== 0) return '-';
    const match = passportTypeOptions.find(
      (opt: any) => String(opt.value) === String(typeValue),
    );
    return match?.label || '-';
  };

  const isBusiness = isBusinessRole();

  useEffect(() => {
    if (isBusiness && !selectedBusinessId && !isFromEmergencyAccess) {
      return;
    }

    if (isFromEmergencyAccess && currentConnectionUserId) {
      dispatch(
        identityHubAsync({
          userId: currentConnectionUserId,
          ...getConnectionTabQueryParams(),
        }),
      );
    } else {
      dispatch(identityHubAsync({ ...getConnectionTabQueryParams() }));
    }
  }, [dispatch, isBusiness, selectedBusinessId]);

  const noBusinessInBusinessMode =
    isBusiness && !selectedBusinessId && !isFromEmergencyAccess;

  const personalInfo = noBusinessInBusinessMode
    ? {}
    : identity_hub_data?.personalinfo || {};
  const passportsData = noBusinessInBusinessMode
    ? []
    : Array.isArray(identity_hub_data?.passports)
      ? identity_hub_data.passports
      : [];
  const driverLicensesData = noBusinessInBusinessMode
    ? []
    : Array.isArray(identity_hub_data?.driverlicenses)
      ? identity_hub_data.driverlicenses
      : [];
  const licensesData = noBusinessInBusinessMode
    ? []
    : Array.isArray(identity_hub_data?.licensescertifications)
      ? identity_hub_data.licensescertifications
      : [];

  const currentPassport = passportsData[currentPassportIndex] || {};
  const currentDriverLicense =
    driverLicensesData[currentDriverLicenseIndex] || {};
  const currentLicense = licensesData[currentLicenseIndex] || {};

  useEffect(() => {
    if (!openEntityId || autoOpenedEntityRef.current) return;
    if (identity_hub_status !== ASYNC_STATUS.SUCCEEDED) return;

    const type = String(openEntityType || '').toLowerCase().replace(/[\s_-]/g, '');
    const scrollToSection = (sectionRef: React.RefObject<View | null>) => {
      const attempt = () => {
        if (!sectionRef.current || !scrollRef.current) return;
        sectionRef.current.measureLayout(
          scrollRef.current as any,
          (_x: number, y: number) => {
            scrollRef.current?.scrollTo({ y: Math.max(y - 16, 0), animated: true });
          },
          () => { },
        );
      };
      [0, 150, 400, 800, 1400].forEach(delay => setTimeout(attempt, delay));
    };

    if (type === 'driverlicense') {
      const idx = driverLicensesData.findIndex((r: any) => Number(r.id) === Number(openEntityId));
      if (idx !== -1) {
        autoOpenedEntityRef.current = true;
        setCurrentDriverLicenseIndex(idx);
        setHighlightedSection('driver_license');
        scrollToSection(driverLicenseSectionRef);
      }
    } else if (type === 'passport') {
      const idx = passportsData.findIndex((r: any) => Number(r.id) === Number(openEntityId));
      if (idx !== -1) {
        autoOpenedEntityRef.current = true;
        setCurrentPassportIndex(idx);
        setHighlightedSection('passport');
        scrollToSection(passportSectionRef);
      }
    } else if (type.includes('license')) {
      const idx = licensesData.findIndex((r: any) => Number(r.id) === Number(openEntityId));
      if (idx !== -1) {
        autoOpenedEntityRef.current = true;
        setCurrentLicenseIndex(idx);
        setHighlightedSection('license_certification');
        scrollToSection(licenseSectionRef);
      }
    }
  }, [openEntityId, openEntityType, identity_hub_status, driverLicensesData, passportsData, licensesData]);

  // Clear the highlight a few seconds after it's shown
  useEffect(() => {
    if (!highlightedSection) return;
    const timer = setTimeout(() => setHighlightedSection(null), 3000);
    return () => clearTimeout(timer);
  }, [highlightedSection]);

  // Fallback country cache for licenses saved before the backend returned
  // `jurisdictioncountry`; the render below prefers the backend field.
  const [licenseCountry, setLicenseCountry] = useState<string>('');
  useEffect(() => {
    const id = currentLicense?.id;
    if (!id) {
      setLicenseCountry('');
      return;
    }
    AsyncStorage.getItem(`license_country_${id}`).then(stored =>
      setLicenseCountry(stored || ''),
    );
  }, [currentLicense?.id]);

  // State is also stored client-side (no backend field) by license id.
  const [licenseState, setLicenseState] = useState<string>('');
  useEffect(() => {
    const id = currentLicense?.id;
    if (!id) {
      setLicenseState('');
      return;
    }
    AsyncStorage.getItem(`license_state_${id}`).then(stored =>
      setLicenseState(stored || ''),
    );
  }, [currentLicense?.id]);

  // Prefer the backend-provided country; fall back to the client-side cache
  // for licenses saved before the backend returned this field.
  const [driverLicenseCountry, setDriverLicenseCountry] = useState<string>('');
  useEffect(() => {
    const id = currentDriverLicense?.id;
    if (!id) {
      setDriverLicenseCountry('');
      return;
    }
    if (currentDriverLicense?.countryname) {
      setDriverLicenseCountry(currentDriverLicense.countryname);
      return;
    }
    AsyncStorage.getItem(`driver_license_country_${id}`).then(stored =>
      setDriverLicenseCountry(stored || ''),
    );
  }, [currentDriverLicense?.id, currentDriverLicense?.countryname]);

  const handlePreviousPassport = () => {
    setCurrentPassportIndex(prev =>
      prev > 0 ? prev - 1 : passportsData.length - 1,
    );
  };
  const handleNextPassport = () => {
    setCurrentPassportIndex(prev =>
      prev < passportsData.length - 1 ? prev + 1 : 0,
    );
  };

  const handlePreviousDriverLicense = () => {
    setCurrentDriverLicenseIndex(prev =>
      prev > 0 ? prev - 1 : driverLicensesData.length - 1,
    );
  };
  const handleNextDriverLicense = () => {
    setCurrentDriverLicenseIndex(prev =>
      prev < driverLicensesData.length - 1 ? prev + 1 : 0,
    );
  };

  const handlePreviousLicense = () => {
    setCurrentLicenseIndex(prev =>
      prev > 0 ? prev - 1 : licensesData.length - 1,
    );
  };

  const handleNextLicense = () => {
    setCurrentLicenseIndex(prev =>
      prev < licensesData.length - 1 ? prev + 1 : 0,
    );
  };

  const openShareModal = (
    resourceType: string,
    resourceId?: string | number,
  ) => {
    setShareContext({ resourceType, resourceId });
    setShareModalVisible(true);
  };

  const handleShareDocument = useCallback(
    (shareData: SharedConnection[]) => {
      const payload = {
        ...shareContext,
        users: shareData,
      };

      dispatch(sharingSyncService(payload));
    },
    [shareContext],
  );

  useEffect(() => {
    if (share_sync_status === ASYNC_STATUS.SUCCEEDED) {
      dispatch(resetShareSyncStatus());
      setShareModalVisible(false);
    }
  }, [share_sync_status]);

  const handleAdd = () => {
    checkSubscription(() => {
      if (tutorialStep === 'spotlight_add_button') {
        // Advance to the passport-choice spotlight, then show the custom modal
        nextStep();
      }
      setShowAddModal(true);
    }, isBusiness ? 'business' : 'personal');
  };

  const handleAddPassport = () => {
    setShowAddModal(false);
    if (tutorialStep === 'spotlight_passport_choice') {
      setTutorialEntryKey('identity_hub.passport');
      nextStep(); // → passport_form_hint
    }
    navigation.navigate(
      'IdentityPassportForm' as any,
      accessLevel ? { ownerUserId: currentConnectionUserId } : undefined,
    );
  };

  const handleAddDriversLicense = () => {
    setShowAddModal(false);
    if (tutorialStep === 'spotlight_passport_choice') {
      setTutorialEntryKey('identity_hub.drivers_license');
      nextStep(); // → passport_form_hint
    }
    navigation.navigate(
      'IdentityDriverLicenseForm' as any,
      accessLevel ? { ownerUserId: currentConnectionUserId } : undefined,
    );
  };

  const handleAddLicenseCert = () => {
    setShowAddModal(false);
    if (tutorialStep === 'spotlight_passport_choice') {
      setTutorialEntryKey('identity_hub.license_certification');
      nextStep(); // → passport_form_hint
    }
    navigation.navigate(
      'IdentityLicenseCertificationsForm' as any,
      accessLevel ? { ownerUserId: currentConnectionUserId } : undefined,
    );
  };

  const handleFieldPress = () => {
    Alert.alert(
      t('common.info') || 'Information',
      t('identity_hub.edit_info_message') ||
      'To edit this information, please click the edit icon at the top of the section.',
      [{ text: t('common.ok') || 'OK' }],
    );
  };

  const handleChipPress = (user: any) => {
    if (selectedSharedUser?.ownerid === user.ownerid) {
      // Deselect — show own data again
      selectedSharedUserRef.current = null;
      setSelectedSharedUser(null);
      dispatch(identityHubAsync({ ...getConnectionTabQueryParams() }));
    } else {
      // Select — show this user's data
      selectedSharedUserRef.current = user;
      setSelectedSharedUser(user);
      dispatch(identityHubAsync({ ownerId: user.ownerid }));
    }
  };

  const renderInfoRow = (
    label: string,
    value: string,
    icon?: React.ReactNode,
  ) => (
    <View style={styles.infoRow}>
      <View style={styles.infoLabelRow}>
        {icon ? <View style={styles.infoLabelIcon}>{icon}</View> : null}
        <Text style={styles.infoLabel}>{label}</Text>
      </View>
      <CopyableText style={styles.infoValue} value={value} label={label} fallback="-" />
    </View>
  );

  const renderHalfInfoRow = (
    label1: string,
    value1: string,
    label2: string,
    value2: string,
    icon1?: React.ReactNode,
    icon2?: React.ReactNode,
  ) => (
    <View style={styles.doubleRow}>
      <View style={styles.halfWidth}>
        <View style={styles.infoLabelRow}>
          {icon1 ? <View style={styles.infoLabelIcon}>{icon1}</View> : null}
          <Text style={styles.infoLabel}>{label1}</Text>
        </View>
        <CopyableText style={styles.infoValue} value={value1} label={label1} fallback="-" />
      </View>
      <View style={styles.halfWidth}>
        <View style={styles.infoLabelRow}>
          {icon2 ? <View style={styles.infoLabelIcon}>{icon2}</View> : null}
          <Text style={styles.infoLabel}>{label2}</Text>
        </View>
        <CopyableText style={styles.infoValue} value={value2} label={label2} fallback="-" />
      </View>
    </View>
  );

  // Renders scrollable tab pills for multi-record sections using the app's CustomScrollableTabs
  const renderRecordTabs = (
    records: any[],
    currentIndex: number,
    getLabel: (r: any) => string,
    onSelect: (i: number) => void,
  ) => {
    if (records.length <= 1) {
      return null;
    }
    const tabs = records.map(r => ({ label: getLabel(r) }));
    return (
      <CustomScrollableTabs
        tabs={tabs}
        activeTab={currentIndex}
        onTabChange={onSelect}
        showViewAll={false}
        style={styles.tabsRow}
      />
    );
  };


  return (
    <LinearGradient
      colors={[...themeColors.gradient.slice(0, 3), themeColors.background]}
      locations={[0, 0.118, 0.2774, 0.4327, 0.5913]}
      style={{ flex: 1 }}
    >
      <SafeAreaView style={styles.safeArea}>
        <AuthHeader
          onBackPress={() => navigation.goBack()}
          containerStyle={{
            paddingHorizontal: 16,
            marginBottom: 0,
            paddingTop: isIOS ? 0 : 20,
          }}
          backButtonStyle={{ marginBottom: 0 }}
          titleStyle={{ marginBottom: 0 }}
          backButtonIconStyle={{ tintColor: themeColors.background }}
        />

        <ScrollView
          ref={scrollRef}
          style={commonStyles.scrollView}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          {/* Hero header card */}
          <View style={styles.heroCard}>
            <View>
              <Image source={ICONS.IDENTITY_HUB_ICON} style={styles.heroIcon} />
            </View>
            <Text style={styles.title}>{t('identity_hub.title')}</Text>
          </View>

          {/* Add / Share buttons */}
          <View style={styles.buttonsRow}>
            {shouldAllowShare && (
              <View ref={addButtonRef} collapsable={false}>
                <PrimaryButton
                  icon={<Entypo name="plus" size={20} color={themeColors.textPrimary} />}
                  title={t('identity_hub.add')}
                  onPress={handleAdd}
                  buttonStyle={styles.whiteButton}
                  textStyle={styles.blackText}
                />
              </View>
            )}
            {shouldAllowShare &&
              (passportsData.length > 0 ||
                driverLicensesData.length > 0 ||
                licensesData.length > 0) && (
                <PrimaryButton
                  icon={
                    <Fontisto name="share-a" size={13} color={colors.black} />
                  }
                  title={t('common.share')}
                  onPress={() => checkSubscription(() => openShareModal('identityhub'), isBusiness ? 'business' : 'personal')}
                  buttonStyle={[
                    styles.whiteButton,
                    { backgroundColor: themeColors?.isDark ? getColorWithOpacity(themeColors.primary, 0.8) : getColorWithOpacity(themeColors.primary, 0.5) },
                  ]}
                  textStyle={{ color: themeColors?.isDark ? themeColors.background : themeColors.textPrimary }}
                />
              )}
          </View>

          {/* Users Who Shared With You — horizontal scrollable chips */}
          {!accessLevel && !isFromEmergencyAccess && sharedUsers.length > 0 && (
            <View style={styles.sharedUsersSection}>
              <Text style={styles.sharedUsersHeading}>
                {'Users Who Shared With You'}
              </Text>
              <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                style={styles.chipsScrollView}
                contentContainerStyle={styles.chipsRow}
              >
                {sharedUsers.map(user => {
                  const isSelected = selectedSharedUser?.ownerid === user.ownerid;
                  return (
                    <TouchableOpacity
                      key={user.ownerid}
                      style={[styles.chip, isSelected && styles.chipSelected]}
                      onPress={() => handleChipPress(user)}
                    >
                      <Text style={[styles.chipText, isSelected && styles.chipTextSelected]}>
                        {user.firstname} {user.lastname}
                      </Text>
                    </TouchableOpacity>
                  );
                })}
              </ScrollView>
            </View>
          )}

          {isLoading ? (
            <View style={styles.loadingContainer}>
              <ActivityIndicator size="large" color={themeColors.primary} />
              <Text style={styles.loadingText}>
                {t('common.loading') || 'Loading...'}
              </Text>
            </View>
          ) : (
            <>
              {/* Personal Information Section */}
              <View style={styles.sectionContainer}>
                <View style={styles.sectionHeader}>
                  <Text style={styles.sectionTitle}>
                    {t('identity_hub.personal_information')}
                  </Text>
                  {
                    shouldAllowShare && (
                      <View style={styles.sectionActions}>
                        <TouchableOpacity
                          style={styles.iconBtn}
                          onPress={() =>
                            navigation.navigate('EditHistoryList', {
                              entityType: 'PersonalInfo',
                              entityId: personalInfo?.id || 0,
                              title: t('edit_history.personal_info_history'),
                            })
                          }
                        >
                          <MaterialIcons
                            name="history"
                            size={24}
                            color={themeColors.secondary}
                          />
                        </TouchableOpacity>
                        {getItemWriteAccess(personalInfo) && (
                          <TouchableOpacity
                            style={styles.iconBtn}
                            onPress={() =>
                              checkSubscription(
                                () => navigation.navigate('AddIdentityHubForm', {
                                  mode: 'edit',
                                  personalData: personalInfo,
                                }),
                                isBusiness ? 'business' : 'personal',
                              )
                            }
                          >
                            <Entypo
                              name="edit"
                              size={18}
                              color={themeColors.secondary}
                            />
                          </TouchableOpacity>
                        )}
                        {/* {shouldAllowShare && (
                      <TouchableOpacity
                        style={styles.iconBtn}
                        onPress={() =>
                          openShareModal('personalinfo', personalInfo.id)
                        }
                      >
                        <Image
                          source={ICONS.SHARE_PRIMARY_ICON}
                          style={[
                            styles.shareIcon,
                            { tintColor: themeColors.secondary },
                          ]}
                        />
                      </TouchableOpacity>
                    )} */}
                      </View>
                    )
                  }

                </View>
                <View style={styles.sectionCard}>
                  {/* Picture and full name as the card title */}
                  <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
                    <ProfileAvatar imageId={personalInfo.profilepicture} name={personalInfo.fullname} size={56} />
                    <Text style={[styles.cardName, { flex: 1 }]}>
                      {personalInfo.fullname || '-'}
                    </Text>
                  </View>
                  {renderHalfInfoRow(
                    t('identity_hub.date_of_birth'),
                    personalInfo.dateofbirth
                      ? formatDate(personalInfo.dateofbirth)
                      : '-',
                    t('identity_hub.phone_no'),
                    personalInfo.phonenumber,
                    // <MaterialIcons name="calendar-today" size={13} color={colors.gray} />
                    //
                    <Image
                      source={ICONS.USER_ICON}
                      style={{
                        width: 20,
                        objectFit: 'contain',
                        height: 20,
                        tintColor: themeColors.secondary,
                      }}
                    />,
                    <Image
                      source={ICONS.PHONE_ICON}
                      style={{
                        width: 20,
                        objectFit: 'contain',
                        height: 20,
                        tintColor: themeColors.secondary,
                      }}
                    />,
                  )}
                  {renderHalfInfoRow(
                    t('identity_hub.email_address'),
                    personalInfo.email,
                    t('identity_hub.username'),
                    personalInfo.username || '-',
                    <Image
                      source={ICONS.EMAIL_ICON}
                      style={{
                        width: 20,
                        objectFit: 'contain',
                        height: 20,
                        tintColor: themeColors.secondary,
                      }}
                    />,
                    <Image
                      source={ICONS.USER_ICON}
                      style={{
                        width: 20,
                        objectFit: 'contain',
                        height: 20,
                        tintColor: themeColors.secondary,
                      }}
                    />,
                  )}
                  {renderInfoRow(
                    t('identity_hub.address'),
                    `${personalInfo.address1 || ''}${personalInfo.city ? ', ' + personalInfo.city : ''
                      }`.trim() || '-',
                  )}
                  <View style={styles.cardDivider} />
                  <View style={styles.tripleRow}>
                    <View style={styles.tripleCol}>
                      <Text style={styles.infoLabel}>
                        {t('identity_hub.state')}
                      </Text>
                      <Text style={styles.infoValue}>
                        {personalInfo.state?.description || personalInfo.statename || '-'}
                      </Text>
                    </View>
                    <View style={styles.tripleCol}>
                      <Text style={styles.infoLabel}>
                        {t('identity_hub.zip')}
                      </Text>
                      <Text style={styles.infoValue}>
                        {personalInfo.zipcode || '-'}
                      </Text>
                    </View>
                    <View style={styles.tripleCol}>
                      <Text style={styles.infoLabel}>
                        {t('identity_hub.country')}
                      </Text>
                      <Text style={styles.infoValue}>
                        {personalInfo.state?.country?.countryname || personalInfo.countryname || '-'}
                      </Text>
                    </View>
                  </View>
                </View>
              </View>

              {/* Passport Information Section */}
              <View style={styles.sectionContainer} ref={passportSectionRef} collapsable={false}>
                <View style={styles.sectionHeader}>
                  <Text style={styles.sectionTitle}>
                    {t('identity_hub.passport_information')}
                    {passportsData.length > 0 && (
                      <Text style={styles.sectionCount}>
                        {' '}
                        ({passportsData.length})
                      </Text>
                    )}
                  </Text>
                </View>
                {renderRecordTabs(
                  passportsData,
                  currentPassportIndex,
                  r => r.name || r.country?.countryname || r.passportnumber || `#${r.id}`,
                  setCurrentPassportIndex,
                )}
                <View
                  style={[
                    styles.sectionCard,
                    highlightedSection === 'passport' && {
                      borderWidth: 2,
                      borderColor: themeColors.primary,
                    },
                  ]}
                >
                  {/* Action icons inside card top-right */}
                  <View style={styles.cardActions}>
                    <LinkedRecordsButton
                      record={currentPassport?.id ? { moduleKey: 'passport', id: Number(currentPassport.id) } : null}
                      canEdit={getItemWriteAccess(currentPassport)}
                    />
                    <TouchableOpacity
                      style={styles.iconBtn}
                      onPress={() =>
                        navigation.navigate('EditHistoryList', {
                          entityType: 'Passport',
                          entityId: currentPassport?.id || 0,
                          title: t('edit_history.passport_history'),
                        })
                      }
                    >
                      <MaterialIcons
                        name="history"
                        size={24}
                        color={themeColors.secondary}
                      />
                    </TouchableOpacity>
                    {getItemWriteAccess(currentPassport) && (
                      <TouchableOpacity
                        style={styles.iconBtn}
                        onPress={() =>
                          checkSubscription(() =>
                          navigation.navigate('IdentityPassportForm', {
                            mode: 'edit',
                            passportData: {
                              id: currentPassport.id,
                              name: currentPassport.name,
                              passportNumber: currentPassport.passportnumber,
                              countryId: currentPassport.countryid,
                              countryName: currentPassport.country?.countryname,
                              expirationDate: currentPassport.expirationdate,
                              passportType: currentPassport.passporttype,
                              passportImageId: Array.isArray(
                                currentPassport.imageurl,
                              )
                                ? currentPassport.imageurl[0] ?? ''
                                : currentPassport.imageurl,
                              passportImageIds: Array.isArray(
                                currentPassport.imageurl,
                              )
                                ? currentPassport.imageurl
                                : currentPassport.imageurl
                                  ? [currentPassport.imageurl]
                                  : [],
                              passportImageUri: Array.isArray(
                                currentPassport.imageurl,
                              )
                                ? currentPassport.imageurl[0] ?? ''
                                : currentPassport.imageurl,
                              remindBefore:
                                currentPassport.reminderdaysbefore || 14,
                              isAddedInWallet: currentPassport.isaddedinwallet,
                            },
                          }),
                          isBusiness ? 'business' : 'personal',
                          )
                        }
                      >
                        <Entypo
                          name="edit"
                          size={18}
                          color={themeColors.secondary}
                        />
                      </TouchableOpacity>
                    )}
                    {shouldAllowShare && (
                      <TouchableOpacity
                        style={styles.iconBtn}
                        onPress={() =>
                          checkSubscription(
                            () => openShareModal('passports', currentPassport?.id),
                            isBusiness ? 'business' : 'personal',
                          )
                        }
                      >
                        <Image
                          source={ICONS.SHARE_PRIMARY_ICON}
                          style={styles.shareIcon}
                        />
                      </TouchableOpacity>
                    )}
                    {shouldAllowShare && currentPassport?.id && (
                      <TouchableOpacity
                        style={styles.iconBtn}
                        onPress={() => handleDeletePassport(currentPassport.id)}
                      >
                        <Feather name="trash-2" size={18} color={themeColors.secondary} />
                      </TouchableOpacity>
                    )}
                  </View>
                  <MixedMediaDisplayer
                    attachmentIds={
                      Array.isArray(currentPassport.imageurl)
                        ? currentPassport.imageurl
                        : currentPassport.imageurl
                          ? [currentPassport.imageurl]
                          : []
                    }
                  />
                  <View style={styles.cardDivider} />
                  {currentPassport.name
                    ? renderInfoRow(t('identity_hub.passport_name', { defaultValue: 'Passport name' }), currentPassport.name)
                    : null}
                  {renderHalfInfoRow(
                    t('identity_hub.passport_number'),
                    currentPassport.passportnumber,
                    t('identity_hub.country'),
                    currentPassport.country?.countryname,
                  )}
                  {renderHalfInfoRow(
                    t('identity_hub.expiration_date'),
                    currentPassport.expirationdate
                      ? formatDate(currentPassport.expirationdate)
                      : '-',
                    t('identity_hub.type'),
                    resolvePassportType(currentPassport.passporttype),
                  )}
                </View>
              </View>

              {/* Driver's License Section */}
              <View style={styles.sectionContainer} ref={driverLicenseSectionRef} collapsable={false}>
                <View style={styles.sectionHeader}>
                  <Text style={styles.sectionTitle}>
                    {t('identity_hub.drivers_license')}
                    {driverLicensesData.length > 0 && (
                      <Text style={styles.sectionCount}>
                        {' '}
                        ({driverLicensesData.length})
                      </Text>
                    )}
                  </Text>
                </View>
                {renderRecordTabs(
                  driverLicensesData,
                  currentDriverLicenseIndex,
                  r => r.statelabel || r.licensenumber || `#${r.id}`,
                  setCurrentDriverLicenseIndex,
                )}
                <View
                  style={[
                    styles.sectionCard,
                    highlightedSection === 'driver_license' && {
                      borderWidth: 2,
                      borderColor: themeColors.primary,
                    },
                  ]}
                >
                  {/* Action icons inside card top-right */}
                  <View style={styles.cardActions}>
                    <LinkedRecordsButton
                      record={currentDriverLicense?.id ? { moduleKey: 'driverlicense', id: Number(currentDriverLicense.id) } : null}
                      canEdit={getItemWriteAccess(currentDriverLicense)}
                    />
                    <TouchableOpacity
                      style={styles.iconBtn}
                      onPress={() =>
                        navigation.navigate('EditHistoryList', {
                          entityType: 'DriverLicense',
                          entityId: currentDriverLicense?.id || 0,
                          title: t('edit_history.drivers_license_history'),
                        })
                      }
                    >
                      <MaterialIcons
                        name="history"
                        size={24}
                        color={themeColors.secondary}
                      />
                    </TouchableOpacity>
                    {getItemWriteAccess(currentDriverLicense) && (
                      <TouchableOpacity
                        style={styles.iconBtn}
                        onPress={() =>
                          checkSubscription(() =>
                          navigation.navigate('IdentityDriverLicenseForm', {
                            mode: 'edit',
                            licenseData: {
                              id: currentDriverLicense.id,
                              licenseNumber: currentDriverLicense.licensenumber,
                              state: currentDriverLicense.state,
                              country: currentDriverLicense.countryname,
                              expirationDate:
                                currentDriverLicense.expirationdate,
                              classType: currentDriverLicense.class,
                              licenseImageId: Array.isArray(
                                currentDriverLicense.imageurl,
                              )
                                ? currentDriverLicense.imageurl[0] ?? ''
                                : currentDriverLicense.imageurl,
                              licenseImageIds: Array.isArray(
                                currentDriverLicense.imageurl,
                              )
                                ? currentDriverLicense.imageurl
                                : currentDriverLicense.imageurl
                                  ? [currentDriverLicense.imageurl]
                                  : [],
                              remindBefore:
                                currentDriverLicense.reminderdaysbefore || 14,
                              isAddedInWallet:
                                currentDriverLicense.isaddedinwallet,
                            },
                          }),
                          isBusiness ? 'business' : 'personal',
                          )
                        }
                      >
                        <Entypo
                          name="edit"
                          size={18}
                          color={themeColors.secondary}
                        />
                      </TouchableOpacity>
                    )}
                    {shouldAllowShare && (
                      <TouchableOpacity
                        style={styles.iconBtn}
                        onPress={() =>
                          checkSubscription(
                            () => openShareModal(
                              'driverlicenses',
                              currentDriverLicense?.id,
                            ),
                            isBusiness ? 'business' : 'personal',
                          )
                        }
                      >
                        <Image
                          source={ICONS.SHARE_PRIMARY_ICON}
                          style={styles.shareIcon}
                        />
                      </TouchableOpacity>
                    )}
                    {shouldAllowShare && currentDriverLicense?.id && (
                      <TouchableOpacity
                        style={styles.iconBtn}
                        onPress={() => handleDeleteDriverLicense(currentDriverLicense.id)}
                      >
                        <Feather name="trash-2" size={18} color={themeColors.secondary} />
                      </TouchableOpacity>
                    )}
                  </View>
                  {/* Full-width landscape photo */}
                  <MixedMediaDisplayer
                    attachmentIds={
                      Array.isArray(currentDriverLicense.imageurl)
                        ? currentDriverLicense.imageurl
                        : currentDriverLicense.imageurl
                          ? [currentDriverLicense.imageurl]
                          : []
                    }
                  />
                  <View style={styles.cardDivider} />
                  {renderHalfInfoRow(
                    t('identity_hub.license_number'),
                    currentDriverLicense.licensenumber,
                    t('identity_hub.state'),
                    currentDriverLicense.statelabel,
                  )}
                  {renderHalfInfoRow(
                    t('identity_hub.expiration_date'),
                    currentDriverLicense.expirationdate
                      ? formatDate(currentDriverLicense.expirationdate)
                      : '-',
                    t('identity_hub.class'),
                    resolveDriverLicenseClass(currentDriverLicense.class),
                  )}
                  {renderInfoRow(
                    t('identity_hub.country'),
                    driverLicenseCountry || '-',
                  )}
                </View>
              </View>

              {/* Licenses & Certifications Section */}
              <View style={styles.sectionContainer} ref={licenseSectionRef} collapsable={false}>
                <View style={styles.sectionHeader}>
                  <Text style={styles.sectionTitle}>
                    {t('identity_hub.licenses_certifications')}
                    {licensesData.length > 0 && (
                      <Text style={styles.sectionCount}>
                        {' '}
                        ({licensesData.length})
                      </Text>
                    )}
                  </Text>
                </View>
                {renderRecordTabs(
                  licensesData,
                  currentLicenseIndex,
                  r => {
                    const resolvedType = resolveLicenseCertType(r.type);
                    if (isOtherSelected(resolvedType) && r.typeother) {
                      return r.typeother;
                    }
                    return r.licensenumber || `#${r.id}`;
                  },
                  setCurrentLicenseIndex,
                )}
                <View
                  style={[
                    styles.sectionCard,
                    highlightedSection === 'license_certification' && {
                      borderWidth: 2,
                      borderColor: themeColors.primary,
                    },
                  ]}
                >
                  {/* Action icons inside card top-right */}
                  <View style={styles.cardActions}>
                    <LinkedRecordsButton
                      record={currentLicense?.id ? { moduleKey: 'licensecertification', id: Number(currentLicense.id) } : null}
                      canEdit={getItemWriteAccess(currentLicense)}
                    />
                    <TouchableOpacity
                      style={styles.iconBtn}
                      onPress={() =>
                        navigation.navigate('EditHistoryList', {
                          entityType: 'LicenseCertification',
                          entityId: currentLicense?.id || 0,
                          title: t('edit_history.license_cert_history'),
                        })
                      }
                    >
                      <MaterialIcons
                        name="history"
                        size={24}
                        color={themeColors.secondary}
                      />
                    </TouchableOpacity>
                    {getItemWriteAccess(currentLicense) && (
                      <TouchableOpacity
                        style={styles.iconBtn}
                        onPress={() =>
                          checkSubscription(() =>
                          navigation.navigate(
                            'IdentityLicenseCertificationsForm',
                            {
                              mode: 'edit',
                              licenseData: {
                                id: currentLicense.id,
                                type: currentLicense.type,
                                typeOther: currentLicense.typeother,
                                licenseCertNumber: currentLicense.licensenumber,
                                jurisdiction: currentLicense.jurisdiction,
                                issuerAuthority: currentLicense.issuerauthority,
                                expirationDate: currentLicense.expirationdate,
                                country: currentLicense.jurisdictioncountry,
                                imageId: Array.isArray(currentLicense.imageurl)
                                  ? currentLicense.imageurl[0] ?? ''
                                  : currentLicense.imageurl,
                                imageIds: Array.isArray(currentLicense.imageurl)
                                  ? currentLicense.imageurl
                                  : currentLicense.imageurl
                                    ? [currentLicense.imageurl]
                                    : [],
                                remindBefore:
                                  currentLicense.reminderdaysbefore || 90,
                                isAddedInWallet: currentLicense.isaddedinwallet,
                              },
                            },
                          ),
                          isBusiness ? 'business' : 'personal',
                          )
                        }
                      >
                        <Entypo
                          name="edit"
                          size={18}
                          color={themeColors.secondary}
                        />
                      </TouchableOpacity>
                    )}
                    {shouldAllowShare && (
                      <TouchableOpacity
                        style={styles.iconBtn}
                        onPress={() =>
                          checkSubscription(
                            () => openShareModal(
                              'licensecertification',
                              currentLicense?.id,
                            ),
                            isBusiness ? 'business' : 'personal',
                          )
                        }
                      >
                        <Image
                          source={ICONS.SHARE_PRIMARY_ICON}
                          style={styles.shareIcon}
                        />
                      </TouchableOpacity>
                    )}
                    {shouldAllowShare && currentLicense?.id && (
                      <TouchableOpacity
                        style={styles.iconBtn}
                        onPress={() => handleDeleteLicense(currentLicense.id)}
                      >
                        <Feather name="trash-2" size={18} color={themeColors.secondary} />
                      </TouchableOpacity>
                    )}
                  </View>
                  <MixedMediaDisplayer
                    attachmentIds={
                      Array.isArray(currentLicense.imageurl)
                        ? currentLicense.imageurl
                        : currentLicense.imageurl
                          ? [currentLicense.imageurl]
                          : []
                    }
                  />
                  <View style={styles.cardDivider} />
                  {renderHalfInfoRow(
                    t('identity_hub.license_cert_number'),
                    currentLicense.licensenumber,
                    t('identity_hub.jurisdiction'),
                    [currentLicense.jurisdictioncountry, currentLicense.jurisdictionstate].filter(Boolean).join('/') || '-',
                  )}
                  {renderHalfInfoRow(
                    t('identity_hub.type'),
                    resolveLicenseCertType(currentLicense.type),
                    t('identity_hub.issuer_authority'),
                    currentLicense.issuerauthority,
                  )}
                  {isOtherSelected(
                    resolveLicenseCertType(currentLicense.type),
                  ) &&
                    renderInfoRow(
                      t('identity_hub.type_other') || 'Type (Other)',
                      currentLicense.typeother || '-',
                    )}
                  {renderHalfInfoRow(
                    t('identity_hub.expiration_date'),
                    currentLicense.expirationdate
                      ? formatDate(currentLicense.expirationdate)
                      : '-',
                    t('identity_hub.country'),
                    currentLicense.jurisdictioncountry || licenseCountry || '-',
                    <MaterialIcons
                      name="calendar-today"
                      size={13}
                      color={colors.gray}
                    />,
                  )}
                  {renderInfoRow(
                    t('identity_hub.state'),
                    currentLicense.jurisdictionstate || licenseState || '-',
                  )}
                </View>
              </View>
            </>
          )}
        </ScrollView>

        {/* ── Tutorial: Congratulations overlay ── */}
        {tutorialStep === 'passport_congratulations' && (
          <View style={identityHubTutorialStyles.congratsOverlay}>
            {/* Card */}
            <View style={identityHubTutorialStyles.congratsCard}>
              <View style={identityHubTutorialStyles.stepCircle}>
                <Text style={identityHubTutorialStyles.stepCircleText}>3</Text>
              </View>
              <Text style={identityHubTutorialStyles.congratsTitle}>Congratulations</Text>
              <Text style={identityHubTutorialStyles.congratsBody}>
                You have added your {t(tutorialEntryKey)} and you can view, edit &amp; share it from the Identity Hub.
              </Text>
            </View>

            {/* Continue button */}
            <TouchableOpacity
              style={identityHubTutorialStyles.continueBtn}
              activeOpacity={0.85}
              onPress={() => {
                nextStep(); // passport_congratulations → halo_intro
                navigation.goBack(); // back to Home
              }}
            >
              <Text style={identityHubTutorialStyles.continueBtnText}>Continue</Text>
            </TouchableOpacity>
          </View>
        )}

      </SafeAreaView>

      {/* ── Custom Add modal — iOS-alert style ── */}
      <Modal
        visible={showAddModal}
        transparent
        animationType="fade"
        onRequestClose={() => setShowAddModal(false)}
      >
        {/* Dark overlay */}
        <TouchableOpacity style={addModalStyles.backdrop}>
          <TouchableOpacity
            style={addModalStyles.alertBox}
            activeOpacity={1}
            onPress={() => { }}
          >
            {/* Title + subtitle */}
            <View style={addModalStyles.alertHeader}>
              <Text style={addModalStyles.alertTitle}>
                {t('identity_hub.add')}
              </Text>

              <Text style={addModalStyles.alertSubtitle}>
                {t('identity_hub.select_what_to_add')}
              </Text>
            </View>

            <View style={addModalStyles.divider} />

            {/* Driver's License */}
            <TouchableOpacity
              style={addModalStyles.alertAction}
              onPress={handleAddDriversLicense}
              activeOpacity={0.6}
            >
              <Text style={addModalStyles.alertActionText}>
                {t('identity_hub.drivers_license')}
              </Text>
            </TouchableOpacity>

            <View style={addModalStyles.divider} />

            {/* Passport */}
            <TouchableOpacity
              style={addModalStyles.alertAction}
              onPress={handleAddPassport}
              activeOpacity={0.6}
            >
              <Text style={addModalStyles.alertActionText}>
                {t('identity_hub.passport')}
              </Text>
            </TouchableOpacity>

            <View style={addModalStyles.divider} />

            {/* License & Certification */}
            <TouchableOpacity
              style={addModalStyles.alertAction}
              onPress={handleAddLicenseCert}
              activeOpacity={0.6}
            >
              <Text style={addModalStyles.alertActionText}>
                {t('identity_hub.license_certification')}
              </Text>
            </TouchableOpacity>

            <View style={addModalStyles.divider} />

            {/* Cancel */}
            <View
              pointerEvents={tutorialStep === 'spotlight_passport_choice' ? 'none' : 'box-none'}
              style={tutorialStep === 'spotlight_passport_choice' ? { opacity: 0.35 } : undefined}
            >
              <TouchableOpacity
                style={addModalStyles.alertAction}
                onPress={() => setShowAddModal(false)}
                activeOpacity={0.6}
              >
                <Text style={addModalStyles.alertCancelText}>{t('common.cancel')}</Text>
              </TouchableOpacity>
            </View>
          </TouchableOpacity>
        </TouchableOpacity>
      </Modal>
      {/* Modals */}
      <ShareModal
        visible={shareModalVisible}
        onClose={() => setShareModalVisible(false)}
        onShare={handleShareDocument}
        title={t('identity_hub.share_identity_hub')}
        alreadySharedWith={[]}
        loading={sharingLoading}
        resourceType={shareContext.resourceType}
        resourceId={shareContext.resourceId}
        businessId={currentBusinessId}
      />

      <DeleteConfirmModal
        visible={deleteModalConfig.visible}
        onClose={() => setDeleteModalConfig(prev => ({ ...prev, visible: false }))}
        onConfirm={deleteModalConfig.onConfirm}
        title={deleteModalConfig.title}
        message={deleteModalConfig.message}
      />
      {GateModal}
    </LinearGradient>
  );
};

export default IdentityHub;
