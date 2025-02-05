import { useState } from "react";
import dayjs from "dayjs";

import {
  TOTAL_SQUARES,
  DAYS_OF_WEEK,
  WEEKEND_CLASSES,
} from "../utils/constants";
import YearSelector from "./YearSelector";
import { GenerateDaysProps } from "../interfaces/GenerateDays";

const Calendar = () => {
  const [currentDate, setCurrentDate] = useState(dayjs());
  const [showYearSelector, setShowYearSelector] = useState(false);
  const [baseYear, setBaseYear] = useState(currentDate.year());
  const startOfMonth = currentDate.startOf("month");
  const daysInMonth = startOfMonth.daysInMonth();
  const startDay = startOfMonth.day();

  const changeMonth = (offset: number) =>
    setCurrentDate(currentDate.add(offset, "month"));
  const setYearRange = (offset: number) => setBaseYear(baseYear + offset);
  const selectYear = (year: number) => {
    setCurrentDate(currentDate.year(year));
    setShowYearSelector(false);
  };

  const renderDay = (day: number, key: string, className: string) => {
    return (
      <div className={`day ${className}`} key={key}>
        <div className="day-header">
          <span>{day}</span>
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
    </div>
  );
};

export default Calendar;
