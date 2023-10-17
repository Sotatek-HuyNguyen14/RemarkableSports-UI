/* eslint-disable no-bitwise */
import React, { useEffect, useMemo, useState } from "react";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";

import { Button, HStack, Text, VStack } from "native-base";
import { RouteProp } from "@react-navigation/native";
import { useForm } from "react-hook-form";
import useSWR from "swr";
import { isArray } from "lodash";
import { parseISO } from "date-fns";
import { MainStackNavigatorParamList } from "../../routers/Types";
import { getTranslation } from "../../utils/translation";

import { useAuth } from "../../hooks/UseAuth";
import { ClubStaff, UserType } from "../../models/User";
import HeaderLayout from "../../components/Layout/HeaderLayout";
import DownArrowIcon from "../../components/Icons/DownArrowIcon";
import SingleSelectModal from "../../components/Modal/SingleSelectModal";
import { formatCoreUrl } from "../../services/ServiceUtil";
import { isBlank } from "../../utils/strings";
import Loading from "../../components/Loading";
import FormInput from "../../components/FormInput/FormInput";
import ConfirmationModal from "../../components/ConfirmationModal/ConfirmationModal";
import { formatUtcToLocalDate, formatUtcToLocalTime } from "../../utils/date";
import {
  getAllAvailableSessionsForMoving,
  getAllCoursesInClub,
  moveCourseSession,
  updateCourseLeaveRequest,
} from "../../services/CourseServices";
import { showApiToastError } from "../../components/ApiToastError";
import { showApiToastSuccess } from "../../components/ApiToastSuccess";
import { Action } from "../../models/Response";

export type ChangeCourseSessionPropsNavigationProp = NativeStackNavigationProp<
  MainStackNavigatorParamList,
  "ChangeCourseSession"
>;

type ChangeCourseSessionPropsBaseProps = RouteProp<
  MainStackNavigatorParamList,
  "ChangeCourseSession"
>;

export interface ChangeCourseSessionProps
  extends ChangeCourseSessionPropsBaseProps {
  route: ChangeCourseSessionPropsBaseProps;
  navigation: ChangeCourseSessionPropsNavigationProp;
}
const t = getTranslation([
  "screen.ClubScreens.ChangeCourseSession",
  "component.AddSessionComponent",
  "constant.eventType",
  "constant.button",
  "formInput",
  "toastMessage",
]);

export enum CourseSessionType {
  Loop = "Loop",
  Single = "Single",
}

interface FormValue {
  // This is session id
  dateOfSession: string;
  // This is course id
  courseName: string;
  courseNameText: string;
  dateOfSessionText: string;
}

