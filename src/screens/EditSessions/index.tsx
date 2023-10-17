/* eslint-disable @typescript-eslint/no-shadow */
import {
  VStack,
  Text,
  HStack,
  Button,
  Center,
  Circle,
  Pressable,
  Heading,
  Modal,
  Toast,
  Divider,
} from "native-base";
import { NativeStackScreenProps } from "@react-navigation/native-stack";
import useSWR from "swr";
import { parseInt, uniqueId } from "lodash";
import { formatInTimeZone } from "date-fns-tz";
import { isAfter, isFuture, parseISO } from "date-fns";
import React, {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { useForm } from "react-hook-form";
import { useFocusEffect } from "@react-navigation/native";
import { getTranslation } from "../../utils/translation";
import HeaderLayout from "../../components/Layout/HeaderLayout";
import { MainStackNavigatorParamList } from "../../routers/Types";
import {
  CourseCoach,
  CourseCoachType,
  CourseSessionsResponse,
  CourseType,
} from "../../models/responses/Course";
import { formatCoreUrl } from "../../services/ServiceUtil";
import {
  addCourseSessions,
  getCourseApplication,
  getCourseEnrollmentStatus,
  getCourseSessions,
  getDaysOfWeekForSession,
  isCourseSessionsUnique,
  mapCourseSessionResponseToAddCourseSessionModel,
  removeCourseSession,
} from "../../services/CourseServices";
import PlusIcon from "../../components/Icons/PlusIcon";
import DownArrowIcon from "../../components/Icons/DownArrowIcon";
import {
  format12HTo24H,
  format24HTo12H,
  formatUtcToLocalDate,
  formatUtcToLocalTime,
  validateTimeRange,
} from "../../utils/date";
import ConfirmationModal from "../../components/ConfirmationModal/ConfirmationModal";
import FormSwitch from "../../components/Switch/FormSwitch";
import DaysOfWeekComponent from "../../components/DaysOfWeekComponent";
import { DaysOfWeek } from "../../models/Response";
import DateTimePicker from "../../components/v2/DateTimePicker";
import TimePicker from "../../components/v2/TimePicker";
import { getPeriod, hourList, minuteList } from "../../constants/Time";
import FormInput from "../../components/FormInput/FormInput";
import ArraySessionsDateInput from "../../components/ArraySessionsDateInput";
import { useAuth } from "../../hooks/UseAuth";
import { showApiToastError } from "../../components/ApiToastError";
import MessageToast, {
  MesssageToastType,
} from "../../components/Toast/MessageToast";
import Loading from "../../components/Loading";
import ErrorMessage from "../../components/ErrorMessage";
import { CourseApplicationStatus } from "../../models/responses/CourseApplication";
import {
  CourseSessionType,
  generateUUID,
  processChildSession,
} from "../AddCourseSession";
import AddSessionComponent, {
  AddCourseSessionModel,
} from "../AddCourse/AddSessionComponent";
import UpArrowIcon from "../../components/Icons/UpArrowIcon";
import CourseSessionItem from "../AddCourseSession/CourseSessionItem";
import Card from "../../components/Card/Card";
import { ClubStaff, UserType } from "../../models/User";
import { getUserName } from "../../utils/name";
import { getCoachByClub } from "../../services/ClubServices";
import { flatternCourseSessions } from "../PreviewCourseSessions";
import { showApiToastSuccess } from "../../components/ApiToastSuccess";
import { isBlank } from "../../utils/strings";
import WarningIcon from "../../components/Icons/WarningIcon";

export type EditSessionsProps = NativeStackScreenProps<
  MainStackNavigatorParamList,
  "EditSessions"
>;

interface LoaclCourseEnrollmentStatus extends CourseSessionsResponse {
  isExpand: boolean;
  date: string;
  fromTime: string;
  toTime: string;
}

const t = getTranslation([
  "screen.ManageSessions",
  "screen.AddCourseSession",
  "constant.button",
  "formInput",
  "validation",
  "toastMessage",
]);

export interface FormValue {
  isRecursive: boolean;
  daysOfWeek: DaysOfWeek[];
  startDate: string;
  endDate: string;
  startTime: string;
  endTime: string;
  courseSessions: LoaclCourseEnrollmentStatus[];
}

export default function EditSessions({ route, navigation }: EditSessionsProps) {
  const {
    sessionList,
    course,
    isSessionListDidUpdate,
    removedSessionIds: removedSessionIdsParam,
    cachedList,
  } = route.params;
  const { user } = useAuth();
  const [isSubmitting, setIsSubmiting] = useState(false);
  const [confirmModal, setConfirmModal] = useState(false);
  const [leavePageModal, setLeavePageModal] = useState(false);
  const [removeSessionModal, setRemoveSessionModal] = useState(false);
  const [confirmRemoveSession, setConfirmRemoveSession] = useState(false);
  const [removedSessionIds, setRemovedSessionIds] = useState<number[]>(
    removedSessionIdsParam
  );

  useEffect(() => {
    if (isSessionListDidUpdate) {
      setRemovedSessionIds((prev) => [...prev, ...removedSessionIdsParam]);
    }
  }, [setRemovedSessionIds, removedSessionIdsParam, isSessionListDidUpdate]);

  // Track the cache list for keeping the state
  // Scenario:
  // Add a new session with Add sessions
  // Remove a existing session with applied player
  // After completely move the session => Back to Edit Sessions screen => Should able to see the newly added sessions
  // If not tracking -> It will disappear.
  // If isSessionListDidUpdate is true then the sessionList params is no longer valid
  const [sessions, setSessions] = useState<AddCourseSessionModel[]>(
    isSessionListDidUpdate
      ? cachedList
      : mapCourseSessionResponseToAddCourseSessionModel(sessionList)
  );

  const {
    data: allCourseSessions,
    isValidating: isApplicationFetching,
    error: fetchApplicationError,
    mutate: applicationsMutate,
  } = useSWR(
    formatCoreUrl(`/course/${course.id}/application/enrollment-status`),
    () => getCourseEnrollmentStatus(course.id),
    {
      errorRetryCount: 0,
      errorRetryInterval: 0,
      shouldRetryOnError: false,
    }
  );

  const staff = user as ClubStaff;

  const {
    data: coachList,
    isValidating: isCoachOptionsValidating,
    mutate: coachListMutate,
  } = useSWR(
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

  const mutateAll = useCallback(() => {
    applicationsMutate();
    coachListMutate();
  }, [applicationsMutate, coachListMutate]);

  useFocusEffect(
    React.useCallback(() => {
      mutateAll();
    }, [mutateAll])
  );

  const isValidating = isCoachOptionsValidating || isApplicationFetching;

  const [addSessionModal, setAddSessionModal] = useState(false);
  const [editSessionModal, setEditSessionModal] = useState(false);

  const [selectedSession, setSelectedSession] =
    useState<AddCourseSessionModel>();
  const [selectedRemoveSession, setSelectedRemoveSession] =
    useState<AddCourseSessionModel>();
  const shouldRenderDefaultState = false;

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
      const childSessionsFound = s.childSessions
        ? s.childSessions.map((child) => {
            if (child.personalId === session.personalId) {
              return { ...child, isExpand: !child.isExpand };
            }
            return child;
          })
        : [];
      // eslint-disable-next-line no-param-reassign
      s.childSessions = childSessionsFound;
      return s;
    });
    setSessions(newSessions);
  };

  const onRemoveSession = (
    session: AddCourseSessionModel,
    forceRemoveSession = false
  ) => {
    // If there is more than 1 user join this session => Show modal
    const selectedCourseSessionInfoMapping = allCourseSessions
      ? allCourseSessions.filter(
          (s) => s.courseSessionInfo.courseSessionId === session.courseSessionId
        )[0]
      : undefined;
    const shouldShowModal =
      selectedCourseSessionInfoMapping &&
      selectedCourseSessionInfoMapping.applicantCount > 0;
    if (shouldShowModal && !forceRemoveSession) {
      setSelectedRemoveSession(session);
      setRemoveSessionModal(true);
      return;
    }
    // New sessions that added by user => free to remove
    if (
      !session.isExistingData ||
      !session.courseSessionId ||
      session.courseSessionId === 0
    ) {
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
    } else {
      setRemovedSessionIds((prev) => [...prev, session.courseSessionId]);
    }
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
    const isSessionRemoved = removedSessionIds.includes(
      session.courseSessionId
    );
    return (
      <CourseSessionItem
        isSessionRemoved={isSessionRemoved}
        shouldShowAddAssistantCoaches={course.courseType === CourseType.Public}
        session={session}
        shouldShowAssignedCoach={shouldShowAssignedCoach}
        coachOptions={coachOptions}
        onEditSession={onEditSession}
        onRemoveSession={() => {
          onRemoveSession(session, false);
        }}
      />
    );
  };

  const singleSectionItem = (session: AddCourseSessionModel) => {
    const isSessionRemoved = removedSessionIds.includes(
      session.courseSessionId
    );
    const selectedCourseSessionInfoMapping = allCourseSessions
      ? allCourseSessions.filter(
          (s) => s.courseSessionInfo.courseSessionId === session.courseSessionId
        )[0]
      : undefined;
    // Show the warning when there is more than 1 player still applied to this session
    const shouldShowManagePlayerWarningForRemovedSession =
      isSessionRemoved &&
      selectedCourseSessionInfoMapping &&
      selectedCourseSessionInfoMapping?.applicantCount > 0;
    return (
      <HStack
        w="100%"
        bgColor={isSessionRemoved ? "#00000033" : "rs.white"}
        shadow={isSessionRemoved ? "none" : "9"}
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
        <VStack space="2" w="100%">
          <HStack w="100%" alignItems="center" justifyContent="space-between">
            <HStack space="2" alignItems="center">
              <Text fontSize="lg" fontWeight="bold">
                {session.date}
              </Text>
              {isSessionRemoved && (
                <Text fontSize="md">{`(${t("Removed")})`}</Text>
              )}
              {session.isEdited && !isSessionRemoved && (
                <Text fontSize="md">{`(${t("Edited")})`}</Text>
              )}
            </HStack>
            {!session.isExpand ? <DownArrowIcon /> : <UpArrowIcon />}
          </HStack>
          {session.isExpand && sectionTimeInfo(session)}
          {shouldShowManagePlayerWarningForRemovedSession && session.isExpand && (
            <Pressable
              onPress={() => {
                const matchedSession = sessionList.filter(
                  (s) => s.courseSessionId === session.courseSessionId
                )[0];
                if (matchedSession) {
                  navigation.navigate("ManageCourseSessionPlayer", {
                    session: matchedSession,
                    cachedList: sessions,
                    sessionList,
                    course,
                    removedSessionIds,
                  });
                }
              }}
            >
              <HStack space="1" alignItems="center" px="2">
                <WarningIcon size="lg" />
                <Text mr="2">
                  {t(
                    "Tap here to manage players that applied to this removed session"
                  )}
                </Text>
              </HStack>
            </Pressable>
          )}
        </VStack>
      </HStack>
    );
  };

  const sessionItem = (session: AddCourseSessionModel) => {
    const singleContent = () => {
      // Single type
      if (session.type === CourseSessionType.Single) {
        return singleSectionItem(session);
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
          {session.type === CourseSessionType.Loop
            ? loopContent()
            : singleContent()}
        </Pressable>
      </VStack>
    );
  };

  const groupSessionContent = () => {
    const allGroupedSessions = flatternCourseSessions(
      sessions.filter((s) => s.type === CourseSessionType.Loop)
    );

    // This func will return all possible group number we can have
    const allGroupNumbers: number[] = [];
    allGroupedSessions.forEach((s) => {
      if (s.group && !allGroupNumbers.includes(s.group)) {
        allGroupNumbers.push(s.group);
      }
    });
    return (
      <VStack>
        {allGroupNumbers.map((groupIndex) => {
          // Render all session with groupIndex i.e Group 1
          const allSessionInGroup = allGroupedSessions.filter(
            (s) => s.group === groupIndex
          );
          return (
            <VStack space="4" key={`${groupIndex}_group`}>
              {/* Group title */}
              <HStack
                mt="3"
                alignItems="center"
                justifyContent="space-between"
                mx="defaultLayoutSpacing"
              >
                <Text fontSize="lg" fontWeight="bold" color="#31095E">
                  {`${t("Group")} ${groupIndex}`}
                </Text>
              </HStack>
              <Divider />
              {/* Group session items */}
              {allSessionInGroup.map((session) => {
                return (
                  <Pressable
                    w="100%"
                    onPress={() => {
                      onPressSession(session);
                    }}
                    justifyItems="space-between"
                  >
                    {singleSectionItem(session)}
                  </Pressable>
                );
              })}
            </VStack>
          );
        })}
      </VStack>
    );
  };

  const addSessionView = () => {
    return (
      <VStack space="3" mt="3" flex="1">
        {/* Single sessions */}
        {sessions
          .filter((s) => !(s.type === CourseSessionType.Loop))
          .map((s) => {
            return sessionItem(s);
          })}
        {/* Group sessions */}
        {groupSessionContent()}
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

  const onSubmitEditSessions = async () => {
    try {
      setIsSubmiting(true);
      const courseSessionsUpdated = sessions
        .filter((s) => {
          // For newly added sessions => No need to check for removal
          if (
            !s.isExistingData ||
            !s.courseSessionId ||
            s.courseSessionId === 0
          ) {
            return true;
          }

          // For existing sessions => Must check for removal
          if (s.courseSessionId && s.courseSessionId !== 0) {
            return !removedSessionIds.includes(s.courseSessionId);
          }

          return true;
        })
        .map((session) => {
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
                !isBlank(session.assignedCoachPrice) &&
                session.isAssignedCoachCustomizePrice
                  ? session.assignedCoachPrice
                  : null,
            });
            // Add assistant coaches
            session.assistantCoaches.forEach((coach) => {
              coaches.push({
                coachId: coach.coachId,
                coachType: CourseCoachType.Assistant,
                customizedPrice:
                  coach.customizePrice &&
                  !isBlank(coach.customizePrice) &&
                  coach.isCustomizePrice
                    ? coach.customizePrice
                    : null,
              });
            });
          }

          if (session.group !== 0 || session.type === CourseSessionType.Loop) {
            return {
              courseSessionId: session?.courseSessionId,
              isRecursive: true,
              startDate: session.isExistingData
                ? session.date
                : session.startDate,
              endDate: session.isExistingData ? session.date : session.endDate,
              daysOfWeek: getDaysOfWeekForSession(session),
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
            daysOfWeek: getDaysOfWeekForSession(session),
            startTime: null,
            endTime: null,
            groupId: null,
            courseSessions: [
              {
                courseSessionId: session?.courseSessionId,
                startDate: session.date,
                endDate: session.date,
                daysOfWeek: getDaysOfWeekForSession(session),
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
      await addCourseSessions({
        courseId: course.id,
        data: courseSessionsUpdated,
      });
      showApiToastSuccess({ title: t("Saved successfully") });
      setIsSubmiting(false);
      setConfirmModal(false);
      setLeavePageModal(false);
      navigation.goBack();
    } catch (error) {
      console.log(error.response.data);
      showApiToastError(error);
      setIsSubmiting(false);
      setConfirmModal(false);
      setLeavePageModal(false);
    }
  };

  const confirmAndLeavePageModals = () => {
    const selectedCourseSessionInfoMapping = allCourseSessions
      ? allCourseSessions.filter(
          (s) =>
            s.courseSessionInfo.courseSessionId ===
            selectedRemoveSession?.courseSessionId
        )[0]
      : undefined;
    return (
      <VStack>
        {/* Confirm save modal */}
        <ConfirmationModal
          isLoading={isSubmitting}
          alertType="Success"
          confirmText={t("Confirm")}
          cancelText={t("Cancel")}
          isOpen={confirmModal}
          onCancel={() => {
            setConfirmModal(false);
          }}
          title={t("Confirm to save changes?")}
          onConfirm={async () => {
            await onSubmitEditSessions();
          }}
        />
        {/* Leave page modal */}
        <ConfirmationModal
          alertType="Fail"
          confirmText={t("Confirm")}
          cancelText={t("Cancel")}
          isOpen={leavePageModal}
          onCancel={() => {
            setLeavePageModal(false);
          }}
          title={t("Leave Page?")}
          description={t("Changes you made may not be saved")}
          onConfirm={() => {
            setLeavePageModal(false);
            navigation.goBack();
          }}
        />
        {/* Remove session */}
        <ConfirmationModal
          alertType="Alert"
          confirmText={t("Manage")}
          cancelText={t("Skip")}
          isOpen={removeSessionModal}
          onCancel={() => {
            // Press skip
            setRemoveSessionModal(false);
            setConfirmRemoveSession(true);
          }}
          title={`${selectedCourseSessionInfoMapping?.applicantCount || 0} ${t(
            "players applied this session"
          )}`}
          description={
            selectedCourseSessionInfoMapping
              ? selectedCourseSessionInfoMapping.playerInfo
                  .map((p) => getUserName(p))
                  .join("\n")
              : ""
          }
          onConfirm={() => {
            setRemoveSessionModal(false);
            // Navigate to manage player in the session
            if (selectedRemoveSession) {
              const matchedSession = sessionList.filter(
                (s) =>
                  s.courseSessionId === selectedRemoveSession.courseSessionId
              )[0];
              if (matchedSession) {
                navigation.navigate("ManageCourseSessionPlayer", {
                  session: matchedSession,
                  cachedList: sessions,
                  sessionList,
                  course,
                  removedSessionIds,
                });
              }
            }
          }}
        />
        {/* Re-confirm to remove session */}
        <ConfirmationModal
          alertType="Fail"
          confirmText={t("Confirm")}
          cancelText={t("Cancel")}
          isOpen={confirmRemoveSession}
          onCancel={() => {
            // Dismiss all
            setConfirmRemoveSession(false);
            setRemoveSessionModal(false);
          }}
          title={t("Confirm to remove session")}
          description={`${t("Date")}: ${selectedRemoveSession?.date} ${t(
            "From"
          )} ${selectedRemoveSession?.startTime} ${t("To")}:${
            selectedRemoveSession?.endTime
          }`}
          onConfirm={() => {
            // Remove session
            setConfirmRemoveSession(false);
            if (selectedRemoveSession) {
              onRemoveSession(selectedRemoveSession, true);
              showApiToastSuccess({ title: t("Remove successfully") });
            }
          }}
        />
      </VStack>
    );
  };

  const isSessionsUnique = isCourseSessionsUnique(
    flatternCourseSessions(sessions).filter((s) => {
      // For newly added sessions => No need to check for removal
      if (!s.isExistingData || !s.courseSessionId || s.courseSessionId === 0) {
        return true;
      }

      // For existing sessions => Must check for removal
      if (s.courseSessionId && s.courseSessionId !== 0) {
        return !removedSessionIds.includes(s.courseSessionId);
      }

      return true;
    })
  );
  return (
    <HeaderLayout
      KeyboardAwareScrollViewProps={{
        bounces: false,
      }}
      headerProps={{
        title: t("Edit Session"),
        hasBackButton: true,
        containerStyle: { marginHorizontal: 0 },
      }}
      isSticky
    >
      {!shouldRenderDefaultState && bannerView()}
      <VStack p="defaultLayoutSpacing" flex="1">
        {shouldRenderDefaultState ? defaultState() : addSessionView()}
      </VStack>
      <VStack space="3" mx="defaultLayoutSpacing" mt="auto">
        <Button
          isDisabled={
            flatternCourseSessions(sessions).filter((s) => {
              // For newly added sessions => No need to check for removal
              if (
                !s.isExistingData ||
                !s.courseSessionId ||
                s.courseSessionId === 0
              ) {
                return true;
              }

              // For existing sessions => Must check for removal
              if (s.courseSessionId && s.courseSessionId !== 0) {
                return !removedSessionIds.includes(s.courseSessionId);
              }

              return true;
            }).length === 0 ||
            flatternCourseSessions(sessions).filter((s) => {
              // For newly added sessions => No need to check for removal
              if (
                !s.isExistingData ||
                !s.courseSessionId ||
                s.courseSessionId === 0
              ) {
                return true;
              }

              // For existing sessions => Must check for removal
              if (s.courseSessionId && s.courseSessionId !== 0) {
                return !removedSessionIds.includes(s.courseSessionId);
              }

              return true;
            }).length <
              parseInt(course.minimumRequiredConsecutiveSession, 10) ||
            !isSessionsUnique
          }
          isLoading={isSubmitting}
          isLoadingText={t("Loading")}
          onPress={() => {
            setConfirmModal(true);
          }}
        >
          {t("Save")}
        </Button>
        <Button
          isLoading={isSubmitting}
          isLoadingText={t("Loading")}
          variant="outline"
          onPress={() => {
            setLeavePageModal(true);
          }}
        >
          {t("Cancel")}
        </Button>
      </VStack>
      {addSessionModal && addSessionModalView()}
      {editSessionModal && editSessionModalView()}
      {confirmAndLeavePageModals()}
    </HeaderLayout>
  );
}
