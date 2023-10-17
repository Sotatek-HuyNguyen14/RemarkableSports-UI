import React, { useCallback, useEffect, useMemo, useState } from "react";
import { Button, Heading, useTheme, VStack } from "native-base";
import { Platform } from "react-native";

import { useForm } from "react-hook-form";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { RouteProp } from "@react-navigation/native";
import { AxiosError } from "axios";
import { isFuture, isToday, parseISO } from "date-fns";
import HeaderLayout from "../../components/Layout/HeaderLayout";
import FormInput from "../../components/FormInput/FormInput";
import OneColumnPickerModal from "../../components/Modal/OneColumnPickerModal";
import ThreeColumnPickerModal from "../../components/Modal/ThreeColumnPickerModal";
import { getAllDistricts } from "../../constants/Districts";
import { dateList, monthList, yearList } from "../../constants/Time";
import DownArrowIcon from "../../components/Icons/DownArrowIcon";
import { MainStackNavigatorParamList } from "../../routers/Types";
import { getTranslation } from "../../utils/translation";
import { EventType } from "../../models/responses/Event";
import { useAuth } from "../../hooks/UseAuth";
import { showApiToastError } from "../../components/ApiToastError";
import DateTimePicker from "../../components/v2/DateTimePicker";
import SingleSelectModal from "../../components/Modal/SingleSelectModal";

export type VenueFilteringScreenNavigationProp = NativeStackNavigationProp<
  MainStackNavigatorParamList,
  "EventFiltering"
>;

export type VenueFilteringRouteProp = RouteProp<
  MainStackNavigatorParamList,
  "EventFiltering"
>;

interface VenueFilteringScreenProps {
  navigation: VenueFilteringScreenNavigationProp;
  route: VenueFilteringRouteProp;
}

export interface EventFilteringForm {
  district?: string;
  districtText?: string;
  after?: string;
  before?: string;
  type?: EventType;
  typeText?: string;
}

const t = getTranslation([
  "constant.area",
  "constant.district",
  "constant.eventType",
  "screen.EventFiltering",
  "constant.button",
  "validation",
  "formInput",
]);

