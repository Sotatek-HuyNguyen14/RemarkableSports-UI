import { Pressable, Text, VStack, HStack, Avatar, Badge } from "native-base";
import React from "react";
import { formatUtcToLocalDate, formatUtcToLocalTime } from "../../utils/date";
import { getTranslation } from "../../utils/translation";
import CalendarIcon from "../Icons/CalendarIcon";
import ClockIcon from "../Icons/ClockIcon";
import LocationIcon from "../Icons/LocationIcon";
import Card from "./Card";
import { O3Response } from "../../models/responses/O3Response";
import { formatFileUrl } from "../../services/ServiceUtil";
import { formatName, getUserName } from "../../utils/name";

const t = getTranslation(["constant.district", "component.MeetupSmallCard"]);

function MeetupSmallCard({
  meetup,
  onPress,
}: {
  meetup: O3Response;
  onPress?: () => void;
}): JSX.Element {
  const { playerInfo, district, fromTime, endTime } = meetup;
  return (
    <Pressable onPress={onPress}>
      <Card
        onPress={onPress}
        header={
          <VStack alignItems="center" justifyContent="center">
            <Avatar
              size="md"
              source={
                playerInfo.profilePicture
                  ? { uri: formatFileUrl(playerInfo.profilePicture) }
                  : undefined
              }
            >
              {playerInfo.firstName}
            </Avatar>
            <Text fontSize="lg" fontWeight="bold" mt="1">
              {getUserName(playerInfo)}
            </Text>
          </VStack>
        }
        body={
          <VStack alignItems="center" justifyContent="center">
            <VStack space="3" flex="1">
              <HStack space="2" alignItems="center">
                <CalendarIcon />
                <Text fontSize="xs" fontWeight="normal">
                  {`${formatUtcToLocalDate(fromTime)}`}
                </Text>
              </HStack>
              <HStack space="2" alignItems="center">
                <ClockIcon />
                <Text fontSize="xs" fontWeight="normal">
                  {formatUtcToLocalTime(fromTime)}
                  {" - "}
                  {formatUtcToLocalTime(endTime)}
                </Text>
              </HStack>
              <HStack space="2" alignItems="center">
                <LocationIcon />
                <Text fontSize="xs" fontWeight="normal">
                  {`${t(district)}`}
                </Text>
              </HStack>
              {meetup.oneOnOneCoachSuggestion === "Hide" && (
                <Badge
                  bgColor="rs.lightBlue"
                  shadow="9"
                  borderRadius="2xl"
                  ml="2"
                  w="16"
                  style={{
                    shadowOffset: {
                      width: 5,
                      height: 5,
                    },
                    shadowOpacity: 0.1,
                    elevation: 3,
                  }}
                  _text={{
                    color: "rs.white",
                    fontWeight: "semibold",
                    fontSize: "md",
                  }}
                >
                  {t("Hide")}
                </Badge>
              )}
            </VStack>
          </VStack>
        }
      />
    </Pressable>
  );
}

export default MeetupSmallCard;
