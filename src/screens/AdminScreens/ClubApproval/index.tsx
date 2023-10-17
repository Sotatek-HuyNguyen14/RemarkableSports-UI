import { NativeStackScreenProps } from "@react-navigation/native-stack";
import { Button, Pressable, VStack } from "native-base";
import React, { useState } from "react";
import { showApiToastError } from "../../../components/ApiToastError";
import ClubDetails from "../../../components/Club/ClubDetails";
import LeftArrowIcon from "../../../components/Icons/LeftArrowIcon";
import HeaderLayout from "../../../components/Layout/HeaderLayout";
import RejectWithReasonModal from "../../../components/Modal/RejectWithReasonModal";
import { useAuth } from "../../../hooks/UseAuth";
import { AdminApprovalAction } from "../../../models/Request";
import { ApprovalClubRequest } from "../../../models/requests/Club";
import { Role, UserType } from "../../../models/User";
import { MainStackNavigatorParamList } from "../../../routers/Types";
import { approvalClub } from "../../../services/ClubServices";
import { getTranslation } from "../../../utils/translation";
import {
  APPROVE_BUTTON_COLOR,
  REJECT_BUTTON_COLOR,
} from "../../../constants/constants";

const t = getTranslation([
  "screen.AdminScreens.ClubApproval",
  "constant.button",
]);

export default function ClubApproval({
  route,
  navigation,
}: NativeStackScreenProps<MainStackNavigatorParamList, "AdminClubApproval">) {
  const { clubResponse } = route.params;
  const [isOpen, setIsOpen] = useState<boolean>(false);
  const { user } = useAuth();

  async function processRequest(formatValue: ApprovalClubRequest) {
    try {
      await approvalClub(formatValue);
      setIsOpen(false);
      // Initial value not used
      let nextScreen: keyof MainStackNavigatorParamList = "LogIn";
      const destinationScreen: keyof MainStackNavigatorParamList =
        "AdminNavigator";
      if (formatValue.parameters.isApprove) nextScreen = "AdminApproveSuccess";
      else nextScreen = "AdminRejectSuccess";
      navigation.reset({
        index: 0,
        routes: [
          {
            name: nextScreen,
            params: {
              destination: destinationScreen,
              nestedDestination: "AdminClub",
            },
          },
        ],
      });
    } catch (error) {
      showApiToastError(error);
    }
  }

  return (
    <>
      <HeaderLayout
        headerProps={{
          title: t("Club details"),
          containerStyle: { marginHorizontal: 0 },
        }}
        isSticky
      >
        <ClubDetails club={clubResponse} type="details" />
      </HeaderLayout>
      {user?.role.some((r) => r === Role.Admin) && (
        <VStack m="4" space="2" mb="10">
          <Button
            onPress={async () => {
              await processRequest({
                id: clubResponse.id,
                parameters: {
                  isApprove: true,
                  rejectReason: AdminApprovalAction.Approve,
                },
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
            borderWidth="1"
            borderColor={REJECT_BUTTON_COLOR}
            onPress={() => setIsOpen(true)}
          >
            {t("Reject")}
          </Button>
        </VStack>
      )}
      <RejectWithReasonModal
        isOpen={isOpen}
        onClose={() => setIsOpen(false)}
        onPressSubmit={async (text) => {
          await processRequest({
            id: clubResponse.id,
            parameters: {
              isApprove: false,
              rejectReason: text || AdminApprovalAction.Reject,
            },
          });
        }}
        club={clubResponse}
        rejectObject={{ name: "" }}
      />
    </>
  );
}
