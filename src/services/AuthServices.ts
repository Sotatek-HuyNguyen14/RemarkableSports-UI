/* eslint-disable prefer-regex-literals */
/* eslint-disable camelcase */
/* eslint-disable guard-for-in */
/* eslint-disable no-restricted-syntax */

import axios from "axios";
import {
  AUTH_HEADER,
  CONFIRM_EMAIL_ENDPOINT,
  DEFAULT_HEADER,
  FORGOT_PASSWORD,
  REGISTER_ENDPOINT,
  RESEND_CONFIRM_EMAIL_ENDPOINT,
  TOKEN,
} from ".";
import ApiUrls from "../constants/ApiUrls";
import { SCOPE } from "../constants/constants";
import { TokenResponse, UserInfoResponse } from "../models/Response";
import { User } from "../models/User";
import { ensureResponseReady, formatCoreUrl, formatUrl } from "./ServiceUtil";

const API_URL = ApiUrls.apiHost;

const ERROR_NEED_VERIFICATION = "ERROR_NEED_VERIFICATION";
const ERROR_INVALID_CREDENTIAL = "ERROR_INVALID_CREDENTIAL";

const encodedData = (data) => {
  const result = [];
  for (const property in data) {
    const encodedKey = encodeURIComponent(property);
    const encodedValue = encodeURIComponent(data[property]);
    result.push(`${encodedKey}=${encodedValue}`);
  }

  return result.join("&");
};

const login = async ({ email, password }) => {
  const USER_TOKEN_URL = `${API_URL}${TOKEN}`;
  const details = {
    username: email,
    password,
    grant_type: "password",
    scope: SCOPE,
  };

  const body = encodedData(details);

  try {
    const response = await fetch(USER_TOKEN_URL, {
      method: "POST",
      headers: AUTH_HEADER,
      body,
    });
    const json: TokenResponse = await response.json();
    const { error, error_description } = json;
    if (error) {
      if (new RegExp("isn't confirmed").test(error_description)) {
        return { success: false, data: { error: ERROR_NEED_VERIFICATION } };
      }
      return { success: false, data: { error: ERROR_INVALID_CREDENTIAL } };
    }
    return {
      success: true,
      data: {
        token: json.access_token,
        refreshToken: json.refresh_token,
        expiresIn: json.expires_in,
      },
    };
  } catch (error) {
    return { success: false, data: { error } };
  }
};

const signUp = async ({
  email,
  password,
}: {
  email: string;
  password: string;
}) => {
  const REGISTER_URL = `${API_URL}${REGISTER_ENDPOINT}`;
  await axios.post(REGISTER_URL, {
    email,
    password,
    language: "en-US",
  });
};

const confirmEmail = async (callBack) => {
  const CONFIRM_EMAIL_URL = `${API_URL}${CONFIRM_EMAIL_ENDPOINT}`;
  try {
    const response = await fetch(CONFIRM_EMAIL_URL);
    const json = await response.json();
    callBack(true, json);
  } catch (error) {
    callBack(false, error);
  }
};

const resendConfirmEmail = async (
  { email }: { email: string },
  callBack?: (success: boolean, data: any) => {}
) => {
  const encodeEmail = encodeURIComponent(email);
  const RESEND_CONFIRM_EMAIL_URL = `${API_URL}${RESEND_CONFIRM_EMAIL_ENDPOINT}?email=${encodeEmail}`;
  let json;
  try {
    const response = await fetch(RESEND_CONFIRM_EMAIL_URL, {
      method: "GET",
      headers: DEFAULT_HEADER,
    });
    console.log(JSON.stringify(response));
    json = await response.json();
    // console.log(JSON.stringify(json));
    if (callBack) callBack(true, json);
  } catch (error) {
    console.log(error);
    if (callBack) {
      callBack(true, json);
    }
  }
};

const forgotPassword = async ({ email }: { email: string }) => {
  await axios.get(`${formatUrl("/forgot-password")}`, {
    params: { email },
  });
};

const changePassword = async ({
  currentPassword,
  newPassword,
  confirmPassword,
}: {
  currentPassword: string;
  newPassword: string;
  confirmPassword: string;
}) => {
  const res = await axios.post(`${formatUrl("/change-password")}`, {
    currentPassword,
    newPassword,
    confirmPassword,
  });
  return res;
};

const changeEmail = async ({
  oldEmail,
  newEmail,
}: {
  oldEmail: string;
  newEmail: string;
}) => {
  const res = await axios.post(formatUrl("/change-email"), {
    oldEmail,
    newEmail,
  });
  return res;
};

async function getUserInfo(): Promise<UserInfoResponse> {
  const response = await fetch(formatUrl("/userinfo"), await fillToken());
  ensureResponseReady(response);
  return response.json();
}

async function deleteAccount() {
  await axios.delete(formatCoreUrl(`/user/`));
  await axios.delete(formatUrl(`/user`));
}

async function getUserById(userId: string) {
  const res = await axios.get<User>(formatCoreUrl(`/user/${userId}`));
  return res.data;
}

export {
  signUp,
  confirmEmail,
  resendConfirmEmail,
  forgotPassword,
  changePassword,
  login,
  getUserInfo,
  deleteAccount,
  getUserById,
  changeEmail,
  ERROR_NEED_VERIFICATION,
  ERROR_INVALID_CREDENTIAL,
};
