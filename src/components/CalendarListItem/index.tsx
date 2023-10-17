import { Heading, HStack, Text, VStack, IStackProps, Box } from "native-base";
import React from "react";
import { CalendarResponse } from "../../models/responses/Calendar";
import { formatUtcToLocalDate, formatUtcToLocalTime } from "../../utils/date";
import BadgeHeader from "../Card/BadgeHeader";
import ClockIcon from "../Icons/ClockIcon";
import LocationIcon from "../Icons/LocationIcon";
import { getTranslation } from "../../utils/translation";
import CalendarIcon from "../Icons/CalendarIcon";
import { ActivityType } from "../../models/Request";

interface CalendarListProps {
  data: CalendarResponse;
  isShowDate?: boolean;
  stackProps?: IStackProps;
}

const t = getTranslation(["constant.district", "component.CalenderListItem"]);

export default function CalendarListItem({
  data,
  isShowDate,
  stackProps,
}: CalendarListProps) {
  return (
    <VStack
      key={data.name}
      borderLeftColor="rs.primary_purple"
      borderLeftWidth="4"
      ml="defaultLayoutSpacing"
      px="4"
      space="2"
      {...stackProps}
    >
      <BadgeHeader type={data.meetupType} badgeText={t(data.meetupType)} />
      <Heading numberOfLines={2}>{data.name}</Heading>
      {isShowDate && (
        <HStack alignItems="center" space="2">
          <Box>
            <CalendarIcon />
          </Box>
          <Text>{formatUtcToLocalDate(data.startTime)}</Text>
        </HStack>
      )}
      <HStack alignItems="center" space="2">
        <ClockIcon />
        {data.meetupType !== ActivityType.Fixture && (
          <Text>
            {formatUtcToLocalTime(data.startTime)} -{" "}
            {formatUtcToLocalTime(data.endTime)}
          </Text>
        )}
        {data.meetupType === ActivityType.Fixture && (
          <Text>{formatUtcToLocalTime(data.startTime)}</Text>
        )}
      </HStack>
      <HStack alignItems="center" space="2">
        <LocationIcon />
        <Text>{data.location}</Text>
      </HStack>
    </VStack>
  );
}
