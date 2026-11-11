import { Alert } from 'react-native';
import i18next from 'i18next';
import type {
  ShowSuccessAlertFunction,
  ShowErrorAlertFunction,
  ShowConfirmAlertFunction,
} from '../types/alertHelper.types';

/**
 * Show success alert
 * @param {string} message - Success message to display
 * @param {string} title - Alert title (optional)
 */
export const showSuccessAlert: ShowSuccessAlertFunction = (message, title) => {
  Alert.alert(title || i18next.t('common.success'), message, [{ text: i18next.t('common.ok') }]);
};

/**
 * Show error alert
 * @param {string} message - Error message to display
 * @param {string} title - Alert title (optional)
 */
export const showErrorAlert: ShowErrorAlertFunction = (message, title) => {
  Alert.alert(title || i18next.t('common.error'), message, [{ text: i18next.t('common.ok') }]);
};

/**
 * Show confirmation alert
 * @param {string} message - Confirmation message
 * @param {Function} onConfirm - Callback on confirm
 * @param {string} title - Alert title (optional)
 */
export const showConfirmAlert: ShowConfirmAlertFunction = (
  message,
  onConfirm,
  title
) => {
  Alert.alert(title || i18next.t('common.confirm'), message, [
    { text: i18next.t('common.cancel'), style: 'cancel' },
    { text: i18next.t('common.ok'), onPress: onConfirm },
  ]);
};
