/* eslint-disable no-restricted-syntax */
/* eslint-disable no-else-return */
/* eslint-disable no-lonely-if */
/* eslint-disable no-param-reassign */
/* eslint-disable react/no-array-index-key */
import {
  Box,
  Button,
  Divider,
  HStack,
  Heading,
  Image,
  InfoOutlineIcon,
  Modal,
  Pressable,
  Text,
  VStack,
  useTheme,
} from "native-base";
import { cloneDeep } from "lodash";
import React, {
  useCallback,
  useMemo,
  useRef,
  useState,
  memo,
  useEffect,
} from "react";
import { LayoutAnimation, View } from "react-native";
import { NativeStackScreenProps } from "@react-navigation/native-stack";
import useSWR from "swr";
import { useFocusEffect } from "@react-navigation/native";
import { useForm } from "react-hook-form";
import { extendMoment } from "moment-range";
import Moment from "moment";
import { getTranslation } from "../../utils/translation";
import { MainStackNavigatorParamList } from "../../routers/Types";
import GhostTabbar from "../../components/GhostTabBar";
import ConfirmationModal from "../../components/ConfirmationModal/ConfirmationModal";
import { formatCoreUrl, formatFileUrl } from "../../services/ServiceUtil";

import ErrorMessage from "../../components/ErrorMessage";
import Loading from "../../components/Loading";

import NoDataComponent from "../../components/NoDataComponent";

import { VenueBooking, VenueBookingStatus } from "../../models/Booking";

import FlashListLayout from "../../components/Layout/FlashListLayout";
import VenueBookingCard from "../../components/Card/VenueBookingCard";
import { SCREEN_WIDTH } from "../../constants/constants";
import Card from "../../components/Card/Card";
import ImageDirectory from "../../assets";
import {
  format12HTo24H,
  formatUtcToLocalDate,
  formatUtcToLocalTime,
} from "../../utils/date";
import { deleteVenue } from "../../services/VenueServices";
import { showApiToastSuccess } from "../../components/ApiToastSuccess";
import {
  showApiToastError,
  showApiToastErrorWithMessage,
} from "../../components/ApiToastError";
import HeaderLayout from "../../components/Layout/HeaderLayout";
import { Venue } from "../../models/requests/Venue";
import FormInput from "../../components/FormInput/FormInput";
import DownArrowIcon from "../../components/Icons/DownArrowIcon";
import DateTimePicker, { monthData } from "../../components/v2/DateTimePicker";
import SingleSelectModal from "../../components/Modal/SingleSelectModal";
import CheckIcon from "../../components/Icons/CheckIcon";
import CalendarIcon from "../../components/Icons/CalendarIcon";
import CloseIcon from "../../components/Icons/CloseIcon";
import CloseV2Icon from "../../components/Icons/CloseV2Icon";
import TickIcon from "../../components/Icons/TickIcon";
import LeftArrowIcon from "../../components/Icons/LeftArrowIcon";
import RightArrowIcon from "../../components/Icons/RightArrowIcon";
import ReminderIcon from "../../components/Icons/ReminderIcon";
import TipDialogIcon from "../../components/Icons/TipDialogIcon";
import InfoIcon from "../../components/Icons/InfoIcon";
import LocationIcon from "../../components/Icons/LocationIcon";
import ExclaimationIcon from "../../components/Icons/ExclaimationIcon";
import { isBlank, twoDigitsFormat } from "../../utils/strings";
import {
  getFirstBookingByTimeSlotAndDate,
  getFirstBookingByTimeSlotAndSlotId,
  getVenueBookingScheduleTimeSlotInfo,
  getVenueTimeSlotInfo,
  isTwoTimeRangeOverLapped,
} from "../../services/VenueBookingServices";

export type BookingSchedulesProps = NativeStackScreenProps<
  MainStackNavigatorParamList,
  "BookingSchedules"
>;

const dayOfWeek = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

const t = getTranslation([
  "screen.BookingRecords",
  "screen.PlayerScreens.VenueApplySuccess",
  "constant.button",
  "constant.district",
]);

export enum TimeSlotState {
  Empty = "Empty",
  Available = "Available",
  Full = "Full",
  Closed = "Closed",
  Pending = "Pending",
  Confirmed = "Confirmed",
}

interface FormValue {
  selectedDate: string;
  selectedTimePeriod:
    | "00:00 - 06:00"
    | "06:00 - 12:00"
    | "12:00 - 18:00"
    | "18:00 - 23:30";
  selectedMonth: string;
}

interface Timeslot {
  value: string;
  state: TimeSlotState;
}

interface Slot {
  id: number;
  timeslots: Timeslot[];
}

interface BookingTimeModel {
  slots: Slot[];
}

