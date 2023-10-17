/* eslint-disable no-restricted-syntax */
import axios from "axios";
import { VenueBooking, VenueBookingStatus } from "../models/Booking";
import { CreateVenueBookingRequest } from "../models/requests/VenueBooking";
import { formatCoreUrl, formatMeetupApiUrl } from "./ServiceUtil";
import { VenueBookingGroup } from "../screens/ConfirmVenueBooking";
import { BookingModel, TimeSlotState } from "../screens/BookVenue";
import { format12HTo24H, formatUtcToLocalTime } from "../utils/date";
import { isVenueBookingFinished } from "./VenueBooking";

const VENUE_BOOKING_PATH = "/venue";

export async function getAllVenueBookings() {
  return axios
    .get<VenueBooking[]>(formatMeetupApiUrl(VENUE_BOOKING_PATH))
    .then((res) => res.data);
}

export async function getVenueBookingById(venueMeetupId: number | string) {
  return axios
    .get<VenueBooking>(
      formatMeetupApiUrl(`${VENUE_BOOKING_PATH}/${venueMeetupId}`)
    )
    .then((res) => res.data);
}

export async function createVenueBooking(payload: CreateVenueBookingRequest) {
  return axios.post(formatMeetupApiUrl(VENUE_BOOKING_PATH), payload);
}

export async function deleteVenueBooking(venueBookingId: number) {
  return axios.delete(
    formatMeetupApiUrl(`${VENUE_BOOKING_PATH}/${venueBookingId}`)
  );
}

export const isVenueBookingUpcoming = (v: VenueBooking) => {
  if (!v) return false;
  return v.status === VenueBookingStatus.Approved && !isVenueBookingFinished(v);
};

export const isVenueBookingCancelled = (v: VenueBooking) => {
  if (!v) return false;
  return v.status === VenueBookingStatus.Cancelled;
};

export const isVenueBookingAbsent = (v: VenueBooking) => {
  if (!v) return false;
  return v.status === VenueBookingStatus.Completed;
};

export const isVenueBookingPast = (v: VenueBooking) => {
  if (!v) return false;
  return v.status === VenueBookingStatus.Approved && isVenueBookingFinished(v);
};

export async function getVenueBookingRecords() {
  const res = await axios.get<VenueBooking[]>(
    formatCoreUrl("/meetup/venue/booking-records")
  );
  return (res.data as unknown as { listVenueBookingRecords: VenueBooking[] })
    .listVenueBookingRecords;
}

export function getVenueBookingStatus(booking: VenueBooking) {
  if (booking.status === VenueBookingStatus.Completed) {
    return "Absent";
  }

  if (booking.status === VenueBookingStatus.Cancelled) {
    return "Cancelled";
  }

  if (booking.status === VenueBookingStatus.Rejected) {
    return "Rejected";
  }
  if (
    new Date(booking.toTime).getTime() > new Date().getTime() &&
    booking.status === VenueBookingStatus.Pending
  ) {
    return "Expired";
  }
  if (new Date(booking.toTime).getTime() > new Date().getTime()) {
    return "Completed";
  }

  return "Unknown";
}

// Date: 2023-09-16
// Time: 08:00 or 23:00
// Return 2023-09-16 + 08:00
const formatBookingTimeWithDateAndTime = (date: string, time: string) => {
  // const d = new Date(date);
  // d.setHours(parseInt(time.trim().split(":")[0], 10));
  // d.setMinutes(parseInt(time.trim().split(":")[1], 10));
  // return d;
  return `${date}T${time.trim()}:00.000`;
};

