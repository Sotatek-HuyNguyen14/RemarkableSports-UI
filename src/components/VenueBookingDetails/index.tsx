import React from "react";
import { Heading, HStack, VStack, Text, Image, Badge } from "native-base";
import { SCREEN_WIDTH } from "../../constants/constants";
import { VenueBooking } from "../../models/Booking";
import { formatFileUrl } from "../../services/ServiceUtil";
import {
  format24HTo12H,
  formatUtcToLocalDate,
  formatUtcToLocalTime,
} from "../../utils/date";
import { getTranslation } from "../../utils/translation";
import CalendarIcon from "../Icons/CalendarIcon";
import ClockIcon from "../Icons/ClockIcon";
import LocationIcon from "../Icons/LocationIcon";
import MoneyIcon from "../Icons/MoneyIcon";
import ImageDirectory from "../../assets";
import { VenueBookingGroup } from "../../screens/BookingAdditionalInformation";
import PlayerShortProfile from "../PlayerShortProfile";
import { Coach, User, UserType } from "../../models/User";
import CoachShortProfile from "../CoachShortProfile";

const t = getTranslation([
  "constant.district",
  "component.VenueBookingDetails",
  "screen.BookingRecords",
  "constant.district",
  "screen.PlayerScreens.BookingAdditionalInformations",
  "constant.button",
  "screen.BookingRecords",
  "constant.district",
  "component.BookingAdditionalInformations",
  "screen.PlayerScreens.VenueBookingDetails",
]);

export default function VenueBookingDetails({ data }: { data: VenueBooking }) {
  const { venue, fromTime, toTime, type: group } = data;
  return (
    <VStack mt="5" space="3">
      <VStack>
        {venue && (
          <Image
            source={
              venue.imageUrl
                ? { uri: formatFileUrl(venue.imageUrl) }
                : ImageDirectory.VENUE
            }
            width={SCREEN_WIDTH}
            height={170}
            resizeMode="cover"
            alt={t("Venue Photo")}
            style={{ borderRadius: 10 }}
          />
        )}
      </VStack>

      <Heading>{venue.name}</Heading>
      <HStack alignItems="flex-start" space="3">
        <VStack alignItems="flex-start">
          <Text fontSize="md">{t(venue.district)}</Text>
          <Text fontSize="md">{venue.address}</Text>
        </VStack>
      </HStack>
      {data.bookerInfo.userType === UserType.Player && (
        <PlayerShortProfile player={data.bookerInfo} />
      )}
      {data.bookerInfo.userType === UserType.Coach && (
        <CoachShortProfile coach={data.bookerInfo as User as Coach} />
      )}

      <Heading fontSize="md" mt="3">
        {t("Enquiry Phone No")}
      </Heading>
      <HStack alignItems="center" space="3">
        <Text fontSize="md">{venue.phoneNo}</Text>
      </HStack>

      <Heading fontSize="md" mt="3">
        {t("Selected date")}
      </Heading>
      <HStack alignItems="center" space="3">
        <Text fontSize="md">{formatUtcToLocalDate(fromTime)}</Text>
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
            const selectedTimeSlot = data?.selectedTimeSlots
              .map((ts) => ts.slot.toString())
              .map((s) => parseInt(s, 10))
              .includes(value);
            if (selectedTimeSlot && data && data.selectedTimeSlots[0]) {
              const startTime = format24HTo12H(
                data?.selectedTimeSlots[0].fromTime
              );
              const totalTimeSlots = data?.selectedTimeSlots.length;
              const endTime = format24HTo12H(
                data?.selectedTimeSlots[totalTimeSlots - 1].toTime
              );
              return (
                <Text fontSize="md">{`Slot ${value}      ${startTime} - ${endTime}`}</Text>
              );
            }
            return <Text fontSize="md">{`Slot ${value}      -`}</Text>;
          })}
      </VStack>

      {data.remarks && (
        <>
          <Heading fontSize="md" mt="3">
            {t("Remarks")}
          </Heading>
          <HStack alignItems="center" space="3">
            <Text fontSize="md">{data.remarks}</Text>
          </HStack>
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
}
