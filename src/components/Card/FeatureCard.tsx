import { format } from "date-fns";
import { Heading, Text, HStack, Pressable } from "native-base";
import React from "react";
import { formatUtcToLocalTime } from "../../utils/date";
import ClockIcon from "../Icons/ClockIcon";
import LocationIcon from "../Icons/LocationIcon";
import HighlightCard, { HighlightCardProps } from "./HighlightCard";

export interface FeatureCardProps
  extends Pick<HighlightCardProps, "containerProps"> {
  title: string;
  startTime: Date;
  endTime: Date;
  location: string;
  onPress?: () => void;
}

export default function FeatureCard({
  title,
  startTime,
  endTime,
  location,
  onPress,
  ...otherProps
}: FeatureCardProps) {
  return (
    <Pressable onPress={() => onPress?.()}>
      <HighlightCard {...otherProps}>
        <Heading fontSize="md" color="rs.white">{`${title}`}</Heading>
        <HStack space="2" alignItems="center">
          <Text fontSize="3xl" fontWeight="bold" color="rs.white">
            {`${format(startTime, "d, LLL")} (${format(startTime, "E")})`}
          </Text>
        </HStack>
        <HStack space="3" alignItems="center">
          <ClockIcon color="white" />
          <Text color="rs.white" fontSize="md">
            {`${formatUtcToLocalTime(startTime)} - ${formatUtcToLocalTime(
              endTime
            )}`}
          </Text>
        </HStack>
        <HStack w="92%" space="3" mt="2" alignItems="flex-start">
          <LocationIcon mt="1" color="white" />
          <Text color="rs.white" fontSize="md" numberOfLines={2}>
            {location}
          </Text>
        </HStack>
      </HighlightCard>
    </Pressable>
  );
}
