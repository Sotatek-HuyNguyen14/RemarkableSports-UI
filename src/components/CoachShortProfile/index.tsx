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
import { useNavigation } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { getTranslation } from "../../utils/translation";
import { formatFileUrl } from "../../services/ServiceUtil";
import { Coach, UserType } from "../../models/User";
import { MainStackNavigatorParamList } from "../../routers/Types";
import { formatName, getUserName } from "../../utils/name";
import { isBlank } from "../../utils/strings";

export interface CoachShortProfileProps {
  coach: Coach;
  heading?: string;
  shouldShowViewProfile?: boolean;
  shouldShowHeading?: boolean;
}

const t = getTranslation([
  "component.CoachShortProfile",
  "constant.district",
  "constant.profile",
]);

export default function CoachShortProfile({
  coach,
  heading,
  shouldShowHeading = true,
  shouldShowViewProfile = true,
}: CoachShortProfileProps) {
  const navigation =
    useNavigation<NativeStackNavigationProp<MainStackNavigatorParamList>>();
  const { firstName, lastName, ranking, profilePicture, districts } = coach;
  const districtText = districts
    .map((district) => t(district).trim())
    .join(" | ");

  const yearsAsCoach = new Date().getFullYear() - coach.startYearAsCoach;
  const coachExperience = yearsAsCoach.toString();

  const badgeItem = (label: string) => {
    return (
      <Badge
        key={`badge_${label}_coach_${coach.id}`}
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
        {shouldShowHeading && <Heading>{`${heading ?? t("Coach")}`}</Heading>}
        {shouldShowViewProfile && (
          <Pressable
            onPress={() =>
              navigation.navigate("UserProfileViewer", {
                user: {
                  ...coach,
                  userType: UserType.Coach,
                },
              })
            }
          >
            <Text fontSize="md" color="rs.primary_purple" fontWeight="bold">
              {t("View Profile")}
            </Text>
          </Pressable>
        )}
      </HStack>
      <HStack space="3" alignItems="flex-start">
        <Avatar
          size="md"
          source={
            profilePicture ? { uri: formatFileUrl(profilePicture) } : undefined
          }
        >
          {firstName}
        </Avatar>
        <VStack space="2" flex="1">
          <Heading>{getUserName(coach)}</Heading>
          <Text>{`${t("Coached for")} ${coachExperience} ${t("years")}`}</Text>
          <HStack>
            {[
              coach.coachLevel ? t(coach.coachLevel) : "-",
              coach.ranking ? `${t("Rank")} ${coach.ranking}` : "-",
              coach.style ? t(coach.style) : "-",
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
