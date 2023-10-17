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
import useSWR, { mutate } from "swr";
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
  getLeagues,
  getTeamById,
  getTeamsStats,
  getdivisionById,
  removeTeamMembers,
  updateJoinTeamRequestForMember,
} from "../../../services/LeagueServices";
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
  DivisionMatchResultResponse,
  DivisionModel,
  LeagueResponse,
  TeamApplicationStatus,
  TeamMember,
} from "../../../models/responses/League";
import { LeagueFlow } from "../LeagueScreenV2";
import TeamRequestCard from "../../../components/TeamRequestCard";
import { Action } from "../../../models/Response";
import { showApiToastError } from "../../../components/ApiToastError";
import { showApiToastSuccess } from "../../../components/ApiToastSuccess";
import ConfirmationModal from "../../../components/ConfirmationModal/ConfirmationModal";
import { getUserName } from "../../../utils/name";
import MatchCard from "../../../components/MatchCard";
import Card from "../../../components/Card/Card";
import LocationIcon from "../../../components/Icons/LocationIcon";
import {
  formatUtcToLocalDate,
  formatUtcToLocalTime,
} from "../../../utils/date";
import { MatchCardV2 } from "../../OrganizerScreens/MatchResult";
import { useAuth } from "../../../hooks/UseAuth";

export type LeagueTeamManagementProps = NativeStackScreenProps<
  MainStackNavigatorParamList,
  "LeagueTeamManagement"
>;

const t = getTranslation([
  "screen.LeagueTeamManagement",
  "constant.button",
  "formInput",
  "leagueTerms",
  "component.MatchCard",
  "toastMessage",
]);

