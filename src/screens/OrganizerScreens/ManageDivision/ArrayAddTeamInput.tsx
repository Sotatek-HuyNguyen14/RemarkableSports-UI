import { Badge, Button, HStack, Pressable, Text, VStack } from "native-base";
import React, { useEffect } from "react";
import { FieldPath, FieldValues, useFieldArray } from "react-hook-form";
import CustomInput from "../../../components/FormInput/CustomInput";
import FormInput, {
  FormInputProps,
} from "../../../components/FormInput/FormInput";
import { getTranslation } from "../../../utils/translation";

export interface ArrayAddTeamInputProps<
  TFieldValues extends FieldValues,
  TName extends FieldPath<TFieldValues>
> extends FormInputProps<TFieldValues, TName> {
  buttonLabel?: string;
  customAddButton?: JSX.Element;
  onPressAddTeam: () => void;
  shouldShowArrayInput: boolean;
  startIndex?: number;
}
const t = getTranslation("component.ArrayAddTeamInput");

export default function ArrayAddTeamInput<
  TFieldValues extends FieldValues,
  TName extends FieldPath<TFieldValues>
>({
  buttonLabel,
  customAddButton,
  onPressAddTeam,
  shouldShowArrayInput,
  startIndex = 0,
  ...formInputProps
}: ArrayAddTeamInputProps<TFieldValues, TName>) {
  const { fields, append, remove } = useFieldArray<TFieldValues, TName>(
    formInputProps.controllerProps
  );

  return (
    <VStack>
      {shouldShowArrayInput &&
        fields.map((field, index) => {
          return (
            <HStack alignItems="center" bg="gray.100" p="2" px="4">
              <Text fontWeight="bold">{startIndex + index + 1}</Text>
              <CustomInput
                containerProps={{ style: { backgroundColor: "gray.100" } }}
                customPlaceHolder={false}
                key={field.id}
                {...formInputProps}
                label={`${formInputProps.label}`}
                controllerProps={{
                  ...formInputProps.controllerProps,
                  name: `${formInputProps.controllerProps.name}.${index}.team` as TName,
                }}
                inputProps={{
                  bgColor: "gray.100",
                  borderColor: "gray.100",
                  fontWeight: "bold",
                }}
                {...formInputProps.controllerProps.control?.register(
                  `${formInputProps.controllerProps.name}.${index}.team` as TName
                )}
              />
            </HStack>
          );
        })}
      {true && (
        <Pressable
          mt="2"
          onPress={() => {
            append({});
            onPressAddTeam();
          }}
        >
          <Badge
            ml="4"
            borderColor="rs_secondary.green"
            variant="outline"
            bg="rs_secondary.green"
            _text={{ color: "rs.white", fontSize: 14 }}
            mr={3}
            w="40"
            p="2"
            borderRadius="full"
          >
            {`+ ${t("Add team")}`}
          </Badge>
        </Pressable>
      )}
    </VStack>
  );
}
