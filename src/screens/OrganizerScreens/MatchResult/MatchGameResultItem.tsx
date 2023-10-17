import { HStack, VStack, Text, Pressable } from "native-base";
import React from "react";
import Card from "../../../components/Card/Card";
import LocationIcon from "../../../components/Icons/LocationIcon";
import {
  Fixture,
  FixtureResponse,
  MatchGameResult,
} from "../../../models/responses/League";
import {
  format12HTo24H,
  formatDateTimeToTimezone,
  formatUtcToLocalTime,
} from "../../../utils/date";
import { isBlank } from "../../../utils/strings";
import { getTranslation } from "../../../utils/translation";

interface MatchGameResultItemProps {
  game: MatchGameResult;
  gameIndex?: number;
  isPlayerFromHomeTeam: boolean;
  isPlayerFromAwayTeam: boolean;
}

const t = getTranslation("component.MatchGameResultItem");

export default function MatchGameResultItem({
  game,
  gameIndex,
  isPlayerFromAwayTeam,
  isPlayerFromHomeTeam,
}: MatchGameResultItemProps) {
  const totalHomePoint = game.homeSetResult;
  const totalAwayPoint = game.awaySetResult;
  const isWin = isPlayerFromHomeTeam
    ? totalHomePoint > totalAwayPoint
    : totalHomePoint < totalAwayPoint;
  const isLose = isPlayerFromHomeTeam
    ? totalHomePoint < totalAwayPoint
    : totalHomePoint > totalAwayPoint;
  const resultColor = isWin
    ? "rs_secondary.green"
    : isLose
    ? "rs_secondary.error"
    : "rs.black";
  const leftColor = isPlayerFromHomeTeam ? resultColor : "rs.black";
  const rightColor = isPlayerFromAwayTeam ? resultColor : "rs.black";
  const setResultsString = game.setResults
    .map((result) => `${result.homePlayerScore}-${result.awayPlayerScore}`)
    .join(" ");
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
            {gameIndex && (
              <Text fontSize="md" color="gray.500">
                {`${t("Game")} ${gameIndex}`}
              </Text>
            )}
            <HStack alignItems="center" justifyContent="space-between" w="100%">
              <VStack flex={0.45}>
                <Text
                  fontWeight="bold"
                  fontSize="md"
                  color="rs.primary_purple"
                  flexWrap="wrap"
                  numberOfLines={3}
                  textAlign="center"
                >
                  {game.homePlayerName}
                </Text>
              </VStack>
              <HStack space="2">
                <Text
                  fontWeight="bold"
                  fontSize="xl"
                  color={
                    isPlayerFromAwayTeam || isPlayerFromHomeTeam
                      ? leftColor
                      : "rs.black"
                  }
                  flexWrap="wrap"
                  numberOfLines={3}
                  textAlign="center"
                >
                  {`${game.homeSetResult}`}
                </Text>
                <Text
                  fontWeight="bold"
                  fontSize="xl"
                  color="gray.800"
                  flexWrap="wrap"
                  numberOfLines={3}
                >
                  -
                </Text>
                <Text
                  fontWeight="bold"
                  fontSize="xl"
                  color={
                    isPlayerFromAwayTeam || isPlayerFromHomeTeam
                      ? rightColor
                      : "rs.black"
                  }
                  flexWrap="wrap"
                  numberOfLines={3}
                  textAlign="center"
                >
                  {`${game.awaySetResult}`}
                </Text>
              </HStack>
              <VStack flex={0.45}>
                <Text
                  fontWeight="bold"
                  fontSize="md"
                  color="rs.primary_purple"
                  flexWrap="wrap"
                  numberOfLines={3}
                  textAlign="center"
                >
                  {game.awayPlayerName}
                </Text>
              </VStack>
            </HStack>
            <HStack space="1" alignItems="center">
              <Text fontSize="md" color="gray.500">
                {setResultsString}
              </Text>
            </HStack>
          </VStack>
        }
      />
    </VStack>
  );
}
