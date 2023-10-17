import React from "react";
import { Heading, HStack, Text, Avatar, VStack, Badge } from "native-base";
import { Coach, Player, UserType } from "../../models/User";
import { getTranslation } from "../../utils/translation";

import { formatFileUrl } from "../../services/ServiceUtil";
import { formatName, getUserName } from "../../utils/name";
import LineBreak from "../LineBreak/LineBreak";

const t = getTranslation([
  "component.Card.ContactsCard",
  "constant.district",
  "constant.profile",
  "constant.button",
]);

export default function ContactsCard({
  player,
  times,
}: {
  player: Player;
  times: number;
}) {
  const { firstName, lastName, profilePicture, dateOfBirth } = player;

  const age = new Date().getFullYear() - dateOfBirth.getFullYear();

  const badgeItem = (label: string) => {
    return (
      <Badge
        key={`badge_${label}_coach_${player.id}`}
        borderColor="#31095E"
        variant="outline"
        bg="rs.white"
        _text={{ color: "#31095E", fontSize: 14 }}
        m={1}
        p="1"
        px="2"
        borderRadius="xl"
      >
        {label}
      </Badge>
    );
  };

  return (
    <VStack space={4}>
      <HStack space={4}>
        <Avatar
          size="41"
          mt="1"
          source={
            profilePicture
              ? {
                  uri: formatFileUrl(profilePicture),
                }
              : undefined
          }
        >
          {`${firstName.charAt(0)}${lastName.charAt(0)}`}
        </Avatar>
        <VStack>
          <Heading>{getUserName(player)}</Heading>
          <Text fontSize="12">
            {t("Matched for %{times} times", { times: times ?? 0 })}
          </Text>
          <HStack mt="2">
            {[
              `${t("Age")} ${age}`,
              player.handUsed ? t(player.handUsed) : "-",
              player.blade ? t(player.blade) : "-",
            ]
              .filter((label) => label !== "-")
              .map((label) => {
                return badgeItem(label);
              })}
          </HStack>
        </VStack>
      </HStack>
      <LineBreak />
    </VStack>
  );
}
