import React from "react";
import {
  Avatar,
  Badge,
  Box,
  Heading,
  HStack,
  Text,
  VStack,
  Pressable,
  IPressableProps,
} from "native-base";
import { ImageBackground, View } from "react-native";
import CalendarIcon from "../Icons/CalendarIcon";
import LocationIcon from "../Icons/LocationIcon";
import BadgeHeader from "./BadgeHeader";
import { ActivityType } from "../../models/Request";
import { getTranslation } from "../../utils/translation";
import { EventResponse, EventType } from "../../models/responses/Event";
import MoneyIcon from "../Icons/MoneyIcon";
import { formatFileUrl } from "../../services/ServiceUtil";
import TipsIcon from "../Icons/TipsIcon";
import { format24HTo12H } from "../../utils/date";
import { UserType } from "../../models/User";
import ImageDirectory from "../../assets";
import { createRandomString } from "../../utils/strings";
import ClockIcon from "../Icons/ClockIcon";
import { getUserName } from "../../utils/name";
import { SCREEN_WIDTH } from "../../constants/constants";

const t = getTranslation([
  "component.Card.EventCard",
  "constant.district",
  "constant.eventType",
  "constant.button",
]);

export default function EventCard({
  event,
  shouldShowFooter = false,
  onEdit,
  onManage,
  onPress,
  boxProps,
}: {
  event: EventResponse;
  shouldShowFooter?: boolean;
  onManage?: (item: EventResponse) => void;
  onEdit?: (item: EventResponse) => void;
  onPress?: () => void;
  boxProps?: IPressableProps;
}) {
  const textColor =
    event.type === EventType.Competition ? "rs.black" : "rs.white";
  const bg =
    event.type === EventType.Competition
      ? "#66CEE1"
      : event.type === EventType.OpenDay
      ? "#31095E"
      : "#E08700";
  const typeText =
    event.type === EventType.Competition
      ? `${t(event.competitionType)} ${t(event.type)}`
      : `${t(event.type)}`;
  const clubName = event?.club?.name;
  return (
    <Pressable
      flexDirection="row"
      onPress={onPress}
      bgColor="rs.white"
      shadow="9"
      borderRadius="3xl"
      style={{
        shadowOffset: {
          width: 5,
          height: 5,
        },
        shadowOpacity: 0.1,
      }}
      {...boxProps}
    >
      <View
        style={{
          height: "100%",
          width: 14,
          borderTopLeftRadius: 100,
          borderBottomLeftRadius: 100,
          backgroundColor: bg,
        }}
      />
      <VStack p="4" space="4" flex="1">
        {/* Event type - Number of days */}
        <HStack space="2">
          <Badge
            borderColor={bg}
            bg={bg}
            _text={{
              color: textColor,
              fontWeight: "bold",
              fontSize: "sm",
              borderRadius: "full",
            }}
          >
            {typeText}
          </Badge>
          <Badge bgColor="rs.white" borderColor={bg}>
            <Text color={bg} fontWeight={600}>{`${
              event?.eventSessions?.length
            } ${
              event?.eventSessions?.length > 1 ? t("days") : t("Day")
            }`}</Text>
          </Badge>
        </HStack>
        {/* Event name */}
        <Heading fontSize="lg" color="rs.black" zIndex={1}>
          {event.name}
        </Heading>
        {/* Creator info */}
        <HStack alignItems="center">
          <Box
            flexDirection="row"
            bgColor="rs.white"
            borderRadius="3xl"
            justifyContent="flex-start"
          >
            <Avatar
              mr="2"
              size="xs"
              bg="rs.primary_purple"
              source={
                event.creator.profilePicture
                  ? {
                      uri: formatFileUrl(event.creator.profilePicture),
                    }
                  : undefined
              }
            >
              {`${event.creator.firstName.charAt(
                0
              )}${event.creator.lastName.charAt(0)}`}
            </Avatar>

            {event.creator.userType !== UserType.ClubStaff && (
              <Text fontSize="sm">{`${getUserName(event.creator)}`}</Text>
            )}
            {event.creator.userType === UserType.ClubStaff && (
              <Text fontSize="sm">{clubName}</Text>
            )}
          </Box>
        </HStack>
        {/* Date info */}
        {event.eventSessions?.length > 0 && (
          <HStack flex="1" alignItems="center" space="2">
            <CalendarIcon props={{ size: "md", color: "rs.black" }} />
            <Text color="rs.black">
              {`${event.eventSessions[0].date} (${t("Day %{number}", {
                number: 1,
              })}) `}
            </Text>
          </HStack>
        )}
        {/* Time info */}
        {event.eventSessions?.length > 0 && (
          <HStack flex="1" alignItems="center" space="2">
            <ClockIcon size="md" />
            <Text color="rs.black">
              {`${format24HTo12H(event.eventSessions[0].fromTime)} ${t(
                "to"
              )} ${format24HTo12H(event.eventSessions[0].toTime)}`}
            </Text>
          </HStack>
        )}
        {/* Location * price info */}
        <HStack flex="1" alignItems="center" space="2">
          <LocationIcon size="md" />
          <Text color="rs.black" flex="1" numberOfLines={2}>
            {event.eventSessions[0].address || t("Address is missing")}
          </Text>
          {event.fee && (
            <HStack flex="1" alignItems="center" space="2">
              <MoneyIcon props={{ size: "md" }} />
              <Text color="rs.black" flex="1">
                {event.fee} {t("hkd")}
              </Text>
            </HStack>
          )}
        </HStack>
        {/* Manage edit */}
        {shouldShowFooter && (
          <HStack w="100%" space="3">
            <Pressable
              w="100%"
              flex="1"
              onPress={() => {
                onManage?.(event);
              }}
            >
              <Box
                bg={bg}
                h="10"
                flex={1}
                borderRadius={16}
                alignItems="center"
                justifyContent="center"
                fontWeight="bold"
              >
                <Text
                  fontSize="sm"
                  fontWeight="bold"
                  textAlign="center"
                  color="rs.white"
                >
                  {t("Manage")}
                </Text>
              </Box>
            </Pressable>
            <Pressable
              flex="1"
              onPress={() => {
                onEdit?.(event);
              }}
              w="100%"
            >
              <Box
                h="10"
                flex={1}
                borderWidth={0.5}
                borderColor={bg}
                borderRadius={16}
                alignItems="center"
                justifyContent="center"
              >
                <Text
                  fontWeight="bold"
                  fontSize="sm"
                  textAlign="center"
                  color={bg}
                >
                  {t("Edit")}
                </Text>
              </Box>
            </Pressable>
          </HStack>
        )}
      </VStack>
    </Pressable>
  );
}
