import React, { useEffect, useMemo, useState } from "react";
import { View, Text } from "native-base";
import {
  UseControllerProps,
  useController,
  FieldValues,
  FieldPath,
} from "react-hook-form";

import PickerModal, { PickerModalProps } from "./PickerModal";
import WheelPicker from "../Picker/WheelPicker";

export interface TwoColumnPickerModalProps<
  TFieldValues extends FieldValues,
  TName extends FieldPath<TFieldValues>
> extends PickerModalProps {
  options: [
    { label: string; value: string }[],
    { label: string; value: string }[]
  ];
  concatenator: string;
  controllerProps: UseControllerProps<TFieldValues, TName>;
}
export default function TwoColumnPickerModal<
  TFieldValues extends FieldValues,
  TName extends FieldPath<TFieldValues>
>({
  options,
  isOpen,
  headerLabel,
  hasButton,
  buttonLabel,
  controllerProps,
  concatenator,
  onClose,
}: TwoColumnPickerModalProps<TFieldValues, TName>) {
  const {
    field: { onChange, value },
  } = useController({ ...controllerProps });

  let defaultValues: string[] | null = null;
  if (value && typeof value === "string") {
    defaultValues = value.split(concatenator);
  }

  const [data, setData] = useState<{
    left: string;
    right: string;
  }>({
    left: defaultValues ? defaultValues[0] : "",
    right: defaultValues ? defaultValues[1] : "",
  });

  const internalOptions = useMemo(
    () => [
      [{ label: "", value: "" }].concat(options[0]),
      [{ label: "", value: "" }].concat(options[1]),
    ],
    [options]
  );
  const index = useMemo(
    () => [
      internalOptions[0].findIndex((val) => val.value === data.left),
      internalOptions[1].findIndex((val) => val.value === data.right),
    ],
    [data.left, data.right, internalOptions]
  );
  const [initIndex, setInitIndex] = useState({
    left: index[0] > 0 ? index[0] : 0,
    right: index[1] > 0 ? index[1] : 0,
  });

  useEffect(() => {
    setInitIndex({
      left: index[0] > 0 ? index[0] : 0,
      right: index[1] > 0 ? index[1] : 0,
    });
  }, [index]);

  return (
    <PickerModal
      isOpen={isOpen}
      onClose={() => {
        onClose();
        if (hasButton) return;
        if (data.left && data.right)
          onChange(`${data.left}${concatenator}${data.right}`);
        else onChange("");
      }}
      headerLabel={headerLabel}
      hasButton={hasButton}
      buttonLabel={buttonLabel}
      onButtonPress={() => {
        onClose();
        if (data.left && data.right)
          onChange(`${data.left}${concatenator}${data.right}`);
        else onChange("");
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
          <View
            h="42"
            alignSelf="center"
            borderColor="#E6E4EA"
            borderTopWidth="1"
            borderBottomWidth="1"
            justifyContent="center"
          >
            <Text color="#77767E" fontSize="lg">
              To
            </Text>
          </View>
          <View flex="1">
            <WheelPicker
              options={internalOptions[1]}
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
