import { ActivityType } from "../Request";

export interface extraType {
  courseApplicationId?: number;
  courseCreatorName?: string;
  courseId?: number;
  courseLevel?: string;
  o3CoachId?: number;
  o3CoachName?: string;
  venueBookingId?: number;
  venueClubId?: string;
  venueClubName?: string;
  venueId?: number;
  eventId?: number;
  eventApplicationId?: number;
  fixtureId?: number;
  divisionId?: number;
  leagueId?: string | number;
  leagueName?: string;
}

export interface CalendarResponse {
  name: string;
  extra: extraType;
  startTime: Date;
  endTime: Date;
  location: string;
  status: string;
  meetupType: ActivityType;
}

interface timeRangeType {
  from: Date;
  to: Date;
}

export interface summaryCount {
  noShow: number;
  onGoing: number;
  past: number;
  pending: number;
}

export interface summaryType {
  course: summaryCount;
  o3Coach: summaryCount;
  total: summaryCount;
  venue: summaryCount;
  timeRange?: timeRangeType;
}

export function formatId(c: CalendarResponse) {
  switch (c.meetupType) {
    case ActivityType.Course:
      return `${c.meetupType}_${
        c.extra.courseApplicationId
      }_${c.startTime.toISOString()}`;
    case ActivityType.O3Coach:
      return `${c.meetupType}_${c.extra.o3CoachId}`;
    case ActivityType.Venue:
      return `${c.meetupType}_${c.extra.venueBookingId}`;
    case ActivityType.Event:
      return `${c.meetupType}_${c.extra.eventId}_${c.startTime.toISOString()}`;
    case ActivityType.Fixture:
      return `${c.meetupType}_${
        c.extra.fixtureId
      }_${c.startTime.toISOString()}`;
    default:
      return undefined;
  }
}

export function formatResoucreId(c: CalendarResponse) {
  switch (c.meetupType) {
    case ActivityType.Course:
      return `${c.meetupType}_Resource_${c.extra.courseId}`;
    case ActivityType.O3Coach:
      return `${c.meetupType}_Resource_${c.extra.o3CoachId}`;
    case ActivityType.Venue:
      return `${c.meetupType}_Resource_${c.extra.venueId}`;
    default:
      return undefined;
  }
}
