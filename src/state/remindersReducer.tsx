import {
  ADD_REMINDER,
  EDIT_REMINDER,
  DELETE_REMINDER
} from "../utils/constants";
import {
  AddReminderAction,
  EditReminderAction,
  DeleteReminderAction,
  RemindersState
} from "../interfaces/Reminder";

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
