import React, { useMemo, useState } from 'react';
import { Modal, ScrollView, StyleSheet, Text, TouchableOpacity, TouchableWithoutFeedback, View } from 'react-native';
import { useTranslation } from 'react-i18next';
import Feather from 'react-native-vector-icons/Feather';
import FONTS from '../../utils/fonts';
import { useUserRole } from '../../hooks/useUserRole';
import type { RoleTheme } from '../../types/roleManager.types';
import type { RecordLinkRef } from '../../services/recordLinks';
import { LinkedRecordsPanel } from './LinkedRecordsPanel';

interface LinkedRecordsButtonProps {
  record: RecordLinkRef | null | undefined;
  /** The record's name, shown in the sheet's heading. */
  title?: string;
  canEdit?: boolean;
  ownerUserId?: number | null;
  /** Icon only (inside a card's action icons) or a labelled button. */
  variant?: 'icon' | 'button';
  iconColor?: string;
}

/**
 * Linked records for records shown as cards rather than in a pop-up (Identity Hub, pets, compliance, a vehicle's
 * service records…): a link icon / button that opens the same Linked records panel in a sheet.
 */
export function LinkedRecordsButton({ record, title, canEdit = true, ownerUserId, variant = 'icon', iconColor }: LinkedRecordsButtonProps) {
  const { t } = useTranslation();
  const { themeColors } = useUserRole();
  const theme = themeColors as RoleTheme;
  const styles = useMemo(() => makeStyles(theme), [theme]);
  const [open, setOpen] = useState(false);
  if (!record?.id) return null;

  return (
    <>
      {variant === 'icon' ? (
        <TouchableOpacity
          onPress={() => setOpen(true)}
          hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
          style={styles.iconBtn}
          accessibilityLabel={t('record_links.panelTitle')}
        >
          <Feather name="link-2" size={20} color={iconColor ?? theme.secondary} />
        </TouchableOpacity>
      ) : (
        <TouchableOpacity onPress={() => setOpen(true)} style={styles.button} activeOpacity={0.7}>
          <Feather name="link-2" size={15} color={theme.textPrimary} />
          <Text style={styles.buttonText}>{t('record_links.panelTitle')}</Text>
        </TouchableOpacity>
      )}

      <Modal visible={open} transparent animationType="fade" onRequestClose={() => setOpen(false)}>
        <View style={styles.overlay}>
          <TouchableWithoutFeedback onPress={() => setOpen(false)}>
            <View style={StyleSheet.absoluteFill} />
          </TouchableWithoutFeedback>
          <View style={styles.sheet}>
            <View style={styles.header}>
              <View style={{ flex: 1 }}>
                <Text style={styles.title}>{t('record_links.panelTitle')}</Text>
                {!!title && <Text style={styles.subtitle} numberOfLines={1}>{title}</Text>}
              </View>
              <TouchableOpacity onPress={() => setOpen(false)} hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}>
                <Feather name="x" size={20} color={theme.textPrimary} />
              </TouchableOpacity>
            </View>
            <ScrollView style={{ maxHeight: 460 }} nestedScrollEnabled>
              <LinkedRecordsPanel record={record} canEdit={canEdit} ownerUserId={ownerUserId} onNavigate={() => setOpen(false)} />
            </ScrollView>
          </View>
        </View>
      </Modal>
    </>
  );
}

const makeStyles = (theme: RoleTheme) =>
  StyleSheet.create({
    iconBtn: { padding: 4 },
    button: {
      flexDirection: 'row',
      alignItems: 'center',
      alignSelf: 'flex-start',
      gap: 6,
      borderWidth: 1,
      borderColor: theme.border,
      borderRadius: 10,
      paddingHorizontal: 12,
      paddingVertical: 8,
    },
    buttonText: { fontSize: 13, fontFamily: FONTS.display_medium, color: theme.textPrimary },
    overlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.45)', justifyContent: 'center', padding: 20 },
    sheet: { backgroundColor: theme.background, borderRadius: 18, padding: 18 },
    header: { flexDirection: 'row', alignItems: 'flex-start', gap: 8, marginBottom: 12 },
    title: { fontSize: 18, fontFamily: FONTS.display_semi_bold, color: theme.textPrimary },
    subtitle: { fontSize: 13, fontFamily: FONTS.display_regular, color: theme.textSecondary, marginTop: 2 },
  });
