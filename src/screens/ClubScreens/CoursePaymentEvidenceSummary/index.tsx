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
  getCoursePaymentEvidencesSummary,
  updateCourseLeaveRequest,
} from "../../../services/CourseServices";
import NoDataComponent from "../../../components/NoDataComponent";
import {
  CourseApplicationResponse,
  CourseLeaveRequest,
  CoursePaymentStatus,
  CourseResponse,
} from "../../../models/responses/Course";
import RightArrowIcon from "../../../components/Icons/RightArrowIcon";
import CourseApplicantDetailsCard from "../../../components/CourseApplicantDetailsCard";
import { Action } from "../../../models/Response";
import { updateCourseBooking } from "../../../services/CourseBookingServices";
import CourseLeaveRequestCard from "../../../components/CourseLeaveRequestCard";
import TextInputModal from "../../../components/Modal/TextInputModal";
import CoursePaymentInfoCard from "../../../components/CoursePaymentInfoCard";
import ManageSearchIcon from "../../../components/Icons/ManageSearchIcon";
import { formatUtcToLocalDate } from "../../../utils/date";

export type CourseListProps = NativeStackScreenProps<
  MainStackNavigatorParamList,
  "CoursePaymentEvidenceSummary"
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
  "component.CourseApplicantInfoCard",
  "constant.district",
]);

export default function CoursePaymentEvidenceSummary({
  navigation,
  route,
}: CourseListProps) {
  const { user } = useAuth();
  const {
    data: courseApplicationsSummary,
    mutate,
    isValidating: isLoading,
  } = useSWR(formatCoreUrl(`/course-payment-evidence-summary`), () =>
    getCoursePaymentEvidencesSummary()
  );
  const { colors } = useTheme();

  useFocusEffect(
    useCallback(() => {
      mutate();
    }, [mutate])
  );

  const upwrappedDataList = courseApplicationsSummary || [];

  const renderCard = (application: CourseApplicationResponse) => {
    const displayName = getUserName(application.playerInfo)?.toString();
    const profileImage = application.playerInfo?.profilePicture;

    let bgColor = colors.rs.GPP_lightGreen;
    let statusColor = colors.rs.GPP_lightGreen;

    const ammount = application.numberOfSessions * application.course.fee;
    switch (application.paymentStatus) {
      case CoursePaymentStatus.Pending:
        bgColor = colors.rs.medium_orange;
        statusColor = colors.rs.medium_orange;
        break;
      case CoursePaymentStatus.Unpaid:
        bgColor = colors.rs.bg_grey;
        statusColor = colors.rs_secondary.error;
        break;
      case CoursePaymentStatus.Rejected:
        bgColor = colors.rs.bg_grey;
        statusColor = colors.rs_secondary.error;
        break;
      case CoursePaymentStatus.Refund:
        bgColor = colors.rs.bg_grey;
        statusColor = colors.rs.bg_grey;
        break;
      default:
        break;
    }

    return (
      <Pressable
        onPress={() => {
          navigation.navigate("ManageCourse", {
            courseId: application.courseId,
          });
        }}
        flexDirection="column"
      >
        <HStack alignItems="flex-start" justifyContent="space-between" w="full">
          <HStack alignItems="center" space="2">
            <Avatar
              alignSelf="flex-start"
              size="sm"
              source={
                profileImage
                  ? {
                      uri: formatFileUrl(profileImage),
                    }
                  : undefined
              }
            >
              {`${application?.playerInfo?.firstName?.charAt(
                0
              )}${application?.playerInfo?.lastName?.charAt(0)}`}
            </Avatar>

            <VStack>
              <Text fontSize="md" numberOfLines={2}>{`${displayName.slice(
                0,
                displayName.length > 20
                  ? displayName.length / 2
                  : displayName.length
              )}${displayName.length > 20 ? "..." : ""}`}</Text>
              <Text color="gray.600">{`${t(
                "Start date"
              )}: ${formatUtcToLocalDate(
                application.enrollmentStartDate
              )}`}</Text>
              <Text color="gray.600">{`${t("Sessions")}: ${
                application.numberOfSessions
              }`}</Text>
              <Text color="gray.600">{`${t("Ammount")}: $${ammount}`}</Text>
            </VStack>
          </HStack>
        </HStack>
        <Button
          onPress={() => {
            navigation.navigate("ReviewCoursePaymentEvidence", { application });
          }}
          mt="2"
          h="10"
          p="1"
          _text={{ fontSize: 14 }}
        >
          {t("View evidence")}
        </Button>
      </Pressable>
    );
  };
  const renderItem = (
    item: {
      course: CourseResponse;
      paymentEvidences: CourseApplicationResponse[];
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
        {item.paymentEvidences.map((request) => {
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
              {renderCard(request)}
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
        title: t("Course Payment Evidence"),
        containerStyle: { marginHorizontal: 0 },
      }}
    >
      <VStack mx="4" space={6} flex={1}>
        {upwrappedDataList.length === 0 && (
          <VStack justifyContent="center" alignItems="center" flex="1">
            <NoAccessRight
              title={t("No Payment Evidence")}
              description={t("There is no payment evidence pending for review")}
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
