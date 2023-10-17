import {
  Badge,
  Button,
  Heading,
  HStack,
  Pressable,
  Text,
  VStack,
} from "native-base";
import React, { useEffect, useState } from "react";
import {
  FieldPath,
  FieldValues,
  useFieldArray,
  useForm,
} from "react-hook-form";
import CustomInput from "../../../components/FormInput/CustomInput";
import FormInput, {
  FormInputProps,
} from "../../../components/FormInput/FormInput";
import ChooseIcon from "../../../components/Icons/ChooseIcon";
import DownArrowIcon from "../../../components/Icons/DownArrowIcon";
import RectangleBlueCheckIcon from "../../../components/Icons/RectangleBlueCheckIcon";
import OneColumnPickerModal from "../../../components/Modal/OneColumnPickerModal";
import SingleSelectModal from "../../../components/Modal/SingleSelectModal";
import { MatchPlayer } from "../../../models/responses/League";
import { User } from "../../../models/User";
import { getTranslation } from "../../../utils/translation";

const t = getTranslation(["component.ArrayTeamMemberInput", "constant.button"]);

export enum PlayerInputType {
  Other = "Other",
  Selection = "Selection",
}

export interface PlayerInput {
  name: string;
  sex: string;
  isForeignPlayer: boolean;
  id: string | number;
  type: PlayerInputType;
}

interface ArrayTeamMemberInputProps {
  players: PlayerInput[];
  onChangeValue: (players: PlayerInput[]) => void;
  header: string;
  teamMemberOptions: [
    { label: string; value: string; userId: string | number }
  ];
  userIdData: MatchPlayer[];
}

interface FormValue {
  selectedName: string;
  otherName: string[];
}

