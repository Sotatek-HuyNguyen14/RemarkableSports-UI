import { AreaCode } from "../Districts";
import { Coach, Player } from "../User";

export enum O3MeetupStatus {
  Pending = "Pending",
  Matched = "Matched",
  Completed = "Completed",
  LateCancelled = "LateCancelled",
  Cancelled = "Cancelled",
  Rejected = "Rejected",
}

export interface AppliedCoach {
  oneOnOneCoachId: number;
  fee: number;
  coachInfo: Coach;
  coachId: string;
  venue?: string;
  score: number;
  isNotInterested: boolean;
}

export interface O3Response {
  createdAt: Date;
  id: number;
  area: AreaCode;
  district: string;
  fromTime: Date;
  endTime: Date;
  minTuitionFee: number;
  maxTuitionFee: number;
  status: O3MeetupStatus;
  appliedCoachs: AppliedCoach[];
  pickedCoachId: string | null;
  playerInfo: Player;
  venue?: string;
  playerComments?: string;
  coachComments?: string;
  oneOnOneCoachSuggestion: string;
  isOthers: boolean;
  isByAI: boolean;
  proposedFee: string;
}

export interface ContactResponse {
  numberOfMeetup: number;
  playerInfo: Player;
  playerId: string;
  oneOnOneCoachs: OneOnOneCoachsModel[];
}

export interface LocalContactsData extends ContactResponse {
  times: number;
}
export interface OneOnOneCoachsModel {
  id: number;
  playerId: string;
  area: string;
  district: string;
  fromTime: Date;
  endTime: Date;
  minTuitionFee: number;
  maxTuitionFee: number;
  status: OneOnOneStatus;
  playerStatus: OneOnOnePersonStatus;
  coachStatus: OneOnOnePersonStatus;
  appliedCoachs: AppliedCoach[];
  pickedCoachId: string;
  playerInfo: Player;
  venue: string;
  venueCreator: string;
  createdAt: Date;
  playerComments: string;
  coachComments: string;
  oneOnOneCoachSuggestion: string;
  isOthers: false;
}

export enum OneOnOneStatus {
  Matched = "Matched",
  Completed = "Completed",
  LateCancelled = "LateCancelled",
  Cancelled = "Cancelled",
  NoShow = "NoShow",
  Rejected = "Rejected",
}

export enum OneOnOnePersonStatus {
  NA = "NA",
  Show = "Show",
  PlayerNoShow = "PlayerNoShow",
  CoachNoShow = "CoachNoShow",
  PlayerLateCancel = "PlayerLateCancel",
  CoachLateCancel = "CoachLateCancel",
}
