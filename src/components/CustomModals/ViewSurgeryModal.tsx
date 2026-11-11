import React, { useMemo } from 'react';
import { useUserRole } from '../../hooks/useUserRole';
import {
	View,
	Text,
	Modal,
	TouchableOpacity,
	ScrollView,
} from 'react-native';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import { useTranslation } from 'react-i18next';
import { useSelector } from 'react-redux';
import colors from '../../utils/colors';
import PrimaryButton from '../common/PrimaryButton';
import { MixedMediaDisplayer } from '../common';
import { makeViewSurgeryModalStyles } from './ViewSurgeryModal.styles';
import { RoleTheme } from '../../types/roleManager.types';
import { RecordViewTabs, type RecordLinkTabsProp } from '../recordLinks/RecordViewTabs';

interface SurgeryRecord {
	procedurename?: string;
	procedureName?: string;
	name?: string;
	status?: string;
	bodysite?: string;
	bodySite?: string;
	proceduretype?: string;
	procedureType?: string;
	scheduleddate?: string | Date | null;
	scheduledDate?: string | Date | null;
	performeddate?: string | Date | null;
	performedDate?: string | Date | null;
	admissiontype?: string;
	patienttype?: string;
	dischargedate?: string | Date | null;
	followupdate?: string | Date | null;
	surgeonprovider?: string | number;
	assistingproviders?: string;
	facility?: string;
	department?: string;
	cptcode?: string;
	hcpcscode?: string;
	icd10pcscode?: string;
	anesthesiatype?: string;
	outcomestatus?: string;
	linkeddiagnosis?: string;
	complications?: string;
	pathologysummary?: string;
	implantsdevicesused?: string;
	linkedmedicationname?: string;
	linkeddoctorname?: string;
	recoverynotes?: string;
	restrictions?: string;
	rehabrequired?: string;
	followupprovider?: string | number;
	insurancebillingnotes?: string;
	linkeddoctordetail?: any;
	linkedmedicationdetail?: any;
	photourls?: string[] | string | null;
	photoUrls?: string[] | string | null;
	[key: string]: any;
}

interface ViewSurgeryModalProps {
	visible: boolean;
	onClose: () => void;
	surgery: SurgeryRecord | null;
}

