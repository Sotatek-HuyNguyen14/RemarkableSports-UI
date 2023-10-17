import { VStack, Text, Button } from "native-base";
import { isNumber, values } from "lodash";
import useSWR from "swr";
import { isFuture, isToday, parseISO } from "date-fns";
import React, { useCallback, useEffect, useRef, useState } from "react";
import { NativeStackScreenProps } from "@react-navigation/native-stack";
import { LayoutAnimation } from "react-native";
import { useForm } from "react-hook-form";
import HeaderLayout from "../../components/Layout/HeaderLayout";
import { MainStackNavigatorParamList } from "../../routers/Types";
import { getTranslation } from "../../utils/translation";
import FormInput from "../../components/FormInput/FormInput";
import ConfirmationModal from "../../components/ConfirmationModal/ConfirmationModal";
import DownArrowIcon from "../../components/Icons/DownArrowIcon";
import SingleSelectModal from "../../components/Modal/SingleSelectModal";
import { formatCoreUrl } from "../../services/ServiceUtil";
import {
  getCourseEnrollmentapplication,
  updateCoursePaymentStatusManually,
} from "../../services/CourseServices";
import { useAuth } from "../../hooks/UseAuth";
import { CoursePaymentAction } from "../../models/requests/Course";
import { showApiToastError } from "../../components/ApiToastError";
import { formatUtcToLocalDate } from "../../utils/date";
import Loading from "../../components/Loading";
import ErrorMessage from "../../components/ErrorMessage";

export type DivisionLeaderboardProps = NativeStackScreenProps<
  MainStackNavigatorParamList,
  "CourseRefund"
>;
export interface FormValue {
  numbers: string;
  date: string;
  reason: string;
}

const t = getTranslation([
  "screen.CourseRefund",
  "constant.button",
  "formInput",
  "validation",
]);

