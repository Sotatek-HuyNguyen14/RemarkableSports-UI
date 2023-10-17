/* eslint-disable no-param-reassign */
import React, { useCallback, useEffect, useMemo, useState } from "react";
import { Alert } from "react-native";
import {
  Button,
  Heading,
  useTheme,
  VStack,
  Text,
  HStack,
  Toast,
  Pressable,
} from "native-base";
import { useForm } from "react-hook-form";
import useSWR from "swr";

import { RouteProp } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { MainStackNavigatorParamList } from "../../routers/Types";
import { Store } from "../../stores";
import HeaderLayout from "../../components/Layout/HeaderLayout";
import FormInput from "../../components/FormInput/FormInput";
import { getTranslation } from "../../utils/translation";
import { CreateEventRequest, EventDay } from "../../models/requests/Event";
import ArrayPaymentInput from "../../components/ArrayPaymentInput";
import { createEvent } from "../../services/EventServices";
import ConfirmationModal from "../../components/ConfirmationModal/ConfirmationModal";
import ArrayPaymentUpdateInput from "../../components/ArrayPaymentUpdateInput";
import { EventFpsType, PaymentType } from "../../models/responses/Event";
import { showApiToastError } from "../../components/ApiToastError";
import { useAuth } from "../../hooks/UseAuth";
import { formatCoreUrl } from "../../services/ServiceUtil";
import { getPostPermissionById } from "../../services/ContentServices";
import { isBlank } from "../../utils/strings";
import { ClubStaff, UserType } from "../../models/User";
import { getClubPaymentMethods } from "../../services/ClubServices";
import PrefillPaymentMethodInput, {
  PrefillPaymentMethodModelItem,
} from "../../components/PrefillPaymentMethodInput";
import Loading from "../../components/Loading";

function revisedRandId() {
  return Math.random()
    .toString(36)
    .replace(/[^a-z]+/g, "")
    .substr(2, 10);
}

async function processSubmit(formValue: FormValue) {}

export type AddPaymentMethodPropsNavigationProp = NativeStackNavigationProp<
  MainStackNavigatorParamList,
  "AddPaymentMethod"
>;

type AddPaymentMethodPropsBaseProps = RouteProp<
  MainStackNavigatorParamList,
  "AddPaymentMethod"
>;

export interface AddPaymentMethodProps extends AddPaymentMethodPropsBaseProps {
  store: Store;
  route: AddPaymentMethodPropsBaseProps;
  navigation: AddPaymentMethodPropsNavigationProp;
}

export interface FormValue extends CreateEventRequest {
  districtText: string;
  typeText: string;
  fromDate: string;
  startTime: string;
  endTime: string;
  daysOfWeek: string[];
}

const t = getTranslation([
  "constant.district",
  "constant.eventType",
  "screen.AddPaymentMethod",
  "constant.profile",
  "constant.button",
]);

function isEmpty(str: string) {
  return !str || str.length === 0;
}

