import React, { useEffect, useMemo, useState } from "react";
import { NativeStackScreenProps } from "@react-navigation/native-stack";
import useSWR from "swr";
import { useForm, useWatch } from "react-hook-form";
import { Button, HStack, Pressable, Text, useTheme, VStack } from "native-base";
import { Keyboard, TouchableWithoutFeedback } from "react-native";

import { useFocusEffect } from "@react-navigation/native";
import { MainStackNavigatorParamList } from "../../../routers/Types";
import HeaderLayout from "../../../components/Layout/HeaderLayout";
import { formatWorkflowUrl } from "../../../services/ServiceUtil";
import { getTranslation } from "../../../utils/translation";
import FormInput from "../../../components/FormInput/FormInput";
import OneColumnPickerModal from "../../../components/Modal/OneColumnPickerModal";
import DownArrowIcon from "../../../components/Icons/DownArrowIcon";
import { generateYearOptions } from "../../../constants/Time";
import ImagePicker from "../../../components/ImagePicker";
import ArrayFormInput from "../../../components/ArrayFormInput";
import {
  getInputIsRequired,
  getInputOptions,
} from "../../../services/Workflow";
import {
  getOnboardingData,
  getWorkflowDefinition,
  processWorkflowStep,
} from "../../../services/WorkflowService";
import Loading from "../../../components/Loading";
import ErrorMessage from "../../../components/ErrorMessage";
import { OnboardingStepId } from "../../../models/responses/Onboarding";
import { useAuth } from "../../../hooks/UseAuth";
import { showApiToastError } from "../../../components/ApiToastError";
import SingleSelectModal from "../../../components/Modal/SingleSelectModal";

export type PlayerInfoScreenProps = NativeStackScreenProps<
  MainStackNavigatorParamList,
  "OnboardingPlayerInfo"
>;

const t = getTranslation([
  "screen.SignUp.PlayerInfo",
  "constant.profile",
  "validation",
  "formInput",
  "constant.button",
]);

const yearOptions = generateYearOptions(100);

export interface PlayerInfoForm {
  style?: string;
  styleText: string;
  handUsed: string;
  blade: string;
  bladeText?: string;
  rubber: string;
  rubberText?: string;
  backRubber: string;
  backRubberText?: string;
  ranking: string;
  rankingText: string;
  hkttaId: string;
  startYearAsPlayer: number;
  level: string;
  levelText?: string;
  achievements: string[];
  profilePicture: {
    fileName: string;
    fileContent: string;
  };
  description: string;
}

