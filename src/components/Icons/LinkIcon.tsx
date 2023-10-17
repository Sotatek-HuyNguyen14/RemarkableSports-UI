import React from "react";
import { Icon } from "native-base";
import { G, Path } from "react-native-svg";
import { InterfaceIconProps } from "native-base/lib/typescript/components/primitives/Icon/types";

export default function LinkIcon({
  color,
  ...otherProps
}: Omit<InterfaceIconProps, "color"> & { color?: string }) {
  return (
    <Icon size="sm" viewBox="0 0 12 12" {...otherProps}>
      <G fill="none">
        <Path
          d="M5.08468 6.91629C5.35084 7.16947 5.35084 7.58493 5.08468 7.8381C4.83151 8.09128 4.41605 8.09128 4.16287 7.8381C3.55485 7.22917 3.21335 6.40383 3.21335 5.54332C3.21335 4.6828 3.55485 3.85746 4.16287 3.24853L6.46091 0.9505C7.06984 0.342481 7.89518 0.000976566 8.75569 0.000976567C9.61621 0.000976567 10.4415 0.342481 11.0505 0.9505C11.6585 1.55943 12 2.38477 12 3.24529C12 4.1058 11.6585 4.93114 11.0505 5.54007L10.0832 6.50732C10.0897 5.97501 10.0053 5.4427 9.82356 4.93635L10.1287 4.62475C10.3107 4.44473 10.4551 4.23041 10.5537 3.99418C10.6523 3.75795 10.7031 3.50451 10.7031 3.24853C10.7031 2.99255 10.6523 2.73911 10.5537 2.50289C10.4551 2.26666 10.3107 2.05233 10.1287 1.87231C9.94865 1.69032 9.73432 1.54585 9.49809 1.44725C9.26186 1.34865 9.00842 1.29788 8.75244 1.29788C8.49646 1.29788 8.24303 1.34865 8.0068 1.44725C7.77057 1.54585 7.55624 1.69032 7.37622 1.87231L5.08468 4.16385C4.9027 4.34387 4.75822 4.5582 4.65962 4.79443C4.56102 5.03065 4.51025 5.28409 4.51025 5.54007C4.51025 5.79605 4.56102 6.04949 4.65962 6.28572C4.75822 6.52195 4.9027 6.73627 5.08468 6.91629M6.91532 4.16385C7.16849 3.91068 7.58395 3.91068 7.83713 4.16385C8.44515 4.77278 8.78665 5.59812 8.78665 6.45864C8.78665 7.31915 8.44515 8.14449 7.83713 8.75342L5.5391 11.0515C4.93016 11.6595 4.10482 12.001 3.24431 12.001C2.3838 12.001 1.55845 11.6595 0.949523 11.0515C0.341504 10.4425 4.47785e-09 9.61718 4.07715e-09 8.75667C3.67644e-09 7.89615 0.341504 7.07081 0.949523 6.46188L1.91677 5.49463C1.91028 6.02694 1.99467 6.55926 2.17644 7.07209L1.87133 7.3772C1.68935 7.55722 1.54487 7.77155 1.44627 8.00778C1.34767 8.244 1.2969 8.49744 1.2969 8.75342C1.2969 9.0094 1.34767 9.26284 1.44627 9.49907C1.54487 9.7353 1.68935 9.94962 1.87133 10.1296C2.05135 10.3116 2.26568 10.4561 2.50191 10.5547C2.73814 10.6533 2.99158 10.7041 3.24756 10.7041C3.50354 10.7041 3.75697 10.6533 3.9932 10.5547C4.22943 10.4561 4.44376 10.3116 4.62378 10.1296L6.91532 7.8381C7.0973 7.65808 7.24178 7.44376 7.34038 7.20753C7.43898 6.9713 7.48975 6.71786 7.48975 6.46188C7.48975 6.2059 7.43898 5.95246 7.34038 5.71624C7.24178 5.48001 7.0973 5.26568 6.91532 5.08566C6.85227 5.02658 6.80201 4.9552 6.76766 4.87592C6.7333 4.79664 6.71557 4.71116 6.71557 4.62475C6.71557 4.53835 6.7333 4.45287 6.76766 4.37359C6.80201 4.29431 6.85227 4.22293 6.91532 4.16385V4.16385Z"
          fill={color || "#4158D2"}
        />
      </G>
    </Icon>
  );
}
