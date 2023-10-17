import {
  ClubCoaches,
  ClubPlayers,
  ClubRelationship,
  userClubResponse,
} from "./responses/Club";

export enum Role {
  Admin = "Admin",
  Organizer = "Organizer",
}

export enum UserType {
  Player = "Player",
  Coach = "Coach",
  ClubStaff = "Club",
  Organizer = "Organizer",
}

export interface User {
  id: string;
  sub: string; // id of the user
  firstName: string;
  lastName: string;
  mobile: string;
  sex: string;
  dateOfBirth: Date;
  userType: UserType;
  role: Role[];
  achievements?: string[];
  description: string;
  email: string;
  email_verified: boolean;
  profilePicture?: string;
  chineseName?: string;
  is_trial: boolean;
}

export interface Player extends User {
  handUsed: string;
  style: string;
  blade: string;
  rubber: string;
  backRubber: string;
  ranking: string;
  hkttaId: string;
  startYearAsPlayer: number;
  playerLevel: string;
  profilePicture?: string;
  clubPlayers?: ClubPlayers[] | null;
}

export interface Coach extends Player {
  startYearAsCoach: number;
  licenseNumber: string;
  coachLevel: string;
  fee: number;
  districts: string[];
  coachApproval: string;
  clubCoaches?: ClubCoaches[] | null;
  isBookMarked?: boolean;
}

export interface ClubStaff extends User {
  districts: string[];
  clubName: string;
  address: string;
  clubApproval: string;
  profilePicture?: string;
  club?: userClubResponse;
  clubRelationship?: ClubRelationship;
  applyClubStatus?: string;
}
