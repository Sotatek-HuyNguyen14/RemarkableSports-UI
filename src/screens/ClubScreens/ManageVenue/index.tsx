/* eslint-disable react/no-unescaped-entities */
import React, { useCallback, useEffect, useMemo, useState } from "react";
import {
  Avatar,
  Badge,
  Button,
  Heading,
  HStack,
  IconButton,
  Image,
  Modal,
  Pressable,
  Text,
  Toast,
  useTheme,
  VStack,
} from "native-base";
import useSWR from "swr";
import { NativeStackScreenProps } from "@react-navigation/native-stack";

import { useForm } from "react-hook-form";
import { useFocusEffect } from "@react-navigation/native";
import HeaderLayout from "../../../components/Layout/HeaderLayout";
import { MainStackNavigatorParamList } from "../../../routers/Types";
import { Action } from "../../../models/Response";
import { getTranslation } from "../../../utils/translation";
import {
  formatFileUrl,
  formatMeetupApiUrl,
} from "../../../services/ServiceUtil";

import Loading from "../../../components/Loading";
import ErrorMessage from "../../../components/ErrorMessage";

import {
  formatUtcToLocalDate,
  formatUtcToLocalTime,
} from "../../../utils/date";
import { VenueBooking } from "../../../models/Booking";
import {
  rejectVenueBooking,
  approveVenueBooking,
  getPendingVenueBookingForVenue,
} from "../../../services/VenueBooking";
import { VenueDetails } from "../../../components/VenueDetails";
import { formatName, getUserName } from "../../../utils/name";
import { UserType } from "../../../models/User";
import { showApiToastError } from "../../../components/ApiToastError";
import { showApiToastSuccess } from "../../../components/ApiToastSuccess";
import RejectWithReasonModal from "../../../components/Modal/RejectWithReasonModal";

const t = getTranslation([
  "screen.ClubScreens.ManageVenue",
  "screen.ClubScreens.VenueBookingDetails",
  "constant.district",

  "constant.button",
  "screen.ClubScreens.Home",
]);

type ManageVenueScreenProps = NativeStackScreenProps<
  MainStackNavigatorParamList,
  "ManageVenue"
>;

