import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { showErrorToast } from '../components/common/CustomToast';
import recordLinkService, {
  createdRecordId,
  parseRecordLinkKey,
  recordLinkKey,
  type LinkableRecord,
  type RecordLinkRef,
} from '../services/recordLinks';
import { RECORD_LINK_MODULE } from '../constants/recordLinkModules';
import { useUserRole } from './useUserRole';
import { useSelectedBusiness } from './useSelectedBusiness';

interface Options {
  /** Module of the record being added or edited (e.g. "utility"). */
  moduleKey: string;
  /** Id of the record being edited; omit while adding a new one. */
  recordId?: number | null;
  /** Business scope (null/undefined = personal); 'auto' = the business selected in business mode, else personal. */
  businessId?: number | null | 'auto';
  /** False skips loading (e.g. a shared, read-only view). */
  enabled?: boolean;
  /** A "moduleKey:id" to preselect on a new record (e.g. the vehicle an expense is added from). */
  preselectKey?: string | null;
}

/**
 * State for "Select Records to Link" (same behaviour as the web app): the records that can be linked, the current
 * selection (the record's existing links when editing) and `saveOrWarn`, which stores the selection once the record
 * has an id. Saving is skipped when nothing changed.
 */
export function useRecordLinkSelection({ moduleKey, recordId, businessId: businessIdOption, enabled = true, preselectKey }: Options) {
  const { t } = useTranslation();
  const { isBusinessRole } = useUserRole();
  const { selectedBusinessId } = useSelectedBusiness();
  const businessId = businessIdOption === 'auto' ? (isBusinessRole() ? selectedBusinessId ?? null : null) : businessIdOption;
  const [options, setOptions] = useState<LinkableRecord[]>([]);
  const [selected, setSelected] = useState<string[]>([]);
  const [loading, setLoading] = useState(enabled);
  const [error, setError] = useState(false);
  const initialRef = useRef('');

  useEffect(() => {
    if (!enabled) {
      setLoading(false);
      return;
    }
    let cancelled = false;
    const exclude = recordId ? { moduleKey, id: recordId } : undefined;
    setLoading(true);
    setError(false);
    Promise.all([
      recordLinkService.getOptions(businessId, exclude),
      exclude ? recordLinkService.getLinks(exclude, businessId) : Promise.resolve<LinkableRecord[]>([]),
    ])
      .then(([opts, links]) => {
        if (cancelled) return;
        // Attached sub-records (a property's own warranties, expenses…) aren't links to edit here, except an
        // expense's real estate: picking or unpicking it assigns or unassigns the expense.
        const editable = (l: LinkableRecord) =>
          !l.isAttached || (moduleKey === RECORD_LINK_MODULE.Expense && l.moduleKey === RECORD_LINK_MODULE.RealEstate);
        const linkedKeys = links.filter(editable).map(recordLinkKey);
        const known = new Set(opts.map(recordLinkKey));
        setOptions([...opts, ...links.filter(l => editable(l) && !known.has(recordLinkKey(l)))]);
        // initialRef holds what's saved, so a preselection counts as a change and gets saved.
        setSelected(preselectKey && !linkedKeys.includes(preselectKey) ? [...linkedKeys, preselectKey] : linkedKeys);
        initialRef.current = [...linkedKeys].sort().join('|');
      })
      .catch(() => {
        if (!cancelled) setError(true);
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [moduleKey, recordId, businessId, enabled, preselectKey]);

  const dirty = useMemo(() => [...selected].sort().join('|') !== initialRef.current, [selected]);

  /** Saves the selection for `id`; `extraKeys` are links to add on top (e.g. expenses created in the same save). */
  const save = useCallback(
    async (id: number, extraKeys: string[] = [], force = false): Promise<boolean> => {
      const keys = [...new Set([...selected, ...extraKeys])];
      if (!enabled) return true;
      // force: save for another new record too (several records added at once with the same links).
      if (force ? keys.length === 0 : !dirty && keys.length === selected.length) return true;
      const refs = keys.map(parseRecordLinkKey).filter((r): r is RecordLinkRef => r !== null);
      try {
        await recordLinkService.setLinks({ moduleKey, id }, refs, businessId);
        initialRef.current = [...keys].sort().join('|');
        return true;
      } catch {
        return false;
      }
    },
    [businessId, dirty, enabled, moduleKey, selected],
  );

  /** `save`, with a toast if it failed. The record itself is already saved, so this never blocks the screen. */
  const saveOrWarn = useCallback(
    async (id: number | null | undefined, extraKeys: string[] = [], force = false): Promise<void> => {
      if (!id) {
        if (dirty || extraKeys.length) showErrorToast(t('record_links.saveFailed'));
        return;
      }
      if (!(await save(id, extraKeys, force))) showErrorToast(t('record_links.saveFailed'));
    },
    [dirty, save, t],
  );

  return { enabled, options, selected, setSelected, loading, error, dirty, save, saveOrWarn };
}

export type RecordLinkSelection = ReturnType<typeof useRecordLinkSelection>;

/**
 * After a form's create / update thunk: save the link selection when it succeeded. `editId` = the record being
 * edited; for a new record the id comes from the API's answer. A save queued offline has no id yet, so its links
 * can be added later from the record's Linked records tab.
 */
export function saveLinksAfter(
  links: RecordLinkSelection,
  action: any,
  editId?: number | string | null,
  /** Records to create first and link too (e.g. the expenses typed on a vehicle's form); returns their link keys. */
  createExtra?: () => Promise<string[]>,
  /** The form's notes (useRecordNotes), saved for the same record. */
  notes?: { saveOrWarn: (id: number | null | undefined) => Promise<void> },
): void {
  if (!links.enabled || action?.meta?.requestStatus !== 'fulfilled') return;
  if (action?.payload?._offlineQueued) return;
  const id = editId != null && editId !== '' ? Number(editId) : createdRecordId(action.payload);
  void (async () => {
    const extra = createExtra && id ? await createExtra() : [];
    await links.saveOrWarn(id, extra);
    if (notes) await notes.saveOrWarn(id);
  })();
}
