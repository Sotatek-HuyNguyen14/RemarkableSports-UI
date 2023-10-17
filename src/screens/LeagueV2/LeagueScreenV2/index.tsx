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

export type LeagueScreenV2Props = NativeStackScreenProps<
  MainStackNavigatorParamList,
  "LeagueScreenV2"
>;

const t = getTranslation([
  "screen.LeagueScreenV2",
  "constant.button",
  "formInput",
  "leagueTerms",
]);

export enum LeagueFlow {
  audience = "audience",
  player = "player",
}

function LeagueScreenV2({ navigation, route }: LeagueScreenV2Props) {
  const viewType = (value: {
    icon: string;
    title: string;
    description: string;
    color: string;
    type: LeagueFlow;
  }) => {
    return (
      <Pressable
        flex="1"
        onPress={() => {
          navigation.navigate("LeagueViewV2", {
            flow: value.type,
          });
        }}
      >
        <VStack
          flex="1"
          minW="100%"
          maxHeight="100%"
          justifyContent="center"
          alignItems="center"
          borderWidth="1"
          borderColor={value.color}
          space="3"
          p="defaultLayoutSpacing"
          borderRadius="xl"
        >
          {value.icon === "eyes" ? (
            <EyesIcon strokeColor="rs.black" size="3xl" />
          ) : (
            <LeagueIcon size="2xl" />
          )}
          <Heading fontSize="md">{value.title}</Heading>
          <Text textAlign="center">{value.description}</Text>
        </VStack>
      </Pressable>
    );
  };

  return (
    <HeaderLayout
      headerProps={{
        title: t("League"),
      }}
      isSticky
    >
      <VStack mx="defaultLayoutSpacing" flex="1" space="5">
        {[
          {
            icon: "eyes",
            title: t("Audience"),
            description: t(
              "View the fixture, results and statistics for different leagues"
            ),
            color: "#66CEE1",
            type: LeagueFlow.audience,
          },
          {
            icon: "champion",
            title: t("Player"),
            description: t(
              "Join your team to view your schedule and manage the results"
            ),
            color: "#31095E",
            type: LeagueFlow.player,
          },
        ].map((leagueViewType) => {
          return viewType(leagueViewType);
        })}
      </VStack>
    </HeaderLayout>
  );
}

export default LeagueScreenV2;
