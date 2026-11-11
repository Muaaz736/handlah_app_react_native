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
import colors from '../../utils/colors';
import PrimaryButton from '../common/PrimaryButton';
import { MixedMediaDisplayer } from '../common';
import { makeViewIllnessModalStyles } from './ViewIllnessModal.styles';
import { RoleTheme } from '../../types/roleManager.types';
import { RecordViewTabs, type RecordLinkTabsProp } from '../recordLinks/RecordViewTabs';
interface IllnessRecord {
    conditionName?: string;
    alternateName?: string;
    category?: string;
    severity?: string;
    status?: string;
    chronic?: string;
    onsetDate?: string | Date | null;
    diagnosisDate?: string | Date | null;
    resolvedDate?: string | Date | null;
    lastFlareUp?: string | Date | null;
    nextReviewDate?: string | Date | null;
    diagnosingProvider?: string;
    facility?: string;
    icd10Code?: string;
    snomedCode?: string;
    symptoms?: string;
    triggerFactors?: string;
    familyHistory?: string;
    linkedMedication?: string | number;
    linkedDoctor?: string | number;
    linkedAllergies?: string;
    treatmentPlan?: string;
    monitoringFrequency?: string;
    notes?: string;
    photoUrls?: string[];
    photourls?: string[];
    [key: string]: any;
}

interface ViewIllnessModalProps {
    visible: boolean;
    onClose: () => void;
    illness: IllnessRecord | null;
}

