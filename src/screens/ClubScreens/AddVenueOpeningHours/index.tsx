import React, { useMemo, useState } from "react";
import { Heading, VStack, Text, Divider, Box, Button } from "native-base";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { RouteProp } from "@react-navigation/native";
import { useFieldArray, useForm } from "react-hook-form";
import { AxiosError } from "axios";

import HeaderLayout from "../../../components/Layout/HeaderLayout";
import { getTranslation } from "../../../utils/translation";
import FormInput from "../../../components/FormInput/FormInput";
import { CreateVenueRequest } from "../../../models/requests/Venue";
import { MainStackNavigatorParamList } from "../../../routers/Types";
import FormSwitch from "../../../components/Switch/FormSwitch";
import DaysOfWeek from "../../../constants/DaysOfWeek";
import { hourList, minuteList, getPeriod } from "../../../constants/Time";
import TimePicker from "../../../components/v2/TimePicker";
import DownArrowIcon from "../../../components/Icons/DownArrowIcon";
import { format12HTo24H, validateTimeRange } from "../../../utils/date";
import Loading from "../../../components/Loading";
import { createVenue } from "../../../services/VenueServices";
import { showApiToastError } from "../../../components/ApiToastError";

export type AddVenueOpeningHoursNavigationProp = NativeStackNavigationProp<
  MainStackNavigatorParamList,
  "ClubAddVenueOpeningHours"
>;

type AddVenueOpeningHoursRouteProps = RouteProp<
  MainStackNavigatorParamList,
  "ClubAddVenueOpeningHours"
>;

export interface AddCourseSessionProps {
  route: AddVenueOpeningHoursRouteProps;
  navigation: AddVenueOpeningHoursNavigationProp;
}

const t = getTranslation([
  "constant.area",
  "constant.district",
  "screen.ClubScreens.Venue",
  "constant.button",
  "validation",
  "formInput",
]);

interface FormData extends CreateVenueRequest {
  everydaySameOpeningHours: boolean;
}

