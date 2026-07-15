import { useState, useReducer, useEffect, useRef } from "react";
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
  DELETE_REMINDER,
  CATEGORY_COLORS,
  CATEGORY_COLORS_DARK,
} from "../utils/constants";
import AgendaView from "./AgendaView";
import WeekView from "./WeekView";
import SearchBar from "./SearchBar";
import AiChat from "./AiChat";
import WeeklyDigest from "./WeeklyDigest";
import DeleteConfirmation from "./DeleteConfirmation";
import ReminderForm from "./ReminderForm";
import ReminderList from "./ReminderList";
import ReminderDetailView from "./ReminderDetailView";
import YearSelector from "./YearSelector";
import { GenerateDaysProps } from "../interfaces/GenerateDays";
import { Reminder, ReminderDetail, RemindersState, ShowReminderFormState } from "../interfaces/Reminder";

const STORAGE_KEY = "calendar-reminders";
const THEME_KEY = "calendar-theme";

const expandRecurring = (reminders: RemindersState, windowStart: string, windowEnd: string): RemindersState => {
  const result: RemindersState = {};

  for (const [date, list] of Object.entries(reminders)) {
    for (const reminder of list) {
      const addTo = (d: string) => {
        if (!result[d]) result[d] = [];
        if (!result[d].some((r) => r.text === reminder.text && r.time === reminder.time && r.recurrence === reminder.recurrence)) {
          result[d].push(reminder);
        }
      };

      if (date >= windowStart && date <= windowEnd) addTo(date);

      const recurrence = reminder.recurrence ?? "none";
      if (recurrence === "none") continue;

      let cursor = dayjs(date);
      const end = dayjs(windowEnd);
      const originalDay = cursor.date();
      while (cursor.isBefore(end) || cursor.isSame(end, "day")) {
        if (recurrence === "daily")        cursor = cursor.add(1, "day");
        else if (recurrence === "weekly")  cursor = cursor.add(1, "week");
        else if (recurrence === "monthly") {
          cursor = cursor.add(1, "month");
          cursor = cursor.date(Math.min(originalDay, cursor.daysInMonth()));
        }
        else break; // unknown value — bail out to prevent infinite loop
        const d = cursor.format("YYYY-MM-DD");
        if (d > windowEnd) break;
        if (d >= windowStart) addTo(d);
      }
    }
  }

  return result;
};

const loadReminders = (): RemindersState => {
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    return saved ? (JSON.parse(saved) as RemindersState) : {};
  } catch {
    return {};
  }
};

