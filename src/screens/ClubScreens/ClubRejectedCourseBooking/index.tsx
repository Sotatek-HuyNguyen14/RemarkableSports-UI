import React from "react";
import SuccessMessage from "../../../components/Feedback/SuccessMessage";
import { getTranslation } from "../../../utils/translation";

const t = getTranslation("screen.ClubScreens.ClubApprovedCourseBooking");

export default function ClubRejectedCourseBooking() {
  return (
    <SuccessMessage
      mx="defaultLayoutSpacing"
      headerLabel={t("Rejected")}
      bodyLabel={t("Applicant will received the notice now")}
      buttonLabel={t("Back")}
      destination="ClubNavigator"
    />
  );
}
