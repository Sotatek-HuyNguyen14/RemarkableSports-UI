import React from "react";
import { Icon } from "native-base";
import { G, Path } from "react-native-svg";
import { InterfaceIconProps } from "native-base/lib/typescript/components/primitives/Icon/types";

export function PurpleCheckedIcon(props: InterfaceIconProps) {
  return (
    <Icon size="lg" viewBox="0 0 18 18" {...props}>
      <Path
        d="M9 18C13.9706 18 18 13.9706 18 9C18 4.02944 13.9706 0 9 0C4.02944 0 0 4.02944 0 9C0 13.9706 4.02944 18 9 18Z"
        fill="#31095E"
      />
      <Path
        d="M13.377 7.52399C13.5088 7.39219 13.5088 7.17849 13.377 7.04669L12.5816 6.2512C12.4497 6.11939 12.2361 6.11939 12.1043 6.2512L8.0759 10.2796C7.98803 10.3674 7.84557 10.3674 7.7577 10.2796L5.89899 8.42084C5.76719 8.28904 5.55349 8.28903 5.42169 8.42084L4.62619 9.21633C4.49439 9.34813 4.49439 9.56183 4.62619 9.69363L7.67815 12.7456C7.80995 12.8774 8.02365 12.8774 8.15545 12.7456L13.377 7.52399Z"
        fill="white"
      />
    </Icon>
  );
}

export function PurpleUncheckIcon(props: InterfaceIconProps) {
  return (
    <Icon size="lg" viewBox="0 0 18 18" {...props}>
      <Path
        d="M17.5 9C17.5 13.6944 13.6944 17.5 9 17.5C4.30558 17.5 0.5 13.6944 0.5 9C0.5 4.30558 4.30558 0.5 9 0.5C13.6944 0.5 17.5 4.30558 17.5 9Z"
        stroke="#31095E"
        fill="none"
      />
    </Icon>
  );
}
