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
  Box,
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
import TipSuccessIcon from "../../components/Icons/TipSuccessIcon";
import { showApiToastSuccess } from "../../components/ApiToastSuccess";
import { useAuth } from "../../hooks/UseAuth";
import { UserType } from "../../models/User";

type BookingAdditionalInformationScreenProps = NativeStackScreenProps<
  MainStackNavigatorParamList,
  "BookVenueSuccess"
>;

const t = getTranslation([
  "constant.district",
  "screen.BookVenue",
  "constant.button",
  "screen.BookingRecords",
  "constant.district",
  "component.BookingAdditionalInformations",
  "screen.PlayerScreens.VenueBookingDetails",
]);

interface FormValue {
  remark: string;
}

export default function BookVenueSuccess({
  route,
  navigation,
}: BookingAdditionalInformationScreenProps) {
  const { user } = useAuth();
  return (
    <HeaderLayout
      isSticky
      headerProps={{
        title: t("Book Venue"),
        hasBackButton: false,
      }}
    >
      <VStack flex="1" space="4" mx="defaultLayoutSpacing">
        <VStack space="3" flex="1" justifyContent="center" alignItems="center">
          <Box
            w="12"
            h="12"
            alignItems="center"
            justifyContent="center"
            borderRadius="full"
            mr="defaultLayoutSpacing"
            bg="rgba(5,194,140,0.15)"
          >
            <TipSuccessIcon />
          </Box>
          <Heading>{t("Booked Venue")}</Heading>
          <Text textAlign="center">
            {t(
              "Other users will be able to view and book your venue from now on"
            )}
          </Text>
        </VStack>
        <VStack mt="auto" space="3">
          <Button
            onPress={() => {
              showApiToastSuccess({
                title: t("Booking Submitted"),
                body: t(
                  "Venue Owner will review your booking and you will be notified once it's confirmed"
                ),
              });
              let destination = "";
              switch (user?.userType) {
                case UserType.ClubStaff:
                  destination = "ClubNavigator";
                  break;
                case UserType.Coach:
                  destination = "CoachNavigator";
                  break;
                case UserType.Player:
                  destination = "PlayerNavigator";
                  break;
                default:
                  destination = "PlayerNavigator";
                  break;
              }
              navigation.reset({
                index: 0,
                routes: [
                  { name: destination, params: { screen: "VenueList" } },
                ],
              });
            }}
          >
            {t("Done")}
          </Button>
          <Button
            onPress={() => {
              showApiToastSuccess({
                title: t("Booking Submitted"),
                body: t(
                  "Venue Owner will review your booking and you will be notified once it's confirmed"
                ),
              });
              let destination = "";
              switch (user?.userType) {
                case UserType.ClubStaff:
                  destination = "ClubNavigator";
                  break;
                case UserType.Coach:
                  destination = "CoachNavigator";
                  break;
                case UserType.Player:
                  destination = "PlayerNavigator";
                  break;
                default:
                  destination = "PlayerNavigator";
                  break;
              }
              navigation.reset({
                index: 0,
                routes: [
                  { name: destination },
                  {
                    name: "VenueBookingDetail",
                    params: { venueBookingId: route.params.venueId },
                  },
                ],
              });
            }}
            variant="outline"
          >
            {t("View Booking Details")}
          </Button>
        </VStack>
      </VStack>
    </HeaderLayout>
  );
}
