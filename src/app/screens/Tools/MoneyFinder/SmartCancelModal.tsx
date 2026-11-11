import React, { useEffect, useState } from 'react';
import { ActivityIndicator, Linking, Modal, Pressable, Text, View } from 'react-native';
import Feather from 'react-native-vector-icons/Feather';
import { useTranslation } from 'react-i18next';
import { showErrorToast, showSuccessToast } from '../../../../components/common/CustomToast';
import { getColorWithOpacity } from '../../../../utils/colors';
import { fetchEntityPortals } from '../../AiAssistant/modules/AiChatbot/api';
import { moneyFinderApi } from '../toolsApi';
import { PillButton, useToolsTheme } from '../toolsUi';

export interface CancelTarget {
  subscriptionId: number;
  name: string;
  findingKey?: string;
}

interface Props {
  /** The subscription to cancel; null closes the sheet. */
  target: CancelTarget | null;
  onClose: () => void;
  /** After the user confirms they canceled: the record is now Canceled. */
  onCanceled: () => void;
  /** Opens the subscription's own record, when no cancel page could be found. */
  onOpenRecord: (subscriptionId: number) => void;
}

type Link = { url: string; domain: string; source: 'catalog' | 'saved' | 'lookup' };

/** Only plain https links to a real host. */
function toHttpsLink(raw: string | null | undefined): { url: string; domain: string } | null {
  if (!raw) return null;
  let text = raw.trim();
  if (!/^[a-z][a-z0-9+.-]*:/i.test(text)) text = `https://${text}`;
  if (/^http:\/\//i.test(text)) text = `https://${text.slice(7)}`;
  const match = /^https:\/\/([^/?#@\s:]+)(?::\d+)?([/?#][^\s]*)?$/i.exec(text);
  if (!match || !match[1].includes('.')) return null;
  return { url: text, domain: match[1].replace(/^www\./i, '').toLowerCase() };
}

/**
 * Smart Cancel: opens the service's own cancellation page, where the person signs in and cancels.
 * NCHRG never handles their password. Afterwards it asks whether they canceled, and if so marks the
 * record Canceled and counts the saving.
 */
const SmartCancelModal: React.FC<Props> = ({ target, onClose, onCanceled, onOpenRecord }) => {
  const { t } = useTranslation();
  const { s, theme } = useToolsTheme();
  const [step, setStep] = useState<'loading' | 'ready' | 'none' | 'confirm'>('loading');
  const [link, setLink] = useState<Link | null>(null);
  const [name, setName] = useState('');
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!target) return;
    let cancelled = false;
    setStep('loading');
    setLink(null);
    setName(target.name);

    (async () => {
      let found: Link | null = null;
      let recordName = target.name;
      try {
        const res = await moneyFinderApi.getCancelLink(target.subscriptionId);
        if (res.subscriptionname) recordName = res.subscriptionname;
        if (!cancelled) setName(recordName);
        const safe = toHttpsLink(res.url);
        if (safe && res.source !== 'none') found = { ...safe, source: res.source };
      } catch {
        // Fall through to the website finder.
      }
      if (!found) {
        try {
          // The same official-website finder the Advanced Dashboard uses.
          const portals = await fetchEntityPortals({
            title: recordName,
            module: 'subscriptions',
            description: `Cancel the ${recordName} subscription`,
            entityType: 'subscription',
            entityId: target.subscriptionId,
            routeKey: 'subscriptions',
            buttonText: 'Cancel',
            reminderId: null,
            accountType: 'Personal',
          });
          const safe = toHttpsLink(portals.officialWebsites?.[0]?.url ?? portals.relevantPortals?.[0]?.url);
          if (safe) found = { ...safe, source: 'lookup' };
        } catch {
          // No link: offer the record instead.
        }
      }
      if (cancelled) return;
      setLink(found);
      setStep(found ? 'ready' : 'none');
    })();

    return () => {
      cancelled = true;
    };
  }, [target]);

  const openSite = async () => {
    if (!link) return;
    try {
      await Linking.openURL(link.url);
      setStep('confirm');
    } catch {
      showErrorToast(t('moneyFinder.actionFailed'));
    }
  };

  const confirmCanceled = async () => {
    if (!target) return;
    setSaving(true);
    try {
      await moneyFinderApi.markCanceled(target.subscriptionId, target.findingKey);
      showSuccessToast(t('moneyFinder.smartCancel.done', { name }));
      onCanceled();
      onClose();
    } catch {
      showErrorToast(t('moneyFinder.actionFailed'));
    } finally {
      setSaving(false);
    }
  };

  return (
    <Modal visible={target !== null} transparent animationType="slide" onRequestClose={onClose}>
      <Pressable style={s.sheetBackdrop} onPress={onClose}>
        <Pressable style={s.sheet} onPress={() => {}}>
          <Text style={s.h2}>{t('moneyFinder.smartCancel.title', { name })}</Text>

          {step === 'loading' && (
            <View style={[s.row, { paddingVertical: 16 }]}>
              <ActivityIndicator color={theme.primary} />
              <Text style={s.muted}>{t('moneyFinder.smartCancel.finding')}</Text>
            </View>
          )}

          {step === 'ready' && link && (
            <>
              <Text style={s.body}>
                {t(link.source === 'catalog' ? 'moneyFinder.smartCancel.introCatalog' : 'moneyFinder.smartCancel.introWebsite', { domain: link.domain })}
              </Text>
              <View style={[s.row, { alignItems: 'flex-start', borderRadius: 12, padding: 12, backgroundColor: getColorWithOpacity(theme.primary, 0.08) }]}>
                <Feather name="shield" size={18} color={theme.primary} />
                <Text style={[s.body, { flex: 1 }]}>{t('moneyFinder.smartCancel.privacy', { domain: link.domain })}</Text>
              </View>
              {link.source === 'lookup' && <Text style={s.small}>{t('moneyFinder.smartCancel.lookupNote')}</Text>}
              <View style={[s.row, { justifyContent: 'flex-end' }]}>
                <PillButton title={t('moneyFinder.smartCancel.notNow')} variant="outline" onPress={onClose} />
                <PillButton title={t('moneyFinder.smartCancel.open', { domain: link.domain })} icon="external-link" onPress={() => void openSite()} />
              </View>
            </>
          )}

          {step === 'none' && target && (
            <>
              <Text style={s.body}>{t('moneyFinder.smartCancel.noLink')}</Text>
              <View style={[s.row, { justifyContent: 'flex-end' }]}>
                <PillButton title={t('moneyFinder.smartCancel.notNow')} variant="outline" onPress={onClose} />
                <PillButton
                  title={t('moneyFinder.openRecord')}
                  onPress={() => {
                    onClose();
                    onOpenRecord(target.subscriptionId);
                  }}
                />
              </View>
            </>
          )}

          {step === 'confirm' && (
            <>
              <Text style={s.body}>{t('moneyFinder.smartCancel.didYou', { name })}</Text>
              <Text style={s.small}>{t('moneyFinder.smartCancel.didYouHint')}</Text>
              <View style={[s.wrap, { justifyContent: 'flex-end' }]}>
                <PillButton title={t('moneyFinder.smartCancel.notYet')} variant="outline" onPress={onClose} />
                <PillButton title={t('moneyFinder.smartCancel.openAgain')} variant="outline" onPress={() => void openSite()} />
                <PillButton title={t('moneyFinder.smartCancel.yesCanceled')} loading={saving} onPress={() => void confirmCanceled()} />
              </View>
            </>
          )}
        </Pressable>
      </Pressable>
    </Modal>
  );
};

export default SmartCancelModal;
