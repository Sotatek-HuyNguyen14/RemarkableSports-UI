import React from "react";
import { Icon } from "native-base";
import { Path, Circle, Svg } from "react-native-svg";
import { InterfaceIconProps } from "native-base/lib/typescript/components/primitives/Icon/types";

export default function ReminderIcon(props: InterfaceIconProps) {
  return (
    <Icon size="lg" viewBox="0 0 6 23" {...props}>
      <Path
        fillRule="evenodd"
        clipRule="evenodd"
        d="M4.19239 8.24603C4.41331 8.24506 4.59317 8.42336 4.59414 8.64427L4.65401 22.3441C4.65498 22.5651 4.47668 22.7449 4.25577 22.7459L2.05579 22.7555C1.83487 22.7565 1.65501 22.5782 1.65404 22.3573L1.59417 8.65739C1.5932 8.43647 1.7715 8.25661 1.99242 8.25564L4.19239 8.24603Z"
        fill="#0569FF"
      />
      <Circle
        cx="3.06869"
        cy="2.75118"
        r="2.5"
        transform="rotate(179.75 3.06869 2.75118)"
        fill="#0569FF"
      />
    </Icon>
  );
}
