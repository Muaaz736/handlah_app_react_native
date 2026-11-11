import { Platform, StyleSheet } from 'react-native';
import FONTS from '../../../../../../utils/fonts';
import type { RoleTheme } from '../../../../../../types/roleManager.types';

export const makeBubbleStyles = (theme: RoleTheme) =>
  StyleSheet.create({
    row: { flexDirection: 'row', alignItems: 'flex-end', gap: 8, marginBottom: 4 },
    userRow: { justifyContent: 'flex-end' },
    botRow: { justifyContent: 'flex-start' },
    avatar: { width: 30, height: 30, borderRadius: 15, justifyContent: 'center', alignItems: 'center', marginBottom: 16 },
    wrapper: { maxWidth: '78%', gap: 4 },
    bubble: { borderRadius: 18, paddingHorizontal: 14, paddingVertical: 10 },
    userBubble: { borderBottomRightRadius: 4 },
    botBubble: { backgroundColor: theme.isDark ? '#2A2A2A' : '#F2F4F7', borderBottomLeftRadius: 4 },
    text: { fontSize: 14, lineHeight: 21, fontFamily: FONTS.display_medium },
    userText: { color: '#ffffff' },
    botText: { color: theme.textPrimary },
    time: { fontSize: 11, color: theme.textSecondary, fontFamily: FONTS.display_medium },
    timeRight: { textAlign: 'right' },
    timeLeft: { textAlign: 'left', marginLeft: 4 },
  });

export const makeDotsStyles = (_theme: RoleTheme) =>
  StyleSheet.create({
    row: { flexDirection: 'row', alignItems: 'center', gap: 8, marginTop: 4, marginBottom: 8 },
    avatar: { width: 30, height: 30, borderRadius: 15, justifyContent: 'center', alignItems: 'center', marginBottom: 14 },
    avatarText: { color: _theme.background, fontSize: 13 },
    bubble: {
      backgroundColor: _theme.surface, borderRadius: 18, borderBottomLeftRadius: 4,
      paddingHorizontal: 16, paddingVertical: 14,
      flexDirection: 'row', alignItems: 'center', gap: 5, marginTop: -12,
    },
    dot: { width: 7, height: 7, borderRadius: 4, backgroundColor: '#A0A0A0' },
  });

export const makeOptStyles = (theme: RoleTheme) =>
  StyleSheet.create({
    container: {
      backgroundColor: theme.background,
      borderTopWidth: 1, borderTopColor: theme.border,
      maxHeight: 290,
      paddingBottom: Platform.OS === 'ios' ? 20 : 10,
    },
    dividerRow: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 16, paddingVertical: 8, gap: 8 },
    dividerLine: { flex: 1, height: 1, backgroundColor: theme.border },
    dividerText: {
      fontSize: 10, color: theme.textSecondary, fontFamily: FONTS.display_medium,
      textTransform: 'uppercase', letterSpacing: 0.7,
    },
    scroll: { paddingHorizontal: 16, gap: 8 },
    btn: {
      flexDirection: 'row', alignItems: 'center',
      backgroundColor: theme.surface, borderRadius: 14, borderWidth: 1.2, borderColor: theme.border,
      paddingVertical: 13, paddingLeft: 16, paddingRight: 10, gap: 10,
    },
    btnText: { flex: 1, fontSize: 14, color: theme.textPrimary, fontFamily: FONTS.display_medium, lineHeight: 19 },
    arrowCircle: { width: 28, height: 28, borderRadius: 14, justifyContent: 'center', alignItems: 'center' },
    arrowText: { fontSize: 20, lineHeight: 22 },
    backBtn: { alignItems: 'center', paddingVertical: 12, marginTop: 2 },
    backText: { fontSize: 13, color: theme.textSecondary, fontFamily: FONTS.display_medium },
  });

export const makeScreenStyles = (theme: RoleTheme) =>
  StyleSheet.create({
    root: { flex: 1, backgroundColor: theme.background },
    messagesList: { padding: 16, paddingBottom: 8, gap: 12 },
  });
