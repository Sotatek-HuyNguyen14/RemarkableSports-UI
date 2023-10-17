/* eslint-disable import/prefer-default-export */
import axios from "axios";
import { ChatGPTMessageRequest } from "../models/requests/ChatGPT";
import {
  ChatGPTDailyQuestionCountResponse,
  ChatGPTMessageResponse,
  ChatGPTMonthlyUsageResponse,
} from "../models/responses/ChatGPT";
import { formatCoreUrl } from "./ServiceUtil";

export const MAX_NUMBER_OF_CHATS_PER_DAY = 5;
export const GO_PING_PONG_URL_CHANNEL = "https://www.youtube.com/@GoPingPong";

export async function sendChat(data: ChatGPTMessageRequest) {
  const res = await axios.post<ChatGPTMessageResponse>(
    formatCoreUrl("/chat/message"),
    data
  );
  return res.data;
}

export async function getDailyQuestionCount(userId: string) {
  const res = await axios.get<ChatGPTDailyQuestionCountResponse>(
    formatCoreUrl(`/chat/quota/${userId}`)
  );
  return res.data;
}

export async function getChatMonthlyUsage() {
  const res = await axios.get<ChatGPTMonthlyUsageResponse>(
    formatCoreUrl("/chat/monthly-usage")
  );
  return res.data;
}
