

import { Alert, Linking, Platform } from 'react-native';
import {
  check,
  request,
  PERMISSIONS,
  RESULTS,
  Permission,
  openSettings,
} from 'react-native-permissions';
import i18next from 'i18next';


export type PermissionStatus = 'granted' | 'denied' | 'blocked' | 'limited' | 'unavailable';

function resolve(ios: Permission, android: Permission): Permission {
  return Platform.OS === 'ios' ? ios : android;
}

function normalise(result: string): PermissionStatus {
  switch (result) {
    case RESULTS.GRANTED:
      return 'granted';
    case RESULTS.LIMITED:
      return 'limited';
    case RESULTS.DENIED:
      return 'denied';
    case RESULTS.BLOCKED:
      return 'blocked';
    default:
      return 'unavailable';
  }
}

async function checkAndRequest(
  permission: Permission,
  blockedTitle: string,
  blockedMessage: string,
): Promise<boolean> {
  try {
    const current = await check(permission);

    if (current === RESULTS.GRANTED || current === RESULTS.LIMITED) {
      return true;
    }

    if (current === RESULTS.BLOCKED) {
      showBlockedAlert(blockedTitle, blockedMessage);
      return false;
    }

    const result = await request(permission);
    if (result === RESULTS.GRANTED || result === RESULTS.LIMITED) {
      return true;
    }
    if (result === RESULTS.BLOCKED) {
      showBlockedAlert(blockedTitle, blockedMessage);
    }
    return false;
  } catch {
    return false;
  }
}

function showBlockedAlert(title: string, message: string): void {
  Alert.alert(title, message, [
    {
      text: i18next.t('common.cancel') || 'Cancel',
      style: 'cancel',
    },
    {
      text: i18next.t('common.open_settings') || 'Open Settings',
      onPress: () => openSettings().catch(() => Linking.openSettings()),
    },
  ]);
}

export async function requestCameraPermission(): Promise<boolean> {
  const permission = resolve(
    PERMISSIONS.IOS.CAMERA,
    PERMISSIONS.ANDROID.CAMERA,
  );
  return checkAndRequest(
    permission,
    i18next.t('permissions.camera_blocked_title') || 'Camera Access Required',
    i18next.t('permissions.camera_blocked_message') ||
      'Camera access has been denied. Please enable it in Settings to take photos.',
  );
}

export async function requestGalleryPermission(): Promise<boolean> {
  if (Platform.OS !== 'ios') return true;

  return checkAndRequest(
    PERMISSIONS.IOS.PHOTO_LIBRARY,
    i18next.t('permissions.gallery_blocked_title') || 'Photo Library Access Required',
    i18next.t('permissions.gallery_blocked_message') ||
      'Photo library access has been denied. Please enable it in Settings to pick images.',
  );
}

export async function requestMicrophonePermission(): Promise<boolean> {
  const permission = resolve(
    PERMISSIONS.IOS.MICROPHONE,
    PERMISSIONS.ANDROID.RECORD_AUDIO,
  );
  return checkAndRequest(
    permission,
    i18next.t('permissions.microphone_blocked_title') || 'Microphone Access Required',
    i18next.t('permissions.microphone_blocked_message') ||
      'Microphone access has been denied. Please enable it in Settings to use voice input.',
  );
}

export async function requestSpeechRecognitionPermission(): Promise<boolean> {
  if (Platform.OS !== 'ios') return true;
  return checkAndRequest(
    PERMISSIONS.IOS.SPEECH_RECOGNITION,
    i18next.t('permissions.speech_blocked_title') || 'Speech Recognition Required',
    i18next.t('permissions.speech_blocked_message') ||
      'Speech recognition access has been denied. Please enable it in Settings to use voice input.',
  );
}

export async function requestVoicePermissions(): Promise<boolean> {
  const mic = await requestMicrophonePermission();
  if (!mic) return false;
  return requestSpeechRecognitionPermission();
}

export async function requestStorageWritePermission(): Promise<boolean> {
  if (Platform.OS === 'ios') return true;
  if (Platform.OS === 'android' && Platform.Version > 29) return true;

  return checkAndRequest(
    PERMISSIONS.ANDROID.WRITE_EXTERNAL_STORAGE,
    i18next.t('permissions.storage_blocked_title') || 'Storage Access Required',
    i18next.t('permissions.storage_blocked_message') ||
      'Storage access has been denied. Please enable it in Settings to download files.',
  );
}

export async function checkCameraPermission(): Promise<PermissionStatus> {
  const permission = resolve(PERMISSIONS.IOS.CAMERA, PERMISSIONS.ANDROID.CAMERA);
  return normalise(await check(permission));
}

export async function checkMicrophonePermission(): Promise<PermissionStatus> {
  const permission = resolve(PERMISSIONS.IOS.MICROPHONE, PERMISSIONS.ANDROID.RECORD_AUDIO);
  return normalise(await check(permission));
}
