import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  AppState,
  KeyboardAvoidingView,
  Linking,
  Modal,
  Platform,
  RefreshControl,
  ScrollView,
  Share,
  StyleSheet,
  Switch,
  Text,
  TextInput,
  TouchableOpacity,
  TouchableWithoutFeedback,
  View,
} from 'react-native';
import { useFocusEffect, useNavigation } from '@react-navigation/native';
import { useTranslation } from 'react-i18next';
import Feather from 'react-native-vector-icons/Feather';
import ScreenWrapper from '../../../components/ScreenWrapper/ScreenWrapper';
import { AuthHeader } from '../../../components/common';
import { showErrorToast, showSuccessToast } from '../../../components/common/CustomToast';
import FONTS from '../../../utils/fonts';
import { isIOS } from '../../../utils/helpers';
import { useUserRole } from '../../../hooks/useUserRole';
import type { RoleTheme } from '../../../types/roleManager.types';
import calendarService, { calendarErrorMessage, type CalendarFeed, type CalendarProvider } from '../../../services/calendar';

const intlLocale = (code?: string) => {
  const map: Record<string, string> = { du: 'nl', po: 'pl', tu: 'tr', vt: 'vi' };
  const c = (code ?? 'en').split('-')[0];
  return map[c] ?? c;
};

const APPLE_ACCOUNT_URL = 'https://account.apple.com/account/manage';

/**
 * Calendar sync (as the web's Calendar sync page): connect Google / Outlook (their sign-in page opens in the
 * browser) or Apple iCloud (Apple ID + an app-specific password), sync now, disconnect, and the private link other
 * calendar apps can subscribe to.
 */
