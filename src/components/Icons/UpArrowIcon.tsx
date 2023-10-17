import React from "react";
import { Icon } from "native-base";
import { Path, G } from "react-native-svg";
import { InterfaceIconProps } from "native-base/lib/typescript/components/primitives/Icon/types";

export default function UpArrowIcon(props: InterfaceIconProps) {
  return (
    <Icon size="sm" viewBox="0 0 14 9" {...props}>
      <G fill="none">
        <Path d="M1 8L7 2L13 8" stroke="#31095E" strokeWidth="1.5" />
      </G>
    </Icon>
  );
}
