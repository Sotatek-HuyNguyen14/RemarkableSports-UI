import { EventDay, EventPaymentInfo } from "../../models/requests/Event";
import { User, Player, Coach, ClubStaff } from "../User";
import { ClubResponse } from "./Club";

export interface EventSession {
  eventId: number;
  eventSessionId: string;
  date: string;
  from: string;
  to: string;
  address: string;
}

export enum EventAttendanceStatus {
  Unknown = "Unknown",
  Present = "Present",
  Absent = "Absent",
  Leave = "Leave",
}

export interface EventAttendanceRecord {
  applicationId: number;
  teamName?: string;
  memberList: string[];
  attendance: {
    eventId: number;
    applicationId: number;
    status: EventAttendanceStatus;
  };
  applicantImageUrl?: string;
}

export enum EventPaymentStatus {
  Pending = "Pending",
  Unpaid = "Unpaid",
  Paid = "Paid",
  Rejected = "Rejected",
}

export enum EventApplicationStatus {
  Approved = "Approved",
  Rejected = "Rejected",
  Pending = "Pending",
  WaitingList = "WaitingList",
}

export interface EventParticipants {
  id: number;
  eventApplicationId: number;
  participantName: string;
}

export interface EventApplication {
  id: number;
  eventId: number;
  teamName?: string;
  applicant: Player | Coach | ClubStaff;
  eventApplicationStatus: EventApplicationStatus;
  eventParticipants: EventParticipants[];
  rejectReason?: string;
  paymentStatus: EventPaymentStatus | PaymentStatus;
  isOnline: boolean;
  applicationRejectReason?: string;
}
export enum EventType {
  Competition = "Competition",
  Others = "Others",
  OpenDay = "OpenDay",
  GroupBallGame = "GroupBallGame",
}

export enum EventPaymentAction {
  Paid = "Paid",
  Unpaid = "Unpaid",
}

export enum EventFpsType {
  PhoneNumber = "Phone number",
  Identifier = "Identifier",
  Both = "Both of them",
}

export enum CompetitionType {
  Single = "Single",
  Double = "Double",
  Team = "Team",
}

export enum PaymentStatus {
  Unpaid = "Unpaid",
  Pending = "Pending",
  Paid = "Paid",
  Rejected = "Rejected",
}

export interface EventResponse {
  id: string | number;
  type: EventType;
  name: string;
  competitionType: CompetitionType;
  capacity: number;
  fee?: number;
  address: string;
  description: string;
  district: string;
  isApproval: boolean;
  latestCancellation: number;
  paymentInfo?: EventPaymentInfo[];
  eventSessions: EventDay[];
  image?: {
    fileName: string;
    fileContent: string;
  };
  creator: User | Player | Coach | ClubStaff;
  imageUrl?: string;
  applicationDeadline?: Date;
  eventApplications: EventApplication[];
  club: ClubResponse;
  isHost: boolean;
}

export enum PaymentType {
  Payme = "Payme",
  FPS = "FPS",
  Bank = "Bank",
  Others = "Others",
}

export interface EventPermissionResponse {
  canCreate: boolean;
  createdAt: Date;
  id: number;
  updatedAt: Date;
  userId: string;
}

export interface EventPaymentEvidence {
  id: number;
  submitter: User | Player | Coach | ClubStaff;
  imageUrl: string;
}
