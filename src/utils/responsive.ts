import DeviceInfo from 'react-native-device-info';

export const isTablet: boolean = DeviceInfo.isTablet();

export const clampedScale = (
  width: number,
  ratio: number,
  max: number,
): number => Math.min(width * ratio, max);
