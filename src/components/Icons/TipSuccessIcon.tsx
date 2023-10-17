import React from "react";
import { Icon } from "native-base";
import { Path, Circle, Svg } from "react-native-svg";
import { InterfaceIconProps } from "native-base/lib/typescript/components/primitives/Icon/types";

export default function TipSuccessIcon(props: InterfaceIconProps) {
  return (
    <Icon size="lg" viewBox="0 0 19 18" fill="none" {...props}>
      <Path
        fillRule="evenodd"
        clipRule="evenodd"
        d="M17.9754 2.09707C18.1305 2.21237 18.1628 2.43161 18.0475 2.58675L7.10205 17.3143C6.97578 17.4842 6.72874 17.504 6.57703 17.3564L0.109951 11.0622C-0.0285717 10.9273 -0.0315733 10.7057 0.103246 10.5672L1.56792 9.06233C1.70274 8.9238 1.92433 8.9208 2.06285 9.05562L6.52423 13.3978L15.8002 0.916561C15.9155 0.761416 16.1347 0.729117 16.2899 0.84442L17.9754 2.09707Z"
        fill="#05C28C"
      />
    </Icon>
  );
}
