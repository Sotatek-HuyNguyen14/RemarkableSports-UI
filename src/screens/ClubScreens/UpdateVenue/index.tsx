import React, { useCallback, useEffect, useMemo, useState } from "react";
import {
  Button,
  Heading,
  VStack,
  Text,
  Image,
  Center,
  Circle,
  Pressable,
  useTheme,
  Divider,
} from "native-base";
import { useFieldArray, useForm } from "react-hook-form";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { CompositeNavigationProp, RouteProp } from "@react-navigation/native";
import { BottomTabNavigationProp } from "@react-navigation/bottom-tabs";
import { AxiosError } from "axios";
import useSWRMutation from "swr/mutation";
import { LayoutAnimation } from "react-native";

import HeaderLayout from "../../../components/Layout/HeaderLayout";
import FormInput from "../../../components/FormInput/FormInput";
import OneColumnPickerModal from "../../../components/Modal/OneColumnPickerModal";
import ThreeColumnPickerModal from "../../../components/Modal/ThreeColumnPickerModal";
import getDistricts from "../../../constants/Districts";
import { hourList, minuteList, getPeriod } from "../../../constants/Time";
import DownArrowIcon from "../../../components/Icons/DownArrowIcon";
import {
  ClubBottomTabNavigatorParamList,
  MainStackNavigatorParamList,
  PlayerBottomTabNavigatorParamList,
} from "../../../routers/Types";
import { getTranslation } from "../../../utils/translation";
import FormSwitch from "../../../components/Switch/FormSwitch";
import RectangleImagePicker from "../../../components/ImagePicker/RectangleImagePicker";
import {
  format12HTo24H,
  format24HTo12H,
  validateTimeRange,
} from "../../../utils/date";
import { CreateVenueRequest, Venue } from "../../../models/requests/Venue";
import getArea from "../../../constants/Area";
import { formatFileUrl } from "../../../services/ServiceUtil";
import {
  deleteVenue,
  getVenueById,
  updateVenue,
} from "../../../services/VenueServices";
import { useAuth } from "../../../hooks/UseAuth";
import { showApiToastError } from "../../../components/ApiToastError";
import SingleSelectModal from "../../../components/Modal/SingleSelectModal";
import TimePicker from "../../../components/v2/TimePicker";
import { showApiToastSuccess } from "../../../components/ApiToastSuccess";
import PencilIcon from "../../../components/Icons/PencilIcon";
import ImageDirectory from "../../../assets";
import DaysOfWeek from "../../../constants/DaysOfWeek";
import BinIcon from "../../../components/Icons/BinIcon";
import CancellationPeriod from "../../../constants/CancellationPeriod";
import GhostTabbar from "../../../components/GhostTabBar";
import ConfirmationModal from "../../../components/ConfirmationModal/ConfirmationModal";
import CheckIcon from "../../../components/Icons/CheckIcon";

export type UpdateVenueNavigationProp = CompositeNavigationProp<
  NativeStackNavigationProp<MainStackNavigatorParamList, "ClubUpdateVenue">,
  BottomTabNavigationProp<ClubBottomTabNavigatorParamList>
>;

export type UpdateVenueRouteProp = RouteProp<
  MainStackNavigatorParamList,
  "ClubUpdateVenue"
>;

interface UpdateVenueScreenProps {
  navigation: UpdateVenueNavigationProp;
  route: UpdateVenueRouteProp;
}

const t = getTranslation([
  "constant.area",
  "constant.district",
  "screen.ClubScreens.Venue",
  "constant.button",
  "validation",
  "formInput",
  "screen.ClubScreens.VenueList",
  "screen.BookingRecords",
]);

interface FormData extends CreateVenueRequest {
  areaText?: string;
  districtText?: string;
  cancellationPeriodText?: string;
}

