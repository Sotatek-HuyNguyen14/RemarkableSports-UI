/* eslint-disable no-param-reassign */
import React, { useCallback, useEffect, useMemo, useState } from "react";
import { Alert, Pressable } from "react-native";
import {
  Button,
  Heading,
  useTheme,
  VStack,
  Text,
  HStack,
  Box,
} from "native-base";
import { useForm } from "react-hook-form";
import useSWR from "swr";
import { RouteProp } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { MainStackNavigatorParamList } from "../../../routers/Types";
import { getTranslation } from "../../../utils/translation";
import { useAuth } from "../../../hooks/UseAuth";
import HeaderLayout from "../../../components/Layout/HeaderLayout";
import FormInput from "../../../components/FormInput/FormInput";
import DownArrowIcon from "../../../components/Icons/DownArrowIcon";
import { PaymentType } from "../../../models/responses/Event";
import SingleSelectModal from "../../../components/Modal/SingleSelectModal";
import ArrayPaymentInput from "../../../components/ArrayPaymentInput";
import {
  addClubPaymentMethod,
  editClubPaymentMethod,
} from "../../../services/ClubServices";
import { ClubPaymentMethodRequest } from "../../../models/requests/Club";
import { showApiToastError } from "../../../components/ApiToastError";
import { showApiToastSuccess } from "../../../components/ApiToastSuccess";
import { getPaymentMethodDescription } from "../ClubProcess";

export type AddPaymentMethodPropsNavigationProp = NativeStackNavigationProp<
  MainStackNavigatorParamList,
  "ClubAddPaymentMethod"
>;

type AddPaymentMethodPropsBaseProps = RouteProp<
  MainStackNavigatorParamList,
  "ClubAddPaymentMethod"
>;

export interface AddPaymentMethodProps extends AddPaymentMethodPropsBaseProps {
  route: AddPaymentMethodPropsBaseProps;
  navigation: AddPaymentMethodPropsNavigationProp;
}

export interface FormValue {
  paymentType: PaymentType;
  bankAccount?: string;
  identifier?: string;
  phoneNumber?: string;
  otherPaymentInfo?: string;
  accountName?: string;
  bankName?: string;
  paymentTypeText?: string;
}

const t = getTranslation([
  "constant.district",
  "screen.ClubScreens.ClubAddPaymentMethod",
  "constant.profile",
  "constant.button",
  "validation",
]);

