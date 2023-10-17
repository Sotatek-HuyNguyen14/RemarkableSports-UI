import React, { useState } from "react";
import {
  Avatar,
  Button,
  HStack,
  Image,
  Text,
  useTheme,
  VStack,
} from "native-base";
import { NativeStackScreenProps } from "@react-navigation/native-stack";
import useSWR from "swr";
import HeaderLayout from "../../components/Layout/HeaderLayout";
import { MainStackNavigatorParamList } from "../../routers/Types";
import { getTranslation } from "../../utils/translation";
import { formatCoreUrl, formatFileUrl } from "../../services/ServiceUtil";
import Loading from "../../components/Loading";
import { showApiToastError } from "../../components/ApiToastError";
import {
  getCoursePaymentEvidenceForApplication,
  updateCoursePaymentStatus,
} from "../../services/CourseServices";
import { CoursePaymentStatus } from "../../models/responses/Course";
import { Action } from "../../models/Response";
import TextInputModal from "../../components/Modal/TextInputModal";
import { showApiToastSuccess } from "../../components/ApiToastSuccess";
import { getUserName } from "../../utils/name";
import {
  getPaymentEvidenceForApplication,
  updatePaymentEvidenceStatus,
} from "../../services/EventServices";
import {
  EventApplication,
  EventPaymentStatus,
} from "../../models/responses/Event";

type ReviewEventPaymentEvidenceScreenProps = NativeStackScreenProps<
  MainStackNavigatorParamList,
  "ReviewEventPaymentEvidence"
>;

const t = getTranslation([
  "screen.ReviewCoursePaymentEvidence",
  "screen.ClubScreens.ManageEvent",
  "constant.button",
]);

export default function ReviewEventPaymentEvidence({
  navigation,
  route,
}: ReviewEventPaymentEvidenceScreenProps) {
  const { space } = useTheme();
  const { application } = route.params;
  const {
    isValidating,
    data: applicationEvidence,
    mutate,
  } = useSWR(
    formatCoreUrl(`/paymentevidence/${application.id}?category=Event`),
    () => getPaymentEvidenceForApplication(application.id)
  );
  const [rejectModalOpen, setRejectModalOpen] = useState(false);

  if (isValidating) {
    return <Loading />;
  }

  const onActionPayment = async ({
    action,
    eventApplication,
    reasonReject = "",
  }: {
    action: Action;
    eventApplication: EventApplication;
    reasonReject: string;
  }) => {
    try {
      await updatePaymentEvidenceStatus({
        applicationId: eventApplication.id,
        action,
        parameters: {
          reasonReject,
        },
      });
      /* TODO - API Integration */
      showApiToastSuccess({});
    } catch (e) {
      console.log("error:", e);
      showApiToastError(e);
    }
  };

  const applicationEvidenceView = () => {
    const displayName = getUserName(application.applicant)?.toString();
    const profileImage = application.applicant?.profilePicture;
    return (
      <VStack space="2" flex="1">
        <HStack alignItems="center" space="2">
          <Avatar
            size="sm"
            source={
              profileImage
                ? {
                    uri: formatFileUrl(profileImage),
                  }
                : undefined
            }
          >
            {`${application?.applicant?.firstName?.charAt(
              0
            )}${application?.applicant?.lastName?.charAt(0)}`}
          </Avatar>

          <Text fontSize="md" numberOfLines={2}>{`${displayName.slice(
            0,
            displayName.length > 20
              ? displayName.length / 2
              : displayName.length
          )}${displayName.length > 20 ? "..." : ""}`}</Text>
        </HStack>
        {applicationEvidence ? (
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
          noEvidenceView()
        )}
        {applicationEvidence &&
          application.paymentStatus === EventPaymentStatus.Pending && (
            <VStack width="100%" space="4" mt="3" mb="5">
              <Button
                onPress={async () => {
                  try {
                    await onActionPayment({
                      action: Action.Approve,
                      eventApplication: application,
                      reasonReject: "",
                    });
                    navigation.goBack();
                  } catch (error) {
                    showApiToastError(error);
                  }
                }}
                bg="#00B812"
              >
                {t("Approve and mark as paid")}
              </Button>
              <Button
                variant="outline"
                onPress={() => {
                  setRejectModalOpen(true);
                }}
                borderColor="#E71010"
                _text={{ color: "#E71010" }}
              >
                {t("Reject and provide reason")}
              </Button>
            </VStack>
          )}
        <TextInputModal
          heading={t("Reject")}
          description={t("Please provide reason for rejecting the payment")}
          isOpen={rejectModalOpen}
          onClose={() => {
            setRejectModalOpen(false);
          }}
          onPressSubmit={async (msg: string) => {
            await onActionPayment({
              action: Action.Reject,
              eventApplication: application,
              reasonReject: msg,
            });
            setRejectModalOpen(false);
          }}
        />
      </VStack>
    );
  };

  const noEvidenceView = () => {
    return (
      <VStack
        flex="1"
        justifyContent="center"
        alignItems="center"
        alignSelf="center"
      >
        <Text>{t("No Evidence fetched")}</Text>
      </VStack>
    );
  };

  return (
    <HeaderLayout
      headerProps={{
        title: t("Payment evidence"),
        headerLabelStyle: { fontSize: 16 },
        containerStyle: { alignItems: "center" },
      }}
      containerProps={{ marginHorizontal: space.defaultLayoutSpacing }}
    >
      <VStack flex="1">{applicationEvidenceView()}</VStack>
    </HeaderLayout>
  );
}