export default function ClubAddVenueOpeningHours({
  route,
  navigation,
}: AddCourseSessionProps) {
  const { venue } = route.params;
  const {
    control,
    handleSubmit,
    setValue,
    watch,
    formState: { isValid, isSubmitting, isSubmitSuccessful },
  } = useForm<FormData>({
    mode: "onChange",
    defaultValues: {
      everydaySameOpeningHours: true,
      listVenueOpeningHoursDtos: DaysOfWeek.map((day, idx) => ({
        dayOfWeek: idx,
        openingTime: "",
        closingTime: "",
      })),
    },
  });
  const { fields } = useFieldArray({
    control,
    name: "listVenueOpeningHoursDtos",
  });

  const sameOpeningHours = watch("everydaySameOpeningHours");
  const [timeSingleIsOpen, setTimeSingleIsOpen] = useState({
    from: false,
    to: false,
  });
  const [timeArrayIsOpen, setIsOpen] = useState(
    DaysOfWeek.map((day) => ({
      from: false,
      to: false,
    }))
  );
  const period = useMemo(() => getPeriod(), []);

  const onSubmit = async (value: FormData) => {
    const sameForEveryDay = value.everydaySameOpeningHours;
    const submittedForm: CreateVenueRequest = {
      name: venue.name,
      area: venue.area,
      district: venue.district,
      address: venue.address,
      phoneNo: venue.phoneNo,
      numberOfTables: venue.numberOfTables,
      fee: venue.fee,
      ballsProvided: venue.ballsProvided,
      venueImage: venue.venueImage,
      cancellationPeriod: venue.cancellationPeriod,
      openingTime: format12HTo24H(value.openingTime),
      closingTime: format12HTo24H(value.closingTime),
      sameForEveryDay,
      listVenueOpeningHoursDtos: sameForEveryDay
        ? []
        : value.listVenueOpeningHoursDtos.map((hour) => ({
            ...hour,
            openingTime: format12HTo24H(hour.openingTime),
            closingTime: format12HTo24H(hour.closingTime),
          })),
    };
    console.log(submittedForm);

    try {
      const venueId = await createVenue(submittedForm);
      console.log(submittedForm);

      navigation.navigate("ClubAddVenueSuccess", {
        venueId,
        venueSubmittedDetails: submittedForm,
      });
    } catch (error) {
      const err = error as AxiosError;
      showApiToastError(err);
      console.log(err);
    }
  };

  if (isSubmitting) return <Loading />;

  return (
    <HeaderLayout
      isSticky
      headerProps={{
        title: t("AddVenue"),
      }}
    >
      <VStack mx="defaultLayoutSpacing" space="5">
        <Heading size="sm" mt={2}>
          {t("Opening hours")}
        </Heading>
        <FormSwitch
          title={t("Same time every day")}
          isTitleHeading={false}
          onText={t("No")}
          offText={t("Yes")}
          styleForm="style2"
          controllerProps={{ name: "everydaySameOpeningHours", control }}
        />
        {sameOpeningHours ? (
          <VStack space={3}>
            <FormInput
              label={t("From")}
              inputProps={{
                editable: false,
                InputRightElement: <DownArrowIcon mr="4" />,
              }}
              onPress={() => {
                setTimeSingleIsOpen((prev) => ({ ...prev, from: true }));
              }}
              controllerProps={{
                name: `openingTime`,
                control,
                rules: {
                  required: t("is required"),
                },
              }}
            />
            <FormInput
              label={t("To")}
              inputProps={{
                editable: false,
                InputRightElement: <DownArrowIcon mr="4" />,
              }}
              onPress={() => {
                setTimeSingleIsOpen((prev) => ({ ...prev, to: true }));
              }}
              controllerProps={{
                name: `closingTime`,
                control,
                rules: {
                  required: t("is required"),
                },
              }}
            />
            <TimePicker
              headerLabel={`${t("Select")}${t("Start Time")}`}
              isOpen={timeSingleIsOpen.from}
              onClose={() => {
                setTimeSingleIsOpen((prev) => ({ ...prev, from: false }));
              }}
              options={[hourList, minuteList, period]}
              concatenator={[":", " "]}
              controllerProps={{
                name: `openingTime`,
                control,
                rules: {
                  required: t("is required"),
                  validate: {
                    timeInOrder: (inputTime) => {
                      return (
                        validateTimeRange(inputTime, watch(`closingTime`)) ||
                        t("from time must be earlier than the to time")
                      );
                    },
                  },
                },
              }}
            />
            <TimePicker
              headerLabel={`${t("Select")}${t("End Time")}`}
              isOpen={timeSingleIsOpen.to}
              onClose={() => {
                setTimeSingleIsOpen((prev) => ({ ...prev, to: false }));
              }}
              options={[hourList, minuteList, period]}
              concatenator={[":", " "]}
              controllerProps={{
                name: `closingTime`,
                control,
                rules: {
                  required: t("is required"),
                  validate: {
                    timeInOrder: (inputTime) => {
                      return (
                        validateTimeRange(watch(`openingTime`), inputTime) ||
                        t("from time must be earlier than the to time")
                      );
                    },
                  },
                },
              }}
            />
          </VStack>
        ) : (
          fields.map((day, idx) => (
            <VStack key={day.id} space={3}>
              <VStack>
                <Heading size="sm" color={idx === 6 ? "red.600" : "black"}>
                  {DaysOfWeek[idx]}
                </Heading>
                <Divider mt={2} />
              </VStack>
              <FormInput
                label={t("From")}
                inputProps={{
                  editable: false,
                  InputRightElement: <DownArrowIcon mr="4" />,
                }}
                onPress={() => {
                  setIsOpen((prevHoursArray) =>
                    prevHoursArray?.map((hours, hoursIdx) =>
                      hoursIdx === idx ? { from: true, to: false } : hours
                    )
                  );
                }}
                controllerProps={{
                  name: `listVenueOpeningHoursDtos.${idx}.openingTime`,
                  control,
                  rules: {
                    required: t("is required"),
                  },
                }}
              />
              <FormInput
                label={t("To")}
                inputProps={{
                  editable: false,
                  InputRightElement: <DownArrowIcon mr="4" />,
                }}
                onPress={() => {
                  setIsOpen((prevHoursArray) =>
                    prevHoursArray?.map((hours, hoursIdx) =>
                      hoursIdx === idx ? { from: false, to: true } : hours
                    )
                  );
                }}
                controllerProps={{
                  name: `listVenueOpeningHoursDtos.${idx}.closingTime`,
                  control,
                  rules: {
                    required: t("is required"),
                  },
                }}
              />
              <TimePicker
                headerLabel={`${t("Select")}${t("Start Time")}`}
                isOpen={timeArrayIsOpen[idx].from}
                onClose={() => {
                  setIsOpen((prevHoursArray) =>
                    prevHoursArray?.map((hours, hoursIdx) =>
                      hoursIdx === idx ? { from: false, to: false } : hours
                    )
                  );
                }}
                options={[hourList, minuteList, period]}
                concatenator={[":", " "]}
                controllerProps={{
                  name: `listVenueOpeningHoursDtos.${idx}.openingTime`,
                  control,
                  rules: {
                    required: t("is required"),
                    validate: {
                      timeInOrder: (inputTime) => {
                        return (
                          validateTimeRange(
                            inputTime,
                            watch(
                              `listVenueOpeningHoursDtos.${idx}.closingTime`
                            )
                          ) || t("from time must be earlier than the to time")
                        );
                      },
                    },
                  },
                }}
              />
              <TimePicker
                headerLabel={`${t("Select")}${t("End Time")}`}
                isOpen={timeArrayIsOpen[idx].to}
                onClose={() => {
                  setIsOpen((prevHoursArray) =>
                    prevHoursArray?.map((hours, hoursIdx) =>
                      hoursIdx === idx ? { from: false, to: false } : hours
                    )
                  );
                }}
                options={[hourList, minuteList, period]}
                concatenator={[":", " "]}
                controllerProps={{
                  name: `listVenueOpeningHoursDtos.${idx}.closingTime`,
                  control,
                  rules: {
                    required: t("is required"),
                    validate: {
                      timeInOrder: (inputTime) => {
                        return (
                          validateTimeRange(
                            watch(
                              `listVenueOpeningHoursDtos.${idx}.openingTime`
                            ),
                            inputTime
                          ) || t("from time must be earlier than the to time")
                        );
                      },
                    },
                  },
                }}
              />
            </VStack>
          ))
        )}
        <Button
          isLoading={isSubmitting}
          isLoadingText={t("Loading")}
          isDisabled={!isValid}
          onPress={handleSubmit(onSubmit)}
        >
          {t("Next")}
        </Button>
      </VStack>
    </HeaderLayout>
  );
}
