import React, { useMemo } from "react";
import { NativeStackScreenProps } from "@react-navigation/native-stack";
import useSWR from "swr";
import { useForm } from "react-hook-form";
import { Keyboard, TouchableWithoutFeedback } from "react-native";
import { Button, useTheme, VStack } from "native-base";

import { useFocusEffect } from "@react-navigation/native";
import { MainStackNavigatorParamList } from "../../../routers/Types";
import HeaderLayout from "../../../components/Layout/HeaderLayout";
import { formatWorkflowUrl } from "../../../services/ServiceUtil";
import { getTranslation } from "../../../utils/translation";
import FormInput from "../../../components/FormInput/FormInput";
import DownArrowIcon from "../../../components/Icons/DownArrowIcon";
import ImagePicker from "../../../components/ImagePicker";
import MultiSelectModal from "../../../components/Modal/MultiSelectModal";
import { getAllDistricts } from "../../../constants/Districts";
import ArrayFormInput from "../../../components/ArrayFormInput";
import {
  getWorkflowDefinition,
  processWorkflowStep,
} from "../../../services/WorkflowService";
import Loading from "../../../components/Loading";
import ErrorMessage from "../../../components/ErrorMessage";
import { getInputIsRequired } from "../../../services/Workflow";
import { OnboardingStepId } from "../../../models/responses/Onboarding";
import { useAuth } from "../../../hooks/UseAuth";
import { showApiToastError } from "../../../components/ApiToastError";

export type ClubStaffInfoScreenProps = NativeStackScreenProps<
  MainStackNavigatorParamList,
  "OnboardingClubStaffInfo"
>;

const t = getTranslation([
  "screen.SignUp.ClubStaffInfo",
  "constant.district",
  "constant.profile",
  "validation",
  "constant.button",
]);

export interface ClubStaffInfoForm {
  clubName: string;
  address: string;
  districts: string[];
  districtsText?: string;
  achievements: string[];
  profilePicture: {
    fileName: string;
    fileContent: string;
  };
}

export default function ClubStaffInfo({
  navigation,
}: ClubStaffInfoScreenProps) {
  const AllDistricts = useMemo(() => {
    return getAllDistricts();
  }, []);
  const { space } = useTheme();

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

  const {
    control,
    handleSubmit,
    watch,
    setValue,
    formState: { isDirty, isValid, isSubmitting },
  } = useForm<ClubStaffInfoForm>({
    mode: "onChange",
    defaultValues: {
      achievements: [],
    },
  });

  const [openingPicker, setOpeningPicker] = React.useState<string | null>(null);
  const { updateUserInfo } = useAuth();

  const onSubmit = async (formValue: ClubStaffInfoForm) => {
    try {
      await processWorkflowStep(OnboardingStepId.ClubInfo, formValue);
      await updateUserInfo();
      navigation.reset({
        index: 0,
        routes: [{ name: "ClubNavigator", params: { screen: "ClubHome" } }],
      });
    } catch (e) {
      showApiToastError(e);
    }
  };

  // update all pickers' input text field value
  React.useEffect(() => {
    const subscription = watch((data, { name }) => {
      if (!name || !(name in data)) {
        return;
      }
      const value = data[name as keyof typeof data];
      if (name === "districts")
        setValue(
          "districtsText",
          (value as string[]).length
            ? (value as string[]).map((val: string) => t(val)).join(", ")
            : undefined,
          {
            shouldValidate: true,
          }
        );
    });
    return () => subscription.unsubscribe();
  }, [setValue, watch]);

  return (
    <HeaderLayout
      headerProps={{
        title: t("Club Staff's Information"),
      }}
      containerProps={{ marginHorizontal: space.defaultLayoutSpacing }}
    >
      {isValidating && <Loading />}
      {!isValidating && error && <ErrorMessage />}
      {!isValidating && def && (
        <>
          <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
            <VStack space="4" flex="1">
              <ImagePicker
                controllerProps={{
                  control,
                  name: "profilePicture",
                  rules: {
                    required: getInputIsRequired<ClubStaffInfoForm>(
                      def,
                      "profilePicture",
                      OnboardingStepId.ClubInfo
                    ),
                  },
                }}
              />
              <FormInput
                label={t("Club name")}
                controllerProps={{
                  name: "clubName",
                  control,
                  rules: {
                    required:
                      getInputIsRequired<ClubStaffInfoForm>(
                        def,
                        "clubName",
                        OnboardingStepId.ClubInfo
                      ) && `${t("Club name")}${t("is required")}`,
                  },
                }}
              />
              <FormInput
                label={t("Address")}
                controllerProps={{
                  name: "address",
                  control,
                  rules: {
                    required:
                      getInputIsRequired<ClubStaffInfoForm>(
                        def,
                        "address",
                        OnboardingStepId.ClubInfo
                      ) && `${t("Address")}${t("is required")}`,
                  },
                }}
                inputProps={{ multiline: true }}
              />
              <FormInput
                label={t("District(s)")}
                controllerProps={{
                  name: "districtsText",
                  control,
                  rules: {
                    required:
                      getInputIsRequired<ClubStaffInfoForm>(
                        def,
                        "districts",
                        OnboardingStepId.ClubInfo
                      ) && `${t("District(s)")}${t("is required")}`,
                  },
                }}
                inputProps={{
                  multiline: true,
                  editable: false,
                  InputRightElement: <DownArrowIcon mr="4" />,
                }}
                onPress={() => setOpeningPicker("district")}
              />
              <ArrayFormInput
                label={t("Achievements")}
                controllerProps={{
                  name: "achievements",
                  control,
                  rules: {
                    required:
                      getInputIsRequired<ClubStaffInfoForm>(
                        def,
                        "achievements",
                        OnboardingStepId.ClubInfo
                      ) && `${t("Achievements")}${t("is required")}`,
                  },
                }}
                inputProps={{ multiline: true }}
                buttonLabel={t("Add achievement")}
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
          <MultiSelectModal
            title={t("Select at least 1 district")}
            options={AllDistricts}
            controllerProps={{
              name: "districts",
              control,
            }}
            // isOpen
            isOpen={openingPicker === "district"}
            onClose={() => setOpeningPicker(null)}
          />
        </>
      )}
    </HeaderLayout>
  );
}
