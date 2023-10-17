import { RouteProp, useFocusEffect } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { Modal, Text, Toast, VStack, Image } from "native-base";
import React, { useCallback, useEffect, useState } from "react";
import useSWR from "swr";
import { showApiToastError } from "../../components/ApiToastError";
import EventApplicantInfoCard from "../../components/EventApplicantInfoCard";
import ManageSearchIcon from "../../components/Icons/ManageSearchIcon";
import HeaderLayout from "../../components/Layout/HeaderLayout";
import LineBreak from "../../components/LineBreak/LineBreak";
import MessageToast, {
  MesssageToastType,
} from "../../components/Toast/MessageToast";
import {
  EventApplication,
  EventApplicationStatus,
  EventPaymentStatus,
} from "../../models/responses/Event";
import { MainStackNavigatorParamList } from "../../routers/Types";
import {
  getEventById,
  getPaymentEvidenceForApplication,
  kickOutParticipant,
} from "../../services/EventServices";
import { formatCoreUrl, formatFileUrl } from "../../services/ServiceUtil";
import { getTranslation } from "../../utils/translation";

export type PaymentStatusPropsNavigationProp = NativeStackNavigationProp<
  MainStackNavigatorParamList,
  "PaymentStatus"
>;
type PaymentStatusPropsBaseProps = RouteProp<
  MainStackNavigatorParamList,
  "PaymentStatus"
>;
export interface PaymentStatusProps extends PaymentStatusPropsBaseProps {
  route: PaymentStatusPropsBaseProps;
  navigation: PaymentStatusPropsNavigationProp;
}

const t = getTranslation("screen.PaymentStatus");

