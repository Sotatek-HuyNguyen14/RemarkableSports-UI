import React, { useCallback, useEffect, useMemo, useState } from "react";
import {
  Badge,
  Box,
  Button,
  Heading,
  HStack,
  Modal,
  Text,
  useTheme,
  VStack,
  Image,
} from "native-base";
import useSWR from "swr";
import { NativeStackScreenProps } from "@react-navigation/native-stack";
import { parseISO, previousDay } from "date-fns";

import { useForm } from "react-hook-form";
import { useFocusEffect } from "@react-navigation/native";
import HeaderLayout from "../../../components/Layout/HeaderLayout";
import CalendarIcon from "../../../components/Icons/CalendarIcon";
import ClockIcon from "../../../components/Icons/ClockIcon";
import LocationIcon from "../../../components/Icons/LocationIcon";
import MoneyIcon from "../../../components/Icons/MoneyIcon";
import IncreaseIcon from "../../../components/Icons/IncreaseIcon";
import { MainStackNavigatorParamList } from "../../../routers/Types";
import { DaysOfWeek, PlayerAppliedStatus } from "../../../models/Response";
import {
  createCourseApplication,
  deleteCourseApplication,
} from "../../../services/CourseApplicationServices";
import { getTranslation } from "../../../utils/translation";
import { format24HTo12H, formatUtcToLocalDate } from "../../../utils/date";
import { formatName } from "../../../utils/name";
import {
  getCourseApplicationEnrollment,
  getCourseById,
  getCourseSessions,
} from "../../../services/CourseServices";
import {
  formatCoreUrl,
  formatFileUrl,
  formatMeetupApiUrl,
} from "../../../services/ServiceUtil";

import Loading from "../../../components/Loading";
import ErrorMessage from "../../../components/ErrorMessage";
import { UserType } from "../../../models/User";
import { useAuth } from "../../../hooks/UseAuth";
import FlagIcon from "../../../components/Icons/FlagIcon";
import OneColumnPickerModal from "../../../components/Modal/OneColumnPickerModal";
import { ApplyCourseRequest } from "../../../models/requests/Course";
import FormInput from "../../../components/FormInput/FormInput";
import DownArrowIcon from "../../../components/Icons/DownArrowIcon";
import ReminderIcon from "../../../components/Icons/ReminderIcon";
import { CourseApplicationStatus } from "../../../models/responses/CourseApplication";
import { showApiToastError } from "../../../components/ApiToastError";
import ExclaimationIcon from "../../../components/Icons/ExclaimationIcon";
import SingleSelectModal from "../../../components/Modal/SingleSelectModal";
import TipsComponent from "../../../components/TipsComponent";
import { CoursePaymentStatus } from "../../../models/responses/Course";

const t = getTranslation([
  "screen.PlayerScreens.CourseDetails",
  "constant.district",
  "constant.profile",
  "constant.week",
  "constant.button",
  "validation",
  "formInput",
]);

type PlayerCourseDetailsScreenProps = NativeStackScreenProps<
  MainStackNavigatorParamList,
  "PlayerCourseDetails"
>;

