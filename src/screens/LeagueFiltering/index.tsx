import React, { useCallback, useEffect, useMemo, useState } from "react";
import { Button, Heading, useTheme, VStack } from "native-base";
import { useForm } from "react-hook-form";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { RouteProp } from "@react-navigation/native";
import { AxiosError } from "axios";
import { isFuture, isToday, parseISO } from "date-fns";
import HeaderLayout from "../../components/Layout/HeaderLayout";
import FormInput from "../../components/FormInput/FormInput";
import OneColumnPickerModal from "../../components/Modal/OneColumnPickerModal";
import ThreeColumnPickerModal from "../../components/Modal/ThreeColumnPickerModal";
import { dateList, monthList, yearList } from "../../constants/Time";
import DownArrowIcon from "../../components/Icons/DownArrowIcon";
import { MainStackNavigatorParamList } from "../../routers/Types";
import { getTranslation } from "../../utils/translation";
import { useAuth } from "../../hooks/UseAuth";
import { showApiToastError } from "../../components/ApiToastError";
import { FixtureType } from "../../models/responses/League";
import SingleSelectModal from "../../components/Modal/SingleSelectModal";
import { FilterResult } from "../FilterFixtureResult";
import DateTimePicker from "../../components/v2/DateTimePicker";

export type VenueFilteringScreenNavigationProp = NativeStackNavigationProp<
  MainStackNavigatorParamList,
  "LeagueFiltering"
>;

export type VenueFilteringRouteProp = RouteProp<
  MainStackNavigatorParamList,
  "LeagueFiltering"
>;

interface VenueFilteringScreenProps {
  navigation: VenueFilteringScreenNavigationProp;
  route: VenueFilteringRouteProp;
}

export interface LeagueFilteringForm {
  type?: FixtureType;
  division?: string;
  team?: string;
  date?: string;
  typeText?: string;
}

const t = getTranslation([
  "screen.LeagueFiltering",
  "constant.button",
  "validation",
  "formInput",
  "leagueTerms",
]);

