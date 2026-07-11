import { ADD_REMINDER, EDIT_REMINDER, DELETE_REMINDER } from "../utils/constants";

export type ReminderCategory = "work" | "personal" | "health" | "other";
export type ReminderRecurrence = "none" | "daily" | "weekly" | "monthly";

export interface Reminder {
  text: string;
  time: string;
  category: ReminderCategory;
  recurrence: ReminderRecurrence;
}

export interface ReminderDetail {
  date: string;
  index: number;
  reminder: Reminder;
}

export interface ReminderFormProps {
  date: string;
  detail: ReminderDetail | null;
  addReminder: (date: string, reminder: Reminder) => void;
  editReminder: (date: string, index: number, updatedReminder: Reminder) => void;
  closeForm: () => void;
  reminders?: RemindersState;
}

export interface ReminderDetailProps {
  detail: ReminderDetail;
  editReminder: (date: string, index: number, updatedReminder: Reminder) => void;
  setShowReminderForm: (params: { detail: ReminderDetail; isEditMode: boolean }) => void;
  closeDetail: () => void;
  openDeleteConfirmation?: () => void;
  onReschedule?: (fromDate: string, index: number, toDate: string, updatedReminder: Reminder) => void;
  reminders?: RemindersState;
  today?: string;
}

export interface ReminderListProps {
  date: string;
  reminders: Reminder[];
  closePopup: () => void;
  onReminderClick: (detail: ReminderDetail) => void;
}

export interface ShowReminderFormState {
  isEditMode: boolean;
  detail: ReminderDetail | null;
}

export interface RemindersState {
  [date: string]: Reminder[];
}

export interface AddReminderAction {
  type: typeof ADD_REMINDER;
  payload: {
    date: string;
    reminder: Reminder;
  };
}

export interface EditReminderAction {
  type: typeof EDIT_REMINDER;
  payload: {
    date: string;
    index: number;
    updatedReminder: Reminder;
  };
}

export interface DeleteReminderAction {
  type: typeof DELETE_REMINDER;
  payload: {
    date: string;
    index: number;
  };
}

export interface MoveReminderAction {
  type: "MOVE_REMINDER";
  payload: {
    fromDate: string;
    toDate: string;
    index: number;
  };
}
