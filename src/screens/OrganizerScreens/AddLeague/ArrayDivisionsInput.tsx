import { Badge, Box, HStack, Pressable, Text, VStack } from "native-base";
import React, { useEffect, useMemo, useState } from "react";
import { FieldPath, FieldValues, useFieldArray } from "react-hook-form";
import FormInput, {
  FormInputProps,
} from "../../../components/FormInput/FormInput";
import DownArrowIcon from "../../../components/Icons/DownArrowIcon";
import ExclaimationIcon from "../../../components/Icons/ExclaimationIcon";
import OneColumnPickerModal from "../../../components/Modal/OneColumnPickerModal";
import SingleSelectModal from "../../../components/Modal/SingleSelectModal";
import { Tier } from "../../../models/responses/League";
import { getTranslation } from "../../../utils/translation";

export interface ArrayDivisionsInputProps<
  TFieldValues extends FieldValues,
  TName extends FieldPath<TFieldValues>
> extends FormInputProps<TFieldValues, TName> {
  footer: (onPress: () => void) => JSX.Element;
}

const t = getTranslation(["component.ArrayDivisionsInput", "constant.button"]);

export default function ArrayDivisionsInput<
  TFieldValues extends FieldValues,
  TName extends FieldPath<TFieldValues>
>({
  footer,
  ...formInputProps
}: ArrayDivisionsInputProps<TFieldValues, TName>) {
  const { fields, append, remove } = useFieldArray<TFieldValues, TName>(
    formInputProps.controllerProps
  );

  const [isOpen, setIsOpen] = useState({
    method: false,
  });

  useEffect(() => {
    if (fields.length === 0) {
      append({});
    }
  }, [fields, append]);
  const [selectedPaymentType, setSelectedPaymentType] = useState<{}>({});
  const [selectedFieldId, setSelectedFieldId] = useState();
  const [selectedIndex, setSelectedIndex] = useState(0);
  const tierOptions = [
    Tier.DivisionA,
    Tier.DivisionB,
    Tier.DivisionC,
    Tier.DivisionD,
  ].map((tier) => ({
    value: `${t(tier)}`,
    label: `${t(tier)}`,
  }));

  const addNewField = () => append({});

  return (
    <VStack space="4">
      {fields.map((field, index) => {
        const shouldRenderDeleteButton = fields.length > 0 && index !== 0;
        return (
          <VStack space="4" key={`${field.id}_container`}>
            <HStack justifyContent="space-between">
              <Text
                key={`${field.id}_text`}
                fontSize="md"
                fontWeight="bold"
                color="rs.primary_purple"
              >{`${t("Division")} ${index + 1}`}</Text>
              {shouldRenderDeleteButton && (
                <Pressable
                  onPress={() => {
                    remove(index);
                  }}
                >
                  <Text color="rs.primary_purple" fontSize={16}>
                    {t("Delete")}
                  </Text>
                </Pressable>
              )}
            </HStack>
            <FormInput
              label={`${t("Name")} *`}
              {...formInputProps}
              controllerProps={{
                ...formInputProps.controllerProps,
                name: `${formInputProps.controllerProps.name}.${index}.name` as TName,
              }}
              {...formInputProps.controllerProps.control?.register(
                `${formInputProps.controllerProps.name}.${index}.name` as TName
              )}
            />
            <FormInput
              prefix="Tier"
              key={`${field.id}_tier`}
              label={`${t("Tier")} *`}
              inputProps={{
                editable: false,
                InputRightElement: <DownArrowIcon mr="4" />,
              }}
              onPress={() => {
                setSelectedFieldId(field.id);
                setSelectedIndex(index);
                setIsOpen((prev) => ({ ...prev, method: true }));
              }}
              {...formInputProps}
              controllerProps={{
                ...formInputProps.controllerProps,
                name: `${formInputProps.controllerProps.name}.${index}.tier` as TName,
              }}
              {...formInputProps.controllerProps.control?.register(
                `${formInputProps.controllerProps.name}.${index}.tier` as TName
              )}
            />
            {/* <OneColumnPickerModal
              key={`${field.id}_picker`}
              onChangeValue={(value) => {
                const object = selectedPaymentType;
                object[selectedFieldId] = value;
                setSelectedPaymentType((prev) => ({ ...prev, ...object }));
              }}
              isOpen={isOpen.method}
              onClose={() => {
                setIsOpen((prev) => ({ ...prev, method: false }));
              }}
              headerLabel={t("Select tier")}
              options={tierOptions}
              controllerProps={{
                ...formInputProps.controllerProps,
                name: `${formInputProps.controllerProps.name}.${selectedIndex}.tier` as TName,
              }}
            /> */}
            <SingleSelectModal
              defaultIndex={
                tierOptions.findIndex(
                  (tier) => tier.value === fields[selectedIndex].tier
                ) === -1
                  ? 0
                  : tierOptions.findIndex(
                      (tier) => tier.value === fields[selectedIndex].tier
                    )
              }
              confirmButtonText={t("Confirm")}
              key={`${field.id}_picker`}
              onChangeValue={(value) => {
                const object = selectedPaymentType;
                object[selectedFieldId] = value;
                setSelectedPaymentType((prev) => ({ ...prev, ...object }));
              }}
              isOpen={isOpen.method}
              onClose={() => {
                setIsOpen((prev) => ({ ...prev, method: false }));
              }}
              title={t("Select tier")}
              options={tierOptions}
              controllerProps={{
                ...formInputProps.controllerProps,
                name: `${formInputProps.controllerProps.name}.${selectedIndex}.tier` as TName,
                rules: {
                  required: true,
                },
              }}
            />
          </VStack>
        );
      })}
      {fields.length > 0 && (
        <HStack
          space={2}
          alignItems="center"
          bg="orange.100"
          p="4"
          borderRadius="8"
        >
          <ExclaimationIcon />
          <Text fontSize="md" color="rs_secondary.grey">
            {t("New Division can be created afterward")}
          </Text>
        </HStack>
      )}
      {footer(addNewField)}
    </VStack>
  );
}