export default function EventFiltering({
  navigation,
  route,
}: VenueFilteringScreenProps) {
  const Districts = useMemo(() => {
    return getAllDistricts();
  }, []);
  const { space } = useTheme();
  const today = new Date();
  let defaultValues: EventFilteringForm | null = null;
  if (route.params) ({ filterValue: defaultValues } = route.params);
  const { user } = useAuth();
  const [defaultDate, setDefaultDate] = useState(defaultValues?.before);
  const [defaultAfter, setDefaultAfter] = useState(defaultValues?.after);
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
    defaultValues: defaultValues as any,
  });
  const district = watch("district");
  const after = watch("after");
  const before = watch("before");
  const type = watch("type");

  const setDistrict = useCallback(
    (newDistrict: string) => {
      const newLabel = Districts.reduce<string | null>((ret, val) => {
        if (val.value === newDistrict) {
          return val.label;
        }
        return ret;
      }, null);
      setValue("districtText", newLabel!, {
        shouldDirty: !!newLabel,
      });
      setValue("district", newDistrict, {
        shouldDirty: !!newLabel,
      });
    },
    [Districts, setValue]
  );

  const [isOpen, setIsOpen] = useState({
    district: false,
    before: false,
    after: false,
    from: false,
    to: false,
    type: false,
  });

  useEffect(() => {
    setDistrict(district);
  }, [district, setDistrict]);

  useEffect(() => {
    if (type) {
      setValue("typeText", t(type));
    } else {
      setValue("typeText", "");
    }
  }, [setValue, type]);

  return (
    <HeaderLayout
      isSticky
      KeyboardAwareScrollViewProps={{ bounces: false }}
      headerProps={{
        title: t("Filter event"),
        containerStyle: { marginHorizontal: 0 },
      }}
      containerProps={{ marginHorizontal: space.defaultLayoutSpacing }}
    >
      <VStack space="2" flex="1">
        {/* Type components */}
        <Heading size="md">{t("Type")}</Heading>
        <FormInput
          label={t("Type")}
          controllerProps={{
            name: "typeText",
            control,
          }}
          inputProps={{
            editable: false,
            InputRightElement: <DownArrowIcon mr="4" />,
          }}
          onPress={() => {
            setIsOpen((prev) => ({ ...prev, type: true }));
          }}
        />
        <SingleSelectModal
          title={`${t("Select")}${t("Type")}`}
          options={[
            {
              label: t(EventType.Competition),
              value: EventType.Competition,
            },
            {
              label: t(EventType.OpenDay),
              value: EventType.OpenDay,
            },
            {
              label: t(EventType.GroupBallGame),
              value: EventType.GroupBallGame,
            },
            {
              label: t(EventType.Others),
              value: EventType.Others,
            },
          ]}
          controllerProps={{
            name: "type",
            control,
          }}
          isOpen={isOpen.type}
          onClose={() => {
            setIsOpen((prev) => ({ ...prev, type: false }));
          }}
          confirmButtonText={t("Confirm")}
        />
        {/* Date components */}
        <Heading size="md">{t("After a certain starting date")}</Heading>
        <FormInput
          label={t("Date")}
          controllerProps={{
            name: "after",
            control,
          }}
          inputProps={{
            editable: false,
            InputRightElement: <DownArrowIcon mr="4" />,
          }}
          onPress={() => {
            setIsOpen((prev) => ({ ...prev, after: true }));
          }}
        />

        <Heading size="md">{t("Before a certain starting date")}</Heading>
        <FormInput
          label={t("Date")}
          controllerProps={{
            name: "before",
            control,
          }}
          inputProps={{
            editable: false,
            InputRightElement: <DownArrowIcon mr="4" />,
          }}
          onPress={() => {
            setIsOpen((prev) => ({ ...prev, before: true }));
          }}
        />
        {/* <ThreeColumnPickerModal
          isOpen={isOpen.before}
          defaultSelectValues={[
            `${today.getFullYear()}`,
            `${today.getMonth() + 1}`.padStart(2, "0"),
            `${today.getDate()}`.padStart(2, "0"),
          ]}
          onClose={() => {
            setIsOpen((prev) => ({ ...prev, before: false }));
          }}
          headerLabel={`${t("Select")}${t("Date")}`}
          buttonLabel={t("Confirm")}
          concatenator={["-", "-"]}
          options={[yearList, monthList, dateList]}
          controllerProps={{
            name: "before",
            control,
            rules: {
              // required: after ? "" : t("is required"),
              validate: before
                ? {
                    isFuture: (v) =>
                      isToday(parseISO(v)) ||
                      isFuture(parseISO(v)) ||
                      t("Date should be in the future"),
                  }
                : {},
            },
          }}
        /> */}
        <DateTimePicker
          title={`${t("Select")}${t("Date")}`}
          isShow={isOpen.before}
          mode="date"
          controllerProps={{
            name: "before",
            control,
            rules: {
              // required: after ? "" : t("is required"),
              validate: before
                ? {
                    isFuture: (v) =>
                      isToday(parseISO(v)) ||
                      isFuture(parseISO(v)) ||
                      t("Date should be in the future"),
                  }
                : {},
            },
          }}
          onClose={() => {
            setIsOpen((prev) => ({ ...prev, before: false }));
          }}
          onDefaultDate={(value) => {
            setDefaultDate(value);
          }}
          defaultDate={defaultDate}
        />

        {/* <ThreeColumnPickerModal
          isOpen={isOpen.after}
          defaultSelectValues={[
            `${today.getFullYear()}`,
            `${today.getMonth() + 1}`.padStart(2, "0"),
            `${today.getDate()}`.padStart(2, "0"),
          ]}
          onClose={() => {
            setIsOpen((prev) => ({ ...prev, after: false }));
          }}
          headerLabel={`${t("Select")} ${t("Date")}`}
          buttonLabel={t("Confirm")}
          concatenator={["-", "-"]}
          options={[yearList, monthList, dateList]}
          controllerProps={{
            name: "after",
            control,
            rules: {
              // required: before ? "" : t("is required"),
              validate: after
                ? {
                    isFuture: (v) =>
                      isToday(parseISO(v)) ||
                      isFuture(parseISO(v)) ||
                      t("Date should be in the future"),
                  }
                : {},
            },
          }}
        /> */}
        <DateTimePicker
          title={`${t("Select")}${t("Date")}`}
          isShow={isOpen.after}
          mode="date"
          controllerProps={{
            name: "after",
            control,
            rules: {
              // required: before ? "" : t("is required"),
              validate: after
                ? {
                    isFuture: (v) =>
                      isToday(parseISO(v)) ||
                      isFuture(parseISO(v)) ||
                      t("Date should be in the future"),
                  }
                : {},
            },
          }}
          onClose={() => {
            setIsOpen((prev) => ({ ...prev, after: false }));
          }}
          onDefaultDate={(value) => {
            setDefaultAfter(value);
          }}
          defaultDate={defaultAfter}
        />
        {/* District components */}
        <Heading size="md">{t("District")}</Heading>

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

        <SingleSelectModal
          title={`${t("Select")}${t("District")}`}
          options={Districts}
          controllerProps={{
            name: "district",
            control,
          }}
          isOpen={isOpen.district}
          onClose={() => {
            setIsOpen((prev) => ({ ...prev, district: false }));
          }}
          confirmButtonText={t("Confirm")}
        />

        <Button
          isDisabled={!formState.isValid}
          style={{
            marginTop: "auto",
          }}
          onPress={handleSubmit(
            async (val) => {
              try {
                navigation.navigate("AllEvent", {
                  filterValue: val,
                });
              } catch (e) {
                const error = e as AxiosError;
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
