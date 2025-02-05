import dayjs from "dayjs";

export interface GenerateDaysProps {
  offset: number;
  totalDays: number;
  baseDate: dayjs.Dayjs;
  labelPrefix: string;
  extraClass: string;
}
