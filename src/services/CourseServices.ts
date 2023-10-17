/* eslint-disable no-await-in-loop */
/* eslint-disable no-restricted-syntax */
/* eslint-disable no-useless-concat */
import axios from "axios";
import { extendMoment } from "moment-range";
import Moment from "moment";
/* eslint-disable no-param-reassign */
/* eslint-disable no-useless-concat */
import { formatCoreUrl } from "./ServiceUtil";
import { CourseFilteringRequest } from "../models/Request";
import { DaysOfWeek } from "../models/Response";
import {
  format12HTo24H,
  formatUtcToLocalDate,
  formatUtcToLocalTime,
} from "../utils/date";
import {
  ApplyLeaveCourseRequest,
  CreateCourseRequest,
  SessionFromRequest,
  UpdateCourseLeaveRequest,
  UpdateCoursePaymentEvidenceRequest,
  UpdateCoursePaymentStatusManuallyRequest,
  UpdateCourseSessionRequest,
  UpdateSessionFromRequest,
} from "../models/requests/Course";
import {
  CourseApplicationResponse,
  CourseCoachType,
  CourseEnrollment,
  CourseEnrollmentStatus,
  CourseLeaveRequest,
  CoursePaymentStatus,
  CourseResponse,
  CourseSessionPlayerEnrollmentResponse,
  CourseSessionV2,
  CourseSessionsResponse,
  SessionFromResponse,
} from "../models/responses/Course";
import { FormValue } from "../screens/AddCourse";
import { EventPaymentEvidence, PaymentType } from "../models/responses/Event";
import { UpdatePaymentStatusManuallyRequest } from "../models/requests/Event";
import { AddCourseSessionModel } from "../screens/AddCourse/AddSessionComponent";
import { CourseSessionType, generateUUID } from "../screens/AddCourseSession";
import { AssistantCoachModel } from "../screens/AddCourse/AddCoachComponent";
import { getUserName } from "../utils/name";
import { CourseApplicationStatus } from "../models/responses/CourseApplication";
import { ClubHomeCourseSummaryResponse } from "../models/responses/Club";

const moment = extendMoment(Moment);

export async function getCourses(params: CourseFilteringRequest) {
  const res = await axios.get<CourseResponse[]>(
    formatCoreUrl("/course"),
    typeof params !== "string"
      ? {
          params,
        }
      : {}
  );
  return res.data;
}

export async function getCourseById(id: number | string) {
  return axios
    .get<CourseResponse>(formatCoreUrl(`/course/${id}`))
    .then((res) => {
      return res.data;
    });
}

export async function updateCourse(payload: FormValue, id: string | number) {
  const formData = new FormData();
  formData.append("Name", payload.name);
  formData.append("Capacity", payload.capacity);
  formData.append("Fee", payload.fee);
  formData.append("Description", payload.description);
  formData.append("MinAge", payload.minAge || "");
  formData.append("MaxAge", payload.maxAge || "");
  formData.append("Level", payload.level || "");
  formData.append("FromDate", payload.fromDate);
  formData.append("ToDate", payload.toDate);
  if (payload.isNewImage) {
    formData.append("IsNewImage", payload.isNewImage);
  }
  formData.append(
    "DaysOfWeek",
    payload.daysOfWeek?.length
      ? payload.daysOfWeek?.toString()
      : `${DaysOfWeek.Monday},${DaysOfWeek.Tuesday},${DaysOfWeek.Wednesday},${DaysOfWeek.Thursday},${DaysOfWeek.Friday},${DaysOfWeek.Saturday},${DaysOfWeek.Sunday}`
  );
  if (payload.courseImage?.fileContent) {
    formData.append("CourseImage", {
      uri: payload.courseImage.fileContent,
      type: "image/jpeg",
      name: payload.courseImage.fileName,
    });
  }
  formData.append("StartTime", format12HTo24H(payload.startTime));
  formData.append("EndTime", format12HTo24H(payload.endTime));
  formData.append("District", payload.district);
  formData.append("Address", payload.address);
  formData.append("EnquiryPhoneNumber", payload.enquiryPhoneNumber);
  formData.append(
    "MinimumRequiredConsecutiveSession",
    payload.minimumRequiredConsecutiveSession
  );

  if (payload.coachName) formData.append("CoachName", payload.coachName);
  if (payload.coachId) formData.append("CoachId", payload.coachId);

  const res = await axios.post(formatCoreUrl(`/course/${id}`), formData, {
    headers: {
      "Content-Type": "multipart/form-data",
    },
  });
  return res;
}

