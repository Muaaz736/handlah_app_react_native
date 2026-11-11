import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { RecordNotesView } from '../notes/RecordNotesView';
import { ActivityIndicator, Modal, StyleSheet, Text, TouchableOpacity, TouchableWithoutFeedback, View } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { useTranslation } from 'react-i18next';
import Feather from 'react-native-vector-icons/Feather';
import FONTS from '../../utils/fonts';
import { useUserRole } from '../../hooks/useUserRole';
import { useSelectedBusiness } from '../../hooks/useSelectedBusiness';
import type { RoleTheme } from '../../types/roleManager.types';
import recordLinkService, { recordLinkKey, type LinkableRecord, type RecordLinkRef } from '../../services/recordLinks';
import { useRecordLinkSelection } from '../../hooks/useRecordLinkSelection';
import { RECORD_LINK_MODULE, recordLinkScreen } from '../../constants/recordLinkModules';
import { LinkedRecordViewer, hasRecordViewer } from './LinkedRecordViewer';
import { showErrorToast, showSuccessToast } from '../common/CustomToast';
import { RecordLinkPicker } from './RecordLinkPicker';

interface LinkedRecordsPanelProps {
  /** The record whose links are shown. */
  record: RecordLinkRef;
  /** Show Manage links and Edit (false for read-only shared or emergency views). */
  canEdit?: boolean;
  /** Set when viewing a record someone shared with you: only what they shared, read-only. */
  ownerUserId?: number | null;
  /** Called before leaving for another screen (close the pop-up this panel is in). */
  onNavigate?: () => void;
  /** False when the record's Details already show its notes (vehicles), so they aren't shown twice. */
  showNotes?: boolean;
}

/**
 * The "Linked records" tab of a record's view: every linked record grouped by module (records attached through
 * their own field are tagged "Attached"), with View and Edit, and Manage links to change them. View shows the
 * record in a pop-up on this screen, with a button to open it in its module; Edit opens the module's edit form,
 * which asks for Face ID / Touch ID / fingerprint first for protected records (bank accounts, bookmarks,
 * subscriptions, social media), as when editing from the module itself.
 */
