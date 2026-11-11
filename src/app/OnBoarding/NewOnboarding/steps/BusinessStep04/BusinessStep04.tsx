import React, { useCallback, useState, useMemo } from 'react';
import {
    View,
    Text,
    TouchableOpacity,
    ScrollView,
    Alert,
    Image,
    TextInput,
    ActivityIndicator,
    KeyboardAvoidingView,
    Platform,
} from 'react-native';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../../../../../types/RootStackParamList.types';
import { submitOnboardingAsync } from '../../../../../redux/services/onboardingService';
import { buildBusinessPayload } from '../../../../../utils/onboardingTransforms';
import { useTranslation } from 'react-i18next';
import {
    setBusinessExistingItems,
    setBusinessCurrentStep,
} from '../../../../../redux/slices/businessOnboardingSlice';
import { useUserRole } from '../../../../../hooks/useUserRole';
import LinearGradient from 'react-native-linear-gradient';
import { AuthHeader } from '../../../../../components/common';
import { ICONS } from '../../../../../utils/Images';
import { SafeAreaView } from 'react-native-safe-area-context';
import { makeBusinessStep04Styles } from './BusinessStep04.styles';
import { Method } from './BusinessStep04.types';
import colors from '../../../../../utils/colors';
import { makeCommonStyles } from '../../../OnBoardingScreen.styles';
import ImageCropPicker from 'react-native-image-crop-picker';
import { pick, types, errorCodes, isErrorWithCode } from '@react-native-documents/picker';
import { uploadChatMedia } from '../../../../screens/AiAssistant/modules/AiChatbot/api';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { RoleTheme } from '../../../../../types/roleManager.types';

type Nav = NativeStackNavigationProp<RootStackParamList, 'AiChatbot'>;

