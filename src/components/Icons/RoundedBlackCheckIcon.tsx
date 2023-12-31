import React from "react";
import { Icon } from "native-base";
import { Path, G } from "react-native-svg";

export default function RoundedBlackCheckIcon() {
  return (
    <Icon size="md" viewBox="0 0 18 18">
      <G fill="none">
        <Path
          d="M9 18C13.9706 18 18 13.9706 18 9C18 4.02944 13.9706 0 9 0C4.02944 0 0 4.02944 0 9C0 13.9706 4.02944 18 9 18Z"
          fill="#31095E"
        />
        <Path
          d="M13.3756 7.52594C13.5074 7.39414 13.5074 7.18045 13.3756 7.04864L12.5801 6.25315C12.4483 6.12135 12.2346 6.12135 12.1028 6.25315L8.07443 10.2815C7.98657 10.3694 7.8441 10.3694 7.75624 10.2815L5.89752 8.42279C5.76572 8.29099 5.55203 8.29099 5.42023 8.42279L4.62473 9.21829C4.49293 9.35009 4.49293 9.56378 4.62473 9.69558L7.67669 12.7475C7.80849 12.8793 8.02218 12.8793 8.15398 12.7475L13.3756 7.52594Z"
          fill="white"
        />
      </G>
    </Icon>
  );
}
