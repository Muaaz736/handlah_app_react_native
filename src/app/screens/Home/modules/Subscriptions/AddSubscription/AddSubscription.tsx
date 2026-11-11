import React, { FC, useRef, useCallback, useMemo, useState } from 'react';
import { useRecordNotes } from '../../../../../../hooks/useRecordNotes';
import { RecordNotesEncryptRow } from '../../../../../../components/notes/RecordNotesField';
import {
  View,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  Text,
  TextInput
} from 'react-native';
import {
  AuthHeader,
  PrimaryButton,
  CustomInput,
  CustomDropDown,
  CustomDateTimePicker,
  CustomCheckbox,
  MixedMediaUploader
} from '../../../../../../components/common';
import { useTranslation } from 'react-i18next';
import { useUserRole } from '../../../../../../hooks/useUserRole';
import { useSelectedBusiness } from '../../../../../../hooks/useSelectedBusiness';
import { useDispatch, useSelector } from 'react-redux';
import { createSubscriptionAsync, updateSubscriptionAsync } from '../../../../../../redux/services/essentialsService';
import { ASYNC_STATUS } from '../../../../../../config/constants';
import { BillingOption, StatusOption } from './Subscriptions.types';
import { useFocusEffect, useNavigation, useRoute } from '@react-navigation/native';
import { Formik, FormikProps } from 'formik';
import validationSchema from '../../../../../../utils/validationSchemas';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { getDropdownOptionsAsync, getSubscriptionTypeOptionsAsync } from '../../../../../../redux/services/authService';
import { AppDispatch } from '../../../../../../types/store.types';
import { makeAddSubscriptionStyles } from './AddSubscription.styles';
import { RoleTheme } from '../../../../../../types/roleManager.types';
import { useRecordLinkSelection, saveLinksAfter } from '../../../../../../hooks/useRecordLinkSelection';
import { RecordLinksField } from '../../../../../../components/recordLinks/RecordLinksField';
import { RECORD_LINK_MODULE } from '../../../../../../constants/recordLinkModules';

/** The names the API stores; an older record's spelling is mapped to one of them. */
const normalizeBilling = (value?: string | null): string => {
  const v = (value ?? '').trim().toLowerCase().replace(/[\s-]/g, '');
  if (v === 'annually' || v === 'annual' || v === 'yearly') return 'Annually';
  if (v === 'quarterly') return 'Quarterly';
  if (v === 'onetime' || v === 'once') return 'One-time';
  return 'Monthly';
};

const toDate = (value: any): Date | undefined => {
  if (!value) return undefined;
  const d = new Date(value);
  return Number.isNaN(d.getTime()) ? undefined : d;
};

const toIso = (value: any): string | undefined => {
  if (!value) return undefined;
  if (value instanceof Date) return value.toISOString();
  try {
    return new Date(value).toISOString();
  } catch {
    return undefined;
  }
};

const ids = (value: any): string[] => (Array.isArray(value) ? value.filter(Boolean) : value ? [value] : []);

