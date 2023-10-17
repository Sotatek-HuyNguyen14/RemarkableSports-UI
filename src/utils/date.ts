/* eslint-disable no-restricted-syntax */
import { format, isBefore, isMatch, parse } from "date-fns";
import { formatInTimeZone } from "date-fns-tz";
import { timezone } from "expo-localization";
import { getTranslation } from "./translation";
import i18n from "../language";

export const FORMAT_DATE_UI = "yyyy-MM-dd";
export const FORMAT_DATE_UI_V2 = "MM-dd-yyyy";
export const FORMAT_DATE_REQUEST = "yyyy-MM-dd";
export const FORMAT_DATE_RESPONSE = "yyyy-MM-dd";
export const FORMAT_DATE_CALENDAR = "yyyy-MM-dd"; // Used for calendar component
export const FORMAT_TIME_12H = "hh:mm a";
export const FORMAT_TIME_24H = "HH:mm";
export const FORMAT_TIME_24H_SECONDS = "HH:mm:ss";
export const FORMAT_TIME_24H_FRACTION_OF_SECONDS = "HH:mm:ss.SSS";
export const FORMAT_DATETIME = "yyyy-MM-dd hh:mm a";
export const FORMAT_DATETIME_UTC = "yyyy-MM-dd'T'HH:mmX";
export const FORMAT_LOCAL_TIME = "HH:mm:ss.SSS";
export const ISO_STRING = "yyyy-MM-dd'T'HH:mm";

export function formatHourMinute(date: Date) {
  let result = format(date, "hh:mm a");
  if (i18n.locale === "en") {
    result = result.replace("上午", "AM");
    result = result.replace("下午", "PM");
  } else {
    result = result.replace("AM", "上午");
    result = result.replace("PM", "下午");
  }
  return result;
}

export function formatDDMMYYY(date: Date) {
  return format(date, "dd-MM-yyyy");
}

const t = getTranslation("constant.date");

// 1. form input timezoned date string
// 2. form input 12H time string-> call format12HTo24H() to 24H string
// Frontend response:
// 1. get DateOnly string-> call formatResponseDate() to get date string in user timezone & format. e.g. 2022-07-21 to 21-07-2022
// 2. get TimeOnly string-> call format24HTo12H() to get time string in user timezone. e.g. 16:30 to 04:30PM
// 3. get DateTime which is ISO-8601 timezoned string -> axios interceptor format to UTC Date obj -> call formatUtcToLocalDate() to get local Date && call formatUtcToLocalTime() to get local time

function convertDateAndTimeFormat(
  value: string,
  sourceFormatString: string,
  targetFormatString: string
) {
  let result = formatInTimeZone(
    parse(value, sourceFormatString, new Date()),
    timezone,
    targetFormatString
  );
  if (i18n.locale === "en") {
    result = result.replace("上午", "AM");
    result = result.replace("下午", "PM");
  } else {
    result = result.replace("AM", "上午");
    result = result.replace("PM", "下午");
  }
  return result;
}

/**
 * @param time - hh:mma (mainly from time picker modal)
 * @returns hh:mma from {@link FORMAT_TIME_12H}
 * @example input 02:05PM timezone Time => output 14:05 timezone Time
 */
export function format12HTo24H(time: string) {
  return convertDateAndTimeFormat(time, FORMAT_TIME_12H, FORMAT_TIME_24H);
}

/**
 * @param time - HH:mm or HH:mm:ss or HH:mm:ss.SSS
 * @returns hh:mma from {@link FORMAT_TIME_12H}
 * @example input 14:05 timezone Time => output 02:05PM timezone Time
 */
export function format24HTo12H(time: string) {
  if (isMatch(time, FORMAT_TIME_24H))
    return convertDateAndTimeFormat(time, FORMAT_TIME_24H, FORMAT_TIME_12H);
  if (isMatch(time, FORMAT_TIME_24H_SECONDS))
    return convertDateAndTimeFormat(
      time,
      FORMAT_TIME_24H_SECONDS,
      FORMAT_TIME_12H
    );
  if (isMatch(time, FORMAT_TIME_24H_FRACTION_OF_SECONDS))
    return convertDateAndTimeFormat(
      time,
      FORMAT_TIME_24H_FRACTION_OF_SECONDS,
      FORMAT_TIME_12H
    );
  throw new Error("parameter time not matching any defined format string");
}

export function formatResponseDate(date: string) {
  return convertDateAndTimeFormat(date, FORMAT_DATE_RESPONSE, FORMAT_DATE_UI);
}

export function formatUtcToLocalDate(
  date: Date,
  formatType: typeof FORMAT_DATE_UI | typeof FORMAT_DATE_UI_V2 = FORMAT_DATE_UI
) {
  return formatInTimeZone(date, timezone, formatType);
}

export function formatUtcToLocalTime(date: Date) {
  let result = formatInTimeZone(date, timezone, FORMAT_TIME_12H);
  if (i18n.locale === "en") {
    result = result.replace("上午", "AM");
    result = result.replace("下午", "PM");
  } else {
    result = result.replace("AM", "上午");
    result = result.replace("PM", "下午");
  }
  return result;
}

export function formatDateTimeToTimezone(time: string) {
  return parse(time, FORMAT_DATETIME, new Date());
}

// Used for Calendar screen & component
export function formatDateToCalendar(date: Date) {
  return formatInTimeZone(date, timezone, FORMAT_DATE_CALENDAR);
}

/**
 * @param startTime - hh mm:AM
 * @returns boolean
 * @example  startTime 02:00AM endTime 01:00PM => true
 */
