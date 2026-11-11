import JailMonkey from 'jail-monkey';


const FORCE_COMPROMISED_FOR_TESTING = false;


export const isDeviceCompromised = (): boolean => {
  if (__DEV__ && FORCE_COMPROMISED_FOR_TESTING) {
    return true;
  }

  try {
    return JailMonkey.isJailBroken() || JailMonkey.hookDetected();
  } catch {
    return false;
  }
};
