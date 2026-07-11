import React, { useState, useEffect, ChangeEvent } from "react";
import dayjs from "dayjs";
import { Reminder, ReminderFormProps, ReminderCategory, ReminderRecurrence } from "../interfaces/Reminder";
import AiInput from "./AiInput";
import { ParsedReminder } from "../services/geminiService";

const CATEGORIES: { value: ReminderCategory; label: string }[] = [
  { value: "work",     label: "💼 Work"     },
  { value: "personal", label: "🏠 Personal"  },
  { value: "health",   label: "💪 Health"    },
  { value: "other",    label: "📌 Other"     },
];

const RECURRENCES: { value: ReminderRecurrence; label: string }[] = [
  { value: "none",    label: "Does not repeat"  },
  { value: "daily",   label: "Every day"        },
  { value: "weekly",  label: "Every week"       },
  { value: "monthly", label: "Every month"      },
];

const ReminderForm: React.FC<ReminderFormProps> = ({
  date,
  detail,
  addReminder,
  editReminder,
  closeForm,
  reminders,
}) => {
  const isEditMode = Boolean(detail);
  const [formData, setFormData] = useState<Reminder>({
    text: "",
    time: "",
    category: "other",
    recurrence: "none",
  });
  const [aiDate, setAiDate] = useState<string | null>(null);

  useEffect(() => {
    if (isEditMode && detail) {
      setFormData({
        text:       detail.reminder.text       || "",
        time:       detail.reminder.time       || "",
        category:   detail.reminder.category   || "other",
        recurrence: detail.reminder.recurrence || "none",
      });
    }
  }, [isEditMode, detail]);

  const handleChange = (e: ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleAiParsed = (result: ParsedReminder) => {
    setFormData({
      text: result.text,
      time: result.time,
      category: result.category,
      recurrence: result.recurrence,
    });
    setAiDate(result.date);
  };

  const handleSubmit = () => {
    if (isEditMode) {
      editReminder(detail!.date, detail!.index, formData);
    } else {
      addReminder(effectiveDate, formData);
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

  const today = new Date().toISOString().slice(0, 10);
  const effectiveDate = aiDate ?? date;
  const conflict = reminders && formData.time
    ? (reminders[effectiveDate] ?? []).find((r, i) =>
        r.time === formData.time && !(isEditMode && i === detail?.index)
      ) ?? null
    : null;

  return (
    <div className="reminder-popup">
      <div className="reminder-form">
        <button className="close-button" onClick={closeForm}>✕</button>
        <h3>{isEditMode ? formData.text : `Add Reminder — ${aiDate ?? date}`}</h3>
        {!isEditMode && <AiInput today={today} onParsed={handleAiParsed} />}
        {aiDate && (
          <div className="ai-date-tag">
            📅 AI set date to {dayjs(aiDate).format("MMMM D, YYYY")}
          </div>
        )}
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
        <select name="recurrence" value={formData.recurrence} onChange={handleChange}>
          {RECURRENCES.map((r) => (
            <option value={r.value} key={r.value}>{r.label}</option>
          ))}
        </select>
        {conflict && (
          <div className="conflict-warning">
            ⚠️ Conflicts with &ldquo;{conflict.text}&rdquo; already at {conflict.time}
          </div>
        )}
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
