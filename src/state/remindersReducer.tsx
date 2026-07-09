import {
  ADD_REMINDER,
  EDIT_REMINDER,
  DELETE_REMINDER
} from "../utils/constants";
import {
  AddReminderAction,
  EditReminderAction,
  DeleteReminderAction,
  MoveReminderAction,
  RemindersState
} from "../interfaces/Reminder";

type ReminderActions = AddReminderAction | EditReminderAction | DeleteReminderAction | MoveReminderAction;

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
    case "MOVE_REMINDER": {
      const { fromDate, toDate, index } = action.payload;
      if (fromDate === toDate) return state;
      const fromList = [...(state[fromDate] || [])];
      const [moved] = fromList.splice(index, 1);
      const toList = [...(state[toDate] || []), moved];
      return { ...state, [fromDate]: fromList, [toDate]: toList };
    }
    default:
      return state;
  }
};
