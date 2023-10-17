/* eslint-disable react/destructuring-assignment */
import React from "react";
import { Icon } from "native-base";
import { G, Path, Svg } from "react-native-svg";
import { InterfaceIconProps } from "native-base/lib/typescript/components/primitives/Icon/types";

interface ChatCornerLeftIconProps extends InterfaceIconProps {
  fillColor?: string;
}

export default function ChatCornerLeftIcon(props: ChatCornerLeftIconProps) {
  return (
    <Icon size="lg" viewBox="0 0 10 12" {...props}>
      <Svg width="10" height="12" viewBox="0 0 10 12" fill="none">
        <Path
          d="M8.99966 0C8.99966 0 3.26172 0 1.79967 0C0.337614 0 -0.000304222 1.5 1.34969 3C2.69969 4.5 8.5003 9.5 8.99966 11C9.49902 12.5 8.99966 0 8.99966 0Z"
          fill={props.fillColor || "#F2F2F7"}
        />
      </Svg>
    </Icon>
  );
}
