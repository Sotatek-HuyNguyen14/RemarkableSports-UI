import axios from "axios";
import { ProcessOnboardingRequest } from "../models/Request";
import { formatWorkflowUrl } from "./ServiceUtil";

export async function processOnboardingRequest({
  workflowId,
  stepId,
  approvalResult,
  reasonReject,
}: ProcessOnboardingRequest) {
  return axios.post(formatWorkflowUrl("/approval"), {
    workflowId,
    stepId,
    approvalResult,
    reasonReject,
  });
}

// TODO: to be removed when more are added
export default {};
