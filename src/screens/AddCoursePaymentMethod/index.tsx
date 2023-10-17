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
  Toast,
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
import {
  addCourseCreating,
  createCourseV2,
} from "../../services/CourseServices";
import { CreateCourseRequest } from "../../models/requests/Course";
import { isBlank } from "../../utils/strings";
import { ClubStaff, UserType } from "../../models/User";
import { getClubPaymentMethods } from "../../services/ClubServices";
import Loading from "../../components/Loading";
import PrefillPaymentMethodInput, {
  PrefillPaymentMethodModelItem,
} from "../../components/PrefillPaymentMethodInput";

function revisedRandId() {
  return Math.random()
    .toString(36)
    .replace(/[^a-z]+/g, "")
    .substr(2, 10);
}

async function processSubmit(formValue: FormValue) {}

export type AddCoursePaymentMethodPropsNavigationProp =
  NativeStackNavigationProp<
    MainStackNavigatorParamList,
    "AddCoursePaymentMethod"
  >;

type AddCoursePaymentMethodPropsBaseProps = RouteProp<
  MainStackNavigatorParamList,
  "AddCoursePaymentMethod"
>;

export interface AddCoursePaymentMethodProps
  extends AddCoursePaymentMethodPropsBaseProps {
  store: Store;
  route: AddCoursePaymentMethodPropsBaseProps;
  navigation: AddCoursePaymentMethodPropsNavigationProp;
}

export interface FormValue extends CreateCourseRequest {
  districtText: string;
  typeText: string;
  fromDate: string;
  startTime: string;
  endTime: string;
  daysOfWeek: string[];
}

const t = getTranslation([
  "constant.district",
  "constant.courseType",
  "screen.AddPaymentMethod",
  "constant.profile",
  "constant.button",
]);

function isEmpty(str: string) {
  return !str || str.length === 0;
}

export default function AddCoursePaymentMethod({
  navigation,
  route,
}: AddCoursePaymentMethodProps) {
  const theme = useTheme();
  const { user } = useAuth();
  const { course, isUpdating } = route.params;
  const [isProcessing, setIsProcessing] = useState(false);
  // Mock data
  // const isUpdating = false;
  // const course = {
  //   typeText: "Public",
  //   districtText: "Kowloon City",
  //   levelText: "",
  //   name: "123",
  //   fee: "123",
  //   description: "123",
  //   address: "123",
  //   enquiryPhoneNumber: "12345678",
  //   courseType: "Public",
  //   capacity: "1",
  //   minimumRequiredConsecutiveSession: "1",
  //   district: "HK.KC",
  //   listAssignedPlayerId: [],
  //   courseSessionGroups: [
  //     {
  //       isRecursive: false,
  //       startDate: null,
  //       endDate: null,
  //       daysOfWeek: null,
  //       startTime: null,
  //       endTime: null,
  //       groupId: null,
  //       courseSessions: [
  //         {
  //           startDate: "2023-06-14",
  //           endDate: "2023-06-14",
  //           daysOfWeek: null,
  //           startTime: "01:00",
  //           endTime: "14:45",
  //           coaches: [
  //             {
  //               coachId: "6066e4c0-d16d-41a5-91a6-5a923acbae88",
  //               coachType: "Head",
  //               customizedPrice: null,
  //             },
  //           ],
  //         },
  //       ],
  //     },
  //   ],
  // };
  // {"name":"Henry coach","fee":"123","description":"11","levelText":"","districtText":"Sham Shui Po","address":"11","enquiryPhoneNumber":"12345678","typeText":"","district":"HK.SS","listAssignedPlayerId":[],"courseType":"Public","courseSessionGroups":[{"isRecursive":false,"startDate":null,"endDate":null,"daysOfWeek":null,"startTime":null,"endTime":null,"groupId":null,"courseSessions":[{"startDate":"2028-06-15","endDate":"2028-06-15","daysOfWeek":null,"startTime":"01:00","endTime":"13:15","coaches":[{"coachId":"3378526e-a3a7-4f78-a783-080adea73d82","coachType":"Head","customizedPrice":null}]}]}]}
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
          fee: course.fee && course.fee.toString(),
          paymentInfo: course.paymentInfo
            ?.filter((payment) => {
              // Filter out the prefilled ones
              return !payment.clubPaymentInfoId;
            })
            .map((payment) => {
              const fpsType =
                payment.paymentType === PaymentType.FPS
                  ? !isBlank(payment.identifier) &&
                    !isBlank(payment.phoneNumber)
                    ? EventFpsType.Both
                    : !isBlank(payment.identifier)
                    ? EventFpsType.Identifier
                    : EventFpsType.PhoneNumber
                  : undefined;
              return {
                ...payment,
                personalId: revisedRandId(),
                fpsType,
              };
            }),
        }
      : {},
  });

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
            course.paymentInfo?.filter((payment) => {
              return (
                payment.clubPaymentInfoId &&
                payment.clubPaymentInfoId === method.id
              );
            })[0] !== undefined;

          return {
            ...method,
            isSelected,
            personalId: revisedRandId(),
          };
        })
      );
    }
  }, [unwrappedPaymentMethods, setPrefilledPaymentMethods, course]);

  const countValidField = () => {
    let count = 0;
    methods
      ?.filter((payment) => {
        // Filter out the prefilled ones
        return !payment.clubPaymentInfoId;
      })
      .forEach((method) => {
        if (
          method.paymentType === t(PaymentType.Bank) ||
          method.paymentType === PaymentType.Bank
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
          // Adding another property clubPaymentInfoId to map into CoursePaymentMethod mode
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
        value = addPrefilledPaymentMethodInfo(value);
        await onCreateCourse(value);
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
      navigation.navigate("UpdateCourse", {
        course: {
          ...course,
          paymentInfo: formatValue.paymentInfo,
          id: course.id,
        },
        paymentMethodUpdated: true,
      });
    }
  };

  const onCreateCourse = async (val: FormValue) => {
    // Create
    try {
      const id = await createCourseV2({
        ...course,
        ...val,
      });
      navigation.navigate("AddCourseSuccessful", { courseId: id.data });
      setIsProcessing(false);
    } catch (error: any) {
      console.log("onCreateCourse_error:>>", error);
      showApiToastError(error);
      setIsProcessing(false);
    }
  };

  const onCreateCourseWithoutPaymentMethod = async () => {
    // Create
    try {
      const id = await createCourseV2({
        ...course,
      });
      setIsProcessing(false);
      navigation.navigate("AddCourseSuccessful", { courseId: id.data });
    } catch (error: any) {
      setIsProcessing(false);
      console.log("onCreateCourse_error:>>", error);
      showApiToastError(error);
    }
  };

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
    ? isSubmitting || !atLeastOnePaymentSelected
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
              await onCreateCourseWithoutPaymentMethod();
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
        confirmText={t("Confirm")}
        cancelText={t("Cancel")}
        isOpen={leaveWithoutSave}
        onCancel={() => {
          setLeaveWithoutSave(false);
        }}
        description={t("Changes you made may not be saved")}
        title={t("Leave page")}
        onConfirm={() => {
          setLeaveWithoutSave(false);
          navigation.goBack();
        }}
      />
    </HeaderLayout>
  );
}
