import React, { useCallback, useEffect, useMemo, useState } from "react";
import { Box, Button, Heading, useTheme, VStack } from "native-base";
import { useForm } from "react-hook-form";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";

import { RouteProp } from "@react-navigation/native";
import { AxiosError } from "axios";
import { isFuture, min, parseISO } from "date-fns";
import HeaderLayout from "../../components/Layout/HeaderLayout";
import FormInput from "../../components/FormInput/FormInput";
import OneColumnPickerModal from "../../components/Modal/OneColumnPickerModal";
import ThreeColumnPickerModal from "../../components/Modal/ThreeColumnPickerModal";
import RangeSlider from "../../components/RangeSlider/RangeSlider";
import getArea from "../../constants/Area";
import getDistricts from "../../constants/Districts";
import {
  dateList,
  hourList,
  minuteList,
  monthList,
  getPeriod,
  yearList,
} from "../../constants/Time";
import {
  VENUE_FILTER_MAX_PRICE,
  VENUE_FILTER_MIN_PRICE,
} from "../../constants/Price";
import DownArrowIcon from "../../components/Icons/DownArrowIcon";
import { MainStackNavigatorParamList } from "../../routers/Types";
import { getTranslation } from "../../utils/translation";
import { getDefaultEndTimeByStartTime } from "../../utils/date";
import { isPositiveNumber } from "../../utils/strings";
import { showApiToastError } from "../../components/ApiToastError";
import DateTimePicker from "../../components/v2/DateTimePicker";
import SliderInput from "../../components/v2/SliderInput";
import SingleSelectModal from "../../components/Modal/SingleSelectModal";
import TimePicker from "../../components/v2/TimePicker";

export type VenueFilteringScreenNavigationProp = NativeStackNavigationProp<
  MainStackNavigatorParamList,
  "VenueFiltering"
>;

export type VenueFilteringRouteProp = RouteProp<
  MainStackNavigatorParamList,
  "VenueFiltering"
>;

interface VenueFilteringScreenProps {
  navigation: VenueFilteringScreenNavigationProp;
  route: VenueFilteringRouteProp;
}

export interface VenueFilteringForm {
  area?: string;
  areaText?: string;
  district?: string;
  districtText?: string;
  date: string;
  from?: string;
  to?: string;
  min?: number;
  max?: number;
  price?: number[];
}

const t = getTranslation([
  "constant.area",
  "constant.district",
  "screen.PlayerScreens.VenueFiltering",
  "constant.button",
  "validation",
  "formInput",
]);

