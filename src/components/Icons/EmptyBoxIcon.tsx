import React from "react";
import { Icon } from "native-base";
import { G, Path, Rect, Svg } from "react-native-svg";
import { InterfaceIconProps } from "native-base/lib/typescript/components/primitives/Icon/types";

export default function EmptyBoxIcon(props: InterfaceIconProps) {
  return (
    <Icon size="lg" viewBox="0 0 20 20" {...props}>
      <Svg width="20" height="20" viewBox="0 0 20 20" fill="none">
        <Rect
          x="0.5"
          y="0.5"
          width="19"
          height="19"
          rx="4.5"
          stroke="#D9D9D9"
        />
      </Svg>
    </Icon>
  );
}
