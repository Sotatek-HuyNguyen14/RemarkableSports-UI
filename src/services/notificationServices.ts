import axios from "axios";
import {
  CreateNotificationRequest,
  NotificationItem,
} from "../models/requests/Notification";
import { formatCoreUrl } from "./ServiceUtil";

export enum NotificationAction {
  Read = "Read",
}

export async function createNotificationDevice(
  data?: CreateNotificationRequest
) {
  await axios.post(formatCoreUrl("/notification/register"), data);
}

export async function getAllNotifications() {
  const response = await axios.get(formatCoreUrl("/notification"));
  return response.data ? (response.data as NotificationItem[]) : [];
}

export async function markNotificationAsRead(id: number) {
  await axios.put(formatCoreUrl(`/notification/${id}`), {
    action: NotificationAction.Read,
  });
}

export async function markAllNotificationsAsRead() {
  await axios.put(formatCoreUrl(`/notification`), {
    action: NotificationAction.Read,
  });
}

export default {};