export default function ArrayTeamMemberInput({
  onChangeValue,
  players,
  header,
  teamMemberOptions,
  userIdData,
}: ArrayTeamMemberInputProps) {
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
    defaultValues: {
      otherName: [],
    },
  });

  const otherName = watch("otherName");
  useEffect(() => {
    // eslint-disable-next-line no-empty
    if (otherName.filter((name) => name !== undefined)[0]) {
    } else {
      players.forEach((player, index) => {
        if (player.type === PlayerInputType.Other) {
          setValue(`otherName.${player.id}.name`, player.name);
        }
      });
    }
  }, [setValue, otherName, players]);
  const [selectedUserId, setSelectedUserId] = useState<number | null>(null);
  const [showTeamMemberPicker, setShowTeamMemberPicker] = useState(false);
  const makeInputField = (player: PlayerInput, index: number) => {
    const isFemale = player.sex === "Female";
    const isForeign = player.isForeignPlayer;
    const isOtherType =
      player.type === PlayerInputType.Other ||
      player.type === t(PlayerInputType.Other);
    return (
      <Pressable
        key={player.id}
        onPress={() => {
          setSelectedUserId(player.id);
          setShowTeamMemberPicker(true);
        }}
      >
        <VStack space="2">
          <VStack
            shadow="9"
            key={player.id}
            style={{
              shadowOffset: {
                width: 5,
                height: 5,
              },
              shadowOpacity: 0.1,
            }}
            borderColor="rs.white"
            borderRadius="2xl"
            borderWidth="1"
            bgColor="rs.white"
            py="2"
            px="4"
          >
            <HStack justifyContent="space-between" alignItems="center">
              <VStack space="1">
                <Text fontSize="xs" color="gray.500">{`${t("Player")} ${
                  index + 1
                }`}</Text>
                <HStack space="2" justifyContent="center" alignItems="center">
                  <Text>
                    {player.type !== PlayerInputType.Other
                      ? player.name
                      : t("Other")}
                  </Text>
                  {player.sex && player.sex === "Female" && !isOtherType && (
                    <HStack
                      w="4"
                      h="4"
                      borderRadius="full"
                      bg="rs_secondary.orange"
                      justifyContent="center"
                      alignItems="center"
                    >
                      <Text color="rs.white" fontSize="xs">
                        {player.sex.charAt(0)}
                      </Text>
                    </HStack>
                  )}
                </HStack>
              </VStack>
              <DownArrowIcon size="sm" />
            </HStack>
          </VStack>

          {isOtherType && (
            <VStack p="2" space="3">
              <FormInput
                onChangeText={(value) => {
                  const newDataChange = players.map((p) => {
                    if (p.id === player.id) {
                      return {
                        ...p,
                        name: value,
                      };
                    }
                    return p;
                  });
                  onChangeValue(newDataChange);
                }}
                label={`${t("Player")} ${index + 1} ${t("name")}`}
                controllerProps={{
                  control,
                  name: `otherName.${player.id}.name` as TName,
                }}
                {...control.register(`otherName.${player.id}.name` as TName)}
              />
              <HStack space="4">
                <Pressable
                  onPress={() => {
                    const newDataChange = players.map((p) => {
                      if (p.id === player.id) {
                        return {
                          ...p,
                          sex: isFemale ? "Male" : "Female",
                        };
                      }
                      return p;
                    });
                    onChangeValue(newDataChange);
                  }}
                >
                  <HStack space="1" justifyContent="center" alignItems="center">
                    {isFemale ? (
                      <RectangleBlueCheckIcon size="md" />
                    ) : (
                      <ChooseIcon size="md" />
                    )}
                    <Text>{t("Female")}</Text>
                  </HStack>
                </Pressable>

                <Pressable
                  onPress={() => {
                    const newDataChange = players.map((p) => {
                      if (p.id === player.id) {
                        return {
                          ...p,
                          isForeignPlayer: !isForeign,
                        };
                      }
                      return p;
                    });
                    onChangeValue(newDataChange);
                  }}
                >
                  <HStack space="1" justifyContent="center" alignItems="center">
                    {isForeign ? (
                      <RectangleBlueCheckIcon size="md" />
                    ) : (
                      <ChooseIcon size="md" />
                    )}
                    <Text>{t("Foreign Player")}</Text>
                  </HStack>
                </Pressable>
              </HStack>
            </VStack>
          )}
        </VStack>
      </Pressable>
    );
  };

  return (
    <VStack space="3">
      <Heading fontSize="md">{header}</Heading>
      {players.length > 0 &&
        players.map((player, index) => {
          return makeInputField(player, index);
        })}
      <SingleSelectModal
        confirmButtonText={t("Confirm")}
        onChangeValue={(value) => {
          // return 1 userid player 2 other
          if (value === "Other") {
            const newDataChange = players.map((p) => {
              // don't need to translate the type
              if (p.id === selectedUserId) {
                return {
                  ...p,
                  name: value === t("Other") ? p.name : value,
                  type:
                    value === t("Other")
                      ? PlayerInputType.Other
                      : PlayerInputType.Selection,
                  shouldUseDefaultValue: false,
                  userId: null,
                };
              }

              return p;
            });
            onChangeValue(newDataChange);
          } else {
            const findResult = userIdData?.find(
              (val) => val.playerName === value
            );
            const userIdResult = teamMemberOptions.find(
              (p) => p.value === value
            );
            const newDataChange = players.map((p, index) => {
              // don't need to translate the type
              if (p.id === selectedUserId) {
                setValue(`otherName.${p.id}.name`, "");
                return {
                  ...p,
                  name: value,
                  isForeignPlayer: findResult?.isForeign ?? false,
                  sex: findResult?.sex ?? "",
                  type:
                    value === t("Other")
                      ? PlayerInputType.Other
                      : PlayerInputType.Selection,
                  shouldUseDefaultValue: false,
                  userId: userIdResult.userId,
                };
              }

              return p;
            });
            onChangeValue(newDataChange);
          }
        }}
        isOpen={showTeamMemberPicker}
        onClose={() => {
          setShowTeamMemberPicker(false);
        }}
        title={t("Select player")}
        options={teamMemberOptions}
        controllerProps={{
          name: "selectedName",
          control,
          rules: {
            required: true,
          },
        }}
      />
    </VStack>
  );
}
