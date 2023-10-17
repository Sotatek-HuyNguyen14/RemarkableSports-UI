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
} from "native-base";
import { useForm } from "react-hook-form";
import useSWR from "swr";
import { RouteProp, useFocusEffect } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { MainStackNavigatorParamList } from "../../../routers/Types";
import { Store } from "../../../stores";
import HeaderLayout from "../../../components/Layout/HeaderLayout";
import FormInput from "../../../components/FormInput/FormInput";
import { getTranslation } from "../../../utils/translation";
import DownArrowIcon from "../../../components/Icons/DownArrowIcon";
import OneColumnPickerModal from "../../../components/Modal/OneColumnPickerModal";
import FormSwitch from "../../../components/Switch/FormSwitch";
import { yearList, monthList, dateList } from "../../../constants/Time";
import { getAllDistricts } from "../../../constants/Districts";
import { formatCoreUrl } from "../../../services/ServiceUtil";
import { isPositiveNumber } from "../../../utils/strings";
import { CreateEventRequest } from "../../../models/requests/Event";
import { useAuth } from "../../../hooks/UseAuth";
import CustomFormInput from "../../../components/CustomFormInput/CustomFormInput";
import CustomInput from "../../../components/FormInput/CustomInput";
import PencilIcon from "../../../components/Icons/PencilIcon";
import BinIcon from "../../../components/Icons/BinIcon";
import CheckIcon from "../../../components/Icons/CheckIcon";
import ChooseIcon from "../../../components/Icons/ChooseIcon";
import ConfirmationModal from "../../../components/ConfirmationModal/ConfirmationModal";
import { showApiToastError } from "../../../components/ApiToastError";
import TipIcon from "../../../components/Icons/TipIcon";
import GreenTipIcon from "../../../components/Icons/GreenTipIcon";
import TeamRequestCard from "../../../components/TeamRequestCard";
import LineBreak from "../../../components/LineBreak/LineBreak";
import { Action } from "../../../models/Response";
import MessageToast, {
  MesssageToastType,
} from "../../../components/Toast/MessageToast";
import TextInputModal from "../../../components/Modal/TextInputModal";
import {
  TeamApplicationStatus,
  TeamMember,
} from "../../../models/responses/League";
import {
  getTeamById,
  updateJoinTeamRequestForMember,
} from "../../../services/LeagueServices";
import Loading from "../../../components/Loading";

export type TeamRequestPropsNavigationProp = NativeStackNavigationProp<
  MainStackNavigatorParamList,
  "TeamRequest"
>;

type TeamRequestPropsBaseProps = RouteProp<
  MainStackNavigatorParamList,
  "TeamRequest"
>;

export interface TeamRequestProps extends TeamRequestPropsBaseProps {
  store: Store;
  route: TeamRequestPropsBaseProps;
  navigation: TeamRequestPropsNavigationProp;
}

export interface FormValue {
  name: string;
  season: string;
  divisions: [];
  newTeam: { team: string }[];
  newEditedName: string;
}

const t = getTranslation([
  "constant.district",
  "constant.eventType",
  "screen.OrganizerScreens.TeamRequest",
  "constant.profile",
  "constant.button",
  "formInput",
  "leagueTerms",
  "toastMessage",
]);

