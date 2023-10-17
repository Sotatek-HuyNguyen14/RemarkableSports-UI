import { Button, HStack, Modal, Pressable, Text, VStack } from "native-base";
import React, { useState } from "react";
import {
  FieldPath,
  FieldValues,
  useController,
  UseControllerProps,
} from "react-hook-form";
import RoundedBlackCheckIcon from "../Icons/RoundedBlackCheckIcon";

interface MultiSelectModalProps<
  TFieldValues extends FieldValues,
  TName extends FieldPath<TFieldValues>
> {
  title: string;
  options: { label: string; value: string }[];
  controllerProps: UseControllerProps<TFieldValues, TName>;
  isOpen: boolean;
  onClose?: () => void;
}

function handleConfirm(
  selected: {
    isSelected: boolean;
    label: string;
    value: string;
  }[],
  callBack: (res: string[]) => void
) {
  const res = selected
    ? selected?.filter((val) => val.isSelected).map((o) => o.value)
    : null;
  if (res) callBack(res);
  return res;
}

export default function MultiSelectModal<
  TFieldValues extends FieldValues,
  TName extends FieldPath<TFieldValues>
>({
  title,
  options,
  controllerProps,
  isOpen,
  onClose,
}: MultiSelectModalProps<TFieldValues, TName>) {
  const {
    field: { onChange },
  } = useController({ ...controllerProps });
  const [selected, setSelected] = useState(
    options.map((o) => ({ isSelected: false, ...o }))
  );

  return (
    <Modal size="full" isOpen={isOpen} onClose={onClose}>
      <Modal.Content mt="auto">
        <Modal.CloseButton />
        <Modal.Header
          pt="4"
          borderBottomWidth="1"
          _text={{
            fontSize: "lg",
          }}
          justifyContent="flex-end"
          alignItems="flex-start"
        >
          {title}
        </Modal.Header>
        <Modal.Body>
          <VStack flex="1">
            {options.map((item, index) => (
              <Pressable
                key={item.value}
                onPress={() => {
                  setSelected((prev) => {
                    const newArray = prev.slice();
                    newArray[index].isSelected = !prev[index].isSelected;
                    return newArray;
                  });
                }}
              >
                <HStack px="4" py="5" justifyContent="space-between">
                  <Text>{item.label}</Text>
                  {selected[index]?.isSelected && <RoundedBlackCheckIcon />}
                </HStack>
              </Pressable>
            ))}
          </VStack>
        </Modal.Body>
        <Modal.Footer>
          <Button
            flex="1"
            onPress={() => {
              handleConfirm(selected, onChange);
              onClose?.();
            }}
          >
            Confirm
          </Button>
        </Modal.Footer>
      </Modal.Content>
    </Modal>
  );
}
