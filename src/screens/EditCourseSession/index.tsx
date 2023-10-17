/* eslint-disable no-bitwise */
import React, { useCallback, useMemo, useState } from "react";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";

import {
  ArrowUpIcon,
  Avatar,
  Box,
  Button,
  Center,
  Circle,
  Divider,
  Heading,
  HStack,
  Modal,
  Pressable,
  Text,
  useTheme,
  VStack,
} from "native-base";
import { RouteProp, useFocusEffect } from "@react-navigation/native";
import { useForm } from "react-hook-form";
import useSWR from "swr";
import { MainStackNavigatorParamList } from "../../routers/Types";
import { getTranslation } from "../../utils/translation";

import CheckIcon from "../../components/Icons/CheckIcon";
import { useAuth } from "../../hooks/UseAuth";
import { ClubStaff, Coach, UserType } from "../../models/User";
import HeaderLayout from "../../components/Layout/HeaderLayout";
import AddSessionComponent from "../AddCourse/AddSessionComponent";
import BannerButton from "../../components/BannerButton";
import DownArrowIcon from "../../components/Icons/DownArrowIcon";
import UpArrowIcon from "../../components/Icons/UpArrowIcon";
import SettingConfigIcon from "../../components/Icons/SettingConfigIcon";
import { getPeriod, hourList, minuteList } from "../../constants/Time";
import TimePicker from "../../components/v2/TimePicker";
import DateTimePicker from "../../components/v2/DateTimePicker";
import SingleSelectModal from "../../components/Modal/SingleSelectModal";
import PlusIcon from "../../components/Icons/PlusIcon";
import Card from "../../components/Card/Card";
import { formatCoreUrl, formatFileUrl } from "../../services/ServiceUtil";
import { getCoachByClub } from "../../services/ClubServices";
import { getUserName } from "../../utils/name";
import { isBlank } from "../../utils/strings";
import Loading from "../../components/Loading";
import ImageDirectory from "../../assets";
import PencilIcon from "../../components/Icons/PencilIcon";
import LogoutIcon from "../../components/Icons/LogoutIcon";
import {
  getCourseApplicationEnrollment,
  removePlayerSessionInCourse,
} from "../../services/CourseServices";
import {
  CourseApplicationResponse,
  CourseCoachType,
  CourseSessionsResponse,
} from "../../models/responses/Course";
import { formatUtcToLocalDate, formatUtcToLocalTime } from "../../utils/date";
import RemoveIcon from "../../components/Icons/RemoveIcon";
import { showApiToastError } from "../../components/ApiToastError";
import { showApiToastSuccess } from "../../components/ApiToastSuccess";
import ConfirmationModal from "../../components/ConfirmationModal/ConfirmationModal";
import NoDataComponent from "../../components/NoDataComponent";

export type EditCourseSessionPropsNavigationProp = NativeStackNavigationProp<
  MainStackNavigatorParamList,
  "EditCourseSession"
>;

type EditCourseSessionPropsBaseProps = RouteProp<
  MainStackNavigatorParamList,
  "EditCourseSession"
>;

export interface EditCourseSessionProps
  extends EditCourseSessionPropsBaseProps {
  route: EditCourseSessionPropsBaseProps;
  navigation: EditCourseSessionPropsNavigationProp;
}
const t = getTranslation([
  "screen.ClubScreens.EditCourseSession",
  "component.AddSessionComponent",
  "constant.eventType",
  "constant.button",
  "formInput",
  "toastMessage",
]);

export enum CourseSessionType {
  Loop = "Loop",
  Single = "Single",
}

