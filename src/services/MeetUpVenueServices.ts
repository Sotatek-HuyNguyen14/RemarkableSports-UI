import axios from "axios";
import { addDays, isEqual, parse } from "date-fns";
import { AreaCode } from "../models/Request";
import { VenueFilteringForm } from "../screens/VenueFiltering";
import { formatDateTimeToTimezone, FORMAT_DATE_UI } from "../utils/date";
import { formatMeetupApiUrl } from "./ServiceUtil";

export const MEET_UP_VENUE = "/venue";

const createGetAllMeetUpVenueParams = (formValue: VenueFilteringForm) => {
  if (formValue && formValue.date) {
    const params = {
      area: formValue.area as AreaCode,
      district: formValue.district,
      fromTime: formValue.from
        ? formatDateTimeToTimezone(`${formValue.date} ${formValue.from}`)
        : parse(`${formValue.date}`, FORMAT_DATE_UI, new Date()),
      toTime: formValue.to
        ? formatDateTimeToTimezone(`${formValue.date} ${formValue.to}`)
        : addDays(parse(`${formValue.date}`, FORMAT_DATE_UI, new Date()), 1),

      fromFee: formValue.min ? formValue.min : null,
      toFee: formValue.max ? formValue.max : null,
    };
    return params;
  }
  return {};
};

export interface TimeSlot {
  name: string;
  isSelected: boolean;
  value: { fromTime: Date; toTime: Date };
}

export const isTimeSlotsArraySequential = (timeSlots: TimeSlot[]) => {
  const selectedTimeSlots = timeSlots.filter((timeslot) => timeslot.isSelected);
  if (selectedTimeSlots.length > 0) {
    for (let i = 0; i < selectedTimeSlots.length; i += 1) {
      if (selectedTimeSlots[i + 1]) {
        if (
          !isEqual(
            selectedTimeSlots[i + 1].value.fromTime,
            selectedTimeSlots[i].value.toTime
          )
        ) {
          return false;
        }
      }
    }
    return true;
  }
  return false;
};

export async function applyMeetUpVenue(data: any) {
  await axios.post(formatMeetupApiUrl(`${MEET_UP_VENUE}`), data);
}

export async function getAllMeetUpVenue(
  path: string,
  filterValue: VenueFilteringForm
) {
  if (filterValue && filterValue.date) {
    return axios
      .get(path, {
        params: createGetAllMeetUpVenueParams(filterValue),
      })
      .then((res) => res.data);
  }
  return [];
}
