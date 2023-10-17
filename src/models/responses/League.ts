import { ClubStaff, Coach, Player, User } from "../User";

/* eslint-disable import/prefer-default-export */
export enum Tier {
  DivisionA = "A",
  DivisionB = "B",
  DivisionC = "C",
  DivisionD = "D",
}

export enum TeamApplicationStatus {
  Pending = "Pending",
  Approved = "Approved",
  Rejected = "Rejected",
}

export enum FixtureType {
  fixture = "Fixture",
  result = "Result",
}
export interface DivisionModel {
  id: number;
  name: string;
  tier: string;
  teams: TeamModel[];
  leagueId?: number;
  leagueName?: string;
}

export interface LeagueResponse {
  id: number;
  divisions: DivisionModel[];
  name: string;
  season: string;
  creator: User;
}

export interface Fixture {
  id: number;
  date: string;
  time: string;
  venue: string;
  homeTeam: {
    id: number;
    name: string;
    members: TeamMember[]; // List of User Info
  };
  awayTeam: {
    id: number;
    name: string;
    members: TeamMember[]; // List of User Info
  };
  division: DivisionModel;
  season: number;
  round: number;
}

export interface TeamModel {
  creatorId: string;
  id: number;
  name: string;
  members: TeamMember[];
}

export interface TeamMember {
  id: number;
  teamId: number;
  userId: string;
  status: TeamApplicationStatus;
  rejectReason?: string;
  memberInfo?: Player | Coach | ClubStaff;
}

export interface FixtureResponse {
  id: number;
  date: Date;
  time: Date;
  venue: string;
  homeTeam: TeamModel;
  awayTeam: TeamModel;
  division: DivisionModel;
  season: number;
  round: number;
}

export interface GroupedFixtureBySessionAndRound {
  season: number;
  round: number;
  fixtures: FixtureResponse[];
}

export interface GroupedMatchResultsByFixtureSessionAndRound {
  season: number;
  round: number;
  matchResults: DivisionMatchResultResponse[];
}

export interface MatchPlayer {
  userId: string | undefined;
  id: number;
  matchResultId: number;
  teamMemberId: number;
  playerName: string;
  sex: string;
  isForeign: boolean;
  teamId: string | number;
  isHomePlayer?: boolean;
}

export interface MatchSetResult {
  id: number;
  gameResultId: number;
  setNumber: number;
  homePlayerScore: number;
  awayPlayerScore: number;
}

export interface MatchGameResult {
  id: number;
  matchResultId: number;
  gameNumber: number;
  homePlayerName: string;
  homePlayerAvatarURL?: string;
  awayPlayerAvatarURL?: string;
  awayPlayerName: string;
  setResults: MatchSetResult[];
  homeSetResult: number;
  awaySetResult: number;
  userId: string;
}

export enum DivisionMatchResultStatus {
  Pending = "Pending",
  Acknowledged = "Acknowledged",
  Approved = "Approved",
  Rejected = "Rejected",
}

export interface DivisionMatchResultResponse {
  id: number;
  fixtureId?: number;
  homeTeamPlayers: MatchPlayer[];
  awayTeamPlayers: MatchPlayer[];
  gameResults: MatchGameResult[];
  homePlayerPoint: number;
  awayPlayerPoint: number;
  awayTotalPoints: number;
  homeAdditionalPoint: number;
  awayAdditionalPoint: number;
  homeTotalPoints: number;
  fixture: FixtureResponse;
  status: DivisionMatchResultStatus;
  rejectReason?: string;
  submitted?: boolean;
}

export interface IndividualMatchRecordsResponse {
  id: number;
  gameRecords: GameRecordsModel[];
  individualResult: individualResultModel;
}

export interface GameRecordsModel {
  date: string;
  gameResult: MatchGameResult;
  opponentTeam: TeamModel;
  opponentName: string;
  isOpponentHome: boolean;
  divisionName: string;
  round: number;
  time: string;
}

export interface individualResultModel {
  gamePlayed: number;
  gameWinned: number;
  player: {
    id: number;
    memberInfo: User | Coach | ClubStaff | Player;
    rejectReason: string;
    status: TeamApplicationStatus;
    teamId: number;
    userId: string;
  };
  points: number;
  team: TeamModel;
  winRate: number;
}

export interface LeaderboardIndividualResponse {
  id: number;
  gamePlayed: number;
  gameWinned: number;
  points: number;
  winRate: number;
  player: {
    id: number;
    memberInfo: User | Coach | ClubStaff | Player;
    rejectReason: string;
    status: TeamApplicationStatus;
    teamId: number;
    userId: string;
  };
  team: TeamModel;
}

export interface LeaderboardTeamResponse {
  id: number;
  matchDrew: number;
  matchLost: number;
  matchPlayed: number;
  matchWinned: number;
  points: number;
  team: TeamModel;
}
export interface TeamsStatisticResponse {
  matchResults: DivisionMatchResultResponse[];
  individualResults: LeaderboardIndividualResponse[];
}
