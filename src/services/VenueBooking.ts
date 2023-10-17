import axios from "axios";
import { VenueBooking, VenueBookingStatus } from "../models/Booking";
import {
  ApproveVenueBookingRequest,
  RejectVenueBookingRequest,
  VenueBookingApprovalAction,
} from "../models/Request";
import { formatMeetupApiUrl } from "./ServiceUtil";
import { updateVenueBooking } from "./VenueBookingServices";

export async function getAllVenueBookings() {}

export async function getVenueBooking() {}

export async function approveVenueBooking(payload: ApproveVenueBookingRequest) {
  // return axios.put(formatMeetupApiUrl(`/venue/${payload.venueId}`), {
  //   action: VenueBookingApprovalAction.Approve,
  // });
  await updateVenueBooking({ id: payload.venueId, action: "Approve" });
}
export const isVenueBookingFinished = (venueBooking: VenueBooking) => {
  if (venueBooking.toTime) {
    const isOutTime = venueBooking.toTime.getTime() < new Date().getTime();
    return isOutTime;
  }
  return false;
};
export async function rejectVenueBooking(payload: RejectVenueBookingRequest) {
  const parameters = { reasonReject: payload.rejectReason };
  return axios.put(formatMeetupApiUrl(`/venue/${payload.venueId}`), {
    action: VenueBookingApprovalAction.Reject,
    parameters,
  });
}

export async function getPendingVenueBookingForVenue(venueId: string | number) {
  const res = await axios.get<[VenueBooking]>(formatMeetupApiUrl("/venue/"));
  return res.data
    ? res.data.filter(
        (venue) =>
          venue.venueId === venueId &&
          venue.status === VenueBookingStatus.Pending &&
          !isVenueBookingFinished(venue)
      )
    : [];
}

export async function getVenueBookingForVenue(venueId: string | number) {
  const res = await axios.get<[VenueBooking]>(formatMeetupApiUrl("/venue/"));
  return res.data ? res.data.filter((venue) => venue.venueId === venueId) : [];
}

export async function getManageBookings(venueId: string | number) {
  // /meetup/venue/{venueId}/manage-bookings
  const res = await axios.get<[VenueBooking]>(
    formatMeetupApiUrl(`/venue/${venueId}/manage-bookings`)
  );
  return res.data;
}

export default {};
