/* eslint-disable no-underscore-dangle */
import React, { useEffect, useMemo, useState } from "react";
import { View } from "native-base";
import {
  UseControllerProps,
  useController,
  FieldValues,
  FieldPath,
} from "react-hook-form";

import PickerModal, { PickerModalProps } from "./PickerModal";
import WheelPicker from "../Picker/WheelPicker";

export interface ThreeColumnPickerModalProps<
  TFieldValues extends FieldValues,
  TName extends FieldPath<TFieldValues>
> extends PickerModalProps {
  options: [
    { label: string; value: string }[],
    { label: string; value: string }[],
    { label: string; value: string }[]
  ];
  controllerProps: UseControllerProps<TFieldValues, TName>;
  concatenator: [string, string];
  defaultSelectValues?: string[];
  onChangeValue?: (value: string) => void;
}
export default function ThreeColumnPickerModal<
  TFieldValues extends FieldValues,
  TName extends FieldPath<TFieldValues>
>({
  options,
  isOpen,
  headerLabel,
  hasButton,
  buttonLabel,
  concatenator,
  controllerProps,
  defaultSelectValues,
  onClose,
  onChangeValue,
}: ThreeColumnPickerModalProps<TFieldValues, TName>) {
  const {
    field: { onChange, value },
  } = useController({ ...controllerProps });
  let defaultValues: string[] | null = Array.isArray(defaultSelectValues)
    ? defaultSelectValues
    : null;
  if (value && typeof value === "string") {
    defaultValues = value.split(concatenator[0]);
    if (defaultValues && defaultValues.length !== 3) {
      defaultValues = [
        defaultValues[0],
        ...defaultValues[1].split(concatenator[1]),
      ];
    }
  }

  const defaultData = {
    left: defaultValues ? defaultValues[0] : "",
    middle: defaultValues ? defaultValues[1] : "",
    right: defaultValues ? defaultValues[2] : "",
  };

  const [data, setData] = useState<{
    left: string;
    middle: string;
    right: string;
  }>(defaultData);

  const shouldSetDataWhenStateCombined =
    defaultData.left !== data.left &&
    defaultData.left !== "" &&
    data.left === "" &&
    defaultData.right !== data.right &&
    defaultData.right !== "" &&
    data.right === "" &&
    defaultData.middle !== data.middle &&
    defaultData.middle !== "" &&
    data.middle === "";

  if (shouldSetDataWhenStateCombined) {
    setData(defaultData);
  }

  const internalOptions = useMemo(
    () => [
      [{ label: "", value: "" }].concat(options[0]),
      [{ label: "", value: "" }].concat(options[1]),
      [{ label: "", value: "" }].concat(options[2]),
    ],
    [options]
  );

  const index = useMemo(
    () => [
      internalOptions[0].findIndex((val) => val.value === data.left),
      internalOptions[1].findIndex((val) => val.value === data.middle),
      internalOptions[2].findIndex((val) => val.value === data.right),
    ],
    [data.left, data.middle, data.right, internalOptions]
  );
  const [initIndex, setInitIndex] = useState({
    left: index[0] > 0 ? index[0] : 0,
    middle: index[1] > 0 ? index[1] : 0,
    right: index[2] > 0 ? index[2] : 0,
  });

  useEffect(() => {
    setInitIndex({
      left: index[0] > 0 ? index[0] : 0,
      middle: index[1] > 0 ? index[1] : 0,
      right: index[2] > 0 ? index[2] : 0,
    });
  }, [index]);

  return (
    <PickerModal
      isOpen={isOpen}
      onClose={() => {
        onClose();
        if (hasButton) return;

        if (data.left && data.right && data.middle) {
          onChangeValue?.(
            `${data.left}${concatenator[0]}${data.middle}${concatenator[1]}${data.right}`
          );
          onChange(
            `${data.left}${concatenator[0]}${data.middle}${concatenator[1]}${data.right}`
          );
        } else {
          onChangeValue?.("");
          onChange("");
        }
      }}
      headerLabel={headerLabel}
      hasButton={hasButton}
      buttonLabel={buttonLabel}
      onButtonPress={() => {
        onClose();
        if (data.left && data.right && data.middle) {
          onChangeValue?.(
            `${data.left}${concatenator[0]}${data.middle}${concatenator[1]}${data.right}`
          );
          onChange(
            `${data.left}${concatenator[0]}${data.middle}${concatenator[1]}${data.right}`
          );
        } else {
          onChangeValue?.("");
          onChange("");
        }
      }}
    >
      {isOpen && (
        <>
          <View flex="1">
            <WheelPicker
              options={internalOptions[0]}
              initIndex={initIndex.left}
              onChange={(d: string) => {
                setData((prev) => ({ ...prev, left: d }));
              }}
            />
          </View>
          <View flex="1">
            <WheelPicker
              options={internalOptions[1]}
              initIndex={initIndex.middle}
              onChange={(d: string) => {
                setData((prev) => ({ ...prev, middle: d }));
              }}
            />
          </View>
          <View flex="1">
            <WheelPicker
              options={internalOptions[2]}
              initIndex={initIndex.right}
              onChange={(d: string) => {
                setData((prev) => ({ ...prev, right: d }));
              }}
            />
          </View>
        </>
      )}
    </PickerModal>
  );
}
