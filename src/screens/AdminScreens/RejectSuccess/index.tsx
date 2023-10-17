import { NativeStackScreenProps } from "@react-navigation/native-stack";
import React from "react";
import { MainStackNavigatorParamList } from "../../../routers/Types";
import SuccessMessage from "../../../components/Feedback/SuccessMessage";
import { getTranslation } from "../../../utils/translation";

const t = getTranslation("screen.AdminScreens.RejectSuccess");

export default function AdminRejectSuccess({
  route,
}: NativeStackScreenProps<MainStackNavigatorParamList, "AdminRejectSuccess">) {
  const { destination, nestedDestination } = route.params;

  return (
    <SuccessMessage
      mx="defaultLayoutSpacing"
      destination={destination}
      nestedDestination={nestedDestination}
      headerLabel={t("Rejected!")}
      bodyLabel={t("Applicant will receive the notice now")}
      buttonLabel={t("Back")}
    />
  );
}
