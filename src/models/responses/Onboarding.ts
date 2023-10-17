import { ClubStaff, Coach, Player } from "../User";

export enum OnboardingStatus {
  WaitingForInput = "WaitingForInput",
  Complete = "Complete",
}

export enum OnboardingStepId {
  BasicInfo = "BasicInfo",
  UserRole = "UserRole",
  PlayerInfo = "PlayerInfo",
  CoachInfo = "CoachInfo",
  ClubInfo = "ClubInfo",
}

export interface WorkflowStepInputDefinition {
  id: string;
  label: string;
  inputType: string;
  description: string;
  required: boolean;
  properties: object;
  options: null | { label: string; value: string }[];
}

export interface WorkflowStepDefinition {
  id: string;
  inputs: WorkflowStepInputDefinition[];
}

export interface WorkflowDefinitionResponse {
  id: string;
  version: number;
  description: string | null;
  steps: WorkflowStepDefinition[];
}

export interface OnboardingStep {
  id: string;
  stepId: OnboardingStepId;
  active: boolean;
  persistenceData: any;
  startTime: Date;
  endTime: Date | undefined;
  retryCount: number;
  nextPointers: any[];
  predecessorId: string;
  status: OnboardingStatus;
}

export interface OnboardingExecutionPointer {
  id: string;
  stepId: string;
  active: boolean;
  persistenceData?: object;
  startTime: Date;
  endTime: Date;
  retryCount: number;
  nextPointers: string[];
  predecessorId?: string;
  status: "Complete" | "WaitingForInput";
}

export interface OnboardingResponse {
  id: string;
  userId: string;
  workflowDefinitionId: string;
  version: number;
  description: string | null;
  reference: string;
  status: OnboardingStatus;
  data: Player | Coach | ClubStaff;
  createTime: string;
  completeTime: string;
  executionPointers: OnboardingExecutionPointer[];
}
