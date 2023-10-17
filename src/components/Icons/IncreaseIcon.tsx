import React from "react";
import { Icon } from "native-base";
import { G, Path } from "react-native-svg";
import { InterfaceIconProps } from "native-base/lib/typescript/components/primitives/Icon/types";

export default function IncreaseIcon(props: InterfaceIconProps) {
  return (
    <Icon size="sm" viewBox="0 0 16 12" alignSelf="center" {...props}>
      <G fill="none">
        <Path
          d="M9.8848 0.95H9.8348V1V2.11111V2.16111H9.8848H13.2953L8.81337 6.80908L6.54954 4.4614L6.54954 4.4614C6.43985 4.34769 6.29071 4.28345 6.1348 4.28345C5.97889 4.28345 5.82975 4.34769 5.72006 4.4614L5.72006 4.4614L0.205951 10.1797L0.172484 10.2144L0.205951 10.2492L0.963451 11.0347L0.999443 11.072L1.03544 11.0347L6.1348 5.74648L8.39863 8.09415L8.39863 8.09416C8.50832 8.20787 8.65746 8.2721 8.81337 8.2721C8.96928 8.2721 9.11842 8.20787 9.22811 8.09416L9.22812 8.09415L14.1205 3.02055V6.55556V6.60556H14.1705H15.2419H15.2919V6.55556V1V0.95H15.2419H9.8848Z"
          fill="#6D6D6D"
          stroke="#6D6D6D"
          strokeWidth="0.1"
        />
      </G>
    </Icon>
  );
}
