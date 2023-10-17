/* eslint-disable react/destructuring-assignment */
import React from "react";
import { Icon } from "native-base";
import { Path, G } from "react-native-svg";
import { InterfaceIconProps } from "native-base/lib/typescript/components/primitives/Icon/types";

interface LeftArrowIconProps extends InterfaceIconProps {
  customStroke?: string;
}
export default function LeftArrowIcon(props: LeftArrowIconProps) {
  return (
    <Icon size="sm" viewBox="0 0 9 14" {...props}>
      <G fill="none">
        <Path
          d="M8 13L2 7L8 1"
          stroke={props.customStroke || "black"}
          stroke-width="1.5"
        />
      </G>
    </Icon>
  );
}
