/* eslint-disable react/no-array-index-key */
import {
  VStack,
  Text,
  HStack,
  useTheme,
  Pressable,
  Heading,
} from "native-base";
import React, { useEffect, useRef, useState } from "react";
import { useForm } from "react-hook-form";
import useSWR from "swr";
import { useFocusEffect } from "@react-navigation/native";
import { NativeStackScreenProps } from "@react-navigation/native-stack";
import HeaderLayout from "../../components/Layout/HeaderLayout";
import { getTranslation } from "../../utils/translation";
import { MainStackNavigatorParamList } from "../../routers/Types";
import SingleSelectModal from "../../components/Modal/SingleSelectModal";
import DivisionCard from "../../components/Card/DivisionCard";
import { formatCoreUrl } from "../../services/ServiceUtil";
import {
  getFixture,
  getLeagues,
  searchMatchResults,
} from "../../services/LeagueServices";
import Loading from "../../components/Loading";
import ErrorMessage from "../../components/ErrorMessage";
import NoDataComponent from "../../components/NoDataComponent";
import RoundedRedCrossIcon from "../../components/Icons/RoundedRedCrossIcon";
import { FilterBadgeProps } from "../../components/Badge/FilterBadge";
import FilterBadge from "../../components/FilterList";
import { useAuth } from "../../hooks/UseAuth";
import { LeagueFilteringForm } from "../LeagueFiltering";
import { FixtureType, LeagueResponse } from "../../models/responses/League";
import DivisionMatchResultItem from "../OrganizerScreens/ManageDivision/DivisionResultItem";
import FixtureCard from "../../components/Card/FixtureCard";

export type FilterFixtureResultProps = NativeStackScreenProps<
  MainStackNavigatorParamList,
  "FilterFixtureResult"
>;

const t = getTranslation([
  "screen.FilterFixtureResult",
  "leagueTerms",
  "formInput",
]);

export interface FilterResult {
  type?: FixtureType.fixture | FixtureType.result;
  division?: { label: string; value: string };
  team?: { label: string; value: string };
  date?: string;
  typeText?: string;
}

function processFilteringForm(
  filterValue: FilterResult | null | undefined,
  navigation: FilterFixtureResultProps["navigation"],
  league: LeagueResponse
) {
  if (!filterValue) {
    return [];
  }
  const filterList = [];
  if (filterValue?.type) {
    filterList.push({
      label: filterValue.typeText ?? t("Type"),
      isActive: !!filterValue.type,
      onPress: () =>
        navigation.navigate("LeagueFiltering", { filterValue, league }),
    });
  }

  if (filterValue?.division) {
    filterList.push({
      label: filterValue.division.value ?? t("Division"),
      isActive: !!filterValue.division,
      onPress: () =>
        navigation.navigate("LeagueFiltering", { filterValue, league }),
    });
  }
  if (filterValue?.team) {
    filterList.push({
      label: filterValue.team.value ?? t("Team"),
      isActive: !!filterValue.team,
      onPress: () =>
        navigation.navigate("LeagueFiltering", { filterValue, league }),
    });
  }

  if (filterValue?.date) {
    filterList.push({
      label: filterValue.date ?? t("Date"),
      isActive: !!filterValue.date,
      onPress: () =>
        navigation.navigate("LeagueFiltering", { filterValue, league }),
    });
  }

  return filterList.sort(
    (x, y) => Number(y.isActive) - Number(x.isActive)
  ) as FilterBadgeProps[];
}

export default function FilterFixtureResult({
  navigation,
  route,
}: FilterFixtureResultProps) {
  const initeValue = {
    type: undefined,
    date: undefined,
    division: undefined,
    time: undefined,
  };
  let [filterValue] = useState<FilterResult | null | undefined>(initeValue);
  const { league } = route.params;
  if (route.params) ({ filterValue } = route.params);
  const filteredBadgeOptions = useRef<FilterBadgeProps[]>(
    processFilteringForm(filterValue, navigation, league)
  );
  const [badgeOptions, setBadgeOptions] = useState<FilterBadgeProps[]>(
    filteredBadgeOptions.current
  );

  const {
    data: matchResults,
    isValidating: resultIsValidating,
    error: resultError,
    mutate: resultMutate,
  } = useSWR(
    filterValue?.type === FixtureType.result
      ? formatCoreUrl("/result")
      : undefined,
    () =>
      filterValue?.type === FixtureType.result
        ? searchMatchResults({
            divisionId: filterValue?.division?.label,
            teamId: filterValue.team?.label,
            date: filterValue?.date,
          })
        : undefined
  );

  const {
    data: fixtrues,
    isValidating: fixtruesIsValidating,
    error: fixtruesError,
    mutate: fixtruesMutate,
  } = useSWR(
    filterValue?.type === FixtureType.fixture
      ? formatCoreUrl("/fixture")
      : undefined,
    () =>
      filterValue?.type === FixtureType.fixture
        ? getFixture({
            divisionId: filterValue?.division?.label,
            teamId: filterValue.team?.label,
            fromDate: filterValue?.date,
          })
        : undefined
  );

  useEffect(() => {
    if (route.params) {
      //   eventListMutate();
      setBadgeOptions(
        processFilteringForm(route.params.filterValue, navigation, league)
      );
    }
  }, [league, navigation, route.params]);

  useEffect(() => {
    setBadgeOptions(processFilteringForm(filterValue, navigation, league));
  }, [filterValue, league, navigation]);

  return (
    <HeaderLayout
      KeyboardAwareScrollViewProps={{
        bounces: false,
      }}
      headerProps={{
        title: t("Filter Result"),
        containerStyle: { marginHorizontal: 0 },
        hasBackButton: true,
      }}
      isSticky
    >
      <VStack space="4" p="4">
        <FilterBadge options={badgeOptions} />
        {!resultIsValidating &&
          resultError &&
          filterValue?.type === FixtureType.result && <ErrorMessage />}
        {!fixtruesIsValidating &&
          fixtruesError &&
          filterValue?.type === FixtureType.fixture && <ErrorMessage />}
        {resultIsValidating && filterValue?.type === FixtureType.result && (
          <Loading />
        )}
        {fixtruesIsValidating && filterValue?.type === FixtureType.fixture && (
          <Loading />
        )}
        {!resultIsValidating &&
          !resultError &&
          filterValue?.type === FixtureType.result && (
            <Heading ml="2.5">{`${matchResults?.length ?? 0} ${t(
              "Result"
            )}`}</Heading>
          )}
        {!fixtruesIsValidating &&
          !fixtruesError &&
          filterValue?.type === FixtureType.fixture && (
            <Heading ml="2.5">{`${fixtrues?.length ?? 0} ${t(
              "Result"
            )}`}</Heading>
          )}
        {!resultIsValidating &&
          !resultError &&
          matchResults &&
          matchResults?.length > 0 &&
          matchResults?.map((matchResult) => (
            <DivisionMatchResultItem
              onPressDetail={() => {
                navigation.navigate("MatchResult", {
                  matchResultId: matchResult.id,
                });
              }}
              matchResult={matchResult}
              key={matchResult.id}
            />
          ))}

        {!fixtruesIsValidating &&
          !fixtruesError &&
          fixtrues &&
          fixtrues?.length > 0 &&
          fixtrues?.map((fixture) => (
            <FixtureCard fixture={fixture} key={fixture.id} />
          ))}
      </VStack>
    </HeaderLayout>
  );
}
