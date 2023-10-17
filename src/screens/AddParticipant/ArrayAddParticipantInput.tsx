import { Button, Pressable, Text, VStack } from "native-base";
import React from "react";
import { FieldPath, FieldValues, useFieldArray } from "react-hook-form";
import { getTranslation } from "../../utils/translation";
import FormInput, {
  FormInputProps,
} from "../../components/FormInput/FormInput";

export interface ArrayAddParticipantInputProps<
  TFieldValues extends FieldValues,
  TName extends FieldPath<TFieldValues>
> extends FormInputProps<TFieldValues, TName> {
  buttonLabel?: string;
  customAddButton?: JSX.Element;
}

const t = getTranslation("screen.AddParticipant");

export default function ArrayAddParticipantInput<
  TFieldValues extends FieldValues,
  TName extends FieldPath<TFieldValues>
>({
  buttonLabel,
  customAddButton,
  ...formInputProps
}: ArrayAddParticipantInputProps<TFieldValues, TName>) {
  const { fields, append } = useFieldArray<TFieldValues, TName>(
    formInputProps.controllerProps
  );
  return (
    <VStack space="4">
      <FormInput
        {...formInputProps}
        label={t("Player %{number} name", { number: 1 })}
        controllerProps={{
          ...formInputProps.controllerProps,
          name: `${formInputProps.controllerProps.name}.0` as TName,
        }}
      />
      {fields.map((field, index) => (
        <FormInput
          key={field.id}
          {...formInputProps}
          label={t("Player %{number} name", { number: index + 2 })}
          controllerProps={{
            ...formInputProps.controllerProps,
            name: `${formInputProps.controllerProps.name}.${
              index + 1
            }` as TName,
          }}
        />
      ))}
      {!customAddButton && (
        <Button
          borderColor="rs.primary_purple"
          variant="outline"
          _text={{ fontSize: "lg", fontWeight: "bold" }}
          onPress={() => append([])}
        >
          {buttonLabel}
        </Button>
      )}
      <Pressable onPress={() => append([])}>{customAddButton}</Pressable>
    </VStack>
  );
}
