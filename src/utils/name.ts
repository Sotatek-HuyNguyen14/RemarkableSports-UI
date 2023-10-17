import i18n from "../language/index";
import { User } from "../models/User";
import { isBlank } from "./strings";

export function formatName(firstName: string, lastName: string, split = false) {
  // i18n.currentLocale() : "en" | "zh-hk"
  const exp = /[\u4E00-\u9FFF]+/g;
  let delimiter = " ";
  let ret = [firstName, lastName];
  if (lastName.match(exp)) {
    delimiter = "";
    ret = [lastName, firstName];
  }
  return split ? ret : ret.join(delimiter);
}

export function getUserName(user: User) {
  if (!user) {
    return "";
  }
  const shouldUseChineseName =
    user.chineseName &&
    !isBlank(user.chineseName) &&
    i18n.currentLocale() !== "en";
  if (shouldUseChineseName) {
    return user.chineseName;
  }

  return formatName(user.firstName || "", user.lastName || "");
}

export function truncate(string: string, maxChar = 20) {
  return `${string.slice(
    0,
    string.length > maxChar ? string.length / 2 : string.length
  )}${string.length > maxChar ? "..." : ""}`;
}

export default {
  formatName,
  truncate,
};
