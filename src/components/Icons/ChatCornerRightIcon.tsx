/* eslint-disable react/destructuring-assignment */
import React from "react";
import { Icon } from "native-base";
import { G, Path, Svg } from "react-native-svg";
import { InterfaceIconProps } from "native-base/lib/typescript/components/primitives/Icon/types";

interface ChatCornerRightIconProps extends InterfaceIconProps {
  fillColor?: string;
}

export default function ChatCornerRightIcon(props: ChatCornerRightIconProps) {
  return (
    <Icon size="lg" viewBox="0 0 10 12" {...props}>
      <Svg width="10" height="12" viewBox="0 0 10 12" fill="none">
        <Path
          d="M1.00034 0C1.00034 0 6.73828 0 8.20033 0C9.66239 0 10.0003 1.5 8.65031 3C7.30031 4.5 1.4997 9.5 1.00034 11C0.500977 12.5 1.00034 0 1.00034 0Z"
          fill="#31095E"
        />
      </Svg>
    </Icon>
  );
}
