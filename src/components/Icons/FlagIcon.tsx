/* eslint-disable react/destructuring-assignment */
import React from "react";
import { Icon } from "native-base";
import { G, Path } from "react-native-svg";
import { InterfaceIconProps } from "native-base/lib/typescript/components/primitives/Icon/types";

interface FlagIconProps extends InterfaceIconProps {
  fillColor?: string;
}

export default function FlagIcon(props: FlagIconProps) {
  return (
    <Icon size="lg" viewBox="0 0 20 22" {...props}>
      <G fill="none">
        <Path
          fillRule="evenodd"
          clipRule="evenodd"
          d="M0.984375 1.9086C0.984375 1.4892 1.24608 1.11436 1.63979 0.969844C3.28306 0.366649 4.63315 0.0904816 6.01494 0.116971C7.38109 0.143161 8.71074 0.464918 10.2944 0.952947C11.8509 1.43262 12.96 1.71371 14.0365 1.74823C15.0856 1.78188 16.168 1.58161 17.638 0.982546C17.9463 0.856885 18.297 0.892941 18.5733 1.07872C18.8496 1.2645 19.0154 1.57563 19.0154 1.9086V12.9086C19.0154 13.3152 18.7693 13.6812 18.3928 13.8347C16.7326 14.5112 15.3681 14.792 13.9724 14.7472C12.6042 14.7033 11.2706 14.3466 9.70538 13.8643C8.16727 13.3903 7.05491 13.1373 5.97661 13.1166C5.07617 13.0994 4.15121 13.2438 2.98438 13.6207L2.98438 20.9995C2.98438 21.5518 2.53666 21.9995 1.98438 21.9995C1.43209 21.9995 0.984375 21.5518 0.984375 20.9995V1.9086ZM6.01494 11.117C5.02804 11.0981 4.0573 11.2335 2.98438 11.5323V2.62065C4.15121 2.24379 5.07617 2.09934 5.97661 2.1166C7.05491 2.13727 8.16727 2.39025 9.70538 2.86425C11.2706 3.3466 12.6042 3.70333 13.9724 3.74721C14.9635 3.77899 15.9388 3.64665 17.0154 3.32502V12.2208C15.8514 12.6353 14.9318 12.777 14.0365 12.7482C12.96 12.7137 11.8509 12.4326 10.2944 11.953C8.71074 11.4649 7.38109 11.1432 6.01494 11.117Z"
          fill={props.fillColor || "#000000"}
        />
      </G>
    </Icon>
  );
}
