import React, { useCallback, useEffect, useMemo, useState } from "react";
import {
  Badge,
  Box,
  Button,
  Heading,
  HStack,
  useTheme,
  VStack,
} from "native-base";
import { useForm } from "react-hook-form";
import { Platform } from "react-native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { CompositeNavigationProp, RouteProp } from "@react-navigation/native";
import { BottomTabNavigationProp } from "@react-navigation/bottom-tabs";

import { isFuture, parseISO } from "date-fns";
import useSWR from "swr";
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
  COURSE_FILTER_MAX_PRICE,
  COURSE_FILTER_MIN_PRICE,
} from "../../../constants/Price";
import DownArrowIcon from "../../../components/Icons/DownArrowIcon";
import {
  MainStackNavigatorParamList,
  PlayerBottomTabNavigatorParamList,
} from "../../../routers/Types";
import Level from "../../../constants/Level";
import { getTranslation } from "../../../utils/translation";
import { getDefaultEndTimeByStartTime } from "../../../utils/date";
import { isPositiveNumber } from "../../../utils/strings";
import DateTimePicker from "../../../components/v2/DateTimePicker";
import SliderInput from "../../../components/v2/SliderInput";
import SingleSelectModal from "../../../components/Modal/SingleSelectModal";
import TimePicker from "../../../components/v2/TimePicker";
import { ClubResponse } from "../../../models/responses/Club";
import { formatCoreUrl } from "../../../services/ServiceUtil";
import { getAllClubs } from "../../../services/ClubServices";
import Loading from "../../../components/Loading";
import { DaysOfWeek, PlayerAppliedStatus } from "../../../models/Response";
import DaysOfWeekComponent from "../../../components/DaysOfWeekComponent";
import { getCourses } from "../../../services/CourseServices";
import { showApiToastError } from "../../../components/ApiToastError";

export type PlayerCourseFilteringNavigationProp = CompositeNavigationProp<
  NativeStackNavigationProp<
    MainStackNavigatorParamList,
    "PlayerCourseFiltering"
  >,
  BottomTabNavigationProp<PlayerBottomTabNavigatorParamList>
>;

export type PlayerCourseFilteringRouteProp = RouteProp<
  MainStackNavigatorParamList,
  "PlayerCourseFiltering"
>;

interface PlayerCourseFilteringScreenProps {
  navigation: PlayerCourseFilteringNavigationProp;
  route: PlayerCourseFilteringRouteProp;
}

export interface CourseFilteringFormValues {
  area: string;
  areaText: string | null;
  district: string;
  districtText: string | null;
  fromDate: string;
  toDate: string;
  from: string;
  to: string;
  min: number;
  max: number;
  level: string;
  price: number[];
  levelText: string;
  clubObj: { label: string; value: string };
  clubName: string;
  daysOfWeek: DaysOfWeek[];
  courseName: string;
}

const t = getTranslation([
  "constant.area",
  "constant.district",
  "constant.profile",
  "screen.PlayerScreens.CourseFiltering",
  "constant.button",
  "validation",
  "formInput",
]);

