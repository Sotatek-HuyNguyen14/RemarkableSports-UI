/* eslint-disable react/no-array-index-key */
import {
  VStack,
  Text,
  HStack,
  useTheme,
  Box,
  Heading,
  Button,
  Divider,
  Avatar,
} from "native-base";
import React, { useEffect, useRef, useState } from "react";
import useSWR from "swr";
import { NativeStackScreenProps } from "@react-navigation/native-stack";
import HeaderLayout from "../../../components/Layout/HeaderLayout";
import { getTranslation } from "../../../utils/translation";
import { MainStackNavigatorParamList } from "../../../routers/Types";
import { formatCoreUrl, formatFileUrl } from "../../../services/ServiceUtil";
import {
  getIndividualMatchRecords,
  getdivisionById,
} from "../../../services/LeagueServices";
import Loading from "../../../components/Loading";
import ErrorMessage from "../../../components/ErrorMessage";
import NoDataComponent from "../../../components/NoDataComponent";
import { GameRecordsModel } from "../../../models/responses/League";
import ImageDirectory from "../../../assets";
import { getUserById } from "../../../services/AuthServices";
import { Player } from "../../../models/User";
import {
  format24HTo12H,
  formatUtcToLocalDate,
  formatUtcToLocalTime,
} from "../../../utils/date";

export type LeaguePlayerIndividualStatisticProps = NativeStackScreenProps<
  MainStackNavigatorParamList,
  "LeaguePlayerIndividualStatistic"
>;

const t = getTranslation(["screen.IndividualStatistic", "leagueTerms"]);

