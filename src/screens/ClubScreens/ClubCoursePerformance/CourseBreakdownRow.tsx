import { Box, HStack, Pressable, Text, VStack } from "native-base";
import { uniqueId } from "lodash";
import React, { useState } from "react";
import { getTranslation } from "../../../utils/translation";
import {
  ClubCoursePerformanceResponse,
  PlayerAttendanceModel,
} from "../../../models/responses/Club";
import DownArrowIcon from "../../../components/Icons/DownArrowIcon";
import UpArrowIcon from "../../../components/Icons/UpArrowIcon";
import { getUserName, truncate } from "../../../utils/name";

interface CourseBreakdownRowProps {
  clubCourse: ClubCoursePerformanceResponse;
}

const t = getTranslation("screen.ClubScreens.ClubCoursePerformance");

export default function CourseBreakdownRow({
  clubCourse,
}: CourseBreakdownRowProps) {
  const [isExpand, setIsExpand] = useState(false);
  const headers = ["Player Name", "Attended Sessions", "Remaining Sessions"];
  let bg = "#00B812";
  let prefix = "+";
  if (clubCourse.income === clubCourse.cost) {
    bg = "#909090";
    prefix = "";
  }
  if (clubCourse.income < clubCourse.cost) {
    bg = "#E71010";
    prefix = "-";
  }

  const renderExpand = (playerAttendance: PlayerAttendanceModel) => {
    const displayName = getUserName(playerAttendance.playerInfo);

    return (
      <VStack py="2" key={uniqueId()} bg="#F5F5F5" w="full">
        <HStack w="full" alignItems="center">
          <Text
            flex={1}
            color="rs_secondary.grey"
            textAlign="center"
            fontSize={12}
          >
            {displayName}
          </Text>

          <Text
            flex={1}
            textAlign="center"
            color="rs_secondary.grey"
            fontSize={12}
          >
            {playerAttendance.attendedSession}
          </Text>
          <Text
            flex={1}
            textAlign="center"
            color="rs_secondary.grey"
            fontSize={12}
          >
            {playerAttendance.remainingSession}
          </Text>
        </HStack>
      </VStack>
    );
  };

  return (
    <VStack
      borderBottomWidth={1}
      borderColor="#F3F3F3"
      w="full"
      alignItems="center"
      py="2.5"
    >
      <HStack w="full" px="defaultLayoutSpacing" alignItems="center">
        <Pressable
          flex={1}
          textAlign="center"
          flexDirection="row"
          alignItems="center"
          onPress={() => {
            if (
              clubCourse.playerAttendances &&
              clubCourse.playerAttendances.length > 0
            )
              setIsExpand(!isExpand);
          }}
        >
          {!isExpand && <DownArrowIcon size="3" />}
          {isExpand && <UpArrowIcon size="3" />}
          <Text ml="1" fontSize={12} isTruncated>
            {clubCourse.courseName}
          </Text>
        </Pressable>
        <Text flex={1} textAlign="center" fontSize={12}>
          ${clubCourse.income}
        </Text>
        <Text flex={1} textAlign="center" fontSize={12}>
          ${clubCourse.cost}
        </Text>
        <Box flex={1} mx="1" p="1" bg={bg} borderRadius="md">
          <Text textAlign="center" color="rs.white" fontSize={12}>
            {`${prefix}$${Math.abs(clubCourse.profit).toFixed(1)}`}
          </Text>
        </Box>
        <Text
          flex={0.9}
          textAlign="center"
          fontSize={12}
          color={clubCourse.status === "Past" ? "#909090" : "#00B812"}
        >
          {t(clubCourse.status)}
        </Text>
      </HStack>

      {isExpand &&
        clubCourse.playerAttendances &&
        clubCourse.playerAttendances.length > 0 && (
          <VStack alignItems="center">
            <HStack w="full" borderColor="#F3F3F3" py="2" alignItems="center">
              {headers.map((text) => (
                <Text
                  key={uniqueId()}
                  flex={1}
                  color="rs_secondary.grey"
                  fontSize={10}
                  textAlign="center"
                >
                  {t(text)}
                </Text>
              ))}
            </HStack>
            {clubCourse.playerAttendances.map((playerAttendance) =>
              renderExpand(playerAttendance)
            )}
          </VStack>
        )}
    </VStack>
  );
}
