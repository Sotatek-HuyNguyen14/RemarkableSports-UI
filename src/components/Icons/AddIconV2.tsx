import React from "react";
import { Circle, Icon } from "native-base";
import { Path, Rect } from "react-native-svg";
import { InterfaceIconProps } from "native-base/lib/typescript/components/primitives/Icon/types";

export default function AddIconV2({
  props,
  pathColor,
}: {
  props?: InterfaceIconProps;
  pathColor?: string;
}) {
  return (
    <Icon
      size="md"
      viewBox="0 0 36 36"
      alignItems="center"
      justifyContent="center"
      {...props}
    >
      <Circle size="5" borderColor={pathColor} borderWidth={1.5} />
      <Path
        d="M19 17V10H17V17H10V19H17V26H19V19H26V17H19Z"
        fill={pathColor || "#000000"}
        strokeWidth={1}
      />
    </Icon>
  );
}
