import React from "react";
import dayjs from "dayjs";
import { ReminderDetailProps } from "../interfaces/Reminder";

const ReminderDetailView: React.FC<ReminderDetailProps> = ({
  detail,
  setShowReminderForm,
  closeDetail,
  openDeleteConfirmation
}) => {
  const { reminder, date } = detail;
  const formattedDate = dayjs(date).format("dddd, MMMM D");

  return (
    <div className="reminder-popup">
      <div className="reminder-details">
        <button className="close-button" onClick={closeDetail}>✕</button>
        <div className="details-icons">
          <button
            className="icon-button edit-icon"
            onClick={() => {
              closeDetail();
              setShowReminderForm({ detail, isEditMode: true });
            }}
          ></button>
          <button
            className="icon-button delete-icon"
            onClick={openDeleteConfirmation}
          ></button>
        </div>
        <span className={`category-badge category-${reminder.category ?? "other"}`}>
          {reminder.category ?? "other"}
        </span>
        <h3>{reminder.text}</h3>
        <p>{formattedDate} — {reminder.time}</p>
      </div>
    </div>
  );
};

export default ReminderDetailView;
