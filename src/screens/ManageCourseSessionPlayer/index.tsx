import {
  VStack,
  useTheme,
  Text,
  Box,
  Toast,
  HStack,
  Avatar,
  Button,
  Badge,
  Pressable,
  Divider,
} from "native-base";
import React, { useCallback, useRef, useState } from "react";
import { useForm } from "react-hook-form";
import { useFocusEffect } from "@react-navigation/native";

import { LayoutAnimation } from "react-native";
import { NativeStackScreenProps } from "@react-navigation/native-stack";
import useSWR from "swr";
import HeaderLayout from "../../components/Layout/HeaderLayout";
import { getTranslation } from "../../utils/translation";
import { MainStackNavigatorParamList } from "../../routers/Types";
import GhostTabbar from "../../components/GhostTabBar";
import ConfirmationModal from "../../components/ConfirmationModal/ConfirmationModal";
import { formatCoreUrl, formatFileUrl } from "../../services/ServiceUtil";

import ErrorMessage from "../../components/ErrorMessage";
import Loading from "../../components/Loading";

import MessageToast, {
  MesssageToastType,
} from "../../components/Toast/MessageToast";
import { showApiToastError } from "../../components/ApiToastError";
import NoDataComponent from "../../components/NoDataComponent";
import { EventApplicationStatus } from "../../models/responses/Event";
import ImageDirectory from "../../assets";
import {
  getDisplayNameForApplication,
  getEventById,
  kickOutParticipant,
  profilePictureForApplication,
} from "../../services/EventServices";
import LogoutIcon from "../../components/Icons/LogoutIcon";
import SingleSelectModal from "../../components/Modal/SingleSelectModal";
import RemoveIcon from "../../components/Icons/RemoveIcon";
import {
  getCourseApplication,
  getPlayerJoiningSession,
  getSessionFrom,
  removeCourseApplication,
} from "../../services/CourseServices";
import { CourseApplicationStatus } from "../../models/responses/CourseApplication";
import {
  CourseApplicationResponse,
  CourseSessionPlayerEnrollmentResponse,
  SessionFromResponse,
} from "../../models/responses/Course";
import { getUserName } from "../../utils/name";
import CourseApplicantDetailsCard from "../../components/CourseApplicantDetailsCard";
import { UserType } from "../../models/User";
import PencilIcon from "../../components/Icons/PencilIcon";
import { showApiToastSuccess } from "../../components/ApiToastSuccess";
import { formatUtcToLocalDate, formatUtcToLocalTime } from "../../utils/date";

export type ManageCourseSessionPlayerProps = NativeStackScreenProps<
  MainStackNavigatorParamList,
  "ManageCourseSessionPlayer"
>;

const t = getTranslation([
  "screen.ManageCourseSessionPlayer",
  "constant.button",
  "screen.AddCourseSession",
  "screen.ManageSessions",
]);

