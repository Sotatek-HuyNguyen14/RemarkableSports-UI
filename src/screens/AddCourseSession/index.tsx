/* eslint-disable no-bitwise */
import React, { useMemo, useState } from "react";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";

import {
  ArrowUpIcon,
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
import { RouteProp } from "@react-navigation/native";
import { useForm } from "react-hook-form";
import useSWR from "swr";
import { MainStackNavigatorParamList } from "../../routers/Types";
import { getTranslation } from "../../utils/translation";

import CheckIcon from "../../components/Icons/CheckIcon";
import { useAuth } from "../../hooks/UseAuth";
import { ClubStaff, Coach, UserType } from "../../models/User";
import HeaderLayout from "../../components/Layout/HeaderLayout";
import AddSessionComponent, {
  AddCourseSessionModel,
} from "../AddCourse/AddSessionComponent";
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
import { formatCoreUrl } from "../../services/ServiceUtil";
import { getCoachByClub } from "../../services/ClubServices";
import { getUserName } from "../../utils/name";
import { isBlank } from "../../utils/strings";
import Loading from "../../components/Loading";
import CourseSessionItem from "./CourseSessionItem";
import { CourseType } from "../../models/responses/Course";
import { isCourseSessionsUnique } from "../../services/CourseServices";
import { flatternCourseSessions } from "../PreviewCourseSessions";

export function generateUUID() {
  // Public Domain/MIT
  let d = new Date().getTime(); // Timestamp
  let d2 =
    (typeof performance !== "undefined" &&
      performance.now &&
      performance.now() * 1000) ||
    0; // Time in microseconds since page-load or 0 if unsupported
  return "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, function (c) {
    let r = Math.random() * 16; // random number between 0 and 16
    if (d > 0) {
      // Use timestamp until depleted
      r = (d + r) % 16 | 0;
      d = Math.floor(d / 16);
    } else {
      // Use microseconds since page-load if supported
      r = (d2 + r) % 16 | 0;
      d2 = Math.floor(d2 / 16);
    }
    return (c === "x" ? r : (r & 0x3) | 0x8).toString(16);
  });
}

export type AddCourseSessionPropsNavigationProp = NativeStackNavigationProp<
  MainStackNavigatorParamList,
  "AddCourseSession"
>;

type AddCourseSessionPropsBaseProps = RouteProp<
  MainStackNavigatorParamList,
  "AddCourseSession"
>;

