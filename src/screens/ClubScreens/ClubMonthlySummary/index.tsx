import { Text, HStack, Box, VStack, Pressable } from "native-base";
import React, { useCallback, useEffect, useRef, useState } from "react";
import { NativeStackScreenProps } from "@react-navigation/native-stack";
import { uniqueId } from "lodash";
import useSWR from "swr";
import { MainStackNavigatorParamList } from "../../../routers/Types";
import HeaderLayout from "../../../components/Layout/HeaderLayout";
import { getTranslation } from "../../../utils/translation";
import { ClubStaff } from "../../../models/User";
import { formatCoreUrl } from "../../../services/ServiceUtil";
import { useAuth } from "../../../hooks/UseAuth";
import ErrorMessage from "../../../components/ErrorMessage";
import NoDataComponent from "../../../components/NoDataComponent";
import Loading from "../../../components/Loading";
import SummaryBreakdownRow from "./SummaryBreakdownRow";
import { getMonthlySummarys } from "../../../services/ClubServices";

export type ProfileScreenProps = NativeStackScreenProps<
  MainStackNavigatorParamList,
  "ClubMonthlySummary"
>;

const t = getTranslation([
  "screen.ClubScreens.ClubMonthlySummary",
  "component.DateTimePicker",
]);

export function ClubMonthlySummary({ navigation }: ProfileScreenProps) {
  const headers = ["Month", "Income", "Expenditure", "Profit"];
  const { user } = useAuth();
  const staff = user as ClubStaff;

  const {
    data: monthlySummaries,
    isValidating,
    error: monthlySummariesError,
  } = useSWR(
    staff && staff?.club?.id
      ? formatCoreUrl(`/club/${staff.club.id}/monthly-summary`)
      : null,
    () => {
      if (staff && staff?.club?.id) {
        return getMonthlySummarys(staff?.club?.id);
      }
      return undefined;
    }
  );

  return (
    <HeaderLayout
      KeyboardAwareScrollViewProps={{
        bounces: false,
      }}
      headerProps={{
        title: t("Monthly Summary"),
        containerStyle: {
          marginHorizontal: 0,
        },
      }}
      isSticky
    >
      <VStack space={1} py="defaultLayoutSpacing">
        <HStack
          w="full"
          borderBottomWidth={1}
          borderColor="#F3F3F3"
          py="2"
          px="defaultLayoutSpacing"
        >
          {headers.map((text) => (
            <Text
              key={text}
              flex={1}
              color="#72767C"
              fontWeight="bold"
              fontSize={12}
              textAlign="center"
            >
              {t(text)}
            </Text>
          ))}
        </HStack>
        {isValidating && !monthlySummaries && <Loading />}
        {!isValidating && monthlySummariesError && <ErrorMessage />}
        {!monthlySummariesError &&
          !!monthlySummaries &&
          Array.isArray(monthlySummaries) &&
          monthlySummaries.length > 0 &&
          monthlySummaries.map((monthlySummary) => (
            <SummaryBreakdownRow
              monthlySummary={monthlySummary}
              key={uniqueId()}
            />
          ))}
        {!isValidating &&
          !monthlySummariesError &&
          (!monthlySummaries ||
            !Array.isArray(monthlySummaries) ||
            !monthlySummaries?.length) && <NoDataComponent />}
      </VStack>
    </HeaderLayout>
  );
}
