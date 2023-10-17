import React from "react";
import { Heading, HStack, VStack, Text } from "native-base";
import { NativeStackScreenProps } from "@react-navigation/native-stack";

import SuccessMessage from "../../../components/Feedback/SuccessMessage";
import CourseCard from "../../../components/Card/CourseCard";
import { MainStackNavigatorParamList } from "../../../routers/Types";
import { getTranslation } from "../../../utils/translation";
import CalendarIcon from "../../../components/Icons/CalendarIcon";
import FlagIcon from "../../../components/Icons/FlagIcon";

const t = getTranslation("screen.PlayerScreens.CourseApplySuccess");

export default function PlayerCourseApplySuccess({
  route,
}: NativeStackScreenProps<
  MainStackNavigatorParamList,
  "PlayerCourseApplySuccess"
>) {
  const {
    destination,
    nestedDestination,
    course,
    upnextSession,
    numberOfSessions,
  } = route.params;

  const footer = (): JSX.Element => {
    if (upnextSession) {
      return (
        <VStack space="2">
          <Heading>{t("Upcomming session")}</Heading>
          <HStack space="2">
            <CalendarIcon />
            <Text>{upnextSession}</Text>
          </HStack>
          <Heading>{t("Number of applied sessions")}</Heading>
          <HStack space="2">
            <FlagIcon />
            <Text>{numberOfSessions}</Text>
          </HStack>
        </VStack>
      );
    }
    return <VStack />;
  };
  return (
    <SuccessMessage
      mx="defaultLayoutSpacing"
      headerLabel={t("Successful Applied")}
      buttonLabel={t("OK")}
      destination={destination}
      nestedDestination={nestedDestination}
    >
      <Heading mb="5">{t("Applied details")}</Heading>
      <CourseCard course={course} footer={footer()} />
    </SuccessMessage>
  );
}
