import React from "react";
import { Icon } from "native-base";
import Svg, { Path, G, Circle } from "react-native-svg";
import { InterfaceIconProps } from "native-base/lib/typescript/components/primitives/Icon/types";

interface LogoutIconProps extends InterfaceIconProps {
  strokeColor?: string;
}

export default function InfoIcon(props: LogoutIconProps) {
  return (
    <Icon size="md" viewBox="0 0 26 26" fill="none" {...props}>
      <Svg width="26" height="26" viewBox="0 0 26 26" fill="none">
        <Circle
          cx="13"
          cy="13.0001"
          r="11.5019"
          transform="rotate(-0.250408 13 13.0001)"
          stroke="black"
        />
        <Path
          fill-rule="evenodd"
          clip-rule="evenodd"
          d="M13.3441 11.6237C13.565 11.6227 13.7449 11.801 13.7458 12.022L13.774 18.4731C13.775 18.694 13.5967 18.8738 13.3758 18.8748L12.6756 18.8779C12.4546 18.8788 12.2748 18.7005 12.2738 18.4796L12.2456 12.0285C12.2447 11.8076 12.423 11.6277 12.6439 11.6268L13.3441 11.6237Z"
          fill="black"
        />
        <Circle
          cx="12.982"
          cy="8.87442"
          r="1.2502"
          transform="rotate(179.75 12.982 8.87442)"
          fill="black"
        />
      </Svg>
    </Icon>
  );
}
