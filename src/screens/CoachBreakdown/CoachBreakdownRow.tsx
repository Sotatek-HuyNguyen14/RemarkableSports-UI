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
import React, { useState } from "react";
import { RowModel } from ".";
import { ReportCoachResponse } from "../../models/responses/Report";
import { getUserName } from "../../utils/name";

interface CoachBreakdownRowProps {
  report: ReportCoachResponse;
}

export default function CoachBreakdownRow({ report }: CoachBreakdownRowProps) {
  const [isExpand, setIsExpand] = useState(false);

  const profitItem = (profit: number) => {
    if (profit === 0) {
      return (
        <Text flex="0.25" textAlign="center" color="#909090">
          $0
        </Text>
      );
    }

    if (profit > 0) {
      return (
        <Text
          flex="0.25"
          textAlign="center"
          color="#00B812"
        >{`$${profit.toFixed(1)}`}</Text>
      );
    }

    if (profit < 0) {
      return (
        <Text flex="0.25" textAlign="center" color="#E71010">{`($${(
          profit * -1
        ).toFixed(1)})`}</Text>
      );
    }
  };

  return (
    <VStack>
      <HStack alignItems="center" mt="1" py="2" px="defaultLayoutSpacing">
        <Text flex="0.2" textAlign="center">
          {getUserName(report.coach)}
        </Text>

        <Text flex="0.35" textAlign="center">
          {report.workingHour}
        </Text>

        <Text flex="0.2" textAlign="center">
          ${report.salary}
        </Text>

        {profitItem(parseFloat(report.clubProfit))}
      </HStack>

      <Divider />
    </VStack>
  );
}
