/* eslint-disable react/destructuring-assignment */
import React from "react";
import { Icon } from "native-base";
import { G, Path } from "react-native-svg";
import { InterfaceIconProps } from "native-base/lib/typescript/components/primitives/Icon/types";

interface PencilIconProps extends InterfaceIconProps {
  innterFill?: string;
}

export default function PencilIcon(props: PencilIconProps) {
  return (
    <Icon size="md" viewBox="0 0 25 24" {...props}>
      <G fill="none">
        <Path
          d="M19.2022 1.57789L19.202 1.57771C18.934 1.31109 18.5714 1.16143 18.1934 1.16143C17.8154 1.16143 17.4527 1.31109 17.1848 1.57771L17.1847 1.57777L3.31137 15.4311L3.30123 15.4412L3.298 15.4552L2.03133 20.9219L2.03132 20.9219L2.03119 20.9225C1.98591 21.1296 1.98746 21.3442 2.03574 21.5506C2.08401 21.7571 2.1778 21.9501 2.31024 22.1157C2.44268 22.2812 2.61042 22.4151 2.80123 22.5075C2.99132 22.5996 3.19951 22.6482 3.4107 22.6498C3.50858 22.6595 3.60719 22.6595 3.70506 22.6496L3.7051 22.65L3.71121 22.6486L9.23787 21.3819L9.25188 21.3787L9.26204 21.3685L23.1154 7.52852L23.1155 7.52842C23.3821 7.26045 23.5318 6.89782 23.5318 6.51982C23.5318 6.14181 23.3821 5.77918 23.1155 5.51122L19.2022 1.57789ZM18.8692 9.79974L8.53527 20.0873L3.44647 21.1548L4.60549 16.1651L14.94 5.87046L18.8692 9.79974ZM19.833 8.76202L15.9042 4.83325L18.153 2.59739L22.0167 6.5266L19.833 8.76202Z"
          fill={props.innterFill || "black"}
        />
      </G>
    </Icon>
  );
}
