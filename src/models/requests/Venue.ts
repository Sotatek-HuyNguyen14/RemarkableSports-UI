import { AreaCode } from "../Request";
import { ClubResponse } from "../responses/Club";

export interface Venue {
  id: number;
  name: string;
  area: AreaCode;
  district: string;
  description?: string;
  imageUrl?: string;
  address: string;
  fee: number;
  phoneNo: string;
  numberOfTables: number;
  date?: Date;
  openingTime: string;
  closingTime: string;
  availableTimeSlots?: Array<{ fromTime: Date; toTime: Date }>;
  ballsProvided: boolean;
  cancellationPeriod?: string;
  status?: "Open" | "Closed";
  sameForEveryDay: boolean;
  listVenueOpeningHours: {
    dayOfWeek: number;
    openingTime: string;
    closingTime: string;
  }[];
  club?: ClubResponse;
}

export interface CreateVenueRequest {
  name: string;
  area: AreaCode;
  district: string;
  address: string;
  phoneNo: string;
  numberOfTables: string;
  fee: string;
  ballsProvided: boolean;
  openingTime: string;
  closingTime: string;
  venueImage?: {
    fileName: string;
    fileContent: string;
  };
  cancellationPeriod?: string;
  sameForEveryDay: boolean;
  listVenueOpeningHoursDtos: {
    dayOfWeek: number;
    openingTime: string;
    closingTime: string;
  }[];
}

export interface SearchVenueParams {
  name?: string;
  clubId?: string;
  area?: string;
  district?: string;
  numberOfTables?: string;
  fromTime?: string;
  toTime?: string;
  fromFee?: string;
  toFee?: string;
}
