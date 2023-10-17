import React, { useEffect, useMemo, useState } from "react";
import {
  Box,
  Button,
  Flex,
  Heading,
  HStack,
  Modal,
  Pressable,
  StyledProps,
  Switch,
  Text,
  useTheme,
  View,
  VStack,
} from "native-base";
import {
  FieldPath,
  FieldValues,
  useController,
  UseControllerProps,
} from "react-hook-form";
import { getTranslation } from "../../../utils/translation";
import { getPeriod, hourList, minuteList } from "../../../constants/Time";
import WheelPicker from "../../Picker/WheelPicker";

const t = getTranslation(["component.TimePicker", "constant.button"]);

const period = getPeriod();

interface TimePickerProps<
  TFieldValues extends FieldValues,
  TName extends FieldPath<TFieldValues>
> {
  controllerProps: UseControllerProps<TFieldValues, TName>;
  isOpen: boolean;
  onClose: () => void;
  headerLabel?: string;
  description?: string;
  onChangeValue?: (value: string) => void;
  onCloseWithValue?: (value: string) => void;
  options?: [
    { label: string; value: string }[],
    { label: string; value: string }[],
    { label: string; value: string }[]
  ];
  concatenator?: [string, string];
  defaultSelectValues?: string[];
}

export default function TimePicker<
  TFieldValues extends FieldValues,
  TName extends FieldPath<TFieldValues>
>({
  controllerProps,
  isOpen,
  onClose,
  headerLabel,
  onChangeValue,
  concatenator = [":", " "],
  defaultSelectValues,
  onCloseWithValue,
  options = [hourList, minuteList, period],
}: TimePickerProps<TFieldValues, TName>) {
  const {
    field: { onChange, value },
    fieldState: { error, isDirty },
    formState: { errors },
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

  const picker = () => {
    return (
      <HStack mt="20" justifyContent="center" alignItems="center">
        <View flex="1">
          <WheelPicker
            textStyle={{ w: "100%", alignment: "right" }}
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
            textStyle={{ w: "100%", alignment: "left" }}
            options={internalOptions[2]}
            initIndex={initIndex.right}
            onChange={(d: string) => {
              setData((prev) => ({ ...prev, right: d }));
            }}
          />
        </View>
      </HStack>
    );
  };

  const timePickerContent = () => {
    return (
      <Modal.Content bg="rs.white" flex="1" w="100%" p="2" mt="auto">
        <Modal.Header
          bg="rs.white"
          pt="4"
          borderBottomWidth="1"
          _text={{
            fontSize: "lg",
          }}
          justifyContent="flex-start"
          alignItems="flex-start"
        >
          {headerLabel && (
            <HStack space="2" alignItems="center">
              <Text fontSize="lg" fontWeight="bold">
                {headerLabel}
              </Text>
            </HStack>
          )}
          <Modal.CloseButton />
        </Modal.Header>
        <VStack justifyContent="center" alignItems="center" space="3" mt="3">
          {picker()}
        </VStack>
        <Button
          onPress={() => {
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
            if (!onCloseWithValue) {
              onClose();
            } else {
              onCloseWithValue(
                `${data.left}${concatenator[0]}${data.middle}${concatenator[1]}${data.right}`
              );
            }
          }}
          mt="auto"
          mb="4"
        >
          {t("Save")}
        </Button>
      </Modal.Content>
    );
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={() => {
        onClose();
      }}
    >
      {timePickerContent()}
    </Modal>
  );
}
