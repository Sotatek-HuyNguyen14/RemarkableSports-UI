import React, { useRef, useState } from "react";
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
import {
  useController,
  UseControllerProps,
  FieldPath,
  FieldValues,
} from "react-hook-form";
import ErrorIcon from "../Icons/ErrorIcon";
import RoundedBlackCrossIcon from "../Icons/RoundedBlackCrossIcon";
import { getFormInputTestId } from "../../../e2e/helpers";

export interface FormInputProps<
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
  onChangeText?: (value: string) => void;
  isGreyedOut?: boolean;
  isShowTopTip?: boolean;
  isBorderEnabled?: boolean;
  testID?: string;
}

function FormInput<
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
  onChangeText,
  isGreyedOut = false,
  isShowTopTip = true,
  isBorderEnabled = true,
  testID,
}: FormInputProps<TFieldValues, TName>) {
  const {
    field: { onBlur: formOnBlur, onChange, value, name },
    fieldState: { error, isDirty },
    formState: { errors },
  } = useController({ ...controllerProps });
  const [isFocus, setIsFocus] = useState(false);
  const inputRef = useRef<any>();
  const isEditable =
    inputProps?.editable !== undefined ? inputProps?.editable : true;
  const componentTestId = testID || getFormInputTestId(name);

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
        shadow={isBorderEnabled ? "9" : "none"}
        style={
          isBorderEnabled && {
            shadowOffset: {
              width: 5,
              height: 5,
            },
            shadowOpacity: 0.1,
          }
        }
        borderRadius="2xl"
        borderWidth="1"
        borderColor={!isGreyedOut ? "rs.white" : "rs.button_grey"}
        bgColor={!isGreyedOut ? "rs.white" : "rs.lightGrey"}
      >
        {isShowTopTip && (
          <Pressable
            zIndex="1"
            position="absolute"
            top={isFocus || isDirty || value ? "1" : "2.5"}
            left={inputProps?.InputLeftElement ? "12" : "4"}
            onPress={() => {
              onPress?.();
              inputRef.current.focus();
              if (isEditable) {
                setIsFocus(true);
              }
            }}
          >
            <FormControl.Label
              _text={{
                // color: "rs.inputLabel_grey",
                fontSize: isFocus || isDirty || value ? "xs" : "md",
                lineHeight: isFocus || isDirty || value ? "lg" : "2xl",
              }}
              {...labelProps}
            >
              {`${label}${controllerProps.rules?.required ? "*" : ""}`}
            </FormControl.Label>
          </Pressable>
        )}
        <Input
          testID={componentTestId}
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
          onChange={onChange}
          onChangeText={(val) => {
            onChange(val);
            onChangeText?.(val);
          }}
          blurOnSubmit
          value={value}
          borderColor={!isGreyedOut ? "rs.white" : "rs.button_grey"}
          borderRadius="2xl"
          borderWidth="1"
          bgColor={!isGreyedOut ? "rs.white" : "rs.lightGrey"}
          px="4"
          pt={isShowTopTip ? "7" : "3"}
          pb="3"
          fontSize="md"
          lineHeight={inputProps?.multiline ? 24 : null}
          _focus={{ borderColor: "rs.white" }}
          onFocus={() => {
            onFocus?.();
            onPress?.();
            if (isEditable) {
              setIsFocus(true);
            }
          }}
          InputRightElement={
            inputProps?.InputRightElement ||
            (value ? (
              <VStack
                key={label}
                alignItems="flex-end"
                justifyContent="space-between"
                alignSelf="flex-start"
                mr="3.5"
                pt={isShowTopTip ? "7" : "3"}
                mb="3"
              >
                <>
                  {!isGreyedOut && (
                    <Pressable pb="4" px="1" onPress={() => onChange("")}>
                      <RoundedBlackCrossIcon />
                    </Pressable>
                  )}
                  {isShowWords && inputProps?.maxLength && (
                    <Box flex={1} justifyContent="flex-end">
                      <Text color="rs_secondary.grey">
                        {value?.length}/{inputProps?.maxLength}
                      </Text>
                    </Box>
                  )}
                </>
              </VStack>
            ) : undefined)
          }
          {...inputProps}
        />
      </Pressable>
      {helperText && (
        <FormControl.HelperText {...helperTextProps}>
          {helperText}
        </FormControl.HelperText>
      )}
      <FormControl.ErrorMessage leftIcon={<ErrorIcon />} {...errorProps}>
        {error?.message}
      </FormControl.ErrorMessage>
    </FormControl>
  );
}

export default FormInput;
