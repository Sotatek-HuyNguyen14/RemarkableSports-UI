/* eslint-disable no-param-reassign */
/* eslint-disable react/destructuring-assignment */
import React, { useState } from "react";
import {
  SafeAreaView,
  StyleSheet,
  TouchableOpacity,
  Image,
  LogBox,
  StyleProp,
  ViewStyle,
  Text,
  View,
  Platform,
} from "react-native";
import { observer } from "mobx-react";
import { Picker } from "@react-native-picker/picker";
import WheelPickerExpo from "react-native-wheel-picker-expo";
import CustomWheelTimePickerSingleValueViewModel from "./CustomWheelTimePickerSingleValueViewModel";

interface Props {
  viewModel: CustomWheelTimePickerSingleValueViewModel;
}

@observer
class CustomWheelTimePickerSingleValue extends React.Component<Props> {
  renderIosPicker() {
    return (
      <View
        style={{
          flexDirection: "row",
          padding: 8,
          justifyContent: "center",
          alignItems: "center",
        }}
      >
        <Picker
          mode="dropdown"
          selectedValue={this.props.viewModel.time.label}
          style={{ backgroundColor: "white", width: 150 }}
          onValueChange={(itemValue) => {
            this.props.viewModel.setTime(itemValue);
          }}
        >
          {this.props.viewModel.createData().map((hour) => {
            return (
              <Picker.Item
                key={`${hour.value}_key`}
                label={
                  hour.label === this.props.viewModel.time.label
                    ? `${hour.label}`
                    : hour.label
                }
                value={hour.value}
              />
            );
          })}
        </Picker>

        <Picker
          mode="dropdown"
          selectedValue={this.props.viewModel.prefix.label}
          style={{ backgroundColor: "white", width: 150 }}
          onValueChange={(itemValue) => {
            this.props.viewModel.setPrefix(itemValue);
          }}
        >
          {this.props.viewModel.createPrefix().map((prefix) => {
            return (
              <Picker.Item
                key={`${prefix.value}_key`}
                label={
                  prefix.label === this.props.viewModel.prefix.label
                    ? `${prefix.label}`
                    : prefix.label
                }
                value={prefix.value}
              />
            );
          })}
        </Picker>
      </View>
    );
  }

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
        <View style={{ flexDirection: "row", alignItems: "center" }}>
          <WheelPickerExpo
            height={200}
            width={50}
            initialSelectedIndex={3}
            items={this.props.viewModel.createData()}
            onChange={({ item }) => {
              this.props.viewModel.setTime(item.label);
            }}
          />
          <WheelPickerExpo
            height={200}
            width={50}
            initialSelectedIndex={1}
            items={this.props.viewModel.createPrefix()}
            onChange={({ item }) => {
              this.props.viewModel.setTime(item.label);
            }}
          />
        </View>
      </View>
    );
  }

  render() {
    if (Platform.OS === "ios") {
      return this.renderIosPicker();
    }
    return this.renderAndroidPicker();
  }
}

export default CustomWheelTimePickerSingleValue;
