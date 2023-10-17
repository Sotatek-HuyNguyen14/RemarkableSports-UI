/* eslint-disable react/no-array-index-key */
import {
  VStack,
  Text,
  HStack,
  useTheme,
  Pressable,
  Heading,
  Badge,
} from "native-base";
import React, { useCallback, useEffect, useRef, useState } from "react";
import { NativeStackScreenProps } from "@react-navigation/native-stack";
import useSWR from "swr";
import HeaderLayout from "../../../components/Layout/HeaderLayout";
import { getTranslation } from "../../../utils/translation";
import { MainStackNavigatorParamList } from "../../../routers/Types";
import LineBreak from "../../../components/LineBreak/LineBreak";
import { formatCoreUrl } from "../../../services/ServiceUtil";
import {
  getLeaderboard,
  getTeamsStats,
} from "../../../services/LeagueServices";
import { formatName, getUserName } from "../../../utils/name";
import Loading from "../../../components/Loading";
import ErrorMessage from "../../../components/ErrorMessage";
import NoDataComponent from "../../../components/NoDataComponent";
import MatchCard from "../../../components/MatchCard";
import {
  DivisionMatchResultResponse,
  LeaderboardIndividualResponse,
} from "../../../models/responses/League";
import Card from "../../../components/Card/Card";
import {
  formatUtcToLocalDate,
  formatUtcToLocalTime,
} from "../../../utils/date";
import { MatchCardV2 } from "../../OrganizerScreens/MatchResult";
import { useAuth } from "../../../hooks/UseAuth";

export type LeagueTeamStatisticDetailProps = NativeStackScreenProps<
  MainStackNavigatorParamList,
  "LeagueTeamStatisticDetail"
>;

const t = getTranslation(["screen.TeamStatistic", "leagueTerms"]);

export default function LeagueTeamStatisticDetail({
  navigation,
  route,
}: LeagueTeamStatisticDetailProps) {
  const theme = useTheme();
  const { divisionId, teamId } = route.params;
  const {
    data: teamStatistic,
    isValidating,
    error,
    mutate,
  } = useSWR(
    formatCoreUrl(`/result/division/${divisionId}/team/${teamId}`),
    () =>
      getTeamsStats({
        divisionId,
        teamId,
      })
  );

  const {
    data: playerLeaderboard,
    isValidating: playerLeaderboardIsValidating,
    error: playerLeaderboardError,
    mutate: playerLeaderboardMutate,
  } = useSWR<LeaderboardIndividualResponse[]>(
    formatCoreUrl(`/result/division/${divisionId}/individual/leaderboard`),
    () =>
      getLeaderboard({
        divisionId,
        type: "individual",
      }),
    { fallbackData: [] }
  );

  const headers = [t("Player"), t("P"), t("W"), t("%")];
  const { user } = useAuth();

  const matchCard = (matchResult: DivisionMatchResultResponse) => {
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

    const isPlayerFromAwayTeam = matchResult.fixture.awayTeam.id === teamId;
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

    return (
      <Pressable
        onPress={() => {
          navigation.navigate("MatchResult", {
            matchResultId: matchResult.id,
            flow: route.params.flow,
          });
        }}
        space="2"
        mt="4"
        key={id}
        mx="defaultLayoutSpacing"
      >
        <MatchCardV2
          flow={route.params.flow}
          matchResult={matchResult}
          fixture={matchResult.fixture}
          user={user}
        />
      </Pressable>
    );
  };

  return (
    <HeaderLayout
      KeyboardAwareScrollViewProps={{
        bounces: false,
      }}
      headerProps={{
        title: t("Team List"),
        containerStyle: { marginHorizontal: 0 },
        hasBackButton: true,
      }}
      isSticky
    >
      <VStack space={4} py="defaultLayoutSpacing">
        <Text fontSize="md" mx="defaultLayoutSpacing">
          {`${t("Team name")}:`}{" "}
          <Heading fontSize="md">
            {teamStatistic?.individualResults?.[0]?.team?.name ?? ""}
          </Heading>
        </Text>
        <HStack px="defaultLayoutSpacing">
          {headers?.map((val, k) => (
            <Text
              key={`${k}`}
              flex={k === 0 ? 5 : 1}
              fontWeight="bold"
              textAlign={k === 0 ? "left" : "center"}
              fontSize={k === 0 ? 16 : 14}
            >
              {val}
            </Text>
          ))}
        </HStack>
        {(isValidating || playerLeaderboardIsValidating) && <Loading />}
        {(!isValidating && error && <ErrorMessage />) ||
          (!playerLeaderboardIsValidating && playerLeaderboardError && (
            <ErrorMessage />
          ))}

        <VStack>
          {!isValidating &&
            !error &&
            teamStatistic?.individualResults
              ?.sort((a, b) => b.winRate - a.winRate)
              .map((person, index) => {
                return (
                  <HStack
                    px="defaultLayoutSpacing"
                    py={3}
                    key={`person_${index}`}
                    bg={index % 2 === 0 ? "#66CEE133" : "rs.white"}
                  >
                    <HStack space={2} flex={5}>
                      <Text fontWeight="bold">{index + 1}</Text>
                      <Pressable
                        onPress={() => {
                          navigation.navigate(
                            "LeaguePlayerIndividualStatistic",
                            {
                              divisionId,
                              teamId,
                              team: teamStatistic?.individualResults?.[0]?.team,
                              displayName: getUserName(
                                person.player.memberInfo
                              ),
                              playerId: person.player.userId,
                              ranking:
                                playerLeaderboard &&
                                playerLeaderboard.length > 0
                                  ? playerLeaderboard.findIndex(
                                      (player) =>
                                        player.player.userId ===
                                        person.player.userId
                                    ) + 1
                                  : index + 1,
                              flow: route.params.flow,
                            }
                          );
                        }}
                      >
                        <Text fontWeight="bold" color="rs.primary_purple">
                          {person.player?.memberInfo
                            ? getUserName(person.player?.memberInfo)
                            : ""}
                        </Text>
                        <LineBreak
                          style={{
                            backgroundColor: theme.colors.rs.primary_purple,
                          }}
                        />
                      </Pressable>
                    </HStack>
                    <Text flex={1} fontWeight="bold" textAlign="center">
                      {person.gamePlayed}
                    </Text>
                    <Text flex={1} fontWeight="bold" textAlign="center">
                      {person.gameWinned}
                    </Text>
                    <Text flex={1} fontWeight="bold" textAlign="center">
                      {`${person.winRate}%`}
                    </Text>
                  </HStack>
                );
              })}
        </VStack>
        <Heading mx="defaultLayoutSpacing" fontSize="md">
          {t("Recent Matches")}
        </Heading>
        {!isValidating &&
          !error &&
          teamStatistic?.matchResults?.map((matchResult, j) =>
            matchCard(matchResult)
          )}
        {!isValidating && !error && !teamStatistic?.matchResults?.length && (
          <NoDataComponent />
        )}
      </VStack>
    </HeaderLayout>
  );
}
