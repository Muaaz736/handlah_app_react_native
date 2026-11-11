import {
  Image,
  Platform,
  Text,
  View,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
  ActionSheetIOS,
} from 'react-native';
import React, { useCallback, useEffect, useRef, useState, useMemo } from 'react';
import ScreenWrapper from '../../../components/ScreenWrapper/ScreenWrapper';
import CustomHeader from '../../../components/CustomHeader/CustomHeader';
import { CustomInput } from '../../../components/common';
import { launchCamera, launchImageLibrary } from 'react-native-image-picker';
import { useTranslation } from 'react-i18next';
import { ICONS } from '../../../utils/Images';
import colors from '../../../utils/colors';
import { useUserRole } from '../../../hooks/useUserRole';
import { useSubscriptionGate } from '../../../hooks/useSubscriptionGate';
import { useSelector } from 'react-redux';
import { useRoute, RouteProp, useFocusEffect, useNavigation } from '@react-navigation/native';
import { showSuccessToast, showErrorToast } from '../../../components/common';
import { sendChatMessage, sendChatEvent } from './modules/AiChatbot/api';
import type { ChatUIAction, ChatAPIResponse, ViewState } from './AiAssistant.types';
import Ionicons from 'react-native-vector-icons/Ionicons';
import Voice, { SpeechResultsEvent, SpeechErrorEvent, SpeechRecognizedEvent } from '@react-native-voice/voice';
import { requestVoicePermissions, requestCameraPermission, requestGalleryPermission } from '../../../services/permissions/permissionService';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Markdown from 'react-native-markdown-display';
import NetInfo, { NetInfoState } from '@react-native-community/netinfo';
import OfflineChatScreen from './modules/AiChatbot/components/OfflineChatScreen';
import useTTS from '../../../hooks/useTTS';
import { makeAiAssistantStyles } from './AiAssistant.styles';
import { RoleTheme } from '../../../types/roleManager.types';

interface ConversationEntry {
  id: string;
  userMessage: string;
  aiResponse: ChatAPIResponse | null;
  isLoading: boolean;
  isError: boolean;
  errorMessage?: string;
  imageUri?: string;
}

const assets_list = ["List Properties", "List Vehicles", "List Real Estates", "List Bank Accounts"];
const liablities_list = ["List Loans", "List Utilities", "List Insurance", "List Warranties"];
const essential_list = ["List Appointments", "List Medications", "List Doctors", "List Caregivers", "List Passports", "List Driver's Licenses", "List Certifications", "List Social Media Accounts", "List Bookmarks", "List Wallet", "List Pets", "List Subscriptions", "List Documents"];

