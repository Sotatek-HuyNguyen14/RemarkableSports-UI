import React from "react";
import { Icon } from "native-base";
import { G, Path } from "react-native-svg";
import { InterfaceIconProps } from "native-base/lib/typescript/components/primitives/Icon/types";

export default function ProfileIcon({
  props,
  isFocus = false,
}: {
  props?: InterfaceIconProps;
  isFocus?: boolean;
}) {
  return (
    <Icon size="lg" viewBox="0 0 16 18" {...props}>
      <G fill="none">
        <Path
          fillRule="evenodd"
          clipRule="evenodd"
          d="M8 0.666992C5.69881 0.666992 3.83333 2.53247 3.83333 4.83366C3.83333 7.13485 5.69881 9.00033 8 9.00033C10.3012 9.00033 12.1667 7.13485 12.1667 4.83366C12.1667 2.53247 10.3012 0.666992 8 0.666992ZM5.5 4.83366C5.5 3.45295 6.61929 2.33366 8 2.33366C9.38071 2.33366 10.5 3.45295 10.5 4.83366C10.5 6.21437 9.38071 7.33366 8 7.33366C6.61929 7.33366 5.5 6.21437 5.5 4.83366Z"
          fill={isFocus ? "#000000" : "#6D6D6D"}
        />
        <Path
          d="M4.66667 10.667C3.5616 10.667 2.50179 11.106 1.72039 11.8874C0.938987 12.6688 0.5 13.7286 0.5 14.8337V16.5003C0.5 16.9606 0.873096 17.3337 1.33333 17.3337C1.79357 17.3337 2.16667 16.9606 2.16667 16.5003V14.8337C2.16667 14.1706 2.43006 13.5347 2.8989 13.0659C3.36774 12.5971 4.00363 12.3337 4.66667 12.3337H11.3333C11.9964 12.3337 12.6323 12.5971 13.1011 13.0659C13.5699 13.5347 13.8333 14.1706 13.8333 14.8337V16.5003C13.8333 16.9606 14.2064 17.3337 14.6667 17.3337C15.1269 17.3337 15.5 16.9606 15.5 16.5003V14.8337C15.5 13.7286 15.061 12.6688 14.2796 11.8874C13.4982 11.106 12.4384 10.667 11.3333 10.667H4.66667Z"
          fill={isFocus ? "#000000" : "#6D6D6D"}
        />
      </G>
    </Icon>
  );
}
