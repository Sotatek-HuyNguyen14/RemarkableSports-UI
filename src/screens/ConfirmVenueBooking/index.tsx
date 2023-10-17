/* eslint-disable no-param-reassign */
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
  Badge,
  Avatar,
} from "native-base";
import { NativeStackScreenProps } from "@react-navigation/native-stack";

import { useForm } from "react-hook-form";
import { MainStackNavigatorParamList } from "../../routers/Types";
import { formatFileUrl, formatMeetupApiUrl } from "../../services/ServiceUtil";
import {
  bookVenueV2,
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
import {
  format24HTo12H,
  formatUtcToLocalDate,
  formatUtcToLocalTime,
} from "../../utils/date";
import RectangleBlueCheckIcon from "../../components/Icons/RectangleBlueCheckIcon";
import ChooseIcon from "../../components/Icons/ChooseIcon";
import EmptyBoxIcon from "../../components/Icons/EmptyBoxIcon";
import FormInput from "../../components/FormInput/FormInput";
import { Venue } from "../../models/requests/Venue";

type BookingAdditionalInformationScreenProps = NativeStackScreenProps<
  MainStackNavigatorParamList,
  "ConfirmVenueBooking"
>;

const t = getTranslation([
  "constant.district",
  "screen.BookVenue",
  "constant.button",
  "screen.BookingRecords",
  "constant.district",
  "component.BookingAdditionalInformations",
  "screen.PlayerScreens.VenueBookingDetails",
  "component.VenueBookingDetails",
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

export default function ConfirmVenueBooking({
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
      selected: true,
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

  const { bookingModel, group, remarks, venue: v } = route.params;
  const [confirmModal, setConfirmModal] = useState(false);

  const bookingDetails = (venue: Venue) => {
    return (
      <VStack mt="5" space="3">
        <Heading>{venue.name}</Heading>
        {/* Club info */}

        {venue?.club && (
          <HStack justifyContent="center" space="2" alignItems="center">
            <Avatar
              size="sm"
              source={
                venue.club.profilePictureUrl
                  ? {
                      uri: formatFileUrl(venue.club.profilePictureUrl),
                    }
                  : undefined
              }
            >
              Avatar
            </Avatar>
            <VStack flex="1" space="2">
              <Text fontSize="md" fontWeight="bold">
                {venue.club.name}
              </Text>
              <Pressable
                onPress={() => {
                  if (venue.club) {
                    navigation.navigate("AdminClubApproval", {
                      clubResponse: {
                        ...venue.club,
                      },
                    });
                  }
                }}
              >
                <Text fontSize="md" color="rs.primary_purple" fontWeight="bold">
                  {t("View Profile")}
                </Text>
              </Pressable>
            </VStack>
          </HStack>
        )}
        <Heading fontSize="md" mt="3">
          {t("Address")}
        </Heading>
        <HStack alignItems="flex-start" space="3">
          <VStack alignItems="flex-start">
            <Text fontSize="md">{t(venue.district)}</Text>
            <Text fontSize="md">{venue.address}</Text>
          </VStack>
        </HStack>

        <Heading fontSize="md" mt="3">
          {t("Enquiry Phone No")}
        </Heading>
        <HStack alignItems="center" space="3">
          <Text fontSize="md">{venue.phoneNo}</Text>
        </HStack>

        <Heading fontSize="md" mt="3">
          {t("Selected Date")}
        </Heading>
        <HStack alignItems="center" space="3">
          <Text fontSize="md">{route.params.bookingModel.date}</Text>
        </HStack>

        <Heading fontSize="md" mt="3">
          {t("Selected Time Slot")}
        </Heading>
        <VStack justifyContent="center" space="3">
          {Array(venue.numberOfTables)
            .fill(0)
            .map((value, index) => index)
            .map((value, index) => value + 1)
            .map((value, index) => {
              const selectedTimeSlot = bookingModel.bookingTime.slots.find(
                (s) => s.id === value
              );
              if (selectedTimeSlot) {
                const startTime = selectedTimeSlot.timeslots[0].value
                  .trim()
                  .split("-")[0];
                const endTime = selectedTimeSlot.timeslots[
                  selectedTimeSlot.timeslots.length - 1
                ].value
                  .trim()
                  .split("-")[1];
                return (
                  <Text fontSize="md">{`Slot ${value}      ${format24HTo12H(
                    startTime.trim()
                  )} - ${format24HTo12H(endTime.trim())}`}</Text>
                );
              }
              return <Text fontSize="md">{`Slot ${value}      -`}</Text>;
            })}
        </VStack>
        {/* <HStack alignItems="center" space="3">
          <Text fontSize="md">
            {formatUtcToLocalTime(fromTime)} - {formatUtcToLocalTime(toTime)}
          </Text>
        </HStack> */}

        {route.params.remarks && (
          <>
            <Heading fontSize="md" mt="3">
              {t("Remarks")}
            </Heading>
            <VStack justifyContent="center" space="3">
              <Text fontSize="md">{route.params.remarks}</Text>
            </VStack>
          </>
        )}
        {group && (
          <Badge
            borderColor={
              group === VenueBookingGroup.GroupBooking
                ? "#E08700"
                : group === VenueBookingGroup.PublicCourse
                ? "#66CEE1"
                : group === VenueBookingGroup.PrivateCourse
                ? "#31095E"
                : group === VenueBookingGroup.PersonalCoach
                ? "#00B812"
                : group === VenueBookingGroup.Event
                ? "#003FE0"
                : "#704848"
            }
            variant="outline"
            bg={
              group === VenueBookingGroup.GroupBooking
                ? "#E08700"
                : group === VenueBookingGroup.PublicCourse
                ? "#66CEE1"
                : group === VenueBookingGroup.PrivateCourse
                ? "#31095E"
                : group === VenueBookingGroup.PersonalCoach
                ? "#00B812"
                : group === VenueBookingGroup.Event
                ? "#003FE0"
                : "#704848"
            }
            _text={{ color: "white", fontSize: 14, fontWeight: "bold" }}
            m={1}
            minW="30"
            maxW="32"
            p="1"
            px="1"
            borderRadius="full"
          >
            {t(group)}
          </Badge>
        )}
      </VStack>
    );
  };

  return (
    <HeaderLayout
      isSticky
      headerProps={{
        title: t("Confirm Booking"),
      }}
    >
      <VStack flex="1" space="4" mx="defaultLayoutSpacing">
        {bookingDetails(route.params.venue)}
        <Button
          mt="auto"
          onPress={() => {
            setConfirmModal(true);
          }}
        >
          {t("Confirm")}
        </Button>
      </VStack>
      <ConfirmationModal
        isOpen={confirmModal}
        title={t("Confirm to book venue")}
        confirmText={t("Confirm")}
        cancelText={t("Cancel")}
        onConfirm={async () => {
          setConfirmModal(false);
          try {
            const bookedVenueId = await bookVenueV2({
              remarks,
              group,
              bookingModel,
              venueId: v.id,
            });
            navigation.navigate("BookVenueSuccess", {
              venueId: bookedVenueId,
            });
          } catch (error) {
            showApiToastError(error);
          }
        }}
        onCancel={() => {
          setConfirmModal(false);
        }}
        alertType="Success"
      />
    </HeaderLayout>
  );
}
