import axios from "axios";
import { formatCoreUrl } from "./ServiceUtil";

export interface AppVersionResponse {
  id: number;
  versionNumber: string;
  createdAt: Date;
  updatedAt: Date;
}

export async function getAppVersion() {
  const res = await axios.get<AppVersionResponse>(formatCoreUrl("/version"));
  return res.data;
}
