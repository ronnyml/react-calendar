import React from "react";
import dayjs from "dayjs";
import { Reminder, RemindersState, ReminderDetail } from "../interfaces/Reminder";
import { CATEGORY_COLORS, CATEGORY_COLORS_DARK } from "../utils/constants";

interface AgendaViewProps {
  reminders: RemindersState;
  isDark: boolean;
  onReminderClick: (detail: ReminderDetail) => void;
  onAddClick: (date: string) => void;
}

const AgendaView: React.FC<AgendaViewProps> = ({ reminders, isDark, onReminderClick, onAddClick }) => {
  const today = dayjs().format("YYYY-MM-DD");
  const palette = isDark ? CATEGORY_COLORS_DARK : CATEGORY_COLORS;

  const upcomingDates = Object.keys(reminders)
    .filter((date) => date >= today && reminders[date].length > 0)
    .sort();

  const pastDates = Object.keys(reminders)
    .filter((date) => date < today && reminders[date].length > 0)
    .sort()
    .reverse()
    .slice(0, 5);

  const renderGroup = (date: string, isPast = false) => {
    const dayReminders = reminders[date] || [];
    if (dayReminders.length === 0) return null;
    const isToday = date === today;
    const label = isToday
      ? "Today"
      : dayjs(date).format("dddd, MMMM D, YYYY");

    return (
      <div key={date} className={`agenda-group ${isPast ? "agenda-past" : ""}`}>
        <div className={`agenda-date-label ${isToday ? "agenda-today-label" : ""}`}>
          {label}
        </div>
        {dayReminders.map((reminder: Reminder, index: number) => {
          const colors = palette[reminder.category ?? "other"];
          return (
            <div
              key={index}
              className="agenda-item"
              style={{ borderLeftColor: colors.border }}
              onClick={() => onReminderClick({ date, reminder, index })}
            >
              <div className="agenda-item-time">{reminder.time}</div>
              <div className="agenda-item-content">
                <span className="agenda-item-text">{reminder.text}</span>
                <span
                  className="agenda-item-category"
                  style={{ background: colors.bg, color: colors.text }}
                >
                  {reminder.category ?? "other"}
                </span>
              </div>
              <div className="agenda-item-city">{reminder.city}</div>
            </div>
          );
        })}
      </div>
    );
  };

  return (
    <div className="agenda-view">
      {upcomingDates.length === 0 && (
        <div className="agenda-empty">
          <p>No upcoming reminders.</p>
          <button className="agenda-add-btn" onClick={() => onAddClick(today)}>
            + Add one for today
          </button>
        </div>
      )}

      {upcomingDates.map((date) => renderGroup(date))}

      {pastDates.length > 0 && (
        <>
          <div className="agenda-section-divider">Past (last 5 days with reminders)</div>
          {pastDates.map((date) => renderGroup(date, true))}
        </>
      )}
    </div>
  );
};

export default AgendaView;