const formatTimeSlotFromBookingModel = (model: BookingModel) => {
  const { date, bookingTime } = model;
  const selectedTimeSlots: { fromTime: string; toTime: string }[] = [];
  // All slots are having the same timeslots when they book more than 1 slot

  const slotWithValue = bookingTime.slots.find(
    (s) =>
      s.timeslots.filter((ts) => ts.state === TimeSlotState.Selected).length > 0
  );
  slotWithValue?.timeslots.forEach((ts) => {
    selectedTimeSlots.push({
      // ts.value = 08:00 - 08:30
      fromTime: formatBookingTimeWithDateAndTime(
        date,
        ts.value.trim().split("-")[0]
      ),
      toTime: formatBookingTimeWithDateAndTime(
        date,
        ts.value.trim().split("-")[1]
      ),
    });
  });
  return selectedTimeSlots;
};

export async function bookVenueV2(payload: {
  remarks?: string;
  group?: VenueBookingGroup;
  bookingModel: BookingModel;
  venueId: string | number;
}) {
  const res = await axios.post(formatCoreUrl("/meetup/venue"), {
    action: "BookVenue",
    selectedTimeSlots: formatTimeSlotFromBookingModel(payload.bookingModel),
    venueBookingType: payload.group,
    remarks: payload.remarks,
    venueId: payload.venueId,
    slots: payload.bookingModel.bookingTime.slots.map((s) => s.id),
  });
  return res.data;
}

export async function getVenueBookingScheduleTimeSlotInfo(
  id: string | number,
  date: string,
  timePeriod: string
) {
  const res = await axios.get<
    {
      id: number;
      venueId: number;
      fromTime: string;
      toTime: string;
      openingTime: string;
      closingTime: string;
      status: string;
      rejectReason: null;
      type: null;
      remarks: null;
      venueBookingTimeSlots: {
        id: number;
        venueBookingId: number;
        slot: number;
        fromTime: string;
        toTime: string;
      }[];
    }[]
  >(formatCoreUrl(`/meetup/venue/${id}/booking-schedule`), {
    params: {
      venueId: id,
      startTime: `${date}T${timePeriod.trim().split("-")[0]}:00.000`
        .trim()
        .replace(" ", ""),
      endTime: `${date}T${timePeriod.trim().split("-")[1]}:00.000`
        .trim()
        .replace(" ", ""),
    },
  });
  return res.data;
  // return [
  //   {
  //     id: 1,
  //     venueId: 19,
  //     fromTime: "2023-09-24T08:00:00",
  //     toTime: "2023-09-24T10:30:00",
  //     status: "Pending",
  //     rejectReason: null,
  //     type: null,
  //     remarks: null,
  //     venueBookingTimeSlots: [
  //       {
  //         id: 1,
  //         venueBookingId: 1,
  //         slot: 1,
  //         fromTime: "08:00:00.000",
  //         toTime: "10:30:00.000",
  //       },
  //       {
  //         id: 2,
  //         venueBookingId: 1,
  //         slot: 2,
  //         fromTime: "08:00:00.000",
  //         toTime: "10:30:00.000",
  //       },
  //       {
  //         id: 3,
  //         venueBookingId: 1,
  //         slot: 3,
  //         fromTime: "08:00:00.000",
  //         toTime: "10:30:00.000",
  //       },
  //       {
  //         id: 4,
  //         venueBookingId: 1,
  //         slot: 4,
  //         fromTime: "08:00:00.000",
  //         toTime: "10:30:00.000",
  //       },
  //     ],
  //   },
  //   {
  //     id: 2,
  //     venueId: 19,
  //     fromTime: "2023-09-20T08:00:00",
  //     toTime: "2023-09-20T10:30:00",
  //     status: "Approve",
  //     rejectReason: null,
  //     type: null,
  //     remarks: null,
  //     venueBookingTimeSlots: [
  //       {
  //         id: 5,
  //         venueBookingId: 2,
  //         slot: 1,
  //         fromTime: "08:00:00.000",
  //         toTime: "10:30:00.000",
  //       },
  //       {
  //         id: 6,
  //         venueBookingId: 2,
  //         slot: 2,
  //         fromTime: "08:00:00.000",
  //         toTime: "10:30:00.000",
  //       },
  //       {
  //         id: 7,
  //         venueBookingId: 2,
  //         slot: 3,
  //         fromTime: "08:00:00.000",
  //         toTime: "10:30:00.000",
  //       },
  //       {
  //         id: 8,
  //         venueBookingId: 2,
  //         slot: 4,
  //         fromTime: "08:00:00.000",
  //         toTime: "10:30:00.000",
  //       },
  //     ],
  //   },
  //   {
  //     id: 3,
  //     venueId: 19,
  //     fromTime: "2023-09-21T08:00:00",
  //     toTime: "2023-09-21T10:30:00",
  //     status: "Cancelled",
  //     rejectReason: null,
  //     type: null,
  //     remarks: null,
  //     venueBookingTimeSlots: [
  //       {
  //         id: 9,
  //         venueBookingId: 3,
  //         slot: 1,
  //         fromTime: "08:00:00.000",
  //         toTime: "10:30:00.000",
  //       },
  //       {
  //         id: 10,
  //         venueBookingId: 3,
  //         slot: 2,
  //         fromTime: "08:00:00.000",
  //         toTime: "10:30:00.000",
  //       },
  //       {
  //         id: 11,
  //         venueBookingId: 3,
  //         slot: 3,
  //         fromTime: "08:00:00.000",
  //         toTime: "10:30:00.000",
  //       },
  //       {
  //         id: 12,
  //         venueBookingId: 3,
  //         slot: 4,
  //         fromTime: "08:00:00.000",
  //         toTime: "10:30:00.000",
  //       },
  //     ],
  //   },
  // ];
}

