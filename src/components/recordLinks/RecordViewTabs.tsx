import React, { useEffect, useMemo, useState } from 'react';
import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { useTranslation } from 'react-i18next';
import FONTS from '../../utils/fonts';
import { useUserRole } from '../../hooks/useUserRole';
import type { RoleTheme } from '../../types/roleManager.types';
import type { RecordLinkRef } from '../../services/recordLinks';
import { LinkedRecordsPanel } from './LinkedRecordsPanel';

export interface RecordViewTabsProps {
  /** The record shown; no record = no tabs, just the details. */
  record?: RecordLinkRef | null;
  /** Manage links / Edit allowed (false for shared or emergency views). */
  canEdit?: boolean;
  /** A record someone shared with you: only the linked records they shared. */
  ownerUserId?: number | null;
  /** Close the pop-up before opening another screen. */
  onNavigate?: () => void;
  /** Extra tabs between Details and Linked records (e.g. Expenses). */
  extraTabs?: { key: string; label: string; render: () => React.ReactNode }[];
  /** Space above the tab strip (e.g. room for a pop-up's floating close button). */
  topInset?: number;
  /** Keep the details centred (pop-ups that centre their content). */
  alignCenter?: boolean;
  /** Pop-ups that don't scroll: the Linked records / Expenses tabs scroll within this height. */
  contentMaxHeight?: number;
  /** False when the details already show the record's notes (vehicles), so Linked records doesn't repeat them. */
  showNotes?: boolean;
  children: React.ReactNode;
}

/**
 * "Details | Linked records" tabs at the top of a record's view pop-up (as the web shows Linked records as a tab,
 * so it never pushes the details down). Without a record it renders the details alone.
 */
export function RecordViewTabs({ record, canEdit = true, ownerUserId, onNavigate, extraTabs, topInset, alignCenter, contentMaxHeight, showNotes = true, children }: RecordViewTabsProps) {
  const { t } = useTranslation();
  const { themeColors } = useUserRole();
  const theme = themeColors as RoleTheme;
  const styles = useMemo(() => makeStyles(theme), [theme]);
  const [tab, setTab] = useState('details');

  // A different record opens on its details.
  useEffect(() => setTab('details'), [record?.moduleKey, record?.id]);

  if (!record?.id) return <>{children}</>;

  const tabs = [
    { key: 'details', label: t('record_links.details_tab') },
    ...(extraTabs ?? []).map(x => ({ key: x.key, label: x.label })),
    { key: 'links', label: t('record_links.panelTitle') },
  ];
  const extra = extraTabs?.find(x => x.key === tab);

  const other = extra ? (
    extra.render()
  ) : (
    <LinkedRecordsPanel record={record} canEdit={canEdit} ownerUserId={ownerUserId} onNavigate={onNavigate} showNotes={showNotes} />
  );

  return (
    <View style={{ alignSelf: 'stretch' }}>
      <View style={[styles.strip, topInset ? { marginTop: topInset } : null]} accessibilityRole="tablist">
        {tabs.map(x => {
          const active = x.key === tab;
          return (
            <TouchableOpacity
              key={x.key}
              onPress={() => setTab(x.key)}
              style={[styles.tab, active && { borderBottomColor: theme.primary }]}
              accessibilityRole="tab"
              accessibilityState={{ selected: active }}
            >
              <Text style={[styles.tabText, active && { color: theme.primary, fontFamily: FONTS.display_semi_bold }]} numberOfLines={1}>
                {x.label}
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>
      {tab === 'details' ? (
        alignCenter ? <View style={{ alignItems: 'center' }}>{children}</View> : children
      ) : contentMaxHeight ? (
        <ScrollView style={{ maxHeight: contentMaxHeight }} nestedScrollEnabled>{other}</ScrollView>
      ) : (
        other
      )}
    </View>
  );
}

const makeStyles = (theme: RoleTheme) =>
  StyleSheet.create({
    strip: {
      flexDirection: 'row',
      borderBottomWidth: StyleSheet.hairlineWidth,
      borderBottomColor: theme.border,
      marginBottom: 16,
    },
    tab: {
      flex: 1,
      alignItems: 'center',
      paddingVertical: 10,
      borderBottomWidth: 2,
      borderBottomColor: 'transparent',
      marginBottom: -StyleSheet.hairlineWidth,
    },
    tabText: { fontSize: 14, fontFamily: FONTS.display_medium, color: theme.textSecondary },
  });

/** Prop a record's view pop-up takes to show the Details / Linked records tabs. */
export interface RecordLinkTabsProp {
  linkTabs?: Omit<RecordViewTabsProps, 'children'>;
}