const ViewSurgeryModal: React.FC<ViewSurgeryModalProps & RecordLinkTabsProp> = ({ linkTabs, visible, onClose, surgery }) => {
	const { t } = useTranslation();
	const { get_child_by_id_data } = useSelector((state: any) => state.essentials_slice);

	const { themeColors } = useUserRole();

	const styles = useMemo(() => makeViewSurgeryModalStyles(themeColors as RoleTheme), [themeColors]);

	const getField = (obj: any, ...keys: string[]) => {
		for (const key of keys) {
			if (obj && obj[key] !== undefined && obj[key] !== null && obj[key] !== '') {
				return obj[key];
			}
		}
		return '';
	};

	const formatDate = (value?: string | Date | null) => {
		if (!value) return '-';
		try {
			const date = value instanceof Date ? value : new Date(value);
			return date.toLocaleDateString('en-US', { day: 'numeric', month: 'numeric', year: 'numeric' });
		} catch {
			return '-';
		}
	};

	const name = getField(surgery, 'procedureName', 'procedurename', 'name');
	const subtitle = getField(surgery, 'procedureType', 'proceduretype', 'reason');
	const status = getField(surgery, 'status');

	const bodySite = getField(surgery, 'bodySite', 'bodysite');
	const procedureType = getField(surgery, 'procedureType', 'proceduretype');

	const scheduledDate = formatDate(getField(surgery, 'scheduledDate', 'scheduleddate'));
	const performedDate = formatDate(getField(surgery, 'performedDate', 'performeddate'));
	const admissionType = getField(surgery, 'admissiontype');
	const patientType = getField(surgery, 'patienttype');
	const dischargeDate = formatDate(getField(surgery, 'dischargedate'));
	const followUpDate = formatDate(getField(surgery, 'followupdate', 'followupDate'));

	const surgeonProvider =
		getField(surgery, 'surgeonprovidername') ||
		getField(surgery?.surgeonproviderdetail, 'name') ||
		getField(surgery, 'surgeonprovider');
	const assistingProviders = getField(surgery, 'assistingproviders');
	const facility = getField(surgery, 'facility');
	const department = getField(surgery, 'department');

	const cptCode = getField(surgery, 'cptcode');
	const hcpcsCode = getField(surgery, 'hcpcscode');
	const icd10PcsCode = getField(surgery, 'icd10pcscode');
	const anesthesiaType = getField(surgery, 'anesthesiatype');
	const outcomeStatus = getField(surgery, 'outcomestatus');
	// linkeddiagnosis is stored as the illness id; resolve it to the condition name.
	const linkedDiagnosisId = getField(surgery, 'linkeddiagnosis');
	const matchedIllness = (get_child_by_id_data?.illnesses || []).find(
		(i: any) => String(i?.id) === String(linkedDiagnosisId),
	);
	const linkedDiagnosis =
		getField(surgery, 'linkeddiagnosisname') ||
		getField(surgery?.linkeddiagnosisdetail, 'conditionname', 'conditionName', 'name') ||
		getField(matchedIllness, 'conditionName', 'conditionname', 'name') ||
		linkedDiagnosisId;
	const complications = getField(surgery, 'complications');
	const pathologySummary = getField(surgery, 'pathologysummary');
	const implantsDevicesUsed = getField(surgery, 'implantsdevicesused');

	const linkedMedicationName =
		getField(surgery, 'linkedmedicationname') ||
		getField(surgery?.linkedmedicationdetail, 'medicationname', 'name') ||
		getField(surgery, 'linkedmedication');
	const linkedDoctorName =
		getField(surgery, 'linkeddoctorname') ||
		getField(surgery?.linkeddoctordetail, 'name') ||
		getField(surgery, 'linkeddoctor');
	const recoveryNotes = getField(surgery, 'recoverynotes');
	const restrictions = getField(surgery, 'restrictions');
	const rehabRequired = getField(surgery, 'rehabrequired');
	const followUpProvider =
		getField(surgery, 'followupprovidername') ||
		getField(surgery?.followupproviderdetail, 'name') ||
		getField(surgery, 'followupprovider');
	const insuranceBillingNotes = getField(surgery, 'insurancebillingnotes');

	const attachments: string[] = [];
	const rawPhotos = surgery?.photoUrls || surgery?.photourls;
	if (Array.isArray(rawPhotos)) {
		attachments.push(...rawPhotos.filter(Boolean) as string[]);
	} else if (rawPhotos) {
		attachments.push(String(rawPhotos));
	}


	return (
		<Modal
			visible={visible && surgery !== null}
			transparent={true}
			animationType="fade"
			onRequestClose={onClose}
		>
			<View style={styles.overlay}>
				<TouchableOpacity style={styles.backdrop} activeOpacity={1} onPress={onClose} />
				<View style={styles.modalContainer}>
					<View style={styles.topIconContainer}>
						<View style={styles.topIconCircle}>
							<MaterialCommunityIcons name="medical-bag" size={26} color={colors.white} />
						</View>
					</View>

					<ScrollView
						style={styles.scrollView}
						showsVerticalScrollIndicator={false}
						contentContainerStyle={styles.scrollContent}
						keyboardShouldPersistTaps="handled"
					>
            <RecordViewTabs {...linkTabs} onNavigate={linkTabs?.onNavigate ?? onClose}>
						<View style={styles.headerRow}>
							<View style={styles.headerTextBlock}>
								<Text style={styles.headerTitle}>{name || '-'}</Text>
								{subtitle ? <Text style={styles.headerSubtitle}>{subtitle}</Text> : null}
							</View>
							{status ? (
								<View style={styles.statusPill}>
									<Text style={styles.statusText}>{status}</Text>
								</View>
							) : null}
						</View>

						<View style={styles.sectionDivider} />

						<Text style={styles.sectionTitle}>{t('health_tracker.core_information', { defaultValue: 'Core Information' })}</Text>
						<View style={styles.gridRow}>
							<View style={styles.gridItem}>
								<Text style={styles.label}>{t('health_tracker.body_site', { defaultValue: 'Body Site' })}</Text>
								<Text style={styles.value}>{bodySite || '-'}</Text>
							</View>
							<View style={styles.gridItem}>
								<Text style={styles.label}>{t('health_tracker.procedure_type', { defaultValue: 'Procedure Type' })}</Text>
								<Text style={styles.value}>{procedureType || '-'}</Text>
							</View>
						</View>

						<Text style={styles.sectionTitle}>{t('health_tracker.timeline', { defaultValue: 'Timeline' })}</Text>
						<View style={styles.gridRow}>
							<View style={styles.gridItem}>
								<Text style={styles.label}>{t('health_tracker.scheduled_date', { defaultValue: 'Scheduled Date' })}</Text>
								<Text style={styles.value}>{scheduledDate}</Text>
							</View>
							<View style={styles.gridItem}>
								<Text style={styles.label}>{t('health_tracker.date_performed', { defaultValue: 'Date Performed' })}</Text>
								<Text style={styles.value}>{performedDate}</Text>
							</View>
						</View>
						<View style={styles.gridRow}>
							<View style={styles.gridItem}>
								<Text style={styles.label}>{t('health_tracker.admission_type', { defaultValue: 'Admission Type' })}</Text>
								<Text style={styles.value}>{admissionType || '-'}</Text>
							</View>
							<View style={styles.gridItem}>
								<Text style={styles.label}>{t('health_tracker.inpatient_outpatient', { defaultValue: 'Inpatient / Outpatient' })}</Text>
								<Text style={styles.value}>{patientType || '-'}</Text>
							</View>
						</View>
						<View style={styles.gridRow}>
							<View style={styles.gridItem}>
								<Text style={styles.label}>{t('health_tracker.discharge_date', { defaultValue: 'Discharge Date' })}</Text>
								<Text style={styles.value}>{dischargeDate}</Text>
							</View>
							<View style={styles.gridItem}>
								<Text style={styles.label}>{t('health_tracker.follow_up_date', { defaultValue: 'Follow-Up Date' })}</Text>
								<Text style={styles.value}>{followUpDate}</Text>
							</View>
						</View>

						<Text style={styles.sectionTitle}>{t('health_tracker.provider_facility', { defaultValue: 'Provider & Facility' })}</Text>
						<View style={styles.gridRow}>
							<View style={styles.gridItem}>
								<Text style={styles.label}>{t('health_tracker.surgeon_provider', { defaultValue: 'Surgeon / Provider' })}</Text>
								<Text style={styles.value}>{surgeonProvider || '-'}</Text>
							</View>
							<View style={styles.gridItem}>
								<Text style={styles.label}>{t('health_tracker.assisting_providers', { defaultValue: 'Assisting Provider(s)' })}</Text>
								<Text style={styles.value}>{assistingProviders || '-'}</Text>
							</View>
						</View>
						<View style={styles.gridRow}>
							<View style={styles.gridItem}>
								<Text style={styles.label}>{t('health_tracker.facility_hospital', { defaultValue: 'Facility / Hospital' })}</Text>
								<Text style={styles.value}>{facility || '-'}</Text>
							</View>
							<View style={styles.gridItem}>
								<Text style={styles.label}>{t('health_tracker.department', { defaultValue: 'Department' })}</Text>
								<Text style={styles.value}>{department || '-'}</Text>
							</View>
						</View>

						<Text style={styles.sectionTitle}>{t('health_tracker.clinical_details_recovery', { defaultValue: 'Clinical Details & Recovery' })}</Text>
						<View style={styles.gridRow}>
							<View style={styles.gridItem}>
								<Text style={styles.label}>{t('health_tracker.cpt_code', { defaultValue: 'CPT Code' })}</Text>
								<Text style={styles.value}>{cptCode || '-'}</Text>
							</View>
							<View style={styles.gridItem}>
								<Text style={styles.label}>{t('health_tracker.hcpcs_code', { defaultValue: 'HCPCS Code' })}</Text>
								<Text style={styles.value}>{hcpcsCode || '-'}</Text>
							</View>
							<View style={styles.gridItem}>
								<Text style={styles.label}>{t('health_tracker.icd10_pcs_code', { defaultValue: 'ICD-10-PCS Code' })}</Text>
								<Text style={styles.value}>{icd10PcsCode || '-'}</Text>
							</View>
						</View>
						<View style={styles.gridRow}>
							<View style={styles.gridItem}>
								<Text style={styles.label}>{t('health_tracker.anesthesia_type', { defaultValue: 'Anesthesia Type' })}</Text>
								<Text style={styles.value}>{anesthesiaType || '-'}</Text>
							</View>
							<View style={styles.gridItem}>
								<Text style={styles.label}>{t('health_tracker.outcome_status', { defaultValue: 'Outcome Status' })}</Text>
								<Text style={styles.value}>{outcomeStatus || '-'}</Text>
							</View>
						</View>
						<View style={styles.singleRow}>
							<Text style={styles.label}>{t('health_tracker.linked_diagnosis', { defaultValue: 'Linked Diagnosis' })}</Text>
							<Text style={styles.value}>{linkedDiagnosis || '-'}</Text>
						</View>
						<View style={styles.singleRow}>
							<Text style={styles.label}>{t('health_tracker.complications', { defaultValue: 'Complications' })}</Text>
							<View style={styles.notesBox}>
								<Text style={styles.notesText}>{complications || '-'}</Text>
							</View>
						</View>
						<View style={styles.singleRow}>
							<Text style={styles.label}>{t('health_tracker.pathology_result_summary', { defaultValue: 'Pathology / Result Summary' })}</Text>
							<View style={styles.notesBox}>
								<Text style={styles.notesText}>{pathologySummary || '-'}</Text>
							</View>
						</View>
						<View style={styles.gridRow}>
							<View style={styles.gridItem}>
								<Text style={styles.label}>{t('health_tracker.implants_devices_used', { defaultValue: 'Implants / Devices Used' })}</Text>
								<Text style={styles.value}>{implantsDevicesUsed || '-'}</Text>
							</View>
							<View style={styles.gridItem}>
								<Text style={styles.label}>{t('health_tracker.linked_medications', { defaultValue: 'Linked Medications' })}</Text>
								<Text style={styles.value}>{linkedMedicationName || '-'}</Text>
							</View>
						</View>
						<View style={styles.gridRow}>
							<View style={styles.gridItem}>
								<Text style={styles.label}>{t('health_tracker.linked_doctors', { defaultValue: 'Linked Doctors' })}</Text>
								<Text style={styles.value}>{linkedDoctorName || '-'}</Text>
							</View>
						</View>
						<View style={styles.singleRow}>
							<Text style={styles.label}>{t('health_tracker.recovery_notes', { defaultValue: 'Recovery Notes' })}</Text>
							<View style={styles.notesBox}>
								<Text style={styles.notesText}>{recoveryNotes || '-'}</Text>
							</View>
						</View>
						<View style={styles.gridRow}>
							<View style={styles.gridItem}>
								<Text style={styles.label}>{t('health_tracker.restrictions', { defaultValue: 'Restrictions' })}</Text>
								<Text style={styles.value}>{restrictions || '-'}</Text>
							</View>
							<View style={styles.gridItem}>
								<Text style={styles.label}>{t('health_tracker.rehab_pt_required', { defaultValue: 'Rehab / PT Required' })}</Text>
								<Text style={styles.value}>{rehabRequired || '-'}</Text>
							</View>
						</View>
						<View style={styles.singleRow}>
							<Text style={styles.label}>{t('health_tracker.follow_up_provider', { defaultValue: 'Follow-Up Provider' })}</Text>
							<Text style={styles.value}>{followUpProvider || '-'}</Text>
						</View>
						<View style={styles.singleRow}>
							<Text style={styles.label}>{t('health_tracker.insurance_billing_notes', { defaultValue: 'Insurance / Billing Notes' })}</Text>
							<View style={styles.notesBox}>
								<Text style={styles.notesText}>{insuranceBillingNotes || '-'}</Text>
							</View>
						</View>

						{attachments.length > 0 && (
							<View style={styles.singleRow}>
								<Text style={styles.label}>{t('health_tracker.attachments', { defaultValue: 'Attachments' })}</Text>
								<MixedMediaDisplayer attachmentIds={attachments} imageHeight={140} />
							</View>
						)}
            </RecordViewTabs>
					</ScrollView>

					<View style={styles.footer}>
						<PrimaryButton
							title={t('common.close', { defaultValue: 'Close' })}
							onPress={onClose}
							buttonStyle={styles.closeButton}
						/>
					</View>
				</View>
			</View>
		</Modal>
	);
};

export default ViewSurgeryModal;
