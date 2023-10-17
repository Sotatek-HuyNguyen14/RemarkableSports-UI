import { Badge, Box, HStack, Pressable, Text, VStack } from "native-base";
import React, { useEffect, useMemo, useState } from "react";
import { FieldPath, FieldValues, useFieldArray } from "react-hook-form";
import useSWR from "swr";
import FormInput, {
  FormInputProps,
} from "../../../components/FormInput/FormInput";
import DownArrowIcon from "../../../components/Icons/DownArrowIcon";
import OneColumnPickerModal from "../../../components/Modal/OneColumnPickerModal";
import SingleSelectModal from "../../../components/Modal/SingleSelectModal";
import ThreeColumnPickerModal from "../../../components/Modal/ThreeColumnPickerModal";
import DateTimePicker from "../../../components/v2/DateTimePicker";
import TimePicker from "../../../components/v2/TimePicker";
import {
  dateList,
  getPeriod,
  hourList,
  minuteList,
  monthList,
  yearList,
} from "../../../constants/Time";
import { PaymentType } from "../../../models/responses/Event";
import { TeamModel } from "../../../models/responses/League";
import { getTranslation } from "../../../utils/translation";

export interface ArrayEditMatchProps<
  TFieldValues extends FieldValues,
  TName extends FieldPath<TFieldValues>
> extends FormInputProps<TFieldValues, TName> {
  teamOptions: TeamModel[];
}
const t = getTranslation([
  "component.ArrayEditMatch",
  "screen.OrganizerScreens.EditFixture",
  "constant.button",
  "formInput",
  "leagueTerms",
]);

export default function ArrayEditMatch<
  TFieldValues extends FieldValues,
  TName extends FieldPath<TFieldValues>
