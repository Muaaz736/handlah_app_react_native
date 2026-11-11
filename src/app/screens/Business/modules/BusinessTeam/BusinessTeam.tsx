import React, { useCallback, useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation, useRoute } from '@react-navigation/native';
import { useTranslation } from 'react-i18next';
import Toast from 'react-native-toast-message';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import { AuthHeader } from '../../../../../components/common';
import { useUserRole } from '../../../../../hooks/useUserRole';
import FONTS from '../../../../../utils/fonts';
import businessTeam, {
  ApprovalRequest,
  BusinessTeam as Team,
  FoundUser,
  TeamActionResult,
  TeamMember,
} from '../../../../../services/businessTeam';

type MemberRole = 'owner_admin' | 'standard';

/**
 * Team & approvals for one business, as on the website: its people and their roles, adding and removing people,
 * handing the business to an Owner/Admin, and the Owner/Admin approval votes on all of these.
 */
const BusinessTeamScreen: React.FC = () => {
  const { t } = useTranslation();
  const navigation = useNavigation();
  const route = useRoute();
  const { themeColors } = useUserRole();
  const businessId = Number((route.params as { businessId?: number } | undefined)?.businessId ?? 0);

  const [team, setTeam] = useState<Team | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [busy, setBusy] = useState(false);
  const [transferTo, setTransferTo] = useState<number | null>(null);

  const load = useCallback(async () => {
    setTeam(await businessTeam.getTeam(businessId));
  }, [businessId]);

  useEffect(() => {
    if (businessId > 0) load().finally(() => setLoading(false));
    else setLoading(false);
  }, [businessId, load]);

  const done = async (result: TeamActionResult) => {
    setBusy(false);
    if (!result.ok) {
      Toast.show({ type: 'error', text1: result.error || t('business_team.failed') });
      return;
    }
    Toast.show({ type: 'success', text1: result.applied ? t('business_team.applied') : t('business_team.sentForApproval') });
    await load();
  };

  const ask = async (body: Parameters<typeof businessTeam.request>[1]) => {
    setBusy(true);
    await done(await businessTeam.request(businessId, body));
  };

  const confirm = (message: string, okLabel: string, destructive: boolean, onOk: () => void) =>
    Alert.alert(t('business_team.title'), message, [
      { text: t('business_team.cancel'), style: 'cancel' },
      { text: okLabel, style: destructive ? 'destructive' : 'default', onPress: onOk },
    ]);

  const c = themeColors;
  const muted = c.textSecondary ?? '#6b6b6b';
  const card = [styles.card, { backgroundColor: c.surface, borderColor: c.border }];
  const nameOf = (m?: { name: string | null; userName: string | null } | null) => m?.name || m?.userName || '';

  const body = () => {
    if (loading) {
      return <ActivityIndicator style={{ marginTop: 40 }} size="large" color={c.primary} />;
    }
    if (!team) {
      return <Text style={[styles.center, { color: muted }]}>{t('business_team.noAccess')}</Text>;
    }

    const iAmOwner = team.myRole === 'owner';
    const admins = team.members.filter(m => m.role === 'owner_admin' && !m.pending);
    const owner = team.members.find(m => m.role === 'owner');
    const openRequests = team.requests.filter(r => r.status === 'pending');
    const pastRequests = team.requests.filter(r => r.status !== 'pending');
    const canTransfer = admins.length > 0 && (iAmOwner || admins.length >= 2);

    const changeRole = (m: TeamMember, role: MemberRole) => {
      if (m.role === role) return;
      ask({ action: 'set_role', targetUserId: m.userId, role });
    };
    const remove = (m: TeamMember) =>
      confirm(t('business_team.confirmRemove', { name: nameOf(m) }), t('business_team.remove'), true, () =>
        ask({ action: 'remove_member', targetUserId: m.userId }),
      );
    const transfer = () => {
      if (transferTo == null) return;
      const to = team.members.find(m => m.userId === transferTo);
      const message = iAmOwner
        ? t('business_team.confirmLeave', { name: nameOf(to) })
        : t('business_team.confirmRemoveOwner', { owner: nameOf(owner), name: nameOf(to) });
      confirm(message, t('business_team.sendForApproval'), false, async () => {
        await ask({ action: 'transfer_owner', targetUserId: transferTo });
        setTransferTo(null);
      });
    };

    return (
      <>
        <Text style={[styles.intro, { color: c.textPrimary }]}>
          {iAmOwner ? t('business_team.howItWorksOwner') : t('business_team.howItWorksAdmin')}
        </Text>

        {openRequests.length > 0 && (
          <View style={styles.section}>
            <Text style={[styles.h3, { color: c.textPrimary }]}>{t('business_team.waiting')}</Text>
            {openRequests.map(r => (
              <RequestCard
                key={r.id}
                r={r}
                busy={busy}
                onVote={async approve => {
                  setBusy(true);
                  await done(await businessTeam.vote(r.id, approve));
                }}
                onCancel={async () => {
                  setBusy(true);
                  await done(await businessTeam.cancel(r.id));
                }}
              />
            ))}
          </View>
        )}

        <View style={card}>
          <View style={styles.headRow}>
            <MaterialCommunityIcons name="account-group-outline" size={20} color={c.textPrimary} />
            <Text style={[styles.h3, styles.noMargin, { color: c.textPrimary }]}>{t('business_team.people')}</Text>
          </View>
          {team.members.map((m, i) => (
            <View key={m.userId} style={[styles.memberRow, i > 0 && { borderTopColor: c.border, borderTopWidth: StyleSheet.hairlineWidth }]}>
              <View style={styles.flex}>
                <Text style={[styles.memberName, { color: c.textPrimary }]} numberOfLines={1}>{nameOf(m)}</Text>
                {m.userName ? <Text style={[styles.small, { color: muted }]} numberOfLines={1}>@{m.userName}</Text> : null}
              </View>
              {m.role === 'owner' ? (
                <View style={[styles.pill, { backgroundColor: c.primary }]}>
                  <MaterialCommunityIcons name="crown-outline" size={12} color="#fff" />
                  <Text style={[styles.pillText, { color: '#fff' }]}>{t('business_team.primaryOwner')}</Text>
                </View>
              ) : (
                <View style={styles.memberActions}>
                  {m.pending && (
                    <View style={[styles.pill, { backgroundColor: '#fff4d6' }]}>
                      <Text style={[styles.pillText, { color: '#8a6100' }]}>{t('business_team.invited')}</Text>
                    </View>
                  )}
                  <RolePills value={m.role as MemberRole} disabled={busy} onChange={r => changeRole(m, r)} />
                  <TouchableOpacity disabled={busy} onPress={() => remove(m)} accessibilityRole="button" accessibilityLabel={t('business_team.remove')}>
                    <MaterialCommunityIcons name="account-remove-outline" size={22} color={busy ? muted : '#c0392b'} />
                  </TouchableOpacity>
                </View>
              )}
            </View>
          ))}
        </View>

        <AddPerson busy={busy} existing={team.members.map(m => m.userId)} onAdd={(u, role) => ask({ action: 'add_member', targetUserId: u.id, role })} />

        <View style={card}>
          <View style={styles.headRow}>
            <MaterialCommunityIcons name="shield-check-outline" size={20} color={c.textPrimary} />
            <Text style={[styles.h3, styles.noMargin, { color: c.textPrimary }]}>
              {iAmOwner ? t('business_team.leaveTitle') : t('business_team.removeOwnerTitle')}
            </Text>
          </View>
          <Text style={[styles.small, styles.helpText, { color: muted }]}>
            {iAmOwner ? t('business_team.leaveHelp') : t('business_team.removeOwnerHelp')}
          </Text>
          {!canTransfer ? (
            <Text style={[styles.small, { color: '#8a6100' }]}>
              {iAmOwner ? t('business_team.needAnAdmin') : t('business_team.needAnotherAdmin')}
            </Text>
          ) : (
            <>
              <Text style={[styles.label, { color: c.textPrimary }]}>{t('business_team.chooseNewOwner')}</Text>
              {admins.map(a => {
                const on = transferTo === a.userId;
                return (
                  <TouchableOpacity
                    key={a.userId}
                    style={styles.radioRow}
                    onPress={() => setTransferTo(on ? null : a.userId)}
                    accessibilityRole="radio"
                    accessibilityState={{ selected: on }}
                  >
                    <MaterialCommunityIcons name={on ? 'radiobox-marked' : 'radiobox-blank'} size={22} color={on ? c.primary : muted} />
                    <Text style={[styles.memberName, { color: c.textPrimary }]}>{nameOf(a)}</Text>
                  </TouchableOpacity>
                );
              })}
              <Button label={t('business_team.sendForApproval')} disabled={busy || transferTo == null} onPress={transfer} />
            </>
          )}
        </View>

        {pastRequests.length > 0 && (
          <View style={styles.section}>
            <Text style={[styles.h3, { color: c.textPrimary }]}>{t('business_team.history')}</Text>
            {pastRequests.map(r => <RequestCard key={r.id} r={r} busy />)}
          </View>
        )}
      </>
    );
  };

  return (
    <LinearGradient colors={[...c.gradient.slice(0, 3), c.background]} locations={[0, 0.118, 0.2774, 0.4327]} style={styles.flex}>
      <SafeAreaView style={styles.flex}>
        <AuthHeader title={t('business_team.title')} subtitle={team?.businessName ?? undefined} onBackPress={() => navigation.goBack()} />
        <ScrollView
          contentContainerStyle={styles.scroll}
          keyboardShouldPersistTaps="handled"
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={async () => {
                setRefreshing(true);
                await load();
                setRefreshing(false);
              }}
            />
          }
        >
          {body()}
        </ScrollView>
      </SafeAreaView>
    </LinearGradient>
  );

};