export default function PaymentStatus({
  route,
  navigation,
}: PaymentStatusProps) {
  const [reviewEvidenceModalOpen, setReviewEvidenceModalOpen] = useState(false);
  const [selectedApplication, setSelectedApplication] =
    useState<EventApplication>();

  const onReviewEvidence = () => {
    setReviewEvidenceModalOpen(true);
  };

  const { eventId, event: eventParams } = route.params;
  const { data: eventFetching, mutate: eventMutate } = useSWR(
    eventId && !eventParams ? formatCoreUrl(`/event/${eventId}`) : null,
    () => getEventById(eventId),
    {
      errorRetryCount: 0,
      errorRetryInterval: 0,
      shouldRetryOnError: false,
    }
  );
  const event = eventFetching || eventParams;

  const {
    data: applicationEvidence,
    isValidating: isEvidenceFetching,
    error: evidenceError,
    mutate: evidenceMutate,
  } = useSWR(
    selectedApplication
      ? formatCoreUrl(`/paymentevidence/${selectedApplication.id}`)
      : null,
    () => {
      if (selectedApplication) {
        return getPaymentEvidenceForApplication(selectedApplication.id);
      }
    }
  );

  useEffect(() => {
    if (selectedApplication) {
      evidenceMutate();
    }
  }, [selectedApplication, evidenceMutate]);

  const mutateAll = useCallback(() => {
    eventMutate();
    evidenceMutate();
  }, [eventMutate, evidenceMutate]);

  useFocusEffect(
    React.useCallback(() => {
      mutateAll();
    }, [mutateAll])
  );

  const onKickOut = async (payment: EventApplication) => {
    if (payment) {
      try {
        await kickOutParticipant({
          applicationId: payment.id,
        });
        eventMutate();
        Toast.show({
          id: "kickSuccessfully",
          duration: 2000,
          placement: "top",
          render: () => {
            return (
              <MessageToast
                type={MesssageToastType.Success}
                title={t("Kick out player successfully")}
              />
            );
          },
        });
      } catch (errorKick) {
        showApiToastError(errorKick);
      }
    }
  };

  const onCheckEvidence = (payment: EventApplication) => {
    if (payment) {
      navigation.navigate("PaymentEvidence", {
        application: payment,
      });
    }
  };

  const onPressPaymentAction = async (
    payment: EventApplication,
    status: EventPaymentStatus
  ) => {
    setSelectedApplication(payment);
    switch (status) {
      case EventPaymentStatus.Paid:
        onReviewEvidence();
        break;
      case EventPaymentStatus.Unpaid:
        await onKickOut(payment);
        break;
      case EventPaymentStatus.Pending:
        onCheckEvidence(payment);
        break;
      default:
        break;
    }
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

            {applicationEvidence &&
            !evidenceError &&
            !isEvidenceFetching &&
            applicationEvidence.imageUrl ? (
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
            ) : (
              <VStack flex="1" justifyContent="center" alignItems="center">
                <Text>{t("No Evidence fetched")}</Text>
              </VStack>
            )}
          </Modal.Body>
        </Modal.Content>
      </Modal>
    );
  };

  const paymentInfoSection = ({
    payments,
    status,
  }: {
    payments: EventApplication[];
    status: EventPaymentStatus;
  }) => {
    const title =
      status === EventPaymentStatus.Pending
        ? t("Pending approval")
        : status === EventPaymentStatus.Unpaid
        ? t("Not Paid")
        : t("Paid");
    const titleColor =
      status === EventPaymentStatus.Pending
        ? "rs_secondary.orange"
        : status === EventPaymentStatus.Unpaid
        ? "rs.red"
        : "rs.green";
    return (
      <VStack space="2">
        <Text color={titleColor} fontWeight="bold">
          {title}
        </Text>
        {(!payments || payments.length === 0) && (
          <VStack my="2" justifyContent="center" alignItems="center">
            <Text>{`${t("There is no payments with status")} ${title}`}</Text>
          </VStack>
        )}
        {payments &&
          payments.length > 0 &&
          payments
            .filter(
              (application) =>
                application.eventApplicationStatus ===
                EventApplicationStatus.Approved
            )
            .map((payment) => {
              const actionLabel =
                status === EventPaymentStatus.Pending
                  ? t("Check evidence")
                  : status === EventPaymentStatus.Unpaid
                  ? t("Kick out")
                  : t("Review Evidence");
              return (
                <VStack key={`${payment.id}-${payment.eventId}`} space="3">
                  <EventApplicantInfoCard
                    key={`${payment.id}-item-${payment.eventId}`}
                    icon={
                      status !== EventPaymentStatus.Unpaid ? (
                        <ManageSearchIcon size="md" />
                      ) : undefined
                    }
                    shouldShowStatus={false}
                    application={payment}
                    actionLabel={actionLabel}
                    onPressAction={async () => {
                      setSelectedApplication(payment);
                      await onPressPaymentAction(payment, status);
                    }}
                  />
                  <LineBreak
                    key={`${payment.id}-item-linebreak-${payment.eventId}`}
                  />
                </VStack>
              );
            })}
      </VStack>
    );
  };

  return (
    <HeaderLayout
      isSticky
      headerProps={{ title: t("Payment status"), hasBackButton: true }}
    >
      <VStack space="4" flex="1" mx="defaultLayoutSpacing">
        <Text>
          {t(
            "Check all the evidences and you can kick out player who didnt pay here"
          )}
        </Text>
        {/* Pending */}
        {paymentInfoSection({
          payments: event?.eventApplications
            ? event.eventApplications.filter(
                (application) =>
                  application.paymentStatus === EventPaymentStatus.Pending &&
                  application.eventApplicationStatus ===
                    EventApplicationStatus.Approved
              )
            : [],
          status: EventPaymentStatus.Pending,
        })}
        {/* Not yet paid */}
        {paymentInfoSection({
          payments: event?.eventApplications
            ? event.eventApplications.filter(
                (application) =>
                  application.paymentStatus === EventPaymentStatus.Unpaid &&
                  application.eventApplicationStatus ===
                    EventApplicationStatus.Approved
              )
            : [],
          status: EventPaymentStatus.Unpaid,
        })}
        {/* Paid */}
        {paymentInfoSection({
          payments: event?.eventApplications
            ? event.eventApplications.filter(
                (application) =>
                  application.paymentStatus === EventPaymentStatus.Paid &&
                  application.eventApplicationStatus ===
                    EventApplicationStatus.Approved
              )
            : [],
          status: EventPaymentStatus.Paid,
        })}
      </VStack>
      {reviewEvidenceModal()}
    </HeaderLayout>
  );
}
