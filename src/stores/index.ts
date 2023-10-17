/* eslint-disable no-underscore-dangle */
import AsyncStorage from "@react-native-async-storage/async-storage";
import { AxiosError } from "axios";
import { observable, action, makeAutoObservable } from "mobx";
import {
  DeviceEventEmitter,
  Dimensions,
  EmitterSubscription,
  Platform,
} from "react-native";
import { getStatusBarHeight } from "react-native-status-bar-height";
import I18n, { LAN_CHANGE, LAN_KEY } from "../language";
import { updateLanguage } from "../services/LanguageServices";

export interface Window {
  subscriptionHandler: EmitterSubscription | undefined;
  height: number;
  width: number;
  orientation: "PORTRAIT" | "LANDSCAPE";
  headerHeight: number | undefined;
  statusBarHeight: number;
}

export class Store {
  constructor() {
    makeAutoObservable(this);
    if (!this.window.subscriptionHandler) {
      this.window.subscriptionHandler = Dimensions.addEventListener(
        "change",
        (dimensions) => {
          const { window } = dimensions;
          const { width, height } = window;
          const w: Window = {
            height,
            width,
            orientation: "PORTRAIT",
            statusBarHeight: 0,
            subscriptionHandler: undefined,
            headerHeight: undefined,
          };
          if (width < height) {
            w.orientation = "PORTRAIT";
            if (Platform.OS === "ios") {
              w.statusBarHeight = getStatusBarHeight(true);
            }
          } else {
            w.orientation = "LANDSCAPE";
            if (Platform.OS === "ios") {
              w.statusBarHeight = 0;
            }
          }
          this.setWindow(w);
        }
      );
    }
  }

  @observable window: Window = {
    height: Dimensions.get("window").height,
    width: Dimensions.get("window").width,
    orientation:
      Dimensions.get("window").width < Dimensions.get("window").height
        ? "PORTRAIT"
        : "LANDSCAPE",
    headerHeight: Platform.select({ ios: 88 / 2, android: 56 }),
    statusBarHeight: getStatusBarHeight(true),
    subscriptionHandler: undefined,
  };

  @action.bound
  setWindow(w: Window) {
    this.window = {
      ...this.window,
      ...w,
    };
  }

  @observable language = "en";

  @observable incriptorId = 0;

  @action.bound
  setIncriptorId = (value: number) => {
    this.incriptorId = value;
  };

  @action.bound
  setLanguage = async (language: string) => {
    if (this.language !== language) {
      // Call to update backend language
      try {
        await updateLanguage({ language });
        await AsyncStorage.setItem(LAN_KEY, language);
        I18n.locale = language;
        this.language = language;
        DeviceEventEmitter.emit(LAN_CHANGE, language);
      } catch (error) {
        console.log("Ignored", error);
        await AsyncStorage.setItem(LAN_KEY, language);
        I18n.locale = language;
        this.language = language;
        DeviceEventEmitter.emit(LAN_CHANGE, language);
      }
    }
  };

  @observable storKey = "";

  @action.bound
  setStorKey = (storKey: string) => {
    if (this.storKey !== storKey) {
      this.storKey = storKey;
    }
  };

  @observable username = "";

  @action.bound
  setUsername = (username: string) => {
    if (this.username !== username) {
      this.username = username;
    }
  };

  @observable password = "";

  @action.bound
  setPassword = (password: string) => {
    if (this.password !== password) {
      this.password = password;
    }
  };

  @observable biometricalType = "";

  @action.bound
  setBiometricalType = (type: string) => {
    if (this.biometricalType !== type) {
      this.biometricalType = type;
    }
  };
}

const store = new Store();

export default store;
