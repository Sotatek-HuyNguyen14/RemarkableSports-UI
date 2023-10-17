import React from "react";
import { Icon } from "native-base";
import { Circle, Path, G } from "react-native-svg";
import { InterfaceIconProps } from "native-base/lib/typescript/components/primitives/Icon/types";

export default function RoundedBlackCrossIcon(props: InterfaceIconProps) {
  return (
    <Icon size="md" viewBox="0 0 16 16" {...props}>
      <G fill="none">
        <Circle cx="8" cy="8" r="8" fill="black" />
        <Path
          d="M12 4.80571L11.1943 4L8 7.19429L4.80571 4L4 4.80571L7.19429 8L4 11.1943L4.80571 12L8 8.80571L11.1943 12L12 11.1943L8.80571 8L12 4.80571Z"
          fill="white"
        />
      </G>
    </Icon>
  );
}
