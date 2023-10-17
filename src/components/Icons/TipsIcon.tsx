import React from "react";
import { Icon } from "native-base";
import { Path, Circle, Svg } from "react-native-svg";
import { InterfaceIconProps } from "native-base/lib/typescript/components/primitives/Icon/types";

export default function TipsIcon({
  props,
  color,
}: {
  props?: InterfaceIconProps;
  color?: string;
}) {
  return (
    <Icon size="sm" viewBox="0 0 4 12" {...props}>
      <Path
        fillRule="evenodd"
        clipRule="evenodd"
        d="M2.39644 4.67565C2.61736 4.67468 2.79722 4.85298 2.79819 5.07389L2.82638 11.5238C2.82734 11.7447 2.64904 11.9246 2.42813 11.9256L1.72814 11.9286C1.50722 11.9296 1.32736 11.7513 1.32639 11.5304L1.2982 5.08045C1.29724 4.85954 1.47554 4.67967 1.69645 4.6787L2.39644 4.67565Z"
        fill={color || "white"}
      />
      <Circle
        cx="2.03459"
        cy="1.92735"
        r="1.25"
        transform="rotate(179.75 2.03459 1.92735)"
        fill={color || "white"}
      />
    </Icon>
  );
}
