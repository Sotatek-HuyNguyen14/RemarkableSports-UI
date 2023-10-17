import React, { useEffect, useMemo, useState } from "react";
import { HStack, Heading, Pressable, Text, VStack } from "native-base";
import { useForm } from "react-hook-form";
import { AddCourseSessionModel } from "../AddCourse/AddSessionComponent";
import { getTranslation } from "../../utils/translation";
import DownArrowIcon from "../../components/Icons/DownArrowIcon";
import { isBlank } from "../../utils/strings";
import SingleSelectModal from "../../components/Modal/SingleSelectModal";
import DateTimePicker from "../../components/v2/DateTimePicker";
import TimePicker from "../../components/v2/TimePicker";
import { getPeriod, hourList, minuteList } from "../../constants/Time";
import AddCoachComponent, {
  AssistantCoachModel,
} from "../AddCourse/AddCoachComponent";
import FormSwitch from "../../components/Switch/FormSwitch";
import FormInput from "../../components/FormInput/FormInput";

interface CourseSessionItemProps {
  session: AddCourseSessionModel;
  shouldShowAssignedCoach?: boolean;
  coachOptions: { label: string; value: string }[];
  onEditSession: (session: AddCourseSessionModel, group: number) => void;
  onRemoveSession: (session: AddCourseSessionModel) => void;
  shouldShowAddAssistantCoaches?: boolean;
  isSessionRemoved?: boolean;
}

const t = getTranslation([
  "screen.AddCourseSession",
  "component.AddSessionComponent",
  "constant.eventType",
  "constant.button",
  "formInput",
  "toastMessage",
]);

interface ScreenFormValue {
  componentStartDate: string;
  componentEndDate: string;
  componentStartTime: string;
  componentEndTime: string;
  componentDate: string;
  isEdited: boolean;
  componentAssignedCoach: string;
  isHeadCoachCustomizedPrice: boolean;
  headCoachCustomizedPrice: string;
}

