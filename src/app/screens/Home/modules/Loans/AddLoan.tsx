import {
    KeyboardAvoidingView,
    Platform,
    ScrollView,
    Text,
    View,
} from 'react-native';
import { useRecordNotes } from '../../../../../hooks/useRecordNotes';
import { RecordNotesField } from '../../../../../components/notes/RecordNotesField';
import React, { useState, useMemo } from 'react';
import { SafeAreaView } from 'react-native-safe-area-context';
import {
    AuthHeader,
    CustomInput,
    PrimaryButton,
    CustomDateTimePicker,
    DocumentPicker,
    AssignmentDropdownField,
    ImageUploader,
    MixedMediaUploader,
    VendorAutocompleteInput,
} from '../../../../../components/common';
import { useNavigation } from '@react-navigation/native';
import colors from '../../../../../utils/colors';
import { useTranslation } from 'react-i18next';
import Feather from 'react-native-vector-icons/Feather';
import { useUserRole } from '../../../../../hooks/useUserRole';
import { useSelectedBusiness } from '../../../../../hooks/useSelectedBusiness';
import { useAssignmentFields } from '../../../../../hooks/useAssignmentFields';
import { isIOS } from '../../../../../utils/helpers';
import { useDispatch, useSelector } from 'react-redux';
import { addLoanAsync, getLoanAsync, updateLoanAsync } from '../../../../../redux/services/liabilitiesService';
import { ASYNC_STATUS } from '../../../../../config/constants';
import { showSuccessAlert } from '../../../../../utils/AlertHelper';
import type {
    AddLoanScreenProps,
    LoanFormData,
} from './Loans.types';
import { Formik, FormikProps } from 'formik';
import validationSchema from '../../../../../utils/validationSchemas';
import { AppDispatch } from '../../../../../types/store.types';
import { makeCommonStyles } from './Loans.styles';
import { makeAddLoanStyles } from './AddLoan.styles';
import { RoleTheme } from '../../../../../types/roleManager.types';
import { useRecordLinkSelection, saveLinksAfter } from '../../../../../hooks/useRecordLinkSelection';
import { RecordLinksField } from '../../../../../components/recordLinks/RecordLinksField';
import { RECORD_LINK_MODULE } from '../../../../../constants/recordLinkModules';