export default function ClubAddPaymentMethod({
  navigation,
  route,
}: AddPaymentMethodProps) {
  const theme = useTheme();
  const { user } = useAuth();
  const { clubId, editPayMethod } = route.params;
  const paymentOptions = [
    PaymentType.FPS,
    PaymentType.Bank,
    PaymentType.Payme,
    PaymentType.Others,
  ].map((option) => {
    return {
      label: t(option),
      value: option,
    };
  });

  const {
    control,
    handleSubmit,
    formState: { isValid, isSubmitting, isDirty },
    watch,
    setValue,
    resetField,
    trigger,
    register,
  } = useForm<FormValue>({
    mode: "onChange",
    defaultValues: editPayMethod
      ? {
          paymentType: editPayMethod.paymentType,
          phoneNumber: editPayMethod.phoneNumber,
          bankAccount: editPayMethod.bankAccount,
          identifier: editPayMethod.identifier,
          accountName: editPayMethod.accountName,
          bankName: editPayMethod.bankName,
          otherPaymentInfo: editPayMethod.otherPaymentInfo,
        }
      : undefined,
  });

  const [selectedFpsInformation, setSelectedFpsInformation] = useState<string>(
    editPayMethod?.identifier && editPayMethod?.phoneNumber
      ? "Both of them"
      : editPayMethod?.identifier
      ? "Identifier"
      : "Phone number"
  );

  const [isOpen, setIsOpen] = useState({
    addContent: false,
  });

  const paymentType = watch("paymentType");
  const phoneNumber = watch("phoneNumber");
  const bankAccount = watch("bankAccount");
  const identifier = watch("identifier");
  const accountName = watch("accountName");
  const bankName = watch("bankName");
  const otherPaymentInfo = watch("otherPaymentInfo");

  useEffect(() => {
    if (paymentType) {
      setValue("paymentTypeText", t(paymentType));
    }
  }, [paymentType, setValue]);

  useEffect(() => {
    if (paymentType === PaymentType.FPS) {
      setValue("bankAccount", "");
      setValue("bankName", "");
      setValue("otherPaymentInfo", "");
    }
    if (paymentType === PaymentType.Bank) {
      setValue("phoneNumber", "");
      setValue("identifier", "");
      setValue("otherPaymentInfo", "");
    }

    if (paymentType === PaymentType.Payme) {
      setValue("bankAccount", "");
      setValue("bankName", "");
      setValue("otherPaymentInfo", "");
      setValue("identifier", "");
    }
    if (paymentType === PaymentType.Others) {
      setValue("bankAccount", "");
      setValue("bankName", "");
      setValue("identifier", "");
      setValue("accountName", "");
    }
  }, [paymentType, setValue]);

  const onSubmit = async (formValue: FormValue) => {
    const payload: ClubPaymentMethodRequest = { ...formValue, clubId };

    if (editPayMethod) {
      try {
        await editClubPaymentMethod({
          ...payload,
          id: editPayMethod.id,
        });
        showApiToastSuccess({
          title: t("Saved successfully"),
        });
        navigation.goBack();
      } catch (error) {
        showApiToastError(error);
      }
    } else {
      try {
        await addClubPaymentMethod(payload);
        showApiToastSuccess({
          title: t("Added New Payment Method\n%{paymentType}", {
            paymentType: t(paymentType),
          }),
          body: getPaymentMethodDescription(payload),
        });
        navigation.goBack();
      } catch (error) {
        showApiToastError(error);
      }
    }
  };

  const fpsPaymentType = () => {
    return (
      <VStack>
        <VStack space="4">
          <Text color="rs_secondary.grey">
            {t("Please select 1 information to show")}
          </Text>
          <HStack space={2} flexWrap="wrap">
            {["Phone number", "Identifier", "Both of them"].map((val) => {
              const isActive =
                paymentType === PaymentType.FPS &&
                selectedFpsInformation === val;
              return (
                <Pressable
                  key={val}
                  onPress={() => {
                    if (paymentType === PaymentType.FPS) {
                      setSelectedFpsInformation(val);
                    }
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
          {paymentType &&
            (selectedFpsInformation === "Phone number" ||
              selectedFpsInformation === "Both of them") && (
              <FormInput
                label={t("Phone number")}
                inputProps={{ keyboardType: "numeric" }}
                controllerProps={{
                  control,
                  rules: { required: t("is required") },
                  name: "phoneNumber",
                }}
              />
            )}
          {paymentType &&
            (selectedFpsInformation === "Identifier" ||
              selectedFpsInformation === "Both of them") && (
              <FormInput
                label={t("Identifier")}
                controllerProps={{
                  control,
                  rules: { required: t("is required") },
                  name: "identifier",
                }}
              />
            )}
          <FormInput
            label={t("Account name")}
            controllerProps={{
              control,
              rules: { required: t("is required") },
              name: "accountName",
            }}
          />
        </VStack>
      </VStack>
    );
  };

  const otherPaymentType = () => {
    return (
      <VStack space="4">
        <FormInput
          label={t("Free text")}
          inputProps={{ multiline: true }}
          controllerProps={{
            control,
            rules: { required: t("is required") },
            name: "otherPaymentInfo",
          }}
        />
      </VStack>
    );
  };

  const paymePaymentType = () => {
    return (
      <VStack space="4">
        <FormInput
          label={t("Phone number")}
          inputProps={{ keyboardType: "numeric" }}
          controllerProps={{
            control,
            rules: { required: t("is required") },
            name: "phoneNumber",
          }}
        />
        <FormInput
          label={t("Account name")}
          controllerProps={{
            control,
            rules: { required: t("is required") },
            name: "accountName",
          }}
        />
      </VStack>
    );
  };

  const bankPaymentType = () => {
    return (
      <VStack space="4">
        <FormInput
          label={t("Bank")}
          controllerProps={{
            control,
            rules: { required: t("is required") },
            name: "bankName",
          }}
        />
        <FormInput
          label={t("Bank account")}
          controllerProps={{
            control,
            rules: { required: t("is required") },
            name: "bankAccount",
          }}
        />
        <FormInput
          label={t("Name")}
          controllerProps={{
            control,
            rules: { required: t("is required") },
            name: "accountName",
          }}
        />
      </VStack>
    );
  };

  return (
    <HeaderLayout
      containerProps={{ padding: theme.space.defaultLayoutSpacing }}
      KeyboardAwareScrollViewProps={{
        bounces: false,
      }}
      headerProps={{
        title: editPayMethod
          ? t("Edit Payment Method")
          : t("Add Payment Method"),
        containerStyle: {
          marginHorizontal: 0,
        },
      }}
      isSticky
    >
      <VStack space="4" flex="1">
        <Heading fontSize={16}>{t("Method Type")}</Heading>
        <FormInput
          label={t("Method Type")}
          inputProps={{
            editable: false,
            InputRightElement: <DownArrowIcon mr="4" />,
          }}
          onPress={() => {
            setIsOpen((prev) => ({ ...prev, addContent: true }));
          }}
          controllerProps={{
            control,
            rules: { required: t("is required") },
            name: "paymentTypeText",
          }}
        />
        {paymentType === PaymentType.FPS && fpsPaymentType()}
        {paymentType === PaymentType.Payme && paymePaymentType()}
        {paymentType === PaymentType.Bank && bankPaymentType()}
        {paymentType === PaymentType.Others && otherPaymentType()}

        <Button
          isDisabled={!isValid || !isDirty}
          isLoadingText={t("Loading")}
          style={{ marginTop: "auto" }}
          isLoading={isSubmitting}
          onPress={handleSubmit(onSubmit)}
        >
          {editPayMethod ? t("Save") : t("Add")}
        </Button>
      </VStack>
      <SingleSelectModal
        onChangeValue={(value) => {}}
        isOpen={isOpen.addContent}
        onClose={() => {
          setIsOpen((prev) => ({ ...prev, addContent: false }));
        }}
        title={t("Select payment type")}
        options={paymentOptions}
        controllerProps={{
          control,
          rules: { required: t("is required") },
          name: "paymentType",
        }}
      />
    </HeaderLayout>
  );
}
