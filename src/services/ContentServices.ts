import axios from "axios";

import {
  CreateContentRequest,
  UpdateContentRequest,
} from "../models/requests/Content";
import {
  ContentResponse,
  PostPermissionResponse,
} from "../models/responses/Content";
import { formatCoreUrl } from "./ServiceUtil";

export async function getAllpostContent(params: string) {
  const { data } = await axios.get<ContentResponse[]>(
    formatCoreUrl(`/post${params}`)
  );
  return data;
}

export async function getPostContentById(id: string | number) {
  const res = await axios.get<ContentResponse>(formatCoreUrl(`/post/${id}`));
  return res?.data;
}

export async function addPostContent(payload: CreateContentRequest) {
  const formData = new FormData();
  formData.append("Title", payload.title);
  formData.append("Content", payload.content);
  // formData.append("Linkage", "O3");
  // resourceId
  if (payload.resourceId?.toString()) {
    formData.append("ResourceId", payload.resourceId.toString());
  }
  if (payload.linkage) {
    formData.append("Linkage", payload.linkage);
  }
  if (payload.fromDate) {
    formData.append("FromDate", payload.fromDate);
  }
  if (payload.toDate) {
    formData.append("ToDate", payload.toDate);
  }
  if (payload.ytbUrl) {
    formData.append("YtbUrl", payload.ytbUrl);
  }

  // File
  if (payload.contentImage?.fileContent) {
    formData.append("File", {
      uri: payload.contentImage.fileContent,
      type: "image/jpeg",
      name: payload.contentImage.fileName,
    });
  }
  const res = await axios.post(formatCoreUrl("/post"), formData, {
    headers: {
      "Content-Type": "multipart/form-data",
    },
  });
  return res;
}

export async function getPostPermissionById(id: number | string) {
  const res = await axios.get<PostPermissionResponse>(
    formatCoreUrl(`/post-permission/${id}`)
  );
  return res?.data;
}

export async function deletePostContent(id: number | string) {
  const res = await axios.delete<PostPermissionResponse>(
    formatCoreUrl(`/post/${id}`)
  );
  return res?.data;
}

export async function editPostContent(payload: UpdateContentRequest) {
  const formData = new FormData();
  formData.append("Title", payload.title);
  formData.append("Content", payload.content);
  // formData.append("Linkage", "O3");
  // formData.append("ResourceId", "1");
  // resourceId
  if (payload.resourceId) {
    formData.append("ResourceId", payload.resourceId);
  }
  if (payload.fromDate) {
    formData.append("FromDate", payload.fromDate);
  }
  if (payload.toDate) {
    formData.append("ToDate", payload.toDate);
  }
  if (payload.ytbUrl) {
    formData.append("YtbUrl", payload.ytbUrl);
  }
  // File
  if (payload.contentImage?.fileContent) {
    formData.append("File", {
      uri: payload.contentImage.fileContent,
      type: "image/jpeg",
      name: payload.contentImage.fileName,
    });
  }

  const res = await axios.post(formatCoreUrl(`/post/${payload.id}`), formData, {
    headers: {
      "Content-Type": "multipart/form-data",
    },
  });
  return res;
}

export async function GrantOrRevokePostPermission(
  id: string,
  actionType: "Grant" | "Revoke"
) {
  const res = await axios.post(formatCoreUrl("/post-permission"), {
    userId: id,
    action: actionType,
  });
  return res;
}
export async function getPostPermission() {
  const res = await axios.get<PostPermissionResponse[]>(
    formatCoreUrl("/post-permission")
  );
  return res?.data;
}

export async function patchPostIncreaseviews(id: number) {
  const { data } = await axios.patch(
    formatCoreUrl(`/post/increaseviews/${id}`)
  );
  return data;
}

export default {
  getAllpostContent,
  addPostContent,
  getPostContentById,
  getPostPermissionById,
  deletePostContent,
  editPostContent,
  GrantOrRevokePostPermission,
  getPostPermission,
  patchPostIncreaseviews,
};
