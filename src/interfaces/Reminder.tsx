import { ADD_REMINDER, EDIT_REMINDER, DELETE_REMINDER } from "../utils/constants";

export interface Reminder {
  id: string;
  text: string;
  time: string;
  color?: string;
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
