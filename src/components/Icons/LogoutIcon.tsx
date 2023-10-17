import React from "react";
import { Icon } from "native-base";
import { Path, G } from "react-native-svg";
import { InterfaceIconProps } from "native-base/lib/typescript/components/primitives/Icon/types";

interface LogoutIconProps extends InterfaceIconProps {
  strokeColor?: string;
}

export default function LogoutIcon(props: LogoutIconProps) {
  return (
    <Icon size="md" viewBox="0 0 20 20" fill="none" {...props}>
      <Path
        d="M9.996 1H1V19H10M14.5 14.5L19 10L14.5 5.5M6 9.996H19"
        // eslint-disable-next-line react/destructuring-assignment
        stroke={props.strokeColor || "black"}
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </Icon>
  );
}
