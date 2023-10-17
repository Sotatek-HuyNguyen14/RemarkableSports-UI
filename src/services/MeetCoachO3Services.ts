import axios from "axios";
import { formatMeetupApiUrl } from "./ServiceUtil";

const MEET_COACH_PATH = "/1on1";

async function getAllMeetCoachO3Request() {
  const response = await axios.get(formatMeetupApiUrl(MEET_COACH_PATH));
  return response.data ?? [];
}

async function applyMeetCoachO3Request(data: any) {
  const { id, body } = data;
  await axios.put(formatMeetupApiUrl(`${MEET_COACH_PATH}/${id}`), body);
}

async function deleteMeetCoachO3Request(coachMeetupId: number) {
  return axios.delete(
    formatMeetupApiUrl(`${MEET_COACH_PATH}/${coachMeetupId}`)
  );
}

export {
  getAllMeetCoachO3Request,
  applyMeetCoachO3Request,
  deleteMeetCoachO3Request,
};
