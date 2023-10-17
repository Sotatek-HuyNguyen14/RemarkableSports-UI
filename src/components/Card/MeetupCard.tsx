import React from "react";
import {
  Heading,
  HStack,
  Text,
  Pressable,
  VStack,
  IStackProps,
  Avatar,
  Badge,
  View,
  Box,
  QuestionIcon,
} from "native-base";

import { O3Response } from "../../models/responses/O3Response";
import ClockIcon from "../Icons/ClockIcon";
import CalendarIcon from "../Icons/CalendarIcon";
import { formatName, getUserName } from "../../utils/name";
import { formatFileUrl } from "../../services/ServiceUtil";
import LocationIcon from "../Icons/LocationIcon";
import { formatUtcToLocalDate, formatUtcToLocalTime } from "../../utils/date";
import { getTranslation } from "../../utils/translation";
import { useAuth } from "../../hooks/UseAuth";
import { UserType } from "../../models/User";
import { SCREEN_WIDTH } from "../../constants/constants";

const t = getTranslation([
  "component.meetupCard",
  "constant.button",
  "constant.district",
  "screen.PlayerScreens.O3AppliedCoach",
]);

export default function MeetupCard({
  meetup,
  onPress,
}: {
  meetup: O3Response;
  onPress?: () => void;
}) {
  const { playerInfo, district, fromTime, endTime } = meetup;
  const { profilePicture, firstName, lastName } = playerInfo;
  const isRecommendedByAI = meetup?.isByAI;
  const { user } = useAuth();
  const isMeetupAvailable =
    user?.userType === UserType.Coach
      ? !meetup.pickedCoachId ||
        (meetup.pickedCoachId && meetup.pickedCoachId === user?.id)
      : true;

  const meetupContent = () => {
    return (
      <VStack
        px="4"
        pb="4"
        borderRadius={isMeetupAvailable ? "3xl" : "0"}
        borderBottomRadius="3xl"
        bg={isMeetupAvailable ? "rs.white" : "#00000033"}
        bgColor={isMeetupAvailable ? "rs.white" : "#00000033"}
        overflow="hidden"
      >
        {isRecommendedByAI && (
          <View
            zIndex={1}
            style={{
              position: "absolute",
              right: -100,
              width: 300,
              top: 20,
              backgroundColor: "#66CEE1",
              paddingVertical: 10,
              paddingHorizontal: 20,
              justifyContent: "center",
              overflow: "hidden",
              transform: [
                {
                  rotate: "45deg",
                },
              ],
            }}
          >
            <Text
              ml="3"
              alignSelf="center"
              flex="1"
              style={{ fontSize: 10 }}
              fontWeight="bold"
            >
              {t("Recommended by AI")}
            </Text>
          </View>
        )}
        <VStack space="3" paddingTop="5">
          <HStack alignItems="center" space="3">
            <Avatar
              size="sm"
              source={
                profilePicture
                  ? { uri: formatFileUrl(profilePicture) }
                  : undefined
              }
            >
              {firstName}
            </Avatar>
            <Heading>{getUserName(playerInfo)}</Heading>
          </HStack>
          <HStack space="3" alignItems="center">
            <Box w="8" alignItems="center" justifyContent="center">
              <CalendarIcon />
            </Box>
            <Box flex={1}>
              <Text fontSize="xs" fontWeight="normal">
                {`${formatUtcToLocalDate(fromTime)}`}
              </Text>
            </Box>
          </HStack>
          <HStack space="3" alignItems="center">
            <Box w="8" alignItems="center" justifyContent="center">
              <ClockIcon />
            </Box>
            <Text fontSize="xs" fontWeight="normal">
              {formatUtcToLocalTime(fromTime)}
              {" - "}
              {formatUtcToLocalTime(endTime)}
            </Text>
          </HStack>
          {meetup.venue && (
            <HStack space="3" alignItems="center">
              <Box w="8" alignItems="center" justifyContent="center">
                <LocationIcon />
              </Box>
              <Text fontSize="xs" fontWeight="normal">
                {meetup.venue}
              </Text>
            </HStack>
          )}
          {!meetup.venue && (
            <HStack space="3" alignItems="center">
              <Box w="8" alignItems="center" justifyContent="center">
                <QuestionIcon />
              </Box>
              <Text>{t("Venue is missing")}</Text>
            </HStack>
          )}
        </VStack>
      </VStack>
    );
  };

  if (!isMeetupAvailable) {
    return (
      <VStack borderBottomRadius="2xl">
        <View
          style={{
            height: 45,
            width: "100%",
            backgroundColor: "#BCBCBC",
            paddingHorizontal: 16,
            paddingVertical: 10,
            borderTopLeftRadius: 22,
            borderTopRightRadius: 22,
            justifyContent: "center",
          }}
        >
          <Text style={{ fontSize: 18 }} fontWeight="bold" color="#616161">
            {t("Not Available")}
          </Text>
        </View>
        <VStack>{meetupContent()}</VStack>
      </VStack>
    );
  }

  return (
    <Pressable
      _pressed={{ opacity: 0.5 }}
      key={meetup.id}
      onPress={() => onPress?.()}
      shadow="9"
      borderRadius="3xl"
      style={{
        shadowOffset: {
          width: 5,
          height: 5,
        },
        shadowOpacity: 0.1,
      }}
    >
      {meetupContent()}
    </Pressable>
  );
}