const AddLoan = ({ route }: AddLoanScreenProps) => {
    const navigation = useNavigation();
    const { t, i18n } = useTranslation();
    const isRTL = i18n.language === 'ar';
    const { themeColors, isBusinessRole } = useUserRole();
    const commonStyles = useMemo(() => makeCommonStyles(themeColors as RoleTheme), [themeColors]);
    const styles = useMemo(() => makeAddLoanStyles(themeColors as RoleTheme), [themeColors]);
    const { selectedBusinessId } = useSelectedBusiness();
    const dispatch = useDispatch<AppDispatch>();

    // Check if user is in business mode
    const isBusiness = isBusinessRole();

    const { loan, isEdit, ownerUserId, ownerBusinessId, ownerName, isFromEmergencyAccess } = (route?.params as any) || {};
    // "Select Records to Link" (as on the web): saved after the record itself.
    const links = useRecordLinkSelection({
        moduleKey: RECORD_LINK_MODULE.Loan,
        recordId: isEdit && loan?.id ? Number(loan.id) : null,
        businessId: isBusinessRole() ? selectedBusinessId ?? null : null,
        enabled: !ownerUserId && !isFromEmergencyAccess,
    });
    // Notes' "Encrypt notes" choice; saved after the record, like its links.
    const recordNotes = useRecordNotes({ moduleKey: RECORD_LINK_MODULE.Loan, recordId: isEdit && loan?.id ? Number(loan.id) : null, enabled: links.enabled });
    // Editing a record someone else shared with us — the Assign To fields
    // must list their assets, not ours (see useAssignmentFields).
    const isOwnerScoped = !!ownerUserId;

    const { add_loan_status, update_loan_status } = useSelector((state: any) => state.liabilities_slice);

    const propertyDropdownLabel = isBusiness
        ? (t('loans.link_business_property') || 'Business Property')
        : (t('loans.link_personal_property') || 'Personal Property');

    const propertyDropdownPlaceholder = isBusiness
        ? (t('loans.link_business_property_placeholder') || 'Select a business property...')
        : (t('loans.link_personal_property_placeholder') || 'Select a personal property...');

    // Read case-insensitively and prefer the flat id — the nested `property`/
    // `vehicle`/`realestate` objects only carry the linked asset's name
    // fields (even for an unshared asset), not the source of truth for the id.
    const linkedVehicleId = loan?.vehicleid ?? loan?.vehicleId;
    const linkedPropertyId =
        (loan as any)?.personalpropertyid ??
        (loan as any)?.personalPropertyId ??
        loan?.propertyid ??
        loan?.propertyId ??
        loan?.property?.id;
    const linkedRealEstateId = loan?.realestateid ?? loan?.realEstateId;

    const assignment = useAssignmentFields({
        slots: ['vehicle', 'property', 'realestate'],
        isOwnerScoped,
        isEmergency: !!isFromEmergencyAccess,
        ownerUserId,
        ownerName,
        ownerBusinessId,
        isBusiness,
        myBusinessId: selectedBusinessId,
        linkedIds: {
            vehicle: linkedVehicleId,
            property: linkedPropertyId,
            realestate: linkedRealEstateId,
        },
        linkedAssets: {
            vehicle: loan?.vehicle,
            property: loan?.property,
            realestate: loan?.realestate ?? loan?.realEstate,
        },
    });

    const formikRef = React.useRef<FormikProps<{
        lenderProvider: string;
        lenderLocation: string;
        lenderPhoneNumber: string;
        lenderEmail: string;
        accountNumber: string;
        balance: string;
        estBalance: string;
        monthlyPayment: string;
        startDate: string | null;
        endDate: string | null;
        dueDay: string;
        ratePercent: string;
        bestName: string;
        uploadAttachments: any;
        realEstateId: string;
        vehicleId: string;
        personalPropertyId: string;
    }>>(null);

    const formikInitialValues = {
        lenderProvider: loan?.lenderprovider || '',
        lenderLocation: loan?.lenderlocation || '',
        lenderPhoneNumber: loan?.lenderphonenumber || '',
        lenderEmail: loan?.lenderemail || '',
        accountNumber: loan?.accountnumber || '',
        balance: loan?.balance?.toString() || '',
        estBalance: loan?.estbalance?.toString() || '',
        monthlyPayment: loan?.monthlypayment?.toString() || '',
        startDate: loan?.startdate || null as string | null,
        endDate: loan?.enddate || null as string | null,
        dueDay: loan?.dueday?.toString() || '',
        ratePercent: loan?.ratepercent?.toString() || '',
        bestName: loan?.bestname || '',
        uploadAttachments: null as any,
        realEstateId: linkedRealEstateId ? String(linkedRealEstateId) : '',
        vehicleId: linkedVehicleId ? String(linkedVehicleId) : '',
        personalPropertyId: linkedPropertyId ? String(linkedPropertyId) : '',
    };

    const [docIds, setDocIds] = useState<string[]>(() => {
        const existing = loan?.uploadattachments;
        return Array.isArray(existing) ? existing : existing ? [existing as string] : [];
    });

    const isLoading: boolean = add_loan_status === ASYNC_STATUS.LOADING || update_loan_status === ASYNC_STATUS.LOADING;

    const handleAddLoan = (formValues: typeof formikInitialValues): void => {
        const { lenderProvider, startDate, endDate, lenderLocation, lenderPhoneNumber, lenderEmail, accountNumber, balance, estBalance, monthlyPayment, dueDay, ratePercent, bestName, uploadAttachments, realEstateId, vehicleId, personalPropertyId } = formValues;

        // Format dates to ISO string
        let startDateISO: string;
        let endDateISO: string | null;

        try {
            startDateISO = typeof startDate === 'object' && startDate !== null && 'toISOString' in startDate
                ? (startDate as Date).toISOString()
                : new Date(startDate as string).toISOString();

            endDateISO = !endDate
                ? null
                : typeof endDate === 'object' && 'toISOString' in endDate
                    ? (endDate as Date).toISOString()
                    : new Date(endDate as string).toISOString();
        } catch (error) {
            return;
        }

        // Prepare API data matching the required body structure
        const loanData: LoanFormData = {
            lenderProvider,
            lenderLocation,
            lenderPhoneNumber,
            lenderEmail,
            accountNumber,
            balance: parseFloat(balance) || 0,
            estBalance: parseFloat(estBalance) || 0,
            monthlyPayment: parseFloat(monthlyPayment) || 0,
            startDate: startDateISO,
            endDate: endDateISO,
            dueDay: parseInt(dueDay) || 0,
            ratePercent: parseFloat(ratePercent) || 0,
            bestName,
            uploadAttachments: docIds.length > 0 ? docIds : [],
            ...(realEstateId ? { realEstateId: parseInt(realEstateId) } : {}),
            ...(vehicleId ? { vehicleId: parseInt(vehicleId) } : {}),
            ...(personalPropertyId ? { propertyId: parseInt(personalPropertyId) } : {}),
            ...(isBusiness && selectedBusinessId && { businessId: selectedBusinessId }),
        };

        if (isEdit && loan?.id) {
            // Update existing loan
            dispatch(updateLoanAsync({
                id: loan.id,
                data: {
                    ...loanData,
                    realEstateId: realEstateId ? parseInt(realEstateId) : null,
                    vehicleId: vehicleId ? parseInt(vehicleId) : null,
                    propertyId: personalPropertyId ? parseInt(personalPropertyId) : null,
                    personalPropertyId: personalPropertyId ? parseInt(personalPropertyId) : null,
                },
            })).then((action: any) => {
                saveLinksAfter(links, action, loan.id, undefined, recordNotes);
                if (action.type === updateLoanAsync.fulfilled.type) {
                    showSuccessAlert(
                        t('loans.loan_updated_success') || 'Loan updated successfully',
                        'Success',
                    );
                    const businessIdParam = isBusiness && selectedBusinessId ? selectedBusinessId : undefined;
                    dispatch(getLoanAsync(businessIdParam));
                    navigation.goBack();
                }
            });
        } else {
            // Add new loan
            dispatch(addLoanAsync({ ...loanData, ...(ownerUserId ? { ownerUserId } : {}) } as any)).then((action: any) => {
                saveLinksAfter(links, action, undefined, undefined, recordNotes);
                if (action.type === addLoanAsync.fulfilled.type) {
                    showSuccessAlert(
                        t('loans.loan_added_success') || 'Loan added successfully',
                        'Success',
                    );
                    const businessIdParam = isBusiness && selectedBusinessId ? selectedBusinessId : undefined;
                    dispatch(getLoanAsync(businessIdParam));
                    navigation.goBack();
                }
            });
        }
    };

    return (
        <View style={styles.container}>
            <SafeAreaView style={styles.safeArea}>
                <AuthHeader
                    title={isEdit ? t('loans.edit_loan') : t('loans.add_loan')}
                    onBackPress={() => navigation.goBack()}
                    containerStyle={{ paddingHorizontal: 16, marginBottom: 0, paddingTop: isIOS ? 0 : 20 }}
                    backButtonStyle={{ marginBottom: 0 }}
                    titleStyle={{
                        marginBottom: 0,
                        marginTop: 20,
                        textAlign: 'left',
                    }}
                    backButtonIconStyle={{ tintColor: themeColors.textPrimary }}
                />
                <KeyboardAvoidingView
                    style={styles.container}
                    behavior={Platform.OS === 'ios' ? 'padding' : 'height'} >
                    <ScrollView
                        style={commonStyles.scrollView}
                        contentContainerStyle={styles.scrollContent}
                        showsVerticalScrollIndicator={false}
                        keyboardShouldPersistTaps="handled"
                    >
                        <Formik
                            innerRef={formikRef}
                            initialValues={formikInitialValues}
                            validationSchema={validationSchema('loan')}
                            onSubmit={handleAddLoan}
                            validateOnChange={true}
                            validateOnBlur={true}
                        >
                            {({ handleChange, handleSubmit, values, setFieldValue, touched, errors }) => (
                                <View style={styles.formContainer}>
                                    {/* Purpose of Loan */}
                                    <View style={styles.fullWidthContainer}>
                                        <Text style={[styles.label, { textAlign: 'left' }]}>
                                            {t('loans.best_name')}
                                        </Text>
                                        <CustomInput
                                            placeholder={t('loans.best_name')}
                                            value={values.bestName}
                                            onChangeText={handleChange('bestName')}
                                            containerStyle={styles.inputContainerNoMargin}
                                            error={touched.bestName && errors.bestName ? String(errors.bestName) : undefined}
                                        />
                                    </View>

                                    {/* Lender/Provider */}
                                    <View style={styles.fullWidthContainer}>
                                        <Text style={[styles.label, { textAlign: 'left' }]}>
                                            {t('loans.lender_provider')} *
                                        </Text>
                                        <VendorAutocompleteInput
                                            category="lender_provider"
                                            placeholder={t('loans.lender_provider')}
                                            value={values.lenderProvider}
                                            onChangeText={handleChange('lenderProvider')}
                                            containerStyle={styles.inputContainerNoMargin}
                                            error={touched.lenderProvider && errors.lenderProvider ? String(errors.lenderProvider) : undefined}
                                        />
                                    </View>

                                    {/* Lender Location */}
                                    <View style={styles.fullWidthContainer}>
                                        <Text style={[styles.label, { textAlign: 'left' }]}>
                                            {t('loans.lender_location')}
                                        </Text>
                                        <CustomInput
                                            placeholder={t('loans.lender_location')}
                                            value={values.lenderLocation}
                                            onChangeText={handleChange('lenderLocation')}
                                            containerStyle={styles.inputContainerNoMargin}
                                            error={touched.lenderLocation && errors.lenderLocation ? String(errors.lenderLocation) : undefined}
                                        />
                                    </View>

                                    {/* Lender Phone Number */}
                                    <View style={styles.fullWidthContainer}>
                                        <Text style={[styles.label, { textAlign: 'left' }]}>
                                            {t('loans.lender_phone_number')}
                                        </Text>
                                        <CustomInput
                                            placeholder={t('loans.lender_phone_number')}
                                            value={values.lenderPhoneNumber}
                                            onChangeText={handleChange('lenderPhoneNumber')}
                                            containerStyle={styles.inputContainerNoMargin}
                                            keyboardType="phone-pad"
                                            error={touched.lenderPhoneNumber && errors.lenderPhoneNumber ? String(errors.lenderPhoneNumber) : undefined}
                                        />
                                    </View>

                                    {/* Lender Email */}
                                    <View style={styles.fullWidthContainer}>
                                        <Text style={[styles.label, { textAlign: 'left' }]}>
                                            {t('loans.lender_email')}
                                        </Text>
                                        <CustomInput
                                            placeholder={t('loans.lender_email')}
                                            value={values.lenderEmail}
                                            onChangeText={handleChange('lenderEmail')}
                                            containerStyle={styles.inputContainerNoMargin}
                                            keyboardType="email-address"
                                            error={touched.lenderEmail && errors.lenderEmail ? String(errors.lenderEmail) : undefined}
                                        />
                                    </View>

                                    {/* Account Number */}
                                    <View style={styles.fullWidthContainer}>
                                        <Text style={[styles.label, { textAlign: 'left' }]}>
                                            {t('loans.account_number')}
                                        </Text>
                                        <CustomInput
                                            placeholder={t('loans.account_number')}
                                            value={values.accountNumber}
                                            onChangeText={handleChange('accountNumber')}
                                            containerStyle={styles.inputContainerNoMargin}
                                            error={touched.accountNumber && errors.accountNumber ? String(errors.accountNumber) : undefined}
                                        />
                                    </View>

                                    {/* Balance and EST Balance Row */}
                                    <View style={styles.rowContainer}>
                                        <View style={styles.halfInput}>
                                            <Text style={[styles.label, { textAlign: 'left' }]}>
                                                {t('loans.balance')} *
                                            </Text>
                                            <CustomInput
                                                placeholder="0.00"
                                                value={values.balance}
                                                onChangeText={handleChange('balance')}
                                                containerStyle={styles.inputContainerNoMargin}
                                                keyboardType="decimal-pad"
                                                error={touched.balance && errors.balance ? String(errors.balance) : undefined}
                                            />
                                        </View>
                                        <View style={styles.halfInput}>
                                            <Text style={[styles.label, { textAlign: 'left' }]}>
                                                {t('loans.est_balance')}
                                            </Text>
                                            <CustomInput
                                                placeholder="0.00"
                                                value={values.estBalance}
                                                onChangeText={handleChange('estBalance')}
                                                containerStyle={styles.inputContainerNoMargin}
                                                keyboardType="decimal-pad"
                                                error={touched.estBalance && errors.estBalance ? String(errors.estBalance) : undefined}
                                            />
                                        </View>
                                    </View>

                                    {/* Monthly Payment */}
                                    <View style={styles.fullWidthContainer}>
                                        <Text style={[styles.label, { textAlign: 'left' }]}>
                                            {t('loans.monthly_payment')} *
                                        </Text>
                                        <CustomInput
                                            placeholder="0.00"
                                            value={values.monthlyPayment}
                                            onChangeText={handleChange('monthlyPayment')}
                                            containerStyle={styles.inputContainerNoMargin}
                                            keyboardType="decimal-pad"
                                            error={touched.monthlyPayment && errors.monthlyPayment ? String(errors.monthlyPayment) : undefined}
                                        />
                                    </View>

                                    {/* Start Date and End Date Row */}
                                    <View style={styles.rowContainer}>
                                        <View style={styles.halfInput}>
                                            <Text style={[styles.label, { textAlign: 'left' }]}>
                                                {t('loans.start_date')} *
                                            </Text>
                                            <CustomDateTimePicker
                                                placeholder={t('real_estate.select')}
                                                value={values.startDate}
                                                onChange={(val: any) => setFieldValue('startDate', val)}
                                                mode="date"
                                                displayFormat="MM/DD/YYYY"
                                                labelStyle={{ textAlign: 'left' }}
                                                // inputStyle={{ textAlign: 'left' }}
                                                inputContainerStyle={{ borderRadius: 9 }}
                                                suffixIcon={
                                                    <Feather name="calendar" size={20} color={colors.gray} />
                                                }
                                                error={touched.startDate && errors.startDate ? String(errors.startDate) : undefined}
                                            />
                                        </View>
                                        <View style={styles.halfInput}>
                                            <Text style={[styles.label, { textAlign: 'left' }]}>
                                                {t('loans.end_date')}
                                            </Text>
                                            <CustomDateTimePicker
                                                placeholder={t('real_estate.select')}
                                                value={values.endDate}
                                                onChange={(val: any) => setFieldValue('endDate', val)}
                                                mode="date"
                                                displayFormat="MM/DD/YYYY"
                                                labelStyle={{ textAlign: 'left' }}
                                                // inputStyle={{ textAlign: 'left' }}
                                                inputContainerStyle={{ borderRadius: 9 }}
                                                suffixIcon={
                                                    <Feather name="calendar" size={20} color={colors.gray} />
                                                }
                                                clearable
                                                error={touched.endDate && errors.endDate ? String(errors.endDate) : undefined}
                                            />
                                        </View>
                                    </View>

                                    {/* Due Day */}
                                    <View style={styles.fullWidthContainer}>
                                        <Text style={[styles.label, { textAlign: 'left' }]}>
                                            {t('loans.due_day')} *
                                        </Text>
                                        <CustomInput
                                            placeholder={t('loans.due_day_placeholder') || '1-31'}
                                            value={values.dueDay}
                                            onChangeText={handleChange('dueDay')}
                                            containerStyle={styles.inputContainerNoMargin}
                                            keyboardType="number-pad"
                                            error={touched.dueDay && errors.dueDay ? String(errors.dueDay) : undefined}
                                        />
                                    </View>

                                    {/* Rate % */}
                                    <View style={styles.fullWidthContainer}>
                                        <Text style={[styles.label, { textAlign: 'left' }]}>
                                            {t('loans.rate_percentage')}
                                        </Text>
                                        <CustomInput
                                            placeholder={t('loans.rate_percentage')}
                                            value={values.ratePercent}
                                            onChangeText={handleChange('ratePercent')}
                                            containerStyle={styles.inputContainerNoMargin}
                                            keyboardType="decimal-pad"
                                            error={touched.ratePercent && errors.ratePercent ? String(errors.ratePercent) : undefined}
                                        />
                                    </View>

                                    {/* Link to Real Estate, Vehicle or Property — mutually exclusive.
                                        In mode B/D (editing a connection's shared loan) all three
                                        always show, either as a dropdown of THEIR assets or a locked
                                        field when they didn't share that module at all. */}
                                    {(() => {
                                        const showRealEstate = isOwnerScoped || (assignment.slotStates.realestate?.options.length ?? 0) > 0;
                                        const showVehicle = isOwnerScoped || (assignment.slotStates.vehicle?.options.length ?? 0) > 0;
                                        const showProperty = isOwnerScoped || (assignment.slotStates.property?.options.length ?? 0) > 0;
                                        if (!showRealEstate && !showVehicle && !showProperty) return null;

                                        return (
                                            <>
                                                <View style={styles.linkInfoRow}>
                                                    <Feather name="info" size={14} color={themeColors?.isDark ? themeColors.primary : themeColors.secondary} />
                                                    <Text style={[styles.linkInfoText, { color: themeColors?.isDark ? themeColors.primary : themeColors.secondary }]}>
                                                        {t('loans.link_loan_subtitle') || 'Tie this loan to a real estate property, a vehicle, or a personal property (select only one).'}
                                                    </Text>
                                                </View>

                                                {showRealEstate && assignment.slotStates.realestate && (
                                                    <View style={styles.fullWidthContainer}>
                                                        <Text style={[styles.label, { textAlign: 'left' }]}>
                                                            {t('loans.link_real_estate') || 'Link to Real Estate (Optional)'}
                                                        </Text>
                                                        <AssignmentDropdownField
                                                            slot={assignment.slotStates.realestate}
                                                            value={values.realEstateId}
                                                            loading={assignment.isLoading}
                                                            emptyOptionLabel="-None-"
                                                            onSelect={(v) => {
                                                                setFieldValue('realEstateId', v || '');
                                                                if (v) {
                                                                    setFieldValue('vehicleId', '');
                                                                    setFieldValue('personalPropertyId', '');
                                                                }
                                                            }}
                                                            placeholder={t('loans.link_real_estate_placeholder') || 'Select a property...'}
                                                        />
                                                    </View>
                                                )}

                                                {showVehicle && assignment.slotStates.vehicle && (
                                                    <View style={styles.fullWidthContainer}>
                                                        <Text style={[styles.label, { textAlign: 'left' }]}>
                                                            {t('loans.link_vehicle') || 'Link to Vehicle (Optional)'}
                                                        </Text>
                                                        <AssignmentDropdownField
                                                            slot={assignment.slotStates.vehicle}
                                                            value={values.vehicleId}
                                                            loading={assignment.isLoading}
                                                            emptyOptionLabel="-None-"
                                                            onSelect={(v) => {
                                                                setFieldValue('vehicleId', v || '');
                                                                if (v) {
                                                                    setFieldValue('realEstateId', '');
                                                                    setFieldValue('personalPropertyId', '');
                                                                }
                                                            }}
                                                            placeholder={t('loans.link_vehicle_placeholder') || 'Select a vehicle...'}
                                                        />
                                                    </View>
                                                )}

                                                {showProperty && assignment.slotStates.property && (
                                                    <View style={styles.fullWidthContainer}>
                                                        <Text style={[styles.label, { textAlign: 'left' }]}>
                                                            {propertyDropdownLabel}
                                                        </Text>
                                                        <AssignmentDropdownField
                                                            slot={assignment.slotStates.property}
                                                            value={values.personalPropertyId}
                                                            loading={assignment.isLoading}
                                                            emptyOptionLabel="-None-"
                                                            onSelect={(v) => {
                                                                setFieldValue('personalPropertyId', v || '');
                                                                if (v) {
                                                                    setFieldValue('realEstateId', '');
                                                                    setFieldValue('vehicleId', '');
                                                                }
                                                            }}
                                                            placeholder={propertyDropdownPlaceholder}
                                                        />
                                                    </View>
                                                )}

                                                {assignment.sectionMessage && (
                                                    <Text style={{ fontSize: 12, color: '#DC2626', marginBottom: 8 }}>
                                                        {assignment.sectionMessage}
                                                    </Text>
                                                )}
                                            </>
                                        );
                                    })()}

                                    <RecordNotesField notes={recordNotes} />
                                    <RecordLinksField links={links} />
                                    {/* Upload Attachments */}
                                    <View style={styles.uploadSection}>
                                        <MixedMediaUploader
                                            mediaIds={docIds}
                                            onMediaChange={(ids: string[]) => setDocIds(ids)}
                                            label={t('real_estate.upload_attachments')}
                                            uploadType="box"
                                            maxItems={5}
                                            removable={true}
                                            autoUpload={true}
                                        />
                                        {touched.uploadAttachments && errors.uploadAttachments && <Text style={styles.errorText}>{String(errors.uploadAttachments)}</Text>}
                                    </View>

                                    {/* Add Loan Button */}
                                    <PrimaryButton
                                        title={isEdit ? t('common.save_changes') : t('loans.add_loan')}
                                        onPress={handleSubmit}
                                        loading={isLoading}
                                        disabled={isLoading}
                                        buttonStyle={[
                                            styles.addLoanButton,
                                            { backgroundColor: themeColors.primary },
                                        ]}
                                    />
                                </View>
                            )}
                        </Formik>
                    </ScrollView>
                </KeyboardAvoidingView>
            </SafeAreaView>
        </View>
    );
};

export default AddLoan;
