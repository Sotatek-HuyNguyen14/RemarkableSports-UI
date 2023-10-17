import axios from "axios";

import { jsonRequestOptions } from "../utils/ApiOptions";

export default async <T>(path: string, token: string) => {
  const res = await axios.get<T>(path, {
    ...jsonRequestOptions,
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
  return res.data;
};
