import { Action } from "../Response";
import {
  CompetitionType,
  EventFpsType,
  EventPaymentAction,
  EventType,
  PaymentType,
} from "../responses/Event";

export interface EventDay {
  date: string;
  fromTime: string;
  toTime: string;
  address?: string;
  eventId: string | number;
}

export interface EventPaymentInfo {
  paymentType: PaymentType;
  phoneNumber?: string;
  bankAccount: string;
  identifier?: string;
  accountName: string;
  otherPaymentInfo: string;
  bankName: string;
  clubPaymentInfoId?: number;

  // For edit only
  personalId?: string | number;
}

export interface CreateEventRequest {
  id: string | number;
  type: EventType;
  name: string;
  competitionType: CompetitionType;
  capacity: string;
  fee: number;
  address: string;
  description: string;
  district: string;
  isApproval: boolean;
  latestCancellation?: number;
  paymentInfo?: EventPaymentInfo[];
  eventSessions: EventDay[];
  image?: {
    fileName: string;
    fileContent: string;
  };
  applicationDeadline?: string;
}

export interface UpdateEventRequest {
  id: string | number;
  type: EventType;
  name: string;
  competitionType: CompetitionType;
  capacity: string;
  fee: number;
  address: string;
  description: string;
  district: string;
  isApproval: boolean;
  latestCancellation?: number;
  paymentInfo?: EventPaymentInfo[];
  eventSessions?: EventDay[];
  image?: {
    fileName: string;
    fileContent: string;
  };
  applicationDeadline?: string;
  isNewImage?: boolean;
}

export interface UpdateEventApplicationRequest {
  eventId: string | number;
  applicationId: string | number;
  action: Action;
  parameters: {
    reasonReject: string;
  };
}

export interface AddEventParticipantRequest {
  eventId: string | number;
  teamName?: string;
  memberList: string[];
}

export interface KickoutParticipantRequest {
  applicationId: string | number;
}

export interface UpdatePaymentStatusManuallyRequest {
  action: EventPaymentAction;
  applicationId: string | number;
}

export interface JoinEventRequest {
  eventId: number | string;
  teamName?: string;
  memberList: string[];
}

export interface UpdateEventPaymentEvidenceRequest {
  action: Action;
  paymentType?: "Course" | "Event";
  parameters: {
    reasonReject: string;
  };
  applicationId: string | number;
}
export interface FilterEventRequest {
  type?: EventType;
  district?: string;
  startAfter?: string;
  startBefore?: string;
}
