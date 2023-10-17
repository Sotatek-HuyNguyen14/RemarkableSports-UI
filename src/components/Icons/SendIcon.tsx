/* eslint-disable react/destructuring-assignment */
import React from "react";
import { Icon } from "native-base";
import { G, Path, Svg } from "react-native-svg";
import { InterfaceIconProps } from "native-base/lib/typescript/components/primitives/Icon/types";

interface SendIconProps extends InterfaceIconProps {
  fillColor?: string;
}

export default function SendIcon(props: SendIconProps) {
  return (
    <Icon size="lg" viewBox="0 0 20 22" {...props}>
      <Svg width="24" height="24" viewBox="0 0 24 24" fill="none">
        <Path
          fill-rule="evenodd"
          clip-rule="evenodd"
          d="M5.54786 6.60259L6.33701 11.1402H11.2062C11.6204 11.1402 11.9562 11.476 11.9562 11.8902C11.9562 12.3044 11.6204 12.6402 11.2062 12.6402H6.33701L5.54786 17.1777L17.8856 11.8902L5.54786 6.60259ZM4.94492 11.8902L4.01985 6.57101C3.94507 6.141 4.08421 5.70149 4.39284 5.39286C4.78062 5.00508 5.36544 4.89245 5.86951 5.10848L19.2719 10.8523C19.687 11.0303 19.9562 11.4385 19.9562 11.8902C19.9562 12.3419 19.687 12.7501 19.2719 12.928L5.86951 18.6718C5.36544 18.8879 4.78062 18.7752 4.39284 18.3875C4.08421 18.0788 3.94507 17.6393 4.01985 17.2093L4.94492 11.8902Z"
          fill="#919191"
        />
      </Svg>
    </Icon>
  );
}
