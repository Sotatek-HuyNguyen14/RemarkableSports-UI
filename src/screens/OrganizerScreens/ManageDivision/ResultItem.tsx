import { HStack, VStack, Text, Pressable } from "native-base";
import React from "react";
import Card from "../../../components/Card/Card";
import LocationIcon from "../../../components/Icons/LocationIcon";
import { Fixture, FixtureResponse } from "../../../models/responses/League";
import {
  format12HTo24H,
  formatDateTimeToTimezone,
  formatUtcToLocalTime,
} from "../../../utils/date";
import { isBlank } from "../../../utils/strings";
import { getTranslation } from "../../../utils/translation";

interface ResultItemProps {
  fixture: FixtureResponse;
  onPressEdit?: () => void;
  header?: string;
}

const t = getTranslation(["component.FixtureItem", "constant.button"]);

export default function ResultItem({
  fixture,
  header,
  onPressEdit,
}: ResultItemProps) {
  const time = new Date(`${fixture.date}T${fixture.time}Z`);
  return (
    <VStack space="2">
      <Card
        body={
          <VStack
            space="4"
            p="4"
            justifyContent="center"
            alignItems="center"
            flex="1"
          >
            {header && !isBlank(header) && (
              <Text fontSize="md" color="gray.500">
                {header}
              </Text>
            )}
            <Text fontSize="md" color="gray.500">
              {fixture.date}
            </Text>
            <HStack alignItems="center" justifyContent="space-between">
              <Text
                fontWeight="bold"
                fontSize="md"
                color="rs.primary_purple"
                flexWrap="wrap"
                numberOfLines={3}
                flex="1"
              >
                {fixture.homeTeam.name}
              </Text>
              <Text
                fontWeight="bold"
                fontSize="xl"
                color="gray.800"
                flexWrap="wrap"
                numberOfLines={3}
                mx="4"
              >
                {format12HTo24H(formatUtcToLocalTime(time))}
              </Text>
              <Text
                fontWeight="bold"
                fontSize="md"
                color="rs.primary_purple"
                flexWrap="wrap"
                numberOfLines={3}
                flex="1"
              >
                {fixture.awayTeam.name}
              </Text>
            </HStack>
            <HStack space="1" alignItems="center">
              <LocationIcon />
              <Text fontSize="md" color="gray.500">
                {fixture.venue}
              </Text>
            </HStack>
          </VStack>
        }
      />
    </VStack>
  );
}
