import { ChatGPTTopic } from "../responses/ChatGPT";

export interface ChatGPTMessageRequest {
  payload: string;
  chatHistory: string[];
  category: ChatGPTTopic;
}
