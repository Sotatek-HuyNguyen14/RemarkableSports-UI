import React from "react";
import { Icon } from "native-base";
import Svg, { G, Path } from "react-native-svg";
import { InterfaceIconProps } from "native-base/lib/typescript/components/primitives/Icon/types";

export default function RoundedCurrencyIcon(props: InterfaceIconProps) {
  return (
    <Icon size="md" viewBox="0 0 20 20" {...props}>
      <G>
        <Path
          d="M10.7534 9.125C10.4124 9.0375 10.0715 8.8625 9.81575 8.6C9.56003 8.5125 9.47479 8.25 9.47479 8.075C9.47479 7.9 9.56003 7.6375 9.73051 7.55C9.98624 7.375 10.242 7.2 10.4977 7.2875C11.0091 7.2875 11.4353 7.55 11.6911 7.9L12.4583 6.85C12.2025 6.5875 11.9468 6.4125 11.6911 6.2375C11.4353 6.0625 11.0944 5.975 10.7534 5.975V4.75H9.73051V5.975C9.3043 6.0625 8.87809 6.325 8.53712 6.675C8.19616 7.1125 7.94043 7.6375 8.02567 8.1625C8.02567 8.6875 8.19616 9.2125 8.53712 9.5625C8.96333 10 9.56003 10.2625 10.0715 10.525C10.3272 10.6125 10.6682 10.7875 10.9239 10.9625C11.0944 11.1375 11.1796 11.4 11.1796 11.6625C11.1796 11.925 11.0944 12.1875 10.9239 12.45C10.6682 12.7125 10.3272 12.8 10.0715 12.8C9.73051 12.8 9.3043 12.7125 9.04858 12.45C8.79285 12.275 8.53712 12.0125 8.36664 11.75L7.51422 12.7125C7.76995 13.0625 8.02567 13.325 8.36664 13.5875C8.79285 13.85 9.3043 14.1125 9.81575 14.1125V15.25H10.7534V13.9375C11.2649 13.85 11.6911 13.5875 12.032 13.2375C12.4583 12.8 12.714 12.1 12.714 11.4875C12.714 10.9625 12.5435 10.35 12.1173 10C11.6911 9.5625 11.2649 9.3 10.7534 9.125ZM10.242 3C6.49132 3 3.42261 6.15 3.42261 10C3.42261 13.85 6.49132 17 10.242 17C13.9926 17 17.0613 13.85 17.0613 10C17.0613 6.15 13.9926 3 10.242 3ZM10.242 16.0375C7.00277 16.0375 4.36027 13.325 4.36027 10C4.36027 6.675 7.00277 3.9625 10.242 3.9625C13.4812 3.9625 16.1237 6.675 16.1237 10C16.1237 13.325 13.4812 16.0375 10.242 16.0375Z"
          fill="#6D6D6D"
        />
      </G>
    </Icon>
  );
}