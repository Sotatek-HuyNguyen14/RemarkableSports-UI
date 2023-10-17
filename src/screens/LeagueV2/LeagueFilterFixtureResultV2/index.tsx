import {
  VStack,
  IconButton,
  HStack,
  Heading,
  Pressable,
  Text,
  Badge,
  Divider,
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
import { getLeagues } from "../../../services/LeagueServices";
import Loading from "../../../components/Loading";
import ErrorMessage from "../../../components/ErrorMessage";
import NoDataComponent from "../../../components/NoDataComponent";
import GoldMedalIcon from "../../../components/Icons/GoldMedalIcon";
import LeaderboardCard from "../../../components/Card/LeaderboardCard";
import FilterIconV2 from "../../../components/Icons/FilterIconV2";
import EyesIcon from "../../../components/Icons/EyesIcon";
import LeagueIcon from "../../../components/Icons/LeagueIcon";
import FlashListLayout from "../../../components/Layout/FlashListLayout";
import {
  DivisionMatchResultStatus,
  DivisionModel,
  LeagueResponse,
} from "../../../models/responses/League";
import { LeagueFlow } from "../LeagueScreenV2";
import { MatchCardV2 } from "../../OrganizerScreens/MatchResult";
import { useAuth } from "../../../hooks/UseAuth";

export type LeagueViewV2Props = NativeStackScreenProps<
  MainStackNavigatorParamList,
  "LeagueFilterFixtureResultV2"
>;

const t = getTranslation([
  "screen.LeagueFilterFixtureResultV2",
  "screen.leagueTerms",
  "constant.button",
  "formInput",
  "leagueTerms",
]);

function LeagueFilterFixtureResultV2({ navigation, route }: LeagueViewV2Props) {
  const { flow, results } = route.params;
  const { user } = useAuth();

  const roleBasedResults =
    flow === LeagueFlow.player
      ? results.filter((result) => {
          return (
            result.fixture.homeTeam.members.findIndex((member) => {
              return member.userId === user?.sub;
            }) !== -1 ||
            result.fixture.awayTeam.members.findIndex((member) => {
              return member.userId === user?.sub;
            }) !== -1
          );
        })
      : results;
  const isPlayerFlow = route.params.flow === LeagueFlow.player;

  return (
    <FlashListLayout
      headerProps={{
        title: t("Filter Results"),
        containerStyle: { marginHorizontal: 4 },
      }}
      isSticky
      flashListProps={{
        data: roleBasedResults.sort((a, b) => {
          return (
            b.fixture.round - a.fixture.round ||
            parseISO(`${b.fixture.date} ${b.fixture.time}`).getTime() -
              parseISO(`${a.fixture.date} ${a.fixture.time}`).getTime()
          );
        }),
        renderItem: ({ item }) => {
          const matchResultIsAcknowledge =
            item.matchResult &&
            item.matchResult.status === DivisionMatchResultStatus.Approved;
          // Only tapable and show point + set when the match result is approved
          return (
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
                    flow,
                    isShowApproval: isPlayerFlow && isShowApproval,
                  });
                }
              }}
              my="2"
              mx="defaultLayoutSpacing"
            >
              <MatchCardV2
                matchResult={
                  matchResultIsAcknowledge ? item.matchResult : undefined
                }
                fixture={item.fixture}
                user={user}
                flow={flow}
              />
            </Pressable>
          );
        },
        keyExtractor: (item) => `${item.matchResult?.id}_${item.fixture.id}`,
        ListEmptyComponent: <NoDataComponent />,
      }}
      supportPullToRefresh
    />
  );
}

export default LeagueFilterFixtureResultV2;
