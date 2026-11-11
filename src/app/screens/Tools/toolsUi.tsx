import React, { useMemo } from 'react';
import {
  ActivityIndicator,
  StyleProp,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  ViewStyle,
} from 'react-native';
import Feather from 'react-native-vector-icons/Feather';
import { useNavigation } from '@react-navigation/native';
import FONTS from '../../../utils/fonts';
import { getColorWithOpacity } from '../../../utils/colors';
import { useUserRole } from '../../../hooks/useUserRole';
import { resolveAttentionItemTarget } from '../../../utils/notificationNavigator';
import type { RoleTheme } from '../../../types/roleManager.types';

/** Shared look for the daily brief, life events and Money Finder screens. */
export function useToolsTheme() {
  const { themeColors } = useUserRole();
  const theme = themeColors as RoleTheme;
  const s = useMemo(() => makeToolsStyles(theme), [theme]);
  return { theme, s };
}

export function makeToolsStyles(theme: RoleTheme) {
  return StyleSheet.create({
    screen: { flex: 1, backgroundColor: theme.background },
    scroll: { padding: 16, gap: 12, paddingBottom: 40 },
    card: {
      backgroundColor: theme.surface,
      borderRadius: 16,
      borderWidth: 1,
      borderColor: theme.border,
      padding: 16,
    },
    cardTitleRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: 8, marginBottom: 10 },
    cardTitleLeft: { flexDirection: 'row', alignItems: 'center', gap: 8, flexShrink: 1 },
    cardTitle: { fontSize: 15, fontFamily: FONTS.display_semi_bold, color: theme.textPrimary, flexShrink: 1 },
    h1: { fontSize: 22, fontFamily: FONTS.display_bold, color: theme.textPrimary },
    h2: { fontSize: 17, fontFamily: FONTS.display_semi_bold, color: theme.textPrimary },
    body: { fontSize: 14, fontFamily: FONTS.display_regular, color: theme.textPrimary },
    muted: { fontSize: 13, fontFamily: FONTS.display_regular, color: theme.textSecondary },
    small: { fontSize: 12, fontFamily: FONTS.display_regular, color: theme.textSecondary },
    strong: { fontFamily: FONTS.display_semi_bold },
    row: { flexDirection: 'row', alignItems: 'center', gap: 8 },
    rowBetween: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: 8 },
    wrap: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
    divider: { height: StyleSheet.hairlineWidth, backgroundColor: theme.border, marginVertical: 8 },
    badge: { borderRadius: 999, paddingHorizontal: 10, paddingVertical: 3, alignSelf: 'flex-start' },
    badgeText: { fontSize: 12, fontFamily: FONTS.display_medium },
    input: {
      borderWidth: 1,
      borderColor: theme.border,
      borderRadius: 10,
      paddingHorizontal: 12,
      paddingVertical: 10,
      fontSize: 14,
      fontFamily: FONTS.display_regular,
      color: theme.textPrimary,
      backgroundColor: theme.inputBg ?? theme.surface,
    },
    center: { alignItems: 'center', justifyContent: 'center', padding: 24, gap: 10 },
    header: { flexDirection: 'row', alignItems: 'center', gap: 12, paddingHorizontal: 16, paddingVertical: 12 },
    headerBack: { width: 36, height: 36, borderRadius: 18, alignItems: 'center', justifyContent: 'center' },
    sheetBackdrop: { flex: 1, backgroundColor: 'rgba(0,0,0,0.4)', justifyContent: 'flex-end' },
    sheet: {
      backgroundColor: theme.background,
      borderTopLeftRadius: 20,
      borderTopRightRadius: 20,
      padding: 20,
      paddingBottom: 32,
      gap: 12,
      maxHeight: '90%',
    },
  });
}

export type ToolsStyles = ReturnType<typeof makeToolsStyles>;

export const Card: React.FC<{ children: React.ReactNode; style?: StyleProp<ViewStyle> }> = ({ children, style }) => {
  const { s } = useToolsTheme();
  return <View style={[s.card, style]}>{children}</View>;
};

export const CardTitle: React.FC<{ icon: string; title: string; aside?: React.ReactNode }> = ({ icon, title, aside }) => {
  const { s, theme } = useToolsTheme();
  return (
    <View style={s.cardTitleRow}>
      <View style={s.cardTitleLeft}>
        <Feather name={icon} size={16} color={theme.primary} />
        <Text style={s.cardTitle} numberOfLines={2}>{title}</Text>
      </View>
      {typeof aside === 'string' ? <Text style={s.small}>{aside}</Text> : aside}
    </View>
  );
};

