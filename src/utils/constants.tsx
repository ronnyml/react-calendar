export const DAYS_IN_WEEK: number = 7;
export const TOTAL_SQUARES: number = 35;
export const YEAR_RANGE_SIZE: number = 12;
export const MAX_VISIBLE_REMINDERS: number = 2;

export const DAYS_OF_WEEK: string[] = [
  "Sun",
  "Mon",
  "Tue",
  "Wed",
  "Thu",
  "Fri",
  "Sat",
];

export const WEEKEND_CLASSES = (index: number): string => 
  index % DAYS_IN_WEEK === 0 || index % DAYS_IN_WEEK === 6 ? "weekend" : "";

export const CATEGORY_COLORS: Record<string, { bg: string; border: string; text: string }> = {
  work:     { bg: "#eff6ff", border: "#2563eb", text: "#1d4ed8" },
  personal: { bg: "#f0fdf4", border: "#16a34a", text: "#15803d" },
  health:   { bg: "#fff7ed", border: "#ea580c", text: "#c2410c" },
  other:    { bg: "#faf5ff", border: "#9333ea", text: "#7e22ce" },
};

export const CATEGORY_COLORS_DARK: Record<string, { bg: string; border: string; text: string }> = {
  work:     { bg: "#1e3a5f", border: "#60a5fa", text: "#93c5fd" },
  personal: { bg: "#14532d", border: "#4ade80", text: "#86efac" },
  health:   { bg: "#431407", border: "#fb923c", text: "#fdba74" },
  other:    { bg: "#3b0764", border: "#c084fc", text: "#d8b4fe" },
};

export const ADD_REMINDER = "ADD_REMINDER";
export const EDIT_REMINDER = "EDIT_REMINDER";
export const DELETE_REMINDER = "DELETE_REMINDER";