// ── pieces ──────────────────────────────────────────────────────────────────

function Button({ label, onPress, disabled, outline }: { label: string; onPress: () => void; disabled?: boolean; outline?: boolean }) {
  const { themeColors: c } = useUserRole();

  return (
    <TouchableOpacity
      onPress={onPress}
      disabled={disabled}
      accessibilityRole="button"
      style={[
        styles.button,
        outline ? { borderColor: c.border, borderWidth: 1, backgroundColor: 'transparent' } : { backgroundColor: c.primary },
        disabled && styles.disabled,
      ]}
    >
      <Text style={[styles.buttonText, { color: outline ? c.textPrimary : '#fff' }]}>{label}</Text>
    </TouchableOpacity>
  );
}

function RolePills({ value, onChange, disabled }: { value: MemberRole; onChange: (r: MemberRole) => void; disabled?: boolean }) {
  const { t } = useTranslation();
  const { themeColors: c } = useUserRole();
  const roleLabel = (r: MemberRole) => (r === 'owner_admin' ? t('business_team.roleOwnerAdmin') : t('business_team.roleStandard'));

  const pill = (r: MemberRole) => {
    const on = value === r;
    return (
      <TouchableOpacity
        key={r}
        disabled={disabled}
        onPress={() => onChange(r)}
        accessibilityRole="button"
        accessibilityState={{ selected: on }}
        style={[styles.rolePill, { borderColor: on ? c.primary : c.border }, on && { backgroundColor: c.primary }]}
      >
        <Text style={[styles.pillText, { color: on ? '#fff' : c.textPrimary }]}>{roleLabel(r)}</Text>
      </TouchableOpacity>
    );
  };
  return <View style={styles.rolePills}>{pill('owner_admin')}{pill('standard')}</View>;
}

