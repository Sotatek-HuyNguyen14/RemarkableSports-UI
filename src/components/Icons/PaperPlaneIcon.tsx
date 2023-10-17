import React from "react";
import { Icon } from "native-base";
import Svg, { Circle, G, Path } from "react-native-svg";
import { InterfaceIconProps } from "native-base/lib/typescript/components/primitives/Icon/types";

export default function PaperPlaneIcon({
  props,
  color,
}: {
  props?: InterfaceIconProps;
  color?: string;
}) {
  return (
    <Icon size="lg" viewBox="0 0 25 24" {...props}>
      <Svg width="25" height="24" viewBox="0 0 25 24" fill="none">
        <Path
          d="M21.3389 4.15217C21.1875 4.00917 20.9616 3.96252 20.7616 4.03118L3.86184 9.84718C3.64443 9.92204 3.49971 10.1174 3.5 10.3357C3.50014 10.5541 3.64499 10.7492 3.86252 10.8238L11.5024 13.4421L14.2747 20.6576C14.3537 20.8629 14.5602 20.9998 14.7914 21H14.7918C15.0229 21 15.2296 20.8635 15.3087 20.6583L21.4668 4.69717C21.54 4.50725 21.4899 4.29466 21.3389 4.1518L21.3389 4.15217ZM14.7929 18.96L12.5683 13.17L14.8493 11.0157C15.0642 10.8127 15.0642 10.484 14.8493 10.281C14.6344 10.0779 14.2864 10.078 14.0713 10.281L11.7903 12.4355L5.65981 10.3345L20.0285 5.38963L14.7929 18.96Z"
          fill="white"
        />
      </Svg>
    </Icon>
  );
}
