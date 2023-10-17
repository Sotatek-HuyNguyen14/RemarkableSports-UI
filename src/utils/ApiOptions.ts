import apiUrls from "../constants/ApiUrls";

export const baseOptions = {
  baseURL: apiUrls.apiHost,
};

export const jsonRequestOptions = {
  ...baseOptions,
  "content-type": "application/json;charset=utf-8",
};

export const formRequestOptions = {
  ...baseOptions,
  "Content-Type": "application/x-www-form-urlencoded",
};
