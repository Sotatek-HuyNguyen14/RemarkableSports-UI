import React, { useCallback, useEffect, useMemo, useState } from "react";
import {
  Button,
  Heading,
  HStack,
  Modal,
  Pressable,
  Text,
  Toast,
  useTheme,
  VStack,
  Image,
  Badge,
  Divider,
} from "native-base";
import useSWR from "swr";
import { NativeStackScreenProps } from "@react-navigation/native-stack";
import { parseISO } from "date-fns";
import { useForm } from "react-hook-form";
import { useFocusEffect } from "@react-navigation/native";
import HeaderLayout from "../../components/Layout/HeaderLayout";
import { MainStackNavigatorParamList } from "../../routers/Types";
import { Action } from "../../models/Response";
import { getTranslation } from "../../utils/translation";
import { formatUtcToLocalDate } from "../../utils/date";
import { getUserName } from "../../utils/name";
import {
  getCourseApplication,
  getCourseById,
  getCourseLeaveRequests,
  getCoursePaymentEvidenceForApplication,
  getCourseSessions,
  getSessionFrom,
  updateCourseLeaveRequest,
  updateCoursePaymentStatus,
  updateCoursePaymentStatusManually,
  updateSessionFrom,
} from "../../services/CourseServices";
import {
  formatCoreUrl,
  formatFileUrl,
  formatMeetupApiUrl,
} from "../../services/ServiceUtil";
import Loading from "../../components/Loading";
import ErrorMessage from "../../components/ErrorMessage";
import DaysOfWeek from "../../constants/DaysOfWeek";
import { UserType } from "../../models/User";
import { useAuth } from "../../hooks/UseAuth";
import ExclaimationIcon from "../../components/Icons/ExclaimationIcon";
import CourseApplicantDetailsCard from "../../components/CourseApplicantDetailsCard";
import {
  AttendanceStatus,
  CourseApplicationResponse,
  CourseLeaveRequest,
  CoursePaymentStatus,
  SessionFromResponse,
} from "../../models/responses/Course";
import { updateCourseBooking } from "../../services/CourseBookingServices";
import CourseLeaveRequestCard from "../../components/CourseLeaveRequestCard";
import FormInput from "../../components/FormInput/FormInput";
import DownArrowIcon from "../../components/Icons/DownArrowIcon";
import AttendanceCard from "../../components/Card/AttendanceCard";
import MessageToast, {
  MesssageToastType,
} from "../../components/Toast/MessageToast";
import IncreaseIcon from "../../components/Icons/IncreaseIcon";
import MoneyIcon from "../../components/Icons/MoneyIcon";
import LocationIcon from "../../components/Icons/LocationIcon";
import SingleSelectModal from "../../components/Modal/SingleSelectModal";
import TextInputModal from "../../components/Modal/TextInputModal";
import { showApiToastError } from "../../components/ApiToastError";
import ManageIcon from "../../components/Icons/ManageIcon";
import PencilIcon from "../../components/Icons/PencilIcon";
import TipIcon from "../../components/Icons/TipIcon";
import { CourseApplicationStatus } from "../../models/responses/CourseApplication";
import ManageSearchIcon from "../../components/Icons/ManageSearchIcon";
import LineBreak from "../../components/LineBreak/LineBreak";
import CourseApplicantInfoCard from "../../components/CourseApplicantInfoCard";
import {
  EventApplication,
  EventPaymentEvidence,
} from "../../models/responses/Event";
import { updatePaymentEvidenceStatus } from "../../services/EventServices";
import { CoursePaymentAction } from "../../models/requests/Course";
import ConfirmationModal from "../../components/ConfirmationModal/ConfirmationModal";
import NoAccessRight from "../../components/NoAccessRight";
import { showApiToastSuccess } from "../../components/ApiToastSuccess";
import CoursePaymentInfoCard from "../../components/CoursePaymentInfoCard";

const t = getTranslation([
  "screen.ClubScreens.ManageCourse",
  "constant.district",
  "constant.profile",
  "constant.week",
  "constant.button",
  "formInput",
  "screen.PaymentStatus",
]);

type ManageCourseScreenProps = NativeStackScreenProps<
  MainStackNavigatorParamList,
  "ManageCourse"
