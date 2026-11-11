import React, { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  Image,
  ScrollView,
  ActivityIndicator,
} from 'react-native';
import AntDesign from 'react-native-vector-icons/AntDesign';
import LinearGradient from 'react-native-linear-gradient';
import Ionicons from 'react-native-vector-icons/Ionicons';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import Feather from 'react-native-vector-icons/Feather';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTranslation } from 'react-i18next';
import { useDispatch, useSelector } from 'react-redux';
import { useFocusEffect, useRoute } from '@react-navigation/native';

import {
  ShareModal,
  DeleteConfirmModal,
  RemoteImage,
  MixedMediaDisplayer,
  PrimaryButton,
} from '../../../../../components/common';
import ViewPetVaccinationModal from '../../../../../components/CustomModals/ViewPetVaccinationModal';
import ViewPetMedicationModal from '../../../../../components/CustomModals/ViewPetMedicationModal';
import ViewPetVetAppointmentModal from '../../../../../components/CustomModals/ViewPetVetAppointmentModal';
import ViewPetIllnessModal from '../../../../../components/CustomModals/ViewPetIllnessModal';
import { useUserRole } from '../../../../../hooks/useUserRole';
import { useSubscriptionGate } from '../../../../../hooks/useSubscriptionGate';
import { useSelectedBusiness } from '../../../../../hooks/useSelectedBusiness';
import { ICONS } from '../../../../../utils/Images';
import { ASYNC_STATUS } from '../../../../../config/constants';
import { convert24HourTo12Hour, formatDate } from '../../../../../utils/helpers';
import {
  getPetsAsync,
  deletePetAsync,
  deletePetVaccinationAsync,
  deletePetMedicationAsync,
  deletePetVetAppointmentAsync,
  deletePetIllnessAsync,
} from '../../../../../redux/services/essentialsService';
import { sharingSyncService, getSharedByUsers } from '../../../../../redux/services/sharingService';
import { resetShareSyncStatus } from '../../../../../redux/slices/sharingSlice';

import { PetsScreenProps } from './petsScreen.types';
import { getModuleWriteAccess, getEntityWriteAccess } from '../../../../../utils/accessLevel';
import { getDropdownOptionsAsync } from '../../../../../redux/services/authService';
import { AppDispatch } from '../../../../../types/store.types';
import { makeCommonStyles, makePetsScreenStyles } from './PetsScreen.styles';
import colors, { getColorWithOpacity } from '../../../../../utils/colors';
import { RoleTheme } from '../../../../../types/roleManager.types';
import { darkenColor } from '../../../../../utils/roleManager';
import Fontisto from 'react-native-vector-icons/Fontisto';
import Entypo from 'react-native-vector-icons/Entypo';
import { LinkedRecordsButton } from '../../../../../components/recordLinks/LinkedRecordsButton';

const SECTION_FOR_ENTITY_TYPE: Record<string, string> = {
  pet_vaccination: 'vaccination',
  pet_medication: 'medications',
  pet_vet_appointment: 'appointments',
  pet_illness: 'illness',
};

const sectionForEntityType = (entityType?: string): string | null => {
  if (!entityType) return null;
  const normalized = entityType.toLowerCase().replace(/_schedule$/, '');
  return SECTION_FOR_ENTITY_TYPE[normalized] ?? null;
};

