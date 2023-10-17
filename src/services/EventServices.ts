/* eslint-disable no-restricted-syntax */
/* eslint-disable prefer-destructuring */
/* eslint-disable no-param-reassign */
/* eslint-disable import/prefer-default-export */
import axios from "axios";
import { parseISO } from "date-fns";
import ImageDirectory from "../assets";

import {
  AddEventParticipantRequest,
  CreateEventRequest,
  KickoutParticipantRequest,
  UpdateEventApplicationRequest,
  UpdateEventPaymentEvidenceRequest,
  UpdateEventRequest,
  UpdatePaymentStatusManuallyRequest,
} from "../models/requests/Event";
import {
  EventApplication,
  EventApplicationStatus,
  EventAttendanceRecord,
  EventAttendanceStatus,
  EventPaymentEvidence,
  EventPaymentStatus,
  EventPermissionResponse,
  EventResponse,
  EventSession,
} from "../models/responses/Event";
import { format12HTo24H } from "../utils/date";
import { formatName, getUserName } from "../utils/name";
import { formatCoreUrl } from "./ServiceUtil";
import { ClubStaff, User, UserType } from "../models/User";
import { getPostPermissionById } from "./ContentServices";
import { ClubHomeEventSummaryResponse } from "../models/responses/Club";

export async function createEvent(payload: CreateEventRequest) {
  payload.eventSessions = payload.eventSessions.map((value) => {
    let fromTimeFormated = value.fromTime;
    fromTimeFormated = fromTimeFormated.replace("上午", "AM");
    fromTimeFormated = fromTimeFormated.replace("下午", "PM");

    let toTimeFormated = value.toTime;
    toTimeFormated = toTimeFormated.replace("上午", "AM");
    toTimeFormated = toTimeFormated.replace("下午", "PM");
    return {
      ...value,
      fromTime: fromTimeFormated,
      toTime: toTimeFormated,
    };
  });
  const res = await axios.post(formatCoreUrl("/event"), payload);
  return res;
}

export async function updateEvent(
  payload: UpdateEventRequest,
  id: string | number
) {
  if (payload.eventSessions) {
    payload.eventSessions = payload.eventSessions.map((value) => {
      let fromTimeFormated = value.fromTime;
      fromTimeFormated = fromTimeFormated.replace("上午", "AM");
      fromTimeFormated = fromTimeFormated.replace("下午", "PM");

      let toTimeFormated = value.toTime;
      toTimeFormated = toTimeFormated.replace("上午", "AM");
      toTimeFormated = toTimeFormated.replace("下午", "PM");
      return {
        ...value,
        fromTime: fromTimeFormated,
        toTime: toTimeFormated,
      };
    });
  }
  const res = await axios.put(formatCoreUrl(`/event/${id}`), payload);
  return res;
}

export async function getEvents() {
  return axios.get<EventResponse[]>(formatCoreUrl("/event")).then((res) => {
    return res.data;
  });
}

export async function getEventById(id: number | string | undefined) {
  return axios.get<EventResponse>(formatCoreUrl(`/event/${id}`)).then((res) => {
    return res.data;
  });
}

export function isEventHappening(event: EventResponse) {
  const firstDay = event.eventSessions[0];
  if (firstDay) {
    if (firstDay.date && firstDay.toTime) {
      const endTime = parseISO(`${firstDay.date} ${firstDay.toTime}`);
      const isOutTime = endTime.getTime() < new Date().getTime();
      return isOutTime === false;
    }
  }

  return false;
}

export function isEventFinished(event: EventResponse) {
  const firstDay = event.eventSessions[event.eventSessions.length - 1];
  if (firstDay) {
    if (firstDay.date && firstDay.toTime) {
      const endTime = parseISO(`${firstDay.date} ${firstDay.toTime}`);
      const isOutTime = endTime.getTime() < new Date().getTime();
      return isOutTime === true;
    }
  }

  return false;
}

export function isCanCancel(event: EventResponse) {
  if (
    event.latestCancellation &&
    event.eventSessions.length &&
    event.latestCancellation
  ) {
    const firstDay = event.eventSessions[0];
    if (firstDay.date && firstDay.fromTime) {
      const startTime = parseISO(`${firstDay.date} ${firstDay.fromTime}`);
      const isOutTime =
        startTime.getTime() - event.latestCancellation * 3600000 >
        new Date().getTime();
      return isOutTime;
    }
    return true;
  }
  return true;
}

export function isCanApply(event: EventResponse) {
  if (event.latestCancellation && event.eventSessions.length) {
    const applicationDeadline = event.applicationDeadline?.valueOf();
    if (applicationDeadline) {
      return new Date().valueOf() <= applicationDeadline;
    }
  }
  return true;
}

export async function getEventPermissionById(id: number | string) {
  const res = await axios.get<EventPermissionResponse>(
    formatCoreUrl(`/event-permission/${id}`)
  );
  return res?.data;
}

export async function getAllEventPermission() {
  const res = await axios.get<EventPermissionResponse>(
    formatCoreUrl("/event-permission")
  );
  return res?.data;
}

export async function postEventPermission(payload: {
  userId: string;
  action: "Grant" | "Revoke";
}) {
  const res = await axios.post(formatCoreUrl("/event-permission"), payload);
  return res;
}

