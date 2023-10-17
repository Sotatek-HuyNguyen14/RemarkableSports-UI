/* eslint-disable react/no-unescaped-entities */
import React, { useCallback, useEffect, useMemo, useState } from "react";
import {
  Badge,
  Button,
  Divider,
  Heading,
  HStack,
  Image,
  Modal,
  Pressable,
  Text,
  Toast,
  useTheme,
  VStack,
} from "native-base";
import useSWR from "swr";
import { NativeStackScreenProps } from "@react-navigation/native-stack";

import { useForm } from "react-hook-form";
import { useFocusEffect } from "@react-navigation/native";
import HeaderLayout from "../../components/Layout/HeaderLayout";
import { MainStackNavigatorParamList } from "../../routers/Types";
import { Action } from "../../models/Response";
import { getTranslation } from "../../utils/translation";
import { formatCoreUrl, formatFileUrl } from "../../services/ServiceUtil";

import Loading from "../../components/Loading";
import ErrorMessage from "../../components/ErrorMessage";
import FormInput from "../../components/FormInput/FormInput";
import DownArrowIcon from "../../components/Icons/DownArrowIcon";
import MessageToast, {
  MesssageToastType,
} from "../../components/Toast/MessageToast";
import MoneyIcon from "../../components/Icons/MoneyIcon";
import CalendarIcon from "../../components/Icons/CalendarIcon";
import LocationIcon from "../../components/Icons/LocationIcon";
import SingleSelectModal from "../../components/Modal/SingleSelectModal";
import TextInputModal from "../../components/Modal/TextInputModal";
import EventApplicantDetailsCard from "../../components/EventApplicantDetailsCard";
import {
  getAllParticipantInSessionForEvent,
  getAllSessionsForEvent,
  getDisplayNameForApplication,
  getDisplayNameForAttendanceRecord,
  getEventById,
  getPaymentEvidenceForApplication,
  kickOutParticipant,
  updateEventApplication,
  updateEventAttendanceRecord,
  updatePaymentEvidenceStatus,
  updatePaymentStatusManually,
} from "../../services/EventServices";
import ConfirmationModal from "../../components/ConfirmationModal/ConfirmationModal";
import EventApplicantInfoCard from "../../components/EventApplicantInfoCard";
import {
  EventApplication,
  EventApplicationStatus,
  EventAttendanceRecord,
  EventAttendanceStatus,
  EventPaymentAction,
  EventType,
  EventPaymentEvidence,
  EventPaymentStatus,
  CompetitionType,
} from "../../models/responses/Event";
import EventAttendanceCard from "../../components/Card/EventAttendanceCard";
import LineBreak from "../../components/LineBreak/LineBreak";
import TipIcon from "../../components/Icons/TipIcon";
import { showApiToastError } from "../../components/ApiToastError";
import ClockIcon from "../../components/Icons/ClockIcon";
import { format24HTo12H } from "../../utils/date";
import PencilIcon from "../../components/Icons/PencilIcon";
import ManageSearchIcon from "../../components/Icons/ManageSearchIcon";
import ImageDirectory from "../../assets";
import { useAuth } from "../../hooks/UseAuth";

const t = getTranslation([
  "screen.ClubScreens.ManageEvent",
  "constant.district",
  "constant.profile",
  "constant.eventType",
  "constant.button",
  "formInput",
]);

type ManageEventScreenProps = NativeStackScreenProps<
  MainStackNavigatorParamList,
  "ManageEvent"
>;

export interface FormValue {
  selectedEventDayId: string;
  payment: string;
  kickOutId: string;
  selectedEventDayText: string;
}

