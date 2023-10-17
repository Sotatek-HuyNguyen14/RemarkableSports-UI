import React from "react";
import { Icon } from "native-base";
import { Path, G, Rect, Defs, Use, Pattern, Image } from "react-native-svg";
import { InterfaceIconProps } from "native-base/lib/typescript/components/primitives/Icon/types";

export default function LanguageIcon(props: InterfaceIconProps) {
  return (
    <Icon size="md" fill="none" viewBox="0 0 22 22" {...props}>
      <Path
        d="M1 11C1 16.523 5.477 21 11 21C16.523 21 21 16.523 21 11C21 5.477 16.523 1 11 1C5.477 1 1 5.477 1 11Z"
        stroke="black"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <Path
        d="M12 1.0498C12 1.0498 15 4.9998 15 10.9998C15 16.9998 12 20.9498 12 20.9498M10 20.9498C10 20.9498 7 16.9998 7 10.9998C7 4.9998 10 1.0498 10 1.0498M1.63 14.4998H20.37M1.63 7.4998H20.37"
        stroke="black"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </Icon>
  );
}
