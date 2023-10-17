/* eslint-disable react/no-array-index-key */
import React, { useState } from "react";
import { NativeStackScreenProps } from "@react-navigation/native-stack";
import useSWR from "swr";
import { useForm } from "react-hook-form";
import { Keyboard } from "react-native";
import {
  Button,
  Toast,
  useTheme,
  VStack,
  Pressable,
  HStack,
  Text,
  FormControl,
} from "native-base";

import { RouteProp, useFocusEffect } from "@react-navigation/native";
import { isMatch } from "lodash";
import { MainStackNavigatorParamList } from "../../../routers/Types";
import HeaderLayout from "../../../components/Layout/HeaderLayout";
import {
  formatFileUrl,
  formatWorkflowUrl,
} from "../../../services/ServiceUtil";
import { getTranslation } from "../../../utils/translation";
import FormInput from "../../../components/FormInput/FormInput";
import {
  createUpdateProfileWorkflow,
  getWorkflowDefinition,
  processWorkflowStep,
} from "../../../services/WorkflowService";
import Loading from "../../../components/Loading";
import ErrorMessage from "../../../components/ErrorMessage";
import {
  getInputIsRequired,
  getInputOptions,
} from "../../../services/Workflow";
import { UpdateProfileStepId } from "../../../models/responses/Updating";
import MessageToast, {
  MesssageToastType,
} from "../../../components/Toast/MessageToast";
import { useAuth } from "../../../hooks/UseAuth";
import { showApiToastError } from "../../../components/ApiToastError";
import DateTimePicker from "../../../components/v2/DateTimePicker";
import OneColumnPickerModal from "../../../components/Modal/OneColumnPickerModal";
import ThreeColumnPickerModal from "../../../components/Modal/ThreeColumnPickerModal";
import { OnboardingStepId } from "../../../models/responses/Onboarding";
import DownArrowIcon from "../../../components/Icons/DownArrowIcon";
import { formatUtcToLocalDate, FORMAT_DATE_UI } from "../../../utils/date";
import {
  dateList,
  generateYearOptions,
  monthList,
} from "../../../constants/Time";
import ImagePicker from "../../../components/ImagePicker";
import formatPhone from "../../../utils/phone";
import CalendarIcon from "../../../components/Icons/CalendarIcon";

export type UpdateProfileScreenProps = NativeStackScreenProps<
  MainStackNavigatorParamList,
  "ClubUpdateProfile"
>;

export type UpdateProfileScreengRouteProp = RouteProp<
  MainStackNavigatorParamList,
  "ClubUpdateProfile"
>;

const t = getTranslation([
  "screen.ClubScreens.ClubUpdateProfile",
  "screen.SignUp.BasicInfo",
  "screen.SignUp.CreateAccount",
  "constant.district",
  "constant.profile",
  "constant.button",
  "validation",
]);

export interface BasicInfoForm {
  firstName: string;
  lastName: string;
  mobile?: number;
  sex?: string;
  sexText?: string;
  dateOfBirth?: string;
  dateOfBirthText?: string;
  profilePicture:
    | {
        fileName: string;
        fileContent: string;
      }
    | string;
  chineseName?: string;
}

const yearOptions = generateYearOptions(100, 1);

