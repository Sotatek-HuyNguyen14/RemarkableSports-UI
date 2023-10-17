import axios from "axios";
import { GetCourseBookingRequestData } from "../models/Request";
import { Action } from "../models/Response";
import { formatMeetupApiUrl } from "./ServiceUtil";

export const MEET_UP_COURSE = "/course";

export interface UpdateCourseBookingRequestData {
  action: Action;
  parameters: {
    reasonReject: string;
  };
  id: number;
}

export async function getCourseBookingDetail(
  data: GetCourseBookingRequestData
) {
  const { id } = data;
  const response = await axios.get(
    formatMeetupApiUrl(`${MEET_UP_COURSE}/${id}`)
  );
  return response.data;
}

export async function updateCourseBooking(
  data: UpdateCourseBookingRequestData
) {
  const { action, parameters, id } = data;
  await axios.put(formatMeetupApiUrl(`${MEET_UP_COURSE}/${id}`), {
    action,
    parameters,
  });
}