>({
  teamOptions,
  ...formInputProps
}: ArrayEditMatchProps<TFieldValues, TName>) {
  const { fields, append, remove } = useFieldArray<TFieldValues, TName>(
    formInputProps.controllerProps
  );

  const [selectedIndex, setSelectedIndex] = useState(0);
  const [defaultDate, setDefaultDate] = useState(
    fields.length ? fields[0]?.date : ""
  );
  const period = useMemo(() => {
    return getPeriod();
  }, []);

  useEffect(() => {
    if (fields.length === 0) {
      append({});
    }
  }, [fields, append]);

  const [datePicker, setDatePicker] = useState(false);
  const [timePicker, setTimePicker] = useState(false);
  const [homePicker, setHomePicker] = useState(false);
  const [awayPicker, setAwayPicker] = useState(false);

  const homeOptions = teamOptions;
  const awayOptions = teamOptions;

  return (
    <VStack space="4">
      {fields.map((field, index) => {
        const shouldRenderDeleteButton = fields.length > 0 && index !== 0;
        return (
          <VStack space="4" key={`${field.id}_container`}>
            <Text fontWeight="bold" color="rs.primary_purple">{`${t("Match")} ${
              index + 1
            }`}</Text>
            {/* Date */}
            <FormInput
              label={t("Date")}
              controllerProps={{
                ...formInputProps.controllerProps,
                name: `${formInputProps.controllerProps.name}.${index}.date` as TName,
              }}
              inputProps={{
                editable: false,
                InputRightElement: <DownArrowIcon mr="4" />,
              }}
              onPress={() => {
                setSelectedIndex(index);
                setDatePicker(true);
              }}
              {...formInputProps.controllerProps.control?.register(
                `${formInputProps.controllerProps.name}.${index}.date` as TName
              )}
            />

            {/* Time */}
            <FormInput
              label={t("Time")}
              controllerProps={{
                ...formInputProps.controllerProps,
                name: `${formInputProps.controllerProps.name}.${index}.time` as TName,
                rules: { required: false },
              }}
              {...formInputProps.controllerProps.control?.register(
                `${formInputProps.controllerProps.name}.${index}.time` as TName
              )}
              inputProps={{
                editable: false,
                InputRightElement: <DownArrowIcon mr="4" />,
              }}
              onPress={() => {
                setSelectedIndex(index);
                setTimePicker(true);
              }}
            />

            {/* Venue */}
            <FormInput
              label={t("Venue")}
              controllerProps={{
                ...formInputProps.controllerProps,
                name: `${formInputProps.controllerProps.name}.${index}.venue` as TName,
                rules: { required: false },
              }}
              {...formInputProps.controllerProps.control?.register(
                `${formInputProps.controllerProps.name}.${index}.venue` as TName
              )}
            />
            {/* Home team */}
            <FormInput
              label={t("Home Team")}
              controllerProps={{
                ...formInputProps.controllerProps,
                name: `${formInputProps.controllerProps.name}.${index}.homeTeam` as TName,
                rules: { required: false },
              }}
              inputProps={{
                editable: false,
                InputRightElement: <DownArrowIcon mr="4" />,
              }}
              onPress={() => {
                setSelectedIndex(index);
                setHomePicker(true);
              }}
              {...formInputProps.controllerProps.control?.register(
                `${formInputProps.controllerProps.name}.${index}.homeTeam` as TName
              )}
            />

            {/* Away team */}
            <FormInput
              label={t("Away Team")}
              controllerProps={{
                ...formInputProps.controllerProps,
                name: `${formInputProps.controllerProps.name}.${index}.awayTeam` as TName,
                rules: { required: false },
              }}
              inputProps={{
                editable: false,
                InputRightElement: <DownArrowIcon mr="4" />,
              }}
              onPress={() => {
                setSelectedIndex(index);
                setAwayPicker(true);
              }}
              {...formInputProps.controllerProps.control?.register(
                `${formInputProps.controllerProps.name}.${index}.awayTeam` as TName
              )}
            />
            <TimePicker
              isOpen={timePicker}
              onClose={() => {
                setTimePicker(false);
              }}
              headerLabel={`${t("Select")}${t("Start Time")}`}
              options={[hourList, minuteList, period]}
              concatenator={[":", " "]}
              controllerProps={{
                ...formInputProps.controllerProps,
                name: `${formInputProps.controllerProps.name}.${selectedIndex}.time` as TName,
                rules: { required: false },
              }}
            />
            {/* <OneColumnPickerModal
              isOpen={homePicker}
              onClose={() => {
                setHomePicker(false);
              }}
              headerLabel={t("Select Home Team")}
              options={homeOptions}
              controllerProps={{
                ...formInputProps.controllerProps,
                name: `${formInputProps.controllerProps.name}.${selectedIndex}.homeTeam` as TName,
                rules: { required: false },
              }}
            /> */}
            <SingleSelectModal
              confirmButtonText={t("Confirm")}
              isOpen={homePicker}
              onClose={() => {
                setHomePicker(false);
              }}
              title={`${t("Select")}${t("Home Team")}`}
              options={homeOptions}
              controllerProps={{
                ...formInputProps.controllerProps,
                name: `${formInputProps.controllerProps.name}.${selectedIndex}.homeTeam` as TName,
                rules: { required: false },
              }}
            />
            {/* <ThreeColumnPickerModal
              isOpen={datePicker}
              onClose={() => {
                setDatePicker(false);
              }}
              headerLabel={`${t("Select")}${t("Date")}`}
              buttonLabel={t("Confirm")}
              concatenator={["-", "-"]}
              options={[yearList, monthList, dateList]}
              controllerProps={{
                ...formInputProps.controllerProps,
                name: `${formInputProps.controllerProps.name}.${selectedIndex}.date` as TName,
              }}
            /> */}
            <DateTimePicker
              title={`${t("Select")}${t("Date")}`}
              isShow={datePicker}
              mode="date"
              controllerProps={{
                ...formInputProps.controllerProps,
                name: `${formInputProps.controllerProps.name}.${selectedIndex}.date` as TName,
              }}
              onClose={() => {
                setDatePicker(false);
              }}
              onDefaultDate={(value) => {
                setDefaultDate(value);
              }}
              defaultDate={defaultDate}
            />
            {/* <OneColumnPickerModal
              isOpen={awayPicker}
              onClose={() => {
                setAwayPicker(false);
              }}
              headerLabel={t("Select Away Team")}
              options={awayOptions}
              controllerProps={{
                ...formInputProps.controllerProps,
                name: `${formInputProps.controllerProps.name}.${selectedIndex}.awayTeam` as TName,
                rules: { required: false },
              }}
            /> */}
            <SingleSelectModal
              confirmButtonText={t("Confirm")}
              isOpen={awayPicker}
              onClose={() => {
                setAwayPicker(false);
              }}
              title={`${t("Select")}${t("Away Team")}`}
              options={awayOptions}
              controllerProps={{
                ...formInputProps.controllerProps,
                name: `${formInputProps.controllerProps.name}.${selectedIndex}.awayTeam` as TName,
                rules: { required: false },
              }}
            />
          </VStack>
        );
      })}
    </VStack>
  );
}
