import { Button, HStack, Pressable, Text, VStack } from "native-base";
import React, { useEffect } from "react";
import { FieldPath, FieldValues, useFieldArray } from "react-hook-form";
import FormInput, { FormInputProps } from "../FormInput/FormInput";
import CircleRedMinusIcon from "../Icons/CircleRedMinusIcon";
import CircleGreenPlusIcon from "../Icons/CircleGreenPlusIcon";

export interface ArrayFormInputProps<
  TFieldValues extends FieldValues,
  TName extends FieldPath<TFieldValues>
> extends FormInputProps<TFieldValues, TName> {
  buttonLabel?: string;
  customAddButton?: JSX.Element;
}

export default function ArrayFormInput<
  TFieldValues extends FieldValues,
  TName extends FieldPath<TFieldValues>
>({
  buttonLabel,
  customAddButton,
  ...formInputProps
}: ArrayFormInputProps<TFieldValues, TName>) {
  const { fields, append, remove } = useFieldArray<TFieldValues, TName>(
    formInputProps.controllerProps
  );
  useEffect(() => {
    if (fields.length === 0) {
      append({});
    }
  }, [fields, append]);
  return (
    <VStack space="4">
      {fields.map((field, index) => (
        <FormInput
          key={field.id}
          {...formInputProps}
          label={`${formInputProps.label} ${index + 1}`}
          controllerProps={{
            ...formInputProps.controllerProps,
            name: `${formInputProps.controllerProps.name}.${index}.text` as TName,
          }}
          inputProps={{
            InputLeftElement:
              index !== 0 ? (
                <Pressable
                  onPress={() => {
                    remove(index);
                  }}
                >
                  <CircleRedMinusIcon size="xl" ml="2" />
                </Pressable>
              ) : undefined,
          }}
        />
      ))}
      {!customAddButton && (
        <Pressable
          bg="white"
          _pressed={{ opacity: 0.5 }}
          p="4"
          py="5"
          borderRadius="2xl"
          onPress={() => append({})}
          shadow="9"
          style={{
            shadowOffset: {
              width: 5,
              height: 5,
            },
            shadowOpacity: 0.1,
            elevation: 3,
          }}
        >
          <HStack space="2" alignItems="center">
            <CircleGreenPlusIcon size="xl" />
            <Text fontSize="md" color="#B3B6B8">
              {buttonLabel}
            </Text>
          </HStack>
        </Pressable>
      )}
    </VStack>
  );
}
