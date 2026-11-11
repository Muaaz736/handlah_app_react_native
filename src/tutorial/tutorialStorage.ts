import AsyncStorage from '@react-native-async-storage/async-storage';

const TUTORIAL_KEY = '@handlah_tutorial_complete';

export const markTutorialComplete = async (): Promise<void> => {
  try {
    await AsyncStorage.setItem(TUTORIAL_KEY, 'true');
  } catch {
    // non-critical – ignore storage errors
  }
};

export const markNewUserForTutorial = async (): Promise<void> => {
  try {
    await AsyncStorage.setItem("tutorial_show", 'true');
  } catch {
    // non-critical
  }
};
