import React from "react";
import { Circle, useTheme } from "native-base";
import {
  FieldPath,
  FieldValues,
  useController,
  UseControllerProps,
} from "react-hook-form";
import MultiSlider, {
  MultiSliderProps,
} from "@ptomasroos/react-native-multi-slider";
import { SCREEN_WIDTH } from "../../constants/constants";

interface Props<
  TFieldValues extends FieldValues,
  TName extends FieldPath<TFieldValues>
> extends MultiSliderProps {
  controllerProps: UseControllerProps<TFieldValues, TName>;
}

export default function RangeSlider<
  TFieldValues extends FieldValues,
  TName extends FieldPath<TFieldValues>
>({ min, max, controllerProps, ...otherProps }: Props<TFieldValues, TName>) {
  const {
    field: { onChange, value },
    fieldState: { isDirty },
  } = useController({ ...controllerProps });
  const { colors, space, sizes } = useTheme();
  return (
    <MultiSlider
      values={value && !isDirty ? value : value ?? [min, max]}
      min={min}
      max={max}
      selectedStyle={{ backgroundColor: colors.rs.lightBlue }}
      trackStyle={{
        height: 8,
        borderRadius: 10,
        backgroundColor: colors.rs.lightGrey,
      }}
      // TODO: CONTAINER_PADDING * 2 will be replaced by NB sizes when HeaderLayout refactored to NB component
      sliderLength={
        SCREEN_WIDTH - space.defaultLayoutSpacing * 2 - sizes[2] * 2
      }
      markerOffsetY={4}
      // eslint-disable-next-line react/no-unstable-nested-components
      customMarker={() => <Circle h="5" w="5" bgColor="rs.primary_purple" />}
      onValuesChangeFinish={(val) => {
        onChange(val);
      }}
      {...otherProps}
    />
  );
}
