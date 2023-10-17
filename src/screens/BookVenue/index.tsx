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
import { Ionicons } from "@expo/vector-icons";
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
import { formatUtcToLocalDate } from "../../utils/date";
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
import DateTimePicker from "../../components/v2/DateTimePicker";
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
import { isBlank } from "../../utils/strings";
import { getVenueTimeSlotInfo } from "../../services/VenueBookingServices";

export type BookVenueProps = NativeStackScreenProps<
  MainStackNavigatorParamList,
  "BookVenue"
>;

const t = getTranslation([
  "screen.BookingRecords",
  "screen.PlayerScreens.VenueApplySuccess",
  "constant.button",
  "constant.district",
]);

export enum TimeSlotState {
  Available = "Available",
  Selected = "Selected",
  Occupied = "Occupied",
  Closed = "Closed",
}

interface FormValue {
  selectedDate: string;
  selectedTimePeriod:
    | "00:00 - 06:00"
    | "06:00 - 12:00"
    | "12:00 - 18:00"
    | "18:00 - 23:30";
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

const TAG_OPTIONS = [
  {
    borderColor: "#898989",
    bg: "#ffffff",
    value: "Available",
  },
  {
    borderColor: "#66CEE1",
    bg: "#66CEE1",
    value: "Selected",
  },
  {
    borderColor: "#E7101080",
    bg: "#E7101080",
    value: "Occupied",
  },
  {
    borderColor: "#E9E9E9",
    bg: "#E9E9E9",
    value: "Closed",
  },
];

interface TimeRowProps {
  value: string;
  lastItem: boolean;
  states: TimeSlotState[];
  onPress: (index: number, value: string) => void;
  numberOfTables: number[];
}

export interface BookingModel {
  date: string;
  bookingTime: BookingTimeModel;
}

export function TimeRow({
  value,
  lastItem,
  numberOfTables,
  onPress,
  states,
}: TimeRowProps) {
  return (
    <VStack justifyContent="flex-start">
      <HStack mt="-6" space="2" alignItems="flex-start" p="2">
        <Text w="12" color="gray.400">
          {value.split("-")[0].trim()}
        </Text>
        <VStack mt="2.5" justifyContent="flex-end" flex="1">
          <Divider />
          <HStack
            mt="1"
            px="8"
            py="2"
            justifyContent={
              numberOfTables.length === 3 ? "space-between" : "space-around"
            }
          >
            {numberOfTables.map((n, index) => {
              const icon =
                states[index] === TimeSlotState.Available ? (
                  <TickIcon />
                ) : states[index] === TimeSlotState.Selected ? (
                  <TickIcon />
                ) : states[index] === TimeSlotState.Occupied ? (
                  <CalendarIcon color="#ffffff" props={{ size: "xs" }} />
                ) : (
                  <CloseV2Icon size="sm" />
                );
              const bg =
                states[index] === TimeSlotState.Available
                  ? "#ffffff"
                  : states[index] === TimeSlotState.Selected
                  ? "#66CEE1"
                  : states[index] === TimeSlotState.Occupied
                  ? "#E7101080"
                  : "#8F8F8F50";
              return (
                <Pressable
                  key={n}
                  disabled={
                    !(
                      states[index] === TimeSlotState.Available ||
                      states[index] === TimeSlotState.Selected
                    )
                  }
                  onPress={() => {
                    onPress(index, value);
                  }}
                >
                  <HStack
                    borderWidth="1"
                    style={{
                      width: 48,
                      height: 25,
                      borderWidth: 0.5,
                      borderColor:
                        states[index] === TimeSlotState.Available
                          ? "black"
                          : bg,
                    }}
                    bg={bg}
                    justifyContent="center"
                    alignItems="center"
                    borderRadius="sm"
                  >
                    {icon}
                  </HStack>
                </Pressable>
              );
            })}
          </HStack>
        </VStack>
      </HStack>
      {lastItem && (
        <HStack mt="-6" space="2" alignItems="flex-start" p="2">
          <Text color="gray.400">{value.split("-")[1].trim()}</Text>
          <VStack mt="2.5" justifyContent="flex-end" flex="1">
            <Divider />
          </VStack>
        </HStack>
      )}
    </VStack>
  );
}

const generateCurrentTableArray = (totalTable: number) => {
  return [...Array(totalTable).keys()].slice(0, 3).map((e) => e + 1);
};

export function BookVenue({ navigation, route }: BookVenueProps) {
  const theme = useTheme();
  const [bookingModel, setBookingModel] = useState<BookingTimeModel>({
    slots: [],
  });
  const { venue } = route.params;

  const [datePickerOpen, setDatePickerOpen] = useState(false);
  const [timePickerOpen, setTimePickerOpen] = useState(false);
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
  } = useSWR(formatCoreUrl("/venue/available-timeslots"), () =>
    getVenueTimeSlotInfo(venue.id, selectedDateState, selectedTimePeriod)
  );
  const unwrappedTimeSlotDictionaries = useMemo(() => {
    return timeSlotDictionaries || [];
  }, [timeSlotDictionaries]);

