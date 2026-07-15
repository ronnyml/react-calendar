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
      const { toDate, reminder } = action.payload;
      let srcDate: string | null = null;
      let srcIdx = -1;
      for (const [date, list] of Object.entries(state)) {
        const idx = list.findIndex(
          (r) => r.text === reminder.text && r.time === reminder.time &&
                 r.category === reminder.category && r.recurrence === reminder.recurrence
        );
        if (idx !== -1) { srcDate = date; srcIdx = idx; break; }
      }
      if (!srcDate || srcIdx === -1 || srcDate === toDate) return state;
      const fromList = [...state[srcDate]];
      fromList.splice(srcIdx, 1);
      const toList = [...(state[toDate] || []), { ...reminder }];
      return { ...state, [srcDate]: fromList, [toDate]: toList };
    }
    default:
      return state;
  }
};
