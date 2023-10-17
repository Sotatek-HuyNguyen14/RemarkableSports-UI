import { HStack, VStack, Text, Heading } from "native-base";
import React from "react";
import { formatUtcToLocalDate, formatUtcToLocalTime } from "../../utils/date";
import { getTranslation } from "../../utils/translation";
import CalendarIcon from "../Icons/CalendarIcon";
import ClockIcon from "../Icons/ClockIcon";
import ExclaimationIcon from "../Icons/ExclaimationIcon";
import LocationIcon from "../Icons/LocationIcon";
import MoneyIcon from "../Icons/MoneyIcon";

export interface O3DetailsProps {
  fromTime: Date;
  toTime: Date;
  fee: number;
  venue?: string;
}

const t = getTranslation("component.O3Details");

export default function O3Details({
  fromTime,
  toTime,
  fee,
  venue,
}: O3DetailsProps) {
  return (
    <VStack flex="1" space="3">
      <Heading>{t("Meet up details")}</Heading>
      <HStack space="3">
        <HStack space="2" alignItems="center">
          <CalendarIcon />
          <Text fontSize="sm" fontWeight="normal">
            {`${formatUtcToLocalDate(fromTime)}`}
          </Text>
        </HStack>
        <HStack space="2" alignItems="center">
          <ClockIcon />
          <Text fontSize="sm" fontWeight="normal">
            {formatUtcToLocalTime(fromTime)}
            {" - "}
            {formatUtcToLocalTime(toTime)}
          </Text>
        </HStack>
      </HStack>

      <HStack space="2" alignItems="center">
        <MoneyIcon />
        <Text fontSize="sm" fontWeight="normal">
          {`${fee} ${t("hkd/person")}`}
        </Text>
      </HStack>

      {venue ? (
        <HStack space="2" alignItems="center">
          <LocationIcon />
          <Text fontSize="sm" fontWeight="normal">
            {`${venue}`}
          </Text>
        </HStack>
      ) : (
        <HStack space="2" alignItems="center">
          <ExclaimationIcon />
          <Text color="rs_secondary.orange" fontSize="sm" fontWeight="normal">
            {`${t("Venue is missing")}`}
          </Text>
        </HStack>
      )}
    </VStack>
  );
}
