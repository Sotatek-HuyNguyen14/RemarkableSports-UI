import { isFuture, parseISO } from "date-fns";
import { Button, Heading, HStack, Pressable, Text, VStack } from "native-base";
import React, { useEffect, useMemo, useState } from "react";
import {
  FieldPath,
  FieldValues,
  useFieldArray,
  useForm,
  useWatch,
} from "react-hook-form";
import {
  dateList,
  getPeriod,
  hourList,
  minuteList,
  monthList,
  yearList,
} from "../../constants/Time";
import { validateTimeRange } from "../../utils/date";
import { getTranslation } from "../../utils/translation";
import FormInput, { FormInputProps } from "../FormInput/FormInput";
import DownArrowIcon from "../Icons/DownArrowIcon";
import OneColumnPickerModal from "../Modal/OneColumnPickerModal";
import ThreeColumnPickerModal from "../Modal/ThreeColumnPickerModal";
import DateTimePicker from "../v2/DateTimePicker";
import TimePicker from "../v2/TimePicker";

const t = getTranslation([
  "component.ArrayDateInput",
  "constant.button",
  "formInput",
]);

export type ArrayDateInputProps<
  TFieldValues extends FieldValues,
  TName extends FieldPath<TFieldValues>
> = FormInputProps<TFieldValues, TName>;

export default function ArrayDateInput<
  TFieldValues extends FieldValues,
  TName extends FieldPath<TFieldValues>
