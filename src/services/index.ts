import ApiUrls from "../constants/ApiUrls";

const API_URL = ApiUrls.apiHost;

const REGISTER_ENDPOINT = "/register";
const TOKEN = "/token";
const CONFIRM_EMAIL_ENDPOINT = "/confirm-email";
const RESEND_CONFIRM_EMAIL_ENDPOINT = "/resend-confirm-email";
const FORGOT_PASSWORD = "/forgot-password";
const WORKFLOW_ONBOARDING = "/workflow/onboarding";
const WORKFLOW_ONBOARDING_DEFINITION = "/workflow/onboarding/definition";
const WORKFLOW_ONBOARDING_PENDING_STEP = "/workflow/onboarding/step/pending";
const WORKFLOW_ONBOARDING_COMPLETE_STEP = "/workflow/onboarding/step/";

const DEFAULT_HEADER = {
  "Content-Type": "application/json;charset=utf-8",
};

const AUTH_HEADER = {
  "Content-Type": "application/x-www-form-urlencoded",
};

const AUTHENTICATED_HEADERS = (token: string) => {
  return {
    "Content-Type": "application/json;charset=utf-8",
    Authorization: `Bearer ${token}`,
  };
};

const NO_ACCESS_TOKEN_FOUND_ERROR = "No access token found";

export {
  API_URL,
  REGISTER_ENDPOINT,
  TOKEN,
  CONFIRM_EMAIL_ENDPOINT,
  RESEND_CONFIRM_EMAIL_ENDPOINT,
  FORGOT_PASSWORD,
  DEFAULT_HEADER,
  AUTH_HEADER,
  AUTHENTICATED_HEADERS,
  NO_ACCESS_TOKEN_FOUND_ERROR,
  WORKFLOW_ONBOARDING,
  WORKFLOW_ONBOARDING_PENDING_STEP,
  WORKFLOW_ONBOARDING_COMPLETE_STEP,
  WORKFLOW_ONBOARDING_DEFINITION,
};
