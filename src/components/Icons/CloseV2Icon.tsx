import React from "react";
import { Icon } from "native-base";
import { Path, Circle, Svg } from "react-native-svg";
import { InterfaceIconProps } from "native-base/lib/typescript/components/primitives/Icon/types";

export default function CloseV2Icon(props: InterfaceIconProps) {
  return (
    <Icon size="lg" viewBox="-6 -6 24 24" {...props}>
      <Path
        d="M12 1.20857L10.7914 0L6 4.79143L1.20857 0L0 1.20857L4.79143 6L0 10.7914L1.20857 12L6 7.20857L10.7914 12L12 10.7914L7.20857 6L12 1.20857Z"
        fill="white"
      />
    </Icon>
  );
}
