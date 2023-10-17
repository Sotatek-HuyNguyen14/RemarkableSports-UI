import React from "react";
import { Icon } from "native-base";
import { G, Path } from "react-native-svg";
import { InterfaceIconProps } from "native-base/lib/typescript/components/primitives/Icon/types";

export default function CircleRedMinusIcon({ ...props }: InterfaceIconProps) {
  return (
    <Icon size="lg" viewBox="0 0 24 25" {...props}>
      <Path
        d="M12.2672 4.16175C7.70406 4.16175 3.99915 7.86669 3.99915 12.4298C3.99915 16.9928 7.70409 20.6978 12.2672 20.6978C16.8302 20.6978 20.5352 16.9928 20.5352 12.4298C20.5352 7.86669 16.8302 4.16175 12.2672 4.16175ZM12.2672 19.2325C8.52039 19.2325 5.46437 16.1764 5.46437 12.4298C5.46437 8.68306 8.52046 5.62697 12.2672 5.62697C16.0138 5.62697 19.0699 8.68306 19.0699 12.4298C19.0699 16.1764 16.0138 19.2325 12.2672 19.2325Z"
        fill="#E71010"
      />
      <Path
        d="M14.99 11.5924H9.54774C9.15001 11.5924 8.81506 11.9273 8.81506 12.3251C8.81521 12.7227 9.15 13.0576 9.54774 13.0576H14.99C15.3877 13.0576 15.7227 12.7227 15.7227 12.3249C15.7225 11.9272 15.3877 11.5924 14.99 11.5924Z"
        fill="#E71010"
      />
    </Icon>
  );
}
