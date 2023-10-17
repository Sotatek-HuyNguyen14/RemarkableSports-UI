/* eslint-disable no-unsafe-optional-chaining */
import React, { useCallback, useEffect, useState } from "react";
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
import {
  getCourseLeaveRequestsSummary,
  updateCourseLeaveRequest,
} from "../../../services/CourseServices";
import NoDataComponent from "../../../components/NoDataComponent";
import {
  CourseApplicationResponse,
  CourseLeaveRequest,
  CourseResponse,
} from "../../../models/responses/Course";
import RightArrowIcon from "../../../components/Icons/RightArrowIcon";
import CourseApplicantDetailsCard from "../../../components/CourseApplicantDetailsCard";
import { Action } from "../../../models/Response";
import { updateCourseBooking } from "../../../services/CourseBookingServices";
import CourseLeaveRequestCard from "../../../components/CourseLeaveRequestCard";
import TextInputModal from "../../../components/Modal/TextInputModal";

export type CourseListProps = NativeStackScreenProps<
  MainStackNavigatorParamList,
  "CourseLeaveApplicationsSummary"
>;
const APPROVE_SUCCESSFUL_TOAST = "ApproveSuccessful";
const REJECT_SUCCESSFUL_TOAST = "RejectSuccessful";
const t = getTranslation([
  "screen.ClubHomeV2",
  "screen.ClubScreens.ManageCourse",
  "constant.button",
  "constant.profile",
  "toastMessage",
  "component.Player.PlayerProfile",
]);

export default function CourseLeaveApplicationsSummary({
  navigation,
  route,
}: CourseListProps) {
  const { user } = useAuth();
  const {
    data: courseApplicationsSummary,
    mutate,
    isValidating: isLoading,
  } = useSWR(formatCoreUrl(`/course-leave-application-summary`), () =>
    getCourseLeaveRequestsSummary()
  );

  useFocusEffect(
    useCallback(() => {
      mutate();
    }, [mutate])
  );

  const [isOpen, setIsOpen] = useState({
    manualAddMakeUpSession: false,
    leaveRequestModalOpen: false,
  });
  const [rejectLeaveApplicationOpen, setRejectLeaveApplicationOpen] =
    useState(false);
  const [selectedLeaveApplication, setSelectedLeaveApplication] =
    useState<CourseLeaveRequest | null>(null);

  const upwrappedDataList = courseApplicationsSummary || [];

  const onCourseLeaveRequestAction = async (
    leaveRequest: CourseLeaveRequest,
    action: Action,
    rejectReason: String = ""
  ) => {
    const { courseSessionInfo, playerId } = leaveRequest;
    const { courseId: paramCourseId } = courseSessionInfo;
    try {
      await updateCourseLeaveRequest({
        courseId: paramCourseId,
        playerId,
        action,
        courseSessionIds: [courseSessionInfo.courseSessionId],
        rejectReason,
      });
      Toast.show({
        id: "updateCourseLeaveRequestSuccess",
        duration: 2000,
        placement: "top",
        render: () => {
          return (
            <MessageToast
              type={MesssageToastType.Success}
              title={t("Update leave request success")}
            />
          );
        },
      });
      mutate();
      setRejectLeaveApplicationOpen(false);
    } catch (apiError) {
      showApiToastError(apiError);
      console.log(apiError);
    }
  };

  const renderItem = (
    item: {
      course: CourseResponse;
      leaveRequests: CourseLeaveRequest[];
    },
    index: number
  ) => {
    return (
      <VStack key={item.course.id} space="3">
        <HStack alignItems="center" justifyContent="space-between">
          <Heading
            fontSize="lg"
            color="rs.primary_purple"
          >{`${item.course.name}`}</Heading>
          <Pressable
            onPress={() => {
              navigation.navigate("ClubCourseDetails", {
                course: item.course,
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
        {item.leaveRequests.map((request) => {
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
              <CourseLeaveRequestCard
                onPressCard={() => {
                  navigation.navigate("ManageCourse", {
                    courseId: item.course.id,
                  });
                }}
                key={`${request.playerId}-${request.playerInfo}-${request.courseSessionInfo.courseId}-${request.courseSessionInfo.courseSessionFrom}`}
                applicant={request.playerInfo}
                application={request}
                onPressApprove={() => {
                  setIsOpen((prev) => ({
                    ...prev,
                    leaveRequestModalOpen: true,
                    manualAddMakeUpSession: true,
                  }));
                  setSelectedLeaveApplication(request);
                }}
                onPressReject={() => {
                  setSelectedLeaveApplication(request);
                  setRejectLeaveApplicationOpen(true);
                }}
              />
            </VStack>
          );
        })}
      </VStack>
    );
  };

  if (isLoading) {
    return <Loading />;
  }

  return (
    <HeaderLayout
      KeyboardAwareScrollViewProps={{
        bounces: false,
      }}
      headerProps={{
        title: t("Course Leave Applications"),
        containerStyle: { marginHorizontal: 0 },
      }}
    >
      <VStack mx="4" space={6} flex={1}>
        {upwrappedDataList.length === 0 && (
          <VStack justifyContent="center" alignItems="center" flex="1">
            <NoAccessRight
              title={t("No Leave Applications")}
              description={t(
                "There is no leave applications pending for approval"
              )}
            />
          </VStack>
        )}
        {upwrappedDataList.length > 0 &&
          upwrappedDataList.map((item, index) => {
            return renderItem(item, index);
          })}
      </VStack>
      <ConfirmationModal
        alertType="Fail"
        shouldRenderIcon={false}
        verticalButtons
        confirmText={t("Yes")}
        cancelText={t("No")}
        isOpen={isOpen.manualAddMakeUpSession}
        onClose={() => {
          setIsOpen((prev) => ({
            ...prev,
            leaveRequestModalOpen: false,
            manualAddMakeUpSession: false,
          }));
        }}
        onCancel={async () => {
          setIsOpen((prev) => ({
            ...prev,
            leaveRequestModalOpen: false,
            manualAddMakeUpSession: false,
          }));
          if (selectedLeaveApplication) {
            await onCourseLeaveRequestAction(
              selectedLeaveApplication,
              Action.Approve
            );
          }
        }}
        title={t("Manual add make up session")}
        description={t(
          "You may move this player to another course as a make up session"
        )}
        onConfirm={() => {
          setIsOpen((prev) => ({
            ...prev,
            leaveRequestModalOpen: false,
            manualAddMakeUpSession: false,
          }));
          if (
            selectedLeaveApplication?.playerId &&
            selectedLeaveApplication.courseSessionInfo
          ) {
            navigation.navigate("ChangeCourseSession", {
              session: {
                ...selectedLeaveApplication?.courseSessionInfo,
                // Dummy value for not showing error
                groupId: 0,
                coaches: [],
              },
              playerId: selectedLeaveApplication?.playerId,
              isMoveSessionFlow: true,
              isEditSessionFlow: false,
              makeupSessionId:
                selectedLeaveApplication.makeUpSessionInfo.courseSessionId,
              flow: "move",
            });
          }
        }}
      />
      <TextInputModal
        heading={t("Reject")}
        description={t("Are you sure to reject the leave request?")}
        isOpen={rejectLeaveApplicationOpen}
        onClose={() => {
          setRejectLeaveApplicationOpen(false);
        }}
        onPressSubmit={async (msg: string) => {
          if (selectedLeaveApplication) {
            await onCourseLeaveRequestAction(
              selectedLeaveApplication,
              Action.Reject,
              msg
            );
          }
        }}
      />
    </HeaderLayout>
  );
}
