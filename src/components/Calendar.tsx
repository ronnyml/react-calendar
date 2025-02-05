import { useState, useReducer } from "react";
import dayjs from "dayjs";

import {
  remindersReducer
} from "../state/remindersReducer";
import {
  TOTAL_SQUARES,
  DAYS_OF_WEEK,
  WEEKEND_CLASSES,
  MAX_VISIBLE_REMINDERS,
  ADD_REMINDER,
  EDIT_REMINDER
} from "../utils/constants";
import ReminderForm from "./ReminderForm";
import ReminderList from "./ReminderList";
import ReminderDetailView from "./ReminderDetailView";
import YearSelector from "./YearSelector";
import { GenerateDaysProps } from "../interfaces/GenerateDays";
import { Reminder, ReminderDetail, ShowReminderFormState } from "../interfaces/Reminder";

const Calendar = () => {
  const [currentDate, setCurrentDate] = useState(dayjs());
  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  const [showYearSelector, setShowYearSelector] = useState(false);
  const [baseYear, setBaseYear] = useState(currentDate.year());
  const startOfMonth = currentDate.startOf("month");
  const daysInMonth = startOfMonth.daysInMonth();
  const startDay = startOfMonth.day();
  const [reminders, dispatch] = useReducer(remindersReducer, {});
  const [reminderDetail, setReminderDetail] = useState<ReminderDetail | null>(null);
  const [showReminderForm, setShowReminderForm] = useState<ShowReminderFormState | null>(null);

  const changeMonth = (offset: number) =>
    setCurrentDate(currentDate.add(offset, "month"));
  const setYearRange = (offset: number) => setBaseYear(baseYear + offset);
  const selectYear = (year: number) => {
    setCurrentDate(currentDate.year(year));
    setShowYearSelector(false);
  };

  const renderDay = (day: number, key: string, className: string) => {
    const date = dayjs(currentDate).date(day).format("YYYY-MM-DD");
    const dayReminders = reminders[date] || [];
    const hiddenRemindersCount = dayReminders.length - MAX_VISIBLE_REMINDERS;

    return (
      <div
        className={`day ${className}`}
        key={key}
        onClick={() => {
          setSelectedDate(date);
          setShowReminderForm({ isEditMode: false, detail: null });
        }}
      >
        <div className="day-header">
          <span>{day}</span>
          <div className="reminders">
            {dayReminders
              .slice(0, MAX_VISIBLE_REMINDERS)
              .map((reminder: Reminder, index: number) => (
                <div
                  className="reminder clickable"
                  key={index}
                  onClick={(e) => {
                    e.stopPropagation();
                    setReminderDetail({date, reminder, index});
                    setShowReminderForm({ isEditMode: true, detail: { date, index, reminder } });
                  }}
                >
                  {reminder.text.length > 10
                    ? `${reminder.text.slice(0, 10)}...`
                    : reminder.text}
                </div>
              ))}
          </div>
        </div>
      </div>
    );
  };

  const generateDays = ({
    offset,
    totalDays,
    baseDate,
    labelPrefix,
    extraClass,
  }: GenerateDaysProps) => {
    const days = [];
    for (let i = 0; i < totalDays; i++) {
      const currentDay = baseDate.add(offset + i, "day").date();
      const key = `${labelPrefix}-${i}`;
      const className = `${extraClass} ${WEEKEND_CLASSES(offset + startDay + i)}`;
      days.push(renderDay(currentDay, key, className));
    }
    return days;
  };

  const renderDays = () => {
    // Days from previous month
    const prevMonthDays = generateDays({
      offset: -startDay,
      totalDays: startDay,
      baseDate: startOfMonth,
      labelPrefix: "prev",
      extraClass: "other-month",
    });

    // Days in current month
    const currentMonthDays = generateDays({
      offset: 0,
      totalDays: daysInMonth,
      baseDate: startOfMonth,
      labelPrefix: "current",
      extraClass: "current-month",
    });

    // Days from next month
    const nextMonthDaysCount = TOTAL_SQUARES - (prevMonthDays.length + currentMonthDays.length);
    const nextMonthDays = generateDays({
      offset: daysInMonth,
      totalDays: nextMonthDaysCount,
      baseDate: startOfMonth,
      labelPrefix: "next",
      extraClass: "other-month",
    });

    return [...prevMonthDays, ...currentMonthDays, ...nextMonthDays];
  };

  const addReminder = (date: string, reminder: Reminder) => {
    dispatch({ type: ADD_REMINDER, payload: { date, reminder } });
    setShowReminderForm(null);
  };

  const editReminder = (date: string, index: number, updatedReminder: Reminder) => {
    dispatch({
      type: EDIT_REMINDER,
      payload: { date, index, updatedReminder },
    });
    setShowReminderForm(null);
  };

  return (
    <div className="calendar-container">
      <div className="header">
        <button onClick={() => changeMonth(-1)}>&lt;</button>
        <h2
          className="clickable-year"
          onClick={() => setShowYearSelector(!showYearSelector)}
        >
          {currentDate.format("MMMM")} {currentDate.format("YYYY")}
        </h2>
        <button onClick={() => changeMonth(1)}>&gt;</button>
      </div>
      {showYearSelector && (
        <YearSelector
          baseYear={baseYear}
          setYearRange={setYearRange}
          selectYear={selectYear}
          closeYearSelector={() => setShowYearSelector(false)}
        />
      )}
      <div className="days-of-week">
        {DAYS_OF_WEEK.map((day) => (
          <div className="day-of-week" key={day}>
            {day}
          </div>
        ))}
      </div>
      <div className="days-grid">{renderDays()}</div>
      {showReminderForm && selectedDate && (
        <ReminderForm
          date={selectedDate}
          detail={showReminderForm.detail}
          addReminder={addReminder}
          editReminder={editReminder}
          closeForm={() => setShowReminderForm(null)}
        />
      )}
      {reminderDetail && (
        <ReminderDetailView
          detail={reminderDetail}
          editReminder={editReminder}
          setShowReminderForm={setShowReminderForm}
          closeDetail={() => setReminderDetail(null)}
        />
      )}
    </div>
  );
};

export default Calendar;
