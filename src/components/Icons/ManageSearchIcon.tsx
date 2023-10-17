import React from "react";
import { Icon } from "native-base";
import Svg, { Circle, G, Path } from "react-native-svg";
import { InterfaceIconProps } from "native-base/lib/typescript/components/primitives/Icon/types";

export default function ManageSearchIcon(props: InterfaceIconProps) {
  return (
    <Icon size="md" viewBox="0 0 16 16" {...props}>
      <Svg width="16" height="16" viewBox="0 0 16 16" fill="none">
        <Path
          d="M4.66732 6H1.33398V4.66667H4.66732V6ZM4.66732 8H1.33398V9.33333H4.66732V8ZM13.7273 12.6667L11.174 10.1133C10.6407 10.46 10.014 10.6667 9.33398 10.6667C7.49398 10.6667 6.00065 9.17333 6.00065 7.33333C6.00065 5.49333 7.49398 4 9.33398 4C11.174 4 12.6673 5.49333 12.6673 7.33333C12.6673 8.01333 12.4607 8.64 12.114 9.16667L14.6673 11.7267L13.7273 12.6667ZM11.334 7.33333C11.334 6.23333 10.434 5.33333 9.33398 5.33333C8.23398 5.33333 7.33398 6.23333 7.33398 7.33333C7.33398 8.43333 8.23398 9.33333 9.33398 9.33333C10.434 9.33333 11.334 8.43333 11.334 7.33333ZM1.33398 12.6667H8.00065V11.3333H1.33398V12.6667Z"
          fill="white"
        />
      </Svg>
    </Icon>
  );
}
