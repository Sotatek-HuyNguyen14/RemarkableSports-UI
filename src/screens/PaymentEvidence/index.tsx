import { RouteProp, useTheme } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import {
  Avatar,
  Button,
  HStack,
  Text,
  Toast,
  VStack,
  Image,
} from "native-base";
import React, { useState } from "react";
import useSWR from "swr";
import ImageDirectory from "../../assets";
import { showApiToastError } from "../../components/ApiToastError";
import HeaderLayout from "../../components/Layout/HeaderLayout";
import TextInputModal from "../../components/Modal/TextInputModal";
import MessageToast, {
  MesssageToastType,
} from "../../components/Toast/MessageToast";
import { Action } from "../../models/Response";
import { Player } from "../../models/User";
import { MainStackNavigatorParamList } from "../../routers/Types";
import {
  getDisplayNameForApplication,
  getPaymentEvidenceForApplication,
  profilePictureForApplication,
  updatePaymentEvidenceStatus,
} from "../../services/EventServices";
import { formatCoreUrl, formatFileUrl } from "../../services/ServiceUtil";
import { formatName } from "../../utils/name";
import { getTranslation } from "../../utils/translation";

export type PaymentEvidencePropsNavigationProp = NativeStackNavigationProp<
  MainStackNavigatorParamList,
  "PaymentEvidence"
>;
type PaymentEvidencePropsBaseProps = RouteProp<
  MainStackNavigatorParamList,
  "PaymentEvidence"
>;
export interface PaymentEvidenceProps extends PaymentEvidencePropsBaseProps {
  route: PaymentEvidencePropsBaseProps;
  navigation: PaymentEvidencePropsNavigationProp;
}

const t = getTranslation(["screen.PaymentEvidence", "constant.button"]);

export default function PaymentEvidence({
  route,
  navigation,
}: PaymentEvidenceProps) {
  const theme = useTheme();
  const [rejectModalOpen, setRejectModalOpen] = useState(false);

  const onAction = async ({
    action,
    reasonReject = "",
  }: {
    action: Action;
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
      navigation.goBack();
    } catch (error) {
      showApiToastError(error);
    }
  };

  const { application } = route.params;
  const displayName = getDisplayNameForApplication(application);
  const profileImage = profilePictureForApplication(application);

  const {
    data: applicationEvidence,
    isValidating,
    error,
    mutate: eventMutate,
  } = useSWR(
    formatCoreUrl(`/paymentevidence/${application.id}`),
    () => getPaymentEvidenceForApplication(application.id),
    {
      errorRetryCount: 0,
      errorRetryInterval: 0,
      shouldRetryOnError: false,
    }
  );

  const method = "";

  return (
    <HeaderLayout
      isSticky
      headerProps={{ title: t("Payment Evidence"), hasBackButton: true }}
    >
      <VStack flex="1" mx="defaultLayoutSpacing">
        {/* Image check */}
        {applicationEvidence && applicationEvidence.imageUrl ? (
          <Image
            alt="evidence"
            w="100%"
            h="80%"
            resizeMethod="scale"
            resizeMode="contain"
            source={{ uri: formatFileUrl(applicationEvidence.imageUrl) }}
          />
        ) : (
          <VStack flex="1" justifyContent="center" alignItems="center">
            <Text>{t("No Evidence fetched. Please try again")}</Text>
          </VStack>
        )}

        {/* Buttons */}
        <VStack position="absolute" bottom="0" width="100%" space="4" mb="5">
          <Button
            onPress={async () => {
              await onAction({ action: Action.Approve, reasonReject: "" });
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
      </VStack>

      <TextInputModal
        heading={t("Reject")}
        description={t("Please provide reason for rejecting the payment")}
        isOpen={rejectModalOpen}
        onClose={() => {
          setRejectModalOpen(false);
        }}
        onPressSubmit={async (msg: string) => {
          await onAction({ action: Action.Reject, reasonReject: msg });
        }}
      />
    </HeaderLayout>
  );
}
