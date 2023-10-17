import { isFuture, parseISO } from "date-fns";
import { Button, Heading, HStack, Pressable, Text, VStack } from "native-base";
import React, { useCallback, useEffect, useMemo, useState } from "react";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { useNavigation } from "@react-navigation/native";
import {
  FieldPath,
  FieldValues,
  useFieldArray,
  useForm,
} from "react-hook-form";
import { LayoutAnimation } from "react-native";
import { getPeriod, hourList, minuteList } from "../../constants/Time";
import { validateTimeRange } from "../../utils/date";
import { getTranslation } from "../../utils/translation";
import FormInput, { FormInputProps } from "../FormInput/FormInput";
import DownArrowIcon from "../Icons/DownArrowIcon";
import DateTimePicker from "../v2/DateTimePicker";
import TimePicker from "../v2/TimePicker";
import SortIcon from "../Icons/SortIcon";
import UpArrowIcon from "../Icons/UpArrowIcon";
import Card from "../Card/Card";
import ConfirmationModal from "../ConfirmationModal/ConfirmationModal";
import { MainStackNavigatorParamList } from "../../routers/Types";

const t = getTranslation([
  "component.ArrayDateInput",
  "constant.button",
  "formInput",
  "validation",
]);

export interface FormValue {
  date: string;
  fromTime: string;
  toTime: string;
}

export type ArraySessionsDateInputProps<
  TFieldValues extends FieldValues,
  TName extends FieldPath<TFieldValues>
> = FormInputProps<TFieldValues, TName>;

export default function ArraySessionsDateInput<
  TFieldValues extends FieldValues,
  TName extends FieldPath<TFieldValues>
