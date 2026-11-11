import { Modal, ScrollView, Text, TouchableOpacity, View } from 'react-native';
import React, { useState, useEffect, useMemo } from 'react';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { useTranslation } from 'react-i18next';
import { useDispatch, useSelector } from 'react-redux';
import { Formik, FormikProps } from 'formik';
import {
  addAdHocReminderAsync,
  updateBatchReminderAsync,
} from '../../../../../redux/services/reminderService';
import { setAddAdHocReminderStatus } from '../../../../../redux/slices/reminderSlice';
import { ASYNC_STATUS } from '../../../../../config/constants';
import FontAwesome6 from 'react-native-vector-icons/FontAwesome6';
import Feather from 'react-native-vector-icons/Feather';
import ScreenWrapper from '../../../../../components/ScreenWrapper/ScreenWrapper';
import {
  AuthHeader,
  CustomDateTimePicker,
  CustomInput,
  PrimaryButton,
} from '../../../../../components/common';
import { useUserRole } from '../../../../../hooks/useUserRole';
import { useSelectedBusiness } from '../../../../../hooks/useSelectedBusiness';
import { isIOS } from '../../../../../utils/helpers';
import { DayOfWeek, FrequencyOption } from './AddAdHocReminder.types';
import { AppDispatch } from '../../../../../types/store.types';
import { makeAddAdHocReminderStyles } from './AddAdHocReminder.styles';
import validationSchema from '../../../../../utils/validationSchemas';
import { RoleTheme } from '../../../../../types/roleManager.types';

const FREQUENCY_OPTIONS: { label: string; value: FrequencyOption }[] = [
  { label: 'Daily', value: 'daily' },
  { label: 'Weekly', value: 'weekly' },
  { label: 'Monthly', value: 'monthly' },
  { label: 'Custom date', value: 'custom' },
];

const DAYS_OF_WEEK: DayOfWeek[] = [
  'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday',
];

const MONTH_DAYS = Array.from({ length: 31 }, (_, i) => i + 1);

interface FormValues {
  description: string;
  frequency: FrequencyOption;
  time: string | null;
  startDate: string | null;
  endDate: string | null;
  customDate: string | null;
}

const initialValues: FormValues = {
  description: '',
  frequency: 'daily',
  time: null,
  startDate: null,
  endDate: null,
  customDate: null,
};

interface BatchEditPrefill {
  description?: string;
  frequency?: FrequencyOption;
  timeISO?: string | null;
  startDateISO?: string | null;
  endDateISO?: string | null;
  selectedDays?: DayOfWeek[];
  selectedDates?: number[];
}

