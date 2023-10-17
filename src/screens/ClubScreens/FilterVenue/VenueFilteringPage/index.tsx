import React, { useMemo, useState } from "react";
import { useForm } from "react-hook-form";
import { Button, Heading, VStack } from "native-base";
import useSWRMutation from "swr/mutation";
import { NativeStackScreenProps } from "@react-navigation/native-stack";

import HeaderLayout from "../../../../components/Layout/HeaderLayout";
import { getTranslation } from "../../../../utils/translation";
import FormInput from "../../../../components/FormInput/FormInput";
import { SearchVenueParams, Venue } from "../../../../models/requests/Venue";
import {
  VENUE_FILTER_MAX_PRICE,
  VENUE_FILTER_MIN_PRICE,
} from "../../../../constants/Price";
import SliderInput from "../../../../components/v2/SliderInput";
import { getVenuesByParams } from "../../../../services/VenueServices";
import SingleSelectModal from "../../../../components/Modal/SingleSelectModal";
import getArea from "../../../../constants/Area";
import getDistricts from "../../../../constants/Districts";
import DownArrowIcon from "../../../../components/Icons/DownArrowIcon";
import TimePicker from "../../../../components/v2/TimePicker";
import { getPeriod, hourList, minuteList } from "../../../../constants/Time";
import { format12HTo24H, validateTimeRange } from "../../../../utils/date";
import { MainStackNavigatorParamList } from "../../../../routers/Types";

const t = getTranslation([
  "constant.area",
  "constant.district",
  "constant.button",
  "screen.ClubScreens.Venue",
  "validation",
  "formInput",
]);

type VenueFilteringPageScreenProps = NativeStackScreenProps<
  MainStackNavigatorParamList,
  "VenueFilteringPage"
>;

interface FormData extends SearchVenueParams {
  clubName?: string;
  areaText?: string;
  districtText?: string;
  priceRange: number[];
}

