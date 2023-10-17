import { VStack, useTheme, Text, Box, Toast } from "native-base";
import React, { useRef, useState } from "react";
import useSWR from "swr";
import { LayoutAnimation } from "react-native";
import { NativeStackScreenProps } from "@react-navigation/native-stack";
import HeaderLayout from "../../components/Layout/HeaderLayout";
import { getTranslation } from "../../utils/translation";
import { MainStackNavigatorParamList } from "../../routers/Types";
import GhostTabbar from "../../components/GhostTabBar";
import {
  TeamApplicationStatus,
  TeamMember,
} from "../../models/responses/League";
import TeamManageDetailsCard from "../../components/TeamManageDetailsCard";
import TextInputModal from "../../components/Modal/TextInputModal";
import ConfirmationModal from "../../components/ConfirmationModal/ConfirmationModal";
import { formatCoreUrl } from "../../services/ServiceUtil";
import {
  approveOrRejectJoinTeam,
  getTeamById,
  removeTeamMembers,
} from "../../services/LeagueServices";
import ErrorMessage from "../../components/ErrorMessage";
import Loading from "../../components/Loading";
import LineBreak from "../../components/LineBreak/LineBreak";
import {
  ApproveTeamRequest,
  TeamApprovalAction,
} from "../../models/requests/Language";
import MessageToast, {
  MesssageToastType,
} from "../../components/Toast/MessageToast";
import { showApiToastError } from "../../components/ApiToastError";
import { formatName, getUserName } from "../../utils/name";
import NoDataComponent from "../../components/NoDataComponent";

export type DivisionScreenProps = NativeStackScreenProps<
  MainStackNavigatorParamList,
  "ManageTeam"
>;

const t = getTranslation(["screen.ManageTeam", "constant.button"]);

enum ActiveTab {
  Request = "Request",
  "Confirmed list" = "Confirmed list",
}