export function ManageCourseSessionPlayer({
  navigation,
  route,
}: ManageCourseSessionPlayerProps) {
  const { session, cachedList, course, removedSessionIds, sessionList } =
    route.params;
  const {
    data: courseSessionsAttendanceRecord,
    isValidating: isCourseSessionRecordFetching,
    mutate: mutateCourseSessionsAttendanceRecord,
  } = useSWR(
    formatCoreUrl(
      `/course/${session.courseId}/session/${session.courseSessionId}/enrollment`
    ),
    () => {
      return getPlayerJoiningSession(session.courseId, session.courseSessionId);
    },
    {
      errorRetryCount: 0,
      errorRetryInterval: 0,
      shouldRetryOnError: false,
    }
  );

  const [removeSessionModal, setRemoveSessionModal] = useState(false);

  useFocusEffect(
    React.useCallback(() => {
      mutateCourseSessionsAttendanceRecord();
    }, [mutateCourseSessionsAttendanceRecord])
  );

  const playerInSessionItem = (
    record: CourseSessionPlayerEnrollmentResponse
  ) => {
    const upcommingSession = record.upcommingSessions.sort(
      (a, b) => a.courseSessionFrom.getTime() - b.courseSessionFrom.getTime()
    )[0];
    const sessionLeft =
      record.upcommingSessions.length >= 1
        ? record.upcommingSessions.length
        : 0;
    const isAbleToMoveSession = true;
    return (
      <VStack space="2">
        <HStack space="2">
          <Avatar
            size="sm"
            source={
              record.playerInfo.profilePicture
                ? { uri: formatFileUrl(record.playerInfo.profilePicture) }
                : ImageDirectory.DRAFT_AVT
            }
          >
            Thumbnail
          </Avatar>
          <VStack space="1">
            <Text fontSize="md">{getUserName(record.playerInfo)}</Text>
            <Text color="#6D6D6D">{`${t("Upcoming Session")}: ${
              upcommingSession
                ? formatUtcToLocalDate(upcommingSession.courseSessionFrom)
                : ""
            }`}</Text>
            <Text color="#6D6D6D">{`${t(
              "Sessions left"
            )}: ${sessionLeft}`}</Text>
          </VStack>
        </HStack>
        <Pressable
          isDisabled={!isAbleToMoveSession}
          bg="#31095E"
          h="10"
          mt="2"
          borderRadius="full"
          justifyContent="center"
          alignItems="center"
          onPress={() => {
            navigation.navigate("ChangeCourseSession", {
              session,
              playerId: record.playerInfo.id,
              isMoveSessionFlow: false,
              isEditSessionFlow: true,
              playerName: getUserName(record.playerInfo)?.toString() || "",
              flow: "default",
            });
          }}
        >
          <Text fontSize="md" fontWeight="bold" color="rs.white">
            {isAbleToMoveSession ? t("Move Session") : t("Moved")}
          </Text>
        </Pressable>
      </VStack>
    );
  };

  if (isCourseSessionRecordFetching) {
    return <Loading />;
  }

  const courseSessionsAttendanceRecordUnwrapped =
    courseSessionsAttendanceRecord || [];

  return (
    <HeaderLayout
      KeyboardAwareScrollViewProps={{
        bounces: false,
      }}
      headerProps={{
        title: t("Manage Player"),
        containerStyle: { marginHorizontal: 0 },
        hasBackButton: true,
      }}
      isSticky
    >
      <VStack flex="1" mx="defaultLayoutSpacing">
        {courseSessionsAttendanceRecordUnwrapped.length === 0 && (
          <Text fontSize="md" textAlign="center" alignSelf="center">
            {t(
              "All players that applied to this session has been managed, click continue to proceed"
            )}
          </Text>
        )}
        {courseSessionsAttendanceRecordUnwrapped.map((record) => {
          return (
            <VStack space="4">
              {playerInSessionItem(record)}
              <Divider mb="2" />
            </VStack>
          );
        })}
      </VStack>
      <Button
        isDisabled={courseSessionsAttendanceRecordUnwrapped.length !== 0}
        mx="defaultLayoutSpacing"
        mt="auto"
        onPress={() => {
          setRemoveSessionModal(true);
        }}
      >
        {t("Continue")}
      </Button>
      <ConfirmationModal
        alertType="Fail"
        confirmText={t("Confirm")}
        cancelText={t("Cancel")}
        isOpen={removeSessionModal}
        onCancel={() => {
          setRemoveSessionModal(false);
          navigation.navigate("EditSessions", {
            course,
            cachedList,
            sessionList,
            isSessionListDidUpdate: true,
            removedSessionIds: [...removedSessionIds],
          });
        }}
        title={t("Confirm to remove session")}
        description={`${t("Date")}: ${formatUtcToLocalDate(
          session.courseSessionFrom
        )} ${t("From")} ${formatUtcToLocalTime(session.courseSessionFrom)} ${t(
          "To"
        )}:${formatUtcToLocalTime(session.courseSessionTo)}`}
        onConfirm={() => {
          setRemoveSessionModal(false);
          showApiToastSuccess({ title: t("Removed successfully") });
          navigation.navigate("EditSessions", {
            course,
            cachedList,
            sessionList,
            isSessionListDidUpdate: true,
            removedSessionIds: [...removedSessionIds, session.courseSessionId],
          });
        }}
      />
    </HeaderLayout>
  );
}