export async function getVenueTimeSlotInfo(
  id: string | number,
  date: string,
  timePeriod: string
) {
  const res = await axios.get<
    {
      slot: number;
      timeSlots: { fromTime: string; toTime: string; status: string }[];
    }[]
  >(formatCoreUrl(`/venue/available-timeslots/${id}`), {
    params: {
      venueId: id,
      fromTime: `${date}T${timePeriod.trim().split("-")[0]}:00.000`
        .trim()
        .replace(" ", ""),
      toTime: `${date}T${timePeriod.trim().split("-")[1]}:00.000`
        .trim()
        .replace(" ", ""),
    },
  });

  return res.data;
  return [
    {
      slot: 1,
      timeSlots: [
        {
          fromTime: "09:00:00.000",
          toTime: "09:30:00.000",
          status: "Occupied",
        },
        {
          fromTime: "09:30:00.000",
          toTime: "10:00:00.000",
          status: "Occupied",
        },
        {
          fromTime: "10:00:00.000",
          toTime: "10:30:00.000",
          status: "Available",
        },
        {
          fromTime: "10:30:00.000",
          toTime: "11:00:00.000",
          status: "Available",
        },
        {
          fromTime: "11:00:00.000",
          toTime: "11:30:00.000",
          status: "Available",
        },
        {
          fromTime: "11:30:00.000",
          toTime: "12:00:00.000",
          status: "Available",
        },
        { fromTime: "12:00:00.000", toTime: "12:30:00.000", status: "Close" },
        { fromTime: "12:30:00.000", toTime: "13:00:00.000", status: "Close" },
      ],
    },
    {
      slot: 2,
      timeSlots: [
        {
          fromTime: "09:00:00.000",
          toTime: "09:30:00.000",
          status: "Occupied",
        },
        {
          fromTime: "09:30:00.000",
          toTime: "10:00:00.000",
          status: "Occupied",
        },
        {
          fromTime: "10:00:00.000",
          toTime: "10:30:00.000",
          status: "Available",
        },
        {
          fromTime: "10:30:00.000",
          toTime: "11:00:00.000",
          status: "Available",
        },
        {
          fromTime: "11:00:00.000",
          toTime: "11:30:00.000",
          status: "Available",
        },
        {
          fromTime: "11:30:00.000",
          toTime: "12:00:00.000",
          status: "Available",
        },
        { fromTime: "12:00:00.000", toTime: "12:30:00.000", status: "Close" },
        { fromTime: "12:30:00.000", toTime: "13:00:00.000", status: "Close" },
      ],
    },
    {
      slot: 3,
      timeSlots: [
        {
          fromTime: "09:00:00.000",
          toTime: "09:30:00.000",
          status: "Occupied",
        },
        {
          fromTime: "09:30:00.000",
          toTime: "10:00:00.000",
          status: "Occupied",
        },
        {
          fromTime: "10:00:00.000",
          toTime: "10:30:00.000",
          status: "Available",
        },
        {
          fromTime: "10:30:00.000",
          toTime: "11:00:00.000",
          status: "Available",
        },
        {
          fromTime: "11:00:00.000",
          toTime: "11:30:00.000",
          status: "Available",
        },
        {
          fromTime: "11:30:00.000",
          toTime: "12:00:00.000",
          status: "Available",
        },
        { fromTime: "12:00:00.000", toTime: "12:30:00.000", status: "Close" },
        { fromTime: "12:30:00.000", toTime: "13:00:00.000", status: "Close" },
      ],
    },
    {
      slot: 4,
      timeSlots: [
        {
          fromTime: "09:00:00.000",
          toTime: "09:30:00.000",
          status: "Available",
        },
        {
          fromTime: "09:30:00.000",
          toTime: "10:00:00.000",
          status: "Available",
        },
        {
          fromTime: "10:00:00.000",
          toTime: "10:30:00.000",
          status: "Available",
        },
        {
          fromTime: "10:30:00.000",
          toTime: "11:00:00.000",
          status: "Available",
        },
        {
          fromTime: "11:00:00.000",
          toTime: "11:30:00.000",
          status: "Available",
        },
        {
          fromTime: "11:30:00.000",
          toTime: "12:00:00.000",
          status: "Available",
        },
        { fromTime: "12:00:00.000", toTime: "12:30:00.000", status: "Close" },
        { fromTime: "12:30:00.000", toTime: "13:00:00.000", status: "Close" },
      ],
    },
    {
      slot: 5,
      timeSlots: [
        {
          fromTime: "09:00:00.000",
          toTime: "09:30:00.000",
          status: "Available",
        },
        {
          fromTime: "09:30:00.000",
          toTime: "10:00:00.000",
          status: "Available",
        },
        {
          fromTime: "10:00:00.000",
          toTime: "10:30:00.000",
          status: "Available",
        },
        {
          fromTime: "10:30:00.000",
          toTime: "11:00:00.000",
          status: "Available",
        },
        {
          fromTime: "11:00:00.000",
          toTime: "11:30:00.000",
          status: "Available",
        },
        {
          fromTime: "11:30:00.000",
          toTime: "12:00:00.000",
          status: "Available",
        },
        { fromTime: "12:00:00.000", toTime: "12:30:00.000", status: "Close" },
        { fromTime: "12:30:00.000", toTime: "13:00:00.000", status: "Close" },
      ],
    },
  ];
}

