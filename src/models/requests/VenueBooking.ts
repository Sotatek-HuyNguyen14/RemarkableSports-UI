export enum VenueAction {
  BookVenue = "BookVenue",
}

export interface CreateVenueBookingRequest {
  venueId: number;
  action: VenueAction;
  selectedTimeSlots: { fromTime: Date; totime: Date }[];
}