function RequestCard({ r, busy: isBusy, onVote, onCancel }: { r: ApprovalRequest; busy: boolean; onVote?: (approve: boolean) => void; onCancel?: () => void }) {
  const { t, i18n } = useTranslation();
  const { themeColors: c } = useUserRole();
  const muted = c.textSecondary ?? '#6b6b6b';
  const card = [styles.card, { backgroundColor: c.surface, borderColor: c.border }];
  const roleLabel = (r: MemberRole | null) => (r === 'owner_admin' ? t('business_team.roleOwnerAdmin') : t('business_team.roleStandard'));

  const target = r.targetName ?? '';
  const what =
    r.action === 'add_member'
      ? t('business_team.actionAdd', { name: target, role: roleLabel(r.role) })
      : r.action === 'set_role'
        ? t('business_team.actionSetRole', { name: target, role: roleLabel(r.role) })
        : r.action === 'remove_member'
          ? t('business_team.actionRemove', { name: target })
          : t('business_team.actionTransfer', { name: target });
  const date = (iso: string) => {
    const d = new Date(iso);
    return Number.isNaN(d.getTime()) ? '' : d.toLocaleDateString(i18n.language, { month: 'short', day: 'numeric' });
  };
  const tone: Record<string, [string, string]> = {
    pending: ['#e7ebff', c.primary],
    applied: ['#e3f6e8', '#1e7b3a'],
    declined: ['#fde8e6', '#c0392b'],
    expired: ['#eeeeee', '#666666'],
    cancelled: ['#eeeeee', '#666666'],
  };
  const [bg, fg] = tone[r.status] ?? tone.expired;
  return (
    <View style={card}>
      <View style={styles.reqHead}>
        <View style={styles.flex}>
          <Text style={[styles.memberName, { color: c.textPrimary }]}>{what}</Text>
          <Text style={[styles.small, { color: muted, marginTop: 2 }]}>
            {t('business_team.askedBy', { name: r.requestedByName ?? '', date: date(r.createdAt) })}
            {r.status === 'pending' ? ` · ${t('business_team.expires', { date: date(r.expiresAt) })}` : ''}
          </Text>
        </View>
        <View style={[styles.pill, { backgroundColor: bg }]}>
          <Text style={[styles.pillText, { color: fg }]}>{t(`business_team.status.${r.status}`)}</Text>
        </View>
      </View>
      <View style={styles.voters}>
        {r.voters.map(v => {
          const [vbg, vfg] =
            v.decision === 'approved' ? ['#e3f6e8', '#1e7b3a'] : v.decision === 'declined' ? ['#fde8e6', '#c0392b'] : [c.background, muted];
          return (
            <View key={v.userId} style={[styles.pill, { backgroundColor: vbg }]}>
              <Text style={[styles.pillText, { color: vfg }]}>
                {v.name} ·{' '}
                {v.decision === 'approved'
                  ? t('business_team.approved')
                  : v.decision === 'declined'
                    ? t('business_team.declined')
                    : t('business_team.waitingFor')}
              </Text>
            </View>
          );
        })}
      </View>
      {(r.canVote || r.canCancel) && (onVote || onCancel) ? (
        <View style={styles.buttonsRow}>
          {r.canVote && onVote ? (
            <>
              <Button label={t('business_team.approve')} disabled={isBusy} onPress={() => onVote(true)} />
              <Button label={t('business_team.decline')} disabled={isBusy} outline onPress={() => onVote(false)} />
            </>
          ) : null}
          {r.canCancel && onCancel ? <Button label={t('business_team.withdraw')} disabled={isBusy} outline onPress={onCancel} /> : null}
        </View>
      ) : null}
    </View>
  );
}

