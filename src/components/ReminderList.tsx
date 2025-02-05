import React from "react";
import { ReminderListProps } from "../interfaces/Reminder";

const ReminderList: React.FC<ReminderListProps> = ({
  date,
  reminders,
  closePopup,
  onReminderClick,
}) => {
  return (
    <div className="reminder-popup">
      <div className="reminder-list">
        <button className="close-button" onClick={closePopup}>
          X
        </button>
        <h3>Reminders for {date}</h3>
        <ul>
          {reminders.map((reminder, index) => (
            <li
              key={index}
              className="reminder clickable"
              onClick={() => {
                onReminderClick({ date, reminder, index });
                closePopup();
              }}
            >
              {reminder.text} - {reminder.time} ({reminder.city})
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
};

export default ReminderList;
