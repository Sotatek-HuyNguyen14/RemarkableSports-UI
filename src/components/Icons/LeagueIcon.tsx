import React from "react";
import { Icon } from "native-base";
import { ClipPath, Defs, G, Path, Rect } from "react-native-svg";
import { InterfaceIconProps } from "native-base/lib/typescript/components/primitives/Icon/types";

export default function LeagueIcon({
  color,
  strokeColor,
  ...otherProps
}: Omit<InterfaceIconProps, "color"> & {
  color?: string;
  strokeColor?: string;
}) {
  return (
    <Icon size="md" viewBox="0 0 24 24" {...otherProps}>
      <G clipPath="url(#clip0_7769_10379)">
        <Path
          d="M5.51995 8.93294H3.89995C3.18387 8.93294 2.49711 8.65199 1.99076 8.15189C1.48441 7.6518 1.19995 6.97352 1.19995 6.26628C1.19995 5.55903 1.48441 4.88075 1.99076 4.38066C2.49711 3.88056 3.18387 3.59961 3.89995 3.59961H5.51995M18.4799 8.93294H20.1C20.816 8.93294 21.5028 8.65199 22.0091 8.15189C22.5155 7.6518 22.7999 6.97352 22.7999 6.26628C22.7999 5.55903 22.5155 4.88075 22.0091 4.38066C21.5028 3.88056 20.816 3.59961 20.1 3.59961H18.4799M3.35995 22.7996H20.6399M9.83995 15.5996V17.4663C9.83995 18.0529 9.33235 18.5116 8.79235 18.7569C7.51795 19.3329 6.59995 20.9223 6.59995 22.7996M14.1599 15.5996V17.4663C14.1599 18.0529 14.6676 18.5116 15.2076 18.7569C16.482 19.3329 17.4 20.9223 17.4 22.7996"
          stroke={strokeColor || "#000000"}
          strokeWidth="1.8"
          strokeLinecap="round"
          strokeLinejoin="round"
          fill={color || "transparent"}
        />
        <Path
          d="M18 1.19922H6V8.95306C6 10.7157 6.63214 12.4062 7.75736 13.6526C8.88258 14.899 10.4087 15.5992 12 15.5992C13.5913 15.5992 15.1174 14.899 16.2426 13.6526C17.3679 12.4062 18 10.7157 18 8.95306V1.19922Z"
          stroke={strokeColor || "#000000"}
          strokeWidth="1.8"
          strokeLinecap="round"
          strokeLinejoin="round"
          fill={color || "transparent"}
        />
      </G>
      <Defs>
        <ClipPath id="clip0_7769_10379">
          <Rect width="24" height="24" fill={color || "white"} />
        </ClipPath>
      </Defs>
    </Icon>
  );
}
