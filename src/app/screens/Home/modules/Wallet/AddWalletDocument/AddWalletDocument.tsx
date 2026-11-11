import React, { useState, useCallback, useMemo } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { useTranslation } from 'react-i18next';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { CustomInput, CustomDropDown, CustomDateTimePicker, PrimaryButton } from '../../../../../../components/common';
import { useUserRole } from '../../../../../../hooks/useUserRole';
import { FormData, DropdownOption, RouteParams, DocumentData } from './AddWalletDocument.types';
import { makeAddWalletDocumentStyles } from './AddWalletDocument.styles';

const AddWalletDocument = (): React.ReactElement => {
  const { t, i18n } = useTranslation();
  const isRTL = i18n.language === 'ar';
  const { themeColors } = useUserRole();
  const styles = useMemo(() => makeAddWalletDocumentStyles(themeColors), [themeColors]);
  const navigation = useNavigation();
  const route = useRoute<RouteProp<{ params: RouteParams }, 'params'>>();
  
  const isEdit = route?.params?.isEdit || false;
  const existingDoc = route?.params?.document || null;

  const [documentType, setDocumentType] = useState<string>('');
  const [licenseNumber, setLicenseNumber] = useState<string>(existingDoc?.licenseNumber || '');
  const [state, setState] = useState<string>(existingDoc?.state || '');
  const [expirationDate, setExpirationDate] = useState<string>(existingDoc?.expirationDate || '');
  const [documentClass, setDocumentClass] = useState<string>(existingDoc?.documentClass || '');
  const [passportNumber, setPassportNumber] = useState<string>(existingDoc?.passportNumber || '');
  const [country, setCountry] = useState<string>(existingDoc?.country || '');
  const [type, setType] = useState<string>(existingDoc?.type || '');

  const documentTypeOptions: DropdownOption[] = [
    { label: t('wallet.driving_license'), value: 'Driving License' },
    { label: t('wallet.passport'), value: 'Passport' },
    { label: t('wallet.id_card'), value: 'ID Card' },
    { label: t('wallet.insurance_card'), value: 'Insurance Card' },
  ];

  const stateOptions: DropdownOption[] = [
    { label: 'Washington', value: 'Washington' },
    { label: 'California', value: 'California' },
    { label: 'New York', value: 'New York' },
    { label: 'Texas', value: 'Texas' },
  ];

  const classOptions: DropdownOption[] = [
    { label: 'D', value: 'D' },
    { label: 'C', value: 'C' },
    { label: 'B', value: 'B' },
    { label: 'A', value: 'A' },
  ];

  const handleUpload = useCallback((): void => {
  }, []);

  const handleContinue = useCallback((): void => {
    const documentData: FormData = {
      documentType,
      licenseNumber,
      state,
      expirationDate,
      documentClass,
      passportNumber,
      country,
      type
    };
    navigation.goBack();
  }, [documentType, licenseNumber, state, expirationDate, documentClass, passportNumber, country, type, navigation]);

  const renderDrivingLicenseFields = useCallback((): React.ReactElement => (
    <>
      {/* License Number and State Row */}
      <View style={styles.datesRow}>
        <View style={styles.dateGroup}>
          <CustomInput
            value={licenseNumber}
            onChangeText={(text: string) => setLicenseNumber(text)}
            placeholder={t('common.document_number_placeholder')}
            label={t('wallet.license_number')}
            labelStyle={{ textAlign: isRTL ? 'right' : 'left' }}
            inputStyle={{ textAlign: isRTL ? 'right' : 'left' }}
          />
        </View>
        <View style={styles.dateGroup}>
          <Text style={[styles.label, { textAlign: isRTL ? 'right' : 'left' }]}>
            {t('wallet.state')}
          </Text>
          <CustomDropDown
            options={stateOptions}
            value={state}
            onSelect={(selectedValue: any) => setState(selectedValue)}
            placeholder={t('common.washington_placeholder')}
            search={false}
            leftIcon={true}
          />
        </View>
      </View>

      {/* Expiration Date and Class Row */}
      <View style={styles.datesRow}>
        <View style={styles.dateGroup}>
          <Text style={[styles.label, { textAlign: isRTL ? 'right' : 'left' }]}>
            {t('wallet.expiration_date')}
          </Text>
          <CustomDateTimePicker
            value={expirationDate}
            onChange={(date: any) => setExpirationDate(date)}
            placeholder={t('common.select')}
            displayFormat="MM/DD/YYYY"
          />
        </View>
        <View style={styles.dateGroup}>
          <Text style={[styles.label, { textAlign: isRTL ? 'right' : 'left' }]}>
            {t('wallet.class')}
          </Text>
          <CustomDropDown
            options={classOptions}
            value={documentClass}
            onSelect={(selectedValue: any) => setDocumentClass(selectedValue)}
            placeholder={t('common.class_placeholder')}
            search={false}
            leftIcon={true}
          />
        </View>
      </View>
    </>
  ), [licenseNumber, state, expirationDate, documentClass, isRTL, stateOptions, classOptions, t]);

  const renderPassportFields = useCallback((): React.ReactElement => (
    <>
      {/* Passport Number and Country Row */}
      <View style={styles.datesRow}>
        <View style={styles.dateGroup}>
          <CustomInput
            value={passportNumber}
            onChangeText={(text: string) => setPassportNumber(text)}
            placeholder={t('common.document_number_placeholder')}
            label={t('wallet.passport_number')}
            labelStyle={{ textAlign: isRTL ? 'right' : 'left' }}
            inputStyle={{ textAlign: isRTL ? 'right' : 'left' }}
          />
        </View>
        <View style={styles.dateGroup}>
          <Text style={[styles.label, { textAlign: isRTL ? 'right' : 'left' }]}>
            {t('wallet.country')}
          </Text>
          <CustomDropDown
            options={stateOptions}
            value={country}
            onSelect={(selectedValue: any) => setCountry(selectedValue)}
            placeholder={t('common.washington_placeholder')}
            search={false}
            leftIcon={true}
          />
        </View>
      </View>

      {/* Expiration Date and Type Row */}
      <View style={styles.datesRow}>
        <View style={styles.dateGroup}>
          <Text style={[styles.label, { textAlign: isRTL ? 'right' : 'left' }]}>
            {t('wallet.expiration_date')}
          </Text>
          <CustomDateTimePicker
            value={expirationDate}
            onChange={(date: any) => setExpirationDate(date)}
            placeholder={t('common.select')}
            displayFormat="MM/DD/YYYY"
          />
        </View>
        <View style={styles.dateGroup}>
          <Text style={[styles.label, { textAlign: isRTL ? 'right' : 'left' }]}>
            {t('wallet.type')}
          </Text>
          <CustomDropDown
            options={classOptions}
            value={type}
            onSelect={(selectedValue: any) => setType(selectedValue)}
            placeholder={t('common.class_placeholder')}
            search={false}
            leftIcon={true}
          />
        </View>
      </View>
    </>
  ), [passportNumber, country, expirationDate, type, isRTL, stateOptions, classOptions, t]);

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          style={[styles.backButton, { borderColor: themeColors.secondary }]}
          onPress={() => navigation.goBack()}
        >
          <Ionicons name="chevron-back" size={24} color={themeColors.secondary} />
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.scrollView} contentContainerStyle={styles.scrollContent}>
        {/* Document Type Dropdown */}
        <View style={styles.inputGroup}>
          <Text style={[styles.label, { textAlign: isRTL ? 'right' : 'left' }]}>
            {t('wallet.document_type')} *
          </Text>
          <CustomDropDown
            options={documentTypeOptions}
            value={documentType}
            onSelect={(selectedValue: any) => setDocumentType(selectedValue)}
            placeholder={t('wallet.select_document_type')}
            search={false}
            leftIcon={true}
          />
        </View>

        {documentType === 'Driving License' && renderDrivingLicenseFields()}
        {documentType === 'Passport' && renderPassportFields()}

        {/* Upload Section */}
        <View style={styles.uploadSection}>
          <Text style={[styles.label, { textAlign: isRTL ? 'right' : 'left' }]}>
            {t('wallet.upload_document')}
          </Text>
          <TouchableOpacity
            style={[styles.uploadBox, { borderColor: themeColors.secondary }]}
            onPress={handleUpload}
          >
            <Ionicons name="cloud-upload-outline" size={32} color={themeColors.secondary} />
            <Text
              style={[styles.uploadText, { textAlign: isRTL ? 'right' : 'left', color: themeColors.secondary }]}
            >
              {t('common.upload')}
            </Text>
          </TouchableOpacity>
        </View>
      </ScrollView>

      {/* Footer Button */}
      <View style={styles.footer}>
        <PrimaryButton
          title={t('common.continue')}
          onPress={handleContinue}
          buttonStyle={{ backgroundColor: themeColors.primary }}
        />
      </View>
    </SafeAreaView>
  );
};

export default AddWalletDocument;