export default function CourseSessionItem({
  session,
  shouldShowAssignedCoach,
  shouldShowAddAssistantCoaches,
  coachOptions,
  onEditSession,
  onRemoveSession,
  isSessionRemoved = false,
}: CourseSessionItemProps) {
  const getAssignedCoachNameForSession = (s: AddCourseSessionModel) => {
    const foundCoach = coachOptions.filter(
      (coach) => coach.value === s.assignedCoach
    )[0];
    if (foundCoach && !isBlank(foundCoach.label)) {
      return foundCoach.label;
    }
    return "";
  };

  const [isOpen, setIsOpen] = useState({
    courseFrom: false,
    courseTo: false,
    durationFrom: false,
    durationTo: false,
    date: false,
    assignedCoach: false,
  });

  const period = useMemo(() => {
    return getPeriod();
  }, []);

  const { control, watch, handleSubmit, setValue } = useForm<ScreenFormValue>({
    mode: "onChange",
    defaultValues: {
      headCoachCustomizedPrice: session.isAssignedCoachCustomizePrice
        ? session.assignedCoachPrice.toString()
        : "",
      isHeadCoachCustomizedPrice:
        session.isAssignedCoachCustomizePrice || false,
    },
  });

  const date = watch("componentDate");

  const dateStartTimeEndTimePickers = () => {
    return (
      <VStack>
        <TimePicker
          isOpen={isOpen.courseFrom}
          onCloseWithValue={(value) => {
            setIsOpen((prev) => ({ ...prev, courseFrom: false }));
            // Start editing the start time
            const selectedSession = session;
            selectedSession.startTime = value;
            onEditSession(selectedSession, selectedSession.group);
          }}
          onClose={() => {
            setIsOpen((prev) => ({ ...prev, courseFrom: false }));
          }}
          headerLabel={t("Select start time")}
          options={[hourList, minuteList, period]}
          concatenator={[":", " "]}
          controllerProps={{
            name: "componentStartTime",
            control,
          }}
        />
        <TimePicker
          onClose={() => {
            setIsOpen((prev) => ({ ...prev, courseTo: false }));
          }}
          isOpen={isOpen.courseTo}
          onCloseWithValue={(value) => {
            const selectedSession = session;
            selectedSession.endTime = value;
            onEditSession(selectedSession, selectedSession.group);
            setIsOpen((prev) => ({ ...prev, courseTo: false }));
          }}
          headerLabel={t("Select end time")}
          options={[hourList, minuteList, period]}
          concatenator={[":", " "]}
          controllerProps={{
            name: "componentEndTime",
            control,
          }}
        />
        <DateTimePicker
          title={t("Select Date")}
          isShow={isOpen.date}
          mode="date"
          controllerProps={{
            name: "componentDate",
            control,
          }}
          onClose={() => {
            setIsOpen((prev) => ({ ...prev, date: false }));
          }}
          onCloseWithValue={() => {
            setIsOpen((prev) => ({ ...prev, date: false }));
            // Start editing the date
            const selectedSession = session;
            selectedSession.date = date;
            onEditSession(selectedSession, selectedSession.group);
          }}
        />
        <SingleSelectModal
          isOpen={isOpen.assignedCoach}
          onCloseWithValue={(value) => {
            setIsOpen((prev) => ({ ...prev, assignedCoach: false }));

            if (value === "") return false;

            // Start editing the assinged coach
            const selectedSession = session;
            selectedSession.assignedCoach = value;
            onEditSession(selectedSession, selectedSession.group);
          }}
          title={t("Select coach")}
          options={coachOptions.filter((option) => {
            return (
              option.value !== session.assignedCoach &&
              !session.assistantCoaches
                .map((coach) => coach.coachId)
                .includes(option.value)
            );
          })}
          controllerProps={{
            name: "componentAssignedCoach",
            control,
          }}
          confirmButtonText={t("Confirm")}
        />
      </VStack>
    );
  };

  const isHeadCoachCustomizedPrice = watch("isHeadCoachCustomizedPrice");
  const headCoachCustomizedPrice = watch("headCoachCustomizedPrice");
  return (
    <VStack space="2" mt="3">
      {/* Date */}
      <Pressable
        disabled={isSessionRemoved}
        onPress={() => {
          setValue("componentDate", session.date);
          setIsOpen((prev) => ({ ...prev, date: true }));
        }}
      >
        <HStack
          bgColor={isSessionRemoved ? "#00000010" : "rs.white"}
          shadow={isSessionRemoved ? "none" : "9"}
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
            <Text
              color={isSessionRemoved ? "gray.500" : "#B3B6B8"}
              fontSize="xs"
            >
              {t("Date")}
            </Text>
            <Text fontSize="md">{session.date}</Text>
          </VStack>
          {!isSessionRemoved && <DownArrowIcon mr="2" />}
        </HStack>
      </Pressable>
      {/* Start Time */}
      <Pressable
        disabled={isSessionRemoved}
        onPress={() => {
          setValue("componentStartTime", session.startTime);
          setIsOpen((prev) => ({ ...prev, courseFrom: true }));
        }}
      >
        <HStack
          bgColor={isSessionRemoved ? "#00000010" : "rs.white"}
          shadow={isSessionRemoved ? "none" : "9"}
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
            <Text
              color={isSessionRemoved ? "gray.500" : "#B3B6B8"}
              fontSize="xs"
            >
              {t("Start Time")}
            </Text>
            <Text fontSize="md">{session.startTime}</Text>
          </VStack>
          {!isSessionRemoved && <DownArrowIcon mr="2" />}
        </HStack>
      </Pressable>
      {/* End Time */}
      <Pressable
        disabled={isSessionRemoved}
        onPress={() => {
          setValue("componentEndTime", session.endTime);
          setIsOpen((prev) => ({ ...prev, courseTo: true }));
        }}
      >
        <HStack
          bgColor={isSessionRemoved ? "#00000010" : "rs.white"}
          shadow={isSessionRemoved ? "none" : "9"}
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
            <Text
              color={isSessionRemoved ? "gray.500" : "#B3B6B8"}
              fontSize="xs"
            >
              {t("End Time")}
            </Text>
            <Text fontSize="md">{session.endTime}</Text>
          </VStack>
          {!isSessionRemoved && <DownArrowIcon mr="2" />}
        </HStack>
      </Pressable>
      {/* Assigned coach */}
      {shouldShowAssignedCoach && !isSessionRemoved && (
        <VStack>
          <Heading> {t("Assigned coach")}</Heading>
          <Text mb="2" mt="2" fontSize="md">
            {t("Head Coach")}
          </Text>
          <Pressable
            onPress={() => {
              setIsOpen((prev) => ({ ...prev, assignedCoach: true }));
            }}
            mb="2"
          >
            <HStack
              bgColor="rs.white"
              shadow={isSessionRemoved ? "none" : "9"}
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
                  {t("Head coach name")}
                </Text>
                <Text fontSize="md">
                  {getAssignedCoachNameForSession(session)}
                </Text>
              </VStack>
              <DownArrowIcon mr="2" />
            </HStack>
          </Pressable>
          <FormSwitch
            styleForm="style2"
            title={t("Customized Price")}
            onText=""
            offText=""
            controllerProps={{
              name: "isHeadCoachCustomizedPrice",
              control,
            }}
          />
          {isHeadCoachCustomizedPrice && (
            <FormInput
              inputProps={{
                keyboardType: "numeric",
              }}
              containerProps={{
                style: {
                  borderWidth: 0.7,
                  borderRadius: 16,
                },
              }}
              label={t("Customized Price")}
              controllerProps={{
                name: "headCoachCustomizedPrice",
                control,
              }}
              onBlur={() => {
                const newValue = session;
                newValue.assignedCoachPrice = headCoachCustomizedPrice;
                newValue.isAssignedCoachCustomizePrice = true;
                onEditSession(newValue, newValue.group);
              }}
            />
          )}
          {shouldShowAddAssistantCoaches && (
            <AddCoachComponent
              onUpdateAssistantCoaches={(newValue) => {
                const newSession = session;
                newSession.assistantCoaches = newValue;
                onEditSession(newSession, newSession.group);
              }}
              coachOptions={coachOptions.filter(
                (c) => c.value !== session.assignedCoach
              )}
              assistantCoaches={session.assistantCoaches}
            />
          )}
        </VStack>
      )}

      {/* Remove session button */}
      {!isSessionRemoved && (
        <Pressable
          borderWidth="1"
          borderColor="#E71010"
          justifyContent="center"
          alignItems="center"
          py="2"
          borderRadius="2xl"
          onPress={() => {
            onRemoveSession(session);
          }}
        >
          <Text fontSize="md" fontWeight="bold" color="#E71010">
            {t("Remove")}
          </Text>
        </Pressable>
      )}
      {dateStartTimeEndTimePickers()}
    </VStack>
  );
}
