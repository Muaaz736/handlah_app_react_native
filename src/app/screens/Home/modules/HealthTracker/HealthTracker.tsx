import {
  Alert,
  Image,
  ScrollView,
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
} from 'react-native';
import React, { useEffect, useState, useRef, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { SafeAreaView } from 'react-native-safe-area-context';
import LinearGradient from 'react-native-linear-gradient';
import { useUserRole } from '../../../../../hooks/useUserRole';
import { useSubscriptionGate } from '../../../../../hooks/useSubscriptionGate';
import {
  AuthHeader,
  DeleteConfirmModal,
  PrimaryButton,
  ShareModal,
  ViewSubscriptionModal,
  AddChildModal,
  ViewCaregiverModal,
  ViewPatientModal,
  ViewDoctorModal,
  ViewMedicationModal,
  ViewAppointmentModal,
  ViewIllnessModal,
  ViewSurgeryModal,
} from '../../../../../components/common';
import { useFocusEffect, useNavigation, useRoute } from '@react-navigation/native';
import { ICONS } from '../../../../../utils/Images';
import colors, { getColorWithOpacity } from '../../../../../utils/colors';
import FONTS from '../../../../../utils/fonts';
import Entypo from 'react-native-vector-icons/Entypo';
import Fontisto from 'react-native-vector-icons/Fontisto';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import Feather from 'react-native-vector-icons/Feather';
import AntDesign from 'react-native-vector-icons/AntDesign';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { isIOS } from '../../../../../utils/helpers';
import { useSelectedBusiness } from '../../../../../hooks/useSelectedBusiness';
import { Appointment, Doctor, Caregiver, Medication, Patient, Illness, Surgery } from './HealthTracker.types';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useDispatch, useSelector } from 'react-redux';
import {
  addChildAppointmentAsync,
  getChildrenAsync,
  getChildrenAsCaregiverAsync,
  getChildByIdAsync,
  deleteChildAsync,
  deleteChildAppointmentAsync,
  deleteChildCaregiverAsync,
  deleteChildDoctorAsync,
  deleteChildMedicationAsync,
  deleteChildIllnessAsync,
  deleteChildSurgeryAsync,
} from '../../../../../redux/services/essentialsService';
import { ASYNC_STATUS } from '../../../../../config/constants';
import { sharingSyncService, getSharedByUsers } from '../../../../../redux/services/sharingService';
import { resetShareSyncStatus } from '../../../../../redux/slices/sharingSlice';
import { getModuleWriteAccess, getEntityWriteAccess } from '../../../../../utils/accessLevel';
import { AppDispatch } from '../../../../../types/store.types';
import { makeCommonStyles, makeHealthTrackerStyles } from './HealthTracker.styles';
import { RoleTheme } from '../../../../../types/roleManager.types';
import { darkenColor } from '../../../../../utils/roleManager';

// Generic item type for delete modal
interface DeleteItem {
  name?: string;
  doctorName?: string;
  type: string;
  [key: string]: any;
}

// Generic item type for view modal
interface ViewItem {
  name: string;
  email: string;
  password: string;
}

type RootStackParamList = {
  EditHistoryList: {
    entityType: string;
    entityId: number;
    title: string;
  };
  EditOverView: {
    childId: number;
    overview: {
      bloodType?: string;
      keyDiagnosis?: string;
      allergies?: string;
      recentSurgeries?: string;
      endDate?: string;
      dateofbirth?: string;
      isMyself?: boolean;
    }
  };
  EditCaregiver: { caregiver: any };
  EditMedication: { medication: any };
  EditDoctor: { doctor: any };
  EditAppointment: { appointment: any };
  AddCaregiver: { childId: string };
  AddMedication: { childId: string };
  AddDoctor: { childId: string };
  AddAppointment: { childId: string };
  AddIllness: { childId: string; ownerUserId?: number; illness?: any; isEdit?: boolean };
  AddSurgery: { childId: string; ownerUserId?: number; surgery?: any; isEdit?: boolean };
};


