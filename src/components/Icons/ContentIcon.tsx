import React from "react";
import { Icon, useTheme } from "native-base";
import { G, Path } from "react-native-svg";
import { InterfaceIconProps } from "native-base/lib/typescript/components/primitives/Icon/types";

export default function ContentIcon({
  props,
  isFocus = false,
  color,
}: {
  props?: InterfaceIconProps;
  isFocus?: boolean;
  color?: string;
}) {
  const { colors: themeColors } = useTheme();
  return (
    <Icon size="lg" viewBox="0 0 18 16" {...props}>
      <G fill="none">
        <Path
          fillRule="evenodd"
          clipRule="evenodd"
          fill={
            color ??
            (isFocus ? themeColors.rs.black : themeColors.rs_secondary.grey)
          }
          d="M0 1.03746C0.00164704 0.818609 0.0962102 0.609142 0.263262 0.454309C0.430313 0.299476 0.656442 0.211706 0.8928 0.209961H17.1072C17.6004 0.209961 18 0.580794 18 1.03746V14.3825C17.9984 14.6013 17.9038 14.8108 17.7367 14.9656C17.5697 15.1204 17.3436 15.2082 17.1072 15.21H0.8928C0.655932 15.2097 0.428847 15.1225 0.26144 14.9673C0.0940338 14.8121 -1.2011e-07 14.6018 0 14.3825V1.03746ZM8.1 1.87663H1.8V13.5433H8.1V1.87663ZM9.9 1.87663V13.5433H16.2V1.87663H9.9ZM10.8 3.54329H15.3V5.20996H10.8V3.54329ZM10.8 6.04329H15.3V7.70996H10.8V6.04329Z"
        />
      </G>
    </Icon>
  );
}
