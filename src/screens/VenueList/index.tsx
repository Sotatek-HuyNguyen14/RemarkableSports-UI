/* eslint-disable no-param-reassign */
import { BottomTabNavigationProp } from "@react-navigation/bottom-tabs";
import {
  CompositeNavigationProp,
  RouteProp,
  useFocusEffect,
} from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { VStack, Text, Spinner, Pressable } from "native-base";
import React, { useEffect, useRef, useState } from "react";
import { useForm } from "react-hook-form";
import useSWR from "swr";
import { FilterBadgeProps } from "../../components/Badge/FilterBadge";
import FilterBadge from "../../components/FilterList";
import FormInput from "../../components/FormInput/FormInput";
import MagnifyingGlassIcon from "../../components/Icons/MagnifyingGlassIcon";
import RoundedRedCrossIcon from "../../components/Icons/RoundedRedCrossIcon";
import HeaderLayout from "../../components/Layout/HeaderLayout";
import { Venue } from "../../models/requests/Venue";
import {
  MainStackNavigatorParamList,
  PlayerBottomTabNavigatorParamList,
} from "../../routers/Types";
import {
  getAllMeetUpVenue,
  MEET_UP_VENUE,
} from "../../services/MeetUpVenueServices";
import { formatCoreUrl } from "../../services/ServiceUtil";
import { formatUtcToLocalDate } from "../../utils/date";
import { getTranslation } from "../../utils/translation";
import { VenueFilteringForm } from "../VenueFiltering";
import VenueItemCard from "./VenueItemCard";
import ClockIcon from "../../components/Icons/ClockIcon";
import ClockArrowIcon from "../../components/Icons/ClockArrowIcon";
import { useAuth } from "../../hooks/UseAuth";
import { UserType } from "../../models/User";

const t = getTranslation(["screen.PlayerScreens.VenueList", "formInput"]);

export type VenueListScreenNavigationProp = CompositeNavigationProp<
  BottomTabNavigationProp<PlayerBottomTabNavigatorParamList, "VenueList">,
  NativeStackNavigationProp<MainStackNavigatorParamList>
>;

export type VenueListRouteProp = RouteProp<
  PlayerBottomTabNavigatorParamList,
  "VenueList"
>;

function processFilteringForm(
  filterValue: VenueFilteringForm | null,
  navigation: VenueListScreenNavigationProp
) {
  if (!filterValue) {
    return [];
  }
  const filterList = [];

  if (filterValue?.areaText) {
    filterList.push({
      label: filterValue?.areaText || t("Area"),
      isActive: !!filterValue?.areaText,
      onPress: () => navigation.navigate("VenueFiltering", { filterValue }),
    });
  }

  if (filterValue?.districtText) {
    filterList.push({
      label: filterValue?.districtText ?? t("District"),
      isActive: !!filterValue?.districtText,
      onPress: () => navigation.navigate("VenueFiltering", { filterValue }),
    });
  }

  if (filterValue?.date) {
    filterList.push({
      label: filterValue?.date ?? t("Date"),
      isActive: !!filterValue?.date,
      onPress: () => navigation.navigate("VenueFiltering", { filterValue }),
    });
  }

  if (!!filterValue?.from || !!filterValue?.to) {
    let timeLabel = t("Time");
    if (filterValue?.from && filterValue?.to) {
      timeLabel = `${t("From")} ${filterValue?.from} - ${t("To")} ${
        filterValue?.to
      }`;
    } else if (filterValue?.from) {
      timeLabel = `${t("From")} ${filterValue.from}`;
    } else if (filterValue?.to) {
      timeLabel = `${t("To")} ${filterValue.to}`;
    }

    filterList.push({
      label: timeLabel,
      isActive: !!filterValue?.from || !!filterValue?.to,
      onPress: () => navigation.navigate("VenueFiltering", { filterValue }),
    });
  }
  // if (filterValue?.price) {
  //   filterList.push({
  //     label: filterValue?.price
  //       ? `${filterValue.price[0]} ${"hkd"} - ${filterValue.price[1]} ${"hkd"}`
  //       : t("Cost"),
  //     isActive: !!filterValue?.price,
  //     onPress: () => navigation.navigate("VenueFiltering", { filterValue }),
  //   });
  // }

  if (filterValue?.min && filterValue?.max) {
    filterList.push({
      label:
        filterValue?.min && filterValue?.max
          ? `${filterValue.min} ${"hkd"} - ${filterValue.max} ${"hkd"}`
          : t("Cost"),
      isActive: !!(filterValue?.min && filterValue?.max),
      onPress: () => navigation.navigate("VenueFiltering", { filterValue }),
    });
  }

  return filterList.sort(
    (x, y) => Number(y.isActive) - Number(x.isActive)
  ) as FilterBadgeProps[];
}