export async function updateVenueBooking({
  id,
  parameters,
  action,
}: {
  id: string | number;
  parameters?: { reasonReject: string };
  action: "Approve" | "Reject" | "Cancelled" | "Absent" | "Revert";
}) {
  await axios.put(formatCoreUrl(`/meetup/venue/${id}`), {
    parameters,
    action,
  });
}

export const getFirstBookingByTimeSlotAndSlotId = (
  timeslot: string,
  data: {
    id: number;
    venueId: number;
    fromTime: string;
    toTime: string;
    openingTime: string;
    closingTime: string;
    status: string;
    rejectReason: null;
    type: null;
    remarks: null;
    venueBookingTimeSlots: {
      id: number;
      venueBookingId: number;
      slot: number;
      fromTime: string;
      toTime: string;
    }[];
  }[],
  slotId: number
) => {
  for (const booking of data) {
    // booking.fromTime = 2023-09-19T08:00:00,
    const bookingFromTime = format12HTo24H(
      formatUtcToLocalTime(new Date(booking.fromTime))
    );
    const bookingToTime = format12HTo24H(
      formatUtcToLocalTime(new Date(booking.toTime))
    );

    const isOverLapped = isTwoTimeRangeOverLapped(
      timeslot,
      bookingFromTime,
      bookingToTime
    );

    // For slot, the timeslot must be overlapped and the slotId should be included in venueBookingTimeslots.element.slotId
    if (
      isOverLapped &&
      booking.venueBookingTimeSlots.map((ts) => ts.slot).includes(slotId)
    ) {
      return booking;
    }
  }
};

