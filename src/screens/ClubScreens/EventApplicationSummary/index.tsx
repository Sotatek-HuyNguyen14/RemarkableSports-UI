/* eslint-disable no-unsafe-optional-chaining */
import React, { useCallback, useEffect } from "react";
import { NativeStackScreenProps } from "@react-navigation/native-stack";
import {
  Avatar,
  Box,
  Button,
  Divider,
  Heading,
  HStack,
  Pressable,
  Text,
  Toast,
  useTheme,
  View,
  VStack,
} from "native-base";
import { Alert, LayoutAnimation } from "react-native";
import useSWR from "swr";
import { uniqueId } from "lodash";
import { useFocusEffect } from "@react-navigation/native";
import { getTranslation } from "../../../utils/translation";
import { MainStackNavigatorParamList } from "../../../routers/Types";
import ConfirmationModal from "../../../components/ConfirmationModal/ConfirmationModal";
import Loading from "../../../components/Loading";
import ErrorMessage from "../../../components/ErrorMessage";
import HeaderLayout from "../../../components/Layout/HeaderLayout";
import MessageToast, {
  MesssageToastType,
} from "../../../components/Toast/MessageToast";
import { ClubStaff, UserType } from "../../../models/User";
import { formatCoreUrl, formatFileUrl } from "../../../services/ServiceUtil";
import {
  ApplicationType,
  ClubApplicationResponse,
  ClubPaymentMethodResponse,
  ClubRelationship,
} from "../../../models/responses/Club";
import {
  approvalJoinClub,
  deleteClubPaymentMethod,
  getClubPaymentMethods,
  getCoachAppliedClubs,
  getCoachByClub,
  getPlayerAppliedClubs,
  getPlayerByClub,
  getStaffAppliedClubs,
  getStaffByClub,
  rejectJoinClub,
  removeClubUser,
} from "../../../services/ClubServices";
import GhostTabbar from "../../../components/GhostTabBar";
import { formatName, getUserName } from "../../../utils/name";
import { showApiToastError } from "../../../components/ApiToastError";
import { ClubStatusType } from "../../../models/requests/Club";
import { getUserById } from "../../../services/AuthServices";
import { useAuth } from "../../../hooks/UseAuth";
import {
  APPROVE_BUTTON_COLOR,
  REJECT_BUTTON_COLOR,
} from "../../../constants/constants";
import AddIconV2 from "../../../components/Icons/AddIconV2";
import TrashIcon from "../../../components/Icons/TrashIcon";
import PencilIcon from "../../../components/Icons/PencilIcon";
import { showApiToastSuccess } from "../../../components/ApiToastSuccess";
import NoAccessRight from "../../../components/NoAccessRight";
import NoDataComponent from "../../../components/NoDataComponent";
import {
  CourseApplicationResponse,
  CourseResponse,
} from "../../../models/responses/Course";
import RightArrowIcon from "../../../components/Icons/RightArrowIcon";
import CourseApplicantDetailsCard from "../../../components/CourseApplicantDetailsCard";
import { Action } from "../../../models/Response";
import { updateCourseBooking } from "../../../services/CourseBookingServices";
import {
  getEventApplicationsSummary,
  getEventPermissionById,
  updateEventApplication,
} from "../../../services/EventServices";
import {
  EventApplication,
  EventResponse,
} from "../../../models/responses/Event";
import EventApplicantDetailsCard from "../../../components/EventApplicantDetailsCard";
import TextInputModal from "../../../components/Modal/TextInputModal";

export type CourseListProps = NativeStackScreenProps<
  MainStackNavigatorParamList,
  "EventApplicationSummary"
>;
const APPROVE_SUCCESSFUL_TOAST = "ApproveSuccessful";
const REJECT_SUCCESSFUL_TOAST = "RejectSuccessful";
const t = getTranslation([
  "screen.ClubHomeV2",
  "screen.ClubScreens.ManageEvent",
  "constant.button",
  "constant.profile",
  "toastMessage",
  "component.Player.PlayerProfile",
  "screen.ClubScreens.ManageEvent",
  "constant.district",
  "constant.eventType",
  "formInput",
]);

