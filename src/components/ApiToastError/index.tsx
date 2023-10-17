import React from "react";
import { AxiosError } from "axios";
import { uniqueId } from "lodash";
import { Toast } from "native-base";
import MessageToast, { MesssageToastType } from "../Toast/MessageToast";
import { getTranslation } from "../../utils/translation";

const t = getTranslation("component.ApiToastError");
export const API_TOAST_ERROR_ID = "API_TOAST_ERROR_ID";

export interface StackFrame {
  fileName: string;
  filePath: string;
  function: string;
  line: number;
  postContextCode?: number;
  preContextCode?: number;
  preContextLine: number;
}

export interface ExceptionDetail {
  message: string;
  raw: string;
  stackFrames: StackFrame[];
  type: string;
}

export interface ApiErrorResponse {
  data: {
    code: string;
    detail?: string;
    exceptionDetails: ExceptionDetail[];
    instance: string;
    status: number;
    title: string;
    traceId: string;
    type: string;
    errors: {
      Email?: string[];
      Password?: string[];
    };
  };
}

export function showApiToastError(error: AxiosError | any) {
  const errorResponse = error.response as ApiErrorResponse;
  let errorMessage = errorResponse?.data?.detail;
  let headTitle = t("Error");

  // if includes "The date and time for this course is already past, please edit the session and retry" and then translation content
  if (
    errorMessage &&
    errorMessage.includes(
      "The date and time for this course is already past, please edit the session and retry"
    )
  ) {
    headTitle = t("Create Course Failed");
    errorMessage = t(
      "The date and time for this course is already past, please edit the session and retry"
    );
  }

  Toast.show({
    id: API_TOAST_ERROR_ID,
    placement: "top",
    duration: 2000,
    render: () => {
      return (
        <MessageToast
          type={MesssageToastType.Error}
          title={headTitle}
          body={errorMessage || t("Error please try again later")}
        />
      );
    },
  });
}

export function showCommonToastError(error: AxiosError | any) {
  const errorMessage = error.response?.data?.errors;
  if (error.response?.data.status === 409) {
    return Toast.show({
      id: uniqueId,
      placement: "top",
      duration: 2000,
      render: () => {
        return (
          <MessageToast
            type={MesssageToastType.Error}
            title={t("Email already registered")}
            body={t(
              "Please enter a different email address for registration or login to existing email"
            )}
          />
        );
      },
    });
  }
  if (errorMessage && errorMessage?.Email && errorMessage.Email?.length) {
    return Toast.show({
      id: uniqueId,
      placement: "top",
      duration: 2000,
      render: () => {
        return (
          <MessageToast
            type={MesssageToastType.Error}
            title={t("Invalid email")}
            body={t(
              "Please check and enter a valid email address to register account"
            )}
          />
        );
      },
    });
  }
  if (errorMessage && errorMessage?.Password && errorMessage.Password?.length) {
    return Toast.show({
      id: uniqueId,
      placement: "top",
      duration: 2000,
      render: () => {
        return (
          <MessageToast
            type={MesssageToastType.Error}
            title={t("Invalid password")}
            body={t(
              "Please follow the password format listed below to register account"
            )}
          />
        );
      },
    });
  }
  showApiToastError(error);
}

export function showApiToastErrorWithMessage(
  msg: string,
  title: string = t("Error")
) {
  Toast.show({
    id: API_TOAST_ERROR_ID,
    placement: "top",
    duration: 2000,
    render: () => {
      return (
        <MessageToast type={MesssageToastType.Error} title={title} body={msg} />
      );
    },
  });
}
