import React from "react";
import { Icon } from "native-base";
import { G, Path, Svg } from "react-native-svg";
import { InterfaceIconProps } from "native-base/lib/typescript/components/primitives/Icon/types";

export default function ChooseIcon(props: InterfaceIconProps) {
  return (
    <Icon size="lg" viewBox="0 0 20 20" {...props}>
      <Svg width="20" height="20" viewBox="0 0 20 20" fill="none">
        <Path
          d="M15 1H5C2.79086 1 1 2.79086 1 5V15C1 17.2091 2.79086 19 5 19H15C17.2091 19 19 17.2091 19 15V5C19 2.79086 17.2091 1 15 1Z"
          stroke="#B3B6B8"
          stroke-width="2"
          stroke-linecap="round"
          stroke-linejoin="round"
        />
        <Path
          d="M7 10L9.25 12L13 8"
          stroke="#B3B6B8"
          stroke-width="2"
          stroke-linecap="round"
          stroke-linejoin="round"
        />
      </Svg>
    </Icon>
  );
}