export default function CourseRefund({
  navigation,
  route,
}: DivisionLeaderboardProps) {
  const { user } = useAuth();
  const { application } = route.params;

  const {
    data: courseEnrollments,
    error,
    isValidating,
    mutate: courseEnrollmentsMutate,
  } = useSWR(
    application.courseId && application.playerId
      ? formatCoreUrl(
          `/course/${application.courseId}/application/${application.playerId}/enrollment`
        )
      : undefined,
    () =>
      application.courseId && application.playerId
        ? getCourseEnrollmentapplication(
            application.courseId!,
            application.playerId!
          ).then((data) => {
            if (data && data.length > 0) {
              return data.map((val, index) => ({
                ...val,
                isExpand: false,
                personalId: index + 1,
              }));
            }
            return data;
          })
        : undefined
  );

  const {
    control,
    handleSubmit,
    formState: { isValid, isSubmitting },
    watch,
    setValue,
    trigger,
  } = useForm<FormValue>({
    mode: "onChange",
    defaultValues: {
      numbers: courseEnrollments && courseEnrollments?.length > 0 ? "1" : "",
    },
  });
  const [isModalOpen, setModalOpen] = useState({
    numbers: false,
    confirm: false,
    date: false,
  });
  const [defaultDate, setDefaultDate] = useState("");
  const [amount, setAmount] = useState(0);
  const [lengthArray, setLengthArray] = useState<number[]>([]);
  const [selectedDate, setSelectedDate] = useState<string>("");
  const numbers = watch("numbers");
  const date = watch("date");

  const numberOptions =
    courseEnrollments &&
    courseEnrollments?.length &&
    Array.from(Array(courseEnrollments?.length).keys()).map((val, index) => {
      return { label: index + 1, value: (index + 1).toString() };
    });

  const refreshArray = useCallback(
    (newString: string) => {
      if (newString && isNumber(parseInt(newString, 10))) {
        const teamScoreOptions = Array.from(
          Array(parseInt(newString, 10)).keys()
        );
        setLengthArray(teamScoreOptions);
        setAmount(parseInt(newString, 10) * application.course.fee);
      }
    },
    [application.course.fee]
  );

  const refreshDate = useCallback(
    (newString: string, dateString: string) => {
      // if (newString && dateString) {
      setValue(newString, dateString);
      trigger(newString);
      // }
    },
    [setValue, trigger]
  );

  useEffect(() => {
    refreshArray(numbers);
    refreshDate(selectedDate, date);
  }, [date, numbers, refreshArray, refreshDate, selectedDate]);

  const isValidDate = (v: string, label: string) => {
    const dates = lengthArray.map((_val, index) => {
      return {
        session: `session${index + 1}`,
        value: watch(`session${index + 1}`),
      };
    });
    if (dates && dates.length) {
      const result = dates.some((val) => {
        if (label !== val.session && val.value === v) {
          return true;
        }
      });
      return !result;
    }
    return false;
  };

  const onRefund = async (value: FormValue) => {
    setModalOpen((pre) => ({ ...pre, confirm: false }));
    const dates = lengthArray.map((_val, index) => {
      return {
        session: `session${index + 1}`,
        value: watch(`session${index + 1}`),
      };
    });
    const fomatDate = { numbers: value.numbers, dates };

    try {
      await updateCoursePaymentStatusManually({
        applicationId: application.id,
        action: CoursePaymentAction.Refund,
        refundReason: value.reason,
        refundAmout: amount,
        others: { ...fomatDate },
      });
      if (navigation.canGoBack()) navigation.goBack();
    } catch (err: any) {
      console.log("===refund==>>", err);
      showApiToastError(err);
    }
  };

  return (
    <HeaderLayout
      KeyboardAwareScrollViewProps={{
        bounces: false,
      }}
      headerProps={{
        title: t("Refund Summary"),
        containerStyle: { marginHorizontal: 0 },
        hasBackButton: true,
      }}
      isSticky
    >
      {isValidating && <Loading />}
      {!isValidating && error && <ErrorMessage />}
      {!isValidating && !error && (
        <VStack space={4} p="defaultLayoutSpacing" flex={1}>
          <FormInput
            label={t("Number of Sessions")}
            controllerProps={{
              name: "numbers",
              control,
              rules: {
                required: t("is required"),
              },
            }}
            inputProps={{
              editable: false,
              InputRightElement: <DownArrowIcon mr="4" />,
            }}
            onPress={() => {
              setModalOpen((prev) => ({ ...prev, numbers: true }));
            }}
          />
          {lengthArray &&
            lengthArray.length > 0 &&
            lengthArray.map((val, index) => {
              return (
                <FormInput
                  label={`${t("Session")} ${index + 1}`}
                  inputProps={{
                    editable: false,
                    InputRightElement: <DownArrowIcon mr="4" />,
                  }}
                  isShowWords
                  controllerProps={{
                    name: `session${index + 1}`,
                    control,
                    rules: {
                      required: t("is required"),
                      validate: {
                        isValid: (v) => {
                          if (!v || !isValidDate(v, `session${index + 1}`)) {
                            return t("Date repetition");
                          }
                          // if (!isFuture(parseISO(v)) && !isToday(parseISO(v))) {
                          //   return t("Date should be in the future");
                          // }
                        },
                      },
                    },
                  }}
                  onPress={() => {
                    setSelectedDate(`session${index + 1}`);
                    setModalOpen((prev) => ({ ...prev, date: true }));
                  }}
                />
              );
            })}
          <FormInput
            label={t("Refund Reason (Optional)")}
            inputProps={{
              multiline: true,
              maxLength: 50,
            }}
            isShowWords
            controllerProps={{
              name: "reason",
              control,
              // rules: { required: t("is required") },
            }}
          />
          <VStack p="5" bg="rs.grey" borderRadius="2xl">
            <Text fontSize={16}>{t("Refund Amount")}</Text>
            <Text fontSize={20} fontWeight="bold">
              $ {amount}
            </Text>
          </VStack>
          <Button
            isDisabled={!isValid}
            mt="auto"
            onPress={() => {
              setModalOpen((pre) => ({ ...pre, confirm: true }));
            }}
          >
            {t("Refund")}
          </Button>
          <SingleSelectModal
            title={t("Select")}
            options={numberOptions}
            controllerProps={{
              name: "numbers",
              control,
              rules: { required: t("is required") },
            }}
            isOpen={isModalOpen.numbers}
            onClose={() => {
              setModalOpen((pre) => ({ ...pre, numbers: false }));
            }}
          />
          <SingleSelectModal
            title={t("Select")}
            options={
              courseEnrollments?.map((val, index) => ({
                label: formatUtcToLocalDate(val.courseSessionFrom),
                value: formatUtcToLocalDate(val.courseSessionFrom),
              })) || []
            }
            controllerProps={{
              name: "date",
              control,
              // rules: { required: t("is required") },
            }}
            isOpen={isModalOpen.date}
            onClose={() => {
              setModalOpen((pre) => ({ ...pre, date: false }));
            }}
          />
        </VStack>
      )}

      <ConfirmationModal
        alertType="Success"
        confirmText={t("Confirm")}
        cancelText={t("Cancel")}
        isOpen={isModalOpen.confirm}
        onCancel={() => {
          setModalOpen((pre) => ({ ...pre, confirm: false }));
        }}
        title={t("Confirm to refund")}
        onConfirm={handleSubmit(onRefund)}
      />
    </HeaderLayout>
  );
}