function LeagueTeamManagement({
  navigation,
  route,
}: LeagueTeamManagementProps) {
  const { teamId, divisionId } = route.params;
  const {
    data: team,
    isValidating: teamIsValidating,
    error,
    mutate: teamMutate,
  } = useSWR(formatCoreUrl(`/divisionId/${teamId}`), () => getTeamById(teamId));

  const {
    data: teamStatistics,
    isValidating: teamStatisticsValidating,
    mutate: teamStatisticMutate,
  } = useSWR(
    formatCoreUrl(`/result/division/${divisionId}/team/${teamId}`),
    () => {
      return getTeamsStats({
        divisionId,
        teamId,
      });
    }
  );
  const { user } = useAuth();

  const [selectedRemoveMember, setSelectedRemoveMember] =
    useState<TeamMember>();
  const [removePlayerModalOpen, setRemovePlayerModalOpen] = useState(false);

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
    const isPlayerFromHomeTeam = matchResult.fixture.homeTeam.id === teamId;

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
    const resultColor = isWin
      ? "rs_secondary.green"
      : isLose
      ? "rs_secondary.error"
      : "#6D6D6D";
    const status = isWin ? t("WIN") : isLose ? t("LOSE") : t("DRAW");
    const bg = isWin ? "#00B81233" : isLose ? "#E7101033" : "rs.white";
    const homeTeamPoint = matchResult
      ? matchResult.homeAdditionalPoint +
        matchResult.homePlayerPoint +
        matchResult.homeTotalPoints
      : "-";
    const awayTeamPoint = matchResult
      ? matchResult.awayAdditionalPoint +
        matchResult.awayPlayerPoint +
        matchResult.awayTotalPoints
      : "-";
    const numberOfSetHomeTeamWin =
      matchResult && matchResult.gameResults
        ? matchResult.gameResults.filter(
            (match) => match.homeSetResult > match.awaySetResult
          ).length
        : "-";
    const numberOfSetAwayTeamWin =
      matchResult && matchResult.gameResults
        ? matchResult.gameResults.filter(
            (match) => match.homeSetResult < match.awaySetResult
          ).length
        : "-";

    return (
      <Pressable
        onPress={() => {
          navigation.navigate("MatchResult", {
            matchResultId: matchResult.id,
            flow: LeagueFlow.player,
          });
        }}
        space="2"
        mt="4"
        key={id}
      >
        <MatchCardV2
          matchResult={matchResult}
          fixture={fixture}
          user={user}
          flow={LeagueFlow.player}
        />
      </Pressable>
    );
  };

  const onRemovePlayer = async () => {
    if (selectedRemoveMember) {
      setRemovePlayerModalOpen(false);
      try {
        await removeTeamMembers(selectedRemoveMember.id);
        showApiToastSuccess({});

        teamMutate();
        teamStatisticMutate();
      } catch (removeError) {
        showApiToastError(removeError);
      }
    }
  };

  const onAction = async ({
    action,
    teamApplication,
    reasonReject,
  }: {
    action: Action;
    teamApplication: TeamMember;
    reasonReject: string;
  }) => {
    try {
      await updateJoinTeamRequestForMember({
        memberId: teamApplication.id,
        action,
        rejectReason: reasonReject,
      });
      showApiToastSuccess({ title: `${t(action)}${t("Successful")}` });
      teamMutate();
    } catch (updateApplicationError) {
      showApiToastError(updateApplicationError);
    }
  };

  const contentView = () => {
    if (team) {
      const unwrappedMatchResults =
        teamStatistics && teamStatistics.matchResults
          ? teamStatistics.matchResults
          : [];
      return (
        <VStack space="3">
          {/* Team name */}
          <Text fontSize="md">
            {`${t("Team name")}: `}
            <Heading fontSize="md">{team.name}</Heading>
          </Text>
          {/* Player management */}
          <Heading fontSize="md">{t("Players")}</Heading>
          {/* - Pending application */}
          {team.members
            .filter((member) => {
              return member.status === TeamApplicationStatus.Pending;
            })
            .map((member) => {
              return (
                <VStack space="1" key={member.id}>
                  <TeamRequestCard
                    application={member}
                    onPressApprove={async () => {
                      await onAction({
                        action: Action.Approve,
                        teamApplication: member,
                        reasonReject: "",
                      });
                    }}
                    onPressReject={async () => {
                      await onAction({
                        action: Action.Reject,
                        teamApplication: member,
                        reasonReject: "",
                      });
                    }}
                  />
                  <Divider mt="3" />
                </VStack>
              );
            })}
          {/* - Approved application */}
          {team.members
            .filter((member) => {
              return member.status === TeamApplicationStatus.Approved;
            })
            .map((member) => {
              return (
                <VStack space="1" key={member.id}>
                  <TeamRequestCard
                    key={member.id}
                    application={member}
                    onPressRemove={() => {
                      setSelectedRemoveMember(member);
                      setRemovePlayerModalOpen(true);
                    }}
                  />
                  <Divider mt="3" />
                </VStack>
              );
            })}
          {/* Recent matches info */}
          <Heading fontSize="md">{t("Recent Matches")}</Heading>
          {unwrappedMatchResults.length === 0 && <NoDataComponent />}
          {unwrappedMatchResults.length > 0 &&
            unwrappedMatchResults.map((matchResult) => {
              return matchCard(matchResult);
            })}
        </VStack>
      );
    }
  };

  const isValidating = teamIsValidating || teamStatisticsValidating;
  if (isValidating) {
    return <Loading />;
  }

  return (
    <HeaderLayout
      headerProps={{
        title: t("Team Management"),
      }}
      isSticky
    >
      <VStack mx="defaultLayoutSpacing" flex="1" space="5">
        {(error || !team) && <ErrorMessage />}
        {contentView()}
      </VStack>
      {/* Modals */}
      <ConfirmationModal
        alertType="Fail"
        confirmText={t("Confirm")}
        cancelText={t("Cancel")}
        isOpen={removePlayerModalOpen}
        onCancel={() => {
          setRemovePlayerModalOpen(false);
        }}
        title={`${t("Confirm to remove")} ${getUserName(
          selectedRemoveMember?.memberInfo
        )}`}
        onConfirm={async () => {
          await onRemovePlayer();
        }}
      />
    </HeaderLayout>
  );
}

export default LeagueTeamManagement;
