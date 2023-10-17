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
import React, { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { LayoutAnimation } from "react-native";
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
import CoachBreakdownRow from "./CoachBreakdownRow";
import GhostTabbar from "../../components/GhostTabBar";
import FormInput from "../../components/FormInput/FormInput";
import SingleSelectModal from "../../components/Modal/SingleSelectModal";
import { formatUtcToLocalDate } from "../../utils/date";
import { formatCoreUrl } from "../../services/ServiceUtil";
import { getCoachReports } from "../../services/ReportServices";
import { ReportCoachResponse } from "../../models/responses/Report";

export type CoachBreakdownProps = NativeStackScreenProps<
  MainStackNavigatorParamList,
  "CoachBreakdown"
>;

export interface RowModel {
  name: string;
  unpaid: string;
  expenditure: string;
  status: string;
}

const t = getTranslation([
  "screen.ClubScreens.CoachBreakdown",
  "validation",
  "constant.button",
]);

interface FormValue {
  selectedDate: string;
  selectedDateText: string;
}

const monthNames = [
  "January",
  "February",
  "March",
  "April",
  "May",
  "June",
  "July",
  "August",
  "September",
  "October",
  "November",
  "December",
];

const dateOptions = () => {
  const result: { label: string; value: string }[] = [];

  for (
    let d = new Date();
    d >= new Date(new Date().setFullYear(new Date().getFullYear() - 2));
    d.setMonth(d.getMonth() - 1)
  ) {
    result.push({
      label: `${monthNames[d.getMonth()]} ${d.getFullYear()}`,
      value: d.toString(),
    });
  }
  return result;
};

export default function CoachBreakdown({
  navigation,
  route,
}: CoachBreakdownProps) {
  const { space } = useTheme();
  const { user } = useAuth();
  const {
    control,
    handleSubmit,
    formState: { isValid, isSubmitting, isDirty },
    watch,
    setValue,
    resetField,
    trigger,
    reset,
  } = useForm<FormValue>({
    mode: "onChange",
    defaultValues: {
      selectedDate: dateOptions()[0].value,
    },
  });
  const staff = user as ClubStaff;
  const selectedDate = watch("selectedDate");
  const { data: coachReports, mutate } = useSWR(
    formatCoreUrl(`club/${staff.club?.id}/coach/report`),
    () => {
      if (staff.club?.id) {
        const selected = new Date(selectedDate);
        const firstDay = new Date(
          selected.getFullYear(),
          selected.getMonth(),
          1
        );
        const lastDay = new Date(
          selected.getFullYear(),
          selected.getMonth() + 1,
          0
        );
        return getCoachReports({
          clubId: staff.club.id,
          startDate: formatUtcToLocalDate(firstDay),
          endDate: formatUtcToLocalDate(lastDay),
        });
      }
    }
  );
  useEffect(() => {
    if (selectedDate) {
      setValue(
        "selectedDateText",
        `${monthNames[new Date(selectedDate).getMonth()]} ${new Date(
          selectedDate
        ).getFullYear()}`
      );
      mutate();
    } else {
      setValue("selectedDateText", "");
    }
  });

  const [datePickerOpen, setDatePickerOpen] = useState(false);

  const datePicker = () => {
    return (
      <FormInput
        label={t("Month")}
        controllerProps={{
          name: "selectedDateText",
          control,
        }}
        inputProps={{
          editable: false,
          InputRightElement: <DownArrowIcon mr="4" alignSelf="center" />,
        }}
        onPress={() => {
          setDatePickerOpen(true);
        }}
      />
    );
  };

  const tableHeader = () => {
    const headerStrings = ["Coach", "Working Hours", "Salary", "Club Profit"];

    return (
      <VStack space="2">
        <HStack mx="defaultLayoutSpacing" alignItems="center">
          {headerStrings.map((header) => {
            return (
              <Text
                flex={
                  header === "Working Hours"
                    ? "0.35"
                    : header === "Club Profit"
                    ? "0.25"
                    : "0.2"
                }
                textAlign="center"
                color="#72767C"
                fontSize="sm"
                fontWeight="bold"
              >
                {t(header)}
              </Text>
            );
          })}
        </HStack>
        <Divider />
      </VStack>
    );
  };

  const tableRow = (report: ReportCoachResponse) => {
    return <CoachBreakdownRow report={report} />;
  };

  const tableFooter = () => {
    const totalItem = (total: number) => {
      const text =
        total > 0
          ? `+$${total.toFixed(1)}`
          : total < 0
          ? `($${(total * -1).toFixed(1)})`
          : "$0";
      const bg =
        total > 0 ? "#00B812" : total < 0 ? "rs_secondary.error" : "#909090";
      return (
        <HStack
          justifyContent="center"
          alignItems="center"
          bg={bg}
          px="2"
          py="1"
          borderRadius="md"
          alignSelf="center"
        >
          <Text fontWeight="bold" color="rs.white">
            {text}
          </Text>
        </HStack>
      );
    };

    const allReports = coachReports || [];
    let totalWorkingHour = 0;
    let totalSalary = 0;
    let totalProfit = 0;
    allReports.forEach((report) => {
      totalWorkingHour += parseFloat(report.workingHour);
      totalSalary += parseInt(report.salary, 10);
      totalProfit += parseFloat(report.clubProfit);
    });
    return (
      <HStack
        bg="#66CEE133"
        alignItems="center"
        py="2"
        px="defaultLayoutSpacing"
      >
        <Text textAlign="center" flex="0.2" fontWeight="bold">
          {t("Sub Total")}
        </Text>
        <Text textAlign="center" flex="0.35" fontWeight="bold">
          {totalWorkingHour}
        </Text>
        <Text textAlign="center" flex="0.2" fontWeight="bold">
          ${totalSalary}
        </Text>
        <HStack justifyContent="center" alignItems="center" flex="0.25">
          {totalItem(totalProfit)}
        </HStack>
      </HStack>
    );
  };

  const tableBody = () => {
    return (
      <VStack>
        {coachReports &&
          coachReports.map((row) => {
            return tableRow(row);
          })}
      </VStack>
    );
  };

  return (
    <HeaderLayout
      KeyboardAwareScrollViewProps={{
        bounces: false,
      }}
      headerProps={{
        title: t("Coach Performance"),
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
      <VStack mx="defaultLayoutSpacing">{datePicker()}</VStack>
      <VStack mt="6">
        {tableHeader()}
        {tableBody()}
        {tableFooter()}
      </VStack>
      <SingleSelectModal
        defaultIndex={0}
        isOpen={datePickerOpen}
        onClose={() => {
          setDatePickerOpen(false);
        }}
        title={t("Select date")}
        options={dateOptions()}
        controllerProps={{
          name: "selectedDate",
          control,
        }}
        confirmButtonText={t("Save")}
      />
    </HeaderLayout>
  );
}
