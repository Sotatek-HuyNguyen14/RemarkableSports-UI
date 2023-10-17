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
  Avatar,
  Pressable,
} from "native-base";
import { NativeStackScreenProps } from "@react-navigation/native-stack";

import { MainStackNavigatorParamList } from "../../routers/Types";
import { formatFileUrl, formatMeetupApiUrl } from "../../services/ServiceUtil";
import {
  deleteVenueBooking,
  getVenueBookingById,
  updateVenueBooking,
} from "../../services/VenueBookingServices";
import HeaderLayout from "../../components/Layout/HeaderLayout";
import VenueBookingDetails from "../../components/VenueBookingDetails";
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
import { getUserById } from "../../services/AuthServices";

type VenueBookingDetailScreenProps = NativeStackScreenProps<
  MainStackNavigatorParamList,
  "VenueBookingDetail"
>;

const t = getTranslation([
  "constant.district",
  "screen.PlayerScreens.VenueBookingDetails",
  "constant.button",
  "screen.BookingRecords",
  "constant.district",
  "component.VenueBookingDetails",
]);

export default function VenueBookingDetail({
  route,
  navigation,
}: VenueBookingDetailScreenProps) {
  const { space } = useTheme();
  const { venueBooking, venueBookingId } = route.params;
  const { data, isValidating, error } = useSWR(
    venueBookingId ? formatMeetupApiUrl("/venue/{id}") : null,
    () => getVenueBookingById(venueBookingId!)
  );

  const [isCanceling, setIsCanceling] = useState(false);
  const [cancelBooking, setCancelBooking] = useState(false);

  const val = venueBooking || data;
  // Show cancel for pending or upcomming
  const shouldShowCancel =
    val?.status === VenueBookingStatus.Pending ||
    (val?.status === VenueBookingStatus.Approved &&
      new Date(val.fromTime).getTime() < new Date().getTime());
  const bookingDetails = (v: VenueBooking) => {
    if (val) {
      const { venue, fromTime, toTime } = val;
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
          {/* Club info */}
          {val?.club && (
            <HStack justifyContent="center" space="2" alignItems="center">
              <Avatar
                size="sm"
                source={
                  val.club.profilePictureUrl
                    ? {
                        uri: formatFileUrl(val.club.profilePictureUrl),
                      }
                    : undefined
                }
              >
                Avatar
              </Avatar>
              <VStack flex="1" space="2">
                <Text fontSize="md" fontWeight="bold">
                  {val?.club.name}
                </Text>
                <Pressable
                  onPress={() => {
                    navigation.navigate("AdminClubApproval", {
                      clubResponse: {
                        ...val?.club,
                      },
                    });
                  }}
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
                const selectedTimeSlot = val?.selectedTimeSlots
                  .map((ts) => ts.slot.toString())
                  .map((s) => parseInt(s, 10))
                  .includes(value);
                if (selectedTimeSlot && val && val.selectedTimeSlots[0]) {
                  const startTime = format24HTo12H(
                    val?.selectedTimeSlots[0].fromTime
                  );
                  const totalTimeSlots = val?.selectedTimeSlots.length;
                  const endTime = format24HTo12H(
                    val?.selectedTimeSlots[totalTimeSlots - 1].toTime
                  );
                  return (
                    <Text fontSize="md">{`Slot ${value}      ${startTime} - ${endTime}`}</Text>
                  );
                }
                return <Text fontSize="md">{`Slot ${value}      -`}</Text>;
              })}
          </VStack>

          {v.remarks && (
            <>
              <Heading fontSize="md" mt="3">
                {t("Remarks")}
              </Heading>
              <HStack alignItems="center" space="3">
                <Text fontSize="md">{v.remarks}</Text>
              </HStack>
            </>
          )}
        </VStack>
      );
    }
  };

  return (
    <HeaderLayout
      isSticky
      headerProps={{
        title: t("Request Venue"),
      }}
      containerProps={{
        marginHorizontal: space.defaultLayoutSpacing,
      }}
    >
      {isValidating && <Loading />}
      {!isValidating && error && <ErrorMessage />}
      {!isValidating && val && (
        <VStack space="4">
          {bookingDetails(val)}
          {shouldShowCancel && (
            <Button
              isDisabled={isCanceling}
              variant="outline"
              mt="auto"
              onPress={() => {
                setCancelBooking(true);
              }}
            >
              {t("Cancel")}
            </Button>
          )}
        </VStack>
      )}
      <ConfirmationModal
        alertType="Fail"
        confirmText={t("Confirm")}
        cancelText={t("Cancel")}
        isOpen={cancelBooking}
        onConfirm={async () => {
          setCancelBooking(false);
          if (val) {
            try {
              setIsCanceling(true);
              // await deleteVenueBooking(val.id);
              await updateVenueBooking({ id: val.id, action: "Cancelled" });
              setIsCanceling(false);
              Toast.show({
                id: "playerDeleteVenueSuccess",
                duration: 2000,
                placement: "top",
                render: () => {
                  return (
                    <MessageToast
                      type={MesssageToastType.Success}
                      title={t("Delete success")}
                    />
                  );
                },
              });
              navigation.goBack();
            } catch (e) {
              setIsCanceling(false);
              console.log(e);
              showApiToastError(e);
            }
          }
        }}
        onCancel={() => {
          setCancelBooking(false);
        }}
        title={t("Confirm to cancel booking")}
      />
    </HeaderLayout>
  );
}
