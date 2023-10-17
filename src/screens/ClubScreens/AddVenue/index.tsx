import React, { useCallback, useEffect, useMemo, useState } from "react";
import { Button, Heading, VStack, Text, Box } from "native-base";
import { useForm } from "react-hook-form";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { CompositeNavigationProp, RouteProp } from "@react-navigation/native";
import { BottomTabNavigationProp } from "@react-navigation/bottom-tabs";
import { AxiosError } from "axios";
import HeaderLayout from "../../../components/Layout/HeaderLayout";
import FormInput from "../../../components/FormInput/FormInput";
import getDistricts, { getAllDistricts } from "../../../constants/Districts";
import { hourList, minuteList, getPeriod } from "../../../constants/Time";
import cancellationPeriod from "../../../constants/CancellationPeriod";
import DownArrowIcon from "../../../components/Icons/DownArrowIcon";
import {
  MainStackNavigatorParamList,
  PlayerBottomTabNavigatorParamList,
} from "../../../routers/Types";
import { getTranslation } from "../../../utils/translation";
import FormSwitch from "../../../components/Switch/FormSwitch";
import RectangleImagePicker from "../../../components/ImagePicker/RectangleImagePicker";
import { CreateVenueRequest } from "../../../models/requests/Venue";
import getArea from "../../../constants/Area";
import SingleSelectModal from "../../../components/Modal/SingleSelectModal";

export type AddVenueNavigationProp = CompositeNavigationProp<
  NativeStackNavigationProp<MainStackNavigatorParamList, "ClubAddVenue">,
  BottomTabNavigationProp<PlayerBottomTabNavigatorParamList>
>;

export type AddVenueRouteProp = RouteProp<
  MainStackNavigatorParamList,
  "ClubAddVenue"
>;

interface AddVenueScreenProps {
  navigation: AddVenueNavigationProp;
  route: AddVenueRouteProp;
}

const t = getTranslation([
  "constant.area",
  "constant.district",
  "screen.BookingRecords",
  "screen.ClubScreens.Venue",
  "constant.button",
  "validation",
  "formInput",
]);

interface FormData extends CreateVenueRequest {
  districtText?: string;
  areaText?: string;
  cancellationPeriodText?: string;
}

