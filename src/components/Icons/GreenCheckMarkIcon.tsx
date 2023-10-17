import React from "react";
import { Icon, View } from "native-base";
import { Circle, Path, Svg } from "react-native-svg";
import { InterfaceIconProps } from "native-base/lib/typescript/components/primitives/Icon/types";

export default function GreenCheckMarkIcon(props: InterfaceIconProps) {
  return (
    <View style={{ width: 150, height: 150 }}>
      <Svg width="100" height="100" viewBox="0 0 20 20" fill="none">
        <Circle
          opacity="0.15"
          cx="25.0002"
          cy="24.1047"
          r="24"
          transform="rotate(-0.250408 25.0002 24.1047)"
          fill="#05C28C"
        />
        <Path
          fillRule="evenodd"
          clipRule="evenodd"
          d="M33.9754 16.8787C34.1305 16.994 34.1628 17.2132 34.0475 17.3684L23.1021 32.096C22.9758 32.2659 22.7287 32.2856 22.577 32.138L16.11 25.8438C15.9714 25.709 15.9684 25.4874 16.1032 25.3488L17.5679 23.8439C17.7027 23.7054 17.9243 23.7024 18.0629 23.8372L22.5242 28.1794L31.8002 15.6982C31.9155 15.543 32.1347 15.5107 32.2899 15.626L33.9754 16.8787Z"
          fill="#05C28C"
        />
      </Svg>
    </View>
  );
}
