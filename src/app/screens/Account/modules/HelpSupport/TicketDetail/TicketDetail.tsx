import React, { useCallback, useEffect, useMemo, useState, useRef } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  TextInput,
  Alert,
  KeyboardAvoidingView,
  Platform,
  StyleSheet,
} from 'react-native';
import { useNavigation, useRoute, useFocusEffect } from '@react-navigation/native';
import { useDispatch, useSelector } from 'react-redux';
import Feather from 'react-native-vector-icons/Feather';
import ScreenWrapper from '../../../../../../components/ScreenWrapper/ScreenWrapper';
import { AuthHeader, showSuccessToast, showErrorToast } from '../../../../../../components/common';
import {
  getSupportTicketAsync,
  reopenSupportTicketAsync,
  replySupportTicketAsync,
  editSupportReplyAsync,
  deleteSupportReplyAsync,
} from '../../../../../../redux/services/supportService';
import {
  clearTicketDetail,
  resetReopenTicketStatus,
  resetReplyStatus,
  resetEditReplyStatus,
  resetDeleteReplyStatus,
} from '../../../../../../redux/slices/supportSlice';
import { ASYNC_STATUS } from '../../../../../../config/constants';
import { AppDispatch } from '../../../../../../types/store.types';
import { useUserRole } from '../../../../../../hooks/useUserRole';
import MixedMediaDisplayer from '../../../../../../components/common/MixedMediaDisplayer';
import MixedMediaUploader from '../../../../../../components/common/MixedMediaUploader';
import colors from '../../../../../../utils/colors';
import FONTS from '../../../../../../utils/fonts';
import { RoleTheme } from '../../../../../../types/roleManager.types';

const STATUS_LABELS: Record<number, string> = {
  1: 'Open',
  2: 'In Progress',
  3: 'Resolved',
  4: 'Closed',
  5: 'Reopened',
};

const STATUS_COLORS: Record<number, string> = {
  1: '#4CAF50',
  2: '#2196F3',
  3: '#9E9E9E',
  4: '#9E9E9E',
  5: '#FF9800',
};

const PRIORITY_LABELS: Record<number, string> = {
  1: 'Low',
  2: 'Medium',
  3: 'High',
};

const PRIORITY_COLORS: Record<number, string> = {
  1: '#4CAF50',
  2: '#FF9800',
  3: '#F44336',
};

