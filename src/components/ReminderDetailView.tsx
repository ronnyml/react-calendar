import React, { useState } from "react";
import dayjs from "dayjs";
import { ReminderDetailProps } from "../interfaces/Reminder";
import { suggestReschedule, RescheduleSuggestion } from "../services/geminiService";

const ReminderDetailView: React.FC<ReminderDetailProps> = ({
  detail,
  setShowReminderForm,
  closeDetail,
  openDeleteConfirmation,
  onReschedule,
  reminders,
  today,
}) => {
  const { reminder, date, index } = detail;
  const formattedDate = dayjs(date).format("dddd, MMMM D");

  const [showReschedule, setShowReschedule] = useState(false);
  const [rescheduleInput, setRescheduleInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [suggestion, setSuggestion] = useState<RescheduleSuggestion | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleGetSuggestion = async () => {
    if (!rescheduleInput.trim() || !reminders || !today) return;
    setLoading(true);
    setSuggestion(null);
    setError(null);
    try {
      const result = await suggestReschedule(
        reminder.text,
        date,
        reminder.time,
        rescheduleInput,
        reminders,
        today
      );
      setSuggestion(result);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Something went wrong.");
    } finally {
      setLoading(false);
    }
  };

  const handleConfirmReschedule = () => {
    if (!suggestion || !onReschedule) return;
    onReschedule(date, index, suggestion.date, { ...reminder, time: suggestion.time });
    closeDetail();
  };

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
        {reminder.recurrence !== "none" && (
          <p className="recurrence-label">🔁 Repeats {reminder.recurrence}</p>
        )}

        {onReschedule && (
          <div className="reschedule-section">
            <button
              className="reschedule-toggle-btn"
              onClick={() => { setShowReschedule(v => !v); setSuggestion(null); setError(null); }}
            >
              🗓️ {showReschedule ? "Cancel Reschedule" : "AI Reschedule"}
            </button>

            {showReschedule && (
              <div className="reschedule-body">
                <input
                  className="reschedule-input"
                  type="text"
                  placeholder='e.g. "move to next Monday morning"'
                  value={rescheduleInput}
                  onChange={e => setRescheduleInput(e.target.value)}
                  onKeyDown={e => e.key === "Enter" && handleGetSuggestion()}
                />
                <button
                  className="reschedule-get-btn"
                  onClick={handleGetSuggestion}
                  disabled={loading || !rescheduleInput.trim()}
                >
                  {loading ? <span className="ai-spinner" /> : "Get Suggestion"}
                </button>

                {error && <p className="reschedule-error">{error}</p>}

                {suggestion && (
                  <div className="reschedule-card">
                    <div className="reschedule-card-date">
                      {dayjs(suggestion.date).format("dddd, MMMM D, YYYY")} at {suggestion.time}
                    </div>
                    <div className="reschedule-card-reason">{suggestion.reason}</div>
                    <div className="reschedule-card-actions">
                      <button className="reschedule-confirm-btn" onClick={handleConfirmReschedule}>
                        ✓ Confirm
                      </button>
                      <button className="reschedule-cancel-btn" onClick={() => setSuggestion(null)}>
                        Try again
                      </button>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default ReminderDetailView;