const CalendarSyncScreen = (): React.ReactElement => {
  const { t, i18n } = useTranslation();
  const navigation = useNavigation<any>();
  const { themeColors, isBusinessRole } = useUserRole();
  const theme = themeColors as RoleTheme;
  const styles = useMemo(() => makeStyles(theme), [theme]);
  const [providers, setProviders] = useState<CalendarProvider[] | null>(null);
  const [feed, setFeedState] = useState<CalendarFeed | null>(null);
  const [failed, setFailed] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [busy, setBusy] = useState<string | null>(null);
  const [appleOpen, setAppleOpen] = useState(false);
  const [appleId, setAppleId] = useState('');
  const [applePassword, setApplePassword] = useState('');
  const [appleError, setAppleError] = useState<string | null>(null);
  const waitingForOAuth = useRef(false);

  const name = (provider: string) => t(`calendar_screen.providers.${provider}`, { defaultValue: provider });

  const load = useCallback(async (isRefresh = false) => {
    if (isRefresh) setRefreshing(true);
    setFailed(false);
    try {
      const res = await calendarService.getConnections();
      setProviders(res.providers);
      setFeedState(res.feed);
    } catch {
      setFailed(true);
    } finally {
      setRefreshing(false);
    }
  }, []);

  useFocusEffect(useCallback(() => { load(); }, [load]));

  // Back from the provider's sign-in page in the browser: refresh to show the new connection.
  useEffect(() => {
    const sub = AppState.addEventListener('change', state => {
      if (state === 'active' && waitingForOAuth.current) {
        waitingForOAuth.current = false;
        setBusy(null);
        load();
      }
    });
    return () => sub.remove();
  }, [load]);

  const connect = async (p: CalendarProvider) => {
    if (p.provider === 'apple') {
      setAppleError(null);
      setAppleOpen(true);
      return;
    }
    setBusy(p.provider);
    try {
      const url = await calendarService.startOAuth(p.provider, `/${isBusinessRole() ? 'business' : 'personal'}/calendar/sync`);
      if (!url) throw new Error('No consent URL');
      waitingForOAuth.current = true;
      await Linking.openURL(url);
    } catch (err) {
      waitingForOAuth.current = false;
      showErrorToast(calendarErrorMessage(err) ?? t('calendar_screen.sync.errors.failed', { provider: name(p.provider) }));
      setBusy(null);
    }
  };

  const connectApple = async () => {
    if (!appleId.trim() || !applePassword.trim()) return;
    setBusy('apple');
    setAppleError(null);
    try {
      await calendarService.connectApple(appleId.trim(), applePassword.trim());
      setAppleOpen(false);
      setApplePassword('');
      showSuccessToast(t('calendar_screen.sync.connected', { provider: name('apple') }));
      await load();
    } catch (err) {
      setAppleError(calendarErrorMessage(err) ?? t('calendar_screen.sync.apple.failed'));
    } finally {
      setBusy(null);
    }
  };

  const syncNow = async (p: CalendarProvider) => {
    setBusy(p.provider);
    try {
      await calendarService.syncNow(p.provider);
      showSuccessToast(t('calendar_screen.sync.syncQueued'));
      // The sync runs in the background; refresh the status shortly after.
      setTimeout(() => load(), 4000);
    } catch {
      showErrorToast(t('calendar_screen.sync.errors.syncFailed'));
    } finally {
      setBusy(null);
    }
  };

  const disconnect = (p: CalendarProvider) => {
    Alert.alert(t('calendar_screen.sync.disconnect'), t('calendar_screen.sync.confirmDisconnect', { provider: name(p.provider) }), [
      { text: t('calendar_screen.cancel'), style: 'cancel' },
      {
        text: t('calendar_screen.sync.disconnect'),
        style: 'destructive',
        onPress: async () => {
          setBusy(p.provider);
          try {
            await calendarService.disconnect(p.provider);
            showSuccessToast(t('calendar_screen.sync.disconnected', { provider: name(p.provider) }));
            await load();
          } catch {
            showErrorToast(t('calendar_screen.sync.errors.disconnectFailed'));
          } finally {
            setBusy(null);
          }
        },
      },
    ]);
  };

  const updateFeed = async (enabled: boolean, regenerate = false) => {
    setBusy('feed');
    try {
      setFeedState(await calendarService.setFeed(enabled, regenerate));
    } catch {
      showErrorToast(t('calendar_screen.sync.feed.failed'));
    } finally {
      setBusy(null);
    }
  };

  const regenerate = () =>
    Alert.alert(t('calendar_screen.sync.feed.regenerate'), t('calendar_screen.sync.feed.confirmRegenerate'), [
      { text: t('calendar_screen.cancel'), style: 'cancel' },
      { text: t('calendar_screen.sync.feed.regenerate'), style: 'destructive', onPress: () => updateFeed(true, true) },
    ]);

  const lastSynced = (value: string | null) =>
    value
      ? new Date(value.endsWith('Z') ? value : `${value}Z`).toLocaleString(intlLocale(i18n.language), {
          month: 'short',
          day: 'numeric',
          hour: 'numeric',
          minute: '2-digit',
        })
      : null;

  const renderProvider = (p: CalendarProvider) => {
    const connected = p.status === 'connected';
    const needsReconnect = p.status === 'error';
    const isBusy = busy === p.provider;
    const synced = lastSynced(p.lastSyncedAt);
    return (
      <View key={p.provider} style={styles.card}>
        <View style={styles.cardRow}>
          <View style={[styles.statusDot, { backgroundColor: connected ? '#16a34a' : needsReconnect ? '#D32F2F' : theme.border }]} />
          <View style={{ flex: 1 }}>
            <Text style={styles.providerName}>{name(p.provider)}</Text>
            {!!p.accountEmail && <Text style={styles.muted} numberOfLines={1}>{p.accountEmail}</Text>}
            {p.comingSoon ? (
              <Text style={styles.muted}>{t('calendar_screen.sync.comingSoonHint')}</Text>
            ) : !p.available ? (
              <Text style={styles.muted}>{t('calendar_screen.sync.notConfigured')}</Text>
            ) : connected ? (
              <Text style={styles.muted}>
                {p.realTime ? t('calendar_screen.sync.realTime') : t('calendar_screen.sync.periodic')}
                {synced ? ` · ${t('calendar_screen.sync.lastSynced', { when: synced })}` : ''}
              </Text>
            ) : needsReconnect ? (
              <Text style={[styles.muted, { color: '#D32F2F' }]}>{p.lastError || t('calendar_screen.sync.needsReconnect')}</Text>
            ) : null}
          </View>
          {p.comingSoon && <Text style={styles.badge}>{t('calendar_screen.sync.comingSoon')}</Text>}
        </View>
        {p.available && !p.comingSoon && (
          <View style={styles.actions}>
            {isBusy && <ActivityIndicator size="small" color={theme.primary} />}
            {connected ? (
              <>
                <TouchableOpacity style={styles.secondaryBtn} disabled={isBusy} onPress={() => syncNow(p)}>
                  <Feather name="refresh-cw" size={14} color={theme.textPrimary} />
                  <Text style={styles.secondaryText}>{t('calendar_screen.sync.syncNow')}</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.secondaryBtn} disabled={isBusy} onPress={() => disconnect(p)}>
                  <Text style={[styles.secondaryText, { color: '#D32F2F' }]}>{t('calendar_screen.sync.disconnect')}</Text>
                </TouchableOpacity>
              </>
            ) : (
              <TouchableOpacity style={[styles.primaryBtn, { backgroundColor: theme.primary }]} disabled={isBusy} onPress={() => connect(p)}>
                <Text style={styles.primaryText}>
                  {needsReconnect ? t('calendar_screen.sync.reconnect') : t('calendar_screen.sync.connect')}
                </Text>
              </TouchableOpacity>
            )}
          </View>
        )}
      </View>
    );
  };

  const feedLink = feed?.url ?? null;

  return (
    <ScreenWrapper scrollable={false} showShadow={false}>
      <AuthHeader
        title={t('calendar_screen.sync.title')}
        onBackPress={() => navigation.goBack()}
        containerStyle={{ paddingHorizontal: 16, marginBottom: 0, paddingTop: isIOS ? 0 : 20 }}
        backButtonStyle={{ marginBottom: 0 }}
        titleStyle={{ marginBottom: 0, marginTop: 10, textAlign: 'left' }}
        backButtonIconStyle={{ tintColor: theme.textPrimary }}
      />
      <ScrollView
        contentContainerStyle={styles.content}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => load(true)} tintColor={theme.primary} colors={[theme.primary]} />}
      >
        <Text style={styles.sectionTitle}>{t('calendar_screen.sync.connectTitle')}</Text>
        <Text style={styles.help}>{t('calendar_screen.sync.connectHelp')}</Text>

        {failed ? (
          <View style={styles.center}>
            <Text style={[styles.muted, { color: '#D32F2F' }]}>{t('calendar_screen.sync.loadFailed')}</Text>
            <TouchableOpacity style={styles.secondaryBtn} onPress={() => load()}>
              <Text style={styles.secondaryText}>{t('calendar_screen.retry')}</Text>
            </TouchableOpacity>
          </View>
        ) : !providers ? (
          <View style={styles.center}>
            <ActivityIndicator color={theme.primary} />
          </View>
        ) : (
          <>
            {providers.map(renderProvider)}
            <Text style={[styles.muted, { marginTop: 4 }]}>{t('calendar_screen.sync.timingNote')}</Text>
          </>
        )}

        {feed && (
          <View style={[styles.card, { marginTop: 24 }]}>
            <View style={styles.cardRow}>
              <View style={{ flex: 1 }}>
                <Text style={styles.providerName}>{t('calendar_screen.sync.feed.title')}</Text>
                <Text style={styles.muted}>{t('calendar_screen.sync.feed.help')}</Text>
              </View>
              <Switch
                value={feed.enabled}
                disabled={busy === 'feed'}
                onValueChange={value => updateFeed(value)}
                trackColor={{ true: theme.primary, false: theme.border }}
                thumbColor="#fff"
              />
            </View>
            {feed.enabled && !!feedLink && (
              <>
                <View style={styles.linkBox}>
                  <Text style={styles.linkText} numberOfLines={2} selectable>{feedLink}</Text>
                </View>
                <View style={styles.actions}>
                  {busy === 'feed' && <ActivityIndicator size="small" color={theme.primary} />}
                  <TouchableOpacity style={styles.secondaryBtn} onPress={() => Share.share({ message: feedLink, url: feedLink })}>
                    <Feather name="copy" size={14} color={theme.textPrimary} />
                    <Text style={styles.secondaryText}>{t('calendar_screen.sync.feed.copy')}</Text>
                  </TouchableOpacity>
                  {!!feed.webcalUrl && (
                    <TouchableOpacity
                      style={styles.secondaryBtn}
                      onPress={() => Linking.openURL(feed.webcalUrl!).catch(() => showErrorToast(t('calendar_screen.sync.feed.failed')))}
                    >
                      <Feather name="calendar" size={14} color={theme.textPrimary} />
                      <Text style={styles.secondaryText}>{t('calendar_screen.sync.feed.subscribe')}</Text>
                    </TouchableOpacity>
                  )}
                  <TouchableOpacity style={styles.secondaryBtn} disabled={busy === 'feed'} onPress={regenerate}>
                    <Feather name="rotate-ccw" size={14} color={theme.textPrimary} />
                    <Text style={styles.secondaryText}>{t('calendar_screen.sync.feed.regenerate')}</Text>
                  </TouchableOpacity>
                </View>
                <Text style={[styles.muted, { marginTop: 8 }]}>{t('calendar_screen.sync.feed.privacy')}</Text>
              </>
            )}
          </View>
        )}
      </ScrollView>

      {/* Apple iCloud: Apple ID and an app-specific password, typed by the user. */}
      <Modal visible={appleOpen} transparent animationType="fade" onRequestClose={() => busy !== 'apple' && setAppleOpen(false)}>
        <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={styles.overlay}>
          <TouchableWithoutFeedback onPress={() => busy !== 'apple' && setAppleOpen(false)}>
            <View style={StyleSheet.absoluteFill} />
          </TouchableWithoutFeedback>
          <View style={styles.popup}>
            <View style={styles.cardRow}>
              <Text style={[styles.providerName, { flex: 1, fontSize: 18 }]}>{t('calendar_screen.sync.apple.title')}</Text>
              <TouchableOpacity onPress={() => setAppleOpen(false)} disabled={busy === 'apple'} hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}>
                <Feather name="x" size={20} color={theme.textPrimary} />
              </TouchableOpacity>
            </View>
            <Text style={[styles.help, { marginTop: 8 }]}>{t('calendar_screen.sync.apple.help')}</Text>
            <TouchableOpacity onPress={() => Linking.openURL(APPLE_ACCOUNT_URL)}>
              <Text style={[styles.link, { color: theme.primary }]}>{t('calendar_screen.sync.apple.helpLink')}</Text>
            </TouchableOpacity>
            <Text style={styles.label}>{t('calendar_screen.sync.apple.appleId')}</Text>
            <TextInput
              style={styles.input}
              value={appleId}
              onChangeText={setAppleId}
              autoCapitalize="none"
              autoCorrect={false}
              keyboardType="email-address"
              textContentType="username"
              placeholderTextColor={theme.placeholder}
            />
            <Text style={styles.label}>{t('calendar_screen.sync.apple.password')}</Text>
            <TextInput
              style={styles.input}
              value={applePassword}
              onChangeText={setApplePassword}
              autoCapitalize="none"
              autoCorrect={false}
              secureTextEntry
              textContentType="password"
              placeholder="xxxx-xxxx-xxxx-xxxx"
              placeholderTextColor={theme.placeholder}
            />
            <Text style={[styles.muted, { marginTop: 6 }]}>{t('calendar_screen.sync.apple.passwordNote')}</Text>
            {!!appleError && <Text style={[styles.muted, { color: '#D32F2F', marginTop: 8 }]}>{appleError}</Text>}
            <View style={styles.actions}>
              <TouchableOpacity style={styles.secondaryBtn} onPress={() => setAppleOpen(false)} disabled={busy === 'apple'}>
                <Text style={styles.secondaryText}>{t('calendar_screen.cancel')}</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.primaryBtn, { backgroundColor: theme.primary }, (!appleId.trim() || !applePassword.trim() || busy === 'apple') && { opacity: 0.6 }]}
                disabled={!appleId.trim() || !applePassword.trim() || busy === 'apple'}
                onPress={connectApple}
              >
                {busy === 'apple' ? <ActivityIndicator size="small" color="#fff" /> : <Text style={styles.primaryText}>{t('calendar_screen.sync.connect')}</Text>}
              </TouchableOpacity>
            </View>
          </View>
        </KeyboardAvoidingView>
      </Modal>
    </ScreenWrapper>
  );
};

