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
  EDIT_REMINDER,
  DELETE_REMINDER
} from "../utils/constants";
import DeleteConfirmation from "./DeleteConfirmation";
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
  const [showDeleteConfirmation, setShowDeleteConfirmation] = useState(false);
  const [viewMoreDate, setViewMoreDate] = useState<string | null>(null);

  const changeMonth = (offset: number) =>
    setCurrentDate(currentDate.add(offset, "month"));
  const setYearRange = (offset: number) => setBaseYear(baseYear + offset);
  const selectYear = (year: number) => {
    setCurrentDate(currentDate.year(year));
    setShowYearSelector(false);
  };

  const renderDay = (day: number, key: string, date: dayjs.Dayjs, className: string) => {
    const formattedDate = date.format("YYYY-MM-DD");
    const dayReminders = reminders[formattedDate] || [];
    const hiddenRemindersCount = dayReminders.length - MAX_VISIBLE_REMINDERS;

    return (
      <div
        className={`day ${className}`}
        key={key}
        onClick={() => {
          setSelectedDate(formattedDate);
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
                    setReminderDetail({date: formattedDate, reminder, index});
                  }}
                >
                  {reminder.text.length > 10
                    ? `${reminder.text.slice(0, 10)}...`
                    : reminder.text}
                </div>
              ))}
            {hiddenRemindersCount > 0 && (
              <div
                className="view-more clickable"
                onClick={(e) => {
                  e.stopPropagation();
                  setViewMoreDate(formattedDate);
                }}
              >
                +{hiddenRemindersCount}
              </div>
            )}
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
      const dayDate = baseDate.add(offset + i, "day");
      const currentDay = baseDate.add(offset + i, "day").date();
      const key = `${labelPrefix}-${i}`;
      const className = `${extraClass} ${WEEKEND_CLASSES(offset + startDay + i)}`;
      days.push(renderDay(currentDay, key, dayDate, className));
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

  const deleteReminder = (date: string, index: number) => {
    dispatch({ type: DELETE_REMINDER, payload: { date, index } });
    setReminderDetail(null);
    setShowDeleteConfirmation(false);
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
      {viewMoreDate && (
        <ReminderList
          date={viewMoreDate}
          reminders={reminders[viewMoreDate]}
          closePopup={() => setViewMoreDate(null)}
          onReminderClick={(detail) => setReminderDetail(detail)}
        />
      )}
      {showReminderForm && selectedDate && (
        <ReminderForm
          date={selectedDate}
          detail={showReminderForm.detail}
          addReminder={addReminder}
          editReminder={editReminder}
          closeForm={() => setShowReminderForm(null)}
        />
      )}
      {reminderDetail && !showDeleteConfirmation && (
        <ReminderDetailView
          detail={reminderDetail}
          editReminder={editReminder}
          setShowReminderForm={(params) => {
            setShowReminderForm(params);
            setReminderDetail(null);
          }}
          openDeleteConfirmation={() => setShowDeleteConfirmation(true)}
          closeDetail={() => setReminderDetail(null)}
        />
      )}
      {showDeleteConfirmation && reminderDetail && (
        <DeleteConfirmation
          confirmDelete={() =>
            deleteReminder(reminderDetail.date, reminderDetail.index)
          }
          cancelDelete={() => setShowDeleteConfirmation(false)}
        />
      )}
    </div>
  );
};

export default Calendar;
