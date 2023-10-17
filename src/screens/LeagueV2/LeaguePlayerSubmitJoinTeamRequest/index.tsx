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
import {
  applicationLeague,
  cancelLeague,
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
import {
  TeamApplicationStatus,
  TeamModel,
} from "../../../models/responses/League";
import { getUserName } from "../../../utils/name";
import { showApiToastSuccess } from "../../../components/ApiToastSuccess";
import { showApiToastError } from "../../../components/ApiToastError";
import { useAuth } from "../../../hooks/UseAuth";

export type LeaguePlayerSubmitJoinTeamRequestProps = NativeStackScreenProps<
  MainStackNavigatorParamList,
  "LeaguePlayerSubmitJoinTeamRequest"
>;

const t = getTranslation([
  "screen.LeaguePlayerSubmitJoinTeamRequest",
  "screen.leagueTerms",
  "constant.button",
  "formInput",
  "leagueTerms",
]);

export enum LeagueFlow {
  audience = "audience",
  player = "player",
}

function LeaguePlayerSubmitJoinTeamRequest({
  navigation,
  route,
}: LeaguePlayerSubmitJoinTeamRequestProps) {
  const { division: paramDivision } = route.params;

  const { user } = useAuth();

  const {
    data: fetchedDivision,
    mutate,
    isValidating,
  } = useSWR(formatCoreUrl(`/division/${paramDivision.id}`), () =>
    getdivisionById(paramDivision.id)
  );
  const division = fetchedDivision || paramDivision;
  const { teams } = division;
  if (!fetchedDivision?.id) {
    return <Loading />;
  }
  const playerAppliedTeam = teams.find((team) => {
    return team.members.find((member) => {
      return (
        member.userId === user?.id &&
        member.status !== TeamApplicationStatus.Rejected
      );
    });
  });
  const teamCell = (team: TeamModel) => {
    const playerDidApply = team.members.find(
      (val) =>
        val.userId === user?.id && val.status === TeamApplicationStatus.Pending
    );
    const shouldShowJoinAndCancelButton = playerAppliedTeam
      ? playerDidApply && playerAppliedTeam?.id === team.id
      : !playerDidApply;
    return (
      <HStack
        space="2"
        bg="#66CEE133"
        alignItems="center"
        p="5"
        borderRadius="xl"
      >
        <VStack space="2" flex="1">
          <Heading fontSize="md">{team.name}</Heading>
          {team.members
            .filter((member) => {
              return member.status === TeamApplicationStatus.Approved;
            })
            .map((member) => {
              return (
                member.memberInfo && (
                  <Text>{getUserName(member.memberInfo)}</Text>
                )
              );
            })}
        </VStack>
        <Pressable
          onPress={async () => {
            if (playerDidApply) {
              // Cancel
              try {
                await cancelLeague(team.id);
                showApiToastSuccess({
                  title: t("Canceled to Join Team"),
                  body: t(
                    "You will not be able to manage the results before you joined a team"
                  ),
                });
              } catch (error) {
                showApiToastError(error);
              }
            } else {
              // Apply
              try {
                await applicationLeague(team.id);
                showApiToastSuccess({
                  title: t("Applied to Join Team"),
                  body: t(
                    "Organizers Team members will review your application"
                  ),
                });
              } catch (error) {
                showApiToastError(error);
              }
            }
            mutate();
          }}
        >
          {shouldShowJoinAndCancelButton && (
            <Text fontWeight="bold" color="#31095E">
              {playerDidApply ? t("Cancel") : t("Join")}
            </Text>
          )}
        </Pressable>
      </HStack>
    );
  };

  if (isValidating) {
    return <Loading />;
  }
  return (
    <HeaderLayout
      headerProps={{
        title: t("Join Team"),
      }}
      isSticky
    >
      <VStack space="2" mx="defaultLayoutSpacing">
        {teams.length === 0 ? (
          <NoDataComponent />
        ) : (
          teams.map((team) => {
            return teamCell(team);
          })
        )}
      </VStack>
    </HeaderLayout>
  );
}

export default LeaguePlayerSubmitJoinTeamRequest;