export const getFirstBookingByTimeSlotAndDate = (
  timeslot: string,
  date: number,
  month: number,
  data: {
    id: number;
    venueId: number;
    fromTime: string;
    toTime: string;
    openingTime: string;
    closingTime: string;
    status: string;
    rejectReason: null;
    type: null;
    remarks: null;
    venueBookingTimeSlots: {
      id: number;
      venueBookingId: number;
      slot: number;
      fromTime: string;
      toTime: string;
    }[];
  }[]
) => {
  for (const booking of data.filter((b) => {
    // Get status for 3 Day view will need to filter by date
    // bookingDate = 21
    // bookingMoth = 08
    // fromTime: "2023-09-21T08:00:00",
    const bookingDate = new Date(b.fromTime.split("T")[0].trim()).getDate();
    const bookingMonth =
      new Date(b.fromTime.split("T")[0].trim()).getMonth() + 1;
    return month === bookingMonth && date === bookingDate;
  })) {
    // booking.fromTime = 2023-09-19T08:00:00,
    const bookingFromTime = format12HTo24H(
      formatUtcToLocalTime(new Date(booking.fromTime))
    );
    const bookingToTime = format12HTo24H(
      formatUtcToLocalTime(new Date(booking.toTime))
    );

    const isOverLapped = isTwoTimeRangeOverLapped(
      timeslot,
      bookingFromTime,
      bookingToTime
    );

    if (isOverLapped) {
      return booking;
    }
  }
};

export const isTwoTimeRangeOverLapped = (
  timeslot: string,
  bookingFromTime: string,
  bookingToTime: string
) => {
  const periodOpeningTime = timeslot.trim().split("-")[0];
  const periodClosingTime = timeslot.trim().split("-")[1];

  const bookingOpeningHour = bookingFromTime.split(":")[0];
  const bookingClosingHour = bookingToTime.split(":")[0];
  const bookingOpeningMinute = bookingFromTime.split(":")[1];
  const bookingClosingMinitue = bookingToTime.split(":")[1];

  const periodOpeningHour = periodOpeningTime.split(":")[0];
  const periodOpeningMinute = periodOpeningTime.split(":")[1];
  const periodClosingHour = periodClosingTime.split(":")[0];
  const periodClosingMinute = periodClosingTime.split(":")[1];

  const pedriodOpeningIsLargerThanBookingOpening =
    parseInt(bookingOpeningHour, 10) < parseInt(periodOpeningHour, 10) ||
    (parseInt(bookingOpeningHour, 10) === parseInt(periodOpeningHour, 10) &&
      parseInt(bookingOpeningMinute, 10) <= parseInt(periodOpeningMinute, 10));
  const periodClosingIsSmallerThanBookingClosing =
    parseInt(bookingClosingHour, 10) > parseInt(periodClosingHour, 10) ||
    (parseInt(bookingClosingHour, 10) === parseInt(periodClosingHour, 10) &&
      parseInt(bookingClosingMinitue, 10) >= parseInt(periodClosingMinute, 10));
  const isOverLappedWithBooking =
    pedriodOpeningIsLargerThanBookingOpening &&
    periodClosingIsSmallerThanBookingClosing;
  return isOverLappedWithBooking;
};