export default function VenueFilteringPage({
  route,
  navigation,
}: VenueFilteringPageScreenProps) {
  const [isOpen, setIsOpen] = useState({
    clubName: false,
    area: false,
    district: false,
    fromTime: false,
    toTime: false,
  });

  const {
    control,
    handleSubmit,
    setValue,
    watch,
    formState: { isSubmitting },
  } = useForm<FormData>({
    mode: "onChange",
    defaultValues: {
      priceRange: [VENUE_FILTER_MIN_PRICE, VENUE_FILTER_MAX_PRICE],
    },
  });

  const areas = useMemo(() => getArea(), []);
  const districts = useMemo(() => getDistricts(), []);
  const selectedArea = watch("area");
  const selectedDistrictGroup = selectedArea ? districts[selectedArea] : [];
  const period = useMemo(() => getPeriod(), []);

  const { trigger } = useSWRMutation("/venue", getVenuesByParams);

  const onSubmit = async (value: FormData) => {
    const submittedForm: SearchVenueParams = {
      area: value.area,
      district: value.district,
      fromTime: value.fromTime && format12HTo24H(value.fromTime),
      toTime: value.toTime && format12HTo24H(value.toTime),
      fromFee: value.priceRange[0].toString(),
      toFee: value.priceRange[1].toString(),
      numberOfTables: value.numberOfTables,
    };
    const fetchedVenues = await trigger(submittedForm);
    navigation.navigate("FilteredVenues", { venues: fetchedVenues || [] });
  };

  return (
    <HeaderLayout isSticky headerProps={{ title: "Filter Venue" }}>
      <VStack space={8} mx="defaultLayoutSpacing">
        <VStack space={3}>
          <Heading size="sm">Club Name</Heading>
          <FormInput
            label="Club Name"
            controllerProps={{ control, name: "clubName" }}
            inputProps={{
              editable: false,
              InputRightElement: <DownArrowIcon mr="4" />,
            }}
            onPress={() => {
              setIsOpen((prev) => ({ ...prev, clubName: true }));
            }}
          />
        </VStack>
        <VStack space={3}>
          <Heading size="sm">Location</Heading>
          <FormInput
            label="Area"
            controllerProps={{ control, name: "areaText" }}
            inputProps={{
              editable: false,
              InputRightElement: <DownArrowIcon mr="4" />,
            }}
            onPress={() => {
              setIsOpen((prev) => ({ ...prev, area: true }));
            }}
          />
          <FormInput
            label="District"
            controllerProps={{ control, name: "districtText" }}
            inputProps={{
              editable: false,
              InputRightElement: <DownArrowIcon mr="4" />,
            }}
            onPress={() => {
              setIsOpen((prev) => ({ ...prev, district: true }));
            }}
          />
        </VStack>
        <VStack space={3}>
          <Heading size="sm">{t("Opening hours")}</Heading>
          <FormInput
            label={t("From")}
            inputProps={{
              editable: false,
              InputRightElement: <DownArrowIcon mr="4" />,
            }}
            onPress={() => {
              setIsOpen((prev) => ({ ...prev, fromTime: true }));
            }}
            controllerProps={{
              name: "fromTime",
              control,
            }}
          />
          <FormInput
            label={t("To")}
            inputProps={{
              editable: false,
              InputRightElement: <DownArrowIcon mr="4" />,
            }}
            onPress={() => {
              setIsOpen((prev) => ({ ...prev, toTime: true }));
            }}
            controllerProps={{
              name: "toTime",
              control,
            }}
          />
        </VStack>
        <VStack space={3}>
          <Heading size="sm">{t("Rate ($/hr)")}</Heading>
          <SliderInput
            min={VENUE_FILTER_MIN_PRICE}
            max={VENUE_FILTER_MAX_PRICE}
            shouldShowInput
            controllerProps={{
              name: "priceRange",
              control,
            }}
          />
        </VStack>
        <VStack space={3}>
          <Heading size="sm">{t("Number of table")}</Heading>
          <FormInput
            label={t("Number of table")}
            controllerProps={{
              control,
              name: "numberOfTables",
              rules: {
                pattern: {
                  value: /^\d*[1-9]\d*$/,
                  message: t("Value should contains positive number only"),
                },
              },
            }}
            inputProps={{ keyboardType: "numeric" }}
          />
        </VStack>
        <Button isDisabled={isSubmitting} onPress={handleSubmit(onSubmit)}>
          View Result
        </Button>
      </VStack>
      <SingleSelectModal
        isOpen={isOpen.clubName}
        onCloseWithValue={(val) => {
          setIsOpen((prev) => ({ ...prev, clubName: false }));
        }}
        title={`${t("Select")}${t("Area")}`}
        options={[]}
        controllerProps={{
          name: "clubId",
          control,
        }}
        confirmButtonText={t("Confirm")}
      />
      <SingleSelectModal
        isOpen={isOpen.area}
        onCloseWithValue={(val) => {
          setValue(
            "areaText",
            val ? areas.find((a) => a.value === val)?.label : ""
          );
          setValue("district", "");
          setValue("districtText", "");
          setIsOpen((prev) => ({ ...prev, area: false }));
        }}
        title={`${t("Select")}${t("Area")}`}
        options={areas}
        controllerProps={{
          name: "area",
          control,
        }}
        confirmButtonText={t("Confirm")}
      />
      <SingleSelectModal
        isOpen={isOpen.district}
        onCloseWithValue={(val) => {
          setValue(
            "districtText",
            val ? selectedDistrictGroup.find((d) => d.value === val)?.label : ""
          );
          setIsOpen((prev) => ({ ...prev, district: false }));
        }}
        title={`${t("Select")}${t("District")}`}
        options={selectedDistrictGroup}
        controllerProps={{
          name: "district",
          control,
        }}
        confirmButtonText={t("Confirm")}
      />
      <TimePicker
        headerLabel={`${t("Select")}${t("Start Time")}`}
        isOpen={isOpen.fromTime}
        onClose={() => {
          setIsOpen((prev) => ({ ...prev, fromTime: false }));
        }}
        options={[hourList, minuteList, period]}
        concatenator={[":", " "]}
        controllerProps={{
          name: "fromTime",
          control,
          rules: {
            validate: {
              timeInOrder: (inputTime) => {
                return (
                  validateTimeRange(inputTime, watch(`toTime`)) ||
                  t("from time must be earlier than the to time")
                );
              },
            },
          },
        }}
      />
      <TimePicker
        headerLabel={`${t("Select")}${t("End Time")}`}
        isOpen={isOpen.toTime}
        onClose={() => {
          setIsOpen((prev) => ({ ...prev, toTime: false }));
        }}
        options={[hourList, minuteList, period]}
        concatenator={[":", " "]}
        controllerProps={{
          name: "toTime",
          control,
          rules: {
            validate: {
              timeInOrder: (inputTime) => {
                return (
                  validateTimeRange(watch("fromTime"), inputTime) ||
                  t("from time must be earlier than the to time")
                );
              },
            },
          },
        }}
      />
    </HeaderLayout>
  );
}
