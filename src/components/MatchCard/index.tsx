import { VStack, Text, HStack, Button } from "native-base";
import React, { useEffect, useRef, useState } from "react";
import { DivisionMatchResultResponse } from "../../models/responses/League";
import LocationIcon from "../Icons/LocationIcon";
import Card from "../Card/Card";
import { getTranslation } from "../../utils/translation";

const t = getTranslation(["component.MatchCard"]);

export default function MatchCard({
  matchResult,
  isShowApproval,
  onPress,
  onCardPress,
  isPlayerFromAwayTeam,
}: {
  matchResult: DivisionMatchResultResponse;
  isShowApproval?: boolean;
  onPress?: () => void;
  onCardPress?: () => void;
  isPlayerFromAwayTeam?: boolean;
}) {
  const {
    fixture,
    homeTotalPoints,
    homeAdditionalPoint,
    homePlayerPoint,
    awayTotalPoints,
    awayAdditionalPoint,
    awayPlayerPoint,
    gameResults,
    id,
  } = matchResult;

  const isPlayerFromHomeTeam = !isPlayerFromAwayTeam;

  const totalHomePoint =
    homeTotalPoints + homeAdditionalPoint + homePlayerPoint;
  const totalAwayPoint =
    awayTotalPoints + awayAdditionalPoint + awayPlayerPoint;
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
    : "#6D6D6D";
  const status = isWin ? t("WIN") : isLose ? t("LOSE") : t("DRAW");
  const numberOfSetHomeTeamWin = gameResults?.filter(
    (match) => match.homeSetResult > match.awaySetResult
  ).length;
  const numberOfSetAwayTeamWin = gameResults?.filter(
    (match) => match.homeSetResult < match.awaySetResult
  ).length;

  return (
    <VStack space="2" mt="4" key={id}>
      <Card
        onPress={onCardPress}
        body={
          <VStack p="4" justifyContent="center" alignItems="center" flex="1">
            {/* Date */}
            <Text fontSize="md">{fixture.date}</Text>
            {/* Score */}
            <HStack
              alignItems="center"
              space="2"
              justifyContent="space-between"
            >
              <Text
                fontWeight="bold"
                fontSize="md"
                color="rs.primary_purple"
                flexWrap="wrap"
                numberOfLines={3}
                flex="1"
                textAlign="center"
              >
                {fixture.homeTeam.name}
              </Text>
              <VStack justifyContent="center" alignItems="center">
                <Text fontWeight="bold" fontSize={12} color={resultColor}>
                  {status}
                </Text>
                <HStack space="2">
                  <Text
                    fontWeight="bold"
                    fontSize="24"
                    color={
                      homeTotalPoints + homeAdditionalPoint + homePlayerPoint >=
                      awayPlayerPoint + awayAdditionalPoint + awayTotalPoints
                        ? "rs_secondary.green"
                        : "rs_secondary.error"
                    }
                    flexWrap="wrap"
                    numberOfLines={3}
                    textAlign="center"
                  >
                    {`${
                      homeTotalPoints + homeAdditionalPoint + homePlayerPoint
                    } `}
                  </Text>
                  <Text
                    fontWeight="bold"
                    fontSize="24"
                    color="rs_secondary.grey"
                    flexWrap="wrap"
                    numberOfLines={3}
                  >
                    -
                  </Text>
                  <Text
                    fontWeight="bold"
                    fontSize="24"
                    color={
                      homeTotalPoints + homeAdditionalPoint + homePlayerPoint >=
                      awayPlayerPoint + awayAdditionalPoint + awayTotalPoints
                        ? "rs_secondary.error"
                        : "rs_secondary.green"
                    }
                    flexWrap="wrap"
                    numberOfLines={3}
                    textAlign="center"
                  >
                    {`${
                      awayPlayerPoint + awayAdditionalPoint + awayTotalPoints
                    } `}
                  </Text>
                </HStack>
                <HStack space="1" justifyContent="center" alignItems="center">
                  <Text
                    fontSize="12"
                    fontWeight="bold"
                    color="rs_secondary.grey"
                  >
                    {numberOfSetHomeTeamWin}
                  </Text>
                  <Text
                    color="rs_secondary.grey"
                    fontWeight="bold"
                    fontSize="12"
                  >
                    {t("set")}
                  </Text>
                  <Text
                    fontSize="12"
                    fontWeight="bold"
                    color="rs_secondary.grey"
                  >
                    {numberOfSetAwayTeamWin}
                  </Text>
                </HStack>
              </VStack>
              <Text
                fontWeight="bold"
                fontSize="md"
                color="rs.primary_purple"
                flexWrap="wrap"
                numberOfLines={3}
                flex="1"
                textAlign="center"
              >
                {fixture.awayTeam.name}
              </Text>
            </HStack>
            {/* Venue */}
            <HStack space="1" mt="4" alignItems="center">
              <LocationIcon />
              <Text fontSize="md" color="gray.500">
                {fixture.venue}
              </Text>
            </HStack>
            {isShowApproval && (
              <Button p="2" onPress={onPress} w="full" mt="2">
                {t("Approval")}
              </Button>
            )}
          </VStack>
        }
      />
    </VStack>
  );
}
