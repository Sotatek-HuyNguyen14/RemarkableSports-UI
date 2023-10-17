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
  Avatar,
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
import {
  format24HTo12H,
  formatUtcToLocalDate,
  formatUtcToLocalTime,
} from "../../../utils/date";
import { formatName, getUserName } from "../../../utils/name";
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
import ImageDirectory from "../../../assets";

const t = getTranslation([
  "screen.PlayerScreens.CourseDetails",
  "constant.district",
  "constant.profile",
  "constant.week",
  "constant.button",
  "validation",
  "formInput",
  "screen.ClubHomeV2",
]);

type ClubCourseDetailsScreenProps = NativeStackScreenProps<
  MainStackNavigatorParamList,
  "ClubCourseDetails"
>;

interface FormValue {
  courseSessionId: number;
  minimumSession: string;
  courseSessionText: string;
  minimumSessionText: string;
}
export default function ClubCourseDetails({
  route,
  navigation,
}: ClubCourseDetailsScreenProps) {
  const { space } = useTheme();
  const { course: paramValue, courseId } = route.params;
  const courseID = courseId || paramValue?.id;
  const {
    data,
    isValidating: isCourseValidating,
    error,
    mutate: mutateCourse,
  } = useSWR(formatMeetupApiUrl("/course/{id}"), () =>
    getCourseById(courseID!)
  );

  const {
    data: courseSessions,
    isValidating: isCourseSessionsFetching,
    error: courseSessionError,
    mutate: courseSessionsMutate,
  } = useSWR(
    formatCoreUrl(`/course/${courseID}/session`),
    () => getCourseSessions(courseID!),
    {
      errorRetryCount: 0,
      errorRetryInterval: 0,
      shouldRetryOnError: false,
    }
  );

  useFocusEffect(
    React.useCallback(() => {
      mutateCourse();
    }, [mutateCourse])
  );

  const { user } = useAuth();
  const course = data;

  const daysOfWeek = course?.daysOfWeek;
  const displayName =
    course?.creator.userType === UserType.Coach
      ? getUserName(course.creator)
      : course?.club?.name;

  const isValidating = isCourseSessionsFetching || isCourseValidating;
  const upnextSession = courseSessions?.find((s) => {
    return new Date(s.courseSessionFrom).getTime() > new Date().getTime();
  });
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
          <Image
            borderRadius="xl"
            w="100%"
            height={160}
            alt="Course Image"
            source={
              course?.imageUrl
                ? { uri: formatFileUrl(course.imageUrl) }
                : ImageDirectory.VENUE
            }
            alignSelf="center"
            resizeMode="cover"
          />

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
            {t("Hosted by")}
          </Text>
          <HStack space="2" alignItems="center">
            <Avatar
              size="sm"
              source={
                course.creator.profilePicture
                  ? {
                      uri: formatFileUrl(course.creator.profilePicture),
                    }
                  : ImageDirectory.DRAFT_AVT
              }
            >
              Thumbnail
            </Avatar>
            <Text>{displayName}</Text>
          </HStack>
          <Text fontSize="md" fontWeight="bold" color="#31095E">
            {t("Upcoming Session")}
          </Text>

          {upnextSession && (
            <>
              {upnextSession && (
                <HStack space="3">
                  <CalendarIcon />
                  <Text>
                    {formatUtcToLocalDate(
                      new Date(upnextSession.courseSessionFrom)
                    )}
                  </Text>
                </HStack>
              )}
              {upnextSession && (
                <HStack space="3">
                  <ClockIcon />
                  <Text>
                    {`${formatUtcToLocalTime(
                      new Date(upnextSession.courseSessionFrom)
                    )} - ${formatUtcToLocalTime(
                      new Date(upnextSession.courseSessionTo)
                    )}`}
                  </Text>
                </HStack>
              )}
            </>
          )}
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
        </VStack>
      )}
    </HeaderLayout>
  );
}