export default function EditCourseSession({
  navigation,
  route,
}: EditCourseSessionProps) {
  const { application } = route.params;
  const {
    data: applicationEnrollments,
    isValidating,
    mutate,
  } = useSWR(
    formatCoreUrl(
      `/course/${application.courseId}/application/${application.playerId}/enrollment`
    ),
    () =>
      getCourseApplicationEnrollment(application.courseId, application.playerId)
  );

  const [removeSessionModal, setRemoveSessionModal] = useState(false);
  const [selectedRemovedSession, setSelectedRemovedSession] =
    useState<CourseSessionsResponse>();

  const filteredApplicationEnrollments = applicationEnrollments
    ? applicationEnrollments
        .filter((app) => app.courseId === application.courseId)
        ?.sort(
          (a, b) =>
            b.courseSessionFrom.getTime() - a.courseSessionFrom.getTime()
        )
    : [];

  useFocusEffect(
    useCallback(() => {
      mutate();
    }, [mutate])
  );

  const sessionItem = (item: CourseSessionsResponse) => {
    const headCoach = item.coaches.filter(
      (c) => c.coachType === CourseCoachType.Head
    )[0];
    return (
      <VStack
        key={`${item.courseId}-${item.courseSessionId}`}
        shadow="9"
        borderRadius="2xl"
        ml="2"
        style={{
          shadowOffset: {
            width: 5,
            height: 5,
          },
          shadowOpacity: 0.1,
          elevation: 3,
        }}
        bg="white"
        space="2"
        p="defaultLayoutSpacing"
      >
        <Heading>{formatUtcToLocalDate(item.courseSessionFrom)}</Heading>
        <Text>{`${formatUtcToLocalTime(
          item.courseSessionFrom
        )} - ${formatUtcToLocalTime(item.courseSessionTo)}`}</Text>
        {headCoach && (
          <HStack alignItems="center" space="1">
            <Avatar
              size="xs"
              source={
                headCoach.coach.profilePicture
                  ? { uri: formatFileUrl(headCoach.coach.profilePicture) }
                  : ImageDirectory.DRAFT_AVT
              }
            >
              Thumbnail
            </Avatar>
            <Text>{getUserName(headCoach.coach)}</Text>
          </HStack>
        )}
        <HStack space="3" mt="2">
          <Pressable
            flex="1"
            borderRadius="md"
            borderWidth="1"
            borderColor="rs.primary_purple"
            p="2"
            py="1.5"
            justifyContent="center"
            alignItems="center"
            onPress={() => {
              navigation.navigate("ChangeCourseSession", {
                session: item,
                playerId: application.playerId,
                isMoveSessionFlow: false,
                isEditSessionFlow: false,
                flow: "default",
              });
            }}
          >
            <HStack space="2">
              <PencilIcon innterFill="#31095E" />
              <Text fontWeight="bold" color="rs.primary_purple">
                {t("Change")}
              </Text>
            </HStack>
          </Pressable>
          <Pressable
            flex="1"
            borderRadius="md"
            borderWidth="1"
            borderColor="rs.primary_purple"
            p="2"
            py="1.5"
            justifyContent="center"
            alignItems="center"
            onPress={() => {
              setSelectedRemovedSession(item);
              setRemoveSessionModal(true);
            }}
          >
            <HStack space="2">
              <RemoveIcon />
              <Text fontWeight="bold" color="rs.primary_purple">
                {t("Remove")}
              </Text>
            </HStack>
          </Pressable>
        </HStack>
      </VStack>
    );
  };

  if (isValidating) {
    return <Loading />;
  }

  return (
    <HeaderLayout
      KeyboardAwareScrollViewProps={{
        bounces: false,
      }}
      headerProps={{
        title: t("Edit Sessions"),
        hasBackButton: true,
        containerStyle: { marginHorizontal: 0 },
      }}
      isSticky
    >
      <VStack space="3" mx="defaultLayoutSpacing">
        {filteredApplicationEnrollments &&
          filteredApplicationEnrollments.length === 0 && <NoDataComponent />}
        {filteredApplicationEnrollments &&
          filteredApplicationEnrollments
            .sort((a, b) => {
              if (a.courseSessionFrom.getTime() > b.courseSessionFrom.getTime())
                return 1;
              if (a.courseSessionFrom.getTime() < b.courseSessionFrom.getTime())
                return -1;
              return 0;
            })
            .map((item) => {
              return sessionItem(item);
            })}
      </VStack>
      <ConfirmationModal
        alertType="Fail"
        confirmText={t("Confirm")}
        cancelText={t("Cancel")}
        isOpen={removeSessionModal}
        onCancel={() => {
          setRemoveSessionModal(false);
        }}
        title={t("Confirm to remove session")}
        onConfirm={async () => {
          setRemoveSessionModal(false);
          try {
            if (selectedRemovedSession) {
              await removePlayerSessionInCourse(
                selectedRemovedSession.courseSessionId,
                selectedRemovedSession.courseId,
                application.id
              );
              showApiToastSuccess({});
              mutate();
            }
          } catch (apiError) {
            showApiToastError(apiError);
          }
        }}
      />
    </HeaderLayout>
  );
}
