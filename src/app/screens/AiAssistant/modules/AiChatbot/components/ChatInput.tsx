import React, { FC, useMemo } from 'react';
import { useUserRole } from '../../../../../../hooks/useUserRole';
import {
    View,
    TextInput,
    TouchableOpacity,
    ActivityIndicator,
    Platform,
    Text,
    Dimensions,
    Image,
} from 'react-native';
import colors from '../../../../../../utils/colors';
import FONTS from '../../../../../../utils/fonts';
import { useKeyboard } from '../../../../../../hooks/useKeyboard';
import { useTranslation } from 'react-i18next';
import { makeChatInputStyles } from './ChatInput.styles';
import Ionicons from 'react-native-vector-icons/Ionicons';
import FontAwesome6 from 'react-native-vector-icons/FontAwesome6';
import { RoleTheme } from '../../../../../../types/roleManager.types';

const { height } = Dimensions.get('window');

interface ChatInputProps {
    value: string;
    onChangeText: (text: string) => void;
    onSend: () => void;
    isTyping: boolean;
    themeColor: string;
    isListening?: boolean;
    onMicPress?: () => void;
    onImagePress?: () => void;
    selectedImageUri?: string | null;
    selectedDocumentName?: string | null;
    isMediaUploading?: boolean;
    onRemoveImage?: () => void;
    editable?: boolean;
}

const ChatInput: FC<ChatInputProps> = ({
    value,
    onChangeText,
    onSend,
    isTyping,
    themeColor,
    isListening = false,
    onMicPress,
    onImagePress,
    selectedImageUri,
    selectedDocumentName,
    isMediaUploading = false,
    onRemoveImage,
    editable = true,
}) => {
    const trimmed = value.trim();
    const canSend = trimmed || selectedImageUri || selectedDocumentName;
    const isKeyboardVisible = useKeyboard();
    const { t } = useTranslation();

    const { themeColors } = useUserRole();

    const styles = useMemo(() => makeChatInputStyles(themeColors as RoleTheme), [themeColors]);

    return (
        <View style={[styles.inputContainer, { paddingBottom: !isKeyboardVisible ? (Platform.OS === 'ios' ? 20 : 10) : 0 }]}>
            {/* Image Preview */}
            {selectedImageUri && (
                <View style={styles.imagePreviewRow}>
                    <View style={styles.imagePreviewContainer}>
                        <Image source={{ uri: selectedImageUri }} style={styles.imagePreview} />
                        {isMediaUploading && (
                            <View style={styles.uploadingOverlay}>
                                <ActivityIndicator size="small" color={colors.white} />
                            </View>
                        )}
                        {!isMediaUploading && (
                            <TouchableOpacity
                                style={styles.removeImageBtn}
                                onPress={onRemoveImage}
                                activeOpacity={0.7}
                                hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                            >
                                <Ionicons name="close-circle" size={20} color={colors.error || '#FF3B30'} />
                            </TouchableOpacity>
                        )}
                    </View>
                </View>
            )}

            {/* Document Preview */}
            {selectedDocumentName && (
                <View style={styles.imagePreviewRow}>
                    <View style={styles.documentPreviewContainer}>
                        <FontAwesome6 name="file" size={22} color={themeColor} />
                        <Text style={styles.documentPreviewName} numberOfLines={1}>
                            {selectedDocumentName}
                        </Text>
                        {isMediaUploading ? (
                            <ActivityIndicator size="small" color={themeColor} />
                        ) : (
                            <TouchableOpacity
                                onPress={onRemoveImage}
                                activeOpacity={0.7}
                                hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                            >
                                <Ionicons name="close-circle" size={20} color={colors.error || '#FF3B30'} />
                            </TouchableOpacity>
                        )}
                    </View>
                </View>
            )}

            <View style={styles.inputRow}>
                {/* Image Picker Button */}
                {onImagePress && (
                    <TouchableOpacity
                        style={[styles.iconButton, { backgroundColor: selectedImageUri ? themeColor : themeColors.surface }]}
                        onPress={onImagePress}
                        disabled={isTyping || isListening}
                        activeOpacity={0.8}
                    >
                        <Ionicons
                            name="image-outline"
                            size={22}
                            color={selectedImageUri ? colors.white : colors.gray}
                        />
                    </TouchableOpacity>
                )}

                <View style={styles.inputWrapper}>
                    <TextInput
                        style={styles.textInput}
                        value={value}
                        onChangeText={onChangeText}
                        placeholder={t('common.type_a_message')}
                        placeholderTextColor={colors.gray}
                        multiline
                        maxLength={500}
                        onSubmitEditing={onSend}
                        returnKeyType="send"
                        blurOnSubmit={false}
                        editable={!isListening && editable}
                    />
                </View>
                {onMicPress && (
                    <TouchableOpacity
                        style={[
                            styles.sendButton,
                            { backgroundColor: isListening ? (colors.error || '#FF3B30') : themeColor },
                        ]}
                        onPress={onMicPress}
                        disabled={isTyping}
                        activeOpacity={0.8}
                    >
                        <Ionicons name={isListening ? 'stop' : 'mic'} size={20} color={themeColors.background} />
                    </TouchableOpacity>
                )}
                <TouchableOpacity
                    style={[
                        styles.sendButton,
                        {
                            backgroundColor: canSend
                                ? themeColor
                                : colors.gray ?? '#E5E5E5',
                        },
                    ]}
                    onPress={onSend}
                    disabled={!canSend || isTyping || isListening}
                    activeOpacity={0.8}
                >
                    <Text style={styles.sendArrowText}>↑</Text>
                </TouchableOpacity>
            </View>
        </View>
    );
};


export default ChatInput;