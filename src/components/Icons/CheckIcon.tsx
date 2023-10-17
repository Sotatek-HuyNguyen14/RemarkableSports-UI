import React from "react";
import { Icon } from "native-base";
import { Circle, G, Path } from "react-native-svg";
import { InterfaceIconProps } from "native-base/lib/typescript/components/primitives/Icon/types";

export default function CheckIcon(props: InterfaceIconProps) {
  return (
    <Icon size="5xl" viewBox="0 0 48 49" {...props}>
      <G fill="none">
        <Circle
          opacity="0.15"
          cx="23.9999"
          cy="24.1046"
          r="24"
          transform="rotate(-0.250408 23.9999 24.1046)"
          fill="#05C28C"
        />
        <Path
          fillRule="evenodd"
          clipRule="evenodd"
          d="M32.9749 16.8787C33.13 16.994 33.1623 17.2132 33.047 17.3684L22.1016 32.096C21.9753 32.2659 21.7282 32.2856 21.5765 32.138L15.1095 25.8438C14.9709 25.709 14.9679 25.4874 15.1028 25.3488L16.5674 23.8439C16.7023 23.7054 16.9238 23.7024 17.0624 23.8372L21.5237 28.1794L30.7997 15.6982C30.915 15.543 31.1342 15.5107 31.2894 15.626L32.9749 16.8787Z"
          fill="#05C28C"
        />
      </G>
    </Icon>
  );
}
