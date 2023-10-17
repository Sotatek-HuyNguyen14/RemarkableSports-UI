/* eslint-disable @typescript-eslint/no-empty-interface */
export interface UpdateLanguagePayload {
  language: string;
}

export enum TeamApprovalAction {
  Approve = "Approve",
  Reject = "Reject",
}

export interface ApproveTeamRequest {
  memberId: number;
  action: TeamApprovalAction;
  rejectReason?: string;
}
