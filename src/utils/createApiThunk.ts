import { createAsyncThunk } from '@reduxjs/toolkit';
import { apiHandle } from '../config/apiHandle';
import { extractApiError } from './helpers';
import NetInfo from '@react-native-community/netinfo';
import { enqueue, extractOfflineAttachments } from '../services/offline/OfflineQueueService';
import { addPendingEntry } from '../services/offline/SyncHistoryService';
import { showInfoToast } from '../components/common';

type HttpMethod = 'get' | 'post' | 'put' | 'delete' | 'patch';

const WRITE_METHODS: HttpMethod[] = ['post', 'put', 'delete', 'patch'];

interface ThunkOptions<TArg> {
  config?: object;
  getBody?: (arg: TArg) => any;
  transformResponse?: (data: any, arg: TArg) => any;
  skipOfflineQueue?: boolean;
}

const createApiThunk = <TReturn = any, TArg = void>(
  typePrefix: string,
  method: HttpMethod,
  endpoint: string | ((arg: TArg) => string),
  errorMessage: string,
  options?: ThunkOptions<TArg>,
) => {
  return createAsyncThunk<TReturn, TArg>(
    typePrefix,
    async (arg, { rejectWithValue }) => {
      try {
        if (
          WRITE_METHODS.includes(method) &&
          !options?.skipOfflineQueue
        ) {
          const networkState = await NetInfo.fetch();
          const isOffline = networkState.isConnected === false;

          if (isOffline) {
            const url = typeof endpoint === 'function' ? endpoint(arg) : endpoint;

            const { sanitisedPayload, attachments } =
              await extractOfflineAttachments(arg);

            const queueId = await enqueue({
              thunkTypePrefix: typePrefix,
              method,
              endpoint: url,
              payload: sanitisedPayload as any,
              attachments,
              label: typePrefix,
            });

            await addPendingEntry(queueId, typePrefix, new Date().toISOString());

            showInfoToast(
              'Your data has been saved and will be uploaded when internet becomes available.',
              'Saved Offline',
            );

            return { _offlineQueued: true, message: 'Queued for offline sync' } as any;
          }
        }
        if (method === 'get') {
          const netState = await NetInfo.fetch();
          if (netState.isConnected === false) {
            return rejectWithValue('__OFFLINE_ERROR__');
          }
        }

        const url = typeof endpoint === 'function' ? endpoint(arg) : endpoint;

        const body = options?.getBody ? options.getBody(arg) : arg;
        const response =
          method === 'get' || method === 'delete'
            ? await (apiHandle as any)[method](url, options?.config)
            : await (apiHandle as any)[method](url, body, options?.config);

        if (response?.data) {
          return options?.transformResponse
            ? options.transformResponse(response.data, arg)
            : response.data;
        }
        if (response) {
          return options?.transformResponse
            ? options.transformResponse(response, arg)
            : (response as any);
        }

        return rejectWithValue('Invalid response format');
      } catch (error) {
        return rejectWithValue(extractApiError(error, errorMessage));
      }
    },
  );
};

export default createApiThunk;
