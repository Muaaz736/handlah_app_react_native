import { StyleSheet } from 'react-native';
import FONTS from '../../../../../../utils/fonts';
import type { RoleTheme } from '../../../../../../types/roleManager.types';

export const makeMessageBubbleStyles = (theme: RoleTheme) =>
  StyleSheet.create({
    messageRow: {
      flexDirection: 'row',
      alignItems: 'flex-end',
      gap: 8,
      marginBottom: 4,
    },
    userRow: { justifyContent: 'flex-end' },
    botRow: { justifyContent: 'flex-start' },
    fullWidthEntry: { flexDirection: 'column', gap: 6, marginBottom: 4 },
    richCardRow: { flexDirection: 'row', alignItems: 'flex-start', gap: 8 },
    avatarPlaceholder: { width: 30, flexShrink: 0 },
    richCardWrapper: { flex: 1, gap: 4 },
    botAvatarSmall: {
      width: 30, height: 30, borderRadius: 15,
      justifyContent: 'center', alignItems: 'center', marginBottom: 4, flexShrink: 0,
    },
    bubbleWrapper: { maxWidth: '75%', gap: 4 },
    userBubbleWrapper: { maxWidth: '75%' },
    imageBubble: { borderRadius: 18, borderBottomRightRadius: 4, padding: 3, overflow: 'hidden' },
    chatImage: { width: 200, height: 200, borderRadius: 15, resizeMode: 'contain' },
    documentBubble: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 8,
      borderRadius: 18,
      borderBottomRightRadius: 4,
      paddingHorizontal: 14,
      paddingVertical: 10,
      maxWidth: 220,
    },
    documentBubbleText: {
      flexShrink: 1,
      fontSize: 14,
      fontFamily: FONTS.display_medium,
      color: '#ffffff',
    },
    bubble: { borderRadius: 18, paddingHorizontal: 14, paddingVertical: 10 },
    userBubble: { borderBottomRightRadius: 4 },
    botBubble: {
      backgroundColor: theme.isDark ? '#ddddddff' : '#F2F4F7',
      borderRadius: 18, borderBottomLeftRadius: 4,
      paddingHorizontal: 14, paddingVertical: 10,
    },
    messageText: { fontSize: 15, lineHeight: 21, fontFamily: FONTS.display_medium },
    userMessageText: { color: '#ffffff' },
    botMessageText: { color: theme.textPrimary },
    timestamp: { fontSize: 11, fontFamily: FONTS.display_medium, color: theme.textSecondary },
    userTimestamp: { textAlign: 'right' },
    botTimestamp: { textAlign: 'left', marginLeft: 4 },
    speakerBtn: { alignSelf: 'flex-start', paddingVertical: 2, paddingHorizontal: 4, marginTop: 2 },
    chipsContainer: { flexDirection: 'row', flexWrap: 'wrap', gap: 6, marginTop: 8 },
    chip: { paddingHorizontal: 10, paddingVertical: 5, borderRadius: 16, borderWidth: 1, backgroundColor: 'transparent' },
    chipText: { fontSize: 12, fontFamily: FONTS.display_medium },
  });

export const makeRichStyles = (theme: RoleTheme) =>
  StyleSheet.create({
    card: {
      backgroundColor: theme.surface,
      borderRadius: 16, borderWidth: 1, borderColor: theme.border,
      paddingHorizontal: 16, paddingVertical: 14,
      shadowColor: '#000', shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.07, shadowRadius: 6, elevation: 2,
    },
    reviewHeader: {
      flexDirection: 'row', justifyContent: 'space-between',
      alignItems: 'center', marginBottom: 12, gap: 8,
    },
    reviewTitle: { fontSize: 14, fontFamily: FONTS.display_medium, color: theme.textPrimary, flexShrink: 1 },
    reviewTitleBold: { fontFamily: FONTS.display_semi_bold },
    stepText: { fontSize: 12, fontFamily: FONTS.display_medium, color: theme.textSecondary, flexShrink: 0 },
    fieldRow: {
      flexDirection: 'row', alignItems: 'center', paddingVertical: 8,
      borderBottomWidth: 1, borderBottomColor: theme.border, gap: 12,
    },
    fieldRowLast: { borderBottomWidth: 0 },
    fieldLabel: { fontSize: 13, fontFamily: FONTS.display_medium, color: theme.textSecondary, flex: 1 },
    fieldValue: {
      fontSize: 13, fontFamily: FONTS.display_semi_bold, color: theme.textPrimary,
      flexShrink: 0, maxWidth: '55%', textAlign: 'right',
    },
    reviewActions: { flexDirection: 'row', gap: 10, marginTop: 16 },
    actionBtn: { flex: 1, paddingVertical: 12, borderRadius: 12, alignItems: 'center', justifyContent: 'center' },
    cancelBtn: { backgroundColor: theme.surface, borderWidth: 1, borderColor: theme.border },
    cancelBtnText: { fontSize: 14, fontFamily: FONTS.display_semi_bold, color: theme.textPrimary },
    confirmBtn: { minHeight: 44 },
    confirmBtnText: { fontSize: 14, fontFamily: FONTS.display_semi_bold, color: '#ffffff' },
    actionedBadge: { marginTop: 12, alignItems: 'center', paddingVertical: 4 },
    actionedText: { fontSize: 13, fontFamily: FONTS.display_semi_bold, color: '#22C55E' },
    emptyText: {
      fontSize: 13, fontFamily: FONTS.display_regular,
      color: theme.textSecondary, textAlign: 'center', paddingVertical: 8,
    },
    count: { fontSize: 11, fontFamily: FONTS.display_regular, color: theme.textSecondary, textAlign: 'right', marginTop: 8 },
  });

