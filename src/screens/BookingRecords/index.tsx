import {
  Button,
  HStack,
  Heading,
  Image,
  Pressable,
  Text,
  VStack,
  useTheme,
} from "native-base";
import React, { useCallback, useMemo, useRef, useState } from "react";

import { LayoutAnimation, View } from "react-native";
import { NativeStackScreenProps } from "@react-navigation/native-stack";
import useSWR from "swr";
import { useFocusEffect } from "@react-navigation/native";
import { getTranslation } from "../../utils/translation";
import { MainStackNavigatorParamList } from "../../routers/Types";
import GhostTabbar from "../../components/GhostTabBar";
import ConfirmationModal from "../../components/ConfirmationModal/ConfirmationModal";
import { formatCoreUrl, formatFileUrl } from "../../services/ServiceUtil";

import ErrorMessage from "../../components/ErrorMessage";
import Loading from "../../components/Loading";

import NoDataComponent from "../../components/NoDataComponent";

import { VenueBooking, VenueBookingStatus } from "../../models/Booking";
import {
  deleteVenueBooking,
  getVenueBookingRecords,
  getVenueBookingStatus,
  updateVenueBooking,
} from "../../services/VenueBookingServices";
import FlashListLayout from "../../components/Layout/FlashListLayout";
import VenueBookingCard from "../../components/Card/VenueBookingCard";
import { SCREEN_WIDTH } from "../../constants/constants";
import Card from "../../components/Card/Card";
import ImageDirectory from "../../assets";
import { format24HTo12H, formatUtcToLocalDate } from "../../utils/date";
import { deleteVenue } from "../../services/VenueServices";
import { showApiToastSuccess } from "../../components/ApiToastSuccess";
import { showApiToastError } from "../../components/ApiToastError";

export type BookingRecordsProps = NativeStackScreenProps<
  MainStackNavigatorParamList,
  "BookingRecords"
>;

const t = getTranslation(["screen.BookingRecords", "constant.button"]);

enum ActiveTab {
  Pending = "Pending",
  Upcoming = "Upcoming",
  Completed = "Completed",
}

