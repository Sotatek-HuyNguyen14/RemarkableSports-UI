import { Text, HStack, Box, VStack, Pressable } from "native-base";
import React, { useCallback, useEffect, useRef, useState } from "react";
import { NativeStackScreenProps } from "@react-navigation/native-stack";
import { uniqueId } from "lodash";
import useSWR from "swr";
import { MainStackNavigatorParamList } from "../../../routers/Types";
import HeaderLayout from "../../../components/Layout/HeaderLayout";
import { getTranslation } from "../../../utils/translation";
import { useAuth } from "../../../hooks/UseAuth";
import { ClubStaff } from "../../../models/User";
import { formatCoreUrl } from "../../../services/ServiceUtil";
import Loading from "../../../components/Loading";
import ErrorMessage from "../../../components/ErrorMessage";
import NoDataComponent from "../../../components/NoDataComponent";
import CourseBreakdownRow from "./CourseBreakdownRow";
import { getClubCoursePerformance } from "../../../services/ClubServices";

export type ProfileScreenProps = NativeStackScreenProps<
  MainStackNavigatorParamList,
  "ClubCoursePerformance"
>;

const t = getTranslation("screen.ClubScreens.ClubCoursePerformance");

const headers = ["Course", "Income", "Cost", "Profit", "Status"];

export function ClubCoursePerformance({ navigation }: ProfileScreenProps) {
  const { user } = useAuth();
  const staff = user as ClubStaff;

  const {
    data: clubCourses,
    isValidating,
    error: clubCoursesError,
  } = useSWR(
    staff && staff?.club?.id
      ? formatCoreUrl(`/club/${staff.club.id}/course/report`)
      : null,
    () => {
      if (staff && staff?.club?.id) {
        return getClubCoursePerformance(staff?.club?.id);
      }
      return undefined;
    }
  );

  return (
    <HeaderLayout
      KeyboardAwareScrollViewProps={{
        bounces: false,
      }}
      headerProps={{
        title: t("Course Performance"),
        containerStyle: {
          marginHorizontal: 0,
        },
      }}
      isSticky
    >
      <VStack py="defaultLayoutSpacing" alignItems="center">
        <HStack
          w="full"
          borderBottomWidth={1}
          borderColor="#F3F3F3"
          py="2"
          px="defaultLayoutSpacing"
        >
          {headers.map((text) => (
            <Text
              key={text}
              flex={1}
              color="#72767C"
              fontWeight="bold"
              fontSize={12}
              textAlign="center"
            >
              {t(text)}
            </Text>
          ))}
        </HStack>
        {isValidating && !clubCourses && <Loading />}
        {!isValidating && clubCoursesError && <ErrorMessage />}
        {!clubCoursesError &&
          !!clubCourses &&
          Array.isArray(clubCourses) &&
          clubCourses?.length > 0 &&
          clubCourses.map((course) => (
            <CourseBreakdownRow clubCourse={course} key={uniqueId()} />
          ))}
        {!isValidating &&
          !clubCoursesError &&
          (!clubCourses ||
            !Array.isArray(clubCourses) ||
            !clubCourses?.length) && <NoDataComponent />}
      </VStack>
    </HeaderLayout>
  );
}