  const selectedTimePeriod = watch("selectedTimePeriod");
  const selectedTimePeriodValues = TIME_SLOTS[selectedTimePeriod];
  const [currentVenueTables, setCurrentVenueTables] = useState(
    generateCurrentTableArray(venue.numberOfTables)
  );

  const onPressNext = useCallback(() => {
    if (
      currentVenueTables[currentVenueTables.length - 1] < venue.numberOfTables
    ) {
      setCurrentVenueTables(
        currentVenueTables
          .map((c) => c + 1)
          .filter((c) => c <= venue.numberOfTables)
      );
    }
  }, [currentVenueTables, venue.numberOfTables]);

  const onPressPrevious = useCallback(() => {
    if (currentVenueTables[0] > 1) {
      setCurrentVenueTables(
        currentVenueTables
          .map((c) => c - 1)
          .filter((c) => c <= venue.numberOfTables)
      );
    }
  }, [currentVenueTables, venue.numberOfTables]);

  useEffect(() => {
    setBookingModel({ slots: [] });
    setValue("selectedTimePeriod", "00:00 - 06:00");
    setCurrentVenueTables(generateCurrentTableArray(venue.numberOfTables));
    mutate();
  }, [
    selectedDateState,
    setBookingModel,
    setCurrentVenueTables,
    setValue,
    venue,
    mutate,
  ]);

  useEffect(() => {
    mutate();
  }, [selectedTimePeriod, mutate]);

  const [showInstruction, setShowInstruction] = useState(false);

  const instructionModal = () => {
    return (
      <Modal
        avoidKeyboard
        isOpen={showInstruction}
        onClose={() => {
          setShowInstruction(false);
        }}
      >
        <Modal.Content m="4">
          <Modal.Body m="3" p="4">
            <VStack space="3">
              <ExclaimationIcon
                props={{
                  customFill: "#66CEE1",
                  size: "5xl",
                  alignSelf: "flex-start",
                }}
              />
              <Heading fontSize="lg">{t("Booking Logic")}</Heading>
              <Text fontSize="lg">
                {t(
                  "Please make sure your booking does not violate the following logic"
                )}
              </Text>
              <HStack alignItems="center" space="2">
                <HStack w="2" h="2" bg="rs.black" borderRadius="full" />
                <Text fontSize="lg">{t("Must be consecutive timeslots")}</Text>
              </HStack>
              <HStack space="2">
                <HStack mt="2" w="2" h="2" bg="rs.black" borderRadius="full" />
                <Text fontSize="lg">
                  Must be <Heading fontSize="lg">SAME</Heading> time slot for
                  booking more than 1 slot
                </Text>
              </HStack>
              <Button
                onPress={() => {
                  setShowInstruction(false);
                }}
              >
                {t("OK")}
              </Button>
            </VStack>
          </Modal.Body>
        </Modal.Content>
      </Modal>
    );
  };

