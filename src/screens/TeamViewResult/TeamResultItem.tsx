import { HStack, VStack, Text, Pressable } from "native-base";
import React from "react";
import Card from "../../components/Card/Card";
import LocationIcon from "../../components/Icons/LocationIcon";
import {
  DivisionMatchResultResponse,
  Fixture,
  FixtureResponse,
} from "../../models/responses/League";
import {
  format12HTo24H,
  formatDateTimeToTimezone,
  formatUtcToLocalTime,
} from "../../utils/date";
import { isBlank } from "../../utils/strings";
import { getTranslation } from "../../utils/translation";

interface TeamResultItemProps {
  homeTeamName: string;
  awayTeamName: string;
  homeTeamPoint: number;
  awayTeamPoint: number;
  venue: string;
  date: string;
}

const t = getTranslation(["component.FixtureItem", "constant.button"]);

export default function TeamResultItem({
  homeTeamName,
  homeTeamPoint,
  awayTeamName,
  awayTeamPoint,
  venue,
  date,
}: TeamResultItemProps) {
  const isWin = homeTeamPoint > awayTeamPoint;
  const isLose = homeTeamPoint < awayTeamPoint;
  const resultColor = isWin
    ? "rs_secondary.green"
    : isLose
    ? "rs_secondary.error"
    : "#6D6D6D";
  const status = isWin ? t("WIN") : isLose ? t("LOSE") : t("DRAW");
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
            <Text fontSize="md" color="gray.500">
              {date}
            </Text>
            <HStack alignItems="center" justifyContent="space-between">
              <VStack>
                <Text
                  fontWeight="bold"
                  fontSize="md"
                  color="rs.primary_purple"
                  flexWrap="wrap"
                  numberOfLines={3}
                  flex="1"
                >
                  {homeTeamName}
                </Text>
              </VStack>
              <VStack justifyContent="center" alignItems="center" space="2">
                <Text color={resultColor}>{status}</Text>
                <Text
                  fontWeight="bold"
                  fontSize="xl"
                  color={resultColor}
                  flexWrap="wrap"
                  numberOfLines={3}
                  mx="4"
                >
                  {`${homeTeamPoint} - ${awayTeamPoint}`}
                </Text>
              </VStack>
              <VStack>
                <Text
                  fontWeight="bold"
                  fontSize="md"
                  color="rs.primary_purple"
                  flexWrap="wrap"
                  numberOfLines={3}
                  flex="1"
                >
                  {awayTeamName}
                </Text>
              </VStack>
            </HStack>
            <HStack space="1" alignItems="center">
              <LocationIcon />
              <Text fontSize="md" color="gray.500">
                {venue}
              </Text>
            </HStack>
          </VStack>
        }
      />
    </VStack>
  );
}
