import { ReminderDetailProps } from "../interfaces/Reminder";

const ReminderDetail: React.FC<ReminderDetailProps> = ({
  details,
  setShowReminderForm,
  closeDetail,
}) => {
  const { reminder, date } = details;
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
                details,
                isEditMode: true,
              });
            }}
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

export default ReminderDetail;