export default function EventApplicationSummary({
  navigation,
  route,
}: CourseListProps) {
  const { user } = useAuth();
  const {
    data: eventApplicationsSummary,
    mutate,
    isValidating,
  } = useSWR(formatCoreUrl(`/event-application-summary`), () =>
    getEventApplicationsSummary()
  );

  useFocusEffect(
    useCallback(() => {
      mutate();
    }, [mutate])
  );

  const [rejectApplicationModal, setRejectApplicationModal] =
    React.useState(false);
  const [selectedEventApplication, setSelectedEventApplication] =
    React.useState<EventApplication>();
  const [selectedEventId, setSelectedEventId] = React.useState<
    string | number
  >();

  const upwrappedDataList = eventApplicationsSummary || [];

  const onAction = async ({
    action,
    application,
    reasonReject,
    eventId,
  }: {
    action: Action;
    application: EventApplication;
    reasonReject: string;
    eventId: string | number;
  }) => {
    if (eventId) {
      try {
        const res = await updateEventApplication({
          action,
          eventId,
          applicationId: application.id,
          parameters: {
            reasonReject: reasonReject || "",
          },
        });

        mutate();
        showApiToastSuccess({});
      } catch (updateApplicationError) {
        showApiToastError(updateApplicationError);
      }
    }
  };

  const renderItem = (
    item: {
      event: EventResponse;
      eventApplications: EventApplication[];
    },
    index: number
  ) => {
    return (
      <VStack key={item.event.id} space="3">
        <HStack alignItems="center" justifyContent="space-between">
          <Heading
            fontSize="lg"
            color="rs.primary_purple"
          >{`${item.event.name}`}</Heading>
          <Pressable
            onPress={() => {
              navigation.navigate("PlayerEventDetails", {
                eventId: item.event.id,
              });
            }}
          >
            <HStack alignItems="center" space="2">
              <Text color="rs.primary_purple">{t("Details")}</Text>
              <RightArrowIcon />
            </HStack>
          </Pressable>
        </HStack>
        <Divider />
        {item.eventApplications.map((application) => {
          return (
            <VStack
              bg="rs.white"
              p="4"
              py="5"
              borderRadius="2xl"
              shadow="9"
              style={{
                shadowOffset: {
                  width: 5,
                  height: 5,
                },
                shadowOpacity: 0.1,
                elevation: 3,
              }}
            >
              <EventApplicantDetailsCard
                onPressCard={() => {
                  navigation.navigate("ManageEvent", {
                    eventId: item.event.id,
                  });
                }}
                horizontalButton
                application={application}
                onPressApprove={async () => {
                  await onAction({
                    action: Action.Approve,
                    application,
                    reasonReject: "",
                    eventId: item.event.id,
                  });
                  mutate();
                }}
                onPressReject={() => {
                  setSelectedEventId(item.event.id);
                  setSelectedEventApplication(application);
                  setRejectApplicationModal(true);
                }}
              />
            </VStack>
          );
        })}
      </VStack>
    );
  };

  if (isValidating) {
    return <Loading />;
  }

  return (
    <HeaderLayout
      KeyboardAwareScrollViewProps={{
        bounces: false,
      }}
      headerProps={{
        title: t("Event Applications"),
        containerStyle: { marginHorizontal: 0 },
      }}
    >
      <VStack mx="4" space={6} flex={1}>
        {upwrappedDataList.length === 0 && (
          <VStack justifyContent="center" alignItems="center" flex="1">
            <NoAccessRight
              title={t("No Applications")}
              description={t("There is no application pending for approval")}
            />
          </VStack>
        )}
        {upwrappedDataList.length > 0 &&
          upwrappedDataList.map((item, index) => {
            return renderItem(item, index);
          })}
      </VStack>
      <TextInputModal
        heading={t("Reject")}
        description={t("Please provide reason for rejecting the application")}
        isOpen={rejectApplicationModal}
        onClose={() => {
          setRejectApplicationModal(false);
        }}
        onPressSubmit={async (reasonReject: string) => {
          if (selectedEventApplication && selectedEventId) {
            await onAction({
              action: Action.Reject,
              reasonReject,
              application: selectedEventApplication,
              eventId: selectedEventId,
            });
            setRejectApplicationModal(false);
            mutate();
          }
        }}
      />
    </HeaderLayout>
  );
}
