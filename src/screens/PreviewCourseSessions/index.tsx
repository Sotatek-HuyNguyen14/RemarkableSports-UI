/* eslint-disable no-bitwise */
import React, { useState } from "react";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";

import {
  ArrowUpIcon,
  Badge,
  Box,
  Button,
  Center,
  Divider,
  Heading,
  HStack,
  Modal,
  Pressable,
  Text,
  useTheme,
  VStack,
} from "native-base";
import { RouteProp } from "@react-navigation/native";
import { MainStackNavigatorParamList } from "../../routers/Types";
import { getTranslation } from "../../utils/translation";

import CheckIcon from "../../components/Icons/CheckIcon";
import { useAuth } from "../../hooks/UseAuth";
import { UserType } from "../../models/User";
import HeaderLayout from "../../components/Layout/HeaderLayout";
import AddSessionComponent, {
  AddCourseSessionModel,
} from "../AddCourse/AddSessionComponent";
import BannerButton from "../../components/BannerButton";
import DownArrowIcon from "../../components/Icons/DownArrowIcon";
import UpArrowIcon from "../../components/Icons/UpArrowIcon";
import SettingConfigIcon from "../../components/Icons/SettingConfigIcon";
import { CourseSessionType } from "../AddCourseSession";
import ConfirmationModal from "../../components/ConfirmationModal/ConfirmationModal";
import {
  addCourseCreating,
  createCourseV2,
} from "../../services/CourseServices";
import { showApiToastError } from "../../components/ApiToastError";
import {
  CourseCoach,
  CourseCoachType,
  CourseSessionV2,
  CourseType,
} from "../../models/responses/Course";
import { format12HTo24H } from "../../utils/date";
import { isBlank } from "../../utils/strings";

export type PreviewCourseSessionsPropsNavigationProp =
  NativeStackNavigationProp<
    MainStackNavigatorParamList,
    "PreviewCourseSessions"
  >;

type PreviewCourseSessionsPropsBaseProps = RouteProp<
  MainStackNavigatorParamList,
  "PreviewCourseSessions"
>;

export interface PreviewCourseSessionsProps
  extends PreviewCourseSessionsPropsBaseProps {
  route: PreviewCourseSessionsPropsBaseProps;
  navigation: PreviewCourseSessionsPropsNavigationProp;
}
const t = getTranslation(["component.AddSessionComponent", "constant.button"]);

export const flatternCourseSessions = (sessions: AddCourseSessionModel[]) => {
  const result: AddCourseSessionModel[] = [];
  sessions.forEach((s) => {
    if (s.type === CourseSessionType.Loop) {
      if (s.childSessions && s.childSessions.length > 0) {
        s.childSessions.forEach((child) => {
          result.push(child);
        });
      } else {
        result.push(s);
      }
    } else {
      result.push(s);
    }
  });
  return result;
};

export default function PreviewCourseSessions({
  navigation,
  route,
}: PreviewCourseSessionsProps) {
  const { sessions, course } = route.params;
  const flatternSessions = flatternCourseSessions(sessions);
  const [isCourseFree, setIsCourseFree] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const sessionItem = (session: AddCourseSessionModel) => {
    return (
      <VStack
        bgColor="rs.white"
        shadow="9"
        borderRadius="2xl"
        style={{
          shadowOffset: {
            width: 5,
            height: 5,
          },
          shadowOpacity: 0.1,
        }}
        px="3"
        py="3"
        space="2"
      >
        <HStack space="2" alignItems="center">
          <Text fontSize="md" fontWeight="bold">
            {`${session.date}`}
          </Text>
          {session.group !== 0 && (
            <Badge
              borderColor="#66CEE133"
              variant="outline"
              bg="#66CEE133"
              _text={{ color: "rs.black" }}
              mr={3}
            >
              {`${t("Group")} ${session.group}`}
            </Badge>
          )}
        </HStack>
        <Text>{`${session.startTime} - ${session.endTime}`}</Text>
      </VStack>
    );
  };

  const { user } = useAuth();

  return (
    <HeaderLayout
      KeyboardAwareScrollViewProps={{
        bounces: false,
      }}
      headerProps={{
        title: t("Preview Session"),
        containerStyle: { marginHorizontal: 0 },
      }}
      isSticky
    >
      <VStack
        flex="1"
        space="3"
        mx="defaultLayoutSpacing"
        py="defaultLayoutSpacing"
      >
        {flatternSessions.map((s) => {
          return sessionItem(s);
        })}
      </VStack>
      <Button
        isLoading={isLoading}
        mx="defaultLayoutSpacing"
        mt="auto"
        onPress={() => {
          // Process course sessions
          course.courseSessionGroups = sessions.map((session) => {
            const coaches: CourseCoach[] = [];
            // Add head coach - private coach
            if (
              user?.userType === UserType.Coach &&
              course.courseType === CourseType.Public
            ) {
              coaches.push({
                coachId: user.id,
                coachType: CourseCoachType.Head,
                customizedPrice: null,
              });
            } else {
              coaches.push({
                coachId: session.assignedCoach,
                coachType:
                  course.courseType === CourseType.Public
                    ? CourseCoachType.Head
                    : CourseCoachType.Private,
                customizedPrice:
                  session.assignedCoachPrice &&
                  !isBlank(session.assignedCoachPrice)
                    ? session.assignedCoachPrice
                    : null,
              });
              // Add assistant coaches
              session.assistantCoaches.forEach((coach) => {
                coaches.push({
                  coachId: coach.coachId,
                  coachType: CourseCoachType.Assistant,
                  customizedPrice:
                    coach.customizePrice && !isBlank(coach.customizePrice)
                      ? coach.customizePrice
                      : null,
                });
              });
            }

            if (
              session.group !== 0 ||
              session.type === CourseSessionType.Loop
            ) {
              return {
                isRecursive: true,
                startDate: session.startDate,
                endDate: session.endDate,
                daysOfWeek: session.daysOfWeek,
                startTime: format12HTo24H(session.startTime)
                  .replace("上午", "AM")
                  .replace("下午", "PM"),
                endTime: format12HTo24H(session.endTime)
                  .replace("上午", "AM")
                  .replace("下午", "PM"),
                groupId: session.group,
                courseSessions: [],
                coaches,
              };
            }
            // single
            return {
              isRecursive: false,
              startDate: null,
              endDate: null,
              daysOfWeek: null,
              startTime: null,
              endTime: null,
              groupId: null,
              courseSessions: [
                {
                  startDate: session.date,
                  endDate: session.date,
                  daysOfWeek: null,
                  startTime: format12HTo24H(session.startTime)
                    .replace("上午", "AM")
                    .replace("下午", "PM"),
                  endTime: format12HTo24H(session.endTime)
                    .replace("上午", "AM")
                    .replace("下午", "PM"),
                  coaches,
                },
              ],
            };
          });
          navigation.navigate("AddCoursePaymentMethod", {
            isUpdating: false,
            course,
          });
        }}
      >
        {t("Next")}
      </Button>
    </HeaderLayout>
  );
}
