import React, { useCallback, useEffect, useMemo, useState } from "react";
import { Box, Button, Heading, Text, useTheme, VStack } from "native-base";
import { useForm } from "react-hook-form";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { CompositeNavigationProp, RouteProp } from "@react-navigation/native";
import { BottomTabNavigationProp } from "@react-navigation/bottom-tabs";
import { addDays, isPast, parseISO, isValid as isDateValid } from "date-fns";
import HeaderLayout from "../../../components/Layout/HeaderLayout";
import FormInput from "../../../components/FormInput/FormInput";
import OneColumnPickerModal from "../../../components/Modal/OneColumnPickerModal";
import ThreeColumnPickerModal from "../../../components/Modal/ThreeColumnPickerModal";
import RangeSlider from "../../../components/RangeSlider/RangeSlider";
import getArea from "../../../constants/Area";
import getDistricts from "../../../constants/Districts";
import {
  dateList,
  hourList,
  minuteList,
  monthList,
  getPeriod,
  yearList,
} from "../../../constants/Time";
import {
  COACH_FILTER_MAX_PRICE,
  COACH_FILTER_MIN_PRICE,
} from "../../../constants/Price";
import DownArrowIcon from "../../../components/Icons/DownArrowIcon";
import { AreaCode } from "../../../models/Request";
import { createO3Meetup, submitO3Meetup } from "../../../services/O3Services";
import {
  MainStackNavigatorParamList,
  PlayerBottomTabNavigatorParamList,
} from "../../../routers/Types";
import {
  CreateO3Request,
  SubmitO3Request,
} from "../../../models/requests/O3Request";
import FormSwitch from "../../../components/Switch/FormSwitch";
import { getTranslation } from "../../../utils/translation";
import {
  formatDateTimeToTimezone,
  getDefaultEndTimeByStartTime,
  validateIsPast,
  validateTimeRange,
} from "../../../utils/date";
import { isBlank, isPositiveNumber } from "../../../utils/strings";
import { showApiToastError } from "../../../components/ApiToastError";
import DateTimePicker from "../../../components/v2/DateTimePicker";
import SliderInput from "../../../components/v2/SliderInput";
import SingleSelectModal from "../../../components/Modal/SingleSelectModal";
import { showApiToastSuccess } from "../../../components/ApiToastSuccess";
import TimePicker from "../../../components/v2/TimePicker";

interface FormValue {
  area: string;
  areaText: string | null;
  district: string;
  districtText: string | null;
  date: string;
  from: string;
  to: string;
  min: number;
  max: number;
  venue?: string;
  isProvideVenue: boolean;
  price: number[];
  proposedFee: string;
}

export type PlayerO3SubmitRequestNavigationProp = CompositeNavigationProp<
  NativeStackNavigationProp<
    MainStackNavigatorParamList,
    "PlayerO3SubmitRequest"
  >,
  BottomTabNavigationProp<PlayerBottomTabNavigatorParamList>
>;

export type PlayerO3SubmitRequestRouteProp = RouteProp<
  MainStackNavigatorParamList,
  "PlayerO3SubmitRequest"
>;

interface PlayerO3SubmitRequestScreenProps {
  navigation: PlayerO3SubmitRequestNavigationProp;
  route: PlayerO3SubmitRequestRouteProp;
}

const t = getTranslation([
  "constant.area",
  "constant.district",
  "screen.PlayerScreens.O3SubmitRequest",
  "constant.button",
  "validation",
  "formInput",
]);