export function BookingRecords({ navigation, route }: BookingRecordsProps) {
  const theme = useTheme();
  const [activeTabIndex, setActiveTabIndex] = React.useState(0);
  const [cancelBooking, setCancelBooking] = useState(false);
  const [selectedVenueBooking, setSelectedVenueBooking] =
    useState<VenueBooking>();
  const {
    data: venueBookingRecords,
    error,
    mutate,
    isValidating,
  } = useSWR<VenueBooking[]>(
    formatCoreUrl("/meetup/venue/booking-records"),
    getVenueBookingRecords
  );

  useFocusEffect(
    useCallback(() => {
      mutate();
    }, [mutate])
  );

  const pendingBookings = useMemo(() => {
    if (venueBookingRecords) {
      return venueBookingRecords.filter((v) => {
        return v.status === VenueBookingStatus.Pending;
      });
    }
    return [];
  }, [venueBookingRecords]);

  const completedBookings = useMemo(() => {
    if (venueBookingRecords) {
      return venueBookingRecords.filter((v) => {
        return (
          new Date(v.toTime).getTime() > new Date().getTime() ||
          v.status === VenueBookingStatus.Cancelled ||
          v.status === VenueBookingStatus.Rejected
        );
      });
    }
    return [];
  }, [venueBookingRecords]);

  const upcomingBookings = useMemo(() => {
    if (venueBookingRecords) {
      return venueBookingRecords.filter((v) => {
        return (
          v.status === VenueBookingStatus.Approved &&
          new Date(v.fromTime).getTime() < new Date().getTime()
        );
      });
    }
    return [];
  }, [venueBookingRecords]);

  const availableTabs = [
    `${t(ActiveTab.Pending)} (${pendingBookings.length})`,
    `${t(ActiveTab.Upcoming)} (${upcomingBookings.length})`,
    `${t(ActiveTab.Completed)} (${completedBookings.length})`,
  ];

  const data = useMemo(() => {
    if (activeTabIndex === 0) {
      return pendingBookings;
    }

    if (activeTabIndex === 1) {
      return upcomingBookings;
    }

    if (activeTabIndex === 2) {
      return completedBookings;
    }
  }, [activeTabIndex, pendingBookings, upcomingBookings, completedBookings]);

  if (isValidating) {
    <Loading />;
  }

  const venueBookingRecordCard = (item: VenueBooking) => {
    const status = getVenueBookingStatus(item);
    const bg =
      status === "Completed"
        ? "#66CEE133"
        : status === "Cancelled"
        ? "#E0870033"
        : status === "Expired"
        ? "#55555533"
        : status === "Rejected"
        ? "#FF000033"
        : status === "Absent"
        ? "#E0870033"
        : "white";

    const textColor =
      status === "Completed"
        ? "#66CEE1"
        : status === "Cancelled"
        ? "#E08700"
        : status === "Expired"
        ? "#555555"
        : status === "Rejected"
        ? "#FF0000"
        : status === "Absent"
        ? "#E08700"
        : "white";
    return (
      <Pressable
        my="2"
        onPress={() => {
          navigation.navigate("VenueBookingDetail", {
            venueBooking: item,
          });
        }}
        mx="4"
        borderBottomRadius="2xl"
        key={item.id}
        bgColor="rs.white"
        shadow="9"
        style={{
          shadowOffset: {
            width: 5,
            height: 5,
          },
          shadowOpacity: 0.1,
          borderTopLeftRadius: 15,
          borderTopRightRadius: 15,
        }}
      >
        {activeTabIndex === 2 && (
          <View
            style={{
              height: 40,
              width: "100%",
              backgroundColor: bg,
              paddingHorizontal: 16,
              paddingVertical: 10,
              borderTopLeftRadius: 15,
              borderTopRightRadius: 15,
            }}
          >
            <Text style={{ fontSize: 16 }} fontWeight="bold" color={textColor}>
              {status}
            </Text>
          </View>
        )}
        <Pressable
          mt="1"
          p="2"
          onPress={() => {
            navigation.navigate("VenueBookingDetail", {
              venueBooking: item,
            });
          }}
        >
          <Image
            borderRadius="xl"
            w="100%"
            height={112}
            alt="Venue Image"
            source={
              item.venue.imageUrl
                ? {
                    uri: formatFileUrl(item.venue.imageUrl),
                  }
                : ImageDirectory.VENUE
            }
            alignSelf="center"
          />
          <VStack space="1" p="2" borderBottomRadius="2xl">
            <Heading fontSize="lg" fontWeight="normal">
              {item.venue.name}
            </Heading>
            {[
              `${t("Date")}: ${item.selectedDate}`,
              activeTabIndex !== 2 || item.selectedTimeSlots.length === 0
                ? `${t("Total Booking Hours")}: ${item.totalBookingHours}`
                : `${t("Time-slots")}: ${format24HTo12H(
                    item.selectedTimeSlots[0].fromTime
                  )} - ${format24HTo12H(
                    item.selectedTimeSlots[item.selectedTimeSlots.length - 1]
                      .toTime
                  )}`,
              `${t("No of Tables")}: ${item.noOfTables}`,
              `${t("Amount")}: $${item.amount}`,
            ].map((value) => {
              return (
                <Text key={value} fontSize="sm" color="#6D6D6D">
                  {value}
                </Text>
              );
            })}
          </VStack>
          {activeTabIndex !== 2 && (
            <Button
              onPress={() => {
                setSelectedVenueBooking(item);
                setCancelBooking(true);
              }}
              mt="2"
              mb="2"
              variant="outline"
            >
              {t("Cancel")}
            </Button>
          )}
        </Pressable>
      </Pressable>
    );
  };
  return (
    <>
      <FlashListLayout
        refreshing={isValidating}
        headerProps={{
          title: t("Booking Records"),
          containerStyle: { marginHorizontal: 4 },
        }}
        isSticky
        flashListProps={{
          data,
          renderItem: ({ item }: { item: VenueBooking }) =>
            venueBookingRecordCard(item),
          keyExtractor: (item: VenueBooking) => `${item.id}`,
          ListHeaderComponent: (
            <VStack mx="defaultLayoutSpacing" mb="4">
              <GhostTabbar
                defaultIndex={activeTabIndex}
                items={availableTabs}
                onPress={(item: string, index: number) => {
                  LayoutAnimation.configureNext(
                    LayoutAnimation.Presets.easeInEaseOut
                  );
                  setActiveTabIndex(index);
                }}
                activateColor={theme.colors.rs.primary_purple}
                unActivateColor={theme.colors.rs.inputLabel_grey}
                tabProps={{
                  fontSize: 16,
                }}
              />
            </VStack>
          ),
          ListEmptyComponent: isValidating ? <Loading /> : <NoDataComponent />,
        }}
        supportPullToRefresh
        onRefresh={() => {
          mutate();
        }}
      />
      <ConfirmationModal
        alertType="Fail"
        confirmText={t("Confirm")}
        cancelText={t("Cancel")}
        isOpen={cancelBooking}
        onConfirm={async () => {
          setCancelBooking(false);
          if (selectedVenueBooking) {
            try {
              // await deleteVenueBooking(selectedVenueBooking.id);
              await updateVenueBooking({
                id: selectedVenueBooking.id,
                action: "Cancelled",
              });
              showApiToastSuccess({});
              mutate();
            } catch (e) {
              showApiToastError(e);
            }
          }
        }}
        onCancel={() => {
          setCancelBooking(false);
        }}
        title={t("Confirm to cancel booking")}
      />
    </>
  );
}
