export type ReminderStatus = 'due_today' | 'upcoming' | 'past_due' | 'completed';

export interface ReminderItem {
  id: string;
  title: string;
  dueDate?: string;
  date?: string;
  frequency?: string;
  notes?: string;
  status: ReminderStatus;
  madeByUser?: boolean;
  daysInfo?: string;
  completedDate?: string;
  [key: string]: any;
}

export interface ReminderCardProps {
  reminder: ReminderItem;
  onPress: (reminder: ReminderItem) => void;
  onMarkAsCompleted: (id: string) => void;
}