export function ManageTeam({ navigation, route }: DivisionScreenProps) {
  const theme = useTheme();
  const { team, teamId } = route.params;

  const {
    data,
    isValidating: teamValidating,
    error: teamMemberError,
    mutate: teamMemberMutate,
  } = useSWR(teamId ? formatCoreUrl(`/team/${teamId}`) : null, () => {
    if (teamId) {
      return getTeamById(teamId);
    }
  });

  const teamResult = team || data;
  const [activeTabIndex, setActiveTabIndex] = React.useState(0);
  const [selectedApplication, setSelectedApplication] =
    React.useState<TeamMember>();
  const [selectedRemove, setSelectedRemove] = React.useState<TeamMember>();
  const [isLoading, setLoading] = React.useState(false);
  const [isModalOpen, setIsOpen] = React.useState({
    reject: false,
    remove: false,
  });
  const availableTabs = [t(ActiveTab.Request), t(ActiveTab["Confirmed list"])];

  const noPlayer = () => (
    <Box flex={1} mt="10">
      <NoDataComponent content={t("There is no Player")} />
    </Box>
  );
  const requestList = teamResult?.members?.filter(
    (val) => val.status === TeamApplicationStatus.Pending
  );

  const memberList = teamResult?.members?.filter(
    (val) => val.status === TeamApplicationStatus.Approved
  );

  const onApproveOrReject = async (payload: ApproveTeamRequest) => {
    try {
      setLoading(true);
      const res = await approveOrRejectJoinTeam({
        memberId: payload.memberId,
        action: payload.action,
        rejectReason: payload.rejectReason,
      });
      await teamMemberMutate();
      setLoading(false);
      if (!Toast.isActive("ApproveOr_Reject_Toast")) {
        Toast.show({
          id: "ApproveOr_Reject_Toast",
          placement: "top",
          duration: 2000,
          render: () => {
            return (
              <MessageToast
                type={MesssageToastType.Success}
                title={t("Successfully")}
                body={
                  payload.action === TeamApprovalAction.Approve
                    ? t("Approve Successfully")
                    : t("Reject Successfully")
                }
              />
            );
          },
        });
      }
    } catch (error) {
      showApiToastError(error);
      setLoading(false);
    }
  };

  const onRemove = async (id: number) => {
    try {
      setLoading(true);
      const res = await removeTeamMembers(id);
      await teamMemberMutate();
      setLoading(false);
      if (!Toast.isActive("Remove_Toast")) {
        Toast.show({
          id: "Remove_Toast",
          placement: "top",
          duration: 2000,
          render: () => {
            return (
              <MessageToast
                type={MesssageToastType.Success}
                title={t("Successfully")}
                body={t("You have successfully remove player")}
              />
            );
          },
        });
      }
    } catch (error) {
      showApiToastError(error);
      setLoading(false);
    }
  };

  return (
    <HeaderLayout
      KeyboardAwareScrollViewProps={{
        bounces: false,
      }}
      headerProps={{
        title: activeTabIndex === 0 ? t("My team request") : teamResult?.name,
        containerStyle: { marginHorizontal: 0 },
        hasBackButton: true,
      }}
      isSticky
    >
      <VStack py="defaultLayoutSpacing">
        <GhostTabbar
          isShowBottomLine
          isFlex
          defaultIndex={activeTabIndex}
          items={availableTabs}
          onPress={(item: string, index: number) => {
            LayoutAnimation.configureNext(
              LayoutAnimation.Presets.easeInEaseOut
            );
            setActiveTabIndex(index);
          }}
          activateColor={theme.colors.rs.primary_purple}
          unActivateColor={theme.colors.rs.inputLabel_grey}
          tabProps={{
            fontSize: 16,
            textAlign: "center",
            flex: 1,
          }}
        />

        {!teamMemberError &&
          !teamValidating &&
          !isLoading &&
          activeTabIndex === 0 &&
          requestList &&
          requestList?.length > 0 &&
          requestList.map((val, index) => (
            <VStack
              p="defaultLayoutSpacing"
              key={`TeamMember_${val.id}_${val.userId}`}
            >
              <TeamManageDetailsCard
                isLoading={isLoading}
                member={val}
                onPressApprove={async () => {
                  await onApproveOrReject({
                    memberId: val.id,
                    action: TeamApprovalAction.Approve,
                  });
                }}
                onPressReject={() =>
                  setIsOpen((prev) => {
                    setSelectedApplication(val);
                    return { ...prev, reject: true };
                  })
                }
              />
              {index !== requestList.length - 1 && <LineBreak />}
            </VStack>
          ))}

        {!teamMemberError &&
          !teamValidating &&
          !isLoading &&
          activeTabIndex === 1 &&
          memberList &&
          memberList?.length > 0 &&
          memberList?.map((val, index) => (
            <VStack
              p="defaultLayoutSpacing"
              key={`TeamMember_${val.id}_${val.userId}`}
            >
              <TeamManageDetailsCard
                isLoading={isLoading}
                isRequest={false}
                member={val}
                onRemove={() => {
                  setIsOpen((prev) => {
                    setSelectedRemove(val);
                    return { ...prev, remove: true };
                  });
                }}
              />
              {index !== memberList.length - 1 && <LineBreak />}
            </VStack>
          ))}

        {!teamMemberError &&
          !teamValidating &&
          !isLoading &&
          activeTabIndex === 0 &&
          (!requestList || !requestList.length) &&
          noPlayer()}

        {!teamMemberError &&
          !teamValidating &&
          !isLoading &&
          activeTabIndex === 1 &&
          (!memberList || !memberList.length) &&
          noPlayer()}
        {teamMemberError && (!teamValidating || !isLoading) && (
          <Box flex={1} mt="10">
            <ErrorMessage />
          </Box>
        )}
        {(teamValidating || isLoading) && (
          <Box flex={1} mt="10">
            <Loading />
          </Box>
        )}
      </VStack>
      <TextInputModal
        heading={t("Reject")}
        description={t("Please provide reason for rejecting the application")}
        isOpen={isModalOpen.reject}
        onClose={() => {
          setIsOpen((prev) => ({ ...prev, reject: false }));
        }}
        onPressSubmit={async (reasonReject: string) => {
          if (selectedApplication) {
            await onApproveOrReject({
              memberId: selectedApplication.id,
              action: TeamApprovalAction.Reject,
              rejectReason: reasonReject,
            });
            setIsOpen((prev) => ({ ...prev, reject: false }));
          }
        }}
      />
      <ConfirmationModal
        isOpen={isModalOpen.remove}
        alertType="Fail"
        title={t("Are you sure to remove %{playerName}?", {
          playerName: selectedRemove?.memberInfo
            ? getUserName(selectedRemove?.memberInfo)
            : "",
        })}
        cancelText={t("Cancel")}
        confirmText={t("Confirm")}
        onConfirm={async () => {
          if (selectedRemove) {
            onRemove(selectedRemove.id);
          }
          setIsOpen((prev) => ({ ...prev, remove: false }));
        }}
        onCancel={() => {
          setIsOpen((prev) => ({ ...prev, remove: false }));
        }}
      />
    </HeaderLayout>
  );
}