const AddAdHocReminder = (): React.ReactElement => {
  const navigation = useNavigation();
  const route = useRoute<
    RouteProp<{ params: { batchId?: string; prefill?: BatchEditPrefill; initialDate?: string } }, 'params'>
  >();
  const { t } = useTranslation();
  const { themeColors, isBusinessRole } = useUserRole();
  const styles = useMemo(() => makeAddAdHocReminderStyles(themeColors as RoleTheme), [themeColors]);
  const { selectedBusinessId } = useSelectedBusiness();

  // Batch-edit mode: navigated here with a batchId + reconstructed schedule.
  const editParams = route.params ?? {};
  const editBatchId = editParams.batchId;
  const isEditMode = !!editBatchId;
  const prefill = editParams.prefill ?? {};

  const dispatch = useDispatch<AppDispatch>();
  const { add_ad_hoc_reminder_status, reminder_action_status } = useSelector(
    (state: any) => state.reminder_slice,
  );
  const isSubmitting = isEditMode
    ? reminder_action_status === ASYNC_STATUS.LOADING
    : add_ad_hoc_reminder_status === ASYNC_STATUS.LOADING;

  const editInitialValues: FormValues | null = isEditMode
    ? {
      description: prefill.description ?? '',
      frequency: prefill.frequency ?? 'daily',
      time: prefill.timeISO ?? null,
      startDate: prefill.startDateISO ?? null,
      endDate: prefill.endDateISO ?? null,
      customDate: null,
    }
    : null;

  const [selectedDays, setSelectedDays] = useState<DayOfWeek[]>(
    isEditMode && prefill.selectedDays?.length ? prefill.selectedDays : ['Monday'],
  );
  const [selectedDates, setSelectedDates] = useState<number[]>(
    isEditMode && prefill.selectedDates?.length ? prefill.selectedDates : [1],
  );
  const [monthlyModalVisible, setMonthlyModalVisible] = useState<boolean>(false);

  useEffect(() => {
    if (add_ad_hoc_reminder_status === ASYNC_STATUS.SUCCEEDED) {
      dispatch(setAddAdHocReminderStatus());
      navigation.goBack();
    }
  }, [add_ad_hoc_reminder_status]);

  const toggleDay = (day: DayOfWeek) => {
    setSelectedDays(prev =>
      prev.includes(day) ? prev.filter(d => d !== day) : [...prev, day],
    );
  };

  const toggleMonthDay = (day: number) => {
    setSelectedDates(prev =>
      prev.includes(day) ? prev.filter(d => d !== day) : [...prev, day],
    );
  };

  const allMonthDaysSelected = selectedDates.length === MONTH_DAYS.length;
  const toggleAllMonthDays = () => {
    setSelectedDates(allMonthDaysSelected ? [] : [...MONTH_DAYS]);
  };

  const formatTimeForApi = (isoString: string | null): string | undefined => {
    if (!isoString) return undefined;
    const d = new Date(isoString);
    if (isNaN(d.getTime())) return undefined;
    const hours24 = d.getHours();
    const hours12 = hours24 % 12 || 12;
    const minutes = d.getMinutes().toString().padStart(2, '0');
    const ampm = hours24 >= 12 ? 'PM' : 'AM';
    return `${hours12.toString().padStart(2, '0')}:${minutes} ${ampm}`;
  };

  const handleSave = (values: FormValues): void => {
    const base = {
      description: values.description.trim(),
      frequency: values.frequency,
      time: formatTimeForApi(values.time),
      ...(isBusinessRole() ? { businessId: selectedBusinessId } : {}),
    };

    let extraFields: object = {};

    if (values.frequency === 'daily' || values.frequency === 'weekly') {
      extraFields = {
        startDate: values.startDate ?? undefined,
        endDate: values.endDate ?? undefined,
        selectedDays: selectedDays.length > 0 ? selectedDays : undefined,
      };
    } else if (values.frequency === 'monthly') {
      extraFields = {
        startDate: values.startDate ?? undefined,
        endDate: values.endDate ?? undefined,
        selectedDates: selectedDates.length > 0 ? selectedDates : undefined,
      };
    } else if (values.frequency === 'custom') {
      extraFields = {
        date: values.customDate ?? undefined,
      };
    }

    const payload = { ...base, ...extraFields };

    if (isEditMode && editBatchId) {
      // PUT /reminders/batch/{batchId} — replaces the whole series.
      dispatch(updateBatchReminderAsync({ batchId: editBatchId, data: payload as any }))
        .unwrap()
        .then(() => navigation.goBack())
        .catch(() => {
          /* error toast handled by the thunk */
        });
      return;
    }

    dispatch(addAdHocReminderAsync(payload as any));
  };

  return (
    <ScreenWrapper scrollable={false} showShadow={false}>
      <AuthHeader
        title={
          isEditMode
            ? t('add_ad_hoc_reminder.edit_title', { defaultValue: 'Edit Reminder Series' })
            : t('add_ad_hoc_reminder.title')
        }
        onBackPress={() => navigation.goBack()}
        containerStyle={{
          paddingHorizontal: 16,
          marginBottom: 0,
          paddingTop: isIOS ? 0 : 20,
        }}
        backButtonIconStyle={{ tintColor: themeColors.textPrimary }}
      />

      <Formik
        initialValues={
          editInitialValues ??
          // From the calendar: a one-time reminder on the day that was picked.
          (editParams.initialDate
            ? { ...initialValues, frequency: 'custom', customDate: editParams.initialDate, startDate: editParams.initialDate }
            : initialValues)
        }
        validationSchema={validationSchema('add_ad_hoc_reminder', { isEditMode })}
        onSubmit={handleSave}
        validateOnChange={true}
        validateOnBlur={true}
      >
        {(formik: FormikProps<FormValues>) => {
          const { values, errors, touched, setFieldValue, setFieldTouched, handleSubmit } = formik;
          const showDaySelector = values.frequency === 'daily' || values.frequency === 'weekly';
          const showDateRange = values.frequency !== 'custom';
          const monthlyDatesSummary = selectedDates.length > 0
            ? selectedDates.slice().sort((a, b) => a - b).join(', ')
            : null;

          return (
            <ScrollView
              style={styles.scrollView}
              contentContainerStyle={styles.scrollContent}
              showsVerticalScrollIndicator={false}
              keyboardShouldPersistTaps="handled"
            >
              {/* Description */}
              <View style={styles.inputWrapper}>
                <Text style={styles.inputLabel}>
                  {t('add_ad_hoc_reminder.description_label')}
                </Text>
                <CustomInput
                  placeholder={t('add_ad_hoc_reminder.description_placeholder')}
                  value={values.description}
                  onChangeText={(text: string) => setFieldValue('description', text)}
                  onBlur={() => setFieldTouched('description', true)}
                  containerStyle={styles.inputContainer}
                  inputContainerStyle={styles.customInputContainer}
                  multiline={true}
                  numberOfLines={4}
                  textAlignVertical="top"
                  inputStyle={styles.multilineInput}
                />
                {touched.description && errors.description ? (
                  <Text style={styles.errorText}>{errors.description}</Text>
                ) : null}
              </View>

              {/* Frequency Pills */}
              <View style={styles.inputWrapper}>
                <Text style={styles.inputLabel}>
                  {t('add_ad_hoc_reminder.when_reminded_label', { defaultValue: 'When Would You Like to Be Reminded?' })}
                </Text>
                <View style={styles.pillRow}>
                  {FREQUENCY_OPTIONS.map(opt => {
                    const isActive = values.frequency === opt.value;
                    return (
                      <TouchableOpacity
                        key={opt.value}
                        style={[
                          styles.pill,
                          isActive && { backgroundColor: themeColors.primary, borderColor: themeColors.primary },
                        ]}
                        onPress={() => {
                          setFieldValue('frequency', opt.value);
                          setFieldValue('startDate', null);
                          setFieldValue('endDate', null);
                          setFieldValue('customDate', null);
                        }}
                        activeOpacity={0.8}
                      >
                        <Text style={[styles.pillText, isActive && styles.pillTextActive]}>
                          {opt.label}
                        </Text>
                      </TouchableOpacity>
                    );
                  })}
                </View>
              </View>

              {/* Select Days (daily / weekly) */}
              {showDaySelector && (
                <View style={styles.inputWrapper}>
                  <Text style={styles.inputLabel}>
                    {t('add_ad_hoc_reminder.select_days_label', { defaultValue: 'Select Days' })}
                  </Text>
                  <View style={styles.daysGrid}>
                    {DAYS_OF_WEEK.map(day => {
                      const isActive = selectedDays.includes(day);
                      return (
                        <TouchableOpacity
                          key={day}
                          style={[
                            styles.dayPill,
                            isActive && { backgroundColor: themeColors.primary, borderColor: themeColors.primary },
                          ]}
                          onPress={() => toggleDay(day)}
                          activeOpacity={0.8}
                        >
                          <Text style={[styles.dayPillText, isActive && styles.pillTextActive]}>
                            {day.slice(0, 3)}
                          </Text>
                        </TouchableOpacity>
                      );
                    })}
                  </View>
                </View>
              )}

              {/* Monthly day-of-month picker */}
              {values.frequency === 'monthly' && (
                <View style={styles.inputWrapper}>
                  <Text style={styles.inputLabel}>
                    {t('add_ad_hoc_reminder.select_dates_label', { defaultValue: 'Select Days of Month' })}
                  </Text>
                  <TouchableOpacity
                    style={styles.monthlyTrigger}
                    onPress={() => setMonthlyModalVisible(true)}
                    activeOpacity={0.7}
                  >
                    <Text
                      style={[styles.monthlyTriggerText, !monthlyDatesSummary && styles.monthlyTriggerPlaceholder]}
                      numberOfLines={1}
                    >
                      {monthlyDatesSummary ?? 'Select days…'}
                    </Text>
                    <Feather name="chevron-down" size={18} color={themeColors.primary} />
                  </TouchableOpacity>

                  <Modal
                    visible={monthlyModalVisible}
                    transparent
                    animationType="fade"
                    onRequestClose={() => setMonthlyModalVisible(false)}
                  >
                    <View style={styles.monthlyModalWrapper}>
                      <TouchableOpacity
                        style={styles.monthlyModalOverlay}
                        activeOpacity={1}
                        onPress={() => setMonthlyModalVisible(false)}
                      />
                      <View style={styles.monthlyModalSheet}>
                        <View style={styles.monthlyModalHandle} />
                        <View style={styles.monthlyModalTitleRow}>
                          <Text style={styles.monthlyModalTitle}>
                            {t('add_ad_hoc_reminder.select_dates_label', { defaultValue: 'Select Days of Month' })}
                          </Text>
                          <TouchableOpacity onPress={toggleAllMonthDays} activeOpacity={0.7}>
                            <Text style={[styles.monthlySelectAllText, { color: themeColors.primary }]}>
                              {allMonthDaysSelected ? 'Deselect All' : 'Select All'}
                            </Text>
                          </TouchableOpacity>
                        </View>
                        <View style={styles.monthlyGrid}>
                          {MONTH_DAYS.map(day => {
                            const isActive = selectedDates.includes(day);
                            return (
                              <TouchableOpacity
                                key={day}
                                style={[
                                  styles.monthlyDayCell,
                                  isActive && [styles.monthlyDayCellActive, { backgroundColor: themeColors.primary }],
                                ]}
                                onPress={() => toggleMonthDay(day)}
                                activeOpacity={0.8}
                              >
                                <Text style={[styles.monthlyDayCellText, isActive && styles.monthlyDayCellTextActive]}>
                                  {day}
                                </Text>
                              </TouchableOpacity>
                            );
                          })}
                        </View>
                        <PrimaryButton
                          title="Done"
                          onPress={() => setMonthlyModalVisible(false)}
                          buttonStyle={[styles.monthlyModalDoneBtn, { backgroundColor: themeColors.primary }]}
                          textStyle={{ color: '#ffffff' }}
                        />
                      </View>
                    </View>
                  </Modal>
                </View>
              )}

              {/* Start / End Date (daily, weekly, monthly) */}
              {showDateRange && (
                <>
                  <View style={styles.inputWrapper}>
                    <Text style={styles.inputLabel}>
                      {t('add_ad_hoc_reminder.start_date_label', { defaultValue: 'Start Date' })}
                    </Text>
                    <CustomDateTimePicker
                      placeholder="MM/DD/YYYY"
                      value={values.startDate}
                      onChange={(val: any) => {
                        setFieldValue('startDate', val);
                        setFieldTouched('startDate', true);
                      }}
                      mode="date"
                      suffixIcon={
                        <FontAwesome6 name="calendar" size={20} color={themeColors.primary} />
                      }
                      containerStyle={styles.datePickerContainer}
                      displayFormat="MM/DD/YYYY"
                    />
                    {touched.startDate && errors.startDate ? (
                      <Text style={styles.errorText}>{errors.startDate as string}</Text>
                    ) : null}
                  </View>

                  <View style={styles.inputWrapper}>
                    <Text style={styles.inputLabel}>
                      {t('add_ad_hoc_reminder.end_date_label', { defaultValue: 'End Date' })}
                      {' '}
                      <Text style={styles.labelHint}>
                        {t('add_ad_hoc_reminder.end_date_optional_hint', {
                          defaultValue: '(Optional — leave blank to repeat recurring)',
                        })}
                      </Text>
                    </Text>
                    <CustomDateTimePicker
                      placeholder="MM/DD/YYYY"
                      value={values.endDate}
                      onChange={(val: any) => {
                        setFieldValue('endDate', val);
                        setFieldTouched('endDate', true);
                      }}
                      mode="date"
                      suffixIcon={
                        <FontAwesome6 name="calendar" size={20} color={themeColors.primary} />
                      }
                      containerStyle={styles.datePickerContainer}
                      displayFormat="MM/DD/YYYY"
                    />
                    {touched.endDate && errors.endDate ? (
                      <Text style={styles.errorText}>{errors.endDate as string}</Text>
                    ) : null}
                  </View>
                </>
              )}

              {/* Single Date (custom only) */}
              {values.frequency === 'custom' && (
                <View style={styles.inputWrapper}>
                  <Text style={styles.inputLabel}>
                    {t('add_ad_hoc_reminder.date_label')}
                  </Text>
                  <CustomDateTimePicker
                    placeholder={t('add_ad_hoc_reminder.date_placeholder')}
                    value={values.customDate}
                    onChange={(val: any) => {
                      setFieldValue('customDate', val);
                      setFieldTouched('customDate', true);
                    }}
                    mode="date"
                    suffixIcon={
                      <FontAwesome6 name="calendar" size={20} color={themeColors.primary} />
                    }
                    containerStyle={styles.datePickerContainer}
                    displayFormat="MM/DD/YYYY"
                  />
                  {touched.customDate && errors.customDate ? (
                    <Text style={styles.errorText}>{errors.customDate as string}</Text>
                  ) : null}
                </View>
              )}

              {/* Time (all frequencies) */}
              <View style={styles.inputWrapper}>
                <Text style={styles.inputLabel}>
                  {t('add_ad_hoc_reminder.select_time_label', { defaultValue: 'Select Time' })}
                </Text>
                <CustomDateTimePicker
                  placeholder="9:00 AM"
                  value={values.time}
                  onChange={(val: any) => setFieldValue('time', val)}
                  mode="time"
                  suffixIcon={
                    <Feather name="clock" size={20} color={themeColors.primary} />
                  }
                  containerStyle={styles.datePickerContainer}
                  displayFormat="hh:mm A"
                />
                {touched.time && errors.time ? (
                  <Text style={styles.errorText}>{errors.time as string}</Text>
                ) : null}
              </View>

              {/* Bottom Buttons */}
              <View style={styles.buttonContainer}>
                <PrimaryButton
                  title={t('add_ad_hoc_reminder.cancel_button')}
                  onPress={() => navigation.goBack()}
                  variant="outline"
                  buttonStyle={[
                    styles.cancelButton,
                    { borderColor: themeColors.primary },
                  ]}
                  textStyle={[
                    styles.cancelButtonText,
                    { color: themeColors.primary },
                  ]}
                />
                <PrimaryButton
                  title={t('add_ad_hoc_reminder.save_button')}
                  onPress={() => handleSubmit()}
                  disabled={isSubmitting}
                  loading={isSubmitting}
                  buttonStyle={[
                    styles.saveButton,
                    { backgroundColor: themeColors.primary },
                  ]}
                  textStyle={styles.saveButtonText}
                />
              </View>
            </ScrollView>
          );
        }}
      </Formik>
    </ScreenWrapper>
  );
};

export default AddAdHocReminder;
