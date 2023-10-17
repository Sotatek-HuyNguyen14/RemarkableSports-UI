import { O3CoachingAction } from "../../services/O3Services";
import { AreaCode } from "../Districts";

export interface CreateO3Request {
  area: AreaCode;
  district: string;
  fromTime: Date;
  endTime: Date;
  minTuitionFee: number;
  maxTuitionFee: number;
  venue?: string;
}

// The same as CreateO3Request but with selected Coach
export interface SubmitO3Request {
  coachId: string;
  area: AreaCode;
  district: string;
  fromTime: Date;
  endTime: Date;
  venue?: string;
  proposedFee: string;
}

export enum O3UpdateAction {
  PickCoach = "PickCoach",
  ApplyCoaching = "ApplyCoaching",
}

export interface UpdateO3Request {
  id: number;
  action: O3UpdateAction;
  parameters: {
    // for pick coach
    coachId?: string;
    // for apply coaching
    fee?: number;
    venue?: string;
  };
}

export interface DeleteO3Request {
  id: number;
}

export interface MeetupRequest {
  fromTime: Date;
  toTime: Date;
}

export interface O3CoachAcceptRejectMeetupRequest {
  action: O3CoachingAction;
  parameters: {
    coachId: string; // nullable
    fee?: number; // nullable
    venue?: string; // nullable
    noShow?: boolean; // default false
    comments?: string; // nullable
  };
  meetupId: string | number;
}
