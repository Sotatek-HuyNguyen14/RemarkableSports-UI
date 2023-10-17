import React from "react";
import {
  Heading,
  VStack,
  HStack,
  Text,
  Badge,
  Avatar,
  Pressable,
} from "native-base";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { useNavigation } from "@react-navigation/native";
import { getTranslation } from "../../utils/translation";
import { formatFileUrl } from "../../services/ServiceUtil";
import { Player, UserType } from "../../models/User";
import { MainStackNavigatorParamList } from "../../routers/Types";
import { formatName, getUserName } from "../../utils/name";

export interface PlayerShortProfileProps {
  player: Player;
  heading?: string;
  times?: string;
}

const t = getTranslation([
  "component.PlayerShortProfile",
  "constant.district",
  "constant.profile",
]);

export default function PlayerShortProfile({
  player,
  heading,
  times,
}: PlayerShortProfileProps) {
  const navigation =
    useNavigation<NativeStackNavigationProp<MainStackNavigatorParamList>>();

  const { firstName, lastName, profilePicture, handUsed, dateOfBirth } = player;
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
        minWidth="10"
        borderRadius="full"
      >
        {label}
      </Badge>
    );
  };

  return (
    <VStack space="4">
      <HStack justifyContent="space-between">
        <Heading>{`${heading || t("Player")}`}</Heading>
        <Pressable
          onPress={() =>
            navigation.navigate("UserProfileViewer", {
              user: {
                ...player,
                userType: UserType.Player,
              },
            })
          }
        >
          <Text fontSize="md" color="rs.primary_purple" fontWeight="bold">
            {t("View Profile")}
          </Text>
        </Pressable>
      </HStack>

      <HStack space="3" alignItems="flex-start">
        <Avatar
          size="sm"
          source={
            profilePicture ? { uri: formatFileUrl(profilePicture) } : undefined
          }
        >
          {firstName}
        </Avatar>

        <VStack space="2" flex="1">
          <HStack space="2" alignItems="center">
            <Heading>{getUserName(player)}</Heading>
          </HStack>
          {times ? (
            <Text fontSize="sm">
              {t("Matched for %{times} times", { times })}
            </Text>
          ) : null}
          <HStack>
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
    </VStack>
  );
}
