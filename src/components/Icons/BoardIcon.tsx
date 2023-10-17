/* eslint-disable react/destructuring-assignment */
import React from "react";
import { Icon } from "native-base";
import { G, Path } from "react-native-svg";
import { InterfaceIconProps } from "native-base/lib/typescript/components/primitives/Icon/types";

interface BoardIconProps extends InterfaceIconProps {
  fillColor?: string;
}

export default function BoardIcon(props: BoardIconProps) {
  return (
    <Icon size="lg" viewBox="0 0 18 22" {...props}>
      <G fill="none">
        <Path
          fillRule="evenodd"
          clipRule="evenodd"
          d="M6 0C4.89543 0 4 0.89543 4 2H3C2.20435 2 1.44129 2.31607 0.87868 2.87868C0.31607 3.44129 0 4.20435 0 5V19C0 19.7956 0.31607 20.5587 0.87868 21.1213C1.44129 21.6839 2.20435 22 3 22H15C15.7957 22 16.5587 21.6839 17.1213 21.1213C17.6839 20.5587 18 19.7956 18 19V5C18 4.20435 17.6839 3.44129 17.1213 2.87868C16.5587 2.31607 15.7956 2 15 2H14C14 0.89543 13.1046 0 12 0H6ZM14 4C14 5.10457 13.1046 6 12 6H6C4.89543 6 4 5.10457 4 4H3C2.73478 4 2.48043 4.10536 2.29289 4.29289C2.10536 4.48043 2 4.73478 2 5V19C2 19.2652 2.10536 19.5196 2.29289 19.7071C2.48043 19.8946 2.73478 20 3 20H15C15.2652 20 15.5196 19.8946 15.7071 19.7071C15.8946 19.5196 16 19.2652 16 19V5C16 4.73478 15.8946 4.48043 15.7071 4.29289C15.5196 4.10536 15.2652 4 15 4H14ZM6 4H12V2H6V4Z"
          fill={props.fillColor || "#000000"}
        />
      </G>
    </Icon>
  );
}
