import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { showErrorToast } from '../components/common/CustomToast';
import { recordNotesMaxLength, recordNotesService } from '../services/recordNotes';

interface Options {
  /** A record-link module key, or "business" for the business profile. */
  moduleKey: string;
  /** The record being edited; omit while adding one. */
  recordId?: number | null;
  /** False skips loading and saving (someone else's read-only record). */
  enabled?: boolean;
  /**
   * The form already has its own notes box and saves the text with the record: only the "Encrypt notes" choice is kept
   * here (saved without the text, so the record's own save stays the source of the notes).
   */
  choiceOnly?: boolean;
}

/**
 * Notes of an Add / Edit form with the "Encrypt notes" choice (as useRecordLinkSelection does for links): loaded when
 * editing, saved by `saveOrWarn(id)` once the record has an id. A no-op when nothing changed.
 */
export function useRecordNotes({ moduleKey, recordId, enabled = true, choiceOnly = false }: Options) {
  const { t } = useTranslation();
  const [notes, setNotes] = useState('');
  const [encrypted, setEncrypted] = useState(false);
  const [loading, setLoading] = useState(Boolean(enabled && recordId));
  const [error, setError] = useState(false);
  const saved = useRef({ notes: '', encrypted: false });

  useEffect(() => {
    if (!enabled || !recordId) {
      setLoading(false);
      return;
    }
    let cancelled = false;
    setLoading(true);
    setError(false);
    recordNotesService
      .get(moduleKey, recordId)
      .then(r => {
        if (cancelled) return;
        setNotes(r.notes);
        setEncrypted(r.encrypted);
        saved.current = { notes: r.notes, encrypted: r.encrypted };
      })
      .catch(() => !cancelled && setError(true))
      .finally(() => !cancelled && setLoading(false));
    return () => {
      cancelled = true;
    };
  }, [moduleKey, recordId, enabled]);

  const dirty = useMemo(
    () => encrypted !== saved.current.encrypted || (!choiceOnly && notes.trim() !== saved.current.notes.trim()),
    [notes, encrypted, choiceOnly],
  );

  const save = useCallback(
    /** force: save for another new record too (several records added at once with the same notes). */
    async (id: number | null | undefined, force = false): Promise<boolean> => {
      if (!enabled || (!dirty && !(force && (notes.trim() || encrypted)))) return true;
      if (!id || error) return false;
      try {
        const r = await recordNotesService.set(moduleKey, Number(id), choiceOnly ? null : notes, encrypted);
        saved.current = { notes: r.notes, encrypted: r.encrypted };
        return true;
      } catch {
        return false;
      }
    },
    [enabled, dirty, error, moduleKey, notes, encrypted, choiceOnly],
  );

  const saveOrWarn = useCallback(
    async (id: number | null | undefined, force = false) => {
      if (!(await save(id, force))) showErrorToast(t('record_notes.saveFailed'));
    },
    [save, t],
  );

  return {
    enabled, notes, setNotes, encrypted, setEncrypted, loading, error, dirty, choiceOnly,
    maxLength: recordNotesMaxLength(moduleKey), save, saveOrWarn,
  };
}

export type RecordNotesState = ReturnType<typeof useRecordNotes>;