export async function addCoursePaymentEvidence(
  applicationId: number | string,
  imageUrl: { fileName: string; fileContent: string }
) {
  const formData = new FormData();
  formData.append("Image", {
    uri: imageUrl.fileContent,
    type: "image/jpeg",
    name: imageUrl.fileName,
  });
  formData.append("PaymentType", "Course");
  const res = await axios.post(
    formatCoreUrl(`/paymentevidence/${applicationId}`),
    formData,
    {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    }
  );

  return res?.data;
}

export function mapCoursePaymentType(paymentType: PaymentType) {
  if (paymentType.toString() === "銀行") {
    return PaymentType.Bank;
  }

  if (paymentType.toString() === "其他") {
    return PaymentType.Others;
  }

  return paymentType;
}

export async function createCourseV2(payload: FormValue) {
  const data = payload;
  const courseFirstSession =
    payload.courseSessionGroups[payload.courseSessionGroups.length - 1];
  if (courseFirstSession) {
    if (courseFirstSession.isRecursive) {
      data.daysOfWeek = courseFirstSession.daysOfWeek;
      data.endTime = courseFirstSession.endTime ?? "";
      data.startTime = courseFirstSession.startTime ?? "";
      data.fromDate = courseFirstSession.startDate ?? "";
      data.toDate = courseFirstSession.endDate ?? "";
    } else {
      const firstNonRecursiveSessions = courseFirstSession.courseSessions[0];
      if (firstNonRecursiveSessions) {
        data.daysOfWeek = firstNonRecursiveSessions.daysOfWeek;
        data.endTime = firstNonRecursiveSessions.endTime ?? "";
        data.startTime = firstNonRecursiveSessions.startTime ?? "";
        data.fromDate = firstNonRecursiveSessions.startDate ?? "";
        data.toDate = firstNonRecursiveSessions.endDate ?? "";
      }
    }
  }
  const mappedPayment = data.paymentInfo?.map((payment) => {
    return {
      ...payment,
      paymentType: mapCoursePaymentType(payment.paymentType),
    };
  });
  data.paymentInfo = mappedPayment;
  const res = await axios.post(formatCoreUrl("/course"), data);
  return res;
}

export async function updateCourseV2(payload: FormValue, id: string | number) {
  const mappedPayment = payload.paymentInfo?.map((payment) => {
    return {
      ...payment,
      paymentType: mapCoursePaymentType(payment.paymentType),
    };
  });
  payload.paymentInfo = mappedPayment;
  const res = await axios.post(formatCoreUrl(`/course/${id}`), payload);
  return res;
}

export async function addCourseCreating(payload: FormValue) {
  const formData = new FormData();
  formData.append("Name", payload.name);
  formData.append("Capacity", payload.capacity);
  formData.append("Fee", payload.fee);
  formData.append("Description", payload.description);
  formData.append("MinAge", payload.minAge || "");
  formData.append("MaxAge", payload.maxAge || "");
  formData.append("Level", payload.level || "");
  // formData.append(
  //   "DaysOfWeek",
  //   payload.daysOfWeek?.length ? payload.daysOfWeek?.toString() : "NoSelection"
  // );
  if (payload.courseImage?.fileContent) {
    formData.append("CourseImage", {
      uri: payload.courseImage.fileContent,
      type: "image/jpeg",
      name: payload.courseImage.fileName,
    });
  }
  formData.append("District", payload.district);
  formData.append("Address", payload.address);
  formData.append("EnquiryPhoneNumber", payload.enquiryPhoneNumber);
  formData.append(
    "MinimumRequiredConsecutiveSession",
    payload.minimumRequiredConsecutiveSession
  );

  if (payload.coachName) formData.append("CoachName", payload.coachName);
  if (payload.coachId) formData.append("CoachId", payload.coachId);
  // TO-DO: Add payment method and course session if needed
  if (payload.courseSessionGroups)
    formData.append(
      "CourseSessionGroups",
      JSON.stringify(payload.courseSessionGroups)
    );
  formData.append("PaymentInfo", JSON.stringify(payload.paymentInfo));
  formData.append(
    "ListAssignedPlayerId",
    payload.listAssignedPlayerId.toString()
  );

  const res = await axios.post(formatCoreUrl("/course"), formData, {
    headers: {
      "Content-Type": "multipart/form-data",
    },
  });
  return res;
}