export default function LeaguePlayerIndividualStatistic({
  navigation,
  route,
}: LeaguePlayerIndividualStatisticProps) {
  const { divisionId, teamId, team, displayName, playerId } = route.params;
  const theme = useTheme();

  const { data: division, isValidating: divisionValidating } = useSWR(
    formatCoreUrl(`division/${divisionId}`),
    () => getdivisionById(divisionId)
  );

  const {
    data: recordsData,
    isValidating,
    error,
    mutate,
  } = useSWR(
    formatCoreUrl(
      `result/division/${divisionId}/team/${teamId}/player/${playerId}`
    ),
    () =>
      getIndividualMatchRecords({
        divisionId,
        teamId,
        playerId,
      })
  );

  if (isValidating || divisionValidating) {
    return <Loading />;
  }

  const playerProfile = () => {
    return (
      <HStack space="2" justifyContent="space-between" alignItems="center">
        <VStack space="2">
          <Heading fontSize="lg">{displayName}</Heading>
          <Text fontSize="md" color="rs.primary_purple" underline>
            {team.name}
          </Text>
        </VStack>
        <Button
          onPress={async () => {
            const user = (await getUserById(playerId)) as Player;
            navigation.navigate("UserProfileViewer", {
              user,
            });
          }}
          variant="outline"
          borderRadius="full"
          px="3"
          py="1"
          h="8"
          _text={{
            fontWeight: "normal",
            fontSize: "sm",
            color: "rs.primary_purple",
          }}
        >
          {t("View Profile")}
        </Button>
      </HStack>
    );
  };

  const playerStatisticReport = () => {
    const infoBox = (props: {
      title: string;
      value: string;
      bg: string;
      borderColor: string;
      px: string;
      py: string;
    }) => {
      return (
        <VStack
          flex="1"
          bg={props.bg}
          borderWidth="1"
          borderColor={props.borderColor}
          borderRadius="2xl"
          space="1"
          justifyContent="center"
          px={props.px}
          py={props.py}
        >
          <Text fontSize="sm">{props.title}</Text>
          <Heading color="rs.primary_purple" fontSize="xl">
            {props.value}
          </Heading>
        </VStack>
      );
    };
    return (
      <VStack mt="2" space="3">
        <Heading fontSize="lg">{t("Statistics")}</Heading>
        {/* Match played - Won - Winning Rate */}
        <HStack space="1">
          {infoBox({
            title: t("Matches Played"),
            value: recordsData?.individualResult.gamePlayed || "-",
            bg: "rs.white",
            borderColor: "gray.300",
            px: "3",
            py: "3",
          })}

          {infoBox({
            title: t("Matches Won"),
            value: recordsData?.individualResult.gameWinned || "-",
            bg: "rs.white",
            borderColor: "gray.300",
            px: "3",
            py: "3",
          })}

          {infoBox({
            title: t("Winning Rate"),
            value: `${recordsData?.individualResult.winRate}%` || "-",
            bg: "rs.white",
            borderColor: "gray.300",
            px: "3",
            py: "3",
          })}
        </HStack>
        {/* Ranking - Total Points */}
        <HStack space="1" mt="2">
          {infoBox({
            title: t("Ranking"),
            value: route.params.ranking,
            bg: "#E4F4F8",
            borderColor: "#E4F4F8",
            px: "6",
            py: "4",
          })}
          {infoBox({
            title: t("Total Points"),
            value: recordsData?.individualResult.points || "-",
            bg: "#E4F4F8",
            borderColor: "#E4F4F8",
            px: "6",
            py: "4",
          })}
        </HStack>
      </VStack>
    );
  };

  const playerRecentMatches = () => {
    const unwrappedGroupRecord = recordsData?.gameRecords || [];
    return (
      <VStack space="2" mt="2">
        <Heading>{t("Recent Matches")}</Heading>
        {unwrappedGroupRecord.length === 0 && <NoDataComponent />}
        {unwrappedGroupRecord.map((val: GameRecordsModel, index) => {
          const { gameResult: matchResult } = val;
          // isPlayerFromHome was originally deduced by checking if opponent team contains a member with playerId, if not than isPlayerFromHome is true
          // but this is assuming opponent team is away team which is not always true
          // isOpponentHome flag is to indicate if opponent team is home team since gameRecordModel only has opponent team info
          // but it does not indicate if opponent team is home or away, so need this extra flag to deduce it (related to GPP-2192)
          const isPlayerFromHomeTeam = !val.isOpponentHome;
          const isPlayerFromAwayTeam = !isPlayerFromHomeTeam;
          const isHomeTeamWin =
            matchResult.homeSetResult > matchResult.awaySetResult;
          const isAwayTeamWin =
            matchResult.homeSetResult < matchResult.awaySetResult;
          const isDraw =
            matchResult.homeSetResult === matchResult.awaySetResult;
          const bgHomeTeam = isPlayerFromHomeTeam ? "#66CEE133" : "#EDEFF0";
          const bgAwayTeam = isPlayerFromAwayTeam ? "#66CEE133" : "#EDEFF0";
          const homeTeamResultColor = isHomeTeamWin
            ? "rs.green"
            : isAwayTeamWin
            ? "rs.red"
            : "rs.black";

          const awayTeamResultColor = isAwayTeamWin
            ? "rs.green"
            : isHomeTeamWin
            ? "rs.red"
            : "rs.black";
          return (
            <VStack space="0" mt="2">
              <Heading mb="2" fontSize="md">
                {`${division?.leagueName} (${val.divisionName}) - ${t(
                  "Round"
                )}#${val.round}`}
              </Heading>
              <Text mb="2">{`${formatUtcToLocalDate(
                new Date(val.date)
              )} ${format24HTo12H(val.time)}`}</Text>
              {/* Home team */}
              <HStack alignItems="center" bg={bgHomeTeam} px="4" py="2">
                {/* Team name + Avatar */}
                <HStack space="2" alignItems="center" flex="0.6">
                  <Avatar
                    size="sm"
                    source={
                      matchResult.homePlayerAvatarURL
                        ? {
                            uri: formatFileUrl(matchResult.homePlayerAvatarURL),
                          }
                        : ImageDirectory.LOGO_SPLASH
                    }
                  >
                    Thumbnail
                  </Avatar>
                  <VStack space="1">
                    <Text
                      fontWeight={
                        matchResult.homePlayerName === displayName
                          ? "bold"
                          : "normal"
                      }
                      color={
                        matchResult.homePlayerName === displayName
                          ? "rs.primary_purple"
                          : "rs.black"
                      }
                    >
                      {matchResult.homePlayerName}
                    </Text>
                    <Text
                      fontWeight={
                        matchResult.homePlayerName === displayName
                          ? "bold"
                          : "normal"
                      }
                      color={
                        matchResult.homePlayerName === displayName
                          ? "rs.primary_purple"
                          : "rs.black"
                      }
                    >
                      {isPlayerFromHomeTeam ? team.name : val.opponentTeam.name}
                    </Text>
                  </VStack>
                </HStack>
                {/* Points */}
                <HStack flex="0.4" alignItems="center">
                  <Text
                    flex={1 / (matchResult.setResults.length + 1)}
                    fontWeight="bold"
                    fontSize="lg"
                    color={
                      isPlayerFromHomeTeam ? homeTeamResultColor : "rs.black"
                    }
                  >
                    {matchResult.homeSetResult}
                  </Text>
                  {matchResult.setResults.map((result) => {
                    return (
                      <Text
                        key={result.homePlayerScore}
                        flex={1 / (matchResult.setResults.length + 1)}
                        color="#6D6D6D"
                      >
                        {result.homePlayerScore}
                      </Text>
                    );
                  })}
                </HStack>
              </HStack>

              {/* Away team */}
              <HStack alignItems="center" bg={bgAwayTeam} px="4" py="2">
                {/* Team name + Avatar */}
                <HStack space="2" alignItems="center" flex="0.6">
                  <Avatar
                    size="sm"
                    source={
                      matchResult.awayPlayerAvatarURL
                        ? {
                            uri: formatFileUrl(matchResult.awayPlayerAvatarURL),
                          }
                        : ImageDirectory.LOGO_SPLASH
                    }
                  >
                    Thumbnail
                  </Avatar>
                  <VStack space="1">
                    <Text
                      fontWeight={
                        matchResult.awayPlayerName === displayName
                          ? "bold"
                          : "normal"
                      }
                      color={
                        matchResult.awayPlayerName === displayName
                          ? "rs.primary_purple"
                          : "rs.black"
                      }
                    >
                      {matchResult.awayPlayerName}
                    </Text>
                    <Text
                      fontWeight={
                        matchResult.awayPlayerName === displayName
                          ? "bold"
                          : "normal"
                      }
                      color={
                        matchResult.awayPlayerName === displayName
                          ? "rs.primary_purple"
                          : "rs.black"
                      }
                    >
                      {isPlayerFromAwayTeam ? team.name : val.opponentTeam.name}
                    </Text>
                  </VStack>
                </HStack>
                {/* Points */}
                <HStack flex="0.4" alignItems="center">
                  <Text
                    flex={1 / (matchResult.setResults.length + 1)}
                    fontWeight="bold"
                    fontSize="lg"
                    color={
                      isPlayerFromAwayTeam ? awayTeamResultColor : "rs.black"
                    }
                  >
                    {matchResult.awaySetResult}
                  </Text>
                  {matchResult.setResults.map((result) => {
                    return (
                      <Text
                        color="#6D6D6D"
                        flex={1 / (matchResult.setResults.length + 1)}
                      >
                        {result.awayPlayerScore}
                      </Text>
                    );
                  })}
                </HStack>
              </HStack>
            </VStack>
          );
        })}
      </VStack>
    );
  };

  return (
    <HeaderLayout
      KeyboardAwareScrollViewProps={{
        bounces: false,
      }}
      headerProps={{
        title: `${t("Player")} ${t("Statistics")}`,
        containerStyle: { marginHorizontal: 0 },
        hasBackButton: true,
      }}
      isSticky
    >
      <VStack space="3" mx="defaultLayoutSpacing">
        {/* Player profile */}
        {playerProfile()}
        <Divider mt="2" />
        {/* Statistic */}
        {playerStatisticReport()}
        <Divider mt="2" />
        {/* Recent matches */}
        {playerRecentMatches()}
      </VStack>
    </HeaderLayout>
  );
}
