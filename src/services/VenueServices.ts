/* eslint-disable import/prefer-default-export */
import axios, { Axios, AxiosResponse } from "axios";
import {
  Venue,
  CreateVenueRequest,
  SearchVenueParams,
} from "../models/requests/Venue";
import { formatCoreUrl } from "./ServiceUtil";

export async function createVenue(payload: CreateVenueRequest) {
  const response: AxiosResponse<number> = await axios.post<number>(
    formatCoreUrl("/venue"),
    payload
  );

  return response.data;
}

export async function updateVenue(
  venueId: number,
  payload: CreateVenueRequest
) {
  const response = await axios.post(
    formatCoreUrl(`/venue/${venueId}`),
    payload
  );

  return response.data;
}

export async function getVenueById(venueId: number) {
  const response: AxiosResponse<Venue> = await axios.get<Venue>(
    formatCoreUrl(`/venue/${venueId}`)
  );

  return response.data;
}

export async function getVenuesByParams(
  url: string,
  { arg }: { arg: SearchVenueParams }
) {
  const updatedParams: SearchVenueParams = {
    name: arg.name || "",
    clubId: arg.clubId || "",
    area: arg.area || "",
    district: arg.district || "",
    numberOfTables: arg.numberOfTables || "",
    fromTime: arg.fromTime || "",
    toTime: arg.toTime || "",
    fromFee: arg.fromFee || "",
    toFee: arg.toFee || "",
  };

  const response: AxiosResponse<Venue[]> = await axios.get<Venue[]>(
    formatCoreUrl(`${url}`),
    { params: updatedParams }
  );

  return response.data;
}

export async function deleteVenue(url: string, { arg }: { arg: number }) {
  const response = await axios.delete(formatCoreUrl(`${url}/${arg}`));

  return response.data;
}
// export async function deleteVenue(url: string, { id }: { id: string }) {

// }

export async function getClubVenues(clubId: number) {
  const res = await axios.get<Venue[]>(formatCoreUrl(`/venue/club/${clubId}`));
  return res.data;
}
