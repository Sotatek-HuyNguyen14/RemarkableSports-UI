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
  DivisionModel,
  LeagueResponse,
} from "../../../models/responses/League";
import { LeagueFlow } from "../LeagueScreenV2";
import { getUserName } from "../../../utils/name";

export type LeagueViewV2Props = NativeStackScreenProps<
  MainStackNavigatorParamList,
  "LeagueViewV2"
>;

const t = getTranslation([
  "screen.LeagueViewV2",
  "screen.leagueTerms",
  "constant.button",
  "formInput",
  "leagueTerms",
]);

function LeagueViewV2({ navigation, route }: LeagueViewV2Props) {
  const { flow } = route.params;
  const {
    data: leagueList,
    isValidating: leagueListIsValidating,
    error: leagueListError,
    mutate: leagueListMutate,
  } = useSWR(formatCoreUrl("/league"), () => getLeagues());

  const onPressDivision = (division: DivisionModel, league: LeagueResponse) => {
    if (flow === LeagueFlow.audience) {
      navigation.navigate("LeagueAudienceDivision", {
        league,
        selectedDivisionId: division.id,
      });
    } else {
      navigation.navigate("LeaguePlayerDivision", {
        league,
        division,
      });
    }
  };

  const leagueItem = (item: LeagueResponse) => {
    return (
      <VStack key={item.id} space="3" mx="defaultLayoutSpacing" mb="2">
        {/* League name / Org name / Division / Season */}
        <HStack alignItems="center" justifyContent="space-between">
          <VStack space="1">
            <Heading>{item.name}</Heading>
            <Text>{getUserName(item.creator)}</Text>
          </VStack>
          <Badge
            borderColor="#66CEE133"
            variant="outline"
            bg="#66CEE133"
            mr={3}
            _text={{ color: "rs.black", fontWeight: "normal" }}
          >
            {`${t("Season")} ${item.season}`}
          </Badge>
        </HStack>
        {/* Division */}
        <HStack width="100%" flexWrap="wrap">
          {item.divisions.map((division) => {
            return (
              <Pressable
                key={division.id}
                onPress={() => {
                  onPressDivision(division, item);
                }}
                width="45%"
                m="1"
                bg="#F6F6F6"
                p="3"
                borderRadius="lg"
              >
                <HStack flex="1">
                  <Text fontSize="sm" fontWeight="bold">
                    {division.name}
                  </Text>
                </HStack>
              </Pressable>
            );
          })}
        </HStack>
        <Divider mb="2" />
      </VStack>
    );
  };

  if (leagueListIsValidating) {
    return <Loading />;
  }

  const unwrappedLeagueList = leagueList || [];

  return (
    <FlashListLayout
      headerProps={{
        title: t("League"),
        containerStyle: { marginHorizontal: 4 },
      }}
      isSticky
      flashListProps={{
        data: unwrappedLeagueList,
        renderItem: ({ item }) => {
          return leagueItem(item);
        },
        keyExtractor: (item) => `${item.id}`,
        ListEmptyComponent: <NoDataComponent />,
      }}
      supportPullToRefresh
      onRefresh={() => {
        leagueListMutate();
      }}
    />
  );
}

export default LeagueViewV2;
