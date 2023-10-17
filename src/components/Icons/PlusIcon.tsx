import React from "react";
import { Icon } from "native-base";
import { G, Path } from "react-native-svg";
import { InterfaceIconProps } from "native-base/lib/typescript/components/primitives/Icon/types";

export default function PlusIcon(props: InterfaceIconProps) {
  return (
    <Icon size="sm" viewBox="0 0 16 16" {...props}>
      <G fill="none">
        <Path d="M9 7V0H7V7H0V9H7V16H9V9H16V7H9Z" fill="#000000" />
      </G>
    </Icon>
  );
}
