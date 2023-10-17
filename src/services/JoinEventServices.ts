import axios from "axios";
import { FilterEventRequest, JoinEventRequest } from "../models/requests/Event";
import { EventResponse } from "../models/responses/Event";
import { EventFilteringForm } from "../screens/EventFiltering";
import { formatCoreUrl } from "./ServiceUtil";

export async function getEvents(param?: EventFilteringForm) {
  if (param) {
    const formData: FilterEventRequest = {
      type: param.type,
      district: param.district,
      startAfter: param.after,
      startBefore: param.before,
    };
    const res = await axios.get<EventResponse[]>(formatCoreUrl("/event"), {
      params: formData,
    });
    return res.data;
  }
  const res = await axios.get<EventResponse[]>(formatCoreUrl("/event"));
  return res.data;
}

export async function getEventApplied() {
  const res = await axios.get<EventResponse[]>(formatCoreUrl(`/event/applied`));
  return res.data;
}

export async function cancelEvent(applicationId: number | string) {
  const res = await axios.delete(
    formatCoreUrl(`/event/application/${applicationId}`)
  );
  return res?.data;
}

export async function JoinEvent(payload: JoinEventRequest) {
  const res = await axios.post(
    formatCoreUrl(`/event/${payload.eventId}/application`),
    {
      ...payload,
    }
  );
  return res?.data;
}

export async function paymentevidence(
  applicationId: number | string,
  imageUrl: { fileName: string; fileContent: string }
) {
  const formData = new FormData();
  formData.append("Image", {
    uri: imageUrl.fileContent,
    type: "image/jpeg",
    name: imageUrl.fileName,
  });
  const res = await axios.post(
    formatCoreUrl(`/paymentevidence/${applicationId}`),
    formData,
    {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    }
  );

  return res?.data;
}
