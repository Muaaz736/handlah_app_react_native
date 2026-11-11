import React, { useCallback, useEffect, useMemo, useState } from 'react';
import {
  View,
  Text,
  TextInput,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import { useDispatch, useSelector } from 'react-redux';
import ScreenWrapper from '../../../../../../components/ScreenWrapper/ScreenWrapper';
import { AuthHeader, showSuccessToast, showErrorToast } from '../../../../../../components/common';
import {
  getSupportCategoriesAsync,
  createSupportTicketAsync,
} from '../../../../../../redux/services/supportService';
import { resetCreateTicketStatus } from '../../../../../../redux/slices/supportSlice';
import { ASYNC_STATUS } from '../../../../../../config/constants';
import { AppDispatch } from '../../../../../../types/store.types';
import { useUserRole } from '../../../../../../hooks/useUserRole';
import Ionicons from 'react-native-vector-icons/Ionicons';
import MixedMediaUploader from '../../../../../../components/common/MixedMediaUploader';
import colors from '../../../../../../utils/colors';
import FONTS from '../../../../../../utils/fonts';
import { RoleTheme } from '../../../../../../types/roleManager.types';

const SubmitTicket: React.FC = () => {
  const navigation = useNavigation<any>();
  const dispatch = useDispatch<AppDispatch>();
  const { themeColors } = useUserRole();
  const styles = useMemo(
    () => makeStyles(themeColors as RoleTheme),
    [themeColors]
  );

  const { categories, create_ticket_status, create_ticket_error } = useSelector(
    (state: any) => state.support_slice,
  );

  const [selectedCategoryId, setSelectedCategoryId] = useState<number | null>(null);
  const [subject, setSubject] = useState('');
  const [description, setDescription] = useState('');
  const [showCategories, setShowCategories] = useState(false);
  const [attachmentUrls, setAttachmentUrls] = useState<string[]>([]);

  useFocusEffect(
    useCallback(() => {
      dispatch(getSupportCategoriesAsync());
    }, [dispatch]),
  );

  const isSubmitting = create_ticket_status === ASYNC_STATUS.LOADING;

  useEffect(() => {
    if (create_ticket_status === ASYNC_STATUS.SUCCEEDED) {
      showSuccessToast('Support request submitted successfully!');
      dispatch(resetCreateTicketStatus());
      navigation.goBack();
    } else if (create_ticket_status === ASYNC_STATUS.ERROR) {
      showErrorToast(create_ticket_error ?? 'Failed to submit request. Please try again.');
      dispatch(resetCreateTicketStatus());
    }
  }, [create_ticket_status, create_ticket_error, dispatch, navigation]);

  const selectedCategory = categories.find((c: any) => c.id === selectedCategoryId);

  const handleSubmit = () => {
    if (!subject.trim()) {
      showErrorToast('Please enter a subject.');
      return;
    }
    if (!description.trim()) {
      showErrorToast('Please describe your issue.');
      return;
    }
    if (!selectedCategoryId) {
      showErrorToast('Please select a category.');
      return;
    }

    const payload: any = {
      subject: subject.trim(),
      description: description.trim(),
      attachmentUrls,
      categoryId: selectedCategoryId,
    };

    dispatch(createSupportTicketAsync(payload));
  };

  return (
    <ScreenWrapper scrollable={false} showShadow={false}>
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <View style={styles.container}>
          <AuthHeader
            title="New Request"
            showBackButton={true}
            onBackPress={() => navigation.goBack()}
            containerStyle={styles.headerContainer}
            titleStyle={styles.headerTitle}
            backButtonIconStyle={{ tintColor: themeColors.textPrimary }}
          />

          <ScrollView
            contentContainerStyle={styles.scrollContent}
            keyboardShouldPersistTaps="handled"
            showsVerticalScrollIndicator={false}
          >
            {/* Category picker */}
            <Text style={styles.label}>Category</Text>
            <TouchableOpacity
              style={styles.input}
              onPress={() => setShowCategories(!showCategories)}
              activeOpacity={0.8}
            >
              <Text
                style={[
                  styles.inputText,
                  !selectedCategory && styles.placeholder,
                ]}
              >
                {selectedCategory ? selectedCategory.name : 'Select a category'}
              </Text>
              <Ionicons
                name={showCategories ? 'chevron-up' : 'chevron-down'}
                size={16}
                color={colors.gray}
              />
            </TouchableOpacity>

            {showCategories && (
              <View style={styles.dropdownList}>
                {categories.map((cat: any) => (
                  <TouchableOpacity
                    key={cat.id}
                    style={[
                      styles.dropdownItem,
                      selectedCategoryId === cat.id && {
                        backgroundColor: themeColors.primary + '14',
                      },
                    ]}
                    onPress={() => {
                      setSelectedCategoryId(cat.id);
                      setShowCategories(false);
                    }}
                  >
                    <Text
                      style={[
                        styles.dropdownItemText,
                        selectedCategoryId === cat.id && {
                          color: themeColors.primary,
                          fontFamily: FONTS.display_semi_bold,
                        },
                      ]}
                    >
                      {cat.name}
                    </Text>
                  </TouchableOpacity>
                ))}

              </View>
            )}



            {/* Subject */}
            <Text style={styles.label}>Subject *</Text>
            <TextInput
              style={styles.input}
              placeholder="Brief summary of your issue"
              placeholderTextColor={colors.gray}
              value={subject}
              onChangeText={setSubject}
              maxLength={200}
            />

            {/* Description */}
            <Text style={styles.label}>Description *</Text>
            <TextInput
              style={[styles.input, styles.textArea]}
              placeholder="Describe your issue in detail..."
              placeholderTextColor={colors.gray}
              value={description}
              onChangeText={setDescription}
              multiline
              textAlignVertical="top"
            />

            {/* Attachments */}
            <MixedMediaUploader
              label="Attachments"
              mediaIds={attachmentUrls}
              onMediaChange={setAttachmentUrls}
              uploadType="placeholder"
              maxItems={5}
            />

            <TouchableOpacity
              style={[
                styles.submitBtn,
                { backgroundColor: themeColors.primary },
                isSubmitting && { opacity: 0.7 },
              ]}
              onPress={handleSubmit}
              disabled={isSubmitting}
              activeOpacity={0.85}
            >
              {isSubmitting ? (
                <ActivityIndicator color={colors.white} />
              ) : (
                <Text style={styles.submitText}>Submit Request</Text>
              )}
            </TouchableOpacity>
          </ScrollView>
        </View>
      </KeyboardAvoidingView>
    </ScreenWrapper>
  );
};

export default SubmitTicket;

const makeStyles = (theme: RoleTheme) =>
  StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: theme.background,
      paddingHorizontal: 16,
    },

    headerContainer: {
      marginBottom: 10,
      paddingTop: 20,
    },

    headerTitle: {
      fontSize: 24,
    },

    scrollContent: {
      paddingBottom: 40,
    },

    label: {
      fontSize: 13,
      fontFamily: FONTS.display_semi_bold,
      color: theme.textPrimary,
      marginBottom: 6,
      marginTop: 16,
    },

    input: {
      borderWidth: 1,
      borderColor: theme.border,
      borderRadius: 10,
      paddingHorizontal: 14,
      paddingVertical: 12,
      fontSize: 14,
      fontFamily: FONTS.display_regular,
      color: theme.textPrimary,
      backgroundColor: theme.surface,
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
    },

    inputText: {
      fontSize: 14,
      fontFamily: FONTS.display_regular,
      color: theme.textPrimary,
      flex: 1,
    },

    placeholder: {
      color: theme.textSecondary,
    },

    textArea: {
      minHeight: 120,
      paddingTop: 12,
    },

    dropdownList: {
      borderWidth: 1,
      borderColor: theme.border,
      borderRadius: 10,
      marginTop: 4,
      overflow: 'hidden',
      backgroundColor: theme.surface,
    },

    dropdownItem: {
      paddingHorizontal: 14,
      paddingVertical: 12,
      borderBottomWidth: 1,
      borderBottomColor: theme.border,
    },

    dropdownItemText: {
      fontSize: 14,
      fontFamily: FONTS.display_regular,
      color: theme.textPrimary,
    },

    submitBtn: {
      marginTop: 28,
      paddingVertical: 14,
      borderRadius: 12,
      alignItems: 'center',
    },

    submitText: {
      fontSize: 15,
      fontFamily: FONTS.display_semi_bold,
      color: '#FFFFFF',
    },
  });
