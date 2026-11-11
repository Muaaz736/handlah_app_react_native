import React, { useState, useMemo } from 'react';
import { useUserRole } from '../../hooks/useUserRole';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  TouchableWithoutFeedback,
  KeyboardAvoidingView,
  Keyboard,
  Platform,
} from 'react-native';
import { useTranslation } from 'react-i18next';
import { useDispatch, useSelector } from 'react-redux';
import * as yup from 'yup';
import colors from '../../utils/colors';
import CustomInput from '../common/CustomInput';
import CustomDateTimePicker from '../common/CustomDateTimePicker';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import Feather from 'react-native-vector-icons/Feather';
import PrimaryButton from '../common/PrimaryButton';
import type { AddChildModalProps } from '../../types/addChildModal.types';
import { addChildAsync, getChildrenAsync } from '../../redux/services/essentialsService';
import { ASYNC_STATUS } from '../../config/constants';
import { AppDispatch } from '../../types/store.types';
import { makeAddChildModalStyles } from './AddChildModal.styles';
import { RoleTheme } from '../../types/roleManager.types';

const AddChildModal: React.FC<AddChildModalProps> = ({ visible, onClose, onAdd, isMyself = false }) => {
  const { t } = useTranslation();
  const dispatch = useDispatch<AppDispatch>();
  const [childName, setChildName] = useState<string>('');
  const [dob, setDob] = useState<Date | string | null>(null);
  const [endDate, setEndDate] = useState<Date | string | null>(null);
  const [errors, setErrors] = useState<{ name?: string; dob?: string; endDate?: string }>({});

  const { add_child_status } = useSelector((state: any) => state.essentials_slice);
  const { themeColors } = useUserRole();
  const styles = useMemo(() => makeAddChildModalStyles(themeColors as RoleTheme), [themeColors]);
  const isLoading = add_child_status === ASYNC_STATUS.LOADING;

  const getValidationSchema = () =>
    yup.object().shape({
      name: yup
        .string()
        .trim()
        .required(t('modals.name_required') || 'Child name is required'),
      dob: yup
        .date()
        .required(t('modals.dob_required') || 'Date of birth is required')
        .max(new Date(), t('modals.dob_not_future') || 'Date of birth cannot be in the future'),
      endDate: yup
        .date()
        .nullable()
        .optional()
        .test('end-after-dob', t('modals.end_date_after_dob') || 'End date must be after date of birth', function (value) {
          const { dob: dobVal } = this.parent;
          if (!value || !dobVal) return true;
          return new Date(value) > new Date(dobVal);
        }),
    });

  const handleAdd = async (): Promise<void> => {
    try {
      const dobDate = dob
        ? typeof dob === 'object' && dob !== null && 'toISOString' in dob
          ? (dob as Date)
          : new Date(dob as string)
        : undefined;

      await getValidationSchema().validate(
        { name: childName, dob: dobDate, endDate: endDate ? new Date(endDate as any) : undefined },
        { abortEarly: false },
      );

      // Clear errors on successful validation
      setErrors({});

      const dateOfBirthISO = dobDate!.toISOString();
      const endDateISO = endDate
        ? (typeof endDate === 'object' && endDate !== null && 'toISOString' in endDate
            ? (endDate as Date)
            : new Date(endDate as string)
          ).toISOString()
        : undefined;

      const childData: Record<string, any> = {
        name: childName,
        dateOfBirth: dateOfBirthISO,
        ...(endDateISO ? { endDate: endDateISO } : {}),
        ...(isMyself ? { isMyself: true } : {}),
      };

      dispatch(addChildAsync(childData as any)).then((action: any) => {
        if (action.type === addChildAsync.fulfilled.type) {
          if (onAdd) {
            onAdd({
              name: childName,
              dob: dob,
              endDate: endDate,
            });
          }
          dispatch(getChildrenAsync({}));
          setChildName('');
          setDob(null);
          setEndDate(null);
          setErrors({});
          onClose();
        }
      });
    } catch (err) {
      if (err instanceof yup.ValidationError) {
        const fieldErrors: { name?: string; dob?: string } = {};
        err.inner.forEach((e) => {
          if (e.path === 'name') {
            fieldErrors.name = e.message;
          }
          if (e.path === 'dob') {
            fieldErrors.dob = e.message;
          }
          if (e.path === 'endDate') {
            (fieldErrors as any).endDate = e.message;
          }
        });
        setErrors(fieldErrors);
      }
    }
  };

  const handleCancel = (): void => {
    setChildName('');
    setDob(null);
    setEndDate(null);
    setErrors({});
    onClose();
  };

  const handleDobChange = (date: Date | string): void => {
    setDob(date);
  };

  return (
    <Modal
      visible={visible}
      transparent={true}
      animationType="fade"
      onRequestClose={handleCancel}
    >
      <KeyboardAvoidingView
        style={styles.overlay}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        <TouchableWithoutFeedback onPress={Keyboard.dismiss} style={StyleSheet.absoluteFillObject}>
          <View style={StyleSheet.absoluteFillObject} />
        </TouchableWithoutFeedback>
        <View style={styles.modalContainer}>
              <Text style={styles.title}>{isMyself ? t('modals.add_myself') : t('modals.add_child')}</Text>

              <View style={styles.formContainer}>
                <CustomInput
                  label={`${isMyself ? t('modals.my_name') : t('modals.child_name')} *`}
                  placeholder={t('modals.name_placeholder')}
                  value={childName}
                  onChangeText={(text: string) => {
                    setChildName(text);
                    if (errors.name) { setErrors((prev) => ({ ...prev, name: undefined })); }
                  }}
                  containerStyle={styles.inputContainer}
                  error={errors.name}
                />

                <CustomDateTimePicker
                  label={`${t('common.dob')} *`}
                  placeholder={t('common.select')}
                  value={dob}
                  onChange={(date: Date | string) => {
                    handleDobChange(date);
                    if (errors.dob) { setErrors((prev) => ({ ...prev, dob: undefined })); }
                    // Clear endDate if it's now before or equal to new DOB
                    if (endDate) {
                      const newDob = new Date(new Date(date as any).setHours(0, 0, 0, 0));
                      const end = new Date(new Date(endDate as any).setHours(0, 0, 0, 0));
                      if (end <= newDob) { setEndDate(null); }
                    }
                  }}
                  mode="date"
                  displayFormat="MM/DD/YYYY"
                  maximumDate={new Date()}
                  error={errors.dob}
                  suffixIcon={
                    <MaterialCommunityIcons
                      name="calendar-blank-outline"
                      size={22}
                      color={themeColors.textPrimary}
                    />
                  }
                  containerStyle={styles.datePickerContainer}
                />

                <CustomDateTimePicker
                  label={t('health_tracker.dependent_end_date')}
                  placeholder={t('common.select')}
                  value={endDate}
                  onChange={(date: Date | string) => {
                    setEndDate(date);
                    if ((errors as any).endDate) { setErrors((prev) => ({ ...prev, endDate: undefined })); }
                  }}
                  mode="date"
                  displayFormat="MM/DD/YYYY"
                  minimumDate={dob ? new Date(new Date(dob as any).getTime() + 86400000) : undefined}
                  error={(errors as any).endDate}
                  suffixIcon={
                    <Feather name="calendar" size={20} color={themeColors.textPrimary} />
                  }
                  containerStyle={styles.datePickerContainer}
                />
              </View>

              <View style={styles.buttonContainer}>
                <PrimaryButton
                  title={t('common.cancel')}
                  onPress={() => { Keyboard.dismiss(); handleCancel(); }}
                  buttonStyle={{ flex: 1, paddingVertical: 14, width: 'auto' }}
                  variant="outline"
                  disabled={isLoading}
                />
                <PrimaryButton
                  title={t('common.add')}
                  onPress={() => { Keyboard.dismiss(); handleAdd(); }}
                  buttonStyle={{ flex: 1, paddingVertical: 14, width: 'auto' }}
                  loading={isLoading}
                  disabled={isLoading}
                />
              </View>
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
};

export default AddChildModal;
