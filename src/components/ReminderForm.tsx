import React, { useState, useEffect, ChangeEvent } from "react";
import { Reminder, ReminderFormProps } from "../interfaces/Reminder";

const ReminderForm: React.FC<ReminderFormProps> = ({
  date,
  addReminder,
  editReminder,
  closeForm,
  detail,
}) => {
  const isEditMode = Boolean(detail);
  const [formData, setFormData] = useState<Reminder>({
    text: "",
    time: "",
    city: "",
  });

  useEffect(() => {
    if (isEditMode && detail) {
      setFormData({
        text: detail.reminder.text || "",
        time: detail.reminder.time || "",
        city: detail.reminder.city || "",
      });
    }
  }, [isEditMode, detail]);

  const handleChange = (e: ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = () => {
    if (isEditMode) {
      editReminder(detail!.date, detail!.index, formData);
    } else {
      addReminder(date, formData);
    }
    closeForm();
  };

  // Generate time options for each 15 minutes
  const generateTimeOptions = (): string[] => {
    const times: string[] = [];
    for (let hour = 0; hour < 24; hour++) {
      for (let minutes = 0; minutes < 60; minutes += 15) {
        times.push(
          `${hour.toString().padStart(2, "0")}:${minutes
            .toString()
            .padStart(2, "0")}`
        );
      }
    }
    return times;
  };

  return (
    <div className="reminder-popup">
      <div className="reminder-form">
        <button className="close-button" onClick={closeForm}>
          X
        </button>
        <h3>{isEditMode ? formData.text : `Add Reminder for ${date}`}</h3>
        <input
          type="text"
          name="text"
          placeholder="Reminder text"
          value={formData.text}
          onChange={handleChange}
          maxLength={30}
        />
        <select
          name="time"
          value={formData.time}
          onChange={handleChange}
          className="time-select"
        >
          <option value="">Select time</option>
          {generateTimeOptions().map((timeOption) => (
            <option value={timeOption} key={timeOption}>
              {timeOption}
            </option>
          ))}
        </select>
        <input
          type="text"
          name="city"
          placeholder="City"
          value={formData.city}
          onChange={handleChange}
        />
        <button
          className="submit-button"
          onClick={handleSubmit}
          disabled={!formData.text || !formData.time || !formData.city}
        >
          {isEditMode ? "Update" : "Add"}
        </button>
      </div>
    </div>
  );
};

export default ReminderForm;