export function validateTimeRange(
  startTime: string | undefined,
  endTime: string | undefined
) {
  // if either of them is empty
  if (!startTime || !endTime) {
    return true;
  }

  if (startTime.length > 5 && endTime.length > 5) {
    const startTimeText = format12HTo24H(startTime);
    const tendTimeText = format12HTo24H(endTime);
    const newFromTime = parseInt(
      startTimeText?.substring(0, 5).replace(":", "").trim(),
      10
    );
    const newToTime = parseInt(
      tendTimeText?.substring(0, 5).replace(":", "").trim(),
      10
    );
    return newFromTime < newToTime;
  }
}

/**
 * @param date - yyyy-MM-dd
 * @param time - hh:mm a
 * @returns boolean
 */
export function validateIsPast(date: string, time: string) {
  const dateTime = parse(`${date} ${time}`, FORMAT_DATETIME, new Date());
  return isBefore(dateTime, new Date());
}

/**
 * Calculate age
 * @param {*} birthday array [year, month, day]
 * @return array
 */
export function getAge(birthday: Array<string>) {
  const date = new Date();
  const today = [date.getFullYear(), date.getMonth() + 1, date.getDate()];
  const age = today.map((value, index) => {
    return value - parseInt(birthday[index], 10);
  });
  if (age[2] < 0) {
    const lastMonth = new Date(today[0], today[1], 0);
    age[1] -= 1;
    age[2] += lastMonth.getDate();
  }
  if (age[1] < 0) {
    age[0] -= 1;
    age[1] += 12;
  }
  return age;
}

export function getDefaultEndTimeByStartTime(startTime: string) {
  const fromDate = new Date();
  const time24 = format12HTo24H(startTime);
  fromDate.setHours(Number(time24.split(":")[0]));
  fromDate.setMinutes(Number(time24.split(":")[1]));
  const endDate = new Date();
  endDate.setTime(fromDate.getTime() + 60 * 60 * 1000);
  const endTimeStr = formatUtcToLocalTime(endDate);
  return endTimeStr;
}

/**
 * Human readable elapsed or remaining time (example: 3 minutes ago)
 * @param  {Date|Number|String} date A Date object, timestamp or string parsable with Date.parse()
 * @param  {Date|Number|String} [nowDate] A Date object, timestamp or string parsable with Date.parse()
 * @param  {Intl.RelativeTimeFormat} [trf] A Intl formater
 * @return {string} Human readable elapsed or remaining time
 * @author github.com/victornpb
 * @see https://stackoverflow.com/a/67338038/938822
 */

function shortHandsTimeSince(time: String) {
  const value = time.split(" ");
  return `${value[0]}${t(value[1][0])}`;
}

export function timeSince(date: Date) {
  const SECOND = 1000;
  const MINUTE = 60 * SECOND;
  const HOUR = 60 * MINUTE;
  const DAY = 24 * HOUR;
  const WEEK = 7 * DAY;
  const MONTH = 30 * DAY;
  const YEAR = 365 * DAY;
  const units = [
    {
      max: 30 * SECOND,
      divisor: 1,
      past1: t("now"),
      pastN: t("now"),
      future1: t("now"),
      futureN: t("now"),
    },
    {
      max: MINUTE,
      divisor: SECOND,
      past1: t("a second ago"),
      pastN: t("# seconds ago"),
      future1: t("in a second"),
      futureN: t("in # seconds"),
    },
    {
      max: HOUR,
      divisor: MINUTE,
      past1: t("a minute ago"),
      pastN: t("# minutes ago"),
      future1: t("in a minute"),
      futureN: t("in # minutes"),
    },
    {
      max: DAY,
      divisor: HOUR,
      past1: t("an hour ago"),
      pastN: t("# hours ago"),
      future1: t("in an hour"),
      futureN: t("in # hours"),
    },
    {
      max: WEEK,
      divisor: DAY,
      past1: t("yesterday"),
      pastN: t("# days ago"),
      future1: t("tomorrow"),
      futureN: t("in # days"),
    },
    {
      max: 4 * WEEK,
      divisor: WEEK,
      past1: t("last week"),
      pastN: t("# weeks ago"),
      future1: t("in a week"),
      futureN: t("in # weeks"),
    },
    {
      max: YEAR,
      divisor: MONTH,
      past1: t("last month"),
      pastN: t("# months ago"),
      future1: t("in a month"),
      futureN: t("in # months"),
    },
    {
      max: 100 * YEAR,
      divisor: YEAR,
      past1: t("last year"),
      pastN: t("# years ago"),
      future1: t("in a year"),
      futureN: t("in # years"),
    },
    {
      max: 1000 * YEAR,
      divisor: 100 * YEAR,
      past1: "last century",
      pastN: "# centuries ago",
      future1: "in a century",
      futureN: "in # centuries",
    },
    {
      max: Infinity,
      divisor: 1000 * YEAR,
      past1: "last millennium",
      pastN: "# millennia ago",
      future1: "in a millennium",
      futureN: "in # millennia",
    },
  ];
  const diff =
    Date.now() - (typeof date === "object" ? date : new Date(date)).getTime();
  const diffAbs = Math.abs(diff);
  for (const unit of units) {
    if (diffAbs < unit.max) {
      const isFuture = diff < 0;
      const x = Math.round(Math.abs(diff) / unit.divisor);
      if (x <= 1) return isFuture ? unit.future1 : unit.past1;
      return (isFuture ? unit.futureN : unit.pastN).replace("#", x);
    }
  }
}
