import {
  Text,
  Box,
  Heading,
  HStack,
  VStack,
  QuestionIcon,
  Badge,
} from "native-base";
import React from "react";
import { AppliedCoach, O3Response } from "../../models/responses/O3Response";
import { formatUtcToLocalDate, formatUtcToLocalTime } from "../../utils/date";
import { getTranslation } from "../../utils/translation";
import CalendarIcon from "../Icons/CalendarIcon";
import ClockIcon from "../Icons/ClockIcon";
import LocationIcon from "../Icons/LocationIcon";
import MoneyIcon from "../Icons/MoneyIcon";

export interface MeetupDetailsProps {
  meetup: O3Response;
  appliedCoach: AppliedCoach;
}

const t = getTranslation("component.MeetupDetails");

export default function MeetupDetails({
  meetup,
  appliedCoach,
}: MeetupDetailsProps) {
  const venue = appliedCoach.venue || meetup.venue;
  return (
    <VStack space={3}>
      <Heading>{t("Meet up details")}</Heading>

      <HStack alignItems="center" space="6">
        <HStack alignItems="center" space="2">
          <Box>
            <CalendarIcon />
          </Box>
          <Text>{formatUtcToLocalDate(meetup.fromTime)}</Text>
        </HStack>
        <HStack alignItems="center" space="2">
          <Box>
            <ClockIcon />
          </Box>
          <Text>
            {`${formatUtcToLocalTime(meetup.fromTime)} - ${formatUtcToLocalTime(
              meetup.endTime
            )}`}
          </Text>
        </HStack>
      </HStack>
      <HStack flex="1" alignItems="center" space="2">
        <MoneyIcon />
        <Text>
          {appliedCoach.fee} {t("hkd/hr")}
        </Text>
      </HStack>
      {venue ? (
        <HStack flex="1" alignItems="center" space="2">
          <LocationIcon />
          <Text>{venue}</Text>
        </HStack>
      ) : (
        <HStack flex="1" alignItems="center" space="2">
          <QuestionIcon />
          <Text>{t("Venue is missing")}</Text>
        </HStack>
      )}
    </VStack>
  );
}
