/* eslint-disable import/prefer-default-export */
import axios from "axios";
import { formatCoreUrl } from "./ServiceUtil";
import {
  ReportCoachResponse,
  ReportPlayerResponse,
} from "../models/responses/Report";

export async function getPlayerReport(payload: { clubId: string | number }) {
  const res = await axios.get<ReportPlayerResponse[]>(
    formatCoreUrl(`/club/${payload.clubId}/player/report`)
  );
  return res.data;
}

export async function getCoachReports(payload: {
  startDate: string;
  endDate: string;
  clubId: string | number;
}) {
  const res = await axios.get<ReportCoachResponse[]>(
    formatCoreUrl(`/club/${payload.clubId}/coach/report`),
    {
      params: payload,
    }
  );
  return res.data;
}
