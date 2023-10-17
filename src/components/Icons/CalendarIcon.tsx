import React from "react";
import { Icon } from "native-base";
import { G, Path } from "react-native-svg";
import { InterfaceIconProps } from "native-base/lib/typescript/components/primitives/Icon/types";

export default function CalendarIcon({
  props,
  isFocus = false,
  color,
}: {
  props?: InterfaceIconProps;
  isFocus?: boolean;
  color?: string;
}) {
  const localColor = color || "#6D6D6D";
  return (
    <Icon size="sm" viewBox="0 0 14 14" alignSelf="center" {...props}>
      <G fill="none">
        <Path
          fillRule="evenodd"
          clipRule="evenodd"
          d="M10.25 1.09091C10.25 0.764559 9.95899 0.5 9.6 0.5C9.24101 0.5 8.95 0.764559 8.95 1.09091V1.68182H5.05V1.09091C5.05 0.764559 4.75899 0.5 4.4 0.5C4.04101 0.5 3.75 0.764559 3.75 1.09091V1.68182H2.45C1.37304 1.68182 0.5 2.4755 0.5 3.45455V11.7273C0.5 12.7063 1.37304 13.5 2.45 13.5H11.55C12.627 13.5 13.5 12.7063 13.5 11.7273V3.45455C13.5 2.4755 12.627 1.68182 11.55 1.68182H10.25V1.09091ZM12.2 5.22727V3.45455C12.2 3.1282 11.909 2.86364 11.55 2.86364H10.25V3.45455C10.25 3.7809 9.95899 4.04545 9.6 4.04545C9.24101 4.04545 8.95 3.7809 8.95 3.45455V2.86364H5.05V3.45455C5.05 3.7809 4.75899 4.04545 4.4 4.04545C4.04101 4.04545 3.75 3.7809 3.75 3.45455V2.86364H2.45C2.09101 2.86364 1.8 3.1282 1.8 3.45455V5.22727H12.2ZM1.8 6.40909H12.2V11.7273C12.2 12.0536 11.909 12.3182 11.55 12.3182H2.45C2.09101 12.3182 1.8 12.0536 1.8 11.7273V6.40909Z"
          fill={isFocus ? "#000000" : localColor}
        />
      </G>
    </Icon>
  );
}
