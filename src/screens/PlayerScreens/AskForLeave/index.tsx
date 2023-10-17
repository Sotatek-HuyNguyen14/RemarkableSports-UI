import React, { useCallback, useEffect, useMemo, useState } from "react";
import { NativeStackScreenProps } from "@react-navigation/native-stack";
import { Button, Heading, Text, Toast, useTheme, VStack } from "native-base";
import { Keyboard, TouchableWithoutFeedback } from "react-native";
import { useForm } from "react-hook-form";
import useSWR from "swr";

import { useFocusEffect } from "@react-navigation/native";
import { MainStackNavigatorParamList } from "../../../routers/Types";
import { getTranslation } from "../../../utils/translation";
import FormInput from "../../../components/FormInput/FormInput";
import DownArrowIcon from "../../../components/Icons/DownArrowIcon";
import HeaderLayout from "../../../components/Layout/HeaderLayout";
import { formatCoreUrl } from "../../../services/ServiceUtil";
import Loading from "../../../components/Loading";
import ErrorMessage from "../../../components/ErrorMessage";
import { formatUtcToLocalDate, FORMAT_DATE_UI } from "../../../utils/date";
import {
  applyLeaveCourse,
  getCourseApplicationEnrollment,
  getMakeUpSessions,
} from "../../../services/CourseServices";
import MessageToast, {
  MesssageToastType,
} from "../../../components/Toast/MessageToast";
import SingleSelectModal from "../../../components/Modal/SingleSelectModal";
import { useAuth } from "../../../hooks/UseAuth";
import { showApiToastError } from "../../../components/ApiToastError";
import { CourseSessionsResponse } from "../../../models/responses/Course";

export type AskForLeaveScreenProps = NativeStackScreenProps<
  MainStackNavigatorParamList,
  "AskForLeave"
>;

const t = getTranslation([
  "screen.PlayerScreens.AskForLeave",
  "constant.profile",
  "constant.button",
  "validation",
]);

export interface AskForLeaveForm {
  absentCourseSessionId: number;
  absentCourseSessionText: string;
}

