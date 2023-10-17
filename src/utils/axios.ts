/* eslint-disable no-restricted-syntax */
/* eslint-disable no-param-reassign */
import axios from "axios";
import { isMatch, parseISO } from "date-fns";
import { ISO_STRING } from "./date";

export default function initAxiosInterceptor() {
  axios.interceptors.response.use((config) => {
    transformDateTimetoDate(config.data);
    return config;
  });
}

function transformDateTimetoDate(data: any) {
  if (data === null || data === undefined || typeof data !== "object")
    return data;

  for (const key of Object.keys(data)) {
    const value = data[key];
    if (typeof value === "string" && value.length >= 16) {
      if (isMatch(value.slice(0, 16), ISO_STRING)) data[key] = parseISO(value);
    } else if (typeof value === "object") transformDateTimetoDate(value);
  }
}
