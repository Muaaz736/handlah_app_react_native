/**
 * ReminderCard Component Types
 */
export type ReminderStatus =
  | 'due_today'
  | 'upcoming'
  | 'past_due'
  | 'completed';

export interface Reminder {
  status?: ReminderStatus;
  title?: string;
  date?: string | Date;
  dueDate?: string;
  frequency?: string;
  notes?: string;
  daysInfo?: string;
  completedDate?: string;
  madeByUser?: string;
  [key: string]: any;
}

export interface ReminderCardProps {
  reminder?: Reminder;
  onPress?: () => void;
  onMarkAsCompleted?: () => void;
}

export interface ReminderDetails {
  dueDate?: string;
  frequency?: string;
  notes?: string;
}

export type ReminderCardVariant = 'simple' | 'detailed';
