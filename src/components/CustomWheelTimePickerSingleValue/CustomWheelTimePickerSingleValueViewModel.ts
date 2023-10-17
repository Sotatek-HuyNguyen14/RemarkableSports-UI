/* eslint-disable no-return-assign */
import { observable, action, makeAutoObservable } from "mobx";

class CustomWheelTimePickerSingleValueViewModel {
  constructor() {
    makeAutoObservable(this);
    this.data = this.createData();
    this.time = { label: "7:00", value: "7:00" };
    this.prefix = { label: "AM", value: "AM" };
    this.prefixs = this.createPrefix();
  }

  @observable prefixs = [
    { label: "AM", value: "AM" },
    { label: "PM", value: "PM" },
  ];

  @observable prefix = { label: "AM", value: "AM" };

  @observable data = [];

  createData = () => {
    const result = [];
    for (let i = 1; i <= 12; i += 1) {
      for (let j = 0; j < 60; j += 15) {
        result.push({
          label: `${i}:${j > 9 ? `${j.toString()}` : `0${j.toString()}`}`,
          value: `${i}:${j > 9 ? `${j.toString()}` : `0${j.toString()}`}`,
        });
      }
    }
    return result;
  };

  createPrefix = () => {
    return [
      { label: "AM", value: "AM" },
      { label: "PM", value: "PM" },
    ];
  };

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
  setPrefix = (value) => {
    console.log("Set prefix to", value);
    this.prefix = { label: value, value };
  };
}

export default CustomWheelTimePickerSingleValueViewModel;
