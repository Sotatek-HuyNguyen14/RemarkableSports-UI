import { AreaCode } from "../Districts";
import { DaysOfWeek, PlayerAppliedStatus } from "../Response";
import { Coach, Player, User } from "../User";
import { ClubResponse } from "./Club";
import { CourseApplicationStatus } from "./CourseApplication";
import { PaymentType } from "./Event";

export enum CourseType {
  Public = "Public",
  Private = "Private",
}

export enum CourseSessionStatus {
  Available = "Available",
  Applied = "Applied",
}
export interface CoursePaymentInfo {
  paymentType: PaymentType;
  phoneNumber?: string;
  bankAccount: string;
  identifier?: string;
  accountName: string;
  otherPaymentInfo: string;
  bankName: string;
  clubPaymentInfoId?: number;

  // For edit only
  personalId?: string | number;
}

export enum CourseCoachType {
  Head = "Head",
  Assistant = "Assistant",
  Private = "Private",
}

export interface CourseCoach {
  coach: Coach;
  coachId: string;
  customizedPrice?: string;
  coachType: CourseCoachType;
}

export interface CourseSessionV2 {
  isRecursive: boolean;
  startDate?: string; // leave null if not recursive
  endDate?: string; // leave null if not recursive
  daysOfWeek?: DaysOfWeek[]; // leave null if not recursive
  startTime?: string; // leave null if not recursive
  endTime?: string; // leave null if not recursive
  groupId?: number; // leave null if not recursive
  coaches: CourseCoach[];
  courseSessions: [
    {
      startDate: string;
      endDate: string;
      daysOfWeek: DaysOfWeek[];
      startTime: string;
      endTime: string;
      coaches: CourseCoach[];
    }
  ];
}

export interface CourseResponse {
  enquiryPhoneNumber?: string | undefined;
  id: number;
  name: string;
  district: string;
  address: string;
  description: string;
  level: string;
  capacity: number;
  fee: number;
  duration: number;
  maxAge: number;
  minAge: number;
  fromDate: string;
  toDate: string;
  startTime: string;
  endTime: string;
  daysOfWeek: DaysOfWeek[];
  playerAppliedStatus?: PlayerAppliedStatus;
  creator: User;
  playerApplicationId?: number;
  coachName?: string;
  coachId?: string;
  club?: ClubResponse;
  approvedParticipantNumber: number;
  area: AreaCode;
  creatorId: string;
  pendingParticipantNumber: number;
  minimumRequiredConsecutiveSession: string;
  courseImage?: {
    fileName: string;
    fileContent: string;
  };
  imageUrl?: string;
  courseType: CourseType;
  isRecursive: boolean;
  listAssignedPlayerId: string[];
  listOfflineUserName: string[];
  paymentInfo?: CoursePaymentInfo[];
  courseSessionGroups: CourseSessionV2[];
  paymentStatus: CoursePaymentStatus;
}

export interface CourseSessionPlayerEnrollmentResponse {
  playerInfo: Player;
  upcommingSessions: {
    courseId: number;
    courseSessionId: number;
    courseSessionFrom: Date;
    courseSessionTo: Date;
    groupId: number;
  }[];
}

export interface CourseSessionsResponse {
  courseId: number;
  courseSessionId: number;
  courseSessionFrom: Date;
  courseSessionTo: Date;
  groupId: number | string;
  courseSessionStatus?: CourseSessionStatus;
  coaches: CourseCoach[];
}

export interface SessionFromResponse {
  attendance?: AttendanceProps;
  player: Player;
  playerId: string | number;
  isEnrolled: boolean;
}
export interface AttendanceProps {
  courseId?: number | string;
  course?: CourseResponse;
  playerId?: number | string;
  status: AttendanceStatus;
}

export enum AttendanceStatus {
  Unknown = "Unknown",
  Present = "Present",
  Absent = "Absent",
  Leave = "Leave",
}

export interface CourseApplicationResponse {
  course: CourseResponse;
  courseId: number;
  createdAt: Date;
  deleted: boolean;
  playerId: string;
  playerInfo: Player;
  rejectReason?: string;
  status: CourseApplicationStatus;
  id: number;
  paymentStatus: CoursePaymentStatus;
  isOnline: boolean;
  name?: string;
  upcommingSessions: {
    courseId: number;
    courseSessionId: number;
    courseSessionFrom: Date;
    courseSessionTo: Date;
    groupId: number;
  }[];
  numberOfSessions: number;
  enrollmentStartDate: Date;
  amount: number;
}

export interface CourseEnrollmentStatus {
  applicantCount: number;
  capacity: number;
  courseSessionInfo: {
    courseId: number;
    courseSessionFrom: Date;
    courseSessionId: number;
    courseSessionTo: Date;
  };
  playerInfo: Player[];
}

export interface CourseEnrollment {
  courseId: number;
  courseSessionFrom: Date;
  courseSessionId: number;
  courseSessionTo: Date;
}

export interface CourseLeaveRequest {
  playerId: string;
  playerInfo: Player;
  courseSessionInfo: {
    courseId: number;
    courseSessionFrom: Date;
    courseSessionId: number;
    courseSessionTo: Date;
  };
  makeUpSessionInfo: {
    courseId: number;
    courseSessionFrom: Date;
    courseSessionId: number;
    courseSessionTo: Date;
  };
}

export enum CoursePaymentStatus {
  Unpaid = "Unpaid",
  Pending = "Pending",
  Paid = "Paid",
  Rejected = "Rejected",
  Refund = "Refund",
}
