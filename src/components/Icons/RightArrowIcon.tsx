import React from "react";
import { Icon } from "native-base";
import { Path, G } from "react-native-svg";
import { InterfaceIconProps } from "native-base/lib/typescript/components/primitives/Icon/types";

export default function RightArrowIcon({
  color,
  ...otherProps
}: Omit<InterfaceIconProps, "color"> & { color?: string }) {
  return (
    <Icon size="sm" viewBox="0 0 9 14" {...otherProps}>
      <G fill="none">
        <Path d="M1 1L7 7L1 13" stroke={color || "black"} strokeWidth="1.5" />
      </G>
    </Icon>
  );
}
