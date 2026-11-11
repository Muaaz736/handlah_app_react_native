import { AppRegistry } from 'react-native';
import './src/utils/disableFontScaling';
import App from './App';
import { name as appName } from './app.json';
import messaging from '@react-native-firebase/messaging';
import crashlytics from '@react-native-firebase/crashlytics';

crashlytics().setCrashlyticsCollectionEnabled(true);
crashlytics().log('App mounted');

const defaultHandler = ErrorUtils.getGlobalHandler();
ErrorUtils.setGlobalHandler((error, isFatal) => {
  crashlytics().setAttribute('isFatal', String(isFatal));
  crashlytics().recordError(error);
  defaultHandler(error, isFatal);
});

const originalHandler = global.Promise;
if (typeof global.HermesInternal !== 'undefined') {
} else if (global.process) {
  global.process.on('unhandledRejection', (reason) => {
    const error = reason instanceof Error ? reason : new Error(String(reason));
    crashlytics().recordError(error);
  });
}

messaging().setBackgroundMessageHandler(async remoteMessage => {
  console.log('Background notification:', remoteMessage);
});

AppRegistry.registerComponent(appName, () => App);
