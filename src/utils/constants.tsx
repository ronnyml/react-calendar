export const DAYS_IN_WEEK: number = 7;
export const TOTAL_SQUARES: number = 35;
export const YEAR_RANGE_SIZE: number = 12;
export const MAX_VISIBLE_REMINDERS: number = 2;

export const DAYS_OF_WEEK: string[] = [
  "Sunday",
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
  "Friday",
  "Saturday",
];

export const WEEKEND_CLASSES = (index: number): string => 
  index % DAYS_IN_WEEK === 0 || index % DAYS_IN_WEEK === 6 ? "weekend" : "";

export const ADD_REMINDER = "ADD_REMINDER";
export const EDIT_REMINDER = "EDIT_REMINDER";
export const DELETE_REMINDER = "DELETE_REMINDER";
