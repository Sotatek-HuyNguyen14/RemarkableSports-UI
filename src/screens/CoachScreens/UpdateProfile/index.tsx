/* eslint-disable react/no-array-index-key */
import React, { useMemo, useState } from "react";
import { NativeStackScreenProps } from "@react-navigation/native-stack";
import useSWR from "swr";
import { useForm, useWatch } from "react-hook-form";
import {
  Badge,
  Box,
  Button,
  FormControl,
  Heading,
  HStack,
  Pressable,
  Text,
  useTheme,
  VStack,
} from "native-base";
import { MainStackNavigatorParamList } from "../../../routers/Types";
import HeaderLayout from "../../../components/Layout/HeaderLayout";
import {
  formatFileUrl,
  formatWorkflowUrl,
} from "../../../services/ServiceUtil";
import { getTranslation } from "../../../utils/translation";
import FormInput from "../../../components/FormInput/FormInput";
import OneColumnPickerModal from "../../../components/Modal/OneColumnPickerModal";
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
import { UpdateProfileStepId } from "../../../models/responses/Updating";
import { formatUtcToLocalDate } from "../../../utils/date";
import {
  createUpdateProfileWorkflow,
  getOnboardingData,
  getWorkflowDefinition,
  getWorkflowProcess,
  processWorkflowStep,
} from "../../../services/WorkflowService";
import ConfirmationModal from "../../../components/ConfirmationModal/ConfirmationModal";
import Loading from "../../../components/Loading";
import {
  showApiToastError,
  showApiToastErrorWithMessage,
} from "../../../components/ApiToastError";
import PencilIcon from "../../../components/Icons/PencilIcon";
import SingleSelectModal from "../../../components/Modal/SingleSelectModal";
import CalendarIcon from "../../../components/Icons/CalendarIcon";
import formatPhone from "../../../utils/phone";
import DateTimePicker from "../../../components/v2/DateTimePicker";

export type CoachUpdateProfileProps = NativeStackScreenProps<
  MainStackNavigatorParamList,
  "CoachUpdateProfile"
>;

const t = getTranslation([
  "screen.CoachScreens.CoachUpdateProfile",
  "constant.district",
  "constant.profile",
  "screen.SignUp.CoachInfo",
  "screen.SignUp.BasicInfo",
  "constant.district.HK",
  "constant.button",
  "validation",
  "formInput",
]);

const yearOptions = generateYearOptions(100);

export interface CoachUpdateProfileForm {
  firstName: string;
  lastName: string;
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
  description: string;
  hkttaId: string;
  startYearAsPlayer: string;
  startYearAsPlayerText?: string;
  startYearAsCoach: string;
  startYearAsCoachText?: string;
  coachLevel: string;
  coachLevelText?: string;
  achievements: string[];
  playerLevel: string;
  playerLevelText?: string;
  licenseNumber: string;
  mobile: string;
  fee: string;
  districts: string[];
  districtsText?: string;
  profilePicture:
    | {
        fileName: string;
        fileContent: string;
      }
    | string;
  chineseName?: string;
  sex: string;
  dateOfBirthText?: string;
  dateOfBirth?: string;
}

