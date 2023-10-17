import React from "react";
import { HStack, Text, Pressable, VStack, Box, useTheme } from "native-base";

import {
  OneOnOneCoachsModel,
  OneOnOneStatus,
} from "../../models/responses/O3Response";
import ClockIcon from "../Icons/ClockIcon";

import LocationIcon from "../Icons/LocationIcon";
import { formatUtcToLocalDate, formatUtcToLocalTime } from "../../utils/date";
import { getTranslation } from "../../utils/translation";
import { DaysOfWeek } from "../../models/Response";

const t = getTranslation([
  "component.meetupCard",
  "constant.button",
  "constant.district",
]);

export default function RecordCrad({
  oneOnOneCoach,
  onPress,
}: {
  oneOnOneCoach: OneOnOneCoachsModel;
  onPress: () => void;
}) {
  const { fromTime, endTime, status } = oneOnOneCoach;
  const { colors } = useTheme();

  const localWeek = [
    DaysOfWeek.Sunday,
    DaysOfWeek.Monday,
    DaysOfWeek.Tuesday,
    DaysOfWeek.Wednesday,
    DaysOfWeek.Thursday,
    DaysOfWeek.Friday,
    DaysOfWeek.Saturday,
  ];

  let statusColor = colors.rs_secondary.green;
  switch (status) {
    case OneOnOneStatus.Cancelled:
    case OneOnOneStatus.LateCancelled:
      statusColor = "#959595";
      break;
    case OneOnOneStatus.Completed:
      statusColor = colors.rs.GPP_lightBlue;
      break;
    case OneOnOneStatus.Rejected:
      statusColor = colors.rs_secondary.error;
      break;
    default:
      break;
  }

  return (
    <Pressable
      _pressed={{ opacity: 0.5 }}
      key={oneOnOneCoach.id}
      onPress={() => onPress()}
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
      <HStack
        space="5"
        p="4"
        borderRadius="2xl"
        bgColor="rs.white"
        justifyContent="space-between"
      >
        <VStack space="3">
          {fromTime && (
            <HStack space="3" alignItems="center" pl="2">
              <Box>
                <Text fontWeight="bold">
                  {`${formatUtcToLocalDate(fromTime)} (${t(
                    localWeek[fromTime.getDay() || 0].slice(0, 3).toUpperCase()
                  )})`}
                </Text>
              </Box>
            </HStack>
          )}
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
          {oneOnOneCoach.venue && (
            <HStack space="3" alignItems="center">
              <Box w="8" alignItems="center" justifyContent="center">
                <LocationIcon />
              </Box>
              <Text fontSize="xs" fontWeight="normal">
                {oneOnOneCoach.venue}
              </Text>
            </HStack>
          )}
        </VStack>
        <HStack alignItems="center">
          {oneOnOneCoach.status !== OneOnOneStatus.NoShow && (
            <Text fontWeight="bold" textAlign="center" color={statusColor}>
              {t(oneOnOneCoach.status)}
            </Text>
          )}
        </HStack>
      </HStack>
    </Pressable>
  );
}
