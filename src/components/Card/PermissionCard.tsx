import React, { ReactNode } from "react";
import { Avatar, HStack, Text, VStack } from "native-base";
import Card from "./Card";
import { User } from "../../models/User";
import { formatName, getUserName } from "../../utils/name";
import { formatFileUrl } from "../../services/ServiceUtil";

export default function PermissionCard({
  user,
  footer,
}: {
  user: User;
  footer?: ReactNode;
}) {
  return (
    <Card
      body={
        <HStack flexWrap="wrap" space={2} alignItems="center">
          <Avatar
            source={
              user.profilePicture
                ? {
                    uri: formatFileUrl(user.profilePicture),
                  }
                : undefined
            }
          >
            {user.firstName}
          </Avatar>
          <VStack space={3}>
            <Text fontWeight="bold" numberOfLines={1} isTruncated>
              {getUserName(user)}
            </Text>
          </VStack>
        </HStack>
      }
      footer={footer}
    />
  );
}