export default function UpdateProfile({
  navigation,
  route,
}: CoachUpdateProfileProps) {
  const { space } = useTheme();

  const { coach } = route.params;

  const [editProfileSuccess, setEditProfileSuccess] = useState(false);
  const [confirmationOpen, setConfirmationOpen] = useState(false);

  const { data: workflowStatusData, isValidating: isWorkFlowStatusValidating } =
    useSWR(
      formatWorkflowUrl("/update"),
      async () => getWorkflowProcess("update"),
      {
        errorRetryCount: 0,
        errorRetryInterval: 0,
        shouldRetryOnError: false,
        onErrorRetry: () => {},
      }
    );

  const { data: def, isValidating } = useSWR(
    formatWorkflowUrl("/update/definition"),
    async () => getWorkflowDefinition("update"),
    {
      errorRetryCount: 0,
      errorRetryInterval: 0,
      shouldRetryOnError: false,
      onErrorRetry: () => {},
    }
  );

  const shouldShowUserUpdatedProfileAlert = !!(
    workflowStatusData && workflowStatusData.status === "WaitingForInput"
  );

  const {
    control,
    handleSubmit,
    watch,
    setValue,
    register,
    formState: { isSubmitting, isValid },
  } = useForm<CoachUpdateProfileForm>({
    mode: "onChange",
    defaultValues: {
      firstName: coach.firstName,
      lastName: coach.lastName,
      hkttaId: coach.hkttaId,
      startYearAsCoach: coach.startYearAsCoach
        ? coach.startYearAsCoach.toString()
        : undefined,
      startYearAsPlayer: coach.startYearAsPlayer
        ? coach.startYearAsPlayer.toString()
        : undefined,
      coachLevel: coach.coachLevel,
      coachLevelText: coach.coachLevel ? t(coach.coachLevel) : undefined,
      achievements: coach.achievements
        ? coach.achievements.map((e) => {
            return { text: e };
          })
        : [],
      startYearAsPlayerText: coach.startYearAsPlayer
        ? coach.startYearAsPlayer.toString()
        : undefined,
      startYearAsCoachText: coach.startYearAsCoach
        ? coach.startYearAsCoach.toString()
        : undefined,
      handUsed: coach.handUsed,
      style: coach.style,
      styleText: coach.style ? t(coach.style) : undefined,
      blade: coach.blade,
      bladeText: coach.blade ? t(coach.blade) : undefined,
      rubber: coach.rubber,
      rubberText: coach.rubber ? t(coach.rubber) : undefined,
      backRubber: coach.backRubber,
      backRubberText: coach.backRubber ? t(coach.backRubber) : undefined,
      ranking: coach.ranking,
      playerLevel: coach.playerLevel,
      playerLevelText: coach.playerLevel ? t(coach.playerLevel) : undefined,
      licenseNumber: coach.licenseNumber,
      districts: coach.districts,
      fee: coach.fee ? coach.fee.toString() : undefined,
      description: coach.description,
      districtsText:
        coach.districts && coach.districts.map((val) => t(val)).join(", "),
      chineseName: coach.chineseName,
      sex: coach.sex.toLowerCase(),
      dateOfBirth: coach?.dateOfBirth
        ? formatUtcToLocalDate(new Date(coach?.dateOfBirth))
        : undefined,
      dateOfBirthText: coach?.dateOfBirth
        ? formatUtcToLocalDate(new Date(coach?.dateOfBirth))
        : undefined,
      mobile: coach?.mobile
        ? formatPhone(coach?.mobile).replace(" ", "")
        : undefined,
    },
  });

  register("districts", {
    required: true,
  });

  const [defaultDate, setDefaultDate] = useState(
    coach?.dateOfBirth
      ? formatUtcToLocalDate(new Date(coach?.dateOfBirth))
      : undefined
  );

  const sexOptions = [
    { label: t("Male"), value: "Male".toLowerCase() },
    { label: t("Female"), value: "Female".toLowerCase() },
  ];

  // Modals
  const [stylePicker, setStylePickerOpen] = React.useState(false);
  const [bladePicker, setBladePickerOpen] = React.useState(false);
  const [dobPicker, setDobPickerOpen] = React.useState(false);
  const [rubberPicker, setRubberPickerOpen] = React.useState(false);
  const [backRubberPicker, setBackRubberPickerOpen] = React.useState(false);
  const [startYearPlayerPicker, setStartYearPlayerPickerOpen] =
    React.useState(false);
  const [levelPicker, setLevelPicker] = React.useState(false);
  const [startYearCoachPicker, setStartYearCoachPickerOpen] =
    React.useState(false);
  const [coachLevelPicker, setCoachLevelPicker] = React.useState(false);

  const onUpdateProfile = async (formValue: CoachUpdateProfileForm) => {
    const formatValue = formValue;
    formatValue.achievements = formValue.achievements.filter(
      (achievement) => achievement
    );
    if (shouldShowUserUpdatedProfileAlert) {
      showApiToastErrorWithMessage(
        t("Your previous update is pending for approval")
      );
    } else {
      try {
        await createUpdateProfileWorkflow();
        await processWorkflowStep(
          UpdateProfileStepId.CoachInfo,
          formatValue,
          "update"
        );
        setEditProfileSuccess(true);
        setConfirmationOpen(true);
      } catch (error) {
        showApiToastError(error);
      }
    }
  };

  const AllDistricts = getAllDistricts().map((o) => ({
    isSelected: coach.districts
      ? coach.districts.findIndex((district) => district === o.value) !== -1
      : false,
    ...o,
  }));

  const coachLevelOptions = useMemo(() => {
    return getInputOptions<CoachUpdateProfileForm>(
      def,
      "coachLevel",
      UpdateProfileStepId.CoachInfo
    );
  }, [def]);
  const handUsedOptions = useMemo(() => {
    return getInputOptions<CoachUpdateProfileForm>(
      def,
      "handUsed",
      UpdateProfileStepId.CoachInfo
    );
  }, [def]);
  const styleOptions = useMemo(() => {
    return getInputOptions<CoachUpdateProfileForm>(
      def,
      "style",
      UpdateProfileStepId.CoachInfo
    );
  }, [def]);
  const bladeOptions = useMemo(() => {
    return getInputOptions<CoachUpdateProfileForm>(
      def,
      "blade",
      UpdateProfileStepId.CoachInfo
    );
  }, [def]);
  const rubberOptions = useMemo(() => {
    return getInputOptions<CoachUpdateProfileForm>(
      def,
      "rubber",
      UpdateProfileStepId.CoachInfo
    );
  }, [def]);
  const backRubberOptions = useMemo(() => {
    return getInputOptions<CoachUpdateProfileForm>(
      def,
      "backRubber",
      UpdateProfileStepId.CoachInfo
    );
  }, [def]);
  const playerLevelOptions = useMemo(() => {
    return getInputOptions<CoachUpdateProfileForm>(
      def,
      "playerLevel",
      UpdateProfileStepId.CoachInfo
    );
  }, [def]);

  register("handUsed");
  const handUsed = useWatch({ control, name: "handUsed" });

  React.useEffect(() => {
    const subscription = watch((data, { name }) => {
      if (!name || !(name in data)) return;
      const value = data[name as keyof typeof data];
      if (
        name === "style" ||
        name === "rubber" ||
        name === "backRubber" ||
        name === "coachLevel" ||
        name === "playerLevel"
      ) {
        const opt = getInputOptions(
          def,
          name,
          UpdateProfileStepId.CoachInfo
        ).find((v) => v.value === value);
        setValue(`${name}Text`, opt ? opt.label : undefined, {
          shouldValidate: true,
        });
      }
      if (name === "startYearAsPlayer")
        setValue("startYearAsPlayerText", value?.toString(), {
          shouldValidate: true,
        });
      if (name === "startYearAsCoach")
        setValue("startYearAsCoachText", value?.toString(), {
          shouldValidate: true,
        });
      if (name === "startYearAsPlayer")
        setValue("startYearAsPlayerText", value?.toString(), {
          shouldValidate: true,
        });
      if (name === "startYearAsCoach")
        setValue("startYearAsCoachText", value?.toString(), {
          shouldValidate: true,
        });
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
      if (name === "dateOfBirth") {
        setValue("dateOfBirthText", value as string, { shouldValidate: true });
      }
    });
    return () => subscription.unsubscribe();
  }, [def, setValue, watch]);

  const waitForApprovalBanner = () => {
    return (
      <HStack space="2" justifyContent="center" p="4" bg="#66CEE11A">
        <HStack
          w="10"
          h="10"
          borderRadius="full"
          bg="#66CEE145"
          justifyContent="center"
          alignItems="center"
        >
          <PencilIcon innterFill="#66CEE1" />
        </HStack>
        <VStack flex="1" space="2">
          <Heading fontSize="md">{t("Submit for Admin Approval")}</Heading>
          <Text fontSize="md">
            {t(
              "You will not be able to edit your profile until the submitted changes approved by our admin"
            )}
          </Text>
        </VStack>
      </HStack>
    );
  };
  const blade = useWatch({ control, name: "blade" });
  const startYearAsPlayer = useWatch({ control, name: "startYearAsPlayer" });

  const { data: dob, isValidating: fetchingDob } = useSWR(
    formatWorkflowUrl("/onboarding"),
    async () => {
      const { process } = await getOnboardingData();
      return new Date(process.data.dateOfBirth);
    }
  );

  const sex = useWatch({ control, name: "sex" });
  const districts = useWatch({ control, name: "districts" });

  const isLoading = fetchingDob || isWorkFlowStatusValidating || isValidating;
  return (
    <HeaderLayout
      headerProps={{
        title: t("Edit Profile"),
      }}
      containerProps={{ marginHorizontal: space.defaultLayoutSpacing }}
    >
      {isLoading ? (
        <Loading />
      ) : (
        <Box>
          <VStack space="4" flex="1">
            {shouldShowUserUpdatedProfileAlert && waitForApprovalBanner()}
            <ImagePicker
              defaultImageUrl={
                coach.profilePicture
                  ? formatFileUrl(coach.profilePicture)
                  : undefined
              }
              controllerProps={{
                control,
                name: "profilePicture",
                rules: {
                  required: getInputIsRequired<CoachUpdateProfileForm>(
                    def,
                    "profilePicture",
                    UpdateProfileStepId.CoachInfo
                  ),
                },
              }}
            />
            {/* Sex */}
            <HStack w="100%">
              {sexOptions.map((option, index) => {
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
            {/* First name & Last name */}

            <HStack flex="1">
              <FormInput
                label={t("First Name")}
                controllerProps={{
                  name: "firstName",
                  control,
                  rules: {
                    required:
                      getInputIsRequired<CoachUpdateProfileForm>(
                        def,
                        "firstName",
                        UpdateProfileStepId.CoachInfo
                      ) && `${t("First Name")} ${t("is required")}`,
                  },
                }}
              />
            </HStack>
            <HStack flex="1">
              <FormInput
                label={t("Last Name")}
                controllerProps={{
                  name: "lastName",
                  control,
                  rules: {
                    required:
                      getInputIsRequired<CoachUpdateProfileForm>(
                        def,
                        "lastName",
                        UpdateProfileStepId.CoachInfo
                      ) && `${t("Last Name")} ${t("is required")}`,
                  },
                }}
              />
            </HStack>

            {/* Chinese name */}
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
                {coach.email}
              </Text>
            </VStack>
            {/* DOB */}
            <HStack flex="1">
              <FormInput
                label={t("Date of Birth")}
                controllerProps={{
                  name: "dateOfBirthText",
                  control,
                }}
                inputProps={{
                  editable: false,
                  InputRightElement: (
                    <CalendarIcon props={{ marginRight: 6, size: "md" }} />
                  ),
                }}
                onPress={() => setDobPickerOpen(true)}
              />
            </HStack>
            {/* Mobile */}
            <HStack flex="1">
              <FormInput
                label={t("Mobile")}
                inputProps={{ keyboardType: "numeric" }}
                controllerProps={{
                  name: "mobile",
                  control,
                  rules: {
                    pattern: {
                      value: /^\d{8}$/,
                      message: t("Phone Number be 8-digit number"),
                    },
                    required:
                      getInputIsRequired<CoachUpdateProfileForm>(
                        def,
                        "mobile",
                        UpdateProfileStepId.CoachInfo
                      ) && `${t("Mobile")} ${t("is required")}`,
                  },
                }}
              />
            </HStack>
            {/* Coach level */}
            <HStack flex="1">
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
                onPress={() => setCoachLevelPicker(true)}
              />
            </HStack>
            {/* Ranking */}
            <HStack flex="1">
              <FormInput
                label={t("Ranking")}
                controllerProps={{
                  name: "ranking",
                  control,
                  rules: {
                    required:
                      getInputIsRequired<CoachUpdateProfileForm>(
                        def,
                        "ranking",
                        UpdateProfileStepId.CoachInfo
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
            {/* Coach EXP */}
            <HStack flex="1">
              <FormInput
                label={t("When you start as a coach")}
                controllerProps={{
                  name: "startYearAsCoach",
                  control,
                  rules: {
                    required:
                      getInputIsRequired<CoachUpdateProfileForm>(
                        def,
                        "startYearAsCoach",
                        UpdateProfileStepId.CoachInfo
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
                onPress={() => setStartYearCoachPickerOpen(true)}
              />
            </HStack>

            {/* Player level  */}

            <HStack flex="1">
              <FormInput
                label={t("Player Level")}
                controllerProps={{
                  name: "playerLevelText",
                  control,
                  rules: {
                    required:
                      getInputIsRequired<CoachUpdateProfileForm>(
                        def,
                        "playerLevel",
                        UpdateProfileStepId.CoachInfo
                      ) && `${t("Player Level")} ${t("is required")}`,
                  },
                }}
                inputProps={{
                  editable: false,
                  InputRightElement: <DownArrowIcon mr="4" />,
                }}
                onPress={() => setLevelPicker(true)}
              />
            </HStack>

            {/* Player experiene & Style */}

            <HStack flex="1">
              <FormInput
                label={t("When you start as a player")}
                controllerProps={{
                  name: "startYearAsPlayer",
                  control,
                  rules: {
                    required:
                      getInputIsRequired<CoachUpdateProfileForm>(
                        def,
                        "startYearAsPlayer",
                        UpdateProfileStepId.CoachInfo
                      ) && `${t("Start Year")} ${t("is required")}`,
                    validate: {
                      withInRange: (v) => {
                        if (v) {
                          return (
                            parseInt(v, 10) >= (dob?.getFullYear() ?? 1) ||
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
                      getInputIsRequired<CoachUpdateProfileForm>(
                        def,
                        "style",
                        UpdateProfileStepId.CoachInfo
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

            {/* Left right hand */}
            <Button.Group mt="2" isAttached>
              <Pressable
                key={handUsedOptions[0].value}
                bg={
                  handUsed === handUsedOptions[0].value
                    ? "rs.primary_purple"
                    : "rs.white"
                }
                width="50%"
                justifyContent="center"
                alignItems="center"
                p="4"
                borderWidth="1"
                borderColor="rs.primary_purple"
                onPress={() =>
                  setValue("handUsed", handUsedOptions[0].value, {})
                }
              >
                <Text
                  fontSize="md"
                  fontWeight="bold"
                  color={
                    handUsed === handUsedOptions[0].value
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
                  handUsed === handUsedOptions[1].value
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
                  setValue("handUsed", handUsedOptions[1].value, {})
                }
              >
                <Text
                  fontSize="md"
                  fontWeight="bold"
                  color={
                    handUsed === handUsedOptions[1].value
                      ? "rs.white"
                      : "rs.primary_purple"
                  }
                >
                  {t("Right hand")}
                </Text>
              </Pressable>
            </Button.Group>
            {/* Shakehand and Penhold */}
            <Button.Group mt="2" isAttached>
              <Pressable
                key={bladeOptions[0].value}
                bg={
                  blade === bladeOptions[0].value
                    ? "rs.primary_purple"
                    : "rs.white"
                }
                width="50%"
                justifyContent="center"
                alignItems="center"
                p="4"
                borderWidth="1"
                borderColor="rs.primary_purple"
                onPress={() => setValue("blade", bladeOptions[0].value, {})}
              >
                <Text
                  fontSize="md"
                  fontWeight="bold"
                  color={
                    blade === bladeOptions[0].value
                      ? "rs.white"
                      : "rs.primary_purple"
                  }
                >
                  {t(bladeOptions[0].value)}
                </Text>
              </Pressable>
              <Pressable
                key={bladeOptions[1].value}
                bg={
                  blade === bladeOptions[1].value
                    ? "rs.primary_purple"
                    : "rs.white"
                }
                borderColor="rs.primary_purple"
                width="50%"
                justifyContent="center"
                alignItems="center"
                p="4"
                borderWidth="1"
                onPress={() => setValue("blade", bladeOptions[1].value, {})}
              >
                <Text
                  fontSize="md"
                  fontWeight="bold"
                  color={
                    blade === bladeOptions[1].value
                      ? "rs.white"
                      : "rs.primary_purple"
                  }
                >
                  {t(bladeOptions[1].value)}
                </Text>
              </Pressable>
            </Button.Group>
            {/* Rubber & Back rubber */}

            <HStack flex="1">
              <FormInput
                label={t("Rubber")}
                controllerProps={{
                  name: "rubberText",
                  control,
                  rules: {
                    required:
                      getInputIsRequired<CoachUpdateProfileForm>(
                        def,
                        "rubber",
                        UpdateProfileStepId.CoachInfo
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
                      getInputIsRequired<CoachUpdateProfileForm>(
                        def,
                        "backRubber",
                        UpdateProfileStepId.CoachInfo
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

            {/* Price */}
            <FormInput
              label={t("Fee")}
              controllerProps={{
                name: "fee",
                control,
                rules: {
                  required:
                    getInputIsRequired<CoachUpdateProfileForm>(
                      def,
                      "fee",
                      UpdateProfileStepId.CoachInfo
                    ) && `${t("Fee")} ${t("is required")}`,
                  pattern: {
                    value: /^\d+$/,
                    message: t("Must be a number"),
                  },
                },
              }}
              inputProps={{ keyboardType: "numeric" }}
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
                          setValue("districts", newValue);
                        } else {
                          setValue("districts", [...districts, district.value]);
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
            {/* Lisenc no & ID */}

            <HStack flex="1">
              <FormInput
                label={t("License No")}
                controllerProps={{
                  name: "licenseNumber",
                  control,
                  rules: {
                    required:
                      getInputIsRequired<CoachUpdateProfileForm>(
                        def,
                        "licenseNumber",
                        UpdateProfileStepId.CoachInfo
                      ) && `${t("License No")} ${t("is required")}`,
                    pattern: {
                      value: /^\d{4}$/,
                      message: t("Must be a 4-digit number"),
                    },
                  },
                }}
                inputProps={{ keyboardType: "numeric" }}
              />
            </HStack>
            <HStack flex="1">
              <FormInput
                label={t("HKTTA ID")}
                controllerProps={{
                  name: "hkttaId",
                  control,
                  rules: {
                    required:
                      getInputIsRequired<CoachUpdateProfileForm>(
                        def,
                        "hkttaId",
                        UpdateProfileStepId.CoachInfo
                      ) && `${t("HKTTA ID")} ${t("is required")}`,
                    pattern: {
                      value: /^\d{8}$/,
                      message: t("Must be an 8-digit number"),
                    },
                  },
                }}
                inputProps={{ keyboardType: "numeric" }}
              />
            </HStack>

            {/* Description */}
            <FormInput
              label={t("Description")}
              controllerProps={{
                name: "description",
                control,
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
                    getInputIsRequired<CoachUpdateProfileForm>(
                      def,
                      "achievements",
                      UpdateProfileStepId.CoachInfo
                    ) && `${t("Achievements")} ${t("is required")}`,
                },
              }}
              buttonLabel={t("Add achievement")}
            />
            {/* Next */}
            <Button
              mt="auto"
              mb="4"
              isDisabled={!isValid}
              isLoading={isSubmitting}
              isLoadingText={t("Loading")}
              onPress={handleSubmit(onUpdateProfile)}
            >
              {t("Save")}
            </Button>
          </VStack>
          <DateTimePicker
            title={`${t("Select date of birth")}`}
            isShow={dobPicker}
            mode="date"
            controllerProps={{
              name: "dateOfBirth",
              control,
            }}
            onClose={() => {
              setDobPickerOpen(false);
            }}
            onDefaultDate={(value) => {
              setDefaultDate(value);
            }}
            defaultDate={defaultDate}
          />
          <SingleSelectModal
            confirmButtonText={t("Confirm")}
            isOpen={stylePicker}
            onClose={() => setStylePickerOpen(false)}
            title={`${t("Select")} ${t("Style")}`}
            options={styleOptions}
            controllerProps={{
              name: "style",
              control,
            }}
          />
          <OneColumnPickerModal
            isOpen={bladePicker}
            onClose={() => setBladePickerOpen(false)}
            headerLabel={t("Select Blade")}
            options={bladeOptions}
            controllerProps={{
              name: "blade",
              control,
            }}
          />
          <SingleSelectModal
            confirmButtonText={t("Confirm")}
            isOpen={rubberPicker}
            onClose={() => setRubberPickerOpen(false)}
            title={t("Select Rubber")}
            options={rubberOptions}
            controllerProps={{
              name: "rubber",
              control,
            }}
          />
          <SingleSelectModal
            confirmButtonText={t("Confirm")}
            isOpen={backRubberPicker}
            onClose={() => setBackRubberPickerOpen(false)}
            title={t("Select Back Rubber")}
            options={backRubberOptions}
            controllerProps={{
              name: "backRubber",
              control,
            }}
          />
          <SingleSelectModal
            confirmButtonText={t("Confirm")}
            isOpen={startYearPlayerPicker}
            onClose={() => setStartYearPlayerPickerOpen(false)}
            title={t("When you start")}
            options={yearOptions}
            controllerProps={{
              name: "startYearAsPlayer",
              control,
            }}
          />
          <SingleSelectModal
            confirmButtonText={t("Confirm")}
            isOpen={levelPicker}
            onClose={() => setLevelPicker(false)}
            title={t("Select Level")}
            options={playerLevelOptions}
            controllerProps={{
              name: "playerLevel",
              control,
            }}
          />
          <SingleSelectModal
            confirmButtonText={t("Confirm")}
            isOpen={startYearCoachPicker}
            onClose={() => setStartYearCoachPickerOpen(false)}
            title={t("When you start as a coach")}
            options={yearOptions}
            controllerProps={{
              name: "startYearAsCoach",
              control,
            }}
          />
          <SingleSelectModal
            confirmButtonText={t("Confirm")}
            isOpen={coachLevelPicker}
            onClose={() => setCoachLevelPicker(false)}
            title={t("Select Level")}
            options={coachLevelOptions}
            controllerProps={{
              name: "coachLevel",
              control,
            }}
          />

          <ConfirmationModal
            isOpen={confirmationOpen}
            alertType="Success"
            title={t("Wait for approval")}
            description={t("Your previous update is pending for approval")}
            confirmText={t("OK")}
            onConfirm={() => {
              setConfirmationOpen(false);
              navigation.goBack();
            }}
            onCancel={() => {
              setConfirmationOpen(false);
              navigation.goBack();
            }}
          />

          <ConfirmationModal
            isOpen={shouldShowUserUpdatedProfileAlert}
            alertType="Success"
            title={t("Wait for approval")}
            description={t("Your previous update is pending for approval")}
            confirmText={t("OK")}
            onConfirm={() => {
              setConfirmationOpen(false);
              navigation.goBack();
            }}
            onCancel={() => {
              setConfirmationOpen(false);
              navigation.goBack();
            }}
          />
        </Box>
      )}
    </HeaderLayout>
  );
}