interface VenueListScreenProps {
  navigation: VenueListScreenNavigationProp;
  route: VenueListRouteProp;
}

export default function VenueList({ navigation, route }: VenueListScreenProps) {
  const initeValue = {
    area: undefined,
    areaText: undefined,
    date: formatUtcToLocalDate(new Date()),
    district: undefined,
    districtText: undefined,
    from: undefined,
    to: undefined,
    min: undefined,
    max: undefined,
  };
  let [filterValue] = useState<VenueFilteringForm | null>(initeValue);
  if (route.params) ({ filterValue } = route.params);
  const filteredBadgeOptions = useRef<FilterBadgeProps[]>(
    processFilteringForm(filterValue, navigation)
  );
  const { control } = useForm({ mode: "onChange" });
  const [badgeOptions, setBadgeOptions] = useState<FilterBadgeProps[]>(
    filteredBadgeOptions.current
  );
  const { data, isValidating, mutate, error } = useSWR<Venue[]>(
    formatCoreUrl(MEET_UP_VENUE),
    (path) => {
      return getAllMeetUpVenue(path, filterValue);
    }
  );
  // useFocusEffect(
  //   React.useCallback(() => {
  //     mutate();
  //   }, [mutate])
  // );

  const { user } = useAuth();

  useEffect(() => {
    if (route.params) {
      mutate();
      setBadgeOptions(
        processFilteringForm(route.params.filterValue, navigation)
      );
    }
  }, [mutate, navigation, route.params]);

  useEffect(() => {
    setBadgeOptions(processFilteringForm(filterValue, navigation));
  }, [filterValue, navigation]);

  const renderTags = () => {
    return <FilterBadge options={badgeOptions} />;
  };

  const renderSearchBar = () => {
    return (
      <FormInput
        label={t("Search")}
        controllerProps={{
          name: "search",
          control,
        }}
        containerProps={{ px: "defaultLayoutSpacing" }}
        inputProps={{
          InputLeftElement: <MagnifyingGlassIcon size="lg" ml="4" />,
          color: "rs_secondary.grey",
          editable: false,
        }}
        onPress={() => {
          navigation.navigate("VenueFiltering", { filterValue });
        }}
      />
    );
  };
  const renderVenues = () => {
    if (isValidating) {
      return (
        <VStack flex="1" justifyContent="center" alignItems="center">
          <Spinner />
        </VStack>
      );
    }
    return (
      <VStack space="4" mx="defaultLayoutSpacing">
        <Text fontWeight="bold" fontSize="lg">
          {t("Recommended Venue")}
        </Text>
        {data &&
          data.length > 0 &&
          data.map((venue) => {
            return (
              <VenueItemCard
                key={venue.id}
                onPressVenueCard={(pressedVenue) => {
                  navigation.navigate("VenueDetail", {
                    venue: pressedVenue,
                  });
                }}
                venue={venue}
              />
            );
          })}
        {!isValidating && Array.isArray(data) && data.length === 0 && (
          <VStack space="4" alignItems="center">
            <RoundedRedCrossIcon mt="4" />
            <Text fontSize="md" fontWeight="bold">
              {t("No venue available")}
            </Text>
            <Text fontSize="md">{t("Please search again")}</Text>
          </VStack>
        )}
      </VStack>
    );
  };

  const rightButton = () => {
    if (
      user?.userType === UserType.Player ||
      user?.userType === UserType.Coach
    ) {
      return (
        <Pressable
          onPress={() => {
            navigation.navigate("BookingRecords");
          }}
        >
          <ClockArrowIcon size="2xl" />
        </Pressable>
      );
    }
  };

  return (
    <HeaderLayout
      headerProps={{
        title: t("Venue"),
        hasBackButton: false,
        headerLabelStyle: { fontSize: 16 },
        rightComponent: rightButton(),
      }}
      supportPullToRefresh
      onRefresh={() => {
        mutate();
      }}
    >
      <VStack space="4">
        {renderSearchBar()}
        {renderTags()}
        {renderVenues()}
      </VStack>
    </HeaderLayout>
  );
}
