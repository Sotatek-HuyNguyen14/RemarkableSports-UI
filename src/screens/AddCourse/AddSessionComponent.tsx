import { isAfter, isFuture, parseISO } from "date-fns";
import { Button, Heading, HStack, Text, VStack, Input } from "native-base";
import React, { useCallback, useEffect, useMemo, useState } from "react";
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
import AddCoachComponent, { AssistantCoachModel } from "./AddCoachComponent";
import { format12HTo24H, validateTimeRange } from "../../utils/date";

export interface AddCourseSessionModel {
  personalId: string;
  type: string;
  date: string;
  startDate: string;
  endDate: string;
  startTime: string;
  endTime: string;
  daysOfWeek: DaysOfWeek[];
  group: number;
  isEdited: boolean;
  assignedCoach: string;
  assignedCoachPrice: string;
  isAssignedCoachCustomizePrice: boolean;
  assistantCoaches: AssistantCoachModel[];

  // Form Value variable
  isLoopType: boolean;
  isExpand: boolean;
  // If type == Loop we will store the smaller sessions info to this
  childSessions: any[];
  assignedCoachText: string;
  courseSessionId: number;
  courseId: number;
  isExistingData?: boolean;
}

const t = getTranslation(["constant.button", "component.AddSessionComponent"]);

const totalDate = [
  DaysOfWeek.Sunday,
  DaysOfWeek.Monday,
  DaysOfWeek.Tuesday,
  DaysOfWeek.Wednesday,
  DaysOfWeek.Thursday,
  DaysOfWeek.Friday,
  DaysOfWeek.Saturday,
];
interface AddCourseSessionProps {
  onAddSession?: (value: AddCourseSessionModel) => void;
  onEditSession?: (value: AddCourseSessionModel) => void;
  onCancel?: () => void;
  defaultSession?: AddCourseSessionModel;
  isModel?: boolean;
  isEdit?: boolean;
  clubCoachArrays?: { label: string; value: string }[];
  shouldShowAssignedCoach?: boolean;
  shouldShowAddAssistantCoaches?: boolean;
}

const isAbleToProduceChildSessions = (
  startDate: string,
  endDate: string,
  daysOfWeek: DaysOfWeek[]
) => {
  for (
    let d = new Date(startDate);
    d <= new Date(endDate);
    d.setDate(d.getDate() + 1)
  ) {
    // If d is in the selected date of weeks then push the new session with "d"
    const day = d.toLocaleString("en-US", { weekday: "long" }).split(",")[0];

    const sessionDaysOfWeekStr = daysOfWeek
      .map((value) => value.toString())
      .join(" , ");

    if (sessionDaysOfWeekStr.includes(day)) {
      return true;
    }
  }
  return false;
};

