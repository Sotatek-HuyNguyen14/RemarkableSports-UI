import React, { useState } from "react";
import useSWR from "swr";
import {
  useTheme,
  VStack,
  Button,
  Toast,
  Heading,
  Image,
  HStack,
  Text,
  Pressable,
} from "native-base";
import { NativeStackScreenProps } from "@react-navigation/native-stack";

import { useForm } from "react-hook-form";
import { MainStackNavigatorParamList } from "../../routers/Types";
import { formatFileUrl, formatMeetupApiUrl } from "../../services/ServiceUtil";
import {
  deleteVenueBooking,
  getVenueBookingById,
} from "../../services/VenueBookingServices";
import HeaderLayout from "../../components/Layout/HeaderLayout";
import Loading from "../../components/Loading";
import ErrorMessage from "../../components/ErrorMessage";
import { getTranslation } from "../../utils/translation";
import { VenueBooking, VenueBookingStatus } from "../../models/Booking";
import MessageToast, {
  MesssageToastType,
} from "../../components/Toast/MessageToast";
import { showApiToastError } from "../../components/ApiToastError";
import ConfirmationModal from "../../components/ConfirmationModal/ConfirmationModal";
import { SCREEN_WIDTH } from "../../constants/constants";
import ImageDirectory from "../../assets";
import LocationIcon from "../../components/Icons/LocationIcon";
import { formatUtcToLocalDate, formatUtcToLocalTime } from "../../utils/date";
import RectangleBlueCheckIcon from "../../components/Icons/RectangleBlueCheckIcon";
import ChooseIcon from "../../components/Icons/ChooseIcon";
import EmptyBoxIcon from "../../components/Icons/EmptyBoxIcon";
import FormInput from "../../components/FormInput/FormInput";

type BookingAdditionalInformationScreenProps = NativeStackScreenProps<
  MainStackNavigatorParamList,
  "BookingAdditionalInformation"
>;

const t = getTranslation([
  "constant.district",
  "screen.PlayerScreens.BookingAdditionalInformations",
  "constant.button",
  "screen.BookingRecords",
  "constant.district",
  "component.BookingAdditionalInformations",
  "screen.PlayerScreens.VenueBookingDetails",
]);

interface FormValue {
  remark: string;
}

export enum VenueBookingGroup {
  GroupBooking = "GroupBooking",
  PublicCourse = "PublicCourse",
  PrivateCourse = "PrivateCourse",
  PersonalCoach = "PersonalCoach",
  Event = "Event",
  Others = "Others",
}

export default function BookingAdditionalInformation({
  route,
  navigation,
}: BookingAdditionalInformationScreenProps) {
  const { space } = useTheme();
  const {
    control,
    handleSubmit,
    formState: { isValid, isSubmitting },
    watch,
    setValue,
    trigger,
    reset,
  } = useForm<FormValue>({
    mode: "onChange",
  });

  const [groups, setGroups] = useState([
    {
      title: "Group Booking",
      value: VenueBookingGroup.GroupBooking,
      selected: false,
    },
    {
      title: "Public Course",
      selected: false,
      value: VenueBookingGroup.PublicCourse,
    },
    {
      title: "Private Course",
      selected: false,
      value: VenueBookingGroup.PrivateCourse,
    },
    {
      title: "Personal Coach",
      selected: false,
      value: VenueBookingGroup.PersonalCoach,
    },
    { title: "Event", selected: false, value: VenueBookingGroup.Event },
    { title: "Others", selected: false, value: VenueBookingGroup.Others },
  ]);

  const remarks = watch("remark");
  return (
    <HeaderLayout
      isSticky
      headerProps={{
        title: t("Additional Information"),
        rightComponent: (
          <Pressable
            onPress={() => {
              navigation.navigate("ConfirmVenueBooking", {
                venue: route.params.venue,
                bookingModel: route.params.bookingModel,
              });
            }}
          >
            <Text mr="2" fontSize="md" color="rs.primary_purple">
              {t("Skip")}
            </Text>
          </Pressable>
        ),
      }}
    >
      <VStack space="4" mx="defaultLayoutSpacing">
        <Heading>{t("Booking for")}</Heading>
        <VStack space="3" mt="2">
          {groups.map((g) => {
            return (
              <Pressable
                key={g.value}
                onPress={() => {
                  const newGroups = groups.map((group) => {
                    if (group.value === g.value) {
                      return { ...group, selected: !g.selected };
                    }
                    return { ...group, selected: false };
                  });
                  setGroups(newGroups);
                }}
              >
                <HStack space="3" alignItems="center">
                  {g.selected ? (
                    <RectangleBlueCheckIcon fill="#66CEE1" />
                  ) : (
                    <EmptyBoxIcon />
                  )}
                  <Text>{t(g.value)}</Text>
                </HStack>
              </Pressable>
            );
          })}
        </VStack>
        <Heading>{t("Remarks")}</Heading>
        <FormInput
          label={t("Remarks")}
          isShowWords
          controllerProps={{
            name: "remark",
            control,
          }}
        />
      </VStack>
      <VStack mt="auto" mx="defaultLayoutSpacing">
        <Button
          onPress={() => {
            navigation.navigate("ConfirmVenueBooking", {
              venue: route.params.venue,
              bookingModel: route.params.bookingModel,
              group: groups.find((g) => g.selected)?.value,
              remarks,
            });
          }}
        >
          {t("Next")}
        </Button>
      </VStack>
    </HeaderLayout>
  );
}
