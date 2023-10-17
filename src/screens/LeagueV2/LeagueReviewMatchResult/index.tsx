import {
  VStack,
  IconButton,
  HStack,
  Heading,
  Pressable,
  Text,
  Badge,
} from "native-base";
import React, { useEffect, useMemo, useRef, useState } from "react";
import { useForm } from "react-hook-form";
import useSWR from "swr";
import { useFocusEffect } from "@react-navigation/native";
import { NativeStackScreenProps } from "@react-navigation/native-stack";
import { Dimensions, RefreshControl } from "react-native";
import { FlashList } from "@shopify/flash-list";
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
  getdivisionById,
} from "../../../services/LeagueServices";
import Loading from "../../../components/Loading";
import ErrorMessage from "../../../components/ErrorMessage";
import NoDataComponent from "../../../components/NoDataComponent";
import GoldMedalIcon from "../../../components/Icons/GoldMedalIcon";
import LeaderboardCard from "../../../components/Card/LeaderboardCard";
import FilterIconV2 from "../../../components/Icons/FilterIconV2";
import EyesIcon from "../../../components/Icons/EyesIcon";
import LeagueIcon from "../../../components/Icons/LeagueIcon";
import GhostTabbar from "../../../components/GhostTabBar";
import {
  DivisionMatchResultResponse,
  DivisionMatchResultStatus,
  FixtureResponse,
} from "../../../models/responses/League";
import {
  formatUtcToLocalDate,
  formatUtcToLocalTime,
} from "../../../utils/date";
import { useAuth } from "../../../hooks/UseAuth";
import FlashListLayout from "../../../components/Layout/FlashListLayout";
import { MatchCardV2 } from "../../OrganizerScreens/MatchResult";

export type LeagueReviewMatchResultProps = NativeStackScreenProps<
  MainStackNavigatorParamList,
  "LeagueReviewMatchResult"
>;

const t = getTranslation([
  "screen.LeagueReviewMatchResult",
  "screen.leagueTerms",
  "constant.button",
  "formInput",
  "leagueTerms",
]);

export enum LeagueFlow {
  audience = "audience",
  player = "player",
}

