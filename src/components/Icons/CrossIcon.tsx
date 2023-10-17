import React from "react";
import { Icon } from "native-base";
import { G, Path } from "react-native-svg";
import { InterfaceIconProps } from "native-base/lib/typescript/components/primitives/Icon/types";

export default function CrossIcon({ ...props }: InterfaceIconProps) {
  return (
    <Icon size="lg" viewBox="0 0 22 22" {...props}>
      <G fill="none">
        <Path
          d="M20.5 1L1 20.5"
          stroke="black"
          strokeWidth="2"
          strokeLinecap="round"
        />
        <Path
          d="M20.5 20.5L1 0.999999"
          stroke="black"
          strokeWidth="2"
          strokeLinecap="round"
        />
      </G>
    </Icon>
  );
}
