/* eslint-disable no-unsafe-optional-chaining */
import React, { useCallback, useEffect } from "react";
import { NativeStackScreenProps } from "@react-navigation/native-stack";
import {
  Avatar,
  Badge,
  Box,
  Button,
  Divider,
  Heading,
  HStack,
  Image,
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
import PlayerShortProfile from "../../../components/PlayerShortProfile";
import ImageDirectory from "../../../assets";
import CourseCard from "../../../components/Card/CourseCard";
import CalendarIcon from "../../../components/Icons/CalendarIcon";
import FlagIcon from "../../../components/Icons/FlagIcon";
import { format24HTo12H, formatUtcToLocalDate } from "../../../utils/date";
import ClockIcon from "../../../components/Icons/ClockIcon";
import LocationIcon from "../../../components/Icons/LocationIcon";

export type CourseListProps = NativeStackScreenProps<
  MainStackNavigatorParamList,
  "CourseApplicationDetails"
>;
const APPROVE_SUCCESSFUL_TOAST = "ApproveSuccessful";
const REJECT_SUCCESSFUL_TOAST = "RejectSuccessful";
const t = getTranslation([
  "screen.ClubHomeV2",
  "screen.ClubScreens.ManageCourse",
  "constant.button",
  "constant.profile",
  "constant.district",
  "toastMessage",
  "component.Player.PlayerProfile",
]);

export default function CourseApplicationDetails({
  navigation,
  route,
}: CourseListProps) {
  const { user } = useAuth();
  const { application: courseApplication } = route.params;

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
      if (action === Action.Approve) {
        showApiToastSuccess({});
      } else {
        showApiToastSuccess({});
      }
      navigation.goBack();
    } catch (apiError) {
      showApiToastError(apiError);
    }
  };

  const applicantInfo = () => {
    const handUsed = courseApplication?.playerInfo.handUsed;

    const level = courseApplication?.playerInfo.playerLevel
      ? t(courseApplication?.playerInfo.playerLevel)
      : "-";
    const hand = t(`${handUsed} Hand`);
    const rank = courseApplication?.playerInfo.ranking || t("No Rank");
    const levelRanking =
      `${level} (${rank})` === "- (-)" ? "-" : `${level} (${rank})`;
    return (
      <HStack space="3" alignItems="flex-start" flexWrap="wrap">
        <Avatar
          size="sm"
          source={
            courseApplication?.playerInfo.profilePicture
              ? {
                  uri: formatFileUrl(
                    courseApplication?.playerInfo.profilePicture
                  ),
                }
              : ImageDirectory.DRAFT_AVT
          }
        >
          THUMBNAIL
        </Avatar>
        <VStack space="2" flex="1">
          <HStack space="2" alignItems="center" flexWrap="wrap">
            {courseApplication?.playerInfo.firstName &&
              courseApplication?.playerInfo.lastName && (
                <Heading>{getUserName(courseApplication?.playerInfo)}</Heading>
              )}
            <Badge
              px="1"
              py="1"
              borderRadius="full"
              bg="#66CEE133"
              alignSelf="flex-start"
            >
              <Text fontSize="xs">{`${hand} (${t(
                courseApplication.playerInfo.blade
              )})`}</Text>
            </Badge>
          </HStack>
          <Text fontSize="md">{levelRanking}</Text>

          <Pressable
            onPress={() =>
              navigation.navigate("UserProfileViewer", {
                user: {
                  ...courseApplication.playerInfo,
                  userType: UserType.Player,
                },
              })
            }
          >
            <Text fontWeight="bold" fontSize="sm" color="rs.primary_purple">
              {t("View profile")}
            </Text>
          </Pressable>
        </VStack>
      </HStack>
    );
  };

  const footer = (): JSX.Element => {
    return (
      <VStack space="3">
        <Heading fontSize="md" color="rs.primary_purple">
          {t("Date of First Session")}
        </Heading>
        <HStack space="2">
          <CalendarIcon />
          <Text>
            {formatUtcToLocalDate(courseApplication.enrollmentStartDate)}
          </Text>
        </HStack>
        <Heading fontSize="md" color="rs.primary_purple">
          {t("Number of applied sessions")}
        </Heading>
        <HStack space="2">
          <FlagIcon size="sm" />
          <Text>{courseApplication.numberOfSessions}</Text>
        </HStack>
      </VStack>
    );
  };

  const courseInfo = () => {
    return (
      <VStack space="2">
        <Image
          w="100%"
          borderRadius="lg"
          alignSelf="center"
          source={
            courseApplication.course.imageUrl
              ? { uri: formatFileUrl(courseApplication.course.imageUrl) }
              : ImageDirectory.VENUE
          }
        />
        <Heading>{courseApplication.course.name}</Heading>

        <VStack space="3">
          <Heading fontSize="md" color="rs.primary_purple">
            {t("Date & Time")}
          </Heading>
          <HStack alignItems="center" space="2">
            <CalendarIcon />
            <Text>
              {courseApplication.course.fromDate} {t("to")}{" "}
              {courseApplication.course.toDate}
            </Text>
          </HStack>
          {/* Time */}
          <HStack alignItems="center" space="2">
            <ClockIcon />
            <Text>
              {`${format24HTo12H(
                courseApplication.course.startTime.toString()
              )} - ${format24HTo12H(
                courseApplication.course.endTime.toString()
              )}`}
            </Text>
          </HStack>
          <Heading fontSize="md" color="rs.primary_purple">
            {t("Address")}
          </Heading>
          <HStack flex="1" alignItems="center" space="2">
            <LocationIcon />
            <VStack>
              <Text flex="1" numberOfLines={2}>
                {t(courseApplication.course.district)}
              </Text>
              <Text flex="1" numberOfLines={2}>
                {courseApplication.course.address}
              </Text>
            </VStack>
          </HStack>
          {footer()}
        </VStack>
      </VStack>
    );
  };

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
        {/* Applicant info */}
        <Heading fontSize="lg">{t("Applicant")}</Heading>
        {applicantInfo()}
        {/* Applied Course Info */}
        <Heading fontSize="lg">{t("Applied Course")}</Heading>
        {courseInfo()}
        <VStack alignSelf="center" width="100%" space="3" mt="2">
          <Button
            alignSelf="center"
            width="100%"
            onPress={async () => {
              await onCourseApplicationAction(
                courseApplication,
                Action.Approve
              );
            }}
            bg={APPROVE_BUTTON_COLOR}
          >
            {t("Approve")}
          </Button>
          <Button
            alignSelf="center"
            width="100%"
            variant="outline"
            onPress={async () => {
              await onCourseApplicationAction(courseApplication, Action.Reject);
            }}
            borderColor={REJECT_BUTTON_COLOR}
            _text={{ color: REJECT_BUTTON_COLOR }}
          >
            {t("Reject")}
          </Button>
        </VStack>
      </VStack>
    </HeaderLayout>
  );
}
