import { Box, HStack, Pressable, Text, VStack } from "native-base";
import React, { useState } from "react";
import { uniqueId } from "lodash";
import {
  ClubCoursePerformanceResponse,
  ClubMonthlySummaryResponse,
} from "../../../models/responses/Club";
import { getTranslation } from "../../../utils/translation";
import DownArrowIcon from "../../../components/Icons/DownArrowIcon";
import UpArrowIcon from "../../../components/Icons/UpArrowIcon";

interface SummaryBreakdownRowProps {
  monthlySummary: ClubMonthlySummaryResponse;
}

const t = getTranslation([
  "screen.ClubScreens.ClubMonthlySummary",
  "component.DateTimePicker",
]);

export default function SummaryBreakdownRow({
  monthlySummary,
}: SummaryBreakdownRowProps) {
  const [isExpand, setIsExpand] = useState(false);

  const newDate = new Date(monthlySummary.toDate);
  const yearString = newDate.getFullYear();
  const monthString = newDate.toDateString().split(" ")[1];

  let totalIncome = 0;
  let totalExpenditure = 0;
  let totalProfit = 0;
  monthlySummary.reports.forEach((course) => {
    totalIncome += course.income;
    totalExpenditure += course.cost;
    totalProfit += course.profit;
  });
  let prefix = "+";
  let bg = "#00B812";
  if (totalIncome === totalExpenditure) {
    bg = "#909090";
    prefix = "";
  }
  if (totalIncome < totalExpenditure) {
    bg = "#E71010";
    prefix = "-";
  }

  const renderExpand = (course: ClubCoursePerformanceResponse) => {
    let exPandPrefix = "+";
    let exPandBg = "#00B812";
    if (course.income === course.cost) {
      exPandBg = "#909090";
      exPandPrefix = "";
    }
    if (course.income < course.cost) {
      exPandBg = "#E71010";
      exPandPrefix = "-";
    }

    return (
      <VStack
        px="defaultLayoutSpacing"
        py="2"
        key={uniqueId()}
        bg="#F5F5F5"
        w="full"
      >
        <HStack w="full" alignItems="center">
          <HStack flex={1} alignItems="center">
            <Box w="3" />
            <Text ml="1" color="rs_secondary.grey" fontSize={12}>
              {course.courseName}
            </Text>
          </HStack>
          <Text
            flex={1}
            textAlign="center"
            color="rs_secondary.grey"
            fontSize={12}
          >
            ${course.income}
          </Text>
          <Text
            flex={1}
            textAlign="center"
            color="rs_secondary.grey"
            fontSize={12}
          >
            ${course.cost}
          </Text>
          <Box
            flex={0.8}
            mx="2"
            p="1"
            alignItems="center"
            justifyContent="center"
          >
            <Text color={exPandBg} textAlign="center" fontSize={12}>
              {`${exPandPrefix}$${Math.abs(course.profit)}`}
            </Text>
          </Box>
        </HStack>
      </VStack>
    );
  };

  return (
    <VStack
      space="2"
      py="2"
      borderBottomWidth={1}
      borderColor="#F3F3F3"
      w="full"
    >
      <HStack w="full" px="defaultLayoutSpacing" alignItems="center">
        <Pressable
          flex={1}
          flexDirection="row"
          alignItems="center"
          onPress={() => {
            if (monthlySummary.reports && monthlySummary.reports.length > 0)
              setIsExpand(!isExpand);
          }}
        >
          {!isExpand && <DownArrowIcon size="3" />}
          {isExpand && <UpArrowIcon size="3" />}
          <Text ml="1" textAlign="center" fontSize={12}>
            {`${t(monthString)} ${yearString}`}
          </Text>
        </Pressable>
        <Text flex={1} textAlign="center" fontSize={12}>
          ${totalIncome}
        </Text>
        <Text flex={1} textAlign="center" fontSize={12}>
          ${totalExpenditure.toFixed(1)}
        </Text>
        <Box flex={0.8} mx="2" p="1" bg={bg} borderRadius="md">
          <Text textAlign="center" color="rs.white" fontSize={12}>
            {`${prefix}$${Math.abs(totalProfit).toFixed(1)}`}
          </Text>
        </Box>
      </HStack>
      <VStack>
        {isExpand &&
          monthlySummary.reports &&
          monthlySummary.reports.length > 0 &&
          monthlySummary.reports.map((course) => renderExpand(course))}
      </VStack>
    </VStack>
  );
}
