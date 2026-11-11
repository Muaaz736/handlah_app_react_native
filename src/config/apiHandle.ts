import axios from 'axios';
import { API_TIMEOUT } from './constants';
import { ENV } from './env';
import { enforceHttps } from '../utils/httpsGuard';
import {
  getAccessToken,
  getRefreshToken,
  saveTokens as keychainSaveTokens,
  getTokens as keychainGetTokens,
  clearTokens as keychainClearTokens,
  clearAllSecureData as keychainClearAllSecureData,
} from '../services/secureStorage/tokenStorage';

export const BASEURL = ENV.API_BASE_URL;

export const apiHandle = axios.create({
  baseURL: BASEURL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: API_TIMEOUT,
});

apiHandle.interceptors.request.use(
  async (config) => {
    if (config.baseURL) {
      config.baseURL = enforceHttps(config.baseURL);
    }
    if (config.url && /^http:\/\//i.test(config.url)) {
      config.url = enforceHttps(config.url);
    }

    try {
      const token = await getAccessToken();

      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }

      return config;
    } catch (error) {
      return config;
    }
  },
  (error) => {
    return Promise.reject(error);
  }
);



let _refreshPromise: Promise<string | null> | null = null;

async function refreshAccessToken(): Promise<string | null> {
  const refreshToken = await getRefreshToken();

  if (!refreshToken) {
    return null;
  }

  const { data } = await axios.post(enforceHttps(`${BASEURL}auth/refresh`), { refreshToken });
  const { accesstoken, refreshtoken } = data;


  if (!accesstoken || !refreshtoken) {
    return null;
  }

  await keychainSaveTokens(accesstoken, refreshtoken);

  return accesstoken;
}

apiHandle.interceptors.response.use(
  (response) => response, // If the response is valid, return it
  async (error) => {
    const { response } = error;
    const originalRequest = error.config;

    if (response && response.status === 401 && originalRequest && !originalRequest._retry) {
      originalRequest._retry = true;

      const refreshToken = await getRefreshToken();
      if (!refreshToken) {
        return Promise.reject(error);
      }

      try {
        if (!_refreshPromise) {
          _refreshPromise = refreshAccessToken().finally(() => {
            _refreshPromise = null;
          });
        }

        const accesstoken = await _refreshPromise;

        if (!accesstoken) {
          await keychainClearTokens();
          return Promise.reject(new Error('Session expired. Please log in again.'));
        }

        originalRequest.headers = originalRequest.headers ?? {};
        originalRequest.headers['Authorization'] = `Bearer ${accesstoken}`;
        return apiHandle(originalRequest);
      } catch {
        await keychainClearTokens();
        return Promise.reject(new Error('Session expired. Please log in again.'));
      }
    }

    return Promise.reject(error);
  }
);

/** Seconds until a JWT expires (its exp claim), or null if it can't be read. */
function secondsLeft(token: string): number | null {
  try {
    const part = token.split('.')[1];
    if (!part) return null;
    const b64 = part.replace(/-/g, '+').replace(/_/g, '/').padEnd(Math.ceil(part.length / 4) * 4, '=');
    const decode = (globalThis as { atob?: (data: string) => string }).atob;
    if (!decode) return null;
    const json = JSON.parse(decode(b64));
    return typeof json.exp === 'number' ? json.exp - Date.now() / 1000 : null;
  } catch {
    return null;
  }
}

/**
 * A current access token for calls made outside apiHandle (fetch to the assistant): renewed first when it is about to
 * expire, since sign-ins now last about an hour and renew with the refresh token.
 */
export async function getValidAccessToken(): Promise<string | null> {
  const token = await getAccessToken();
  if (!token) return null;
  const left = secondsLeft(token);
  if (left == null || left > 60) return token;
  try {
    if (!_refreshPromise) {
      _refreshPromise = refreshAccessToken().finally(() => {
        _refreshPromise = null;
      });
    }
    return (await _refreshPromise) ?? null;
  } catch {
    return null;
  }
}

export const getTokens = keychainGetTokens;

export const saveTokens = keychainSaveTokens;

export const clearTokens = keychainClearTokens;

export const clearAllSecureData = keychainClearAllSecureData;