export default function ManageEvent({
  route,
  navigation,
}: ManageEventScreenProps) {
  const PAYMENT_STATUS_OPTION = [
    { label: t("Not yet paid"), value: "Unpaid", id: 0, isDisabled: false },
    { label: t("Paid"), value: "Paid", id: 1, isDisabled: false },
  ];
  const { control, watch, setValue } = useForm<FormValue>({ mode: "onChange" });
  const { space, colors } = useTheme();
  const { event: paramValue, eventId } = route.params;

  const eventID = eventId;
  const [reviewEvidenceModalOpen, setReviewEvidenceModalOpen] = useState(false);
  const [expandCourseDetail, setExpandCourseDetail] = useState(false);
  const [showPaymentStatusModal, setShowPaymentStatusModal] = useState(false);
  const [showKickoutModal, setShowKickoutModal] = useState(false);
  const [activePage, setActivePage] = useState(0);
  const [kickOutModalConfirmation, setKickoutModalConfirmation] =
    useState(false);
  const [rejectApplicationModal, setRejectApplicationModal] = useState(false);
  const [selectedEventApplication, setSelectedEventApplication] =
    useState<EventApplication>();
  const [selectedPayment, setSelectedPayment] = useState<EventApplication>();
  const [kickOutApplicationId, setKickOutApplicationId] = useState<
    string | number
  >();
  const [showEventSession, setShowEventSession] = useState(false);
  const [applicationEvidence, setApplicationEvidence] =
    useState<EventPaymentEvidence>();
  const [isEvidenceFetching, setisEvidenceFetching] = useState({
    isLoading: false,
    isError: false,
  });
  const [editStatus, setEditStatus] = useState(false);
  const [rejectModalOpen, setRejectModalOpen] = useState(false);
  const {
    data,
    isValidating,
    error,
    mutate: eventMutate,
  } = useSWR(
    eventID ? formatCoreUrl(`/event/${eventID}`) : null,
    () => getEventById(eventID),
    {
      errorRetryCount: 0,
      errorRetryInterval: 0,
      shouldRetryOnError: false,
    }
  );

  const {
    data: eventSessions,
    isValidating: isEventSessionsValidating,
    error: eventSessionsError,
    mutate: eventSessionMutate,
  } = useSWR(
    formatCoreUrl(`/event/${eventId}/session`),
    () => getAllSessionsForEvent(eventID),
    {
      errorRetryCount: 0,
      errorRetryInterval: 0,
      shouldRetryOnError: false,
    }
  );
  const selectedSessionId = watch("selectedEventDayId");
  const {
    data: eventSessionRecords,
    isValidating: isEventSessionRecordsValidating,
    mutate: eventSessionRecordsMutate,
  } = useSWR(
    formatCoreUrl(`/event/${eventId}/session/${selectedSessionId}`),
    () => {
      if (eventID && selectedSessionId) {
        return getAllParticipantInSessionForEvent({
          eventId: eventID,
          sessionId: selectedSessionId,
        });
      }
    },
    {
      errorRetryCount: 0,
      errorRetryInterval: 0,
      shouldRetryOnError: false,
    }
  );

  const event = data || paramValue;

  const eventSessionOptions = useMemo(() => {
    return eventSessions
      ? eventSessions.map((session) => {
          return {
            value: session.eventSessionId,
            label: session.date,
            isDisabled: false,
          };
        })
      : [];
  }, [eventSessions]);

  const setSelectedDayText = useCallback(
    (newText: string) => {
      setValue(
        "selectedEventDayText",
        eventSessionOptions.filter((session) => session.value === newText)[0]
          .label
      );
    },
    [setValue, eventSessionOptions]
  );
  useEffect(() => {
    if (selectedEventApplication) {
      setisEvidenceFetching((prev) => ({
        isLoading: true,
        isError: false,
      }));
      getPaymentEvidenceForApplication(selectedEventApplication.id)
        .then((evidence: EventPaymentEvidence) => {
          setisEvidenceFetching((prev) => ({ ...prev, isLoading: false }));
          setApplicationEvidence(evidence);
        })
        .catch((e) => {
          console.log("===ee==>", e);
          setisEvidenceFetching((prev) => ({
            isLoading: false,
            isError: true,
          }));
        });
    }
  }, [selectedEventApplication]);

  useEffect(() => {
    if (selectedSessionId) {
      setSelectedDayText(selectedSessionId);
    }
  });
  const { user } = useAuth();

  const eventCapacityInfo = () => {
    const applicantCount = event?.eventApplications
      ? event.eventApplications.filter(
          (applicant) =>
            applicant.eventApplicationStatus === EventApplicationStatus.Approved
        ).length
      : 0;
    const capacity = event?.capacity ? event.capacity : 0;
    const background =
      applicantCount < capacity / 2
        ? "rs_secondary.green"
        : applicantCount <= capacity * 0.75
        ? "rs_secondary.orange"
        : "rs_secondary.error";

    return (
      <VStack justifyContent="center" space="3">
        <HStack space="2">
          <Text fontSize="md" fontWeight="bold">
            {event?.type === EventType.Competition &&
            event.competitionType === CompetitionType.Team
              ? t("Approved Teams")
              : t("ApprovedPlayers")}
          </Text>
          <HStack space="2">
            <Text>{`${applicantCount}/${capacity}`}</Text>
            {/* <HStack borderRadius="full" width="6" height="6" bg={background} /> */}
          </HStack>
        </HStack>

        {/* Manage Players */}
        <Button
          variant="outline"
          py="1.5"
          borderRadius="5"
          _text={{ fontSize: 14, fontWeight: 400, color: "rs.primary_purple" }}
          _pressed={{
            _icon: {
              innterFill: "#FFFFFF",
            },
          }}
          onPress={() => {
            if (event) {
              navigation.navigate("ManageEventPlayer", { event });
            }
          }}
          leftIcon={<PencilIcon alignSelf="center" size="md" />}
        >
          {t("Manage Players")}
        </Button>

        {/* Add participants button */}
        {/* <HStack space="1">
          <Pressable
            onPress={() => {
              if (event) {
                navigation.navigate("AddParticipant", { event });
              }
            }}
          >
            <Badge
              borderColor="rs_secondary.green"
              variant="outline"
              bg="rs_secondary.green"
              _text={{ color: "rs.white", fontSize: 14 }}
              w="40"
              p="1"
              borderRadius="full"
            >
              {`+ ${t("Add participants")}`}
            </Badge>
          </Pressable>
          <Pressable
            onPress={() => {
              setShowKickoutModal(true);
            }}
          >
            <Badge
              borderColor="rs.red"
              variant="outline"
              bg="rs.red"
              _text={{ color: "rs.white", fontSize: 14 }}
              p="1"
              px="3"
              borderRadius="full"
            >
              <HStack
                justifyContent="center"
                alignItems="center"
                space="2"
                w="40"
              >
                <LogoutIcon />
                <Text textAlign="center">{t("Kick out a participant")}</Text>
              </HStack>
            </Badge>
          </Pressable>
        </HStack> */}
      </VStack>
    );
  };

  const eventDetail = () => {
    return (
      <VStack space="2">
        {event?.eventSessions &&
          event?.eventSessions?.map((val, index) => (
            <VStack space={2} key={`${val.date}_${val.fromTime}_${val.toTime}`}>
              <Text
                mt={2}
                fontSize={16}
                color="rs.primary_purple"
                fontWeight={700}
              >
                {t("Day %{number}", { number: index + 1 })}
              </Text>
              <HStack space="3" alignItems="center">
                <CalendarIcon />
                <Text flex={1}>{val?.date}</Text>
                <HStack flex="2" alignItems="center" space="2">
                  <ClockIcon size="md" />
                  <Text color="rs.black" flex={1}>
                    {`${format24HTo12H(val.fromTime)} ${t(
                      "to"
                    )} ${format24HTo12H(val.toTime)}`}
                  </Text>
                </HStack>
              </HStack>
              <HStack space="3" flexWrap="wrap">
                <LocationIcon />
                <Text flex={1}>{val?.address}</Text>
              </HStack>
            </VStack>
          ))}
        {/* <HStack space="3">
          <MoneyIcon />
          <Text>
            {event?.fee ? `${event.fee} ${t("hkd/person")}` : t("free")}
          </Text>
        </HStack> */}
        {event?.description && (
          <VStack space={2}>
            <Text
              mt="4"
              fontSize={16}
              color="rs.primary_purple"
              fontWeight="bold"
            >
              {t("Description")}
            </Text>
            <Text>{event?.description}</Text>
          </VStack>
        )}

        <VStack space={2} mt="4">
          <Heading color="rs.primary_purple" fontSize={16} fontWeight="bold">
            {t("Price")}
          </Heading>
          <HStack space="3">
            <MoneyIcon />
            {event?.fee ? (
              <Text>
                {event?.fee} {t("hkd/person")}
              </Text>
            ) : (
              <Text fontSize="md">{t("free")}</Text>
            )}
          </HStack>
        </VStack>
      </VStack>
    );
  };

  const mutateAll = useCallback(() => {
    eventMutate();
    eventSessionRecordsMutate();
    eventSessionMutate();
  }, [eventMutate, eventSessionRecordsMutate, eventSessionMutate]);

  useFocusEffect(
    React.useCallback(() => {
      mutateAll();
    }, [mutateAll])
  );

  const onReviewEvidence = () => {
    setReviewEvidenceModalOpen(true);
  };
  const reviewEvidenceModal = () => {
    return (
      <Modal
        isOpen={reviewEvidenceModalOpen}
        onClose={() => {
          setReviewEvidenceModalOpen(false);
        }}
      >
        <Modal.Content>
          <Modal.Header>{t("Review evidence")}</Modal.Header>
          <Modal.CloseButton />
          <Modal.Body>
            {/* Evidence modal */}

            {isEvidenceFetching.isLoading && <Loading />}
            {!isEvidenceFetching.isLoading && isEvidenceFetching.isError && (
              <VStack flex="1" justifyContent="center" alignItems="center">
                <Text>{t("No Evidence fetched")}</Text>
              </VStack>
            )}
            {applicationEvidence &&
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
                  {/* Buttons */}
                  {selectedEventApplication?.isOnline &&
                    selectedEventApplication?.paymentStatus ===
                      EventPaymentStatus.Pending && (
                      <VStack width="100%" space="4" mt="3" mb="5">
                        <Button
                          onPress={async () => {
                            if (selectedEventApplication)
                              await onActionPayment({
                                action: Action.Approve,
                                application: selectedEventApplication,
                                reasonReject: "",
                              });
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
                  <Text>{t("No Evidence fetched")}</Text>
                </VStack>
              )}
          </Modal.Body>
        </Modal.Content>
      </Modal>
    );
  };

  const onAction = async ({
    action,
    application,
    reasonReject,
  }: {
    action: Action;
    application: EventApplication;
    reasonReject: string;
  }) => {
    if (eventId) {
      try {
        const res = await updateEventApplication({
          action,
          eventId,
          applicationId: application.id,
          parameters: {
            reasonReject: reasonReject || "",
          },
        });

        mutateAll();
        Toast.show({
          id: "actionSuccess",
          duration: 2000,
          placement: "top",
          render: () => {
            return (
              <MessageToast
                type={MesssageToastType.Success}
                title={`${t(action)} ${t("Success")}`}
              />
            );
          },
        });
      } catch (updateApplicationError) {
        showApiToastError(updateApplicationError);
      }
    }
  };

  const applicationList = () => {
    return (
      <VStack space="3">
        {/* Online */}
        <VStack space="4">
          {/* <Text fontWeight="bold" color="rs.skyBlue">
            {t("Online")}
          </Text> */}
          {event?.eventApplications &&
            event.eventApplications
              .filter((application) => {
                return (
                  application.isOnline &&
                  application.eventApplicationStatus ===
                    EventApplicationStatus.Pending
                );
              })
              .sort(function (a, b) {
                if (
                  a.eventApplicationStatus === EventApplicationStatus.Pending
                ) {
                  return -1;
                }
                if (
                  b.eventApplicationStatus === EventApplicationStatus.Approved
                ) {
                  return 0;
                }
                return 1;
              })
              .map((application) => {
                return (
                  <VStack
                    space="3"
                    key={`online_EventApplicantDetailsCard_${application.id}`}
                  >
                    <EventApplicantDetailsCard
                      application={application}
                      onPressApprove={async () => {
                        await onAction({
                          action: Action.Approve,
                          application,
                          reasonReject: "",
                        });
                        mutateAll();
                      }}
                      onPressReject={() => {
                        setSelectedEventApplication(application);
                        setRejectApplicationModal(true);
                      }}
                    />
                    <LineBreak />
                  </VStack>
                );
              })}
        </VStack>
        {/* Offline section */}
        <VStack space="4">
          {/* <Text fontWeight="bold" color="rs.skyBlue">
            {t("Offline")}
          </Text> */}
          {event?.eventApplications &&
            event.eventApplications
              .filter((application) => {
                return (
                  !application.isOnline &&
                  application.eventApplicationStatus ===
                    EventApplicationStatus.Pending
                );
              })
              .sort(function (a, b) {
                if (
                  a.eventApplicationStatus === EventApplicationStatus.Pending
                ) {
                  return -1;
                }
                if (
                  b.eventApplicationStatus === EventApplicationStatus.Approved
                ) {
                  return 0;
                }
                return 1;
              })
              .map((application) => {
                return (
                  <VStack
                    space="3"
                    key={`offline_eventApplicantDetails_${application.id}`}
                  >
                    <EventApplicantDetailsCard
                      shouldShowPlayerDetails={false}
                      application={application}
                      onPressApprove={async () => {
                        await onAction({
                          action: Action.Approve,
                          application,
                          reasonReject: "",
                        });
                        mutateAll();
                      }}
                      onPressReject={() => {
                        setSelectedEventApplication(application);
                        setRejectApplicationModal(true);
                      }}
                    />
                    <LineBreak />
                  </VStack>
                );
              })}
        </VStack>
      </VStack>
    );
  };

  const managePaymentEvidence = () => {
    const paymentLists = event?.eventApplications
      ? event.eventApplications.filter(
          (application) =>
            application.eventApplicationStatus ===
            EventApplicationStatus.Approved
        )
      : [];
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
            {/* <Pressable
              onPress={() => {
                if (event?.id) {
                  navigation.navigate("PaymentStatus", { eventId: event?.id });
                }
              }}
            >
              <Text fontSize="md" color="rs.skyBlue">
                {t("Check")}
              </Text>
            </Pressable> */}
          </VStack>
        </HStack>
        {/* <Text fontWeight="bold" color="rs.skyBlue">
          {t("Manual change payment status")}
        </Text> */}

        {/* Edit Payment Status */}
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
              <Text color="rs.white">{t("Save Changes")}</Text>
            ) : (
              <>
                <PencilIcon color="#31095E" alignSelf="center" />
                <Text>
                  {editStatus ? t("Save Changes") : t("Edit Payment Status")}
                </Text>
              </>
            )}
          </HStack>
        </Button>
        <VStack space="4">
          {/* <Text fontWeight="bold" color="rs.skyBlue">
            {t("Online")}
          </Text> */}
          {paymentLists &&
            paymentLists
              .filter(
                (application) =>
                  application.isOnline &&
                  application.eventApplicationStatus ===
                    EventApplicationStatus.Approved
              )
              .map((application, index) => {
                return (
                  <VStack
                    space="3"
                    key={`online_eventApplicationInfo_${application.id}`}
                  >
                    <EventApplicantInfoCard
                      icon={<ManageSearchIcon size="md" />}
                      actionLabel="application"
                      onPressAction={() => {
                        setSelectedEventApplication(application);
                        onReviewEvidence();
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
        <VStack space="4">
          {/* <Text fontWeight="bold" color="rs.skyBlue">
            {t("Offline")}
          </Text> */}
          {paymentLists &&
            paymentLists
              .filter(
                (application) =>
                  !application.isOnline &&
                  application.eventApplicationStatus ===
                    EventApplicationStatus.Approved
              )
              .map((application, index) => {
                return (
                  <VStack
                    space="3"
                    key={`offline_eventApplicationInfo_${application.id}`}
                  >
                    <EventApplicantInfoCard
                      icon={<ManageSearchIcon size="md" />}
                      actionLabel="application"
                      onPressAction={async () => {
                        setSelectedEventApplication(application);
                        onReviewEvidence();
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
      </VStack>
    );
  };

  const updateRollCall = async (
    newStatus: EventAttendanceStatus,
    item: EventAttendanceRecord
  ) => {
    if (selectedSessionId) {
      const payload = item;
      try {
        await updateEventAttendanceRecord(
          {
            status: newStatus,
            applicationId: payload.attendance.applicationId,
            eventId: payload.attendance.eventId,
          },
          selectedSessionId
        );
        mutateAll();
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
        showApiToastError(updateSessionFromError);
      }
    }
  };

  const rollCall = () => {
    if (!event?.eventSessions || event.eventSessions.length === 0) {
      return (
        <VStack flex="1" justifyContent="center" alignItems="center">
          <Text>{t("There is no event days found")}</Text>
        </VStack>
      );
    }
    return (
      <VStack space="3">
        <FormInput
          label={t("Event day")}
          controllerProps={{
            name: "selectedEventDayText",
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
            setShowEventSession(true);
          }}
        />
        {/* TODO - API Integration - Event roll call */}
        {isEventSessionRecordsValidating ? (
          <Loading />
        ) : !eventSessionRecords || eventSessionRecords.length === 0 ? (
          !selectedSessionId ? (
            <VStack flex="1" justifyContent="center" alignItems="center">
              <Text fontSize="md" fontWeight="bold">
                {t("Please select event session")}
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
          eventSessionRecords &&
          eventSessionRecords.length > 0 &&
          eventSessionRecords.map((val) => {
            return (
              <Pressable
                key={`record-${val.applicationId}-${val.attendance.eventId}_${val.attendance.applicationId}`}
                mt="2"
                onPress={() => {}}
              >
                <EventAttendanceCard
                  shouldShowAvt={val.teamName === null}
                  profilePicture={val.applicantImageUrl}
                  displayName={getDisplayNameForAttendanceRecord(val)}
                  key={`record-${val.applicationId}-${val.attendance.eventId}_${val.attendance.applicationId}-card`}
                  defaultStatus={val.attendance.status}
                  isLoading={false}
                  onRightBoxPress={async (newStatus) => {
                    await updateRollCall(newStatus, val);
                  }}
                />
                <Divider mt="2" />
              </Pressable>
            );
          })
        )}
      </VStack>
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

  const kickOutApplication = async (applicationId: string | number) => {
    try {
      await kickOutParticipant({ applicationId });
      Toast.show({
        id: "actionSuccessKick",
        duration: 2000,
        placement: "top",
        render: () => {
          return (
            <MessageToast
              type={MesssageToastType.Success}
              title={t("Remove participant Success")}
            />
          );
        },
      });
      mutateAll();
    } catch (kickOutFailure) {
      showApiToastError(kickOutFailure);
    }
  };

  const manuallyUpdatePaymentStatus = async ({
    action,
    application,
  }: {
    action: EventPaymentAction;
    application: EventApplication;
  }) => {
    try {
      await updatePaymentStatusManually({
        applicationId: application.id,
        action,
      });
      mutateAll();
      Toast.show({
        id: "actionSuccess",
        duration: 2000,
        placement: "top",
        render: () => {
          return (
            <MessageToast
              type={MesssageToastType.Success}
              title={`${t(action)} ${t("Success")}`}
            />
          );
        },
      });
    } catch (updatePaymentStatusError) {
      showApiToastError(updatePaymentStatusError);
    }
  };

  const textColor =
    event?.type === EventType.Competition ? "rs.black" : "rs.white";
  const bg =
    event?.type === EventType.Competition
      ? "#66CEE1"
      : event?.type === EventType.OpenDay
      ? "#31095E"
      : "#E08700";
  const typeText =
    event?.type === EventType.Competition
      ? `${t(event?.competitionType)} ${t(event?.type)}`
      : `${t(event?.type)}`;

  const bgMap = ImageDirectory.VENUE;

  return (
    <HeaderLayout
      isSticky
      headerProps={{
        title: t("Manage Event"),
        hasBackButton: true,
        containerStyle: { marginHorizontal: 0 },
      }}
      containerProps={{ marginHorizontal: space.defaultLayoutSpacing }}
    >
      {isValidating && <Loading />}
      {!isValidating && error && !event && <ErrorMessage />}
      {!isValidating && event && (
        <VStack space="4" flex="1" py="defaultLayoutSpacing">
          <HStack space="2">
            <Badge
              borderColor={bg}
              bg={bg}
              _text={{
                color: textColor,
                fontWeight: "bold",
                fontSize: "sm",
                borderRadius: "full",
              }}
            >
              {typeText}
            </Badge>
          </HStack>
          <HStack space="3" alignItems="center">
            <Image
              source={
                event?.imageUrl
                  ? {
                      uri: formatFileUrl(event?.imageUrl),
                    }
                  : bgMap
              }
              w="65"
              h="65"
            />
            <Heading>{event.name}</Heading>
          </HStack>
          {/* Event details */}
          {expandCourseDetail && eventDetail()}
          <Pressable
            onPress={() => {
              setExpandCourseDetail(!expandCourseDetail);
            }}
          >
            <Text color="rs.primary_purple">
              {!expandCourseDetail
                ? t("Expand event details")
                : t("Collapse event details")}
            </Text>
          </Pressable>
          {/* Capacity */}
          {eventCapacityInfo()}

          {/* Segmented controls */}
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
              px="1"
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
            {event.fee && (
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
                px="1"
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
            )}
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
              px="1"
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
                {t("Roll call")}
              </Text>
            </Pressable>
          </HStack>

          {activePage === 0 && applicationList()}
          {activePage === 1 && managePaymentEvidence()}
          {activePage === 2 && rollCall()}
        </VStack>
      )}

      <SingleSelectModal
        showSelectedIcon={false}
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
                await manuallyUpdatePaymentStatus({
                  application: selectedPayment,
                  action: EventPaymentAction.Unpaid,
                });
              }
              setShowPaymentStatusModal(false);
              break;
            case "Paid":
              if (selectedPayment) {
                await manuallyUpdatePaymentStatus({
                  application: selectedPayment,
                  action: EventPaymentAction.Paid,
                });
              }
              setShowPaymentStatusModal(false);
              break;
            default:
              break;
          }
        }}
      />
      <SingleSelectModal
        showSelectedIcon={false}
        shouldCloseAfterSelect
        title={t("Select one player to kick out")}
        options={
          event?.eventApplications
            ? event?.eventApplications
                .filter(
                  (application) =>
                    application.eventApplicationStatus ===
                    EventApplicationStatus.Approved
                )
                .map((application) => {
                  return {
                    label: getDisplayNameForApplication(application),
                    value: application.id,
                  };
                })
            : []
        }
        controllerProps={{
          name: "kickOutId",
          control,
        }}
        isOpen={showKickoutModal}
        onClose={() => {
          setShowKickoutModal(false);
        }}
        onPressItem={(item) => {
          setKickoutModalConfirmation(true);
          setKickOutApplicationId(item.value);
        }}
      />
      <ConfirmationModal
        isOpen={kickOutModalConfirmation}
        title={t("Are you sure to kick out this player")}
        cancelText={t("Cancel")}
        confirmText={t("Confirm")}
        onConfirm={async () => {
          if (kickOutApplicationId) {
            await kickOutApplication(kickOutApplicationId);
          }
          setKickoutModalConfirmation(false);
          setShowKickoutModal(false);
        }}
        onCancel={() => {
          setKickoutModalConfirmation(false);
        }}
      />
      <TextInputModal
        heading={t("Reject")}
        description={t("Please provide reason for rejecting the application")}
        isOpen={rejectApplicationModal}
        onClose={() => {
          setRejectApplicationModal(false);
        }}
        onPressSubmit={async (reasonReject: string) => {
          if (selectedEventApplication) {
            await onAction({
              action: Action.Reject,
              reasonReject,
              application: selectedEventApplication,
            });
            setRejectApplicationModal(false);
            mutateAll();
          }
        }}
      />
      <SingleSelectModal
        showSelectedIcon={false}
        shouldCloseAfterSelect
        title={t("Select event session")}
        options={eventSessionOptions}
        controllerProps={{
          name: "selectedEventDayId",
          control,
          rules: {
            required: true,
          },
        }}
        isOpen={showEventSession}
        onClose={() => {
          setShowEventSession(false);
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
          if (selectedEventApplication)
            await onActionPayment({
              action: Action.Reject,
              application: selectedEventApplication,
              reasonReject: msg,
            });
          setRejectModalOpen(false);
          setReviewEvidenceModalOpen(false);
        }}
      />
    </HeaderLayout>
  );
}