export default function AskForLeave({
  navigation,
  route,
}: AskForLeaveScreenProps) {
  const { space } = useTheme();
  const {
    control,
    handleSubmit,
    watch,
    setValue,
    trigger,
    formState: { isDirty, isValid, isSubmitting },
  } = useForm<AskForLeaveForm>({
    mode: "onChange",
  });

  const [isOpen, setIsOpen] = useState({
    sessions: false,
  });

  const { courseId } = route.params;

  const { user } = useAuth();
  const {
    data: courseSessions,
    isValidating,
    error,
    mutate: courseSessionsMutate,
  } = useSWR(
    formatCoreUrl(`/course/${courseId}/application/${user?.id}/enrollment`),
    () => getCourseApplicationEnrollment(courseId, user?.id)
  );

  const filteredCourseSessions = useMemo(
    () =>
      courseSessions
        ? courseSessions?.filter((session) => session.courseId === courseId)
        : [],
    [courseSessions, courseId]
  );
  const absentCourseSessionId = watch("absentCourseSessionId");
  const absentCourseSessionText = watch("absentCourseSessionText");

  const { data: makeUpSessions, mutate: makeUpSessionsMutate } = useSWR(
    formatCoreUrl(`/course/${courseId}/upcoming-session`),
    () => getMakeUpSessions(courseId, absentCourseSessionText)
  );

  const [nonEmptyMakeupSessions, setNonEmptyMakeupSessions] = useState<
    CourseSessionsResponse[]
  >(makeUpSessions || []);

  useFocusEffect(
    React.useCallback(() => {
      makeUpSessionsMutate();
      courseSessionsMutate();
    }, [courseSessionsMutate, makeUpSessionsMutate])
  );
  const sessionOptions = useMemo(() => {
    return filteredCourseSessions
      ? filteredCourseSessions
          .filter(
            (session) =>
              session.courseSessionFrom.getTime() > new Date().getTime()
          )
          .map((session) => {
            return {
              label: formatUtcToLocalDate(session.courseSessionFrom),
              value: session.courseSessionId.toString(),
            };
          })
      : [];
  }, [filteredCourseSessions]);

  const onSubmit = async (formValue: AskForLeaveForm) => {
    try {
      await applyLeaveCourse({
        courseId,
        courseSessionIds: [formValue.absentCourseSessionId],
      });
      Toast.show({
        id: "applyLeaveSuccess",
        duration: 2000,
        placement: "top",
        render: () => {
          return (
            <MessageToast
              type={MesssageToastType.Success}
              title={t("Apply leave success")}
            />
          );
        },
      });
      navigation.goBack();
    } catch (apiError) {
      showApiToastError(apiError);
    }
  };

  const setCourseSession = useCallback(
    (newSession: string) => {
      setValue("absentCourseSessionText", newSession);
      getMakeUpSessions(courseId, newSession).then((data) => {
        setNonEmptyMakeupSessions(data);
      });
    },
    [courseId, setValue]
  );

  const filteredMakeupSessions = absentCourseSessionText
    ? nonEmptyMakeupSessions.filter((session) => {
        return (
          absentCourseSessionText !==
          formatUtcToLocalDate(session.courseSessionFrom)
        );
      })
    : [];

  useEffect(() => {
    if (absentCourseSessionId) {
      setCourseSession(
        sessionOptions.filter(
          (session) => session.value === absentCourseSessionId.toString()
        )[0].label
      );
      trigger("absentCourseSessionText");
    }
  }, [
    absentCourseSessionId,
    sessionOptions,
    trigger,
    setCourseSession,
    setValue,
  ]);

  return (
    <HeaderLayout
      headerProps={{
        title: t("Ask for leave"),
      }}
      containerProps={{ marginHorizontal: space.defaultLayoutSpacing }}
    >
      {isValidating && <Loading />}

      {!isValidating && error && <ErrorMessage />}

      {!isValidating && (
        <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
          <VStack space="8">
            <VStack flex="1" space="4">
              <Heading>{t("Select absent session")}</Heading>
              <FormInput
                label={t("Select absent session")}
                controllerProps={{
                  name: "absentCourseSessionText",
                  control,
                  rules: {
                    required: t("is required"),
                  },
                }}
                inputProps={{
                  editable: false,
                  InputRightElement: <DownArrowIcon mr="4" />,
                }}
                onPress={() =>
                  setIsOpen((prev) => ({ ...prev, sessions: true }))
                }
              />
              <Heading>{t("Make up session")}</Heading>
              <VStack
                borderRadius="xl"
                justifyContent="center"
                p="4"
                bg="rs.grey"
              >
                {filteredMakeupSessions.length > 0 &&
                filteredMakeupSessions[0] ? (
                  <Text>{`${t("Session")} ${formatUtcToLocalDate(
                    filteredMakeupSessions[0].courseSessionFrom
                  )}`}</Text>
                ) : (
                  <Text>N/A</Text>
                )}
              </VStack>
              {absentCourseSessionText &&
                filteredMakeupSessions.length === 0 && (
                  <Text color="rs_secondary.error">
                    {t("No make up sessions available")}
                  </Text>
                )}
            </VStack>
            <Button
              mt="auto"
              isLoading={isSubmitting}
              isDisabled={!isDirty || !isValid}
              isLoadingText={t("Loading")}
              onPress={handleSubmit(onSubmit)}
            >
              {t("Ask for leave")}
            </Button>
            <SingleSelectModal
              title={t("Select absent session")}
              options={sessionOptions}
              controllerProps={{
                name: "absentCourseSessionId",
                control,
                rules: {
                  required: true,
                },
              }}
              isOpen={isOpen.sessions}
              onClose={() => {
                setIsOpen((prev) => ({ ...prev, sessions: false }));
              }}
            />
          </VStack>
        </TouchableWithoutFeedback>
      )}
    </HeaderLayout>
  );
}
