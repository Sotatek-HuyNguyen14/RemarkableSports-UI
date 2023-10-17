import { HStack, VStack, Text, Pressable, Button } from "native-base";
import React from "react";
import Card from "../../../components/Card/Card";
import LocationIcon from "../../../components/Icons/LocationIcon";
import { useAuth } from "../../../hooks/UseAuth";
import {
  DivisionMatchResultResponse,
  Fixture,
  FixtureResponse,
} from "../../../models/responses/League";
import {
  format12HTo24H,
  formatDateTimeToTimezone,
  formatUtcToLocalTime,
} from "../../../utils/date";
import { isBlank } from "../../../utils/strings";
import { getTranslation } from "../../../utils/translation";

interface DivisionMatchResultItemProps {
  matchResult: DivisionMatchResultResponse;
  header?: string;
  shouldShowTeamMember?: boolean;
  shouldShowGameStatus?: boolean;
  onPress?: () => void;
  onPressDetail?: () => void;
  isShowSubmit?: boolean;
}

const t = getTranslation(["component.FixtureItem", "constant.button"]);

export default function DivisionMatchResultItem({
  matchResult,
  header,
  shouldShowTeamMember = false,
  shouldShowGameStatus = false,
  onPress,
  onPressDetail,
  isShowSubmit = false,
}: DivisionMatchResultItemProps) {
  const { fixture } = matchResult;
  const { user } = useAuth();
  const isPlayerFromHomeTeam =
    matchResult.homeTeamPlayers.findIndex(
      (player) => player.userId === user?.id
    ) !== -1;
  const isPlayerFromAwayTeam =
    matchResult.awayTeamPlayers.findIndex(
      (player) => player.userId === user?.id
    ) !== -1;
  const totalHomePoint =
    matchResult.homeTotalPoints +
    matchResult.homeAdditionalPoint +
    matchResult.homePlayerPoint;
  const totalAwayPoint =
    matchResult.awayTotalPoints +
    matchResult.awayAdditionalPoint +
    matchResult.awayPlayerPoint;
  const isWin = isPlayerFromHomeTeam
    ? totalHomePoint > totalAwayPoint
    : totalHomePoint < totalAwayPoint;
  const isLose = isPlayerFromHomeTeam
    ? totalHomePoint < totalAwayPoint
    : totalHomePoint > totalAwayPoint;
  const resultColor = shouldShowGameStatus
    ? isWin
      ? "rs_secondary.green"
      : isLose
      ? "rs_secondary.error"
      : "#6D6D6D"
    : "gray.800";
  const status = isWin ? t("WIN") : isLose ? t("LOSE") : t("DRAW");
  const leftColor = isPlayerFromHomeTeam ? resultColor : "gray.800";
  const rightColor = isPlayerFromAwayTeam ? resultColor : "gray.800";
  const numberOfSetHomeTeamWin = matchResult.gameResults.filter(
    (match) => match.homeSetResult > match.awaySetResult
  ).length;
  const numberOfSetAwayTeamWin = matchResult.gameResults.filter(
    (match) => match.homeSetResult < match.awaySetResult
  ).length;
  return (
    <VStack w="100%" space="2">
      <Card
        onPress={() => {
          onPressDetail?.();
        }}
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
              <VStack flex="1" alignItems="center">
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
                {shouldShowTeamMember &&
                  matchResult.homeTeamPlayers.map((player) => {
                    return <Text color="#6D6D6D">{player.playerName}</Text>;
                  })}
              </VStack>
              <VStack
                justifyContent="center"
                alignItems="center"
                space="2"
                mx="4"
              >
                {shouldShowGameStatus && (
                  <Text color={resultColor}>{status}</Text>
                )}
                <HStack space="2">
                  <VStack alignItems="center">
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
                      {`${
                        matchResult.homeTotalPoints +
                        matchResult.homeAdditionalPoint +
                        matchResult.homePlayerPoint
                      }`}
                    </Text>
                    <Text color="#6D6D6D">{`(${numberOfSetHomeTeamWin})`}</Text>
                  </VStack>
                  <Text
                    fontWeight="bold"
                    fontSize="xl"
                    color="gray.800"
                    numberOfLines={3}
                  >
                    -
                  </Text>
                  <VStack>
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
                      {`${
                        matchResult.awayTotalPoints +
                        matchResult.awayPlayerPoint +
                        matchResult.awayAdditionalPoint
                      }`}
                    </Text>
                    <Text color="#6D6D6D">{`(${numberOfSetAwayTeamWin})`}</Text>
                  </VStack>
                </HStack>
              </VStack>
              <VStack flex="1" alignItems="center">
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
                {shouldShowTeamMember &&
                  matchResult.homeTeamPlayers.map((player) => {
                    return <Text color="#6D6D6D">{player.playerName}</Text>;
                  })}
              </VStack>
            </HStack>
            <HStack space="1" alignItems="center">
              <LocationIcon />
              <Text fontSize="md" color="gray.500">
                {fixture.venue}
              </Text>
            </HStack>
            {isShowSubmit && (
              <HStack alignItems="center">
                <Button flex={1} p="2" onPress={onPress}>
                  {t("Submit")}
                </Button>
              </HStack>
            )}
          </VStack>
        }
      />
    </VStack>
  );
}
