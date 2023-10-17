import React, { useEffect, useRef, useState } from "react";
import {
  FormControl,
  Input,
  IInputProps,
  IFormControlProps,
  IFormControlLabelProps,
  IFormControlErrorMessageProps,
  IFormControlHelperTextProps,
  Pressable,
  Text,
  VStack,
  Box,
} from "native-base";
import { Keyboard } from "react-native";
import {
  useController,
  UseControllerProps,
  FieldPath,
  FieldValues,
} from "react-hook-form";
import ErrorIcon from "../Icons/ErrorIcon";
import RoundedBlackCrossIcon from "../Icons/RoundedBlackCrossIcon";

export interface CustomInputProps<
  TFieldValues extends FieldValues,
  TName extends FieldPath<TFieldValues>
> {
  label?: string;
  helperText?: string;
  isShowWords?: boolean;
  inputProps?: IInputProps;
  controllerProps: UseControllerProps<TFieldValues, TName>;
  containerProps?: IFormControlProps;
  labelProps?: IFormControlLabelProps;
  errorProps?: IFormControlErrorMessageProps;
  helperTextProps?: IFormControlHelperTextProps;
  onPress?: () => void;
  onFocus?: () => void;
  onBlur?: () => void;
  isGreyedOut?: boolean;
  customPlaceHolder?: boolean;
  shouldFocusOnAppear?: boolean;
  onChangeText?: (value: string) => void;
  isDismiss?: boolean;
}

function CustomInput<
  TFieldValues extends FieldValues,
  TName extends FieldPath<TFieldValues>
>({
  label,
  helperText,
  inputProps,
  isShowWords,
  controllerProps,
  containerProps,
  labelProps,
  errorProps,
  helperTextProps,
  onPress,
  onFocus,
  onBlur,
  isGreyedOut = false,
  customPlaceHolder = true,
  shouldFocusOnAppear = false,
  onChangeText,
  isDismiss,
}: CustomInputProps<TFieldValues, TName>) {
  const {
    field: { onBlur: formOnBlur, onChange, value, name },
    fieldState: { error, isDirty },
    formState: { errors },
  } = useController({ ...controllerProps });
  const [isFocus, setIsFocus] = useState(false);
  const inputRef = useRef<any>();
  const isEditable =
    inputProps?.editable !== undefined ? inputProps?.editable : true;

  useEffect(() => {
    if (isDismiss) {
      Keyboard.dismiss();
    }
  }, [isDismiss]);

  useEffect(() => {
    if (shouldFocusOnAppear) {
      inputRef.current.focus();
      if (isEditable) {
        setIsFocus(true);
      }
    }
  }, [shouldFocusOnAppear, setIsFocus, isEditable, inputRef]);

  return (
    <FormControl
      isInvalid={name in errors || name.split(".")[0] in errors}
      {...containerProps}
    >
      <Pressable
        onPress={() => {
          if (inputProps?.multiline) {
            inputRef.current.focus();
          }
          onPress?.();
          if (isEditable) {
            setIsFocus(true);
          }
        }}
      >
        <Input
          placeholder={
            !customPlaceHolder
              ? `${label}${controllerProps.rules?.required ? "*" : ""}`
              : ""
          }
          ref={inputRef}
          // If pointerEvents value is none, then the "press action" will trigger Pressable onPress, otherwise it will trigger Input component "onFocus event"
          pointerEvents={!inputProps?.editable && onPress ? "none" : "auto"}
          scrollEnabled={false}
          onBlur={() => {
            onBlur?.();
            formOnBlur();
            if (isEditable) {
              setIsFocus(false);
            }
          }}
          _focus={{
            borderColor: inputProps?.borderColor,
          }}
          onChange={onChange}
          onChangeText={(val) => {
            onChange(val);
            onChangeText?.(val);
          }}
          value={value}
          borderColor={!isGreyedOut ? "rs.white" : "rs.button_grey"}
          bgColor={!isGreyedOut ? "rs.white" : "rs.button_grey"}
          fontSize="sm"
          onFocus={() => {
            onFocus?.();
            onPress?.();
            if (isEditable) {
              setIsFocus(true);
            }
          }}
          {...inputProps}
        />
      </Pressable>
    </FormControl>
  );
}

export default CustomInput;