export function LinkedRecordsPanel({ record, canEdit: canEditProp = true, ownerUserId, onNavigate, showNotes = true }: LinkedRecordsPanelProps) {
  const { t } = useTranslation();
  const navigation = useNavigation<any>();
  const { themeColors, isBusinessRole } = useUserRole();
  const { selectedBusinessId } = useSelectedBusiness();
  const theme = themeColors as RoleTheme;
  const styles = useMemo(() => makeStyles(theme), [theme]);
  const businessId = isBusinessRole() ? selectedBusinessId ?? null : null;
  const isSharedView = ownerUserId != null;
  const canEdit = canEditProp && !isSharedView;

  const [links, setLinks] = useState<LinkableRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [failed, setFailed] = useState(false);
  const [editing, setEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [viewing, setViewing] = useState<LinkableRecord | null>(null);
  /** The linked record shown in its own module pop-up. */
  const [viewingFull, setViewingFull] = useState<LinkableRecord | null>(null);

  const { moduleKey, id: recordId } = record;
  const load = useCallback(async () => {
    setLoading(true);
    setFailed(false);
    try {
      setLinks(await recordLinkService.getLinks({ moduleKey, id: recordId }, businessId, ownerUserId));
    } catch {
      setFailed(true);
      setLinks([]);
    } finally {
      setLoading(false);
    }
  }, [moduleKey, recordId, businessId, ownerUserId]);

  useEffect(() => {
    setEditing(false);
    load();
  }, [load]);

  const selection = useRecordLinkSelection({ moduleKey, recordId, businessId, enabled: editing });

  const groups = useMemo(() => {
    const byModule = new Map<string, LinkableRecord[]>();
    for (const l of links) byModule.set(l.moduleName, [...(byModule.get(l.moduleName) ?? []), l]);
    return [...byModule.entries()];
  }, [links]);

  const handleSave = async () => {
    setSaving(true);
    const ok = await selection.save(recordId);
    setSaving(false);
    if (!ok) {
      showErrorToast(t('record_links.saveFailed'));
      return;
    }
    showSuccessToast(t('record_links.saved'));
    setEditing(false);
    load();
  };

  const canEditLink = (link: LinkableRecord) =>
    (isSharedView ? link.accessLevel === 'write' : canEditProp) && !!recordLinkScreen(link.moduleKey)?.canEdit;

  const go = (link: LinkableRecord, mode: 'view' | 'edit') => {
    const target = recordLinkScreen(link.moduleKey);
    if (!target) return;
    const id = target.useParent ? link.parentId : link.id;
    if (!id) return;
    const params: Record<string, unknown> = mode === 'edit' ? { openEntityIdForEdit: id } : { openEntityId: id };
    if (isSharedView) {
      params.connectionTabSource = 'shared_with_you';
      params.ownerId = ownerUserId;
      params.accessLevel = link.accessLevel ?? 'read';
    }
    setViewing(null);
    onNavigate?.();
    // push: a new screen even when the linked record is in the same module as this one.
    if (typeof navigation.push === 'function') navigation.push(target.screen, params);
    else navigation.navigate(target.screen, params);
  };

  if (isSharedView && !loading && !failed && links.length === 0) {
    return <Text style={styles.muted}>{t('record_links.sharedEmpty')}</Text>;
  }

  return (
    <View>
      {/* The record's notes (encrypted ones hidden until shown), editable when the API allows it, also on a sold vehicle. */}
      {showNotes && <RecordNotesView moduleKey={moduleKey} recordId={recordId} editable={canEdit} />}
      <View style={styles.header}>
        <Text style={[styles.muted, { flex: 1 }]}>
          {isSharedView ? t('record_links.sharedPanelSubtitle') : t('record_links.panelSubtitle')}
        </Text>
        {canEdit && !editing && (
          <TouchableOpacity style={styles.manage} onPress={() => setEditing(true)} activeOpacity={0.7}>
            <Feather name="link-2" size={13} color={theme.textPrimary} />
            <Text style={styles.manageText}>{links.length ? t('record_links.manage') : t('record_links.linkRecord')}</Text>
          </TouchableOpacity>
        )}
      </View>

      {editing && (
        <View style={styles.editor}>
          <RecordLinkPicker
            compact
            options={selection.options}
            selected={selection.selected}
            onChange={selection.setSelected}
            loading={selection.loading}
            error={selection.error}
          />
          <View style={styles.editorActions}>
            <TouchableOpacity onPress={() => setEditing(false)} style={styles.cancelBtn}>
              <Text style={styles.cancelText}>{t('record_links.cancel')}</Text>
            </TouchableOpacity>
            <TouchableOpacity
              onPress={handleSave}
              disabled={saving || selection.loading}
              style={[styles.saveBtn, { backgroundColor: theme.primary }, (saving || selection.loading) && { opacity: 0.6 }]}
            >
              <Text style={styles.saveText}>{saving ? t('record_links.saving') : t('record_links.save')}</Text>
            </TouchableOpacity>
          </View>
        </View>
      )}

      {loading ? (
        <View style={styles.loading}>
          <ActivityIndicator size="small" color={theme.primary} />
          <Text style={styles.muted}>{t('record_links.loading')}</Text>
        </View>
      ) : failed ? (
        <Text style={[styles.muted, { color: '#D32F2F' }]}>{t('record_links.loadFailed')}</Text>
      ) : links.length === 0 ? (
        <Text style={styles.muted}>{t('record_links.empty')}</Text>
      ) : (
        groups.map(([moduleName, items]) => (
          <View key={moduleName} style={styles.group}>
            <Text style={styles.groupTitle}>{moduleName.toUpperCase()}</Text>
            {items.map(link => {
              const target = recordLinkScreen(link.moduleKey);
              return (
                <View key={recordLinkKey(link)} style={styles.row}>
                  <View style={{ flex: 1, minWidth: 0 }}>
                    <View style={styles.nameRow}>
                      <Text style={styles.name} numberOfLines={1}>{link.name}</Text>
                      {link.isAttached && (
                        <View style={styles.attached}>
                          <Text style={styles.attachedText}>{t('record_links.attached')}</Text>
                        </View>
                      )}
                    </View>
                    {!!link.subtitle && <Text style={styles.sub} numberOfLines={1}>{link.subtitle}</Text>}
                  </View>
                  {target && (
                    <View style={styles.actions}>
                      <TouchableOpacity
                        onPress={() => (hasRecordViewer(link.moduleKey) ? setViewingFull(link) : setViewing(link))}
                        hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                        accessibilityLabel={t('record_links.viewRecord', { name: link.name })}
                      >
                        <Feather name="eye" size={18} color={theme.primary} />
                      </TouchableOpacity>
                      {canEditLink(link) && (
                        <TouchableOpacity
                          onPress={() => go(link, 'edit')}
                          hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                          accessibilityLabel={t('record_links.editRecord', { name: link.name })}
                        >
                          <Feather name="edit-2" size={17} color={theme.primary} />
                        </TouchableOpacity>
                      )}
                    </View>
                  )}
                </View>
              );
            })}
          </View>
        ))
      )}

      {canEdit && record.moduleKey !== RECORD_LINK_MODULE.Bookmark && (
        <TouchableOpacity
          style={styles.addBookmark}
          onPress={() => {
            onNavigate?.();
            navigation.navigate('AddBookmark', { linkTo: recordLinkKey(record) });
          }}
          accessibilityHint={t('record_links.addBookmarkHint')}
        >
          <Feather name="bookmark" size={14} color={theme.primary} />
          <Text style={[styles.addBookmarkText, { color: theme.primary }]}>{t('record_links.addBookmark')}</Text>
        </TouchableOpacity>
      )}

      {/* View: the record's own module pop-up, on this screen. */}
      <LinkedRecordViewer
        link={viewingFull}
        businessId={businessId}
        ownerUserId={ownerUserId}
        onClose={() => setViewingFull(null)}
        onFallback={link => {
          setViewingFull(null);
          setViewing(link);
        }}
      />

      {/* View for records without a pop-up of their own: a summary, with Open in module. */}
      <Modal visible={!!viewing} transparent animationType="fade" onRequestClose={() => setViewing(null)}>
        <View style={styles.overlay}>
          <TouchableWithoutFeedback onPress={() => setViewing(null)}>
            <View style={StyleSheet.absoluteFill} />
          </TouchableWithoutFeedback>
          {viewing && (
            <View style={styles.popup}>
              <View style={styles.popupHeader}>
                <Text style={styles.groupTitle}>{viewing.moduleName.toUpperCase()}</Text>
                <TouchableOpacity onPress={() => setViewing(null)} hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}>
                  <Feather name="x" size={20} color={theme.textPrimary} />
                </TouchableOpacity>
              </View>
              <Text style={styles.popupTitle}>{viewing.name}</Text>
              {!!viewing.subtitle && <Text style={styles.sub}>{viewing.subtitle}</Text>}
              {viewing.isAttached && <Text style={[styles.sub, { marginTop: 8 }]}>{t('record_links.attachedHint')}</Text>}
              <View style={styles.popupActions}>
                {canEditLink(viewing) && (
                  <TouchableOpacity style={styles.cancelBtn} onPress={() => go(viewing, 'edit')}>
                    <Text style={styles.cancelText}>{t('record_links.edit')}</Text>
                  </TouchableOpacity>
                )}
                <TouchableOpacity style={[styles.saveBtn, { backgroundColor: theme.primary }]} onPress={() => go(viewing, 'view')}>
                  <Text style={styles.saveText}>{t('record_links.openInModule')}</Text>
                </TouchableOpacity>
              </View>
            </View>
          )}
        </View>
      </Modal>
    </View>
  );
}

