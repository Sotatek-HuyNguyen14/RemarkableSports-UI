import React from "react";
import { Icon } from "native-base";
import { G, Path, Svg } from "react-native-svg";
import { InterfaceIconProps } from "native-base/lib/typescript/components/primitives/Icon/types";

export default function RectangleRedCrossIcon(props: InterfaceIconProps) {
  return (
    <Icon size="xl" viewBox="0 0 24 24" {...props}>
      <Svg width="24" height="24" viewBox="0 0 24 24" fill="none">
        <Path
          d="M15 1H5C2.79086 1 1 2.79086 1 5V15C1 17.2091 2.79086 19 5 19H15C17.2091 19 19 17.2091 19 15V5C19 2.79086 17.2091 1 15 1Z"
          stroke="#E71010"
          stroke-width="2"
          stroke-linecap="round"
          fill="#E71010"
          stroke-linejoin="round"
        />
        <Path
          d="M13.6069 13.6064L6.53587 6.53538"
          stroke="#ffffff"
          stroke-width="2"
          stroke-linecap="round"
          fill="#ffffff"
        />
        <Path
          d="M13.6069 6.53516L6.53587 13.6062"
          stroke="#ffffff"
          stroke-width="2"
          stroke-linecap="round"
          fill="#ffffff"
        />
      </Svg>
    </Icon>
  );
}
