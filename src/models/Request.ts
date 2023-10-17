import { DaysOfWeek } from "./Response";

export enum AdminStepId {
  CoachApproval = "CoachApproval",
  ClubApproval = "ClubApproval",
  UpdateCoachApproval = "UpdateCoachApproval",
}

export enum AdminApprovalAction {
  Approve = "Approve",
  Reject = "Reject",
}

export enum VenueBookingApprovalAction {
  Approve = "Approve",
  Reject = "Reject",
}

export enum AreaCode {
  "HK" = "HK",
  "KLN" = "KLN",
  "NT" = "NT",
}

export enum Period {
  AM = "AM",
  PM = "PM",
}

export type DistrictCode = {
  HK: "HK.CW" | "HK.EA" | "HK.SO" | "HK.WC";
  KLN: "HK.KC" | "HK.KU" | "HK.SS" | "HK.WT" | "HK.YT";
  NT:
    | "HK.IS"
    | "HK.KI"
    | "HK.NO"
    | "HK.SK"
    | "HK.ST"
    | "HK.TP"
    | "HK.TW"
    | "HK.TM"
    | "HK.YL";
};

export enum ActivityType {
  Course = "Course",
  Event = "Event",
  Game = "Game",
  O3Coach = "O3Coach",
  Venue = "Venue",
  Fixture = "Fixture",
  Division = "Division",
}

export interface ProcessOnboardingRequest {
  workflowId: string;
  stepId: AdminStepId | null;
  approvalResult: AdminApprovalAction;
  reasonReject?: string;
}

export interface CourseFilteringRequest {
  area: AreaCode;
  district: string;
  minFee: number | null;
  maxFee: number | null;
  level: string;
  startDate: string | null;
  finishDate: string | null;
  startAfter: string | null;
  endBefore: string | null;
  clubName?: string | null;
  daysOfWeek: DaysOfWeek[] | null;
  courseName: string | null;
  clubId: string | null;
}

export interface CoachRequest {
  image: string;
  name: string;
  location: string;
  date: string;
  time: string;
  rate: string;
}

export interface ApproveVenueBookingRequest {
  venueId: number;
}

export interface RejectVenueBookingRequest {
  venueId: number;
  rejectReason: string;
}

export interface GetCourseBookingRequestData {
  id: number;
}
