import { NativeStackScreenProps } from "@react-navigation/native-stack";
import React from "react";
import { MainStackNavigatorParamList } from "../../../routers/Types";
import SuccessMessage from "../../../components/Feedback/SuccessMessage";
import { getTranslation } from "../../../utils/translation";

const t = getTranslation([
  "screen.AdminScreens.ApproveSuccess",
  "constant.button",
]);

export default function AdminApproveSuccess({
  route,
}: NativeStackScreenProps<MainStackNavigatorParamList, "AdminApproveSuccess">) {
  const { destination, nestedDestination } = route.params;

  return (
    <SuccessMessage
      mx="defaultLayoutSpacing"
      destination={destination}
      nestedDestination={nestedDestination}
      headerLabel={t("Confirmed!")}
      bodyLabel={t("Applicant will received the notice now")}
      buttonLabel={t("Back")}
    />
  );
}
