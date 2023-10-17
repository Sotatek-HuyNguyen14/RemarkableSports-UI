import React from "react";
import {
  Heading,
  HStack,
  VStack,
  Text,
  Badge,
  Avatar,
  View,
  Pressable,
  IPressableProps,
} from "native-base";
import { parseISO } from "date-fns";
import useSWR from "swr";
import Card from "./Card";
import CalendarIcon from "../Icons/CalendarIcon";
import ClockIcon from "../Icons/ClockIcon";
import LocationIcon from "../Icons/LocationIcon";
import MoneyIcon from "../Icons/MoneyIcon";
import { DaysOfWeek, PlayerAppliedStatus } from "../../models/Response";
import { getTranslation } from "../../utils/translation";
import { format24HTo12H } from "../../utils/date";
import { formatName, getUserName } from "../../utils/name";
import { CourseResponse } from "../../models/responses/Course";
import { formatCoreUrl, formatFileUrl } from "../../services/ServiceUtil";
import { useAuth } from "../../hooks/UseAuth";
import { UserType } from "../../models/User";
import {
  getCourseApplication,
  getCourseEnrollmentStatus,
} from "../../services/CourseServices";
import { CourseApplicationStatus } from "../../models/responses/CourseApplication";

const t = getTranslation([
  "component.Card.CourseCard",
  "constant.district",
  "constant.profile",
  "constant.week",
]);
export default function CourseCard({
  course,
  footer,
  onPress,
  boxProps,
}: {
  course: CourseResponse;
  footer?: JSX.Element;
  onPress?: () => void;
  boxProps?: IPressableProps;
}) {
  const { daysOfWeek } = course;
  const endTime = parseISO(`${course?.toDate} ${course?.endTime}`);
  const isOutTime = endTime.getTime() < new Date().getTime();
  const displayName =
    course.creator.userType === UserType.Coach
      ? getUserName(course.creator)
      : course.club?.name;

  const appliedCount = course.approvedParticipantNumber;

  const isCompleted = isOutTime;
  const isFull = appliedCount !== 0 && appliedCount === course.capacity;
  const isApplied =
    course.playerAppliedStatus &&
    course.playerAppliedStatus === PlayerAppliedStatus.Accepted;
  const isPendingForApproval =
    course.playerAppliedStatus &&
    course.playerAppliedStatus === PlayerAppliedStatus.Applied;
  const isAvailable = !isCompleted && !isFull;
  const bg = isCompleted
    ? "#959595"
    : isPendingForApproval
    ? "#FF9900"
    : isApplied
    ? "#66CEE1"
    : isAvailable
    ? "#00B812"
    : isFull
    ? "#F50000"
    : "#66CEE1";
  const text = isCompleted
    ? t("Completed")
    : isPendingForApproval
    ? t("Applied")
    : isApplied
    ? t("Accepted")
    : isAvailable
    ? t("Available")
    : isFull
    ? t("Full")
    : "";

  return (
    <Pressable
      onPress={onPress}
      borderRadius="2xl"
      bgColor="rs.white"
      shadow="9"
      style={{
        shadowOffset: {
          width: 5,
          height: 5,
        },
        shadowOpacity: 0.1,
      }}
      {...boxProps}
    >
      <View
        style={{
          height: 16,
          width: "100%",
          borderTopLeftRadius: 400,
          borderTopRightRadius: 400,
          backgroundColor: bg,
        }}
      />
      <VStack space="4" p="4" borderBottomRadius="2xl">
        {/* Heading & Status */}
        <HStack justifyContent="space-between" alignItems="center" space={4}>
          <Heading flex={1}>{course.name}</Heading>
          <Text fontWeight="bold" color={bg}>
            {text}
          </Text>
        </HStack>
        {/* Display name */}
        <HStack space="2" alignItems="center">
          {course.creator.userType === UserType.Coach &&
            course.creator.profilePicture && (
              <Avatar
                size="sm"
                source={{
                  uri: formatFileUrl(course.creator.profilePicture),
                }}
              >
                {`${course.creator.firstName.charAt(
                  0
                )}${course.creator.lastName.charAt(0)}`}
              </Avatar>
            )}

          {course.creator.userType === UserType.ClubStaff &&
            course?.club.profilePictureUrl && (
              <Avatar
                size="sm"
                source={{
                  uri: formatFileUrl(course.club.profilePictureUrl),
                }}
              >
                {course.club.name.charAt(0)}
              </Avatar>
            )}
          <Text fontWeight="bold">{displayName}</Text>
        </HStack>
        {/* Date */}
        <HStack alignItems="center" space="2">
          <CalendarIcon />
          <Text>
            {course.fromDate} {t("to")} {course.toDate}
          </Text>
        </HStack>
        {/* Time */}
        <HStack alignItems="center" space="2">
          <ClockIcon />
          <Text>
            {`${format24HTo12H(course.startTime.toString())} - ${format24HTo12H(
              course.endTime.toString()
            )}`}
          </Text>
        </HStack>
        {/* Location and price */}
        <HStack justifyContent="space-between" alignItems="center">
          <HStack flex="1" alignItems="center" space="2">
            <LocationIcon />
            <Text flex="1" numberOfLines={2}>
              {t(course.district)}
            </Text>
          </HStack>
          <HStack flex="1" alignItems="center" space="2">
            <MoneyIcon />
            <Text flex="1" numberOfLines={2}>
              {course.fee} {t("hkd")}
            </Text>
          </HStack>
        </HStack>
        {/* Days of weeks */}
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
                w="8"
                h="8"
                borderRadius="full"
                borderColor="rs.lightBlue"
                bg={isIncluded ? "rs.lightBlue" : "rs.white"}
                _text={{
                  color:
                    d === DaysOfWeek.Sunday ? "rs_secondary.error" : "rs.black",
                  fontWeight: "bold",
                }}
                m="1"
              >
                {t(d.slice(0, 3).toUpperCase())}
              </Badge>
            );
          })}
        </HStack>
        {/* Footer */}
        {footer}
      </VStack>
    </Pressable>
  );
}
