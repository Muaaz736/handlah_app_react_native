import React, { useEffect, useState } from 'react';
import { Modal, Pressable, Switch, Text, TextInput, View } from 'react-native';
import { useTranslation } from 'react-i18next';
import { showErrorToast, showSuccessToast } from '../../../../components/common/CustomToast';
import { dailyBriefApi } from '../toolsApi';
import type { BriefPreferencesDto } from '../tools.types';
import { PillButton, useToolsTheme } from '../toolsUi';

interface Props {
  visible: boolean;
  preferences: BriefPreferencesDto;
  onClose: () => void;
  onSaved: (preferences: BriefPreferencesDto) => void;
}

/** The opt-in morning push: on/off, the local time it arrives, and a Sunday "week ahead". */
const BriefSettingsModal: React.FC<Props> = ({ visible, preferences, onClose, onSaved }) => {
  const { t } = useTranslation();
  const { s, theme } = useToolsTheme();
  const [pushEnabled, setPushEnabled] = useState(preferences.pushenabled);
  const [time, setTime] = useState(preferences.deliverytime);
  const [weekly, setWeekly] = useState(preferences.weeklysummary);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!visible) return;
    setPushEnabled(preferences.pushenabled);
    setTime(preferences.deliverytime);
    setWeekly(preferences.weeklysummary);
  }, [visible, preferences]);

  const save = async () => {
    const match = /^(\d{1,2}):(\d{2})$/.exec(time.trim());
    if (!match || Number(match[1]) > 23 || Number(match[2]) > 59) {
      showErrorToast(t('dailyBrief.settings.timeInvalid'));
      return;
    }
    setSaving(true);
    try {
      const saved = await dailyBriefApi.updatePreferences({
        pushEnabled,
        deliveryTime: `${match[1].padStart(2, '0')}:${match[2]}`,
        weeklySummary: weekly,
      });
      onSaved(saved);
      showSuccessToast(t('dailyBrief.settings.saved'));
      onClose();
    } catch {
      showErrorToast(t('dailyBrief.settings.saveFailed'));
    } finally {
      setSaving(false);
    }
  };

  const row = (label: string, hint: string, value: boolean, onChange: (v: boolean) => void) => (
    <View style={[s.rowBetween, s.card, { padding: 12 }]}>
      <View style={{ flex: 1 }}>
        <Text style={[s.body, s.strong]}>{label}</Text>
        <Text style={s.small}>{hint}</Text>
      </View>
      <Switch value={value} onValueChange={onChange} trackColor={{ true: theme.primary, false: theme.border }} />
    </View>
  );

  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <Pressable style={s.sheetBackdrop} onPress={onClose}>
        <Pressable style={s.sheet} onPress={() => {}}>
          <Text style={s.h2}>{t('dailyBrief.settings.title')}</Text>
          <Text style={s.muted}>{t('dailyBrief.settings.description')}</Text>
          {row(t('dailyBrief.settings.push'), t('dailyBrief.settings.pushHint'), pushEnabled, setPushEnabled)}
          <View style={{ gap: 6, opacity: pushEnabled ? 1 : 0.5 }}>
            <Text style={[s.body, s.strong]}>{t('dailyBrief.settings.time')}</Text>
            <TextInput
              value={time}
              onChangeText={setTime}
              editable={pushEnabled}
              placeholder="07:30"
              placeholderTextColor={theme.placeholder}
              keyboardType="numbers-and-punctuation"
              maxLength={5}
              style={[s.input, { width: 110 }]}
            />
          </View>
          {row(t('dailyBrief.settings.weekly'), t('dailyBrief.settings.weeklyHint'), weekly, setWeekly)}
          <Text style={s.small}>{t('dailyBrief.settings.quietNote')}</Text>
          <View style={[s.row, { justifyContent: 'flex-end' }]}>
            <PillButton title={t('dailyBrief.settings.cancel')} variant="outline" onPress={onClose} />
            <PillButton title={t('dailyBrief.settings.save')} loading={saving} onPress={() => void save()} />
          </View>
        </Pressable>
      </Pressable>
    </Modal>
  );
};

export default BriefSettingsModal;
