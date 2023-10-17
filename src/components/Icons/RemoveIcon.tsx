import React from "react";
import { Icon } from "native-base";
import Svg, { Path, G } from "react-native-svg";
import { InterfaceIconProps } from "native-base/lib/typescript/components/primitives/Icon/types";

interface RemoveIconProps extends InterfaceIconProps {
  strokeColor?: string;
}

export default function RemoveIcon(props: RemoveIconProps) {
  return (
    <Icon size="md" viewBox="0 0 20 20" fill="none" {...props}>
      <Svg width="20" height="20" viewBox="0 0 20 20" fill="none">
        <Path
          d="M9.997 3.25H3.25V16.75H10M13.375 13.375L16.75 10L13.375 6.625M7 9.997H16.75"
          // eslint-disable-next-line react/destructuring-assignment
          stroke={props?.strokeColor || "#31095E"}
          strokeWidth="1.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </Svg>
    </Icon>
  );
}