export const makeListStyles = (theme: RoleTheme) =>
  StyleSheet.create({
    item: { flexDirection: 'column', paddingVertical: 10, borderBottomWidth: 1, borderBottomColor: theme.border },
    row: { flexDirection: 'row', alignItems: 'center', gap: 12 },
    avatar: { width: 36, height: 36, borderRadius: 18, alignItems: 'center', justifyContent: 'center', flexShrink: 0 },
    avatarText: { fontSize: 15, fontFamily: FONTS.display_bold, color: theme.background},
    info: { flex: 1 },
    name: { fontSize: 14, fontFamily: FONTS.display_semi_bold, color: theme.textPrimary },
    sub: { fontSize: 11, fontFamily: FONTS.display_regular, color: theme.textSecondary, marginTop: 2 },
    expandedPanel: {
      marginTop: 8, borderTopWidth: 1, borderTopColor: theme.border, paddingTop: 8, marginLeft: 48,
    },
    expandedRow: {
      flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start',
      paddingVertical: 5, borderBottomWidth: 1, borderBottomColor: theme.border,
    },
    expandedRowLast: { borderBottomWidth: 0 },
    expandedLabel: { fontSize: 12, fontFamily: FONTS.display_regular, color: theme.textSecondary, flex: 1, marginRight: 8 },
    expandedValue: { fontSize: 12, fontFamily: FONTS.display_semi_bold, color: theme.textPrimary, flex: 1.2, textAlign: 'right' },
  });

export const makeSubSectionStyles = (theme: RoleTheme) =>
  StyleSheet.create({
    wrapper: { marginTop: 10, borderTopWidth: 1, borderTopColor: theme.border, paddingTop: 8 },
    header: {
      fontSize: 12, fontFamily: FONTS.display_semi_bold, color: theme.textSecondary,
      textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: 6,
    },
    row: {
      flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start',
      paddingVertical: 4, borderBottomWidth: 1, borderBottomColor: theme.border,
    },
    rowLast: { borderBottomWidth: 0 },
    label: { fontSize: 12, fontFamily: FONTS.display_regular, color: theme.textSecondary, flex: 1, marginRight: 8 },
    value: { fontSize: 12, fontFamily: FONTS.display_semi_bold, color: theme.textPrimary, flex: 1.2, textAlign: 'right' },
  });

export const makePickerStyles = (theme: RoleTheme) =>
  StyleSheet.create({
    item: {
      flexDirection: 'row', alignItems: 'center', paddingVertical: 10,
      borderBottomWidth: 1, borderBottomColor: theme.border, gap: 12,
    },
    itemLast: { borderBottomWidth: 0 },
    avatar: { width: 36, height: 36, borderRadius: 18, alignItems: 'center', justifyContent: 'center', flexShrink: 0 },
    avatarText: { fontSize: 15, fontFamily: FONTS.display_bold, color: '#ffffff' },
    info: { flex: 1 },
    name: { fontSize: 14, fontFamily: FONTS.display_semi_bold, color: theme.textPrimary },
    secondary: { fontSize: 12, fontFamily: FONTS.display_regular, color: theme.textSecondary, marginTop: 2 },
  });

export const makeMediaUploadStyles = (theme: RoleTheme) =>
  StyleSheet.create({
    container: {
      backgroundColor: theme.surface, borderRadius: 14, padding: 14,
      borderWidth: 1, borderColor: theme.border, marginBottom: 4,
    },
    description: { fontSize: 13, fontFamily: FONTS.display_regular, color: theme.textSecondary, marginBottom: 14, lineHeight: 18 },
    collectedRow: { flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: 10 },
    collectedCount: { fontSize: 13, fontFamily: FONTS.display_semi_bold, color: theme.textPrimary },
    attachBtn: {
      flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8,
      borderWidth: 1.5, borderStyle: 'dashed', borderRadius: 10, paddingVertical: 12, marginBottom: 14,
    },
    attachBtnText: { fontSize: 14, fontFamily: FONTS.display_semi_bold },
    actionsRow: { flexDirection: 'row', gap: 8, marginTop: 4 },
    actionBtn: { flex: 1, paddingVertical: 11, borderRadius: 10, alignItems: 'center', justifyContent: 'center' },
    doneBtn: {},
    doneBtnText: { fontSize: 13, fontFamily: FONTS.display_semi_bold, color: '#ffffff' },
    skipBtn: { backgroundColor: theme.surface, borderWidth: 1, borderColor: theme.border },
    skipBtnText: { fontSize: 13, fontFamily: FONTS.display_semi_bold, color: theme.textPrimary },
    cancelBtn: { backgroundColor: '#FEF2F2', borderWidth: 1, borderColor: '#FECACA' },
    cancelBtnText: { fontSize: 13, fontFamily: FONTS.display_semi_bold, color: '#DC2626' },
    actionedBadge: { marginTop: 10, alignItems: 'center', paddingVertical: 4 },
    actionedText: { fontSize: 13, fontFamily: FONTS.display_semi_bold, color: '#22C55E' },
  });