export default function PlayerCourseFiltering({
  route,
  navigation,
}: PlayerCourseFilteringScreenProps) {
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
  const today = new Date();
  let defaultValues: CourseFilteringFormValues | null = null;
  if (route.params) ({ filterValue: defaultValues } = route.params);
  const { control, handleSubmit, watch, setValue, resetField, trigger } =
    useForm<CourseFilteringFormValues>({
      mode: "onChange",
      defaultValues: {
        ...defaultValues,
        clubObj: defaultValues?.clubObj,
        min: defaultValues?.price
          ? defaultValues.price[0]
          : defaultValues?.min
          ? defaultValues.min
          : COURSE_FILTER_MIN_PRICE,
        max: defaultValues?.price
          ? defaultValues.price[1]
          : defaultValues?.max
          ? defaultValues.max
          : COURSE_FILTER_MAX_PRICE,
        price:
          defaultValues?.min && defaultValues.max
            ? [defaultValues.min, defaultValues.max]
            : [COURSE_FILTER_MIN_PRICE, COURSE_FILTER_MAX_PRICE],
        daysOfWeek: defaultValues?.daysOfWeek || [],
      },
    });
  const areaValue = watch("area");
  const districtValue = watch("district");
  const minPrice = watch("min");
  const maxPrice = watch("max");
  const levelValue = watch("level");
  const clubObj = watch("clubObj");

  const [districtList, setDistrictList] = useState<
    { label: string; value: string }[]
  >([]);
  const areaPlaceholder = t("All areas");
  const districtPlaceholder = t("All districts");
  const levelPlaceholder = t("All level");

  const setArea = useCallback(
    (newArea: string) => {
      if (newArea === areaPlaceholder) {
        resetField("district", { defaultValue: null });
        resetField("districtText", { defaultValue: null });
        resetField("area", { defaultValue: null });
        return resetField("areaText", { defaultValue: null });
      }
      if (newArea && newArea !== areaPlaceholder) {
        const newLabel = area.reduce<string | null>((ret, val) => {
          if (val.value === newArea) {
            return val.label;
          }
          return ret;
        }, null);
        setValue("areaText", newLabel, { shouldDirty: !!newLabel });
        setValue("area", newArea, { shouldDirty: !!newLabel });
      }
    },
    [area, areaPlaceholder, resetField, setValue]
  );

  const {
    data: clubList,
    error: clubError,
    isValidating: clubIsValidating,
    mutate: clubMutate,
  } = useSWR<ClubResponse[]>(formatCoreUrl("/club"), getAllClubs);

  const setDistrict = useCallback(
    (newDistrict: string) => {
      if (newDistrict === districtPlaceholder) {
        resetField("district", { defaultValue: null });
        return resetField("districtText", { defaultValue: null });
      }
      if (areaValue && areaValue !== areaPlaceholder) {
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
    [
      districts,
      areaPlaceholder,
      areaValue,
      districtPlaceholder,
      resetField,
      setValue,
    ]
  );

  const [isOpen, setIsOpen] = useState({
    area: false,
    district: false,
    fromDate: false,
    toDate: false,
    from: false,
    to: false,
    courseType: false,
    level: false,
    clubNameModal: false,
  });
  const [defaultDate, setDefaultDate] = React.useState(defaultValues?.fromDate);
  const [clubOptions, setClubOptions] = React.useState<
    { label: string; value: string }[]
  >([]);
  const fromTime = watch("from");
  const toTime = watch("to");

  useEffect(() => {
    if (clubList && clubList.length) {
      const validClubs = clubList.filter((club) => {
        return club.approvalStatus === "Approved";
      });
      if (validClubs && validClubs.length) {
        const localClubs: ClubResponse[] = [];
        validClubs.forEach((club) => {
          getCourses({ clubId: club.id })
            .then((isValidData) => {
              if (isValidData.length) {
                const availableCourses = isValidData.some((course) => {
                  const endTime = parseISO(
                    `${course?.toDate} ${course?.endTime}`
                  );
                  const isOutTime = endTime.getTime() < new Date().getTime();
                  return (
                    course.playerAppliedStatus === PlayerAppliedStatus.Null &&
                    !isOutTime
                  );
                });

                if (availableCourses) {
                  localClubs.push(club);
                }
                const ptions = localClubs.sort((a, b) => a.id - b.id)
                  ? localClubs?.map((localClub) => {
                      return {
                        label: localClub.id,
                        value: localClub.name,
                      };
                    })
                  : [];
                setClubOptions(ptions);
              }
            })
            .catch((e) => showApiToastError(e));
        });
      }
    }
  }, [clubList]);

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
    if (levelValue === levelPlaceholder) {
      return resetField("levelText", { defaultValue: null });
    }
    if (levelValue && levelValue !== levelPlaceholder) {
      setValue("levelText", t(levelValue));
    }
  }, [levelPlaceholder, levelValue, resetField, setValue]);

  useEffect(() => {
    if (levelValue === levelPlaceholder) {
      return resetField("level", { defaultValue: null });
    }
    if (levelPlaceholder) {
      const newLabel = Level.reduce<string | null>((ret, val) => {
        if (val.value === levelValue) {
          return val.label;
        }
        return ret;
      }, null);
      setValue("level", levelValue, { shouldDirty: !!newLabel });
    }
  }, [levelPlaceholder, levelValue, resetField, setValue]);

  useEffect(() => {
    if (minPrice && maxPrice) {
      trigger("max");
      trigger("min");
    }
  }, [minPrice, maxPrice, trigger]);
  useEffect(() => {
    setValue("clubName", clubObj?.value ?? "");
  }, [clubObj, setValue]);

  if (clubIsValidating) {
    return (
      <VStack flex="1" justifyContent="center" alignItems="center">
        <Loading />
      </VStack>
    );
  }

  return (
    <HeaderLayout
      isSticky
      headerProps={{
        title: t("Filter course"),
        containerStyle: { marginHorizontal: 0 },
      }}
      containerProps={{ marginHorizontal: space.defaultLayoutSpacing }}
    >
      <VStack space="2" flex="1">
        {/* Club Name */}
        <Heading size="md">{t("Club Name")}</Heading>
        <FormInput
          label={t("Club Name")}
          controllerProps={{
            name: "clubName",
            control,
          }}
          inputProps={{
            editable: false,
            InputRightElement: <DownArrowIcon mr="4" />,
          }}
          onPress={() => {
            setIsOpen((prev) => ({ ...prev, clubNameModal: true }));
          }}
        />
        {/* Location components */}
        <Heading size="md">{t("Location")}</Heading>
        <FormInput
          label={t("Area")}
          controllerProps={{
            name: "areaText",
            control,
          }}
          inputProps={{
            editable: false,
            InputRightElement: <DownArrowIcon mr="4" />,
          }}
          onPress={() => {
            setIsOpen((prev) => ({ ...prev, area: true }));
          }}
        />
        {/* <OneColumnPickerModal
          isOpen={isOpen.area}
          onClose={() => {
            setIsOpen((prev) => ({ ...prev, area: false }));
          }}
          headerLabel={`${t("Select")}${t("Area")}`}
          buttonLabel={t("Confirm")}
          options={area}
          placeholder={areaPlaceholder}
          controllerProps={{
            name: "area",
            control,
          }}
        /> */}
        <SingleSelectModal
          isOpen={isOpen.area}
          onClose={() => {
            setIsOpen((prev) => ({ ...prev, area: false }));
          }}
          title={`${t("Select")}${t("Area")}`}
          confirmButtonText={t("Confirm")}
          options={area}
          controllerProps={{
            name: "area",
            control,
          }}
        />
        <FormInput
          label={t("District")}
          controllerProps={{
            name: "districtText",
            control,
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
          placeholder={districtPlaceholder}
          controllerProps={{
            name: "district",
            control,
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
          placeholder={districtPlaceholder}
          controllerProps={{
            name: "district",
            control,
          }}
        />
        {/* Date components */}
        <Heading size="md">{t("Date")}</Heading>
        <FormInput
          label={t("Date")}
          controllerProps={{
            name: "fromDate",
            control,
          }}
          inputProps={{
            editable: false,
            InputRightElement: <DownArrowIcon mr="4" />,
          }}
          onPress={() => {
            setIsOpen((prev) => ({ ...prev, fromDate: true }));
          }}
        />
        {/* Day of week */}
        <Heading size="md">{t("Day of week")}</Heading>
        <DaysOfWeekComponent
          controllerProps={{
            name: "daysOfWeek",
            control,
          }}
        />
        {/* <ThreeColumnPickerModal
          defaultSelectValues={[
            `${today.getFullYear()}`,
            `${today.getMonth() + 1}`.padStart(2, "0"),
            `${today.getDate() + 1}`.padStart(2, "0"),
          ]}
          isOpen={isOpen.fromDate}
          onClose={() => {
            setIsOpen((prev) => ({ ...prev, fromDate: false }));
          }}
          headerLabel={`${t("Select")}${t("Date")}`}
          buttonLabel={t("Confirm")}
          concatenator={["-", "-"]}
          options={[yearList, monthList, dateList]}
          controllerProps={{
            name: "fromDate",
            control,
            rules: {
              required: false,
              validate: {
                isFuture: (v) =>
                  !v ||
                  isFuture(parseISO(v)) ||
                  t("Date should be in the future"),
              },
            },
          }}
        /> */}
        <DateTimePicker
          title={`${t("Select")}${t("Date")}`}
          isShow={isOpen.fromDate}
          mode="date"
          controllerProps={{
            name: "fromDate",
            control,
            rules: {
              required: false,
              validate: {
                isFuture: (v) =>
                  !v ||
                  isFuture(parseISO(v)) ||
                  t("Date should be in the future"),
              },
            },
          }}
          onClose={() => {
            setIsOpen((prev) => ({ ...prev, fromDate: false }));
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
          buttonLabel={t("Confirm")}
          options={[hourList, minuteList, period]}
          concatenator={[":", " "]}
          controllerProps={{
            name: "from",
            control,
          }}
        />
        <FormInput
          label={t("To")}
          controllerProps={{
            name: "to",
            control,
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
          buttonLabel={t("Confirm")}
          options={[hourList, minuteList, period]}
          concatenator={[":", " "]}
          controllerProps={{
            name: "to",
            control,
          }}
        />
        {/* Price components */}
        <Heading size="md">{t("Price")}</Heading>
        <Heading size="md">
          {COURSE_FILTER_MIN_PRICE} {t("HKD")} - {COURSE_FILTER_MAX_PRICE}{" "}
          {t("HKD")}
        </Heading>
        {/* <Box mx="2" mb="2">
          <RangeSlider
            min={COURSE_FILTER_MIN_PRICE}
            max={COURSE_FILTER_MAX_PRICE}
            controllerProps={{
              name: "price",
              control,
            }}
          />
        </Box> */}
        {/* <FormInput
          inputProps={{ keyboardType: "numeric" }}
          label={t("Min price (HKD)")}
          controllerProps={{
            name: "min",
            control,
            rules: {
              required: t("is required"),
              validate: {
                withInRange: (v) => {
                  if (v && maxPrice) {
                    return (
                      (isPositiveNumber(v) &&
                        parseInt(v, 10) <= COURSE_FILTER_MAX_PRICE &&
                        parseInt(v, 10) >= COURSE_FILTER_MIN_PRICE &&
                        maxPrice &&
                        parseInt(v, 10) < maxPrice) ||
                      t("Min price must be less than Max price and an integer")
                    );
                  }
                },
              },
            },
          }}
        />
        <FormInput
          inputProps={{ keyboardType: "numeric" }}
          label={t("Max price (HKD)")}
          controllerProps={{
            name: "max",
            control,
            rules: {
              required: t("is required"),
              validate: {
                withInRange: (v) => {
                  if (v && minPrice) {
                    return (
                      (isPositiveNumber(v) &&
                        parseInt(v, 10) <= COURSE_FILTER_MAX_PRICE &&
                        parseInt(v, 10) >= COURSE_FILTER_MIN_PRICE &&
                        minPrice &&
                        parseInt(v, 10) > minPrice) ||
                      t(
                        "Max price must be greater than Min price and an integer"
                      )
                    );
                  }
                },
              },
            },
          }}
        /> */}
        <SliderInput
          min={COURSE_FILTER_MIN_PRICE}
          max={COURSE_FILTER_MAX_PRICE}
          shouldShowInput
          controllerProps={{
            name: "price",
            control,
          }}
        />

        {/* Level */}
        <Heading size="md">{t("Level")}</Heading>
        <FormInput
          label={t("Level")}
          controllerProps={{
            name: "levelText",
            control,
          }}
          inputProps={{
            editable: false,
            InputRightElement: <DownArrowIcon mr="4" />,
          }}
          onPress={() => {
            setIsOpen((prev) => ({ ...prev, level: true }));
          }}
        />

        <Button
          mt="auto"
          onPress={handleSubmit(
            async (val: CourseFilteringFormValues) => {
              navigation.navigate("AllCourses", {
                filterValue: {
                  ...val,
                  minPrice: val.price[0],
                  maxPrice: val.price[1],
                  min: val.price[0],
                  max: val.price[1],
                },
              });
            },
            (e) => console.log("fail, value: ", e)
          )}
        >
          {t("Confirm")}
        </Button>
        {/* <OneColumnPickerModal
          isOpen={isOpen.level}
          onClose={() => {
            setIsOpen((prev) => ({ ...prev, level: false }));
          }}
          headerLabel={t("Select level")}
          buttonLabel={t("Confirm")}
          options={Level.map((val) => ({
            ...val,
            label: t(val.label),
          }))}
          placeholder={levelPlaceholder}
          controllerProps={{
            name: "level",
            control,
          }}
        /> */}
        <SingleSelectModal
          isOpen={isOpen.level}
          onClose={() => {
            setIsOpen((prev) => ({ ...prev, level: false }));
          }}
          title={t("Select level")}
          options={Level.map((val) => ({
            ...val,
            label: t(val.label),
          }))}
          placeholder={levelPlaceholder}
          controllerProps={{
            name: "level",
            control,
          }}
          confirmButtonText={t("Confirm")}
        />
        <SingleSelectModal
          isOpen={isOpen.clubNameModal}
          isReturnObj
          onClose={() => {
            setIsOpen((prev) => ({ ...prev, clubNameModal: false }));
          }}
          title={t("Club Name")}
          options={clubOptions}
          controllerProps={{
            name: "clubObj",
            control,
          }}
          confirmButtonText={t("Confirm")}
        />
      </VStack>
    </HeaderLayout>
  );
}
