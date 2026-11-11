import crashlytics from '@react-native-firebase/crashlytics';

/**
 * Log an error to Firebase Crashlytics.
 * @param error  The Error object to record.
 * @param screen Optional screen / context label for the log.
 */
export const logError = (error: Error, screen: string = ''): void => {
  if (screen) {
    crashlytics().log(screen);
  }
  crashlytics().recordError(error);
};

export const setCrashlyticsUser = (userId: string): void => {
  crashlytics().setUserId(userId);
};


export const setCrashlyticsAttribute = (key: string, value: string): void => {
  crashlytics().setAttribute(key, value);
};