export default function AddVenue({ route, navigation }: AddVenueScreenProps) {
  const [isOpen, setIsOpen] = useState({
    area: false,
    district: false,
    cancellationPeriod: false,
  });

  // const submitForm = async (value: FormData) => {
  //   console.log(value);

  //   try {
  //     await createVenue({
  //       name: value.name,
  //       area: value.area,
  //       district: value.district,
  //       address: value.address,
  //       phoneNo: value.phoneNo,
  //       numberOfTables: value.numberOfTables,
  //       fee: value.fee,
  //       ballsProvided: value.isProvideBall ? value.isProvideBall : false,
  //       openingTime: format12HTo24H(value.from),
  //       closingTime: format12HTo24H(value.to),
  //       venueImage: value.venueImage,
  //     });
  //     navigation.reset({
  //       index: 0,
  //       routes: [
  //         {
  //           name: "ClubAddVenueSuccess",
  //           params: {
  //             destination: "ClubNavigator",
  //           },
  //         },
  //       ],
  //     });
  //   } catch (error) {
  //     const err = error as AxiosError;
  //     console.log(err.response?.data);
  //     showApiToastError(error);
  //   }
  // };

  const {
    control,
    handleSubmit,
    watch,
    setValue,
    trigger,
    formState: { isValid, isSubmitting },
  } = useForm<FormData>({
    mode: "onChange",
    defaultValues: {
      ballsProvided: false,
    },
  });

  const areas = useMemo(() => getArea(), []);
  const districts = useMemo(() => getDistricts(), []);
  const selectedArea = watch("area");
  const selectedDistrictGroup = districts[selectedArea] || [];

  return (
    <HeaderLayout
      isSticky
      headerProps={{
        title: t("AddVenue"),
      }}
    >
      <VStack mx="defaultLayoutSpacing" space="5">
        <Heading size="sm" mt={2}>
          {t("Basic info")}
        </Heading>
        <FormInput
          label={t("Venue name")}
          controllerProps={{
            control,
            rules: { required: t("is required") },
            name: "name",
          }}
        />

        <FormInput
          label={t("Enquiry Phone no")}
          controllerProps={{
            control,
            rules: {
              required: t("is required"),
              pattern: {
                value: /^\d{8}$/,
                message: t("Phone number must be an 8-digit number"),
              },
            },
            name: "phoneNo",
          }}
          inputProps={{ keyboardType: "numeric" }}
        />

        <FormInput
          label={t("Venue Area")}
          controllerProps={{
            name: "areaText",
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
            setIsOpen((prev) => ({ ...prev, area: true }));
          }}
        />

        <FormInput
          label={t("Venue district")}
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

        <FormInput
          label={t("Venue address")}
          controllerProps={{
            control,
            rules: { required: t("is required") },
            name: "address",
          }}
          inputProps={{ multiline: true }}
        />

        <FormInput
          label={t("Number of tables")}
          controllerProps={{
            control,
            rules: {
              required: t("is required"),
              pattern: {
                value: /^\d*[1-9]\d*$/,
                message: t("Value should contains positive number only"),
              },
            },
            name: "numberOfTables",
          }}
          inputProps={{ keyboardType: "numeric" }}
        />

        <FormInput
          label={t("Rate ($/hr)")}
          controllerProps={{
            control,
            rules: {
              required: t("is required"),
              pattern: {
                value: /^\d*[1-9]\d*$/,
                message: t("Value should contains positive number only"),
              },
            },
            name: "fee",
          }}
          inputProps={{ keyboardType: "numeric" }}
        />

        <FormSwitch
          title={t("Ball provided?")}
          onText={t("No")}
          offText={t("Yes")}
          styleForm="style2"
          controllerProps={{
            name: "ballsProvided",
            control,
          }}
        />
        <VStack space={2}>
          <Heading size="sm">{t("Venue photo")}</Heading>
          <Text fontSize="sm" color="rs_secondary.grey">
            {t("Files smaller than 5mb")}
          </Text>
        </VStack>
        <RectangleImagePicker
          placeholderText={t("Venue Image")}
          controllerProps={{
            name: "venueImage",
            control,
          }}
        />
        <VStack space={2}>
          <Heading size="sm">{t("Cancellation Period")}</Heading>
          <Text fontSize="sm" color="rs_secondary.grey">
            {t("For confirmed bookings")}
          </Text>
        </VStack>
        <FormInput
          label={t("Cancellation Period")}
          controllerProps={{
            name: "cancellationPeriodText",
            control,
          }}
          inputProps={{
            editable: false,
            InputRightElement: <DownArrowIcon mr="4" />,
          }}
          onPress={() => {
            setIsOpen((prev) => ({ ...prev, cancellationPeriod: true }));
          }}
        />
        {/* selection models */}
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
            rules: {
              required: t("is required"),
            },
          }}
          confirmButtonText={t("Confirm")}
        />
        <SingleSelectModal
          isOpen={isOpen.district}
          onCloseWithValue={(val) => {
            setValue(
              "districtText",
              val
                ? selectedDistrictGroup.find((d) => d.value === val)?.label
                : ""
            );
            setIsOpen((prev) => ({ ...prev, district: false }));
          }}
          title={`${t("Select")}${t("District")}`}
          confirmButtonText={t("Confirm")}
          options={selectedDistrictGroup}
          controllerProps={{
            name: "district",
            control,
            rules: { required: t("is required") },
          }}
        />
        <SingleSelectModal
          title={`${t("Select")}${t("Cancellation Period")}`}
          isOpen={isOpen.cancellationPeriod}
          onCloseWithValue={(val) => {
            setValue(
              "cancellationPeriodText",
              val
                ? cancellationPeriod.find((period) => period.value === val)
                    ?.label
                : ""
            );
            setIsOpen((prev) => ({ ...prev, cancellationPeriod: false }));
          }}
          confirmButtonText={t("Confirm")}
          options={cancellationPeriod}
          controllerProps={{
            name: "cancellationPeriod",
            control,
          }}
        />
        <Button
          isLoading={isSubmitting}
          isLoadingText={t("Loading")}
          isDisabled={!isValid}
          onPress={handleSubmit((value: FormData) => {
            navigation.navigate("ClubAddVenueOpeningHours", {
              venue: value as CreateVenueRequest,
            });
          })}
        >
          {t("Next")}
        </Button>
      </VStack>
    </HeaderLayout>
  );
}
