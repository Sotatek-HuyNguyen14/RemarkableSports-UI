/* eslint-disable import/prefer-default-export */
import axios from "axios";
import { UpdateLanguagePayload } from "../models/requests/Language";
import { formatCoreUrl } from "./ServiceUtil";

export async function updateLanguage(payload: UpdateLanguagePayload) {
  await axios.post(formatCoreUrl("/language"), payload);
}
