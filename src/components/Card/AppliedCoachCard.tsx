import React from "react";
import {
  Heading,
  HStack,
  Text,
  Button,
  Avatar,
  Box,
  QuestionIcon,
  VStack,
  Badge,
} from "native-base";
import { Coach, UserType } from "../../models/User";
import MoneyIcon from "../Icons/MoneyIcon";
import Card from "./Card";
import LocationIcon from "../Icons/LocationIcon";
import { getTranslation } from "../../utils/translation";
import CalendarIcon from "../Icons/CalendarIcon";
import ClockIcon from "../Icons/ClockIcon";
import {
  formatUtcToLocalDate,
  formatUtcToLocalTime,
  getAge,
} from "../../utils/date";
import { formatFileUrl } from "../../services/ServiceUtil";
import { formatName, getUserName } from "../../utils/name";

const t = getTranslation([
  "component.Card.AppliedCoachCard",
  "component.CoachShortProfile",
  "constant.district",
  "constant.profile",
  "constant.button",
]);

export default function AppliedCoachCard({
  fromTime,
  toTime,
  location,
  coach,
  fee,
  isShowLocation,
  isNotInterested,
  onConfirmButtonPress,
  onDetailsButtonPress,
}: {
  fromTime: Date;
  toTime: Date;
  location?: string;
  coach: Coach;
  fee?: number;
  isNotInterested?: boolean;
  isShowLocation?: boolean;
  onConfirmButtonPress?: () => void;
  onDetailsButtonPress?: () => void;
}) {
  const { firstName, lastName, profilePicture } = coach;

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
        borderRadius="xl"
      >
        {label}
      </Badge>
    );
  };

  return (
    <Card
      body={
        <VStack space={2}>
          <HStack alignItems="center" space="2">
            <Avatar
              size="sm"
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
            <Heading>{getUserName(coach)}</Heading>
          </HStack>
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
      }
      footer={
        onConfirmButtonPress &&
        onDetailsButtonPress && (
          <HStack space="2">
            <Button flex="1" size="sm" onPress={onConfirmButtonPress}>
              {t("Confirm")}
            </Button>
            <Button variant="outline" size="sm" onPress={onDetailsButtonPress}>
              {t("Details")}
            </Button>
          </HStack>
        )
      }
    />
  );
}
