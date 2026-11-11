/**
 * useOfflineSubmit
 *
 * A hook that wraps any Redux thunk dispatch with offline awareness.
 *
 * Usage in form components:
 *
 * ```tsx
 * const { submitForm } = useOfflineSubmit();
 *
 * // Inside your existing submit handler, AFTER all validation:
 * submitForm({
 *   thunkAction: addBusinessContactAsync,        // the thunk function
 *   payload: contactPayload,                     // exact same payload you'd dispatch
 *   thunkTypePrefix: TYPE_CONSTANTS.ADD_BUSINESS_CONTACT_ASYNC,
 *   label: 'Add Business Contact',               // optional, for debugging
 *   attachments: [],                             // optional image attachments
 * });
 * ```
 *
 * When ONLINE  → dispatches the thunk immediately (existing behavior).
 * When OFFLINE → queues the submission in AsyncStorage + shows an info toast.
 */

import { useCallback } from 'react';
import { useDispatch } from 'react-redux';
import { checkNetworkOnce } from './useNetworkStatus';
import { enqueue, PendingAttachment } from '../services/offline/OfflineQueueService';
import { showInfoToast } from '../components/common';
import { AppDispatch } from '../types/store.types';

export interface OfflineSubmitOptions {
  /** The thunk function to dispatch (e.g. addBusinessContactAsync) */
  thunkAction: any;
  /** The payload to pass to the thunk */
  payload: any;
  /** The TYPE_CONSTANTS key that identifies this thunk in the registry */
  thunkTypePrefix: string;
  /** Human-readable label for debugging / sync notifications */
  label?: string;
  /** Pending image/attachment files that need uploading before the form */
  attachments?: PendingAttachment[];
  /**
   * Callback when the form is queued offline.
   * Use this to close modals, navigate back, etc. — just like you would on success.
   */
  onQueued?: () => void;
  /**
   * Callback on successful online dispatch.
   * Optional — most forms already handle this via Redux status watchers.
   */
  onSuccess?: (result: any) => void;
  /**
   * Callback on online dispatch failure.
   * Optional — most forms already handle this via Redux status watchers.
   */
  onError?: (error: any) => void;
}

export interface UseOfflineSubmitReturn {
  /** Submit a form with offline awareness */
  submitForm: (options: OfflineSubmitOptions) => Promise<void>;
}

export const useOfflineSubmit = (): UseOfflineSubmitReturn => {
  const dispatch = useDispatch<AppDispatch>();

  const submitForm = useCallback(
    async (options: OfflineSubmitOptions) => {
      const {
        thunkAction,
        payload,
        thunkTypePrefix,
        label,
        attachments = [],
        onQueued,
        onSuccess,
        onError,
      } = options;

      const isOnline = await checkNetworkOnce();

      if (isOnline) {
        // ── ONLINE: dispatch normally ─────────────────────────────────────
        try {
          const result = await dispatch(thunkAction(payload));
          onSuccess?.(result);
        } catch (error) {
          onError?.(error);
        }
      } else {
        // ── OFFLINE: queue for later sync ─────────────────────────────────
        await enqueue({
          thunkTypePrefix,
          method: 'post', // method is for metadata only; the actual thunk handles routing
          endpoint: '',   // not used — the thunk registry handles endpoints
          payload,
          attachments,
          label,
        });

        showInfoToast(
          'Your data has been saved and will be uploaded when internet becomes available.',
          'Saved Offline',
        );

        onQueued?.();
      }
    },
    [dispatch],
  );

  return { submitForm };
};

export default useOfflineSubmit;