export async function deleteCoursesById(id: number) {
  const { data } = await axios.delete<CourseResponse[]>(
    formatCoreUrl(`/course/${id}`)
  );
  return data;
}

export async function getCourseSessions(courseId: string | number) {
  const { data } = await axios.get<CourseSessionsResponse[]>(
    formatCoreUrl(`/course/${courseId}/session`)
  );
  return data;
}
export async function addCourseSessions(payload: UpdateCourseSessionRequest) {
  const res = await axios.post(
    formatCoreUrl(`/course/${payload.courseId}/sessions`),
    { courseSessionGroups: payload.data }
  );
  return res;
}

export async function getSessionFrom(payload: SessionFromRequest) {
  const { data } = await axios.get<SessionFromResponse[]>(
    formatCoreUrl(`/course/${payload.id}/session/${payload.sessionId}`)
  );
  return data;
}

export async function getPlayerJoiningSession(
  courseId: string | number,
  sessionId: string | number
) {
  const res = await axios.get<CourseSessionPlayerEnrollmentResponse[]>(
    formatCoreUrl(
      `/course/${courseId}/session/${sessionId}/upcoming-enrollment`
    )
  );
  return res.data;
}

export async function updateSessionFrom(payload: UpdateSessionFromRequest) {
  const res = await axios.put(
    formatCoreUrl(
      `/course/${payload.id}/session/${payload.sessionId}/${payload.playerId}`
    ),
    payload
  );
  return res;
}

export async function addOfflineApplication(payload: {
  courseId: number | string;
  playerId: string;
  sessionId: string;
  sessionCount: string | number;
}) {
  await axios.post(formatCoreUrl(`/meetup/course/offline`), payload);
}
export async function getCourseApplication(courseId: string | number) {
  const { data } = await axios.get<CourseApplicationResponse[]>(
    formatCoreUrl(`/course/${courseId}/application`)
  );
  return data;
}

export async function getCourseEnrollmentStatus(courseId: string | number) {
  const { data } = await axios.get<CourseEnrollmentStatus[]>(
    formatCoreUrl(`/course/${courseId}/application/enrollment-status`)
  );
  return data;
}

export async function getCourseLeaveRequests(courseId: string | number) {
  const { data } = await axios.get<CourseLeaveRequest[]>(
    formatCoreUrl(`/course/${courseId}/leave`)
  );
  return data;
}

export async function updateCourseLeaveRequest(
  payload: UpdateCourseLeaveRequest
) {
  const { courseId } = payload;
  await axios.patch(
    formatCoreUrl(`/course/${courseId}/application/approval`),
    payload
  );
}

export async function getCourseApplicationEnrollment(
  courseId: number | string,
  playerId?: number | string
) {
  const { data } = await axios.get<CourseSessionsResponse[]>(
    formatCoreUrl(`/course/${courseId}/application/${playerId}/enrollment`)
  );
  return data;
}

export async function getCourseUserSessions(courseId: number | string) {
  const res = await axios.get<CourseSessionsResponse[]>(
    formatCoreUrl(`/course/${courseId}/user-sessions`)
  );
  return res.data;
}

export async function getMakeUpSessions(
  courseId: number | string,
  newSession = ""
) {
  if (newSession) {
    const res = await axios.get<CourseSessionsResponse[]>(
      formatCoreUrl(
        `/course/${courseId}/upcoming-session?dateFrom=${newSession}`
      )
    );
    return res.data || [];
  }
  const { data } = await axios.get<CourseSessionsResponse[]>(
    formatCoreUrl(`/course/${courseId}/upcoming-session`)
  );
  return data || [];
}

