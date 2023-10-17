import axios from "axios";
import { GetCourseApplicationRequest } from "../models/requests/CourseApplication";
import { CourseApplicationStatus } from "../models/responses/CourseApplication";
import { formatMeetupApiUrl } from "./ServiceUtil";

const COURSE_MEETUP_PATH = "/course";

export async function getAllCourseApplication() {
  return axios.get(formatMeetupApiUrl(COURSE_MEETUP_PATH));
}

export async function getCourseApplicationByStatus(
  status: CourseApplicationStatus
) {
  return axios.get(formatMeetupApiUrl(COURSE_MEETUP_PATH), {
    params: { status },
  });
}

export async function getCourseApplicationById(courseMeetupId: number) {
  return axios.get(
    formatMeetupApiUrl(`${COURSE_MEETUP_PATH}/${courseMeetupId}`)
  );
}

export async function createCourseApplication(
  payload: GetCourseApplicationRequest
) {
  const res = await axios.post(formatMeetupApiUrl(COURSE_MEETUP_PATH), payload);
  return res;
}

export async function deleteCourseApplication(courseMeetupId: number) {
  return axios.delete(
    formatMeetupApiUrl(`${COURSE_MEETUP_PATH}/${courseMeetupId}`)
  );
}