function AddPerson({ busy: isBusy, existing, onAdd }: { busy: boolean; existing: number[]; onAdd: (u: FoundUser, role: MemberRole) => void }) {
  const { t } = useTranslation();
  const { themeColors: c } = useUserRole();
  const muted = c.textSecondary ?? '#6b6b6b';
  const card = [styles.card, { backgroundColor: c.surface, borderColor: c.border }];

  const [query, setQuery] = useState('');
  const [results, setResults] = useState<FoundUser[]>([]);
  const [picked, setPicked] = useState<FoundUser | null>(null);
  const [role, setRole] = useState<MemberRole>('standard');

  useEffect(() => {
    const q = query.trim();
    if (q.length < 2 || picked) {
      setResults([]);
      return;
    }
    let cancelled = false;
    const timer = setTimeout(async () => {
      const found = await businessTeam.searchUsers(q);
      if (!cancelled) setResults(found.filter(u => !existing.includes(u.id)));
    }, 300);
    return () => {
      cancelled = true;
      clearTimeout(timer);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [query, picked]);

  return (
    <View style={card}>
      <View style={styles.headRow}>
        <MaterialCommunityIcons name="account-plus-outline" size={20} color={c.textPrimary} />
        <Text style={[styles.h3, styles.noMargin, { color: c.textPrimary }]}>{t('business_team.addPerson')}</Text>
      </View>
      {picked ? (
        <>
          <Text style={[styles.memberName, { color: c.textPrimary }]}>
            {picked.fullName || picked.userName} <Text style={[styles.small, { color: muted }]}>@{picked.userName}</Text>
          </Text>
          <Text style={[styles.label, { color: c.textPrimary }]}>{t('business_team.role')}</Text>
          <RolePills value={role} onChange={setRole} />
          <View style={styles.buttonsRow}>
            <Button
              label={t('business_team.add')}
              disabled={isBusy}
              onPress={() => {
                onAdd(picked, role);
                setPicked(null);
                setQuery('');
              }}
            />
            <Button label={t('business_team.cancel')} outline onPress={() => setPicked(null)} />
          </View>
        </>
      ) : (
        <>
          <View style={[styles.search, { borderColor: c.border }]}>
            <MaterialCommunityIcons name="magnify" size={18} color={muted} />
            <TextInput
              value={query}
              onChangeText={setQuery}
              placeholder={t('business_team.searchPlaceholder')}
              placeholderTextColor={muted}
              autoCapitalize="none"
              autoCorrect={false}
              style={[styles.searchInput, { color: c.textPrimary }]}
            />
          </View>
          {results.map(u => (
            <TouchableOpacity key={u.id} style={styles.resultRow} onPress={() => setPicked(u)} accessibilityRole="button">
              <Text style={[styles.memberName, { color: c.textPrimary }]} numberOfLines={1}>
                {u.fullName || u.userName} <Text style={[styles.small, { color: muted }]}>@{u.userName}</Text>
              </Text>
            </TouchableOpacity>
          ))}
        </>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1, minWidth: 0 },
  scroll: { paddingHorizontal: 16, paddingBottom: 40 },
  center: { textAlign: 'center', marginTop: 40, fontSize: 14, paddingHorizontal: 20 },
  intro: { fontSize: 13, lineHeight: 19, marginBottom: 16, marginTop: 4 },
  section: { marginBottom: 6 },
  card: { borderWidth: 1, borderRadius: 16, padding: 14, marginBottom: 14 },
  headRow: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 10 },
  h3: { fontSize: 17, fontFamily: FONTS.display_semi_bold, marginBottom: 10 },
  noMargin: { marginBottom: 0 },
  label: { fontSize: 13, fontFamily: FONTS.display_semi_bold, marginTop: 10, marginBottom: 6 },
  small: { fontSize: 12 },
  helpText: { marginBottom: 8, lineHeight: 17 },
  memberRow: { flexDirection: 'row', alignItems: 'center', gap: 10, paddingVertical: 10, flexWrap: 'wrap' },
  memberName: { fontSize: 15, fontFamily: FONTS.display_medium },
  memberActions: { flexDirection: 'row', alignItems: 'center', gap: 8, flexWrap: 'wrap' },
  pill: { flexDirection: 'row', alignItems: 'center', gap: 4, borderRadius: 999, paddingHorizontal: 10, paddingVertical: 4, alignSelf: 'flex-start' },
  pillText: { fontSize: 12, fontFamily: FONTS.display_semi_bold },
  rolePills: { flexDirection: 'row', gap: 6 },
  rolePill: { borderWidth: 1, borderRadius: 999, paddingHorizontal: 10, paddingVertical: 5 },
  reqHead: { flexDirection: 'row', alignItems: 'flex-start', gap: 8 },
  voters: { flexDirection: 'row', flexWrap: 'wrap', gap: 6, marginTop: 10 },
  buttonsRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginTop: 12 },
  button: { borderRadius: 12, paddingHorizontal: 16, paddingVertical: 10, alignItems: 'center', marginTop: 8 },
  buttonText: { fontSize: 14, fontFamily: FONTS.display_semi_bold },
  disabled: { opacity: 0.45 },
  radioRow: { flexDirection: 'row', alignItems: 'center', gap: 10, paddingVertical: 6 },
  search: { flexDirection: 'row', alignItems: 'center', gap: 8, borderWidth: 1, borderRadius: 12, paddingHorizontal: 10 },
  searchInput: { flex: 1, paddingVertical: 10, fontSize: 14 },
  resultRow: { paddingVertical: 10 },
});

export default BusinessTeamScreen;
