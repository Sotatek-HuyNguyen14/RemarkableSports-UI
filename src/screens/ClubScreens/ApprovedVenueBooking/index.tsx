import React from "react";
import SuccessMessage from "../../../components/Feedback/SuccessMessage";
import { getTranslation } from "../../../utils/translation";

const t = getTranslation("screen.ClubScreens.ApproveSuccessRequestVenue");

export default function ApprovedVenueBooking() {
  return (
    <SuccessMessage
      mx="defaultLayoutSpacing"
      headerLabel={t("Approved")}
      bodyLabel={t("Insert VenueCard Here")}
      buttonLabel={t("Back")}
      destination="ClubNavigator"
      nestedDestination="ClubManage"
    />
  );
}
