import React from "react";
import { Icon } from "native-base";
import { Path, Rect } from "react-native-svg";
import { InterfaceIconProps } from "native-base/lib/typescript/components/primitives/Icon/types";

export default function AddIcon({
  props,
  haveRect = true,
  pathColor,
}: {
  props?: InterfaceIconProps;
  haveRect?: boolean;
  pathColor?: string;
}) {
  return (
    <Icon size="xl" viewBox="0 0 36 36" {...props}>
      {haveRect ? (
        <Rect width="36" height="36" rx="18" fill="#66CEE1" />
      ) : (
        // eslint-disable-next-line react/jsx-no-useless-fragment
        <></>
      )}
      <Path
        d="M19 17V10H17V17H10V19H17V26H19V19H26V17H19Z"
        fill={pathColor || "#000000"}
      />
    </Icon>
  );
}
