

import NetInfo, { NetInfoState } from '@react-native-community/netinfo';
import ReactNativeBlobUtil from 'react-native-blob-util';
import { store } from '../../redux/store';
import {
  getQueue,
  dequeue,
  incrementRetry,
  updatePayload,
  QueuedFormItem,
  PendingAttachment,
  removeOfflineImageUri,
} from './OfflineQueueService';
import { thunkRegistry } from './ThunkRegistry';
import { apiHandle } from '../../config/apiHandle';
import { markSuccess, markFailed } from './SyncHistoryService';
import { showSuccessToast, showInfoToast } from '../../components/common';

const MAX_RETRIES = 5;

let isSyncing = false;


const uploadAttachment = async (
  attachment: PendingAttachment,
): Promise<string | null> => {
  try {
    const filePath = attachment.localUri.replace('file://', '');
    const exists = await ReactNativeBlobUtil.fs.exists(filePath);
    if (!exists) {
      console.warn(
        `[OfflineSyncEngine] File no longer exists: ${filePath}. Skipping attachment.`,
      );
      return null;
    }

    const formData = new FormData();
    formData.append('file', {
      uri: attachment.localUri,
      type: attachment.mimeType || 'application/octet-stream',
      name: attachment.fileName || `offline_upload_${Date.now()}`,
    } as any);

    const response = await apiHandle.post('image', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });

    const result = response?.data ?? response;
    return (result as any)?.id ?? (result as any)?.imageId ?? null;
  } catch (error) {
    console.warn('[OfflineSyncEngine] Attachment upload failed:', error);
    return null;
  }
};


const setNestedValue = (obj: any, path: string, value: any): any => {
  const result = JSON.parse(JSON.stringify(obj)); // deep clone

  const segments: string[] = [];
  for (const part of path.split('.')) {
    const arrMatch = part.match(/^(.+)\[(\d+)\]$/);
    if (arrMatch) {
      segments.push(arrMatch[1]);
      segments.push(arrMatch[2]);
    } else {
      segments.push(part);
    }
  }

  let current = result;
  for (let i = 0; i < segments.length - 1; i++) {
    const key = segments[i];
    const nextKey = segments[i + 1];
    if (current[key] === undefined || current[key] === null) {
      // Create the next level as array or object
      current[key] = /^\d+$/.test(nextKey) ? [] : {};
    }
    current = current[key];
  }

  current[segments[segments.length - 1]] = value;
  return result;
};

const processItem = async (item: QueuedFormItem): Promise<boolean> => {
  const thunk = thunkRegistry[item.thunkTypePrefix];
  if (!thunk) {
    console.warn(
      `[OfflineSyncEngine] No thunk found for type: ${item.thunkTypePrefix}. Removing from queue.`,
    );
    await dequeue(item.id);
    await markFailed(item.id, item.retryCount, 'Thunk not found in registry');
    return true; 
  }

  let payload = item.payload;

  if (item.attachments && item.attachments.length > 0) {
    for (const attachment of item.attachments) {
      const serverId = await uploadAttachment(attachment);
      if (!serverId) {
        await incrementRetry(item.id);
        const newRetry = item.retryCount + 1;
        await markFailed(item.id, newRetry, 'Attachment upload failed');
        return false;
      }
      payload = setNestedValue(payload, attachment.fieldPath, serverId);
      await removeOfflineImageUri(attachment.offlineId);
      try {
        const filePath = attachment.localUri.replace('file://', '');
        const exists = await ReactNativeBlobUtil.fs.exists(filePath);
        if (exists) {
          await ReactNativeBlobUtil.fs.unlink(filePath);
        }
      } catch {
      }
    }
    await updatePayload(item.id, payload);
  }

  try {
    await (store.dispatch as any)(thunk(payload)).unwrap();
    await dequeue(item.id);
    await markSuccess(item.id);
    return true;
  } catch (error) {
    console.warn(
      `[OfflineSyncEngine] Failed to sync item ${item.id} (${item.thunkTypePrefix}):`,
      error,
    );
    await incrementRetry(item.id);
    const newRetry = item.retryCount + 1;
    const errMsg = error instanceof Error ? error.message : String(error);
    await markFailed(item.id, newRetry, errMsg);
    return false;
  }
};

const processQueue = async (): Promise<void> => {
  if (isSyncing) return;
  isSyncing = true;

  try {
    const queue = await getQueue();

    if (queue.length === 0) {
      isSyncing = false;
      return;
    }

    let successCount = 0;
    const total = queue.length;

    for (const item of queue) {
      if (item.retryCount >= MAX_RETRIES) {
        console.warn(
          `[OfflineSyncEngine] Item ${item.id} exceeded max retries (${MAX_RETRIES}). Skipping.`,
        );
        continue;
      }

      const state = await NetInfo.fetch();
      if (state.isConnected === false) {
        break; 
      }

      const success = await processItem(item);
      if (success) {
        successCount++;
      }
    }

    if (successCount > 0) {
      const remaining = total - successCount;
      if (remaining > 0) {
        showInfoToast(
          `Synced ${successCount} of ${total} items. ${remaining} will retry later.`,
          'Sync Progress',
        );
      } else {
        showSuccessToast(
          `All ${successCount} offline item${successCount > 1 ? 's' : ''} synced successfully!`,
          'Sync Complete',
        );
      }
    }
  } catch (error) {
    console.error('[OfflineSyncEngine] Error during sync:', error);
  } finally {
    isSyncing = false;
  }
};

// ─── Public API ──────────────────────────────────────────────────────────────

let unsubscribe: (() => void) | null = null;


export const startSyncEngine = (): void => {
  if (unsubscribe) return; 

  unsubscribe = NetInfo.addEventListener((state: NetInfoState) => {
    if (state.isConnected) {
      setTimeout(() => {
        processQueue();
      }, 2000);
    }
  });

  NetInfo.fetch().then((state) => {
    if (state.isConnected) {
      processQueue();
    }
  });
};


export const stopSyncEngine = (): void => {
  if (unsubscribe) {
    unsubscribe();
    unsubscribe = null;
  }
};


export const triggerSync = (): void => {
  processQueue();
};
