import React, { PropsWithChildren } from "react";
import { Circle, Pressable, Text } from "native-base";
import { IPressableProps } from "native-base/lib/typescript/components/primitives/Pressable/types";
import { InterfaceTextProps } from "native-base/lib/typescript/components/primitives/Text/types";

interface Props {
  label?: string;
  textProps?: InterfaceTextProps;
  onPress?: () => void;
  bgColor?: string;
}

export default function TabNavigatorIcon({
  label,
  onPress,
  textProps,
  children,
  bgColor,
  ...otherProps
}: PropsWithChildren<Props> & IPressableProps) {
  return (
    <Pressable
      justifyContent="center"
      alignItems="center"
      onPress={onPress}
      {...otherProps}
    >
      <Circle bgColor={bgColor ?? "rs.lightGrey"} h="58" w="58">
        {children}
      </Circle>
      <Text {...textProps}>{label}</Text>
    </Pressable>
  );
}
