import React, { useMemo, useState } from "react";
import { NativeStackScreenProps } from "@react-navigation/native-stack";
import useSWR from "swr";
import { useForm, useWatch } from "react-hook-form";
import {
  Badge,
  Button,
  HStack,
  Pressable,
  Text,
  useTheme,
  VStack,
} from "native-base";

import { useFocusEffect } from "@react-navigation/native";
import { MainStackNavigatorParamList } from "../../../routers/Types";
import HeaderLayout from "../../../components/Layout/HeaderLayout";
import { formatWorkflowUrl } from "../../../services/ServiceUtil";
import { getTranslation } from "../../../utils/translation";
import FormInput from "../../../components/FormInput/FormInput";
import DownArrowIcon from "../../../components/Icons/DownArrowIcon";
import { generateYearOptions } from "../../../constants/Time";
import ImagePicker from "../../../components/ImagePicker";
import MultiSelectModal from "../../../components/Modal/MultiSelectModal";
import { getAllDistricts } from "../../../constants/Districts";
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
import { showApiToastError } from "../../../components/ApiToastError";
import SingleSelectModal from "../../../components/Modal/SingleSelectModal";

export type CoachInfoScreenProps = NativeStackScreenProps<
  MainStackNavigatorParamList,
  "OnboardingCoachInfo"
>;

const t = getTranslation([
  "screen.SignUp.CoachInfo",
  "constant.district",
  "constant.profile",
  "constant.district.HK",
  "constant.button",
  "validation",
  "formInput",
]);

const yearOptions = generateYearOptions(100);

export interface CoachInfoForm {
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
  hkttaId: string;
  startYearAsPlayer: number;
  startYearAsPlayerText?: string;
  startYearAsCoach: number;
  startYearAsCoachText?: string;
  licenseNumber: string;
  playerLevel: string;
  playerLevelText?: string;
  coachLevel: string;
  coachLevelText?: string;
  districts: string[];
  districtsText?: string;
  fee: number;
  achievements: string[];
  profilePicture: {
    fileName: string;
    fileContent: string;
  };
  description: string;
}