export default function ChangeCourseSession({
  navigation,
  route,
}: ChangeCourseSessionProps) {
  const {
    session,
    playerId,
    isMoveSessionFlow,
    isEditSessionFlow,
    playerName,
    makeupSessionId,
    flow,
  } = route.params;
  const { control, watch, setValue } = useForm<FormValue>({
    mode: "onChange",
    defaultValues: {
      courseName: session.courseId.toString(),
    },
  });
  const courseName = watch("courseName");
  const dateOfSession = watch("dateOfSession");

  const [isSubmit, setIsSubmit] = useState(false);

  const { user } = useAuth();
  const staff = user as ClubStaff;
  const {
    data: allAvailableSessions,
    isValidating: isAvailableSessionsValidating,
    mutate: allSessionsMutate,
    error: errorMoving,
  } = useSWR(
    formatCoreUrl(
      `/course/${
        courseName || session.courseId
      }/session/user/${playerId}/un-apply`
    ),
    () =>
      getAllAvailableSessionsForMoving(
        courseName || session.courseId,
        playerId
      ),
    {
      errorRetryCount: 0,
      onError: () => {},
      onErrorRetry: () => {},
      shouldRetryOnError: false,
    }
  );

  const {
    data: allCoursesInClub,
    isValidating: isAllCourseInClubValidating,
    error,
  } = useSWR(
    formatCoreUrl(`/course/club/${staff.club?.id}`),
    () => {
      if (staff.club?.id) {
        return getAllCoursesInClub(staff.club?.id);
      }
    },
    {
      errorRetryCount: 0,
      onError: () => {},
      onErrorRetry: () => {},
      shouldRetryOnError: false,
    }
  );

  const [openDateOfSessionModal, setDateOfSessionModalOpen] = useState(false);
  const [openCourseNameModal, setCourseNameModalOpen] = useState(false);
  const [openConfirmModal, setConfirmModalOpen] = useState(false);

  // eslint-disable-next-line react-hooks/exhaustive-deps
  const courseOptions =
    allCoursesInClub && isArray(allCoursesInClub)
      ? allCoursesInClub
          .filter((course) => {
            const endTime = parseISO(`${course?.toDate} ${course?.endTime}`);
            const isOutTime = endTime.getTime() < new Date().getTime();

            if (!isOutTime) {
              return true;
            }
            return false;
          })
          .map((course) => {
            return {
              value: course.id.toString(),
              label: course.name,
            };
          })
      : [];
  const defaultCourseName = courseOptions.filter(
    (option) => option.value === courseName
  )[0]?.label;

  // eslint-disable-next-line react-hooks/exhaustive-deps
  const dateOfSessionOptions = allAvailableSessions
    ? allAvailableSessions.map((s) => {
        return {
          isFull: false,
          label: formatUtcToLocalDate(s.courseSessionFrom),
          value: s.courseSessionId.toString(),
        };
      })
    : [];

  const isLoading =
    isAvailableSessionsValidating || isAllCourseInClubValidating;

  const shouldAbleToMoveSession = user?.userType === UserType.ClubStaff;

  if (isLoading) {
    return <Loading />;
  }

  if (!shouldAbleToMoveSession) {
    return (
      <HeaderLayout
        KeyboardAwareScrollViewProps={{
          bounces: false,
        }}
        headerProps={{
          title: t("Change Sessions"),
          hasBackButton: true,
          containerStyle: { marginHorizontal: 0 },
        }}
        isSticky
      >
        <VStack flex="1" justifyContent="center" alignItems="center">
          <Text>{t("No Permissions")}</Text>
        </VStack>
      </HeaderLayout>
    );
  }

  const dateOfSessionText = watch("dateOfSessionText");
  const confirmMoveSessionDescription = isEditSessionFlow
    ? `${playerName} \n ${t("Original")}: ${formatUtcToLocalDate(
        session.courseSessionFrom
      )} ${formatUtcToLocalTime(session.courseSessionFrom)} ${t(
        "to"
      )} ${formatUtcToLocalTime(session.courseSessionTo)} \n ${t(
        "New"
      )}: ${dateOfSessionText} ${formatUtcToLocalTime(
        session.courseSessionFrom
      )} ${t("to")} ${formatUtcToLocalTime(session.courseSessionTo)}`
    : undefined;

  const peformNavigation = () => {
    if (flow === "manage") {
      // Back to course page
      navigation.reset({
        index: 1,
        routes: [
          {
            name:
              user.userType === UserType.ClubStaff
                ? "ClubNavigator"
                : user.userType === UserType.Coach
                ? "CoachNavigator"
                : "PlayerNavigator",
          },
          {
            name: "ManageCourse",
            params: { courseId: session.courseId },
          },
        ],
      });
    } else if (flow === "move") {
      // Back to home page
      navigation.reset({
        index: 0,
        routes: [
          {
            name:
              user.userType === UserType.ClubStaff
                ? "ClubNavigator"
                : user.userType === UserType.Coach
                ? "CoachNavigator"
                : "PlayerNavigator",
          },
        ],
      });
    } else {
      navigation.goBack();
    }
  };

  return (
    <HeaderLayout
      KeyboardAwareScrollViewProps={{
        bounces: false,
      }}
      headerProps={{
        title: t("Change Sessions"),
        hasBackButton: true,
        containerStyle: { marginHorizontal: 0 },
      }}
      isSticky
    >
      <VStack flex="1" space="3" mx="defaultLayoutSpacing">
        <Text fontSize="md" fontWeight="bold" color="#31095E">
          {t("Date of Original Session")}
        </Text>
        <HStack p="5" bg="#EDEFF0" borderRadius="2xl" alignItems="center">
          <Text>{formatUtcToLocalDate(session.courseSessionFrom)}</Text>
        </HStack>
        <Text fontSize="md" fontWeight="bold" color="#31095E">
          {t("New Session Details")}
        </Text>
        {/* course name */}
        <FormInput
          label={t("Course Name")}
          controllerProps={{
            name: "courseNameText",
            control,
            rules: {},
            defaultValue: defaultCourseName,
          }}
          inputProps={{
            editable: false,
            InputRightElement: <DownArrowIcon mr="4" />,
          }}
          onPress={() => {
            setCourseNameModalOpen(true);
          }}
        />
        {/* session date */}
        <FormInput
          label={t("Date of Session")}
          controllerProps={{
            name: "dateOfSessionText",
            control,
            rules: {},
          }}
          inputProps={{
            editable: false,
            InputRightElement: <DownArrowIcon mr="4" />,
          }}
          onPress={() => {
            setDateOfSessionModalOpen(true);
          }}
        />
        <Button
          isLoading={isSubmit}
          isLoadingText={t("Loading")}
          onPress={() => {
            setConfirmModalOpen(true);
          }}
          mt="auto"
        >
          {t("Confirm")}
        </Button>
      </VStack>
      <SingleSelectModal
        isOpen={openDateOfSessionModal}
        onClose={() => {
          setDateOfSessionModalOpen(false);
        }}
        title={t("Date of Session")}
        options={dateOfSessionOptions}
        controllerProps={{
          name: "dateOfSession",
          control,
        }}
        confirmButtonText={t("Save")}
        onCloseWithValue={(value) => {
          setDateOfSessionModalOpen(false);
          const expectedValue = dateOfSessionOptions.filter(
            (c) => c.value === value
          )[0];
          if (expectedValue) {
            setValue("dateOfSessionText", expectedValue.label);
          }
        }}
      />
      <SingleSelectModal
        isOpen={openCourseNameModal}
        onCloseWithValue={(value) => {
          if (value) {
            setValue(
              "courseNameText",
              courseOptions.filter((c) => c.value === value)[0]?.label
            );
          }

          setValue("dateOfSession", "");
          setValue("dateOfSessionText", "");
          setCourseNameModalOpen(false);
        }}
        title={t("Course Name")}
        options={courseOptions}
        controllerProps={{
          name: "courseName",
          control,
        }}
        confirmButtonText={t("Confirm")}
      />
      <ConfirmationModal
        isLoading={isSubmit}
        alertType="Success"
        confirmText={t("Confirm")}
        cancelText={t("Cancel")}
        isOpen={openConfirmModal}
        onCancel={() => {
          setConfirmModalOpen(false);
        }}
        title={t("Confirm to save changes")}
        description={confirmMoveSessionDescription}
        onConfirm={async () => {
          setIsSubmit(true);
          try {
            if (isMoveSessionFlow) {
              // If is Move Session flow = [ Going from manage course ] = [ Need to update the leave request ]
              await updateCourseLeaveRequest({
                courseId: session.courseId,
                playerId,
                action: Action.Approve,
                courseSessionIds: [session.courseSessionId],
                rejectReason: "",
              });
            }
            await moveCourseSession({
              originalSessionId: session.courseSessionId,
              newCourseId:
                courseName && !isBlank(courseName) ? courseName : undefined,
              oldCourseId: session.courseId,
              newSessionId: dateOfSession,
              playerId,
              makeupSessionId,
            });

            setIsSubmit(false);
            showApiToastSuccess({});
            setConfirmModalOpen(false);
            peformNavigation();
          } catch (apiError) {
            showApiToastError(apiError);
            setIsSubmit(false);
            setConfirmModalOpen(false);
          }
        }}
      />
    </HeaderLayout>
  );
}
