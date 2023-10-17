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
import { getCourseApplicationSummary } from "../../../services/CourseServices";
import NoDataComponent from "../../../components/NoDataComponent";
import {
  CourseApplicationResponse,
  CourseResponse,
} from "../../../models/responses/Course";
import RightArrowIcon from "../../../components/Icons/RightArrowIcon";
import CourseApplicantDetailsCard from "../../../components/CourseApplicantDetailsCard";
import { Action } from "../../../models/Response";
import { updateCourseBooking } from "../../../services/CourseBookingServices";

export type CourseListProps = NativeStackScreenProps<
  MainStackNavigatorParamList,
  "CourseApplicationSummary"
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

export default function CourseApplicationSummary({
  navigation,
  route,
}: CourseListProps) {
  const { user } = useAuth();
  const {
    data: courseApplicationsSummary,
    mutate,
    isValidating: isLoading,
  } = useSWR(formatCoreUrl(`/course-application-summary`), () =>
    getCourseApplicationSummary()
  );

  useFocusEffect(
    useCallback(() => {
      mutate();
    }, [mutate])
  );

  const upwrappedDataList = courseApplicationsSummary || [];

  const onCourseApplicationAction = async (
    application: CourseApplicationResponse,
    action: Action
  ) => {
    const { id } = application;
    try {
      await updateCourseBooking({
        action,
        id,
        parameters: {
          reasonReject: "",
        },
      });
      mutate();
      if (action === Action.Approve) {
        showApiToastSuccess({ title: t("Application approved") });
      } else {
        showApiToastSuccess({ title: t("Application rejected") });
      }
    } catch (apiError) {
      showApiToastError(apiError);
    }
  };

  const renderItem = (
    item: {
      course: CourseResponse;
      courseApplications: CourseApplicationResponse[];
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
        {item.courseApplications.map((application) => {
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
              <CourseApplicantDetailsCard
                onPressCard={() => {
                  navigation.navigate("CourseApplicationDetails", {
                    application,
                  });
                }}
                horizontalButtons
                key={application.id}
                applicant={application.playerInfo}
                application={application}
                onPressApprove={async () => {
                  await onCourseApplicationAction(application, Action.Approve);
                }}
                onPressReject={async () => {
                  await onCourseApplicationAction(application, Action.Reject);
                }}
                onPressPlayerDetails={() => {
                  navigation.navigate("UserProfileViewer", {
                    user: {
                      ...application.playerInfo,
                      userType: UserType.Player,
                    },
                  });
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
        title: t("Course Applications"),
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
    </HeaderLayout>
  );
}
