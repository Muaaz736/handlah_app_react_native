import { apiHandle } from '../config/apiHandle';

/** The business profile's notes key (the others are the record-link module keys). */
export const RECORD_NOTES_BUSINESS = 'business';

/** Modules whose records have notes with the "Encrypt notes" choice (same list as the API's). */
export const RECORD_NOTES_MODULES: ReadonlySet<string> = new Set([
  'passport', 'driverlicense', 'licensecertification', 'socialmedia', 'bookmark',
  'pet', 'petvaccination', 'petillness', 'petmedication', 'petvetappointment',
  'healthmember', 'caregiver', 'doctor', 'healthappointment', 'illness', 'medication', 'surgery',
  'property', 'realestate', 'realestateservice', 'vehicle', 'vehicleservice', 'vehicleaccident',
  'loan', 'insurance', 'warranty', 'subscription', 'utility', 'legaldocument',
  'businesscontact', 'businessproject', 'businesslicense', 'compliancedocument', RECORD_NOTES_BUSINESS,
]);

export const hasRecordNotes = (moduleKey: string) => RECORD_NOTES_MODULES.has(moduleKey);

/** Health illnesses and surgeries take longer notes. */
export const recordNotesMaxLength = (moduleKey: string) => (moduleKey === 'illness' || moduleKey === 'surgery' ? 4000 : 2000);

export interface RecordNotes {
  notes: string;
  /** Kept encrypted at rest, like saved passwords. */
  encrypted: boolean;
  /** The caller may change them (owner, or shared with them for editing). */
  canEdit: boolean;
}

function pick(o: unknown, key: string): unknown {
  if (!o || typeof o !== 'object') return undefined;
  const rec = o as Record<string, unknown>;
  const found = Object.keys(rec).find(k => k.toLowerCase() === key.toLowerCase());
  return found ? rec[found] : undefined;
}

const normalize = (raw: unknown): RecordNotes => ({
  notes: String(pick(raw, 'notes') ?? ''),
  encrypted: pick(raw, 'notesEncrypted') === true,
  canEdit: pick(raw, 'canEdit') !== false,
});

export const recordNotesService = {
  async get(moduleKey: string, id: number): Promise<RecordNotes> {
    const { data } = await apiHandle.get(`record-notes/${moduleKey}/${id}`);
    return normalize(data);
  },

  /** Saves the notes (blank clears them; null keeps them and changes only the encrypt choice). */
  async set(moduleKey: string, id: number, notes: string | null, encrypted: boolean): Promise<RecordNotes> {
    const { data } = await apiHandle.put(`record-notes/${moduleKey}/${id}`, { notes, encrypted });
    return normalize(data);
  },
};