>({ ...formInputProps }: ArraySessionsDateInputProps<TFieldValues, TName>) {
  const { fields, append, remove, update } = useFieldArray<TFieldValues, TName>(
    formInputProps.controllerProps
  );

  const { control, setValue } = useForm<FormValue>({
    mode: "onChange",
  });

  const [isOpen, setIsOpen] = useState({
    courseFrom: false,
    courseTo: false,
    durationFrom: false,
    durationTo: false,
    remove: false,
  });
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [selectedDayData, setSelectedDateData] = useState<{}>({});
  const [selectedFieldId, setSelectedFieldId] = useState();
  const [defaultDate, setDefaultDate] = useState(
    fields.length ? fields[0]?.date : ""
  );
  const navigation =
    useNavigation<NativeStackNavigationProp<MainStackNavigatorParamList>>();

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
      <HStack justifyContent="space-between" alignItems="center">
        <Heading color="rs.primary_purple" />
        <SortIcon />
      </HStack>
      {fields?.map((field, index) => {
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
        const { isExpand, date, edited } = field;
        return (
          <VStack
            key={`${field.id}${field.courseSessionId}__Array_SessionsDateInput`}
          >
            <Card
              onPress={() => {
                update(index, {
                  ...field,
                  isExpand: !field?.isExpand,
                });
                LayoutAnimation.configureNext(
                  LayoutAnimation.Presets.easeInEaseOut
                );
              }}
              body={
                <VStack py="1" px="2" space={4}>
                  <HStack alignItems="center" justifyContent="space-between">
                    <HStack space={2} alignItems="center">
                      <Text fontSize={20} fontWeight={700} lineHeight={28}>
                        {date}
                      </Text>
                      {edited && <Text>({t("Edited")})</Text>}
                    </HStack>
                    <Pressable
                      p="2"
                      alignItems="center"
                      justifyContent="center"
                      onPress={() => {
                        update(index, {
                          ...field,
                          isExpand: !field?.isExpand,
                        });
                        LayoutAnimation.configureNext(
                          LayoutAnimation.Presets.easeInEaseOut
                        );
                      }}
                    >
                      {!isExpand && <DownArrowIcon size="sm" color="#31095E" />}
                      {isExpand && <UpArrowIcon size="sm" color="#31095E" />}
                    </Pressable>
                  </HStack>
                  {isExpand && (
                    <VStack space={4}>
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
                            borderColor: "black",
                            InputRightElement: (
                              <DownArrowIcon mr="4" size="sm" color="#31095E" />
                            ),
                          }}
                          onPress={() => {
                            setSelectedFieldId(field.id);
                            setSelectedIndex(index);
                            setValue("date", field.date);
                            setIsOpen((prev) => ({
                              ...prev,
                              courseFrom: true,
                            }));
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
                        <Text color="rs.red">
                          {t("Date should be in the future")}
                        </Text>
                      )}
                      <HStack
                        borderColor="rs.red"
                        borderWidth={isTimeValid ? "0" : "1"}
                        borderRadius="xl"
                        flex="1"
                      >
                        <FormInput
                          key={`${field.id}_from`}
                          label={t("Start Time")}
                          controllerProps={{
                            ...formInputProps.controllerProps,
                            name: `${formInputProps.controllerProps.name}.${index}.fromTime` as TName,
                            rules: { required: true },
                          }}
                          inputProps={{
                            editable: false,
                            borderColor: "black",
                            InputRightElement: (
                              <DownArrowIcon mr="4" size="sm" color="#31095E" />
                            ),
                          }}
                          onPress={() => {
                            setSelectedFieldId(field.id);
                            setSelectedIndex(index);
                            setValue("fromTime", field.fromTime);
                            setIsOpen((prev) => ({
                              ...prev,
                              durationFrom: true,
                            }));
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
                          label={t("End Time")}
                          controllerProps={{
                            ...formInputProps.controllerProps,
                            name: `${formInputProps.controllerProps.name}.${index}.toTime` as TName,
                            rules: { required: true },
                          }}
                          inputProps={{
                            editable: false,
                            borderColor: "black",
                            InputRightElement: (
                              <DownArrowIcon mr="4" size="sm" color="#31095E" />
                            ),
                          }}
                          onPress={() => {
                            setSelectedFieldId(field.id);
                            setSelectedIndex(index);
                            setValue("toTime", field.toTime);
                            setIsOpen((prev) => ({
                              ...prev,
                              durationTo: true,
                            }));
                          }}
                          {...formInputProps.controllerProps.control?.register(
                            `${formInputProps.controllerProps.name}.${index}.toTime`
                          )}
                        />
                      </HStack>
                      {!isTimeValid && (
                        <Text color="rs.red">
                          {t("Start time must be ealier than end time")}
                        </Text>
                      )}
                      <Button
                        variant="outline"
                        py="3"
                        borderColor="rs_secondary.error"
                        _text={{ color: "rs_secondary.error" }}
                        onPress={() => {
                          if (field.isCanRemove) {
                            remove(index);
                            formInputProps?.onRemoveIndex(index);
                          } else {
                            setIsOpen((pre) => ({ ...pre, remove: true }));
                          }
                        }}
                      >
                        {t("Remove")}
                      </Button>
                    </VStack>
                  )}
                </VStack>
              }
            />
          </VStack>
        );
      })}
      <DateTimePicker
        title={`${t("Select")}${t("Date")}`}
        isShow={isOpen.courseFrom}
        mode="date"
        controllerProps={{
          name: "date",
          control,
          rules: { required: t("is required") },
        }}
        onChangeValue={(value) => {
          const object = selectedDayData;
          selectedDayData[`${selectedFieldId}.date`] = value;
          setSelectedDateData((prev) => ({ ...prev, ...object }));
        }}
        onDefaultDate={(value) => {
          if (fields[selectedIndex]) {
            const field = fields[selectedIndex];
            if (fields[selectedIndex]) {
              update(selectedIndex, {
                ...fields[selectedIndex],
                date: value,
              });
            }
            formInputProps?.onSelected({
              startDate: value,
              endDate: value,
              startTime: field.fromTime,
              endTime: field.toTime,
              courseSessionId: field.courseSessionId,
            });
          }
          setDefaultDate(value);
        }}
        defaultDate={defaultDate}
        onClose={() => {
          setIsOpen((prev) => ({ ...prev, courseFrom: false }));
        }}
      />
      <TimePicker
        isOpen={isOpen.durationFrom}
        onClose={() => {
          setIsOpen((prev) => ({ ...prev, durationFrom: false }));
        }}
        headerLabel={`${t("Select")}${t("Start Time")}`}
        options={[hourList, minuteList, period]}
        concatenator={[":", " "]}
        controllerProps={{
          name: "fromTime",
          control,
          rules: { required: t("is required") },
        }}
        onChangeValue={(value) => {
          const object = selectedDayData;
          selectedDayData[`${selectedFieldId}.fromTime`] = value;
          setSelectedDateData((prev) => ({ ...prev, ...object }));
          if (fields[selectedIndex]) {
            const field = fields[selectedIndex];
            update(selectedIndex, {
              ...fields[selectedIndex],
              fromTime: value,
            });
            formInputProps?.onSelected({
              startDate: field.date,
              endDate: field.date,
              startTime: value,
              endTime: field.toTime,
              courseSessionId: field.courseSessionId,
            });
          }
        }}
      />
      <TimePicker
        isOpen={isOpen.durationTo}
        onClose={() => {
          setIsOpen((prev) => ({ ...prev, durationTo: false }));
        }}
        headerLabel={`${t("Select")}${t("End Time")}`}
        options={[hourList, minuteList, period]}
        concatenator={[":", " "]}
        controllerProps={{
          name: "toTime",
          control,
          rules: { required: t("is required") },
        }}
        onChangeValue={(value) => {
          const object = selectedDayData;
          selectedDayData[`${selectedFieldId}.toTime`] = value;
          setSelectedDateData((prev) => ({ ...prev, ...object }));
          if (fields[selectedIndex]) {
            const field = fields[selectedIndex];
            update(selectedIndex, {
              ...fields[selectedIndex],
              toTime: value,
            });
            formInputProps?.onSelected({
              startDate: field.date,
              endDate: field.date,
              startTime: field.fromTime,
              endTime: value,
              courseSessionId: field.courseSessionId,
            });
          }
        }}
      />
      <ConfirmationModal
        alertType="Alert"
        confirmText={t("Manage")}
        cancelText={t("Skip")}
        isOpen={isOpen.remove}
        onCancel={() => {
          setIsOpen((pre) => ({ ...pre, remove: false }));
        }}
        title={t("players applied this session")}
        onConfirm={async () => {
          setIsOpen((pre) => ({ ...pre, remove: false }));
          navigation.pop(2);
        }}
      />
    </VStack>
  );
}
