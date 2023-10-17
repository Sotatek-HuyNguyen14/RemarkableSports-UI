import { Heading, Text } from "native-base";
import React, { useState } from "react";

import WheelPickerExpo from "react-native-wheel-picker-expo";

interface WheelPickerProps {
  options: { label: string; value: string }[];
  initIndex: number;
  onChange: (value: string) => void;
  textStyle?: {
    alignment?: string;
    w?: string;
  };
}

export default function WheelPicker({
  options,
  initIndex,
  onChange,
  textStyle,
}: WheelPickerProps) {
  const [currentLabel, setCurrentLabel] = useState(
    options[initIndex || 0].label
  );
  return (
    <WheelPickerExpo
      width="100%"
      initialSelectedIndex={initIndex}
      items={options}
      onChange={({ item }) => {
        setCurrentLabel(item.label);
        onChange(item.value);
      }}
      renderItem={(props) => {
        return (
          <Text
            textAlign={textStyle?.alignment || "center"}
            w={textStyle?.w || "100%"}
            fontSize="xl"
            color="black"
          >
            {props.label}
          </Text>
        );
      }}
      selectedStyle={{ borderColor: "#CCCCCC", borderWidth: 1 }}
    />
  );
}
