/* eslint-disable no-param-reassign */
import {
  Badge,
  Box,
  Divider,
  HStack,
  Heading,
  Pressable,
  Text,
  VStack,
} from "native-base";
import React, { useEffect, useMemo, useState } from "react";
import { FieldPath, FieldValues, useFieldArray } from "react-hook-form";
import { getPeriod } from "../../constants/Time";
import { PaymentType } from "../../models/responses/Event";
import { getTranslation } from "../../utils/translation";
import FormInput, { FormInputProps } from "../FormInput/FormInput";
import DownArrowIcon from "../Icons/DownArrowIcon";
import OneColumnPickerModal from "../Modal/OneColumnPickerModal";
import SingleSelectModal from "../Modal/SingleSelectModal";
import CircleGreenPlusIcon from "../Icons/CircleGreenPlusIcon";
import CircleRedMinusIcon from "../Icons/CircleRedMinusIcon";

export interface ArrayPaymentInputProps<
  TFieldValues extends FieldValues,
  TName extends FieldPath<TFieldValues>
> extends FormInputProps<TFieldValues, TName> {
  setActuallength: (val: number) => void;
}

const t = getTranslation(["component.ArrayPaymentInput", "constant.button"]);

let fieldLength = 0;

export default function ArrayPaymentInput<
  TFieldValues extends FieldValues,
  TName extends FieldPath<TFieldValues>
>({
  setActuallength,
  ...formInputProps
}: ArrayPaymentInputProps<TFieldValues, TName>) {
  const { fields, append, remove, update } = useFieldArray<TFieldValues, TName>(
    formInputProps.controllerProps
  );

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

  const mounted = React.useRef(false);

  useEffect(() => {
    mounted.current = true;

    return () => {
      mounted.current = false;
      fieldLength = 0;
    };
  }, []);

  useEffect(() => {
    if (fields.length - fieldLength >= 1) {
      fields.forEach((field, index) => {
        if (Object.keys(field).length === 2 && field.paymentType) {
          remove(index);
        }
      });
    }
  }, [fields, remove]);
  const [selectedPaymentType, setSelectedPaymentType] = useState<{}>({});
  const [selectedFpsInformation, setSelectedFpsInformation] = useState<{}>({});
  const [selectedFieldId, setSelectedFieldId] = useState();

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
    return (
      <VStack space="4" key={`${field.id}_fps`}>
        <Text color="rs_secondary.grey">
          {t("Please select 1 information to show")}
        </Text>
        <HStack space={2} flexWrap="wrap">
          {["Phone number", "Identifier", "Both of them"].map((val) => {
            const isActive = field.fpsType && field.fpsType === val;
            return (
              <Pressable
                key={val}
                onPress={() => {
                  field.fpsType = val;
                  if (val === "Phone number") {
                    field.identifier = undefined;
                  } else if (val === "Identifier") {
                    field.phoneNumber = undefined;
                  }
                  update(
                    fields.findIndex((f) => f.id === field.id),
                    field
                  );
                }}
              >
                <Box
                  flex="1"
                  bgColor={isActive ? "rs.GPP_lightBlue" : "rs.white"}
                  _text={{ fontWeight: "semibold", textAlign: "center" }}
                  borderRadius="lg"
                  borderWidth="2"
                  borderColor="rs.GPP_lightBlue"
                  mx="auto"
                  p="1"
                  px="1"
                  opacity={isActive ? 1 : 0.3}
                >
                  {t(val)}
                </Box>
              </Pressable>
            );
          })}
        </HStack>
        {field.fpsType &&
          (field.fpsType === "Phone number" ||
            field.fpsType === "Both of them") && (
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
        {field.fpsType &&
          (field.fpsType === "Identifier" ||
            field.fpsType === "Both of them") && (
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
    <VStack space="1">
      {fields.map((field, index) => {
        const shouldRenderDeleteButton = true;
        return (
          <VStack space="4" key={`${field.id}_container`}>
            <HStack justifyContent="space-between" alignItems="center">
              <Text
                key={`${field.id}_text`}
                fontSize="md"
                fontWeight="bold"
                color="rs.black"
              >
                {t("Other Payment Method")}
              </Text>
              {shouldRenderDeleteButton && (
                <Pressable
                  onPress={() => {
                    fieldLength -= 1;
                    setActuallength(fieldLength);
                    remove(index);
                  }}
                >
                  <CircleRedMinusIcon size="2xl" />
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
              (field.paymentType === t(PaymentType.Bank) ||
                field.paymentType === PaymentType.Bank) &&
              bankPaymentType({ index, field })}

            {field.id &&
              field.paymentType === PaymentType.FPS &&
              fpsPaymentType({ index, field })}

            {field.id &&
              (field.paymentType === t(PaymentType.Others) ||
                field.paymentType === PaymentType.Others) &&
              otherPaymentType({ index, field })}
            <Divider mt="3" />
            <SingleSelectModal
              key={`${field.id}_picker`}
              onChangeValue={(value) => {
                const object = selectedPaymentType;
                object[selectedFieldId] = value;
                setSelectedPaymentType((prev) => ({ ...prev, ...object }));
                field.paymentType = value;
                field.accountName = undefined;
                field.bankAccount = undefined;
                field.bankName = undefined;
                field.identifier = undefined;
                field.phoneNumber = undefined;
                field.otherPaymentInfo = undefined;
                update(
                  fields.findIndex((f) => f.id === selectedFieldId),
                  field
                );
              }}
              isOpen={isOpen.method}
              onClose={() => {
                setIsOpen((prev) => ({ ...prev, method: false }));
              }}
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

      <Pressable
        onPress={() => {
          fieldLength += 1;
          setActuallength(fieldLength);
          append({ paymentType: undefined });
        }}
      >
        <HStack alignItems="center" justifyContent="space-between">
          <Heading fontSize="md">{t("New Payment Method")}</Heading>
          <CircleGreenPlusIcon size="2xl" />
        </HStack>
      </Pressable>
    </VStack>
  );
}