function LeagueReviewMatchResult({
  navigation,
  route,
}: LeagueReviewMatchResultProps) {
  const { divisionId, currentUserTeam, teamId } = route.params;

  const [activeTabIndex, setActiveTabIndex] = React.useState(0);
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
    data: divisionData,
    isValidating: divisionValidating,
    error: divisionError,
    mutate: divisionMutate,
  } = useSWR(
    divisionId ? formatCoreUrl(`/division/${divisionId}`) : undefined,
    () => {
      if (divisionId) {
        return getdivisionById(divisionId);
      }
    }
  );

  const {
    data: matchResultsData,
    isValidating: matchResultValidating,
    error: matchError,
    mutate: matchResultMutate,
  } = useSWR(formatCoreUrl("/result"), () => {
    return getAllDivisionMatchResults({
      divisionId,
    });
  });

  const mutateAll = React.useCallback(() => {
    divisionMutate();
    matchResultMutate();
    fixturesMutate();
  }, [fixturesMutate, matchResultMutate, divisionMutate]);

  useFocusEffect(
    React.useCallback(() => {
      mutateAll();
    }, [mutateAll])
  );

  const fixtureWithMatchResultDataList = combineFixturesWithMatchResultData(
    fixtures || [],
    matchResultsData || []
  );

  const pendingList = useMemo(() => {
    return fixtureWithMatchResultDataList.filter(
      (result) =>
        result.matchResult &&
        result.matchResult.submitted &&
        (result.matchResult.status === DivisionMatchResultStatus.Pending ||
          result.matchResult.status ===
            DivisionMatchResultStatus.Acknowledged ||
          result.matchResult.status === DivisionMatchResultStatus.Rejected) &&
        result.matchResult.submitted &&
        result.fixture.awayTeam.id === currentUserTeam?.id
    );
  }, [fixtureWithMatchResultDataList, currentUserTeam]);
  const publishedList = useMemo(() => {
    return fixtureWithMatchResultDataList.filter(
      (result) =>
        result.matchResult &&
        result.matchResult.submitted &&
        result.matchResult.status === DivisionMatchResultStatus.Approved &&
        result.fixture.awayTeam.id === currentUserTeam?.id
    );
  }, [fixtureWithMatchResultDataList, currentUserTeam]);

  const availableTabs = [
    `${t("Pending")} (${pendingList.length})`,
    `${t("Published")} (${publishedList.length})`,
  ];

  const dataList = useMemo(() => {
    return activeTabIndex === 0 ? pendingList : publishedList;
  }, [activeTabIndex, pendingList, publishedList]);

  const isLoading =
    matchResultValidating || divisionValidating || fixturesValidating;

  const { user } = useAuth();
  const renderCard = (item: {
    fixture: FixtureResponse;
    matchResult?: DivisionMatchResultResponse;
  }) => {
    const { fixture, matchResult } = item;
    const totalHomePoint = matchResult
      ? matchResult.homeTotalPoints +
        matchResult.homeAdditionalPoint +
        matchResult.homePlayerPoint
      : 0;
    const totalAwayPoint = matchResult
      ? matchResult.awayTotalPoints +
        matchResult.awayAdditionalPoint +
        matchResult.awayPlayerPoint
      : 0;
    const isPlayerFromHomeTeam = fixture.homeTeam.members
      .map((p) => p.userId)
      .join(", ")
      .includes(user?.id);
    const isPlayerFromAwayTeam = fixture.awayTeam.members
      .map((p) => p.userId)
      .join(", ")
      .includes(user?.id);
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

    const numberOfSetHomeTeamWin = matchResult
      ? matchResult.gameResults.filter(
          (match) => match.homeSetResult > match.awaySetResult
        ).length
      : 0;
    const numberOfSetAwayTeamWin = matchResult
      ? matchResult.gameResults.filter(
          (match) => match.homeSetResult < match.awaySetResult
        ).length
      : 0;
    const shouldShowStatus =
      item.matchResult?.status === DivisionMatchResultStatus.Pending ||
      item.matchResult?.status === DivisionMatchResultStatus.Acknowledged ||
      item.matchResult?.status === DivisionMatchResultStatus.Rejected;
    const statusText =
      item.matchResult?.status === DivisionMatchResultStatus.Pending
        ? t("Click to Review")
        : item.matchResult?.status === DivisionMatchResultStatus.Acknowledged ||
          item.matchResult?.status === DivisionMatchResultStatus.Rejected
        ? t("Organizer Reviewing")
        : "";
    const statusBgColor =
      item.matchResult?.status === DivisionMatchResultStatus.Pending
        ? "#D0CAD9"
        : item.matchResult?.status === DivisionMatchResultStatus.Acknowledged ||
          item.matchResult?.status === DivisionMatchResultStatus.Rejected
        ? "#FCF1C3"
        : "";

    return (
      <Pressable
        onPress={() => {
          if (matchResult) {
            const myTeam = matchResult.fixture.homeTeam.members.find(
              (player) => player.userId === user?.id
            )
              ? matchResult.fixture.homeTeam
              : matchResult.fixture.awayTeam;
            const isShowApproval =
              matchResult.status === DivisionMatchResultStatus.Pending &&
              matchResult.submitted &&
              matchResult.fixture.awayTeam.id === myTeam?.id;

            navigation.navigate("MatchResult", {
              matchResult,
              matchResultId: matchResult.id,
              isShowApproval,
              flow: LeagueFlow.player,
            });
          } else if (activeTabIndex === 0) {
            navigation.navigate("SubmitMatchResult", {
              fixture,
            });
          }
        }}
        m="2"
        mx="defaultLayoutSpacing"
      >
        <MatchCardV2
          flow={LeagueFlow.player}
          matchResult={matchResult}
          fixture={fixture}
          user={user}
          badgeStatus={
            shouldShowStatus ? (
              <Badge
                _text={{ color: "rs.black" }}
                borderColor={statusBgColor}
                bg={statusBgColor}
              >
                {statusText}
              </Badge>
            ) : undefined
          }
        />
      </Pressable>
    );
  };

  useEffect(() => {
    const unsubscribe = navigation.addListener("focus", () => {
      setActiveTabIndex(0);
    });
    return unsubscribe;
  }, [navigation]);

  if (isLoading) {
    return <Loading />;
  }

  const headerComponent = () => {
    return (
      <VStack mx="defaultLayoutSpacing">
        <GhostTabbar
          items={availableTabs}
          activateColor="rs.primary_purple"
          onPress={(item: string, index: number) => {
            setActiveTabIndex(index);
          }}
          defaultIndex={activeTabIndex}
        />
      </VStack>
    );
  };

  return (
    <FlashListLayout
      headerProps={{
        title: t("Review Results"),
        hasBackButton: true,
        headerLabelStyle: { fontSize: 16 },
        containerStyle: {
          alignItems: "center",
          marginLeft: 0,
          marginRight: 4,
        },
      }}
      isSticky
      refreshing={false}
      supportPullToRefresh
      onRefresh={() => {
        mutateAll();
      }}
      flashListProps={{
        data: dataList.sort((a, b) => {
          return (
            parseISO(`${a.fixture.date} ${a.fixture.time}`).getTime() <
            parseISO(`${b.fixture.date} ${b.fixture.time}`).getTime()
          );
        }),
        renderItem: ({ item }) => renderCard(item),
        ListHeaderComponent: headerComponent(),
        ListEmptyComponent: <NoDataComponent />,
      }}
    />
  );
}

export default LeagueReviewMatchResult;
