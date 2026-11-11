export interface DropdownOption {
  label: string;
  value: string;
}

export type FrequencyOption = 'daily' | 'weekly' | 'monthly' | 'custom';

export type DayOfWeek =
  | 'Monday'
  | 'Tuesday'
  | 'Wednesday'
  | 'Thursday'
  | 'Friday'
  | 'Saturday'
  | 'Sunday';
