import React from "react";
import { Icon } from "native-base";
import { Path, Circle, Svg } from "react-native-svg";
import { InterfaceIconProps } from "native-base/lib/typescript/components/primitives/Icon/types";

export default function TipDialogIcon(props: InterfaceIconProps) {
  return (
    <Icon size="lg" viewBox="0 0 6 23" {...props}>
      <Path
        fillRule="evenodd"
        clipRule="evenodd"
        d="M4.12944 14.5998C4.34498 14.5989 4.52102 14.4273 4.52751 14.2118L4.94004 0.509912C4.94685 0.283697 4.76479 0.0968895 4.53848 0.0978786L1.36657 0.111741C1.14025 0.11273 0.959829 0.301123 0.968617 0.52727L1.5009 14.2251C1.50927 14.4405 1.6868 14.6105 1.90235 14.6095L4.12944 14.5998Z"
        fill="#F16514"
      />
      <Path
        d="M0.539294 20.1156C0.545328 21.4963 1.6695 22.6107 3.0502 22.6046C4.4309 22.5986 5.54528 21.4744 5.53925 20.0937C5.53321 18.713 4.40904 17.5986 3.02834 17.6047C1.64765 17.6107 0.53326 18.7349 0.539294 20.1156Z"
        fill="#F16514"
      />
    </Icon>
  );
}
