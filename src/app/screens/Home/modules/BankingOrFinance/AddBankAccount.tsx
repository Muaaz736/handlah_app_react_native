import {
    ScrollView,
    Text,
    View,
    TouchableOpacity,
    TextInput,
    KeyboardAvoidingView,
    Platform,
} from 'react-native';
import React, { useState, useCallback, useEffect, useMemo } from 'react';
import { SafeAreaView } from 'react-native-safe-area-context';
import {
    AuthHeader,
    CustomInput,
    PrimaryButton,
    CustomCheckbox,
    CustomDateTimePicker,
    CustomDropDown,
    MixedMediaUploader,
} from '../../../../../components/common';
import { useFocusEffect, useNavigation, useRoute } from '@react-navigation/native';
import colors, { getColorWithOpacity } from '../../../../../utils/colors';
import { useTranslation } from 'react-i18next';
import Feather from 'react-native-vector-icons/Feather';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { useUserRole } from '../../../../../hooks/useUserRole';
import { useSelectedBusiness } from '../../../../../hooks/useSelectedBusiness';
import { isIOS } from '../../../../../utils/helpers';
import { useDispatch, useSelector } from 'react-redux';
import { addBankAccountAsync, updateBankAccountAsync } from '../../../../../redux/services/assetsService';
import { ASYNC_STATUS } from '../../../../../config/constants';
import { showSuccessAlert } from '../../../../../utils/AlertHelper';
import {
    PlannedPayment,
} from './bankingOrFinance.types';
import { Formik, FormikProps } from 'formik';
import validationSchema from '../../../../../utils/validationSchemas';
import { setGetBankAccountStatus } from '../../../../../redux/slices/assetsSlice';
import { getDropdownOptionsAsync } from '../../../../../redux/services/authService';
import { AppDispatch } from '../../../../../types/store.types';
import { makeCommonStyles } from './BankingFinance.styles';
import { makeAddBankAccountStyles } from './AddBankAccount.styles';
import { RoleTheme } from '../../../../../types/roleManager.types';
import { darkenColor } from '../../../../../utils/roleManager';
import { VendorAutocompleteInput } from '../../../../../components/common';
import { AccountCategoryTag } from '../../../../../components/finance/NetWorthSummary';
import { optionAccountCategory, sortAccountTypeOptions } from '../../../../../utils/financeAccounts';
import { useRecordLinkSelection, saveLinksAfter } from '../../../../../hooks/useRecordLinkSelection';
import { RecordLinksField } from '../../../../../components/recordLinks/RecordLinksField';
import { RECORD_LINK_MODULE } from '../../../../../constants/recordLinkModules';

/** One account type in the Type list: its name and whether it counts as an asset or a liability. */
const typeOptionStyle = { flexDirection: 'row' as const, alignItems: 'center' as const, gap: 8, paddingHorizontal: 16, paddingVertical: 12 };


