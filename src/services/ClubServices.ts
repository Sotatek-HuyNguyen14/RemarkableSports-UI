/* eslint-disable no-await-in-loop */
/* eslint-disable no-restricted-syntax */
import axios from "axios";
import {
  ApprovalClubRequest,
  ClubPaymentMethodRequest,
  CreateClubRequest,
  DeleteClubRequest,
  UpdateClubRequest,
} from "../models/requests/Club";
import {
  ApplicationType,
  ClubMonthlySummaryResponse,
  ClubApplicationResponse,
  ClubCoursePerformanceResponse,
  ClubPaymentMethodResponse,
  ClubResponse,
} from "../models/responses/Club";
import { formatCoreUrl } from "./ServiceUtil";
import {
  getCourses,
  getCourseLeaveRequests,
  getCourseApplication,
} from "./CourseServices";
import { CourseFilteringRequest } from "../models/Request";
import { CoursePaymentStatus } from "../models/responses/Course";
import { getEvents, isCreatorForEvent } from "./EventServices";
import {
  EventApplicationStatus,
  EventPaymentStatus,
} from "../models/responses/Event";
import { User } from "../models/User";
import { CourseApplicationStatus } from "../models/responses/CourseApplication";

export async function getAllClubs() {
  const { data } = await axios.get<ClubResponse[]>(formatCoreUrl("/club"));
  return data;
}

export async function getCoachAppliedClubs(clubId: string | number) {
  const { data } = await axios.get<ClubApplicationResponse[]>(
    formatCoreUrl(`/club/${clubId}/coach?status=Pending`)
  );
  return data;
}

export async function getPlayerAppliedClubs(clubId: string | number) {
  const { data } = await axios.get<ClubApplicationResponse[]>(
    formatCoreUrl(`/club/${clubId}/player?status=Pending`)
  );
  return data;
}

export async function getCoachByClub(clubId: string | number) {
  const res = await axios.get<ClubApplicationResponse[]>(
    formatCoreUrl(`/club/${clubId}/coach?status=Approved`)
  );

  return res?.data;
}

export async function getStaffByClub(clubId: string | number) {
  const res = await axios.get<ClubApplicationResponse[]>(
    formatCoreUrl(`/club/${clubId}/staff?status=Approved`)
  );

  return res?.data;
}

export async function updateCoachPrice(payload: {
  clubId: string | number;
  applicationId: string | number;
  privatePrice?: string;
  headPrice?: string;
  assistantPrice?: string;
}) {
  await axios.put(
    formatCoreUrl(
      `/club/${payload.clubId}/coach/${payload.applicationId}/price`
    ),
    payload
  );
}

export async function getPlayerByClub(clubId: string | number) {
  const res = await axios.get<ClubApplicationResponse[]>(
    formatCoreUrl(`/club/${clubId}/player?status=Approved`)
  );

  return res.data || [];
}

export async function getStaffAppliedClubs(clubId: string | number) {
  const { data } = await axios.get<ClubApplicationResponse[]>(
    formatCoreUrl(`/club/${clubId}/staff?status=Pending`)
  );
  return data;
}

export async function createClub(payload: CreateClubRequest) {
  const res = await axios.post(formatCoreUrl("/club"), payload);
  return res;
}

export async function updateClub(payload: UpdateClubRequest) {
  const res = await axios.patch(formatCoreUrl(`/club/${payload.id}`), payload);
  return res;
}

export async function deleteClub(clubId: string | number) {
  await axios.delete(formatCoreUrl(`/club/${clubId}`));
}

export async function clubStaffJoinClub(id: number | string) {
  const res = await axios.put(formatCoreUrl(`/club/${id}/staff`), {
    action: "Apply",
  });
  return res;
}
export async function coachJoinClub(id: number | string) {
  const res = await axios.put(formatCoreUrl(`/club/${id}/coach`), {
    action: "Apply",
  });
  return res;
}

export async function playerJoinClub(id: number | string) {
  const res = await axios.put(formatCoreUrl(`/club/${id}/player`), {
    action: "Apply",
  });
  return res;
}

export async function approvalJoinClub(
  application: ClubApplicationResponse,
  type: ApplicationType
) {
  const parameters = {
    isApprove: true,
    reasonReject: "",
  };
  const res = await axios.put(
    formatCoreUrl(
      `/club/${application.clubId}/${type}/${application.applicationId}`
    ),
    {
      action: "Approval",
      parameters,
    }
  );
  return res;
}

export async function rejectJoinClub(
  application: ClubApplicationResponse,
  type: ApplicationType
) {
  const parameters = {
    isApprove: false,
    reasonReject: "reject",
  };
  const res = await axios.put(
    formatCoreUrl(
      `/club/${application.clubId}/${type}/${application.applicationId}`
    ),
    {
      action: "Approval",
      parameters,
    }
  );
  return res;
}

export async function removeClubUser(
  applicationId: number | string,
  clubId: number | string,
  userType: "coach" | "staff"
) {
  const res = await axios.delete(
    formatCoreUrl(`/club/${clubId}/${userType}/${applicationId}`)
  );
  return res;
}

export async function approvalClub(payload: ApprovalClubRequest) {
  const formatData = {
    action: "Approval",
    parameters: payload.parameters,
  };
  const res = await axios.put(formatCoreUrl(`/club/${payload.id}`), formatData);
  return res;
}

export async function cancelClubRequest(payload: DeleteClubRequest) {
  console.log(
    "Delete ",
    `/club/${payload.clubId}/application/${payload.applicationId}`
  );
  await axios.delete(
    formatCoreUrl(
      `/club/${payload.clubId}/application/${payload.applicationId}`
    ),
    {
      data: {
        action: "Cancel",
      },
    }
  );
}

export async function getClubApplication(clubId: string | number) {
  const res = await axios.get<ClubApplicationResponse>(
    formatCoreUrl(`/club/${clubId}/application`),
    {
      params: {
        approvalStatus: "Pending",
      },
    }
  );
  return res.data;
}

export async function getClubCoursePerformance(clubId: string | number) {
  const res = await axios.get<ClubCoursePerformanceResponse[]>(
    formatCoreUrl(`/club/${clubId}/course/report`)
  );
  return res.data;
}

export async function getMonthlySummarys(clubId: string | number) {
  const res = await axios.get<ClubMonthlySummaryResponse[]>(
    formatCoreUrl(`/club/${clubId}/monthly-summary`)
  );
  return res.data;
}

export async function getClubPaymentMethods(clubId: string | number) {
  const res = await axios.get<ClubPaymentMethodResponse[]>(
    formatCoreUrl(`/club/${clubId}/payment-methods`)
  );
  return res.data;
}

export async function addClubPaymentMethod(payload: ClubPaymentMethodRequest) {
  const res = await axios.post<boolean>(
    formatCoreUrl(`/club/${payload.clubId}/add-payment`),
    { ListPaymentInfo: [payload] }
  );
  return res.data;
}

export async function deleteClubPaymentMethod(
  clubId: string | number,
  paymentId: string | number
) {
  const res = await axios.delete<boolean>(
    formatCoreUrl(`/club/${clubId}/payment/${paymentId}`)
  );
  return res.data;
}

export async function editClubPaymentMethod(
  payload: ClubPaymentMethodResponse
) {
  const res = await axios.put<boolean>(
    formatCoreUrl(`/club/${payload.clubId}/update-payment/${payload.id}`),
    payload
  );
  return res.data;
}

export default {
  createClub,
  getAllClubs,
  approvalClub,
  getCoachByClub,
};