const TicketDetail: React.FC = () => {
  const navigation = useNavigation<any>();
  const route = useRoute<any>();
  const dispatch = useDispatch<AppDispatch>();
  const { themeColors } = useUserRole();
  const styles = useMemo(
    () => makeStyles(themeColors as RoleTheme),
    [themeColors]
  );
  const scrollRef = useRef<ScrollView>(null);

  const { ticketId } = route.params as { ticketId: number };

  const { user_data } = useSelector((state: any) => state.user_auth);
  const currentUserId = user_data?.id;

  const {
    ticket_detail,
    ticket_detail_status,
    reopen_ticket_status,
    reopen_ticket_error,
    reply_status,
    reply_error,
    edit_reply_status,
    edit_reply_error,
    delete_reply_status,
    delete_reply_error,
  } = useSelector((state: any) => state.support_slice);

  const [replyText, setReplyText] = useState('');
  const [replyAttachments, setReplyAttachments] = useState<string[]>([]);
  const [showReplyAttachments, setShowReplyAttachments] = useState(false);
  const [editingReplyId, setEditingReplyId] = useState<number | null>(null);
  const [editText, setEditText] = useState('');

  useFocusEffect(
    useCallback(() => {
      dispatch(getSupportTicketAsync(ticketId));
      return () => {
        dispatch(clearTicketDetail());
      };
    }, [dispatch, ticketId]),
  );

  const isReopening = reopen_ticket_status === ASYNC_STATUS.LOADING;
  const isSendingReply = reply_status === ASYNC_STATUS.LOADING;
  const isEditingReply = edit_reply_status === ASYNC_STATUS.LOADING;

  // Reopen effect
  useEffect(() => {
    if (reopen_ticket_status === ASYNC_STATUS.SUCCEEDED) {
      showSuccessToast('Ticket reopened successfully!');
      dispatch(resetReopenTicketStatus());
      dispatch(getSupportTicketAsync(ticketId));
    } else if (reopen_ticket_status === ASYNC_STATUS.ERROR) {
      showErrorToast(reopen_ticket_error ?? 'Failed to reopen ticket.');
      dispatch(resetReopenTicketStatus());
    }
  }, [reopen_ticket_status, reopen_ticket_error, dispatch, ticketId]);

  // Reply effect
  useEffect(() => {
    if (reply_status === ASYNC_STATUS.SUCCEEDED) {
      showSuccessToast('Reply sent!');
      setReplyText('');
      setReplyAttachments([]);
      setShowReplyAttachments(false);
      dispatch(resetReplyStatus());
      setTimeout(() => scrollRef.current?.scrollToEnd({ animated: true }), 300);
    } else if (reply_status === ASYNC_STATUS.ERROR) {
      showErrorToast(reply_error ?? 'Failed to send reply.');
      dispatch(resetReplyStatus());
    }
  }, [reply_status, reply_error, dispatch]);

  // Edit reply effect
  useEffect(() => {
    if (edit_reply_status === ASYNC_STATUS.SUCCEEDED) {
      showSuccessToast('Reply updated!');
      setEditingReplyId(null);
      setEditText('');
      dispatch(resetEditReplyStatus());
    } else if (edit_reply_status === ASYNC_STATUS.ERROR) {
      showErrorToast(edit_reply_error ?? 'Failed to edit reply.');
      dispatch(resetEditReplyStatus());
    }
  }, [edit_reply_status, edit_reply_error, dispatch]);

  // Delete reply effect
  useEffect(() => {
    if (delete_reply_status === ASYNC_STATUS.SUCCEEDED) {
      showSuccessToast('Reply deleted.');
      dispatch(resetDeleteReplyStatus());
    } else if (delete_reply_status === ASYNC_STATUS.ERROR) {
      showErrorToast(delete_reply_error ?? 'Failed to delete reply.');
      dispatch(resetDeleteReplyStatus());
    }
  }, [delete_reply_status, delete_reply_error, dispatch]);

  const handleSendReply = useCallback(() => {
    const trimmed = replyText.trim();
    if (!trimmed && replyAttachments.length === 0) return;
    dispatch(replySupportTicketAsync({ ticketId, message: trimmed, attachmentUrls: replyAttachments }));
  }, [replyText, replyAttachments, ticketId, dispatch]);

  const handleStartEdit = useCallback((replyId: number, currentMessage: string) => {
    setEditingReplyId(replyId);
    setEditText(currentMessage);
  }, []);

  const handleSaveEdit = useCallback(() => {
    const trimmed = editText.trim();
    if (!trimmed || editingReplyId === null) return;
    dispatch(editSupportReplyAsync({ ticketId, replyId: editingReplyId, message: trimmed }));
  }, [editText, editingReplyId, ticketId, dispatch]);

  const handleCancelEdit = useCallback(() => {
    setEditingReplyId(null);
    setEditText('');
  }, []);

  const handleDeleteReply = useCallback((replyId: number) => {
    Alert.alert(
      'Delete Reply',
      'Are you sure you want to delete this reply?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: () => dispatch(deleteSupportReplyAsync({ ticketId, replyId })),
        },
      ],
    );
  }, [ticketId, dispatch]);

  const isUserReply = useCallback((reply: any): boolean => {
    if (reply.isAdminReply === false || reply.isadminreply === false) return true;
    if (reply.isAdminReply === true || reply.isadminreply === true) return false;
    if (reply.userId || reply.userid) {
      return (reply.userId ?? reply.userid) === currentUserId;
    }
    if (reply.adminUserId || reply.adminuserid) return false;
    return false;
  }, [currentUserId]);

  const isLoading = ticket_detail_status === ASYNC_STATUS.LOADING && !ticket_detail;
  const isTicketActive = ticket_detail && ![3, 4].includes(ticket_detail.status);

  return (
    <ScreenWrapper scrollable={false} showShadow={false}>
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 90 : 0}
      >
        <View style={styles.container}>
          <AuthHeader
            title="Ticket Detail"
            showBackButton={true}
            onBackPress={() => navigation.goBack()}
            containerStyle={styles.headerContainer}
            titleStyle={styles.headerTitle}
            backButtonIconStyle={{ tintColor: themeColors.textPrimary }}
          />

          {isLoading ? (
            <View style={styles.centered}>
              <ActivityIndicator size="large" color={themeColors.primary} />
            </View>
          ) : !ticket_detail ? (
            <View style={styles.centered}>
              <Text style={styles.emptyText}>Unable to load ticket details.</Text>
            </View>
          ) : (
            <>
              <ScrollView
                ref={scrollRef}
                contentContainerStyle={styles.scrollContent}
                showsVerticalScrollIndicator={false}
                keyboardShouldPersistTaps="handled"
              >
                {/* Header card */}
                <View style={styles.card}>
                  <View style={styles.rowSpaced}>
                    <View
                      style={[
                        styles.statusBadge,
                        { backgroundColor: (STATUS_COLORS[ticket_detail.status] ?? '#9E9E9E') + '20' },
                      ]}
                    >
                      <Text
                        style={[
                          styles.statusText,
                          { color: STATUS_COLORS[ticket_detail.status] ?? '#9E9E9E' },
                        ]}
                      >
                        {STATUS_LABELS[ticket_detail.status] ?? 'Unknown'}
                      </Text>
                    </View>
                    {ticket_detail.priority && (
                      <View
                        style={[
                          styles.priorityBadge,
                          { backgroundColor: PRIORITY_COLORS[ticket_detail.priority] + '20' },
                        ]}
                      >
                        <Text
                          style={[
                            styles.priorityText,
                            { color: PRIORITY_COLORS[ticket_detail.priority] },
                          ]}
                        >
                          {PRIORITY_LABELS[ticket_detail.priority] ?? ''} Priority
                        </Text>
                      </View>
                    )}
                  </View>

                  <Text style={styles.subject}>{ticket_detail.subject}</Text>

                  {(ticket_detail.categoryname || ticket_detail.category) && (
                    <Text style={styles.category}>
                      Category: {ticket_detail.categoryname ?? ticket_detail.category}
                    </Text>
                  )}

                  <Text style={styles.date}>
                    Submitted:{' '}
                    {(ticket_detail.createdat || ticket_detail.createdAt)
                      ? new Date(ticket_detail.createdat ?? ticket_detail.createdAt).toLocaleDateString()
                      : '—'}
                  </Text>
                </View>

                {/* Description */}
                <Text style={styles.sectionTitle}>Description</Text>
                <View style={styles.card}>
                  <Text style={styles.descText}>{ticket_detail.description}</Text>
                </View>

                {/* Attachments */}
                {((ticket_detail.attachmenturls ?? ticket_detail.attachmentUrls) || []).length > 0 && (
                  <>
                    <Text style={styles.sectionTitle}>Attachments</Text>
                    <View style={styles.card}>
                      <MixedMediaDisplayer
                        attachmentIds={ticket_detail.attachmenturls ?? ticket_detail.attachmentUrls ?? []}
                        showDocHeading={false}
                      />
                    </View>
                  </>
                )}

                {/* Replies */}
                {ticket_detail.replies && ticket_detail.replies.length > 0 && (
                  <>
                    <Text style={styles.sectionTitle}>
                      Conversation ({ticket_detail.replies.length})
                    </Text>
                    {ticket_detail.replies.map((reply: any, idx: number) => {
                      const replyAttachments = reply.attachmenturls ?? reply.attachmentUrls ?? [];
                      const isOwn = isUserReply(reply);
                      const senderName = isOwn
                        ? 'You'
                        : (reply.adminname ?? reply.adminName ?? reply.userFullName ?? reply.userfullname ?? 'Support Team');
                      const isEditing = editingReplyId === reply.id;

                      return (
                        <View
                          key={reply.id ?? idx}
                          style={[
                            styles.replyCard,
                            isOwn ? styles.userReplyCard : styles.adminReplyCard,
                          ]}
                        >
                          <View style={styles.rowSpaced}>
                            <View style={styles.replyHeaderLeft}>
                              <View style={[styles.senderDot, { backgroundColor: isOwn ? themeColors.primary : '#2196F3' }]} />
                              <Text style={[styles.replyAdmin, isOwn && { color: themeColors.primary }]}>
                                {senderName}
                              </Text>
                            </View>
                            <View style={styles.replyHeaderRight}>
                              <Text style={styles.replyDate}>
                                {(reply.createdat || reply.createdAt)
                                  ? new Date(reply.createdat ?? reply.createdAt).toLocaleDateString()
                                  : ''}
                              </Text>
                              {isOwn && !isEditing && (
                                <View style={styles.replyActions}>
                                  <TouchableOpacity
                                    onPress={() => handleStartEdit(reply.id, reply.message)}
                                    hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                                    style={styles.replyActionBtn}
                                  >
                                    <Feather name="edit-2" size={14} color={themeColors.primary} />
                                  </TouchableOpacity>
                                  <TouchableOpacity
                                    onPress={() => handleDeleteReply(reply.id)}
                                    hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                                    style={styles.replyActionBtn}
                                  >
                                    <Feather name="trash-2" size={14} color="#F44336" />
                                  </TouchableOpacity>
                                </View>
                              )}
                            </View>
                          </View>

                          {isEditing ? (
                            <View style={styles.editContainer}>
                              <TextInput
                                style={styles.editInput}
                                value={editText}
                                onChangeText={setEditText}
                                multiline
                                autoFocus
                              />
                              <View style={styles.editBtns}>
                                <TouchableOpacity
                                  style={styles.editCancelBtn}
                                  onPress={handleCancelEdit}
                                >
                                  <Text style={styles.editCancelText}>Cancel</Text>
                                </TouchableOpacity>
                                <TouchableOpacity
                                  style={[styles.editSaveBtn, { backgroundColor: themeColors.primary }]}
                                  onPress={handleSaveEdit}
                                  disabled={isEditingReply}
                                >
                                  {isEditingReply ? (
                                    <ActivityIndicator color="#fff" size="small" />
                                  ) : (
                                    <Text style={styles.editSaveText}>Save</Text>
                                  )}
                                </TouchableOpacity>
                              </View>
                            </View>
                          ) : (
                            <Text style={styles.replyMessage}>{reply.message}</Text>
                          )}

                          {replyAttachments.length > 0 && (
                            <View style={{ marginTop: 12 }}>
                              <Text style={[styles.sectionTitle, { fontSize: 14, marginBottom: 8 }]}>Attachments</Text>
                              <MixedMediaDisplayer
                                attachmentIds={replyAttachments}
                                showDocHeading={false}
                              />
                            </View>
                          )}
                        </View>
                      );
                    })}
                  </>
                )}

                {/* Reopen button — show only for Resolved (3) or Closed (4) */}
                {(ticket_detail.status === 3 || ticket_detail.status === 4) && (
                  <TouchableOpacity
                    style={[
                      styles.reopenBtn,
                      { borderColor: themeColors.primary },
                      isReopening && { opacity: 0.7 },
                    ]}
                    onPress={() => dispatch(reopenSupportTicketAsync(ticketId))}
                    disabled={isReopening}
                    activeOpacity={0.85}
                  >
                    {isReopening ? (
                      <ActivityIndicator color={themeColors.primary} />
                    ) : (
                      <Text style={[styles.reopenText, { color: themeColors.primary }]}>
                        Reopen Ticket
                      </Text>
                    )}
                  </TouchableOpacity>
                )}
              </ScrollView>

              {/* Reply input — show for active tickets */}
              {isTicketActive && (
                <View style={styles.replyComposer}>
                  {showReplyAttachments && (
                    <MixedMediaUploader
                      label="Attachment"
                      mediaIds={replyAttachments}
                      onMediaChange={setReplyAttachments}
                      uploadType="placeholder"
                      maxItems={1}
                    />
                  )}
                  <View style={styles.replyInputContainer}>
                    <TouchableOpacity
                      style={styles.attachBtn}
                      onPress={() => setShowReplyAttachments(prev => !prev)}
                      hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                    >
                      <Feather
                        name="paperclip"
                        size={20}
                        color={replyAttachments.length > 0 ? themeColors.primary : colors.placeholder}
                      />
                      {replyAttachments.length > 0 && (
                        <View style={[styles.attachBadge, { backgroundColor: themeColors.primary }]}>
                          <Text style={styles.attachBadgeText}>{replyAttachments.length}</Text>
                        </View>
                      )}
                    </TouchableOpacity>
                    <TextInput
                      style={styles.replyInput}
                      placeholder="Type your reply..."
                      placeholderTextColor={colors.placeholder}
                      value={replyText}
                      onChangeText={setReplyText}
                      multiline
                      maxLength={2000}
                    />
                    <TouchableOpacity
                      style={[
                        styles.sendBtn,
                        { backgroundColor: (replyText.trim() || replyAttachments.length > 0) ? themeColors.primary : colors.placeholder },
                      ]}
                      onPress={handleSendReply}
                      disabled={(!replyText.trim() && replyAttachments.length === 0) || isSendingReply}
                      activeOpacity={0.8}
                    >
                      {isSendingReply ? (
                        <ActivityIndicator color="#fff" size="small" />
                      ) : (
                        <Feather name="send" size={18} color="#fff" />
                      )}
                    </TouchableOpacity>
                  </View>
                </View>
              )}
            </>
          )}
        </View>
      </KeyboardAvoidingView>
    </ScreenWrapper>
  );
};

