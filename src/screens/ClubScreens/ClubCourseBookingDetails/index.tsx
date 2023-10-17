import { RouteProp } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import axios from "axios";
import { isPast } from "date-fns";
import { HStack, VStack, Text, Heading, Button, Badge, Box } from "native-base";
import React, { useState } from "react";
import useSWR from "swr";
import { showApiToastError } from "../../../components/ApiToastError";
import BadgeHeader from "../../../components/Card/BadgeHeader";
import ErrorMessage from "../../../components/ErrorMessage";
import CalendarIcon from "../../../components/Icons/CalendarIcon";
import ClockIcon from "../../../components/Icons/ClockIcon";
import IncreaseIcon from "../../../components/Icons/IncreaseIcon";
import LocationIcon from "../../../components/Icons/LocationIcon";
import MoneyIcon from "../../../components/Icons/MoneyIcon";
import HeaderLayout from "../../../components/Layout/HeaderLayout";
import Loading from "../../../components/Loading";
import RejectWithReasonModal from "../../../components/Modal/RejectWithReasonModal";
import PlayerShortProfile from "../../../components/PlayerShortProfile";
import DaysOfWeek from "../../../constants/DaysOfWeek";
import {
  Action,
  CourseBookingResponse,
  PlayerAppliedStatus,
} from "../../../models/Response";
import { UserType } from "../../../models/User";
import { MainStackNavigatorParamList } from "../../../routers/Types";
import {
  MEET_UP_COURSE,
  updateCourseBooking,
} from "../../../services/CourseBookingServices";
import { getCourseById } from "../../../services/CourseServices";
import { formatMeetupApiUrl } from "../../../services/ServiceUtil";
import { format24HTo12H } from "../../../utils/date";
import { formatName, getUserName } from "../../../utils/name";
import { getTranslation } from "../../../utils/translation";
import {
  APPROVE_BUTTON_COLOR,
  REJECT_BUTTON_COLOR,
} from "../../../constants/constants";

const t = getTranslation([
  "screen.ClubScreens.ClubCourseBookingDetails",
  "constant.district",
  "constant.button",
]);

export type ClubCourseBookingDetailsNavigationProp = NativeStackNavigationProp<
  MainStackNavigatorParamList,
  "ClubCourseBookingDetails"
>;

export type ClubCourseBookingDetailsRouteProp = RouteProp<
  MainStackNavigatorParamList,
  "ClubCourseBookingDetails"
>;

interface ClubCourseBookingDetailsProps {
  navigation: ClubCourseBookingDetailsNavigationProp;
  route: ClubCourseBookingDetailsRouteProp;
}

