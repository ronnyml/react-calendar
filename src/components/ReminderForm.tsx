import React, { useState, useEffect, ChangeEvent } from "react";
import { Reminder, ReminderFormProps, ReminderCategory } from "../interfaces/Reminder";

const CATEGORIES: { value: ReminderCategory; label: string }[] = [
  { value: "work",     label: "💼 Work"     },
  { value: "personal", label: "🏠 Personal"  },
  { value: "health",   label: "💪 Health"    },
  { value: "other",    label: "📌 Other"     },
];

const ReminderForm: React.FC<ReminderFormProps> = ({
  date,
  detail,
  addReminder,
  editReminder,
  closeForm
}) => {
  const isEditMode = Boolean(detail);
  const [formData, setFormData] = useState<Reminder>({
    text: "",
    time: "",
    category: "other",
  });

  useEffect(() => {
    if (isEditMode && detail) {
      setFormData({
        text:     detail.reminder.text     || "",
        time:     detail.reminder.time     || "",
        category: detail.reminder.category || "other",
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

  const generateTimeOptions = (): string[] => {
    const times: string[] = [];
    for (let hour = 0; hour < 24; hour++) {
      for (let minutes = 0; minutes < 60; minutes += 15) {
        times.push(
          `${hour.toString().padStart(2, "0")}:${minutes.toString().padStart(2, "0")}`
        );
      }
    }
    return times;
  };

  return (
    <div className="reminder-popup">
      <div className="reminder-form">
        <button className="close-button" onClick={closeForm}>✕</button>
        <h3>{isEditMode ? formData.text : `Add Reminder — ${date}`}</h3>
        <input
          type="text"
          name="text"
          placeholder="Reminder text"
          value={formData.text}
          onChange={handleChange}
          maxLength={30}
        />
        <select name="time" value={formData.time} onChange={handleChange}>
          <option value="">Select time</option>
          {generateTimeOptions().map((t) => (
            <option value={t} key={t}>{t}</option>
          ))}
        </select>
        <select name="category" value={formData.category} onChange={handleChange}>
          {CATEGORIES.map((c) => (
            <option value={c.value} key={c.value}>{c.label}</option>
          ))}
        </select>
        <button
          className="submit-button"
          onClick={handleSubmit}
          disabled={!formData.text || !formData.time}
        >
          {isEditMode ? "Update reminder" : "Add reminder"}
        </button>
      </div>
    </div>
  );
};

export default ReminderForm;
