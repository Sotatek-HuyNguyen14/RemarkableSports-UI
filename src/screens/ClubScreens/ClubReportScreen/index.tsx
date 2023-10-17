import { Text, HStack, Badge, Box, VStack, Heading, Center } from "native-base";
import React, { useRef, useState } from "react";
import { NativeStackScreenProps } from "@react-navigation/native-stack";
import { uniqueId } from "lodash";
import { CompositeScreenProps } from "@react-navigation/native";
import {
  ClubBottomTabNavigatorParamList,
  MainStackNavigatorParamList,
} from "../../../routers/Types";
import HeaderLayout from "../../../components/Layout/HeaderLayout";
import { getTranslation } from "../../../utils/translation";
import Card from "../../../components/Card/Card";
import { useAuth } from "../../../hooks/UseAuth";
import { ClubStaff, UserType } from "../../../models/User";

export type ProfileScreenProps = CompositeScreenProps<
  NativeStackScreenProps<MainStackNavigatorParamList>,
  NativeStackScreenProps<ClubBottomTabNavigatorParamList, "ClubReportScreen">
>;

const t = getTranslation("screen.ClubScreens.ClubReportScreen");

function ReportScreen({ navigation }: ProfileScreenProps) {
  const { user } = useAuth();
  const staff = user as ClubStaff;

  const TAB_ITEMS = [
    {
      title: "Monthly Summary",
      onPress: () => {
        navigation.navigate("ClubMonthlySummary");
      },
    },
    {
      title: "Coach Performance",
      onPress: () => {
        navigation.navigate("CoachBreakdown");
      },
    },
    {
      title: "Player Breakdown",
      onPress: () => {
        navigation.navigate("PlayerBreakdown");
      },
    },
    {
      title: "Course Performance",
      onPress: () => {
        navigation.navigate("ClubCoursePerformance");
      },
    },
  ];

  const renderItem = ({
    tab,
    index,
  }: {
    tab: { title: string; onPress?: () => void };
    index: number;
  }) => {
    return (
      <Card
        onPress={tab?.onPress}
        containerProps={{ borderRadius: "xl" }}
        key={uniqueId()}
        body={
          <VStack p="0.5" justifyContent="center">
            <Text
              fontSize={20}
              color="rs.primary_purple"
              fontWeight={700}
              textAlign="center"
            >
              {t(tab.title)}
            </Text>
          </VStack>
        }
      />
    );
  };

  return (
    <HeaderLayout
      KeyboardAwareScrollViewProps={{
        bounces: false,
      }}
      headerProps={{
        hasBackButton: false,
        title: t("Report"),
      }}
      isSticky
    >
      <VStack space={4} p="defaultLayoutSpacing">
        {user?.userType === UserType.ClubStaff &&
          staff.club &&
          staff.applyClubStatus === "Approved" &&
          TAB_ITEMS &&
          Array.isArray(TAB_ITEMS) &&
          TAB_ITEMS.length > 0 &&
          TAB_ITEMS.map((tab, index) => renderItem({ tab, index }))}

        {(user?.userType !== UserType.ClubStaff ||
          !staff.club ||
          staff.applyClubStatus !== "Approved") && (
          <VStack flex="1" justifyContent="center" alignItems="center">
            <Text>{t("No permissions")}</Text>
          </VStack>
        )}
      </VStack>
    </HeaderLayout>
  );
}
export default ReportScreen;
