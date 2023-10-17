import axios from "axios";
import { getDaysInMonth } from "date-fns";
import { CalendarResponse } from "../models/responses/Calendar";
import { formatCoreUrl } from "./ServiceUtil";
import { formatUtcToLocalDate } from "../utils/date";

export default async function getCalendarRecords(date: Date) {
  const currentDate = date || new Date();
  const fromDate = new Date(currentDate);
  fromDate.setDate(1);
  fromDate.setMonth(currentDate.getMonth());
  fromDate.setFullYear(currentDate.getFullYear());

  const toDate = new Date(currentDate);
  toDate.setDate(getDaysInMonth(currentDate));
  toDate.setMonth(currentDate.getMonth());
  toDate.setFullYear(currentDate.getFullYear());
  toDate.setHours(23, 59, 59);
  const res = await axios.get<CalendarResponse[]>(formatCoreUrl("/calendar"), {
    params: {
      fromTime: fromDate.toISOString(),
      toTime: toDate.toISOString(),
    },
  });
  return res.data;
}

export async function getClubCalendarRecords(
  clubId: string | number,
  currentDate = new Date()
) {
  const fromDate = new Date(currentDate);
  fromDate.setDate(1);
  fromDate.setMonth(currentDate.getMonth());
  fromDate.setFullYear(currentDate.getFullYear());

  const toDate = new Date(currentDate);
  toDate.setDate(getDaysInMonth(currentDate));
  toDate.setMonth(currentDate.getMonth());
  toDate.setFullYear(currentDate.getFullYear());
  toDate.setHours(23, 59, 59);
  const res = await axios.get<CalendarResponse[]>(
    formatCoreUrl(`/calendar/club/${clubId}`),
    {
      params: {
        fromTime: fromDate.toISOString(),
        toTime: toDate.toISOString(),
        pageNumber: 1,
        pageSize: 100,
      },
    }
  );
  return res.data;
}
