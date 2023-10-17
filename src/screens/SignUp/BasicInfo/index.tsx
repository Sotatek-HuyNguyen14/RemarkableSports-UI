import React from "react";
import { NativeStackScreenProps } from "@react-navigation/native-stack";
import { Button, HStack, Pressable, Text, useTheme, VStack } from "native-base";
import { Keyboard, TouchableWithoutFeedback } from "react-native";
import { useForm } from "react-hook-form";
import useSWR from "swr";

import { useFocusEffect } from "@react-navigation/native";
import { isMatch, parse } from "date-fns";
import { MainStackNavigatorParamList } from "../../../routers/Types";
import { getTranslation } from "../../../utils/translation";
import FormInput from "../../../components/FormInput/FormInput";
import OneColumnPickerModal from "../../../components/Modal/OneColumnPickerModal";
import DownArrowIcon from "../../../components/Icons/DownArrowIcon";
import {
  dateList,
  generateYearOptions,
  monthList,
} from "../../../constants/Time";
import ThreeColumnPickerModal from "../../../components/Modal/ThreeColumnPickerModal";
import HeaderLayout from "../../../components/Layout/HeaderLayout";
import { formatWorkflowUrl } from "../../../services/ServiceUtil";
import {
  getWorkflowDefinition,
  processWorkflowStep,
} from "../../../services/WorkflowService";
import {
  getInputIsRequired,
  getInputOptions,
} from "../../../services/Workflow";
import Loading from "../../../components/Loading";
import ErrorMessage from "../../../components/ErrorMessage";
import { OnboardingStepId } from "../../../models/responses/Onboarding";
import { FORMAT_DATE_UI } from "../../../utils/date";
import DateTimePicker from "../../../components/v2/DateTimePicker";

export type BasicInfoScreenProps = NativeStackScreenProps<
  MainStackNavigatorParamList,
  "OnboardingBasicInfo"
>;

const t = getTranslation([
  "screen.SignUp.BasicInfo",
  "constant.profile",
  "constant.button",
  "validation",
  "formInput",
]);

const yearOptions = generateYearOptions(100, 1);

export interface BasicInfoForm {
  firstName: string;
  lastName: string;
  mobile: number;
  sex: string;
  sexText?: string;
  dateOfBirth: string;
  dateOfBirthText?: string;
  chineseName?: string;
}