export default function AddSessionComponent({
  onAddSession,
  defaultSession,
  onEditSession,
  onCancel,
  isModel = false,
  isEdit = false,
  clubCoachArrays,
  shouldShowAssignedCoach = false,
  shouldShowAddAssistantCoaches = true,
}: AddCourseSessionProps) {
  const {
    control,
    watch,
    handleSubmit,
    resetField,
    setValue,
    reset,
    formState: { isValid, isDirty },
  } = useForm<AddCourseSessionModel>({
    mode: "onSubmit",
    defaultValues: !isEdit
      ? {
          daysOfWeek: [],
          childSessions: [],
          assistantCoaches: [],
        }
      : {
          daysOfWeek: [],
          childSessions: [],
          assistantCoaches: [],
          ...defaultSession,
        },
  });

  const coachOptions = clubCoachArrays || [];
  const [isOpen, setIsOpen] = useState({
    district: false,
    name: false,
    courseFrom: false,
    courseTo: false,
    durationFrom: false,
    durationTo: false,
    level: false,
    coach: false,
    date: false,
    assignedCoach: false,
  });

  const period = useMemo(() => {
    return getPeriod();
  }, []);

  const startTime = watch("startTime");
  const endTime = watch("endTime");
  const startDate = watch("startDate");
  const endDate = watch("endDate");
  const daysOfWeek = watch("daysOfWeek");
  const assignedCoach = watch("assignedCoach");

  const today = new Date().getUTCDay();
  const singleDaysOfWeek = totalDate[today];

  const [assistantCoaches, setAssistantCoaches] = useState<
    AssistantCoachModel[]
  >(defaultSession?.assistantCoaches || []);

  const isDateValid =
    startDate && endDate && isAfter(parseISO(endDate), parseISO(startDate));

  const isTimeValid =
    !startTime ||
    !endTime ||
    (startTime && endTime && validateTimeRange(startTime, endTime));

  const isAssignedCoachCustomizePrice = watch("isAssignedCoachCustomizePrice");
  const assignedCoachView = () => {
    return (
      <VStack mt="3" space="1">
        <Heading>{t("Assigned coach")}</Heading>
        <Text mt="2" mb="2" fontSize="md">
          {t("Head Coach")}
        </Text>
        <HStack mb="4">
          <FormInput
            label={t("Head coach name")}
            controllerProps={{
              name: "assignedCoachText",
              control,
            }}
            inputProps={{
              editable: false,
              InputRightElement: <DownArrowIcon mr="4" />,
            }}
            onPress={() => {
              setIsOpen((prev) => ({ ...prev, assignedCoach: true }));
            }}
          />
        </HStack>
        <FormSwitch
          styleForm="style2"
          title={t("Customized Price")}
          onText=""
          offText=""
          controllerProps={{
            name: "isAssignedCoachCustomizePrice",
            control,
          }}
        />
        {isAssignedCoachCustomizePrice && (
          <FormInput
            inputProps={{ keyboardType: "numeric" }}
            label={t("Customized Price")}
            controllerProps={{
              name: "assignedCoachPrice",
              control,
            }}
          />
        )}
        {shouldShowAddAssistantCoaches && (
          <AddCoachComponent
            onUpdateAssistantCoaches={(newValue) => {
              setAssistantCoaches(newValue);
            }}
            coachOptions={coachOptions.filter((c) => c.value !== assignedCoach)}
            assistantCoaches={assistantCoaches}
          />
        )}
      </VStack>
    );
  };

  const loopType = () => {
    return (
      <VStack space="2">
        <Heading>{t("Date")}</Heading>
        <FormInput
          key="sDateInput"
          label={t("Start Date")}
          controllerProps={{
            name: "startDate",
            control,
          }}
          inputProps={{
            editable: false,
            InputRightElement: <DownArrowIcon mr="4" />,
          }}
          onPress={() => {
            setIsOpen((prev) => ({ ...prev, durationFrom: true }));
          }}
        />
        {!isDateValid && startDate && endDate && (
          <Text color="rs.red" textAlign="center">
            {t("start date must be earlier than the end date")}
          </Text>
        )}
        <FormInput
          key="eDateInput"
          label={t("End Date")}
          controllerProps={{
            name: "endDate",
            control,
          }}
          inputProps={{
            editable: false,
            InputRightElement: <DownArrowIcon mr="4" />,
          }}
          onPress={() => {
            setIsOpen((prev) => ({ ...prev, durationTo: true }));
          }}
        />
        {!isDateValid && startDate && endDate && (
          <Text color="rs.red" textAlign="center">
            {t("start date must be earlier than the end date")}
          </Text>
        )}
        <Heading>{t("Day of Week")}</Heading>
        <DaysOfWeekComponent
          boxProps={{ space: 0 }}
          controllerProps={{
            name: "daysOfWeek",
            control,
          }}
        />
        <Heading>{t("Time")}</Heading>
        <FormInput
          label={t("Start Time")}
          controllerProps={{
            name: "startTime",
            control,
          }}
          inputProps={{
            editable: false,
            InputRightElement: <DownArrowIcon mr="4" />,
          }}
          onPress={() => {
            setIsOpen((prev) => ({ ...prev, courseFrom: true }));
          }}
        />
        {!isTimeValid && (
          <Text color="rs.red" textAlign="center">
            {t("start time must be earlier than the end time")}
          </Text>
        )}
        <FormInput
          label={t("End Time")}
          controllerProps={{
            name: "endTime",
            control,
          }}
          inputProps={{
            editable: false,
            InputRightElement: <DownArrowIcon mr="4" />,
          }}
          onPress={() => {
            setIsOpen((prev) => ({ ...prev, courseTo: true }));
          }}
        />
        {!isTimeValid && (
          <Text color="rs.red" textAlign="center">
            {t("start time must be earlier than the end time")}
          </Text>
        )}
        {shouldShowAssignedCoach && assignedCoachView()}
      </VStack>
    );
  };

  const singleType = () => {
    return (
      <VStack space="2">
        <Heading>{t("Date")}</Heading>
        <FormInput
          key="dateInput"
          label={t("Date")}
          controllerProps={{
            name: "date",
            control,
          }}
          inputProps={{
            editable: false,
            InputRightElement: <DownArrowIcon mr="4" />,
          }}
          onPress={() => {
            setIsOpen((prev) => ({ ...prev, date: true }));
          }}
        />
        <Heading>{t("Time")}</Heading>
        <FormInput
          label={t("Start Time")}
          controllerProps={{
            name: "startTime",
            control,
          }}
          inputProps={{
            editable: false,
            InputRightElement: <DownArrowIcon mr="4" />,
          }}
          onPress={() => {
            setIsOpen((prev) => ({ ...prev, courseFrom: true }));
          }}
        />
        <FormInput
          label={t("End Time")}
          controllerProps={{
            name: "endTime",
            control,
          }}
          inputProps={{
            editable: false,
            InputRightElement: <DownArrowIcon mr="4" />,
          }}
          onPress={() => {
            setIsOpen((prev) => ({ ...prev, courseTo: true }));
          }}
        />
        {shouldShowAssignedCoach && assignedCoachView()}
      </VStack>
    );
  };

  const isLoopType = watch("isLoopType");

  const onSubmitAddSession = (value: AddCourseSessionModel) => {
    let newValue = value;
    if (!isLoopType) {
      newValue = {
        ...newValue,
        daysOfWeek: [singleDaysOfWeek],
      };
    }
    onAddSession?.({ ...newValue, assistantCoaches });
  };

  const onSubmitEditSession = (value: AddCourseSessionModel) => {
    onEditSession?.({ ...value, assistantCoaches });
  };

  const shouldCheckProduceChildSessions = isLoopType
    ? isAbleToProduceChildSessions(startDate, endDate, daysOfWeek)
    : true;

  useEffect(() => {
    if (coachOptions.length > 0 && shouldShowAssignedCoach) {
      if (assignedCoach) {
        setValue(
          "assignedCoachText",
          coachOptions.filter((c) => c.value === assignedCoach)[0].label
        );
      } else {
        setValue("assignedCoachText", "");
      }
    }
  });

  const isAbleToAdd = () => {
    if (isLoopType) {
      return (
        !isBlank(startTime) &&
        !isBlank(endTime) &&
        !isBlank(startDate) &&
        !isBlank(endDate) &&
        (shouldShowAssignedCoach ? !isBlank(assignedCoach) : true) &&
        shouldCheckProduceChildSessions
      );
    }

    const date = watch("date");
    // const startTime = watch("startTime");
    // const endTime = watch("endTime");

    return (
      !isBlank(date) &&
      !isBlank(startTime) &&
      !isBlank(endTime) &&
      (shouldShowAssignedCoach ? !isBlank(assignedCoach) : true)
    );
  };

  const addAndCancelButtons = () => {
    return (
      <VStack space="2">
        {isEdit ? (
          <Button
            flex="1"
            isDisabled={!isAbleToAdd()}
            onPress={handleSubmit(onSubmitEditSession)}
            mt="3"
            h="12"
            fontWeight="bold"
            fontSize="sm"
            p="1"
            borderRadius="2xl"
          >
            {t("Confirm")}
          </Button>
        ) : (
          <Button
            flex="1"
            isDisabled={!isAbleToAdd()}
            onPress={handleSubmit(onSubmitAddSession)}
            mt="3"
            h="12"
            fontWeight="bold"
            fontSize="sm"
            p="1"
            borderRadius="2xl"
          >
            {t("Add")}
          </Button>
        )}
        <Button
          flex="1"
          variant="outline"
          onPress={() => {
            onCancel?.();
          }}
          mt="3"
          h="12"
          fontWeight="bold"
          fontSize="sm"
          p="1"
          borderRadius="2xl"
        >
          {t("Cancel")}
        </Button>
      </VStack>
    );
  };

  const alreadySelectedCoachIds: String[] = [];
  // Should not allow user to assign duplicate head coach
  alreadySelectedCoachIds.push(assignedCoach);
  // Should not allow user to select duplicate assistant coaches
  assistantCoaches.forEach((c) => {
    alreadySelectedCoachIds.push(c.coachId);
  });

  return (
    <VStack space="2">
      {/* Type */}
      <FormSwitch
        // shouldTwoSideLabel
        styleForm="style2"
        title={t("Type")}
        offText={t("Loop")}
        onText={t("Single")}
        controllerProps={{
          name: "isLoopType",
          control,
        }}
      />
      {isLoopType ? loopType() : singleType()}
      {isModel ? (
        addAndCancelButtons()
      ) : (
        <Button
          isDisabled={!isAbleToAdd()}
          onPress={handleSubmit(onSubmitAddSession)}
          mt="3"
          h="12"
          fontWeight="bold"
          fontSize="sm"
          p="1"
          borderRadius="2xl"
        >
          {t("Add")}
        </Button>
      )}
      <TimePicker
        isOpen={isOpen.courseFrom}
        onClose={() => {
          setIsOpen((prev) => ({ ...prev, courseFrom: false }));
        }}
        headerLabel={t("Select start time")}
        options={[hourList, minuteList, period]}
        concatenator={[":", " "]}
        controllerProps={{
          name: "startTime",
          control,
        }}
      />
      <TimePicker
        isOpen={isOpen.courseTo}
        onClose={() => {
          setIsOpen((prev) => ({ ...prev, courseTo: false }));
        }}
        headerLabel={t("Select end time")}
        options={[hourList, minuteList, period]}
        concatenator={[":", " "]}
        controllerProps={{
          name: "endTime",
          control,
        }}
      />
      <DateTimePicker
        title={t("Select Start Date")}
        isShow={isOpen.durationFrom}
        mode="date"
        controllerProps={{
          name: "startDate",
          control,
        }}
        onClose={() => {
          setIsOpen((prev) => ({ ...prev, durationFrom: false }));
        }}
      />
      <DateTimePicker
        title={t("Select End Date")}
        isShow={isOpen.durationTo}
        mode="date"
        controllerProps={{
          name: "endDate",
          control,
        }}
        onClose={() => {
          setIsOpen((prev) => ({ ...prev, durationTo: false }));
        }}
      />
      <DateTimePicker
        title={t("Select Date")}
        isShow={isOpen.date}
        mode="date"
        controllerProps={{
          name: "date",
          control,
        }}
        onClose={() => {
          setIsOpen((prev) => ({ ...prev, date: false }));
        }}
      />
      {shouldShowAssignedCoach && (
        <SingleSelectModal
          isOpen={isOpen.assignedCoach}
          onClose={() => {
            setIsOpen((prev) => ({ ...prev, assignedCoach: false }));
          }}
          title={t("Select coach")}
          options={coachOptions.filter(
            (c) => !alreadySelectedCoachIds.includes(c.value)
          )}
          controllerProps={{
            name: "assignedCoach",
            control,
          }}
          confirmButtonText={t("Confirm")}
        />
      )}
    </VStack>
  );
}
