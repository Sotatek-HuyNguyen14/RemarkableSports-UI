import React from "react";
import { Icon } from "native-base";
import { G, Svg, Path } from "react-native-svg";
import { InterfaceIconProps } from "native-base/lib/typescript/components/primitives/Icon/types";

export default function UnChoose(props: InterfaceIconProps) {
  return (
    <Icon size="lg" viewBox="0 0 20 20" {...props}>
      <Svg width="20" height="20" viewBox="0 0 20 20" fill="none">
        <Path
          d="M15 1H5C2.79086 1 1 2.79086 1 5V15C1 17.2091 2.79086 19 5 19H15C17.2091 19 19 17.2091 19 15V5C19 2.79086 17.2091 1 15 1Z"
          stroke="#6D6D6D"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <Path
          x="6"
          y="6"
          d="M1 3L3.25 5L7 1"
          stroke="#6D6D6D"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </Svg>
    </Icon>
  );
}
