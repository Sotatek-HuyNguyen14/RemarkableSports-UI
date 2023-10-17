/* eslint-disable react/no-array-index-key */
import React, { useMemo } from "react";
import { NativeStackScreenProps } from "@react-navigation/native-stack";
import useSWR from "swr";
import { useForm, useWatch } from "react-hook-form";
import {
  Button,
  HStack,
  Pressable,
  Text,
  useTheme,
  VStack,
  FormControl,
} from "native-base";
import { MainStackNavigatorParamList } from "../../../routers/Types";
import HeaderLayout from "../../../components/Layout/HeaderLayout";
import {
  formatFileUrl,
  formatWorkflowUrl,
} from "../../../services/ServiceUtil";
import { getTranslation } from "../../../utils/translation";
import FormInput from "../../../components/FormInput/FormInput";
import DownArrowIcon from "../../../components/Icons/DownArrowIcon";
import { generateYearOptions } from "../../../constants/Time";
import ImagePicker from "../../../components/ImagePicker";
import ArrayFormInput from "../../../components/ArrayFormInput";
import {
  getInputIsRequired,
  getInputOptions,
} from "../../../services/Workflow";
import { UpdateProfileStepId } from "../../../models/responses/Updating";
import {
  createUpdateProfileWorkflow,
  getOnboardingData,
  getWorkflowDefinition,
  processWorkflowStep,
} from "../../../services/WorkflowService";
import Loading from "../../../components/Loading";
import { useAuth } from "../../../hooks/UseAuth";
import { showApiToastError } from "../../../components/ApiToastError";
import SingleSelectModal from "../../../components/Modal/SingleSelectModal";
import { formatUtcToLocalDate } from "../../../utils/date";
import formatPhone from "../../../utils/phone";
import CalendarIcon from "../../../components/Icons/CalendarIcon";
import DateTimePicker from "../../../components/v2/DateTimePicker";

export type PlayerUpdateProfileProps = NativeStackScreenProps<
  MainStackNavigatorParamList,
  "PlayerUpdateProfile"
>;

const t = getTranslation([
  "screen.PlayerScreens.PlayerUpdateProfile",
  "constant.district",
  "constant.profile",
  "screen.SignUp.PlayerInfo",
  "screen.SignUp.BasicInfo",
  "constant.button",
  "validation",
  "formInput",
]);

const yearOptions = generateYearOptions(100);

