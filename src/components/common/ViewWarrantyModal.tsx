import React, { useMemo } from 'react';
import {
  View,
  Text,
  Modal,
  ScrollView,
  TouchableOpacity,
  TouchableWithoutFeedback,
} from 'react-native';
import { useTranslation } from 'react-i18next';
import Feather from 'react-native-vector-icons/Feather';
import colors from '../../utils/colors';
import { useUserRole } from '../../hooks/useUserRole';
import RemoteImage from './RemoteImage';
import { makeViewWarrantyModalStyles } from './ViewWarrantyModal.styles';
import MixedMediaDisplayer from './MixedMediaDisplayer';
import { RoleTheme } from '../../types/roleManager.types';
import { formatBillingAmount } from '../../utils/billingFrequency';
import { RecordViewTabs, type RecordLinkTabsProp } from '../recordLinks/RecordViewTabs';
import CopyableText from './CopyableText';

interface ViewWarrantyModalProps {
  visible: boolean;
  onClose: () => void;
  warranty: any;
}

const ViewWarrantyModal: React.FC<ViewWarrantyModalProps & RecordLinkTabsProp> = ({ linkTabs,
  visible,
  onClose,
  warranty,
}) => {
  const { t } = useTranslation();
  const { themeColors } = useUserRole();
  const styles = useMemo(() => makeViewWarrantyModalStyles(themeColors as RoleTheme), [themeColors]);

  const formatDate = (dateStr?: string): string => {
    if (!dateStr) return t('common.na') || 'N/A';
    try {
      const date = new Date(dateStr);
      if (isNaN(date.getTime())) return t('common.na') || 'N/A';
      return `${String(date.getMonth() + 1).padStart(2, '0')}/${String(date.getDate()).padStart(2, '0')}/${date.getFullYear()}`;
    } catch {
      return t('common.na') || 'N/A';
    }
  };

  if (!warranty) return null;

  const itemName = warranty.itemname || warranty.itemName || warranty.name || '';
  const provider = warranty.warrantyprovider || warranty.warrantyProvider || warranty.provider || '';
  const startDate = warranty.startdate || warranty.startDate || '';
  const expiration = warranty.expiration || warranty.expiryDate || '';
  const notes = warranty.notes || '';
  const website = warranty.website || '';
  const attachment = warranty.uploadattachments || warranty.uploadAttachments || warranty.attachment || null;
  const warrantyNumber = warranty.warrantynumber || warranty.warrantyNumber || '';
  const costNum = warranty.cost != null && warranty.cost !== '' ? Number(warranty.cost) : NaN;
  const cost = Number.isFinite(costNum)
    ? formatBillingAmount(
        `$${costNum.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`,
        (warranty as any).billingfrequency || (warranty as any).billingFrequency,
      )
    : warranty.cost != null ? String(warranty.cost) : '';

  const rows: { label: string; value: string; copy?: boolean }[] = [
    { label: t('warranties.item_name') || 'Item Name', value: itemName || (t('common.na') || 'N/A') },
    { label: t('warranties.warranty_provider') || 'Warranty Provider', value: provider || (t('common.na') || 'N/A') },
    { label: t('warranties.start_date') || 'Start Date', value: formatDate(startDate) },
    { label: t('warranties.expiration') || 'Expiration', value: formatDate(expiration) },
    { label: t('warranties.notes') || 'Notes', value: notes || "none" },
    { label: t('warranties.website') || 'Website', value: website || "none", copy: true },
    ...(warrantyNumber ? [{ label: t('warranties.warranty_number') || 'Warranty #', value: warrantyNumber, copy: true }] : []),
    ...(cost ? [{ label: t('real_estate.cost') || 'Cost', value: cost }] : []),
  ];

  const realestate = (warranty as any).realestate;
  const vehicle = (warranty as any).vehicle;
  const property = (warranty as any).property;

  return (
    <Modal
      visible={visible}
      transparent={true}
      animationType="fade"
      onRequestClose={onClose}
    >
      <View style={styles.overlay}>
        <TouchableWithoutFeedback onPress={onClose}>
          <View style={styles.overlayTouchable} />
        </TouchableWithoutFeedback>

        <View style={styles.modalContainer}>
          {/* Header */}
          <View style={[styles.modalHeader, { backgroundColor: themeColors.primary }]}>
            <Text style={styles.modalTitle} numberOfLines={1}>
              {itemName || (t('warranties.warranty') || 'Warranty')}
            </Text>
            <TouchableOpacity onPress={onClose} style={styles.closeButton}>
              <Feather name="x" size={22} color={colors.white} />
            </TouchableOpacity>
          </View>

          <ScrollView
            style={styles.scrollView}
            contentContainerStyle={styles.scrollContent}
            showsVerticalScrollIndicator={false}
            nestedScrollEnabled={true}
          >
            <RecordViewTabs {...linkTabs} onNavigate={linkTabs?.onNavigate ?? onClose}>

            {rows.map((row, index) => (
              <View
                key={index}
                style={[
                  styles.detailRow,
                  index < rows.length - 1 && styles.detailRowBorder,
                ]}
              >
                <Text style={styles.detailLabel}>{row.label}</Text>
                {row.copy ? (
                  <CopyableText style={styles.detailValue} value={row.value} label={row.label} />
                ) : (
                  <Text style={styles.detailValue}>{row.value}</Text>
                )}
              </View>
            ))}
            {/* Linked Asset Section */}
            {(realestate || vehicle || property) && (
              <View style={styles.linkedSection}>
                {realestate && (
                  <>
                    <Text style={[styles.linkedSectionTitle, { color: themeColors.primary }]}>
                      {t('warranties.linked_real_estate')}
                    </Text>
                    {(realestate.nickname) ? (
                      <View style={[styles.detailRow, styles.detailRowBorder]}>
                        <Text style={styles.detailLabel}>{t('warranties.property_name')}</Text>
                        <Text style={styles.detailValue}>{realestate.nickname}</Text>
                      </View>
                    ) : null}

                    {(realestate.streetaddress || realestate.city || realestate.state || realestate.country) ? (
                      <View style={styles.detailRow}>
                        <Text style={styles.detailLabel}>{t('warranties.address')}</Text>
                        <Text style={styles.detailValue}>
                          {[realestate.streetaddress, realestate.aptsuite, realestate.city, realestate.state, realestate.zip, realestate.country].filter(Boolean).join(', ')}
                        </Text>
                      </View>
                    ) : null}
                  </>
                )}
                {vehicle && (
                  <>
                    <Text style={[styles.linkedSectionTitle, { color: themeColors.primary }]}>
                      {t('warranties.linked_vehicle')}
                    </Text>
                    {(vehicle.year || vehicle.make || vehicle.model) ? (
                      <View style={[styles.detailRow, styles.detailRowBorder]}>
                        <Text style={styles.detailLabel}>{t('warranties.vehicle_name')}</Text>
                        <Text style={styles.detailValue}>{[vehicle.year, vehicle.make, vehicle.model].filter(Boolean).join(' ')}</Text>
                      </View>
                    ) : null}
                    {vehicle.nickname ? (
                      <View style={[styles.detailRow, styles.detailRowBorder]}>
                        <Text style={styles.detailLabel}>{t('warranties.nickname')}</Text>
                        <Text style={styles.detailValue}>{vehicle.nickname}</Text>
                      </View>
                    ) : null}
                    {vehicle.licenseplatenumber ? (
                      <View style={[styles.detailRow, styles.detailRowBorder]}>
                        <Text style={styles.detailLabel}>{t('warranties.license_plate')}</Text>
                        <Text style={styles.detailValue}>{vehicle.licenseplatenumber}</Text>
                      </View>
                    ) : null}
                    {vehicle.vin ? (
                      <View style={styles.detailRow}>
                        <Text style={styles.detailLabel}>{t('warranties.vin')}</Text>
                        <Text style={styles.detailValue}>{vehicle.vin}</Text>
                      </View>
                    ) : null}
                  </>
                )}
                {property && (
                  <>
                    <Text style={[styles.linkedSectionTitle, { color: themeColors.primary }]}>
                      {t('warranties.linked_property')}
                    </Text>
                    {property.name ? (
                      <View style={[styles.detailRow, styles.detailRowBorder]}>
                        <Text style={styles.detailLabel}>{t('warranties.property_name')}</Text>
                        <Text style={styles.detailValue}>{property.name}</Text>
                      </View>
                    ) : null}
                    {property.modelserial ? (
                      <View style={[styles.detailRow, styles.detailRowBorder]}>
                        <Text style={styles.detailLabel}>{t('warranties.model_serial')}</Text>
                        <Text style={styles.detailValue}>{property.modelserial}</Text>
                      </View>
                    ) : null}
                    {property.price != null ? (
                      <View style={styles.detailRow}>
                        <Text style={styles.detailLabel}>{t('warranties.price')}</Text>
                        <Text style={styles.detailValue}>{String(property.price)}</Text>
                      </View>
                    ) : null}
                  </>
                )}
              </View>
            )}

            {attachment ? (
              <MixedMediaDisplayer
                attachmentIds={Array.isArray(attachment) ? attachment : [attachment]}
                showDocHeading={false}
              />
            ) : null}
            </RecordViewTabs>
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
};

export default ViewWarrantyModal;
