import { ClubStatusType } from "../requests/Club";
import { ClubStaff, User } from "../User";
import {
  CourseApplicationResponse,
  CourseLeaveRequest,
  CourseResponse,
} from "./Course";
import { EventApplication, EventResponse, PaymentType } from "./Event";

export enum ClubRelationship {
  Admin = "Admin",
  Staff = "Staff",
  Coach = "Coach",
  Player = "Player",
  NA = "NA",
}

export enum ApplicationType {
  staff = "staff",
  coach = "coach",
  player = "player",
}

export enum ClubCoursStatus {
  Past = "Past",
  Active = "Active",
}

export interface ClubResponse {
  id: number | string;
  name: string;
  district: string;
  address: string;
  profilePictureUrl: string;
  clubCoaches?: ClubCoaches[] | null;
  approvalStatus?: ClubStatusType;
  adminClubStaffId: string;
  updatedAt: Date;
  createdAt: Date;
  relationship: ClubRelationship;
  adminClubStaffProfilePictureUrl: string;
  adminClubStaffFirstName: string;
  adminClubStaffLastName: string;
}

export interface userClubResponse {
  id: number | string;
  name: string;
  district: string;
  address: string;
  profilePicture: string;
  clubCoaches?: ClubCoaches[] | null;
  approvalStatus?: ClubStatusType;
  adminClubStaffId: string;
  updatedAt: Date;
  createdAt: Date;
  relationship: ClubRelationship;
  rejectReason?: string;
}

export interface ClubCoaches {
  coachId: string;
  clubId: string;
  club: userClubResponse;
  approvalStatus?: ClubStatusType;
  rejectReason?: string;
  relationship?: ClubRelationship;
}

export interface ClubPlayers {
  playerId: string;
  clubId: string;
  club: userClubResponse;
  approvalStatus?: ClubStatusType;
  rejectReason?: string;
  relationship?: ClubRelationship;
}

export interface ApplicantInfo {
  userType: string;
  id: string;
  firstName: string;
  lastName: string;
  email?: string;
  sex: string;
  profilePicture?: string;
  mobile?: string;
  description?: string;
  dateOfBirth?: Date;
  startYearAsCoach?: number;
}

export interface ClubApplicationResponse {
  applicationId: number | string;
  candidateId?: number | string;
  clubId: number | string;
  clubStaffId?: number | string;
  approvalStatus?: ClubStatusType;
  candidateInfo: ApplicantInfo | User | ClubStaff;
  clubInfo?: string;
  rejectReason?: string;
  updatedAt?: Date;
  createdAt?: Date;
  assistantPrice?: string;
  headPrice?: string;
  privatePrice?: string;
}

export interface ClubCoursePerformanceResponse {
  courseName: string;
  income: number;
  cost: number;
  profit: number;
  status: ClubCoursStatus;
  playerAttendances: PlayerAttendanceModel[];
}

export interface PlayerAttendanceModel {
  attendedSession: number;
  playerInfo: User;
  remainingSession: number;
}
export interface ClubMonthlySummaryResponse {
  fromDate: string;
  toDate: string;
  reports: ClubCoursePerformanceResponse[];
}

export interface ClubPaymentMethodResponse {
  id: number | string;
  clubId: number | string;
  paymentType: PaymentType;
  bankAccount?: string;
  identifier?: string;
  phoneNumber?: string;
  otherPaymentInfo?: string;
  accountName?: string;
  bankName?: string;
}

export interface ClubHomeCourseSummaryResponse {
  courseApplicationSummaries: [
    {
      course: CourseResponse;
      courseApplications: CourseApplicationResponse[];
    }
  ];
  courseLeaveApplicationSummaries: [
    {
      course: CourseResponse;
      leaveRequests: CourseLeaveRequest[];
    }
  ];
  coursePaymentEvidenceSummaries: [
    {
      course: CourseResponse;
      paymentEvidences: CourseApplicationResponse[];
    }
  ];
}

export interface ClubHomeEventSummaryResponse {
  eventApplicationSummary: [
    {
      event: EventResponse;
      eventApplications: EventApplication[];
    }
  ];
  eventPaymentEvidenceSummary: [
    {
      event: EventResponse;
      paymentEvidences: EventApplication[];
    }
  ];
}