const AddSubscription: FC = (): React.ReactElement => {
  const { t } = useTranslation();
  const navigation = useNavigation();
  const route = useRoute();
  const { themeColors, isBusinessRole } = useUserRole();
  const { selectedBusinessId } = useSelectedBusiness();
  const styles = useMemo(() => makeAddSubscriptionStyles(themeColors as RoleTheme), [themeColors]);
  const dispatch = useDispatch<AppDispatch>();
  const formikRef = useRef<FormikProps<any> | null>(null);

  const isBusiness = isBusinessRole();
  const isEdit = (route?.params as any)?.isEdit || false;
  const existing = (route?.params as any)?.subscription || null;
  const ownerUserId = (route?.params as any)?.ownerUserId;
  const ownerBusinessId = (route?.params as any)?.ownerBusinessId;
  // "Select Records to Link" (as on the web): saved after the record itself.
  const links = useRecordLinkSelection({
      moduleKey: RECORD_LINK_MODULE.Subscription,
      recordId: isEdit && existing?.id ? Number(existing.id) : null,
      businessId: isBusinessRole() ? selectedBusinessId ?? null : null,
      enabled: !ownerUserId,
  });
  // Notes' "Encrypt notes" choice (the text is saved with the record); saved after the record, like its links.
  const recordNotes = useRecordNotes({ moduleKey: RECORD_LINK_MODULE.Subscription, recordId: isEdit && existing?.id ? Number(existing.id) : null, enabled: links.enabled, choiceOnly: true });

  // A business's subscription belongs to that business: the one picked in the app, or the owner's when adding to somebody's shared one.
  const businessId: number | undefined = ownerUserId ? ownerBusinessId : isBusiness ? selectedBusinessId ?? undefined : undefined;

  const [cardFront, setCardFront] = useState<string[]>(() => ids(existing?.cardfronturl));
  const [cardBack, setCardBack] = useState<string[]>(() => ids(existing?.cardbackurl));
  const [cardPdf, setCardPdf] = useState<string[]>(() => ids(existing?.cardpdfurl));
  const [barcodeImage, setBarcodeImage] = useState<string[]>(() => ids(existing?.barcodeimageurl));
  const [attachments, setAttachments] = useState<string[]>(() => ids(existing?.uploadattachments));

  const initialValues = {
    subscriptionName: existing?.subscriptionname || existing?.name || '',
    type: existing?.type || '',
    typeOther: existing?.typeother || '',
    provider: existing?.provider || '',
    memberName: existing?.membername || '',
    membershipNumber: existing?.membershipnumber || '',
    planTier: existing?.plantier || '',
    status: existing?.status || 'Active',
    websiteUrl: existing?.websiteurl || '',
    location: existing?.location || '',
    barcodeValue: existing?.barcodevalue || '',
    issuerAppLink: existing?.issuerapplink || '',
    username: isEdit ? (existing?.username || '') : '',
    password: isEdit ? (existing?.password || '') : '',
    cost: existing?.cost !== undefined && existing?.cost !== null ? String(existing.cost) : '',
    billingFrequency: normalizeBilling(existing?.billingfrequency || existing?.billingFrequency),
    nextRenewalDate: existing?.nextrenewaldate || existing?.renewalDate || '',
    nextPaymentDate: existing?.nextpaymentdate || '',
    autoRenew: existing?.autorenew === true,
    noExpiration: existing?.noexpiration === true,
    paymentMethod: existing?.paymentmethod || '',
    cancellationNotice: existing?.cancellationnotice || '',
    cancellationInstructions: existing?.cancellationinstructions || '',
    benefits: existing?.benefits || '',
    restrictions: existing?.restrictions || '',
    addToWallet: existing?.addtowallet === true,
    notes: existing?.notes || '',
    startDate: toDate(existing?.startdate),
    endDate: toDate(existing?.enddate),
  };

  const { create_subscription_status, update_subscription_status } = useSelector((state: any) => state.essentials_slice);
  const loading = create_subscription_status === ASYNC_STATUS.LOADING || update_subscription_status === ASYNC_STATUS.LOADING;

  const handleSave = async (values: any) => {
    const data: any = {
      subscriptionName: values.subscriptionName,
      type: values.type || undefined,
      typeOther: values.type === 'Other' ? values.typeOther || undefined : undefined,
      provider: values.provider || undefined,
      memberName: values.memberName || undefined,
      membershipNumber: values.membershipNumber || undefined,
      planTier: values.planTier || undefined,
      status: values.status || undefined,
      websiteUrl: values.websiteUrl || undefined,
      location: values.location || undefined,
      cardFrontUrl: cardFront[0] || undefined,
      cardBackUrl: cardBack[0] || undefined,
      cardPdfUrl: cardPdf[0] || undefined,
      barcodeValue: values.barcodeValue || undefined,
      barcodeImageUrl: barcodeImage[0] || undefined,
      issuerAppLink: values.issuerAppLink || undefined,
      username: values.username,
      password: values.password,
      cost: values.cost !== '' && values.cost !== null ? parseFloat(values.cost) : undefined,
      billingFrequency: values.billingFrequency || undefined,
      nextRenewalDate: toIso(values.nextRenewalDate),
      nextPaymentDate: toIso(values.nextPaymentDate),
      autoRenew: values.autoRenew,
      noExpiration: values.noExpiration,
      paymentMethod: values.paymentMethod || undefined,
      cancellationNotice: values.cancellationNotice || undefined,
      cancellationInstructions: values.cancellationInstructions || undefined,
      benefits: values.benefits || undefined,
      restrictions: values.restrictions || undefined,
      addToWallet: values.addToWallet,
      uploadAttachments: attachments.length ? attachments : undefined,
      notes: values.notes,
      startDate: toIso(values.startDate),
      endDate: values.noExpiration ? undefined : toIso(values.endDate),
    };

    if (isEdit && existing?.id) {
      // formVersion 2 = this form: the membership fields are saved exactly as sent (a cleared field is cleared).
      dispatch(updateSubscriptionAsync({ id: existing.id, data: { ...data, formVersion: 2 } } as any)).then((action: any) => {
        saveLinksAfter(links, action, existing.id, undefined, recordNotes);
        if (action.type === updateSubscriptionAsync.fulfilled.type) {
          navigation.goBack();
        }
      });
    } else {
      dispatch(
        createSubscriptionAsync({
          ...data,
          ...(ownerUserId ? { ownerUserId } : {}),
          ...(businessId ? { businessId } : {}),
        } as any),
      ).then((action: any) => {
        saveLinksAfter(links, action, undefined, undefined, recordNotes);
        if (action.type === createSubscriptionAsync.fulfilled.type) {
          navigation.goBack();
        }
      });
    }
  };

  const billingOptions: BillingOption[] = [
    { label: t('subscriptions.billing_options.one_time'), value: 'One-time' },
    { label: t('subscriptions.billing_options.monthly'), value: 'Monthly' },
    { label: t('subscriptions.billing_options.quarterly'), value: 'Quarterly' },
    { label: t('subscriptions.billing_options.yearly'), value: 'Annually' },
  ];

  const statusOptions: StatusOption[] = [
    { label: t('subscriptions.status_options.active'), value: 'Active' },
    { label: t('subscriptions.status_options.upcoming'), value: 'Upcoming' },
    { label: t('subscriptions.status_options.paused'), value: 'Paused' },
    { label: t('subscriptions.status_options.expired'), value: 'Expired' },
    { label: t('subscriptions.status_options.canceled'), value: 'Canceled' },
  ];

  const { get_dropdown_options_data, get_subscription_type_options_data } = useSelector((state: any) => state.user_auth);

  useFocusEffect(useCallback(() => {
    dispatch(getDropdownOptionsAsync('PaymentMethod'));
    dispatch(getSubscriptionTypeOptionsAsync());
  }, [dispatch]));

  const calendar = <Ionicons name="calendar-outline" size={20} color={themeColors.textSecondary} />;

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'android' ? 'height' : undefined}>
      <Formik
        innerRef={formikRef}
        initialValues={initialValues}
        validationSchema={validationSchema('subscription')}
        onSubmit={handleSave}
        validateOnChange={true}
        validateOnBlur={true}
        enableReinitialize={true}
      >
        {({ values, errors, touched, handleChange, setFieldValue, handleSubmit: formikHandleSubmit }) => (
          <>
            <ScrollView
              showsVerticalScrollIndicator={false}
              contentContainerStyle={styles.scrollContent}
              keyboardShouldPersistTaps="handled"
              automaticallyAdjustKeyboardInsets={true}
              keyboardDismissMode="interactive">
              <View style={styles.contentContainer}>
                <AuthHeader
                  title={isEdit ? t('subscriptions.edit_subscription') : t('subscriptions.add_subscription')}
                  subtitle={t('subscriptions.subtitle')}
                  onBackPress={() => navigation.goBack()}
                  backButtonIconStyle={{ tintColor: themeColors.textPrimary }}
                />

                <View style={styles.formContainer}>
                  {/* ---- Details ---- */}
                  <Text style={styles.sectionTitle}>{t('subscriptions.section_details')}</Text>

                  <CustomInput
                    label={`${t('subscriptions.subscription_name')} *`}
                    placeholder={t('subscriptions.subscription_name_placeholder')}
                    value={values.subscriptionName}
                    onChangeText={handleChange('subscriptionName')}
                    containerStyle={styles.inputWrapper}
                  />
                  {errors.subscriptionName && touched.subscriptionName && (
                    <Text style={styles.errorText}>{errors.subscriptionName as string}</Text>
                  )}

                  <View style={styles.inputWrapper}>
                    <Text style={[styles.inputLabel, { textAlign: 'left' }]}>{t('subscriptions.type')} *</Text>
                    <CustomDropDown
                      options={get_subscription_type_options_data}
                      value={values.type}
                      onSelect={value => setFieldValue('type', value)}
                      placeholder={t('subscriptions.type_placeholder')}
                      style={styles.dropdown}
                      search={true}
                      leftIcon={true}
                    />
                    {errors.type && touched.type && <Text style={styles.errorTextInline}>{errors.type as string}</Text>}
                  </View>

                  {values.type === 'Other' && (
                    <CustomInput
                      label={t('subscriptions.type_other')}
                      placeholder={t('subscriptions.type_other_placeholder')}
                      value={values.typeOther}
                      onChangeText={handleChange('typeOther')}
                      containerStyle={styles.inputWrapper}
                    />
                  )}

                  <CustomInput
                    label={`${t('subscriptions.provider')} *`}
                    placeholder={t('subscriptions.provider_placeholder')}
                    value={values.provider}
                    onChangeText={handleChange('provider')}
                    containerStyle={styles.inputWrapper}
                  />
                  {errors.provider && touched.provider && <Text style={styles.errorText}>{errors.provider as string}</Text>}

                  <CustomInput
                    label={t('subscriptions.member_name')}
                    placeholder={t('subscriptions.member_name_placeholder')}
                    value={values.memberName}
                    onChangeText={handleChange('memberName')}
                    containerStyle={styles.inputWrapper}
                  />

                  <CustomInput
                    label={t('subscriptions.membership_number')}
                    placeholder={t('subscriptions.membership_number_placeholder')}
                    value={values.membershipNumber}
                    onChangeText={handleChange('membershipNumber')}
                    autoCapitalize="characters"
                    containerStyle={styles.inputWrapper}
                  />

                  <CustomInput
                    label={t('subscriptions.plan_tier')}
                    placeholder={t('subscriptions.plan_tier_placeholder')}
                    value={values.planTier}
                    onChangeText={handleChange('planTier')}
                    containerStyle={styles.inputWrapper}
                  />

                  <View style={styles.inputWrapper}>
                    <Text style={[styles.inputLabel, { textAlign: 'left' }]}>{t('subscriptions.status')}</Text>
                    <CustomDropDown
                      options={statusOptions}
                      value={values.status}
                      onSelect={value => setFieldValue('status', value)}
                      placeholder={t('subscriptions.status_placeholder')}
                      style={styles.dropdown}
                      search={false}
                      leftIcon={true}
                    />
                  </View>

                  <CustomInput
                    label={t('subscriptions.website')}
                    placeholder="https://"
                    value={values.websiteUrl}
                    onChangeText={handleChange('websiteUrl')}
                    keyboardType="url"
                    autoCapitalize="none"
                    containerStyle={styles.inputWrapper}
                  />

                  <CustomInput
                    label={t('subscriptions.location')}
                    placeholder={t('subscriptions.location_placeholder')}
                    value={values.location}
                    onChangeText={handleChange('location')}
                    containerStyle={styles.inputWrapper}
                  />

                  {/* ---- Card, pass and barcode ---- */}
                  <Text style={styles.sectionTitle}>{t('subscriptions.section_card')}</Text>

                  <View style={styles.uploadSection}>
                    <Text style={[styles.inputLabel, { textAlign: 'left' }]}>{t('subscriptions.card_front')}</Text>
                    <MixedMediaUploader mediaIds={cardFront} onMediaChange={(v: any) => setCardFront(ids(v))} uploadType="box" maxItems={1} removable autoUpload />
                  </View>
                  <View style={styles.uploadSection}>
                    <Text style={[styles.inputLabel, { textAlign: 'left' }]}>{t('subscriptions.card_back')}</Text>
                    <MixedMediaUploader mediaIds={cardBack} onMediaChange={(v: any) => setCardBack(ids(v))} uploadType="box" maxItems={1} removable autoUpload />
                  </View>
                  <View style={styles.uploadSection}>
                    <Text style={[styles.inputLabel, { textAlign: 'left' }]}>{t('subscriptions.card_pdf')}</Text>
                    <MixedMediaUploader mediaIds={cardPdf} onMediaChange={(v: any) => setCardPdf(ids(v))} uploadType="box" maxItems={1} removable autoUpload />
                  </View>

                  <CustomInput
                    label={t('subscriptions.barcode_value')}
                    placeholder={t('subscriptions.barcode_value_placeholder')}
                    value={values.barcodeValue}
                    onChangeText={handleChange('barcodeValue')}
                    autoCapitalize="none"
                    containerStyle={styles.inputWrapper}
                  />
                  <View style={styles.uploadSection}>
                    <Text style={[styles.inputLabel, { textAlign: 'left' }]}>{t('subscriptions.barcode_image')}</Text>
                    <MixedMediaUploader mediaIds={barcodeImage} onMediaChange={(v: any) => setBarcodeImage(ids(v))} uploadType="box" maxItems={1} removable autoUpload />
                  </View>
                  <CustomInput
                    label={t('subscriptions.issuer_app_link')}
                    placeholder="https://"
                    value={values.issuerAppLink}
                    onChangeText={handleChange('issuerAppLink')}
                    keyboardType="url"
                    autoCapitalize="none"
                    containerStyle={styles.inputWrapper}
                  />
                  <Text style={[styles.hintText, { marginTop: -12, marginBottom: 20 }]}>{t('subscriptions.issuer_app_link_hint')}</Text>

                  {/* ---- Dates ---- */}
                  <Text style={styles.sectionTitle}>{t('subscriptions.section_dates')}</Text>

                  <View style={[styles.rowInputs, { marginBottom: 20 }]}>
                    <View style={styles.halfInput}>
                      <Text style={[styles.inputLabel, { textAlign: 'left' }]}>{t('subscriptions.start_date')}</Text>
                      <CustomDateTimePicker
                        value={values.startDate}
                        onChange={d => setFieldValue('startDate', d)}
                        placeholder={t('subscriptions.start_date')}
                        mode="date"
                        clearable
                        displayFormat="MM/DD/YYYY"
                        containerStyle={styles.dateInput}
                        suffixIcon={calendar}
                      />
                    </View>
                    <View style={styles.halfInput}>
                      <Text style={[styles.inputLabel, { textAlign: 'left' }]}>{t('subscriptions.expiration_date')}</Text>
                      <CustomDateTimePicker
                        value={values.noExpiration ? undefined : values.endDate}
                        onChange={d => setFieldValue('endDate', d)}
                        placeholder={t('subscriptions.expiration_date')}
                        mode="date"
                        clearable
                        displayFormat="MM/DD/YYYY"
                        containerStyle={styles.dateInput}
                        disabled={values.noExpiration}
                        suffixIcon={calendar}
                      />
                      {touched.endDate && errors.endDate && <Text style={styles.errorTextInline}>{errors.endDate as string}</Text>}
                    </View>
                  </View>

                  <View style={styles.checkRow}>
                    <CustomCheckbox
                      checked={values.noExpiration}
                      onPress={() => {
                        setFieldValue('noExpiration', !values.noExpiration);
                        if (!values.noExpiration) setFieldValue('endDate', undefined);
                      }}
                      label={t('subscriptions.no_expiration')}
                    />
                  </View>

                  <View style={styles.inputWrapper}>
                    <Text style={[styles.inputLabel, { textAlign: 'left' }]}>{t('subscriptions.renewal_date')}</Text>
                    <CustomDateTimePicker
                      value={values.nextRenewalDate}
                      onChange={date => setFieldValue('nextRenewalDate', date)}
                      placeholder={t('subscriptions.next_renewal_placeholder')}
                      mode="date"
                      clearable
                      displayFormat="MM/DD/YYYY"
                      containerStyle={styles.dateInput}
                      suffixIcon={calendar}
                    />
                    {errors.nextRenewalDate && touched.nextRenewalDate && (
                      <Text style={styles.errorTextInline}>{errors.nextRenewalDate as string}</Text>
                    )}
                  </View>

                  <View style={styles.checkRow}>
                    <CustomCheckbox
                      checked={values.autoRenew}
                      onPress={() => setFieldValue('autoRenew', !values.autoRenew)}
                      label={t('subscriptions.auto_renew')}
                    />
                  </View>

                  {/* ---- Cost and billing ---- */}
                  <Text style={styles.sectionTitle}>{t('subscriptions.section_billing')}</Text>

                  <View style={styles.rowInputs}>
                    <View style={styles.halfInput}>
                      <CustomInput
                        label={t('subscriptions.cost')}
                        placeholder={t('subscriptions.cost_placeholder')}
                        value={values.cost}
                        onChangeText={handleChange('cost')}
                        keyboardType="decimal-pad"
                      />
                    </View>
                    <View style={styles.halfInput}>
                      <Text style={[styles.inputLabel, { textAlign: 'left' }]}>{t('subscriptions.billing_frequency')}</Text>
                      <CustomDropDown
                        options={billingOptions}
                        value={values.billingFrequency}
                        onSelect={value => setFieldValue('billingFrequency', value)}
                        placeholder={t('subscriptions.billing_frequency_placeholder')}
                        style={styles.dropdown}
                        search={false}
                        leftIcon={true}
                      />
                    </View>
                  </View>
                  {errors.cost && touched.cost && <Text style={styles.errorTextInline}>{errors.cost as string}</Text>}
                  <Text style={[styles.hintText, { marginTop: -12, marginBottom: 20 }]}>{t('subscriptions.cost_free_hint')}</Text>

                  <View style={styles.inputWrapper}>
                    <Text style={[styles.inputLabel, { textAlign: 'left' }]}>{t('subscriptions.next_payment_date')}</Text>
                    <CustomDateTimePicker
                      value={values.nextPaymentDate}
                      onChange={date => setFieldValue('nextPaymentDate', date)}
                      placeholder={t('subscriptions.next_payment_date')}
                      mode="date"
                      clearable
                      displayFormat="MM/DD/YYYY"
                      containerStyle={styles.dateInput}
                      suffixIcon={calendar}
                    />
                  </View>

                  <View style={styles.inputWrapper}>
                    <Text style={[styles.inputLabel, { textAlign: 'left' }]}>{t('subscriptions.payment_method')}</Text>
                    <CustomDropDown
                      options={get_dropdown_options_data}
                      value={values.paymentMethod}
                      onSelect={value => setFieldValue('paymentMethod', value)}
                      placeholder={t('subscriptions.payment_method_placeholder')}
                      style={styles.dropdown}
                      search={true}
                      leftIcon={true}
                    />
                  </View>

                  {/* ---- Cancellation ---- */}
                  <Text style={styles.sectionTitle}>{t('subscriptions.section_cancellation')}</Text>

                  <CustomInput
                    label={t('subscriptions.cancellation_notice')}
                    placeholder={t('subscriptions.cancellation_notice_placeholder')}
                    value={values.cancellationNotice}
                    onChangeText={handleChange('cancellationNotice')}
                    containerStyle={styles.inputWrapper}
                  />
                  <View style={styles.inputWrapper}>
                    <Text style={[styles.inputLabel, { textAlign: 'left' }]}>{t('subscriptions.cancellation_instructions')}</Text>
                    <TextInput
                      value={values.cancellationInstructions}
                      onChangeText={handleChange('cancellationInstructions')}
                      placeholder={t('subscriptions.cancellation_instructions_placeholder')}
                      placeholderTextColor="#999999"
                      multiline
                      numberOfLines={3}
                      style={[styles.textArea]}
                    />
                  </View>

                  {/* ---- Benefits and terms ---- */}
                  <Text style={styles.sectionTitle}>{t('subscriptions.section_benefits')}</Text>

                  <View style={styles.inputWrapper}>
                    <Text style={[styles.inputLabel, { textAlign: 'left' }]}>{t('subscriptions.benefits')}</Text>
                    <TextInput
                      value={values.benefits}
                      onChangeText={handleChange('benefits')}
                      placeholder={t('subscriptions.benefits_placeholder')}
                      placeholderTextColor="#999999"
                      multiline
                      numberOfLines={3}
                      style={[styles.textArea]}
                    />
                  </View>
                  <View style={styles.inputWrapper}>
                    <Text style={[styles.inputLabel, { textAlign: 'left' }]}>{t('subscriptions.restrictions')}</Text>
                    <TextInput
                      value={values.restrictions}
                      onChangeText={handleChange('restrictions')}
                      placeholder={t('subscriptions.restrictions_placeholder')}
                      placeholderTextColor="#999999"
                      multiline
                      numberOfLines={3}
                      style={[styles.textArea]}
                    />
                  </View>

                  {/* ---- Account ---- */}
                  <Text style={styles.sectionTitle}>{t('subscriptions.section_account')}</Text>

                  <CustomInput
                    label={t('subscriptions.username_email')}
                    placeholder={t('subscriptions.username_placeholder')}
                    value={values.username}
                    onChangeText={handleChange('username')}
                    keyboardType="email-address"
                    autoCapitalize="none"
                    containerStyle={styles.inputWrapper}
                  />
                  {errors.username && touched.username && <Text style={styles.errorText}>{errors.username as string}</Text>}

                  <CustomInput
                    label={t('subscriptions.password')}
                    placeholder={t('subscriptions.password_placeholder')}
                    value={values.password}
                    onChangeText={handleChange('password')}
                    password={true}
                    containerStyle={styles.inputWrapper}
                  />
                  {errors.password && touched.password && <Text style={styles.errorText}>{errors.password as string}</Text>}

                  {/* ---- More ---- */}
                  <Text style={styles.sectionTitle}>{t('subscriptions.section_more')}</Text>

                  <View style={styles.checkRow}>
                    <CustomCheckbox
                      checked={values.addToWallet}
                      onPress={() => setFieldValue('addToWallet', !values.addToWallet)}
                      label={t('subscriptions.add_to_wallet')}
                    />
                  </View>

                  <View style={styles.uploadSection}>
                    <Text style={[styles.inputLabel, { textAlign: 'left' }]}>{t('subscriptions.attachments')}</Text>
                    <MixedMediaUploader mediaIds={attachments} onMediaChange={(v: any) => setAttachments(ids(v))} uploadType="box" maxItems={5} removable autoUpload />
                  </View>

                  <View style={styles.inputWrapper}>
                    <Text style={[styles.inputLabel, { textAlign: 'left' }]}>{t('subscriptions.notes_comments')}</Text>
                    <TextInput
                      value={values.notes}
                      onChangeText={handleChange('notes')}
                      placeholder={t('subscriptions.notes_placeholder')}
                      placeholderTextColor="#999999"
                      multiline
                      numberOfLines={4}
                      style={[styles.textArea]}
                    />
                    {errors.notes && touched.notes && <Text style={styles.errorTextInline}>{errors.notes as string}</Text>}
                  </View>
                </View>
                <RecordNotesEncryptRow notes={recordNotes} />
                <RecordLinksField links={links} />
              </View>
            </ScrollView>

            {/* Footer */}
            <View style={styles.footerContainer}>
              <PrimaryButton
                title={isEdit ? t('subscriptions.save_changes') : t('subscriptions.add_subscription')}
                onPress={formikHandleSubmit}
                loading={loading}
                disabled={loading}
                buttonStyle={{ borderRadius: 45, backgroundColor: themeColors.primary }}
              />
            </View>
          </>
        )}
      </Formik>
    </KeyboardAvoidingView>
  );
};

export default AddSubscription;
