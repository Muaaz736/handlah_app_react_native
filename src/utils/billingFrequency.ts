import i18n from 'i18next';

/**
 * Billing frequencies of an expense (and insurance / warranty amounts), as stored on the record. Same keys as the
 * web app and the backend's BillingFrequency dropdown.
 */
export const BILLING_FREQUENCY_KEYS = ['one-time', 'weekly', 'bi-weekly', 'monthly', 'quarterly', 'annually'] as const;
export type BillingFrequencyKey = (typeof BILLING_FREQUENCY_KEYS)[number];

const LABEL_KEYS: Record<BillingFrequencyKey, string> = {
  'one-time': 'utilities.frequency.one_time',
  weekly: 'utilities.frequency.weekly',
  'bi-weekly': 'utilities.frequency.bi_weekly',
  monthly: 'utilities.frequency.monthly',
  quarterly: 'utilities.frequency.quarterly',
  annually: 'utilities.frequency.annually',
};

/** Canonical key for a stored frequency, ignoring case, spaces and hyphens ("One Time", "Biweekly", "Yearly"…). */
export function billingFrequencyKey(frequency: string | null | undefined): BillingFrequencyKey | null {
  switch ((frequency ?? '').toLowerCase().replace(/[^a-z]/g, '')) {
    case 'onetime':
    case 'once':
      return 'one-time';
    case 'weekly':
      return 'weekly';
    case 'biweekly':
    case 'fortnightly':
      return 'bi-weekly';
    case 'monthly':
      return 'monthly';
    case 'quarterly':
    case 'quarter':
      return 'quarterly';
    case 'annually':
    case 'annual':
    case 'yearly':
    case 'year':
      return 'annually';
    default:
      return null;
  }
}

export function billingFrequencyLabel(key: BillingFrequencyKey): string {
  return i18n.t(LABEL_KEYS[key]);
}

/** Options for a Billing Frequency picker, in the web's order. */
export function billingFrequencyOptions(): { label: string; value: BillingFrequencyKey }[] {
  return BILLING_FREQUENCY_KEYS.map(key => ({ label: billingFrequencyLabel(key), value: key }));
}

/**
 * An amount with its billing frequency spelled out, for view screens: "$150.00 · Monthly", "$320.00 · One-Time".
 * Without a frequency it's the amount alone, unless `assumeMonthly` (expenses, read as monthly when unset).
 */
export function formatBillingAmount(amountText: string, frequency: string | null | undefined, assumeMonthly = false): string {
  const key = billingFrequencyKey(frequency) ?? (assumeMonthly ? 'monthly' : null);
  return key ? `${amountText} · ${billingFrequencyLabel(key)}` : amountText;
}

/** An insurance policy's frequency: its own, or annually when it's only marked "paid annually" (older records). */
export function insuranceFrequency(record: any): string {
  return record?.billingfrequency || record?.billingFrequency || (record?.ispaidannually || record?.isPaidAnnually ? 'annually' : '');
}
