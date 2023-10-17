import React from "react";
import { Icon } from "native-base";
import { G, Path } from "react-native-svg";
import { InterfaceIconProps } from "native-base/lib/typescript/components/primitives/Icon/types";

export default function HomeIcon({
  props,
  isFocus = false,
}: {
  props?: InterfaceIconProps;
  isFocus?: boolean;
}) {
  return (
    <Icon size="lg" viewBox="0 0 18 20" {...props}>
      <G fill="none">
        <Path
          fillRule="evenodd"
          clipRule="evenodd"
          d="M9.51158 1.00855C9.21065 0.774495 8.78927 0.774495 8.48834 1.00855L0.988342 6.84188C0.785353 6.99976 0.666626 7.24252 0.666626 7.49967V16.6663C0.666626 17.3294 0.930018 17.9653 1.39886 18.4341C1.8677 18.9029 2.50358 19.1663 3.16663 19.1663H14.8333C15.4963 19.1663 16.1322 18.9029 16.6011 18.4341C17.0699 17.9653 17.3333 17.3294 17.3333 16.6663V7.49967C17.3333 7.24252 17.2146 6.99976 17.0116 6.84188L9.51158 1.00855ZM12.3333 17.4997H14.8333C15.0543 17.4997 15.2663 17.4119 15.4225 17.2556C15.5788 17.0993 15.6666 16.8874 15.6666 16.6663V7.90724L8.99996 2.72206L2.33329 7.90724V16.6663C2.33329 16.8874 2.42109 17.0993 2.57737 17.2556C2.73365 17.4119 2.94561 17.4997 3.16663 17.4997H5.66663V9.99967C5.66663 9.53944 6.03972 9.16634 6.49996 9.16634H11.5C11.9602 9.16634 12.3333 9.53944 12.3333 9.99967V17.4997ZM7.33329 17.4997V10.833H10.6666V17.4997H7.33329Z"
          fill={isFocus ? "#000000" : "#6D6D6D"}
        />
      </G>
    </Icon>
  );
}
