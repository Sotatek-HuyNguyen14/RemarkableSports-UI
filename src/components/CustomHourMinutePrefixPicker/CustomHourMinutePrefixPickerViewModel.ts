/* eslint-disable no-return-assign */
import { observable, action, makeAutoObservable } from "mobx";

class CustomHourMinutePrefixPickerViewModel {
  constructor() {
    makeAutoObservable(this);
    this.dataHour = this.createDataHour();
    this.dataMinute = this.createDataMinute();
    this.time = { label: "7:00", value: "7:00" };
    this.prefix = { label: "AM", value: "AM" };
    this.prefixs = this.createPrefix();
  }

  @observable prefixs = [
    { label: "AM", value: "AM" },
    { label: "PM", value: "PM" },
  ];

  @observable prefix = { label: "AM", value: "AM" };

  @observable dataHour = [];

  @observable dataMinute = [];

  createDataHour = () => {
    const result = [];
    for (let i = 1; i <= 12; i += 1) {
      result.push({
        label: `${i > 9 ? `${i.toString()}` : `0${i.toString()}`}`,
        value: `${i > 9 ? `${i.toString()}` : `0${i.toString()}`}`,
      });
    }
    return result;
  };

  createDataMinute = () => {
    const result = [];
    for (let i = 0; i <= 60; i += 1) {
      result.push({
        label: `${i > 9 ? `${i.toString()}` : `0${i.toString()}`}`,
        value: `${i > 9 ? `${i.toString()}` : `0${i.toString()}`}`,
      });
    }
    return result;
  };

  createPrefix = () => {
    return [
      { label: "AM", value: "AM" },
      { label: "PM", value: "PM" },
    ];
  };

  @observable hour = { label: "7", value: "7" };

  @observable minute = { label: "00", value: "00" };

  @observable time = { label: "7:00", value: "7:00" };

  @observable didSelectTime = false;

  @action.bound
  setDidSelectTime = (value) => {
    this.didSelectTime = value;
  };

  @action.bound
  setTime = (value) => {
    this.time = { label: value, value };
  };

  @action.bound
  setHour = (value) => {
    this.hour = { label: value, value };
  };

  @action.bound
  setMinute = (value) => {
    this.minute = { label: value, value };
  };

  @action.bound
  setPrefix = (value) => {
    this.prefix = { label: value, value };
  };
}

export default CustomHourMinutePrefixPickerViewModel;