export default function PlayerO3SubmitRequest({
  navigation,
  route,
}: PlayerO3SubmitRequestScreenProps) {
  const period = useMemo(() => {
    return getPeriod();
  }, []);
  const area = useMemo(() => {
    return getArea();
  }, []);
  const districts = useMemo(() => {
    return getDistricts();
  }, []);
  const { space } = useTheme();
  const {
    control,
    handleSubmit,
    formState: { isValid, isSubmitting },
    watch,
    setValue,
    trigger,
    unregister,
    resetField,
  } = useForm<FormValue>({
    mode: "onChange",
    defaultValues: {
      price: [COACH_FILTER_MIN_PRICE, COACH_FILTER_MAX_PRICE],
    },
  });
  const areaValue = watch("area");
  const districtValue = watch("district");
  const minPrice = watch("min");
  const maxPrice = watch("max");
  const date = watch("date");
  const fromTime = watch("from");
  const toTime = watch("to");
  const isProvideVenue = watch("isProvideVenue");
  const today = new Date();
  const [districtList, setDistrictList] = useState<
    { label: string; value: string }[]
  >([]);
  const [defaultDate, setDefaultDate] = React.useState("");
  const processSubmit = async (formValue: FormValue) => {
    if (
      route.params.selectedCoachId &&
      route.params.isSubmitO3RequestWithSelectedCoach &&
      route.params.isSubmitO3RequestWithSelectedCoach === true
    ) {
      const payload: SubmitO3Request = {
        coachId: route.params.selectedCoachId,
        area: formValue.area as AreaCode,
        district: formValue.district,
        fromTime: formatDateTimeToTimezone(
          `${formValue.date} ${formValue.from}`
        ),
        endTime: formatDateTimeToTimezone(`${formValue.date} ${formValue.to}`),
        venue: formValue.venue,
        proposedFee: formValue.proposedFee,
      };
      const o3 = await submitO3Meetup(payload);
      navigation.navigate("PlayerO3AppliedCoachDetails", {
        o3,
        isForceBackToPlayerMeetupList: true,
      });
    } else {
      const payload: CreateO3Request = {
        area: formValue.area as AreaCode,
        district: formValue.district,
        fromTime: formatDateTimeToTimezone(
          `${formValue.date} ${formValue.from}`
        ),
        endTime: formatDateTimeToTimezone(`${formValue.date} ${formValue.to}`),
        minTuitionFee: formValue.price[0],
        maxTuitionFee: formValue.price[1],
        venue: formValue.venue,
      };
      await createO3Meetup(payload);
      navigation.goBack();
    }
  };

  const shouldShowProposedFeeInput =
    route.params.selectedCoachId &&
    route.params.isSubmitO3RequestWithSelectedCoach &&
    route.params.isSubmitO3RequestWithSelectedCoach;

  const setArea = useCallback(
    (newArea: string) => {
      const newLabel = area.reduce<string | null>((ret, val) => {
        if (val.value === newArea) {
          return val.label;
        }
        return ret;
      }, null);
      setValue("areaText", newLabel, { shouldDirty: !!newLabel });
      setValue("area", newArea, { shouldDirty: !!newLabel });
      if (!newLabel) {
        resetField("districtText");
        resetField("district");
      }
    },
    [area, resetField, setValue]
  );

  const setDistrict = useCallback(
    (newDistrict: string) => {
      if (areaValue) {
        const newLabel = districts[areaValue].reduce<string | null>(
          (ret, val) => {
            if (val.value === newDistrict) {
              return val.label;
            }
            return ret;
          },
          null
        );
        setValue("districtText", newLabel, {
          shouldDirty: !!newLabel,
        });
        setValue("district", newDistrict, {
          shouldDirty: !!newLabel,
        });
      }
    },
    [districts, areaValue, setValue]
  );

  const [isOpen, setIsOpen] = useState({
    area: false,
    district: false,
    date: false,
    from: false,
    to: false,
  });

  useEffect(() => {
    if (fromTime) {
      if (!toTime) {
        setValue("to", getDefaultEndTimeByStartTime(fromTime));
        trigger("to");
      }
      trigger("from");
    }
  }, [fromTime, toTime, setValue, trigger]);

  useEffect(() => {
    setArea(areaValue);
    setDistrictList(areaValue in districts ? districts[areaValue] : []);
  }, [districts, areaValue, setArea]);

  useEffect(() => {
    setDistrict(districtValue);
  }, [districtValue, setDistrict]);

  useEffect(() => {
    if (date && fromTime) trigger("from");
  }, [date, fromTime, trigger]);

  useEffect(() => {
    if (!isProvideVenue) {
      unregister("venue");
    }
  }, [isProvideVenue, unregister]);

  useEffect(() => {
    if (minPrice && maxPrice) {
      trigger("max");
      trigger("min");
    }
  }, [minPrice, maxPrice, trigger]);

  return (
    <HeaderLayout
      isSticky
      headerProps={{
        title: t("Find coaches"),
        containerStyle: { marginHorizontal: 0 },
      }}
      containerProps={{
        marginHorizontal: space.defaultLayoutSpacing,
      }}
    >
      <VStack space="2" flex="1">
        {/* Location components */}
        <Heading size="md">{t("Location")}</Heading>
        <FormInput
          label={t("Area")}
          controllerProps={{
            name: "areaText",
            control,
            rules: { required: t("is required") },
          }}
          inputProps={{
            editable: false,
            InputRightElement: <DownArrowIcon mr="4" />,
          }}
          onPress={() => {
            setIsOpen((prev) => ({ ...prev, area: true }));
          }}
        />
        <SingleSelectModal
          isOpen={isOpen.area}
          onClose={() => {
            setIsOpen((prev) => ({ ...prev, area: false }));
          }}
          title={`${t("Select")}${t("Area")}`}
          buttonLabel={t("Confirm")}
          options={area}
          controllerProps={{
            name: "area",
            control,
            rules: { required: t("is required") },
          }}
          confirmButtonText={t("Confirm")}
        />
        <FormInput
          label={t("District")}
          controllerProps={{
            name: "districtText",
            control,
            rules: { required: t("is required") },
          }}
          inputProps={{
            editable: false,
            InputRightElement: <DownArrowIcon mr="4" />,
          }}
          onPress={() => {
            setIsOpen((prev) => ({ ...prev, district: true }));
          }}
        />
        {/* <OneColumnPickerModal
          isOpen={isOpen.district}
          onClose={() => {
            setIsOpen((prev) => ({ ...prev, district: false }));
          }}
          headerLabel={`${t("Select")}${t("District")}`}
          buttonLabel={t("Confirm")}
          options={districtList}
          controllerProps={{
            name: "district",
            control,
            rules: { required: t("is required") },
          }}
        /> */}
        <SingleSelectModal
          isOpen={isOpen.district}
          onClose={() => {
            setIsOpen((prev) => ({ ...prev, district: false }));
          }}
          title={`${t("Select")}${t("District")}`}
          confirmButtonText={t("Confirm")}
          options={districtList}
          controllerProps={{
            name: "district",
            control,
            rules: { required: t("is required") },
          }}
        />
        {/* Date components */}
        <Heading size="md">{t("Date")}</Heading>
        <FormInput
          label={t("Meetup date")}
          controllerProps={{
            name: "date",
            control,
            rules: {
              required: t("is required"),
            },
          }}
          inputProps={{
            editable: false,
            InputRightElement: <DownArrowIcon mr="4" />,
          }}
          onPress={() => {
            setIsOpen((prev) => ({ ...prev, date: true }));
          }}
        />
        {/* <ThreeColumnPickerModal
          defaultSelectValues={[
            `${today.getFullYear()}`,
            `${today.getMonth() + 1}`.padStart(2, "0"),
            `${today.getDate() + 1}`.padStart(2, "0"),
          ]}
          isOpen={isOpen.date}
          onClose={() => {
            setIsOpen((prev) => ({ ...prev, date: false }));
          }}
          headerLabel={`${t("Select")}${t("Date")}`}
          concatenator={["-", "-"]}
          options={[yearList, monthList, dateList]}
          controllerProps={{
            name: "date",
            control,
            rules: {
              required: t("is required"),
              validate: {
                isPast: (v) => {
                  return (
                    (isDateValid(parseISO(v)) &&
                      !isPast(addDays(parseISO(v), 1))) ||
                    t("Date should not be in the past")
                  );
                },
              },
            },
          }}
        /> */}
        <DateTimePicker
          title={`${t("Select")}${t("Date")}`}
          isShow={isOpen.date}
          mode="date"
          controllerProps={{
            name: "date",
            control,
            rules: {
              required: t("is required"),
              validate: {
                isPast: (v) => {
                  return (
                    (isDateValid(parseISO(v)) &&
                      !isPast(addDays(parseISO(v), 1))) ||
                    t("Date should not be in the past")
                  );
                },
              },
            },
          }}
          onClose={() => {
            setIsOpen((prev) => ({ ...prev, date: false }));
          }}
          onDefaultDate={(value) => {
            setDefaultDate(value);
          }}
          defaultDate={defaultDate}
        />

        {/* Time components */}
        <Heading size="md">{t("Time")}</Heading>
        <FormInput
          label={t("From")}
          controllerProps={{
            name: "from",
            control,
            rules: {
              required: t("is required"),
              validate: {
                withInRange: (v) => {
                  if (v && toTime) {
                    return (
                      validateTimeRange(v, toTime) ||
                      t("from time must be earlier than the to time")
                    );
                  }
                },
                isPast: (v) => {
                  if (v) {
                    return (
                      !validateIsPast(date, v) ||
                      t("from time should not be in the past")
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
          onPress={() => {
            setIsOpen((prev) => ({ ...prev, from: true }));
          }}
        />
        <TimePicker
          isOpen={isOpen.from}
          onClose={() => {
            setIsOpen((prev) => ({ ...prev, from: false }));
          }}
          headerLabel={`${t("Select")}${t("Start Time")}`}
          options={[hourList, minuteList, period]}
          concatenator={[":", " "]}
          controllerProps={{
            name: "from",
            control,
            rules: { required: t("is required") },
          }}
        />
        <FormInput
          label={t("To")}
          controllerProps={{
            name: "to",
            control,
            rules: {
              required: t("is required"),
            },
          }}
          inputProps={{
            editable: false,
            InputRightElement: <DownArrowIcon mr="4" />,
          }}
          onPress={() => {
            setIsOpen((prev) => ({ ...prev, to: true }));
          }}
        />
        <TimePicker
          isOpen={isOpen.to}
          onClose={() => {
            setIsOpen((prev) => ({ ...prev, to: false }));
          }}
          headerLabel={`${t("Select")}${t("End Time")}`}
          options={[hourList, minuteList, period]}
          concatenator={[":", " "]}
          controllerProps={{
            name: "to",
            control,
            rules: {
              required: t("is required"),
              validate: {
                withInRange: (v) => {
                  if (v && fromTime) {
                    return (
                      validateTimeRange(fromTime, v) ||
                      t("from time must be earlier than the to time")
                    );
                  }
                },
              },
            },
          }}
        />
        {/* Price components */}
        <Heading size="md">{t("Price")}</Heading>
        {shouldShowProposedFeeInput ? (
          <FormInput
            label={t("Price")}
            controllerProps={{
              name: "proposedFee",
              control,
              rules: { required: shouldShowProposedFeeInput },
            }}
            inputProps={{ keyboardType: "numeric" }}
          />
        ) : (
          <>
            <Heading size="md" mt={1}>
              {COACH_FILTER_MIN_PRICE} {t("HKD")} - {COACH_FILTER_MAX_PRICE}{" "}
              {t("HKD")}
            </Heading>
            <SliderInput
              min={COACH_FILTER_MIN_PRICE}
              max={COACH_FILTER_MAX_PRICE}
              shouldShowInput
              controllerProps={{
                name: "price",
                control,
                rules: {
                  required: !shouldShowProposedFeeInput,
                },
              }}
            />
          </>
        )}

        <VStack mb="defaultLayoutSpacing">
          <FormSwitch
            title={t("Do vou have a venue?")}
            onText={t("Yes")}
            offText={t("No")}
            controllerProps={{
              name: "isProvideVenue",
              control,
            }}
          />
          <Text mb="2" color="rs.inputLabel_grey">
            {isProvideVenue
              ? t("Provide venue address here")
              : t(
                  "Suggest you to book the venue beforehead You ultimatelv need to do so if the coach did book the venue neither"
                )}
          </Text>
          {isProvideVenue && (
            <FormInput
              label=""
              controllerProps={{
                name: "venue",
                control,
                rules: { required: isProvideVenue && t("is required") },
              }}
              inputProps={{
                multiline: true,
              }}
            />
          )}
        </VStack>

        <Button
          style={{ marginTop: "auto" }}
          isDisabled={!isValid}
          isLoading={isSubmitting}
          isLoadingText={t("Loading")}
          onPress={handleSubmit(
            async (val) => {
              try {
                await processSubmit(val as FormValue);
                showApiToastSuccess({
                  title: t("Submited"),
                  body: t("You have submited a meetup request"),
                });
              } catch (e) {
                showApiToastError(e);
              }
            },
            (e) => console.log("fail, value: ", e)
          )}
        >
          {t("Confirm")}
        </Button>
      </VStack>
    </HeaderLayout>
  );
}
