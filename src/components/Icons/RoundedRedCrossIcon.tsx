import React from "react";
import { Icon } from "native-base";
import { Circle, Path, G } from "react-native-svg";
import { InterfaceIconProps } from "native-base/lib/typescript/components/primitives/Icon/types";

interface RoundedRedCrossIconProps {
  fillColor?: string;
}

export default function RoundedRedCrossIcon(props: RoundedRedCrossIconProps) {
  return (
    <Icon size="5xl" viewBox="0 0 49 49" {...props}>
      <G fill="none">
        <Circle
          opacity="0.15"
          cx="24.4999"
          cy="24.1048"
          r="24"
          transform="rotate(-0.250408 24.4999 24.1048)"
          // eslint-disable-next-line react/destructuring-assignment
          fill={props.fillColor || "#E3493F"}
        />
        <Path
          fillRule="evenodd"
          clipRule="evenodd"
          d="M24.511 26.726L30.2634 32.4283C30.3811 32.5449 30.571 32.5441 30.6877 32.4264L32.3773 30.7219C32.4939 30.6043 32.4931 30.4143 32.3754 30.2977L26.6231 24.5954L32.3254 18.843C32.442 18.7253 32.4412 18.5354 32.3235 18.4188L30.6191 16.7291C30.5014 16.6125 30.3115 16.6133 30.1948 16.731L24.4925 22.4834L18.7401 16.781C18.6225 16.6644 18.4325 16.6652 18.3159 16.7829L16.6262 18.4873C16.5096 18.605 16.5104 18.795 16.6281 18.9116L22.3805 24.6139L16.6782 30.3663C16.5615 30.484 16.5623 30.6739 16.68 30.7906L18.3845 32.4802C18.5021 32.5968 18.6921 32.596 18.8087 32.4783L24.511 26.726Z"
          // eslint-disable-next-line react/destructuring-assignment
          fill={props.fillColor || "#E3493F"}
        />
      </G>
    </Icon>
  );
}
