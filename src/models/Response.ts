import { ClubResponse } from "./responses/Club";
import { Player, Role, User } from "./User";

export enum DaysOfWeek {
  Monday = "Monday",
  Tuesday = "Tuesday",
  Wednesday = "Wednesday",
  Thursday = "Thursday",
  Friday = "Friday",
  Saturday = "Saturday",
  Sunday = "Sunday",
}

export enum CourseBookingStatus {
  Pending = "Pending",
  Approve = "Approve",
  Reject = "Reject",
}

export enum Action {
  Approve = "Approve",
  Reject = "Reject",
}

export enum PlayerAppliedStatus {
  Applied = "Applied",
  Accepted = "Accepted",
  Null = "Null",
}

export interface TokenResponse {
  data: {
    access_token: string;
    token_type: string;
    expires_in: number;
    id_token: string;
    refresh_token: string;
  };
  access_token: string;
  token_type: string;
  expires_in: number;
  id_token: string;
  refresh_token: string;
  error: any;
  error_description: any;
}

export interface UserInfoResponse {
  sub: string;
  email: string;
  email_verified: boolean;
  role: Role[];
}

export interface GameResponse {
  name: string;
  level: string;
  date: Date;
  fromTime: string;
  toTime: string;
  district: string;
  venue: string;
}

export interface CourseBookingResponse {
  courseId: number;
  createdAt: Date;
  deleted: boolean;
  deletedAt?: Date;
  id: number;
  playerId: string;
  playerInfo: Player;
  enrollmentStartDate: Date;
  numberOfSessions: number;
  isOnline: boolean;
  name?: string;
  course: {
    id: number;
    name: string;
    description: string;
    area: string;
    district: string;
    location: string;
    type: string;
    level: string;
    capacity: number;
    fee: number;
    minAge: number;
    maxAge: number;
    daysOfWeek: string[];
    fromDate: string;
    toDate: string;
    startTime: string;
    endTime: string;
    creatorId: string;
    playerAppliedStatus?: PlayerAppliedStatus;
    creator: User;
    club?: ClubResponse;
  };
}