const PetsScreen = ({ navigation }: PetsScreenProps) => {
  const { t, i18n } = useTranslation();
  const isRTL = i18n.language === 'ar';
  const { themeColors, isBusinessRole } = useUserRole();
  const commonStyles = useMemo(() => makeCommonStyles(themeColors as RoleTheme), [themeColors]);
  const petsScreenStyles = useMemo(() => makePetsScreenStyles(themeColors as RoleTheme), [themeColors]);
  const { checkSubscription, GateModal } = useSubscriptionGate();
  const { selectedBusinessId } = useSelectedBusiness();
  const isBusiness = isBusinessRole();
  const dispatch = useDispatch<AppDispatch>();
  const route = useRoute<any>();
  const { from, connectionTabSource, sharedWithUserId, ownerId, accessLevel, accessType, openEntityId, openParentEntityId, openEntityType, openAppointmentIdForEdit, openVaccinationIdForEdit, openMedicationIdForEdit, openIllnessIdForEdit, openMedicationIdForView, openVaccinationIdForView, openAppointmentIdForView, openIllnessIdForView } = route.params || {};
  const isFromEmergencyAccess = from === 'emergency_access';
  const [selectedSharedUser, setSelectedSharedUser] = useState<any>(null);
  const selectedSharedUserRef = useRef<any>(null);
  const shouldAllowShare = !isFromEmergencyAccess && !accessLevel && !selectedSharedUser;
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
  const getConnectionTabQueryParams = () => {
    if (connectionTabSource === 'yours' && sharedWithUserId) {
      return { sharedWithUserId };
    }
    if (connectionTabSource === 'shared_with_you' && ownerId) {
      return { ownerId };
    }
    return {};
  };

  const { currentConnectionUserId } = useSelector((state: any) => state.connection_slice);


  const { get_pets_status, get_pets_data, delete_pet_status } = useSelector(
    (state: any) => state.essentials_slice,
  );
  const { share_sync_status } = useSelector((state: any) => state.sharing_slice);

  // In business mode with no business selected, show empty data
  const noBusinessInBusinessMode = isBusiness && !selectedBusinessId && !isFromEmergencyAccess;
  const pets = noBusinessInBusinessMode ? [] : (get_pets_data?.pets || []);
  const isLoading = get_pets_status === ASYNC_STATUS.LOADING;
  const sharingLoading = share_sync_status === ASYNC_STATUS.LOADING;


  const { get_dropdown_options_data } = useSelector((state: any) => state.user_auth);

  useFocusEffect(useCallback(() => {
    dispatch(getDropdownOptionsAsync('PetType'));
  }, [dispatch]));

  // Fetch pets on screen focus
  useFocusEffect(
    useCallback(() => {
      // In business mode with no business selected, skip fetch to avoid showing personal data
      if (isBusiness && !selectedBusinessId && !isFromEmergencyAccess) {
        return;
      }

      if (isFromEmergencyAccess && currentConnectionUserId) {
        dispatch(getPetsAsync({ userId: currentConnectionUserId, ...getConnectionTabQueryParams() }));
      } else {
        dispatch(getPetsAsync(
          selectedSharedUserRef.current ? { ownerId: selectedSharedUserRef.current.ownerid } : getConnectionTabQueryParams()
        ));
      }
      if (!accessLevel && !isFromEmergencyAccess) {
        dispatch(getSharedByUsers({ module: 'pet' })).then((action: any) => {
          const users = action?.payload?.users || [];
          setSharedUsers(users);
        });
      }
    }, [dispatch, isFromEmergencyAccess, currentConnectionUserId, isBusiness, selectedBusinessId]),
  );

  // Refresh after delete
  useEffect(() => {
    if (delete_pet_status === ASYNC_STATUS.SUCCEEDED) {
      dispatch(getPetsAsync(getConnectionTabQueryParams()));
      setSelectedPetIndex(0);
    }
  }, [delete_pet_status, dispatch]);

  const [shareModalVisible, setShareModalVisible] = useState(false);
  const [deleteModalVisible, setDeleteModalVisible] = useState(false);
  const [viewVaccinationModalVisible, setViewVaccinationModalVisible] = useState(false);
  const [selectedVaccination, setSelectedVaccination] = useState<any>(null);
  const [viewMedicationModalVisible, setViewMedicationModalVisible] = useState(false);
  const [selectedMedication, setSelectedMedication] = useState<any>(null);
  const [viewAppointmentModalVisible, setViewAppointmentModalVisible] = useState(false);
  const [selectedAppointment, setSelectedAppointment] = useState<any>(null);
  const [viewIllnessModalVisible, setViewIllnessModalVisible] = useState(false);
  const [selectedIllness, setSelectedIllness] = useState<any>(null);
  const [selectedPetIndex, setSelectedPetIndex] = useState(0);
  const [expandedSections, setExpandedSections] = useState<{
    [key: string]: boolean;
  }>({ overview: true });
  const [deleteItemType, setDeleteItemType] = useState<
    'pet' | 'vaccination' | 'medication' | 'appointment' | 'illness' | null
  >(null);
  const [deleteItemId, setDeleteItemId] = useState<number | null>(null);
  const [shareContext, setShareContext] = useState<{
    resourceType: string;
    resourceId?: number;
  }>({ resourceType: 'pet' });
  const [sharedUsers, setSharedUsers] = useState<any[]>([]);

  const handleAddPet = () => {
    checkSubscription(() => navigation.navigate('AddPet' as any, accessLevel ? { ownerUserId: currentConnectionUserId, from, connectionTabSource, sharedWithUserId, ownerId, accessLevel, accessType } : undefined));
  };

  const handleEditPet = (pet: any) => {
    navigation.navigate('AddPet', { pet, isEdit: true });
  };

  const handleSelectPet = (index: number) => {
    setSelectedPetIndex(index);
  };

  const autoOpenedRef = useRef<number | null>(null);
  useEffect(() => {
    if (!openEntityId && !openParentEntityId) return;
    const trackedId = openParentEntityId ?? openEntityId;
    if (autoOpenedRef.current === Number(trackedId)) return;
    const petList = get_pets_data?.pets || [];
    if (!petList.length) return;

    // A reminder that carries the parent pet's own id (e.g. a schedule/occurrence
    // sub-record whose id doesn't appear in the pet's loaded sub-record arrays)
    // lets us jump straight to the pet instead of guessing via openEntityId.
    if (openParentEntityId != null) {
      const parentIdx = petList.findIndex((p: any) => Number(p.id) === Number(openParentEntityId));
      if (parentIdx !== -1) {
        autoOpenedRef.current = Number(openParentEntityId);
        setSelectedPetIndex(parentIdx);
        const section = sectionForEntityType(openEntityType);
        if (section) setExpandedSections(prev => ({ ...prev, [section]: true }));
        return;
      }
    }

    if (!openEntityId) return;
    // Search sub-records first — an appointment/vaccination/etc id can collide
    // with a pet id, so checking pets last avoids selecting the wrong pet tab.
    let foundSection: string | null = null;
    let idx = petList.findIndex((p: any) => {
      if ((p.vaccinations || []).some((r: any) => Number(r.id) === Number(openEntityId))) {
        foundSection = 'vaccination';
        return true;
      }
      if ((p.medications || []).some((r: any) => Number(r.id) === Number(openEntityId))) {
        foundSection = 'medications';
        return true;
      }
      if ((p.vetappointments || []).some((r: any) => Number(r.id) === Number(openEntityId))) {
        foundSection = 'appointments';
        return true;
      }
      if ((p.illnesses || []).some((r: any) => Number(r.id) === Number(openEntityId))) {
        foundSection = 'illness';
        return true;
      }
      return false;
    });
    if (idx !== -1) {
      autoOpenedRef.current = Number(openEntityId);
      setSelectedPetIndex(idx);
      if (foundSection) {
        setExpandedSections(prev => ({ ...prev, [foundSection!]: true }));
      }
      return;
    }
    // Fall back to matching by pet id (used when entity type is Pet itself)
    idx = petList.findIndex((p: any) => Number(p.id) === Number(openEntityId));
    if (idx !== -1) {
      autoOpenedRef.current = Number(openEntityId);
      setSelectedPetIndex(idx);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [openEntityId, openParentEntityId, openEntityType, get_pets_data]);

  const autoOpenAppointmentEditRef = useRef<number | null>(null);
  useEffect(() => {
    if (!openAppointmentIdForEdit) return;
    if (autoOpenAppointmentEditRef.current === Number(openAppointmentIdForEdit)) return;
    const petList = get_pets_data?.pets || [];
    if (!petList.length) return;
    for (const pet of petList) {
      const appt = (pet.vetappointments || []).find(
        (a: any) => Number(a.id) === Number(openAppointmentIdForEdit),
      );
      if (appt) {
        autoOpenAppointmentEditRef.current = Number(openAppointmentIdForEdit);
        navigation.navigate('AddPetVetAppointments' as any, {
          appointment: appt,
          petId: pet.id,
          isEdit: true,
          fromPetsScreen: true,
        });
        break;
      }
    }
  }, [openAppointmentIdForEdit, get_pets_data]);

  const autoOpenVaccinationEditRef = useRef<number | null>(null);
  useEffect(() => {
    if (!openVaccinationIdForEdit) return;
    if (autoOpenVaccinationEditRef.current === Number(openVaccinationIdForEdit)) return;
    const petList = get_pets_data?.pets || [];
    if (!petList.length) return;
    for (const pet of petList) {
      const vaccine = (pet.vaccinations || []).find(
        (v: any) => Number(v.id) === Number(openVaccinationIdForEdit),
      );
      if (vaccine) {
        autoOpenVaccinationEditRef.current = Number(openVaccinationIdForEdit);
        navigation.navigate('AddPetVaccination' as any, {
          vaccine,
          petId: pet.id,
          isEdit: true,
          fromPetsScreen: true,
        });
        break;
      }
    }
  }, [openVaccinationIdForEdit, get_pets_data]);

  const autoOpenMedicationEditRef = useRef<number | null>(null);
  useEffect(() => {
    if (!openMedicationIdForEdit) return;
    if (autoOpenMedicationEditRef.current === Number(openMedicationIdForEdit)) return;
    const petList = get_pets_data?.pets || [];
    if (!petList.length) return;
    for (const pet of petList) {
      const medication = (pet.medications || []).find(
        (m: any) => Number(m.id) === Number(openMedicationIdForEdit),
      );
      if (medication) {
        autoOpenMedicationEditRef.current = Number(openMedicationIdForEdit);
        navigation.navigate('AddPetMedication' as any, {
          medication,
          petId: pet.id,
          isEdit: true,
          fromPetsScreen: true,
        });
        break;
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [openMedicationIdForEdit, get_pets_data]);

  const autoOpenMedicationViewRef = useRef<number | null>(null);
  useEffect(() => {
    if (!openMedicationIdForView) return;
    if (autoOpenMedicationViewRef.current === Number(openMedicationIdForView)) return;
    const petList = get_pets_data?.pets || [];
    if (!petList.length) return;
    for (let i = 0; i < petList.length; i++) {
      const pet = petList[i];
      const medication = (pet.medications || []).find(
        (m: any) => Number(m.id) === Number(openMedicationIdForView),
      );
      if (medication) {
        autoOpenMedicationViewRef.current = Number(openMedicationIdForView);
        setSelectedPetIndex(i);
        setExpandedSections(prev => ({ ...prev, medications: true }));
        setSelectedMedication(medication);
        setViewMedicationModalVisible(true);
        break;
      }
    }
  }, [openMedicationIdForView, get_pets_data]);

  const autoOpenVaccinationViewRef = useRef<number | null>(null);
  useEffect(() => {
    if (!openVaccinationIdForView) return;
    if (autoOpenVaccinationViewRef.current === Number(openVaccinationIdForView)) return;
    const petList = get_pets_data?.pets || [];
    if (!petList.length) return;
    for (let i = 0; i < petList.length; i++) {
      const pet = petList[i];
      const vaccine = (pet.vaccinations || []).find(
        (v: any) => Number(v.id) === Number(openVaccinationIdForView),
      );
      if (vaccine) {
        autoOpenVaccinationViewRef.current = Number(openVaccinationIdForView);
        setSelectedPetIndex(i);
        setExpandedSections(prev => ({ ...prev, vaccination: true }));
        setSelectedVaccination(vaccine);
        setViewVaccinationModalVisible(true);
        break;
      }
    }
  }, [openVaccinationIdForView, get_pets_data]);

  const autoOpenAppointmentViewRef = useRef<number | null>(null);
  useEffect(() => {
    if (!openAppointmentIdForView) return;
    if (autoOpenAppointmentViewRef.current === Number(openAppointmentIdForView)) return;
    const petList = get_pets_data?.pets || [];
    if (!petList.length) return;
    for (let i = 0; i < petList.length; i++) {
      const pet = petList[i];
      const appointment = (pet.vetappointments || []).find(
        (a: any) => Number(a.id) === Number(openAppointmentIdForView),
      );
      if (appointment) {
        autoOpenAppointmentViewRef.current = Number(openAppointmentIdForView);
        setSelectedPetIndex(i);
        setExpandedSections(prev => ({ ...prev, appointments: true }));
        setSelectedAppointment(appointment);
        setViewAppointmentModalVisible(true);
        break;
      }
    }
  }, [openAppointmentIdForView, get_pets_data]);

  const autoOpenIllnessViewRef = useRef<number | null>(null);
  useEffect(() => {
    if (!openIllnessIdForView) return;
    if (autoOpenIllnessViewRef.current === Number(openIllnessIdForView)) return;
    const petList = get_pets_data?.pets || [];
    if (!petList.length) return;
    for (let i = 0; i < petList.length; i++) {
      const pet = petList[i];
      const illness = (pet.illnesses || []).find(
        (ill: any) => Number(ill.id) === Number(openIllnessIdForView),
      );
      if (illness) {
        autoOpenIllnessViewRef.current = Number(openIllnessIdForView);
        setSelectedPetIndex(i);
        setExpandedSections(prev => ({ ...prev, illness: true }));
        setSelectedIllness(illness);
        setViewIllnessModalVisible(true);
        break;
      }
    }
  }, [openIllnessIdForView, get_pets_data]);

  const autoOpenIllnessEditRef = useRef<number | null>(null);
  useEffect(() => {
    if (!openIllnessIdForEdit) return;
    if (autoOpenIllnessEditRef.current === Number(openIllnessIdForEdit)) return;
    const petList = get_pets_data?.pets || [];
    if (!petList.length) return;
    for (const pet of petList) {
      const illness = (pet.illnesses || []).find(
        (i: any) => Number(i.id) === Number(openIllnessIdForEdit),
      );
      if (illness) {
        autoOpenIllnessEditRef.current = Number(openIllnessIdForEdit);
        navigation.navigate('AddPetIllness' as any, {
          illness,
          petId: pet.id,
          isEdit: true,
          fromPetsScreen: true,
        });
        break;
      }
    }
  }, [openIllnessIdForEdit, get_pets_data]);

  const handleDeletePet = (pet: any) => {
    setDeleteItemId(pet.id);
    setDeleteItemType('pet');
    setDeleteModalVisible(true);
  };

  const handleSharePet = (shareData: any): void => {
    const payload: any = {
      ...shareContext,
      users: shareData
    };

    dispatch(sharingSyncService(payload));
  };

  const handleDeleteItem = (
    itemId: number,
    itemType: Exclude<typeof deleteItemType, 'pet' | null>,
  ) => {
    setDeleteItemId(itemId);
    setDeleteItemType(itemType);
    setDeleteModalVisible(true);
  };

  const toggleSection = (section: string) => {
    setExpandedSections(prev => ({ ...prev, [section]: !prev[section] }));
  };

  const confirmDelete = () => {
    const currentPet = pets[selectedPetIndex];
    if (!currentPet) return;

    if (deleteItemType === 'pet' && deleteItemId !== null) {
      dispatch(deletePetAsync(deleteItemId));
    } else if (deleteItemType === 'vaccination' && deleteItemId !== null) {
      dispatch(
        deletePetVaccinationAsync({
          petId: currentPet.id,
          vaccinationId: deleteItemId,
        }),
      ).then(() => dispatch(getPetsAsync(getConnectionTabQueryParams())));
    } else if (deleteItemType === 'medication' && deleteItemId !== null) {
      dispatch(
        deletePetMedicationAsync({
          petId: currentPet.id,
          medicationId: deleteItemId,
        }),
      ).then(() => dispatch(getPetsAsync(getConnectionTabQueryParams())));
    } else if (deleteItemType === 'appointment' && deleteItemId !== null) {
      dispatch(
        deletePetVetAppointmentAsync({
          petId: currentPet.id,
          appointmentId: deleteItemId,
        }),
      ).then(() => dispatch(getPetsAsync(getConnectionTabQueryParams())));
    } else if (deleteItemType === 'illness' && deleteItemId !== null) {
      dispatch(
        deletePetIllnessAsync({
          petId: currentPet.id,
          illnessId: deleteItemId,
        }),
      ).then(() => dispatch(getPetsAsync(getConnectionTabQueryParams())));
    }

    setDeleteModalVisible(false);
    setDeleteItemType(null);
    setDeleteItemId(null);
  };

  const currentPet = pets[selectedPetIndex];

  const handleChipPress = (user: any) => {
    if (selectedSharedUser?.ownerid === user.ownerid) {
      selectedSharedUserRef.current = null;
      setSelectedSharedUser(null);
      setSelectedPetIndex(0);
      dispatch(getPetsAsync(getConnectionTabQueryParams()));
    } else {
      selectedSharedUserRef.current = user;
      setSelectedSharedUser(user);
      setSelectedPetIndex(0);
      dispatch(getPetsAsync({ ownerId: user.ownerid }));
    }
  };

  const getPetShareType = (type?: 'overview' | 'vaccination' | 'medication' | 'appointment' | 'illness'): string => {
    if (type === 'overview') { return 'petoverview'; }
    if (type === 'vaccination') { return 'petvaccination'; }
    if (type === 'medication') { return 'petmedication'; }
    if (type === 'appointment') { return 'petvetappointment'; }
    if (type === 'illness') { return 'petillness'; }
    return 'pet';
  };

  const handleViewVaccination = (vaccine: any) => {
    setSelectedVaccination(vaccine);
    setViewVaccinationModalVisible(true);
  };

  const handleViewMedication = (med: any) => {
    setSelectedMedication(med);
    setViewMedicationModalVisible(true);
  };

  const handleViewAppointment = (apt: any) => {
    setSelectedAppointment(apt);
    setViewAppointmentModalVisible(true);
  };

  const handleViewIllness = (illness: any) => {
    setSelectedIllness(illness);
    setViewIllnessModalVisible(true);
  };

  const handleShare = (resourceId?: number, type?: 'overview' | 'vaccination' | 'medication' | 'appointment' | 'illness'): void => {
    checkSubscription(() => {
      setShareContext({ resourceType: getPetShareType(type), resourceId });
      setShareModalVisible(true);
    }, isBusiness ? 'business' : 'personal');
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


  return (
    <LinearGradient
      colors={[...themeColors.gradient.slice(0, 3), themeColors.background]}
      locations={[0, 0.118, 0.2774, 0.4327, 0.5913]}
      style={commonStyles.container}
    >
      <SafeAreaView style={petsScreenStyles.safeArea}>
        {/* Header */}
        <View style={petsScreenStyles.header}>
          <TouchableOpacity
            style={petsScreenStyles.backButton}
            onPress={() => navigation.goBack()}
          >
            <Ionicons name="chevron-back" size={24} color={themeColors.background} />
          </TouchableOpacity>
        </View>

        {/* Content */}
        <ScrollView
          style={commonStyles.scrollView}
          contentContainerStyle={petsScreenStyles.scrollContent}
        >
          {/* Icon */}
          <View style={petsScreenStyles.iconContainer}>
            <Image source={ICONS.PET_WHITE_ICON} style={petsScreenStyles.petWhiteIcon} />
          </View>

          {/* Title */}
          <Text style={petsScreenStyles.title}>{t('pets.title')}</Text>

          {/* Buttons Row */}
          <View style={petsScreenStyles.buttonsRow}>
            {shouldAllowShare && (
              <PrimaryButton
                icon={<Entypo name="plus" size={20} color={themeColors.textPrimary} />}
                title={t('pets.add_pet')}
                onPress={handleAddPet}
                buttonStyle={petsScreenStyles.addButton}
                textStyle={petsScreenStyles.addButtonText}
              />
            )}

            {pets.length !== 0 && shouldAllowShare && (
              <PrimaryButton
                icon={<Fontisto name="share-a" size={13} color={colors.black} />}
                title={t('pets.share')}
                onPress={() => handleShare()}
                buttonStyle={[petsScreenStyles.shareButton, { backgroundColor: themeColors?.isDark ? getColorWithOpacity(themeColors.primary, 0.8) : getColorWithOpacity(themeColors.primary, 0.5) }]}
                textStyle={[petsScreenStyles.shareButtonText, { color: themeColors?.isDark ? themeColors.background : themeColors.textPrimary }]}
              />

            )}
          </View>

          {/* Shared With You Chips */}
          {!accessLevel && !isFromEmergencyAccess && sharedUsers.length > 0 && (
            <View style={petsScreenStyles.sharedUsersSection}>
              <Text style={petsScreenStyles.sharedUsersHeading}>{'Users Who Shared With You'}</Text>
              <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                style={petsScreenStyles.chipsScrollView}
                contentContainerStyle={petsScreenStyles.chipsRow}
              >
                {sharedUsers.map(user => {
                  const isSelected = selectedSharedUser?.ownerid === user.ownerid;
                  return (
                    <TouchableOpacity
                      key={user.ownerid}
                      style={[petsScreenStyles.chip, isSelected && petsScreenStyles.chipSelected]}
                      onPress={() => handleChipPress(user)}
                    >
                      <Text style={[petsScreenStyles.chipText, isSelected && petsScreenStyles.chipTextSelected]}>
                        {user.firstname} {user.lastname}
                      </Text>
                    </TouchableOpacity>
                  );
                })}
              </ScrollView>
            </View>
          )}

          {/* Loading State */}
          {isLoading && pets.length === 0 && (
            <View style={petsScreenStyles.loadingContainer}>
              <ActivityIndicator size="large" color={themeColors.primary} />
            </View>
          )}

          {/* Empty State */}
          {!isLoading && pets.length === 0 && (
            <View style={petsScreenStyles.emptyStateContainer}>
              <View style={petsScreenStyles.emptyIconCircle}>
                <AntDesign name="exclamation" size={32} color={colors.gray || '#888'} />
              </View>
              <Text style={petsScreenStyles.emptyStateText}>
                {t('pets.no_pets_added')}
              </Text>
              {shouldAllowShare && (
                <Text style={petsScreenStyles.emptyStateSubtext}>
                  {t('pets.click_add_pet')}
                </Text>
              )}
            </View>
          )}

          {/* Pets List */}
          {pets.length > 0 && (
            <View style={petsScreenStyles.petsList}>
              {!selectedSharedUser && (
                <>
                  <Text style={[petsScreenStyles.sectionTitle, { textAlign: 'left' }]}>
                    {t('pets.title')}
                  </Text>
                  <Text style={[petsScreenStyles.sectionSubtitle, { textAlign: 'left' }]}>
                    {t('pets.subtitle')}
                  </Text>
                </>)}

              {selectedSharedUser && (
                <Text style={[petsScreenStyles.sectionTitle, { textAlign: 'left' }]}>
                  {t('pets.title')}
                </Text>
              )}
              {/* Pet Tabs */}
              <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                style={petsScreenStyles.petsTabsContainer}
                contentContainerStyle={petsScreenStyles.petsTabsContent}
              >
                {pets.map((pet: any, index: number) => {
                  const isActive = selectedPetIndex === index;
                  return (
                    <TouchableOpacity
                      key={pet.id}
                      style={[
                        petsScreenStyles.petTab,
                        isActive && { backgroundColor: themeColors.primary },
                      ]}
                      onPress={() => handleSelectPet(index)}
                      activeOpacity={0.7}
                    >
                      <Text
                        style={[
                          petsScreenStyles.petTabText,
                          isActive && petsScreenStyles.petTabTextActive,
                        ]}
                      >
                        {pet.name}
                      </Text>
                    </TouchableOpacity>
                  );
                })}
              </ScrollView>

              {/* Selected Pet Details */}
              {currentPet && (
                <View>
                  {/* Overview Card */}
                  {currentPet.isoverviewonly !== undefined ? currentPet.isoverviewonly ? (
                    <View style={petsScreenStyles.sectionCard}>
                      {/* Overview Header */}
                      <View style={[petsScreenStyles.overviewHeader, !expandedSections.overview && petsScreenStyles.overviewHeaderCollapsed]}>
                        <View style={petsScreenStyles.overviewHeaderLeft}>
                          <Ionicons
                            name="apps-outline"
                            size={20}
                            color={themeColors.textPrimary}
                          />
                          <View style={{ flex: 1, minWidth: 0 }}>
                            <Text
                              style={[petsScreenStyles.overviewTitle, { textAlign: 'left' }]}
                              numberOfLines={1}
                            >
                              {t('pets.overview')}
                            </Text>
                            <Text
                              style={[
                                petsScreenStyles.overviewSubtitle,
                                { textAlign: 'left' },
                              ]}
                              numberOfLines={1}
                            >
                              {t('pets.overview_subtitle')}
                            </Text>
                          </View>
                        </View>
                        <View style={petsScreenStyles.overviewActions}>
                          <TouchableOpacity
                            style={petsScreenStyles.overviewActionButton}
                            onPress={() =>
                              navigation.navigate('EditHistoryList', {
                                entityType: 'Pet',
                                entityId: currentPet.id,
                                title: t('edit_history.title'),
                              })
                            }
                          >
                            <MaterialIcons name="history" size={18} color={themeColors.secondary} />
                          </TouchableOpacity>
                          {shouldAllowShare && (
                            <TouchableOpacity
                              style={petsScreenStyles.overviewActionButton}
                              onPress={() => handleShare(currentPet.id, 'overview')}
                            >
                              <Image
                                source={ICONS.SHARE_PRIMARY_ICON}
                                style={[petsScreenStyles.actionIcon18, { tintColor: themeColors.secondary }]}
                              />
                            </TouchableOpacity>
                          )}
                          {getItemWriteAccess(currentPet) && (
                            <TouchableOpacity
                              style={petsScreenStyles.overviewActionButton}
                              onPress={() => handleEditPet(currentPet)}
                            >
                              <Feather name="edit-2" size={20} color={themeColors.secondary} />
                            </TouchableOpacity>
                          )}
                          {shouldAllowShare && (
                            <TouchableOpacity
                              style={petsScreenStyles.overviewActionButton}
                              onPress={() => handleDeletePet(currentPet)}
                            >
                              <MaterialCommunityIcons name="delete-outline" size={22} color={themeColors.secondary} />
                            </TouchableOpacity>
                          )}
                          <TouchableOpacity
                            style={petsScreenStyles.overviewActionButton}
                            onPress={() => toggleSection('overview')}
                          >
                            <Ionicons
                              name={
                                expandedSections.overview
                                  ? 'chevron-up'
                                  : 'chevron-down'
                              }
                              size={18}
                              color={themeColors.textPrimary}
                            />
                          </TouchableOpacity>
                        </View>
                      </View>

                      {/* Pet Name and Badge */}
                      {expandedSections.overview && (
                        <View style={{ marginTop: 16 }}>
                          <View style={petsScreenStyles.petNameRow}>
                            <Text style={petsScreenStyles.petName}>{currentPet.name}</Text>
                            <View
                              style={[
                                petsScreenStyles.typeBadge,
                                { backgroundColor: themeColors.lightCGreen },
                              ]}
                            >
                              <Text style={petsScreenStyles.typeBadgeText}>
                                {currentPet?.typeother || get_dropdown_options_data?.find((option: any) => String(option.value) === String(currentPet.type))?.label || '-'}
                              </Text>
                            </View>
                          </View>

                          {/* Pet Info */}
                          <Text style={petsScreenStyles.petInfoText}>
                            {currentPet.sex} • {currentPet.breed}
                          </Text>

                          {/* Dates */}
                          <View style={petsScreenStyles.datesRow}>
                            <View style={petsScreenStyles.dateItem}>
                              <Text
                                style={[petsScreenStyles.dateLabel, { textAlign: 'left' }]}
                              >
                                {t('pets.birthday')}
                              </Text>
                              <Text
                                style={[petsScreenStyles.dateValue, { textAlign: 'left' }]}
                              >
                                {formatDate(currentPet.birthday)}
                              </Text>
                            </View>
                            <View style={petsScreenStyles.dateItem}>
                              <Text
                                style={[petsScreenStyles.dateLabel, { textAlign: 'left' }]}
                              >
                                {t('pets.date_of_adoption')}
                              </Text>
                              <Text
                                style={[petsScreenStyles.dateValue, { textAlign: 'left' }]}
                              >
                                {formatDate(currentPet.dateofadoption || currentPet.adoptionDate)}
                              </Text>
                            </View>
                          </View>

                          {/* Food and Allergies */}
                          {currentPet.food && (
                            <View style={petsScreenStyles.datesRow}>
                              <View style={petsScreenStyles.dateItem}>
                                <Text
                                  style={[petsScreenStyles.dateLabel, { textAlign: 'left' }]}
                                >
                                  {t('pets.food_brand')}
                                </Text>
                                <Text
                                  style={[petsScreenStyles.dateValue, { textAlign: 'left' }]}
                                >
                                  {currentPet.food}
                                </Text>
                              </View>
                              <View style={petsScreenStyles.dateItem}>
                                <Text
                                  style={[petsScreenStyles.dateLabel, { textAlign: 'left' }]}
                                >
                                  {t('pets.allergies')}
                                </Text>
                                <Text
                                  style={[petsScreenStyles.dateValue, { textAlign: 'left' }]}
                                >
                                  {currentPet.allergies}
                                </Text>
                              </View>
                            </View>
                          )}

                          {/* Microchipped */}
                          {currentPet.ismicrochipped && (
                            <View style={petsScreenStyles.microchipSection}>
                              <Text
                                style={[petsScreenStyles.sectionLabel, { textAlign: 'left' }]}
                              >
                                {t('pets.microchipped')}
                              </Text>
                              <View style={petsScreenStyles.infoRow}>
                                <View style={petsScreenStyles.infoItem}>
                                  <Text
                                    style={[
                                      petsScreenStyles.infoLabel,
                                      { textAlign: 'left' },
                                    ]}
                                  >
                                    {t('pets.registration_id')}
                                  </Text>
                                  <Text
                                    style={[
                                      petsScreenStyles.infoValue,
                                      { textAlign: 'left' },
                                    ]}
                                  >
                                    {currentPet?.registrationid || 'N/A'}
                                  </Text>
                                </View>
                                <View style={petsScreenStyles.infoItem}>
                                  <Text
                                    style={[
                                      petsScreenStyles.infoLabel,
                                      { textAlign: 'left' },
                                    ]}
                                  >
                                    {t('pets.registered_on')}
                                  </Text>
                                  <Text
                                    style={[
                                      petsScreenStyles.infoValue,
                                      { textAlign: 'left' },
                                    ]}
                                  >
                                    {formatDate(currentPet.registeredon)}
                                  </Text>
                                </View>
                              </View>
                              <View style={petsScreenStyles.infoRow}>
                                <View style={petsScreenStyles.infoItem}>
                                  <Text
                                    style={[
                                      petsScreenStyles.infoLabel,
                                      { textAlign: 'left' },
                                    ]}
                                  >
                                    {t('pets.renewal_date')}
                                  </Text>
                                  <Text
                                    style={[
                                      petsScreenStyles.infoValue,
                                      { textAlign: 'left' },
                                    ]}
                                  >
                                    {formatDate(currentPet.renewaldate)}
                                  </Text>
                                </View>
                                <View style={petsScreenStyles.infoItem}>
                                  <Text
                                    style={[
                                      petsScreenStyles.infoLabel,
                                      { textAlign: 'left' },
                                    ]}
                                  >
                                    {t('pets.issuing_authority')}
                                  </Text>
                                  <Text
                                    style={[
                                      petsScreenStyles.infoValue,
                                      { textAlign: 'left' },
                                    ]}
                                  >
                                    {currentPet.issuingauthority || 'N/A'}
                                  </Text>
                                </View>
                              </View>
                            </View>
                          )}
                        </View>
                      )}

                    </View>
                  ) : (null) : (
                    <View style={petsScreenStyles.sectionCard}>
                      {/* Overview Header */}
                      <View style={[petsScreenStyles.overviewHeader, !expandedSections.overview && petsScreenStyles.overviewHeaderCollapsed]}>
                        <View style={petsScreenStyles.overviewHeaderLeft}>
                          <Ionicons
                            name="apps-outline"
                            size={20}
                            color={themeColors.textPrimary}
                          />
                          <View style={{ flex: 1, minWidth: 0 }}>
                            <Text
                              style={[petsScreenStyles.overviewTitle, { textAlign: 'left' }]}
                              numberOfLines={1}
                            >
                              {t('pets.overview')}
                            </Text>
                            <Text
                              style={[
                                petsScreenStyles.overviewSubtitle,
                                { textAlign: 'left' },
                              ]}
                              numberOfLines={1}
                            >
                              {t('pets.overview_subtitle')}
                            </Text>
                          </View>
                        </View>
                        <View style={petsScreenStyles.overviewActions}>
                          <TouchableOpacity
                            style={petsScreenStyles.overviewActionButton}
                            onPress={() =>
                              navigation.navigate('EditHistoryList', {
                                entityType: 'Pet',
                                entityId: currentPet.id,
                                title: t('edit_history.title'),
                              })
                            }
                          >
                            <MaterialIcons name="history" size={18} color={themeColors.secondary} />
                          </TouchableOpacity>
                          {shouldAllowShare && (
                            <TouchableOpacity
                              style={petsScreenStyles.overviewActionButton}
                              onPress={() => handleShare(currentPet.id, 'overview')}
                            >
                              <Image
                                source={ICONS.SHARE_PRIMARY_ICON}
                                style={[petsScreenStyles.actionIcon18, { tintColor: themeColors.secondary }]}
                              />
                            </TouchableOpacity>
                          )}
                          {getItemWriteAccess(currentPet) && (
                            <TouchableOpacity
                              style={petsScreenStyles.overviewActionButton}
                              onPress={() => handleEditPet(currentPet)}
                            >
                              <Feather name="edit-2" size={20} color={themeColors.secondary} />
                            </TouchableOpacity>
                          )}
                          {shouldAllowShare && (
                            <TouchableOpacity
                              style={petsScreenStyles.overviewActionButton}
                              onPress={() => handleDeletePet(currentPet)}
                            >
                              <MaterialCommunityIcons name="delete-outline" size={22} color={themeColors.secondary} />
                            </TouchableOpacity>
                          )}
                          <TouchableOpacity
                            style={petsScreenStyles.overviewActionButton}
                            onPress={() => toggleSection('overview')}
                          >
                            <Ionicons
                              name={
                                expandedSections.overview
                                  ? 'chevron-up'
                                  : 'chevron-down'
                              }
                              size={18}
                              color={themeColors.textPrimary}
                            />
                          </TouchableOpacity>
                        </View>
                      </View>

                      {/* Pet Name and Badge */}
                      {expandedSections.overview && (
                        <View style={{ marginTop: 16 }}>
                          <View style={petsScreenStyles.petNameRow}>
                            <Text style={petsScreenStyles.petName}>{currentPet.name}</Text>
                            <View
                              style={[
                                petsScreenStyles.typeBadge,
                                { backgroundColor: getColorWithOpacity(themeColors.primary, 0.5) },
                              ]}
                            >
                              <Text style={petsScreenStyles.typeBadgeText}>
                                {currentPet?.typeother || get_dropdown_options_data?.find((option: any) => String(option.value) === String(currentPet.type))?.label || '-'}
                              </Text>
                            </View>
                          </View>

                          {/* Pet Info */}
                          <Text style={petsScreenStyles.petInfoText}>
                            {currentPet.sex} • {currentPet.breed}
                          </Text>

                          {/* Dates */}
                          <View style={petsScreenStyles.datesRow}>
                            <View style={petsScreenStyles.dateItem}>
                              <Text
                                style={[petsScreenStyles.dateLabel, { textAlign: 'left' }]}
                              >
                                {t('pets.birthday')}
                              </Text>
                              <Text
                                style={[petsScreenStyles.dateValue, { textAlign: 'left' }]}
                              >
                                {formatDate(currentPet.birthday)}
                              </Text>
                            </View>
                            <View style={petsScreenStyles.dateItem}>
                              <Text
                                style={[petsScreenStyles.dateLabel, { textAlign: 'left' }]}
                              >
                                {t('pets.date_of_adoption')}
                              </Text>
                              <Text
                                style={[petsScreenStyles.dateValue, { textAlign: 'left' }]}
                              >
                                {formatDate(currentPet.dateofadoption || currentPet.adoptionDate)}
                              </Text>
                            </View>
                          </View>

                          {/* Food and Allergies */}
                          {currentPet.food && (
                            <View style={petsScreenStyles.datesRow}>
                              <View style={petsScreenStyles.dateItem}>
                                <Text
                                  style={[petsScreenStyles.dateLabel, { textAlign: 'left' }]}
                                >
                                  {t('pets.food_brand')}
                                </Text>
                                <Text
                                  style={[petsScreenStyles.dateValue, { textAlign: 'left' }]}
                                >
                                  {currentPet.food}
                                </Text>
                              </View>
                              <View style={petsScreenStyles.dateItem}>
                                <Text
                                  style={[petsScreenStyles.dateLabel, { textAlign: 'left' }]}
                                >
                                  {t('pets.allergies')}
                                </Text>
                                <Text
                                  style={[petsScreenStyles.dateValue, { textAlign: 'left' }]}
                                >
                                  {currentPet.allergies}
                                </Text>
                              </View>
                            </View>
                          )}

                          {/* Microchipped */}
                          {currentPet.ismicrochipped && (
                            <View style={petsScreenStyles.microchipSection}>
                              <Text
                                style={[petsScreenStyles.sectionLabel, { textAlign: 'left' }]}
                              >
                                {t('pets.microchipped')}
                              </Text>
                              <View style={petsScreenStyles.infoRow}>
                                <View style={petsScreenStyles.infoItem}>
                                  <Text
                                    style={[
                                      petsScreenStyles.infoLabel,
                                      { textAlign: 'left' },
                                    ]}
                                  >
                                    {t('pets.microchip_id')}
                                  </Text>
                                  <Text
                                    style={[
                                      petsScreenStyles.infoValue,
                                      { textAlign: 'left' },
                                    ]}
                                  >
                                    {currentPet?.microchipid || 'N/A'}
                                  </Text>
                                </View>
                                <View style={petsScreenStyles.infoItem}>
                                  <Text
                                    style={[
                                      petsScreenStyles.infoLabel,
                                      { textAlign: 'left' },
                                    ]}
                                  >
                                    {t('pets.microchip_registry')}
                                  </Text>
                                  <Text
                                    style={[
                                      petsScreenStyles.infoValue,
                                      { textAlign: 'left' },
                                    ]}
                                  >
                                    {currentPet.microchipregistry}
                                  </Text>
                                </View>
                              </View>
                            </View>
                          )}
                          <View style={petsScreenStyles.infoRow}>
                            <View style={petsScreenStyles.infoItem}>
                              <Text
                                style={[
                                  petsScreenStyles.infoLabel,
                                  { textAlign: 'left' },
                                ]}
                              >
                                {t('pets.registration_id')}
                              </Text>
                              <Text
                                style={[
                                  petsScreenStyles.infoValue,
                                  { textAlign: 'left' },
                                ]}
                              >
                                {currentPet?.registrationid || 'N/A'}
                              </Text>
                            </View>
                            <View style={petsScreenStyles.infoItem}>
                              <Text
                                style={[
                                  petsScreenStyles.infoLabel,
                                  { textAlign: 'left' },
                                ]}
                              >
                                {t('pets.registered_on')}
                              </Text>
                              <Text
                                style={[
                                  petsScreenStyles.infoValue,
                                  { textAlign: 'left' },
                                ]}
                              >
                                {formatDate(currentPet.registeredon)}
                              </Text>
                            </View>
                          </View>
                          <View style={petsScreenStyles.infoRow}>
                            <View style={petsScreenStyles.infoItem}>
                              <Text
                                style={[
                                  petsScreenStyles.infoLabel,
                                  { textAlign: 'left' },
                                ]}
                              >
                                {t('pets.renewal_date')}
                              </Text>
                              <Text
                                style={[
                                  petsScreenStyles.infoValue,
                                  { textAlign: 'left' },
                                ]}
                              >
                                {formatDate(currentPet.renewaldate)}
                              </Text>
                            </View>
                            <View style={petsScreenStyles.infoItem}>
                              <Text
                                style={[
                                  petsScreenStyles.infoLabel,
                                  { textAlign: 'left' },
                                ]}
                              >
                                {t('pets.issuing_authority')}
                              </Text>
                              <Text
                                style={[
                                  petsScreenStyles.infoValue,
                                  { textAlign: 'left' },
                                ]}
                              >
                                {currentPet.issuingauthority || 'N/A'}
                              </Text>
                            </View>
                          </View>
                          {currentPet.photourl && (
                            <MixedMediaDisplayer attachmentIds={currentPet.photourl} />
                          )}
                        </View>
                      )}

                    </View>
                  )}

                  {/* Vaccination Card */}
                  <View style={petsScreenStyles.sectionCard}>
                    <TouchableOpacity
                      style={petsScreenStyles.sectionHeader}
                      activeOpacity={0.7}
                      onPress={() => toggleSection('vaccination')}
                    >
                      <View style={petsScreenStyles.sectionHeaderLeft}>
                        <Image
                          source={ICONS.VACCINATION_ICON}
                          style={petsScreenStyles.sectionIcon}
                        />
                        <View>
                          <Text
                            style={[
                              petsScreenStyles.sectionHeaderTitle,
                              { textAlign: 'left' },
                            ]}
                          >
                            {t('pets.vaccination')}
                          </Text>
                          <Text
                            style={[
                              petsScreenStyles.sectionHeaderSubtitle,
                              { textAlign: 'left' },
                            ]}
                          >
                            {t('pets.vaccination_subtitle')}
                          </Text>
                        </View>
                      </View>
                      <Ionicons
                        name={
                          expandedSections.vaccination
                            ? 'chevron-up'
                            : 'chevron-down'
                        }
                        size={20}
                        color={themeColors.textPrimary}
                      />
                    </TouchableOpacity>

                    {expandedSections.vaccination &&
                      currentPet.vaccinations && (
                        <>
                          {currentPet.vaccinations.map((vaccine: any) => (
                            <TouchableOpacity key={vaccine.id} style={petsScreenStyles.itemCard} activeOpacity={0.8} onPress={() => handleViewVaccination(vaccine)}>
                              <View style={petsScreenStyles.itemHeader}>
                                <Text style={petsScreenStyles.itemTitle}>
                                  {vaccine.vaccinename || vaccine.name}
                                </Text>
                                <View style={petsScreenStyles.itemActions}>
                                  <TouchableOpacity
                                    style={petsScreenStyles.itemActionButton}
                                    onPress={() =>
                                      navigation.navigate('EditHistoryList', {
                                        entityType: 'PetVaccination',
                                        entityId: vaccine.id,
                                        title: t('edit_history.title'),
                                      })
                                    }
                                  >
                                    <MaterialIcons name="history" size={18} color={themeColors.secondary} />
                                  </TouchableOpacity>
                                  {shouldAllowShare && (
                                    <TouchableOpacity
                                      style={petsScreenStyles.itemActionButton}
                                      onPress={() => handleShare(vaccine.id, 'vaccination')}
                                    >
                                      <Image
                                        source={ICONS.SHARE_PRIMARY_ICON}
                                        style={[petsScreenStyles.actionIcon16, { tintColor: themeColors.secondary }]}
                                      />
                                    </TouchableOpacity>
                                  )}
                                  {getItemWriteAccess(currentPet) && (
                                    <TouchableOpacity
                                      style={petsScreenStyles.itemActionButton}
                                      onPress={() =>
                                        navigation.navigate('AddPetVaccination', {
                                          vaccine,
                                          petId: currentPet.id,
                                          isEdit: true,
                                          fromPetsScreen: true,
                                        })
                                      }
                                    >
                                      <Feather name="edit-2" size={18} color={themeColors.secondary} />
                                    </TouchableOpacity>
                                  )}
                                  {shouldAllowShare && (
                                    <TouchableOpacity
                                      style={petsScreenStyles.itemActionButton}
                                      onPress={() =>
                                        handleDeleteItem(
                                          vaccine.id,
                                          'vaccination',
                                        )
                                      }
                                    >
                                      <MaterialCommunityIcons name="delete-outline" size={20} color={themeColors.secondary} />
                                    </TouchableOpacity>
                                  )}
                                </View>
                              </View>
                              <Text style={petsScreenStyles.itemSubtext}>
                                {formatDate(vaccine.dategiven || vaccine.dateGiven)} •{' '}
                                {t('pets.next_date')}:{' '}
                                {formatDate(vaccine.nextdate || vaccine.nextDate)}
                              </Text>
                            </TouchableOpacity>
                          ))}
                          {
                            shouldAllowShare && (
                              <TouchableOpacity
                                style={[
                                  petsScreenStyles.addButtonSection,
                                  { backgroundColor: themeColors.primary },
                                ]}
                                activeOpacity={0.7}
                                onPress={() =>
                                  navigation.navigate('AddPetVaccination', {
                                    petId: currentPet.id,
                                    fromPetsScreen: true,
                                    ...(accessLevel ? { ownerUserId: currentConnectionUserId } : {}),
                                  })
                                }
                              >
                                <Text style={petsScreenStyles.addButtonSectionText}>
                                  {t('pets.add_vaccination')}
                                </Text>
                              </TouchableOpacity>
                            )
                          }
                        </>
                      )}
                  </View >

                  {/* Medications Card */}
                  < View style={petsScreenStyles.sectionCard} >
                    <TouchableOpacity
                      style={petsScreenStyles.sectionHeader}
                      activeOpacity={0.7}
                      onPress={() => toggleSection('medications')}
                    >
                      <View style={petsScreenStyles.sectionHeaderLeft}>
                        <Image
                          source={ICONS.MEDICINE_ICON}
                          style={petsScreenStyles.sectionIcon}
                        />
                        <View>
                          <Text
                            style={[
                              petsScreenStyles.sectionHeaderTitle,
                              { textAlign: 'left' },
                            ]}
                          >
                            {t('pets.medications')}
                          </Text>
                          <Text
                            style={[
                              petsScreenStyles.sectionHeaderSubtitle,
                              { textAlign: 'left' },
                            ]}
                          >
                            {t('pets.medications_subtitle')}
                          </Text>
                        </View>
                      </View>
                      <Ionicons
                        name={
                          expandedSections.medications
                            ? 'chevron-up'
                            : 'chevron-down'
                        }
                        size={20}
                        color={themeColors.textPrimary}
                      />
                    </TouchableOpacity>

                    {
                      expandedSections.medications && currentPet.medications && (
                        <>
                          {currentPet.medications.map((med: any) => (
                            <TouchableOpacity key={med.id} style={petsScreenStyles.itemCard} activeOpacity={0.8} onPress={() => handleViewMedication(med)}>
                              <View style={petsScreenStyles.itemHeader}>
                                <Text style={petsScreenStyles.itemTitle}>{med.name}</Text>
                                <View style={petsScreenStyles.itemActions}>
                                  <TouchableOpacity
                                    style={petsScreenStyles.itemActionButton}
                                    onPress={() =>
                                      navigation.navigate('EditHistoryList', {
                                        entityType: 'PetMedication',
                                        entityId: med.id,
                                        title: t('edit_history.title'),
                                      })
                                    }
                                  >
                                    <MaterialIcons name="history" size={18} color={themeColors.secondary} />
                                  </TouchableOpacity>
                                  {shouldAllowShare && (
                                    <TouchableOpacity
                                      style={petsScreenStyles.itemActionButton}
                                      onPress={() => handleShare(med.id, 'medication')}
                                    >
                                      <Image
                                        source={ICONS.SHARE_PRIMARY_ICON}
                                        style={[petsScreenStyles.actionIcon16, { tintColor: themeColors.secondary }]}
                                      />
                                    </TouchableOpacity>
                                  )}
                                  {getItemWriteAccess(currentPet) && (
                                    <TouchableOpacity
                                      style={petsScreenStyles.itemActionButton}
                                      onPress={() =>
                                        navigation.navigate('AddPetMedication', {
                                          medication: med,
                                          petId: currentPet.id,
                                          isEdit: true,
                                          fromPetsScreen: true,
                                        })
                                      }
                                    >
                                      <Feather name="edit-2" size={18} color={themeColors.secondary} />
                                    </TouchableOpacity>
                                  )}
                                  {shouldAllowShare && (
                                    <TouchableOpacity
                                      style={petsScreenStyles.itemActionButton}
                                      onPress={() =>
                                        handleDeleteItem(med.id, 'medication')
                                      }
                                    >
                                      <MaterialCommunityIcons name="delete-outline" size={20} color={themeColors.secondary} />
                                    </TouchableOpacity>
                                  )}
                                </View>
                              </View >
                            </TouchableOpacity>
                          ))
                          }
                          {
                            shouldAllowShare && (
                              <TouchableOpacity
                                style={[
                                  petsScreenStyles.addButtonSection,
                                  { backgroundColor: themeColors.primary },
                                ]}
                                activeOpacity={0.7}
                                onPress={() =>
                                  navigation.navigate('AddPetMedication', {
                                    petId: currentPet.id,
                                    fromPetsScreen: true,
                                    ...(accessLevel ? { ownerUserId: currentConnectionUserId } : {}),
                                  })
                                }
                              >
                                <Text style={petsScreenStyles.addButtonSectionText}>
                                  {t('pets.add_medication')}
                                </Text>
                              </TouchableOpacity>
                            )
                          }
                        </>
                      )}
                  </View >

                  {/* Vet Appointments Card */}
                  <View style={petsScreenStyles.sectionCard} >
                    <TouchableOpacity
                      style={petsScreenStyles.sectionHeader}
                      activeOpacity={0.7}
                      onPress={() => toggleSection('appointments')}
                    >
                      <View style={petsScreenStyles.sectionHeaderLeft}>
                        <Image
                          source={ICONS.CALENDER_ICON}
                          style={petsScreenStyles.sectionIcon}
                        />
                        <View>
                          <Text
                            style={[
                              petsScreenStyles.sectionHeaderTitle,
                              { textAlign: 'left' },
                            ]}
                          >
                            {t('pets.vet_appointments')}
                          </Text>
                          <Text
                            style={[
                              petsScreenStyles.sectionHeaderSubtitle,
                              { textAlign: 'left' },
                            ]}
                          >
                            {t('pets.vet_appointments_subtitle')}
                          </Text>
                        </View>
                      </View>
                      <Ionicons
                        name={
                          expandedSections.appointments
                            ? 'chevron-up'
                            : 'chevron-down'
                        }
                        size={20}
                        color={themeColors.textPrimary}
                      />
                    </TouchableOpacity>

                    {
                      expandedSections.appointments &&
                      currentPet.vetappointments && (
                        <>
                          {currentPet.vetappointments.map((apt: any) => (
                            <TouchableOpacity key={apt.id} style={petsScreenStyles.itemCard} activeOpacity={0.8} onPress={() => handleViewAppointment(apt)}>
                              <View style={petsScreenStyles.itemHeader}>
                                <View style={petsScreenStyles.itemHeaderLeft}>
                                  <Text style={petsScreenStyles.itemTitle}>
                                    {apt.clinic} {formatDate(apt.date)}
                                  </Text>
                                  {apt.vet ? (
                                    <Text style={petsScreenStyles.itemSubtext}>
                                      {apt.vet}{apt.time ? ` • ${convert24HourTo12Hour(apt.time)}` : ''}
                                    </Text>
                                  ) : apt.time ? (
                                    <Text style={petsScreenStyles.itemSubtext}>{convert24HourTo12Hour(apt.time)}</Text>
                                  ) : null}
                                </View>
                                <View style={petsScreenStyles.itemActions}>
                                  <TouchableOpacity
                                    style={petsScreenStyles.itemActionButton}
                                    onPress={() =>
                                      navigation.navigate('EditHistoryList', {
                                        entityType: 'PetVetAppointment',
                                        entityId: apt.id,
                                        title: t('edit_history.title'),
                                      })
                                    }
                                  >
                                    <MaterialIcons name="history" size={18} color={themeColors.secondary} />
                                  </TouchableOpacity>
                                  {shouldAllowShare && (
                                    <TouchableOpacity
                                      style={petsScreenStyles.itemActionButton}
                                      onPress={() => handleShare(apt.id, 'appointment')}
                                    >
                                      <Image
                                        source={ICONS.SHARE_PRIMARY_ICON}
                                        style={[petsScreenStyles.actionIcon16, { tintColor: themeColors.secondary }]}
                                      />
                                    </TouchableOpacity>
                                  )}
                                  {getItemWriteAccess(currentPet) && (
                                    <TouchableOpacity
                                      style={petsScreenStyles.itemActionButton}
                                      onPress={() =>
                                        navigation.navigate(
                                          'AddPetVetAppointments',
                                          {
                                            appointment: apt,
                                            petId: currentPet.id,
                                            isEdit: true,
                                            fromPetsScreen: true,
                                          },
                                        )
                                      }
                                    >
                                      <Feather name="edit-2" size={18} color={themeColors.secondary} />
                                    </TouchableOpacity>
                                  )}
                                  {shouldAllowShare && (
                                    <TouchableOpacity
                                      style={petsScreenStyles.itemActionButton}
                                      onPress={() =>
                                        handleDeleteItem(apt.id, 'appointment')
                                      }
                                    >
                                      <MaterialCommunityIcons name="delete-outline" size={20} color={themeColors.secondary} />
                                    </TouchableOpacity>
                                  )}
                                </View>
                              </View>
                              <Text style={petsScreenStyles.itemSubtext}>
                                {t('pets.reason')}: {apt.reason}{' '}
                                {t('pets.outcome')}: {apt.outcome}
                              </Text>
                              <Text style={petsScreenStyles.itemSubtext}>
                                {t('pets.next_steps')}:{' '}
                                {apt.nextsteps || apt.nextSteps}
                              </Text>
                              {
                                apt.notes && (
                                  <Text style={petsScreenStyles.itemNotes}>
                                    {t('pets.notes')}: {apt.notes}
                                  </Text>
                                )
                              }
                            </TouchableOpacity>
                          ))
                          }
                          {
                            shouldAllowShare && (
                              <TouchableOpacity
                                style={[
                                  petsScreenStyles.addButtonSection,
                                  { backgroundColor: themeColors.primary },
                                ]}
                                activeOpacity={0.7}
                                onPress={() =>
                                  navigation.navigate('AddPetVetAppointments', {
                                    petId: currentPet.id,
                                    fromPetsScreen: true,
                                    ...(accessLevel ? { ownerUserId: currentConnectionUserId } : {}),
                                  })
                                }
                              >
                                <Text style={petsScreenStyles.addButtonSectionText}>
                                  {t('pets.add_vet_appointments')}
                                </Text>
                              </TouchableOpacity>
                            )
                          }
                        </>
                      )}
                  </View >

                  {/* Illness Card */}
                  <View style={petsScreenStyles.sectionCard} >
                    <TouchableOpacity
                      style={petsScreenStyles.sectionHeader}
                      activeOpacity={0.7}
                      onPress={() => toggleSection('illness')}
                    >
                      <View style={petsScreenStyles.sectionHeaderLeft}>
                        <Image
                          source={ICONS.VIRUS_ICON}
                          style={petsScreenStyles.sectionIcon}
                        />
                        <View>
                          <Text
                            style={[
                              petsScreenStyles.sectionHeaderTitle,
                              { textAlign: 'left' },
                            ]}
                          >
                            {t('pets.illness_conditions')}
                          </Text>
                          <Text
                            style={[
                              petsScreenStyles.sectionHeaderSubtitle,
                              { textAlign: 'left' },
                            ]}
                          >
                            {t('pets.illness_subtitle')}
                          </Text>
                        </View>
                      </View>
                      <Ionicons
                        name={
                          expandedSections.illness
                            ? 'chevron-up'
                            : 'chevron-down'
                        }
                        size={20}
                        color={themeColors.textPrimary}
                      />
                    </TouchableOpacity>

                    {expandedSections.illness && currentPet.illnesses && (
                      <>
                        {currentPet.illnesses.map((illness: any) => (
                          <TouchableOpacity key={illness.id} style={petsScreenStyles.itemCard} activeOpacity={0.8} onPress={() => handleViewIllness(illness)}>
                            <View style={petsScreenStyles.itemHeader}>
                              <Text style={petsScreenStyles.itemTitle}>
                                {illness.diagnosis} {formatDate(illness.date)}
                              </Text>
                              <View style={petsScreenStyles.itemActions}>
                                <TouchableOpacity
                                  style={petsScreenStyles.itemActionButton}
                                  onPress={() =>
                                    navigation.navigate('EditHistoryList', {
                                      entityType: 'PetIllness',
                                      entityId: illness.id,
                                      title: t('edit_history.title'),
                                    })
                                  }
                                >
                                  <MaterialIcons name="history" size={18} color={themeColors.secondary} />
                                </TouchableOpacity>
                                {shouldAllowShare && (
                                  <TouchableOpacity
                                    style={petsScreenStyles.itemActionButton}
                                    onPress={() => handleShare(illness.id, 'illness')}
                                  >
                                    <Image
                                      source={ICONS.SHARE_PRIMARY_ICON}
                                      style={[petsScreenStyles.actionIcon16, { tintColor: themeColors.secondary }]}
                                    />
                                  </TouchableOpacity>
                                )}
                                {getItemWriteAccess(currentPet) && (
                                  <TouchableOpacity
                                    style={petsScreenStyles.itemActionButton}
                                    onPress={() =>
                                      navigation.navigate('AddPetIllness', {
                                        illness,
                                        petId: currentPet.id,
                                        isEdit: true,
                                        fromPetsScreen: true,
                                      })
                                    }
                                  >
                                    <Feather name="edit-2" size={18} color={themeColors.secondary} />
                                  </TouchableOpacity>
                                )}
                                {shouldAllowShare && (
                                  <TouchableOpacity
                                    style={petsScreenStyles.itemActionButton}
                                    onPress={() =>
                                      handleDeleteItem(illness.id, 'illness')
                                    }
                                  >
                                    <MaterialCommunityIcons name="delete-outline" size={20} color={themeColors.secondary} />
                                  </TouchableOpacity>
                                )}
                              </View>
                            </View>
                            <Text style={petsScreenStyles.itemSubtext}>
                              {t('pets.diagnosis')}: {illness.diagnosis}
                            </Text>
                            {illness.treatments ? (
                              <Text style={petsScreenStyles.itemSubtext}>
                                {t('pets.treatment')}: {illness.treatments}
                              </Text>
                            ) : null}
                            {illness.notes && (
                              <Text style={petsScreenStyles.itemNotes}>
                                {t('pets.notes')}: {illness.notes}
                              </Text>
                            )}
                          </TouchableOpacity>
                        ))
                        }
                        {
                          shouldAllowShare && (
                            <TouchableOpacity
                              style={[
                                petsScreenStyles.addButtonSection,
                                { backgroundColor: themeColors.primary },
                              ]}
                              activeOpacity={0.7}
                              onPress={() =>
                                navigation.navigate('AddPetIllness', {
                                  petId: currentPet.id,
                                  fromPetsScreen: true,
                                  ...(accessLevel ? { ownerUserId: currentConnectionUserId } : {}),
                                })
                              }
                            >
                              <Text style={petsScreenStyles.addButtonSectionText}>
                                {t('pets.add_illness')}
                              </Text>
                            </TouchableOpacity>
                          )
                        }
                      </>
                    )}
                  </View >

                  {/* Linked records of this pet */}
                  <View style={[petsScreenStyles.sectionCard, { padding: 12 }]}>
                    <LinkedRecordsButton
                      variant="button"
                      record={currentPet?.id ? { moduleKey: 'pet', id: Number(currentPet.id) } : null}
                      title={currentPet?.name || currentPet?.petname}
                      canEdit={!accessLevel && !isFromEmergencyAccess}
                    />
                  </View>
                </View >
              )}
            </View >
          )}
        </ScrollView >
      </SafeAreaView >

      {/* Modals */}
      <ShareModal
        visible={shareModalVisible}
        onClose={() => setShareModalVisible(false)}
        onShare={handleSharePet}
        title={t('pets.share_pets')}
        loading={sharingLoading}
        resourceType={shareContext.resourceType}
        resourceId={shareContext.resourceId}
      />

      <DeleteConfirmModal
        visible={deleteModalVisible}
        onClose={() => setDeleteModalVisible(false)}
        onConfirm={confirmDelete}
        title={t('modals.delete_confirm')}
      />

      <ViewPetVaccinationModal
        visible={viewVaccinationModalVisible}
        onClose={() => { setViewVaccinationModalVisible(false); setSelectedVaccination(null); }}
        vaccination={selectedVaccination}
        linkTabs={{ record: selectedVaccination?.id ? { moduleKey: 'petvaccination', id: Number(selectedVaccination.id) } : null, canEdit: !accessLevel }}
      />

      <ViewPetMedicationModal
        visible={viewMedicationModalVisible}
        onClose={() => { setViewMedicationModalVisible(false); setSelectedMedication(null); }}
        medication={selectedMedication}
        linkTabs={{ record: selectedMedication?.id ? { moduleKey: 'petmedication', id: Number(selectedMedication.id) } : null, canEdit: !accessLevel }}
      />

      <ViewPetVetAppointmentModal
        visible={viewAppointmentModalVisible}
        onClose={() => { setViewAppointmentModalVisible(false); setSelectedAppointment(null); }}
        appointment={selectedAppointment}
        linkTabs={{ record: selectedAppointment?.id ? { moduleKey: 'petvetappointment', id: Number(selectedAppointment.id) } : null, canEdit: !accessLevel }}
      />

      <ViewPetIllnessModal
        visible={viewIllnessModalVisible}
        onClose={() => { setViewIllnessModalVisible(false); setSelectedIllness(null); }}
        illness={selectedIllness}
        linkTabs={{ record: selectedIllness?.id ? { moduleKey: 'petillness', id: Number(selectedIllness.id) } : null, canEdit: !accessLevel }}
      />
      {GateModal}
    </LinearGradient >
  );
};

export default PetsScreen;
