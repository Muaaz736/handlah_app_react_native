import React, { useEffect, useMemo, useRef, useState } from 'react';
import { ActivityIndicator, Alert, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import Feather from 'react-native-vector-icons/Feather';
import { useTranslation } from 'react-i18next';
import { useUserRole } from '../../../../../../hooks/useUserRole';
import { getColorWithOpacity } from '../../../../../../utils/colors';
import FONTS from '../../../../../../utils/fonts';
import type { RoleTheme } from '../../../../../../types/roleManager.types';
import { showErrorToast, showSuccessToast } from '../../../../../../components/common/CustomToast';
import {
  clockOffset,
  durationParts,
  emergencyAccessApi,
  formatDateTime,
  formatRemaining,
  type EmergencyAccessStatus,
} from '../../../../../../services/emergencyAccess';

const GRANTED_BLUE = '#2563eb';
const PENDING_AMBER = '#B45309';

interface Props {
  status: EmergencyAccessStatus;
  /** The other person's first name. */
  name: string;
  /** Reloads the status after an action, or when a timer runs out. */
  onChanged: () => void;
  /** Opens the reason sheet to request access. */
  onRequest: () => void;
  /** Shown under "You have emergency access": the records the person can open. */
  grantedContent?: React.ReactNode;
}

/** Current time on the server clock, ticking every second. */
function useServerNow(serverTimeUtc: string): number {
  const offset = useMemo(() => clockOffset(serverTimeUtc), [serverTimeUtc]);
  const [now, setNow] = useState(() => Date.now() + offset);
  useEffect(() => {
    setNow(Date.now() + offset);
    const id = setInterval(() => setNow(Date.now() + offset), 1000);
    return () => clearInterval(id);
  }, [offset]);
  return now;
}

/**
 * Emergency access on one connection, both ways: your access to their records (request, countdown to
 * automatic approval, time left, cancel / end) and their access to yours (approve, decline, revoke).
 */
const EmergencyStatusPanel: React.FC<Props> = ({ status, name, onChanged, onRequest, grantedContent }) => {
  const { t } = useTranslation();
  const { themeColors } = useUserRole();
  const theme = themeColors as RoleTheme;
  const s = useMemo(() => makeStyles(theme), [theme]);
  const now = useServerNow(status.serverTimeUtc);
  const [busy, setBusy] = useState<string | null>(null);

  const durationText = (minutes: number) => {
    const { unit, count } = durationParts(minutes);
    return t(`emergencyAccess.unit.${unit}`, { count });
  };
  const waiting = durationText(status.waitingPeriodMinutes);
  const lasts = durationText(status.accessDurationMinutes);

  // Reload once when a countdown reaches zero, so the screen moves on (approved / ended).
  const deadlines = [
    status.outgoing?.state === 'pending' ? status.outgoing.autoApproveOn : status.outgoing?.accessExpiresOn,
    status.incoming?.state === 'pending' ? status.incoming.autoApproveOn : status.incoming?.accessExpiresOn,
  ]
    .map(d => (d ? Date.parse(d) : NaN))
    .filter(Number.isFinite);
  const firedFor = useRef<number | null>(null);
  useEffect(() => {
    const passed = deadlines.find(d => d <= now);
    if (passed != null && firedFor.current !== passed) {
      firedFor.current = passed;
      const id = setTimeout(onChanged, 2000);
      return () => clearTimeout(id);
    }
    return undefined;
  });

  const run = async (key: string, action: () => Promise<void>, doneKey: string) => {
    setBusy(key);
    try {
      await action();
      showSuccessToast(t(doneKey));
      onChanged();
    } catch {
      showErrorToast(t('emergencyAccess.failed'));
    } finally {
      setBusy(null);
    }
  };

  const confirm = (message: string, confirmLabel: string, onYes: () => void) => {
    Alert.alert('', message, [
      { text: t('common.cancel'), style: 'cancel' },
      { text: confirmLabel, style: 'destructive', onPress: onYes },
    ]);
  };

  const out = status.outgoing;
  const inc = status.incoming;

  return (
    <View style={s.wrap}>
      {status.canRequest && (
        <View style={s.section}>
          <Text style={s.sectionTitle}>{t('emergencyAccess.yourAccessTitle', { name })}</Text>

          {!out && (
            <View style={s.card}>
              <Text style={s.cardTitle}>{t('emergencyAccess.request.title')}</Text>
              <Text style={s.body}>{t('emergencyAccess.request.intro', { name })}</Text>
              <Text style={[s.label, { marginTop: 4 }]}>{t('emergencyAccess.request.whatHappensNext')}</Text>
              {[
                t('emergencyAccess.request.step1', { name }),
                t('emergencyAccess.request.step2', { name, duration: waiting }),
                t('emergencyAccess.request.step3', { name }),
              ].map((line, i) => (
                <View key={i} style={s.stepRow}>
                  <View style={[s.stepDot, { backgroundColor: theme.primary }]}>
                    <Text style={s.stepNum}>{i + 1}</Text>
                  </View>
                  <Text style={[s.body, { flex: 1 }]}>{line}</Text>
                </View>
              ))}
              <View style={s.note}>
                <Feather name="eye" size={15} color={theme.primary} />
                <Text style={[s.small, { flex: 1 }]}>{t('emergencyAccess.request.limited', { name, duration: lasts })}</Text>
              </View>
              <ActionButton title={t('emergencyAccess.request.submit')} onPress={onRequest} theme={theme} />
            </View>
          )}

          {out?.state === 'pending' && (
            <View style={s.card}>
              <Badge text={t('emergencyAccess.awaiting.badge')} color={PENDING_AMBER} />
              <Text style={s.cardTitle}>{t('emergencyAccess.awaiting.title')}</Text>
              <Text style={s.body}>{t('emergencyAccess.awaiting.notified', { name })}</Text>
              <Countdown
                heading={t('emergencyAccess.awaiting.autoIn')}
                start={out.requestedOn}
                end={out.autoApproveOn}
                now={now}
                startLabel={t('emergencyAccess.awaiting.requested')}
                endLabel={t('emergencyAccess.awaiting.autoApproval')}
                doneText={t('emergencyAccess.awaiting.processing')}
                totalText={waiting}
                color={theme.primary}
              />
              <Text style={s.small}>{t('emergencyAccess.awaiting.ifNoResponse', { name })}</Text>
              <ActionButton
                title={t('emergencyAccess.awaiting.cancel')}
                variant="outline"
                loading={busy === 'cancel'}
                onPress={() =>
                  confirm(t('emergencyAccess.confirm.cancelRequest'), t('emergencyAccess.awaiting.cancel'), () =>
                    void run('cancel', () => emergencyAccessApi.revoke(out.requestId), 'emergencyAccess.done.cancelled'),
                  )
                }
                theme={theme}
              />
            </View>
          )}

          {out?.state === 'granted' && (
            <>
              <View style={s.card}>
                <Badge text={t('emergencyAccess.granted.badge')} color={GRANTED_BLUE} />
                <Text style={s.cardTitle}>{t('emergencyAccess.granted.title')}</Text>
                <Text style={s.body}>{t('emergencyAccess.granted.hint', { name })}</Text>
                {out.grantedOn && out.accessExpiresOn && (
                  <Countdown
                    heading={t('emergencyAccess.granted.endsIn')}
                    start={out.grantedOn}
                    end={out.accessExpiresOn}
                    now={now}
                    startLabel={t('emergencyAccess.granted.granted')}
                    endLabel={t('emergencyAccess.granted.ends')}
                    doneText={t('emergencyAccess.granted.ending')}
                    totalText={lasts}
                    color={GRANTED_BLUE}
                  />
                )}
                <ActionButton
                  title={t('emergencyAccess.granted.end')}
                  variant="outline"
                  loading={busy === 'end'}
                  onPress={() =>
                    confirm(t('emergencyAccess.confirm.endAccess', { name }), t('emergencyAccess.granted.end'), () =>
                      void run('end', () => emergencyAccessApi.revoke(out.requestId), 'emergencyAccess.done.ended'),
                    )
                  }
                  theme={theme}
                />
              </View>
              {grantedContent}
            </>
          )}
        </View>
      )}

      {status.canBeRequested && (
        <View style={s.section}>
          <Text style={s.sectionTitle}>{t('emergencyAccess.theirAccessTitle', { name })}</Text>
          {!inc && (
            <View style={s.card}>
              <Text style={s.body}>{t('emergencyAccess.incoming.none', { name, duration: waiting })}</Text>
            </View>
          )}

          {inc?.state === 'pending' && (
            <View style={s.card}>
              <Badge text={t('emergencyAccess.incoming.badge')} color={PENDING_AMBER} />
              <Text style={s.cardTitle}>{t('emergencyAccess.incoming.pendingTitle', { name })}</Text>
              {!!inc.reason && (
                <View style={s.note}>
                  <Text style={[s.small, { flex: 1 }]}>
                    <Text style={s.label}>{t('emergencyAccess.incoming.reason')}: </Text>
                    {inc.reason}
                  </Text>
                </View>
              )}
              <Countdown
                heading={t('emergencyAccess.awaiting.autoIn')}
                start={inc.requestedOn}
                end={inc.autoApproveOn}
                now={now}
                startLabel={t('emergencyAccess.awaiting.requested')}
                endLabel={t('emergencyAccess.awaiting.autoApproval')}
                doneText={t('emergencyAccess.awaiting.processing')}
                totalText={waiting}
                color={theme.primary}
              />
              <Text style={s.small}>{t('emergencyAccess.incoming.pendingHint')}</Text>
              <View style={s.row}>
                <ActionButton
                  title={t('emergencyAccess.incoming.decline')}
                  variant="outline"
                  loading={busy === 'decline'}
                  onPress={() =>
                    confirm(t('emergencyAccess.confirm.decline', { name }), t('emergencyAccess.incoming.decline'), () =>
                      void run('decline', () => emergencyAccessApi.decline(inc.requestId), 'emergencyAccess.done.declined'),
                    )
                  }
                  theme={theme}
                  style={{ flex: 1 }}
                />
                <ActionButton
                  title={t('emergencyAccess.incoming.approve')}
                  loading={busy === 'approve'}
                  onPress={() => void run('approve', () => emergencyAccessApi.approve(inc.requestId), 'emergencyAccess.done.approved')}
                  theme={theme}
                  style={{ flex: 1 }}
                />
              </View>
            </View>
          )}

          {inc?.state === 'granted' && (
            <View style={s.card}>
              <Badge text={t('emergencyAccess.granted.badge')} color={GRANTED_BLUE} />
              <Text style={s.cardTitle}>{t('emergencyAccess.incoming.grantedTitle', { name })}</Text>
              <Text style={s.body}>{t('emergencyAccess.incoming.grantedHint')}</Text>
              {inc.grantedOn && inc.accessExpiresOn && (
                <Countdown
                  heading={t('emergencyAccess.granted.endsIn')}
                  start={inc.grantedOn}
                  end={inc.accessExpiresOn}
                  now={now}
                  startLabel={t('emergencyAccess.granted.granted')}
                  endLabel={t('emergencyAccess.granted.ends')}
                  doneText={t('emergencyAccess.granted.ending')}
                  totalText={lasts}
                  color={GRANTED_BLUE}
                />
              )}
              <ActionButton
                title={t('emergencyAccess.incoming.revoke')}
                variant="danger"
                loading={busy === 'revoke'}
                onPress={() =>
                  confirm(t('emergencyAccess.confirm.revoke', { name }), t('emergencyAccess.incoming.revoke'), () =>
                    void run('revoke', () => emergencyAccessApi.revoke(inc.requestId), 'emergencyAccess.done.revoked'),
                  )
                }
                theme={theme}
              />
            </View>
          )}
        </View>
      )}
    </View>
  );
};

/** Big time left, a progress bar and the two times. */
const Countdown: React.FC<{
  heading: string;
  start: string;
  end: string;
  now: number;
  startLabel: string;
  endLabel: string;
  doneText: string;
  totalText: string;
  color: string;
}> = ({ heading, start, end, now, startLabel, endLabel, doneText, totalText, color }) => {
  const { t } = useTranslation();
  const { themeColors } = useUserRole();
  const theme = themeColors as RoleTheme;
  const s = useMemo(() => makeStyles(theme), [theme]);
  const startMs = Date.parse(start);
  const endMs = Date.parse(end);
  const total = Math.max(1, endMs - startMs);
  const elapsed = Math.min(total, Math.max(0, now - startMs));
  const remaining = endMs - now;
  const pct = Math.round((elapsed / total) * 100);

  return (
    <View style={s.countdown} accessible accessibilityLabel={`${heading} ${remaining > 0 ? formatRemaining(remaining) : doneText}`}>
      <Text style={s.small}>{heading}</Text>
      <Text style={s.bigTime}>{remaining > 0 ? formatRemaining(remaining) : doneText}</Text>
      <Text style={[s.small, { marginBottom: 8 }]}>{t('emergencyAccess.elapsed', { elapsed: formatRemaining(elapsed), total: totalText })}</Text>
      <View style={s.track}>
        <View style={{ height: '100%', width: `${pct}%`, borderRadius: 4, backgroundColor: color }} />
      </View>
      <View style={[s.row, { justifyContent: 'space-between', marginTop: 10 }]}>
        <View>
          <Text style={s.small}>{startLabel}</Text>
          <Text style={s.label}>{formatDateTime(start)}</Text>
        </View>
        <View style={{ alignItems: 'flex-end' }}>
          <Text style={s.small}>{endLabel}</Text>
          <Text style={s.label}>{formatDateTime(end)}</Text>
        </View>
      </View>
      <Text style={[s.tiny, { marginTop: 6 }]}>{t('emergencyAccess.timesLocal')}</Text>
    </View>
  );
};

const Badge: React.FC<{ text: string; color: string }> = ({ text, color }) => (
  <View style={{ alignSelf: 'flex-start', borderRadius: 999, paddingHorizontal: 10, paddingVertical: 3, backgroundColor: getColorWithOpacity(color, 0.12) }}>
    <Text style={{ color, fontSize: 12, fontFamily: FONTS.display_semi_bold }}>{text}</Text>
  </View>
);

const ActionButton: React.FC<{
  title: string;
  onPress: () => void;
  theme: RoleTheme;
  variant?: 'primary' | 'outline' | 'danger';
  loading?: boolean;
  style?: object;
}> = ({ title, onPress, theme, variant = 'primary', loading, style }) => {
  const bg = variant === 'primary' ? theme.primary : variant === 'danger' ? '#B91C1C' : 'transparent';
  const fg = variant === 'outline' ? theme.textPrimary : '#ffffff';
  return (
    <TouchableOpacity
      onPress={onPress}
      disabled={loading}
      activeOpacity={0.8}
      accessibilityRole="button"
      style={[
        {
          flexDirection: 'row',
          alignItems: 'center',
          justifyContent: 'center',
          gap: 6,
          borderRadius: 999,
          paddingVertical: 13,
          paddingHorizontal: 16,
          marginTop: 4,
          backgroundColor: bg,
          borderWidth: variant === 'outline' ? 1 : 0,
          borderColor: theme.border,
        },
        style,
      ]}
    >
      {loading && <ActivityIndicator size="small" color={fg} />}
      <Text style={{ color: fg, fontSize: 14, fontFamily: FONTS.display_semi_bold }}>{title}</Text>
    </TouchableOpacity>
  );
};

function makeStyles(theme: RoleTheme) {
  return StyleSheet.create({
    wrap: { paddingHorizontal: 16, paddingBottom: 20, gap: 8 },
    section: { gap: 10, marginBottom: 12 },
    sectionTitle: { fontSize: 18, fontFamily: FONTS.display_bold, color: theme.textPrimary },
    card: { backgroundColor: theme.surface, borderRadius: 16, borderWidth: 1, borderColor: theme.border, padding: 16, gap: 10 },
    cardTitle: { fontSize: 16, fontFamily: FONTS.display_semi_bold, color: theme.textPrimary },
    body: { fontSize: 14, fontFamily: FONTS.display_regular, color: theme.textPrimary, lineHeight: 20 },
    label: { fontSize: 13, fontFamily: FONTS.display_semi_bold, color: theme.textPrimary },
    small: { fontSize: 13, fontFamily: FONTS.display_regular, color: theme.textSecondary, lineHeight: 18 },
    tiny: { fontSize: 11, fontFamily: FONTS.display_regular, color: theme.textSecondary },
    row: { flexDirection: 'row', alignItems: 'center', gap: 8 },
    stepRow: { flexDirection: 'row', alignItems: 'flex-start', gap: 10 },
    stepDot: { width: 22, height: 22, borderRadius: 11, alignItems: 'center', justifyContent: 'center', marginTop: 1 },
    stepNum: { color: '#ffffff', fontSize: 12, fontFamily: FONTS.display_semi_bold },
    note: { flexDirection: 'row', alignItems: 'flex-start', gap: 8, borderRadius: 12, padding: 12, backgroundColor: getColorWithOpacity(theme.primary, 0.08) },
    countdown: { borderRadius: 12, borderWidth: 1, borderColor: theme.border, padding: 14, alignItems: 'stretch' },
    bigTime: { fontSize: 32, fontFamily: FONTS.display_bold, color: theme.textPrimary, fontVariant: ['tabular-nums'] },
    track: { height: 8, borderRadius: 4, backgroundColor: getColorWithOpacity(theme.textSecondary, 0.2), overflow: 'hidden' },
  });
}

export default EmergencyStatusPanel;
