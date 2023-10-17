import { NativeStackScreenProps } from "@react-navigation/native-stack";
import { Button, VStack } from "native-base";
import React, { useState } from "react";
import { TouchableOpacity } from "react-native";
import { showApiToastError } from "../../../components/ApiToastError";
import CoachDetails from "../../../components/Coach/CoachDetails";
import LeftArrowIcon from "../../../components/Icons/LeftArrowIcon";
import HeaderLayout from "../../../components/Layout/HeaderLayout";
import RejectWithReasonModal from "../../../components/Modal/RejectWithReasonModal";
import {
  AdminApprovalAction,
  AdminStepId,
  ProcessOnboardingRequest,
} from "../../../models/Request";
import { UserType } from "../../../models/User";
import { MainStackNavigatorParamList } from "../../../routers/Types";
import { processOnboardingRequest } from "../../../services/AdminOnboardingServices";
import { getTranslation } from "../../../utils/translation";
import {
  APPROVE_BUTTON_COLOR,
  REJECT_BUTTON_COLOR,
} from "../../../constants/constants";

const t = getTranslation([
  "screen.AdminScreens.CoachApproval",
  "constant.button",
]);

export default function Coach({
  route,
  navigation,
}: NativeStackScreenProps<
  MainStackNavigatorParamList,
  "ReviewCoachOnboardingInfo"
>) {
  const { onboardResponse, isAdminView } = route.params;
  const [isOpen, setIsOpen] = useState<boolean>(false);

  async function processRequest(p: ProcessOnboardingRequest) {
    try {
      if (!p.stepId) {
        throw new Error("stepId is null or undefined");
      }
      await processOnboardingRequest(p);
      setIsOpen(false);
      // Initial value not used
      let nextScreen: keyof MainStackNavigatorParamList = "LogIn";
      const destinationScreen: keyof MainStackNavigatorParamList =
        "AdminNavigator";
      if (p.approvalResult === AdminApprovalAction.Approve)
        nextScreen = "AdminApproveSuccess";
      else if (p.approvalResult === AdminApprovalAction.Reject)
        nextScreen = "AdminRejectSuccess";
      navigation.reset({
        index: 0,
        routes: [
          { name: nextScreen, params: { destination: destinationScreen } },
        ],
      });
    } catch (error) {
      showApiToastError(error);
    }
  }

  const pendingPointer = onboardResponse.executionPointers.find(
    (v) => v.status === "WaitingForInput"
  );

  return (
    <>
      <HeaderLayout
        headerProps={{
          title: t("Coach details"),
          leftComponent: (
            <TouchableOpacity onPress={() => navigation.goBack()}>
              <LeftArrowIcon />
            </TouchableOpacity>
          ),
          containerStyle: { marginHorizontal: 0 },
        }}
        containerProps={{ marginHorizontal: 16 }}
        isSticky
      >
        <CoachDetails user={onboardResponse} isAdminView={isAdminView} />
      </HeaderLayout>
      <VStack m="4" space="2">
        <Button
          onPress={async () => {
            await processRequest({
              workflowId: onboardResponse.id,
              stepId: pendingPointer?.stepId as AdminStepId,
              approvalResult: AdminApprovalAction.Approve,
            });
          }}
          bg={APPROVE_BUTTON_COLOR}
        >
          {t("Approve")}
        </Button>
        <Button
          bgColor="white"
          _text={{ color: REJECT_BUTTON_COLOR }}
          _pressed={{ bg: "rs.lightBlue" }}
          onPress={() => setIsOpen(true)}
          borderColor={REJECT_BUTTON_COLOR}
          borderWidth="1"
        >
          {t("Reject")}
        </Button>
      </VStack>
      <RejectWithReasonModal
        isOpen={isOpen}
        onClose={() => setIsOpen(false)}
        onPressSubmit={async (text) => {
          await processRequest({
            workflowId: onboardResponse.id,
            stepId: pendingPointer?.stepId as AdminStepId,
            approvalResult: AdminApprovalAction.Reject,
            reasonReject: text,
          });
        }}
        user={onboardResponse.data}
        rejectObject={{ name: "onboarding as a coach" }}
      />
    </>
  );
}
