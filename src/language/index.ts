import I18n from "i18n-js";
import { setDefaultOptions } from "date-fns";
import { zhHK as dateZhHk } from "date-fns/locale";
import * as Localization from "expo-localization";
import { LocaleConfig } from "react-native-calendars";
import AsyncStorage from "@react-native-async-storage/async-storage";
import en from "./en";
import zhHk from "./zh-hk";

const SUPPORTED_APP_LOCALES = ["en", "zh"];
export const LAN_KEY = "language";
export const LAN_CHANGE = "ChangeLanguage";

// I18n.fallbacks = true;
I18n.translations = {
  en,
  "zh-hk": zhHk,
};

I18n.locale = "en";
I18n.defaultLocale = "en";
I18n.fallbacks = true;

export const setUpAppLanguage = async () => {
  let language = "en";
  const data = await AsyncStorage.getItem(LAN_KEY);

  if (data) {
    I18n.locale = data;
    language = data;
  } else {
    const { locale } = Localization;
    if (locale.length > 2) {
      const headText = locale.substring(0, 2);
      const result = SUPPORTED_APP_LOCALES.find((item) => {
        return headText.toLowerCase() === item.toLowerCase();
      });
      switch (result) {
        case "en":
          language = "en";
          break;
        case "zh":
          language = "zh-hk";
          break;
        default:
          language = "en";
          break;
      }
      I18n.locale = language;
      await AsyncStorage.setItem(LAN_KEY, language);
    }
  }

  if (language === "zh-hk") {
    setDefaultOptions({ locale: dateZhHk });
  }

  LocaleConfig.locales.en = LocaleConfig.locales[""];
  LocaleConfig.locales["zh-hk"] = {
    monthNames: [
      "一月",
      "二月",
      "三月",
      "四月",
      "五月",
      "六月",
      "七月",
      "八月",
      "九月",
      "十月",
      "十一月",
      "十二月",
    ],
    monthNamesShort: [
      "一月",
      "二月",
      "三月",
      "四月",
      "五月",
      "六月",
      "七月",
      "八月",
      "九月",
      "十月",
      "十一月",
      "十二月",
    ],
    dayNames: [
      "星期日",
      "星期一",
      "星期二",
      "星期三",
      "星期四",
      "星期五",
      "星期六",
    ],
    dayNamesShort: ["日", "一", "二", "三", "四", "五", "六"],
    today: "今日",
  };
  LocaleConfig.defaultLocale = language;

  return language;
};

export default I18n;