export default function VenueFiltering({
  navigation,
  route,
}: VenueFilteringScreenProps) {
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
  let defaultValues: VenueFilteringForm | null = null;
  if (route.params) ({ filterValue: defaultValues } = route.params);
  console.log(defaultValues);

  const {
    control,
    handleSubmit,
    watch,
    setValue,
    resetField,
    formState,
    trigger,
  } = useForm({
    mode: "onChange",
    defaultValues: {
      ...defaultValues,
      price: defaultValues?.price
        ? defaultValues.price
        : defaultValues?.min && defaultValues.max
        ? [defaultValues.min, defaultValues.max]
        : [VENUE_FILTER_MIN_PRICE, VENUE_FILTER_MAX_PRICE],
      min: defaultValues?.price
        ? defaultValues.price[0]
        : defaultValues?.min
        ? defaultValues.min
        : VENUE_FILTER_MIN_PRICE,
      max: defaultValues?.price
        ? defaultValues.price[1]
        : defaultValues?.max
        ? defaultValues.max
        : VENUE_FILTER_MAX_PRICE,
    },
  });
  const areaValue = watch("area");
  const districtValue = watch("district");
  const minPrice = watch("min");
  const maxPrice = watch("max");
  const [districtList, setDistrictList] = useState<
    { label: string; value: string }[]
  >([]);

  const [defaultDate, setDefaultDate] = useState(defaultValues?.date);

  const areaPlaceholder = t("All areas");
  const districtPlaceholder = t("All districts");

  const setArea = useCallback(
    (newArea: string) => {
      if (newArea === areaPlaceholder || !newArea) {
        resetField("district");
        resetField("districtText");
        resetField("area");
        return resetField("areaText");
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
  const setDistrict = useCallback(
    (newDistrict: string) => {
      if (newDistrict === districtPlaceholder) {
        resetField("district");
        return resetField("districtText");
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
    date: false,
    from: false,
    to: false,
  });

  const fromTime = watch("from");
  const toTime = watch("to");
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
    setArea(areaValue ?? "");
    setDistrictList(areaValue in districts ? districts[areaValue] : []);
  }, [districts, areaValue, setArea]);

  useEffect(() => {
    setDistrict(districtValue);
  }, [districtValue, setDistrict]);

  useEffect(() => {
    if (minPrice) {
      trigger("max");
    }
    if (maxPrice) {
      trigger("min");
    }
  }, [minPrice, maxPrice, trigger]);

  return (
    <HeaderLayout
      isSticky
      headerProps={{
        title: t("Filter venue"),
        containerStyle: { marginHorizontal: 0 },
      }}
      containerProps={{ marginHorizontal: space.defaultLayoutSpacing }}
    >
      <VStack space="2" flex="1">
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
        <SingleSelectModal
          isOpen={isOpen.area}
          onClose={() => {
            setIsOpen((prev) => ({ ...prev, area: false }));
          }}
          title={`${t("Select")}${t("Area")}`}
          options={area}
          controllerProps={{
            name: "area",
            control,
          }}
          confirmButtonText={t("Confirm")}
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
          controllerProps={{
            name: "district",
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
        {/* Date components */}
        <Heading size="md">{t("Date")}</Heading>
        <FormInput
          label={t("Venue date")}
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
        {/* <ThreeColumnPickerModal
          isOpen={isOpen.date}
          defaultSelectValues={[
            `${today.getFullYear()}`,
            `${today.getMonth() + 1}`.padStart(2, "0"),
            `${today.getDate() + 1}`.padStart(2, "0"),
          ]}
          onClose={() => {
            setIsOpen((prev) => ({ ...prev, date: false }));
          }}
          headerLabel={`${t("Select")}${t("Date")}`}
          buttonLabel={t("Confirm")}
          concatenator={["-", "-"]}
          options={[yearList, monthList, dateList]}
          controllerProps={{
            name: "date",
            control,
            rules: {
              required: t("is required"),
              validate: {
                isFuture: (v) =>
                  isFuture(parseISO(v)) || t("Date should be in the future"),
              },
            },
          }}
        /> */}
        <DateTimePicker
          title={`${t("Select")}${t("Date")}`}
          isShow={isOpen.date}
          mode="date"
          onDefaultDate={(value) => {
            setDefaultDate(value);
          }}
          defaultDate={defaultDate}
          controllerProps={{
            name: "date",
            control,
            rules: {
              required: t("is required"),
              validate: {
                isFuture: (v) =>
                  isFuture(parseISO(v)) || t("Date should be in the future"),
              },
            },
          }}
          onClose={() => {
            setIsOpen((prev) => ({ ...prev, date: false }));
          }}
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
          {VENUE_FILTER_MIN_PRICE} {t("HKD")} - {VENUE_FILTER_MAX_PRICE}{" "}
          {t("HKD")}
        </Heading>
        {/* <Box mx="2" mb="2"> */}
        {/* <RangeSlider
          min={VENUE_FILTER_MIN_PRICE}
          max={VENUE_FILTER_MAX_PRICE}
          controllerProps={{
            name: "price",
            control,
          }}
        /> */}
        {/* </Box> */}
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
                        parseInt(v, 10) <= VENUE_FILTER_MAX_PRICE &&
                        parseInt(v, 10) >= VENUE_FILTER_MIN_PRICE &&
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
                        parseInt(v, 10) <= VENUE_FILTER_MAX_PRICE &&
                        parseInt(v, 10) >= VENUE_FILTER_MIN_PRICE &&
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
          min={VENUE_FILTER_MIN_PRICE}
          max={VENUE_FILTER_MAX_PRICE}
          shouldShowInput
          controllerProps={{
            name: "price",
            control,
          }}
        />
        <Button
          style={{ marginTop: "auto" }}
          onPress={handleSubmit(
            async (val) => {
              try {
                navigation.navigate("PlayerNavigator", {
                  screen: "VenueList",
                  params: { filterValue: val },
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
