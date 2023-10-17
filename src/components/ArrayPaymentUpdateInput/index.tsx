/* eslint-disable dot-notation */
/* eslint-disable eqeqeq */
import { Badge, Box, HStack, Pressable, Text, VStack } from "native-base";
import React, { useCallback, useEffect, useMemo, useState } from "react";
import { FieldPath, FieldValues, useFieldArray } from "react-hook-form";
import { getPeriod } from "../../constants/Time";
import { PaymentType } from "../../models/responses/Event";
import { getTranslation } from "../../utils/translation";
import FormInput, { FormInputProps } from "../FormInput/FormInput";
import DownArrowIcon from "../Icons/DownArrowIcon";
import OneColumnPickerModal from "../Modal/OneColumnPickerModal";
import SingleSelectModal from "../Modal/SingleSelectModal";

export type ArrayPaymentInputProps<
  TFieldValues extends FieldValues,
  TName extends FieldPath<TFieldValues>
> = FormInputProps<TFieldValues, TName>;

const t = getTranslation(["component.ArrayPaymentInput", "constant.button"]);

let didUpdate = false;

export default function ArrayPaymentUpdateInput<
  TFieldValues extends FieldValues,
  TName extends FieldPath<TFieldValues>
>({
  formInputProps,
}: {
  formInputProps: ArrayPaymentInputProps<TFieldValues, TName>;
}) {
  const { fields, append, remove, insert, update } = useFieldArray<
    TFieldValues,
    TName
  >(formInputProps.controllerProps);

  const [isOpen, setIsOpen] = useState({
    method: false,
  });

  const paymentOptions = [
    PaymentType.FPS,
    t(PaymentType.Bank),
    PaymentType.Payme,
    t(PaymentType.Others),
  ].map((option) => {
    return {
      label: option,
      value: option,
    };
  });
  const [selectedIndex, setSelectedIndex] = useState(0);
  const today = new Date();
  const period = useMemo(() => {
    return getPeriod();
  }, []);

  const [selectedPaymentType, setSelectedPaymentType] = useState<{}>({});
  const [selectedFpsInformation, setSelectedFpsInformation] = useState<{}>({});
  const [selectedFieldId, setSelectedFieldId] = useState();

  const setValue = useCallback(
    (newVal: any) => {
      setSelectedFpsInformation(newVal);
    },
    [setSelectedFpsInformation]
  );
  useEffect(() => {
    if (fields.length === 0) {
      append({});
    }

    if (
      Object.keys(selectedFpsInformation).length === 0 &&
      fields.length > 0 &&
      !didUpdate
    ) {
      didUpdate = true;
      const prev = selectedFpsInformation;

      fields.forEach((field, index) => {
        if (field.paymentType === PaymentType.FPS) {
          const isBothActive = field["phoneNumber"] && field["identifier"];
          const isPhoneNumberActiveOnly = field["phoneNumber"] && !isBothActive;
          const isIdentifierActiveOnly = field["identifier"] && !isBothActive;
          prev[field.id] = isBothActive
            ? "Both of them"
            : isPhoneNumberActiveOnly
            ? "Phone number"
            : "Identifier";
        }
      });
      setSelectedFpsInformation({ ...selectedFpsInformation, ...prev });
    }
  }, [fields, append, selectedFpsInformation, setValue, update]);

  const paymePaymentType = ({
    index,
    field,
  }: {
    index: number;
    field: any;
  }) => {
    return (
      <VStack space="4" key={`${field.id}_payme`}>
        <FormInput
          key={`${field.id}_phoneNumber`}
          {...formInputProps}
          label={t("Phone number")}
          controllerProps={{
            ...formInputProps.controllerProps,
            name: `${formInputProps.controllerProps.name}.${index}.phoneNumber` as TName,
          }}
        />
        <FormInput
          key={`${field.id}_accountName`}
          {...formInputProps}
          label={t("Account name")}
          controllerProps={{
            ...formInputProps.controllerProps,
            name: `${formInputProps.controllerProps.name}.${index}.accountName` as TName,
          }}
        />
      </VStack>
    );
  };
  const fpsPaymentType = ({ index, field }: { index: number; field: any }) => {
    const isBothActive = field["phoneNumber"] && field["identifier"];
    const isPhoneNumberActiveOnly = field["phoneNumber"] && !isBothActive;
    const isIdentifierActiveOnly = field["identifier"] && !isBothActive;
    return (
      <VStack space="4" key={`${field.id}_fps`}>
        <Text color="rs_secondary.grey">
          {t("Please select 1 information to show")}
        </Text>
        <HStack space={2} flexWrap="wrap">
          {["Phone number", "Identifier", "Both of them"].map((val) => {
            const isActive =
              selectedFpsInformation[field.id] &&
              selectedFpsInformation[field.id] === val;

            const resultActive = isActive;
            return (
              <Pressable
                key={val}
                onPress={() => {
                  const object = selectedFpsInformation;
                  object[field.id] = val;
                  setSelectedFpsInformation((prev) => ({ ...prev, ...object }));
                }}
              >
                <Box
                  flex="1"
                  bgColor={resultActive ? "rs.GPP_lightBlue" : "rs.white"}
                  _text={{
                    fontWeight: "semibold",
                    textAlign: "center",
                  }}
                  borderRadius="lg"
                  borderWidth="2"
                  borderColor="rs.GPP_lightBlue"
                  mx="auto"
                  p="1"
                  px="1"
                  opacity={resultActive ? 1 : 0.3}
                >
                  {t(val)}
                </Box>
              </Pressable>
            );
          })}
        </HStack>
        {selectedFpsInformation[field.id] &&
          (selectedFpsInformation[field.id] === "Phone number" ||
            selectedFpsInformation[field.id] === "Both of them") && (
            <FormInput
              key={`${field.id}_phoneNumber`}
              {...formInputProps}
              label={t("Phone number")}
              controllerProps={{
                ...formInputProps.controllerProps,
                name: `${formInputProps.controllerProps.name}.${index}.phoneNumber` as TName,
              }}
            />
          )}
        {selectedFpsInformation[field.id] &&
          (selectedFpsInformation[field.id] === "Identifier" ||
            selectedFpsInformation[field.id] === "Both of them") && (
            <FormInput
              key={`${field.id}_identifier`}
              {...formInputProps}
              label={t("Identifier")}
              controllerProps={{
                ...formInputProps.controllerProps,
                name: `${formInputProps.controllerProps.name}.${index}.identifier` as TName,
              }}
            />
          )}
        <FormInput
          key={`${field.id}_accountName`}
          {...formInputProps}
          label={t("Account name")}
          controllerProps={{
            ...formInputProps.controllerProps,
            name: `${formInputProps.controllerProps.name}.${index}.accountName` as TName,
          }}
        />
      </VStack>
    );
  };

  const bankPaymentType = ({ index, field }: { index: number; field: any }) => {
    return (
      <VStack space="4" key={`${field.id}_bank`}>
        <FormInput
          key={`${field.id}_bankName`}
          {...formInputProps}
          label={t("Bank")}
          controllerProps={{
            ...formInputProps.controllerProps,
            name: `${formInputProps.controllerProps.name}.${index}.bankName` as TName,
          }}
        />
        <FormInput
          key={`${field.id}_bankAccount`}
          {...formInputProps}
          label={t("Bank account")}
          controllerProps={{
            ...formInputProps.controllerProps,
            name: `${formInputProps.controllerProps.name}.${index}.bankAccount` as TName,
          }}
        />
        <FormInput
          key={`${field.id}_accountName`}
          {...formInputProps}
          label={t("Account name")}
          controllerProps={{
            ...formInputProps.controllerProps,
            name: `${formInputProps.controllerProps.name}.${index}.accountName` as TName,
          }}
        />
      </VStack>
    );
  };

  const otherPaymentType = ({
    index,
    field,
  }: {
    index: number;
    field: any;
  }) => {
    return (
      <VStack space="4" key={`${field.id}_bank`}>
        <FormInput
          key={`${field.id}_otherPaymentInfo`}
          label={t("Free text")}
          inputProps={{ multiline: true }}
          controllerProps={{
            ...formInputProps.controllerProps,
            name: `${formInputProps.controllerProps.name}.${index}.otherPaymentInfo` as TName,
          }}
        />
      </VStack>
    );
  };
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
              >{`${t("Payment method")} ${index + 1}`}</Text>
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
              key={`${field.id}_paymentType`}
              label={t("Method")}
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
                name: `${formInputProps.controllerProps.name}.${index}.paymentType` as TName,
              }}
              {...formInputProps.controllerProps.control?.register(
                `${formInputProps.controllerProps.name}.${index}.paymentType` as TName
              )}
            />
            {field.id &&
              field.paymentType === PaymentType.Payme &&
              paymePaymentType({ index, field })}

            {field.id &&
              field.paymentType === t(PaymentType.Bank) &&
              bankPaymentType({ index, field })}

            {field.id &&
              field.paymentType === PaymentType.FPS &&
              fpsPaymentType({ index, field })}

            {field.id &&
              field.paymentType === t(PaymentType.Others) &&
              otherPaymentType({ index, field })}
            <SingleSelectModal
              key={`${field.id}_picker`}
              onChangeValue={(value) => {
                const findIndex = fields
                  .map((e) => e.id)
                  .indexOf(selectedFieldId);
                if (findIndex !== -1) {
                  const savedValue = fields[findIndex];
                  remove(findIndex);
                  savedValue["paymentType"] = value;
                  insert(findIndex, savedValue);
                }
              }}
              isOpen={isOpen.method}
              onClose={() => {
                setIsOpen((prev) => ({ ...prev, method: false }));
              }}
              confirmButtonText={t("Save")}
              title={t("Select payment type")}
              options={paymentOptions}
              controllerProps={{
                ...formInputProps.controllerProps,
                name: `${formInputProps.controllerProps.name}.${selectedIndex}.paymentType` as TName,
              }}
            />
          </VStack>
        );
      })}

      <Pressable onPress={() => append({ paymentType: undefined })}>
        <Badge
          borderColor="rs.primary_purple"
          variant="outline"
          bg="rs.primary_purple"
          _text={{ color: "rs.white", fontSize: 14 }}
          mr={3}
          w="40"
          p="1"
          borderRadius="full"
        >
          {`+ ${t("Payment method")}`}
        </Badge>
      </Pressable>
    </VStack>
  );
}
