import React, { useCallback, useState } from "react";
import { Badge, Box, Center, HStack, Pressable, Text } from "native-base";
import { IHStackProps } from "native-base/lib/typescript/components/primitives/Stack/HStack";
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
  boxProps: IHStackProps;
}
const t = getTranslation("constant.week");
export default function DaysOfWeekComponent<
  TFieldValues extends FieldValues,
  TName extends FieldPath<TFieldValues>
>({ controllerProps, boxProps }: DaysOfWeekProps<TFieldValues, TName>) {
  const {
    field: { onChange, value },
  } = useController({ ...controllerProps });
  const totalDate = [
    DaysOfWeek.Monday,
    DaysOfWeek.Tuesday,
    DaysOfWeek.Wednesday,
    DaysOfWeek.Thursday,
    DaysOfWeek.Friday,
    DaysOfWeek.Saturday,
    DaysOfWeek.Sunday,
  ];
  const selectRecurring = useCallback(
    (text) => {
      if (value.includes(text)) {
        if (value.length > 1) {
          value.splice(
            value.findIndex((item: DaysOfWeek) => item === text),
            1
          );
          onChange(value);
        }
      } else {
        onChange([...value, text]);
      }
    },
    [onChange, value]
  );
  return (
    <HStack
      space={1}
      flexWrap="wrap"
      justifyContent="space-between"
      {...boxProps}
    >
      {totalDate.map((d) => {
        const isActive = value.includes(d);
        return (
          <Pressable
            key={d}
            onPress={() => {
              selectRecurring(d);
            }}
          >
            <Badge
              key={d}
              w="8"
              h="8"
              borderRadius="full"
              borderColor="rs.lightBlue"
              bg={isActive ? "rs.lightBlue" : "rs.white"}
              _text={{
                color:
                  d === DaysOfWeek.Sunday ? "rs_secondary.error" : "rs.black",
                fontWeight: "bold",
              }}
              m="1"
            >
              {t(d.slice(0, 3).toUpperCase())}
            </Badge>
          </Pressable>
        );
      })}
    </HStack>
  );
}
