import React, { useCallback, useState } from "react";
import { Box, Center, HStack, Pressable, Text } from "native-base";
import {
  FieldPath,
  FieldValues,
  useController,
  UseControllerProps,
} from "react-hook-form";
import { DaysOfWeek } from "../../models/Response";
import { getTranslation } from "../../utils/translation";

export interface DaysOfWeekProps<
  TFieldValues extends FieldValues,
  TName extends FieldPath<TFieldValues>
> {
  controllerProps: UseControllerProps<TFieldValues, TName>;
  data: string[];
  isMultipleSelection?: boolean;
}

const t = getTranslation("constant.week");

export default function FormPicker<
  TFieldValues extends FieldValues,
  TName extends FieldPath<TFieldValues>
>({
  controllerProps,
  data,
  isMultipleSelection = false,
}: DaysOfWeekProps<TFieldValues, TName>) {
  const {
    field: { onChange, value },
  } = useController({ ...controllerProps });

  const selectRecurring = useCallback(
    (text) => {
      if (value.includes(text)) {
        if (value.length > 1) {
          value.splice(
            value.findIndex((item: string) => item === text),
            1
          );
          onChange(value);
        }
      } else if (isMultipleSelection) {
        onChange([...value, text]);
      } else {
        onChange([text]);
      }
    },
    [onChange, value, isMultipleSelection]
  );

  return (
    <HStack space={2} flexWrap="wrap">
      {data.map((val) => {
        const isActive = value && value.includes(val);
        return (
          <Pressable
            key={val}
            onPress={() => {
              selectRecurring(val);
            }}
          >
            <Box
              w="24"
              bgColor={isActive ? "rs.lightBlue" : "rs.white"}
              _text={{ fontWeight: "semibold", textAlign: "center" }}
              borderRadius="lg"
              borderWidth="2"
              borderColor="rs.lightBlue"
              mx="auto"
              p="1"
              px="1"
              opacity={isActive ? 1 : 0.3}
            >
              {val}
            </Box>
          </Pressable>
        );
      })}
    </HStack>
  );
}
