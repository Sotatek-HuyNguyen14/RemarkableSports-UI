/* eslint-disable react/no-array-index-key */
import { isObject } from "lodash";
import {
  Box,
  Button,
  HStack,
  Modal,
  Pressable,
  Text,
  VStack,
} from "native-base";
import React, { useEffect, useState } from "react";
import {
  FieldPath,
  FieldValues,
  useController,
  UseControllerProps,
} from "react-hook-form";
import { getSingleSectionModalConfirmButtonTestId } from "../../../e2e/helpers";
import { getTranslation } from "../../utils/translation";
import RoundedBlackCheckIcon from "../Icons/RoundedBlackCheckIcon";

const t = getTranslation(["constant.button"]);
export interface SingleSelectModalProps<
  TFieldValues extends FieldValues,
  TName extends FieldPath<TFieldValues>
> {
  title: string;
  confirmButtonText?: string;
  options: { label: string | number; value: string; isDisabled?: boolean }[];
  isReturnObj?: boolean;
  controllerProps: UseControllerProps<TFieldValues, TName>;
  defaultIndex?: number;
  isOpen: boolean;
  onClose?: () => void;
  onPressItem?: (item: { label: string; value: string }) => void;
  showSelectedIcon?: boolean;
  shouldCloseAfterSelect?: boolean;
  onChangeValue?: (value: string) => void;
  onCloseWithValue?: (value: string) => void;
}

export default function SingleSelectModal<
  TFieldValues extends FieldValues,
  TName extends FieldPath<TFieldValues>
>({
  title,
  confirmButtonText,
  options,
  controllerProps,
  defaultIndex,
  isOpen,
  onPressItem,
  onClose,
  showSelectedIcon = true,
  shouldCloseAfterSelect = false,
  isReturnObj,
  onChangeValue,
  onCloseWithValue,
}: SingleSelectModalProps<TFieldValues, TName>) {
  const {
    field: { onChange, value, name },
  } = useController({ ...controllerProps });

  const isRequired = controllerProps?.rules?.required;
  // 1.Must confirm to select 2.close not select
  // 3.defaultIndex if have defaultIndex just isdefaultIndex if no defaultIndex defaultIndex is -1
  const findIndex = isObject(value)
    ? options.findIndex(
        (op) => op.value.toString() === value?.value?.toString()
      )
    : options.findIndex((op) => op.value.toString() === `${value}`);

  const componentDefaultIndex = defaultIndex ?? findIndex;
  const [selected, setSelected] = useState(componentDefaultIndex);

  useEffect(() => {
    setSelected(componentDefaultIndex);
  }, [componentDefaultIndex]);

  return (
    <Modal
      size="full"
      isOpen={isOpen}
      onClose={() => {
        if (options && options.length > 0 && componentDefaultIndex !== -1) {
          setSelected(() => {
            if (isReturnObj) {
              onChange(options[componentDefaultIndex]);
            } else {
              onChange(options[componentDefaultIndex].value);
              onChangeValue?.(options[componentDefaultIndex].value);
            }
            return componentDefaultIndex;
          });
        } else {
          setSelected(-1);
        }
        if (!onCloseWithValue) {
          onClose?.();
        } else if (
          componentDefaultIndex &&
          options[componentDefaultIndex] &&
          options[componentDefaultIndex].value
        ) {
          onCloseWithValue?.(options[componentDefaultIndex].value);
        } else {
          onCloseWithValue?.("");
        }
      }}
    >
      <Modal.Content bg="#F5F5F5" mt="auto" flex="1" px="defaultLayoutSpacing">
        <Modal.CloseButton />
        <Box justifyContent="center" px="4" pt="4" pb="2">
          <Text fontSize="lg" fontWeight="bold" marginBottom="4">
            {title}
          </Text>
        </Box>
        <Modal.Body bg="#F5F5F5">
          <VStack space="2" flex="1" bg="#F5F5F5">
            {options.map((item, index) => {
              return (
                <Pressable
                  key={`${item.value}_${item.label}_${index}`}
                  onPress={() => {
                    if (isRequired) {
                      setSelected(index);
                    } else {
                      setSelected((old) => {
                        if (old === index) {
                          return -1;
                        }
                        return index;
                      });
                    }
                  }}
                >
                  <HStack
                    py="3"
                    px="4"
                    justifyContent="space-between"
                    bg="rs.white"
                    borderRadius="xl"
                    borderWidth="1"
                    borderColor={
                      selected === index ? "rs.primary_purple" : "rs.white"
                    }
                    alignItems="center"
                  >
                    <Text
                      color={item.isDisabled ? "rs_secondary.grey" : "rs.black"}
                    >
                      {isReturnObj ? item.value : item.label}
                    </Text>
                    {showSelectedIcon && selected === index && (
                      <RoundedBlackCheckIcon />
                    )}
                  </HStack>
                </Pressable>
              );
            })}
          </VStack>
        </Modal.Body>
        <Modal.Footer testID={getSingleSectionModalConfirmButtonTestId(name)}>
          <Button
            flex="1"
            onPress={() => {
              if (options && options.length > 0 && selected !== -1) {
                if (isReturnObj) {
                  onChange(
                    selected != null && selected >= 0 && options[selected]
                  );
                } else {
                  onChange(
                    selected != null && selected >= 0 && options[selected].value
                  );
                  onChangeValue?.(options[selected].value);
                }

                if (onPressItem) {
                  onPressItem(options[selected]);
                }
              } else {
                onChange(null);
              }

              if (!onCloseWithValue) {
                onClose?.();
              } else if (options[selected] && options[selected].value) {
                onCloseWithValue?.(options[selected].value);
              } else {
                onCloseWithValue?.("");
              }
            }}
          >
            {confirmButtonText ?? t("Confirm")}
          </Button>
        </Modal.Footer>
      </Modal.Content>
    </Modal>
  );
}
