export const ADD_REMINDER = "ADD_REMINDER";
export const EDIT_REMINDER = "EDIT_REMINDER";
export const DELETE_REMINDER = "DELETE_REMINDER";

interface Reminder {
  id: string;
  text: string;
  time: string;
  color?: string;
}

interface RemindersState {
  [date: string]: Reminder[];
}

interface AddReminderAction {
  type: typeof ADD_REMINDER;
  payload: {
    date: string;
    reminder: Reminder;
  };
}

interface EditReminderAction {
  type: typeof EDIT_REMINDER;
  payload: {
    date: string;
    index: number;
    updatedReminder: Reminder;
  };
}

interface DeleteReminderAction {
  type: typeof DELETE_REMINDER;
  payload: {
    date: string;
    index: number;
  };
}

type ReminderActions = AddReminderAction | EditReminderAction | DeleteReminderAction;

export const remindersReducer = (state: RemindersState, action: ReminderActions): RemindersState => {
  switch (action.type) {
    case ADD_REMINDER: {
      const { date, reminder } = action.payload;
      return {
        ...state,
        [date]: [...(state[date] || []), reminder],
      };
    }
    case EDIT_REMINDER: {
      const { date, index, updatedReminder } = action.payload;
      const updatedReminders = [...(state[date] || [])];
      updatedReminders[index] = updatedReminder;
      return {
        ...state,
        [date]: updatedReminders,
      };
    }
    case DELETE_REMINDER: {
      const { date, index } = action.payload;
      const updatedReminders = [...(state[date] || [])];
      updatedReminders.splice(index, 1);
      return {
        ...state,
        [date]: updatedReminders,
      };
    }
    default:
      return state;
  }
};