export default function TeamRequest({ navigation, route }: TeamRequestProps) {
  const theme = useTheme();

  const { teamId, teamParam } = route.params;

  const [activePage, setActivePage] = useState(0);
  const [rejectApplicationModal, setRejectApplicationModal] = useState(false);
  const [selectedEventApplication, setSelectedEventApplication] =
    useState<TeamMember | null>();

  const {
    data: team,
    isValidating: teamValidating,
    error: teamMemberError,
    mutate: teamMemberMutate,
  } = useSWR(teamId ? formatCoreUrl(`/team/${teamId}`) : null, () => {
    if (teamId) {
      return getTeamById(teamId);
    }
  });

  const mutateAll = useCallback(() => {
    teamMemberMutate();
  }, [teamMemberMutate]);

  useFocusEffect(
    React.useCallback(() => {
      mutateAll();
    }, [mutateAll])
  );

  const teamResult = teamParam || team;

  const tabSelectors = () => {
    return (
      <HStack>
        <Pressable
          onPress={() => {
            setActivePage(0);
          }}
          flex="1"
          borderBottomWidth="2"
          borderBottomColor={
            activePage === 0 ? "rs.primary_purple" : "rs.button_grey"
          }
          p="4"
          justifyContent="center"
          alignItems="center"
        >
          <Text
            fontWeight="bold"
            fontSize="md"
            color={activePage === 0 ? "rs.primary_purple" : "rs.button_grey"}
          >
            {t("Request")}
          </Text>
        </Pressable>
        <Pressable
          onPress={() => {
            setActivePage(1);
          }}
          flex="1"
          borderBottomWidth="2"
          borderBottomColor={
            activePage === 1 ? "rs.primary_purple" : "rs.button_grey"
          }
          p="4"
          justifyContent="center"
          alignItems="center"
        >
          <Text
            fontWeight="bold"
            fontSize="md"
            color={activePage === 1 ? "rs.primary_purple" : "rs.button_grey"}
          >
            {t("Confirmed")}
          </Text>
        </Pressable>
      </HStack>
    );
  };

  const allMembers = (teamResult && teamResult.members) || [];
  const applyingMembers = allMembers.filter(
    (member) => member.status === TeamApplicationStatus.Pending
  );
  const confirmedMembers = allMembers.filter(
    (member) => member.status === TeamApplicationStatus.Approved
  );

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
      Toast.show({
        id: "actionSuccess",
        duration: 2000,
        placement: "top",
        render: () => {
          return (
            <MessageToast
              type={MesssageToastType.Success}
              title={`${t(action)}${t("Successful")}`}
            />
          );
        },
      });
      mutateAll();
    } catch (updateApplicationError) {
      showApiToastError(updateApplicationError);
    }
  };

  const applyingView = () => {
    if (applyingMembers.length === 0) {
      return (
        <VStack mt="2" flex="1" justifyContent="center" alignItems="center">
          <Text>{t("There is no applying request")}</Text>
        </VStack>
      );
    }
    return (
      <VStack space="2">
        {applyingMembers.map((member) => {
          return (
            <VStack space="3">
              <TeamRequestCard
                application={member}
                onPressApprove={async () => {
                  await onAction({
                    action: Action.Approve,
                    teamApplication: member,
                    reasonReject: "",
                  });
                }}
                onPressReject={() => {
                  setSelectedEventApplication(member);
                  setRejectApplicationModal(true);
                }}
              />
              <LineBreak />
            </VStack>
          );
        })}
      </VStack>
    );
  };

  const confirmedView = () => {
    if (confirmedMembers.length === 0) {
      return (
        <VStack mt="2" flex="1" justifyContent="center" alignItems="center">
          <Text>{t("There is no member in this team")}</Text>
        </VStack>
      );
    }
    return (
      <VStack space="2">
        {confirmedMembers.map((member) => {
          return (
            <VStack space="3">
              <TeamRequestCard
                shouldShowStatus={false}
                application={member}
                onPressApprove={async () => {
                  await onAction({
                    action: Action.Approve,
                    teamApplication: member,
                    reasonReject: "",
                  });
                }}
                onPressReject={() => {
                  setSelectedEventApplication(member);
                  setRejectApplicationModal(true);
                }}
              />
              <LineBreak />
            </VStack>
          );
        })}
      </VStack>
    );
  };

  return (
    <HeaderLayout
      KeyboardAwareScrollViewProps={{
        bounces: false,
      }}
      headerProps={{
        title: (teamResult && teamResult.name) || t("Team"),
        containerStyle: {
          marginHorizontal: 0,
        },
      }}
      isSticky
    >
      <VStack space="4" my="2">
        {tabSelectors()}
      </VStack>
      {teamValidating ? (
        <VStack flex="1" justifyContent="center" alignItems="center">
          <Loading />
        </VStack>
      ) : (
        <VStack mx="defaultLayoutSpacing">
          {activePage === 0 && applyingView()}
          {activePage === 1 && confirmedView()}
        </VStack>
      )}
      <TextInputModal
        heading={t("Reject request")}
        description={t("Please provide reason for rejecting")}
        isOpen={rejectApplicationModal}
        onClose={() => {
          setRejectApplicationModal(false);
        }}
        onPressSubmit={async (reasonReject: string) => {
          if (selectedEventApplication) {
            await onAction({
              action: Action.Reject,
              reasonReject,
              teamApplication: selectedEventApplication,
            });
            setRejectApplicationModal(false);
          }
        }}
      />
    </HeaderLayout>
  );
}
