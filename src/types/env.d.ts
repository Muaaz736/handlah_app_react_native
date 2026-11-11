declare module 'react-native-config' {
  export interface NativeConfig {
    API_BASE_URL: string;
    AI_BASE_URL: string;

    WEBAPP_HOME_URL: string;

    GOOGLE_WEB_CLIENT_ID: string;
    GOOGLE_IOS_CLIENT_ID: string;
    GOOGLE_ANDROID_CLIENT_ID: string;

    REVENUECAT_IOS_API_KEY: string;
    REVENUECAT_ANDROID_API_KEY: string;

    APP_ENV: 'development' | 'staging' | 'production';

    /** 'true' = talk to the new /v2 reminder engine; anything else keeps the current routes. */
    REMINDERS_V2?: string;
  }

  export const Config: NativeConfig;
  export default Config;
}