export default function PlayerInfo({ navigation }: PlayerInfoScreenProps) {
  const { space } = useTheme();
  const {
    data: def,
    isValidating,
    error,
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
    register,
    formState: { isDirty, isValid, isSubmitting },
  } = useForm<PlayerInfoForm>({
    mode: "onChange",
    defaultValues: {
      achievements: [],
    },
  });

  const { data: dob, isValidating: fetchingDob } = useSWR(
    formatWorkflowUrl("/onboarding"),
    async () => {
      const { process } = await getOnboardingData();
      return new Date(process.data.dateOfBirth);
    }
  );

  register("handUsed", {
    required:
      getInputIsRequired<PlayerInfoForm>(
        def,
        "handUsed",
        OnboardingStepId.PlayerInfo
      ) && `${t("Hand Used")} ${t("is required")}`,
  });

  const handUsed = useWatch({ control, name: "handUsed" });
  const blade = useWatch({ control, name: "blade" });

  const { updateUserInfo } = useAuth();

  const onSubmit = async (formValue: PlayerInfoForm) => {
    try {
      await processWorkflowStep(OnboardingStepId.PlayerInfo, formValue);
      await updateUserInfo();
      navigation.reset({
        index: 0,
        routes: [{ name: "PlayerNavigator", params: { screen: "PlayerHome" } }],
      });
    } catch (e) {
      showApiToastError(e);
    }
  };

  const handUsedOptions = useMemo(() => {
    return getInputOptions<PlayerInfoForm>(
      def,
      "handUsed",
      OnboardingStepId.PlayerInfo
    );
  }, [def]);
  const styleOptions = useMemo(() => {
    return getInputOptions<PlayerInfoForm>(
      def,
      "style",
      OnboardingStepId.PlayerInfo
    );
  }, [def]);
  const bladeOptions = useMemo(() => {
    return getInputOptions<PlayerInfoForm>(
      def,
      "blade",
      OnboardingStepId.PlayerInfo
    );
  }, [def]);
  const rubberOptions = useMemo(() => {
    return getInputOptions<PlayerInfoForm>(
      def,
      "rubber",
      OnboardingStepId.PlayerInfo
    );
  }, [def]);
  const backRubberOptions = useMemo(() => {
    return getInputOptions<PlayerInfoForm>(
      def,
      "backRubber",
      OnboardingStepId.PlayerInfo
    );
  }, [def]);
  const levelOptions = useMemo(() => {
    return getInputOptions<PlayerInfoForm>(
      def,
      "level",
      OnboardingStepId.PlayerInfo
    );
  }, [def]);

  // update all pickers' input text field value
  React.useEffect(() => {
    const subscription = watch((data, { name }) => {
      if (!name || !(name in data)) {
        return;
      }
      const value = data[name as keyof typeof data];
      if (
        name === "style" ||
        name === "blade" ||
        name === "rubber" ||
        name === "backRubber" ||
        name === "level"
      ) {
        const opt = getInputOptions<PlayerInfoForm>(
          def,
          name,
          OnboardingStepId.PlayerInfo
        ).find((v) => v.value === value);
        setValue(`${name}Text`, opt ? opt.label : undefined, {
          shouldValidate: true,
        });
      }
    });
    return () => subscription.unsubscribe();
  }, [def, setValue, watch]);

  // Modals
  const [stylePicker, setStylePickerOpen] = React.useState(false);
  const [bladePicker, setBladePickerOpen] = React.useState(false);
  const [rubberPicker, setRubberPickerOpen] = React.useState(false);
  const [backRubberPicker, setBackRubberPickerOpen] = React.useState(false);
  const [startYearPlayerPicker, setStartYearPlayerPickerOpen] =
    React.useState(false);
  const [levelPicker, setLevelPicker] = React.useState(false);

  return (
    <HeaderLayout
      headerProps={{
        title: t("Player's Information"),
      }}
      containerProps={{ marginHorizontal: space.defaultLayoutSpacing }}
    >
      {isValidating && fetchingDob && <Loading />}
      {!isValidating && error && <ErrorMessage />}
      {!isValidating && def && (
        <VStack space="4" flex="1">
          <ImagePicker
            controllerProps={{
              control,
              name: "profilePicture",
              rules: {
                required: getInputIsRequired<PlayerInfoForm>(
                  def,
                  "profilePicture",
                  OnboardingStepId.PlayerInfo
                ),
              },
            }}
          />
          {/* Left right hand */}
          <Button.Group mt="2" isAttached>
            <Pressable
              key={handUsedOptions?.[0].value}
              bg={
                handUsed === handUsedOptions?.[0].value
                  ? "rs.primary_purple"
                  : "rs.white"
              }
              justifyContent="center"
              alignItems="center"
              p="4"
              borderWidth="1"
              width="50%"
              borderColor="rs.primary_purple"
              onPress={() =>
                setValue("handUsed", handUsedOptions?.[0].value, {})
              }
            >
              <Text
                fontSize="md"
                fontWeight="bold"
                color={
                  handUsed === handUsedOptions?.[0].value
                    ? "rs.white"
                    : "rs.primary_purple"
                }
              >
                {t("Left hand")}
              </Text>
            </Pressable>
            <Pressable
              key={handUsedOptions?.[1].value}
              bg={
                handUsed === handUsedOptions?.[1].value
                  ? "rs.primary_purple"
                  : "rs.white"
              }
              borderColor="rs.primary_purple"
              width="50%"
              justifyContent="center"
              alignItems="center"
              p="4"
              borderWidth="1"
              onPress={() =>
                setValue("handUsed", handUsedOptions?.[1].value, {})
              }
            >
              <Text
                fontSize="md"
                fontWeight="bold"
                color={
                  handUsed === handUsedOptions?.[1].value
                    ? "rs.white"
                    : "rs.primary_purple"
                }
              >
                {t("Right hand")}
              </Text>
            </Pressable>
          </Button.Group>
          {/* Blade */}
          <Button.Group mt="2" isAttached>
            <Button
              width="50%"
              variant={blade === bladeOptions[0].value ? "solid" : "outline"}
              onPress={() =>
                setValue("blade", bladeOptions[0].value, {
                  shouldValidate: true,
                })
              }
            >
              {t(bladeOptions[0].value)}
              {/* </Text> */}
            </Button>
            <Button
              width="50%"
              variant={blade === bladeOptions[1].value ? "solid" : "outline"}
              onPress={() =>
                setValue("blade", bladeOptions[1].value, {
                  shouldValidate: true,
                })
              }
            >
              {t(bladeOptions[1].value)}
            </Button>
          </Button.Group>
          {/* Level & ranking */}

          <HStack flex="1">
            <FormInput
              label={t("Level")}
              controllerProps={{
                name: "levelText",
                control,
                rules: {
                  required:
                    getInputIsRequired<PlayerInfoForm>(
                      def,
                      "level",
                      OnboardingStepId.PlayerInfo
                    ) && `${t("Level")} ${t("is required")}`,
                },
              }}
              inputProps={{
                editable: false,
                InputRightElement: <DownArrowIcon mr="4" />,
              }}
              onPress={() => setLevelPicker(true)}
            />
          </HStack>
          <HStack flex="1">
            <FormInput
              label={t("Ranking")}
              controllerProps={{
                name: "ranking",
                control,
                rules: {
                  required:
                    getInputIsRequired<PlayerInfoForm>(
                      def,
                      "ranking",
                      OnboardingStepId.PlayerInfo
                    ) && `${t("Ranking")} ${t("is required")}`,
                  pattern: {
                    value: /^\d+$/,
                    message: t("Must be a number"),
                  },
                },
              }}
              inputProps={{ keyboardType: "numeric" }}
            />
          </HStack>

          {/* Experience & Style */}

          <HStack flex="1">
            <FormInput
              label={t("When you start")}
              controllerProps={{
                name: "startYearAsPlayer",
                control,
                rules: {
                  required:
                    getInputIsRequired<PlayerInfoForm>(
                      def,
                      "startYearAsPlayer",
                      OnboardingStepId.PlayerInfo
                    ) && `${t("Start Year")} ${t("is required")}`,
                  validate: {
                    withInRange: (v) => {
                      if (v && dob && !Number.isNaN(dob?.getFullYear())) {
                        return (
                          v >= (dob?.getFullYear() ?? 1) ||
                          t(
                            "Start year as player must greater than date of birth"
                          )
                        );
                      }
                    },
                  },
                },
              }}
              inputProps={{
                editable: false,
                InputRightElement: <DownArrowIcon mr="4" />,
              }}
              onPress={() => setStartYearPlayerPickerOpen(true)}
            />
          </HStack>
          <HStack flex="1">
            <FormInput
              label={t("Style")}
              controllerProps={{
                name: "styleText",
                control,
                rules: {
                  required:
                    getInputIsRequired<PlayerInfoForm>(
                      def,
                      "style",
                      OnboardingStepId.PlayerInfo
                    ) && `${t("Style")} ${t("is required")}`,
                },
              }}
              inputProps={{
                editable: false,
                InputRightElement: <DownArrowIcon mr="4" />,
              }}
              onPress={() => setStylePickerOpen(true)}
            />
          </HStack>

          {/* Forehand backhand */}

          <HStack flex="1">
            <FormInput
              label={t("Rubber")}
              controllerProps={{
                name: "rubberText",
                control,
                rules: {
                  required:
                    getInputIsRequired<PlayerInfoForm>(
                      def,
                      "rubber",
                      OnboardingStepId.PlayerInfo
                    ) && `${t("Rubber")} ${t("is required")}`,
                },
              }}
              inputProps={{
                editable: false,
                InputRightElement: <DownArrowIcon mr="4" />,
              }}
              onPress={() => setRubberPickerOpen(true)}
            />
          </HStack>
          <HStack flex="1">
            <FormInput
              label={t("Back Rubber")}
              controllerProps={{
                name: "backRubberText",
                control,
                rules: {
                  required:
                    getInputIsRequired<PlayerInfoForm>(
                      def,
                      "backRubber",
                      OnboardingStepId.PlayerInfo
                    ) && `${t("Back Rubber")} ${t("is required")}`,
                },
              }}
              inputProps={{
                editable: false,
                InputRightElement: <DownArrowIcon mr="4" />,
              }}
              onPress={() => setBackRubberPickerOpen(true)}
            />
          </HStack>

          <FormInput
            label={t("HKTTA ID")}
            controllerProps={{
              name: "hkttaId",
              control,
              rules: {
                required:
                  getInputIsRequired<PlayerInfoForm>(
                    def,
                    "hkttaId",
                    OnboardingStepId.PlayerInfo
                  ) && `${t("HKTTA ID")} ${t("is required")}`,
                pattern: {
                  value: /^\d{8}$/,
                  message: t("Must be an 8-digit number"),
                },
              },
            }}
            inputProps={{ keyboardType: "numeric" }}
          />
          {/* Description */}
          <FormInput
            label={t("Description")}
            controllerProps={{
              name: "description",
              control,
              rules: {
                required:
                  getInputIsRequired<PlayerInfoForm>(
                    def,
                    "description",
                    OnboardingStepId.PlayerInfo
                  ) && `${t("Description")} ${t("is required")}`,
              },
            }}
            inputProps={{ multiline: true }}
          />
          <ArrayFormInput
            label={t("Achievements")}
            controllerProps={{
              name: "achievements",
              control,
              rules: {
                required:
                  getInputIsRequired<PlayerInfoForm>(
                    def,
                    "achievements",
                    OnboardingStepId.PlayerInfo
                  ) && `${t("Achievements")} ${t("is required")}`,
              },
            }}
            buttonLabel={t("Add achievement")}
            inputProps={{ multiline: true }}
          />
          <Button
            mt="auto"
            mb="4"
            isLoading={isSubmitting}
            isLoadingText={t("Loading")}
            isDisabled={!isDirty || !isValid}
            onPress={handleSubmit(onSubmit)}
          >
            {t("Next")}
          </Button>
        </VStack>
      )}
      <SingleSelectModal
        isOpen={stylePicker}
        onClose={() => setStylePickerOpen(false)}
        title={`${t("Select")}${t("Style")}`}
        options={styleOptions}
        controllerProps={{
          name: "style",
          control,
        }}
        confirmButtonText={t("Confirm")}
      />
      <SingleSelectModal
        isOpen={bladePicker}
        onClose={() => setBladePickerOpen(false)}
        title={t("Select Blade")}
        options={bladeOptions}
        controllerProps={{
          name: "blade",
          control,
        }}
        confirmButtonText={t("Confirm")}
      />
      <SingleSelectModal
        isOpen={rubberPicker}
        onClose={() => setRubberPickerOpen(false)}
        title={t("Select Rubber")}
        options={rubberOptions}
        controllerProps={{
          name: "rubber",
          control,
        }}
        confirmButtonText={t("Confirm")}
      />
      <SingleSelectModal
        isOpen={backRubberPicker}
        onClose={() => setBackRubberPickerOpen(false)}
        title={t("Select Back Rubber")}
        options={backRubberOptions}
        controllerProps={{
          name: "backRubber",
          control,
        }}
        confirmButtonText={t("Confirm")}
      />
      <SingleSelectModal
        isOpen={startYearPlayerPicker}
        onClose={() => setStartYearPlayerPickerOpen(false)}
        title={t("When you start")}
        options={yearOptions}
        controllerProps={{
          name: "startYearAsPlayer",
          control,
        }}
        confirmButtonText={t("Confirm")}
      />
      <SingleSelectModal
        isOpen={levelPicker}
        onClose={() => setLevelPicker(false)}
        title={t("Select Level")}
        options={levelOptions}
        controllerProps={{
          name: "level",
          control,
        }}
        confirmButtonText={t("Confirm")}
      />
    </HeaderLayout>
  );
}