export default TicketDetail;

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

    centered: {
      flex: 1,
      alignItems: 'center',
      justifyContent: 'center',
    },

    emptyText: {
      fontSize: 14,
      fontFamily: FONTS.display_regular,
      color: theme.textSecondary,
    },

    scrollContent: {
      paddingBottom: 20,
    },

    card: {
      backgroundColor: theme.surface,
      borderRadius: 12,
      borderWidth: 1,
      borderColor: theme.border,
      padding: 14,
      marginBottom: 12,
    },

    rowSpaced: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: 8,
    },

    statusBadge: {
      paddingHorizontal: 10,
      paddingVertical: 4,
      borderRadius: 20,
    },

    statusText: {
      fontSize: 12,
      fontFamily: FONTS.display_semi_bold,
    },

    priorityBadge: {
      paddingHorizontal: 10,
      paddingVertical: 4,
      borderRadius: 20,
    },

    priorityText: {
      fontSize: 12,
      fontFamily: FONTS.display_semi_bold,
    },

    subject: {
      fontSize: 17,
      fontFamily: FONTS.display_bold,
      color: theme.textPrimary,
      marginBottom: 6,
    },

    category: {
      fontSize: 13,
      fontFamily: FONTS.display_regular,
      color: theme.textSecondary,
      marginBottom: 4,
    },

    date: {
      fontSize: 12,
      fontFamily: FONTS.display_regular,
      color: theme.textSecondary,
    },

    sectionTitle: {
      fontSize: 15,
      fontFamily: FONTS.display_semi_bold,
      color: theme.textPrimary,
      marginBottom: 8,
      marginTop: 4,
    },

    descText: {
      fontSize: 14,
      fontFamily: FONTS.display_regular,
      color: theme.textPrimary,
      lineHeight: 22,
    },

    // Reply cards
    replyCard: {
      borderRadius: 10,
      padding: 12,
      marginBottom: 10,
      borderWidth: 1,
    },

    adminReplyCard: {
      backgroundColor: theme.surface,
      borderColor: theme.border,
    },

    userReplyCard: {
      backgroundColor: (theme.primary ?? '#007AFF') + '08',
      borderColor: (theme.primary ?? '#007AFF') + '30',
    },

    replyHeaderLeft: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 6,
      flex: 1,
    },

    senderDot: {
      width: 8,
      height: 8,
      borderRadius: 4,
    },

    replyHeaderRight: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 8,
    },

    replyActions: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 4,
    },

    replyActionBtn: {
      padding: 4,
    },

    replyAdmin: {
      fontSize: 13,
      fontFamily: FONTS.display_semi_bold,
      color: theme.textPrimary,
    },

    replyDate: {
      fontSize: 11,
      fontFamily: FONTS.display_regular,
      color: theme.textSecondary,
    },

    replyMessage: {
      fontSize: 14,
      fontFamily: FONTS.display_regular,
      color: theme.textPrimary,
      lineHeight: 21,
      marginTop: 6,
    },

    // Edit mode
    editContainer: {
      marginTop: 8,
    },

    editInput: {
      fontSize: 14,
      fontFamily: FONTS.display_regular,
      color: theme.textPrimary,
      borderWidth: 1,
      borderColor: theme.border,
      borderRadius: 8,
      padding: 10,
      minHeight: 60,
      textAlignVertical: 'top',
      backgroundColor: theme.background,
    },

    editBtns: {
      flexDirection: 'row',
      justifyContent: 'flex-end',
      gap: 8,
      marginTop: 8,
    },

    editCancelBtn: {
      paddingVertical: 6,
      paddingHorizontal: 14,
      borderRadius: 6,
      borderWidth: 1,
      borderColor: theme.border,
    },

    editCancelText: {
      fontSize: 13,
      fontFamily: FONTS.display_semi_bold,
      color: theme.textSecondary,
    },

    editSaveBtn: {
      paddingVertical: 6,
      paddingHorizontal: 14,
      borderRadius: 6,
      minWidth: 60,
      alignItems: 'center',
    },

    editSaveText: {
      fontSize: 13,
      fontFamily: FONTS.display_semi_bold,
      color: '#fff',
    },

    // Reopen button
    reopenBtn: {
      marginTop: 16,
      paddingVertical: 13,
      borderRadius: 12,
      borderWidth: 1.5,
      alignItems: 'center',
    },

    reopenText: {
      fontSize: 15,
      fontFamily: FONTS.display_semi_bold,
    },

    // Reply input bar
    replyComposer: {
      borderTopWidth: 1,
      borderTopColor: theme.border,
    },

    replyInputContainer: {
      flexDirection: 'row',
      alignItems: 'flex-end',
      paddingVertical: 10,
      gap: 10,
    },

    attachBtn: {
      paddingBottom: Platform.OS === 'ios' ? 10 : 8,
      position: 'relative',
    },

    attachBadge: {
      position: 'absolute',
      top: -4,
      right: -6,
      minWidth: 16,
      height: 16,
      borderRadius: 8,
      alignItems: 'center',
      justifyContent: 'center',
      paddingHorizontal: 3,
    },

    attachBadgeText: {
      fontSize: 10,
      fontFamily: FONTS.display_semi_bold,
      color: '#fff',
    },

    replyInput: {
      flex: 1,
      fontSize: 14,
      fontFamily: FONTS.display_regular,
      color: theme.textPrimary,
      borderWidth: 1,
      borderColor: theme.border,
      borderRadius: 20,
      paddingHorizontal: 16,
      paddingVertical: Platform.OS === 'ios' ? 10 : 8,
      maxHeight: 100,
      backgroundColor: theme.surface,
    },

    sendBtn: {
      width: 40,
      height: 40,
      borderRadius: 20,
      alignItems: 'center',
      justifyContent: 'center',
    },
  });
