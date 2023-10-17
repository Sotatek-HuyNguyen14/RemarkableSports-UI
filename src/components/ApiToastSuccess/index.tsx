import React from "react";
import { AxiosError } from "axios";
import { Toast } from "native-base";
import MessageToast, { MesssageToastType } from "../Toast/MessageToast";
import { getTranslation } from "../../utils/translation";

export const API_TOAST_SUCCESS_ID = "API_TOAST_SUCCESS_ID";

const t = getTranslation("constant.button");

export function showApiToastSuccess({
  title = t("Success"),
  body = "",
  type = MesssageToastType.Success,
}: {
  title?: string;
  body?: string;
  type?: MesssageToastType;
}) {
  Toast.show({
    id: API_TOAST_SUCCESS_ID,
    placement: "top",
    duration: 2000,
    render: () => {
      return <MessageToast type={type} title={title} body={body} />;
    },
  });
}