export async function applyLeaveCourse(payload: ApplyLeaveCourseRequest) {
  const { courseId, courseSessionIds } = payload;
  await axios.patch(formatCoreUrl(`/course/${courseId}/application`), {
    courseSessionIds,
  });
}

export function isCreatorForCourse(
  userId: string | number,
  course: CourseResponse
) {
  if (course && course.creator.id === userId) {
    return true;
  }

  return false;
}

export async function updateCoursePaymentStatusManually(
  payload: UpdateCoursePaymentStatusManuallyRequest
) {
  const res = await axios.patch(
    formatCoreUrl(`/paymentevidence/course/${payload.applicationId}`),
    payload
  );

  return res;
}

export async function getCoursePaymentEvidenceForApplication(
  applicationId: number | string
) {
  const res = await axios.get<EventPaymentEvidence>(
    formatCoreUrl(`/paymentevidence/${applicationId}?category=Course`)
  );
  return res.data;
}

export async function updateCoursePaymentStatus(
  payload: UpdateCoursePaymentEvidenceRequest
) {
  await axios.patch(
    formatCoreUrl(`/paymentevidence/${payload.applicationId}`),
    payload
  );
}

export async function getCourseEnrollmentapplication(
  courseId: string | number,
  userId: string
) {
  const res = await axios.get<CourseEnrollment[]>(
    formatCoreUrl(`/course/${courseId}/application/${userId}/enrollment`)
  );
  return res.data;
}

export async function removeCourseSession(
  sessionId: string | number,
  courseId: string | number
) {
  const res = await axios.delete(
    formatCoreUrl(`/course/${courseId}/session/${sessionId}`)
  );
  return res.data;
}

export async function removePlayerSessionInCourse(
  sessionId: string | number,
  courseId: string | number,
  applicationId: string | number
) {
  const res = await axios.delete(
    formatCoreUrl(
      `/course/${courseId}/application/${applicationId}/enrollment/${sessionId}`
    )
  );
  return res.data;
}

export async function getAllAvailableSessionsForMoving(
  courseId: string | number,
  playerId: string | number
) {
  const res = await axios.get<CourseSessionsResponse[]>(
    formatCoreUrl(`/course/${courseId}/session/user/${playerId}/un-apply`)
  );
  return res.data;
}

export async function getAllCoursesInClub(clubId: string | number) {
  const res = await axios.get<CourseResponse[]>(
    formatCoreUrl(`/course/club/${clubId}`)
  );
  return res.data;
}

export async function moveCourseSession(payload: {
  originalSessionId: number | string;
  newCourseId?: number | string; // nullable, only use when user move to session from another course
  newSessionId: number | string;
  oldCourseId: number | string;
  playerId: string | number;
  makeupSessionId?: string | number;
}) {
  await axios.post(
    formatCoreUrl(`/course/${payload.oldCourseId}/move-session`),
    payload
  );
}

export function mapCourseSessionResponseToAddCourseSessionModel(
  data: CourseSessionsResponse[]
) {
  const result: AddCourseSessionModel[] = [];
  data.forEach((session) => {
    const headCoach = session.coaches.filter(
      (c) =>
        c.coachType === CourseCoachType.Head ||
        c.coachType === CourseCoachType.Private
      // For private course the headCoach is the private coach
    )[0];

    const assistantCoaches: AssistantCoachModel[] =
      session.coaches
        .filter((c) => c.coachType === CourseCoachType.Assistant)
        .map((c) => {
          return {
            coachId: c.coachId,
            coachName: getUserName(c.coach)?.toString(),
            isCustomizePrice:
              c.customizedPrice && c.customizedPrice.toString() !== "0",
            customizePrice: c.customizedPrice,
          };
        }) || [];
    const resultModel: AddCourseSessionModel = {
      personalId: generateUUID(),
      type: session.groupId ? CourseSessionType.Loop : CourseSessionType.Single,
      date: formatUtcToLocalDate(session.courseSessionFrom),
      startTime: formatUtcToLocalTime(session.courseSessionFrom),
      endTime: formatUtcToLocalTime(session.courseSessionTo),
      startDate: formatUtcToLocalDate(session.courseSessionFrom),
      endDate: formatUtcToLocalDate(session.courseSessionTo),
      daysOfWeek: [],
      group: session.groupId || 0,
      childSessions: [],
      isEdited: false,
      isExpand: false,
      isLoopType: !!session.groupId,
      assistantCoaches,
      courseSessionId: session.courseSessionId,
      courseId: session.courseId,
      assignedCoach: headCoach ? headCoach.coachId : undefined,
      assignedCoachPrice:
        headCoach && headCoach.customizedPrice
          ? headCoach.customizedPrice
          : "0",
      isAssignedCoachCustomizePrice:
        headCoach &&
        headCoach.customizedPrice &&
        headCoach.customizedPrice !== "0",
      isExistingData: true,
    };
    result.push(resultModel);
  });
  return result;
}

