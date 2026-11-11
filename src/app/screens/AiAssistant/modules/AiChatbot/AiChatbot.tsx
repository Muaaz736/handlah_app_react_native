import {
  useState,
  useCallback,
  useRef,
  useEffect,
  FC, useMemo
} from 'react';
import {
  FlatList,
  ListRenderItem,
  View,
  Platform,
  Alert,
  Text,
  Modal,
  TouchableOpacity,
  TouchableWithoutFeedback,
  Keyboard,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Voice, {
  SpeechResultsEvent,
  SpeechErrorEvent,
  SpeechRecognizedEvent,
} from '@react-native-voice/voice';
import { requestVoicePermissions } from '../../../../../services/permissions/permissionService';
import { useNavigation, useFocusEffect, useRoute, RouteProp } from '@react-navigation/native';
import { IChatbotScreenProps, IChatMessage } from './AiChatbot.types';
import { useUserRole } from '../../../../../hooks/useUserRole';
import { useSubscriptionGate } from '../../../../../hooks/useSubscriptionGate';
import { useSelectedBusiness } from '../../../../../hooks/useSelectedBusiness';
import { useSelector } from 'react-redux';
import ScreenWrapper from '../../../../../components/ScreenWrapper/ScreenWrapper';
import { isIOS } from '../../../../../utils/helpers';
import ImageCropPicker from 'react-native-image-crop-picker';
import { pick, types, errorCodes, isErrorWithCode } from '@react-native-documents/picker';
import Ionicons from 'react-native-vector-icons/Ionicons';
import colors from '../../../../../utils/colors';

import ChatHeader from './components/ChatHeader';
import TypingIndicator from './components/TypingIndicator';
import MessageBubble from './components/MessageBubble';
import SuggestionChips from './components/SuggestionChips';
import ChatInput from './components/ChatInput';

import { sendChatMessage, sendChatEvent, uploadChatMedia } from './api';
import { showSuccessToast, showErrorToast } from '../../../../../components/common';

import { sendSimpleChatMessage, sendQuestionLog } from './api';
import NetInfo, { NetInfoState } from '@react-native-community/netinfo';
import OfflineChatScreen from './components/OfflineChatScreen';
import useTTS from '../../../../../hooks/useTTS';
import { makeAiChatbotStyles } from './AiChatbot.styles';
import { useTutorialContext } from '../../../../../tutorial/TutorialContext';
import { RoleTheme } from '../../../../../types/roleManager.types';
import { makeSuggestionChipsStyles } from './components/SuggestionChips.styles';

const INITIAL_MESSAGES: IChatMessage[] = [
  {
    id: '1',
    text: "Hello, I'm Halo, NCHRG's AI Assistant. How may I help you today?",
    isUser: false,
    timestamp: new Date(Date.now() - 60000),
  },
];

const AiChatbot: FC<IChatbotScreenProps> = () => {
  const [messages, setMessages] = useState<IChatMessage[]>(INITIAL_MESSAGES);
  const [inputText, setInputText] = useState<string>('');
  const [isTyping, setIsTyping] = useState<boolean>(false);
  const [showSuggestions, setShowSuggestions] = useState<boolean>(true);
  const [conversationId, setConversationId] = useState<string>('');
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [isDeviceOffline, setIsDeviceOffline] = useState<boolean>(false);
  const [isListening, setIsListening] = useState<boolean>(false);
  const [selectedMedia, setSelectedMedia] = useState<{
    uri: string;
    mediaId: string | null;
    uploading: boolean;
    mediaType: 'image' | 'document';
    fileName: string;
  } | null>(null);
  const [mediaPickerVisible, setMediaPickerVisible] = useState(false);
  const [pendingPickAction, setPendingPickAction] = useState<'camera' | 'gallery' | 'document' | null>(null);
  const modalClosingRef = useRef(false);

  const flatListRef = useRef<FlatList>(null);
  const inputRowRef = useRef<View>(null);
  const isListeningRef = useRef(false);
  const navigation = useNavigation();
  const route = useRoute<RouteProp<{ AiAssistant: { prefillPrompt?: string; prefillMediaId?: string; prefillMediaUri?: string; prefillMediaType?: 'image' | 'document'; prefillFileName?: string }; AiChatbot: { prefillPrompt?: string; prefillMediaId?: string; prefillMediaUri?: string; prefillMediaType?: 'image' | 'document'; prefillFileName?: string } }, any>>();
  const prefillPrompt = (route.params as any)?.prefillPrompt;
  const prefillMediaId = (route.params as any)?.prefillMediaId;
  const prefillMediaUri = (route.params as any)?.prefillMediaUri;
  const prefillMediaType = (route.params as any)?.prefillMediaType;
  const prefillFileName = (route.params as any)?.prefillFileName;
  const { themeColors, isBusinessRole } = useUserRole();
  const { checkSubscription, GateModal } = useSubscriptionGate();
  const { selectedBusinessId, selectedBusiness } = useSelectedBusiness();
  const currentBusinessId = isBusinessRole() ? selectedBusinessId : undefined;
  const businessContextPrefix = currentBusinessId && selectedBusiness?.businessname
    ? `For business named = ${selectedBusiness.businessname}, businessId = ${currentBusinessId} `
    : '';
  const styles = useMemo(() => makeAiChatbotStyles(themeColors as RoleTheme), [themeColors]);
  const suggestionChipsStyles = useMemo(() => makeSuggestionChipsStyles(themeColors as RoleTheme), [themeColors]);
  const { speak, stop, isSpeaking, speakingId } = useTTS();

  // Tutorial
  const { step: tutorialStep, setSpotlightRect, setSpotlightAction } = useTutorialContext();

  useFocusEffect(
    useCallback(() => {
      if (tutorialStep !== 'spotlight_ai_assistant') return undefined;

      const measureInput = () => {
        inputRowRef.current?.measureInWindow((x, y, w, h) => {
          if (w > 0 && h > 0) {
            setSpotlightRect({ x, y, width: w, height: h });
          }
        });
      };

      // Start with the keyboard closed and the spotlight on the resting input.
      Keyboard.dismiss();
      const timer = setTimeout(() => {
        measureInput();
        setSpotlightAction(null);
      }, 500);

      // Small delay lets the keyboard-avoiding layout settle before measuring.
      const showSub = Keyboard.addListener('keyboardDidShow', () =>
        setTimeout(measureInput, 50),
      );
      const hideSub = Keyboard.addListener('keyboardDidHide', () =>
        setTimeout(measureInput, 50),
      );

      return () => {
        clearTimeout(timer);
        showSub.remove();
        hideSub.remove();
      };
      // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [tutorialStep]),
  );
  // End tutorial

  useFocusEffect(
    useCallback(() => {
      return () => {
        stop();
      };
    }, [stop]),
  );

  useEffect(() => {
    if (prefillPrompt) {
      setInputText(prefillPrompt);
    }
  }, [prefillPrompt]);

  // Pre-populate media if navigated with a pre-uploaded file (e.g. from Onboarding Step 04)
  useEffect(() => {
    if (prefillMediaId && prefillMediaUri) {
      setSelectedMedia({
        uri: prefillMediaUri,
        mediaId: prefillMediaId,
        uploading: false,
        mediaType: prefillMediaType ?? 'image',
        fileName: prefillFileName ?? 'file',
      });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const { user_data, user_id } = useSelector((state: any) => state.user_auth);
  const userId: number = user_id || user_data?.id || user_data?.userid || 0;

  useEffect(() => {
    if (!userId) return;
    const fresh = `conv_chatbot_${userId}_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
    setConversationId(fresh);
  }, [userId]);
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
    Voice.onSpeechPartialResults = (e: SpeechResultsEvent) => {
      const text = e.value?.[0] || '';
      if (text) setInputText(text);
    };

    Voice.onSpeechResults = (e: SpeechResultsEvent) => {
      if (Platform.OS === 'android') {
        const text = e.value?.[0] || '';
        if (text) setInputText(text);
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
        setInputText('');
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
    setTimeout(() => {
      flatListRef.current?.scrollToEnd({ animated: true });
    }, 100);
  }, []);

  useEffect(() => {
    if (mediaPickerVisible || !pendingPickAction || modalClosingRef.current) return;
    const action = pendingPickAction;
    setPendingPickAction(null);
    setTimeout(() => {
      if (action === 'camera') handleCameraCapture();
      else if (action === 'gallery') handleGalleryPick();
      else if (action === 'document') handleDocumentPick();
    }, 200);
  }, [mediaPickerVisible, pendingPickAction]);

  const mediaCollectRef = useRef<{ active: boolean; msgId: string | null }>({
    active: false,
    msgId: null,
  });

  const uploadAndSetMedia = useCallback(async (
    uri: string,
    mimeType: string,
    fileName: string,
    mediaType: 'image' | 'document',
  ) => {
    
    if (mediaCollectRef.current.active) {
      const targetMsgId = mediaCollectRef.current.msgId;
      mediaCollectRef.current = { active: false, msgId: null };
      setActionLoading(targetMsgId);
      try {
        const mediaId = await uploadChatMedia(uri, mimeType, fileName);
        if (!mediaId) {
          showErrorToast('Upload failed. Please try again.');
          return;
        }
        const response = await sendChatMessage('', conversationId, userId, mediaId, currentBusinessId);
        if (response) {
          const followUp: IChatMessage = {
            id: `bot-${Date.now()}`,
            text: response.message || '',
            isUser: false,
            timestamp: new Date(),
            aiResponse: response,
          };
          setMessages(prev => [...prev, followUp]);
          scrollToBottom();
          if (response.conversation_id) setConversationId(response.conversation_id);
        }
      } catch (error: any) {
        showErrorToast(error?.message || 'Failed to upload. Please try again.');
      } finally {
        setActionLoading(null);
      }
      return;
    }

    setSelectedMedia({ uri, mediaId: null, uploading: true, mediaType, fileName });
    const mediaId = await uploadChatMedia(uri, mimeType, fileName);
    setSelectedMedia(prev =>
      prev && prev.uri === uri
        ? { uri: prev.uri, mediaId, uploading: false, mediaType: prev.mediaType, fileName: prev.fileName }
        : prev,
    );
  }, [conversationId, userId, scrollToBottom, currentBusinessId]);

  // Opens the picker to add a file for an awaiting_media tool card.
  const handleMediaUpload = useCallback((msgId: string) => {
    mediaCollectRef.current = { active: true, msgId };
    setMediaPickerVisible(true);
  }, []);

  const handleCameraCapture = useCallback(async () => {
    try {
      const image = await ImageCropPicker.openCamera({
        cropping: true, width: 800, height: 800,
        cropperToolbarTitle: 'Crop Image',
        compressImageQuality: 0.8,
        includeBase64: false,
      });
      const fileName = image.path.split('/').pop() || `photo_${Date.now()}.jpg`;
      uploadAndSetMedia(image.path, image.mime, fileName, 'image');
    } catch (err: any) {
      if (err.code && err.code !== 'E_PICKER_CANCELLED') {
        Alert.alert('Error', 'Failed to capture photo');
      }
    }
  }, [uploadAndSetMedia]);

  const handleGalleryPick = useCallback(async () => {
    try {
      const image = await ImageCropPicker.openPicker({
        cropping: true, width: 800, height: 800,
        cropperToolbarTitle: 'Crop Image',
        compressImageQuality: 0.8,
        mediaType: 'photo',
      });
      const fileName = image.path.split('/').pop() || `image_${Date.now()}.jpg`;
      uploadAndSetMedia(image.path, image.mime, fileName, 'image');
    } catch (err: any) {
      if (err.code && err.code !== 'E_PICKER_CANCELLED') {
        Alert.alert('Error', 'Failed to select image');
      }
    }
  }, [uploadAndSetMedia]);

  const handleDocumentPick = useCallback(async () => {
    try {
      const result = await pick({
        allowMultiSelection: false,
        type: [types.pdf, types.doc, types.docx, types.xls, types.xlsx, types.ppt, types.pptx, types.zip],
      });
      if (result?.length > 0) {
        const doc = result[0];
        const uri = (doc as any).uri || '';
        const mimeType = (doc as any).type || 'application/octet-stream';
        const fileName = (doc as any).name || `document_${Date.now()}`;
        uploadAndSetMedia(uri, mimeType, fileName, 'document');
      }
    } catch (err: any) {
      const isCancelled = isErrorWithCode(err) && err.code === errorCodes.OPERATION_CANCELED;
      if (!isCancelled) {
        Alert.alert('Error', 'Failed to pick document');
      }
    }
  }, [uploadAndSetMedia]);

  const schedulePickAction = useCallback((action: 'camera' | 'gallery' | 'document') => {
    modalClosingRef.current = true;
    setMediaPickerVisible(false);
    setTimeout(() => {
      modalClosingRef.current = false;
      setPendingPickAction(action);
    }, 500);
  }, []);

  const handleAttachPress = useCallback(() => {
    // Regular chat attachment — make sure we're not in tool-collect mode.
    mediaCollectRef.current = { active: false, msgId: null };
    setMediaPickerVisible(true);
  }, []);

  const handleRemoveMedia = useCallback(() => {
    setSelectedMedia(null);
  }, []);

  const handleConfirmAction = useCallback(
    async (uiAction: import('../../AiAssistant.types').ChatUIAction, msgId: string) => {
      if (!uiAction.payload) return;
      setActionLoading(msgId);
      try {
        const response = await sendChatEvent(conversationId, userId, 'tool_confirmed', {
          confirmed_payload: uiAction.payload,
          businessId: currentBusinessId,
        });
        showSuccessToast(`${uiAction.label || 'Record'} saved successfully!`);
        setMessages(prev =>
          prev.map(m =>
            m.id === msgId && m.aiResponse
              ? { ...m, aiResponse: { ...m.aiResponse, status: 'complete' as const } }
              : m,
          ),
        );
        if (response?.message) {
          const followUp: IChatMessage = {
            id: `bot-${Date.now()}`,
            text: response.message,
            isUser: false,
            timestamp: new Date(),
            aiResponse: response,
          };
          setMessages(prev => [...prev, followUp]);
          scrollToBottom();
        }
        if (response?.conversation_id) setConversationId(response.conversation_id);
      } catch (error: any) {
        showErrorToast(error?.message || 'Failed to save. Please try again.');
      } finally {
        setActionLoading(null);
      }
    },
    [conversationId, userId, scrollToBottom, currentBusinessId],
  );

  const handleCancelAction = useCallback(
    async (msgId: string) => {
      try {
        const response = await sendChatEvent(conversationId, userId, 'tool_cancelled', {
          businessId: currentBusinessId,
        });
        setMessages(prev =>
          prev.map(m =>
            m.id === msgId && m.aiResponse
              ? { ...m, aiResponse: { ...m.aiResponse, status: 'cancelled' as const } }
              : m,
          ),
        );
        if (response?.message) {
          const followUp: IChatMessage = {
            id: `bot-${Date.now()}`,
            text: response.message,
            isUser: false,
            timestamp: new Date(),
            aiResponse: response,
          };
          setMessages(prev => [...prev, followUp]);
          scrollToBottom();
        }
        if (response?.conversation_id) setConversationId(response.conversation_id);
      } catch (error: any) {
        console.warn('Cancel event failed:', error?.message);
      }
    },
    [conversationId, userId, scrollToBottom, currentBusinessId],
  );

  const handleMediaAction = useCallback(
    async (event: 'media_done' | 'media_skipped' | 'tool_cancelled', msgId: string) => {
      setActionLoading(msgId);
      try {
        const response = await sendChatEvent(conversationId, userId, event, {
          businessId: currentBusinessId,
        });
        const nextStatus = event === 'tool_cancelled' ? 'cancelled' : 'complete';
        setMessages(prev =>
          prev.map(m => {
            if (!m.aiResponse) return m;
            const isMediaCard = (m.aiResponse as any).ui_action?.type === 'media_upload';
            const alreadyDone =
              m.aiResponse.status === 'complete' || m.aiResponse.status === 'cancelled';
            if (m.id === msgId || (isMediaCard && !alreadyDone)) {
              return { ...m, aiResponse: { ...m.aiResponse, status: nextStatus } };
            }
            return m;
          }),
        );
        if (response?.message) {
          const followUp: IChatMessage = {
            id: `bot-${Date.now()}`,
            text: response.message,
            isUser: false,
            timestamp: new Date(),
            aiResponse: response,
          };
          setMessages(prev => [...prev, followUp]);
          scrollToBottom();
        }
        if (response?.conversation_id) setConversationId(response.conversation_id);
      } catch (error: any) {
        showErrorToast(error?.message || 'Action failed. Please try again.');
      } finally {
        setActionLoading(null);
      }
    },
    [conversationId, userId, scrollToBottom, currentBusinessId],
  );

  const handlePickerSelect = useCallback(
    async (pickerField: string, pickerValue: any, msgId: string) => {
      setActionLoading(msgId);
      try {
        const response = await sendChatEvent(conversationId, userId, 'tool_picker_selected', {
          picker_field: pickerField,
          picker_value: pickerValue,
          businessId: currentBusinessId,
        });
        setMessages(prev =>
          prev.map(m =>
            m.id === msgId && m.aiResponse
              ? { ...m, aiResponse: { ...m.aiResponse, status: 'complete' as const } }
              : m,
          ),
        );
        const followUp: IChatMessage = {
          id: `bot-${Date.now()}`,
          text: response.message || '',
          isUser: false,
          timestamp: new Date(),
          aiResponse: response,
        };
        setMessages(prev => [...prev, followUp]);
        scrollToBottom();
        if (response?.conversation_id) setConversationId(response.conversation_id);
      } catch (error: any) {
        showErrorToast(error?.message || 'Failed to select. Please try again.');
      } finally {
        setActionLoading(null);
      }
    },
    [conversationId, userId, scrollToBottom, currentBusinessId],
  );

  const sendMessage = useCallback(
    async (text: string) => {
      const trimmed = text.trim();
      const hasImage = !!selectedMedia;
      if ((!trimmed && !hasImage) || isTyping) return;
      if (selectedMedia?.uploading) return;

      checkSubscription(async () => {
        if (isDeviceOffline) {
          const botMsg: IChatMessage = {
            id: `bot-${Date.now()}`,
            text: 'You are offline. Please use the offline options available.',
            isUser: false,
            timestamp: new Date(),
          };

          setMessages((prev) => [...prev, botMsg]);
          return;
        }

        const imageToSend = selectedMedia;
        const mediaIdToSend = imageToSend?.mediaId ?? null;

        setShowSuggestions(false);
        setInputText('');
        setSelectedMedia(null);

        const userMsg: IChatMessage = {
          id: `user-${Date.now()}`,
          text: trimmed,
          isUser: true,
          timestamp: new Date(),
          imageUri: imageToSend?.mediaType === 'image' ? imageToSend?.uri : undefined,
          documentUri: imageToSend?.mediaType === 'document' ? imageToSend?.uri : undefined,
          documentName: imageToSend?.mediaType === 'document' ? imageToSend?.fileName : undefined,
        };
        setMessages(prev => [...prev, userMsg]);
        scrollToBottom();

        setIsTyping(true);

        try {
          const baseMessage = trimmed || (imageToSend ? 'Please analyze this file.' : '');
          const response = await sendChatMessage(
            `${businessContextPrefix}${baseMessage}`,
            conversationId,
            userId,
            mediaIdToSend,
            currentBusinessId,
          );


          if (response.conversation_id) {
            setConversationId(response.conversation_id);
          }

          if (response.is_report) {
            sendQuestionLog(
              trimmed || (imageToSend ? 'Please analyze this file.' : ''),
              response.conversation_id || conversationId,
              mediaIdToSend,
            );
          }

          const botMsg: IChatMessage = {
            id: `bot-${Date.now()}`,
            text: response.message || '',
            isUser: false,
            timestamp: new Date(),
            aiResponse: response,
          };
          setMessages(prev => [...prev, botMsg]);

          if (response.message) {
            speak(response.message, botMsg.id);
          }
        } catch (err) {
          console.error('Chat API error', err);

          const botMsg: IChatMessage = {
            id: `bot-${Date.now()}`,
            text: "Sorry, I couldn't get a response right now.",
            isUser: false,
            timestamp: new Date(),
          };
          setMessages(prev => [...prev, botMsg]);
        } finally {
          setIsTyping(false);
          scrollToBottom();
        }
      }, isBusinessRole() ? 'business' : 'personal');
    },
    [scrollToBottom, conversationId, userId, isTyping, isDeviceOffline, speak, selectedMedia, checkSubscription, isBusinessRole, currentBusinessId, businessContextPrefix],
  );

  const handleSend = useCallback(() => {
    Keyboard.dismiss();
    if (!isDeviceOffline) {
      sendMessage(inputText);
    }
  }, [inputText, sendMessage, isDeviceOffline]);

  const handleSuggestionPress = useCallback(
    (text: string) => {
      if (!isDeviceOffline) {
        sendMessage(text);
      }
    },
    [sendMessage, isDeviceOffline],
  );

  const handleSpeak = useCallback(
    (text: string, id: string) => {
      speak(text, id);
    },
    [speak],
  );

  const renderMessage: ListRenderItem<IChatMessage> = useCallback(
    ({ item }) => (
      <MessageBubble
        message={item}
        themeColor={themeColors.primary}
        actionLoading={actionLoading}
        onConfirm={handleConfirmAction}
        onCancel={handleCancelAction}
        onPickerSelect={handlePickerSelect}
        onSpeak={handleSpeak}
        speakingId={speakingId}
        onChipPress={sendMessage}
        onMediaAction={handleMediaAction}
        onAttachPress={handleAttachPress}
        onMediaUpload={handleMediaUpload}
      />
    ),
    [themeColors.primary, actionLoading, handleConfirmAction, handleCancelAction, handlePickerSelect, handleSpeak, speakingId, sendMessage, handleMediaAction, handleAttachPress, handleMediaUpload],
  );

  const keyExtractor = useCallback((item: IChatMessage) => item.id, []);

  const ListFooter = useCallback(
    () => (isTyping ? <TypingIndicator /> : null),
    [isTyping],
  );
  const handleBack = useCallback(() => {
    stop();
    navigation.goBack();
  }, [navigation, stop]);

  return (
    <ScreenWrapper gradientColors={[themeColors.background, themeColors.background]}>
      <ChatHeader handleFunc={handleBack} themeColor={themeColors.primary} />

      <View style={styles.flex}>
        {isDeviceOffline ? (
          <OfflineChatScreen key="offline" />
        ) : (
          <View style={{ flex: 1 }} key="online">
            <FlatList
              ref={flatListRef}
              data={messages}
              renderItem={renderMessage}
              keyExtractor={keyExtractor}
              contentContainerStyle={styles.messagesList}
              showsVerticalScrollIndicator={false}
              ListFooterComponent={ListFooter}
              onContentSizeChange={scrollToBottom}
            />
            <SuggestionChips
              onPress={handleSuggestionPress}
              themeColor={themeColors.primary}
              visible={showSuggestions}
              styles={suggestionChipsStyles}
            />

            <View ref={inputRowRef} collapsable={false}>
              <ChatInput
                value={inputText}
                onChangeText={setInputText}
                onSend={handleSend}
                isTyping={isTyping}
                themeColor={themeColors.primary}
                isListening={isListening}
                onMicPress={handleMicPress}
                onImagePress={handleAttachPress}
                selectedImageUri={selectedMedia?.mediaType === 'image' ? selectedMedia?.uri : undefined}
                selectedDocumentName={selectedMedia?.mediaType === 'document' ? selectedMedia?.fileName : undefined}
                isMediaUploading={selectedMedia?.uploading}
                onRemoveImage={handleRemoveMedia}
              />
            </View>
          </View>
        )}
      </View>

      <Modal
        visible={mediaPickerVisible}
        transparent
        animationType="slide"
        onRequestClose={() => setMediaPickerVisible(false)}
      >
        <TouchableWithoutFeedback onPress={() => setMediaPickerVisible(false)}>
          <View style={styles.modalOverlay} />
        </TouchableWithoutFeedback>
        <SafeAreaView style={styles.modalSheet} edges={['bottom']}>
          <View style={styles.modalHandle} />
          <Text style={styles.modalTitle}>Attach Media</Text>

          <TouchableOpacity
            style={styles.modalOption}
            activeOpacity={0.7}
            onPress={() => schedulePickAction('camera')}
          >
            <Ionicons name="camera" size={28} color={themeColors.primary} />
            <Text style={styles.modalOptionText}>Camera</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.modalOption}
            activeOpacity={0.7}
            onPress={() => schedulePickAction('gallery')}
          >
            <Ionicons name="image" size={28} color={themeColors.primary} />
            <Text style={styles.modalOptionText}>Gallery</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.modalOption}
            activeOpacity={0.7}
            onPress={() => schedulePickAction('document')}
          >
            <Ionicons name="document-outline" size={28} color={themeColors.primary} />
            <Text style={styles.modalOptionText}>Document</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.modalCancel}
            activeOpacity={0.7}
            onPress={() => setMediaPickerVisible(false)}
          >
            <Text style={styles.modalCancelText}>Cancel</Text>
          </TouchableOpacity>
        </SafeAreaView>
      </Modal>
      {GateModal}
    </ScreenWrapper>
  );
};

export default AiChatbot;