>;
interface FormValue {
  courseSessionId: number;
  courseSessionText: string;
  payment: string;
}
export default function ManageCourse({
  route,
  navigation,
}: ManageCourseScreenProps) {
  const { space, colors } = useTheme();
  const { course: paramValue, courseId } = route.params;
  const [isCourseLeaveRequesting, setIsCourseLeaveRequesting] = useState(false);

  const PAYMENT_STATUS_OPTION = [
    { label: t("Paid"), value: "Paid", id: 0, isDisabled: false },
    { label: t("Not Paid"), value: "Unpaid", id: 1, isDisabled: false },
    // { label: t("Refund"), value: "Refund", id: 2, isDisabled: false },
  ];
  const {
    data,
    isValidating,
    error,
    mutate: courseMutate,
  } = useSWR(
    courseId && !paramValue ? formatMeetupApiUrl("/course/{id}") : null,
    () => getCourseById(courseId!),
    {
      errorRetryCount: 0,
      errorRetryInterval: 0,
      shouldRetryOnError: false,
    }
  );
  const courseID = paramValue?.id || courseId;
  const {
    data: applications,
    isValidating: isApplicationFetching,
    error: fetchApplicationError,
    mutate: applicationsMutate,
  } = useSWR(
    formatCoreUrl(`/course/${courseID}/application`),
    () => getCourseApplication(courseID!),
    {
      errorRetryCount: 0,
      errorRetryInterval: 0,
      shouldRetryOnError: false,
    }
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
  const sessionOptions = useMemo(() => {
    return courseSessions
      ? courseSessions.map((session) => {
          return {
            label: formatUtcToLocalDate(session.courseSessionFrom),
            value: session.courseSessionId.toString(),
            isDisabled:
              session.courseSessionFrom.getTime() < new Date().getTime(),
          };
        })
      : [];
  }, [courseSessions]);

  const { data: leaveRequests, mutate: leaveRequestMutate } = useSWR(
    formatCoreUrl(`/course/${courseID}/leave`),
    () => getCourseLeaveRequests(courseID!)
  );
  const { user } = useAuth();
  const course = paramValue || data;
  const endTime = parseISO(`${course?.toDate} ${course?.endTime}`);
  const isOutTime = endTime.getTime() < new Date().getTime();
  const [activePage, setActivePage] = useState(0);
  const [isSessionModalOpen, setSessionModalOpen] = useState(false);
  const [expandCourseDetail, setExpandCourseDetail] = useState(false);
  const [rejectLeaveApplicationOpen, setRejectLeaveApplicationOpen] =
    useState(false);
  const [selectedLeaveApplication, setSelectedLeaveApplication] =
    useState<CourseLeaveRequest | null>(null);
  const [editStatus, setEditStatus] = useState(false);
  const [showPaymentStatusModal, setShowPaymentStatusModal] = useState(false);
  const [selectedPayment, setSelectedPayment] =
    useState<CourseApplicationResponse>();
  const [reviewEvidenceModalOpen, setReviewEvidenceModalOpen] = useState(false);
  const [isEvidenceFetching, setisEvidenceFetching] = useState({
    isLoading: false,
    isError: false,
  });
  const [rejectModalOpen, setRejectModalOpen] = useState(false);
  const [applicationEvidence, setApplicationEvidence] =
    useState<EventPaymentEvidence>();

  const {
    control,
    formState: { isValid, isSubmitting, isDirty },
    watch,
    setValue,
    trigger,
  } = useForm<FormValue>({
    mode: "onChange",
  });
  const courseSessionId = watch("courseSessionId");
  const setCourseSession = useCallback(
    (newSession: string) => {
      setValue("courseSessionText", newSession);
    },
    [setValue]
  );
  const courseSessionText = watch("courseSessionText");
  const {
    data: courseSessionsAttendanceRecord,
    isValidating: isCourseSessionRecordFetching,
    mutate: mutateCourseSessionsAttendanceRecord,
  } = useSWR(
    formatCoreUrl(`/course/${courseID}/session/${courseSessionText}`),
    () => {
      if (courseSessionId && courseID) {
        return getSessionFrom({
          id: courseID,
          sessionId: courseSessionId,
        });
      }
    },
    {
      errorRetryCount: 0,
      errorRetryInterval: 0,
      shouldRetryOnError: false,
    }
  );

  const mutateAll = useCallback(() => {
    applicationsMutate();
    leaveRequestMutate();
    courseSessionsMutate();
    // courseEnrollmentsMutate();
    mutateCourseSessionsAttendanceRecord();
  }, [
    applicationsMutate,
    leaveRequestMutate,
    courseSessionsMutate,
    mutateCourseSessionsAttendanceRecord,
    // courseEnrollmentsMutate,
  ]);

  useFocusEffect(
    React.useCallback(() => {
      mutateAll();
    }, [mutateAll])
  );

  useEffect(() => {
    if (!courseSessionText && courseSessions && courseSessions.length > 0) {
      const latestSessions = !isOutTime
        ? courseSessions.filter(
            (session) =>
              session.courseSessionFrom.getTime() >= new Date().getTime()
          )[0]
        : courseSessions[courseSessions.length - 1];
      setValue("courseSessionId", latestSessions.courseSessionId);
      setCourseSession(formatUtcToLocalDate(latestSessions.courseSessionFrom));
      trigger("courseSessionText");
    }
    if (courseSessionId) {
      setCourseSession(
        sessionOptions.filter(
          (session) => session.value === courseSessionId.toString()
        )[0]?.label
      );
      trigger("courseSessionText");
      mutateAll();
    }
  }, [
    isOutTime,
    courseSessionText,
    courseSessions,
    courseSessionId,
    sessionOptions,
    trigger,
    setCourseSession,
    mutateCourseSessionsAttendanceRecord,
    setValue,
    mutateAll,
  ]);

  const shouldShowNoAccessRight =
    user?.userType === UserType.Coach &&
    course?.creator.userType === UserType.ClubStaff;

  const noAccessRightView = () => {
    return <NoAccessRight />;
  };

  const getEvidence = useCallback(
    (
      selectedApplication: CourseApplicationResponse,
      appEvidence?: EventPaymentEvidence | null,
      isPayment?: Boolean
    ) => {
      if (
        (selectedApplication && !appEvidence) ||
        (appEvidence &&
          appEvidence.submitter.id !== selectedApplication?.playerId)
      ) {
        setisEvidenceFetching((prev) => ({
          isLoading: true,
          isError: false,
        }));
        getCoursePaymentEvidenceForApplication(selectedApplication.id)
          .then((evidence: EventPaymentEvidence) => {
            setisEvidenceFetching((prev) => ({ ...prev, isLoading: false }));
            setApplicationEvidence(evidence);
            if (isPayment) setShowPaymentStatusModal(true);
          })
          .catch((e) => {
            // showApiToastError(e);
            setisEvidenceFetching((prev) => ({
              isLoading: false,
              isError: true,
            }));
          });
      }
    },
    []
  );
  useEffect(() => {
    if (selectedPayment && reviewEvidenceModalOpen) {
      getEvidence(
        selectedPayment,
        applicationEvidence ?? null,
        showPaymentStatusModal
      );
    }
  }, [
    applicationEvidence,
    getEvidence,
    reviewEvidenceModalOpen,
    selectedPayment,
    showPaymentStatusModal,
  ]);

  const onCourseApplicationAction = async (
    application: CourseApplicationResponse,
    action: Action
  ) => {
    const { id } = application;
    try {
      await updateCourseBooking({
        action,
        id,
        parameters: {
          reasonReject: "",
        },
      });
      mutateAll();
      if (action === Action.Approve) {
        showApiToastSuccess({ title: t("Application approved") });
      } else {
        showApiToastSuccess({ title: t("Application rejected") });
      }
    } catch (apiError) {
      showApiToastError(apiError);
    }
  };
  const onCourseLeaveRequestAction = async (
    leaveRequest: CourseLeaveRequest,
    action: Action,
    rejectReason: String = ""
  ) => {
    const { courseSessionInfo, playerId } = leaveRequest;
    const { courseId: paramCourseId } = courseSessionInfo;
    try {
      setIsCourseLeaveRequesting(true);
      await updateCourseLeaveRequest({
        courseId: paramCourseId,
        playerId,
        action,
        courseSessionIds: [courseSessionInfo.courseSessionId],
        rejectReason,
      });
      Toast.show({
        id: "updateCourseLeaveRequestSuccess",
        duration: 2000,
        placement: "top",
        render: () => {
          return (
            <MessageToast
              type={MesssageToastType.Success}
              title={t("Update leave request success")}
            />
          );
        },
      });
      setIsCourseLeaveRequesting(false);
      mutateAll();
      setRejectLeaveApplicationOpen(false);
    } catch (apiError) {
      setIsCourseLeaveRequesting(false);
      showApiToastError(apiError);
      console.log(apiError);
    }
  };

  const [isOpen, setIsOpen] = useState({
    manualAddMakeUpSession: false,
    leaveRequestModalOpen: false,
  });
  const leaveRequestsList = () => {
    if (!leaveRequests || leaveRequests.length === 0) {
      <Text>{t("There is no leave request")}</Text>;
    }
    return (
      <VStack space="2">
        {leaveRequests &&
          leaveRequests.length > 0 &&
          leaveRequests.map((request) => {
            return (
              <CourseLeaveRequestCard
                key={`${request.playerId}-${request.playerInfo}-${request.courseSessionInfo.courseId}-${request.courseSessionInfo.courseSessionFrom}`}
                applicant={request.playerInfo}
                application={request}
                onPressApprove={() => {
                  setIsOpen((prev) => ({
                    ...prev,
                    leaveRequestModalOpen: true,
                    manualAddMakeUpSession: true,
                  }));
                  setSelectedLeaveApplication(request);
                }}
                onPressReject={() => {
                  setSelectedLeaveApplication(request);
                  setRejectLeaveApplicationOpen(true);
                }}
              />
            );
          })}
        <ConfirmationModal
          alertType="Fail"
          shouldRenderIcon={false}
          verticalButtons
          confirmText={t("Yes")}
          cancelText={t("No")}
          isOpen={isOpen.manualAddMakeUpSession}
          onCancel={async () => {
            setIsOpen((prev) => ({
              ...prev,
              leaveRequestModalOpen: false,
              manualAddMakeUpSession: false,
            }));
            if (selectedLeaveApplication) {
              await onCourseLeaveRequestAction(
                selectedLeaveApplication,
                Action.Approve
              );
            }
          }}
          title={t("Manual add make up session")}
          description={t(
            "You may move this player to another course as a make up session"
          )}
          onConfirm={() => {
            setIsOpen((prev) => ({
              ...prev,
              leaveRequestModalOpen: false,
              manualAddMakeUpSession: false,
            }));
            if (
              selectedLeaveApplication?.playerId &&
              selectedLeaveApplication.courseSessionInfo
            ) {
              navigation.navigate("ChangeCourseSession", {
                session: {
                  ...selectedLeaveApplication?.courseSessionInfo,
                  // Dummy value for not showing error
                  groupId: 0,
                  coaches: [],
                },
                playerId: selectedLeaveApplication?.playerId,
                isMoveSessionFlow: true,
                isEditSessionFlow: false,
                makeupSessionId:
                  selectedLeaveApplication.makeUpSessionInfo.courseSessionId,
                flow: "manage",
              });
            }
          }}
        />
      </VStack>
    );
  };
  const applicationList = () => {
    if (isApplicationFetching) {
      return <Loading />;
    }

    if (shouldShowNoAccessRight) {
      return noAccessRightView();
    }

    if (
      !applications ||
      applications.filter(
        (application) => application.status === CourseApplicationStatus.Pending
      ).length === 0
    ) {
      return (
        <VStack flex="1" justifyContent="center" alignItems="center">
          <Text>{t("There is no applications")}</Text>
        </VStack>
      );
    }

    return (
      <VStack space="2">
        {applications &&
          applications.length > 0 &&
          applications
            .filter(
              (application) =>
                application.status === CourseApplicationStatus.Pending
            )
            .map((application) => {
              return (
                <CourseApplicantDetailsCard
                  key={application.id}
                  applicant={application.playerInfo}
                  application={application}
                  onPressApprove={async () => {
                    await onCourseApplicationAction(
                      application,
                      Action.Approve
                    );
                  }}
                  onPressReject={async () => {
                    await onCourseApplicationAction(application, Action.Reject);
                  }}
                  onPressPlayerDetails={() => {
                    navigation.navigate("UserProfileViewer", {
                      user: {
                        ...application.playerInfo,
                        userType: UserType.Player,
                      },
                    });
                  }}
                />
              );
            })}
      </VStack>
    );
  };
  const updateRollCall = async (
    newStatus: AttendanceStatus,
    item: SessionFromResponse
  ) => {
    if (courseID) {
      const formData = {
        id: courseID,
        playerId: item.playerId,
        status: newStatus,
        sessionId: courseSessionId,
      };
      try {
        await updateSessionFrom(formData);
        mutateCourseSessionsAttendanceRecord();
        Toast.show({
          id: "updateSessionFromSuccess",
          duration: 2000,
          placement: "top",
          render: () => {
            return (
              <MessageToast
                type={MesssageToastType.Success}
                title={t("Update rollcall success")}
              />
            );
          },
        });
      } catch (updateSessionFromError: any) {
        // console.log(updateSessionFromError.response.data);
        showApiToastError(updateSessionFromError);
      }
    }
  };
  const rollCall = () => {
    if (isCourseSessionsFetching) {
      <Loading />;
    }

    // if (shouldShowNoAccessRight) {
    //   return noAccessRightView();
    // }

    if (!courseSessions || courseSessions.length === 0) {
      return (
        <VStack flex="1" justifyContent="center" alignItems="center">
          <Text>{t("There is no course session found")}</Text>
        </VStack>
      );
    }
    return (
      <VStack space="3">
        <FormInput
          label={t("Course session")}
          controllerProps={{
            name: "courseSessionText",
            control,
            rules: {
              required: false,
            },
          }}
          inputProps={{
            editable: false,
            InputRightElement: <DownArrowIcon mr="4" />,
          }}
          onPress={() => {
            setSessionModalOpen(true);
          }}
        />
        {isCourseSessionRecordFetching ? (
          <Loading />
        ) : !courseSessionsAttendanceRecord ||
          courseSessionsAttendanceRecord.filter((val) => val.isEnrolled)
            .length === 0 ? (
          !courseSessionId ? (
            <VStack flex="1" justifyContent="center" alignItems="center">
              <Text fontSize="md" fontWeight="bold">
                {t("Please select course session")}
              </Text>
            </VStack>
          ) : (
            <VStack flex="1" justifyContent="center" alignItems="center">
              <Text fontSize="md" fontWeight="bold">
                {t("There is no player applied for this session")}
              </Text>
            </VStack>
          )
        ) : (
          courseSessionsAttendanceRecord &&
          courseSessionsAttendanceRecord.filter((val) => val.isEnrolled)
            .length > 0 &&
          courseSessionsAttendanceRecord
            .filter((val) => val.isEnrolled)
            .map((val) => (
              <Pressable onPress={() => {}}>
                <AttendanceCard
                  key={`${val.playerId}-${val.attendance?.courseId}`}
                  displayName={getUserName(val.player)}
                  defaultStatus={
                    val?.attendance?.status || AttendanceStatus.Unknown
                  }
                  isLoading={false}
                  profilePicture={val.player.profilePicture}
                  onRightBoxPress={async (newStatus) => {
                    await updateRollCall(newStatus, val);
                  }}
                />
                <Divider mt={2} />
              </Pressable>
            ))
        )}
      </VStack>
    );
  };
  const leaveRequestModal = () => {
    return (
      <Modal
        isOpen={isOpen.leaveRequestModalOpen}
        onClose={() => {
          setIsOpen((prev) => ({ ...prev, leaveRequestModalOpen: false }));
        }}
      >
        <Modal.Content>
          <Modal.Header>{t("All leave requests")}</Modal.Header>
          <Modal.CloseButton />
          <Modal.Body>
            {isCourseLeaveRequesting ? <Loading /> : leaveRequestsList()}
          </Modal.Body>
        </Modal.Content>
      </Modal>
    );
  };

  const onActionPayment = async ({
    action,
    application,
    reasonReject = "",
  }: {
    action: Action;
    application: EventApplication;
    reasonReject: string;
  }) => {
    try {
      await updatePaymentEvidenceStatus({
        applicationId: application.id,
        action,
        paymentType: "Course",
        parameters: {
          reasonReject,
        },
      });
      /* TODO - API Integration */
      Toast.show({
        id: "actionSuccess",
        duration: 2000,
        placement: "top",
        render: () => {
          return (
            <MessageToast
              type={MesssageToastType.Success}
              title={t("Success")}
            />
          );
        },
      });
      mutateAll();
    } catch (e) {
      console.log("error:", e);
      showApiToastError(e);
    }
  };

  const managePaymentEvidence = () => {
    const paymentLists = applications
      ? applications.filter(
          (application) =>
            application.status === CourseApplicationStatus.Approve
        )
      : [];

    if (shouldShowNoAccessRight) {
      return noAccessRightView();
    }

    return (
      <VStack space="4">
        {/* Payment evidence card */}
        <HStack p="4" bg="#66CEE11A" space="5" borderRadius="5">
          <TipIcon props={{ size: "3xl" }} color={colors.rs.GPP_lightBlue} />
          <VStack space="2" flex={1}>
            <HStack flexWrap="wrap" pr="4">
              <Text fontSize="md" fontWeight="bold" numberOfLines={2}>
                {t("Payment receipts")}
              </Text>
            </HStack>
            <Text>
              {t("View the payment receipts submitted by registered users")}
            </Text>
          </VStack>
        </HStack>
        {/* Edit Payment Status */}

        {paymentLists && paymentLists.length > 0 && (
          <Button
            variant="outline"
            py="1.5"
            borderRadius="5"
            bg={editStatus ? "rs.primary_purple" : "rs.white"}
            onPress={() => {
              setEditStatus((prev) => !prev);
            }}
          >
            <HStack space={3}>
              {editStatus ? (
                <Text color="rs.white" fontWeight="600">
                  {t("Save Changes")}
                </Text>
              ) : (
                <>
                  <PencilIcon color="#31095E" alignSelf="center" />
                  <Text fontWeight="600">
                    {editStatus ? t("Save Changes") : t("Edit Payment Status")}
                  </Text>
                </>
              )}
            </HStack>
          </Button>
        )}

        {!!paymentLists &&
          paymentLists.length > 0 &&
          paymentLists.map((application, index) => {
            return (
              <VStack space="3" key={`course_manage_${application.id}`}>
                <CoursePaymentInfoCard
                  icon={<ManageSearchIcon size="md" />}
                  actionLabel="application"
                  onPressAction={() => {
                    if (
                      application.paymentStatus ===
                        CoursePaymentStatus.Pending ||
                      application.paymentStatus === CoursePaymentStatus.Paid
                    ) {
                      navigation.navigate("ReviewCoursePaymentEvidence", {
                        application,
                      });
                    }
                  }}
                  onPressStatus={() => {
                    if (editStatus) {
                      setSelectedPayment(application);
                      setShowPaymentStatusModal(true);
                    }
                  }}
                  application={application}
                />
                <LineBreak />
              </VStack>
            );
          })}
      </VStack>
    );
  };

  const reviewEvidenceModal = () => {
    return (
      <Modal
        isOpen={reviewEvidenceModalOpen}
        onClose={() => {
          setReviewEvidenceModalOpen(false);
          setApplicationEvidence(null);
        }}
      >
        <Modal.Content>
          <Modal.Header>{t("Review evidence")}</Modal.Header>
          <Modal.CloseButton />
          <Modal.Body>
            {isEvidenceFetching.isLoading && <Loading />}
            {!isEvidenceFetching.isLoading && isEvidenceFetching.isError && (
              <VStack flex="1" justifyContent="center" alignItems="center">
                <Text>{t("No Evidence fetched")}</Text>
              </VStack>
            )}
            {!!applicationEvidence &&
              applicationEvidence.submitter.id === selectedPayment?.playerId &&
              !isEvidenceFetching.isLoading &&
              !isEvidenceFetching.isError &&
              applicationEvidence.imageUrl && (
                <VStack space={3}>
                  <Image
                    alt="evidence"
                    w="100%"
                    h="lg"
                    resizeMethod="scale"
                    resizeMode="contain"
                    source={{
                      uri: formatFileUrl(applicationEvidence.imageUrl),
                    }}
                  />
                  {selectedPayment?.paymentStatus ===
                    CoursePaymentStatus.Pending && (
                    <VStack width="100%" space="4" mt="3" mb="5">
                      <Button
                        onPress={async () => {
                          if (selectedPayment)
                            await updateCoursePaymentStatus({
                              action: Action.Approve,
                              applicationId: selectedPayment.id,
                              paymentType: "Course",
                            });
                          mutateAll();
                          setReviewEvidenceModalOpen(false);
                        }}
                      >
                        {t("Approve and mark as paid")}
                      </Button>
                      <Button
                        variant="outline"
                        onPress={() => {
                          setRejectModalOpen(true);
                        }}
                      >
                        {t("Reject and provide reason")}
                      </Button>
                    </VStack>
                  )}
                </VStack>
              )}

            {!isEvidenceFetching.isError &&
              !isEvidenceFetching.isLoading &&
              (!applicationEvidence || !applicationEvidence.imageUrl) && (
                <VStack flex="1" justifyContent="center" alignItems="center">
                  <Text>{t("No Evidence fetched. Please try again")}</Text>
                </VStack>
              )}
          </Modal.Body>
        </Modal.Content>
      </Modal>
    );
  };

  const courseDetails = () => {
    if (course) {
      return (
        <>
          <HStack justifyContent="space-between">
            {DaysOfWeek.map((d) => {
              const isIncluded =
                course.daysOfWeek &&
                course.daysOfWeek.findIndex((v) => v === d) !== -1;
              return (
                <Badge
                  key={d}
                  w="10"
                  h="10"
                  borderRadius="full"
                  borderColor="rs.lightBlue"
                  bg={isIncluded ? "rs.lightBlue" : "rs.white"}
                  _text={{
                    color: d === "Sunday" ? "rs_secondary.error" : "rs.black",
                    fontWeight: "bold",
                    fontSize: 14,
                  }}
                  m="1"
                >
                  {t(d.slice(0, 3).toUpperCase())}
                </Badge>
              );
            })}
          </HStack>
          <Heading fontSize="md" color="rs.primary_purple">
            {t("Address")}
          </Heading>
          <HStack space="3" flexWrap="wrap">
            <LocationIcon />
            <Text flex={1}>
              {t(course.district)}
              {`\n${course.address}`}
            </Text>
          </HStack>
          <Heading fontSize="md" color="rs.primary_purple">
            {t("Price")}
          </Heading>
          <HStack space="3">
            <MoneyIcon />
            <Text>
              {course.fee} {t("hkd/person")}
            </Text>
          </HStack>
          {course.minAge && course.maxAge && (
            <HStack space="3">
              <IncreaseIcon />
              <Text>
                {course.minAge} {t("to")} {course.maxAge}
              </Text>
            </HStack>
          )}
          <Heading fontSize="md" color="rs.primary_purple">
            {t("Description")}
          </Heading>
          <Text>{course.description}</Text>
          <Pressable
            onPress={() => {
              setExpandCourseDetail(false);
            }}
          >
            <Text fontSize="md" color="rs.primary_purple">
              {t("Collapse course details")}
            </Text>
          </Pressable>
        </>
      );
    }
  };
  return (
    <HeaderLayout
      isSticky
      headerProps={{
        title: t("Manage"),
        hasBackButton: true,
        containerStyle: { marginHorizontal: 0 },
      }}
      containerProps={{ marginHorizontal: space.defaultLayoutSpacing }}
    >
      {isValidating && <Loading />}
      {!isValidating && error && !course && <ErrorMessage />}
      {!isValidating && course && (
        <VStack space="4" flex="1">
          <Heading>{course.name}</Heading>
          {!expandCourseDetail && (
            <Pressable
              onPress={() => {
                setExpandCourseDetail(!expandCourseDetail);
              }}
            >
              <Text fontSize="md" color="rs.primary_purple">
                {!expandCourseDetail
                  ? t("Expand course details")
                  : t("Collapse course details")}
              </Text>
            </Pressable>
          )}
          {/* Course details */}
          {expandCourseDetail && courseDetails()}

          {/* Manage Sessions */}
          <Button
            variant="outline"
            py="1.5"
            borderRadius="5"
            _text={{
              fontSize: 14,
              fontWeight: 400,
              color: "rs.primary_purple",
            }}
            onPress={() => {
              // setViewAllRegistrationsModalOpen(true);
              navigation.navigate("ManageSessions", {
                course,
              });
            }}
            leftIcon={<ManageIcon props={{ size: "md" }} />}
          >
            {t("Manage Sessions")}
          </Button>
          {/* Manage Players */}
          <Button
            variant="outline"
            py="1.5"
            borderRadius="5"
            _text={{
              fontSize: 14,
              fontWeight: 400,
              color: "rs.primary_purple",
            }}
            _pressed={{
              _icon: {
                innterFill: "#FFFFFF",
              },
            }}
            onPress={() => {
              // waiting add todo Manage Players
              navigation.navigate("ManageCoursePlayer", { course });
            }}
            leftIcon={
              <PencilIcon alignSelf="center" size="md" innterFill="#31095E" />
            }
          >
            {t("Manage Players")}
          </Button>
          {leaveRequests && leaveRequests.length > 0 && (
            <HStack
              space="2"
              alignItems="center"
              bg="#66CEE11A"
              borderRadius="xl"
              p="4"
              justifyContent="space-between"
            >
              <HStack space="2">
                <ExclaimationIcon props={{ customFill: "#66CEE1" }} />
                <Text fontSize="md" fontWeight="bold">
                  {`${leaveRequests.length} ${t("students applied leave")}`}
                </Text>
              </HStack>
              <Pressable
                onPress={() => {
                  setIsOpen((prev) => ({
                    ...prev,
                    leaveRequestModalOpen: true,
                  }));
                }}
                color="rs.primary_purple"
              >
                <Text color="rs.primary_purple">{t("View")}</Text>
              </Pressable>
            </HStack>
          )}
          {/* Ghost bar */}
          <HStack>
            <Pressable
              onPress={() => {
                setActivePage(0);
              }}
              flex="1"
              borderBottomWidth="2"
              borderBottomColor={
                activePage === 0 ? "rs.primary_purple" : "rs.button_grey"
              }
              py="4"
              justifyContent="center"
              alignItems="center"
            >
              <Text
                fontWeight="bold"
                fontSize="md"
                color={
                  activePage === 0 ? "rs.primary_purple" : "rs.button_grey"
                }
              >
                {t("Register")}
              </Text>
            </Pressable>
            <Pressable
              onPress={() => {
                setActivePage(1);
              }}
              flex="1"
              borderBottomWidth="2"
              borderBottomColor={
                activePage === 1 ? "rs.primary_purple" : "rs.button_grey"
              }
              py="4"
              justifyContent="center"
              alignItems="center"
            >
              <Text
                fontWeight="bold"
                fontSize="md"
                color={
                  activePage === 1 ? "rs.primary_purple" : "rs.button_grey"
                }
              >
                {t("Payment")}
              </Text>
            </Pressable>
            <Pressable
              onPress={() => {
                setActivePage(2);
              }}
              flex="1"
              borderBottomWidth="2"
              borderBottomColor={
                activePage === 2 ? "rs.primary_purple" : "rs.button_grey"
              }
              py="4"
              justifyContent="center"
              alignItems="center"
            >
              <Text
                fontWeight="bold"
                fontSize="md"
                color={
                  activePage === 2 ? "rs.primary_purple" : "rs.button_grey"
                }
              >
                {t("Applied players")}
              </Text>
            </Pressable>
          </HStack>
          {activePage === 0 && applicationList()}
          {activePage === 1 && managePaymentEvidence()}
          {activePage === 2 && rollCall()}
        </VStack>
      )}

      {leaveRequestModal()}
      <SingleSelectModal
        title={t("Select course")}
        options={sessionOptions}
        controllerProps={{
          name: "courseSessionId",
          control,
          rules: {
            required: true,
          },
        }}
        isOpen={isSessionModalOpen}
        onClose={() => {
          setSessionModalOpen(false);
        }}
      />
      <TextInputModal
        heading={t("Reject")}
        description={t("Are you sure to reject the leave request?")}
        isOpen={rejectLeaveApplicationOpen}
        onClose={() => {
          setRejectLeaveApplicationOpen(false);
        }}
        onPressSubmit={async (msg: string) => {
          if (selectedLeaveApplication) {
            await onCourseLeaveRequestAction(
              selectedLeaveApplication,
              Action.Reject,
              msg
            );
          }
        }}
      />

      <SingleSelectModal
        confirmButtonText={t("Save")}
        shouldCloseAfterSelect
        title={t("Payment status")}
        options={PAYMENT_STATUS_OPTION}
        controllerProps={{
          name: "payment",
          control,
          rules: {
            required: true,
          },
        }}
        isOpen={showPaymentStatusModal}
        onClose={() => {
          setShowPaymentStatusModal(false);
        }}
        onPressItem={async (item) => {
          switch (item.value) {
            case "Unpaid":
              if (selectedPayment) {
                try {
                  await updateCoursePaymentStatusManually({
                    applicationId: selectedPayment.id,
                    action: CoursePaymentAction.Unpaid,
                  });
                } catch (er: any) {
                  showApiToastError(er);
                }
              }
              setShowPaymentStatusModal(false);
              mutateAll();
              break;
            case "Paid":
              if (selectedPayment) {
                try {
                  await updateCoursePaymentStatusManually({
                    applicationId: selectedPayment.id,
                    action: CoursePaymentAction.Paid,
                  });
                } catch (err: any) {
                  showApiToastError(err);
                }
              }
              setShowPaymentStatusModal(false);
              mutateAll();
              break;
            case "Refund":
              if (selectedPayment) {
                navigation.navigate("CourseRefund", {
                  application: selectedPayment,
                });
              }
              setShowPaymentStatusModal(false);
              break;
            default:
              break;
          }
        }}
      />
      {reviewEvidenceModal()}
      <TextInputModal
        heading={t("Reject")}
        description={t("Please provide reason for rejecting the payment")}
        isOpen={rejectModalOpen}
        onClose={() => {
          setRejectModalOpen(false);
        }}
        onPressSubmit={async (msg: string) => {
          if (selectedPayment)
            await onActionPayment({
              action: Action.Reject,
              application: selectedPayment,
              reasonReject: msg,
            });
          setRejectModalOpen(false);
          setReviewEvidenceModalOpen(false);
        }}
      />
    </HeaderLayout>
  );
}