export interface AddCourseSessionProps extends AddCourseSessionPropsBaseProps {
  route: AddCourseSessionPropsBaseProps;
  navigation: AddCourseSessionPropsNavigationProp;
}
const t = getTranslation([
  "screen.AddCourseSession",
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

export const processChildSession = (session: AddCourseSessionModel) => {
  for (
    let d = new Date(session.startDate);
    d <= new Date(session.endDate);
    d.setDate(d.getDate() + 1)
  ) {
    // If d is in the selected date of weeks then push the new session with "d"
    const day = d.toLocaleString("en-US", { weekday: "long" }).split(",")[0];

    const sessionDaysOfWeekStr = session.daysOfWeek
      .map((value) => value.toString())
      .join(" , ");

    if (sessionDaysOfWeekStr.includes(day)) {
      session.childSessions.push({
        type: CourseSessionType.Single,
        date: d.toISOString().slice(0, 10),
        startTime: session.startTime,
        endTime: session.endTime,
        daysOfWeek: session.daysOfWeek,
        isEdited: false,
        isLoopType: false,
        childSessions: [],
        startDate: "",
        endDate: "",
        group: session.group,
        personalId: generateUUID(),
        isExpand: false,
        assignedCoach: session.assignedCoach,
        assignedCoachPrice: session.assignedCoachPrice,
        isAssignedCoachCustomizePrice: session.isAssignedCoachCustomizePrice,
        assistantCoaches: session.assistantCoaches,
      });
    }
  }
  return session;
};

export default function AddCourseSession({
  navigation,
  route,
}: AddCourseSessionProps) {
  const [addSessionModal, setAddSessionModal] = useState(false);
  const [editSessionModal, setEditSessionModal] = useState(false);

  const [sessions, setSessions] = useState<AddCourseSessionModel[]>([]);
  const [selectedSession, setSelectedSession] =
    useState<AddCourseSessionModel>();
  const { course } = route.params;
  const { user } = useAuth();
  const shouldRenderDefaultState = sessions.length === 0;

  const staff = user as ClubStaff;
  const { data: coachList, isValidating } = useSWR(
    user?.userType === UserType.ClubStaff
      ? formatCoreUrl(`/club/${staff?.club?.id}/coach?status=Approved`)
      : null,
    async () => getCoachByClub(staff?.club?.id ?? ""),
    {
      errorRetryCount: 0,
      onError: () => {},
      onErrorRetry: () => {},
      shouldRetryOnError: false,
    }
  );

  const coachOptions = coachList
    ? coachList.map((coach) => {
        return {
          label: getUserName(coach.candidateInfo),
          value: coach.candidateInfo.id,
        };
      })
    : [];

  const shouldShowAssignedCoach = user?.userType === UserType.ClubStaff;

  const onAddSession = (session: AddCourseSessionModel) => {
    // Re-process the session
    // 0 - Get the latest group number in the sessions
    let maxGroupNumber = 0;
    sessions.forEach((s) => {
      if (s.isLoopType && s.group >= maxGroupNumber) {
        maxGroupNumber = s.group;
      }
    });
    // 1 - If isLoopType is true => Set the "type" value
    let computedSession: AddCourseSessionModel = {
      ...session,
      type: session.isLoopType
        ? CourseSessionType.Loop
        : CourseSessionType.Single,
      personalId: generateUUID(),
      childSessions: [],
      group: session.isLoopType ? maxGroupNumber + 1 : 0,
      assignedCoach: session.assignedCoach,
    };
    // 2 - If isLoopType is true => Add child sessions
    if (computedSession.type === CourseSessionType.Loop) {
      computedSession = processChildSession(computedSession);
    }
    setSessions((oldSession) => [...oldSession, computedSession]);
  };

  const onEditSession = (session: AddCourseSessionModel, group: number) => {
    // Re-process the session
    // 1 - If isLoopType is true => Set the "type" value
    let computedSession: AddCourseSessionModel = {
      ...session,
      type: session.isLoopType
        ? CourseSessionType.Loop
        : CourseSessionType.Single,
      personalId: generateUUID(),
      childSessions: [],
      group,
      isEdited: true,
      assignedCoach: session.assignedCoach,
    };
    // 2 - If isLoopType is true => Add child sessions
    if (computedSession.type === CourseSessionType.Loop) {
      computedSession = processChildSession(computedSession);
    }

    const newSessions = sessions.map((s) => {
      if (s.personalId === session.personalId) {
        return computedSession;
      }
      const newChild = s.childSessions.map((child) => {
        if (child.personalId === session.personalId) {
          return computedSession;
        }
        return child;
      });
      // eslint-disable-next-line no-param-reassign
      s.childSessions = newChild;
      return s;
    });
    setSessions(newSessions);
    setAddSessionModal(false);
  };

  const onPressSession = (session: AddCourseSessionModel) => {
    const newSessions = sessions.map((s) => {
      if (s.personalId === session.personalId) {
        return { ...s, isExpand: !s.isExpand };
      }
      const childSessionsFound = s.childSessions.map((child) => {
        if (child.personalId === session.personalId) {
          return { ...child, isExpand: !child.isExpand };
        }
        return child;
      });
      // eslint-disable-next-line no-param-reassign
      s.childSessions = childSessionsFound;
      return s;
    });
    setSessions(newSessions);
  };

  const onRemoveSession = (session: AddCourseSessionModel) => {
    const newSessions = sessions
      .filter((s) => {
        // Try find in the parent session
        return s.personalId !== session.personalId;
      })
      .map((s) => {
        // Remove in child session if needed
        const childSessionsFound = s.childSessions.filter((child) => {
          return child.personalId !== session.personalId;
        });
        // eslint-disable-next-line no-param-reassign
        s.childSessions = childSessionsFound;
        return s;
      });
    setSessions(newSessions);
  };

  const defaultState = () => {
    return (
      <Card
        body={
          <AddSessionComponent
            shouldShowAddAssistantCoaches={
              course.courseType === CourseType.Public
            }
            shouldShowAssignedCoach={shouldShowAssignedCoach}
            clubCoachArrays={shouldShowAssignedCoach ? coachOptions : []}
            onAddSession={(session) => {
              setAddSessionModal(false);
              onAddSession(session);
            }}
          />
        }
      />
    );
  };

  const sectionTimeInfo = (session: AddCourseSessionModel) => {
    return (
      <CourseSessionItem
        shouldShowAddAssistantCoaches={course.courseType === CourseType.Public}
        session={session}
        shouldShowAssignedCoach={shouldShowAssignedCoach}
        coachOptions={coachOptions}
        onEditSession={onEditSession}
        onRemoveSession={onRemoveSession}
      />
    );
  };

  const sessionItem = (session: AddCourseSessionModel) => {
    const singleContent = () => {
      // Single type
      if (session.type === CourseSessionType.Single) {
        return (
          <VStack space="2" w="100%">
            <HStack w="100%" alignItems="center" justifyContent="space-between">
              <HStack space="2" alignItems="center">
                <Text fontSize="lg" fontWeight="bold">
                  {session.date}
                </Text>
                {session.isEdited && (
                  <Text fontSize="md">{`(${t("Edited")})`}</Text>
                )}
              </HStack>
              {!session.isExpand ? <DownArrowIcon /> : <UpArrowIcon />}
            </HStack>
            {session.isExpand && sectionTimeInfo(session)}
          </VStack>
        );
      }
    };
    const loopContent = () => {
      return (
        <VStack space="2" w="100%">
          <VStack space="2" mt="2">
            {session.childSessions.map((child) => {
              return sessionItem(child);
            })}
          </VStack>
        </VStack>
      );
    };

    const groupTitle = () => {
      return (
        <VStack space="3">
          <HStack
            alignItems="center"
            justifyContent="space-between"
            mx="defaultLayoutSpacing"
          >
            <Text fontSize="lg" fontWeight="bold" color="#31095E">
              {`${t("Group")} ${session.group}`}
            </Text>
            <Pressable
              onPress={() => {
                setSelectedSession(session);
                setEditSessionModal(true);
              }}
            >
              <SettingConfigIcon />
            </Pressable>
          </HStack>
          <Divider />
        </VStack>
      );
    };

    return (
      <VStack space="3" key={JSON.stringify(session)}>
        {session.type === CourseSessionType.Loop && groupTitle()}
        <Pressable
          w="100%"
          onPress={() => {
            onPressSession(session);
          }}
          justifyItems="space-between"
        >
          {session.type === CourseSessionType.Loop ? (
            loopContent()
          ) : (
            <HStack
              w="100%"
              bgColor="rs.white"
              shadow="9"
              borderRadius="xl"
              style={{
                shadowOffset: {
                  width: 5,
                  height: 5,
                },
                shadowOpacity: 0.1,
              }}
              px="5"
              alignItems="center"
              justifyContent="space-between"
              py="5"
            >
              {singleContent()}
            </HStack>
          )}
        </Pressable>
      </VStack>
    );
  };

  const addSessionView = () => {
    return (
      <VStack space="3" mt="3" flex="1">
        {sessions
          .filter((s) => !s.isLoopType)
          .map((s) => {
            return sessionItem(s);
          })}
        {sessions
          .filter((s) => s.isLoopType)
          .map((s) => {
            return sessionItem(s);
          })}
      </VStack>
    );
  };

  const addSessionModalView = () => {
    return (
      <Modal
        avoidKeyboard
        isOpen={addSessionModal}
        onClose={() => {
          setAddSessionModal(false);
        }}
        // size="full"
      >
        <Modal.Content>
          <Modal.Body m="3">
            <AddSessionComponent
              shouldShowAddAssistantCoaches={
                course.courseType === CourseType.Public
              }
              shouldShowAssignedCoach={shouldShowAssignedCoach}
              clubCoachArrays={shouldShowAssignedCoach ? coachOptions : []}
              isModel
              onCancel={() => {
                setAddSessionModal(false);
              }}
              onAddSession={(session) => {
                setAddSessionModal(false);
                onAddSession(session);
              }}
            />
          </Modal.Body>
        </Modal.Content>
      </Modal>
    );
  };

  const editSessionModalView = () => {
    return (
      <Modal
        avoidKeyboard
        isOpen={editSessionModal}
        onClose={() => {
          setEditSessionModal(false);
        }}
        // size="full"
      >
        <Modal.Content>
          {/* <Modal.CloseButton /> */}
          <Modal.Body m="3">
            <AddSessionComponent
              shouldShowAddAssistantCoaches={
                course.courseType === CourseType.Public
              }
              shouldShowAssignedCoach={shouldShowAssignedCoach}
              clubCoachArrays={shouldShowAssignedCoach ? coachOptions : []}
              defaultSession={selectedSession}
              isModel
              isEdit
              onCancel={() => {
                setEditSessionModal(false);
              }}
              onEditSession={(session) => {
                onEditSession(session, session.group);
                setEditSessionModal(false);
              }}
            />
          </Modal.Body>
        </Modal.Content>
      </Modal>
    );
  };

  const bannerView = () => {
    return (
      <Pressable
        onPress={() => {
          setAddSessionModal(true);
        }}
      >
        <HStack space="3" bgColor="#eee" p="4" alignItems="center">
          <Center>
            <Circle bgColor="rs.GPP_lightBlue">
              <PlusIcon size="md" m="3" />
            </Circle>
          </Center>
          <VStack flex="1" space="3" justifyContent="center">
            <Heading fontSize="lg">{t("Add sessions")}</Heading>
          </VStack>
        </HStack>
      </Pressable>
    );
  };

  if (isValidating) {
    return <Loading />;
  }

  const isSessionsUnique = isCourseSessionsUnique(
    flatternCourseSessions(sessions)
  );
  return (
    <HeaderLayout
      KeyboardAwareScrollViewProps={{
        bounces: false,
      }}
      headerProps={{
        title: t("Add Session"),
        hasBackButton: true,
        containerStyle: { marginHorizontal: 0 },
      }}
      isSticky
    >
      {!shouldRenderDefaultState && bannerView()}
      <VStack p="defaultLayoutSpacing" flex="1">
        {shouldRenderDefaultState ? defaultState() : addSessionView()}
      </VStack>
      <Button
        isDisabled={
          flatternCourseSessions(sessions).length === 0 ||
          flatternCourseSessions(sessions).length <
            parseInt(course.minimumRequiredConsecutiveSession, 10) ||
          !isSessionsUnique
        }
        mx="defaultLayoutSpacing"
        mt="auto"
        onPress={() => {
          navigation.navigate("PreviewCourseSessions", { sessions, course });
        }}
      >
        {t("Next")}
      </Button>
      {addSessionModal && addSessionModalView()}
      {editSessionModal && editSessionModalView()}
    </HeaderLayout>
  );
}