  const renderTimeTables = useCallback(() => {
    return (
      <>
        {/* Selection tables */}
        {/* Table pagination */}
        <HStack space="2" alignItems="flex-start" p="2">
          {/* Hacks: So that the pagination can have the same spacing */}
          <Text w="12" color="white">
            00:00
          </Text>

          <VStack justifyContent="flex-end" flex="1">
            <Pressable
              onPress={onPressPrevious}
              position="absolute"
              left="0"
              top="-0.5"
              zIndex={1}
            >
              <LeftArrowIcon />
            </Pressable>
            <HStack
              px="8"
              justifyContent={
                currentVenueTables.length === 3
                  ? "space-between"
                  : "space-around"
              }
            >
              {currentVenueTables.map((n, index) => {
                return (
                  <VStack
                    key={n}
                    style={{
                      width: 48,
                      height: 25,
                    }}
                    justifyContent="center"
                    alignItems="center"
                  >
                    <Text fontSize="xs" color="gray.400">
                      {t("Slot")}
                    </Text>
                    <Text fontSize="md">{n}</Text>
                  </VStack>
                );
              })}
            </HStack>
            <Pressable
              onPress={onPressNext}
              position="absolute"
              right="0"
              zIndex={1}
              top="-0.5"
            >
              <RightArrowIcon />
            </Pressable>
          </VStack>
        </HStack>
        <VStack mt="4">
          {selectedTimePeriodValues.map((timeslot, index) => {
            const getStateForSlot = (slotId: number) => {
              // Get the data from bookingModel first
              // If it's selected or available [ user tapped on them once ] => Show
              // Otherwise get the status from dictionary for first rendering or for timeslots which are not tapped
              const selectedSlot = bookingModel.slots.find(
                (s) => s.id === slotId
              );
              if (selectedSlot) {
                const selectedTimeSlot = selectedSlot.timeslots.find(
                  (s) => s.state && s.value === timeslot
                );

                if (
                  selectedTimeSlot?.state === TimeSlotState.Available ||
                  selectedTimeSlot?.state === TimeSlotState.Selected
                )
                  return selectedTimeSlot?.state;
              }
              const slotDictionary = unwrappedTimeSlotDictionaries.filter(
                (slotDict) => slotDict.slot === slotId
              )[0];
              if (slotDictionary) {
                const overLappedTimeSlot = slotDictionary.timeSlots
                  .map((timeslotDictionary) => {
                    // timeslotDictionary: "fromTime":"09:30:00.000","toTime":"10:00:00.000"
                    // formatedFromTime: 09:30
                    // formatedToTime: 10:00
                    const formatedFromTime = timeslotDictionary.fromTime
                      .slice(0, 5)
                      .trim();
                    const formatedToTime = timeslotDictionary.toTime
                      .slice(0, 5)
                      .trim();
                    return {
                      value: `${formatedFromTime} - ${formatedToTime}`,
                      status: timeslotDictionary.status,
                    };
                  })
                  // timeSlotDictString: {value:  09:30 - 10:00, status: Occupied }.
                  // If it's equals to current checking timeslot => Get the status of that slot
                  .find((timeSlotDictString) => {
                    return timeSlotDictString.value === timeslot;
                  });
                if (overLappedTimeSlot) {
                  return overLappedTimeSlot.status as TimeSlotState;
                }
                return TimeSlotState.Closed;
              }
              return TimeSlotState.Closed;
              // // If timeslot is not in venue opening - closing hour => Status is closed
              // const venueOpeningTime = venue.openingTime.slice(0, 5);
              // const venueClosingTime = venue.closingTime.slice(0, 5);

              // const periodOpeningTime = timeslot.trim().split("-")[0];
              // const periodClosingTime = timeslot.trim().split("-")[1];

              // const venueOpeningHour = venueOpeningTime.split(":")[0];
              // const venueClosingHour = venueClosingTime.split(":")[0];

              // const periodOpeningHour = periodOpeningTime.split(":")[0];
              // const periodClosingHour = periodClosingTime.split(":")[0];

              // const isOverLapped =
              //   parseInt(venueOpeningHour, 10) <=
              //     parseInt(periodOpeningHour, 10) &&
              //   parseInt(venueClosingHour, 10) >=
              //     parseInt(periodClosingHour, 10);

              // if (!isOverLapped) {
              //   return TimeSlotState.Closed;
              // }

              // const selectedSlot = bookingModel.slots.find(
              //   (s) => s.id === slotId
              // );
              // if (selectedSlot) {
              //   const selectedTimeSlot = selectedSlot.timeslots.find(
              //     (s) => s.state && s.value === timeslot
              //   );

              //   return isOverLapped
              //     ? selectedTimeSlot?.state || TimeSlotState.Available
              //     : TimeSlotState.Closed;
              // }
              // return TimeSlotState.Available;
            };

            return (
              <TimeRow
                numberOfTables={currentVenueTables}
                states={[
                  getStateForSlot(currentVenueTables[0]),
                  getStateForSlot(currentVenueTables[1]),
                  getStateForSlot(currentVenueTables[2]),
                ]}
                onPress={(i, timeSlot) => {
                  const slotId = currentVenueTables[i];
                  const storedBookingModel = cloneDeep(bookingModel);

                  if (slotId) {
                    const selectedSlot = storedBookingModel.slots.find(
                      (s) => s.id === slotId
                    );
                    const newTimeslot: Timeslot = {
                      value: timeslot,
                      state: TimeSlotState.Selected,
                    };
                    if (selectedSlot) {
                      // Slot is exist -> Append new timeslot into
                      storedBookingModel.slots.map((s) => {
                        if (s.id === slotId) {
                          const selectedTimeSlot = s.timeslots.find(
                            (ts) => ts.value === timeSlot
                          );
                          if (
                            selectedTimeSlot &&
                            selectedTimeSlot.state === TimeSlotState.Selected
                          ) {
                            // Exist and The state is selected -> New state is Available ( De - select )
                            s.timeslots = s.timeslots.filter((ts) => {
                              return ts.value !== timeSlot;
                            });
                          } else if (
                            selectedTimeSlot &&
                            selectedTimeSlot.state === TimeSlotState.Available
                          ) {
                            // Exist and The state is UnSelected -> Select
                            s.timeslots.map((ts) => {
                              if (ts.value === timeSlot) {
                                return {
                                  ...ts,
                                  state: TimeSlotState.Selected,
                                };
                              }
                              return ts;
                            });
                          } else {
                            // Not exist -> Add new
                            // Try to sort before adding i.e Select 05:00-05:30 -> 05:30-06:00 then select 04:30-05:00
                            const newTimeSlotStartHour = parseInt(
                              newTimeslot.value.trim().split("-")[0],
                              10
                            );

                            if (s.timeslots.length > 0) {
                              const currentTimeSlotEndHour = parseInt(
                                s.timeslots[s.timeslots.length - 1].value
                                  .trim()
                                  .split("-")[0],
                                10
                              );

                              if (
                                newTimeSlotStartHour === currentTimeSlotEndHour
                              ) {
                                s.timeslots.push(newTimeslot);
                              } else {
                                s.timeslots = [newTimeslot].concat(s.timeslots);
                              }
                            } else {
                              // Completely new slot
                              s.timeslots.push(newTimeslot);
                            }
                          }
                        }
                        return s;
                      });
                    } else {
                      // Completely new slot
                      storedBookingModel.slots.push({
                        id: slotId,
                        timeslots: [newTimeslot],
                      });
                    }
                  }

                  // Handle validation: Timeslots for every items must be consecutive
                  const notConsecutiveTimeSlot = storedBookingModel.slots.find(
                    (slot) => {
                      const timeslotStr = slot.timeslots
                        .map((s) => s.value)
                        .join(",");
                      return !TIME_SLOTS_STR.trim().includes(
                        timeslotStr.trim()
                      );
                    }
                  );
                  if (notConsecutiveTimeSlot) {
                    return showApiToastErrorWithMessage(
                      t("Booking must include only consecutive time slot"),
                      t("Invalid Booking")
                    );
                  }
                  setBookingModel(storedBookingModel);
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
    bookingModel,
    currentVenueTables,
    onPressNext,
    onPressPrevious,
    selectedTimePeriodValues,
    unwrappedTimeSlotDictionaries,
  ]);

  if (isValidating) {
    return <Loading />;
  }

  return (
    <HeaderLayout
      headerProps={{
        title: t("Booking Records"),
        rightComponent: (
          <Pressable
            onPress={() => {
              setShowInstruction(true);
            }}
          >
            <Ionicons
              name="information-circle-outline"
              size={24}
              color="black"
            />
          </Pressable>
        ),
      }}
      isSticky
    >
      <VStack space="2">
        {/* Venue info */}
        <VStack space="2" mx="defaultLayoutSpacing">
          <Heading>{venue.name}</Heading>
          <Text>{t(venue.district)}</Text>
          <Text>{venue.address}</Text>
        </VStack>
        <Divider />
        <VStack mx="defaultLayoutSpacing">
          {/* Date Picker + Time Picker */}
          <HStack space="2" justifyContent="center" alignItems="center">
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
          <HStack justifyContent="center" alignItems="center" space="2" my="4">
            {TAG_OPTIONS.map((tag) => {
              return (
                <HStack
                  key={tag.value}
                  style={{
                    paddingHorizontal: 15,
                    paddingVertical: 4,
                  }}
                  bg={tag.bg}
                  borderWidth="1"
                  borderRadius="md"
                  borderColor={tag.borderColor}
                >
                  <Text>{t(tag.value)}</Text>
                </HStack>
              );
            })}
          </HStack>

          {renderTimeTables()}
        </VStack>
        <VStack mx="defaultLayoutSpacing">
          <Button
            isDisabled={
              bookingModel.slots.length === 0 ||
              (bookingModel.slots.length > 0 &&
                bookingModel.slots.findIndex((s) => s.timeslots.length > 0) ===
                  -1) ||
              isBlank(selectedDateState)
            }
            onPress={() => {
              // Handle validation: Book more than 1 tables -> time slots must be the same
              if (bookingModel.slots.length > 1) {
                const defaultValue = bookingModel.slots[0].timeslots
                  .map((ts) => ts.value)
                  .join(",")
                  .trim();
                const slotWithDifferentTimeSlot = bookingModel.slots.find(
                  (s) =>
                    s.timeslots
                      .map((ts) => ts.value)
                      .join(",")
                      .trim() !== defaultValue
                );
                if (slotWithDifferentTimeSlot) {
                  return showApiToastErrorWithMessage(
                    t(
                      "You must choose the same time slot if you wish to have more than 1 slot"
                    ),
                    t("Invalid Booking")
                  );
                }
              }
              navigation.navigate("BookingAdditionalInformation", {
                bookingModel: {
                  date: selectedDateState,
                  bookingTime: bookingModel,
                },
                venue,
              });
            }}
          >
            {t("Next")}
          </Button>
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
      {instructionModal()}
    </HeaderLayout>
  );
}
