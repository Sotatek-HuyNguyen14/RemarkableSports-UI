import React from "react";
import { Icon } from "native-base";
import { G, Svg, Path } from "react-native-svg";
import { InterfaceIconProps } from "native-base/lib/typescript/components/primitives/Icon/types";

export default function ImportIcon(props: InterfaceIconProps) {
  return (
    <Icon size="lg" viewBox="0 0 16 18" {...props}>
      <Svg width="17" height="16" viewBox="0 0 17 16" fill="none">
        <Path
          d="M2.25 8.66667V12.6667C2.25 13.0203 2.40804 13.3594 2.68934 13.6095C2.97064 13.8595 3.35218 14 3.75 14H12.75C13.1478 14 13.5294 13.8595 13.8107 13.6095C14.092 13.3594 14.25 13.0203 14.25 12.6667V8.66667M8.25 2V10M8.25 10L5.625 7.66667M8.25 10L10.875 7.66667"
          stroke="white"
          stroke-linecap="round"
          stroke-linejoin="round"
        />
      </Svg>
    </Icon>
  );
}
