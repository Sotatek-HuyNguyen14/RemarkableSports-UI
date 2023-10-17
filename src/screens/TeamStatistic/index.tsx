/* eslint-disable react/no-array-index-key */
import {
  VStack,
  Text,
  HStack,
  useTheme,
  Pressable,
  Heading,
} from "native-base";
import React, { useEffect, useRef, useState } from "react";
import { NativeStackScreenProps } from "@react-navigation/native-stack";
import useSWR from "swr";
import HeaderLayout from "../../components/Layout/HeaderLayout";
import { getTranslation } from "../../utils/translation";
import { MainStackNavigatorParamList } from "../../routers/Types";
import LineBreak from "../../components/LineBreak/LineBreak";
import { formatCoreUrl } from "../../services/ServiceUtil";
import { getTeamsStats } from "../../services/LeagueServices";
import { formatName, getUserName } from "../../utils/name";
import Loading from "../../components/Loading";
import ErrorMessage from "../../components/ErrorMessage";
import NoDataComponent from "../../components/NoDataComponent";
import MatchCard from "../../components/MatchCard";

export type TeamStatisticProps = NativeStackScreenProps<
  MainStackNavigatorParamList,
  "TeamStatistic"
>;

const t = getTranslation("screen.TeamStatistic");

export default function TeamStatistic({
  navigation,
  route,
}: TeamStatisticProps) {
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

  const headers = [t("Player"), t("P"), t("W"), t("%")];

  return (
    <HeaderLayout
      KeyboardAwareScrollViewProps={{
        bounces: false,
      }}
      headerProps={{
        title: teamStatistic?.individualResults?.[0]?.team?.name ?? "",
        containerStyle: { marginHorizontal: 0 },
        hasBackButton: true,
      }}
      isSticky
    >
      <VStack space={4} py="defaultLayoutSpacing">
        <HStack px="defaultLayoutSpacing">
          {headers?.map((val, k) => (
            <Text
              key={`${k}`}
              flex={k === 0 ? 5 : 1}
              fontWeight="bold"
              fontSize={k === 0 ? 16 : 14}
            >
              {val}
            </Text>
          ))}
        </HStack>
        {isValidating && <Loading />}
        {!isValidating && error && <ErrorMessage />}

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
                    bg={index % 2 === 0 ? "rs.grey" : "rs.lightGrey"}
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
                              ranking: index + 1,
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
                    <Text flex={1} fontWeight="bold">
                      {person.gamePlayed}
                    </Text>
                    <Text flex={1} fontWeight="bold">
                      {person.gameWinned}
                    </Text>
                    <Text flex={1} fontWeight="bold">
                      {person.winRate}
                    </Text>
                  </HStack>
                );
              })}
        </VStack>
        <Heading fontSize={16} textAlign="center">
          {t("Team Results Table")}
        </Heading>
        {!isValidating &&
          !error &&
          teamStatistic?.matchResults?.map((matchResult, j) => (
            <MatchCard
              onCardPress={() => {
                navigation.navigate("MatchResult", {
                  matchResultId: matchResult.id,
                  fromTeam:
                    matchResult.fixture.awayTeam.id === teamId
                      ? "away"
                      : "home",
                });
              }}
              key={matchResult.id}
              isPlayerFromAwayTeam={matchResult.fixture.awayTeam.id === teamId}
              matchResult={matchResult}
            />
          ))}
        {!isValidating && !error && !teamStatistic?.matchResults?.length && (
          <NoDataComponent />
        )}
      </VStack>
    </HeaderLayout>
  );
}