export default function CoachInfo({ navigation }: CoachInfoScreenProps) {
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

  const handUsedOptions = useMemo(() => {
    return getInputOptions<CoachInfoForm>(
      def,
      "handUsed",
      OnboardingStepId.CoachInfo
    );
  }, [def]);
  const styleOptions = useMemo(() => {
    return getInputOptions<CoachInfoForm>(
      def,
      "style",
      OnboardingStepId.CoachInfo
    );
  }, [def]);
  const bladeOptions = useMemo(() => {
    return getInputOptions<CoachInfoForm>(
      def,
      "blade",
      OnboardingStepId.CoachInfo
    );
  }, [def]);
  const rubberOptions = useMemo(() => {
    return getInputOptions<CoachInfoForm>(
      def,
      "rubber",
      OnboardingStepId.CoachInfo
    );
  }, [def]);
  const backRubberOptions = useMemo(() => {
    return getInputOptions<CoachInfoForm>(
      def,
      "backRubber",
      OnboardingStepId.CoachInfo
    );
  }, [def]);
  const playerLevelOptions = useMemo(() => {
    return getInputOptions<CoachInfoForm>(
      def,
      "playerLevel",
      OnboardingStepId.CoachInfo
    );
  }, [def]);
  const coachLevelOptions = useMemo(() => {
    return getInputOptions<CoachInfoForm>(
      def,
      "coachLevel",
      OnboardingStepId.CoachInfo
    );
  }, [def]);

  const {
    control,
    handleSubmit,
    watch,
    setValue,
    register,
    formState: { isValid, isSubmitting },
  } = useForm<CoachInfoForm>({
    mode: "onChange",
    defaultValues: {
      achievements: [],
      districts: [],
    },
  });
  register("handUsed", {
    required:
      getInputIsRequired<CoachInfoForm>(
        def,
        "handUsed",
        OnboardingStepId.CoachInfo
      ) && `${t("Hand Used")} ${t("is required")}`,
  });

  const startYearAsPlayer = useWatch({ control, name: "startYearAsPlayer" });
  const handUsed = useWatch({ control, name: "handUsed" });
  const blade = useWatch({ control, name: "blade" });

  const { data: dob, isValidating: fetchingDob } = useSWR(
    formatWorkflowUrl("/onboarding"),
    async () => {
      const { process } = await getOnboardingData();
      return new Date(process.data.dateOfBirth);
    }
  );

  const [isCoachLevelSelectOpen, setIsCoachLevelSelectOpen] = useState(false);
  const [isCoachStartYearSelectOpen, setIsCoachStartYearSelectOpen] =
    useState(false);
  const [isPlayerLevelSelectOpen, setIsPlayerLevelSelectOpen] = useState(false);
  const [isPlayerStartYearSelectOpen, setIsPlayerStartYearSelectOpen] =
    useState(false);
  const [isStyleSelectOpen, setIsStyleSelectOpen] = useState(false);
  const [isRubberSelectOpen, setIsRubberSelectOpen] = useState(false);
  const [isBlackRubberSelectOpen, setIsBlackRubberSelectOpen] = useState(false);
  const [isDistrictsSelectOpen, setIsDistrictsSelectOpen] = useState(false);
  const [isLeftHand, setIsLeftHand] = useState(true);
  const [isShakenHand, setIsShakenHand] = useState(true);

  // update all pickers' input text field value
  React.useEffect(() => {
    const subscription = watch((data, { name }) => {
      if (!name || !(name in data)) return;

      const value = data[name as keyof typeof data];
      if (
        name === "style" ||
        name === "rubber" ||
        name === "backRubber" ||
        name === "playerLevel" ||
        name === "coachLevel"
      ) {
        const opt = getInputOptions(def, name, OnboardingStepId.CoachInfo).find(
          (v) => v.value === value
        );
        setValue(`${name}Text`, opt ? opt.label : undefined, {
          shouldValidate: true,
        });
      }

      if (name === "districts") {
        setValue(
          "districtsText",
          (value as string[]).length
            ? (value as string[]).map((val: string) => t(val)).join(", ")
            : undefined,
          {
            shouldValidate: true,
          }
        );
      }
    });
    return () => subscription.unsubscribe();
  }, [def, setValue, watch]);

  const onSubmit = async (formValue: CoachInfoForm) => {
    try {
      console.log(formValue);
      await processWorkflowStep(OnboardingStepId.CoachInfo, formValue);
      navigation.reset({ index: 0, routes: [{ name: "SignUpSuccess" }] });
    } catch (e) {
      showApiToastError(e);
    }
  };

  const districts = watch("districts");

  return (
    <HeaderLayout
      headerProps={{
        title: t("Coach's Information"),
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
                required: getInputIsRequired<CoachInfoForm>(
                  def,
                  "profilePicture",
                  OnboardingStepId.CoachInfo
                ),
              },
            }}
          />
          {/* Fee */}
          <FormInput
            label={t("Fee")}
            controllerProps={{
              name: "fee",
              control,
              rules: {
                required:
                  getInputIsRequired<CoachInfoForm>(
                    def,
                    "fee",
                    OnboardingStepId.CoachInfo
                  ) && `${t("Fee")} ${t("is required")}`,
                pattern: {
                  value: /^\d+$/,
                  message: t("Must be a number"),
                },
              },
            }}
            inputProps={{ keyboardType: "numeric" }}
          />
          {/* Left right hand */}
          <Button.Group mt="2" isAttached>
            <Pressable
              key={handUsedOptions[0].value}
              bg={
                handUsed === handUsedOptions?.[0].value
                  ? "rs.primary_purple"
                  : "rs.white"
              }
              width="50%"
              justifyContent="center"
              alignItems="center"
              p="4"
              borderWidth="1"
              borderColor="rs.primary_purple"
              onPress={() => {
                setValue("handUsed", handUsedOptions[0].value, {
                  shouldValidate: true,
                });
                setIsLeftHand(true);
              }}
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
              key={handUsedOptions[1].value}
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
              onPress={() => {
                setValue("handUsed", handUsedOptions[1].value, {
                  shouldValidate: true,
                });
                setIsLeftHand(false);
              }}
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
          <Button.Group mt="2" isAttached>
            <Button
              key={bladeOptions[0].value}
              width="50%"
              variant={blade === bladeOptions[0].value ? "solid" : "outline"}
              onPress={() => {
                setValue("blade", bladeOptions[0].value, {
                  shouldValidate: true,
                });
                setIsShakenHand(true);
              }}
            >
              {t(bladeOptions[0].value)}
            </Button>
            <Button
              key={bladeOptions[1].value}
              width="50%"
              variant={blade === bladeOptions[1].value ? "solid" : "outline"}
              onPress={() => {
                setValue("blade", bladeOptions[1].value, {
                  shouldValidate: true,
                });
                setIsShakenHand(false);
              }}
            >
              {t(bladeOptions[1].value)}
            </Button>
          </Button.Group>
          {/* Level */}
          <FormInput
            label={t("Coach Level")}
            controllerProps={{
              name: "coachLevelText",
              control,
              rules: {
                required: `${t("Coach Level")} ${t("is required")}`,
              },
            }}
            inputProps={{
              editable: false,
              InputRightElement: <DownArrowIcon mr="4" />,
            }}
            onPress={() => setIsCoachLevelSelectOpen(true)}
          />
          {/* Coach YOE */}
          <FormInput
            label={t("When you start as a coach")}
            controllerProps={{
              name: "startYearAsCoach",
              control,
              rules: {
                required:
                  getInputIsRequired<CoachInfoForm>(
                    def,
                    "startYearAsCoach",
                    OnboardingStepId.CoachInfo
                  ) && `${t("Start Year")} ${t("is required")}`,
                validate: {
                  withInRange: (v) => {
                    if (v && startYearAsPlayer) {
                      return (
                        v >= startYearAsPlayer ||
                        t(
                          "Start year as a coach should be after your start year as a player"
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
            onPress={() => setIsCoachStartYearSelectOpen(true)}
          />

          {/* Player level */}
          <FormInput
            label={t("Player Level")}
            controllerProps={{
              name: "playerLevelText",
              control,
              rules: {
                required:
                  getInputIsRequired<CoachInfoForm>(
                    def,
                    "playerLevel",
                    OnboardingStepId.CoachInfo
                  ) && `${t("Player Level")} ${t("is required")}`,
              },
            }}
            inputProps={{
              editable: false,
              InputRightElement: <DownArrowIcon mr="4" />,
            }}
            onPress={() => setIsPlayerLevelSelectOpen(true)}
          />
          {/* Ranking */}
          <FormInput
            label={t("Ranking")}
            controllerProps={{
              name: "ranking",
              control,
              rules: {
                required:
                  getInputIsRequired<CoachInfoForm>(
                    def,
                    "ranking",
                    OnboardingStepId.CoachInfo
                  ) && `${t("Ranking")} ${t("is required")}`,
                pattern: {
                  value: /^\d+$/,
                  message: t("Must be a number"),
                },
              },
            }}
            inputProps={{ keyboardType: "numeric" }}
          />

          {/* Player YOE */}
          <FormInput
            label={t("When you start as a player")}
            controllerProps={{
              name: "startYearAsPlayer",
              control,
              rules: {
                required:
                  getInputIsRequired<CoachInfoForm>(
                    def,
                    "startYearAsPlayer",
                    OnboardingStepId.CoachInfo
                  ) && `${t("Start Year")} ${t("is required")}`,
                validate: {
                  withInRange: (v) => {
                    if (v && dob && !Number.isNaN(dob?.getFullYear())) {
                      return (
                        v >= (dob?.getFullYear() ?? 1) ||
                        t(
                          "Start year as a player should be after your date of birth"
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
            onPress={() => setIsPlayerStartYearSelectOpen(true)}
          />
          {/* Style */}
          <FormInput
            label={t("Style")}
            controllerProps={{
              name: "styleText",
              control,
              rules: {
                required:
                  getInputIsRequired<CoachInfoForm>(
                    def,
                    "style",
                    OnboardingStepId.CoachInfo
                  ) && `${t("Style")} ${t("is required")}`,
              },
            }}
            inputProps={{
              editable: false,
              InputRightElement: <DownArrowIcon mr="4" />,
            }}
            onPress={() => setIsStyleSelectOpen(true)}
          />
          {/* Rubber */}
          <FormInput
            label={t("Rubber")}
            controllerProps={{
              name: "rubberText",
              control,
              rules: {
                required:
                  getInputIsRequired<CoachInfoForm>(
                    def,
                    "rubber",
                    OnboardingStepId.CoachInfo
                  ) && `${t("Rubber")} ${t("is required")}`,
              },
            }}
            inputProps={{
              editable: false,
              InputRightElement: <DownArrowIcon mr="4" />,
            }}
            onPress={() => setIsRubberSelectOpen(true)}
          />
          {/* Back rubber */}
          <FormInput
            label={t("Back Rubber")}
            controllerProps={{
              name: "backRubberText",
              control,
              rules: {
                required:
                  getInputIsRequired<CoachInfoForm>(
                    def,
                    "backRubber",
                    OnboardingStepId.CoachInfo
                  ) && `${t("Back Rubber")} ${t("is required")}`,
              },
            }}
            inputProps={{
              editable: false,
              InputRightElement: <DownArrowIcon mr="4" />,
            }}
            onPress={() => setIsBlackRubberSelectOpen(true)}
          />
          {/* Districts */}
          <VStack space="2">
            <Text fontSize="sm" color="gray.500">
              {t("Districts")}
            </Text>
            <HStack width="100%" flexWrap="wrap">
              {AllDistricts.map((district) => {
                const isSelected =
                  districts.findIndex((d) => d === district.value) !== -1;
                const color = isSelected ? "#66CEE1" : "#BEBEBE";
                return (
                  <Pressable
                    key={`district_${district.value}`}
                    onPress={() => {
                      let newValue = districts;
                      if (isSelected) {
                        newValue = districts.filter(
                          (d) => d !== district.value
                        );
                        setValue("districts", newValue, {
                          shouldValidate: true,
                        });
                      } else {
                        setValue("districts", [...districts, district.value], {
                          shouldValidate: true,
                        });
                      }
                    }}
                  >
                    <Badge
                      borderColor={color}
                      variant="outline"
                      bg="rs.white"
                      _text={{ color, fontSize: 14 }}
                      m={1}
                      maxW="40"
                      p="1"
                      px="2"
                      borderRadius="full"
                    >
                      {district.label}
                    </Badge>
                  </Pressable>
                );
              })}
            </HStack>
          </VStack>
          {/* Lisenc no  */}
          <FormInput
            label={t("License No")}
            controllerProps={{
              name: "licenseNumber",
              control,
              rules: {
                required:
                  getInputIsRequired<CoachInfoForm>(
                    def,
                    "licenseNumber",
                    OnboardingStepId.CoachInfo
                  ) && `${t("License No")} ${t("is required")}`,
                pattern: {
                  value: /^\d{4}$/,
                  message: t("Must be a 4-digit number"),
                },
              },
            }}
            inputProps={{ keyboardType: "numeric" }}
          />
          {/* HKTAA ID  */}
          <FormInput
            label={t("HKTTA ID")}
            controllerProps={{
              name: "hkttaId",
              control,
              rules: {
                required:
                  getInputIsRequired<CoachInfoForm>(
                    def,
                    "hkttaId",
                    OnboardingStepId.CoachInfo
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
                  getInputIsRequired<CoachInfoForm>(
                    def,
                    "description",
                    OnboardingStepId.CoachInfo
                  ) && `${t("Description")} ${t("is required")}`,
              },
            }}
            inputProps={{ multiline: true }}
          />
          {/* Achievements */}
          <ArrayFormInput
            label={t("Achievement")}
            controllerProps={{
              name: "achievements",
              control,
              rules: {
                required:
                  getInputIsRequired<CoachInfoForm>(
                    def,
                    "achievements",
                    OnboardingStepId.CoachInfo
                  ) && `${t("Achievements")} ${t("is required")}`,
              },
            }}
            buttonLabel={t("Add achievement")}
          />
          {/* Next */}
          <Button
            mt="auto"
            mb="4"
            isLoading={isSubmitting}
            isLoadingText={t("Loading")}
            isDisabled={!isValid}
            onPress={handleSubmit(onSubmit)}
          >
            {t("Next")}
          </Button>
          <SingleSelectModal
            isOpen={isCoachLevelSelectOpen}
            onClose={() => setIsCoachLevelSelectOpen(false)}
            title={t("Select Level")}
            options={coachLevelOptions}
            controllerProps={{
              name: "coachLevel",
              control,
            }}
            confirmButtonText={t("Confirm")}
          />
          <SingleSelectModal
            isOpen={isCoachStartYearSelectOpen}
            onClose={() => setIsCoachStartYearSelectOpen(false)}
            title={t("When you start as a coach")}
            options={yearOptions}
            controllerProps={{
              name: "startYearAsCoach",
              control,
            }}
            confirmButtonText={t("Confirm")}
          />
          <SingleSelectModal
            isOpen={isPlayerLevelSelectOpen}
            onClose={() => setIsPlayerLevelSelectOpen(false)}
            title={t("Select Level")}
            options={playerLevelOptions}
            controllerProps={{
              name: "playerLevel",
              control,
            }}
            confirmButtonText={t("Confirm")}
          />
          <SingleSelectModal
            isOpen={isPlayerStartYearSelectOpen}
            onClose={() => setIsPlayerStartYearSelectOpen(false)}
            title={t("When you start")}
            options={yearOptions}
            controllerProps={{
              name: "startYearAsPlayer",
              control,
            }}
            confirmButtonText={t("Confirm")}
          />
          <SingleSelectModal
            isOpen={isStyleSelectOpen}
            onClose={() => setIsStyleSelectOpen(false)}
            title={`${t("Select")}${t("Style")}`}
            options={styleOptions}
            controllerProps={{
              name: "style",
              control,
            }}
            confirmButtonText={t("Confirm")}
          />
          <SingleSelectModal
            isOpen={isRubberSelectOpen}
            onClose={() => setIsRubberSelectOpen(false)}
            title={t("Select Rubber")}
            options={rubberOptions}
            controllerProps={{
              name: "rubber",
              control,
            }}
            confirmButtonText={t("Confirm")}
          />
          <SingleSelectModal
            isOpen={isBlackRubberSelectOpen}
            onClose={() => setIsBlackRubberSelectOpen(false)}
            title={t("Select Back Rubber")}
            options={backRubberOptions}
            controllerProps={{
              name: "backRubber",
              control,
            }}
            confirmButtonText={t("Confirm")}
          />
          <MultiSelectModal
            title={t("Select at least 1 district")}
            options={AllDistricts}
            controllerProps={{
              name: "districts",
              control,
            }}
            isOpen={isDistrictsSelectOpen}
            onClose={() => {
              setIsDistrictsSelectOpen(false);
            }}
          />
        </VStack>
      )}
    </HeaderLayout>
  );
}
