import React from "react";
import { Icon } from "native-base";
import { G, Path, Svg } from "react-native-svg";
import { InterfaceIconProps } from "native-base/lib/typescript/components/primitives/Icon/types";

export default function TickIcon({
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
    <Svg width="14" height="14" viewBox="0 0 14 14" fill="none">
      <Path
        fill-rule="evenodd"
        clip-rule="evenodd"
        d="M10.7345 3.57204C10.8764 3.68671 10.9065 3.89117 10.8035 4.0418L6.28918 10.6458C6.16321 10.8301 5.89923 10.851 5.74589 10.6887L3.22447 8.02136C3.09943 7.88909 3.09665 7.68307 3.21806 7.54746L3.59669 7.1246C3.73329 6.97203 3.97111 6.96882 4.11179 7.11764L5.8962 9.00534L9.79627 3.29989C9.91158 3.13121 10.1462 3.09675 10.3052 3.22516L10.7345 3.57204Z"
        stroke="#909090"
        stroke-width="0.5"
      />
    </Svg>
  );
}