type ButtonVariant = 'primary' | 'outline' | 'ghost' | 'danger';

export const PillButton: React.FC<{
  title: string;
  onPress: () => void;
  variant?: ButtonVariant;
  icon?: string;
  loading?: boolean;
  disabled?: boolean;
  style?: StyleProp<ViewStyle>;
}> = ({ title, onPress, variant = 'primary', icon, loading, disabled, style }) => {
  const { theme } = useToolsTheme();
  const isPrimary = variant === 'primary' || variant === 'danger';
  const bg = variant === 'primary' ? theme.primary : variant === 'danger' ? '#B91C1C' : 'transparent';
  const fg = isPrimary ? '#ffffff' : variant === 'outline' ? theme.textPrimary : theme.primary;
  return (
    <TouchableOpacity
      onPress={onPress}
      disabled={disabled || loading}
      activeOpacity={0.8}
      accessibilityRole="button"
      style={[
        {
          flexDirection: 'row',
          alignItems: 'center',
          justifyContent: 'center',
          gap: 6,
          borderRadius: 999,
          paddingHorizontal: variant === 'ghost' ? 10 : 16,
          paddingVertical: 9,
          backgroundColor: bg,
          borderWidth: variant === 'outline' ? 1 : 0,
          borderColor: theme.border,
          opacity: disabled ? 0.55 : 1,
        },
        style,
      ]}
    >
      {loading ? <ActivityIndicator size="small" color={fg} /> : icon ? <Feather name={icon} size={14} color={fg} /> : null}
      <Text style={{ color: fg, fontSize: 13, fontFamily: FONTS.display_semi_bold }}>{title}</Text>
    </TouchableOpacity>
  );
};

export const ProgressBar: React.FC<{ value: number; total: number }> = ({ value, total }) => {
  const { theme } = useToolsTheme();
  const pct = total > 0 ? Math.min(100, Math.round((value / total) * 100)) : 0;
  return (
    <View style={{ height: 8, borderRadius: 4, backgroundColor: getColorWithOpacity(theme.primary, 0.15), overflow: 'hidden' }}>
      <View style={{ height: '100%', width: `${pct}%`, borderRadius: 4, backgroundColor: theme.primary }} />
    </View>
  );
};

export const LoadingState: React.FC = () => {
  const { s, theme } = useToolsTheme();
  return (
    <View style={s.center}>
      <ActivityIndicator size="large" color={theme.primary} />
    </View>
  );
};

export const FailedState: React.FC<{ message: string; retryLabel: string; onRetry: () => void }> = ({ message, retryLabel, onRetry }) => {
  const { s } = useToolsTheme();
  return (
    <View style={s.center}>
      <Text style={s.muted}>{message}</Text>
      <PillButton title={retryLabel} onPress={onRetry} />
    </View>
  );
};

/** Screen header with a back button. */
export const ToolsHeader: React.FC<{ title: string; subtitle?: string; right?: React.ReactNode }> = ({ title, subtitle, right }) => {
  const { s, theme } = useToolsTheme();
  const navigation = useNavigation();
  return (
    <View style={s.header}>
      <TouchableOpacity
        onPress={() => navigation.goBack()}
        style={[s.headerBack, { backgroundColor: theme.surface }]}
        accessibilityRole="button"
        accessibilityLabel="Back"
        hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
      >
        <Feather name="chevron-left" size={22} color={theme.textPrimary} />
      </TouchableOpacity>
      <View style={{ flex: 1 }}>
        <Text style={s.h1} numberOfLines={1}>{title}</Text>
        {subtitle ? <Text style={s.muted} numberOfLines={2}>{subtitle}</Text> : null}
      </View>
      {right}
    </View>
  );
};

/** Opens the record behind an item (same routing the dashboard uses). */
export function useOpenRecord() {
  const navigation = useNavigation();
  return (entityType: string | null | undefined, entityId: number | null | undefined) => {
    if (!entityType) return;
    const target = resolveAttentionItemTarget({ entityType, entityId: entityId ?? null });
    if (target) (navigation as any).navigate(target.screen, target.params);
  };
}
