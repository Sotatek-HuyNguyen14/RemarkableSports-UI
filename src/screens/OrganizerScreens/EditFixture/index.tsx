import React, { useCallback, useEffect, useMemo, useState } from "react";
import { VStack, useTheme, Heading, Text, Button, Toast } from "native-base";
import { useForm } from "react-hook-form";
import {
  NativeStackScreenProps,
  NativeStackNavigationProp,
} from "@react-navigation/native-stack";
import { CompositeNavigationProp, RouteProp } from "@react-navigation/native";
import { BottomTabNavigationProp } from "@react-navigation/bottom-tabs";
import useSWR from "swr";
import {
  ClubBottomTabNavigatorParamList,
  MainStackNavigatorParamList,
} from "../../../routers/Types";
import HeaderLayout from "../../../components/Layout/HeaderLayout";
import FormInput from "../../../components/FormInput/FormInput";
import { CreateClubRequest } from "../../../models/requests/Club";
import { getTranslation } from "../../../utils/translation";
import DownArrowIcon from "../../../components/Icons/DownArrowIcon";
import OneColumnPickerModal from "../../../components/Modal/OneColumnPickerModal";
import { getAllDistricts } from "../../../constants/Districts";
import RectangleImagePicker from "../../../components/ImagePicker/RectangleImagePicker";
import MessageToast, {
  MesssageToastType,
} from "../../../components/Toast/MessageToast";
import { formatCoreUrl, formatFileUrl } from "../../../services/ServiceUtil";
import { useAuth } from "../../../hooks/UseAuth";
import { showApiToastError } from "../../../components/ApiToastError";
import ThreeColumnPickerModal from "../../../components/Modal/ThreeColumnPickerModal";
import {
  dateList,
  getPeriod,
  hourList,
  minuteList,
  monthList,
  yearList,
} from "../../../constants/Time";
import ArrayEditMatch from "./ArrayEditMatch";
import {
  format12HTo24H,
  format24HTo12H,
  formatUtcToLocalTime,
} from "../../../utils/date";
import { FixtureResponse } from "../../../models/responses/League";
import {
  getTeamsInDivision,
  updateFixtures,
} from "../../../services/LeagueServices";
import Loading from "../../../components/Loading";
import { isBlank } from "../../../utils/strings";

export type EditFixtureNavigationProp = CompositeNavigationProp<
  NativeStackNavigationProp<MainStackNavigatorParamList, "EditFixture">,
  BottomTabNavigationProp<ClubBottomTabNavigatorParamList>
>;

export type EditFixtureRouteProp = RouteProp<
  MainStackNavigatorParamList,
  "EditFixture"
>;

export interface EditFixtureScreenProps {
  navigation: EditFixtureNavigationProp;
  route: EditFixtureRouteProp;
}

const t = getTranslation([
  "constant.district",
  "screen.OrganizerScreens.EditFixture",
  "screen.OrganizerScreens.ManageDivision",
  "constant.button",
  "leagueTerms",
  "formInput",
  "toastMessage",
]);
const SAVED_SUCCESSFUL_TOAST = "savedSuccessful";
const DELETE_SUCCESSFUL_TOAT = "deleteSuccessful";

export interface FixtureUpdateItem {
  id: number;
  date: Date;
  time: Date;
  venue: string;
  homeTeam: string;
  awayTeam: string;
  season: number;
  round: number;
  homeTeamId: number;
  awayTeamId: number;
}

interface FormValue {
  matches: FixtureUpdateItem[];
}

export default function EditFixture({
  navigation,
  route,
}: EditFixtureScreenProps) {
  const { groupedFixture, divisionId } = route.params;
  const theme = useTheme();

  const {
    control,
    handleSubmit,
    formState: { isValid, isSubmitting },
    watch,
    setValue,
  } = useForm<FormValue>({
    mode: "onChange",
    defaultValues: {
      matches: groupedFixture.fixtures.map((fixture) => {
        return {
          ...fixture,
          homeTeam: fixture.homeTeam.name,
          awayTeam: fixture.awayTeam.name,
          time: format24HTo12H(fixture.time.toString()),
        };
      }),
    },
  });

  const {
    data: divisionTeams,
    isValidating: divisionTeamValidating,
    error: divisionTeamsError,
    mutate: divisionTeamsMutate,
  } = useSWR(formatCoreUrl(`/division/${divisionId}/teams`), () =>
    getTeamsInDivision(divisionId)
  );

  const isMatchValid = (match: FixtureUpdateItem) => {
    return (
      !isBlank(match.awayTeam) &&
      !isBlank(match.homeTeam) &&
      match.time &&
      !isBlank(match.time.toString()) &&
      match.date &&
      !isBlank(match.date.toString()) &&
      !isBlank(match.venue)
    );
  };

  const isSaveButtonEnabled = () => {
    const matches = watch("matches");
    return matches.findIndex((match) => !isMatchValid(match)) === -1;
  };

  return (
    <HeaderLayout
      containerProps={{ padding: theme.space.defaultLayoutSpacing }}
      KeyboardAwareScrollViewProps={{
        bounces: false,
      }}
      headerProps={{
        title: `${t("Edit")} ${t("Fixture")}`,
        containerStyle: {
          marginHorizontal: 0,
        },
      }}
    >
      {divisionTeamValidating ? (
        <Loading />
      ) : (
        <VStack space="4" flex="1">
          <ArrayEditMatch
            teamOptions={
              divisionTeams
                ? divisionTeams.map((team) => {
                    return {
                      value: team.name,
                      label: team.name,
                    };
                  })
                : []
            }
            controllerProps={{ name: "matches", control }}
          />
          <Button
            isDisabled={!isValid || !isSaveButtonEnabled()}
            isLoading={isSubmitting}
            isLoadingText={t("Loading")}
            onPress={handleSubmit(
              async (val) => {
                try {
                  const res = await updateFixtures({
                    fixture: val.matches.map((match) => {
                      return {
                        ...match,
                        homeTeamId: divisionTeams?.filter(
                          (team) => team.name === match.homeTeam
                        )?.[0].id,
                        awayTeamId: divisionTeams?.filter(
                          (team) => team.name === match.awayTeam
                        )?.[0].id,
                        time: match.time
                          .toString()
                          .replace("上午", "AM")
                          .replace("下午", "PM"),
                      };
                    }),
                  });

                  Toast.show({
                    id: "editFixtureComplete",
                    duration: 2000,
                    placement: "top",
                    render: () => {
                      return (
                        <MessageToast
                          type={MesssageToastType.Success}
                          title={`${t("Edit")} ${t("Fixture")} ${t(
                            "Successful"
                          )}`}
                        />
                      );
                    },
                  });
                  if (navigation.canGoBack()) {
                    navigation.goBack();
                  }
                } catch (e) {
                  showApiToastError(e);
                }
              },
              (e) => console.log("fail, value: ", e)
            )}
          >
            {t("Save")}
          </Button>
        </VStack>
      )}
    </HeaderLayout>
  );
}
