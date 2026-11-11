
import AsyncStorage from '@react-native-async-storage/async-storage';

const OFFLINE_QUEUE_KEY = '@handlah_offline_queue';
const OFFLINE_IMAGE_MAP_KEY = '@handlah_offline_image_map';

export type HttpMethod = 'get' | 'post' | 'put' | 'delete' | 'patch';

export interface OfflineFileEntry {
  localUri: string;
  mimeType: string;
  fileName: string;
}

export interface PendingAttachment {
  fieldPath: string;
  localUri: string;
  offlineId: string;
  mimeType: string;
  fileName: string;
}

export interface QueuedFormItem {
  id: string;
  thunkTypePrefix: string;
  method: HttpMethod;
  endpoint: string;
  payload: any;
  attachments: PendingAttachment[];
  createdAt: string;
  retryCount: number;
  label?: string;
}


const generateId = (): string =>
  `${Date.now()}_${Math.random().toString(36).substring(2, 10)}`;


export const getQueue = async (): Promise<QueuedFormItem[]> => {
  try {
    const raw = await AsyncStorage.getItem(OFFLINE_QUEUE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
};


const saveQueue = async (queue: QueuedFormItem[]): Promise<void> => {
  await AsyncStorage.setItem(OFFLINE_QUEUE_KEY, JSON.stringify(queue));
};


export const enqueue = async (
  item: Omit<QueuedFormItem, 'id' | 'createdAt' | 'retryCount'>,
): Promise<string> => {
  const queue = await getQueue();
  const id = generateId();
  const newItem: QueuedFormItem = {
    ...item,
    id,
    createdAt: new Date().toISOString(),
    retryCount: 0,
  };
  queue.push(newItem);
  await saveQueue(queue);
  return id;
};


export const dequeue = async (id: string): Promise<void> => {
  const queue = await getQueue();
  await saveQueue(queue.filter(item => item.id !== id));
};


export const incrementRetry = async (id: string): Promise<void> => {
  const queue = await getQueue();
  const idx = queue.findIndex(item => item.id === id);
  if (idx !== -1) {
    queue[idx].retryCount += 1;
  }
  await saveQueue(queue);
};


export const updatePayload = async (
  id: string,
  newPayload: any,
): Promise<void> => {
  const queue = await getQueue();
  const idx = queue.findIndex(item => item.id === id);
  if (idx !== -1) {
    queue[idx].payload = newPayload;
    queue[idx].attachments = []; 
  }
  await saveQueue(queue);
};


export const getQueueLength = async (): Promise<number> => {
  const queue = await getQueue();
  return queue.length;
};


export const clearQueue = async (): Promise<void> => {
  await AsyncStorage.removeItem(OFFLINE_QUEUE_KEY);
  await AsyncStorage.removeItem(OFFLINE_IMAGE_MAP_KEY);
};

export const storeOfflineImageUri = async (
  offlineId: string,
  localUri: string,
  mimeType: string = 'image/jpeg',
  fileName: string = 'image.jpg',
): Promise<void> => {
  try {
    const raw = await AsyncStorage.getItem(OFFLINE_IMAGE_MAP_KEY);
    const map: Record<string, OfflineFileEntry> = raw ? JSON.parse(raw) : {};
    map[offlineId] = { localUri, mimeType, fileName };
    await AsyncStorage.setItem(OFFLINE_IMAGE_MAP_KEY, JSON.stringify(map));
  } catch {
    // Silently fail — worst case the file won't upload on sync
  }
};


export const getOfflineImageUri = async (
  offlineId: string,
): Promise<OfflineFileEntry | null> => {
  try {
    const raw = await AsyncStorage.getItem(OFFLINE_IMAGE_MAP_KEY);
    const map: Record<string, OfflineFileEntry | string> = raw ? JSON.parse(raw) : {};
    const entry = map[offlineId];
    if (!entry) return null;
    if (typeof entry === 'string') {
      return { localUri: entry, mimeType: 'image/jpeg', fileName: 'image.jpg' };
    }
    return entry;
  } catch {
    return null;
  }
};


export const removeOfflineImageUri = async (offlineId: string): Promise<void> => {
  try {
    const raw = await AsyncStorage.getItem(OFFLINE_IMAGE_MAP_KEY);
    const map: Record<string, OfflineFileEntry | string> = raw ? JSON.parse(raw) : {};
    delete map[offlineId];
    await AsyncStorage.setItem(OFFLINE_IMAGE_MAP_KEY, JSON.stringify(map));
  } catch {
    // Silently fail
  }
};


export const extractOfflineAttachments = async (
  payload: any,
): Promise<{ sanitisedPayload: any; attachments: PendingAttachment[] }> => {
  if (!payload || typeof payload !== 'object') {
    return { sanitisedPayload: payload, attachments: [] };
  }

  const attachments: PendingAttachment[] = [];
  const clone = JSON.parse(JSON.stringify(payload));

  const scan = async (obj: any, pathPrefix: string) => {
    if (!obj || typeof obj !== 'object') return;

    for (const key of Object.keys(obj)) {
      const val = obj[key];
      const fullPath = pathPrefix ? `${pathPrefix}.${key}` : key;

      if (typeof val === 'string' && val.startsWith('offline_')) {
        const entry = await getOfflineImageUri(val);
        if (entry) {
          attachments.push({
            fieldPath: fullPath,
            localUri: entry.localUri,
            offlineId: val,
            mimeType: entry.mimeType,
            fileName: entry.fileName,
          });
          obj[key] = '';
        }
      } else if (val && typeof val === 'object' && !Array.isArray(val)) {
        await scan(val, fullPath);
      } else if (Array.isArray(val)) {
        for (let i = 0; i < val.length; i++) {
          if (typeof val[i] === 'string' && val[i].startsWith('offline_')) {
            const entry = await getOfflineImageUri(val[i]);
            if (entry) {
              attachments.push({
                fieldPath: `${fullPath}[${i}]`,
                localUri: entry.localUri,
                offlineId: val[i],
                mimeType: entry.mimeType,
                fileName: entry.fileName,
              });
              val[i] = '';
            }
          } else if (val[i] && typeof val[i] === 'object') {
            await scan(val[i], `${fullPath}[${i}]`);
          }
        }
      }
    }
  };

  await scan(clone, '');
  return { sanitisedPayload: clone, attachments };
};