const Calendar = () => {
  const today = dayjs().format("YYYY-MM-DD");
  const [isDark, setIsDark] = useState(() => localStorage.getItem(THEME_KEY) === "dark");
  const [viewMode, setViewMode] = useState<"month" | "week" | "agenda">("month");
  const [search, setSearch] = useState("");
  const [dragOverDate, setDragOverDate] = useState<string | null>(null);
  const dragSource = useRef<{ date: string; reminder: Reminder } | null>(null);
  const [currentDate, setCurrentDate] = useState(dayjs());
  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  const [showYearSelector, setShowYearSelector] = useState(false);
  const [baseYear, setBaseYear] = useState(currentDate.year());
  const startOfMonth = currentDate.startOf("month");
  const daysInMonth = startOfMonth.daysInMonth();
  const startDay = startOfMonth.day();
  const [reminders, dispatch] = useReducer(remindersReducer, undefined, loadReminders);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(reminders));
  }, [reminders]);

  useEffect(() => {
    localStorage.setItem(THEME_KEY, isDark ? "dark" : "light");
  }, [isDark]);

  const [reminderDetail, setReminderDetail] = useState<ReminderDetail | null>(null);
  const [showReminderForm, setShowReminderForm] = useState<ShowReminderFormState | null>(null);
  const [showDeleteConfirmation, setShowDeleteConfirmation] = useState(false);
  const [viewMoreDate, setViewMoreDate] = useState<string | null>(null);
  const [showDigest, setShowDigest] = useState(false);

  const changeMonth = (offset: number) =>
    setCurrentDate(currentDate.add(offset, "month"));
  const setYearRange = (offset: number) => setBaseYear(baseYear + offset);
  const selectYear = (year: number) => {
    setCurrentDate(currentDate.year(year));
    setShowYearSelector(false);
  };
  const goToToday = () => setCurrentDate(dayjs());

  useEffect(() => {
    const handle = (e: KeyboardEvent) => {
      const tag = (e.target as HTMLElement).tagName;
      if (tag === "INPUT" || tag === "TEXTAREA" || tag === "SELECT") return;

      const anyModalOpen = showReminderForm || reminderDetail || showDeleteConfirmation || viewMoreDate || showYearSelector;

      if (e.key === "Escape") {
        if (showDeleteConfirmation)  setShowDeleteConfirmation(false);
        else if (reminderDetail)     setReminderDetail(null);
        else if (showReminderForm)   setShowReminderForm(null);
        else if (viewMoreDate)       setViewMoreDate(null);
        else if (showYearSelector)   setShowYearSelector(false);
        return;
      }

      if (anyModalOpen) return;

      switch (e.key) {
        case "ArrowLeft":  changeMonth(-1); break;
        case "ArrowRight": changeMonth(1);  break;
        case "n": case "N":
          setSelectedDate(today);
          setShowReminderForm({ isEditMode: false, detail: null });
          break;
        case "t": case "T": goToToday();          break;
        case "m": case "M": setViewMode("month");  break;
        case "w": case "W": setViewMode("week");   break;
        case "a": case "A": setViewMode("agenda"); break;
      }
    };

    window.addEventListener("keydown", handle);
    return () => window.removeEventListener("keydown", handle);
  }, [showReminderForm, reminderDetail, showDeleteConfirmation, viewMoreDate, showYearSelector, today, currentDate]);

  const renderDay = (day: number, key: string, date: dayjs.Dayjs, className: string) => {
    const formattedDate = date.format("YYYY-MM-DD");
    const isToday = formattedDate === today;
    const dayReminders = expandedReminders[formattedDate] || [];
    const hiddenRemindersCount = dayReminders.length - MAX_VISIBLE_REMINDERS;
    const query = search.trim().toLowerCase();

    const isDragOver = dragOverDate === formattedDate;

    return (
      <div
        className={`day ${className}${isDragOver ? " drag-over" : ""}`}
        key={key}
        onClick={() => {
          setSelectedDate(formattedDate);
          setShowReminderForm({ isEditMode: false, detail: null });
        }}
        onDragOver={(e) => { e.preventDefault(); setDragOverDate(formattedDate); }}
        onDragLeave={() => setDragOverDate(null)}
        onDrop={(e) => {
          e.preventDefault();
          setDragOverDate(null);
          if (dragSource.current && dragSource.current.date !== formattedDate) {
            moveReminder(formattedDate, dragSource.current.reminder);
          }
          dragSource.current = null;
        }}
      >
        <div className="day-header">
          <span className={isToday ? "today-badge" : ""}>{day}</span>
          <div className="reminders">
            {dayReminders
              .slice(0, MAX_VISIBLE_REMINDERS)
              .map((reminder: Reminder, index: number) => {
                const palette = isDark ? CATEGORY_COLORS_DARK : CATEGORY_COLORS;
                const colors = palette[reminder.category ?? "other"];
                const isMatch = query && reminder.text.toLowerCase().includes(query);
                const isDimmed = query && !isMatch;
                return (
                  <div
                    className={`reminder-pill clickable${isMatch ? " pill-match" : ""}${isDimmed ? " pill-dim" : ""}`}
                    key={index}
                    draggable
                    style={{ background: colors.bg, borderLeftColor: colors.border, color: colors.text }}
                    onDragStart={(e) => {
                      e.stopPropagation();
                      dragSource.current = { date: formattedDate, reminder };
                      e.dataTransfer.effectAllowed = "move";
                    }}
                    onClick={(e) => {
                      e.stopPropagation();
                      setReminderDetail({date: formattedDate, reminder, index});
                    }}
                  >
                    {reminder.text}
                  </div>
                );
              })}
            {hiddenRemindersCount > 0 && (
              <div
                className="view-more"
                onClick={(e) => {
                  e.stopPropagation();
                  setViewMoreDate(formattedDate);
                }}
              >
                +{hiddenRemindersCount} more
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
    const prevMonthDays = generateDays({
      offset: -startDay,
      totalDays: startDay,
      baseDate: startOfMonth,
      labelPrefix: "prev",
      extraClass: "other-month",
    });

    const currentMonthDays = generateDays({
      offset: 0,
      totalDays: daysInMonth,
      baseDate: startOfMonth,
      labelPrefix: "current",
      extraClass: "current-month",
    });

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

  const windowStart = startOfMonth.subtract(7, "day").format("YYYY-MM-DD");
  const windowEnd = startOfMonth.add(daysInMonth + 14, "day").format("YYYY-MM-DD");
  const expandedReminders = expandRecurring(reminders, windowStart, windowEnd);

  const filteredReminders: RemindersState = search.trim()
    ? Object.fromEntries(
        Object.entries(expandedReminders)
          .map(([date, list]) => [
            date,
            list.filter((r) => r.text.toLowerCase().includes(search.toLowerCase())),
          ])
          .filter(([, list]) => (list as Reminder[]).length > 0)
      )
    : expandedReminders;

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

  const moveReminder = (toDate: string, reminder: Reminder) => {
    dispatch({ type: "MOVE_REMINDER", payload: { toDate, reminder } });
  };

  const deleteReminder = (date: string, index: number) => {
    dispatch({ type: DELETE_REMINDER, payload: { date, index } });
    setReminderDetail(null);
    setShowDeleteConfirmation(false);
  };

  const rescheduleReminder = (fromDate: string, index: number, toDate: string, updatedReminder: import("../interfaces/Reminder").Reminder) => {
    dispatch({ type: DELETE_REMINDER, payload: { date: fromDate, index } });
    dispatch({ type: ADD_REMINDER, payload: { date: toDate, reminder: updatedReminder } });
    setReminderDetail(null);
  };

  return (
    <div className="calendar-container" data-theme={isDark ? "dark" : "light"}>
      <div className="header">
        <button className="nav-btn" onClick={() => changeMonth(-1)}>&#8249;</button>
        <div className="header-center">
          <h2
            className="clickable-year"
            onClick={() => setShowYearSelector(!showYearSelector)}
          >
            {currentDate.format("MMMM YYYY")}
          </h2>
          <div className="header-actions">
            <div className="view-toggle">
              <button
                className={`view-toggle-btn ${viewMode === "month" ? "active" : ""}`}
                onClick={() => setViewMode("month")}
              >
                Month
              </button>
              <button
                className={`view-toggle-btn ${viewMode === "week" ? "active" : ""}`}
                onClick={() => setViewMode("week")}
              >
                Week
              </button>
              <button
                className={`view-toggle-btn ${viewMode === "agenda" ? "active" : ""}`}
                onClick={() => setViewMode("agenda")}
              >
                Agenda
              </button>
            </div>
            <button className="today-btn" onClick={goToToday}>Today</button>
            <button className="digest-btn" onClick={() => setShowDigest(true)}>📊 Digest</button>
            <button className="theme-toggle" onClick={() => setIsDark(d => !d)} aria-label="Toggle dark mode">
              {isDark ? "☀️" : "🌙"}
            </button>
          </div>
        </div>
        <button className="nav-btn" onClick={() => changeMonth(1)}>&#8250;</button>
      </div>
      {showYearSelector && (
        <YearSelector
          baseYear={baseYear}
          setYearRange={setYearRange}
          selectYear={selectYear}
          closeYearSelector={() => setShowYearSelector(false)}
        />
      )}
      <SearchBar value={search} onChange={setSearch} />
      {search && (
        <div className="search-results-count">
          {Object.values(filteredReminders).flat().length} reminder
          {Object.values(filteredReminders).flat().length !== 1 ? "s" : ""} matching &ldquo;{search}&rdquo;
        </div>
      )}
      {viewMode === "month" && (
        <>
          <div className="days-of-week">
            {DAYS_OF_WEEK.map((day) => (
              <div className="day-of-week" key={day}>
                {day}
              </div>
            ))}
          </div>
          <div className="days-grid">{renderDays()}</div>
        </>
      )}
      {viewMode === "week" && (
        <WeekView
          currentDate={currentDate}
          reminders={filteredReminders}
          isDark={isDark}
          today={today}
          onReminderClick={(detail) => setReminderDetail(detail)}
          onSlotClick={(date) => {
            setSelectedDate(date);
            setShowReminderForm({ isEditMode: false, detail: null });
          }}
        />
      )}
      {viewMode === "agenda" && (
        <AgendaView
          reminders={filteredReminders}
          isDark={isDark}
          onReminderClick={(detail) => setReminderDetail(detail)}
          onAddClick={(date) => {
            setSelectedDate(date);
            setShowReminderForm({ isEditMode: false, detail: null });
          }}
        />
      )}
      {viewMoreDate && (
        <ReminderList
          date={viewMoreDate}
          reminders={expandedReminders[viewMoreDate] || []}
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
          reminders={expandedReminders}
        />
      )}
      {reminderDetail && !showDeleteConfirmation && (
        <ReminderDetailView
          detail={reminderDetail}
          editReminder={editReminder}
          setShowReminderForm={(params) => {
            if (params.detail) setSelectedDate(params.detail.date);
            setShowReminderForm(params);
            setReminderDetail(null);
          }}
          openDeleteConfirmation={() => setShowDeleteConfirmation(true)}
          closeDetail={() => setReminderDetail(null)}
          onReschedule={rescheduleReminder}
          reminders={reminders}
          today={today}
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
      {showDigest && (
        <WeeklyDigest
          reminders={reminders}
          today={today}
          onClose={() => setShowDigest(false)}
        />
      )}
      <AiChat reminders={reminders} today={today} />
    </div>
  );
};

export default Calendar;