export async function updateEventApplication(
  payload: UpdateEventApplicationRequest
) {
  await axios.put(
    formatCoreUrl(`/event/application/${payload.applicationId}`),
    payload
  );
}

export async function addParticipant(payload: AddEventParticipantRequest) {
  await axios.post(
    formatCoreUrl(`/event/${payload.eventId}/application`),
    payload
  );
}

export async function kickOutParticipant(payload: KickoutParticipantRequest) {
  await axios.delete(
    formatCoreUrl(`/event/application/${payload.applicationId}`)
  );
}

export async function updatePaymentStatusManually(
  payload: UpdatePaymentStatusManuallyRequest
) {
  await axios.patch(
    formatCoreUrl(`/event/application/${payload.applicationId}`),
    payload
  );
}

export function getDisplayNameForApplication(application: EventApplication) {
  if (application.teamName) {
    return application.teamName;
  }
  if (application.eventParticipants.length === 2) {
    return application.eventParticipants
      .map((participant) => {
        return participant.participantName;
      })
      .join(", ");
  }
  if (application.eventParticipants[0]) {
    return application.eventParticipants[0].participantName;
  }

  if (application.applicant) {
    return getUserName(application.applicant);
  }
  return "";
}

export function getDisplayNameForAttendanceRecord(
  record: EventAttendanceRecord
) {
  if (record.teamName) {
    return record.teamName;
  }
  if (record.memberList.length >= 2) {
    return [record.memberList[0], record.memberList[1]].join(", ");
  }
  return record.memberList[0];
}

export function profilePictureForApplication(application: EventApplication) {
  return application.applicant.profilePicture;
}

export function isSinglePlayerApplicationEvent(application: EventApplication) {
  const isTeamApplication = application.teamName !== null;
  const isDoubleApplication =
    !isTeamApplication && application.eventParticipants.length === 2;
  const singleApplcation = !isTeamApplication && !isDoubleApplication;
  return singleApplcation;
}

export function getColorForApplication(application: EventApplication) {
  return application.eventApplicationStatus === EventApplicationStatus.Approved
    ? "rs_secondary.green"
    : application.eventApplicationStatus === EventApplicationStatus.Pending
    ? "rs_secondary.orange"
    : "rs_secondary.error";
}

export function getPaymentStatusColorForApplication(
  application: EventApplication
) {
  return application.paymentStatus === EventPaymentStatus.Paid
    ? "rs_secondary.green"
    : application.paymentStatus === EventPaymentStatus.Pending
    ? "rs_secondary.orange"
    : "rs_secondary.error";
}

export async function getAllSessionsForEvent(
  eventId: string | number | undefined
) {
  const res = await axios.get<EventSession[]>(
    formatCoreUrl(`/event/${eventId}/session`)
  );
  return res.data;
}

export async function getAllParticipantInSessionForEvent({
  eventId,
  sessionId,
}: {
  sessionId: string | number | undefined;
  eventId: string | number | undefined;
}) {
  const res = await axios.get<EventAttendanceRecord[]>(
    formatCoreUrl(`/event/${eventId}/session/${sessionId}`)
  );
  return res.data;
}

export async function updateEventAttendanceRecord(
  payload: {
    status: EventAttendanceStatus;
    eventId: string | number;
    applicationId: string | number;
  },
  sessionId: string | number | undefined
) {
  await axios.put(
    formatCoreUrl(
      `/event/${payload.eventId}/session/${sessionId}/${payload.applicationId}`
    ),
    payload
  );
}

export async function updatePaymentEvidenceStatus(
  payload: UpdateEventPaymentEvidenceRequest
) {
  await axios.patch(
    formatCoreUrl(`/paymentevidence/${payload.applicationId}`),
    payload
  );
}

export async function deleteEventById(id: number | string) {
  const { data } = await axios.delete(formatCoreUrl(`/event/${id}`));
  return data;
}

export async function getPaymentEvidenceForApplication(
  applicationId: number | string
) {
  const res = await axios.get<EventPaymentEvidence>(
    formatCoreUrl(`/paymentevidence/${applicationId}`)
  );
  return res.data;
}

export function isCreatorForEvent(user: User, event: EventResponse) {
  if (event && event.creator.id === user.id) {
    return true;
  }

  if (user.userType === UserType.ClubStaff) {
    const staffUser = user as ClubStaff;
    if (staffUser.club && staffUser.club.id) {
      return staffUser.club.id === event.club?.id;
    }
  }

  return false;
}

export async function getClubEventSummary() {
  const res = await axios.get<ClubHomeEventSummaryResponse>(
    formatCoreUrl("/event/summary")
  );
  const result: ClubHomeEventSummaryResponse = {
    eventApplicationSummary: res.data.eventApplicationSummary || [],
    eventPaymentEvidenceSummary: res.data.eventPaymentEvidenceSummary || [],
  };
  return result;
}

export async function getAddEventPermissions(userId: string | number) {
  const content = await getPostPermissionById(userId);
  const event = await getEventPermissionById(userId);

  const canCreate = event && event.canCreate;
  const canPost = content && content.canPost;
  return { canCreate, canPost };
}

export async function getEventApplicationsSummary() {
  const summary = await getClubEventSummary();
  return summary.eventApplicationSummary;
}

export async function getEventPaymentEvidencesSummary() {
  const summary = await getClubEventSummary();
  return summary.eventPaymentEvidenceSummary;
}
