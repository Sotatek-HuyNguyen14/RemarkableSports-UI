/* eslint-disable react/destructuring-assignment */
import React from "react";
import { Icon } from "native-base";
import { Path, G } from "react-native-svg";
import { InterfaceIconProps } from "native-base/lib/typescript/components/primitives/Icon/types";

export default function DownArrowIcon(props: InterfaceIconProps) {
  return (
    <Icon size="md" viewBox="0 0 14 9" {...props}>
      <G fill="none">
        <Path
          d="M13 1L7 7L0.999999 1"
          stroke={props?.color ? "#31095E" : "black"}
          strokeWidth="1.5"
        />
      </G>
    </Icon>
  );
}