interface FormValue {
  courseSessionId: number;
  minimumSession: string;
  courseSessionText: string;
  minimumSessionText: string;
}
export default function PlayerCourseDetails({
  route,
  navigation,
}: PlayerCourseDetailsScreenProps) {
  const { space } = useTheme();
  const { course: paramValue, courseId } = route.params;
  const courseID = courseId || paramValue?.id;
  const {
    data,
    isValidating,
    error,
    mutate: mutateCourse,
  } = useSWR(formatMeetupApiUrl("/course/{id}"), () =>
    getCourseById(courseID!)
  );

  useFocusEffect(
    React.useCallback(() => {
      mutateCourse();
    }, [mutateCourse])
  );

  const { user } = useAuth();
  const { data: applicationEnrollments } = useSWR(
    formatCoreUrl(`/course/${courseID}/application/${user?.id}/enrollment`),
    () => getCourseApplicationEnrollment(courseID!, user?.id)
  );

  const {
    data: courseSessions,
    isValidating: isCourseSessionsFetching,
    error: courseSessionError,
  } = useSWR(formatCoreUrl(`/course/${courseID}/session`), () =>
    getCourseSessions(courseID!)
  );

  const upnextSessions = applicationEnrollments
    ? applicationEnrollments
        .filter(
          (session) =>
            session.courseSessionFrom.getTime() > new Date().getTime() &&
            session.courseId === courseID
        )
        .map((value, index) => {
          return {
            ...value,
            personalIndex: index + 1,
          };
        })
    : [];

  const course = data;
  const endTime = parseISO(`${course?.toDate} ${course?.endTime}`);
  const isOutTime = endTime.getTime() < new Date().getTime();

  const startTime = parseISO(`${course?.fromDate} ${course?.startTime}`);
  const isStarted = startTime.getTime() < new Date().getTime();

  const sessionOptions = useMemo(() => {
    return courseSessions
      ? courseSessions
          .filter((session) => {
            return session.courseSessionTo.getTime() > new Date().getTime();
          })
          .map((session) => {
            return {
              label: formatUtcToLocalDate(session.courseSessionFrom),
              value: session.courseSessionId?.toString(),
            };
          })
      : [];
  }, [courseSessions]);

  const minimumRequiredConsecutiveSession =
    course?.minimumRequiredConsecutiveSession || "1";
  const numberOfSessions = sessionOptions.length;
  const courseMinimumSectionOptions = [];

  for (
    let i = parseInt(minimumRequiredConsecutiveSession, 10);
    i <= numberOfSessions;
    i += 1
  ) {
    courseMinimumSectionOptions.push({
      label: i.toString(),
      value: i.toString(),
    });
  }

  const [isOpen, setIsOpen] = useState({
    sessions: false,
    minSession: false,
    allSessions: false,
  });

  const {
    control,
    handleSubmit,
    formState: { isValid, isSubmitting, isDirty },
    watch,
    setValue,
    resetField,
    trigger,
  } = useForm<FormValue>({
    mode: "onChange",
  });

  const setCourseSession = useCallback(
    (newSession: string) => {
      setValue("courseSessionText", newSession);
    },
    [setValue]
  );

  const courseSessionId = watch("courseSessionId");
  const minimumSession = watch("minimumSession");

  const isRecurring = course?.daysOfWeek && course.daysOfWeek.length > 0;
  const isOffCourse = !isRecurring;
  const isPlayerNotApplied =
    course?.playerAppliedStatus === PlayerAppliedStatus.Null ||
    (course?.playerAppliedStatus !== PlayerAppliedStatus.Applied &&
      course?.playerAppliedStatus !== PlayerAppliedStatus.Accepted);
  const isPlayer = user?.userType && user.userType === UserType.Player;
  const shouldShowCourseSessionPick =
    isPlayer &&
    !isOutTime &&
    isPlayerNotApplied &&
    (isRecurring || (isOffCourse && isStarted));
  const shouldShowNumberOfSessionPick =
    isPlayer && !isOutTime && isPlayerNotApplied && isRecurring;
  const shouldShowNumberOfSessionText = isPlayer && isOffCourse;
  const shouldShowApply = isPlayer && isPlayerNotApplied && !isOutTime;

  useEffect(() => {
    if (courseSessionId) {
      setCourseSession(
        sessionOptions.filter(
          (session) => session.value === courseSessionId?.toString()
        )[0].label
      );
      trigger("courseSessionText");
    }
  }, [
    courseSessionId,
    sessionOptions,
    trigger,
    setCourseSession,
    setValue,
    course,
  ]);

  useEffect(() => {
    if (minimumSession) {
      trigger("courseSessionText");
    }
  }, [trigger, minimumSession]);

  const shouldShowPaymentEvidenceEntry =
    course?.playerAppliedStatus === PlayerAppliedStatus.Accepted &&
    (course?.paymentStatus === CoursePaymentStatus.Unpaid ||
      course?.paymentStatus === CoursePaymentStatus.Rejected);

  const submitPaymentEvidence = () => {
    return (
      <TipsComponent
        icon={<LocationIcon color="#F16514" />}
        title={t("Payment evidence")}
        body={t("Please submit the payment evidence")}
        submitText={t("Submit now")}
        bg="rgba(232, 106, 16, 0.1)"
        iconProps={{ bg: "rgba(232, 106, 16, 0.15)" }}
        onPress={() => {
          if (course)
            navigation.navigate("AddCoursePaymentEvidence", {
              course,
            });
        }}
      />
    );
  };

  const sessionsModal = () => {
    const shiftedFirstSessions = upnextSessions.slice(1).slice(0, 10);
    return (
      <Modal
        isOpen={isOpen.allSessions}
        onClose={() => setIsOpen((prev) => ({ ...prev, allSessions: false }))}
      >
        <Modal.Content>
          <Modal.CloseButton />
          {upnextSessions[0] && (
            <>
              <Modal.Header alignSelf="flex-start">
                {t("Next session")}
              </Modal.Header>
              <Modal.Body>
                <Text>{`${t("Session")} ${
                  upnextSessions[0].personalIndex
                } - ${formatUtcToLocalDate(
                  upnextSessions[0].courseSessionFrom
                )}`}</Text>
              </Modal.Body>
            </>
          )}
          <Modal.Header alignSelf="flex-start">
            {t("Remained sessions")}
          </Modal.Header>
          <Modal.Body>
            {shiftedFirstSessions && shiftedFirstSessions.length > 0 && (
              <VStack space="2">
                {shiftedFirstSessions.map((session) => {
                  return (
                    <Text
                      key={`${session.courseId}${session.courseSessionFrom}${session.courseSessionId}${session.courseSessionTo}`}
                    >{`${t("Session")} ${
                      session.personalIndex
                    } - ${formatUtcToLocalDate(
                      session.courseSessionFrom
                    )}`}</Text>
                  );
                })}
              </VStack>
            )}
          </Modal.Body>
        </Modal.Content>
      </Modal>
    );
  };

  const onApply = async () => {
    if (course) {
      try {
        const appliedSessionIds = courseSessionId
          ? sessionOptions
              .filter(
                (session) =>
                  parseInt(session.value, 10) >= courseSessionId &&
                  parseInt(session.value, 10) - parseInt(minimumSession, 10) <
                    courseSessionId
              )
              .map((session) => parseInt(session.value, 10))
          : sessionOptions.map((session) => parseInt(session.value, 10));
        await createCourseApplication({
          courseId: course.id,
          courseSessionIds: appliedSessionIds,
        });

        navigation.reset({
          index: 0,
          routes: [
            {
              name: "PlayerCourseApplySuccess",
              params: {
                destination: "PlayerNavigator",
                nestedDestination: "PlayerCourseList",
                course,
                numberOfSessions: appliedSessionIds.length,
                upnextSession: sessionOptions.filter(
                  (session) => session.value === courseSessionId?.toString()
                )?.[0]?.label,
              },
            },
          ],
        });
      } catch (e) {
        showApiToastError(e);
      }
    }
  };

  const daysOfWeek = course?.daysOfWeek;

  return (
    <HeaderLayout
      isSticky
      headerProps={{
        title: t("Course details"),
        hasBackButton: true,
        containerStyle: { marginHorizontal: 0 },
      }}
      containerProps={{ marginHorizontal: space.defaultLayoutSpacing }}
    >
      {isValidating && <Loading />}
      {!isValidating && error && !course && <ErrorMessage />}
      {!isValidating && course && (
        <VStack space="4" flex="1">
          {shouldShowPaymentEvidenceEntry && submitPaymentEvidence()}
          {course?.imageUrl && (
            <Image
              borderRadius="xl"
              w="100%"
              height={160}
              alt="Course Image"
              source={{ uri: formatFileUrl(course.imageUrl) }}
              alignSelf="center"
              resizeMode="cover"
            />
          )}
          <Heading>{course.name}</Heading>
          <HStack flexWrap="wrap">
            {[
              DaysOfWeek.Monday,
              DaysOfWeek.Tuesday,
              DaysOfWeek.Wednesday,
              DaysOfWeek.Thursday,
              DaysOfWeek.Friday,
              DaysOfWeek.Saturday,
              DaysOfWeek.Sunday,
            ].map((d) => {
              const isIncluded =
                daysOfWeek && daysOfWeek.findIndex((v) => v === d) !== -1;
              return (
                <Badge
                  key={d}
                  w="10"
                  h="10"
                  borderRadius="full"
                  borderColor="rs.lightBlue"
                  bg={isIncluded ? "rs.lightBlue" : "rs.white"}
                  _text={{
                    color:
                      d === DaysOfWeek.Sunday
                        ? "rs_secondary.error"
                        : "rs.black",
                    fontWeight: "bold",
                  }}
                  m="1"
                >
                  {t(d.slice(0, 3).toUpperCase())}
                </Badge>
              );
            })}
          </HStack>
          <Text fontSize="md" fontWeight="bold" color="#31095E">
            {t("Date & Time")}
          </Text>
          <HStack space="3">
            <CalendarIcon />
            <Text>
              {course.fromDate} {t("to")} {course.toDate}
            </Text>
          </HStack>
          <HStack space="3">
            <ClockIcon />
            <Text>
              {`${format24HTo12H(
                course.startTime.toString()
              )} - ${format24HTo12H(course.endTime.toString())}`}
            </Text>
          </HStack>
          <Text fontSize="md" fontWeight="bold" color="#31095E">
            {t("Address")}
          </Text>
          <HStack space="3" flexWrap="wrap">
            <LocationIcon />
            <Text flex={1}>
              {t(course.district)}
              {`\n${course.address}`}
            </Text>
          </HStack>
          <Text fontSize="md" fontWeight="bold" color="#31095E">
            {t("Price")}
          </Text>
          <HStack space="3">
            <MoneyIcon />
            <Text>
              {t("HK$")}
              {course.fee}
            </Text>
          </HStack>
          <Text fontSize="md" fontWeight="bold" color="#31095E">
            {t("Description")}
          </Text>
          <Text>{course.description}</Text>

          {/* Session information */}
          {/* {course.playerAppliedStatus &&
            (course.playerAppliedStatus === PlayerAppliedStatus.Applied ||
              course.playerAppliedStatus === PlayerAppliedStatus.Accepted) &&
            upnextSessions.length > 0 &&
            !isOutTime && (
              <>
                <HStack justifyContent="space-between">
                  <VStack space="2">
                    <Heading>{t("Next session")}</Heading>
                    <HStack space="2" alignItems="center">
                      <CalendarIcon />
                      <Text>{`${t("Session")} - ${formatUtcToLocalDate(
                        upnextSessions[0].courseSessionFrom
                      )}`}</Text>
                    </HStack>
                  </VStack>

                  <VStack space="2" ml="3">
                    <Heading>{t("Remained sessions")}</Heading>
                    <HStack space="2" alignItems="center">
                      <FlagIcon size="sm" />
                      <Text>{upnextSessions.length - 1}</Text>
                    </HStack>
                  </VStack>
                </HStack>
                <Pressable
                  onPress={() => {
                    setIsOpen((prev) => ({ ...prev, allSessions: true }));
                  }}
                >
                  <Text color="rs.primary_purple">
                    {t("View all sessions")}
                  </Text>
                </Pressable>
              </>
            )} */}
          {shouldShowCourseSessionPick && (
            <>
              <Text fontSize="md" fontWeight="bold" color="#31095E">
                {t("Date of First Session")}
              </Text>
              <FormInput
                label={t("Course session")}
                controllerProps={{
                  name: "courseSessionText",
                  control,
                  rules: {
                    required: shouldShowCourseSessionPick && t("is required"),
                    validate: {
                      withInRange: (v) => {
                        if (
                          v &&
                          courseSessionId &&
                          minimumSession &&
                          sessionOptions
                        ) {
                          return (
                            sessionOptions.findIndex(
                              (session) =>
                                session.value === courseSessionId?.toString()
                            ) <=
                              sessionOptions.length -
                                parseInt(minimumSession, 10) ||
                            t("Out of index of sessions")
                          );
                        }
                      },
                    },
                  },
                }}
                inputProps={{
                  editable: false,
                  InputRightElement: <DownArrowIcon mr="4" />,
                }}
                onPress={() => {
                  setIsOpen((prev) => ({ ...prev, sessions: true }));
                }}
              />
            </>
          )}
          {shouldShowNumberOfSessionText && (
            <>
              <Text fontSize="md" fontWeight="bold" color="#31095E">
                {t("Number of Sessions")}
              </Text>
              <VStack
                borderRadius="xl"
                justifyContent="center"
                p="4"
                bg="rs.grey"
              >
                <Text>{`${parseInt(minimumSession || "1", 10)}`}</Text>
              </VStack>
            </>
          )}
          {shouldShowNumberOfSessionPick && (
            <>
              <Text fontSize="md" fontWeight="bold" color="#31095E">
                {t("Number of Sessions")}
              </Text>
              <FormInput
                label={t("Minimum session to apply")}
                controllerProps={{
                  name: "minimumSession",
                  control,
                  rules: {
                    required: shouldShowNumberOfSessionPick && t("required"),
                  },
                }}
                inputProps={{
                  editable: false,
                  InputRightElement: <DownArrowIcon mr="4" />,
                }}
                onPress={() => {
                  setIsOpen((prev) => ({ ...prev, minSession: true }));
                }}
              />
              <HStack alignItems="center">
                <Box
                  w="6"
                  h="6"
                  alignItems="center"
                  justifyContent="center"
                  borderRadius="full"
                  mr="defaultLayoutSpacing"
                >
                  <ExclaimationIcon props={{ customFill: "#66CEE1" }} />
                </Box>
                <Text>{`${t("Need to apply for at least ")}${
                  course?.minimumRequiredConsecutiveSession || 1
                } ${t("sessions")}`}</Text>
              </HStack>
            </>
          )}

          <VStack borderRadius="xl" justifyContent="center" p="4" bg="rs.grey">
            <Text>{t("Total")}</Text>
            <Text fontSize="lg" fontWeight="bold">{`$${
              (upnextSessions && upnextSessions.length > 0
                ? upnextSessions.length
                : parseInt(minimumSession || "1", 10)) * course.fee
            }`}</Text>
          </VStack>

          {user?.userType !== UserType.ClubStaff &&
            user?.userType !== UserType.Coach &&
            course.playerAppliedStatus &&
            course.playerAppliedStatus === PlayerAppliedStatus.Null &&
            !isOutTime &&
            shouldShowApply && (
              <Button
                isLoadingText={t("Loading")}
                isDisabled={isSubmitting || !isValid}
                isLoading={isSubmitting}
                mt="auto"
                onPress={handleSubmit(onApply)}
              >
                {t("Apply")}
              </Button>
            )}
          {!isOutTime &&
            user?.userType !== UserType.ClubStaff &&
            user?.userType !== UserType.Coach &&
            course.playerAppliedStatus &&
            course.playerAppliedStatus === PlayerAppliedStatus.Accepted && (
              <VStack space={4}>
                <Button
                  onPress={() => {
                    navigation.navigate("AskForLeave", { courseId: course.id });
                  }}
                >
                  {t("Ask for leave")}
                </Button>
                <Button
                  variant="outline"
                  onPress={() => {
                    // to do View Sessions
                    navigation.navigate("ManageSessions", {
                      course,
                    });
                  }}
                >
                  {t("View Sessions")}
                </Button>
              </VStack>
            )}
          {/* <OneColumnPickerModal
            isOpen={isOpen.minSession}
            onClose={() => {
              setIsOpen((prev) => ({ ...prev, minSession: false }));
            }}
            headerLabel={t("Select sessions")}
            buttonLabel={t("Confirm")}
            options={courseMinimumSectionOptions}
            controllerProps={{
              name: "minimumSession",
              control,
              rules: {
                required:
                  shouldShowNumberOfSessionPick &&
                  t("is required"),
              },
            }}
          /> */}
          <SingleSelectModal
            isOpen={isOpen.minSession}
            onClose={() => {
              setIsOpen((prev) => ({ ...prev, minSession: false }));
            }}
            title={t("Select sessions")}
            buttonLabel={t("Confirm")}
            options={courseMinimumSectionOptions}
            controllerProps={{
              name: "minimumSession",
              control,
              rules: {
                required: shouldShowNumberOfSessionPick && t("is required"),
              },
            }}
            confirmButtonText={t("Confirm")}
          />
          {/* <OneColumnPickerModal
            isOpen={isOpen.sessions}
            onClose={() => {
              setIsOpen((prev) => ({ ...prev, sessions: false }));
            }}
            headerLabel={t("Select sessions")}
            buttonLabel={t("Confirm")}
            options={sessionOptions}
            controllerProps={{
              name: "courseSessionId",
              control,
              rules: {
                required:
                  shouldShowCourseSessionPick &&
                  t("is required"),
              },
            }}
          /> */}
          <SingleSelectModal
            confirmButtonText={t("Confirm")}
            isOpen={isOpen.sessions}
            onClose={() => {
              setIsOpen((prev) => ({ ...prev, sessions: false }));
            }}
            title={t("Select sessions")}
            options={sessionOptions}
            controllerProps={{
              name: "courseSessionId",
              control,
              rules: {
                required: shouldShowCourseSessionPick && t("is required"),
              },
            }}
          />
        </VStack>
      )}
      {sessionsModal()}
    </HeaderLayout>
  );
}
