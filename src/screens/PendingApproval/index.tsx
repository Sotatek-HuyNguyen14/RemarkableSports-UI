import React, { useCallback, useEffect, useMemo, useState } from "react";
import {
  Button,
  Heading,
  useTheme,
  VStack,
  Text,
  Toast,
  HStack,
  Pressable,
  Badge,
  Box,
} from "native-base";
import { useForm } from "react-hook-form";
import useSWR from "swr";
import {
  RouteProp,
  useFocusEffect,
  useIsFocused,
} from "@react-navigation/native";
import {
  NativeStackNavigationProp,
  NativeStackScreenProps,
} from "@react-navigation/native-stack";
import { MainStackNavigatorParamList } from "../../routers/Types";
import { getTranslation } from "../../utils/translation";
import HeaderLayout from "../../components/Layout/HeaderLayout";
import { formatCoreUrl } from "../../services/ServiceUtil";
import { getTeamsStats } from "../../services/LeagueServices";
import MatchCard from "../../components/MatchCard";
import { DivisionMatchResultStatus } from "../../models/responses/League";
import { useAuth } from "../../hooks/UseAuth";
import Loading from "../../components/Loading";
import NoDataComponent from "../../components/NoDataComponent";

export type PendingApprovalProps = NativeStackScreenProps<
  MainStackNavigatorParamList,
  "PendingApproval"
>;

const t = getTranslation(["screen.PendingApproval"]);

export default function PendingApproval({
  navigation,
  route,
}: PendingApprovalProps) {
  const { teamId, divisionId, myTeam } = route.params;
  const { user } = useAuth();

  const { data, isValidating, error, mutate } = useSWR(
    formatCoreUrl(`/result/division/${divisionId}/team/${teamId}`),
    () => {
      return getTeamsStats({
        divisionId,
        teamId,
      });
    }
  );

  useFocusEffect(
    React.useCallback(() => {
      mutate();
    }, [mutate])
  );

  return (
    <HeaderLayout
      KeyboardAwareScrollViewProps={{
        bounces: false,
      }}
      headerProps={{
        title: t("Pending Approval"),
      }}
      isSticky
    >
      {isValidating && <Loading />}
      {!isValidating && error && <Loading />}
      {!isValidating &&
        !error &&
        (!data?.matchResults || !data?.matchResults.length) && (
          <NoDataComponent />
        )}
      <VStack mx="defaultLayoutSpacing">
        {!isValidating &&
          !error &&
          data?.matchResults &&
          data?.matchResults?.length > 0 &&
          data?.matchResults?.map((val) => {
            const isShowApproval =
              val.status === DivisionMatchResultStatus.Pending &&
              val.submitted &&
              myTeam?.members.find((player) => player.userId === user?.sub) &&
              val.fixture.awayTeam.id === myTeam?.id;

            return (
              <MatchCard
                key={val.id}
                isPlayerFromAwayTeam
                matchResult={val}
                isShowApproval={!!isShowApproval}
                onCardPress={() => {
                  navigation.navigate("MatchResult", {
                    matchResultId: val.id,
                    isShowApproval: !!isShowApproval,
                  });
                }}
                onPress={() => {
                  navigation.navigate("MatchResult", {
                    matchResultId: val.id,
                    isShowApproval: !!isShowApproval,
                  });
                }}
              />
            );
          })}
      </VStack>
    </HeaderLayout>
  );
}
