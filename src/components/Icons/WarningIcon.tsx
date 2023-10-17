import React from "react";
import { Icon } from "native-base";
import { Path, G } from "react-native-svg";
import { InterfaceIconProps } from "native-base/lib/typescript/components/primitives/Icon/types";

interface WarningIconProps extends InterfaceIconProps {
  strokeColor?: string;
}

export default function WarningIcon(props: WarningIconProps) {
  return (
    <Icon size="md" viewBox="0 0 25 24" fill="none" {...props}>
      <Path
        d="M19.7223 19H5.27929C5.1425 19 5.00811 18.9641 4.88964 18.8958C4.77118 18.8275 4.6728 18.7293 4.6044 18.6111C4.53601 18.4928 4.5 18.3587 4.5 18.2221C4.5 18.0856 4.53601 17.9515 4.60441 17.8332L11.8255 5.38755C11.894 5.26967 11.9923 5.17183 12.1106 5.10382C12.229 5.0358 12.3631 5 12.4996 5C12.6361 5 12.7703 5.0358 12.8886 5.10382C13.0069 5.17183 13.1052 5.26967 13.1737 5.38755L20.3956 17.8332C20.464 17.9514 20.5 18.0855 20.5 18.2219C20.5 18.3584 20.4641 18.4925 20.3958 18.6107C20.3275 18.729 20.2292 18.8272 20.1109 18.8955C19.9925 18.9638 19.8582 18.9999 19.7215 19H19.7223ZM11.7219 15.1107V16.6664H13.2789V15.1107H11.7219ZM11.7219 9.66575V13.555H13.2805V9.66575H11.7219Z"
        fill="#E71010"
      />
    </Icon>
  );
}
