import { getTranslation } from "../../utils/translation";

export enum ChatGPTTopic {
  Serve = "Serve",
  Receive = "Receive",
  Forehand = "Forehand",
  Backhand = "Backhand",
  Footwork = "Footwork",
  Rules = "Rules",
  Spin = "Spin",
}

export const CHAT_GPT_TOPICS_OPTIONS = [
  ChatGPTTopic.Serve,
  ChatGPTTopic.Receive,
  ChatGPTTopic.Forehand,
  ChatGPTTopic.Backhand,
  ChatGPTTopic.Footwork,
  ChatGPTTopic.Rules,
  ChatGPTTopic.Spin,
].map((topic) => {
  return { label: topic, value: topic };
});

export interface ChatGPTMessageResponse {
  role: string;
  content: string;
}

export interface ChatGPTDailyQuestionCountResponse {
  dailyQuestionCount: number;
}

export interface ChatGPTMonthlyUsageResponse {
  isExceedLimit: boolean;
}
