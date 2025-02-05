import React from "react";
import { ReminderDetailProps } from "../interfaces/Reminder";

const ReminderDetailView: React.FC<ReminderDetailProps> = ({
  detail,
  setShowReminderForm,
  closeDetail,
  openDeleteConfirmation
}) => {
  const { reminder, date } = detail;
  const formattedDate = new Date(date).toLocaleDateString("en-US", {
    weekday: "long",
    month: "long",
    day: "numeric",
  });

  return (
    <div className="reminder-popup">
      <div className="reminder-details">
        <button className="close-button" onClick={closeDetail}>
          X
        </button>
        <div className="details-icons">
          <button
            className="icon-button edit-icon"
            onClick={() => {
              closeDetail();
              setShowReminderForm({
                detail,
                isEditMode: true,
              });
            }}
          ></button>
          <button
            className="icon-button delete-icon"
            onClick={openDeleteConfirmation}
          ></button>
        </div>
        <h3>{reminder.text}</h3>
        <p>
          {formattedDate} - {reminder.time}
        </p>
        <p>
          <strong>{reminder.city}</strong>
        </p>
      </div>
    </div>
  );
};

export default ReminderDetailView;
