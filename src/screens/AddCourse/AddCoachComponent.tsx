import { isFuture, parseISO } from "date-fns";
import {
  Button,
  Heading,
  HStack,
  Pressable,
  Switch,
  Text,
  useTheme,
  VStack,
  Input,
  PresenceTransition,
} from "native-base";
import React, {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { useForm } from "react-hook-form";
import DaysOfWeekComponent from "../../components/DaysOfWeekComponent";
import FormInput from "../../components/FormInput/FormInput";
import DownArrowIcon from "../../components/Icons/DownArrowIcon";
import SingleSelectModal from "../../components/Modal/SingleSelectModal";
import FormSwitch from "../../components/Switch/FormSwitch";
import DateTimePicker from "../../components/v2/DateTimePicker";
import TimePicker from "../../components/v2/TimePicker";
import { getPeriod, hourList, minuteList } from "../../constants/Time";
import { DaysOfWeek } from "../../models/Response";
import { isBlank } from "../../utils/strings";
import { getTranslation } from "../../utils/translation";
import RoundedBlackCrossIcon from "../../components/Icons/RoundedBlackCrossIcon";

export interface FormValue {
  selectedAssistantCoachId: string;
}

const t = getTranslation([
  "screen.AddCourseSession",
  "component.AddSessionComponent",
  "constant.eventType",
  "constant.button",
  "formInput",
  "toastMessage",
  "component.AddCoachComponent",
]);

interface CoachPriceInputProps {
  onBlur: (text: string) => void;
  defaultValue: string;
  shouldShowRightElement: boolean;
}
function CoachPriceInput({
  onBlur,
  defaultValue,
  shouldShowRightElement,
}: CoachPriceInputProps) {
  const [content, setContent] = useState(defaultValue || "");
  return (
    <Input
      keyboardType="numeric"
      mr="defaultLayoutSpacing"
      onChangeText={(text) => {
        // Update the value of toggle
        setContent(text);
      }}
      onBlur={() => {
        onBlur(content);
      }}
      value={content}
      borderWidth="0"
      _focus={{ borderColor: "rs.white" }}
      flex="1"
      w="100%"
      InputRightElement={
        shouldShowRightElement ? (
          <VStack
            alignItems="flex-end"
            justifyContent="space-between"
            alignSelf="flex-start"
            mr="3.5"
          >
            <Pressable
              pb="4"
              px="1"
              onPress={() => {
                // Clean the coach price

                setContent("");
              }}
            >
              <RoundedBlackCrossIcon />
            </Pressable>
          </VStack>
        ) : undefined
      }
    />
  );
}

export interface AssistantCoachModel {
  coachId: string;
  coachName: string;
  isCustomizePrice: boolean;
  customizePrice: string;
}

interface AddCoachComponentProps {
  assistantCoaches: AssistantCoachModel[];
  coachOptions: { label: string; value: string }[];
  onUpdateAssistantCoaches: (newValue: AssistantCoachModel[]) => void;
}

export default function AddCoachComponent({
  assistantCoaches,
  coachOptions,
  onUpdateAssistantCoaches,
}: AddCoachComponentProps) {
  const [isOpen, setIsOpen] = useState({
    addCoach: false,
    assignCoach: false,
  });
  const [selectedAssistCoachId, setSelectedAssistCoachId] = useState("");
  const [addCoachModal, setAddCoachModal] = useState(false);

  const { control } = useForm<FormValue>({
    mode: "onChange",
  });

  const themes = useTheme();

  const addCoachOptions = assistantCoaches
    ? coachOptions.filter(
        (c) =>
          !assistantCoaches
            .map(
              (alreadyAssignedAssistantCoach) =>
                alreadyAssignedAssistantCoach.coachId
            )
            .includes(c.value)
      )
    : coachOptions;

  const modifyCoachOptions = coachOptions.filter(
    (option) =>
      !assistantCoaches.map((coach) => coach.coachId).includes(option.value)
  );

  return (
    <VStack space="3" mt="3">
      <Text fontSize="lg">{t("Assistant Coach(es)")}</Text>

      {/* Buttons */}
      <HStack space="3" alignItems="center">
        <Pressable
          onPress={() => {
            setAddCoachModal(true);
          }}
          bg="#66CEE1"
          flex="1"
          borderRadius="2xl"
          p="3"
          justifyContent="center"
          alignItems="center"
        >
          <Text fontSize="md" fontWeight="bold" color="rs.white">
            {t("Add")}
          </Text>
        </Pressable>
        <Pressable
          borderColor="#66CEE1"
          borderWidth="1"
          bg="rs.white"
          flex="1"
          borderRadius="2xl"
          p="3"
          justifyContent="center"
          alignItems="center"
          onPress={() => {
            // Remove a coach
            assistantCoaches.pop();
            onUpdateAssistantCoaches(assistantCoaches);
          }}
        >
          <Text fontSize="md" fontWeight="bold" color="#66CEE1">
            {t("Remove")}
          </Text>
        </Pressable>
      </HStack>

      {/* Assistant coaches */}
      {!!assistantCoaches &&
        Array.isArray(assistantCoaches) &&
        assistantCoaches.length > 0 &&
        assistantCoaches.map((coach, index) => {
          const { coachName } = coach;
          return (
            <VStack space="3">
              {/* Coach name showing */}
              <Pressable
                onPress={() => {
                  setIsOpen((prev) => ({ ...prev, assignCoach: true }));
                  setSelectedAssistCoachId(coach.coachId);
                  console.log(assistantCoaches);
                }}
              >
                <HStack
                  bgColor="rs.white"
                  shadow="9"
                  borderRadius="2xl"
                  style={{
                    shadowOffset: {
                      width: 5,
                      height: 5,
                    },
                    shadowOpacity: 0.1,
                  }}
                  px="3"
                  alignItems="center"
                  justifyContent="space-between"
                  py="3"
                  borderColor="rs.black"
                  borderWidth="0.5"
                >
                  <VStack space="1">
                    <Text color="#B3B6B8" fontSize="xs">
                      {`${t("Assistant Coach")} ${index + 1} ${t("Name")}`}
                    </Text>
                    <Text fontSize="md">{coachName}</Text>
                  </VStack>
                  <DownArrowIcon mr="2" />
                </HStack>
              </Pressable>
              {/* Toggle price */}
              <HStack
                mt="1"
                alignItems="center"
                justifyContent="space-between"
                px="4"
              >
                <Text fontSize="md">{t("Customized Price")}</Text>
                <Switch
                  size="sm"
                  trackColor={{ true: themes.colors.rs.primary_purple }}
                  isChecked={coach.isCustomizePrice}
                  onToggle={() => {
                    // Update the value of toggle
                    const newCoachesArray = assistantCoaches.map((c) =>
                      c.coachId === coach.coachId
                        ? {
                            ...c,
                            isCustomizePrice: !c.isCustomizePrice,
                          }
                        : c
                    );

                    onUpdateAssistantCoaches(newCoachesArray);
                  }}
                />
              </HStack>
              {coach.isCustomizePrice ? (
                <HStack
                  bgColor="rs.white"
                  shadow="9"
                  borderRadius="2xl"
                  style={{
                    shadowOffset: {
                      width: 5,
                      height: 5,
                    },
                    shadowOpacity: 0.1,
                  }}
                  mx="defaultLayoutSpacing"
                  px="3"
                  alignItems="center"
                  justifyContent="space-between"
                  py="2"
                  borderColor="rs.black"
                  borderWidth="0.5"
                  w="90%"
                >
                  <VStack space="1" w="100%" mr="defaultLayoutSpacing">
                    <Text color="#B3B6B8" fontSize="xs">
                      {t("Customized Price")}
                    </Text>
                    <CoachPriceInput
                      defaultValue={coach.customizePrice?.toString() || ""}
                      shouldShowRightElement={coach.isCustomizePrice}
                      onBlur={(text) => {
                        const newCoachesArray = assistantCoaches.map((c) =>
                          c.coachId === coach.coachId
                            ? {
                                ...c,
                                customizePrice: text,
                              }
                            : c
                        );

                        onUpdateAssistantCoaches(newCoachesArray);
                      }}
                    />
                  </VStack>
                </HStack>
              ) : null}
            </VStack>
          );
        })}
      {/* add coach */}
      <SingleSelectModal
        onCloseWithValue={(selectedCoachId) => {
          const selectedCoach = coachOptions.filter(
            (c) => c.value === selectedCoachId
          )[0];
          if (selectedCoach) {
            const newAddedCoach = {
              coachId: selectedCoachId,
              coachName: selectedCoach.label,
              isCustomizePrice: false,
              customizePrice: "",
            };
            const newValue = assistantCoaches
              ? [...assistantCoaches, newAddedCoach]
              : [newAddedCoach];
            onUpdateAssistantCoaches(newValue);
          }
          setAddCoachModal(false);
        }}
        isOpen={addCoachModal}
        onClose={() => {
          setAddCoachModal(false);
        }}
        title={t("Select coach")}
        options={addCoachOptions}
        controllerProps={{
          name: "selectedAssistantCoachId",
          control,
        }}
        confirmButtonText={t("Confirm")}
      />
      {/* modify coach */}
      <SingleSelectModal
        title={t("Select coach")}
        isOpen={isOpen.assignCoach}
        onCloseWithValue={(selectedCoachId) => {
          if (selectedCoachId) {
            const selectedCoachName = coachOptions.filter(
              (option) => option.value === selectedCoachId
            )[0].label;

            const newAssistCoaches = assistantCoaches.map((coach) =>
              coach.coachId === selectedAssistCoachId
                ? {
                    ...coach,
                    coachId: selectedCoachId,
                    coachName: selectedCoachName,
                  }
                : coach
            );

            onUpdateAssistantCoaches(newAssistCoaches);
          }

          setIsOpen((prev) => ({ ...prev, assignCoach: false }));
        }}
        options={modifyCoachOptions}
        controllerProps={{
          name: "selectedAssistantCoachId",
          control,
        }}
        confirmButtonText={t("Confirm")}
      />
    </VStack>
  );
}