export default function ClubCourseBookingDetails({
  navigation,
  route,
}: ClubCourseBookingDetailsProps) {
  const [rejectModalVisible, setRejectModalVisible] = useState<boolean>(false);

  const onPressApprove = async () => {
    if (courseResult && courseResult?.id) {
      try {
        await updateCourseBooking({
          action: Action.Approve,
          id: courseResult.id,
          parameters: {
            reasonReject: "",
          },
        });

        navigation.reset({
          index: 0,
          routes: [
            {
              name: "ClubApprovedCourseBooking",
              params: {
                destination: "ClubNavigator",
                nestedDestination: "ClubHome",
                course: courseResult?.course,
              },
            },
          ],
        });
      } catch (error) {
        showApiToastError(error);
      }
    }
  };

  const onPressReject = async (reasonReject: string) => {
    if (courseResult && courseResult.id) {
      try {
        await updateCourseBooking({
          action: Action.Reject,
          id: courseResult.id,
          parameters: {
            reasonReject,
          },
        });
        setRejectModalVisible(false);
        navigation.reset({
          index: 0,
          routes: [
            {
              name: "ClubRejectedCourseBooking",
              params: {
                destination: "ClubNavigator",
                nestedDestination: "ClubHome",
                course: courseResult?.course,
              },
            },
          ],
        });
      } catch (error) {
        showApiToastError(error);
      }
    }
  };

  const { course: courseResponse, courseId } = route.params;

  const {
    data: courseFetched,
    isValidating,
    error,
  } = useSWR<CourseBookingResponse>(
    courseId && !courseResponse
      ? formatMeetupApiUrl(`/course/${courseId}`)
      : null,
    (path) => {
      return axios.get(path).then((res) => {
        return res.data;
      });
    }
  );

  const courseResult = courseResponse || courseFetched;
  const displayName =
    courseResult?.course.creator.userType === UserType.Coach
      ? getUserName(courseResult?.course.creator)
      : courseResult?.course.club?.name;

  return (
    <HeaderLayout
      isSticky
      containerProps={{ padding: 16 }}
      headerProps={{
        title: t("Request Course"),
        onPress: () => {
          navigation?.goBack();
        },
      }}
    >
      {isValidating && <Loading />}
      {!isValidating && error && <ErrorMessage />}
      {!isValidating && !error && courseResult && (
        <>
          <PlayerShortProfile player={courseResult.playerInfo} />
          <Box mt={6}>
            <HStack justifyContent="space-between">
              <Box>
                <Badge
                  borderColor="rs.lightBlue"
                  variant="outline"
                  bg="rs.lightBlue"
                  mr={4}
                  _text={{ color: "rs.white" }}
                >
                  {displayName}
                </Badge>
                <Badge
                  borderColor="rs_secondary.orange"
                  variant="outline"
                  bg="rs_secondary.orange"
                  _text={{ color: "rs.white" }}
                >
                  {courseResult.course.level}
                </Badge>
              </Box>
              {courseResult.course.playerAppliedStatus &&
                courseResult.course.playerAppliedStatus !==
                  PlayerAppliedStatus.Null && (
                  <Badge
                    variant="outline"
                    borderColor="rs_secondary.orange"
                    _text={{ color: "rs_secondary.orange" }}
                  >
                    {courseResult.course.playerAppliedStatus}
                  </Badge>
                )}
            </HStack>
          </Box>
          <Heading mt="4">{courseResult.course.name}</Heading>
          <HStack mt="4">
            {DaysOfWeek.map((value) => {
              const isActive = courseResult.course.daysOfWeek.includes(value);
              return (
                <Box
                  key={value}
                  bgColor={isActive ? "rs.lightBlue" : "rs.white"}
                  _text={{ fontWeight: "semibold", textAlign: "center" }}
                  borderRadius="lg"
                  borderWidth="2"
                  borderColor="rs.lightBlue"
                  mx="auto"
                  p="1"
                  px="1"
                  opacity={isActive ? 1 : 0.3}
                >
                  {value.slice(0, 3)}
                </Box>
              );
            })}
          </HStack>
          <HStack space="3" mt="4">
            <CalendarIcon />
            <Text>
              {courseResult.course.fromDate} to {courseResult.course.toDate}
            </Text>
          </HStack>
          <HStack space="3" mt="4">
            <ClockIcon />
            <Text>
              {`${format24HTo12H(
                courseResult.course.startTime
              )} - ${format24HTo12H(courseResult.course.endTime)}`}
            </Text>
          </HStack>
          <HStack space="3" mt="4">
            <LocationIcon />
            <Text>
              {courseResult.course.district}
              {courseResult.course.location}
            </Text>
          </HStack>
          <HStack mt="4" space="3">
            <MoneyIcon />
            <Text>
              {courseResult.course.fee} {t("hkd")}
            </Text>
          </HStack>
          <HStack mt="4" space="3">
            <IncreaseIcon />
            <Text>
              {courseResult.course.minAge} to {courseResult.course.maxAge}
            </Text>
          </HStack>

          <Heading mt="4">{t("Description")}</Heading>
          <Text>{courseResult.course.description}</Text>

          {courseResult.course.playerAppliedStatus ===
            PlayerAppliedStatus.Null && (
            <VStack alignSelf="center" width="100%">
              <Button
                alignSelf="center"
                width="100%"
                mt="10"
                onPress={onPressApprove}
                bg={APPROVE_BUTTON_COLOR}
              >
                {t("Approve")}
              </Button>
              <Button
                alignSelf="center"
                width="100%"
                mt="5"
                variant="outline"
                onPress={() => setRejectModalVisible(true)}
                borderColor={REJECT_BUTTON_COLOR}
                _text={{ color: REJECT_BUTTON_COLOR }}
              >
                {t("Reject")}
              </Button>
            </VStack>
          )}

          {courseResult && courseResult.playerInfo && (
            <RejectWithReasonModal
              isOpen={rejectModalVisible}
              onClose={() => setRejectModalVisible(false)}
              onPressSubmit={onPressReject}
              user={courseResult.playerInfo}
              rejectObject={{ name: `course ${courseResult.course.name}` }}
            />
          )}
        </>
      )}
    </HeaderLayout>
  );
}