const BusinessStep04 = ({ onContinue, onBack }: any) => {
    const dispatch = useDispatch();
    const navigation = useNavigation<Nav>();
    const { t } = useTranslation();
    const { themeColors } = useUserRole();
    const styles = useMemo(() => makeBusinessStep04Styles(themeColors as RoleTheme), [themeColors]);
    const commonStyles = useMemo(() => makeCommonStyles(themeColors as RoleTheme), [themeColors]);

    const lifeSelections = useSelector(
        (state: any) => state.businessOnboarding_slice?.lifeSelections || []
    );
    const frustrationSelections = useSelector(
        (state: any) => state.businessOnboarding_slice?.frustrationSelections || []
    );
    const reminderPreferences = useSelector(
        (state: any) => state.businessOnboarding_slice?.reminderPreferences || []
    );
    const selectedBusinessId = useSelector(
        (state: any) => state.business_slice?.selectedBusinessId ?? null
    );

    const [selected, setSelected] = useState<Method | null>(null);
    const [uploading, setUploading] = useState(false);
    const [aiInputText, setAiInputText] = useState('');

    const handleScan = useCallback(async () => {
        setSelected('scan');
        try {
            const image = await ImageCropPicker.openCamera({
                cropping: true,
                width: 800,
                height: 800,
                cropperToolbarTitle: 'Crop Image',
                compressImageQuality: 0.8,
                includeBase64: false,
            });
            const fileName = image.path.split('/').pop() || `photo_${Date.now()}.jpg`;
            setUploading(true);
            const mediaId = await uploadChatMedia(image.path, image.mime, fileName);
            setUploading(false);
            if (!mediaId) {
                Alert.alert('Upload failed', 'Could not upload the image. Please try again.');
                return;
            }
            const payload = buildBusinessPayload(lifeSelections, frustrationSelections, reminderPreferences, selectedBusinessId);
            dispatch(submitOnboardingAsync(payload) as any).catch(() => { });
            dispatch(setBusinessCurrentStep(6));
            navigation.navigate('AiChatbot', {
                prefillPrompt: 'Please analyze this image and extract all relevant information.',
                prefillMediaId: mediaId,
                prefillMediaUri: image.path,
                prefillMediaType: 'image',
                prefillFileName: fileName,
            });
        } catch (err: any) {
            setUploading(false);
            if (err?.code && err.code !== 'E_PICKER_CANCELLED') {
                Alert.alert('Error', 'Failed to capture photo. Please try again.');
            }
        }
    }, [dispatch, navigation, lifeSelections, frustrationSelections, reminderPreferences, selectedBusinessId]);

    const handleUpload = useCallback(async () => {
        setSelected('upload');
        try {
            const result = await pick({
                allowMultiSelection: false,
                type: [types.pdf, types.doc, types.docx, types.xls, types.xlsx, types.ppt, types.pptx, types.zip],
            });
            if (!result?.length) return;
            const doc = result[0];
            const uri = (doc as any).uri || '';
            const mimeType = (doc as any).type || 'application/octet-stream';
            const fileName = (doc as any).name || `document_${Date.now()}`;
            setUploading(true);
            const mediaId = await uploadChatMedia(uri, mimeType, fileName);
            setUploading(false);
            if (!mediaId) {
                Alert.alert('Upload failed', 'Could not upload the file. Please try again.');
                return;
            }
            const payload = buildBusinessPayload(lifeSelections, frustrationSelections, reminderPreferences, selectedBusinessId);
            dispatch(submitOnboardingAsync(payload) as any).catch(() => { });
            dispatch(setBusinessCurrentStep(6));
            navigation.navigate('AiChatbot', {
                prefillPrompt: 'Please analyze this document and extract all relevant information.',
                prefillMediaId: mediaId,
                prefillMediaUri: uri,
                prefillMediaType: 'document',
                prefillFileName: fileName,
            });
        } catch (err: any) {
            setUploading(false);
            const isCancelled = isErrorWithCode(err) && err.code === errorCodes.OPERATION_CANCELED;
            if (!isCancelled) {
                Alert.alert('Error', 'Failed to pick file. Please try again.');
            }
        }
    }, [dispatch, navigation, lifeSelections, frustrationSelections, reminderPreferences, selectedBusinessId]);

    const handleAiSend = useCallback(() => {
        const trimmed = aiInputText.trim();
        if (!trimmed) return;
        dispatch(setBusinessExistingItems({ aiScanData: trimmed }));
        const payload = buildBusinessPayload(lifeSelections, frustrationSelections, reminderPreferences, selectedBusinessId);
        dispatch(submitOnboardingAsync(payload) as any).catch(() => { });
        dispatch(setBusinessCurrentStep(6));
        navigation.navigate('AiChatbot', { prefillPrompt: trimmed });
    }, [aiInputText, dispatch, navigation, lifeSelections, frustrationSelections, reminderPreferences, selectedBusinessId]);

    const handleContinue = () => {
        const payload = buildBusinessPayload(lifeSelections, frustrationSelections, reminderPreferences, selectedBusinessId);
        dispatch(submitOnboardingAsync(payload) as any).catch(() => { });
        dispatch(setBusinessCurrentStep(6));
        onContinue();
    };

    const Card = ({ id, icon, title, subtitle, onPress }: any) => {
        const active = selected === id;

        return (
            <TouchableOpacity
                onPress={onPress}
                style={[
                    styles.card,
                    active && {
                        borderColor: themeColors.primary,
                        backgroundColor: themeColors.primary + '10',
                    },
                ]}
                disabled={uploading}
            >
                <View
                    style={[
                        styles.iconBox,
                        active && { backgroundColor: themeColors.primary + '20' },
                    ]}
                >
                    <Image
                        source={icon}
                        style={{ width: 36, height: 36, tintColor: themeColors.secondary + '95' }}
                        resizeMode="contain"
                    />
                </View>

                <View style={{ flex: 1 }}>
                    <Text style={styles.cardTitle}>{title}</Text>
                    <Text style={styles.cardSubtitle}>{subtitle}</Text>
                </View>

                {uploading && selected === id && (
                    <ActivityIndicator size="small" color={themeColors.primary} style={{ marginLeft: 8 }} />
                )}
            </TouchableOpacity>
        );
    };

    return (
        <SafeAreaView style={styles.container}>
            <KeyboardAvoidingView
                style={{ flex: 1 }}
                behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
                keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 20}
            >
                <ScrollView
                    contentContainerStyle={[commonStyles.scrollContent, { paddingBottom: selected === 'ai' ? 20 : 0 }]}
                    showsVerticalScrollIndicator={false}
                    keyboardShouldPersistTaps="handled"
                >
                    <AuthHeader
                        onBackPress={onBack}
                        backButtonIconStyle={{ tintColor: colors.black }}
                        containerStyle={{ marginBottom: -30 }}
                    />

                    {/* HEADER */}
                    <View style={styles.header}>
                        <Text style={styles.headerTitle}>Business</Text>

                        <View style={[styles.stepBadge, { backgroundColor: themeColors.primary }]}>
                            <Text style={styles.stepText}>Step 04 of 05</Text>
                        </View>
                    </View>

                    {/* PROGRESS BAR */}
                    <View style={styles.progressBar}>
                        <View style={[styles.progressFill, { width: '80%', backgroundColor: themeColors.primary }]} />
                    </View>

                    {/* TITLE */}
                    <Text style={styles.title}>
                        Add what you already have.
                    </Text>

                    <Text style={styles.subtitle}>
                        Use camera, files, or natural language. Halo AI extracts fields, dates, categories, and missing information.
                    </Text>

                    {/* OPTIONS */}
                    <View style={styles.sectionCard}>
                        <Card
                            id="scan"
                            icon={require('../../../../../assets/images/icons/camera.png')}
                            title="Scan with Camera"
                            subtitle="IDs, cards, bills, receipts, warranties, registrations"
                            onPress={handleScan}
                        />

                        <Card
                            id="upload"
                            icon={require('../../../../../assets/images/icons/notes_icons.png')}
                            title="Upload Files"
                            subtitle="PDFs, screenshots, statements, policies, leases"
                            onPress={handleUpload}
                        />

                        {/* Tell Halo AI — tap to reveal gradient AI box */}
                        <TouchableOpacity
                            onPress={() => setSelected('ai')}
                            style={[
                                styles.card,
                                selected === 'ai' && {
                                    borderColor: themeColors.primary,
                                    backgroundColor: themeColors.primary + '10',
                                },
                            ]}
                            activeOpacity={0.8}
                            disabled={uploading}
                        >
                            <View
                                style={[
                                    styles.iconBox,
                                    selected === 'ai' && { backgroundColor: themeColors.primary + '20' },
                                ]}
                            >
                                <Image
                                    source={ICONS.APP_ICON}
                                    style={{ width: 36, height: 36, tintColor: themeColors.secondary + '95' }}
                                    resizeMode="contain"
                                />
                            </View>
                            <View style={{ flex: 1 }}>
                                <Text style={styles.cardTitle}>Tell Halo AI</Text>
                                {selected !== 'ai' && (
                                    <Text style={styles.cardSubtitle}>"I have a business license expiring next quarter."</Text>
                                )}
                            </View>
                        </TouchableOpacity>

                        {/* Gradient AI input box — shown when card is selected */}
                        {selected === 'ai' && (
                            <LinearGradient
                                colors={[themeColors.secondary || '#0D2F61', themeColors.primary || '#266cb1cf']}
                                style={styles.aiGradient}
                            >
                                <View style={styles.aiBox}>
                                    <Text style={styles.aiTitle}>Halo AI is reading your setup</Text>
                                    <Text style={styles.aiDesc}>
                                        Based on your answers, NCHRG is preparing Business Contacts, Projects, Licenses, Compliance modules.
                                    </Text>
                                    <View style={[styles.aiInputWrapper, { flexDirection: 'row', alignItems: 'center' }]}>
                                        <TextInput
                                            style={[styles.aiInputText, { flex: 1, minHeight: 40 }]}
                                            placeholder="Type your info or question for Halo AI..."
                                            placeholderTextColor="rgba(255,255,255,0.6)"
                                            value={aiInputText}
                                            onChangeText={setAiInputText}
                                            multiline
                                            autoFocus
                                            returnKeyType="send"
                                            onSubmitEditing={handleAiSend}
                                        />
                                        <TouchableOpacity
                                            onPress={handleAiSend}
                                            disabled={!aiInputText.trim()}
                                            style={{
                                                backgroundColor: aiInputText.trim() ? 'rgba(255,255,255,0.3)' : 'rgba(255,255,255,0.1)',
                                                borderRadius: 20,
                                                width: 36,
                                                height: 36,
                                                alignItems: 'center',
                                                justifyContent: 'center',
                                                marginLeft: 8,
                                            }}
                                            activeOpacity={0.8}
                                        >
                                            <Ionicons name="send" size={16} color="#fff" />
                                        </TouchableOpacity>
                                    </View>
                                </View>
                            </LinearGradient>
                        )}
                    </View>
                </ScrollView>
            </KeyboardAvoidingView>

            {/* FOOTER */}
            <View style={styles.footer}>
                <TouchableOpacity style={styles.backBtn} onPress={onBack}>
                    <Text style={styles.backText}>Back</Text>
                </TouchableOpacity>

                <TouchableOpacity
                    style={[styles.continueBtn, { backgroundColor: themeColors.primary }]}
                    onPress={handleContinue}
                    disabled={uploading}
                >
                    {uploading
                        ? <ActivityIndicator size="small" color="#fff" />
                        : <Text style={styles.continueText}>Continue</Text>
                    }
                </TouchableOpacity>
            </View>
        </SafeAreaView>
    );
};

export default BusinessStep04;
