import { RouteProp } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import React from "react";
import SuccessMessage from "../../../components/Feedback/SuccessMessage";
import { MainStackNavigatorParamList } from "../../../routers/Types";
import { getTranslation } from "../../../utils/translation";

const t = getTranslation("screen.ClubScreens.ClubApprovedCourseBooking");

export type ClubApprovedCourseBookingNavigationProp = NativeStackNavigationProp<
  MainStackNavigatorParamList,
  "ClubApprovedCourseBooking"
>;

export type ClubApprovedCourseBookingRouteProp = RouteProp<
  MainStackNavigatorParamList,
  "ClubApprovedCourseBooking"
>;

interface ClubApprovedCourseBookingProps {
  navigation: ClubApprovedCourseBookingNavigationProp;
  route: ClubApprovedCourseBookingRouteProp;
}

export default function ClubApprovedCourseBooking({
  route,
}: ClubApprovedCourseBookingProps) {
  return (
    <SuccessMessage
      mx="defaultLayoutSpacing"
      destination="ClubNavigator"
      headerLabel={t("Approved")}
      bodyLabel={t("Applicant will received the notice now")}
      buttonLabel={t("Back")}
    />
  );
}