export default function BasicInfo({ navigation }: BasicInfoScreenProps) {
  const { space } = useTheme();
  const {
    control,
    handleSubmit,
    watch,
    setValue,
    formState: { isDirty, isValid, isSubmitting },
  } = useForm<BasicInfoForm>({
    mode: "onChange",
    defaultValues: {
      sex: "male",
    },
  });

  // GET request
  const {
    data: def,
    error,
    isValidating,
    mutate,
  } = useSWR(formatWorkflowUrl("/onboarding/definition"), async () =>
    getWorkflowDefinition()
  );

  useFocusEffect(
    React.useCallback(() => {
      mutate();
    }, [mutate])
  );

  const sexOptions = getInputOptions<BasicInfoForm>(
    def,
    "sex",
    OnboardingStepId.BasicInfo
  );

  // update all pickers' input text field value
  React.useEffect(() => {
    const subscription = watch((data, { name }) => {
      if (!name || !(name in data)) {
        return;
      }

      const value = data[name as keyof typeof data];
      if (name === "sex") {
        const opt = sexOptions.find((v) => v.value === value);
        setValue("sexText", opt ? opt.label : undefined, {
          shouldValidate: true,
        });
      }

      if (name === "dateOfBirth") {
        setValue("dateOfBirthText", value as string, { shouldValidate: true });
      }
    });
    return () => subscription.unsubscribe();
  }, [setValue, sexOptions, watch]);

  const [openingPicker, setOpeningPicker] = React.useState<string | null>(null);
  const [defaultDate, setDefaultDate] = React.useState("");

  const onSubmit = async (formValue: object) => {
    try {
      await processWorkflowStep(OnboardingStepId.BasicInfo, formValue);
      navigation.reset({ index: 0, routes: [{ name: "OnboardingUserType" }] });
    } catch (e) {
      alert(e);
    }
  };

  return (
    <HeaderLayout
      headerProps={{
        title: t("Getting Started"),
      }}
      containerProps={{ marginHorizontal: space.defaultLayoutSpacing }}
    >
      {isValidating && <Loading />}

      {!isValidating && error && <ErrorMessage />}

      {!isValidating && def && (
        <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
          <VStack flex="1">
            <VStack space="4">
              <HStack flex="1">
                <FormInput
                  label={t("First name")}
                  controllerProps={{
                    name: "firstName",
                    control,
                    rules: {
                      required:
                        getInputIsRequired<BasicInfoForm>(
                          def,
                          "firstName",
                          OnboardingStepId.BasicInfo
                        ) && `${t("First Name")} ${t("is required")}`,
                    },
                  }}
                />
              </HStack>
              <HStack flex="1">
                <FormInput
                  label={t("Last name")}
                  controllerProps={{
                    name: "lastName",
                    control,
                    rules: {
                      required:
                        getInputIsRequired<BasicInfoForm>(
                          def,
                          "lastName",
                          OnboardingStepId.BasicInfo
                        ) && `${t("Last Name")} ${t("is required")}`,
                    },
                  }}
                />
              </HStack>

              <FormInput
                label={t("Chinese Name")}
                controllerProps={{
                  name: "chineseName",
                  control,
                }}
              />
              <HStack w="100%">
                {sexOptions.reverse().map((option, index) => {
                  const sex = watch("sex");
                  const bg =
                    option.value === sex ? "rs.primary_purple" : "rs.white";
                  const outline =
                    option.value === sex ? "rs.white" : "rs.primary_purple";
                  const topLeftRadius = index === 0 ? "14" : "0";
                  const bottomLeftRadius = index === 0 ? "14" : "0";
                  const topRightRadius = index === 1 ? "14" : "0";
                  const bottomRightRadius = index === 1 ? "14" : "0";
                  return (
                    <Pressable
                      onPress={() => {
                        setValue("sex", option.value);
                      }}
                      flex="1"
                      justifyContent="center"
                      alignItems="center"
                      px="4"
                      py="2"
                      bg={bg}
                      h="16"
                      borderColor="rs.primary_purple"
                      borderWidth="1"
                      borderTopLeftRadius={topLeftRadius}
                      borderBottomLeftRadius={bottomLeftRadius}
                      borderTopRightRadius={topRightRadius}
                      borderBottomRightRadius={bottomRightRadius}
                    >
                      <Text fontWeight="bold" fontSize="md" color={outline}>
                        {option.label}
                      </Text>
                    </Pressable>
                  );
                })}
              </HStack>
              <HStack flex="1">
                <FormInput
                  label={t("Date of Birth")}
                  controllerProps={{
                    name: "dateOfBirthText",
                    control,
                  }}
                  inputProps={{
                    editable: false,
                    InputRightElement: <DownArrowIcon mr="4" />,
                  }}
                  onPress={() => setOpeningPicker("dateOfBirth")}
                />
              </HStack>
              <HStack flex="1">
                <FormInput
                  label={t("Mobile")}
                  controllerProps={{
                    name: "mobile",
                    control,
                    rules: {
                      required:
                        getInputIsRequired<BasicInfoForm>(
                          def,
                          "mobile",
                          OnboardingStepId.BasicInfo
                        ) && `${t("Mobile")} ${t("is required")}`,
                      pattern: {
                        value: /^\d{8}$/,
                        message: t("Phone Number be 8-digit number"),
                      },
                    },
                  }}
                  inputProps={{ keyboardType: "numeric" }}
                />
              </HStack>
            </VStack>
            <OneColumnPickerModal
              isOpen={openingPicker === "sex"}
              onClose={() => setOpeningPicker(null)}
              headerLabel={t("Select Sex")}
              options={sexOptions}
              controllerProps={{
                name: "sex",
                control,
              }}
            />
            {/* <ThreeColumnPickerModal
              isOpen={openingPicker === "dateOfBirth"}
              onClose={() => setOpeningPicker(null)}
              headerLabel={t("Select date of birth")}
              options={[yearOptions, monthList, dateList]}
              concatenator={["-", "-"]}
              controllerProps={{
                name: "dateOfBirth",
                control,
              }}
            /> */}
            <DateTimePicker
              title={`${t("Select")} ${t("Date")}`}
              isShow={openingPicker === "dateOfBirth"}
              mode="date"
              controllerProps={{
                name: "dateOfBirth",
                control,
              }}
              onDefaultDate={(value) => {
                setDefaultDate(value);
              }}
              defaultDate={defaultDate}
              onClose={() => {
                setOpeningPicker(null);
              }}
            />
            <Button
              mt="auto"
              isLoading={isSubmitting}
              isLoadingText={t("Loading")}
              isDisabled={!isDirty || !isValid}
              onPress={handleSubmit(onSubmit)}
            >
              {t("Next")}
            </Button>
          </VStack>
        </TouchableWithoutFeedback>
      )}
    </HeaderLayout>
  );
}