export default function UpdateProfile({
  navigation,
  route,
}: UpdateProfileScreenProps) {
  const { space } = useTheme();

  const { user, updateUserInfo } = useAuth();
  const {
    control,
    handleSubmit,
    watch,
    setValue,
    formState: { isDirty, isValid, isSubmitting },
  } = useForm<BasicInfoForm>({
    mode: "onChange",
    defaultValues: {
      sex: user?.sex ? user.sex.toLowerCase() : undefined,
      firstName: user?.firstName,
      lastName: user?.lastName,
      dateOfBirth: user?.dateOfBirth
        ? formatUtcToLocalDate(new Date(user?.dateOfBirth))
        : undefined,
      dateOfBirthText: user?.dateOfBirth
        ? formatUtcToLocalDate(new Date(user?.dateOfBirth))
        : undefined,
      mobile: user?.mobile
        ? formatPhone(user?.mobile).replace(" ", "")
        : undefined,
      chineseName: user?.chineseName,
    },
  });
  const [defaultDate, setDefaultDate] = useState(
    user?.dateOfBirth
      ? formatUtcToLocalDate(new Date(user?.dateOfBirth))
      : undefined
  );
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

  const onUpdateProfile = async (formValue: BasicInfoForm) => {
    try {
      await createUpdateProfileWorkflow();
      await processWorkflowStep(
        UpdateProfileStepId.ClubInfo,
        formValue,
        "update"
      );
      await updateUserInfo();
      Toast.show({
        id: "updateSuccess",
        duration: 2000,
        placement: "top",
        render: () => {
          return (
            <MessageToast
              type={MesssageToastType.Success}
              title={t("Update profile success")}
            />
          );
        },
      });
      navigation.goBack();
    } catch (updateError) {
      console.log("Error", updateError);
      showApiToastError(updateError);
    }
  };

  return (
    <HeaderLayout
      headerProps={{
        title: t("Update Profile"),
      }}
      containerProps={{ marginHorizontal: space.defaultLayoutSpacing }}
    >
      <VStack flex="1">
        <VStack space="4" mb="4">
          <ImagePicker
            defaultImageUrl={
              user?.profilePicture
                ? formatFileUrl(user?.profilePicture)
                : undefined
            }
            controllerProps={{
              control,
              name: "profilePicture",
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
                  key={`UpdateProfile_${option.label}_${index}`}
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
          {/* Email */}
          <VStack
            borderRadius="2xl"
            px="4"
            py="3"
            justifyContent="center"
            bg="#EDEFF0"
          >
            <FormControl.Label
              _text={{
                // color: "rs.inputLabel_grey",
                fontSize: "xs",
                lineHeight: "lg",
              }}
            >
              {`${t("Email")}*`}
            </FormControl.Label>
            <Text color="rs.black" fontSize="md">
              {user?.email}
            </Text>
          </VStack>
          {/* {user?.dateOfBirth && (
            <VStack
              borderRadius="2xl"
              px="4"
              py="3"
              justifyContent="center"
              bg="#EDEFF0"
            >
              <FormControl.Label
                _text={{
                  // color: "rs.inputLabel_grey",
                  fontSize: "xs",
                  lineHeight: "lg",
                }}
              >
                {`${t("Date of Birth")}`}
              </FormControl.Label>
              <Text color="rs.black" fontSize="md">
                {formatUtcToLocalDate(user?.dateOfBirth)}
              </Text>
            </VStack>
          )} */}
          <HStack flex="1">
            <FormInput
              label={t("Date of Birth")}
              controllerProps={{
                name: "dateOfBirthText",
                control,
                rules: {
                  required:
                    getInputIsRequired<BasicInfoForm>(
                      def,
                      "dateOfBirth",
                      OnboardingStepId.BasicInfo
                    ) && `${t("Date of Birth")} ${t("is required")}`,
                },
              }}
              inputProps={{
                editable: false,
                InputRightElement: (
                  <CalendarIcon props={{ marginRight: 6, size: "md" }} />
                ),
              }}
              onPress={() => setOpeningPicker("dateOfBirth")}
            />
          </HStack>
          <HStack flex="1">
            <FormInput
              label={t("Mobile")}
              inputProps={{ keyboardType: "numeric" }}
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
        <DateTimePicker
          title={`${t("Select date of birth")}`}
          isShow={openingPicker === "dateOfBirth"}
          mode="date"
          controllerProps={{
            name: "dateOfBirth",
            control,
          }}
          onClose={() => {
            setOpeningPicker(null);
          }}
          onDefaultDate={(value) => {
            setDefaultDate(value);
          }}
          defaultDate={defaultDate}
        />
        <Button
          mt="auto"
          isLoading={isSubmitting}
          isLoadingText={t("Loading")}
          onPress={handleSubmit(onUpdateProfile)}
        >
          {t("Save")}
        </Button>
      </VStack>
    </HeaderLayout>
  );
}
