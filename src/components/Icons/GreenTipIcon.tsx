import React from "react";
import { Icon } from "native-base";
import Svg, { Circle, G, Path } from "react-native-svg";
import { InterfaceIconProps } from "native-base/lib/typescript/components/primitives/Icon/types";

export default function GreenTipIcon(props: InterfaceIconProps) {
  return (
    <Icon size="lg" viewBox="0 0 25 25" {...props}>
      <Svg width="25" height="25" viewBox="0 0 25 25" fill="none">
        <Circle
          opacity="0.15"
          cx="12.0523"
          cy="12.0529"
          r="12"
          transform="rotate(-0.250408 12.0523 12.0529)"
          fill="#27A643"
        />
        <Path
          d="M8.25 10.0769H5V8.69231H8.25V10.0769ZM8.25 12.1538H5V13.5385H8.25V12.1538ZM17.0835 17L14.594 14.3485C14.074 14.7085 13.463 14.9231 12.8 14.9231C11.006 14.9231 9.55 13.3723 9.55 11.4615C9.55 9.55077 11.006 8 12.8 8C14.594 8 16.05 9.55077 16.05 11.4615C16.05 12.1677 15.8485 12.8185 15.5105 13.3654L18 16.0238L17.0835 17ZM14.75 11.4615C14.75 10.3192 13.8725 9.38462 12.8 9.38462C11.7275 9.38462 10.85 10.3192 10.85 11.4615C10.85 12.6038 11.7275 13.5385 12.8 13.5385C13.8725 13.5385 14.75 12.6038 14.75 11.4615ZM5 17H11.5V15.6154H5V17Z"
          fill="#27A643"
        />
      </Svg>
    </Icon>
  );
}
