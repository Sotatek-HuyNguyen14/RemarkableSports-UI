/* eslint-disable prefer-destructuring */
import { RouteProp } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import axios from "axios";
import {
  VStack,
  Button,
  Toast,
  HStack,
  Avatar,
  Heading,
  Badge,
  Text,
  Pressable,
} from "native-base";
import React, { useState } from "react";
import useSWR from "swr";
import ErrorMessage from "../../../components/ErrorMessage";
import HeaderLayout from "../../../components/Layout/HeaderLayout";
import Loading from "../../../components/Loading";
import RejectWithReasonModal from "../../../components/Modal/RejectWithReasonModal";
import PlayerShortProfile from "../../../components/PlayerShortProfile";
import { VenueBooking, VenueBookingStatus } from "../../../models/Booking";
import {
  ApproveVenueBookingRequest,
  RejectVenueBookingRequest,
} from "../../../models/Request";
import { MainStackNavigatorParamList } from "../../../routers/Types";
import {
  formatFileUrl,
  formatMeetupApiUrl,
} from "../../../services/ServiceUtil";
import {
  approveVenueBooking,
  rejectVenueBooking,
} from "../../../services/VenueBooking";
import VenueBookingDetailsComponent from "../../../components/VenueBookingDetails";

import { getTranslation } from "../../../utils/translation";
import MessageToast, {
  MesssageToastType,
} from "../../../components/Toast/MessageToast";
import { formatName, getUserName } from "../../../utils/name";
import { Player, UserType } from "../../../models/User";
import {
  APPROVE_BUTTON_COLOR,
  REJECT_BUTTON_COLOR,
} from "../../../constants/constants";
import ConfirmationModal from "../../../components/ConfirmationModal/ConfirmationModal";
import { showApiToastSuccess } from "../../../components/ApiToastSuccess";
import {
  isVenueBookingUpcoming,
  updateVenueBooking,
} from "../../../services/VenueBookingServices";
import { showApiToastError } from "../../../components/ApiToastError";

const t = getTranslation([
  "screen.ClubScreens.VenueBookingDetails",
  "screen.BookingRecords",
  "constant.district",
  "constant.button",
  "validation",
  "constant.profile",
]);

const approveBooking = (booking: VenueBooking) => {
  const payload: ApproveVenueBookingRequest = {
    venueId: booking.id,
  };
  return approveVenueBooking(payload);
};

const rejectBooking = (booking: VenueBooking, rejectReason: string) => {
  const payload: RejectVenueBookingRequest = {
    venueId: booking.id,
    rejectReason,
  };
  return rejectVenueBooking(payload);
};

export type VenueRequestDetailsNavigationProp = NativeStackNavigationProp<
  MainStackNavigatorParamList,
  "ClubVenueBookingDetails"
>;

export type VenueRequestDetailsRouteProp = RouteProp<
  MainStackNavigatorParamList,
  "ClubVenueBookingDetails"
>;

export interface VenueRequestDetailsNavigationProps {
  navigation: VenueRequestDetailsNavigationProp;
  route: VenueRequestDetailsRouteProp;
}

export default function VenueBookingDetails({
  navigation,
  route,
}: VenueRequestDetailsNavigationProps) {
  const { venueBooking, venueBookingId, flow } = route.params;
  const [confirmApprove, setConfirmApprove] = useState(false);
  const [confirmCancel, setConfirmCancel] = useState(false);
  const [rejectModalVisible, setRejectModalVisible] = useState<boolean>(false);

  const {
    data: venueFetched,
    isValidating,
    error,
  } = useSWR<VenueBooking>(
    venueBookingId && !venueBooking
      ? formatMeetupApiUrl(`/venue/${venueBookingId}`)
      : null,
    (path) => axios.get(path).then((res) => res.data)
  );

  const venueResult = venueBooking || venueFetched;

  return (
    <HeaderLayout
      isSticky
      headerProps={{
        title: t("Request Venue"),
        onPress: () => {
          navigation?.goBack();
        },
      }}
    >
      {isValidating && <Loading />}
      {!isValidating && error && <ErrorMessage />}
      {!isValidating && !error && venueResult && (
        <VStack mx="defaultLayoutSpacing">
          <VenueBookingDetailsComponent data={venueResult} />
          {venueResult.status === VenueBookingStatus.Pending &&
            flow === "default" && (
              <>
                <Button
                  mt="10"
                  onPress={() => {
                    setConfirmApprove(true);
                  }}
                  bg={APPROVE_BUTTON_COLOR}
                >
                  {t("Approve")}
                </Button>
                <Button
                  my="5"
                  variant="outline"
                  onPress={() => setRejectModalVisible(true)}
                  borderColor={REJECT_BUTTON_COLOR}
                  _text={{ color: REJECT_BUTTON_COLOR }}
                >
                  {t("Reject")}
                </Button>
              </>
            )}
          {flow === "ReopenAndRefund" && (
            <>
              {isVenueBookingUpcoming(venueResult) && (
                <Button
                  mt="10"
                  onPress={async () => {
                    try {
                      await updateVenueBooking({
                        id: venueBooking?.id || venueBookingId,
                        action: "Absent",
                      });
                      showApiToastSuccess({});
                      navigation.goBack();
                    } catch (err) {
                      showApiToastError(err);
                    }
                  }}
                >
                  {t("Absent and Reopen Slots")}
                </Button>
              )}
              {isVenueBookingUpcoming(venueResult) && (
                <Button
                  my="5"
                  variant="outline"
                  onPress={() => setConfirmCancel(true)}
                >
                  {t("Cancel and Refund")}
                </Button>
              )}
            </>
          )}
          <RejectWithReasonModal
            isOpen={rejectModalVisible}
            onClose={() => setRejectModalVisible(false)}
            onPressSubmit={(msg) => {
              rejectBooking(venueResult, msg).then(() => {
                setRejectModalVisible(false);
                showApiToastSuccess({});
                navigation.goBack();
              });
            }}
            user={venueResult.bookerInfo}
            rejectObject={venueResult.venue}
          />
          <ConfirmationModal
            alertType="Success"
            confirmText={t("Confirm")}
            cancelText={t("Cancel")}
            isOpen={confirmApprove}
            onCancel={() => {
              setConfirmApprove(false);
            }}
            title={t("Confirm to approve application")}
            onConfirm={async () => {
              setConfirmApprove(false);
              approveBooking(venueResult)
                .then(() => {
                  Toast.show({
                    id: "venueApproved",
                    duration: 2000,
                    placement: "top",
                    render: () => {
                      return (
                        <MessageToast
                          type={MesssageToastType.Success}
                          title={t("Venue booking is approved")}
                        />
                      );
                    },
                  });
                  navigation.goBack();
                })
                .catch((e) => {
                  showApiToastError(e);
                });
            }}
          />
          <ConfirmationModal
            alertType="Fail"
            confirmText={t("Confirm")}
            cancelText={t("Cancel")}
            isOpen={confirmCancel}
            onCancel={() => {
              setConfirmCancel(false);
            }}
            description={t(
              "The paid amount will automatically refund to the applicants"
            )}
            title={t("Confirm to cancel application")}
            onConfirm={async () => {
              setConfirmCancel(false);
              try {
                await updateVenueBooking({
                  id: venueBookingId || venueBooking?.id,
                  action: "Cancelled",
                });
                showApiToastSuccess({});
                navigation.goBack();
              } catch (e) {
                showApiToastError(e);
              }
            }}
          />
        </VStack>
      )}
    </HeaderLayout>
  );
}
