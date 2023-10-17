import React from "react";
import SuccessMessage from "../../../components/Feedback/SuccessMessage";
import { getTranslation } from "../../../utils/translation";

const t = getTranslation("screen.ClubScreens.RejectedVenueBooking");

export default function RejectedVenueBooking() {
  return (
    <SuccessMessage
      mx="defaultLayoutSpacing"
      headerLabel={t("Rejected")}
      bodyLabel={t("Applicant will recieved the notice now")}
      buttonLabel={t("Back")}
      destination="ClubNavigator"
      nestedDestination="ClubManage"
    />
  );
}
