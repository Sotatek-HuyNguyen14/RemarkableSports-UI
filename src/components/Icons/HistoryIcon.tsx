import React from "react";
import { Icon } from "native-base";
import { G, Path } from "react-native-svg";
import { InterfaceIconProps } from "native-base/lib/typescript/components/primitives/Icon/types";

export default function HistoryIcon({
  props,
  isFocus = false,
}: {
  props?: InterfaceIconProps;
  isFocus?: boolean;
}) {
  return (
    <Icon size="lg" viewBox="0 0 20 20" {...props}>
      <G fill="none">
        <Path
          d="M10.8334 4.99967C10.8334 4.53944 10.4603 4.16634 10 4.16634C9.5398 4.16634 9.16671 4.53944 9.16671 4.99967V9.99967C9.16671 10.3153 9.34504 10.6039 9.62736 10.745L12.9607 12.4117C13.3723 12.6175 13.8729 12.4507 14.0787 12.039C14.2846 11.6274 14.1177 11.1268 13.7061 10.921L10.8334 9.48464V4.99967Z"
          fill={isFocus ? "#000000" : "#6D6D6D"}
        />
        <Path
          fillRule="evenodd"
          clipRule="evenodd"
          d="M10 0.833008C4.93743 0.833008 0.833374 4.93706 0.833374 9.99967C0.833374 15.0623 4.93743 19.1663 10 19.1663C15.0626 19.1663 19.1667 15.0623 19.1667 9.99967C19.1667 4.93706 15.0626 0.833008 10 0.833008ZM2.50004 9.99967C2.50004 5.85754 5.8579 2.49967 10 2.49967C14.1422 2.49967 17.5 5.85754 17.5 9.99967C17.5 14.1418 14.1422 17.4997 10 17.4997C5.8579 17.4997 2.50004 14.1418 2.50004 9.99967Z"
          fill={isFocus ? "#000000" : "#6D6D6D"}
        />
      </G>
    </Icon>
  );
}
