import React from "react";
import { Dayjs } from "dayjs";
import { Reminder, RemindersState, ReminderDetail } from "../interfaces/Reminder";
import { CATEGORY_COLORS, CATEGORY_COLORS_DARK } from "../utils/constants";

interface WeekViewProps {
  currentDate: Dayjs;
  reminders: RemindersState;
  isDark: boolean;
  today: string;
  onReminderClick: (detail: ReminderDetail) => void;
  onSlotClick: (date: string) => void;
}

const HOURS = Array.from({ length: 24 }, (_, i) => i);

const WeekView: React.FC<WeekViewProps> = ({
  currentDate,
  reminders,
  isDark,
  today,
  onReminderClick,
  onSlotClick,
}) => {
  const palette = isDark ? CATEGORY_COLORS_DARK : CATEGORY_COLORS;
  const startOfWeek = currentDate.startOf("week");
  const days = Array.from({ length: 7 }, (_, i) => startOfWeek.add(i, "day"));

  const getRemindersForSlot = (date: string, hour: number): { reminder: Reminder; index: number }[] => {
    const list = reminders[date] || [];
    return list
      .map((reminder, index) => ({ reminder, index }))
      .filter(({ reminder }) => {
        if (!reminder.time) return false;
        const h = parseInt(reminder.time.split(":")[0], 10);
        return h === hour;
      });
  };

  return (
    <div className="week-view">
      {/* Column headers */}
      <div className="week-header-row">
        <div className="week-time-gutter" />
        {days.map((day) => {
          const formatted = day.format("YYYY-MM-DD");
          const isToday = formatted === today;
          return (
            <div key={formatted} className={`week-day-header ${isToday ? "week-today-header" : ""}`}>
              <span className="week-day-name">{day.format("ddd")}</span>
              <span className={`week-day-num ${isToday ? "today-badge" : ""}`}>{day.date()}</span>
            </div>
          );
        })}
      </div>

      {/* Time grid */}
      <div className="week-grid-scroll">
        <div className="week-grid">
          {HOURS.map((hour) => (
            <React.Fragment key={hour}>
              <div className="week-time-label">
                {hour === 0 ? "" : `${hour.toString().padStart(2, "0")}:00`}
              </div>
              {days.map((day) => {
                const formatted = day.format("YYYY-MM-DD");
                const slots = getRemindersForSlot(formatted, hour);
                return (
                  <div
                    key={formatted}
                    className="week-cell"
                    onClick={() => onSlotClick(formatted)}
                  >
                    {slots.map(({ reminder, index }) => {
                      const colors = palette[reminder.category ?? "other"];
                      return (
                        <div
                          key={index}
                          className="week-event"
                          style={{ background: colors.bg, borderLeftColor: colors.border, color: colors.text }}
                          onClick={(e) => {
                            e.stopPropagation();
                            onReminderClick({ date: formatted, reminder, index });
                          }}
                        >
                          {reminder.text}
                        </div>
                      );
                    })}
                  </div>
                );
              })}
            </React.Fragment>
          ))}
        </div>
      </div>
    </div>
  );
};

export default WeekView;
