import React, { useCallback, useEffect, useState } from 'react';
import { ActivityIndicator, Alert, Share, Switch, Text, TextInput, TouchableOpacity, View } from 'react-native';
import Feather from 'react-native-vector-icons/Feather';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import { useTranslation } from 'react-i18next';
import { showErrorToast, showSuccessToast } from '../../../../components/common/CustomToast';
import { getColorWithOpacity } from '../../../../utils/colors';
import {
  apiErrorMessage,
  formatMoney,
  formatShortDate,
  householdApi,
  householdJoinLink,
  inviteTokenFrom,
  moneyFinderApi,
} from '../toolsApi';
import type { HouseholdFindingDto, HouseholdInvitePreviewDto, HouseholdMoneyFinderDto, MyHouseholdDto } from '../tools.types';
import { Card, PillButton, useToolsTheme } from '../toolsUi';
import type { CancelTarget } from './SmartCancelModal';

interface Props {
  onCancel: (target: CancelTarget) => void;
  /** Bumped by the screen after a cancel, so findings refresh. */
  refreshKey: number;
}

/**
 * Household Money Finder: services the household pays for more than once. Members see their own
 * plans in full; everyone else shows as "A household member" unless they chose to show names, and
 * nobody's amounts are shared.
 */
const HouseholdSection: React.FC<Props> = ({ onCancel, refreshKey }) => {
  const { t } = useTranslation();
  const { s, theme } = useToolsTheme();

  const [household, setHousehold] = useState<MyHouseholdDto | null>(null);
  const [findings, setFindings] = useState<HouseholdMoneyFinderDto | null>(null);
  const [status, setStatus] = useState<'loading' | 'ready' | 'failed'>('loading');
  const [busy, setBusy] = useState<string | null>(null);
  const [name, setName] = useState('');
  const [inviteLabel, setInviteLabel] = useState('');
  const [joinText, setJoinText] = useState('');
  const [preview, setPreview] = useState<{ token: string; info: HouseholdInvitePreviewDto } | null>(null);

  const load = useCallback(async (quiet = false) => {
    if (!quiet) setStatus('loading');
    try {
      const mine = await householdApi.getMine();
      setHousehold(mine);
      setFindings(mine ? await moneyFinderApi.getHousehold() : null);
      setStatus('ready');
    } catch {
      if (!quiet) setStatus('failed');
    }
  }, []);

  useEffect(() => {
    void load(refreshKey > 0);
  }, [load, refreshKey]);

  const run = async <T,>(key: string, action: () => Promise<T>, onDone?: (result: T) => void | Promise<void>) => {
    setBusy(key);
    try {
      const result = await action();
      await onDone?.(result);
    } catch (err) {
      showErrorToast(apiErrorMessage(err) ?? t('moneyFinder.actionFailed'));
    } finally {
      setBusy(null);
    }
  };

  const createHousehold = () =>
    run('create', () => householdApi.create(name.trim()), async h => {
      setHousehold(h);
      setName('');
      setFindings(await moneyFinderApi.getHousehold());
    });

  const createInvite = () =>
    run('invite', () => householdApi.createInvite(inviteLabel.trim()), async created => {
      setInviteLabel('');
      const link = householdJoinLink(created.token);
      try {
        await Share.share({
          title: t('moneyFinder.household.shareTitle'),
          message: `${t('moneyFinder.household.shareText')} ${link}`,
        });
      } catch {
        // The share sheet was closed.
      }
      showSuccessToast(t('moneyFinder.household.inviteHint', { date: formatShortDate(created.expiresat.slice(0, 10)) }));
      void load(true);
    });

  const previewJoin = () => {
    const token = inviteTokenFrom(joinText);
    if (!token) {
      showErrorToast(t('moneyFinder.join.badLink'));
      return;
    }
    void run('preview', () => householdApi.previewInvite(token), info => setPreview({ token, info }));
  };

  const acceptJoin = () => {
    if (!preview) return;
    void run('accept', () => householdApi.acceptInvite(preview.token), async h => {
      showSuccessToast(t('moneyFinder.join.joined', { name: h.name }));
      setPreview(null);
      setJoinText('');
      setHousehold(h);
      setFindings(await moneyFinderApi.getHousehold());
    });
  };

  const confirmLeave = () => {
    if (!household) return;
    const isOwner = household.myrole === 'owner';
    const body = isOwner && household.members.length > 1
      ? t('moneyFinder.household.leaveOwnerBody')
      : household.members.length <= 1
        ? t('moneyFinder.household.leaveLastBody')
        : t('moneyFinder.household.leaveBody');
    Alert.alert(t('moneyFinder.household.leaveTitle'), body, [
      { text: t('moneyFinder.smartCancel.notNow'), style: 'cancel' },
      {
        text: t('moneyFinder.household.leave'),
        style: 'destructive',
        onPress: () =>
          void run('leave', () => householdApi.leave(), () => {
            setHousehold(null);
            setFindings(null);
            showSuccessToast(t('moneyFinder.household.left'));
          }),
      },
    ]);
  };

  const setKeeper = (finding: HouseholdFindingDto, planRef: number | null) =>
    run(`keep:${finding.servicekey}`, () => moneyFinderApi.setKeeper(finding.servicekey, planRef), setFindings);

  if (status === 'loading') {
    return (
      <Card style={s.row}>
        <ActivityIndicator color={theme.primary} />
        <Text style={s.muted}>{t('moneyFinder.household.loading')}</Text>
      </Card>
    );
  }

  if (status === 'failed') {
    return (
      <Card style={s.rowBetween}>
        <Text style={[s.muted, { flex: 1 }]}>{t('moneyFinder.household.loadFailed')}</Text>
        <PillButton title={t('moneyFinder.retry')} variant="outline" onPress={() => void load()} />
      </Card>
    );
  }

  // Not in a household yet: what it is, start one, or join with a link.
  if (!household) {
    return (
      <Card style={{ gap: 10 }}>
        <View style={[s.row, { alignItems: 'flex-start' }]}>
          <View style={{ width: 40, height: 40, borderRadius: 12, backgroundColor: getColorWithOpacity(theme.primary, 0.12), alignItems: 'center', justifyContent: 'center' }}>
            <Feather name="home" size={20} color={theme.primary} />
          </View>
          <View style={{ flex: 1 }}>
            <Text style={s.h2}>{t('moneyFinder.household.title')}</Text>
            <Text style={[s.muted, { marginTop: 2 }]}>{t('moneyFinder.household.pitch')}</Text>
          </View>
        </View>
        <View style={{ gap: 4 }}>
          <Text style={s.small}>• {t('moneyFinder.household.privacy1')}</Text>
          <Text style={s.small}>• {t('moneyFinder.household.privacy2')}</Text>
          <Text style={s.small}>• {t('moneyFinder.household.privacy3')}</Text>
        </View>
        <TextInput
          value={name}
          onChangeText={setName}
          maxLength={80}
          placeholder={t('moneyFinder.household.namePlaceholder')}
          placeholderTextColor={theme.placeholder}
          style={s.input}
        />
        <PillButton title={t('moneyFinder.household.create')} disabled={!name.trim()} loading={busy === 'create'} onPress={() => void createHousehold()} />

        <View style={s.divider} />
        <Text style={[s.body, s.strong]}>{t('moneyFinder.join.title')}</Text>
        {preview ? (
          <View style={{ gap: 8 }}>
            <Text style={s.body}>
              {preview.info.status === 'valid'
                ? t('moneyFinder.join.body', { inviter: preview.info.invitedby ?? '', name: preview.info.householdname ?? '', count: preview.info.membercount })
                : t(`moneyFinder.join.status.${preview.info.status}`, { name: preview.info.householdname ?? '' })}
            </Text>
            <View style={s.wrap}>
              <PillButton title={t('moneyFinder.join.decline')} variant="outline" onPress={() => setPreview(null)} />
              {preview.info.status === 'valid' && (
                <PillButton title={t('moneyFinder.join.accept')} loading={busy === 'accept'} onPress={acceptJoin} />
              )}
            </View>
          </View>
        ) : (
          <View style={{ gap: 8 }}>
            <TextInput
              value={joinText}
              onChangeText={setJoinText}
              placeholder={t('moneyFinder.join.pastePlaceholder')}
              placeholderTextColor={theme.placeholder}
              autoCapitalize="none"
              autoCorrect={false}
              style={s.input}
            />
            <PillButton title={t('moneyFinder.join.check')} variant="outline" disabled={!joinText.trim()} loading={busy === 'preview'} onPress={previewJoin} />
          </View>
        )}
      </Card>
    );
  }

  const isOwner = household.myrole === 'owner';
  const full = household.members.length >= household.maxmembers;

  return (
    <View style={{ gap: 12 }}>
      <Card style={{ gap: 10 }}>
        <View style={s.rowBetween}>
          <View style={[s.row, { flex: 1 }]}>
            <View style={{ width: 40, height: 40, borderRadius: 12, backgroundColor: getColorWithOpacity(theme.primary, 0.12), alignItems: 'center', justifyContent: 'center' }}>
              <Feather name="users" size={20} color={theme.primary} />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={s.h2} numberOfLines={1}>{household.name}</Text>
              <Text style={s.small}>{t('moneyFinder.household.memberCount', { count: household.members.length, max: household.maxmembers })}</Text>
            </View>
          </View>
          {findings && findings.potentialannual > 0 && (
            <View style={{ alignItems: 'flex-end' }}>
              <Text style={s.small}>{t('moneyFinder.household.couldSave')}</Text>
              <Text style={[s.h2, { color: theme.primary }]}>~{formatMoney(findings.potentialannual)}{t('moneyFinder.perYear')}</Text>
            </View>
          )}
        </View>

        <View style={s.wrap}>
          {household.members.map(m => (
            <View key={m.userid} style={[s.row, { borderRadius: 999, backgroundColor: getColorWithOpacity(theme.textSecondary, 0.1), paddingLeft: 12, paddingRight: isOwner && !m.isyou ? 4 : 12, paddingVertical: 4, gap: 6 }]}>
              {m.role === 'owner' && <MaterialCommunityIcons name="crown-outline" size={14} color="#B45309" />}
              <Text style={s.body}>{m.isyou ? t('moneyFinder.household.you') : m.displayname}</Text>
              {isOwner && !m.isyou && (
                <TouchableOpacity
                  onPress={() =>
                    Alert.alert(t('moneyFinder.household.remove', { name: m.displayname }), undefined, [
                      { text: t('moneyFinder.smartCancel.notNow'), style: 'cancel' },
                      {
                        text: t('moneyFinder.household.remove', { name: m.displayname }),
                        style: 'destructive',
                        onPress: () => void run(`remove:${m.userid}`, () => householdApi.removeMember(m.userid), h => {
                          setHousehold(h);
                          void load(true);
                        }),
                      },
                    ])
                  }
                  accessibilityRole="button"
                  accessibilityLabel={t('moneyFinder.household.remove', { name: m.displayname })}
                  style={{ padding: 4 }}
                >
                  <Feather name="user-minus" size={14} color={theme.textSecondary} />
                </TouchableOpacity>
              )}
            </View>
          ))}
        </View>

        <View style={[s.rowBetween, { borderWidth: 1, borderColor: theme.border, borderRadius: 12, padding: 12 }]}>
          <View style={{ flex: 1 }}>
            <Text style={[s.body, s.strong]}>{t('moneyFinder.household.showNames')}</Text>
            <Text style={s.small}>{t('moneyFinder.household.showNamesHint')}</Text>
          </View>
          <Switch
            value={household.showmysubscriptionnames}
            disabled={busy === 'names'}
            trackColor={{ true: theme.primary, false: theme.border }}
            onValueChange={checked =>
              void run('names', () => householdApi.update({ showSubscriptionNames: checked }), h => {
                setHousehold(h);
                void load(true);
              })
            }
          />
        </View>

        {isOwner && (
          <View style={{ gap: 8 }}>
            <TextInput
              value={inviteLabel}
              onChangeText={setInviteLabel}
              maxLength={60}
              placeholder={t('moneyFinder.household.inviteLabel')}
              placeholderTextColor={theme.placeholder}
              style={s.input}
            />
            <PillButton title={t('moneyFinder.household.invite')} icon="share" disabled={full} loading={busy === 'invite'} onPress={() => void createInvite()} />
            {full && <Text style={s.small}>{t('moneyFinder.household.full')}</Text>}
            {household.pendinginvites.map(i => (
              <View key={i.id} style={s.rowBetween}>
                <Text style={[s.small, { flex: 1 }]} numberOfLines={1}>
                  {i.label ?? t('moneyFinder.household.invitePending')} · {t('moneyFinder.household.expires', { date: formatShortDate(i.expiresat.slice(0, 10)) })}
                </Text>
                <PillButton
                  title={t('moneyFinder.household.revoke')}
                  variant="ghost"
                  disabled={busy === `revoke:${i.id}`}
                  onPress={() => void run(`revoke:${i.id}`, () => householdApi.revokeInvite(i.id), () => void load(true))}
                />
              </View>
            ))}
          </View>
        )}

        <PillButton title={t('moneyFinder.household.leave')} icon="log-out" variant="ghost" onPress={confirmLeave} style={{ alignSelf: 'flex-end' }} />
      </Card>

      {findings && findings.findings.length === 0 && (
        <Card>
          <Text style={s.body}>{household.members.length < 2 ? t('moneyFinder.household.inviteFirst') : t('moneyFinder.household.noOverlaps')}</Text>
        </Card>
      )}

      {findings?.findings.map(f => {
        const keepBusy = busy === `keep:${f.servicekey}`;
        const myPlans = f.plans.filter(p => p.isyou && p.subscriptionid != null && !p.iskeeper);
        return (
          <Card key={f.key} style={{ gap: 8 }}>
            <View style={s.rowBetween}>
              <View style={[s.badge, { backgroundColor: '#E0F2FE' }]}>
                <Text style={[s.badgeText, { color: '#075985' }]}>{t('moneyFinder.household.badge')}</Text>
              </View>
              {f.annualsavings != null && f.annualsavings > 0 && (
                <Text style={[s.body, s.strong, { color: theme.primary }]}>
                  {f.savingsisestimate ? '~' : ''}{formatMoney(f.annualsavings)}{t('moneyFinder.perYear')}
                </Text>
              )}
            </View>
            <Text style={[s.body, s.strong, { fontSize: 15 }]}>{f.title}</Text>
            <Text style={s.muted}>{f.message}</Text>

            <Text style={[s.small, s.strong]}>{t('moneyFinder.household.whoKeeps')}</Text>
            {f.plans.map(p => (
              <View key={p.ref} style={[s.rowBetween, { borderWidth: 1, borderColor: theme.border, borderRadius: 12, paddingHorizontal: 12, paddingVertical: 8 }]}>
                <Text style={[s.body, { flex: 1 }]} numberOfLines={2}>
                  <Text style={s.strong}>
                    {p.isyou ? t('moneyFinder.household.you') : p.displayname === 'A household member' ? t('moneyFinder.household.someone') : p.displayname}
                  </Text>
                  {p.subscriptionname ? <Text style={s.muted}> · {p.subscriptionname}</Text> : null}
                </Text>
                {p.iskeeper ? (
                  <View style={s.row}>
                    <Feather name="check" size={14} color={theme.primary} />
                    <Text style={[s.small, { color: theme.primary }]}>{t('moneyFinder.household.keeping')}</Text>
                  </View>
                ) : (
                  <PillButton title={t('moneyFinder.household.keepThis')} variant="ghost" disabled={keepBusy} onPress={() => void setKeeper(f, p.ref)} />
                )}
              </View>
            ))}

            {f.youshouldcancel && <Text style={[s.body, s.strong, { color: '#92400E' }]}>{t('moneyFinder.household.youCanCancel')}</Text>}
            <View style={s.wrap}>
              {myPlans.map(p => (
                <PillButton
                  key={p.ref}
                  icon="scissors"
                  variant={f.youshouldcancel ? 'primary' : 'outline'}
                  title={myPlans.length > 1 && p.subscriptionname ? t('moneyFinder.smartCancel.buttonNamed', { name: p.subscriptionname }) : t('moneyFinder.smartCancel.button')}
                  onPress={() => onCancel({ subscriptionId: p.subscriptionid!, name: p.subscriptionname ?? f.servicename, findingKey: f.key })}
                />
              ))}
              {f.haskeeper && (
                <PillButton title={t('moneyFinder.household.clearKeeper')} variant="ghost" disabled={keepBusy} onPress={() => void setKeeper(f, null)} />
              )}
              {keepBusy && <ActivityIndicator color={theme.primary} />}
            </View>
          </Card>
        );
      })}
    </View>
  );
};

export default HouseholdSection;
