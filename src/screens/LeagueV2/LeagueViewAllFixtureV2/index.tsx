import {
  VStack,
  IconButton,
  HStack,
  Heading,
  Pressable,
  Text,
} from "native-base";
import React, { useEffect, useRef, useState } from "react";
import { useForm } from "react-hook-form";
import useSWR from "swr";
import { useFocusEffect } from "@react-navigation/native";
import { NativeStackScreenProps } from "@react-navigation/native-stack";
import { parseISO } from "date-fns";
import HeaderLayout from "../../../components/Layout/HeaderLayout";
import { getTranslation } from "../../../utils/translation";
import { MainStackNavigatorParamList } from "../../../routers/Types";
import NotificationBellIcon from "../../../components/Icons/NotificationBellIcon";
import FilterIcon from "../../../components/Icons/FilterIcon";
import TipsComponent from "../../../components/TipsComponent";
import SingleSelectModal from "../../../components/Modal/SingleSelectModal";
import LeagueCard from "../../../components/Card/LeagueCard";
import DivisionCard from "../../../components/Card/DivisionCard";
import { formatCoreUrl } from "../../../services/ServiceUtil";
import {
  combineFixturesWithMatchResultData,
  getAllDivisionMatchResults,
  getFixture,
  getLeagues,
} from "../../../services/LeagueServices";
import Loading from "../../../components/Loading";
import ErrorMessage from "../../../components/ErrorMessage";
import NoDataComponent from "../../../components/NoDataComponent";
import GoldMedalIcon from "../../../components/Icons/GoldMedalIcon";
import LeaderboardCard from "../../../components/Card/LeaderboardCard";
import FilterIconV2 from "../../../components/Icons/FilterIconV2";
import EyesIcon from "../../../components/Icons/EyesIcon";
import LeagueIcon from "../../../components/Icons/LeagueIcon";
import { MatchCardV2 } from "../../OrganizerScreens/MatchResult";
import { useAuth } from "../../../hooks/UseAuth";
import { DivisionMatchResultStatus } from "../../../models/responses/League";
import FlashListLayout from "../../../components/Layout/FlashListLayout";

export type LeagueScreenV2Props = NativeStackScreenProps<
  MainStackNavigatorParamList,
  "LeagueViewAllFixtureV2"
>;

const t = getTranslation([
  "screen.LeagueViewAllFixtureV2",
  "screen.leagueTerms",
  "constant.button",
  "formInput",
  "leagueTerms",
]);

export enum LeagueFlow {
  audience = "audience",
  player = "player",
}

function LeagueViewAllFixtureV2({ navigation, route }: LeagueScreenV2Props) {
  const { divisionId } = route.params;
  const {
    data: fixtures,
    isValidating: fixturesValidating,
    error: fixturesError,
    mutate: fixturesMutate,
  } = useSWR(divisionId ? formatCoreUrl("/fixture") : undefined, () => {
    if (divisionId) {
      return getFixture({
        divisionId,
      });
    }
  });

  const {
    data: matchResultsData,
    isValidating: matchResultValidating,
    error: matchError,
    mutate: matchResultMutate,
  } = useSWR(formatCoreUrl("/result"), () => {
    if (divisionId) {
      return getAllDivisionMatchResults({
        divisionId,
      });
    }
  });

  const fixtureWithMatchResultDataList = combineFixturesWithMatchResultData(
    fixtures || [],
    matchResultsData || []
  );
  // get round options
  const roundsData: {
    divisionId: string | number;
    round: string | number;
  }[] = [];
  const unwrappedFixtures = fixtures || [];
  unwrappedFixtures.forEach((fixture) => {
    const entry = { divisionId, round: fixture.round };
    if (
      roundsData.findIndex(
        (x) => x.round === entry.round && x.divisionId === entry.divisionId
      ) === -1
    ) {
      roundsData.push(entry);
    }
  });
  const { user } = useAuth();

  if (fixturesValidating || matchResultValidating) {
    return <Loading />;
  }

  return (
    <FlashListLayout
      headerProps={{
        title: t("Fixture and Result"),
        rightComponent: (
          <Pressable
            onPress={() => {
              navigation.navigate("LeagueFilteringV2", {
                flow: route.params.flow,
                league: route.params.league,
                selectedDivisionId: divisionId,
                roundsData,
              });
            }}
          >
            <FilterIconV2 />
          </Pressable>
        ),
      }}
      refreshing={false}
      isSticky
      flashListProps={{
        data: fixtureWithMatchResultDataList
          .filter((fixtureMatchResult) => {
            if (route.params.flow === LeagueFlow.audience) {
              return true;
            }

            return (
              fixtureMatchResult.fixture.homeTeam.members.findIndex(
                (member) => {
                  return member.userId === user?.sub;
                }
              ) !== -1 ||
              fixtureMatchResult.fixture.awayTeam.members.findIndex(
                (member) => {
                  return member.userId === user?.sub;
                }
              ) !== -1
            );
          })
          .sort((a, b) => {
            return (
              parseISO(`${a.fixture.date} ${a.fixture.time}`).getTime() -
              parseISO(`${b.fixture.date} ${b.fixture.time}`).getTime()
            );
          }),
        renderItem: ({ item }) => {
          const isPlayerFlow = route.params.flow === LeagueFlow.player;
          const matchResultIsAcknowledge =
            item.matchResult &&
            item.matchResult.status === DivisionMatchResultStatus.Approved;
          return (
            <VStack mx="defaultLayoutSpacing" flex="1" space="5" mt={5}>
              <Pressable
                isDisabled={!matchResultIsAcknowledge}
                onPress={() => {
                  if (matchResultIsAcknowledge) {
                    const myTeam =
                      item.matchResult &&
                      item.fixture.homeTeam.members.find(
                        (player) => player.userId === user?.sub
                      )
                        ? item.matchResult.fixture.homeTeam
                        : item.fixture.awayTeam;
                    const isShowApproval =
                      item.matchResult &&
                      item.matchResult.status ===
                        DivisionMatchResultStatus.Pending &&
                      item.matchResult.submitted &&
                      item.matchResult.fixture.awayTeam.id === myTeam?.id;

                    navigation.navigate("MatchResult", {
                      matchResultId: item.matchResult.id,
                      flow: route.params.flow,
                      isShowApproval: isPlayerFlow && isShowApproval,
                    });
                  }
                }}
              >
                <MatchCardV2
                  user={user}
                  flow={route.params.flow}
                  matchResult={
                    matchResultIsAcknowledge ? item.matchResult : undefined
                  }
                  fixture={item.fixture}
                />
              </Pressable>
            </VStack>
          );
        },
        ListEmptyComponent: <NoDataComponent />,
      }}
    />
  );
}

export default LeagueViewAllFixtureV2;
