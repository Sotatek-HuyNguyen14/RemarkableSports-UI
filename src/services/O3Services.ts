import axios from "axios";
import {
  CreateO3Request,
  DeleteO3Request,
  O3CoachAcceptRejectMeetupRequest,
  O3UpdateAction,
  SubmitO3Request,
  UpdateO3Request,
} from "../models/requests/O3Request";
import { summaryType } from "../models/responses/Calendar";
import {
  ContactResponse,
  O3MeetupStatus,
  O3Response,
} from "../models/responses/O3Response";
import { Coach } from "../models/User";
import { formatMeetupApiUrl } from "./ServiceUtil";

export enum O3CoachingStatus {
  Available = "Available",
  Applied = "Applied",
  Coaching = "Coaching",
}

export enum O3CoachingAction {
  HideCoach = "HideCoach",
  HideMeeting = "HideMeeting",
  PickCoach = "PickCoach",
  ApplyCoaching = "ApplyCoaching",
  ReportNoShowLeaveFeedback = "ReportNoShowLeaveFeedback",
  CoachAcceptRequest = "CoachAcceptRequest",
  CoachRejectRequest = "CoachRejectRequest",
}

export async function queryO3CoachMeetups(status: O3CoachingStatus) {
  const res = await axios.get(formatMeetupApiUrl("/1on1"), {
    params: { coachingStatus: status },
  });
  return res.data;
}

export async function queryContacts() {
  const res = await axios.get<ContactResponse[]>(
    formatMeetupApiUrl("/1on1/contact")
  );

  return res.data;
}
export async function queryContactById(playerId: string) {
  const res = await axios.get<ContactResponse>(
    formatMeetupApiUrl(`/1on1/contact/${playerId}`)
  );

  return res.data;
}

export async function queryO3Meetups(status: O3MeetupStatus) {
  return axios
    .get(formatMeetupApiUrl("/1on1"))
    .then((res) =>
      Array.isArray(res.data) ? res.data.filter((d) => d.status === status) : []
    );
}

export async function queryO3MeetupsById(o3CoachId: number | string) {
  const res = await axios.get<O3Response>(
    formatMeetupApiUrl(`/1on1/${o3CoachId}`)
  );
  return res?.data;
}

export async function createO3Meetup(payload: CreateO3Request) {
  await axios.post(formatMeetupApiUrl("/1on1"), payload);
}

export async function submitO3Meetup(payload: SubmitO3Request) {
  const res = await axios.post<O3Response>(
    formatMeetupApiUrl("/1on1/request"),
    payload
  );
  return res.data;
}

export async function applyRequest(
  meetupId: number,
  fee: number,
  venue?: string
) {
  const payload: UpdateO3Request = {
    id: meetupId,
    action: O3UpdateAction.ApplyCoaching,
    parameters: {
      fee,
      venue,
    },
  };
  await axios.put(formatMeetupApiUrl(`/1on1/${meetupId}`), payload);
}

export async function pickCoach(meetupId: number, coachId: string) {
  const payload: UpdateO3Request = {
    id: meetupId,
    action: O3UpdateAction.PickCoach,
    parameters: {
      coachId,
    },
  };
  await axios.put(formatMeetupApiUrl(`/1on1/${meetupId}`), payload);
}

export async function cancelMeetCoachO3Request(payload: DeleteO3Request) {
  const res = await axios.delete(formatMeetupApiUrl(`/1on1/${payload.id}`));
  return res;
}

export async function getMeetupSummaryRequest() {
  const { data } = await axios.get<summaryType>(
    formatMeetupApiUrl("/summary/")
  );
  return data;
}

export async function o3HideMeetup(
  meetupId: number,
  coachId: string,
  action: O3CoachingAction = O3CoachingAction.HideCoach
) {
  await axios.put(formatMeetupApiUrl(`/1on1/${meetupId}`), {
    action,
    parameters: { coachId },
  });
}

export async function provideFeedback(
  meetupId: number,
  comments: string,
  noShow = false
) {
  await axios.put(formatMeetupApiUrl(`/1on1/${meetupId}`), {
    action: "LeaveFeedback",
    parameters: { noShow, comments },
  });
}

export async function o3CoachAcceptRejectMeetup(
  payload: O3CoachAcceptRejectMeetupRequest
) {
  await axios.put(formatMeetupApiUrl(`/1on1/${payload.meetupId}`), payload);
}

export async function getCoachList() {
  const res = await axios.get<Coach[]>(formatMeetupApiUrl("/1on1/coachList"));
  return res.data;
}

export async function addBookmark(coachId: number | string) {
  const res = await axios.post(formatMeetupApiUrl(`/1on1/bookmark/${coachId}`));
  return res.data;
}

export async function cancelBookmark(coachId: number | string) {
  const res = await axios.delete(
    formatMeetupApiUrl(`/1on1/bookmark/${coachId}`)
  );
  return res.data;
}

export function isDirectMeetup(meetup: O3Response) {
  return !meetup.isOthers && !meetup.isByAI;
}

export default {
  queryO3Meetups,
  createO3Meetup,
  applyRequest,
  pickCoach,
};