export default function LeagueFiltering({
  navigation,
  route,
}: VenueFilteringScreenProps) {
  const { space } = useTheme();
  const today = new Date();
  let defaultValues: FilterResult | null | undefined = null;
  const { league } = route.params;
  if (route.params) ({ filterValue: defaultValues } = route.params);
  const { user } = useAuth();
  const {
    control,
    handleSubmit,
    watch,
    setValue,
    formState: { isValid, isDirty },
    trigger,
    resetField,
  } = useForm({
    mode: "onChange",
    defaultValues: defaultValues as any,
  });
  const division = watch("division");
  const date = watch("date");
  const team = watch("team");
  const type = watch("type");
  const divisionText = watch("divisionText");
  const typeText = watch("typeText");
  const [defaultDate, setDefaultDate] = useState(defaultValues?.date);

  const [isOpen, setIsOpen] = useState({
    type: false,
    date: false,
    division: false,
    team: false,
  });

  useEffect(() => {
    if (division?.value) {
      setValue("divisionText", division.value);
      trigger("divisionText");
    } else if (divisionText) {
      setValue("divisionText", "");
      trigger("divisionText");
    }
  }, [division, divisionText, setValue, trigger]);
  useEffect(() => {
    setValue("teamText", team?.value ?? "");
  }, [team, setValue]);

  useEffect(() => {
    if (type) {
      setValue("typeText", t(type));
      trigger("typeText");
    } else if (typeText) {
      setValue("typeText", "");
      trigger("typeText");
    }
  }, [type, setValue, trigger, typeText]);

  const onSearch = async (formValue: FilterResult) => {
    try {
      navigation.navigate("FilterFixtureResult", {
        filterValue: formValue,
        league,
      });
    } catch (e) {
      const error = e as AxiosError;
      showApiToastError(e);
      console.log("fail, value: ", e);
    }
  };

  return (
    <HeaderLayout
      isSticky
      KeyboardAwareScrollViewProps={{ bounces: false }}
      headerProps={{
        title: t("Search"),
        containerStyle: { marginHorizontal: 0 },
      }}
      containerProps={{ marginHorizontal: space.defaultLayoutSpacing }}
    >
      <VStack space="4" flex="1" py="defaultLayoutSpacing">
        {/* Type components */}
        <Heading size="md">{t("Type")}</Heading>
        <FormInput
          label={t("Type")}
          controllerProps={{
            name: "typeText",
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
            setIsOpen((prev) => ({ ...prev, type: true }));
          }}
        />
        {/* Division components */}
        <Heading size="md">{t("Division")}</Heading>
        <FormInput
          label={t("Division")}
          controllerProps={{
            name: "divisionText",
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
            setIsOpen((prev) => ({ ...prev, division: true }));
          }}
        />

        {/* Team components */}
        <Heading size="md">{t("Team")}</Heading>
        <FormInput
          label={t("Team")}
          controllerProps={{
            name: "teamText",
            control,
          }}
          inputProps={{
            editable: false,
            InputRightElement: <DownArrowIcon mr="4" />,
          }}
          onPress={() => {
            setIsOpen((prev) => ({ ...prev, team: true }));
          }}
        />

        {/* Date components */}
        <Heading size="md">{t("Date")}</Heading>
        <FormInput
          label={t("DD-MM-YYYY")}
          controllerProps={{
            name: "date",
            control,
            rules: {
              validate: date
                ? {
                    isFuture: (v) =>
                      isToday(parseISO(v)) ||
                      isFuture(parseISO(v)) ||
                      t("Date should be in the future"),
                  }
                : {},
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

        <SingleSelectModal
          isOpen={isOpen.type}
          onClose={() => {
            setIsOpen((prev) => ({ ...prev, type: false }));
          }}
          title={`${t("Select")}${t("Type")}`}
          confirmButtonText={t("Confirm")}
          options={[
            {
              label: t(FixtureType.fixture),
              value: FixtureType.fixture,
            },
            {
              label: t(FixtureType.result),
              value: FixtureType.result,
            },
          ]}
          controllerProps={{
            name: "type",
            control,
          }}
        />
        {/* <ThreeColumnPickerModal
          isOpen={isOpen.date}
          defaultSelectValues={[
            `${today.getFullYear()}`,
            `${today.getMonth() + 1}`.padStart(2, "0"),
            `${today.getDate()}`.padStart(2, "0"),
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
              // required: after ? "" : t("is required"),
              validate: date
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
          isShow={isOpen.date}
          mode="date"
          controllerProps={{
            name: "date",
            control,
            rules: {
              // required: after ? "" : t("is required"),
              validate: date
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
            setIsOpen((prev) => ({ ...prev, date: false }));
          }}
          onDefaultDate={(value) => {
            setDefaultDate(value);
          }}
          defaultDate={defaultDate}
        />
        <SingleSelectModal
          confirmButtonText={t("Confirm")}
          isOpen={isOpen.division}
          isReturnObj
          onClose={() => {
            setIsOpen((prev) => ({ ...prev, division: false }));
          }}
          title={`${t("Select")}${t("Division")}`}
          options={
            league?.divisions?.map((val) => ({
              label: val.id,
              value: val.name,
            })) || []
          }
          controllerProps={{
            name: "division",
            control,
          }}
        />
        <SingleSelectModal
          confirmButtonText={t("Confirm")}
          isOpen={isOpen.team}
          isReturnObj
          onClose={() => {
            setIsOpen((prev) => ({ ...prev, team: false }));
          }}
          title={`${t("Select")}${t("Team")}`}
          options={
            league?.divisions
              ?.find(
                (val) =>
                  val.id === division?.label && val.name === division?.value
              )
              ?.teams?.map((val) => ({
                label: val.id,
                value: val.name,
              })) || []
          }
          controllerProps={{
            name: "team",
            control,
          }}
        />
        <Button
          isDisabled={!isValid}
          style={{ marginTop: "auto" }}
          onPress={handleSubmit(onSearch)}
        >
          {t("Confirm")}
        </Button>
      </VStack>
    </HeaderLayout>
  );
}
