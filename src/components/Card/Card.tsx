import React, { ReactNode } from "react";
import { HStack, VStack, Avatar, Pressable } from "native-base";
import { InterfaceAvatarProps } from "native-base/lib/typescript/components/composites/Avatar/types";
import { InterfaceHStackProps } from "native-base/lib/typescript/components/primitives/Stack/HStack";

export interface CardProps {
  header?: ReactNode;
  body?: ReactNode;
  footer?: ReactNode;
  containerProps?: InterfaceHStackProps;
  iconProps?: InterfaceAvatarProps;
  iconLabel?: string;
  onPress?: () => void;
}

export default function Card({
  header,
  body,
  footer,
  containerProps,
  iconProps,
  iconLabel,
  onPress,
}: CardProps) {
  const isPressingDisabled = onPress === undefined;
  return (
    <Pressable
      disabled={isPressingDisabled}
      onPress={onPress}
      bgColor="rs.white"
      p="4"
      space="5"
      shadow="9"
      borderRadius="3xl"
      style={{
        shadowOffset: {
          width: 5,
          height: 5,
        },
        shadowOpacity: 0.1,
      }}
      {...containerProps}
    >
      {iconProps && iconLabel && (
        <Avatar size="md" {...iconProps}>
          {iconLabel}
        </Avatar>
      )}
      <VStack space="4" flex="1">
        {header}
        {body}
        {footer}
      </VStack>
    </Pressable>
  );
}
