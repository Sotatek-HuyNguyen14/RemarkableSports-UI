import { VStack, Text, Button, Pressable, HStack } from "native-base";
import { isFuture, isToday, parseISO } from "date-fns";
import React, { useCallback, useEffect, useMemo, useState } from "react";
import { NativeStackScreenProps } from "@react-navigation/native-stack";
import { useForm } from "react-hook-form";
import HeaderLayout from "../../components/Layout/HeaderLayout";
import { MainStackNavigatorParamList } from "../../routers/Types";
import { getTranslation } from "../../utils/translation";
import FormInput from "../../components/FormInput/FormInput";
import DownArrowIcon from "../../components/Icons/DownArrowIcon";
import SingleSelectModal from "../../components/Modal/SingleSelectModal";
import { postReapply } from "../../services/CourseServices";
import { useAuth } from "../../hooks/UseAuth";
import { showApiToastError } from "../../components/ApiToastError";
import { formatUtcToLocalDate } from "../../utils/date";
import { UserType } from "../../models/User";
import { showApiToastSuccess } from "../../components/ApiToastSuccess";

export type DivisionLeaderboardProps = NativeStackScreenProps<
  MainStackNavigatorParamList,
  "ApplySessions"
>;
export interface FormValue {
  courseSessionId: number;
  minimumSession: string;
  courseSessionText: string;
}

const t = getTranslation([
  "screen.ApplySessions",
  "constant.button",
  "formInput",
  "validation",
  "toastMessage",
]);

export default function ApplySessions({
  navigation,
  route,
}: DivisionLeaderboardProps) {
  const { user } = useAuth();
  const { sessionList, course } = route.params;

  const [isOpen, setIsOpen] = useState({
    sessions: false,
    minSession: false,
  });

  const {
    control,
    handleSubmit,
    formState: { isValid, isSubmitting },
    watch,
    setValue,
    trigger,
  } = useForm<FormValue>({
    mode: "onChange",
    defaultValues: {},
  });

  const courseSessionId = watch("courseSessionId");
  const minimumSession = watch("minimumSession");
  const isPlayer = user?.userType && user.userType === UserType.Player;
  const endTime = parseISO(`${course?.toDate} ${course?.endTime}`);
  const isOutTime = endTime.getTime() < new Date().getTime();
  const isRecurring = course?.daysOfWeek && course.daysOfWeek.length > 0;
  const isOffCourse = !isRecurring;
  const startTime = parseISO(`${course?.fromDate} ${course?.startTime}`);
  const isStarted = startTime.getTime() < new Date().getTime();

  const shouldShowCourseSessionPick =
    isPlayer && !isOutTime && (isRecurring || (isOffCourse && isStarted));

  const shouldShowNumberOfSessionPick = isPlayer && !isOutTime && isRecurring;

  const setCourseSession = useCallback(
    (newSession: string) => {
      setValue("courseSessionText", newSession);
    },
    [setValue]
  );

  const sessionOptions = useMemo(() => {
    return sessionList
      ? sessionList
          .filter((session) => {
            return session.courseSessionTo.getTime() >= new Date().getTime();
          })
          .map((session) => {
            return {
              label: formatUtcToLocalDate(session.courseSessionFrom),
              value: session.courseSessionId.toString(),
            };
          })
      : [];
  }, [sessionList]);

  useEffect(() => {
    if (courseSessionId) {
      setCourseSession(
        sessionOptions.filter(
          (session) => session.value === courseSessionId.toString()
        )[0].label
      );
      trigger("courseSessionText");
    }
  }, [courseSessionId, sessionOptions, trigger, setCourseSession, course]);

  useEffect(() => {
    if (minimumSession) {
      trigger("courseSessionText");
    }
  }, [trigger, minimumSession]);

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

        await postReapply({
          courseId: course.id,
          courseSessionIds: appliedSessionIds,
        });
        showApiToastSuccess({});
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
                  (session) => session.value === courseSessionId.toString()
                )[0].label,
              },
            },
          ],
        });
      } catch (e) {
        showApiToastError(e);
      }
    }
  };

  return (
    <HeaderLayout
      KeyboardAwareScrollViewProps={{
        bounces: false,
      }}
      headerProps={{
        title: t("Apply Sessions"),
        containerStyle: { marginHorizontal: 0 },
        hasBackButton: true,
      }}
      isSticky
    >
      <VStack space={4} p="defaultLayoutSpacing" flex={1}>
        <Text fontSize="md" fontWeight="bold" color="#31095E">
          {t("Date of First Session")}
        </Text>
        <FormInput
          label={t("Date of First Session")}
          controllerProps={{
            name: "courseSessionText",
            control,
            rules: {
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
                          session.value === courseSessionId.toString()
                      ) <=
                        sessionOptions.length - parseInt(minimumSession, 10) ||
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

        <Text fontSize="md" fontWeight="bold" color="#31095E">
          {t("Number of Sessions")}
        </Text>
        <FormInput
          label={t("Number of Sessions")}
          controllerProps={{
            name: "minimumSession",
            control,
          }}
          inputProps={{
            editable: false,
            InputRightElement: <DownArrowIcon mr="4" />,
          }}
          onPress={() => {
            setIsOpen((prev) => ({ ...prev, minSession: true }));
          }}
        />
        <Button
          isDisabled={!isValid}
          isLoadingText={t("Loading")}
          isLoading={isSubmitting}
          mt="auto"
          onPress={handleSubmit(onApply)}
        >
          {t("Apply")}
        </Button>
      </VStack>

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
    </HeaderLayout>
  );
}
