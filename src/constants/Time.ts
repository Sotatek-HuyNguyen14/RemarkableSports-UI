import { format, setHours } from "date-fns";

const currentYear = new Date().getUTCFullYear();
export const yearList: { label: string; value: string }[] = [];
export const monthList: { label: string; value: string }[] = [];
export const dateList: { label: string; value: string }[] = [];
export const hourList: { label: string; value: string }[] = [];
export const minuteList: { label: string; value: string }[] = [];
export function getPeriod() {
  const today = new Date();
  const goodMorning = format(setHours(today, 6), "a");
  const goodAfternoon = format(setHours(today, 16), "a");
  return [
    {
      label: goodMorning,
      value: goodMorning,
    },
    {
      label: goodAfternoon,
      value: goodAfternoon,
    },
  ];
}
for (let i = 0; i <= 1; i += 1) {
  yearList.push({
    label: (currentYear + i).toString(),
    value: (currentYear + i).toString(),
  });
}
for (let i = 1; i <= 12; i += 1) {
  const val = i.toLocaleString("en-US", {
    minimumIntegerDigits: 2,
    useGrouping: false,
  });
  monthList.push({
    label: val,
    value: val,
  });
}
for (let i = 1; i <= 31; i += 1) {
  const val = i.toLocaleString("en-US", {
    minimumIntegerDigits: 2,
    useGrouping: false,
  });
  dateList.push({ label: val, value: val });
}
for (let i = 1; i <= 12; i += 1) {
  const val = i.toLocaleString("en-US", {
    minimumIntegerDigits: 1,
    useGrouping: false,
  });
  hourList.push({ label: val.padStart(2, "0"), value: val.padStart(2, "0") });
}
for (let i = 0; i < 60; i += 15) {
  const val = i.toLocaleString("en-US", {
    minimumIntegerDigits: 2,
    useGrouping: false,
  });
  minuteList.push({ label: val, value: val });
}

export const generateYearOptions = (offset: number, offsetYear = 0) => {
  const options: { label: string; value: string }[] = [];

  for (
    let i = currentYear - offsetYear;
    i >= currentYear - offsetYear - offset;
    i -= 1
  ) {
    options.push({
      label: `${i}`,
      value: `${i}`,
    });
  }
  return options;
};
