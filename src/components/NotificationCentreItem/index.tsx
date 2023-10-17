import React from "react";
import { Heading, HStack, Pressable, Text, VStack } from "native-base";
import { timeSince } from "../../utils/date";
import NotificationIcon from "./NotificationIcon";
import { NotificationType } from "../../models/requests/Notification";

export interface NotificationCentreItemProps {
  type: NotificationType;
  title: string;
  body?: string;
  createdAt: Date;
  readAt?: Date;
  onPress?: () => void;
}
export default function NotificationCentreItem({
  type,
  title,
  body,
  onPress,
  createdAt,
  readAt,
}: NotificationCentreItemProps) {
  return (
    <Pressable
      onPress={() => {
        if (onPress) {
          onPress();
        }
      }}
    >
      <HStack
        alignItems="flex-start"
        justifyContent="center"
        mx="defaultLayoutSpacing"
        alignSelf="center"
      >
        {!readAt && (
          <HStack
            w="2"
            h="2"
            borderRadius="full"
            bg="rs_secondary.error"
            alignSelf="center"
            mr="2"
          />
        )}
        <NotificationIcon type={type} />
        <VStack flex={1} space="2" mt="1">
          <HStack space="2" justifyContent="space-between">
            <Heading flex={1} numberOfLines={1}>
              {title}
            </Heading>
            <Text color="gray.600">{timeSince(createdAt)}</Text>
          </HStack>
          {body && <Text numberOfLines={3}>{body}</Text>}
        </VStack>
      </HStack>
    </Pressable>
  );
}