const AddBankAccount = () => {
    const navigation = useNavigation();
    const route = useRoute();
    const { t, i18n } = useTranslation();
    const { themeColors, userRole, isBusinessRole } = useUserRole();
    const commonStyles = useMemo(() => makeCommonStyles(themeColors as RoleTheme), [themeColors]);
    const styles = useMemo(() => makeAddBankAccountStyles(themeColors as RoleTheme), [themeColors]);
    const { selectedBusinessId } = useSelectedBusiness();
    const isBusiness = isBusinessRole();
    const dispatch = useDispatch<AppDispatch>();

    // Get route params for edit mode
    const { account, isEdit, ownerUserId } = (route?.params as any) || {};
    const links = useRecordLinkSelection({
        moduleKey: RECORD_LINK_MODULE.BankAccount,
        recordId: isEdit && account?.id ? Number(account.id) : null,
        businessId: isBusinessRole() ? selectedBusinessId ?? null : null,
        enabled: !ownerUserId,
    });

    const { add_bank_account_status, update_bank_account_status } = useSelector((state: any) => state.assets_slice);

    const formikRef = React.useRef<FormikProps<{
        institution: string;
        accountName: string;
        type: any;
        lastFourDigits: string;
        currentBalance: string;
        aprPercentage: string;
        dueDay: string;
        minDue: string;
        startDate?: Date;
        endDate?: Date;
    }>>(null);

    const formikInitialValues = {
        institution: account?.institution || '',
        accountName: account?.accountname || '',
        type: account?.type !== undefined ? account.type : '',
        lastFourDigits: account?.last4digits || '',
        currentBalance: account?.currentbalance?.toString() || '',
        aprPercentage: account?.apr?.toString() || '',
        dueDay: account?.dueday?.toString() || '',
        minDue: account?.mindue?.toString() || '',
        memo: account?.memo || '',
        startDate: account?.startdate ? new Date(account.startdate) : account?.startDate ? new Date(account.startDate) : undefined as Date | undefined,
        endDate: account?.enddate ? new Date(account.enddate) : account?.endDate ? new Date(account.endDate) : undefined as Date | undefined,
    };
    const [notes, setNotes] = useState<string>(account?.memo || '');
    const [autopay, setAutopay] = useState<boolean>(account?.autopay || false);
    const [addToWallet, setAddToWallet] = useState<boolean>(account?.addtowallet || false);


    const [plannedPayments, setPlannedPayments] = useState<PlannedPayment[]>(
        account?.plannedpayments && account.plannedpayments.length > 0
            ? account.plannedpayments.map((p: any) => ({
                dueDate: p.duedate || '',
                amount: p.amount?.toString() || '',
                description: p.description || ''
            }))
            : []
    );
    const resolveInitialAttachmentIds = (): string[] => {
        if (!account?.attachmenturl) return [];
        if (Array.isArray(account.attachmenturl)) return account.attachmenturl;
        return [account.attachmenturl];
    };
    const [attachmentIds, setAttachmentIds] = useState<string[]>(resolveInitialAttachmentIds);

    const { get_dropdown_options_data } = useSelector((state: any) => state.user_auth);

    useFocusEffect(useCallback(() => {
        dispatch(getDropdownOptionsAsync('BankAccountType'));
    }, [dispatch]));

    const handleAddMore = useCallback(() => {
        setPlannedPayments((prev: any) => [...prev, { dueDate: '', amount: '', description: '' }]);
    }, []);

    const handlePaymentChange = useCallback((index: number, field: keyof PlannedPayment, value: any) => {
        setPlannedPayments(prev => {
            const updated: any = [...prev];
            // Convert Date objects to ISO string for proper storage
            if (field === 'dueDate' && value instanceof Date) {
                updated[index][field] = value.toISOString();
            } else {
                updated[index][field] = value;
            }
            return updated;
        });
    }, []);

    const handleRemovePayment = useCallback((index: number) => {
        setPlannedPayments((prev: any) => prev.filter((_: any, i: number) => i !== index));
    }, []);

    const handleAddAccount = useCallback(async (formValues: {
        institution: string;
        accountName: string;
        type: any;
        lastFourDigits: string;
        currentBalance: string;
        aprPercentage: string;
        dueDay: string;
        minDue: string;
        startDate?: Date;
        endDate?: Date;
    }) => {
        const { institution, accountName, type, lastFourDigits, currentBalance, aprPercentage, dueDay, minDue } = formValues;

        // Format planned payments - convert dates to ISO and ensure proper structure
        const formattedPlannedPayments = plannedPayments
            .filter(payment => payment.dueDate && payment.amount) // Only include payments with both fields
            .map(payment => ({
                dueDate: payment.dueDate instanceof Date
                    ? payment.dueDate.toISOString()
                    : new Date(payment.dueDate as any).toISOString(),
                amount: parseFloat(payment.amount) || 0,
                description: payment.description || '',
            }));

        // Prepare API data matching the backend structure
        const apiData: any = {
            institution,
            accountName,
            type: type, // Type is already a number from dropdown
            currentBalance: parseFloat(currentBalance) || 0,
            last4Digits: lastFourDigits,
            apr: parseFloat(aprPercentage) || 0,
            dueDay: parseInt(dueDay),
            minDue: parseFloat(minDue) || 0,
            autopay,
            addToWallet,
            attachmentUrl: attachmentIds,
            memo: notes || '',
            plannedPayments: formattedPlannedPayments,
            startDate: formValues.startDate instanceof Date ? formValues.startDate.toISOString() : formValues.startDate || undefined,
            endDate: formValues.endDate instanceof Date ? formValues.endDate.toISOString() : formValues.endDate || undefined,
            ...(isBusiness && selectedBusinessId && { businessId: selectedBusinessId }),
        };

        if (isEdit && account?.id) {
            // Update existing account
            dispatch(updateBankAccountAsync({ id: account.id, data: apiData })).then((a: any) => saveLinksAfter(links, a, account.id))
        } else {
            // Add new account
            dispatch(addBankAccountAsync({ ...apiData, ...(ownerUserId ? { ownerUserId } : {}) } as any)).then((a: any) => saveLinksAfter(links, a))
        }
    }, [
        links,
        notes,
        autopay,
        addToWallet,
        plannedPayments,
        attachmentIds,
        dispatch,
        navigation,
        t,
        isEdit,
        account,
    ]);

    const isLoading: boolean = add_bank_account_status === ASYNC_STATUS.LOADING || update_bank_account_status === ASYNC_STATUS.LOADING;

    // Reset stale statuses on mount to prevent showing old success alerts
    useEffect(() => {
        dispatch(setGetBankAccountStatus());
    }, []);

    useEffect(() => {
        if (add_bank_account_status === ASYNC_STATUS.SUCCEEDED) {
            dispatch(setGetBankAccountStatus());
            showSuccessAlert(
                t('banking_finance.account_added_success') || 'Bank account added successfully',
                'Success',
            );
            navigation.goBack();
        }
    }, [add_bank_account_status]);

    useEffect(() => {
        if (update_bank_account_status === ASYNC_STATUS.SUCCEEDED) {
            dispatch(setGetBankAccountStatus());
            showSuccessAlert(
                t('banking_finance.account_updated_success') || 'Bank account updated successfully',
                'Success',
            );
            navigation.goBack();
        }
    }, [update_bank_account_status]);

    return (
        <View style={styles.container}>
            <SafeAreaView style={styles.safeArea}>
                <AuthHeader
                    title={isEdit ? t('banking_finance.edit_account') : t('banking_finance.add_account')}
                    onBackPress={() => navigation.goBack()}
                    containerStyle={[commonStyles.headerContainerStyle, { paddingTop: isIOS ? 0 : 20 }]}
                    backButtonStyle={{ marginBottom: 0 }}
                    titleStyle={styles.headerTitleStyle}
                    backButtonIconStyle={{ tintColor: themeColors.textPrimary }}
                />
                <KeyboardAvoidingView
                    style={styles.container}
                    behavior={Platform.OS === 'android' ? 'height' : undefined}
                >
                    <ScrollView
                        style={commonStyles.scrollView}
                        contentContainerStyle={styles.scrollContent}
                        showsVerticalScrollIndicator={false}
                        keyboardShouldPersistTaps="handled"
                        automaticallyAdjustKeyboardInsets={true}
                        keyboardDismissMode="interactive"
                    >
                        <Formik
                            innerRef={formikRef}
                            initialValues={formikInitialValues}
                            validationSchema={validationSchema('bank_account')}
                            onSubmit={handleAddAccount}
                        >
                            {({ handleChange, handleSubmit, values, setFieldValue, touched, errors }) => (
                                <View style={styles.formContainer}>
                                    {/* Institution and Account Name Row */}
                                    <View style={styles.rowContainer}>
                                        <View style={styles.halfInput}>
                                            <Text style={styles.label}>
                                                {t('banking_finance.institution')} *
                                            </Text>
                                            <VendorAutocompleteInput category="banking_institution"
                                                placeholder={t('banking_finance.institution_placeholder') || 'E.g Chase...'}
                                                value={values.institution}
                                                onChangeText={handleChange('institution')}
                                                containerStyle={styles.inputContainerNoMargin}
                                                error={touched.institution && errors.institution ? String(errors.institution) : undefined}
                                            />
                                        </View>
                                        <View style={styles.halfInput}>
                                            <Text style={styles.label}>
                                                {t('banking_finance.account_name')} *
                                            </Text>
                                            <CustomInput
                                                placeholder={t('banking_finance.account_name_placeholder') || 'Kevin Josh'}
                                                value={values.accountName}
                                                onChangeText={handleChange('accountName')}
                                                containerStyle={styles.inputContainerNoMargin}
                                                error={touched.accountName && errors.accountName ? String(errors.accountName) : undefined}
                                            />
                                        </View>
                                    </View>

                                    {/* Type and Last 4 Digits Row */}
                                    <View style={styles.rowContainer}>
                                        <View style={styles.halfInput}>
                                            <Text style={styles.label}>{t('banking_finance.type')} *</Text>
                                            <CustomDropDown
                                                options={sortAccountTypeOptions(get_dropdown_options_data) as any}
                                                renderItem={(item: any) => (
                                                    <View style={typeOptionStyle}>
                                                        <Text style={[styles.label, { marginBottom: 0, flex: 1 }]} numberOfLines={1}>{item.label}</Text>
                                                        <AccountCategoryTag category={optionAccountCategory(item)} />
                                                    </View>
                                                )}
                                                value={values.type as any}
                                                onSelect={(val: any) => setFieldValue('type', val)}
                                                placeholder={t('common.select')}
                                                search={true}
                                                leftIcon={true}
                                                error={touched.type && errors.type ? true : false}
                                            />
                                            {touched.type && errors.type && <Text style={styles.errorText}>{String(errors.type)}</Text>}
                                        </View>
                                        <View style={styles.halfInput}>
                                            <Text style={styles.label}>
                                                {t('banking_finance.last_4_digits')}
                                            </Text>
                                            <CustomInput
                                                placeholder={t('banking_finance.last_4_digits_placeholder') || '1234'}
                                                value={values.lastFourDigits}
                                                onChangeText={(text) => {
                                                    // Only allow numeric characters and max 4 digits
                                                    const numericText = text.replace(/[^0-9]/g, '');
                                                    if (numericText.length <= 4) {
                                                        setFieldValue('lastFourDigits', numericText);
                                                    }
                                                }}
                                                containerStyle={styles.inputContainerNoMargin}
                                                keyboardType="numeric"
                                                maxLength={4}
                                                error={touched.lastFourDigits && errors.lastFourDigits ? String(errors.lastFourDigits) : undefined}
                                            />
                                        </View>
                                    </View>

                                    {/* Current Balance and APR% Row */}
                                    <View style={styles.rowContainer}>
                                        <View style={styles.halfInput}>
                                            <Text style={styles.label}>
                                                {t('banking_finance.current_balance')}
                                            </Text>
                                            <CustomInput
                                                placeholder="0.00"
                                                value={values.currentBalance}
                                                onChangeText={(text) => {
                                                    // Only allow numbers and one decimal point
                                                    const validText = text.replace(/[^0-9.]/g, '');
                                                    // Prevent multiple decimal points
                                                    const parts = validText.split('.');
                                                    if (parts.length <= 2) {
                                                        setFieldValue('currentBalance', validText);
                                                    }
                                                }}
                                                containerStyle={styles.inputContainerNoMargin}
                                                keyboardType="decimal-pad"
                                                error={touched.currentBalance && errors.currentBalance ? String(errors.currentBalance) : undefined}
                                            />
                                        </View>
                                        <View style={styles.halfInput}>
                                            <Text style={styles.label}>
                                                {t('banking_finance.apr_percentage')}
                                            </Text>
                                            <CustomInput
                                                placeholder="0.00"
                                                value={values.aprPercentage}
                                                onChangeText={(text) => {
                                                    // Only allow numbers and one decimal point
                                                    const validText = text.replace(/[^0-9.]/g, '');
                                                    // Prevent multiple decimal points
                                                    const parts = validText.split('.');
                                                    if (parts.length <= 2) {
                                                        const numValue = parseFloat(validText);
                                                        // Only set if value is 100 or less, or if it's empty/incomplete
                                                        if (validText === '' || validText === '.' || isNaN(numValue) || numValue <= 100) {
                                                            setFieldValue('aprPercentage', validText);
                                                        }
                                                    }
                                                }}
                                                containerStyle={styles.inputContainerNoMargin}
                                                keyboardType="decimal-pad"
                                                error={touched.aprPercentage && errors.aprPercentage ? String(errors.aprPercentage) : undefined}
                                            />
                                        </View>
                                    </View>

                                    {/* Due day and Min Due Row */}
                                    <View style={styles.rowContainer}>
                                        <View style={styles.halfInput}>
                                            <Text style={styles.label}>{t('banking_finance.due_day')}</Text>
                                            <CustomInput
                                                placeholder={t('banking_finance.due_day_placeholder') || '1-31'}
                                                value={values.dueDay}
                                                onChangeText={(text) => {
                                                    // Only allow numeric characters
                                                    const numericText = text.replace(/[^0-9]/g, '');
                                                    const numValue = parseInt(numericText);
                                                    // Only set if value is 31 or less, or if it's empty
                                                    if (numericText === '' || (numValue >= 1 && numValue <= 31)) {
                                                        setFieldValue('dueDay', numericText);
                                                    }
                                                }}
                                                containerStyle={styles.inputContainerNoMargin}
                                                keyboardType="numeric"
                                                maxLength={2}
                                                error={touched.dueDay && errors.dueDay ? String(errors.dueDay) : undefined}
                                            />
                                        </View>
                                        <View style={styles.halfInput}>
                                            <Text style={styles.label}>{t('banking_finance.min_due')}</Text>
                                            <CustomInput
                                                placeholder="0.00"
                                                value={values.minDue}
                                                onChangeText={(text) => {
                                                    // Only allow numbers and one decimal point
                                                    const validText = text.replace(/[^0-9.]/g, '');
                                                    // Prevent multiple decimal points
                                                    const parts = validText.split('.');
                                                    if (parts.length <= 2) {
                                                        setFieldValue('minDue', validText);
                                                    }
                                                }}
                                                containerStyle={styles.inputContainerNoMargin}
                                                keyboardType="decimal-pad"
                                                error={touched.minDue && errors.minDue ? String(errors.minDue) : undefined}
                                            />
                                        </View>
                                    </View>

                                    {/* Start Date / End Date */}
                                    <View style={[styles.rowContainer]}>
                                        <View style={styles.halfInput}>
                                            <Text style={styles.label}>{t('common.start_date')}</Text>
                                            <CustomDateTimePicker
                                                value={values.startDate}
                                                onChange={(d) => setFieldValue('startDate', d)}
                                                placeholder={t('common.start_date')}
                                                displayFormat="MM/DD/YYYY"
                                                suffixIcon={<Ionicons name="calendar-outline" size={20} color={themeColors.textSecondary} />}
                                            />
                                        </View>
                                        <View style={styles.halfInput}>
                                            <Text style={styles.label}>{t('common.end_date')}</Text>
                                            <CustomDateTimePicker
                                                value={values.endDate}
                                                onChange={(d) => setFieldValue('endDate', d)}
                                                placeholder={t('common.end_date')}
                                                displayFormat="MM/DD/YYYY"
                                                suffixIcon={<Ionicons name="calendar-outline" size={20} color={themeColors.textSecondary} />}
                                            />
                                            {touched.endDate && errors.endDate && (
                                                <Text style={styles.errorText}>{String(errors.endDate)}</Text>
                                            )}
                                        </View>
                                    </View>

                                    {/* Notes/Memo */}
                                    <View style={styles.inputGroup}>
                                        <Text style={styles.label}>{t('banking_finance.memo')}</Text>
                                        <TextInput
                                            placeholder={t('banking_finance.memo')}
                                            placeholderTextColor={colors.gray}
                                            value={notes}
                                            onChangeText={setNotes}
                                            multiline={true}
                                            numberOfLines={4}
                                            textAlignVertical="top"
                                            style={styles.notesInput}
                                        />
                                    </View>

                                    {/* Autopay Checkbox */}
                                    <View style={styles.checkboxContainer}>
                                        <View>
                                            <CustomCheckbox checked={autopay} onPress={() => setAutopay(!autopay)} />
                                        </View>
                                        <View>
                                            <Text style={styles.checkboxLabel}>
                                                {t('banking_finance.autopay')}
                                            </Text>
                                        </View>
                                    </View>

                                    <View style={styles.walletContainer}>
                                        <Text style={styles.walletLabel}>
                                            {t('banking_finance.add_to_wallet')}
                                        </Text>
                                        <TouchableOpacity
                                            style={[styles.toggle, addToWallet && styles.toggleActive, addToWallet && { backgroundColor: themeColors.primary }]}
                                            onPress={() => setAddToWallet(!addToWallet)}
                                        >
                                            <View
                                                style={[
                                                    styles.toggleCircle,
                                                    addToWallet && styles.toggleCircleActive,
                                                ]}
                                            />
                                        </TouchableOpacity>
                                    </View>

                                    {/* Planned Payments Section */}
                                    <View style={styles.plannedPaymentsSection}>
                                        <Text style={styles.sectionTitle}>
                                            {t('banking_finance.planned_payments')}
                                        </Text>

                                        {plannedPayments.map((payment, index) => (
                                            <View key={index} style={styles.paymentCard}>
                                                <View style={styles.paymentHeader}>
                                                    <Text style={styles.paymentNumber}>
                                                        {new Date(payment.dueDate || new Date()).toLocaleDateString('en-US', {
                                                            day: '2-digit',
                                                            month: '2-digit',
                                                            year: 'numeric'
                                                        })} - {payment.amount ? `$${parseFloat(payment.amount).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}` : '$0.00'}
                                                    </Text>
                                                    <View style={styles.paymentActions}>
                                                        <TouchableOpacity
                                                            style={styles.paymentActionBtn}
                                                            onPress={() => handleRemovePayment(index)}
                                                        >
                                                            <Feather name="trash-2" size={18} color={themeColors.primary} />
                                                        </TouchableOpacity>
                                                    </View>
                                                </View>

                                                <View style={styles.rowContainer}>
                                                    <View style={styles.halfInput}>
                                                        <Text style={styles.label}>
                                                            {t('banking_finance.due_date')}
                                                        </Text>
                                                        <CustomDateTimePicker
                                                            placeholder={t('common.select')}
                                                            value={payment.dueDate}
                                                            onChange={(value) => handlePaymentChange(index, 'dueDate', value)}
                                                            displayFormat="MM/DD/YYYY"
                                                            inputContainerStyle={styles.datePickerInputContainer}
                                                            suffixIcon={
                                                                <Feather
                                                                    name="calendar"
                                                                    size={20}
                                                                    color={colors.gray}
                                                                />
                                                            }
                                                        />
                                                    </View>
                                                    <View style={styles.halfInput}>
                                                        <Text style={styles.label}>
                                                            {t('banking_finance.amount')}
                                                        </Text>
                                                        <CustomInput
                                                            placeholder="0.00"
                                                            value={payment.amount}
                                                            onChangeText={value =>
                                                                handlePaymentChange(index, 'amount', value)
                                                            }
                                                            containerStyle={styles.inputContainerNoMargin}
                                                            keyboardType="decimal-pad"
                                                        />
                                                    </View>
                                                </View>
                                            </View>
                                        ))}

                                        {/* Add More Button */}
                                        <TouchableOpacity
                                            style={[styles.addMoreButton, { backgroundColor: themeColors?.isDark ? darkenColor(themeColors.primary, 0.1) : getColorWithOpacity(themeColors.primary, 0.5) }]}
                                            onPress={handleAddMore}
                                        >
                                            <Text style={styles.addMoreText}>
                                                + {t('banking_finance.add_more')}
                                            </Text>
                                        </TouchableOpacity>
                                    </View>

                                    <RecordLinksField links={links} />

                                    {/* Upload Attachments */}
                                    <View style={styles.uploadSection}>
                                        <MixedMediaUploader
                                            mediaIds={attachmentIds}
                                            onMediaChange={(ids) => setAttachmentIds(ids)}
                                            label={t('banking_finance.upload_attachments')}
                                            uploadType="box"
                                            maxItems={5}
                                            removable={true}
                                            autoUpload={true}
                                        />
                                    </View>

                                    {/* Add Account Button */}
                                    <PrimaryButton
                                        title={isEdit ? t('common.save_changes') : t('banking_finance.add_account')}
                                        onPress={handleSubmit}
                                        loading={isLoading}
                                        disabled={isLoading}
                                        buttonStyle={[
                                            styles.addAccountButton,
                                            { backgroundColor: themeColors.primary },
                                        ]}
                                    />

                                    {/* Info Text */}
                                    <Text style={styles.infoText}>
                                        {t('banking_finance.due_date_info')}
                                    </Text>
                                </View>
                            )}
                        </Formik>
                    </ScrollView>
                </KeyboardAvoidingView>
            </SafeAreaView>
        </View>
    );
};

export default AddBankAccount;