const makeStyles = (theme: RoleTheme) =>
  StyleSheet.create({
    header: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 12 },
    muted: { fontSize: 13, fontFamily: FONTS.display_regular, color: theme.textSecondary },
    manage: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 4,
      borderWidth: 1,
      borderColor: theme.textPrimary,
      borderRadius: 10,
      paddingHorizontal: 10,
      paddingVertical: 6,
    },
    manageText: { fontSize: 12, fontFamily: FONTS.display_semi_bold, color: theme.textPrimary },
    editor: { backgroundColor: theme.surface, borderRadius: 12, padding: 12, marginBottom: 12 },
    editorActions: { flexDirection: 'row', justifyContent: 'flex-end', gap: 8, marginTop: 12 },
    cancelBtn: { paddingHorizontal: 14, paddingVertical: 9, borderRadius: 10, borderWidth: 1, borderColor: theme.border },
    cancelText: { fontSize: 13, fontFamily: FONTS.display_medium, color: theme.textPrimary },
    saveBtn: { paddingHorizontal: 16, paddingVertical: 9, borderRadius: 10 },
    saveText: { fontSize: 13, fontFamily: FONTS.display_semi_bold, color: '#fff' },
    loading: { flexDirection: 'row', alignItems: 'center', gap: 8, paddingVertical: 8 },
    group: { marginBottom: 12 },
    groupTitle: { fontSize: 11, letterSpacing: 0.5, fontFamily: FONTS.display_semi_bold, color: theme.textSecondary, marginBottom: 6 },
    row: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 12,
      borderRadius: 12,
      borderWidth: StyleSheet.hairlineWidth,
      borderColor: theme.border,
      backgroundColor: theme.surface,
      paddingHorizontal: 12,
      paddingVertical: 10,
      marginBottom: 6,
    },
    nameRow: { flexDirection: 'row', alignItems: 'center', gap: 6 },
    name: { flexShrink: 1, fontSize: 14, fontFamily: FONTS.display_medium, color: theme.textPrimary },
    sub: { fontSize: 12, fontFamily: FONTS.display_regular, color: theme.textSecondary, marginTop: 2 },
    attached: { borderRadius: 999, paddingHorizontal: 6, paddingVertical: 1, backgroundColor: theme.border },
    attachedText: { fontSize: 10, fontFamily: FONTS.display_medium, color: theme.textSecondary },
    actions: { flexDirection: 'row', alignItems: 'center', gap: 16 },
    overlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.45)', justifyContent: 'center', padding: 24 },
    popup: { backgroundColor: theme.background, borderRadius: 18, padding: 20 },
    popupHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
    popupTitle: { fontSize: 19, fontFamily: FONTS.display_semi_bold, color: theme.textPrimary, marginTop: 4 },
    popupActions: { flexDirection: 'row', justifyContent: 'flex-end', gap: 8, marginTop: 20 },
    addBookmark: { flexDirection: 'row', alignItems: 'center', gap: 6, marginTop: 4, paddingVertical: 6 },
    addBookmarkText: { fontSize: 13, fontFamily: FONTS.display_medium },
  });
