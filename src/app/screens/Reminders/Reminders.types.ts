import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../../../types/RootStackParamList.types';

export type RemindersNavigationProp = NativeStackNavigationProp<
  RootStackParamList,
  'Reminders'
>;

export type ReminderStatus = 'due_today' | 'upcoming' | 'past_due' | 'completed';

export interface Reminder {
  id?: string;
  title?: string;
  description?: string;
  date?: string;
  dueDate?: string;
  status?: ReminderStatus;
  // priority?: 'high' | 'medium' | 'low';
  frequency?: string;
  notes?: string;
  daysInfo?: string;
  // completedDate?: string;
  madeByUser?: string;
  [key: string]: any;
}

export interface ReminderTab {
  label: string;
  value: ReminderStatus;
}

export interface ReminderCardProps {
  reminder: Reminder;
  onPress: () => void;
  onMarkAsCompleted: () => void;
}

export interface ReminderItemProps {
  item: Reminder;
}
