export interface CreateNotificationRequest {
  token: string;
  deviceId: string;
}

export enum NotificationType {
  Successful = "Successful",
  Reminder = "Reminder",
  Cancellation = "Cancellation",
  Request = "Request",
  Error = "Error",
}

export enum NotificationResourceType {
  O3Coach = "O3Coach",
  CourseApplication = "CourseApplication",
  VenueBooking = "VenueBooking",
  Reminder = "Reminder",
  EventApplication = "EventApplication",
  Event = "Event",
  PostContent = "PostContent",
  CourseReminder = "CourseReminder",
  VenueReminder = "VenueReminder",
  TeamApplication = "TeamApplication",
  MatchResult = "MatchResult",
  Fixture = "Fixture",
}

export interface NotificationItem {
  userId: string;
  pushedAt: Date;
  readAt?: Date;
  title: string;
  body: string;
  data: string;
  id: number;
  notificationType: NotificationType;
  resourceType: NotificationResourceType;
}
