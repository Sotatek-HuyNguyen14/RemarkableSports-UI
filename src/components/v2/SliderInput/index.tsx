import React, { useState } from "react";
import {
  Box,
  Flex,
  Heading,
  HStack,
  Modal,
  Pressable,
  StyledProps,
  Switch,
  Text,
  useTheme,
  VStack,
  ScrollView,
  ArrowUpIcon,
  ArrowDownIcon,
  Circle,
} from "native-base";
import { View } from "react-native";
import {
  FieldPath,
  FieldValues,
  useController,
  UseControllerProps,
  useForm,
} from "react-hook-form";
import { Calendar, LocaleConfig } from "react-native-calendars";
import MultiSlider, {
  MultiSliderProps,
} from "@ptomasroos/react-native-multi-slider";
import CalendarIcon from "../../Icons/CalendarIcon";
import LeftArrowIcon from "../../Icons/LeftArrowIcon";
import RightArrowIcon from "../../Icons/RightArrowIcon";
import { formatDateToCalendar } from "../../../utils/date";
import i18n from "../../../language/index";
import { getTranslation } from "../../../utils/translation";
import DownArrowIcon from "../../Icons/DownArrowIcon";
import { SCREEN_WIDTH } from "../../../constants/constants";
import CustomInput from "../../FormInput/CustomInput";
import { isBlank, isPositiveNumber } from "../../../utils/strings";

const t = getTranslation("component.SliderInput");

interface SliderInputProps<
  TFieldValues extends FieldValues,
  TName extends FieldPath<TFieldValues>
> {
  controllerProps: UseControllerProps<TFieldValues, TName>;
  min: number;
  max: number;
  shouldShowInput?: boolean;
}

interface SliderInputFormValue {
  min: string;
  max: string;
}

export default function SliderInput<
  TFieldValues extends FieldValues,
  TName extends FieldPath<TFieldValues>
>({
  controllerProps,
  min,
  max,
  shouldShowInput = true,
}: SliderInputProps<TFieldValues, TName>) {
  const {
    field: { onChange, value },
    fieldState: { error, isDirty },
  } = useController({ ...controllerProps });
  const { colors, space, sizes } = useTheme();

  const defaultMin =
    value && value[0] && typeof value[0] === "string"
      ? parseInt(value[0], 10)
      : value && value[0] && typeof value[0] === "number"
      ? value[0].toString()
      : min.toString();

  const defaultMax =
    value && value[1] && typeof value[1] === "string"
      ? parseInt(value[1], 10)
      : value && value[1] && typeof value[1] === "number"
      ? value[1].toString()
      : min.toString();
  const {
    control,
    handleSubmit,
    setValue,
    watch,
    trigger,
    formState: { isValid, isSubmitting, isDirty: isMinMaxInputDirty, errors },
  } = useForm<SliderInputFormValue>({
    mode: "onChange",
    defaultValues: {
      min: defaultMin.toString(),
      max: defaultMax.toString(),
    },
  });

  const selectedValue = value && !isDirty ? value : value ?? [min, max];

  const inputValue = (key: "min" | "max") => {
    const validate = (v: string) => {
      const minInput = watch("min");
      const maxInput = watch("max");
      if (key === "min" && maxInput) {
        return (
          (isPositiveNumber(v) &&
            parseInt(v, 10) <= max &&
            parseInt(v, 10) >= min &&
            parseInt(v, 10) < parseInt(maxInput, 10)) ||
          t("Min must be less than Max and an integer")
        );
      }

      if (minInput && key === "max") {
        return (
          (isPositiveNumber(v) &&
            parseInt(v, 10) <= max &&
            parseInt(v, 10) >= min &&
            parseInt(v, 10) > parseInt(minInput, 10)) ||
          t("Max must be greater than Min and an integer")
        );
      }

      return true;
    };

    return (
      <CustomInput
        onChangeText={(text) => {
          if (text === "" && key === "min") {
            onChange([0, selectedValue[1]]);
          }
          if (text === "" && key === "max") {
            onChange([selectedValue[0], 0]);
          }
          if (key === "min") {
            if (parseInt(text, 10) >= min && parseInt(text, 10) < max) {
              onChange([parseInt(text, 10), selectedValue[1]]);
            }
          } else if (
            parseInt(text, 10) <= max &&
            parseInt(text, 10) > min &&
            key === "max"
          ) {
            onChange([selectedValue[0], parseInt(text, 10)]);
          }
        }}
        controllerProps={{
          name: key,
          control,
          rules: {
            required: shouldShowInput,
            validate: {
              withInRange: (v: string) => {
                if (v) {
                  return validate(v);
                }
              },
            },
          },
        }}
        inputProps={{
          borderRadius: 16,
          borderColor: "rs.white",
          keyboardType: "number-pad",
          marginTop: 2,
        }}
        containerProps={{
          style: {
            backgroundColor: "gray.100",
            width: 70,
            height: 70,
            shadowOffset: {
              width: 5,
              height: 5,
            },
            shadowOpacity: 0.1,
          },
          shadow: "9",
        }}
      />
    );
  };

  const shouldShowError =
    !isBlank(error?.message) ||
    !isBlank(errors.max?.message) ||
    !isBlank(errors.min?.message);
  let errorMessage = "";
  if (error?.message) {
    errorMessage = error.message;
  } else if (errors.max?.message) {
    errorMessage = errors.max.message;
  } else if (errors.min?.message) {
    errorMessage = errors.min.message;
  }

  return (
    <VStack space="2">
      <HStack space="3" alignItems="flex-start">
        {shouldShowInput && inputValue("min")}
        <MultiSlider
          values={selectedValue}
          min={min}
          max={max}
          selectedStyle={{ backgroundColor: colors.purple[800] }}
          trackStyle={{
            height: 8,
            borderRadius: 10,
            backgroundColor: colors.rs.lightGrey,
          }}
          // TODO: CONTAINER_PADDING * 2 will be replaced by NB sizes when HeaderLayout refactored to NB component
          sliderLength={SCREEN_WIDTH * 0.5}
          markerOffsetY={4}
          // eslint-disable-next-line react/no-unstable-nested-components
          customMarker={() => (
            <Circle h="5" w="5" bgColor="rs.primary_purple" />
          )}
          onValuesChangeFinish={(val) => {
            onChange(val);
            setValue("min", val[0].toString());
            setValue("max", val[1].toString());
          }}
        />
        {shouldShowInput && inputValue("max")}
      </HStack>
      {shouldShowError && (
        <Text color="rs_secondary.error">{errorMessage}</Text>
      )}
    </VStack>
  );
}

/*
        <SliderInput
          controllerProps={{ control, name: "price" }}
          min={100}
          max={500}
        />
        => price: number[]
*/