const TIME_SLOTS_STR = [
  "00:00 - 00:30",
  "00:30 - 01:00",
  "01:00 - 01:30",
  "01:30 - 02:00",
  "02:00 - 02:30",
  "02:30 - 03:00",
  "03:00 - 03:30",
  "03:30 - 04:00",
  "04:00 - 04:30",
  "04:30 - 05:00",
  "05:00 - 05:30",
  "05:30 - 06:00",
  "06:00 - 06:30",
  "06:30 - 07:00",
  "07:00 - 07:30",
  "07:30 - 08:00",
  "08:00 - 08:30",
  "08:30 - 09:00",
  "09:00 - 09:30",
  "09:30 - 10:00",
  "10:00 - 10:30",
  "10:30 - 11:00",
  "11:00 - 11:30",
  "11:30 - 12:00",
  "06:00 - 06:30",
  "06:30 - 07:00",
  "07:00 - 07:30",
  "07:30 - 08:00",
  "08:00 - 08:30",
  "08:30 - 09:00",
  "09:00 - 09:30",
  "09:30 - 10:00",
  "10:00 - 10:30",
  "10:30 - 11:00",
  "11:00 - 11:30",
  "11:30 - 12:00",
  "12:00 - 12:30",
  "12:30 - 13:00",
  "13:00 - 13:30",
  "13:30 - 14:00",
  "14:00 - 14:30",
  "14:30 - 15:00",
  "15:00 - 15:30",
  "15:30 - 16:00",
  "16:00 - 16:30",
  "16:30 - 17:00",
  "17:00 - 17:30",
  "17:30 - 18:00",
  "18:00 - 18:30",
  "18:30 - 19:00",
  "19:00 - 19:30",
  "19:30 - 20:00",
  "20:00 - 20:30",
  "20:30 - 21:00",
  "21:00 - 21:30",
  "21:30 - 22:00",
  "22:00 - 22:30",
  "22:30 - 23:00",
  "23:00 - 23:30",
].join(",");
const TIME_SLOTS = {
  "00:00 - 06:00": [
    "00:00 - 00:30",
    "00:30 - 01:00",
    "01:00 - 01:30",
    "01:30 - 02:00",
    "02:00 - 02:30",
    "02:30 - 03:00",
    "03:00 - 03:30",
    "03:30 - 04:00",
    "04:00 - 04:30",
    "04:30 - 05:00",
    "05:00 - 05:30",
    "05:30 - 06:00",
  ],
  "06:00 - 12:00": [
    "06:00 - 06:30",
    "06:30 - 07:00",
    "07:00 - 07:30",
    "07:30 - 08:00",
    "08:00 - 08:30",
    "08:30 - 09:00",
    "09:00 - 09:30",
    "09:30 - 10:00",
    "10:00 - 10:30",
    "10:30 - 11:00",
    "11:00 - 11:30",
    "11:30 - 12:00",
  ],
  "12:00 - 18:00": [
    "12:00 - 12:30",
    "12:30 - 13:00",
    "13:00 - 13:30",
    "13:30 - 14:00",
    "14:00 - 14:30",
    "14:30 - 15:00",
    "15:00 - 15:30",
    "15:30 - 16:00",
    "16:00 - 16:30",
    "16:30 - 17:00",
    "17:00 - 17:30",
    "17:30 - 18:00",
  ],
  "18:00 - 23:30": [
    "18:00 - 18:30",
    "18:30 - 19:00",
    "19:00 - 19:30",
    "19:30 - 20:00",
    "20:00 - 20:30",
    "20:30 - 21:00",
    "21:00 - 21:30",
    "21:30 - 22:00",
    "22:00 - 22:30",
    "22:30 - 23:00",
    "23:00 - 23:30",
  ],
};

interface TimeRowProps {
  value: string;
  lastItem: boolean;
  states: TimeSlotState[];
  onPress: (index: number, value: string) => void;
  numberOfTables: number[];
  disableIndexes: boolean[];
}

export interface BookingModel {
  date: string;
  bookingTime: BookingTimeModel;
}

export function DayTimeRow({
  value,
  lastItem,
  numberOfTables,
  onPress,
  states,
  disableIndexes,
}: TimeRowProps) {
  return (
    <VStack justifyContent="flex-start" space="0">
      <HStack style={{ marginTop: -26 }} alignItems="flex-start" p="2">
        <Text w="12" color="gray.400">
          {value.split("-")[0].trim()}
        </Text>
        <VStack mt="2.5" justifyContent="flex-end" flex="1">
          <HStack
            space="1"
            px="8"
            justifyContent={
              numberOfTables.length === 3 ? "space-between" : "space-around"
            }
          >
            {numberOfTables.map((n, index) => {
              const bg =
                states[index] === TimeSlotState.Empty
                  ? "#ffffff"
                  : states[index] === TimeSlotState.Available ||
                    states[index] === TimeSlotState.Confirmed
                  ? "#00B81280"
                  : states[index] === TimeSlotState.Full
                  ? "#E7101080"
                  : states[index] === TimeSlotState.Pending
                  ? "#E0870060"
                  : "#8F8F8F50";
              return (
                <Pressable
                  isDisabled={disableIndexes[index]}
                  key={n}
                  onPress={() => {
                    onPress(index, value);
                  }}
                >
                  <HStack
                    style={{
                      width: 80,
                      height: 34,
                    }}
                    borderWidth="0.5"
                    borderColor="#000000"
                    bg={bg}
                    justifyContent="center"
                    alignItems="center"
                    borderBottomWidth={lastItem ? "0.5" : "0"}
                  />
                </Pressable>
              );
            })}
          </HStack>
        </VStack>
      </HStack>
      {lastItem && (
        <HStack
          style={{ marginTop: -26 }}
          space="2"
          alignItems="flex-start"
          p="2"
        >
          <Text w="12" color="gray.400">
            {value.split("-")[1].trim()}
          </Text>
          <VStack mt="2.5" justifyContent="flex-end" flex="1" />
        </HStack>
      )}
    </VStack>
  );
}