export default CalendarSyncScreen;

const makeStyles = (theme: RoleTheme) =>
  StyleSheet.create({
    content: { paddingHorizontal: 16, paddingBottom: 40, paddingTop: 12 },
    sectionTitle: { fontSize: 16, fontFamily: FONTS.display_semi_bold, color: theme.textPrimary },
    help: { fontSize: 13, fontFamily: FONTS.display_regular, color: theme.textSecondary, marginTop: 2, marginBottom: 12 },
    center: { alignItems: 'center', gap: 8, paddingVertical: 24 },
    muted: { fontSize: 12, fontFamily: FONTS.display_regular, color: theme.textSecondary, marginTop: 2 },
    card: { backgroundColor: theme.surface, borderRadius: 14, borderWidth: 1, borderColor: theme.border, padding: 14, marginBottom: 10 },
    cardRow: { flexDirection: 'row', alignItems: 'center', gap: 10 },
    statusDot: { width: 10, height: 10, borderRadius: 5 },
    providerName: { fontSize: 15, fontFamily: FONTS.display_semi_bold, color: theme.textPrimary },
    badge: {
      fontSize: 11,
      fontFamily: FONTS.display_medium,
      color: theme.textSecondary,
      borderWidth: 1,
      borderColor: theme.border,
      borderRadius: 999,
      paddingHorizontal: 8,
      paddingVertical: 2,
    },
    actions: { flexDirection: 'row', alignItems: 'center', justifyContent: 'flex-end', flexWrap: 'wrap', gap: 8, marginTop: 12 },
    secondaryBtn: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 6,
      borderWidth: 1,
      borderColor: theme.border,
      borderRadius: 12,
      paddingHorizontal: 12,
      paddingVertical: 8,
    },
    secondaryText: { fontSize: 13, fontFamily: FONTS.display_medium, color: theme.textPrimary },
    primaryBtn: { borderRadius: 12, paddingHorizontal: 16, paddingVertical: 9, minWidth: 90, alignItems: 'center' },
    primaryText: { fontSize: 13, fontFamily: FONTS.display_semi_bold, color: '#fff' },
    linkBox: { marginTop: 12, borderRadius: 10, backgroundColor: theme.inputBg, padding: 10 },
    linkText: { fontSize: 12, fontFamily: FONTS.display_regular, color: theme.textPrimary },
    overlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.45)', justifyContent: 'center', padding: 20 },
    popup: { backgroundColor: theme.background, borderRadius: 18, padding: 20 },
    link: { fontSize: 13, fontFamily: FONTS.display_semi_bold, marginBottom: 6 },
    label: { fontSize: 13, fontFamily: FONTS.display_medium, color: theme.textPrimary, marginTop: 12, marginBottom: 4 },
    input: {
      borderWidth: 1,
      borderColor: theme.border,
      borderRadius: 12,
      paddingHorizontal: 12,
      paddingVertical: Platform.OS === 'ios' ? 12 : 8,
      fontSize: 14,
      fontFamily: FONTS.display_regular,
      color: theme.textPrimary,
      backgroundColor: theme.inputBg,
    },
  });
