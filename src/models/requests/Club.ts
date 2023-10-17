import { PaymentType } from "../responses/Event";

export interface CreateClubRequest {
  name: string;
  district: string;
  address: string;
  profileImage?: {
    fileName: string;
    fileContent: string;
  } | null;
}
export interface ApprovalClubRequest {
  id: number | string;
  parameters: {
    isApprove: boolean;
    rejectReason: string;
  };
}
export interface UpdateClubRequest extends CreateClubRequest {
  id: number | string;
}

export enum ClubStatusType {
  Pending = "Pending",
  Approved = "Approved",
  Rejected = "Rejected",
}

export interface DeleteClubRequest {
  clubId: string | number;
  applicationId: string | number;
}

export interface ClubPaymentMethodRequest {
  clubId: string | number;
  paymentType: PaymentType;
  bankAccount?: string;
  identifier?: string;
  phoneNumber?: string;
  otherPaymentInfo?: string;
  accountName?: string;
  bankName?: string;
}
