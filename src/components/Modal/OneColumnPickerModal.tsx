import React, { useEffect, useState } from "react";
import { View } from "native-base";

import {
  UseControllerProps,
  useController,
  FieldPath,
  FieldValues,
} from "react-hook-form";
import PickerModal, { PickerModalProps } from "./PickerModal";
import WheelPicker from "../Picker/WheelPicker";

export interface OneColumnPickerModalProps<
  TFieldValues extends FieldValues,
  TName extends FieldPath<TFieldValues>
> extends PickerModalProps {
  options: { label: string; value: string }[];
  placeholder?: string;
  onChangeValue?: (value: string) => void;
  controllerProps: UseControllerProps<TFieldValues, TName>;
  allowEmptyOnChange?: boolean;
}

export default function OneColumnPickerModal<
  TFieldValues extends FieldValues,
  TName extends FieldPath<TFieldValues>
>({
  options,
  isOpen,
  placeholder = "",
  headerLabel,
  hasButton,
  buttonLabel,
  controllerProps,
  onClose,
  onChangeValue,
  allowEmptyOnChange = false,
}: OneColumnPickerModalProps<TFieldValues, TName>) {
  const {
    field: { onChange, value },
  } = useController({ ...controllerProps });
  const internalOptions = [{ label: placeholder, value: placeholder }].concat(
    options
  );
  const index = internalOptions.findIndex((val) => val.value === value);
  const [data, setData] = useState<{ value: string }>({ value: "" });
  const [initIndex, setInitIndex] = useState(index > 0 ? index : 0);

  useEffect(() => {
    setInitIndex(index > 0 ? index : 0);
  }, [index]);
  return (
    <PickerModal
      headerLabel={headerLabel}
      buttonLabel={buttonLabel}
      isOpen={isOpen}
      onClose={() => {
        if (!hasButton && data.value) {
          onChange(data.value);
          onChangeValue?.(data.value);
        } else if (!data.value && allowEmptyOnChange) {
          onChange(" ");
          onChangeValue?.(" ");
        }
        onClose();
      }}
      hasButton={hasButton}
      onButtonPress={() => {
        onChange(data.value);
        onChangeValue?.(data.value);
        onClose();
      }}
    >
      {isOpen && (
        <View flex="1">
          <WheelPicker
            options={internalOptions}
            initIndex={initIndex}
            onChange={(d: string) => {
              setData((prev) => ({ ...prev, value: d }));
            }}
          />
        </View>
      )}
    </PickerModal>
  );
}
