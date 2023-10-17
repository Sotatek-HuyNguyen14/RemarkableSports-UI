import { Coach, Player } from "../User";
import { CourseResponse } from "./Course";

export enum ReportStatus {
  Active = "Active",
  Inactive = "Inactive",
}

export enum ReportCourseSessionStatus {
  Active = "Active",
  Past = "Past",
}

export interface ReportCourse {
  course: CourseResponse;
  courseSessionStatus: ReportCourseSessionStatus;
  expenditure: string;
  outstandingAmout: string;
}

export interface ReportPlayerResponse {
  player: Player;
  status: ReportStatus;
  courses: ReportCourse[];
  isOnline: boolean;
  name?: string;
}

export interface ReportCoachResponse {
  coach: Coach;
  workingHour: string;
  salary: string;
  clubProfit: string;
}
