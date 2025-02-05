import { ADD_REMINDER, EDIT_REMINDER, DELETE_REMINDER } from "../utils/constants";

export interface Reminder {
  text: string;
  time: string;
  city: string;
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
}

export interface ReminderDetailProps {
  detail: ReminderDetail;
  editReminder: (date: string, index: number, updatedReminder: Reminder) => void;
  setShowReminderForm: (params: { detail: ReminderDetail; isEditMode: boolean }) => void;
  closeDetail: () => void;
  openDeleteConfirmation?: () => void;
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
