import {
  Box,
  Button,
  Divider,
  Heading,
  HStack,
  Pressable,
  Text,
  Toast,
  useTheme,
  VStack,
} from "native-base";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import React, { useState } from "react";
import { useNavigation } from "@react-navigation/native";
import DownArrowIcon from "../../components/Icons/DownArrowIcon";
import UpArrowIcon from "../../components/Icons/UpArrowIcon";
import {
  ReportCourseSessionStatus,
  ReportPlayerResponse,
  ReportStatus,
} from "../../models/responses/Report";
import { getUserName } from "../../utils/name";
import { getTranslation } from "../../utils/translation";
import { MainStackNavigatorParamList } from "../../routers/Types";

interface PlayerBreakdownRowProps {
  report: ReportPlayerResponse;
}

const t = getTranslation("screen.ClubScreens.PlayerBreakdown");

export default function PlayerBreakdownRow({
  report,
}: PlayerBreakdownRowProps) {
  const [isExpand, setIsExpand] = useState(false);
  const displayName = getUserName(report.player);
  const navigation: NativeStackNavigationProp<MainStackNavigatorParamList> =
    useNavigation();

  const statusItem = (status: ReportStatus, opacity = "1") => {
    const bg = status === ReportStatus.Active ? "#00B812" : "#BABABA";
    return (
      <HStack
        justifyContent="center"
        alignItems="center"
        style={{ width: 70 }}
        bg={bg}
        px="2"
        py="1"
        borderRadius="md"
        opacity={opacity}
        alignSelf="center"
        ml="3"
      >
        <Text color="rs.white">{t(`Player${status}`)}</Text>
      </HStack>
    );
  };

  const expendedItems = () => {
    return (
      <VStack bg="#F5F5F5" space="0">
        {report.courses &&
          report.courses.map((reportCourse, index) => {
            const bg =
              reportCourse.courseSessionStatus ===
              ReportCourseSessionStatus.Active
                ? "#00B812"
                : "#BABABA";
            return (
              <Pressable
                onPress={() => {
                  navigation.navigate("ManageCourse", {
                    courseId: reportCourse.course.id,
                  });
                }}
              >
                <HStack
                  key={reportCourse.course.id}
                  alignItems="center"
                  mt="1"
                  py="2"
                  bg="#F5F5F5"
                  px="defaultLayoutSpacing"
                >
                  <Text flex="0.25" textAlign="center" color="#6D6D6D">
                    {reportCourse.course.name}
                  </Text>

                  <Text flex="0.25" textAlign="center" color="#6D6D6D">
                    ${reportCourse.outstandingAmout}
                  </Text>

                  <Text flex="0.25" textAlign="center" color="#6D6D6D">
                    ${reportCourse.expenditure}
                  </Text>

                  <Text flex="0.25" textAlign="center" color={bg}>
                    {t(`Course${reportCourse.courseSessionStatus}`)}
                  </Text>
                </HStack>
              </Pressable>
            );
          })}
      </VStack>
    );
  };

  let totalUnpaid = 0;
  let totalExpenditure = 0;
  report.courses.forEach((course) => {
    totalUnpaid += parseInt(course.outstandingAmout, 10);
    totalExpenditure += parseInt(course.expenditure, 10);
  });

  return (
    <VStack>
      <HStack
        alignItems="center"
        mt="1"
        py="2"
        px="defaultLayoutSpacing"
        ml="2"
      >
        <Pressable
          flex="0.25"
          onPress={() => {
            setIsExpand(!isExpand);
          }}
        >
          <HStack flex="1" space="2" alignItems="center">
            {!isExpand ? (
              <DownArrowIcon size="xs" />
            ) : (
              <UpArrowIcon size="xs" />
            )}
            <Text>{displayName}</Text>
          </HStack>
        </Pressable>

        <Text textAlign="center" flex="0.25">
          ${totalUnpaid}
        </Text>

        <Text textAlign="center" flex="0.25">
          ${totalExpenditure}
        </Text>

        <HStack flex="0.25">{statusItem(report.status)}</HStack>
      </HStack>

      {isExpand && expendedItems()}
      <Divider />
    </VStack>
  );
}
