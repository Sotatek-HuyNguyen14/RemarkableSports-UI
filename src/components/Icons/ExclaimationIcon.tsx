import React from "react";
import { Icon } from "native-base";
import { Circle, G, Path, Svg } from "react-native-svg";
import { InterfaceIconProps } from "native-base/lib/typescript/components/primitives/Icon/types";

interface ExclaimationIconProps extends InterfaceIconProps {
  customFill?: string;
}
export default function ExclaimationIcon({
  props,
}: {
  props?: ExclaimationIconProps;
}) {
  return (
    <Icon size="md" viewBox="0 0 14 14" alignSelf="center" {...props}>
      <Svg width="14" height="14" viewBox="0 0 25 25" fill="none">
        <Circle
          opacity="0.15"
          cx="12.0523"
          cy="12.0523"
          r="12"
          transform="rotate(-0.250408 12.0523 12.0523)"
          fill={props?.customFill || "#F16514"}
        />
        <Path
          fill-rule="evenodd"
          clip-rule="evenodd"
          d="M12.617 13.7998C12.7247 13.7993 12.8128 13.7136 12.816 13.6058L13.0223 6.75486C13.0257 6.64176 12.9346 6.54835 12.8215 6.54885L11.2355 6.55578C11.1224 6.55627 11.0322 6.65047 11.0366 6.76354L11.3027 13.6124C11.3069 13.7201 11.3956 13.8051 11.5034 13.8047L12.617 13.7998Z"
          fill={props?.customFill || "#F16514"}
        />
        <Path
          d="M10.8219 16.5577C10.8249 17.248 11.387 17.8052 12.0773 17.8022C12.7677 17.7992 13.3249 17.2371 13.3219 16.5467C13.3189 15.8564 12.7568 15.2992 12.0664 15.3022C11.3761 15.3052 10.8189 15.8673 10.8219 16.5577Z"
          fill={props?.customFill || "#F16514"}
        />
      </Svg>
    </Icon>
  );
}
