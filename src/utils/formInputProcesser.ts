import { AreaCode, CourseFilteringRequest } from "../models/Request";
import { CourseFilteringFormValues } from "../screens/PlayerScreens/CourseFiltering";
import { format12HTo24H } from "./date";

export default function processCourseFilteringFormInput(
  formValue: CourseFilteringFormValues
): CourseFilteringRequest {
  return {
    area: formValue.area as AreaCode,
    district: formValue.district,
    startDate: formValue.fromDate || null,
    finishDate: null,
    startAfter: formValue.from ? format12HTo24H(formValue.from) : null,
    endBefore: formValue.to ? format12HTo24H(formValue.to) : null,
    level: formValue.level,
    minFee: formValue.min ? formValue.min : null,
    maxFee: formValue.max ? formValue.max : null,
    daysOfWeek: formValue.daysOfWeek ? formValue.daysOfWeek : null,
    // clubName: formValue.clubName ? formValue.clubName : null,
    clubId: formValue.clubObj?.label ? formValue.clubObj?.label : null,
    courseName: formValue.courseName ? formValue.courseName : null,
  };
}
