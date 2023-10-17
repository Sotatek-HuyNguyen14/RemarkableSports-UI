import {
  WorkflowDefinitionResponse,
  OnboardingStepId,
} from "../models/responses/Onboarding";
import { UpdateProfileStepId } from "../models/responses/Updating";
import { getTranslation } from "../utils/translation";

const t = getTranslation("constant.profile");

function getStepDefiniation(
  def: WorkflowDefinitionResponse | undefined,
  stepId: OnboardingStepId | UpdateProfileStepId
) {
  return def ? def.steps.find((s) => s.id === stepId) : null;
}

export function getInputOptions<T>(
  def: WorkflowDefinitionResponse | undefined,
  inputId: keyof T,
  stepId: OnboardingStepId | UpdateProfileStepId
) {
  const stepDef = getStepDefiniation(def, stepId);
  if (!stepDef) {
    return [];
  }

  const inputDef = stepDef.inputs.find((i) => i.id === inputId);
  if (!inputDef || inputDef.inputType !== "Select") {
    return [];
  }

  return (
    inputDef.options?.map((v) => ({
      label: t(v.label),
      value: v.value,
    })) ?? []
  );
}

export function getInputIsRequired<T>(
  def: WorkflowDefinitionResponse | undefined,
  inputId: keyof T,
  stepId: OnboardingStepId | UpdateProfileStepId
) {
  const stepDef = getStepDefiniation(def, stepId);
  if (!stepDef) {
    return false;
  }
  const inputDef = stepDef.inputs.find((i) => i.id === inputId);
  if (!inputDef) {
    return false;
  }
  return inputDef.required;
}