const generateCurrentTableArray = (totalTable: number) => {
  return [...Array(totalTable).keys()].slice(0, 3).map((e) => e + 1);
};

const generateCurrentVenueDatesArray = (currentDate: string, month: number) => {
  const currentDateInt = parseInt(currentDate, 10);
  return [currentDateInt, currentDateInt + 1, currentDateInt + 2]
    .filter((e) => e <= new Date(new Date().getFullYear(), month, 0).getDate())
    .filter((e) => e > 0);
};

export function BookingSchedules({ navigation, route }: BookingSchedulesProps) {
  const theme = useTheme();
  const [bookingModel, setBookingModel] = useState<BookingTimeModel>({
    slots: [],
  });

  // const venue = useMemo(() => {
  //   return {
  //     id: 19,
  //     name: "Henry venue",
  //     imageUrl: null,
  //     area: "NT",
  //     district: "HK.SK",
  //     address: "123",
  //     phoneNo: "12345677",
  //     numberOfTables: 3,
  //     fee: 11,
  //     ballsProvided: false,
  //     openingTime: "01:45:00.000",
  //     closingTime: "14:15:00.000",
  //     status: "Open",
  //     clubStaffId: "d5f5bf17-e027-46a8-87aa-21d5a45ddf84",
  //     cancellationPeriod: 0,
  //     sameForEveryDay: true,
  //     date: null,
  //     listVenueOpeningHours: [
  //       {
  //         venueId: 0,
  //         dayOfWeek: 1,
  //         openingTime: "01:45:00.000",
  //         closingTime: "14:15:00.000",
  //       },
  //       {
  //         venueId: 0,
  //         dayOfWeek: 2,
  //         openingTime: "01:45:00.000",
  //         closingTime: "14:15:00.000",
  //       },
  //       {
  //         venueId: 0,
  //         dayOfWeek: 3,
  //         openingTime: "01:45:00.000",
  //         closingTime: "14:15:00.000",
  //       },
  //       {
  //         venueId: 0,
  //         dayOfWeek: 4,
  //         openingTime: "01:45:00.000",
  //         closingTime: "14:15:00.000",
  //       },
  //       {
  //         venueId: 0,
  //         dayOfWeek: 5,
  //         openingTime: "01:45:00.000",
  //         closingTime: "14:15:00.000",
  //       },
  //       {
  //         venueId: 0,
  //         dayOfWeek: 6,
  //         openingTime: "01:45:00.000",
  //         closingTime: "14:15:00.000",
  //       },
  //       {
  //         venueId: 0,
  //         dayOfWeek: 7,
  //         openingTime: "01:45:00.000",
  //         closingTime: "14:15:00.000",
  //       },
  //     ],
  //     timeSlotInterval: 30,
  //     club: {
  //       id: 32,
  //       name: "Michelle Club S1",
  //       district: "HK.WC",
  //       address: "Hk",
  //       profilePictureUrl: "workflow/Core/Club/32/profilePicture_TOLGCD47.jpg",
  //       adminClubStaffProfilePictureUrl: null,
  //       adminClubStaffFirstName: "Michelle",
  //       adminClubStaffLastName: "Ng S1",
  //       approvalStatus: "Approved",
  //     },
  //   };
  // }, []);
  const { venue } = route.params;

  const [datePickerOpen, setDatePickerOpen] = useState(false);
  const [timePickerOpen, setTimePickerOpen] = useState(false);
  const [monthPickerOpen, setMonthPickerOpen] = useState(false);
  const {
    control,
    handleSubmit,
    watch,
    setValue,
    register,
    formState: { isSubmitting, isValid },
  } = useForm<FormValue>({
    defaultValues: {
      selectedDate: formatUtcToLocalDate(new Date()),
      selectedTimePeriod: "00:00 - 06:00",
    },
  });
  const [selectedDateState, setSelectedDateState] = useState(
    formatUtcToLocalDate(new Date())
  );

  const {
    data: timeSlotDictionaries,
    mutate,
    isValidating,
    error,
  } = useSWR(formatCoreUrl(`/meetup/venue/${venue.id}/booking-schedule`), () =>
    getVenueBookingScheduleTimeSlotInfo(
      venue.id,
      selectedDateState,
      selectedTimePeriod
    )
  );

  useFocusEffect(
    useCallback(() => {
      mutate();
    }, [mutate])
  );

  // unwrappedBookingDictionaries can include bookings having date different from selected date
  const unwrappedBookingDictionaries = useMemo(() => {
    return timeSlotDictionaries || [];
  }, [timeSlotDictionaries]);

  // unwrappedBookingForSelectedDateDictionaries will contains all bookings for current user selected date
  // If current tab is Day -> only one day -> Need filter
  // Otherwise -> No need filter

  const selectedTimePeriod = watch("selectedTimePeriod");
  const selectedTimePeriodValues = TIME_SLOTS[selectedTimePeriod];
  const [currentVenueSlots, setCurrentVenueTables] = useState(
    generateCurrentTableArray(venue.numberOfTables)
  );
  const selectedMonth = parseInt(selectedDateState.split("-")[1], 10);

  const onPressSlotNext = useCallback(() => {
    if (
      currentVenueSlots[currentVenueSlots.length - 1] < venue.numberOfTables
    ) {
      setCurrentVenueTables(
        currentVenueSlots
          .map((c) => c + 1)
          .filter((c) => c <= venue.numberOfTables)
      );
    }
  }, [currentVenueSlots, venue.numberOfTables]);
  const [currentVenueDates, setCurrentVenueDates] = useState(
    generateCurrentVenueDatesArray(
      selectedDateState.split("-")[2],
      selectedMonth
    )
  );

  const onPressSlotPrevious = useCallback(() => {
    if (currentVenueSlots[0] > 1) {
      setCurrentVenueTables(
        currentVenueSlots
          .map((c) => c - 1)
          .filter((c) => c <= venue.numberOfTables)
      );
    }
  }, [currentVenueSlots, venue.numberOfTables]);

  const onPressDateNext = useCallback(() => {
    const largestDate = currentVenueDates[currentVenueDates.length - 1];
    setCurrentVenueDates(
      [largestDate + 1, largestDate + 2, largestDate + 3].filter(
        (e) =>
          e <= new Date(new Date().getFullYear(), selectedMonth, 0).getDate()
      )
    );
  }, [currentVenueDates, selectedMonth]);

  const onPressDatePrevious = useCallback(() => {
    const largestDate = currentVenueDates[currentVenueDates.length - 1];
    setCurrentVenueDates(
      [largestDate - 5, largestDate - 4, largestDate - 3].filter((e) => e > 0)
    );
  }, [currentVenueDates]);

  useEffect(() => {
    setCurrentVenueTables(generateCurrentTableArray(venue.numberOfTables));
    setValue("selectedTimePeriod", "00:00 - 06:00");
    setCurrentVenueDates(
      generateCurrentVenueDatesArray(
        selectedDateState.split("-")[2],
        selectedMonth
      )
    );
    mutate();
  }, [
    selectedDateState,
    selectedMonth,
    setCurrentVenueTables,
    setValue,
    venue,
    mutate,
    setCurrentVenueDates,
  ]);

  useEffect(() => {
    mutate();
  }, [selectedTimePeriod, mutate]);

  const [activeTabIndex, setActiveTabIndex] = useState(0);
  const unwrappedBookingForSelectedDateDictionaries =
    unwrappedBookingDictionaries.filter((b) => {
      if (activeTabIndex === 0) {
        return (
          formatUtcToLocalDate(new Date(b.fromTime)).split("T")[0] ===
          selectedDateState
        );
      }
      return true;
    });

  const renderTablePagination = useCallback(() => {
    const data = activeTabIndex === 0 ? currentVenueSlots : currentVenueDates;
    const isLeftButtonDisabled =
      activeTabIndex === 0
        ? currentVenueSlots[0] === 1
        : currentVenueDates[0] === 1;
    const isRightButtonDisabled =
      activeTabIndex === 0
        ? currentVenueSlots[currentVenueSlots.length - 1] >=
          venue.numberOfTables
        : currentVenueDates[currentVenueDates.length - 1] >=
          new Date(new Date().getFullYear(), selectedMonth, 0).getDate();

    return (
      <HStack alignItems="flex-start" p="2">
        {/* Hacks: So that the pagination can have the same spacing */}
        <Text w="12" color="white">
          00:00
        </Text>

        <VStack justifyContent="flex-end" flex="1">
          <Pressable
            disabled={isLeftButtonDisabled}
            onPress={
              activeTabIndex === 0 ? onPressSlotPrevious : onPressDatePrevious
            }
            position="absolute"
            left="0"
            top="-0.5"
            zIndex={1}
          >
            <LeftArrowIcon
              customStroke={isLeftButtonDisabled ? "#D3D3D3" : "black"}
            />
          </Pressable>
          <HStack
            px="8"
            justifyContent={
              data.length === 3 ? "space-between" : "space-around"
            }
          >
            {data.map((n, index) => {
              const paginationTitle = activeTabIndex === 0 ? t("Slot") : n;
              const paginationSubtitle =
                activeTabIndex === 0
                  ? n
                  : dayOfWeek[
                      new Date(
                        new Date().getFullYear(),
                        selectedMonth - 1,
                        n
                      ).getDay()
                    ];

              const titleColor =
                activeTabIndex === 1 &&
                new Date(
                  new Date().getFullYear(),
                  selectedMonth - 1,
                  n
                ).getDay() === 0
                  ? "#E71010"
                  : "gray.400";
              const subtitleColor =
                activeTabIndex === 1 &&
                new Date(
                  new Date().getFullYear(),
                  selectedMonth - 1,
                  n
                ).getDay() === 0
                  ? "#E71010"
                  : "rs.black";
              return (
                <VStack
                  key={n}
                  style={{
                    width: 80,
                    height: 25,
                  }}
                  justifyContent="center"
                  alignItems="center"
                >
                  <Text
                    fontSize={activeTabIndex === 0 ? "xs" : "md"}
                    color={titleColor}
                  >
                    {paginationTitle}
                  </Text>
                  <Text
                    color={subtitleColor}
                    fontSize={activeTabIndex === 0 ? "md" : "xs"}
                  >
                    {paginationSubtitle}
                  </Text>
                </VStack>
              );
            })}
          </HStack>
          <Pressable
            disabled={isRightButtonDisabled}
            onPress={activeTabIndex === 0 ? onPressSlotNext : onPressDateNext}
            position="absolute"
            right="0"
            zIndex={1}
            top="-0.5"
          >
            <RightArrowIcon
              color={isRightButtonDisabled ? "#D3D3D3" : "black"}
            />
          </Pressable>
        </VStack>
      </HStack>
    );
  }, [
    currentVenueSlots,
    onPressSlotNext,
    onPressSlotPrevious,
    onPressDateNext,
    onPressDatePrevious,
    activeTabIndex,
    currentVenueDates,
    selectedMonth,
    venue.numberOfTables,
  ]);

  const renderTimeTables = useCallback(() => {
    const getTimeSlotStatus = (timeslot: string, slotId: number) => {
      let status: TimeSlotState = TimeSlotState.Closed;
      unwrappedBookingForSelectedDateDictionaries.forEach((booking) => {
        // booking.fromTime = 2023-09-19T08:00:00,
        const bookingFromTime = format12HTo24H(
          formatUtcToLocalTime(new Date(booking.fromTime))
        );
        const bookingToTime = format12HTo24H(
          formatUtcToLocalTime(new Date(booking.toTime))
        );

        const isOverLappedWithBooking = isTwoTimeRangeOverLapped(
          timeslot,
          bookingFromTime,
          bookingToTime
        );

        // - Closed: Timeslot outside venue open close time || slotId not exist in bookings
        // const venueOpeningHour = booking.openingTime.split(":")[0];
        // const venueClosingHour = booking.closingTime.split(":")[0];
        const isOverLappedWithVenue = isTwoTimeRangeOverLapped(
          timeslot,
          booking.openingTime,
          booking.closingTime
        );
        // parseInt(venueOpeningHour, 10) <= parseInt(periodOpeningHour, 10) &&
        // parseInt(venueClosingHour, 10) >= parseInt(periodClosingHour, 10);
        // if (slotId === 4 && timeslot === "10:00 - 10:30") {
        //   console.log(
        //     `${timeslot} | ${booking.id} | ${
        //       booking.status
        //     } | ${booking.venueBookingTimeSlots.map(
        //       (s) => `${s.fromTime} | ${s.toTime} | ${s.slot}`
        //     )}`
        //   );
        // }

        if (isOverLappedWithBooking) {
          // - Pending / Availble(3 days view): filter status = Pending
          if (
            booking.status === VenueBookingStatus.Pending &&
            booking.venueBookingTimeSlots.map((ts) => ts.slot).includes(slotId)
          ) {
            status =
              activeTabIndex === 0
                ? TimeSlotState.Pending
                : TimeSlotState.Available;

            return;
          }
          // - Confirmed / Full(3 days view):
          //   . Status = Approve and toTime >= new Date()
          //   . Status = Reject

          if (
            ((booking.status === VenueBookingStatus.Approved &&
              new Date(booking.toTime).getTime() >= new Date().getTime()) ||
              booking.status === VenueBookingStatus.Rejected) &&
            booking.venueBookingTimeSlots.map((ts) => ts.slot).includes(slotId)
          ) {
            status =
              activeTabIndex === 0
                ? TimeSlotState.Confirmed
                : TimeSlotState.Full;

            return;
          }
          // - Empty:
          //        .Status = Approve and toTime < new Date()
          //        .Status = Completed | Cancelled
          if (
            ((booking.status === VenueBookingStatus.Approved &&
              new Date(booking.toTime).getTime() < new Date().getTime()) ||
              booking.status === VenueBookingStatus.Completed ||
              booking.status === VenueBookingStatus.Cancelled) &&
            booking.venueBookingTimeSlots.map((ts) => ts.slot).includes(slotId)
          ) {
            status = TimeSlotState.Empty;
          }
        }
      });

      return status;
    };

    const getTimeSlotStatusWithDate = (timeslot: string, date: number) => {
      const filteredBooking =
        unwrappedBookingForSelectedDateDictionaries.filter((b) => {
          // Get status for 3 Day view will need to filter by date
          // bookingDate = 21
          // bookingMoth = 08
          // fromTime: "2023-09-21T08:00:00",
          const bookingDate = new Date(b.fromTime).getDate();
          const bookingMonth = new Date(b.fromTime).getMonth() + 1;
          return selectedMonth === bookingMonth && date === bookingDate;
        });
      let status: TimeSlotState = TimeSlotState.Closed;
      filteredBooking.forEach((booking) => {
        // booking.fromTime = 2023-09-19T08:00:00,
        const bookingFromTime = format12HTo24H(
          formatUtcToLocalTime(new Date(booking.fromTime))
        );
        const bookingToTime = format12HTo24H(
          formatUtcToLocalTime(new Date(booking.toTime))
        );

        const isOverLappedWithBooking = isTwoTimeRangeOverLapped(
          timeslot,
          bookingFromTime,
          bookingToTime
        );

        // - Closed: Timeslot outside venue open close time || slotId not exist in bookings
        // const venueOpeningHour = booking.openingTime.split(":")[0];
        // const venueClosingHour = booking.closingTime.split(":")[0];
        const isOverLappedWithVenue = isTwoTimeRangeOverLapped(
          timeslot,
          booking.openingTime,
          booking.closingTime
        );
        // parseInt(venueOpeningHour, 10) <= parseInt(periodOpeningHour, 10) &&
        // parseInt(venueClosingHour, 10) >= parseInt(periodClosingHour, 10);
        // if (slotId === 4 && timeslot === "10:00 - 10:30") {
        //   console.log(
        //     `${timeslot} | ${booking.id} | ${
        //       booking.status
        //     } | ${booking.venueBookingTimeSlots.map(
        //       (s) => `${s.fromTime} | ${s.toTime} | ${s.slot}`
        //     )}`
        //   );
        // }

        if (!isOverLappedWithVenue) {
          status = TimeSlotState.Closed;

          return;
        }

        if (isOverLappedWithBooking) {
          // - Pending / Availble(3 days view): filter status = Pending
          if (booking.status === VenueBookingStatus.Pending) {
            status =
              activeTabIndex === 0
                ? TimeSlotState.Pending
                : TimeSlotState.Available;

            return;
          }
          // - Confirmed / Full(3 days view):
          //   . Status = Approve and toTime >= new Date()
          //   . Status = Reject

          if (
            (booking.status === VenueBookingStatus.Approved &&
              new Date(booking.toTime).getTime() >= new Date().getTime()) ||
            booking.status === VenueBookingStatus.Rejected
          ) {
            status =
              activeTabIndex === 0
                ? TimeSlotState.Confirmed
                : TimeSlotState.Full;

            return;
          }
          // - Empty:
          //        .Status = Approve and toTime < new Date()
          //        .Status = Completed | Cancelled
          if (
            (booking.status === VenueBookingStatus.Approved &&
              new Date(booking.toTime).getTime() < new Date().getTime()) ||
            booking.status === VenueBookingStatus.Completed ||
            booking.status === VenueBookingStatus.Cancelled
          ) {
            status = TimeSlotState.Empty;
          }
        }
      });
      // for (const booking of unwrappedBookingForSelectedDateDictionaries.filter(
      //   (b) => {
      //     // Get status for 3 Day view will need to filter by date
      //     // bookingDate = 21
      //     // bookingMoth = 08
      //     // fromTime: "2023-09-21T08:00:00",
      //     const bookingDate = new Date(b.fromTime).getDate();
      //     const bookingMonth = new Date(b.fromTime).getMonth() + 1;
      //     return selectedMonth === bookingMonth && date === bookingDate;
      //   }
      // )) {
      //   // booking.fromTime = 2023-09-19T08:00:00,
      //   const bookingFromTime = format12HTo24H(
      //     formatUtcToLocalTime(new Date(booking.fromTime))
      //   );
      //   const bookingToTime = format12HTo24H(
      //     formatUtcToLocalTime(new Date(booking.toTime))
      //   );

      //   const isOverLappedWithBooking = isTwoTimeRangeOverLapped(
      //     timeslot,
      //     bookingFromTime,
      //     bookingToTime
      //   );

      //   // - Closed: Timeslot outside venue open close time
      //   const isOverLappedWithVenue = isTwoTimeRangeOverLapped(
      //     timeslot,
      //     venue.openingTime,
      //     venue.closingTime
      //   );
      //   if (!isOverLappedWithVenue) {
      //     return TimeSlotState.Closed;
      //   }

      //   if (isOverLappedWithBooking) {
      //     // - Pending / Availble(3 days view): filter status = Pending
      //     if (booking.status === VenueBookingStatus.Pending) {
      //       return activeTabIndex === 0
      //         ? TimeSlotState.Pending
      //         : TimeSlotState.Available;
      //     }
      //     // - Confirmed / Full(3 days view):
      //     //   . Status = Approve and toTime >= new Date()
      //     //   . Status = Reject
      //     if (
      //       (booking.status === VenueBookingStatus.Approved &&
      //         new Date(booking.toTime).getTime() >= new Date().getTime()) ||
      //       booking.status === VenueBookingStatus.Rejected
      //     ) {
      //       return activeTabIndex === 0
      //         ? TimeSlotState.Confirmed
      //         : TimeSlotState.Full;
      //     }
      //     // - Empty:
      //     //        .Status = Approve and toTime < new Date()
      //     //        .Status = Completed | Cancelled
      //     if (
      //       (booking.status === VenueBookingStatus.Approved &&
      //         new Date(booking.toTime).getTime() < new Date().getTime()) ||
      //       booking.status === VenueBookingStatus.Completed ||
      //       booking.status === VenueBookingStatus.Cancelled
      //     ) {
      //       return TimeSlotState.Empty;
      //     }
      //   }
      // }
      // return TimeSlotState.Closed;
      return status;
    };

    return (
      <>
        {/* Selection tables */}
        <VStack mt="4" space="0">
          {selectedTimePeriodValues.map((timeslot, index) => {
            return (
              <DayTimeRow
                disableIndexes={[
                  activeTabIndex === 0
                    ? getTimeSlotStatus(timeslot, currentVenueSlots[0]) !==
                        TimeSlotState.Pending &&
                      getTimeSlotStatus(timeslot, currentVenueSlots[0]) !==
                        TimeSlotState.Confirmed
                    : getTimeSlotStatusWithDate(
                        timeslot,
                        currentVenueDates[0]
                      ) === TimeSlotState.Closed,
                  activeTabIndex === 0
                    ? getTimeSlotStatus(timeslot, currentVenueSlots[1]) !==
                        TimeSlotState.Pending &&
                      getTimeSlotStatus(timeslot, currentVenueSlots[1]) !==
                        TimeSlotState.Confirmed
                    : getTimeSlotStatusWithDate(
                        timeslot,
                        currentVenueDates[1]
                      ) === TimeSlotState.Closed,
                  activeTabIndex === 0
                    ? getTimeSlotStatus(timeslot, currentVenueSlots[2]) !==
                        TimeSlotState.Pending &&
                      getTimeSlotStatus(timeslot, currentVenueSlots[2]) !==
                        TimeSlotState.Confirmed
                    : getTimeSlotStatusWithDate(
                        timeslot,
                        currentVenueDates[2]
                      ) === TimeSlotState.Closed,
                ]}
                numberOfTables={
                  activeTabIndex === 0 ? currentVenueSlots : currentVenueDates
                }
                states={[
                  activeTabIndex === 0
                    ? getTimeSlotStatus(timeslot, currentVenueSlots[0])
                    : getTimeSlotStatusWithDate(timeslot, currentVenueDates[0]),
                  activeTabIndex === 0
                    ? getTimeSlotStatus(timeslot, currentVenueSlots[1])
                    : getTimeSlotStatusWithDate(timeslot, currentVenueDates[1]),
                  activeTabIndex === 0
                    ? getTimeSlotStatus(timeslot, currentVenueSlots[2])
                    : getTimeSlotStatusWithDate(timeslot, currentVenueDates[2]),
                ]}
                onPress={(i, timeSlot) => {
                  if (activeTabIndex === 1) {
                    // Go to day view with selected day
                    const indexDate = currentVenueDates[i];
                    setActiveTabIndex(0);
                    setSelectedDateState(
                      `${new Date(
                        selectedDateState
                      ).getFullYear()}-${twoDigitsFormat(
                        new Date(selectedDateState).getMonth() + 1
                      )}-${indexDate}`
                    );

                    return;
                  }

                  const bookingForTimeSlot =
                    activeTabIndex === 0
                      ? getFirstBookingByTimeSlotAndSlotId(
                          timeslot,
                          unwrappedBookingForSelectedDateDictionaries,
                          currentVenueSlots[i]
                        )
                      : getFirstBookingByTimeSlotAndDate(
                          timeSlot,
                          currentVenueDates[index],
                          selectedMonth,
                          unwrappedBookingForSelectedDateDictionaries
                        );

                  if (bookingForTimeSlot) {
                    navigation.navigate("ClubVenueBookingDetails", {
                      venueBookingId: bookingForTimeSlot.id.toString(),
                      flow:
                        getTimeSlotStatus(timeslot, currentVenueSlots[i]) ===
                        TimeSlotState.Pending
                          ? "default"
                          : "ReopenAndRefund",
                    });
                  }

                  // navigation.navigate("ClubVenueBookingDetails", {
                  //   venueBookingId: "15"
                  // });
                }}
                value={timeslot}
                lastItem={index === selectedTimePeriodValues.length - 1}
                key={`${timeslot}_${index}`}
              />
            );
          })}
        </VStack>
      </>
    );
  }, [
    selectedTimePeriodValues,
    unwrappedBookingForSelectedDateDictionaries,
    activeTabIndex,
    selectedMonth,
    currentVenueSlots,
    currentVenueDates,
    selectedDateState,
    navigation,
  ]);

  const TAG_OPTIONS =
    activeTabIndex === 0
      ? [
          {
            borderColor: "#000000",
            bg: "#ffffff",
            value: "Empty",
          },
          {
            borderColor: "#F0C380",
            bg: "#F0C380",
            value: "Pending",
          },
          {
            borderColor: "#80DC89",
            bg: "#80DC89",
            value: "Confirmed",
          },
          {
            borderColor: "#C8C8C8",
            bg: "#C8C8C8",
            value: "Closed",
          },
        ]
      : [
          {
            borderColor: "#000000",
            bg: "#ffffff",
            value: "Empty",
          },
          {
            borderColor: "#80DC89",
            bg: "#80DC89",
            value: "Available",
          },
          {
            borderColor: "#F5000080",
            bg: "#F5000080",
            value: "Full",
          },
          {
            borderColor: "#C8C8C8",
            bg: "#C8C8C8",
            value: "Closed",
          },
        ];

  if (isValidating) {
    return <Loading />;
  }

  return (
    <HeaderLayout
      headerProps={{
        title: t("Booking Schedules"),
      }}
      isSticky
    >
      <VStack space="2">
        <GhostTabbar
          items={["Day", "3-Day"]}
          defaultIndex={activeTabIndex}
          onPress={(item, idx) => {
            LayoutAnimation.configureNext(
              LayoutAnimation.Presets.easeInEaseOut
            );
            setActiveTabIndex(idx);
          }}
          tabProps={{
            fontSize: 16,
            textAlign: "center",
            flex: 1,
          }}
          isShowBottomLine
          isFlex
          activateColor={theme.colors.rs.primary_purple}
        />
        {/* Venue info */}
        <VStack mx="defaultLayoutSpacing" mt="3" space="0">
          {/* Date Picker + Time Picker */}
          <HStack space="2" justifyContent="center" alignItems="center">
            {activeTabIndex === 0 ? (
              // Date picker Selection
              <Pressable
                flex="1"
                onPress={() => {
                  setDatePickerOpen(true);
                }}
              >
                <HStack
                  flex="1"
                  bg="#F3F3F3"
                  space="4"
                  justifyContent="center"
                  alignItems="center"
                  borderRadius="2xl"
                  p="3"
                  px="4"
                >
                  <Text fontSize="md">{selectedDateState}</Text>
                  <DownArrowIcon size="sm" />
                </HStack>
              </Pressable>
            ) : (
              // Month selection
              <Pressable
                flex="1"
                onPress={() => {
                  setMonthPickerOpen(true);
                }}
              >
                <HStack
                  flex="1"
                  bg="#F3F3F3"
                  space="4"
                  justifyContent="center"
                  alignItems="center"
                  borderRadius="2xl"
                  p="3"
                  px="4"
                >
                  <Text fontSize="md">{`${monthData[
                    selectedMonth - 1
                  ].label.toUpperCase()} ${new Date(
                    selectedDateState
                  ).getFullYear()}`}</Text>
                  <DownArrowIcon size="sm" />
                </HStack>
              </Pressable>
            )}

            <Pressable
              flex="1"
              onPress={() => {
                setTimePickerOpen(true);
              }}
            >
              <HStack
                flex="1"
                bg="#F3F3F3"
                space="4"
                justifyContent="center"
                alignItems="center"
                borderRadius="2xl"
                p="3"
                px="4"
              >
                <Text fontSize="md">{selectedTimePeriod}</Text>
                <DownArrowIcon size="sm" />
              </HStack>
            </Pressable>
          </HStack>

          {/* Tags */}
          <HStack justifyContent="space-between" alignItems="center" my="4">
            {TAG_OPTIONS.map((tag) => {
              return (
                <HStack
                  key={tag.value}
                  style={{
                    paddingHorizontal: 15,
                    paddingVertical: 10,
                    minWidth: 80,
                    minHeight: 35,
                  }}
                  justifyContent="center"
                  alignItems="center"
                  bg={tag.bg}
                  borderWidth="1"
                  borderRadius="md"
                  borderColor={tag.borderColor}
                >
                  <Text fontSize="xs">{tag.value}</Text>
                </HStack>
              );
            })}
          </HStack>

          {renderTablePagination()}
          {renderTimeTables()}
        </VStack>
      </VStack>
      <DateTimePicker
        title={t("Select date")}
        isShow={datePickerOpen}
        mode="date"
        controllerProps={{
          name: "selectedDate",
          control,
        }}
        onCloseWithValue={(val) => {
          setSelectedDateState(val);
        }}
        onClose={() => {
          setDatePickerOpen(false);
        }}
        defaultDate={selectedDateState}
      />
      <SingleSelectModal
        title={t("Select Time")}
        options={[
          "00:00 - 06:00",
          "06:00 - 12:00",
          "12:00 - 18:00",
          "18:00 - 23:30",
        ].map((v) => {
          return {
            value: v,
            label: v,
          };
        })}
        controllerProps={{
          name: "selectedTimePeriod",
          control,
        }}
        isOpen={timePickerOpen}
        onClose={() => {
          setTimePickerOpen(false);
        }}
        confirmButtonText={t("Confirm")}
      />
      <SingleSelectModal
        isOpen={monthPickerOpen}
        onClose={() => {
          setMonthPickerOpen(false);
        }}
        onCloseWithValue={(value) => {
          const newDate = new Date(selectedDateState);
          newDate.setMonth(parseInt(value, 10) - 1);
          setSelectedDateState(formatUtcToLocalDate(newDate));
          setMonthPickerOpen(false);
        }}
        title="Select month"
        options={monthData}
        controllerProps={{
          name: "selectedMonth",
          control,
        }}
        confirmButtonText={t("Save")}
      />
    </HeaderLayout>
  );
}