export function getDaysOfWeekForSession(session: AddCourseSessionModel) {
  if (session.isExistingData) {
    // Get days of week by date
    if (session.date) {
      const day = new Date(session.date)
        .toLocaleString("en-US", { weekday: "long" })
        .split(",")[0];
      return [day as DaysOfWeek];
    }
    if (session.startDate) {
      const day = new Date(session.startDate)
        .toLocaleString("en-US", { weekday: "long" })
        .split(",")[0];
      return [day as DaysOfWeek];
    }
  }
  if (session.daysOfWeek && session.daysOfWeek.length > 0) {
    return session.daysOfWeek;
  }
  // Get days of week by date
  if (session.date) {
    const day = new Date(session.date)
      .toLocaleString("en-US", { weekday: "long" })
      .split(",")[0];
    return [day as DaysOfWeek];
  }
  if (session.startDate) {
    const day = new Date(session.startDate)
      .toLocaleString("en-US", { weekday: "long" })
      .split(",")[0];
    return [day as DaysOfWeek];
  }
  return [];
}

export async function removeCourseApplication(applicationId: string | number) {
  await axios.delete(formatCoreUrl(`/meetup/course/${applicationId}`));
}

export function isCourseSessionsUnique(sessions: AddCourseSessionModel[]) {
  const mappingSessions = sessions.map((s) => {
    return {
      Date: s.date,
      EndTime: format12HTo24H(s.endTime),
      StartTime: format12HTo24H(s.startTime),
    };
  });

  let includeInvalidTimeSession = false;
  mappingSessions.forEach((s) => {
    if (
      new Date("1/1/1999 " + `${s.StartTime}:00`) >
      new Date("1/1/1999 " + `${s.EndTime}:00`)
    ) {
      includeInvalidTimeSession = true;
    }
  });

  if (includeInvalidTimeSession) {
    return false;
  }

  const overlap = mappingSessions.map((r) =>
    mappingSessions
      .filter((q) => q !== r)
      .map((q) =>
        moment
          .range(
            moment(`${q.Date} ${q.StartTime}`),
            moment(`${q.Date} ${q.EndTime}`)
          )
          .overlaps(
            moment.range(
              moment(`${r.Date} ${r.StartTime}`),
              moment(`${r.Date} ${r.EndTime}`)
            )
          )
      )
  );
  return !overlap.map((x) => x.includes(true)).includes(true);
}

export async function postReapply(payload: {
  courseId: number;
  courseSessionIds: number[];
}) {
  const res = await axios.post(
    formatCoreUrl(`/meetup/course/re-apply`),
    payload
  );
  return res;
}

export async function getClubCourseSummary() {
  const res = await axios.get<ClubHomeCourseSummaryResponse>(
    formatCoreUrl("/course/summary")
  );
  const result: ClubHomeCourseSummaryResponse = {
    courseApplicationSummaries: res.data.courseApplicationSummaries || [],
    courseLeaveApplicationSummaries:
      res.data.courseLeaveApplicationSummaries || [],
    coursePaymentEvidenceSummaries:
      res.data.coursePaymentEvidenceSummaries || [],
  };
  return result;
}

export async function getCourseApplicationSummary() {
  const summary = await getClubCourseSummary();
  return summary.courseApplicationSummaries;
}

export async function getCourseLeaveRequestsSummary() {
  const summary = await getClubCourseSummary();
  return summary.courseLeaveApplicationSummaries;
}

export async function getCoursePaymentEvidencesSummary() {
  const summary = await getClubCourseSummary();
  return summary.coursePaymentEvidenceSummaries;
}
