import { VStack, useTheme, Text, HStack, Button, Badge } from "native-base";
import { NativeStackScreenProps } from "@react-navigation/native-stack";
import useSWR from "swr";
import React, { useCallback, useRef, useState } from "react";
import { useFocusEffect } from "@react-navigation/native";
import { getTranslation } from "../../utils/translation";
import HeaderLayout from "../../components/Layout/HeaderLayout";
import { MainStackNavigatorParamList } from "../../routers/Types";
import {
  CourseSessionStatus,
  CourseSessionsResponse,
} from "../../models/responses/Course";
import { formatCoreUrl } from "../../services/ServiceUtil";
import {
  getCourseUserSessions,
  getCourseSessions,
} from "../../services/CourseServices";
import Card from "../../components/Card/Card";
import { formatUtcToLocalDate, formatUtcToLocalTime } from "../../utils/date";
import Loading from "../../components/Loading";
import NoDataComponent from "../../components/NoDataComponent";
import { useAuth } from "../../hooks/UseAuth";
import { UserType } from "../../models/User";
import ErrorMessage from "../../components/ErrorMessage";
import NoAccessRight from "../../components/NoAccessRight";

export type ManageSessionsProps = NativeStackScreenProps<
  MainStackNavigatorParamList,
  "ManageSessions"
>;

export interface LocalCourseSessionsResponse extends CourseSessionsResponse {
  isAppiled: Boolean;
}

const t = getTranslation(["screen.ManageSessions", "constant.button"]);

export default function ManageSessions({
  route,
  navigation,
}: ManageSessionsProps) {
  const { course } = route.params;
  const courseID = course.id;

  const { user } = useAuth();
  const {
    data: sessionList,
    isValidating,
    error,
    mutate: sessionsMutate,
  } = useSWR(formatCoreUrl(`/course/${course.id}/session`), () =>
    getCourseSessions(course.id)
  );

  useFocusEffect(
    React.useCallback(() => {
      sessionsMutate();
    }, [sessionsMutate])
  );

  const {
    data: userSessions,
    mutate,
    isValidating: userSessionsisValidating,
    error: userSessionsError,
  } = useSWR(
    user?.userType === UserType.Player
      ? formatCoreUrl(`/course/${courseID}/user-sessions`)
      : null,
    user?.userType === UserType.Player
      ? () => getCourseUserSessions(courseID)
      : null
  );

  const filteredApplicationEnrollments = userSessions
    ? userSessions.filter(
        (app: CourseSessionsResponse) =>
          app.courseId === courseID &&
          app?.courseSessionStatus === CourseSessionStatus.Applied
      )
    : [];

  let localSessionList: LocalCourseSessionsResponse[] | undefined =
    sessionList?.map((session: CourseSessionsResponse) => {
      return {
        ...session,
        isAppiled: false,
      };
    });

  if (user?.userType === UserType.Player) {
    localSessionList = sessionList?.map((session: CourseSessionsResponse) => {
      const isAppiled = filteredApplicationEnrollments.some(
        (app: CourseSessionsResponse) =>
          app.courseSessionId === session.courseSessionId
      );
      return {
        ...session,
        isAppiled,
      };
    });
  }

  const availableSessions =
    localSessionList?.length &&
    localSessionList
      .sort(
        (a, b) => a.courseSessionFrom.getTime() - b.courseSessionFrom.getTime()
      )
      .filter(
        (session) =>
          !session.isAppiled &&
          session.courseSessionTo.getTime() > new Date().getTime()
      );

  const sessionCard = (session: LocalCourseSessionsResponse) => {
    return (
      <Card
        containerProps={{
          bg: session?.isAppiled ? "#CCCCCC" : null,
        }}
        key={`${session.courseSessionId}-${session.courseId}-${session.courseSessionFrom}-${session.courseSessionTo}`}
        body={
          <HStack alignItems="center" justifyContent="space-between" px="6">
            <VStack space={1.5}>
              <HStack space={4}>
                <Text
                  fontSize={20}
                  fontWeight={700}
                  lineHeight={28}
                >{`${formatUtcToLocalDate(session.courseSessionFrom)}`}</Text>
                {user?.userType !== UserType.Player && session.groupId && (
                  <Badge
                    borderColor="rgba(102, 206, 225, 0.2)"
                    variant="outline"
                    bg="rgba(102, 206, 225, 0.2)"
                    _text={{ color: "rs.black", fontWeight: 400 }}
                    fontSize={12}
                  >{`${t("Group")} ${session.groupId}`}</Badge>
                )}
              </HStack>
              <Text>
                {`${formatUtcToLocalTime(
                  session.courseSessionFrom
                )} - ${formatUtcToLocalTime(session.courseSessionTo)}`}
              </Text>
            </VStack>
            {session?.isAppiled ? (
              <Text color="rs.GPP_grey">{t("Applied")}</Text>
            ) : null}
          </HStack>
        }
      />
    );
  };

  // Only Course Creator (ClubStaff or Coach) and player able to manage their sessions
  const userHasRightToAccess =
    user?.userType === UserType.ClubStaff ||
    (user?.userType === UserType.Coach && course?.creatorId === user?.id) ||
    user?.userType === UserType.Player;
  if (!userHasRightToAccess) {
    return (
      <HeaderLayout
        KeyboardAwareScrollViewProps={{
          bounces: false,
        }}
        headerProps={{
          title: t("View Session"),
          containerStyle: { marginHorizontal: 0 },
          hasBackButton: true,
        }}
        isSticky
      >
        <NoAccessRight />
      </HeaderLayout>
    );
  }

  return (
    <HeaderLayout
      KeyboardAwareScrollViewProps={{
        bounces: false,
      }}
      headerProps={{
        title: t("View Session"),
        containerStyle: { marginHorizontal: 0 },
        hasBackButton: true,
      }}
      isSticky
    >
      {isValidating && <Loading />}
      {!isValidating && error && <ErrorMessage />}
      {!isValidating &&
        !error &&
        (!localSessionList ||
          (localSessionList && !localSessionList.length)) && (
          <NoDataComponent />
        )}
      {!isValidating && !error && (
        <VStack
          space="4"
          px="defaultLayoutSpacing"
          pt="defaultLayoutSpacing"
          flex={1}
        >
          {localSessionList &&
            localSessionList.length > 0 &&
            localSessionList?.map((session) => {
              return sessionCard(session);
            })}
          {user?.userType !== UserType.Player && (
            <Button
              variant="outline"
              w="full"
              mt="auto"
              onPress={() => {
                if (sessionList)
                  navigation.navigate("EditSessions", {
                    sessionList,
                    cachedList: [],
                    course,
                    isSessionListDidUpdate: false,
                    removedSessionIds: [],
                  });
              }}
            >
              {t("Edit")}
            </Button>
          )}
          {user?.userType === UserType.Player && (
            <Button
              w="full"
              mt="auto"
              isDisabled={!availableSessions || !availableSessions.length}
              onPress={() => {
                if (localSessionList && localSessionList.length) {
                  if (availableSessions)
                    navigation.navigate("ApplySessions", {
                      course,
                      sessionList: availableSessions,
                    });
                }
              }}
            >
              {t("Re-apply")}
            </Button>
          )}
        </VStack>
      )}
    </HeaderLayout>
  );
}