export interface PlayerUpdateProfileForm {
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
  address: string;
  description: string;
  hkttaId: string;
  startYearAsPlayer: number;
  startYearAsPlayerText?: string;
  achievements: string[];
  level: string;
  levelText?: string;
  mobile: string;
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
}: PlayerUpdateProfileProps) {
  const { space } = useTheme();
  const { updateUserInfo } = useAuth();
  const { player } = route.params;

  const { data: def, isValidating } = useSWR(
    formatWorkflowUrl("/update/definition"),
    () => getWorkflowDefinition("update")
  );

  const {
    control,
    handleSubmit,
    watch,
    setValue,
    register,
    formState: { isSubmitting, isValid },
  } = useForm<PlayerUpdateProfileForm>({
    mode: "onChange",
    defaultValues: {
      description: player.description,
      firstName: player.firstName,
      lastName: player.lastName,
      hkttaId: player.hkttaId,
      startYearAsPlayer: player.startYearAsPlayer,
      achievements: player.achievements
        ? player.achievements.map((e) => {
            return { text: e };
          })
        : [],
      startYearAsPlayerText: player.startYearAsPlayer
        ? player.startYearAsPlayer.toString()
        : undefined,
      handUsed: player.handUsed,
      style: player.style,
      styleText: player.style ? t(player.style) : undefined,
      blade: player.blade,
      bladeText: player.blade ? t(player.blade) : undefined,
      rubber: player.rubber,
      rubberText: player.rubber ? t(player.rubber) : undefined,
      backRubber: player.backRubber,
      backRubberText: player.backRubber ? t(player.backRubber) : undefined,
      ranking: player.ranking,
      level: player.playerLevel,
      levelText: player.playerLevel ? t(player.playerLevel) : undefined,
      sex: player.sex.toLowerCase(),
      chineseName: player.chineseName,
      dateOfBirth: player?.dateOfBirth
        ? formatUtcToLocalDate(new Date(player?.dateOfBirth))
        : undefined,
      dateOfBirthText: player?.dateOfBirth
        ? formatUtcToLocalDate(new Date(player?.dateOfBirth))
        : undefined,
      mobile: player?.mobile
        ? formatPhone(player?.mobile).replace(" ", "")
        : undefined,
    },
  });

  const [defaultDate, setDefaultDate] = React.useState(
    player?.dateOfBirth
      ? formatUtcToLocalDate(new Date(player?.dateOfBirth))
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

  const handUsedOptions = useMemo(() => {
    return getInputOptions<PlayerUpdateProfileForm>(
      def,
      "handUsed",
      UpdateProfileStepId.PlayerInfo
    );
  }, [def]);
  const styleOptions = useMemo(() => {
    return getInputOptions<PlayerUpdateProfileForm>(
      def,
      "style",
      UpdateProfileStepId.PlayerInfo
    );
  }, [def]);
  const bladeOptions = useMemo(() => {
    return getInputOptions<PlayerUpdateProfileForm>(
      def,
      "blade",
      UpdateProfileStepId.PlayerInfo
    );
  }, [def]);
  const rubberOptions = useMemo(() => {
    return getInputOptions<PlayerUpdateProfileForm>(
      def,
      "rubber",
      UpdateProfileStepId.PlayerInfo
    );
  }, [def]);
  const backRubberOptions = useMemo(() => {
    return getInputOptions<PlayerUpdateProfileForm>(
      def,
      "backRubber",
      UpdateProfileStepId.PlayerInfo
    );
  }, [def]);
  const levelOptions = useMemo(() => {
    return getInputOptions<PlayerUpdateProfileForm>(
      def,
      "level",
      UpdateProfileStepId.PlayerInfo
    );
  }, [def]);

  register("handUsed");
  const handUsed = useWatch({ control, name: "handUsed" });
  const blade = useWatch({ control, name: "blade" });
  const sex = useWatch({ control, name: "sex" });

  React.useEffect(() => {
    const subscription = watch((data, { name }) => {
      if (!name || !(name in data)) return;
      const value = data[name as keyof typeof data];
      if (
        name === "style" ||
        name === "rubber" ||
        name === "backRubber" ||
        name === "level"
      ) {
        const opt = getInputOptions(
          def,
          name,
          UpdateProfileStepId.PlayerInfo
        ).find((v) => v.value === value);
        setValue(`${name}Text`, opt ? opt.label : undefined, {
          shouldValidate: true,
        });
      }
      if (name === "startYearAsPlayer")
        setValue("startYearAsPlayerText", value?.toString(), {
          shouldValidate: true,
        });
      if (name === "startYearAsPlayer")
        setValue("startYearAsPlayerText", value?.toString(), {
          shouldValidate: true,
        });
      if (name === "dateOfBirth") {
        setValue("dateOfBirthText", value as string, { shouldValidate: true });
      }
    });
    return () => subscription.unsubscribe();
  }, [def, setValue, watch]);

  const onUpdateProfile = async (formValue: PlayerUpdateProfileForm) => {
    const formatValue = formValue;
    formatValue.achievements = formValue.achievements.filter(
      (achievement) => achievement
    );
    try {
      await createUpdateProfileWorkflow();
      await processWorkflowStep(
        UpdateProfileStepId.PlayerInfo,
        formatValue,
        "update"
      );
      await updateUserInfo();
      navigation.goBack();
    } catch (error) {
      console.log("Error", error);
      showApiToastError(error);
    }
  };

  const { data: dob, isValidating: fetchingDob } = useSWR(
    formatWorkflowUrl("/onboarding"),
    async () => {
      const { process } = await getOnboardingData();
      return new Date(process.data.dateOfBirth);
    }
  );

  return (
    <HeaderLayout
      headerProps={{
        title: t("Edit Profile"),
      }}
      containerProps={{ marginHorizontal: space.defaultLayoutSpacing }}
    >
      {isValidating ? (
        <Loading />
      ) : (
        <VStack space="4" flex="1">
          <ImagePicker
            defaultImageUrl={
              player.profilePicture
                ? formatFileUrl(player.profilePicture)
                : undefined
            }
            controllerProps={{
              control,
              name: "profilePicture",
              rules: {
                required: getInputIsRequired<PlayerUpdateProfileForm>(
                  def,
                  "profilePicture",
                  UpdateProfileStepId.PlayerInfo
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
                    getInputIsRequired<PlayerUpdateProfileForm>(
                      def,
                      "firstName",
                      UpdateProfileStepId.PlayerInfo
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
                    getInputIsRequired<PlayerUpdateProfileForm>(
                      def,
                      "lastName",
                      UpdateProfileStepId.PlayerInfo
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
                fontSize: "xs",
                lineHeight: "lg",
              }}
            >
              {`${t("Email")}*`}
            </FormControl.Label>
            <Text color="rs.black" fontSize="md">
              {player.email}
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
                    getInputIsRequired<PlayerUpdateProfileForm>(
                      def,
                      "mobile",
                      UpdateProfileStepId.PlayerInfo
                    ) && `${t("Mobile")} ${t("is required")}`,
                },
              }}
            />
          </HStack>
          {/* Level & ranking */}

          <HStack flex="1">
            <FormInput
              label={t("Level")}
              controllerProps={{
                name: "levelText",
                control,
                rules: {
                  required:
                    getInputIsRequired<PlayerUpdateProfileForm>(
                      def,
                      "level",
                      UpdateProfileStepId.PlayerInfo
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
                    getInputIsRequired<PlayerUpdateProfileForm>(
                      def,
                      "ranking",
                      UpdateProfileStepId.PlayerInfo
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
                    getInputIsRequired<PlayerUpdateProfileForm>(
                      def,
                      "startYearAsPlayer",
                      UpdateProfileStepId.PlayerInfo
                    ) && `${t("Start Year")} ${t("is required")}`,
                  validate: {
                    withInRange: (v) => {
                      if (v) {
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
                    getInputIsRequired<PlayerUpdateProfileForm>(
                      def,
                      "style",
                      UpdateProfileStepId.PlayerInfo
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
          {/* Forehand backhand */}

          <HStack flex="1">
            <FormInput
              label={t("Rubber")}
              controllerProps={{
                name: "rubberText",
                control,
                rules: {
                  required:
                    getInputIsRequired<PlayerUpdateProfileForm>(
                      def,
                      "rubber",
                      UpdateProfileStepId.PlayerInfo
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
                    getInputIsRequired<PlayerUpdateProfileForm>(
                      def,
                      "backRubber",
                      UpdateProfileStepId.PlayerInfo
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
                  getInputIsRequired<PlayerUpdateProfileForm>(
                    def,
                    "hkttaId",
                    UpdateProfileStepId.PlayerInfo
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
                  getInputIsRequired<PlayerUpdateProfileForm>(
                    def,
                    "achievements",
                    UpdateProfileStepId.PlayerInfo
                  ) && `${t("Achievements")} ${t("is required")}`,
              },
            }}
            buttonLabel={t("Add achievement")}
            inputProps={{ multiline: true }}
          />
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
      )}

      <SingleSelectModal
        confirmButtonText={t("Confirm")}
        isOpen={stylePicker}
        onClose={() => setStylePickerOpen(false)}
        title={`${t("Select")}${t("Style")}`}
        options={styleOptions}
        controllerProps={{
          name: "style",
          control,
        }}
      />

      <SingleSelectModal
        confirmButtonText={t("Confirm")}
        isOpen={bladePicker}
        onClose={() => setBladePickerOpen(false)}
        title={t("Select Blade")}
        options={bladeOptions}
        controllerProps={{
          name: "blade",
          control,
        }}
      />
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
        options={levelOptions}
        controllerProps={{
          name: "level",
          control,
        }}
      />
    </HeaderLayout>
  );
}
