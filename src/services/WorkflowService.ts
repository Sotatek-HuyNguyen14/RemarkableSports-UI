/* eslint-disable no-param-reassign */
import axios from "axios";
import { parse } from "date-fns";
import {
  WorkflowDefinitionResponse,
  OnboardingResponse,
  OnboardingStep,
  OnboardingStepId,
} from "../models/responses/Onboarding";
import { UpdateProfileStepId } from "../models/responses/Updating";
import { BasicInfoForm } from "../screens/SignUp/BasicInfo";
import { FORMAT_DATE_REQUEST } from "../utils/date";
import { formatWorkflowUrl } from "./ServiceUtil";
import { isBlank } from "../utils/strings";

export async function getOnboardingData() {
  await createOnboardingWorkflow();
  const process = await getWorkflowProcess("onboarding");
  const pendingStep = await getOnboardingPendingStep();
  return {
    process,
    pendingStep,
  };
}

export async function createOnboardingWorkflow() {
  try {
    await axios.post(formatWorkflowUrl("/onboarding"), {});
  } catch (ignored) {
    console.log("Ignored", ignored);
  }
}

export async function createUpdateProfileWorkflow() {
  try {
    await axios.post(formatWorkflowUrl("/update"));
  } catch (ignored) {
    console.log("Ignored", ignored);
  }
}

export async function getWorkflowDefinition(
  workflow: "onboarding" | "update" = "onboarding"
) {
  const { data } = await axios.get<WorkflowDefinitionResponse>(
    formatWorkflowUrl(`/${workflow}/definition`)
  );
  return data;
}

export async function getWorkflowProcess(
  workflow: "onboarding" | "update" = "onboarding"
) {
  const { data } = await axios.get<OnboardingResponse>(
    formatWorkflowUrl(`/${workflow}`)
  );
  return data;
}

export async function getOnboardingPendingStep() {
  try {
    const { data } = await axios.get<OnboardingStep>(
      formatWorkflowUrl("/onboarding/step/pending")
    );
    return data;
  } catch (e) {
    return null;
  }
}

export async function processWorkflowStep(
  stepId: OnboardingStepId | UpdateProfileStepId,
  data: object,
  workflow: "onboarding" | "update" = "onboarding"
) {
  // Reformat achievement
  // "achievements": [{"text": "1111"}, {"text": "2222"}]
  data.achievements = data.achievements
    ?.map((e) => e?.text)
    .filter((e) => !isBlank(e));
  await axios.post(formatWorkflowUrl(`/${workflow}/step/${stepId}`), data);
}
