/* eslint-disable react/destructuring-assignment */
import React from "react";
import { Icon } from "native-base";
import { G, Path } from "react-native-svg";
import { InterfaceIconProps } from "native-base/lib/typescript/components/primitives/Icon/types";

interface MapIconProps extends InterfaceIconProps {
  fillColor?: string;
}

export default function MapIcon(props: MapIconProps) {
  return (
    <Icon size="lg" viewBox="0 0 24 22" {...props}>
      <G fill="none">
        <Path
          fillRule="evenodd"
          clipRule="evenodd"
          d="M8 5.21351e-09C7.81314 5.21351e-09 7.63825 0.051253 7.48862 0.140468L0.503861 4.13176C0.192286 4.3098 0 4.64114 0 5V21C0 21.3565 0.189758 21.686 0.498073 21.8649C0.806388 22.0438 1.18664 22.0451 1.49614 21.8682L8.03147 18.1338L15.5348 21.8854C15.6646 21.9538 15.8112 21.9944 15.9669 21.9995C15.9779 21.9998 15.989 22 16 22C16.1869 22 16.3618 21.9487 16.5114 21.8595L23.4961 17.8682C23.8077 17.6902 24 17.3589 24 17V1C24 0.64353 23.8102 0.314012 23.5019 0.13509C23.1936 -0.043832 22.8134 -0.045102 22.5039 0.131757L15.9685 3.86623L8.4652 0.114567C8.32855 0.0426226 8.17321 0.00138618 8.00837 3.4444e-05L8 5.21351e-09ZM17 19.2768L22 16.4197V2.72318L17 5.58032V19.2768ZM15 5.61803L9 2.61803V16.382L15 19.382V5.61803ZM2 5.58032L7 2.72318V16.4197L2 19.2768V5.58032Z"
          fill={props.fillColor || "#000000"}
        />
      </G>
    </Icon>
  );
}
