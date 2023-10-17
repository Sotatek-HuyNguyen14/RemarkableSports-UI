import React from "react";
import { Heading } from "native-base";
import { NativeStackScreenProps } from "@react-navigation/native-stack";

import SuccessMessage from "../../../components/Feedback/SuccessMessage";
import CourseCard from "../../../components/Card/CourseCard";
import { MainStackNavigatorParamList } from "../../../routers/Types";
import { getTranslation } from "../../../utils/translation";

const t = getTranslation("screen.PlayerScreens.CourseRejectSuccess");

export default function PlayerCourseRejectSuccess({
  route,
}: NativeStackScreenProps<
  MainStackNavigatorParamList,
  "PlayerCourseRejectSuccess"
>) {
  const { destination, nestedDestination, course } = route.params;

  return (
    <SuccessMessage
      mx="defaultLayoutSpacing"
      headerLabel={t("Successful Rejected")}
      buttonLabel={t("OK")}
      destination={destination}
      nestedDestination={nestedDestination}
    >
      <Heading mb="5">{t("Reject details")}</Heading>
      <CourseCard course={course} />
    </SuccessMessage>
  );
}
