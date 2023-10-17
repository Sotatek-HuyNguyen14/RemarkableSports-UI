import { Action, DaysOfWeek } from "../Response";
import {
  CoursePaymentInfo,
  CourseSessionV2,
  CourseType,
} from "../responses/Course";

export interface CreateCourseRequest {
  id?: string | number;
  name: string;
  capacity: string;
  fee: string;
  description: string;
  level?: string | null;
  minAge?: string | null;
  maxAge?: string | null;
  district: string;
  address: string;
  enquiryPhoneNumber: string;
  startTime: string;
  endTime: string;
  fromDate: string;
  toDate: string;
  daysOfWeek?: DaysOfWeek[] | null;
  coachName?: string | null;
  coachId?: string | null;
  minimumRequiredConsecutiveSession: string;
  courseImage?: {
    fileName: string;
    fileContent: string;
  } | null;
  isNewImage?: boolean;
  courseType: CourseType;
  isRecursive: boolean;
  listAssignedPlayerId: string[];
  listOfflineUserName: string[];
  paymentInfo?: CoursePaymentInfo[];
  courseSessionGroups: CourseSessionV2[];
}

export interface ApplyLeaveCourseRequest {
  courseSessionIds: number[];
  courseId: string | number;
}

export interface SessionFromRequest {
  id: string | number;
  sessionId: string | number;
}

export interface UpdateSessionFromRequest {
  id: string | number;
  sessionId: string | number;
  playerId: string | number;
}

export interface ApplyCourseRequest {
  courseId: number;
  courseSessionIds: number[]; // new field
}

export interface UpdateCourseLeaveRequest {
  playerId: string;
  courseSessionIds: number[];
  action: Action;
  courseId: string | number;
  rejectReason?: String;
}

export interface UpdateCoursePaymentStatusManuallyRequest {
  action: CoursePaymentAction;
  applicationId: string | number;
  refundReason?: string;
  refundAmout?: string | number;
  others?: {};
}

export interface UpdateCoursePaymentEvidenceRequest {
  applicationId: number | string;
  action: "Approve" | "Reject";
  parameters?: {
    reasonReject?: string;
  };
  paymentType: "Course";
}

export enum CoursePaymentAction {
  Unpaid = "Unpaid",
  Paid = "Paid",
  Refund = "Refund",
}

export interface UpdateCourseSessionRequest {
  courseId: number;
  data: CourseSessionV2[];
}

export interface courseSessionsRequest {
  startDate: string;
  endDate?: string;
  daysOfWeek?: DaysOfWeek[] | null;
  startTime: string;
  endTime: string;
  coachId?: string;
}
