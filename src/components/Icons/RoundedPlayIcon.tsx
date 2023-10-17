/* eslint-disable react/destructuring-assignment */
import React from "react";
import { Icon } from "native-base";
import { G, Path, Svg, Circle } from "react-native-svg";
import { InterfaceIconProps } from "native-base/lib/typescript/components/primitives/Icon/types";

interface RoundedPlayIconProps extends InterfaceIconProps {
  fillColor?: string;
}

export default function RoundedPlayIcon(props: RoundedPlayIconProps) {
  return (
    <Icon size="lg" viewBox="0 0 35 36" {...props}>
      <Svg width="35" height="36" viewBox="0 0 35 36" fill="none">
        <Circle cx="17.5" cy="18" r="17.5" fill="white" />
        <Path
          d="M24.958 18.5002L19.1453 22.3789L13.333 26.25V10.75L19.1453 14.6211L24.958 18.5002Z"
          stroke="#31095E"
          stroke-width="2"
          stroke-linecap="round"
          stroke-linejoin="round"
        />
      </Svg>
    </Icon>
  );
}
