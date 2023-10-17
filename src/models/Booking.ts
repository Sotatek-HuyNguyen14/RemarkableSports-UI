import { ClubStaff, Player } from "./User";
import { Venue } from "./requests/Venue";
import { ClubResponse, userClubResponse } from "./responses/Club";

export enum VenueBookingStatus {
  Approved = "Approve",
  Rejected = "Reject",
  Pending = "Pending",
  Cancelled = "Cancelled",
  Completed = "Completed",
}

export interface VenueBooking {
  id: number;
  venue: Venue;
  venueId: number;
  playerId: string;
  fromTime: Date;
  toTime: Date;
  status: string;
  rejectReason: string;
  createdAt: Date;
  bookerId: string;
  bookerInfo: Player;
  remarks?: string;
  type?: string;
  isCreatedByClubStaff: boolean;
  club: ClubResponse;
  amount: string;
  noOfTables: string;
  totalBookingHours: string;
  selectedTimeSlots: {
    fromTime: string;
    toTime: string;
    slot: string | number;
  }[];
  selectedDate: string;
}
