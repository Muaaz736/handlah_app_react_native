import Config from 'react-native-config';
import { assertAllHttps } from '../utils/httpsGuard';

export const ENV = {
  API_BASE_URL: Config.API_BASE_URL,

  AI_BASE_URL: Config.AI_BASE_URL,

  WEBAPP_HOME_URL: Config.WEBAPP_HOME_URL,

  GOOGLE_WEB_CLIENT_ID: Config.GOOGLE_WEB_CLIENT_ID,
  GOOGLE_IOS_CLIENT_ID: Config.GOOGLE_IOS_CLIENT_ID,
  GOOGLE_ANDROID_CLIENT_ID: Config.GOOGLE_ANDROID_CLIENT_ID,

  REVENUECAT_IOS_API_KEY: Config.REVENUECAT_IOS_API_KEY,
  REVENUECAT_ANDROID_API_KEY: Config.REVENUECAT_ANDROID_API_KEY,

  APP_ENV: Config.APP_ENV as 'development' | 'staging' | 'production',

  IS_PRODUCTION: Config.APP_ENV === 'production',

  /**
   * Which reminder system the app talks to. Off (the default) = the current /reminders routes, unchanged.
   * 'true' = the new /v2 routes. Set REMINDERS_V2=true in the env file and rebuild; switch together with the backend's Reminders:Mode.
   */
  REMINDERS_V2: String(Config.REMINDERS_V2 ?? '').trim().toLowerCase() === 'true',
} as const;

assertAllHttps({
  API_BASE_URL: ENV.API_BASE_URL,
  AI_BASE_URL: ENV.AI_BASE_URL,
  WEBAPP_HOME_URL: ENV.WEBAPP_HOME_URL,
});