>({ ...formInputProps }: ArrayDateInputProps<TFieldValues, TName>) {
  const { fields, append, remove } = useFieldArray<TFieldValues, TName>(
    formInputProps.controllerProps
  );

  const [isOpen, setIsOpen] = useState({
    district: false,
    name: false,
    courseFrom: false,
    courseTo: false,
    durationFrom: false,
    durationTo: false,
    level: false,
    coach: false,
  });
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [selectedDayData, setSelectedDateData] = useState<{}>({});
  const [selectedFieldId, setSelectedFieldId] = useState();
  const [defaultDate, setDefaultDate] = useState(
    fields.length ? fields[0]?.date : ""
  );
  const today = new Date();
  const period = useMemo(() => {
    return getPeriod();
  }, []);

  useEffect(() => {
    if (fields.length === 0) {
      append({});
    }
  }, [fields, append]);

  return (
    <VStack space="4">
      {fields.map((field, index) => {
        const shouldRenderDeleteButton = fields.length > 0 && index !== 0;
        const selectedDate = selectedDayData[`${field.id}.date`];
        const selectedStartTime = selectedDayData[`${field.id}.fromTime`];
        const selectedEndTime = selectedDayData[`${field.id}.toTime`];

        const isFutureDate =
          !selectedDate || (selectedDate && isFuture(parseISO(selectedDate)));
        const isTimeValid =
          !selectedStartTime ||
          !selectedEndTime ||
          (selectedStartTime &&
            selectedEndTime &&
            validateTimeRange(selectedStartTime, selectedEndTime));

        return (
          <VStack key={`${field.id}_container`} space="3">
            <HStack justifyContent="space-between">
              <Text
                key={`${field.id}_text`}
                fontSize="md"
                fontWeight="bold"
                color="rs.primary_purple"
              >
                {t("Day %{number}", { number: index + 1 })}
              </Text>
              {shouldRenderDeleteButton && (
                <Pressable
                  onPress={() => {
                    remove(index);
                  }}
                >
                  <Text color="rs.primary_purple" fontSize={16}>
                    {t("Delete")}
                  </Text>
                </Pressable>
              )}
            </HStack>
            <VStack space="2">
              <HStack
                borderColor="rs.red"
                borderWidth={isFutureDate ? "0" : "1"}
                borderRadius="xl"
              >
                <FormInput
                  key={`${field.id}_date`}
                  label={t("Date")}
                  inputProps={{
                    editable: false,
                    InputRightElement: <DownArrowIcon mr="4" />,
                  }}
                  onPress={() => {
                    setSelectedFieldId(field.id);
                    setSelectedIndex(index);
                    setIsOpen((prev) => ({ ...prev, courseFrom: true }));
                  }}
                  {...formInputProps}
                  controllerProps={{
                    ...formInputProps.controllerProps,
                    name: `${formInputProps.controllerProps.name}.${index}.date` as TName,
                    rules: {
                      required: true,
                    },
                  }}
                  {...formInputProps.controllerProps.control?.register(
                    `${formInputProps.controllerProps.name}.${index}.date`
                  )}
                />
              </HStack>
              {!isFutureDate && (
                <Text color="rs.red">{t("Date should be in the future")}</Text>
              )}
            </VStack>

            <VStack space="2">
              <HStack space="4">
                <HStack
                  borderColor="rs.red"
                  borderWidth={isTimeValid ? "0" : "1"}
                  borderRadius="xl"
                  flex="1"
                >
                  <FormInput
                    key={`${field.id}_from`}
                    label={t("From")}
                    controllerProps={{
                      ...formInputProps.controllerProps,
                      name: `${formInputProps.controllerProps.name}.${index}.fromTime` as TName,
                      rules: { required: true },
                    }}
                    inputProps={{
                      editable: false,
                      InputRightElement: <DownArrowIcon mr="4" />,
                    }}
                    onPress={() => {
                      setSelectedFieldId(field.id);
                      setSelectedIndex(index);
                      setIsOpen((prev) => ({ ...prev, durationFrom: true }));
                    }}
                    {...formInputProps.controllerProps.control?.register(
                      `${formInputProps.controllerProps.name}.${index}.fromTime`
                    )}
                  />
                </HStack>
                <HStack
                  borderColor="rs.red"
                  borderWidth={isTimeValid ? "0" : "1"}
                  borderRadius="xl"
                  flex="1"
                >
                  <FormInput
                    key={`${field.id}_to`}
                    label={t("To")}
                    controllerProps={{
                      ...formInputProps.controllerProps,
                      name: `${formInputProps.controllerProps.name}.${index}.toTime` as TName,
                      rules: { required: true },
                    }}
                    inputProps={{
                      editable: false,
                      InputRightElement: <DownArrowIcon mr="4" />,
                    }}
                    onPress={() => {
                      setSelectedFieldId(field.id);
                      setSelectedIndex(index);
                      setIsOpen((prev) => ({ ...prev, durationTo: true }));
                    }}
                    {...formInputProps.controllerProps.control?.register(
                      `${formInputProps.controllerProps.name}.${index}.toTime`
                    )}
                  />
                </HStack>
              </HStack>

              {!isTimeValid && (
                <Text color="rs.red">
                  {t("Start time must be ealier than end time")}
                </Text>
              )}
            </VStack>
            {(field.differentVenue || field.address) && (
              <FormInput
                key={`${field.id}_address`}
                label={t("Venue")}
                controllerProps={{
                  ...formInputProps.controllerProps,
                  name: `${formInputProps.controllerProps.name}.${index}.address` as TName,
                }}
              />
            )}
            {/* <ThreeColumnPickerModal
              defaultSelectValues={[
                `${today.getFullYear()}`,
                `${today.getMonth() + 1}`.padStart(2, "0"),
                `${today.getDate() + 1}`.padStart(2, "0"),
              ]}
              isOpen={isOpen.courseFrom}
              onClose={() => {
                setIsOpen((prev) => ({ ...prev, courseFrom: false }));
              }}
              headerLabel={`${t("Select")}${t("Date")}`}
              buttonLabel={t("Confirm")}
              concatenator={["-", "-"]}
              options={[yearList, monthList, dateList]}
              controllerProps={{
                ...formInputProps.controllerProps,
                name: `${formInputProps.controllerProps.name}.${selectedIndex}.date`,
              }}
              onChangeValue={(value) => {
                const object = selectedDayData;
                selectedDayData[`${selectedFieldId}.date`] = value;
                setSelectedDateData((prev) => ({ ...prev, ...object }));
              }}
            /> */}
            <DateTimePicker
              title={`${t("Select")}${t("Date")}`}
              isShow={isOpen.courseFrom}
              mode="date"
              controllerProps={{
                ...formInputProps.controllerProps,
                name: `${formInputProps.controllerProps.name}.${selectedIndex}.date`,
              }}
              onChangeValue={(value) => {
                const object = selectedDayData;
                selectedDayData[`${selectedFieldId}.date`] = value;
                setSelectedDateData((prev) => ({ ...prev, ...object }));
              }}
              onDefaultDate={(value) => {
                setDefaultDate(value);
              }}
              defaultDate={defaultDate}
              onClose={() => {
                setIsOpen((prev) => ({ ...prev, courseFrom: false }));
              }}
            />
            {/* <ThreeColumnPickerModal
              isOpen={isOpen.durationFrom}
              onClose={() => {
                setIsOpen((prev) => ({ ...prev, durationFrom: false }));
              }}
              headerLabel={`${t("Select")}${t("Start Time")}`}
              options={[hourList, minuteList, period]}
              concatenator={[":", " "]}
              controllerProps={{
                ...formInputProps.controllerProps,
                name: `${formInputProps.controllerProps.name}.${selectedIndex}.fromTime`,
              }}
              onChangeValue={(value) => {
                const object = selectedDayData;
                selectedDayData[`${selectedFieldId}.fromTime`] = value;
                setSelectedDateData((prev) => ({ ...prev, ...object }));
              }}
            /> */}
            <TimePicker
              isOpen={isOpen.durationFrom}
              onClose={() => {
                setIsOpen((prev) => ({ ...prev, durationFrom: false }));
              }}
              headerLabel={`${t("Select")}${t("Start Time")}`}
              options={[hourList, minuteList, period]}
              concatenator={[":", " "]}
              controllerProps={{
                ...formInputProps.controllerProps,
                name: `${formInputProps.controllerProps.name}.${selectedIndex}.fromTime`,
              }}
              onChangeValue={(value) => {
                const object = selectedDayData;
                selectedDayData[`${selectedFieldId}.fromTime`] = value;
                setSelectedDateData((prev) => ({ ...prev, ...object }));
              }}
            />
            {/* <ThreeColumnPickerModal
              isOpen={isOpen.durationTo}
              onClose={() => {
                setIsOpen((prev) => ({ ...prev, durationTo: false }));
              }}
              headerLabel={`${t("Select")}${t("End Time")}`}
              options={[hourList, minuteList, period]}
              concatenator={[":", " "]}
              controllerProps={{
                ...formInputProps.controllerProps,
                name: `${formInputProps.controllerProps.name}.${selectedIndex}.toTime`,
              }}
              onChangeValue={(value) => {
                const object = selectedDayData;
                selectedDayData[`${selectedFieldId}.toTime`] = value;
                setSelectedDateData((prev) => ({ ...prev, ...object }));
              }}
            /> */}
            <TimePicker
              isOpen={isOpen.durationTo}
              onClose={() => {
                setIsOpen((prev) => ({ ...prev, durationTo: false }));
              }}
              headerLabel={`${t("Select")}${t("End Time")}`}
              options={[hourList, minuteList, period]}
              concatenator={[":", " "]}
              controllerProps={{
                ...formInputProps.controllerProps,
                name: `${formInputProps.controllerProps.name}.${selectedIndex}.toTime`,
              }}
              onChangeValue={(value) => {
                const object = selectedDayData;
                selectedDayData[`${selectedFieldId}.toTime`] = value;
                setSelectedDateData((prev) => ({ ...prev, ...object }));
              }}
            />
          </VStack>
        );
      })}
      {fields.length < 10 && (
        <>
          <Button
            variant="outline"
            onPress={() => {
              append({});
            }}
          >
            {t("Add date with same address")}
          </Button>
          <Button
            variant="outline"
            onPress={() => {
              append({ differentVenue: true });
            }}
          >
            {t("Add date with different address")}
          </Button>
        </>
      )}
    </VStack>
  );
}