const AiAssistant: React.FC = () => {
  const { t } = useTranslation();
  const { themeColors, isBusinessRole } = useUserRole();
  const { checkSubscription, GateModal } = useSubscriptionGate();
  const styles = useMemo(() => makeAiAssistantStyles(themeColors as RoleTheme), [themeColors]);
  const { user_data, user_id } = useSelector((state: any) => state.user_auth);
  const route = useRoute<RouteProp<{ AiAssistant: { prefillPrompt?: string } }, 'AiAssistant'>>();
  const prefillPrompt = route.params?.prefillPrompt;

  const userId = user_id || user_data?.id || user_data?.userid || 0;
  const convStorageKey = `ai_conversation_id_${userId}`;

  const [searchValue, setSearchValue] = useState<string>('');
  const [conversationId, setConversationId] = useState('');
  const [entries, setEntries] = useState<ConversationEntry[]>([]);
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [isListening, setIsListening] = useState(false);
  const [expandedItems, setExpandedItems] = useState<Set<string>>(new Set());
  const [selectedImage, setSelectedImage] = useState<{
    uri: string;
    base64: string;
    mediaType: string;
  } | null>(null);
  const isListeningRef = useRef(false);
  const scrollRef = useRef<ScrollView>(null);
  const [isDeviceOffline, setIsDeviceOffline] = useState<boolean>(false);
  const { speak, stop, isSpeaking, speakingId } = useTTS();
  const navigation = useNavigation();

  // Stop TTS immediately when the user initiates going back
  useEffect(() => {
    const unsubscribe = navigation.addListener('beforeRemove', () => {
      stop();
    });
    return unsubscribe;
  }, [navigation, stop]);

  // Stop TTS when screen loses focus (tab switch, navigation away, etc.)
  useFocusEffect(
    useCallback(() => {
      return () => {
        stop();
      };
    }, [stop]),
  );

  const generateId = () => `${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;

  const isAnythingLoading = entries.some(e => e.isLoading);


  useEffect(() => {
    NetInfo.fetch().then((state) => {
      const isOffline =
        !state.isConnected || state.isInternetReachable === false;

      setIsDeviceOffline(isOffline);
    });

    const unsubscribe = NetInfo.addEventListener((state: NetInfoState) => {
      const isOffline =
        !state.isConnected || state.isInternetReachable === false;

      setIsDeviceOffline(isOffline);
    });

    return () => unsubscribe();
  }, []);


  useEffect(() => {
    if (prefillPrompt) {
      setSearchValue(prefillPrompt);
    }
  }, [prefillPrompt]);

  useEffect(() => {
    if (!userId) return;
    AsyncStorage.getItem(convStorageKey).then(saved => {
      if (saved) {
        setConversationId(saved);
      } else {
        const generated = `conv_user_${userId}`;
        setConversationId(generated);
        AsyncStorage.setItem(convStorageKey, generated);
      }
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [userId]);

  useEffect(() => {
    if (conversationId && userId) {
      AsyncStorage.setItem(convStorageKey, conversationId);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [conversationId]);

  useEffect(() => {
    if (prefillPrompt) {
      setSearchValue(prefillPrompt);
    }
  }, [prefillPrompt]);

  useEffect(() => {
    if (!userId) return;
    AsyncStorage.getItem(convStorageKey).then(saved => {
      if (saved) {
        setConversationId(saved);
      } else {
        const generated = `conv_user_${userId}`;
        setConversationId(generated);
        AsyncStorage.setItem(convStorageKey, generated);
      }
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [userId]);

  useEffect(() => {
    if (conversationId && userId) {
      AsyncStorage.setItem(convStorageKey, conversationId);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [conversationId]);

  useEffect(() => {
    Voice.onSpeechPartialResults = (e: SpeechResultsEvent) => {
      const text = e.value?.[0] || '';
      if (text) setSearchValue(text);
    };

    Voice.onSpeechResults = (e: SpeechResultsEvent) => {
      if (Platform.OS === 'android') {
        const text = e.value?.[0] || '';
        if (text) setSearchValue(text);
        isListeningRef.current = false;
        setIsListening(false);
      }
    };

    Voice.onSpeechRecognized = (e: SpeechRecognizedEvent) => {
      if (Platform.OS === 'ios' && e.isFinal) {
        isListeningRef.current = false;
        setIsListening(false);
      }
    };

    Voice.onSpeechEnd = () => {
      isListeningRef.current = false;
      setIsListening(false);
    };

    Voice.onSpeechError = (e: SpeechErrorEvent) => {
      const code = String((e.error as any)?.code ?? e.error ?? '');
      if (code === '7' || code === '5') {
        isListeningRef.current = false;
        setIsListening(false);
        return;
      }
      console.warn('Speech error:', e.error);
      isListeningRef.current = false;
      setIsListening(false);
    };

    return () => {
      isListeningRef.current = false;
      Voice.destroy().catch(() => { });
    };
  }, []);

  const handleMicPress = useCallback(async (): Promise<void> => {
    if (isListeningRef.current) {
      isListeningRef.current = false;
      setIsListening(false);
      try { await Voice.stop(); } catch { }
    } else {
      const permitted = await requestVoicePermissions();
      if (!permitted) return;
      try {
        try { await Voice.destroy(); } catch { }
        setSearchValue('');
        isListeningRef.current = true;
        setIsListening(true);
        await Voice.start('en-US');
      } catch (err) {
        console.warn('Voice start error:', err);
        isListeningRef.current = false;
        setIsListening(false);
      }
    }
  }, []);

  const scrollToBottom = useCallback(() => {
    setTimeout(() => scrollRef.current?.scrollToEnd({ animated: true }), 150);
  }, []);

  // Image picker
  const IMAGE_PICKER_OPTIONS = {
    mediaType: 'photo' as const,
    maxWidth: 1024,
    maxHeight: 1024,
    quality: 0.7 as const,
    includeBase64: true,
  };

  const processImageResponse = useCallback((response: any) => {
    if (response.didCancel || response.errorCode) return;
    const asset = response.assets?.[0];
    if (!asset?.base64 || !asset?.uri) return;

    const mimeType = asset.type || 'image/jpeg';
    setSelectedImage({
      uri: asset.uri,
      base64: asset.base64,
      mediaType: mimeType,
    });
  }, []);

  const handleImagePress = useCallback(() => {
    const openCamera = async () => {
      const granted = await requestCameraPermission();
      if (granted) launchCamera(IMAGE_PICKER_OPTIONS, processImageResponse);
    };
    const openGallery = async () => {
      const granted = await requestGalleryPermission();
      if (granted) launchImageLibrary(IMAGE_PICKER_OPTIONS, processImageResponse);
    };

    if (Platform.OS === 'ios') {
      ActionSheetIOS.showActionSheetWithOptions(
        {
          options: ['Cancel', 'Take Photo', 'Choose from Gallery'],
          cancelButtonIndex: 0,
        },
        (buttonIndex) => {
          if (buttonIndex === 1) openCamera();
          else if (buttonIndex === 2) openGallery();
        },
      );
    } else {
      Alert.alert(
        'Attach Image',
        'Choose an option',
        [
          { text: 'Cancel', style: 'cancel' },
          { text: 'Take Photo', onPress: openCamera },
          { text: 'Choose from Gallery', onPress: openGallery },
        ],
        { cancelable: true },
      );
    }
  }, [processImageResponse]);

  const handleRemoveImage = useCallback(() => {
    setSelectedImage(null);
  }, []);

  const onSearchChange = useCallback((text: string): void => {
    setSearchValue(text);
  }, []);

  const handleSearch = useCallback(async (): Promise<void> => {
    const text = searchValue.trim();
    const hasImage = !!selectedImage;
    if ((!text && !hasImage) || isAnythingLoading) return;

    checkSubscription(async () => {
      // Capture image before clearing state
      const imageToSend = selectedImage;

      const entryId = generateId();

      const newEntry: ConversationEntry = {
        id: entryId,
        userMessage: text,
        aiResponse: null,
        isLoading: true,
        isError: false,
        imageUri: imageToSend?.uri,
      };

      setEntries(prev => [...prev, newEntry]);
      setSearchValue('');
      setSelectedImage(null);
      scrollToBottom();

      try {
        const response = await sendChatMessage(
          text || (imageToSend ? 'Please analyze this image.' : ''),
          conversationId,
          userId,
        );

        if (response.conversation_id) {
          setConversationId(response.conversation_id);
        }

        setEntries(prev =>
          prev.map(e =>
            e.id === entryId
              ? { ...e, aiResponse: response, isLoading: false, isError: response.status === 'error' }
              : e,
          ),
        );

        // Auto-read AI response via TTS
        if (response.message && response.status !== 'error') {
          speak(response.message, entryId);
        }
      } catch (error: any) {
        setEntries(prev =>
          prev.map(e =>
            e.id === entryId
              ? { ...e, isLoading: false, isError: true, errorMessage: error?.message || 'Something went wrong.' }
              : e,
          ),
        );
      } finally {
        scrollToBottom();
      }
    }, isBusinessRole() ? 'business' : 'personal');
  }, [searchValue, isAnythingLoading, conversationId, userId, scrollToBottom, speak, selectedImage, checkSubscription, isBusinessRole]);

  const handleConfirmAction = useCallback(async (uiAction: ChatUIAction, entryId: string): Promise<void> => {
    if (!uiAction.payload) return;
    setActionLoading(entryId);

    try {
      const response = await sendChatEvent(conversationId, userId, 'tool_confirmed', {
        confirmed_payload: uiAction.payload,
      });

      showSuccessToast(`${uiAction.label || 'Record'} saved successfully!`);

      setEntries(prev =>
        prev.map(e => {
          if (e.id === entryId && e.aiResponse) {
            return {
              ...e,
              aiResponse: { ...e.aiResponse, status: 'complete' as const },
            };
          }
          return e;
        }),
      );

      if (response?.message) {
        const followUpEntry: ConversationEntry = {
          id: generateId(),
          userMessage: '',
          aiResponse: response,
          isLoading: false,
          isError: false,
        };
        setEntries(prev => [...prev, followUpEntry]);
        scrollToBottom();
      }
    } catch (error: any) {
      showErrorToast(error?.message || 'Failed to save. Please try again.');
    } finally {
      setActionLoading(null);
    }
  }, [conversationId, userId, scrollToBottom]);

  const handleCancelAction = useCallback(async (entryId: string): Promise<void> => {
    try {
      const response = await sendChatEvent(conversationId, userId, 'tool_cancelled');

      setEntries(prev =>
        prev.map(e => {
          if (e.id === entryId && e.aiResponse) {
            return {
              ...e,
              aiResponse: { ...e.aiResponse, status: 'complete' as const },
            };
          }
          return e;
        }),
      );

      if (response?.message) {
        const followUpEntry: ConversationEntry = {
          id: generateId(),
          userMessage: '',
          aiResponse: response,
          isLoading: false,
          isError: false,
        };
        setEntries(prev => [...prev, followUpEntry]);
        scrollToBottom();
      }
    } catch (error: any) {
      console.warn('Cancel event failed:', error?.message);
    }
  }, [conversationId, userId, scrollToBottom]);

  // Sends a chip label directly as a new message without putting it in the input
  const sendDirectMessage = useCallback(async (text: string): Promise<void> => {
    if (!text.trim() || isAnythingLoading) return;

    checkSubscription(async () => {
      const entryId = generateId();
      const newEntry: ConversationEntry = {
        id: entryId,
        userMessage: text,
        aiResponse: null,
        isLoading: true,
        isError: false,
      };

      setEntries(prev => [...prev, newEntry]);
      scrollToBottom();

      try {
        const response = await sendChatMessage(text, conversationId, userId);

        if (response.conversation_id) {
          setConversationId(response.conversation_id);
        }

        setEntries(prev =>
          prev.map(e =>
            e.id === entryId
              ? { ...e, aiResponse: response, isLoading: false, isError: response.status === 'error' }
              : e,
          ),
        );

        if (response.message && response.status !== 'error') {
          speak(response.message, entryId);
        }
      } catch (error: any) {
        setEntries(prev =>
          prev.map(e =>
            e.id === entryId
              ? { ...e, isLoading: false, isError: true, errorMessage: error?.message || 'Something went wrong.' }
              : e,
          ),
        );
      } finally {
        scrollToBottom();
      }
    }, isBusinessRole() ? 'business' : 'personal');
  }, [isAnythingLoading, conversationId, userId, scrollToBottom, speak, checkSubscription, isBusinessRole]);

  const formatFieldLabel = (key: string): string => {
    return key
      .replace(/([A-Z])/g, ' $1')
      .replace(/^./, s => s.toUpperCase())
      .replace(/Id$/, 'ID')
      .trim();
  };

  const renderReviewCard = (uiAction: ChatUIAction, entry: ConversationEntry): React.ReactElement => {
    const payload = uiAction.payload || {};
    const isActioned = entry.aiResponse?.status === 'complete';
    const isThisLoading = actionLoading === entry.id;
    const actionsObj = Array.isArray(uiAction.actions) ? undefined : uiAction.actions;
    const displayFields = Object.entries(payload).filter(
      ([key, value]) =>
        value !== null &&
        value !== '' &&
        !uiAction.system_fields?.includes(key),
    );

    return (
      <View style={styles.resultContainer}>
        <View style={styles.reviewCardHeader}>
          <Text style={styles.resultTitle}>
            ✦{' '}
            <Text style={styles.mediumText}>{uiAction.label || 'Review'}</Text>
          </Text>
          {uiAction.step && uiAction.total_steps && (
            <Text style={styles.stepText}>
              Step {uiAction.step}/{uiAction.total_steps}
            </Text>
          )}
        </View>

        {displayFields.map(([key, value]) => (
          <View key={key} style={styles.fieldRow}>
            <Text style={styles.fieldLabel}>{formatFieldLabel(key)}</Text>
            <Text style={styles.fieldValue}>{String(value)}</Text>
          </View>
        ))}

        {!isActioned && (
          <View style={styles.reviewActions}>
            <TouchableOpacity
              style={[styles.actionBtn, styles.cancelBtn]}
              onPress={() => handleCancelAction(entry.id)}
              disabled={isThisLoading}
            >
              <Text style={styles.cancelBtnText}>
                {actionsObj?.cancel?.label || 'Cancel'}
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.actionBtn, styles.confirmBtn, { backgroundColor: themeColors.primary }]}
              onPress={() => handleConfirmAction(uiAction, entry.id)}
              disabled={isThisLoading}
            >
              {isThisLoading ? (
                <ActivityIndicator size="small" color={colors.white} />
              ) : (
                <Text style={styles.confirmBtnText}>
                  {actionsObj?.confirm?.label || 'Save'}
                </Text>
              )}
            </TouchableOpacity>
          </View>
        )}

        {isActioned && (
          <View style={styles.actionedBadge}>
            <Text style={styles.actionedText}>✓ Completed</Text>
          </View>
        )}
      </View>
    );
  };

  const formatDate = (dateStr: string): string => {
    try {
      const d = new Date(dateStr);
      if (isNaN(d.getTime())) return dateStr;
      return d.toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' });
    } catch {
      return dateStr;
    }
  };

  const SYSTEM_FIELDS = new Set([
    'id', 'userid', 'createdat', 'updatedat', 'isactive', 'ismyself',
    'realestateid', 'businessid', 'parentid',
    'addtowallet', 'autopay', 'isdraft', 'isaddedinwallet',
    'countryid', 'stateid', 'cityid', 'categoryid', 'subcategoryid',
    'attachmenturl', 'attachmenturls', 'attachment', 'attachmentafter', 'attachmentbefore',
    'documentid', 'documenturl',
    'imageurl',
    'photourl',
    'uploadattachments',
    'policereporturl',
    'carfaxrecordurl',
  ]);

  const ENUM_FIELDS = new Set(['type', 'accounttype', 'status']);

  const OBJECT_ARRAY_FIELDS = new Set([
    'appointments', 'medications', 'doctors', 'caregivers', 'plannedpayments',
  ]);

  const EMPTY_ARRAY_SKIP = new Set([
    'allergies',
  ]);

  const isDateString = (val: string): boolean =>
    /^\d{4}-\d{2}-\d{2}T/.test(val);

  const prettifyKey = (key: string): string => {
    return key
      .replace(/([a-z])([A-Z])/g, '$1 $2')
      .replace(/([A-Z]+)([A-Z][a-z])/g, '$1 $2')
      .replace(/([_-])/g, ' ')
      .replace(/\b\w/g, c => c.toUpperCase())
      .trim();
  };

  const formatFieldValue = (key: string, value: any): string => {
    if (value === null || value === undefined) return 'N/A';
    if (value === '') return 'N/A';

    if (typeof value === 'boolean') return value ? 'Yes' : 'No';

    if (typeof value === 'string') {
      const trimmed = value.trim();
      if (!trimmed) return 'N/A';
      if (isDateString(trimmed)) {
        if (trimmed.startsWith('0001-')) return 'N/A';
        return formatDate(trimmed);
      }
      return trimmed;
    }

    if (typeof value === 'number') {
      if (!isFinite(value)) return 'N/A';
      const lk = key.toLowerCase();
      const moneyKeys = ['balance', 'amount', 'premium', 'payment', 'price', 'value', 'mindue', 'apr'];
      if (moneyKeys.some(k => lk.includes(k))) {
        try {
          return `$${value.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
        } catch {
          return `$${value}`;
        }
      }
      return String(value);
    }

    if (Array.isArray(value)) {
      if (value.length === 0) return 'None';
      const nonNull = value.filter(v => v !== null && v !== undefined);
      if (nonNull.length === 0) return 'None';
      if (typeof nonNull[0] !== 'object') {
        return nonNull.map(v => String(v)).join(', ');
      }
      return `${value.length} item${value.length !== 1 ? 's' : ''}`;
    }

    if (typeof value === 'object') {
      try {
        const nameFields = [
          'countryname', 'statename', 'cityname', 'provincename', 'regionname',
          'name', 'title', 'label', 'displayname', 'fullname',
        ];
        for (const field of nameFields) {
          const candidate = value[field];
          if (candidate !== null && candidate !== undefined && candidate !== '') {
            return String(candidate);
          }
        }
        const json = JSON.stringify(value);
        return json === '{}' ? 'N/A' : json;
      } catch {
        return 'N/A';
      }
    }

    try {
      return String(value);
    } catch {
      return 'N/A';
    }
  };

  const getDisplayFields = (
    item: Record<string, any>,
    primaryNameKey: string,
  ): [string, any][] => {
    return Object.entries(item).filter(([key, value]) => {
      const lKey = key.toLowerCase();
      if (SYSTEM_FIELDS.has(lKey)) return false;
      if (ENUM_FIELDS.has(lKey)) return false;
      if (OBJECT_ARRAY_FIELDS.has(lKey)) return false;
      if (key === primaryNameKey) return false;
      if (key === 'name' || key === 'title' || key === 'label') return false;
      if (Array.isArray(value) && value.length === 0) return false;
      if (value === null || value === undefined || value === '') return false;
      return true;
    });
  };

  const getSubEntityFields = (item: Record<string, any>): [string, any[]][] => {
    return Object.entries(item).filter(
      ([key, value]) => OBJECT_ARRAY_FIELDS.has(key) && Array.isArray(value) && value.length > 0,
    ) as [string, any[]][];
  };

  const getPrimaryNameKey = (item: Record<string, any>): string => {
    const candidates = ['name', 'title', 'label', 'vendor', 'accountname', 'itemname', 'bestname'];
    return candidates.find(k => item[k] != null && item[k] !== '') || 'name';
  };

  const toggleExpand = (itemKey: string): void => {
    setExpandedItems(prev => {
      const next = new Set(prev);
      if (next.has(itemKey)) { next.delete(itemKey); } else { next.add(itemKey); }
      return next;
    });
  };

  const renderListCard = (uiAction: ChatUIAction, message: string): React.ReactElement => {
    const items = uiAction.items || [];
    const entity = uiAction.entity || 'item';
    const entityLabel = entity.charAt(0).toUpperCase() + entity.slice(1);

    return (
      <View style={styles.resultContainer}>
        <Text style={styles.resultTitle}>
          ✦ <Text style={styles.mediumText}>{message || `Your ${entityLabel}s`}</Text>
        </Text>
        {items.length === 0 ? (
          <Text style={styles.notFoundText}>No {entityLabel}s found.</Text>
        ) : (
          items.map((item, idx) => {
            const primaryKey = getPrimaryNameKey(item);
            const name = item[primaryKey] || `${entityLabel} ${idx + 1}`;
            const itemKey = String(item.id ?? idx);
            const isExpanded = expandedItems.has(itemKey);
            const isLast = idx === items.length - 1;
            const displayFields = getDisplayFields(item, primaryKey);
            const subEntityFields = getSubEntityFields(item);

            const previewFields = displayFields.slice(0, 2);

            return (
              <View
                key={itemKey}
                style={[styles.listItem, isLast && styles.listItemLast]}
              >
                <TouchableOpacity
                  style={styles.listItemRow}
                  onPress={() => toggleExpand(itemKey)}
                  activeOpacity={0.7}
                >
                  <View style={[styles.listItemAvatar, { backgroundColor: themeColors.primary }]}>
                    <Text style={styles.listItemAvatarText}>
                      {String(name).charAt(0).toUpperCase()}
                    </Text>
                  </View>

                  <View style={styles.listItemInfo}>
                    <Text style={styles.listItemName}>{String(name)}</Text>
                    {previewFields.length > 0 && (
                      <Text style={styles.listItemSub} numberOfLines={1}>
                        {previewFields
                          .map(([k, v]) => `${prettifyKey(k)}: ${formatFieldValue(k, v)}`)
                          .join('  ·  ')}
                      </Text>
                    )}
                  </View>

                  <Ionicons
                    name={isExpanded ? 'chevron-up' : 'chevron-down'}
                    size={16}
                    color={colors.gray}
                  />
                </TouchableOpacity>

                {isExpanded && (
                  <View style={styles.expandedPanel}>
                    {displayFields.map(([key, value], fi) => (
                      <View
                        key={key}
                        style={[
                          styles.expandedRow,
                          fi === displayFields.length - 1 && subEntityFields.length === 0 && styles.expandedRowLast,
                        ]}
                      >
                        <Text style={styles.expandedLabel}>{prettifyKey(key)}</Text>
                        <Text style={styles.expandedValue}>
                          {formatFieldValue(key, value)}
                        </Text>
                      </View>
                    ))}

                    {subEntityFields.map(([key, subItems], si) => (
                      <View
                        key={key}
                        style={[
                          styles.subEntitySection,
                          si === subEntityFields.length - 1 && styles.expandedRowLast,
                        ]}
                      >
                        <Text style={styles.subEntityTitle}>{prettifyKey(key)}</Text>
                        {subItems.map((sub, sIdx) => {
                          const subFields = Object.entries(sub).filter(([k, v]) =>
                            !SYSTEM_FIELDS.has(k.toLowerCase()) && v !== null && v !== '' && typeof v !== 'object',
                          );
                          return (
                            <View key={sub.id ?? sIdx} style={styles.subEntityRow}>
                              {subFields.map(([k, v]) => (
                                <Text key={k} style={styles.subEntityField}>
                                  <Text style={styles.subEntityFieldLabel}>{prettifyKey(k)}: </Text>
                                  {formatFieldValue(k, v)}
                                </Text>
                              ))}
                            </View>
                          );
                        })}
                      </View>
                    ))}

                    {displayFields.length === 0 && subEntityFields.length === 0 && (
                      <Text style={styles.noDetailsText}>No additional details.</Text>
                    )}
                  </View>
                )}
              </View>
            );
          })
        )}

        <Text style={styles.listCount}>
          {items.length} record{items.length !== 1 ? 's' : ''}
        </Text>
      </View>
    );
  };

  const renderEntry = (entry: ConversationEntry): React.ReactElement => {
    const { aiResponse } = entry;

    return (
      <View key={entry.id} style={styles.entryContainer}>
        {(entry.userMessage || entry.imageUri) ? (
          <View style={[styles.resultContainer, styles.resultContainerAlt]}>
            {entry.imageUri && (
              <Image
                source={{ uri: entry.imageUri }}
                style={styles.entryImage}
                resizeMode="cover"
              />
            )}
            {entry.userMessage ? (
              <Text style={[styles.resultTitle, { marginBottom: 0 }]}>
                <Markdown>
                  {entry.userMessage}
                </Markdown>
              </Text>
            ) : null}
          </View>
        ) : null}

        {entry.isLoading && (
          <View style={styles.resultContainer}>
            <View style={styles.thinkingRow}>
              <ActivityIndicator size="small" color={themeColors.primary} />
              <Text style={[styles.resultTitle, styles.thinkingTitle]}>
                ✦{' '}
                <Text style={styles.mediumText}>Thinking...</Text>
              </Text>
            </View>
          </View>
        )}

        {entry.isError && !aiResponse && (
          <View style={styles.resultContainer}>
            <Text style={styles.resultTitle}>
              ✦ {t('ai_assistant_screen.no_results_title')}
            </Text>
            <Text style={styles.notFoundText}>
              {entry.errorMessage || t('ai_assistant_screen.no_results_message')}
            </Text>
          </View>
        )}

        {aiResponse && aiResponse.ui_action?.type === 'review' && (
          renderReviewCard(aiResponse.ui_action, entry)
        )}

        {aiResponse && aiResponse.ui_action?.type === 'list' && (
          renderListCard(aiResponse.ui_action, aiResponse.message)
        )}

        {aiResponse && aiResponse.ui_action?.type !== 'review' && aiResponse.ui_action?.type !== 'list' && aiResponse.message && (
          <View style={styles.resultContainer}>
            <Text style={styles.resultTitle}>
              <Text style={styles.mediumText}>
                <Markdown>
                  {aiResponse.message}
                </Markdown>
              </Text>
            </Text>
            <TouchableOpacity
              onPress={() => speak(aiResponse.message, entry.id)}
              style={styles.speakerBtn}
              activeOpacity={0.7}
              hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
            >
              <Ionicons
                name={speakingId === entry.id ? 'stop-circle-outline' : 'volume-high-outline'}
                size={18}
                color={speakingId === entry.id ? themeColors.primary : colors.gray}
              />
            </TouchableOpacity>

            {/* Intent-based quick-action chips */}
            {(() => {
              const intent = aiResponse.intent;
              let chipList: string[] | null = null;
              if (intent === 'assets') chipList = assets_list;
              else if (intent === 'liabilities_and_expenses') chipList = liablities_list;
              else if (intent === 'essentials') chipList = essential_list;
              if (!chipList) return null;
              return (
                <View style={styles.chipsContainer}>
                  {chipList.map(chip => (
                    <TouchableOpacity
                      key={chip}
                      style={[styles.chip, { borderColor: themeColors.primary }]}
                      onPress={() => sendDirectMessage(chip)}
                      activeOpacity={0.7}
                    >
                      <Text style={[styles.chipText, { color: themeColors.primary }]}>{chip}</Text>
                    </TouchableOpacity>
                  ))}
                </View>
              );
            })()}
          </View>
        )}
      </View>
    );
  };

  return (
    <ScreenWrapper scrollable={false} showShadow={false}>
      <CustomHeader />

      {isDeviceOffline ? (
        <OfflineChatScreen key="offline" />
      ) : (
        <>
          <View style={styles.headerPadding}>
            <Text style={styles.headerTitle}>
              {/* {t('ai_assistant_screen.title')} */}
              Halo
            </Text>
            <Text style={styles.headerSubtitle}>
              {t('ai_assistant_screen.subtitle')}
            </Text>
          </View>

          {/* Image Preview */}
          {selectedImage && (
            <View style={styles.imagePreviewRow}>
              <View style={styles.imagePreviewContainer}>
                <Image source={{ uri: selectedImage.uri }} style={styles.imagePreview} />
                <TouchableOpacity
                  style={styles.removeImageBtn}
                  onPress={handleRemoveImage}
                  activeOpacity={0.7}
                  hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                >
                  <Ionicons name="close-circle" size={20} color={colors.error || '#FF3B30'} />
                </TouchableOpacity>
              </View>
            </View>
          )}

          <View style={styles.inputRow}>
            {/* Image Picker Button */}
            <TouchableOpacity
              style={styles.iconBtn}
              onPress={handleImagePress}
              disabled={isAnythingLoading || isListening}
              activeOpacity={0.7}
            >
              <Ionicons
                name="image-outline"
                size={20}
                color={selectedImage ? themeColors.primary : colors.gray}
              />
            </TouchableOpacity>

            {/* Text Input */}
            <View style={styles.inputWrapper}>
              <CustomInput
                placeholder={t('ai_assistant_screen.search_placeholder')}
                value={searchValue}
                onChangeText={onSearchChange}
                onSubmitEditing={handleSearch}
                returnKeyType="send"
                icon={ICONS.AI_ASSISTANT_ICON}
                startIconStyle={styles.searchStartIcon}
                placeholderTextColor={colors.black}
                editable={!isAnythingLoading && !isListening}
                inputContainerStyle={styles.searchInputContainer}
                containerStyle={{ marginBottom: 0 }}
                multiline
                inputStyle={styles.searchInput}
              />
            </View>

            {/* Mic Button */}
            <TouchableOpacity
              style={[
                styles.iconBtn,
                { backgroundColor: isListening ? colors.error || '#FF3B30' : themeColors.primary },
              ]}
              onPress={handleMicPress}
              disabled={isAnythingLoading}
              activeOpacity={0.8}
            >
              <Ionicons
                name={isListening ? 'stop' : 'mic'}
                size={18}
                color={colors.white}
              />
            </TouchableOpacity>

            {/* Send Button */}
            <TouchableOpacity
              style={[
                styles.iconBtn,
                {
                  backgroundColor: (searchValue.trim() || selectedImage) && !isAnythingLoading
                    ? themeColors.primary
                    : colors.lightGray,
                },
              ]}
              onPress={handleSearch}
              disabled={(!searchValue.trim() && !selectedImage) || isAnythingLoading}
              activeOpacity={0.8}
            >
              {isAnythingLoading ? (
                <ActivityIndicator size="small" color={themeColors.primary} />
              ) : (
                <Ionicons
                  name="send"
                  size={16}
                  color={(searchValue.trim() || selectedImage) ? colors.white : colors.gray}
                />
              )}
            </TouchableOpacity>
          </View>
          <ScrollView
            ref={scrollRef}
            style={styles.scrollContainer}
            showsVerticalScrollIndicator={false}
            keyboardShouldPersistTaps="handled"
          >
            <View style={styles.contentContainer}>
              {entries.map(renderEntry)}
            </View>
          </ScrollView>
        </>)}
      {GateModal}
    </ScreenWrapper>
  );
};

export default AiAssistant;
