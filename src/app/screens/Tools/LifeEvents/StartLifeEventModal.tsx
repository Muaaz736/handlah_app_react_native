import React, { useEffect, useState } from 'react';
import { KeyboardAvoidingView, Modal, Platform, Pressable, ScrollView, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { useTranslation } from 'react-i18next';
import { apiHandle } from '../../../../config/apiHandle';
import { CustomDateTimePicker } from '../../../../components/common';
import { showErrorToast, showSuccessToast } from '../../../../components/common/CustomToast';
import { getColorWithOpacity } from '../../../../utils/colors';
import { lifeEventsApi, ymd } from '../toolsApi';
import type { LifeEventDetailDto, LifeEventTemplateDto } from '../tools.types';
import { PillButton, useToolsTheme } from '../toolsUi';
import { LifeEventIcon } from './lifeEventIcons';

interface Props {
  template: LifeEventTemplateDto | null;
  onClose: () => void;
  onStarted: (event: LifeEventDetailDto) => void;
}

interface VehicleOption {
  id: number;
  label: string;
}

/** The user's own vehicles that are still theirs (for "Selling a car"). */
async function loadVehicles(): Promise<VehicleOption[]> {
  const res = await apiHandle.get('vehicles');
  const data = res.data as unknown;
  const list: any[] = Array.isArray(data)
    ? data
    : Array.isArray((data as any)?.vehicles)
      ? (data as any).vehicles
      : Array.isArray((data as any)?.data)
        ? (data as any).data
        : [];
  return list
    .filter(v => v && !v.isdraft && !v.issold && !v.istransferred && !v.isDraft && !v.isSold && !v.isTransferred)
    .map(v => ({
      id: Number(v.id),
      label: v.nickname || [v.year, v.make, v.model].filter(Boolean).join(' ') || `#${v.id}`,
    }))
    .filter(v => Number.isFinite(v.id));
}

/** Asks the template's questions, then starts the life event. */
const StartLifeEventModal: React.FC<Props> = ({ template, onClose, onStarted }) => {
  const { t } = useTranslation();
  const { s, theme } = useToolsTheme();
  const [date, setDate] = useState<Date | null>(null);
  const [title, setTitle] = useState('');
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [vehicles, setVehicles] = useState<VehicleOption[] | null>(null);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const needsVehicle = template?.fields.some(f => f.type === 'vehicle') ?? false;

  useEffect(() => {
    setDate(null);
    setTitle('');
    setAnswers({});
    setError(null);
  }, [template?.key]);

  useEffect(() => {
    if (!needsVehicle || vehicles !== null) return;
    let cancelled = false;
    loadVehicles()
      .then(list => !cancelled && setVehicles(list))
      .catch(() => !cancelled && setVehicles([]));
    return () => {
      cancelled = true;
    };
  }, [needsVehicle, vehicles]);

  if (!template) return null;

  const submit = async () => {
    const missing = template.fields.find(f => f.required && !answers[f.key]?.trim());
    if (missing) {
      setError(t('lifeEvents.start.required', { field: missing.label }));
      return;
    }
    setError(null);
    setSaving(true);
    try {
      const details = Object.fromEntries(Object.entries(answers).filter(([, v]) => v.trim().length > 0));
      const started = await lifeEventsApi.start({
        templateKey: template.key,
        title: title.trim() || undefined,
        eventDate: date ? ymd(date) : null,
        details,
      });
      showSuccessToast(t('lifeEvents.start.started', { title: started.title }));
      onStarted(started);
    } catch {
      showErrorToast(t('lifeEvents.start.failed'));
    } finally {
      setSaving(false);
    }
  };

  const setAnswer = (key: string, value: string) => setAnswers(a => ({ ...a, [key]: value }));

  return (
    <Modal visible={!!template} transparent animationType="slide" onRequestClose={onClose}>
      <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <Pressable style={s.sheetBackdrop} onPress={onClose}>
          <Pressable style={s.sheet} onPress={() => {}}>
            <ScrollView contentContainerStyle={{ gap: 12 }} keyboardShouldPersistTaps="handled">
              <View style={s.row}>
                <View style={{ width: 40, height: 40, borderRadius: 12, backgroundColor: getColorWithOpacity(theme.primary, 0.12), alignItems: 'center', justifyContent: 'center' }}>
                  <LifeEventIcon name={template.icon} color={theme.primary} />
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={s.h2}>{template.title}</Text>
                  <Text style={s.muted}>{template.description}</Text>
                </View>
              </View>

              <CustomDateTimePicker
                label={template.datelabel}
                value={date}
                onChange={value => setDate(value instanceof Date ? value : value ? new Date(value) : null)}
                mode="date"
                clearable
              />
              <Text style={[s.small, { marginTop: -6 }]}>{t('lifeEvents.start.dateHint')}</Text>

              {template.fields.map(field => (
                <View key={field.key} style={{ gap: 6 }}>
                  <Text style={[s.body, s.strong]}>{field.label}{field.required ? ' *' : ''}</Text>
                  {field.type === 'vehicle' ? (
                    vehicles === null ? (
                      <Text style={s.muted}>{t('lifeEvents.start.loadingVehicles')}</Text>
                    ) : (
                      <View style={s.wrap}>
                        {vehicles.map(v => {
                          const selected = answers[field.key] === String(v.id);
                          return (
                            <TouchableOpacity
                              key={v.id}
                              onPress={() => setAnswer(field.key, String(v.id))}
                              accessibilityRole="button"
                              accessibilityState={{ selected }}
                              style={{
                                borderRadius: 999,
                                borderWidth: 1,
                                borderColor: selected ? theme.primary : theme.border,
                                backgroundColor: selected ? theme.primary : 'transparent',
                                paddingHorizontal: 12,
                                paddingVertical: 7,
                              }}
                            >
                              <Text style={[s.body, { color: selected ? '#fff' : theme.textPrimary }]}>{v.label}</Text>
                            </TouchableOpacity>
                          );
                        })}
                        {vehicles.length === 0 && <Text style={s.muted}>{t('lifeEvents.start.chooseVehicle')}</Text>}
                      </View>
                    )
                  ) : (
                    <TextInput
                      value={answers[field.key] ?? ''}
                      onChangeText={value => setAnswer(field.key, value)}
                      maxLength={300}
                      multiline={field.type === 'address'}
                      placeholder={field.key === 'oldAddress' ? t('lifeEvents.start.oldAddressHint') : undefined}
                      placeholderTextColor={theme.placeholder}
                      style={[s.input, field.type === 'address' && { minHeight: 64, textAlignVertical: 'top' }]}
                    />
                  )}
                </View>
              ))}

              <View style={{ gap: 6 }}>
                <Text style={[s.body, s.strong]}>{t('lifeEvents.start.titleLabel')}</Text>
                <TextInput value={title} onChangeText={setTitle} maxLength={150} style={s.input} placeholderTextColor={theme.placeholder} />
                <Text style={s.small}>{t('lifeEvents.start.titleHint')}</Text>
              </View>

              <Text style={s.small}>{t('lifeEvents.start.privacy')}</Text>
              {error ? <Text style={[s.body, { color: '#B91C1C' }]}>{error}</Text> : null}

              <View style={[s.row, { justifyContent: 'flex-end' }]}>
                <PillButton title={t('lifeEvents.cancel')} variant="outline" onPress={onClose} />
                <PillButton title={t('lifeEvents.start.submit')} loading={saving} onPress={() => void submit()} />
              </View>
            </ScrollView>
          </Pressable>
        </Pressable>
      </KeyboardAvoidingView>
    </Modal>
  );
};

export default StartLifeEventModal;