export default function AddPaymentMethod({
  navigation,
  route,
}: AddPaymentMethodProps) {
  const theme = useTheme();
  const { user } = useAuth();
  const { isUpdating, event } = route.params;
  const [isProcessing, setIsProcessing] = useState(false);
  // Mock data
  // const isUpdating = false;
  // const event = {
  //   isApproval: true,
  //   name: "1",
  //   typeText: "Group Ball Game",
  //   description: "1",
  //   districtText: "Wan Chai",
  //   address: "1",
  //   latestCancellationText: "",
  //   capacity: "1",
  //   district: "HK.WC",
  //   type: "GroupBallGame",
  //   eventSessions: [
  //     { date: "2023-06-20", fromTime: "01:00 AM", toTime: "02:15 PM" },
  //   ],
  // };
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
    defaultValues: isUpdating
      ? {
          fee: event.fee && event.fee.toString(),
          paymentInfo: event.paymentInfo
            ?.filter((payment) => {
              // Filter out the prefilled ones
              return !payment.clubPaymentInfoId;
            })
            .map((payment) => {
              if (payment.paymentType === PaymentType.Bank) {
                return {
                  ...payment,
                  personalId: revisedRandId(),
                  paymentType: t(PaymentType.Bank),
                };
              }
              if (payment.paymentType === PaymentType.Others) {
                return {
                  ...payment,
                  personalId: revisedRandId(),
                  paymentType: t(PaymentType.Others),
                };
              }
              const fpsType =
                payment.paymentType === PaymentType.FPS
                  ? !isBlank(payment.identifier) &&
                    !isBlank(payment.phoneNumber)
                    ? EventFpsType.Both
                    : !isBlank(payment.identifier)
                    ? EventFpsType.Identifier
                    : EventFpsType.PhoneNumber
                  : undefined;
              return { ...payment, personalId: revisedRandId(), fpsType };
            }),
        }
      : {},
  });

  const {
    data: contentPermission,
    mutate: contentPermissiontMutate,
    isValidating: contentPermissionValidating,
  } = useSWR(
    user?.sub ? formatCoreUrl(`/post-permission/${user?.sub}`) : null,
    () => (user?.sub ? getPostPermissionById(user?.sub) : null)
  );
  const ableToAddContent = contentPermission?.canPost || false;

  const [updatedPaymentFieldIds, setUpdatePaymentFieldIds] = useState<
    [
      {
        option: string;
        id: string;
      }
    ]
  >([]);

  const methods = watch("paymentInfo");
  const [actualLength, setActualLength] = useState(0);

  const [leaveWithoutSave, setLeaveWithoutSave] = useState(false);
  const [isOpen, setIsOpen] = useState({
    addContent: false,
  });
  const staff = user as ClubStaff;
  const {
    data: paymentMethods,
    error: paymentMethodsError,
    isValidating: paymentMethodsValidating,
    mutate: paymentMethodsMutate,
  } = useSWR(formatCoreUrl(`/club/${staff?.club?.id}/payment-methods`), () => {
    if (staff.club?.id) {
      return getClubPaymentMethods(staff?.club?.id);
    }
  });

  const unwrappedPaymentMethods = React.useMemo(() => {
    return paymentMethods || [];
  }, [paymentMethods]);
  const shouldShowPrefillPaymentMethodsView =
    user?.userType === UserType.ClubStaff && unwrappedPaymentMethods.length > 0;

  const [prefilledPaymentMethods, setPrefilledPaymentMethods] = useState<
    PrefillPaymentMethodModelItem[]
  >([]);

  useEffect(() => {
    if (unwrappedPaymentMethods) {
      setPrefilledPaymentMethods(
        unwrappedPaymentMethods.map((method) => {
          const isSelected =
            event.paymentInfo?.filter(
              (payment) =>
                payment.clubPaymentInfoId &&
                payment.clubPaymentInfoId === method.id
            )[0] !== undefined;
          return {
            ...method,
            isSelected,
            personalId: revisedRandId(),
          };
        })
      );
    }
  }, [unwrappedPaymentMethods, setPrefilledPaymentMethods, event]);

  const countValidField = () => {
    let count = 0;
    methods
      ?.filter((payment) => {
        // Filter out the prefilled ones
        return !payment.clubPaymentInfoId;
      })
      .forEach((method) => {
        if (
          method.paymentType ===
          t(PaymentType.Bank || method.paymentType === PaymentType.Bank)
        ) {
          const isEnabled =
            !isEmpty(method.bankAccount) &&
            !isEmpty(method.bankName) &&
            !isEmpty(method.accountName);
          if (isEnabled) {
            count += 1;
          }
        }
        if (method.paymentType === PaymentType.FPS) {
          const isPhoneValid =
            !isEmpty(method.phoneNumber) &&
            !isEmpty(method.accountName) &&
            isEmpty(method.identifier);
          const isIdentifierValid =
            !isEmpty(method.identifier) &&
            !isEmpty(method.accountName) &&
            isEmpty(method.phoneNumber);
          const isBothValid =
            !isEmpty(method.accountName) &&
            !isEmpty(method.identifier) &&
            !isEmpty(method.phoneNumber);
          const isEnabled = isPhoneValid || isIdentifierValid || isBothValid;
          if (isEnabled) {
            count += 1;
          }
        }
        if (method.paymentType === PaymentType.Payme) {
          const isEnabled =
            !isEmpty(method.phoneNumber) && !isEmpty(method.accountName);
          if (isEnabled) {
            count += 1;
          }
        }
        if (
          method.paymentType === t(PaymentType.Others) ||
          method.paymentType === PaymentType.Others
        ) {
          const isEnabled = !isEmpty(method.otherPaymentInfo);
          if (isEnabled) {
            count += 1;
          }
        }
      });

    return count;
  };

  const addPrefilledPaymentMethodInfo = (value: FormValue) => {
    const { paymentInfo } = value;
    if (paymentInfo) {
      const newPaymentInfo = paymentInfo;
      prefilledPaymentMethods.forEach((method) => {
        if (method.isSelected) {
          // Adding another property clubPaymentInfoId to map into CoursePaymentMethod model
          newPaymentInfo.push({ ...method, clubPaymentInfoId: method.id });
        }
      });
      value.paymentInfo = newPaymentInfo;
    }
    return value;
  };

  const onSubmit = async (value: FormValue) => {
    setIsProcessing(true);
    if (!isUpdating) {
      try {
        await onCreateEvent(value, ableToAddContent);
        setIsProcessing(false);
      } catch (error: any) {
        showApiToastError(error);
        setIsProcessing(false);
      }
    } else {
      // Should fix the FPS payment type to remove redundant fields
      updatedPaymentFieldIds.forEach((updated) => {
        value.paymentInfo?.map((payment) => {
          if (payment.personalId) {
            if (updated.id === payment.personalId) {
              if (updated.option === EventFpsType.Identifier) {
                payment.phoneNumber = null;
              } else if (updated.option === EventFpsType.PhoneNumber) {
                payment.identifier = null;
              }
            }

            return payment;
          }
        });
      });
      value = addPrefilledPaymentMethodInfo(value);
      const lastPayinfo = value?.paymentInfo?.map((info) => {
        if (info.paymentType === t(PaymentType.Bank)) {
          return { ...info, paymentType: PaymentType.Bank };
        }
        if (info.paymentType === t(PaymentType.Others)) {
          return { ...info, paymentType: PaymentType.Others };
        }
        return info;
      });
      const formatValue = { ...value, paymentInfo: lastPayinfo };
      setIsProcessing(false);
      navigation.navigate("UpdateEvent", {
        event: {
          ...event,
          fee: formatValue.fee,
          paymentInfo: formatValue.paymentInfo,
          id: event.eventSessions[0].eventId,
        },
        paymentMethodUpdated: true,
      });
    }
  };

  const onCreateEvent = async (val: FormValue, isAddContent?: boolean) => {
    setIsOpen((prev) => ({ ...prev, addContent: false }));
    val = addPrefilledPaymentMethodInfo(val);

    const lastPayinfo = val?.paymentInfo?.map((info) => {
      if (info.paymentType === t(PaymentType.Bank)) {
        return { ...info, paymentType: PaymentType.Bank };
      }
      if (info.paymentType === t(PaymentType.Others)) {
        return { ...info, paymentType: PaymentType.Others };
      }
      return info;
    });
    const formatValue = { ...val, paymentInfo: lastPayinfo };
    // Create
    try {
      const res = await createEvent({
        ...event,
        ...formatValue,
      });
      setIsProcessing(false);
      if (isAddContent) {
        navigation.navigate("AddContent", { eventId: res.data });
      } else {
        navigation.navigate("AddEventSuccessful", { eventId: res.data });
      }
    } catch (error: any) {
      setIsProcessing(false);
      console.log("onCreateEvent_error:>>", error);
      showApiToastError(error);
    }
  };

  const onCreateEventWithoutPaymentMethod = async (isAddContent: boolean) => {
    // Create
    try {
      const res = await createEvent({
        ...event,
      });
      setIsProcessing(false);
      if (isAddContent) {
        navigation.navigate("AddContent", { eventId: res.data });
      } else {
        navigation.navigate("AddEventSuccessful", { eventId: res.data });
      }
    } catch (error: any) {
      setIsProcessing(false);
      console.log("onCreateEvent_error:>>", error);
      showApiToastError(error);
    }
  };

  const fee = watch("fee");
  const atLeastOneOtherPaymentValid =
    countValidField() === actualLength && isValid && actualLength > 0;
  const atLeastOnePrefillPaymentSelected = shouldShowPrefillPaymentMethodsView
    ? prefilledPaymentMethods.filter((p) => p.isSelected === true).length > 0
    : false;
  const atLeastOnePaymentSelected =
    actualLength > 0
      ? shouldShowPrefillPaymentMethodsView
        ? atLeastOneOtherPaymentValid || atLeastOnePrefillPaymentSelected
        : atLeastOneOtherPaymentValid
      : atLeastOneOtherPaymentValid || atLeastOnePrefillPaymentSelected;

  const isButtonDisabled = !isUpdating
    ? isSubmitting ||
      !atLeastOnePaymentSelected ||
      !fee ||
      (fee && isBlank(fee.toString()))
    : false;

  if (isProcessing) {
    return <Loading />;
  }

  if (paymentMethodsValidating) {
    return <Loading />;
  }

  return (
    <HeaderLayout
      containerProps={{ padding: theme.space.defaultLayoutSpacing }}
      KeyboardAwareScrollViewProps={{
        bounces: false,
      }}
      headerProps={{
        title: t("Payment method"),
        containerStyle: {
          marginHorizontal: 0,
        },
        onBack: () => {
          if (isUpdating) {
            setLeaveWithoutSave(true);
          } else {
            navigation.goBack();
          }
        },
        rightComponent: !isUpdating && (
          <Pressable
            onPress={async () => {
              setIsProcessing(true);
              await onCreateEventWithoutPaymentMethod(ableToAddContent);
              setIsProcessing(false);
            }}
          >
            <Text mr="2" fontSize="md" color="rs.primary_purple">
              {t("Skip")}
            </Text>
          </Pressable>
        ),
      }}
      isSticky
    >
      <VStack space="4" flex="1">
        <Heading>{t("Fee")}</Heading>
        <FormInput
          label={t("Fee (HKD)")}
          controllerProps={{
            name: "fee",
            control,
            rules: { required: true },
          }}
        />
        <Heading>{t("Payment Method(s)")}</Heading>
        {shouldShowPrefillPaymentMethodsView && (
          <PrefillPaymentMethodInput
            paymentMethods={prefilledPaymentMethods}
            onPressMethod={(selectedMethod) => {
              setPrefilledPaymentMethods(
                prefilledPaymentMethods.map((method) => {
                  if (method.personalId === selectedMethod.personalId) {
                    return {
                      ...method,
                      isSelected: !method.isSelected,
                    };
                  }
                  return method;
                })
              );
            }}
          />
        )}
        <ArrayPaymentInput
          setActuallength={(val) => {
            setActualLength(val);
          }}
          controllerProps={{
            name: "paymentInfo",
            control,
          }}
        />
        <Button
          isDisabled={isButtonDisabled}
          isLoadingText={t("Loading")}
          style={{ marginTop: "auto" }}
          isLoading={isSubmitting}
          onPress={handleSubmit(onSubmit)}
        >
          {!isUpdating ? t("Create") : t("Update")}
        </Button>
      </VStack>
      <ConfirmationModal
        verticalButtons
        alertType="Fail"
        shouldRenderIcon={false}
        confirmText={t("Yes")}
        cancelText={t("Cancel")}
        isOpen={leaveWithoutSave}
        onCancel={() => {
          setLeaveWithoutSave(false);
        }}
        description={t("Are you sure to leave this page without saving")}
        title={t("Back to edit event")}
        onConfirm={() => {
          setLeaveWithoutSave(false);
          navigation.goBack();
        }}
      />
    </HeaderLayout>
  );
}
