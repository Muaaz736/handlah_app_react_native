/**
 * Alert Helper Types
 */
export type AlertCallback = () => void;

/**
 * Alert function types
 */
export type ShowSuccessAlertFunction = (message: string, title?: string) => void;
export type ShowErrorAlertFunction = (message: string, title?: string) => void;
export type ShowConfirmAlertFunction = (
  message: string,
  onConfirm: AlertCallback,
  title?: string
) => void;