const ViewIllnessModal: React.FC<ViewIllnessModalProps & RecordLinkTabsProp> = ({ linkTabs, visible, onClose, illness }) => {
    const { t } = useTranslation();

    const { themeColors } = useUserRole();

    const styles = useMemo(() => makeViewIllnessModalStyles(themeColors as RoleTheme), [themeColors]);

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

    const name = getField(illness, 'conditionName', 'conditionname', 'name');
    const alternateName = getField(illness, 'alternateName', 'alternatename', 'diagnosis');
    const status = getField(illness, 'status');
    const category = getField(illness, 'categorylabel');
    const severity = getField(illness, 'severitylabel');
    const chronic = getField(illness, 'chronic');

    const diagnosingProvider = getField(illness, 'diagnosingProvider', 'diagnosingprovider');
    const facility = getField(illness, 'facility');
    const icd10Code = getField(illness, 'icd10Code', 'icd10code');
    const snomedCode = getField(illness, 'snomedCode', 'snomedcode');
    const symptoms = getField(illness, 'symptoms');
    const triggerFactors = getField(illness, 'triggerFactors', 'triggerfactors');
    const familyHistory = getField(illness, 'familyHistory', 'familyhistory');

    const onsetDate = formatDate(getField(illness, 'onsetDate', 'onsetdate'));
    const diagnosisDate = formatDate(getField(illness, 'diagnosisDate', 'diagnosisdate'));
    const resolvedDate = formatDate(getField(illness, 'resolvedDate', 'resolveddate'));
    const lastFlareUp = formatDate(getField(illness, 'lastFlareUp', 'lastflareup'));
    const nextReviewDate = formatDate(getField(illness, 'nextReviewDate', 'nextreviewdate'));

    const linkedMedicationName =
        getField(illness, 'linkedmedicationname') ||
        getField(illness, 'linkedMedicationName') ||
        getField(illness?.linkedmedicationdetail, 'medicationname', 'name') ||
        getField(illness, 'linkedMedication', 'linkedmedication');
    const linkedDoctorName =
        getField(illness, 'linkeddoctorname') ||
        getField(illness, 'linkedDoctorName') ||
        getField(illness?.linkeddoctordetail, 'name') ||
        getField(illness, 'linkedDoctor', 'linkeddoctor');
    const linkedAllergies = getField(illness, 'linkedAllergies', 'linkedallergies');
    const treatmentPlan = getField(illness, 'treatmentPlan', 'treatmentplan');
    const monitoringFrequency = getField(illness, 'monitoringFrequency', 'monitoringfrequency');
    const notes = getField(illness, 'notes');

    const attachments: string[] = [];
    if (Array.isArray(illness?.photoUrls)) {
        attachments.push(...illness.photoUrls.filter(Boolean));
    } else if (Array.isArray(illness?.photourls)) {
        attachments.push(...illness.photourls.filter(Boolean));
    } else if (illness?.photoUrls || illness?.photourls) {
        const single = String(illness?.photoUrls || illness?.photourls);
        if (single) attachments.push(single);
    }


    return (
        <Modal
            visible={visible && illness !== null}
            transparent={true}
            animationType="fade"
            onRequestClose={onClose}
        >
            <View style={styles.overlay}>
                <TouchableOpacity
                    style={styles.backdrop}
                    activeOpacity={1}
                    onPress={onClose}
                />
                <View style={styles.modalContainer}>
                    <View style={styles.topIconContainer}>
                        <View style={styles.topIconCircle}>
                            <MaterialCommunityIcons name="stethoscope" size={26} color={colors.white} />
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
                                {alternateName ? (
                                    <Text style={styles.headerSubtitle}>{alternateName}</Text>
                                ) : null}
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
                                <Text style={styles.label}>{t('health_tracker.category', { defaultValue: 'Category' })}</Text>
                                <Text style={styles.value}>{category || '-'}</Text>
                            </View>
                        </View>
                        <View style={styles.gridRow}>
                            <View style={styles.gridItem}>
                                <Text style={styles.label}>{t('health_tracker.severity', { defaultValue: 'Severity' })}</Text>
                                <Text style={styles.value}>{severity || '-'}</Text>
                            </View>
                            <View style={styles.gridItem}>
                                <Text style={styles.label}>{t('health_tracker.chronic', { defaultValue: 'Chronic' })}</Text>
                                <Text style={styles.value}>{chronic || '-'}</Text>
                            </View>
                        </View>
                        <View style={styles.gridRow}>
                            <View style={styles.gridItem}>
                                <Text style={styles.label}>{t('health_tracker.prescriber', { defaultValue: 'Prescriber' })}</Text>
                                <Text style={styles.value}>{diagnosingProvider || '-'}</Text>
                            </View>
                            <View style={styles.gridItem}>
                                <Text style={styles.label}>{t('health_tracker.prescriber_office', { defaultValue: 'Prescriber Office' })}</Text>
                                <Text style={styles.value}>{facility || '-'}</Text>
                            </View>
                        </View>

                        <Text style={styles.sectionTitle}>{t('health_tracker.timeline', { defaultValue: 'Timeline' })}</Text>
                        <View style={styles.gridRow}>
                            <View style={styles.gridItem}>
                                <Text style={styles.label}>{t('health_tracker.onset_date', { defaultValue: 'Onset Date' })}</Text>
                                <Text style={styles.value}>{onsetDate}</Text>
                            </View>
                            <View style={styles.gridItem}>
                                <Text style={styles.label}>{t('health_tracker.diagnosis_date', { defaultValue: 'Diagnosis Date' })}</Text>
                                <Text style={styles.value}>{diagnosisDate}</Text>
                            </View>
                        </View>
                        <View style={styles.gridRow}>
                            <View style={styles.gridItem}>
                                <Text style={styles.label}>{t('health_tracker.resolved_date', { defaultValue: 'Resolved Date' })}</Text>
                                <Text style={styles.value}>{resolvedDate}</Text>
                            </View>
                            <View style={styles.gridItem}>
                                <Text style={styles.label}>{t('health_tracker.last_flare_up', { defaultValue: 'Last Flare-Up' })}</Text>
                                <Text style={styles.value}>{lastFlareUp}</Text>
                            </View>
                        </View>
                        <View style={styles.gridRow}>
                            <View style={styles.gridItem}>
                                <Text style={styles.label}>{t('health_tracker.next_review_date', { defaultValue: 'Next Review Date' })}</Text>
                                <Text style={styles.value}>{nextReviewDate}</Text>
                            </View>
                        </View>

                        <Text style={styles.sectionTitle}>{t('health_tracker.clinical_details', { defaultValue: 'Clinical Details' })}</Text>
                        <View style={styles.gridRow}>
                            <View style={styles.gridItem}>
                                <Text style={styles.label}>{t('health_tracker.diagnosing_provider', { defaultValue: 'Diagnosing Provider' })}</Text>
                                <Text style={styles.value}>{diagnosingProvider || '-'}</Text>
                            </View>
                            <View style={styles.gridItem}>
                                <Text style={styles.label}>{t('health_tracker.facility', { defaultValue: 'Facility' })}</Text>
                                <Text style={styles.value}>{facility || '-'}</Text>
                            </View>
                        </View>
                        <View style={styles.gridRow}>
                            <View style={styles.gridItem}>
                                <Text style={styles.label}>{t('health_tracker.icd10_code', { defaultValue: 'ICD-10 Code' })}</Text>
                                <Text style={styles.value}>{icd10Code || '-'}</Text>
                            </View>
                            <View style={styles.gridItem}>
                                <Text style={styles.label}>{t('health_tracker.snomed_code', { defaultValue: 'SNOMED Code' })}</Text>
                                <Text style={styles.value}>{snomedCode || '-'}</Text>
                            </View>
                        </View>
                        <View style={styles.gridRow}>
                            <View style={styles.gridItem}>
                                <Text style={styles.label}>{t('health_tracker.symptoms', { defaultValue: 'Symptoms' })}</Text>
                                <Text style={styles.value}>{symptoms || '-'}</Text>
                            </View>
                            <View style={styles.gridItem}>
                                <Text style={styles.label}>{t('health_tracker.trigger_factors', { defaultValue: 'Trigger Factors' })}</Text>
                                <Text style={styles.value}>{triggerFactors || '-'}</Text>
                            </View>
                        </View>
                        <View style={styles.singleRow}>
                            <Text style={styles.label}>{t('health_tracker.family_history', { defaultValue: 'Family History' })}</Text>
                            <View style={styles.notesBox}>
                                <Text style={styles.notesText}>{familyHistory || '-'}</Text>
                            </View>
                        </View>

                        <Text style={styles.sectionTitle}>{t('health_tracker.management_relationships', { defaultValue: 'Management & Relationships' })}</Text>
                        <View style={styles.gridRow}>
                            <View style={styles.gridItem}>
                                <Text style={styles.label}>{t('health_tracker.linked_medications', { defaultValue: 'Linked Medications' })}</Text>
                                <Text style={styles.value}>{linkedMedicationName || '-'}</Text>
                            </View>
                            <View style={styles.gridItem}>
                                <Text style={styles.label}>{t('health_tracker.linked_doctors', { defaultValue: 'Linked Doctors' })}</Text>
                                <Text style={styles.value}>{linkedDoctorName || '-'}</Text>
                            </View>
                        </View>
                        <View style={styles.gridRow}>
                            <View style={styles.gridItem}>
                                <Text style={styles.label}>{t('health_tracker.linked_allergies', { defaultValue: 'Linked Allergies' })}</Text>
                                <Text style={styles.value}>{linkedAllergies || '-'}</Text>
                            </View>
                        </View>
                        <View style={styles.singleRow}>
                            <Text style={styles.label}>{t('health_tracker.treatment_plan', { defaultValue: 'Treatment Plan' })}</Text>
                            <View style={styles.notesBox}>
                                <Text style={styles.notesText}>{treatmentPlan || '-'}</Text>
                            </View>
                        </View>
                        <View style={styles.gridRow}>
                            <View style={styles.gridItem}>
                                <Text style={styles.label}>{t('health_tracker.monitoring_frequency', { defaultValue: 'Monitoring Frequency' })}</Text>
                                <Text style={styles.value}>{monitoringFrequency || '-'}</Text>
                            </View>
                        </View>
                        <View style={styles.singleRow}>
                            <Text style={styles.label}>{t('health_tracker.notes', { defaultValue: 'Notes' })}</Text>
                            <View style={styles.notesBox}>
                                <Text style={styles.notesText}>{notes || '-'}</Text>
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

export default ViewIllnessModal;
