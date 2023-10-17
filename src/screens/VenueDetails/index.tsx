import React, { useState } from "react";
import {
  Avatar,
  Box,
  Button,
  Heading,
  HStack,
  Image,
  Text,
  useTheme,
  VStack,
} from "native-base";
import { NativeStackScreenProps } from "@react-navigation/native-stack";
import { isEqual } from "date-fns";
import useSWR from "swr";
import axios from "axios";
import HeaderLayout from "../../components/Layout/HeaderLayout";
import { MainStackNavigatorParamList } from "../../routers/Types";
import FilterBadge from "../../components/Badge/FilterBadge";
import {
  format24HTo12H,
  formatHourMinute,
  formatUtcToLocalTime,
} from "../../utils/date";
import { getTranslation } from "../../utils/translation";
import {
  applyMeetUpVenue,
  isTimeSlotsArraySequential,
  TimeSlot,
} from "../../services/MeetUpVenueServices";
import { formatCoreUrl, formatFileUrl } from "../../services/ServiceUtil";
import { Venue } from "../../models/requests/Venue";
import Loading from "../../components/Loading";
import ErrorMessage from "../../components/ErrorMessage";
import { VenueDetails } from "../../components/VenueDetails";
import { showApiToastError } from "../../components/ApiToastError";
import ImageDirectory from "../../assets";
import { SCREEN_WIDTH } from "../../constants/constants";
import DaysOfWeek from "../../constants/DaysOfWeek";

type VenueDetailsScreenProps = NativeStackScreenProps<
  MainStackNavigatorParamList,
  "VenueDetail"
>;

const t = getTranslation([
  "screen.PlayerScreens.VenueDetails",
  "constant.area",
  "constant.button",
  "formInput",
  "constant.district",
  "screen.PlayerScreens.VenueBookingDetails",
  "constant.button",
  "screen.BookingRecords",
  "component.VenueBookingDetails",
]);

