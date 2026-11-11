import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { useTranslation } from 'react-i18next';
import FONTS from '../../utils/fonts';
import type { RecordStatus } from '../../utils/recordStatus';

function shortDate(value: string): string {
  const m = /^(\d{4})-(\d{2})-(\d{2})/.exec(value);
  const d = m ? new Date(Number(m[1]), Number(m[2]) - 1, Number(m[3])) : new Date(value);
  return Number.isNaN(d.getTime()) ? value : d.toLocaleDateString('en-US', { month: '2-digit', day: '2-digit', year: 'numeric' });
}

/** A grey "Sold" / "End dated" / "Expired" badge with its date, for an inactive record in a list (nothing when active). */
export function RecordStatusBadge({ status }: { status: RecordStatus }) {
  const { t } = useTranslation();
  if (status.kind === 'active') return null;
  return (
    <View style={styles.row}>
      <View style={styles.pill}>
        <Text style={styles.pillText}>{t(`record_status.${status.kind}`)}</Text>
      </View>
      {!!status.date && <Text style={styles.date}>{t(`record_status.${status.kind}On`, { date: shortDate(status.date) })}</Text>}
    </View>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: 'row', alignItems: 'center', gap: 6, marginTop: 4 },
  pill: { borderRadius: 999, paddingHorizontal: 10, paddingVertical: 3, backgroundColor: '#DADDDA' },
  pillText: { fontSize: 11, fontFamily: FONTS.display_semi_bold, color: '#3d3d3d' },
  date: { fontSize: 11, fontFamily: FONTS.display_regular, color: '#6f6f6f' },
});
