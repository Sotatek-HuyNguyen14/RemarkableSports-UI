/* eslint-disable radix */
/* eslint-disable no-param-reassign */
/* eslint-disable react/destructuring-assignment */
import React from "react";
import { Text, View, Platform } from "react-native";
import { observer } from "mobx-react";
import DateTimePicker from "@react-native-community/datetimepicker";
import WheelPickerExpo from "react-native-wheel-picker-expo";
import CustomHourMinutePrefixPickerViewModel from "./CustomHourMinutePrefixPickerViewModel";
import { SCREEN_WIDTH } from "../../constants/constants";

interface Props {
  viewModel: CustomHourMinutePrefixPickerViewModel;
}

@observer
class CustomHourMinutePrefixPicker extends React.Component<Props> {
  renderAndroidPicker() {
    return (
      <View
        style={{
          flexDirection: "row",
          padding: 8,
          justifyContent: "center",
          alignItems: "center",
        }}
      >
        <WheelPickerExpo
          height={300}
          width={SCREEN_WIDTH * 0.15}
          initialSelectedIndex={this.props.viewModel.dataHour.findIndex(
            (hour) => hour.label === this.props.viewModel.hour.label
          )}
          items={this.props.viewModel.createDataHour()}
          onChange={({ item }) => {
            this.props.viewModel.setHour(item.label);
          }}
        />

        <WheelPickerExpo
          height={300}
          width={SCREEN_WIDTH * 0.15}
          initialSelectedIndex={this.props.viewModel.dataMinute.findIndex(
            (min) => min.label === this.props.viewModel.minute.label
          )}
          items={this.props.viewModel.createDataMinute()}
          onChange={({ item }) => {
            this.props.viewModel.setMinute(item.label);
          }}
        />

        <WheelPickerExpo
          height={200}
          width={SCREEN_WIDTH * 0.1}
          initialSelectedIndex={this.props.viewModel.prefixs.findIndex(
            (prefix) => prefix.label === this.props.viewModel.prefix.label
          )}
          items={this.props.viewModel.createPrefix()}
          onChange={({ item }) => {
            this.props.viewModel.setPrefix(item.label);
          }}
        />
      </View>
    );
  }

  renderIosPicker() {
    const currentDate = new Date();
    const hour: number = parseInt(
      this.props.viewModel.prefix.label === "AM"
        ? this.props.viewModel.hour.label
        : this.props.viewModel.hour.label + 12
    );
    const minute: number = parseInt(this.props.viewModel.minute.label);
    return (
      <DateTimePicker
        locale="en"
        display="spinner"
        testID="dateTimePicker"
        value={
          new Date(
            currentDate.getFullYear(),
            currentDate.getMonth(),
            currentDate.getDate(),
            hour,
            minute
          )
        }
        mode="time"
        is24Hour
        onChange={(event, time) => {
          let hours = time.getHours();
          const minutes = time.getMinutes();
          const ampm = hours >= 12 ? "PM" : "AM";
          hours %= 12;
          hours = hours || 12; // the hour '0' should be '12'
          const minuteStr = minutes < 10 ? `0${minutes}` : minutes;
          this.props.viewModel.setHour(hours);
          this.props.viewModel.setMinute(minuteStr);
          this.props.viewModel.setPrefix(ampm);
        }}
      />
    );
  }

  render() {
    if (Platform.OS === "ios") {
      return this.renderIosPicker();
    }
    return this.renderAndroidPicker();
  }
}

export default CustomHourMinutePrefixPicker;