export default function VenueDetail({
  navigation,
  route,
}: VenueDetailsScreenProps) {
  const { space } = useTheme();
  const { venue, venueId } = route.params;

  const {
    data: venueMeetup,
    isValidating,
    mutate,
    error: fetchError,
  } = useSWR<Venue>(
    venueId ? formatCoreUrl(`/venue/${venueId}`) : null,
    (path) => axios.get(path).then((res) => res.data)
  );

  const venueResult = venue || venueMeetup;

  const data =
    (venueResult &&
      venueResult.availableTimeSlots?.map((timeSlot: any) => {
        const timeLabel = new Date(timeSlot.fromTime);
        return {
          name: formatHourMinute(timeLabel),
          isSelected: false,
          value: timeSlot,
        };
      })) ||
    [];

  const [timeslotData, setTimeSlots] = useState(data);

  const onPressTimeSlot = (tappedTimeslot: TimeSlot) => {
    if (timeslotData) {
      let selectedTimeSlots = timeslotData.filter(
        (timeslot: any) => timeslot.isSelected
      );
      const tapped = tappedTimeslot;
      tapped.isSelected = true;
      if (selectedTimeSlots.length > 0) {
        if (
          tapped.value.fromTime.getTime() >=
          selectedTimeSlots[selectedTimeSlots.length - 1].value.toTime.getTime()
        ) {
          selectedTimeSlots.push(tapped);
        } else {
          selectedTimeSlots = [tapped].concat(selectedTimeSlots);
        }
      } else {
        selectedTimeSlots.push(tapped);
      }

      setTimeSlots(
        timeslotData.map((timeSlot: any) => {
          const newTimeSlot = timeSlot;
          if (isEqual(tappedTimeslot.value.fromTime, timeSlot.value.fromTime)) {
            newTimeSlot.isSelected = true;
          } else {
            newTimeSlot.isSelected =
              isTimeSlotsArraySequential(selectedTimeSlots) &&
              timeSlot.isSelected;
          }

          return newTimeSlot;
        })
      );
    }
  };

  const onPressApply = async () => {
    if (venueResult) {
      const selectedTimeSlots = timeslotData
        ?.filter((timeslot: any) => timeslot.isSelected)
        .map((timeSlot: any) => {
          return {
            fromTime: timeSlot.value.fromTime,
            toTime: timeSlot.value.toTime,
          };
        });
      try {
        await applyMeetUpVenue({
          action: "BookVenue",
          selectedTimeSlots,
          venueId: venueResult.id,
        });
        navigation.reset({
          index: 0,
          routes: [
            {
              name: "VenueApplySuccess",
              params: {
                destination: "PlayerNavigator",
                nestedDestination: "VenueList",
                venue: route.params.venue,
                appliedFromTime:
                  selectedTimeSlots && selectedTimeSlots[0]?.fromTime
                    ? formatUtcToLocalTime(selectedTimeSlots[0]?.fromTime)
                    : "",
                appliedToTime:
                  selectedTimeSlots && selectedTimeSlots[0]?.toTime
                    ? formatUtcToLocalTime(
                        selectedTimeSlots[selectedTimeSlots.length - 1]?.toTime
                      )
                    : "",
              },
            },
          ],
        });
      } catch (error) {
        showApiToastError(error);
      }
    }
  };

  const bookingDetails = () => {
    return (
      <VStack mt="5" space="3">
        <Image
          source={
            venueResult.imageUrl
              ? { uri: formatFileUrl(venueResult.imageUrl) }
              : ImageDirectory.VENUE
          }
          width={SCREEN_WIDTH}
          height={170}
          resizeMode="cover"
          alt={t("Venue Photo")}
          style={{ borderRadius: 10 }}
        />
        <Heading>{venueResult.name}</Heading>
        <Heading fontSize="md" mt="3">
          {t("Address")}
        </Heading>
        <HStack alignItems="flex-start" space="3">
          <VStack alignItems="flex-start">
            <Text fontSize="md">{t(venueResult.district)}</Text>
            <Text fontSize="md">{venueResult.address}</Text>
          </VStack>
        </HStack>

        <Heading fontSize="md" mt="3">
          {t("Enquiry Phone No")}
        </Heading>
        <HStack alignItems="center" space="3">
          <Text fontSize="md">{venueResult.phoneNo}</Text>
        </HStack>
        <Heading fontSize="md" mt="3">
          {t("Opening Hours")}
        </Heading>
        <VStack>
          <VStack width="100%">
            {venueResult.sameForEveryDay
              ? DaysOfWeek.map((day) => (
                  <HStack key={day} width="100%">
                    <Text flex={0.2}>{day.slice(0, 3).toUpperCase()}</Text>
                    <Text flex={0.8}>
                      {format24HTo12H(venueResult.openingTime)} -{" "}
                      {format24HTo12H(venueResult.closingTime)}
                    </Text>
                  </HStack>
                ))
              : DaysOfWeek.map((day, idx) => (
                  <HStack key={day} width="100%">
                    <Text flex={0.2}>{day.slice(0, 3).toUpperCase()}</Text>
                    <Text flex={0.8}>
                      {format24HTo12H(
                        venueResult.listVenueOpeningHours[idx]
                          .openingTime as string
                      )}{" "}
                      -{" "}
                      {format24HTo12H(
                        venueResult.listVenueOpeningHours[idx]
                          .closingTime as string
                      )}
                    </Text>
                  </HStack>
                ))}
          </VStack>
        </VStack>
      </VStack>
    );
  };

  return (
    <HeaderLayout
      headerProps={{
        title: t("Venue details"),
        headerLabelStyle: { fontSize: 16 },
        containerStyle: { alignItems: "center" },
      }}
      containerProps={{ marginHorizontal: space.defaultLayoutSpacing }}
    >
      {isValidating && <Loading />}
      {!isValidating && (fetchError || !venueResult) && <ErrorMessage />}
      {venueResult && (
        <>
          {bookingDetails()}

          {venueResult.status === "Open" && (
            <Button
              mt="6"
              onPress={() => {
                navigation.navigate("BookVenue", {
                  venue,
                });
              }}
            >
              {t("Book Now")}
            </Button>
          )}
        </>
      )}
    </HeaderLayout>
  );
}