export default function ManageVenue({
  route,
  navigation,
}: ManageVenueScreenProps) {
  const { venue } = route.params;
  const {
    data: pendingVenueBookings,
    mutate,
    error,
    isValidating,
  } = useSWR<VenueBooking[]>(formatMeetupApiUrl("/venue/"), (path) => {
    return getPendingVenueBookingForVenue(venue.id);
  });

  const [selectedVenueBooking, setSelectedVenueBooking] = useState<
    VenueBooking | undefined
  >();

  const venueInfo = () => {
    return <VenueDetails shouldShowAllInfo={false} venue={venue} />;
  };

  const venueApplications = () => {
    if (isValidating) {
      return <Loading />;
    }
    const venueLists = pendingVenueBookings || [];
    return (
      <VStack space="3" mt="2">
        <Heading>{t("Applications")}</Heading>
        {venueLists.length === 0 ? (
          <Text mt="3" alignSelf="center">
            {t("There is no application for this venue")}
          </Text>
        ) : (
          venueLists.map((venueBooking) => {
            return (
              <VStack w="100%" key={`venueCard${venueBooking.id}`}>
                {"venueId" in venueBooking && (
                  <VStack mb="3">
                    <Pressable onPress={() => {}}>
                      <VStack
                        bgColor="rs.white"
                        p="4"
                        space="5"
                        shadow="9"
                        borderRadius="3xl"
                        style={{
                          shadowOffset: {
                            width: 5,
                            height: 5,
                          },
                          shadowOpacity: 0.1,
                        }}
                      >
                        <HStack space="3">
                          <Avatar
                            size="sm"
                            source={
                              venueBooking.bookerInfo.profilePicture
                                ? {
                                    uri: formatFileUrl(
                                      venueBooking.bookerInfo.profilePicture
                                    ),
                                  }
                                : undefined
                            }
                          >
                            Thumbnail
                          </Avatar>
                          <VStack space="2">
                            <Text fontSize="md">
                              {getUserName(venueBooking.bookerInfo)}
                            </Text>
                            <VStack space="1">
                              <Text color="gray.700">
                                {`${t("Date")}: ${formatUtcToLocalDate(
                                  venueBooking.fromTime
                                )}`}
                              </Text>
                              <Text color="gray.700">
                                {`${t("Time")}: ${formatUtcToLocalTime(
                                  venueBooking.fromTime
                                ).toLowerCase()} ${t(
                                  "to"
                                )} ${formatUtcToLocalTime(
                                  venueBooking.toTime
                                ).toLowerCase()}`}
                              </Text>
                            </VStack>
                            <Pressable
                              onPress={() =>
                                navigation.navigate("UserProfileViewer", {
                                  user: {
                                    ...venueBooking.bookerInfo,
                                    userType: UserType.Player,
                                  },
                                })
                              }
                            >
                              <Text
                                fontSize="md"
                                color="rs.primary_purple"
                                fontWeight="bold"
                              >
                                {t("View Profile")}
                              </Text>
                            </Pressable>
                          </VStack>
                        </HStack>
                        <HStack space="2">
                          <Button
                            flex="1"
                            px="5"
                            py="3"
                            _text={{
                              color: "white",
                              fontWeight: "bold",
                              fontSize: "lg",
                            }}
                            borderColor="#00B812"
                            style={{ borderRadius: 20 }}
                            bg="#00B812"
                            onPress={async () => {
                              try {
                                await approveVenueBooking({
                                  venueId: venueBooking.id,
                                });
                                showApiToastSuccess({
                                  title: t("Venue booking is approved"),
                                  body: "",
                                });
                                mutate();
                              } catch (approveError) {
                                showApiToastError(approveError);
                              }
                            }}
                          >
                            {t("Approve")}
                          </Button>
                          <Button
                            flex="1"
                            variant="outline"
                            onPress={() => {
                              setSelectedVenueBooking(venueBooking);
                              setRejectModalVisible(true);
                            }}
                            px="5"
                            py="3"
                            _text={{
                              color: "#E71010",
                              fontWeight: "bold",
                              fontSize: "lg",
                            }}
                            borderColor="#E71010"
                            style={{ borderRadius: 20 }}
                          >
                            {t("Reject")}
                          </Button>
                        </HStack>
                      </VStack>
                    </Pressable>
                  </VStack>
                )}
              </VStack>
            );
          })
        )}
      </VStack>
    );
  };

  const [rejectModalVisible, setRejectModalVisible] = useState<boolean>(false);
  return (
    <HeaderLayout
      isSticky
      headerProps={{
        title: t("Manage Venue"),
        hasBackButton: true,
        containerStyle: { marginHorizontal: 0 },
      }}
    >
      {!isValidating && error && !pendingVenueBookings && <ErrorMessage />}
      <VStack mx="defaultLayoutSpacing">
        {/* Venue info */}
        {venueInfo()}
        {/* Venue applications */}
        {venueApplications()}
      </VStack>
      {selectedVenueBooking && (
        <RejectWithReasonModal
          isOpen={rejectModalVisible}
          onClose={() => setRejectModalVisible(false)}
          onPressSubmit={async (msg) => {
            setRejectModalVisible(false);
            if (selectedVenueBooking) {
              try {
                await rejectVenueBooking({
                  venueId: selectedVenueBooking.id,
                  rejectReason: msg,
                });
                showApiToastSuccess({});
                mutate();
              } catch (approveError) {
                showApiToastError(approveError);
              }
            }
          }}
          user={selectedVenueBooking.bookerInfo}
          rejectObject={selectedVenueBooking.venue}
        />
      )}
    </HeaderLayout>
  );
}
