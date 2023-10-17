import React from "react";
import { Icon } from "native-base";
import { G, Path } from "react-native-svg";
import { InterfaceIconProps } from "native-base/lib/typescript/components/primitives/Icon/types";

export default function ClockIcon({
  color = "black",
  ...otherProps
}: Omit<InterfaceIconProps, "color"> & { color?: "black" | "white" }) {
  return (
    <Icon size="sm" viewBox="0 0 14 14" alignSelf="center" {...otherProps}>
      <G fill="none">
        <Path
          d="M6.99992 0.333374C3.32392 0.333374 0.333252 3.32404 0.333252 7.00004C0.333252 10.676 3.32392 13.6667 6.99992 13.6667C10.6759 13.6667 13.6666 10.676 13.6666 7.00004C13.6666 3.32404 10.6759 0.333374 6.99992 0.333374ZM6.99992 12.3334C4.05925 12.3334 1.66659 9.94071 1.66659 7.00004C1.66659 4.05937 4.05925 1.66671 6.99992 1.66671C9.94059 1.66671 12.3333 4.05937 12.3333 7.00004C12.3333 9.94071 9.94059 12.3334 6.99992 12.3334Z"
          fill={color === "black" ? "#6D6D6D" : "#F6F6F6"}
        />
        <Path
          d="M7.66659 3.66687H6.33325V7.66687H10.3333V6.33354H7.66659V3.66687Z"
          fill={color === "black" ? "#6D6D6D" : "#F6F6F6"}
        />
      </G>
    </Icon>
  );
}
