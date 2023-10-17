import React from "react";
import { Icon } from "native-base";
import Svg, { Circle, G, Path } from "react-native-svg";
import { InterfaceIconProps } from "native-base/lib/typescript/components/primitives/Icon/types";

export default function FilterIconV2({
  props,
  color,
}: {
  props?: InterfaceIconProps;
  color?: string;
}) {
  return (
    <Icon size="lg" viewBox="0 0 25 25" {...props}>
      <Svg width="25" height="25" viewBox="0 0 25 25" fill="none">
        <Path
          d="M10.4993 19.0012V19V13V12.8274L10.3928 12.6916L4.59643 5.29618C4.51754 5.18989 4.48814 5.10355 4.48066 5.034C4.47317 4.96444 4.48391 4.8779 4.53768 4.76503C4.58906 4.65717 4.64692 4.5999 4.70353 4.56579C4.76221 4.53044 4.85307 4.5 4.99928 4.5H18.9993C19.145 4.5 19.2357 4.53037 19.2945 4.56579C19.3513 4.60001 19.4095 4.65752 19.4612 4.7657C19.5151 4.8785 19.5258 4.96479 19.5184 5.034C19.5109 5.10327 19.4816 5.18951 19.4023 5.2959L13.6057 12.6916L13.4993 12.8274V13V19C13.4993 19.1572 13.4515 19.2657 13.3577 19.3594C13.264 19.4532 13.1562 19.5004 13.0005 19.5H12.9993H10.9993C10.8416 19.5 10.7329 19.4522 10.6392 19.3588C10.5466 19.2665 10.4989 19.159 10.4993 19.0012Z"
          stroke="black"
        />
      </Svg>
    </Icon>
  );
}
