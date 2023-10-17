import { NativeStackScreenProps } from "@react-navigation/native-stack";
import {
  Box,
  Button,
  Divider,
  Heading,
  HStack,
  Text,
  Toast,
  useTheme,
  VStack,
} from "native-base";
import React from "react";
import { useForm } from "react-hook-form";
import useSWR from "swr";
import { showApiToastError } from "../../components/ApiToastError";
import RectangleImagePicker from "../../components/ImagePicker/RectangleImagePicker";
import HeaderLayout from "../../components/Layout/HeaderLayout";
import MessageToast, {
  MesssageToastType,
} from "../../components/Toast/MessageToast";
import { useAuth } from "../../hooks/UseAuth";
import {
  EventApplicationStatus,
  PaymentStatus,
} from "../../models/responses/Event";
import { ClubStaff, UserType } from "../../models/User";
import { MainStackNavigatorParamList } from "../../routers/Types";
import { paymentevidence } from "../../services/JoinEventServices";
import { getTranslation } from "../../utils/translation";
import DownArrowIcon from "../../components/Icons/DownArrowIcon";
import PlayerBreakdownRow from "./PlayerBreakdownRow";
import { formatCoreUrl } from "../../services/ServiceUtil";
import { getPlayerReport } from "../../services/ReportServices";
import Loading from "../../components/Loading";
import { ReportPlayerResponse } from "../../models/responses/Report";

export type PlayerBreakdownProps = NativeStackScreenProps<
  MainStackNavigatorParamList,
  "PlayerBreakdown"
>;

const t = getTranslation([
  "screen.ClubScreens.PlayerBreakdown",
  "validation",
  "constant.button",
]);

export default function PlayerBreakdown({
  navigation,
  route,
}: PlayerBreakdownProps) {
  const { space } = useTheme();
  const { user } = useAuth();
  const staff = user as ClubStaff;

  const { data: playerReports, isValidating } = useSWR(
    formatCoreUrl(`club/${staff.club?.id}/player/report`),
    () => {
      if (staff.club?.id) {
        return getPlayerReport({ clubId: staff.club.id });
      }
    }
  );

  const tableHeader = () => {
    const headerStrings = [
      "Player Name",
      "Unpaid",
      "Expenditure",
      "Status",
    ].map((h) => t(h));

    return (
      <VStack space="2">
        <HStack mx="defaultLayoutSpacing" alignItems="center">
          {headerStrings.map((header) => {
            return (
              <Text
                flex="0.25"
                textAlign="center"
                color="#72767C"
                fontSize="sm"
                fontWeight="bold"
              >
                {header}
              </Text>
            );
          })}
        </HStack>
        <Divider />
      </VStack>
    );
  };

  const tableRow = (report: ReportPlayerResponse) => {
    return (
      <PlayerBreakdownRow key={`${JSON.stringify(report)}`} report={report} />
    );
  };

  const tableBody = () => {
    return (
      <VStack>
        {playerReports &&
          playerReports.map((report) => {
            return tableRow(report);
          })}
      </VStack>
    );
  };

  if (isValidating) {
    return <Loading />;
  }

  return (
    <HeaderLayout
      KeyboardAwareScrollViewProps={{
        bounces: false,
      }}
      headerProps={{
        title: t("Player Breakdown"),
        hasBackButton: true,
        headerLabelStyle: { fontSize: 16 },
        containerStyle: {
          alignItems: "center",
          marginLeft: 0,
          marginRight: space.defaultLayoutSpacing,
        },
      }}
      containerProps={{}}
      isSticky
    >
      <VStack py="defaultLayoutSpacing">
        {tableHeader()}
        {tableBody()}
      </VStack>
    </HeaderLayout>
  );
}