const HealthTracker = () => {
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const dispatch = useDispatch<AppDispatch>();
  const { t, i18n } = useTranslation();
  const isRTL = i18n.language === 'ar';
  const { themeColors, isBusinessRole } = useUserRole();
  const styles = useMemo(() => makeHealthTrackerStyles(themeColors as RoleTheme), [themeColors]);
  const commonStyles = useMemo(() => makeCommonStyles(themeColors as RoleTheme), [themeColors]);
  const { checkSubscription, GateModal } = useSubscriptionGate();
  const { selectedBusinessId } = useSelectedBusiness();
  const isBusiness = isBusinessRole();
  const route = useRoute<any>();
  const { from, connectionTabSource, sharedWithUserId, ownerId, accessLevel, accessType, openEntityId, openParentEntityId, openAddChildModal, openMedicationIdForEdit, openCaregiverIdForEdit, openDoctorIdForEdit, openAppointmentIdForEdit, openIllnessIdForEdit, openSurgeryIdForEdit, openAppointmentIdForView, openMedicationIdForView, openCaregiverIdForView, openDoctorIdForView, openIllnessIdForView, openSurgeryIdForView } = route.params || {};
  const isFromEmergencyAccess = from === 'emergency_access';
  const isOwnData = !accessLevel;
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

  // Health data permissions (only applies to own data, not viewed-via-connection data)
  const healthdatacollection = useSelector((state: any) => state.user_auth?.user_data?.healthdatacollection ?? false);
  const healthdatasharing = useSelector((state: any) => state.user_auth?.user_data?.healthdatasharing ?? false);
  const healthCollectionEnabled = !isOwnData || healthdatacollection;
  const canShare = shouldAllowShare && (!isOwnData || healthdatasharing);

  // Redux state
  const {
    get_children_status,
    get_children_data,
    get_children_as_caregiver_data,
    update_child_status,
    get_child_by_id_status,
    get_child_by_id_data,
  } = useSelector((state: any) => state.essentials_slice);
  const { share_sync_status } = useSelector((state: any) => state.sharing_slice);
  const isLoadingChildren = get_children_status === ASYNC_STATUS.LOADING;
  const isLoadingChildDetails = get_child_by_id_status === ASYNC_STATUS.LOADING;
  const sharingLoading = share_sync_status === ASYNC_STATUS.LOADING;

  const noBusinessInBusinessMode = isBusiness && !selectedBusinessId && !isFromEmergencyAccess;
  const children = noBusinessInBusinessMode ? [] : ((get_children_data?.children || []).slice().sort((a: any, b: any) => {
    if (a.ismyself === b.ismyself) return 0;
    return a.ismyself ? -1 : 1;
  }));
  const caregiverChildrenRaw = noBusinessInBusinessMode ? [] : (get_children_as_caregiver_data?.children || []);
  const caregiverChildren = caregiverChildrenRaw
    .filter((child: any) => !children.some((c: any) => c.id === child.id))
    .slice().sort((a: any, b: any) => {
      if (a.ismyself === b.ismyself) return 0;
      return a.ismyself ? -1 : 1;
    });

  const [shareModalVisible, setShareModalVisible] = useState<boolean>(false);
  const [deleteModalVisible, setDeleteModalVisible] = useState<boolean>(false);
  const [viewModalVisible, setViewModalVisible] = useState<boolean>(false);
  const [addChildModalVisible, setAddChildModalVisible] = useState<boolean>(false);
  const [addMyselfModalVisible, setAddMyselfModalVisible] = useState<boolean>(false);
  const [viewCaregiverModalVisible, setViewCaregiverModalVisible] = useState<boolean>(false);
  const [viewPatientModalVisible, setViewPatientModalVisible] = useState<boolean>(false);
  const [viewDoctorModalVisible, setViewDoctorModalVisible] = useState<boolean>(false);
  const [viewMedicationModalVisible, setViewMedicationModalVisible] = useState<boolean>(false);
  const [viewAppointmentModalVisible, setViewAppointmentModalVisible] = useState<boolean>(false);
  const [viewIllnessModalVisible, setViewIllnessModalVisible] = useState<boolean>(false);
  const [viewSurgeryModalVisible, setViewSurgeryModalVisible] = useState<boolean>(false);
  const [selectedItem, setSelectedItem] = useState<ViewItem | null>(null);
  const [selectedCaregiver, setSelectedCaregiver] = useState<Caregiver | null>(null);
  const [selectedPatientData, setSelectedPatientData] = useState<Patient | null>(null);
  const [selectedDoctor, setSelectedDoctor] = useState<Doctor | null>(null);
  const [selectedMedication, setSelectedMedication] = useState<Medication | null>(null);
  const [selectedAppointment, setSelectedAppointment] = useState<Appointment | null>(null);
  const [selectedIllness, setSelectedIllness] = useState<Illness | null>(null);
  const [selectedSurgery, setSelectedSurgery] = useState<Surgery | null>(null);
  const [selectedChild, setSelectedChild] = useState<any>(null);
  const [deleteItem, setDeleteItem] = useState<DeleteItem | null>(null);
  const [shareContext, setShareContext] = useState<{
    resourceType: string;
    resourceId?: number;
  }>({ resourceType: 'healthtracker' });
  const [sharedUsers, setSharedUsers] = useState<any[]>([]);

  // Collapsible states
  const [overviewExpanded, setOverviewExpanded] = useState<boolean>(true);
  const [caregiversExpanded, setCaregiversExpanded] = useState<boolean>(true);
  const [medicationsExpanded, setMedicationsExpanded] = useState<boolean>(true);
  const [doctorsExpanded, setDoctorsExpanded] = useState<boolean>(true);
  const [appointmentsExpanded, setAppointmentsExpanded] = useState<boolean>(true);
  const [illnessesExpanded, setIllnessesExpanded] = useState<boolean>(true);
  const [surgeriesExpanded, setSurgeriesExpanded] = useState<boolean>(true);

  // Fetch children on mount
  useFocusEffect(
    React.useCallback(() => {
      if (isBusiness && !selectedBusinessId && !isFromEmergencyAccess) {
        return;
      }

      if (isFromEmergencyAccess && currentConnectionUserId) {
        dispatch(getChildrenAsync({ currentConnectionUserId, ...getConnectionTabQueryParams() }));
        dispatch(getChildrenAsCaregiverAsync({ currentConnectionUserId, ...getConnectionTabQueryParams() }));
      } else {
        dispatch(getChildrenAsync(
          selectedSharedUserRef.current ? { ownerId: selectedSharedUserRef.current.ownerid } : getConnectionTabQueryParams()
        ));
        dispatch(getChildrenAsCaregiverAsync(getConnectionTabQueryParams()));
      }
      if (!accessLevel && !isFromEmergencyAccess) {
        dispatch(getSharedByUsers({ module: 'healthtracker' })).then((action: any) => {
          const users = action?.payload?.users || [];
          setSharedUsers(users);
        });
      }
    }, [dispatch, update_child_status, isBusiness, selectedBusinessId])
  );
  const autoSelectedChildRef = useRef<number | null>(null);
  useEffect(() => {
    if (children.length === 0) return;
    const deepLinkChildId = openParentEntityId ?? openEntityId;
    if (deepLinkChildId != null && autoSelectedChildRef.current !== Number(deepLinkChildId)) {
      const match = children.find((c: any) => Number(c.id) === Number(deepLinkChildId));
      if (match) {
        autoSelectedChildRef.current = Number(deepLinkChildId);
        setSelectedChild(match);
        return;
      }
    }
    if (!selectedChild || !children.some((c: any) => c.id === selectedChild?.id)) {
      setSelectedChild(children[0]);
    }
  }, [get_children_data, openParentEntityId, openEntityId]);


  useFocusEffect(
    React.useCallback(() => {
      if (selectedChild?.id && get_children_status === ASYNC_STATUS.SUCCEEDED) {
        const ownerParam = selectedSharedUserRef.current ? { ownerId: selectedSharedUserRef.current.ownerid } : {};
        if (isFromEmergencyAccess && currentConnectionUserId) {
          dispatch(getChildByIdAsync({ childId: selectedChild.id.toString(), currentConnectionUserId, ...getConnectionTabQueryParams(), silentError: true }));
        } else {
          dispatch(getChildByIdAsync({ childId: selectedChild.id.toString(), ...ownerParam, silentError: true }));
        }
      }
    }, [dispatch, selectedChild?.id, get_children_status]),
  );

  // Get selected child's data from detailed API response
  const selectedChildData = get_child_by_id_data || selectedChild || (children.length > 0 ? children[0] : null);
  const isCaregiverChildSelected = !!selectedChildData?.id && caregiverChildren.some((c: any) => c.id === selectedChildData.id);

  // Deep-link support: an insight suggesting a new dependent opens the "Add
  // Child" modal directly, no waiting on any child record to load.
  const autoOpenAddChildRef = useRef<boolean>(false);
  useEffect(() => {
    if (!openAddChildModal || autoOpenAddChildRef.current) return;
    autoOpenAddChildRef.current = true;
    checkSubscription(() => setAddChildModalVisible(true), isBusiness ? 'business' : 'personal');
  }, [openAddChildModal]);

  // Deep-link support: a reminder's "Update Record" action lands here first
  // (to select the right child), then continues straight into the medication's
  // edit form once that child's full record — including its medications — loads.
  const autoOpenMedicationEditRef = useRef<number | null>(null);
  useEffect(() => {
    if (!openMedicationIdForEdit) return;
    if (autoOpenMedicationEditRef.current === Number(openMedicationIdForEdit)) return;
    if (get_child_by_id_status !== ASYNC_STATUS.SUCCEEDED) return;
    const match = (get_child_by_id_data?.medications || []).find(
      (m: any) => Number(m.id) === Number(openMedicationIdForEdit),
    );
    if (match) {
      autoOpenMedicationEditRef.current = Number(openMedicationIdForEdit);
      checkSubscription(() => navigation.navigate('EditMedication', { medication: match }), isBusiness ? 'business' : 'personal');
    }
  }, [openMedicationIdForEdit, get_child_by_id_status, get_child_by_id_data]);

  const autoOpenMedicationViewRef = useRef<number | null>(null);
  useEffect(() => {
    if (!openMedicationIdForView) return;
    if (autoOpenMedicationViewRef.current === Number(openMedicationIdForView)) return;
    if (get_child_by_id_status !== ASYNC_STATUS.SUCCEEDED) return;
    const match = (get_child_by_id_data?.medications || []).find(
      (m: any) => Number(m.id) === Number(openMedicationIdForView),
    );
    if (match) {
      autoOpenMedicationViewRef.current = Number(openMedicationIdForView);
      setSelectedMedication(match as Medication);
      setViewMedicationModalVisible(true);
    }
  }, [openMedicationIdForView, get_child_by_id_status, get_child_by_id_data]);

  const autoOpenCaregiverEditRef = useRef<number | null>(null);
  useEffect(() => {
    if (!openCaregiverIdForEdit) return;
    if (autoOpenCaregiverEditRef.current === Number(openCaregiverIdForEdit)) return;
    if (get_child_by_id_status !== ASYNC_STATUS.SUCCEEDED) return;
    const match = (get_child_by_id_data?.caregivers || []).find(
      (c: any) => Number(c.id) === Number(openCaregiverIdForEdit),
    );
    if (match) {
      autoOpenCaregiverEditRef.current = Number(openCaregiverIdForEdit);
      checkSubscription(() => navigation.navigate('EditCaregiver', { caregiver: match }), isBusiness ? 'business' : 'personal');
    }
  }, [openCaregiverIdForEdit, get_child_by_id_status, get_child_by_id_data]);

  const autoOpenCaregiverViewRef = useRef<number | null>(null);
  useEffect(() => {
    if (!openCaregiverIdForView) return;
    if (autoOpenCaregiverViewRef.current === Number(openCaregiverIdForView)) return;
    if (get_child_by_id_status !== ASYNC_STATUS.SUCCEEDED) return;
    const match = (get_child_by_id_data?.caregivers || []).find(
      (c: any) => Number(c.id) === Number(openCaregiverIdForView),
    );
    if (match) {
      autoOpenCaregiverViewRef.current = Number(openCaregiverIdForView);
      setSelectedCaregiver(match as Caregiver);
      setViewCaregiverModalVisible(true);
    }
  }, [openCaregiverIdForView, get_child_by_id_status, get_child_by_id_data]);

  const autoOpenDoctorEditRef = useRef<number | null>(null);
  useEffect(() => {
    if (!openDoctorIdForEdit) return;
    if (autoOpenDoctorEditRef.current === Number(openDoctorIdForEdit)) return;
    if (get_child_by_id_status !== ASYNC_STATUS.SUCCEEDED) return;
    const match = (get_child_by_id_data?.doctors || []).find(
      (d: any) => Number(d.id) === Number(openDoctorIdForEdit),
    );
    if (match) {
      autoOpenDoctorEditRef.current = Number(openDoctorIdForEdit);
      checkSubscription(() => navigation.navigate('EditDoctor', { doctor: match }), isBusiness ? 'business' : 'personal');
    }
  }, [openDoctorIdForEdit, get_child_by_id_status, get_child_by_id_data]);

  const autoOpenDoctorViewRef = useRef<number | null>(null);
  useEffect(() => {
    if (!openDoctorIdForView) return;
    if (autoOpenDoctorViewRef.current === Number(openDoctorIdForView)) return;
    if (get_child_by_id_status !== ASYNC_STATUS.SUCCEEDED) return;
    const match = (get_child_by_id_data?.doctors || []).find(
      (d: any) => Number(d.id) === Number(openDoctorIdForView),
    );
    if (match) {
      autoOpenDoctorViewRef.current = Number(openDoctorIdForView);
      setSelectedDoctor(match as Doctor);
      setViewDoctorModalVisible(true);
    }
  }, [openDoctorIdForView, get_child_by_id_status, get_child_by_id_data]);

  const autoOpenAppointmentEditRef = useRef<number | null>(null);
  useEffect(() => {
    if (!openAppointmentIdForEdit) return;
    if (autoOpenAppointmentEditRef.current === Number(openAppointmentIdForEdit)) return;
    if (get_child_by_id_status !== ASYNC_STATUS.SUCCEEDED) return;
    const match = (get_child_by_id_data?.appointments || []).find(
      (a: any) => Number(a.id) === Number(openAppointmentIdForEdit),
    );
    if (match) {
      autoOpenAppointmentEditRef.current = Number(openAppointmentIdForEdit);
      checkSubscription(() => navigation.navigate('EditAppointment', { appointment: match }), isBusiness ? 'business' : 'personal');
    }
  }, [openAppointmentIdForEdit, get_child_by_id_status, get_child_by_id_data]);

  const autoOpenAppointmentViewRef = useRef<number | null>(null);
  useEffect(() => {
    if (!openAppointmentIdForView) return;
    if (autoOpenAppointmentViewRef.current === Number(openAppointmentIdForView)) return;
    if (get_child_by_id_status !== ASYNC_STATUS.SUCCEEDED) return;
    const match = (get_child_by_id_data?.appointments || []).find(
      (a: any) => Number(a.id) === Number(openAppointmentIdForView),
    );
    if (match) {
      autoOpenAppointmentViewRef.current = Number(openAppointmentIdForView);
      setSelectedAppointment(match as Appointment);
      setViewAppointmentModalVisible(true);
    }
  }, [openAppointmentIdForView, get_child_by_id_status, get_child_by_id_data]);

  const autoOpenIllnessEditRef = useRef<number | null>(null);
  useEffect(() => {
    if (!openIllnessIdForEdit) return;
    if (autoOpenIllnessEditRef.current === Number(openIllnessIdForEdit)) return;
    if (get_child_by_id_status !== ASYNC_STATUS.SUCCEEDED) return;
    const match = (get_child_by_id_data?.illnesses || []).find(
      (i: any) => Number(i.id) === Number(openIllnessIdForEdit),
    );
    if (match) {
      autoOpenIllnessEditRef.current = Number(openIllnessIdForEdit);
      checkSubscription(() => navigation.navigate('AddIllness', {
        childId: get_child_by_id_data?.id,
        ...(accessLevel ? { ownerUserId: currentConnectionUserId } : {}),
        illness: match,
        isEdit: true,
      }), isBusiness ? 'business' : 'personal');
    }
  }, [openIllnessIdForEdit, get_child_by_id_status, get_child_by_id_data]);

  const autoOpenIllnessViewRef = useRef<number | null>(null);
  useEffect(() => {
    if (!openIllnessIdForView) return;
    if (autoOpenIllnessViewRef.current === Number(openIllnessIdForView)) return;
    if (get_child_by_id_status !== ASYNC_STATUS.SUCCEEDED) return;
    const match = (get_child_by_id_data?.illnesses || []).find(
      (i: any) => Number(i.id) === Number(openIllnessIdForView),
    );
    if (match) {
      autoOpenIllnessViewRef.current = Number(openIllnessIdForView);
      setSelectedIllness(match as Illness);
      setViewIllnessModalVisible(true);
    }
  }, [openIllnessIdForView, get_child_by_id_status, get_child_by_id_data]);

  const autoOpenSurgeryEditRef = useRef<number | null>(null);
  useEffect(() => {
    if (!openSurgeryIdForEdit) return;
    if (autoOpenSurgeryEditRef.current === Number(openSurgeryIdForEdit)) return;
    if (get_child_by_id_status !== ASYNC_STATUS.SUCCEEDED) return;
    const match = (get_child_by_id_data?.surgeries || []).find(
      (s: any) => Number(s.id) === Number(openSurgeryIdForEdit),
    );
    if (match) {
      autoOpenSurgeryEditRef.current = Number(openSurgeryIdForEdit);
      checkSubscription(() => navigation.navigate('AddSurgery', {
        childId: get_child_by_id_data?.id,
        ...(accessLevel ? { ownerUserId: currentConnectionUserId } : {}),
        surgery: match,
        isEdit: true,
      }), isBusiness ? 'business' : 'personal');
    }
  }, [openSurgeryIdForEdit, get_child_by_id_status, get_child_by_id_data]);

  const autoOpenSurgeryViewRef = useRef<number | null>(null);
  useEffect(() => {
    if (!openSurgeryIdForView) return;
    if (autoOpenSurgeryViewRef.current === Number(openSurgeryIdForView)) return;
    if (get_child_by_id_status !== ASYNC_STATUS.SUCCEEDED) return;
    const match = (get_child_by_id_data?.surgeries || []).find(
      (s: any) => Number(s.id) === Number(openSurgeryIdForView),
    );
    if (match) {
      autoOpenSurgeryViewRef.current = Number(openSurgeryIdForView);
      setSelectedSurgery(match as Surgery);
      setViewSurgeryModalVisible(true);
    }
  }, [openSurgeryIdForView, get_child_by_id_status, get_child_by_id_data]);

  const checkBirth = selectedChildData?.ismyself
    ? (selectedChildData?.user?.dateofbirth || selectedChildData?.dateofbirth)
    : selectedChildData?.dateofbirth;

  const formatDate = (dateString?: string): string => {
    if (!dateString) return '-';
    try {
      const date = new Date(dateString);
      const isDateOnly =
        date.getUTCHours() === 0 &&
        date.getUTCMinutes() === 0 &&
        date.getUTCSeconds() === 0 &&
        date.getUTCMilliseconds() === 0;
      return date.toLocaleDateString('en-US', {
        day: 'numeric',
        month: 'long',
        year: 'numeric',
        ...(isDateOnly ? { timeZone: 'UTC' } : {}),
      });
    } catch {
      return '-';
    }
  };

  const caregivers: Caregiver[] = selectedChildData?.caregivers || [];
  const medications: Medication[] = selectedChildData?.medications || [];
  const doctors: Doctor[] = selectedChildData?.doctors || [];
  const appointments: Appointment[] = selectedChildData?.appointments || [];
  const illnesses: Illness[] = selectedChildData?.illnesses || [];
  const surgeries: Surgery[] = selectedChildData?.surgeries || [];

  const overviewData = {
    age: checkBirth ? Math.floor((new Date().getTime() - new Date(checkBirth).getTime()) / (365.25 * 24 * 60 * 60 * 1000)).toString() : '-',
    dob: formatDate(checkBirth),
    bloodType: selectedChildData?.bloodtype || '-',
    currentMedication: `${medications.length} Active`,
    keyDiagnosis: selectedChildData?.keydiagnosis || '-',
    allergies: selectedChildData?.allergies || '-',
    recentSurgeries: selectedChildData?.recentsurgeries || '-',
  };

  const overviewTags = [
    { label: `Med ${medications.length}` },
    { label: `Appointments ${appointments.length}` },
    { label: `Doctors ${doctors.length}` },
    { label: `Caregivers ${caregivers.length}` },
  ];

  const handleChipPress = (user: any) => {
    if (selectedSharedUser?.ownerid === user.ownerid) {
      selectedSharedUserRef.current = null;
      setSelectedSharedUser(null);
      setSelectedChild(null);
      dispatch(getChildrenAsync(getConnectionTabQueryParams()));
      dispatch(getChildrenAsCaregiverAsync(getConnectionTabQueryParams()));
    } else {
      selectedSharedUserRef.current = user;
      setSelectedSharedUser(user);
      setSelectedChild(null);
      dispatch(getChildrenAsync({ ownerId: user.ownerid }));
    }
  };

  const getHealthShareType = (type?: string): string => {
    if (type === 'overview') { return 'childoverview'; }
    if (type === 'medication') { return 'childmedication'; }
    if (type === 'appointment') { return 'childappointment'; }
    if (type === 'illness') { return 'childillness'; }
    if (type === 'surgery') { return 'childsurgery'; }
    if (type === 'caregiver') { return 'childcaregiver'; }
    if (type === 'doctor') { return 'childdoctor'; }
    if (type === 'child') { return 'child'; }
    return 'healthtracker';
  };

  const handleShare = (resourceId?: number, type?: string) => {
    checkSubscription(() => {
      setShareContext({ resourceType: getHealthShareType(type), resourceId });
      setShareModalVisible(true);
    }, isBusiness ? 'business' : 'personal');
  };

  const handleShareGated = (resourceId?: number, type?: string) => {
    if (!healthdatasharing && isOwnData) {
      Alert.alert(
        t('health_tracker.data_sharing_disabled_title'),
        t('health_tracker.data_sharing_disabled_message'),
        [
          { text: t('common.cancel'), style: 'cancel' },
          {
            text: t('health_tracker.go_to_settings'),
            onPress: () => (navigation as any).navigate('PrivacyHealthDataSettings'),
          },
        ],
      );
      return;
    }
    handleShare(resourceId, type);
  };

  const handleTopSharePress = () => {
    if (!healthdatasharing && isOwnData) {
      Alert.alert(
        t('health_tracker.data_sharing_disabled_title'),
        t('health_tracker.data_sharing_disabled_message'),
        [
          { text: t('common.cancel'), style: 'cancel' },
          {
            text: t('health_tracker.go_to_settings'),
            onPress: () => (navigation as any).navigate('PrivacyHealthDataSettings'),
          },
        ],
      );
      return;
    }
    if (!selectedChild) {
      handleShare();
      return;
    }
    Alert.alert(
      t('common.share'),
      undefined,
      [
        {
          text: t('common.cancel'),
          style: 'cancel',
        },
        {
          text: t('common.share_health_tracker') || 'Share Module',
          onPress: () => handleShare(),
        },
        {
          text: `${t('common.share')} ${selectedChild.name}`,
          onPress: () => {
            checkSubscription(() => {
              setShareContext({ resourceType: 'child', resourceId: selectedChild.id });
              setShareModalVisible(true);
            }, isBusiness ? 'business' : 'personal');
          },
        },
      ],
    );
  };

  const handleShareDocument = (shareData: any) => {
    const payload: any = {
      ...shareContext,
      users: shareData
    };

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

  const handleViewPress = (item: Caregiver | Medication | Doctor | Appointment | Illness | Surgery, type: string) => {
    if (type === 'medication') {
      setSelectedMedication(item as Medication);
      setViewMedicationModalVisible(true);
    } else if (type === 'caregiver') {
      setSelectedCaregiver(item as Caregiver);
      setViewCaregiverModalVisible(true);
    } else if (type === 'doctor') {
      setSelectedDoctor(item as Doctor);
      setViewDoctorModalVisible(true);
    } else if (type === 'appointment') {
      setSelectedAppointment(item as Appointment);
      setViewAppointmentModalVisible(true);
    } else if (type === 'illness') {
      setSelectedIllness(item as Illness);
      setViewIllnessModalVisible(true);
    } else if (type === 'surgery') {
      setSelectedSurgery(item as Surgery);
      setViewSurgeryModalVisible(true);
    } else {
      // Use generic modal for other items
      const name =
        ('name' in item && item.name) ||
        ('conditionName' in item ? item.conditionName : '') ||
        ('procedureName' in item ? item.procedureName : '') ||
        '';
      const email = 'email' in item ? item.email : 'example@email.com';

      setSelectedItem({
        name,
        email,
        password: '********',
      });
      setViewModalVisible(true);
    }
  };

  const handleDeletePress = (item: Caregiver | Medication | Doctor | Appointment | Illness | Surgery, type: string) => {
    setDeleteItem({ ...item, type } as DeleteItem);
    setDeleteModalVisible(true);
  };

  const handleDeleteConfirm = async () => {
    if (!deleteItem) return;
    if (deleteItem.type !== 'child' && !selectedChild) return;

    const childId = selectedChild?.id?.toString();

    try {
      switch (deleteItem.type) {
        case 'child':
          await dispatch(deleteChildAsync(deleteItem.id)).unwrap();
          break;
        case 'appointment':
          await dispatch(deleteChildAppointmentAsync({
            childId,
            appointmentId: deleteItem.id
          })).unwrap();
          break;
        case 'caregiver':
          await dispatch(deleteChildCaregiverAsync({
            childId,
            caregiverId: deleteItem.id
          })).unwrap();
          break;
        case 'doctor':
          await dispatch(deleteChildDoctorAsync({
            childId,
            doctorId: deleteItem.id
          })).unwrap();
          break;
        case 'medication':
          await dispatch(deleteChildMedicationAsync({
            childId,
            medicationId: deleteItem.id
          })).unwrap();
          break;
        case 'illness':
          await dispatch(deleteChildIllnessAsync({
            childId,
            illnessId: deleteItem.id
          })).unwrap();
          break;
        case 'surgery':
          await dispatch(deleteChildSurgeryAsync({
            childId,
            surgeryId: deleteItem.id
          })).unwrap();
          break;
      }

      if (deleteItem.type === 'child') {
        setSelectedChild(null);
        if (isFromEmergencyAccess && currentConnectionUserId) {
          await dispatch(getChildrenAsync({ currentConnectionUserId, ...getConnectionTabQueryParams() }));
        } else {
          await dispatch(getChildrenAsync(
            selectedSharedUserRef.current ? { ownerId: selectedSharedUserRef.current.ownerid } : getConnectionTabQueryParams()
          ));
        }
      } else if (selectedChild?.id) {
        // Refresh child data after successful delete
        if (isFromEmergencyAccess && currentConnectionUserId) {
          await dispatch(getChildByIdAsync({ childId: selectedChild.id.toString(), currentConnectionUserId, ...getConnectionTabQueryParams() }));
        } else {
          await dispatch(getChildByIdAsync({ childId: selectedChild.id.toString(), ...getConnectionTabQueryParams() }));
        }
      }
    } catch (error) {
      console.error('Delete failed:', error);
    } finally {
      setDeleteModalVisible(false);
      setDeleteItem(null);
    }
  };

  const handleCaregiverPress = (caregiver: Caregiver) => {
    setSelectedCaregiver(caregiver);
    setViewCaregiverModalVisible(true);
  };

  const handlePatientTagPress = (patient: Patient) => {
    setSelectedPatientData(patient);
    setViewPatientModalVisible(true);
  };

  const handleMedicationPress = (medication: Medication) => {
    setSelectedMedication(medication);
    setViewMedicationModalVisible(true);
  };

  const getHistoryEntityConfig = (item: Caregiver | Medication | Doctor | Appointment | Illness | Surgery, type: string) => {
    switch (type) {
      case 'caregiver':
        return { entityType: 'ChildCaregiver', entityId: item.id };
      case 'medication':
        return { entityType: 'ChildMedication', entityId: item.id };
      case 'doctor':
        return { entityType: 'ChildDoctor', entityId: item.id };
      case 'appointment':
        return { entityType: 'ChildAppointment', entityId: item.id };
      case 'illness':
        return { entityType: 'ChildIllness', entityId: item.id };
      case 'surgery':
        return { entityType: 'ChildSurgery', entityId: item.id };
      default:
        return null;
    }
  };

  const renderActionButtons = (item: Caregiver | Medication | Doctor | Appointment | Illness | Surgery, type: string) => (
    <View style={styles.actionButtons}>
      <TouchableOpacity
        style={styles.actionBtn}
        onPress={() => {
          const historyConfig = getHistoryEntityConfig(item, type);
          if (historyConfig) {
            navigation.navigate('EditHistoryList', {
              ...historyConfig,
              title: t('edit_history.title'),
            });
          }
        }}
      >
        <MaterialIcons name="history" size={24} color={themeColors.secondary} />
      </TouchableOpacity>
      {/* {shouldAllowShare && !isCaregiverChildSelected && (type !== 'illness' && type !== 'surgery') && (
        <TouchableOpacity
          style={styles.actionBtn}
          onPress={() => handleShare((item as any)?.id, type)}
        >
          <Image source={ICONS.SHARE_PRIMARY_ICON} style={styles.shareIcon} />
        </TouchableOpacity>
      )} */}
      {shouldAllowShare && !isCaregiverChildSelected && (
        <TouchableOpacity
          style={styles.actionBtn}
          onPress={() => handleShareGated((item as any)?.id, type)}
        >
          <Image source={ICONS.SHARE_PRIMARY_ICON} style={styles.shareIcon} />
        </TouchableOpacity>
      )}
      {getItemWriteAccess(item) && (
        <TouchableOpacity
          style={styles.actionBtn}
          onPress={() => checkSubscription(() => {
            if (type === 'caregiver') {
              navigation.navigate('EditCaregiver', { caregiver: item });
            } else if (type === 'medication') {
              navigation.navigate('EditMedication', { medication: item });
            } else if (type === 'doctor') {
              navigation.navigate('EditDoctor', { doctor: item });
            } else if (type === 'appointment') {
              navigation.navigate('EditAppointment', { appointment: item });
            } else if (type === 'illness') {
              navigation.navigate('AddIllness', {
                childId: selectedChildData?.id,
                ...(accessLevel ? { ownerUserId: currentConnectionUserId } : {}),
                illness: item,
                isEdit: true,
              });
            } else if (type === 'surgery') {
              navigation.navigate('AddSurgery', {
                childId: selectedChildData?.id,
                ...(accessLevel ? { ownerUserId: currentConnectionUserId } : {}),
                surgery: item,
                isEdit: true,
              });
            }
          }, isBusiness ? 'business' : 'personal')}
        >
          <Feather name="edit-2" size={18} color={themeColors.secondary} />
        </TouchableOpacity>
      )}
      {shouldAllowShare && !isCaregiverChildSelected && (
        <TouchableOpacity
          style={styles.actionBtn}
          onPress={() => handleDeletePress(item, type)}
        >
          <MaterialCommunityIcons
            name="delete-outline"
            size={20}
            color={themeColors.secondary}
          />
        </TouchableOpacity>
      )}
    </View>
  );

  const renderCollapsibleHeader = (
    title: string,
    subtitle: string | null,
    icon: React.ReactNode,
    expanded: boolean,
    onToggle: () => void,
    showActions: boolean = false,
  ) => (
    <TouchableOpacity
      style={styles.sectionHeader}
      onPress={onToggle}
      activeOpacity={0.7}
    >
      <View style={styles.sectionHeaderLeft}>
        {icon}
        <View style={styles.sectionHeaderText}>
          <Text style={styles.sectionTitle}>{title}</Text>
          {subtitle && <Text style={styles.sectionSubtitle}>{subtitle}</Text>}
        </View>
      </View>
      <View style={styles.sectionHeaderRight}>
        {
          title === 'Overview' && (


            <TouchableOpacity
              style={styles.actionBtn}
              onPress={() =>
                selectedChildData?.id &&
                navigation.navigate('EditHistoryList', {
                  entityType: 'Child',
                  entityId: selectedChildData.id,
                  title: t('edit_history.title'),
                })
              }
            >
              <MaterialIcons name="history" size={16} color={themeColors.secondary} />
            </TouchableOpacity>
          )
        }
        {showActions && (
          <View style={styles.headerActions}>
            {shouldAllowShare && !isCaregiverChildSelected && (
              <TouchableOpacity style={styles.actionBtn} onPress={() => handleShareGated(selectedChildData?.id, 'overview')}>
                <Image
                  source={ICONS.SHARE_PRIMARY_ICON}
                  style={styles.shareIconSmall}
                />
              </TouchableOpacity>
            )}
            {getItemWriteAccess(selectedChildData) && (
              <TouchableOpacity
                style={styles.actionBtn}
                onPress={() => selectedChildData?.id && checkSubscription(() => navigation.navigate('EditOverView', {
                  childId: selectedChildData.id,
                  overview: {
                    name: selectedChildData.name,
                    bloodType: selectedChildData.bloodtype,
                    keyDiagnosis: selectedChildData.keydiagnosis,
                    allergies: selectedChildData.allergies,
                    recentSurgeries: selectedChildData.recentsurgeries,
                    endDate: selectedChildData.enddate,
                    dateofbirth: selectedChildData.ismyself
                      ? (selectedChildData.user?.dateofbirth)
                      : selectedChildData.dateofbirth,
                    isMyself: selectedChildData.ismyself,
                  }
                }), isBusiness ? 'business' : 'personal')}
              >
                <Feather name="edit-2" size={16} color={themeColors.secondary} />
              </TouchableOpacity>
            )}
            {
              title === 'Overview' && !selectedChildData?.ismyself && getItemWriteAccess(selectedChildData) && (
                <TouchableOpacity
                  style={styles.actionBtn}
                  onPress={() => selectedChildData?.id && handleDeletePress(selectedChildData as any, 'child')}
                >
                  <MaterialCommunityIcons name="delete-outline" size={18} color={themeColors.secondary} />
                </TouchableOpacity>
              )
            }
          </View>
        )}
        <Entypo
          name={expanded ? 'chevron-down' : 'chevron-right'}
          size={22}
          color={themeColors.textPrimary}
        />
      </View>
    </TouchableOpacity>
  );

  return (
    <>
      <LinearGradient
        colors={[...themeColors.gradient.slice(0, 3), themeColors.background]}
        locations={[0, 0.118, 0.2774, 0.4327, 0.5913]}
        style={styles.gradientContainer}
      >
        <SafeAreaView style={styles.safeArea}>
          <AuthHeader
            onBackPress={() => navigation.goBack()}
            containerStyle={[styles.headerContainerStyle, { paddingTop: isIOS ? 0 : 20 }]}
            backButtonStyle={{ marginBottom: 0 }}
            titleStyle={{ marginBottom: 0 }}
            backButtonIconStyle={{ tintColor: themeColors.background }}
          />

          {!healthCollectionEnabled ? (
            <View style={blockerStyles.container}>
              <MaterialCommunityIcons name="heart-off-outline" size={64} color={themeColors.primary} />
              <Text style={blockerStyles.title}>{t('health_tracker.data_collection_disabled_title')}</Text>
              <Text style={blockerStyles.message}>{t('health_tracker.data_collection_disabled_message')}</Text>
              <PrimaryButton
                title={t('health_tracker.go_to_settings')}
                onPress={() => (navigation as any).navigate('PrivacyHealthDataSettings')}
                buttonStyle={[blockerStyles.button, { backgroundColor: themeColors.primary }]}
              />
            </View>
          ) : (
            <ScrollView
              style={commonStyles.scrollView}
              contentContainerStyle={styles.scrollContent}
              showsVerticalScrollIndicator={false}
            >
              {/* Icon */}
              <View style={styles.iconContainer}>
                <Image
                  source={ICONS.HEALTH_TRACKER_ICON}
                  style={styles.headerIcon}
                />
                <Text style={[styles.title, { textAlign: "left" }]}>{t('health_tracker.title')}</Text>
              </View>
              {shouldAllowShare && children.length > 0 && !isCaregiverChildSelected && (
                <PrimaryButton
                  icon={<Fontisto name="share-a" size={13} color={colors.black} />}
                  title={t('common.share')}
                  onPress={handleTopSharePress}
                  buttonStyle={[styles.shareActionButton, { backgroundColor: themeColors?.isDark ? getColorWithOpacity(themeColors.primary, 0.8) : getColorWithOpacity(themeColors.primary, 0.5) }]}
                  textStyle={{ color: themeColors?.isDark ? themeColors.background : themeColors.textPrimary }}
                />
              )}

              {/* Shared With You Chips */}
              {!accessLevel && !isFromEmergencyAccess && sharedUsers.length > 0 && (
                <View style={styles.sharedUsersSection}>
                  <Text style={styles.sharedUsersHeading}>{'Users Who Shared With You'}</Text>
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

              {/* Patients Section */}
              <View style={styles.card}>
                <View style={styles.patientHeader}>
                  <AntDesign name="user" size={22} color={themeColors.textPrimary} />
                  <View style={styles.patientHeaderText}>
                    <Text style={[styles.patientTitle, { textAlign: "left" }]}>{t('health_tracker.patients')}</Text>
                    <Text style={[styles.patientSubtitle, { textAlign: "left" }]}>
                      {t('health_tracker.separate_profiles')}
                    </Text>
                  </View>
                </View>

                {isLoadingChildren ? (
                  <View style={styles.emptyContainer}>
                    <Text style={styles.emptyText}>{t('common.loading') || 'Loading...'}</Text>
                  </View>
                ) : children.length > 0 ? (
                  <>
                    <View style={styles.patientTags}>
                      {children.map((child: any, index: number) => (
                        <TouchableOpacity
                          key={child.id || index}
                          style={[
                            styles.patientTag,
                            selectedChild?.id === child.id && { backgroundColor: themeColors.primary },
                          ]}
                          onPress={() => setSelectedChild(child)}
                        >
                          <AntDesign
                            name="user"
                            size={14}
                            color={
                              selectedChild?.id === child.id ? themeColors.surface : themeColors.textPrimary
                            }
                          />
                          <Text
                            style={[
                              styles.patientTagText,
                              selectedChild?.id === child.id &&
                              styles.patientTagTextSelected,
                            ]}
                          >
                            {child.name}
                          </Text>
                        </TouchableOpacity>
                      ))}
                    </View>
                    {shouldAllowShare && (
                      <View
                        style={styles.patientButtonsRow}
                      >
                        <PrimaryButton
                          title={t('health_tracker.add_child')}
                          onPress={() => checkSubscription(() => setAddChildModalVisible(true))}
                          buttonStyle={styles.patientActionButton}
                        />
                      </View>
                    )}
                  </>
                ) : shouldAllowShare && (
                  <View style={styles.emptyContainer}>
                    <AntDesign name="user" size={36} color="#ccc" />
                    <Text style={[styles.emptyText, { marginTop: 8 }]}>{t('health_tracker.no_children')}</Text>
                    <PrimaryButton
                      title={t('health_tracker.add_child')}
                      onPress={() => checkSubscription(() => setAddChildModalVisible(true))}
                      buttonStyle={styles.addChildEmptyButton}
                    />
                  </View>
                )
                }

                {caregiverChildren.length > 0 && (
                  <View style={styles.caregiverSection}>
                    <Text style={[styles.sectionTitle, { textAlign: 'left' }]}>{t('common.caregiver_access_title')}</Text>
                    <Text style={[styles.sectionSubtitle, { textAlign: 'left' }]}>{t('common.caregiver_access_subtitle')}</Text>
                    <View style={styles.patientTags}>
                      {caregiverChildren.map((child: any, index: number) => (
                        <TouchableOpacity
                          key={child.id || index}
                          style={[
                            styles.patientTag,
                            selectedChild?.id === child.id && { backgroundColor: themeColors.primary },
                          ]}
                          onPress={() => setSelectedChild(child)}
                        >
                          <AntDesign
                            name="user"
                            size={14}
                            color={
                              selectedChild?.id === child.id ? colors.white : themeColors.textPrimary
                            }
                          />
                          <Text
                            style={[
                              styles.patientTagText,
                              selectedChild?.id === child.id && styles.patientTagTextSelected,
                            ]}
                          >
                            {child.name}
                          </Text>
                        </TouchableOpacity>
                      ))}
                    </View>
                  </View>
                )}
              </View>

              {/* Overview Section */}
              {selectedChild?.isoverviewonly !== undefined ? selectedChild?.isoverviewonly ? (
                <View style={styles.card}>
                  {renderCollapsibleHeader(
                    t('health_tracker.overview'),
                    null,
                    <Ionicons name="grid-outline" size={20} color={themeColors.textPrimary} />,
                    overviewExpanded,
                    () => setOverviewExpanded(!overviewExpanded),
                    true,
                  )}

                  {overviewExpanded && (
                    <View style={styles.overviewContent}>
                      {!selectedChildData ? (
                        <View style={styles.sectionEmptyContainer}>
                          <Ionicons name="grid-outline" size={36} color="#ccc" />
                          <Text style={styles.sectionEmptyText}>{t('health_tracker.no_overview')}</Text>
                        </View>
                      ) : (
                        <>
                          <View style={[styles.overviewRow, { flexDirection: isRTL ? 'row-reverse' : 'row' }]}>
                            <Text style={[styles.overviewLabel, { textAlign: "left" }]}>{t('health_tracker.age')}</Text>
                            <Text style={[styles.overviewValue, { textAlign: "left", color: themeColors.primary }]}>{overviewData.age}</Text>
                          </View>
                          <View style={[styles.overviewRow, { flexDirection: isRTL ? 'row-reverse' : 'row' }]}>
                            <Text style={[styles.overviewLabel, { textAlign: "left" }]}>{t('health_tracker.dob')}</Text>
                            <Text style={[styles.overviewValue, { textAlign: "left", color: themeColors.primary }]}>{overviewData.dob}</Text>
                          </View>
                          <View style={[styles.overviewRow, { flexDirection: isRTL ? 'row-reverse' : 'row' }]}>
                            <Text style={[styles.overviewLabel, { textAlign: "left" }]}>{t('health_tracker.blood_type')}</Text>
                            <Text style={[styles.overviewValue, { textAlign: "left", color: themeColors.primary }]}>
                              {overviewData.bloodType}
                            </Text>
                          </View>
                          <View style={[styles.overviewRow, { flexDirection: isRTL ? 'row-reverse' : 'row' }]}>
                            <Text style={[styles.overviewLabel, { textAlign: "left" }]}>{t('health_tracker.current_medication')}</Text>
                            <Text style={[styles.overviewValue, { textAlign: "left", color: themeColors.primary }]}>
                              {overviewData.currentMedication}
                            </Text>
                          </View>
                          <View style={[styles.overviewRow, { flexDirection: isRTL ? 'row-reverse' : 'row' }]}>
                            <Text style={[styles.overviewLabel, { textAlign: "left" }]}>{t('health_tracker.key_diagnosis')}</Text>
                            <Text style={[styles.overviewValue, { textAlign: "left", color: themeColors.primary }]}>
                              {overviewData.keyDiagnosis}
                            </Text>
                          </View>
                          <View style={[styles.overviewRow, { flexDirection: isRTL ? 'row-reverse' : 'row' }]}>
                            <Text style={[styles.overviewLabel, { textAlign: "left" }]}>{t('health_tracker.allergies')}</Text>
                            <Text style={[styles.overviewValue, { textAlign: "left", color: themeColors.primary }]}>
                              {overviewData.allergies}
                            </Text>
                          </View>
                          <View style={[styles.overviewRow, { flexDirection: isRTL ? 'row-reverse' : 'row' }]}>
                            <Text style={[styles.overviewLabel, { textAlign: "left" }]}>
                              {t('health_tracker.recent_surgeries')}
                            </Text>
                            <Text style={[styles.overviewValue, { textAlign: "left", color: themeColors.primary }]}>
                              {overviewData.recentSurgeries}
                            </Text>
                          </View>

                          <View style={styles.overviewTags}>
                            {overviewTags.map((tag, index) => (
                              <View key={index} style={styles.overviewTag}>
                                <Text style={styles.overviewTagText}>{tag.label}</Text>
                              </View>
                            ))}
                          </View>
                        </>
                      )}
                    </View>
                  )}
                </View>
              ) : null : (<View style={styles.card}>
                {renderCollapsibleHeader(
                  t('health_tracker.overview'),
                  null,
                  <Ionicons name="grid-outline" size={20} color={themeColors.textPrimary} />,
                  overviewExpanded,
                  () => setOverviewExpanded(!overviewExpanded),
                  true,
                )}

                {overviewExpanded && (
                  <View style={styles.overviewContent}>
                    {!selectedChildData ? (
                      <View style={styles.sectionEmptyContainer}>
                        <Ionicons name="grid-outline" size={36} color="#ccc" />
                        <Text style={styles.sectionEmptyText}>{t('health_tracker.no_overview')}</Text>
                      </View>
                    ) : (
                      <>
                        <View style={[styles.overviewRow, { flexDirection: isRTL ? 'row-reverse' : 'row' }]}>
                          <Text style={[styles.overviewLabel, { textAlign: "left" }]}>{t('health_tracker.age')}</Text>
                          <Text style={[styles.overviewValue, { textAlign: "left", color: themeColors.primary }]}>{overviewData.age}</Text>
                        </View>
                        <View style={[styles.overviewRow, { flexDirection: isRTL ? 'row-reverse' : 'row' }]}>
                          <Text style={[styles.overviewLabel, { textAlign: "left" }]}>{t('health_tracker.dob')}</Text>
                          <Text style={[styles.overviewValue, { textAlign: "left", color: themeColors.primary }]}>{overviewData.dob}</Text>
                        </View>
                        <View style={[styles.overviewRow, { flexDirection: isRTL ? 'row-reverse' : 'row' }]}>
                          <Text style={[styles.overviewLabel, { textAlign: "left" }]}>{t('health_tracker.blood_type')}</Text>
                          <Text style={[styles.overviewValue, { textAlign: "left", color: themeColors.primary }]}>
                            {overviewData.bloodType}
                          </Text>
                        </View>
                        <View style={[styles.overviewRow, { flexDirection: isRTL ? 'row-reverse' : 'row' }]}>
                          <Text style={[styles.overviewLabel, { textAlign: "left" }]}>{t('health_tracker.current_medication')}</Text>
                          <Text style={[styles.overviewValue, { textAlign: "left", color: themeColors.primary }]}>
                            {overviewData.currentMedication}
                          </Text>
                        </View>
                        <View style={[styles.overviewRow, { flexDirection: isRTL ? 'row-reverse' : 'row' }]}>
                          <Text style={[styles.overviewLabel, { textAlign: "left" }]}>{t('health_tracker.key_diagnosis')}</Text>
                          <Text style={[styles.overviewValue, { textAlign: "left", color: themeColors.primary }]}>
                            {overviewData.keyDiagnosis}
                          </Text>
                        </View>
                        <View style={[styles.overviewRow, { flexDirection: isRTL ? 'row-reverse' : 'row' }]}>
                          <Text style={[styles.overviewLabel, { textAlign: "left" }]}>{t('health_tracker.allergies')}</Text>
                          <Text style={[styles.overviewValue, { textAlign: "left", color: themeColors.primary }]}>
                            {overviewData.allergies}
                          </Text>
                        </View>
                        <View style={[styles.overviewRow, { flexDirection: isRTL ? 'row-reverse' : 'row' }]}>
                          <Text style={[styles.overviewLabel, { textAlign: "left" }]}>
                            {t('health_tracker.recent_surgeries')}
                          </Text>
                          <Text style={[styles.overviewValue, { textAlign: "left", color: themeColors.primary }]}>
                            {overviewData.recentSurgeries}
                          </Text>
                        </View>

                        <View style={styles.overviewTags}>
                          {overviewTags.map((tag, index) => (
                            <View key={index} style={styles.overviewTag}>
                              <Text style={styles.overviewTagText}>{tag.label}</Text>
                            </View>
                          ))}
                        </View>
                      </>
                    )}
                  </View>
                )}
              </View>)}

              {/* Caregivers Section */}
              {!isCaregiverChildSelected && (
                <View style={styles.card}>
                  {renderCollapsibleHeader(
                    t('health_tracker.caregivers'),
                    t('health_tracker.people_you_share_with'),
                    <AntDesign name="user" size={20} color={themeColors.textPrimary} />,
                    caregiversExpanded,
                    () => setCaregiversExpanded(!caregiversExpanded),
                  )}

                  {caregiversExpanded && (
                    <View style={styles.listContent}>
                      {caregivers.length === 0 && (
                        <View style={styles.sectionEmptyContainer}>
                          <AntDesign name="user" size={36} color="#ccc" />
                          <Text style={styles.sectionEmptyText}>{t('health_tracker.no_caregivers')}</Text>
                        </View>
                      )}
                      {caregivers.map(caregiver => (
                        <TouchableOpacity onPress={() => handleViewPress(caregiver, 'caregiver')} key={caregiver.id} style={styles.listItem}>
                          <TouchableOpacity onPress={() => handleCaregiverPress(caregiver)}>
                            <Text style={styles.listItemText}>{caregiver.name}</Text>
                          </TouchableOpacity>
                          {renderActionButtons(caregiver, 'caregiver')}
                        </TouchableOpacity>
                      ))}
                      {writeAccess && !isCaregiverChildSelected && (
                        <PrimaryButton
                          title={t('health_tracker.add_caregiver')}
                          onPress={() => selectedChildData?.id && checkSubscription(() => navigation.navigate('AddCaregiver', { childId: selectedChildData.id, ...(accessLevel ? { ownerUserId: currentConnectionUserId } : {}) }))}
                          buttonStyle={[styles.addButton, { backgroundColor: themeColors.primary }]}
                          disabled={!selectedChildData?.id}
                        />
                      )}
                    </View>
                  )}
                </View>
              )}
              {/* Doctors Section */}
              <View style={styles.card}>
                {renderCollapsibleHeader(
                  t('health_tracker.doctors'),
                  t('health_tracker.contacts_offices'),
                  <Fontisto name="doctor" size={18} color={themeColors.textPrimary} />,
                  doctorsExpanded,
                  () => setDoctorsExpanded(!doctorsExpanded),
                )}

                {doctorsExpanded && (
                  <View style={styles.listContent}>
                    {doctors.length === 0 && (
                      <View style={styles.sectionEmptyContainer}>
                        <Fontisto name="doctor" size={32} color="#ccc" />
                        <Text style={styles.sectionEmptyText}>{t('health_tracker.no_doctors_added')}</Text>
                      </View>
                    )}
                    {doctors.map(doctor => (
                      <TouchableOpacity key={doctor.id} style={styles.listItem} onPress={() => handleViewPress(doctor, 'doctor')}>
                        <Text style={styles.listItemText}>{doctor.name}</Text>
                        {renderActionButtons(doctor, 'doctor')}
                      </TouchableOpacity>
                    ))}
                    {writeAccess && (
                      <PrimaryButton
                        title={t('health_tracker.add_doctor')}
                        onPress={() => selectedChildData?.id && checkSubscription(() => navigation.navigate('AddDoctor', { childId: selectedChildData.id, ...(accessLevel ? { ownerUserId: currentConnectionUserId } : {}) }))}
                        buttonStyle={[styles.addButton, { backgroundColor: themeColors.primary }]}
                        disabled={!selectedChildData?.id}
                      />)}
                  </View>
                )}
              </View>
              {/* Medications Section */}
              <View style={styles.card}>
                {renderCollapsibleHeader(
                  t('health_tracker.medications'),
                  t('health_tracker.track_doses'),
                  <MaterialCommunityIcons
                    name="pill"
                    size={20}
                    color={themeColors.textPrimary}
                  />,
                  medicationsExpanded,
                  () => setMedicationsExpanded(!medicationsExpanded),
                )}

                {medicationsExpanded && (
                  <View style={styles.listContent}>
                    {medications.length === 0 && (
                      <View style={styles.sectionEmptyContainer}>
                        <MaterialCommunityIcons name="pill" size={36} color="#ccc" />
                        <Text style={styles.sectionEmptyText}>{t('health_tracker.no_medications')}</Text>
                      </View>
                    )}
                    {medications.map(medication => (
                      <TouchableOpacity key={medication.id} style={styles.listItem} onPress={() => handleViewPress(medication, 'medication')}>
                        <Text style={styles.listItemText}>{medication.medicationname}</Text>
                        {renderActionButtons(medication, 'medication')}
                      </TouchableOpacity>
                    ))}
                    {writeAccess && (
                      <PrimaryButton
                        title={t('health_tracker.add_medication')}
                        onPress={() => selectedChildData?.id && checkSubscription(() => navigation.navigate('AddMedication', { childId: selectedChildData.id, ...(accessLevel ? { ownerUserId: currentConnectionUserId } : {}) }))}
                        buttonStyle={[styles.addButton, { backgroundColor: themeColors.primary }]}
                        disabled={!selectedChildData?.id}
                      />
                    )}
                  </View>
                )}
              </View>



              {/* Appointments Section */}
              <View style={styles.card}>
                {renderCollapsibleHeader(
                  t('health_tracker.appointments'),
                  t('health_tracker.visits_notes'),
                  <AntDesign name="calendar" size={20} color={themeColors.textPrimary} />,
                  appointmentsExpanded,
                  () => setAppointmentsExpanded(!appointmentsExpanded),
                )}

                {appointmentsExpanded && (
                  <View style={styles.listContent}>
                    {appointments.length === 0 && (
                      <View style={styles.sectionEmptyContainer}>
                        <AntDesign name="calendar" size={36} color="#ccc" />
                        <Text style={styles.sectionEmptyText}>{t('health_tracker.no_appointments')}</Text>
                      </View>
                    )}
                    {appointments.map(appointment => (
                      <TouchableOpacity key={appointment.id} style={styles.appointmentItem} onPress={() => handleViewPress(appointment, 'appointment')}>
                        <View style={styles.appointmentInfo}>
                          <View style={styles.appointmentHeader}>
                            <Text style={styles.appointmentDoctor}>
                              {appointment?.doctor?.name}
                            </Text>
                            {renderActionButtons(appointment, 'appointment')}
                          </View>
                          <View style={styles.appointmentAddress}>
                            <Ionicons
                              name="location-outline"
                              size={14}
                              color={themeColors.primary}
                            />
                            <Text style={[styles.appointmentAddressText, { color: themeColors.primary }]}>
                              {appointment.location}
                            </Text>
                          </View>
                          <Text style={styles.appointmentDate}>
                            {appointment.appointmentdate
                              ? new Date(appointment.appointmentdate).toLocaleDateString('en-US', { day: 'numeric', month: 'long', year: 'numeric' })
                              : appointment.startDate || ''}
                          </Text>
                        </View>
                      </TouchableOpacity>
                    ))}
                    {writeAccess && (
                      <PrimaryButton
                        title={t('health_tracker.add_appointment')}
                        onPress={() => selectedChildData?.id && checkSubscription(() => navigation.navigate('AddAppointment', { childId: selectedChildData.id, ...(accessLevel ? { ownerUserId: currentConnectionUserId } : {}) }))}
                        buttonStyle={[styles.addButton, { backgroundColor: themeColors.primary }]}
                        disabled={!selectedChildData?.id}
                      />)}
                  </View>
                )}
              </View>

              {/* Illness / Diagnosis Section */}
              <View style={styles.card}>
                {renderCollapsibleHeader(
                  t('pets.illness_conditions'),
                  t('pets.illness_subtitle'),
                  <MaterialCommunityIcons name="stethoscope" size={20} color={themeColors.textPrimary} />,
                  illnessesExpanded,
                  () => setIllnessesExpanded(!illnessesExpanded),
                )}

                {illnessesExpanded && (
                  <View style={styles.listContent}>
                    {illnesses.length === 0 && (
                      <View style={styles.sectionEmptyContainer}>
                        <MaterialCommunityIcons name="stethoscope" size={36} color="#ccc" />
                        <Text style={styles.sectionEmptyText}>{t('health_tracker.no_illnesses')}</Text>
                      </View>
                    )}

                    {illnesses.map(illness => (
                      <TouchableOpacity key={illness.id} style={styles.listItem} onPress={() => handleViewPress(illness, 'illness')}>
                        <View style={{ flex: 1 }}>
                          <Text style={styles.listItemText}>{illness.conditionName || illness.name || 'Condition'}</Text>
                          {!!(illness.diagnosisDate || illness.onsetDate) && (
                            <Text style={styles.appointmentDate}>{formatDate(illness.diagnosisDate || illness.onsetDate)}</Text>
                          )}
                        </View>
                        {renderActionButtons(illness, 'illness')}
                      </TouchableOpacity>
                    ))}

                    {writeAccess && (
                      <PrimaryButton
                        title={t('health_tracker.add_illness_diagnosis')}
                        onPress={() => selectedChildData?.id && checkSubscription(() => navigation.navigate('AddIllness', { childId: selectedChildData.id, ...(accessLevel ? { ownerUserId: currentConnectionUserId } : {}) }))}
                        buttonStyle={[styles.addButton, { backgroundColor: themeColors.primary }]}
                        disabled={!selectedChildData?.id}
                      />
                    )}
                  </View>
                )}
              </View>

              {/* Operation / Procedure / Surgery Section */}
              <View style={styles.card}>
                {renderCollapsibleHeader(
                  t('health_tracker.surgeries'),
                  t('health_tracker.surgeries_subtitle'),
                  <MaterialCommunityIcons name="medical-bag" size={20} color={themeColors.textPrimary} />,
                  surgeriesExpanded,
                  () => setSurgeriesExpanded(!surgeriesExpanded),
                )}

                {surgeriesExpanded && (
                  <View style={styles.listContent}>
                    {surgeries.length === 0 && (
                      <View style={styles.sectionEmptyContainer}>
                        <MaterialCommunityIcons name="medical-bag" size={36} color="#ccc" />
                        <Text style={styles.sectionEmptyText}>{t('health_tracker.no_surgeries')}</Text>
                      </View>
                    )}

                    {surgeries.map(surgery => (
                      <TouchableOpacity key={surgery.id} style={styles.listItem} onPress={() => handleViewPress(surgery, 'surgery')}>
                        <View style={{ flex: 1 }}>
                          <Text style={styles.listItemText}>{surgery.procedurename || surgery.name || 'Procedure'}</Text>
                          {!!(surgery.performedDate || surgery.scheduledDate) && (
                            <Text style={styles.appointmentDate}>{formatDate(surgery.performedDate || surgery.scheduledDate)}</Text>
                          )}
                        </View>
                        {renderActionButtons(surgery, 'surgery')}
                      </TouchableOpacity>
                    ))}

                    {writeAccess && (
                      <PrimaryButton
                        title={t('health_tracker.add_surgery')}
                        onPress={() => selectedChildData?.id && checkSubscription(() => navigation.navigate('AddSurgery', { childId: selectedChildData.id, ...(accessLevel ? { ownerUserId: currentConnectionUserId } : {}) }))}
                        buttonStyle={[styles.addButton, { backgroundColor: themeColors.primary }]}
                        disabled={!selectedChildData?.id}
                      />
                    )}
                  </View>
                )}
              </View>
            </ScrollView>
          )}
        </SafeAreaView>
      </LinearGradient>

      {/* Modals */}
      <ShareModal
        visible={shareModalVisible}
        onClose={() => setShareModalVisible(false)}
        onShare={handleShareDocument}
        title={t('common.share_health_tracker')}
        loading={sharingLoading}
        resourceType={shareContext.resourceType}
        resourceId={shareContext.resourceId}
      />
      <DeleteConfirmModal
        visible={deleteModalVisible}
        onClose={() => setDeleteModalVisible(false)}
        onConfirm={handleDeleteConfirm}
        title={`${t('modals.delete_health_record') || 'Delete this health record?'} ${t('modals.action_cannot_be_undone') || 'This action cannot be undone.'}`}
      />
      <ViewSubscriptionModal
        visible={viewModalVisible}
        onClose={() => {
          setViewModalVisible(false);
          setSelectedItem(null);
        }}
        subscription={selectedItem}
      />
      <AddChildModal
        visible={addChildModalVisible}
        onClose={() => setAddChildModalVisible(false)}
      />
      <AddChildModal
        visible={addMyselfModalVisible}
        onClose={() => setAddMyselfModalVisible(false)}
        isMyself={true}
      />
      <ViewCaregiverModal
        visible={viewCaregiverModalVisible}
        onClose={() => {
          setViewCaregiverModalVisible(false);
          setSelectedCaregiver(null);
        }}
        caregiver={selectedCaregiver}
        linkTabs={{ record: selectedCaregiver?.id ? { moduleKey: 'caregiver', id: Number(selectedCaregiver.id) } : null, canEdit: !accessLevel }}
      />
      <ViewDoctorModal
        visible={viewDoctorModalVisible}
        onClose={() => {
          setViewDoctorModalVisible(false);
          setSelectedDoctor(null);
        }}
        doctor={selectedDoctor}
        linkTabs={{ record: selectedDoctor?.id ? { moduleKey: 'doctor', id: Number(selectedDoctor.id) } : null, canEdit: !accessLevel }}
      />
      <ViewPatientModal
        visible={viewPatientModalVisible}
        onClose={() => {
          setViewPatientModalVisible(false);
          setSelectedPatientData(null);
        }}
        patient={selectedPatientData}
        linkTabs={{ record: selectedChildData?.id ? { moduleKey: 'healthmember', id: Number(selectedChildData.id) } : null, canEdit: !accessLevel }}
      />
      <ViewMedicationModal
        visible={viewMedicationModalVisible}
        onClose={() => {
          setViewMedicationModalVisible(false);
          setSelectedMedication(null);
        }}
        medication={selectedMedication}
        doctors={doctors}
        linkTabs={{ record: selectedMedication?.id ? { moduleKey: 'medication', id: Number(selectedMedication.id) } : null, canEdit: !accessLevel }}
      />
      <ViewAppointmentModal
        visible={viewAppointmentModalVisible}
        onClose={() => {
          setViewAppointmentModalVisible(false);
          setSelectedAppointment(null);
        }}
        appointment={selectedAppointment}
        linkTabs={{ record: selectedAppointment?.id ? { moduleKey: 'healthappointment', id: Number(selectedAppointment.id) } : null, canEdit: !accessLevel }}
      />
      <ViewIllnessModal
        visible={viewIllnessModalVisible}
        onClose={() => {
          setViewIllnessModalVisible(false);
          setSelectedIllness(null);
        }}
        illness={selectedIllness}
        linkTabs={{ record: selectedIllness?.id ? { moduleKey: 'illness', id: Number(selectedIllness.id) } : null, canEdit: !accessLevel }}
      />
      <ViewSurgeryModal
        visible={viewSurgeryModalVisible}
        onClose={() => {
          setViewSurgeryModalVisible(false);
          setSelectedSurgery(null);
        }}
        surgery={selectedSurgery}
        linkTabs={{ record: selectedSurgery?.id ? { moduleKey: 'surgery', id: Number(selectedSurgery.id) } : null, canEdit: !accessLevel }}
      />
      {GateModal}
    </>
  );
};

const blockerStyles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 32,
    gap: 16,
  },
  title: {
    fontSize: 18,
    fontFamily: FONTS.display_semi_bold,
    color: colors.black,
    textAlign: 'center',
    marginTop: 12,
  },
  message: {
    fontSize: 14,
    fontFamily: FONTS.display_regular,
    color: colors.gray,
    textAlign: 'center',
    lineHeight: 22,
  },
  button: {
    marginTop: 8,
    paddingHorizontal: 24,
  },
});

export default HealthTracker;