export default function UpdateVenue({
  route,
  navigation,
}: UpdateVenueScreenProps) {
  const theme = useTheme();
  const { venue } = route.params;

  const [selectedTabIdx, setSelectedTabIdx] = useState(0);
  const [isOpen, setIsOpen] = useState({
    area: false,
    district: false,
    cancellationPeriod: false,
  });
  const [timeSingleIsOpen, setTimeSingleIsOpen] = useState({
    from: false,
    to: false,
  });
  const [timeArrayIsOpen, setTimeArrayIsOpen] = useState(
    DaysOfWeek.map((day) => ({
      from: false,
      to: false,
    }))
  );
  const [isSaveWindowOpen, setIsSaveWindowOpen] = useState(false);
  const [isDeleteWindowOpen, setIsDeleteWindowOpen] = useState(false);

  const {
    control,
    handleSubmit,
    watch,
    setValue,
    formState: { isValid, isSubmitting, errors },
  } = useForm<FormData>({
    mode: "onChange",
    defaultValues: {
      name: venue.name,
      phoneNo: venue.phoneNo,
      area: venue.area,
      district: venue.district,
      address: venue.address,
      numberOfTables: venue.numberOfTables.toString(),
      fee: venue.fee.toString(),
      ballsProvided: venue.ballsProvided,
      cancellationPeriod: venue.cancellationPeriod?.toString(),
      sameForEveryDay: true,
      openingTime: format24HTo12H(venue.openingTime),
      closingTime: format24HTo12H(venue.closingTime),
      listVenueOpeningHoursDtos: venue.listVenueOpeningHours.map((hours) => ({
        ...hours,
        openingTime: format24HTo12H(hours.openingTime),
        closingTime: format24HTo12H(hours.closingTime),
      })),
    },
  });

  const { fields } = useFieldArray({
    control,
    name: "listVenueOpeningHoursDtos",
  });

  const { trigger, isMutating: isDeletingVenue } = useSWRMutation(
    "/venue",
    deleteVenue
  );

  const areas = useMemo(() => getArea(), []);
  const districts = useMemo(() => getDistricts(), []);
  const selectedArea = watch("area");
  const selectedDistrictGroup = districts[selectedArea] || [];
  const period = useMemo(() => getPeriod(), []);

  const BasicInfo = (
    <VStack mx="defaultLayoutSpacing" space="5">
      <RectangleImagePicker
        defaultImageUrl={
          venue.imageUrl ? formatFileUrl(venue.imageUrl) : undefined
        }
        placeholderText={t("Venue Image")}
        controllerProps={{
          name: "venueImage",
          control,
        }}
        imageProps={{
          width: "100%",
          height: 220,
          borderRadius: 0,
          marginBottom: 8,
        }}
        showClose={false}
        noPhotoComponent={
          <VStack>
            <Image
              source={ImageDirectory.VENUE}
              style={{ width: "100%", height: 220 }}
            />
            <Center
              p="5"
              position="absolute"
              bottom="2"
              right="2"
              bgColor="rs.primary_purple"
              borderRadius="full"
              w="6"
              h="6"
            >
              <Circle position="absolute">
                <PencilIcon innterFill="white" size="lg" />
              </Circle>
            </Center>
          </VStack>
        }
      />
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
          defaultValue: areas.find((a) => a.value === watch("area"))?.label,
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
      <FormInput
        label={t("Venue district")}
        controllerProps={{
          name: "districtText",
          defaultValue: selectedDistrictGroup.find(
            (d) => d.value === watch("district")
          )?.label,
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
          name: "address",
          rules: { required: t("is required") },
        }}
        inputProps={{ multiline: true }}
      />
      <FormInput
        label={t("Number of tables")}
        controllerProps={{
          name: "numberOfTables",
          control,
          rules: {
            required: t("is required"),
            pattern: {
              value: /^\d*[1-9]\d*$/,
              message: t("Value should contains positive number only"),
            },
          },
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
      <FormInput
        label={t("Cancellation Period")}
        controllerProps={{
          name: "cancellationPeriodText",
          defaultValue: CancellationPeriod.find(
            (c) => c.value === watch("cancellationPeriod")
          )?.label,
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
      {isOpen.area && (
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
      )}
      {isOpen.district && (
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
      )}
      {isOpen.cancellationPeriod && (
        <SingleSelectModal
          title={`${t("Select")}${t("Cancellation Period")}`}
          isOpen={isOpen.cancellationPeriod}
          onCloseWithValue={(val) => {
            setValue(
              "cancellationPeriodText",
              val ? CancellationPeriod.find((p) => p.value === val)?.label : ""
            );
            setIsOpen((prev) => ({ ...prev, cancellationPeriod: false }));
          }}
          confirmButtonText={t("Confirm")}
          options={CancellationPeriod}
          controllerProps={{
            name: "cancellationPeriod",
            control,
          }}
        />
      )}
    </VStack>
  );
  const OpeningHours = (
    <VStack mx="defaultLayoutSpacing" space={5}>
      <Heading size="sm" mt={2}>
        {t("Opening hours")}
      </Heading>
      <FormSwitch
        title={t("Same time every day")}
        isTitleHeading={false}
        onText={t("No")}
        offText={t("Yes")}
        styleForm="style2"
        controllerProps={{ name: "sameForEveryDay", control }}
      />
      {watch("sameForEveryDay") ? (
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
                setTimeArrayIsOpen((prevHoursArray) =>
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
                setTimeArrayIsOpen((prevHoursArray) =>
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
                setTimeArrayIsOpen((prevHoursArray) =>
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
                          watch(`listVenueOpeningHoursDtos.${idx}.closingTime`)
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
                setTimeArrayIsOpen((prevHoursArray) =>
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
                          watch(`listVenueOpeningHoursDtos.${idx}.openingTime`),
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
    </VStack>
  );
  const selectableTabs = [BasicInfo, OpeningHours];

  // const { user } = useAuth();

  const OnDeleteVenue = async () => {
    setIsDeleteWindowOpen(false);
    try {
      await trigger(venue.id);
      navigation.navigate("ClubVenueList");
    } catch (err) {
      const error = err as AxiosError;
      showApiToastError(error);
    }
  };

  const submitForm = async (value: FormData) => {
    setIsSaveWindowOpen(false);
    const submittedForm: CreateVenueRequest = {
      ...value,
      openingTime: format12HTo24H(value.openingTime),
      closingTime: format12HTo24H(value.closingTime),
      listVenueOpeningHoursDtos: value.listVenueOpeningHoursDtos.map(
        (hour) => ({
          ...hour,
          openingTime: format12HTo24H(hour.openingTime),
          closingTime: format12HTo24H(hour.closingTime),
        })
      ),
    };
    try {
      await updateVenue(venue.id, submittedForm);
      const updatedVenue = await getVenueById(venue.id);
      navigation.reset({
        index: 0,
        routes: [
          { name: "ClubNavigator" },
          { name: "ClubVenueDetails", params: { venue: updatedVenue } },
        ],
      });
      showApiToastSuccess({});
    } catch (err) {
      const error = err as AxiosError;
      showApiToastError(error);
    }
  };

  return (
    <HeaderLayout
      isSticky
      headerProps={{
        title: t("UpdateVenue"),
        rightComponent: (
          <Pressable
            mt={3}
            onPress={() => {
              setIsDeleteWindowOpen(true);
            }}
          >
            <BinIcon size="md" />
          </Pressable>
        ),
      }}
    >
      <VStack mx="defaultLayoutSpacing" space={8}>
        <GhostTabbar
          items={["Basic Info", "Opening Hours"]}
          defaultIndex={selectedTabIdx}
          onPress={(item, idx) => {
            LayoutAnimation.configureNext(
              LayoutAnimation.Presets.easeInEaseOut
            );
            setSelectedTabIdx(idx);
          }}
          tabProps={{
            fontSize: 16,
            textAlign: "center",
            flex: 1,
          }}
          isShowBottomLine
          isFlex
          activateColor={theme.colors.rs.primary_purple}
          // unActivateColor={theme.colors.primay}
        />
        {selectableTabs[selectedTabIdx]}
        <Button
          isLoading={isSubmitting}
          isLoadingText={t("Loading")}
          isDisabled={!isValid}
          onPress={() => setIsSaveWindowOpen(true)}
        >
          {t("Save")}
        </Button>
      </VStack>
      <ConfirmationModal
        isOpen={isSaveWindowOpen}
        title="Confirm to save changes"
        confirmText={t("Confirm")}
        cancelText={t("Cancel")}
        onConfirm={handleSubmit(submitForm)}
        onCancel={() => setIsSaveWindowOpen(false)}
        isLoading={isSubmitting}
        alertType="Success"
      />
      <ConfirmationModal
        isOpen={isDeleteWindowOpen}
        title="Confirm to delete venue"
        description="Existing bookings will be cancelled and notify the applicants automatically"
        confirmText={t("Confirm")}
        cancelText={t("Cancel")}
        onConfirm={OnDeleteVenue}
        onCancel={() => setIsDeleteWindowOpen(false)}
        isLoading={isDeletingVenue}
        alertType="Alert"
      />
    </HeaderLayout>
  );
}
