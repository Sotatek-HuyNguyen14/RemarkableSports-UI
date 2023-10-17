import React, { useCallback, useEffect, useRef, useState } from "react";
import {
  Heading,
  Pressable,
  VStack,
  Text,
  useTheme,
  HStack,
  ScrollView,
  Box,
} from "native-base";
import { useForm } from "react-hook-form";
import useSWR from "swr";
import axios from "axios";
import { BottomTabNavigationProp } from "@react-navigation/bottom-tabs";
import {
  CompositeNavigationProp,
  RouteProp,
  useFocusEffect,
  useIsFocused,
} from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";

import { uniqueId } from "lodash";
import { parseISO } from "date-fns";
import { Animated, Keyboard, LayoutAnimation } from "react-native";
import { FilterBadgeProps } from "../../../components/Badge/FilterBadge";
import CourseCard from "../../../components/Card/CourseCard";
import FilterBadge from "../../../components/FilterList";
import FormInput from "../../../components/FormInput/FormInput";
import MagnifyingGlassIcon from "../../../components/Icons/MagnifyingGlassIcon";
import HeaderLayout from "../../../components/Layout/HeaderLayout";
import { CourseFilteringFormValues } from "../CourseFiltering";
import {
  MainStackNavigatorParamList,
  PlayerBottomTabNavigatorParamList,
} from "../../../routers/Types";
import { formatCoreUrl } from "../../../services/ServiceUtil";
import RoundedRedCrossIcon from "../../../components/Icons/RoundedRedCrossIcon";
import processCourseFilteringFormInput from "../../../utils/formInputProcesser";
import Loading from "../../../components/Loading";
import ErrorMessage from "../../../components/ErrorMessage";
import { getTranslation } from "../../../utils/translation";
import { CourseResponse } from "../../../models/responses/Course";
import GhostTabbar from "../../../components/GhostTabBar";
import CourseListComponent from "../../../components/CourseList";
import { CourseApplicationStatus } from "../../../models/responses/CourseApplication";
import { PlayerAppliedStatus } from "../../../models/Response";
import FlashListLayout from "../../../components/Layout/FlashListLayout";
import NoDataComponent from "../../../components/NoDataComponent";
import { SCREEN_WIDTH } from "../../../constants/constants";
import WrapCardSlider from "../../../components/WrapCardSlider";
import FilterIconV2 from "../../../components/Icons/FilterIconV2";
import FilterComponent from "../../../components/FilterComponent";
import { isBlank } from "../../../utils/strings";

const t = getTranslation([
  "screen.PlayerScreens.CourseList",
  "constant.button",
  "formInput",
  "constant.tabType",
]);

export type PlayerCourseListNavigationProp = CompositeNavigationProp<
  BottomTabNavigationProp<
    PlayerBottomTabNavigatorParamList,
    "PlayerCourseList"
  >,
  NativeStackNavigationProp<MainStackNavigatorParamList>
>;

export type PlayerCourseListRouteProp = RouteProp<
  PlayerBottomTabNavigatorParamList,
  "PlayerCourseList"
>;

interface PlayerCourseListScreenProps {
  navigation: PlayerCourseListNavigationProp;
  route: PlayerCourseListRouteProp;
}

interface FormValue {
  search: string;
}

function processFilteringForm(
  filterValue: CourseFilteringFormValues | null,
  navigation: PlayerCourseListNavigationProp
) {
  if (!filterValue) {
    return [];
  }

  const filterList = [];
  if (filterValue?.areaText) {
    filterList.push({
      label: filterValue?.areaText || t("Area"),
      isActive: !!filterValue?.areaText,
      onPress: () =>
        navigation.navigate("PlayerCourseFiltering", { filterValue }),
    });
  }
  if (filterValue?.districtText) {
    filterList.push({
      label: filterValue?.districtText || t("District"),
      isActive: !!filterValue?.districtText,
      onPress: () =>
        navigation.navigate("PlayerCourseFiltering", { filterValue }),
    });
  }
  if (filterValue?.fromDate) {
    filterList.push({
      label: filterValue?.fromDate || t("Date"),
      isActive: !!filterValue?.fromDate,
      onPress: () =>
        navigation.navigate("PlayerCourseFiltering", { filterValue }),
    });
  }
  if (!!filterValue?.from || !!filterValue?.to) {
    filterList.push({
      label:
        filterValue?.from && filterValue?.to
          ? `${t("From")} ${filterValue?.from} - ${t("To")} ${filterValue?.to}`
          : filterValue?.from
          ? `${t("From")} ${filterValue.from}`
          : filterValue?.to
          ? `${t("To")} ${filterValue.to}`
          : t("Time"),
      isActive: !!filterValue?.from || !!filterValue?.to,
      onPress: () =>
        navigation.navigate("PlayerCourseFiltering", { filterValue }),
    });
  }
  // if (filterValue?.price) {
  //   filterList.push({
  //     label: filterValue?.price
  //       ? `${filterValue.price[0]} hkd - ${filterValue.price[1]} hkd`
  //       : t("Cost"),
  //     isActive: !!filterValue?.price,
  //     onPress: () =>
  //       navigation.navigate("PlayerCourseFiltering", { filterValue }),
  //   });
  // }

  if (filterValue?.min && filterValue?.max) {
    filterList.push({
      label:
        filterValue?.min && filterValue?.max
          ? `${filterValue.min} ${"hkd"} - ${filterValue.max} ${"hkd"}`
          : t("Cost"),
      isActive: !!(filterValue?.min && filterValue?.max),
      onPress: () =>
        navigation.navigate("PlayerCourseFiltering", { filterValue }),
    });
  }

  if (filterValue?.level) {
    filterList.push({
      label: filterValue?.levelText || t("Level"),
      isActive: !!filterValue?.level,
      onPress: () =>
        navigation.navigate("PlayerCourseFiltering", { filterValue }),
    });
  }

  return filterList.sort(
    (x, y) => Number(y.isActive) - Number(x.isActive)
  ) as FilterBadgeProps[];
}

enum ActiveTab {
  Pending = "Pending",
  Upcoming = "Upcoming",
  Completed = "Completed",
}

export default function PlayerCourseList({
  route,
  navigation,
}: PlayerCourseListScreenProps) {
  let filterValue: CourseFilteringFormValues | null = null;

  if (route.params) ({ filterValue } = route.params);

  const filteredBadgeOptions = useRef<FilterBadgeProps[]>(
    processFilteringForm(filterValue, navigation)
  );
  const scrollX = useRef(new Animated.Value(0)).current;

  const { control, watch } = useForm<FormValue>({ mode: "onChange" });
  const [searchWords, setSearchWords] = useState("");
  const searchQuery = watch("search");
  const [badgeOptions, setBadgeOptions] = useState<FilterBadgeProps[]>(
    filteredBadgeOptions.current
  );
  const [activeTabIndex, setActiveTabIndex] = React.useState(0);
  const [recommendedThree, setRecommendedThree] = useState<CourseResponse[]>(
    []
  );
  const { data, error, isValidating, mutate } = useSWR<CourseResponse[]>(
    formatCoreUrl("/course"),
    () =>
      axios
        .get(formatCoreUrl("/course"), {
          params: filterValue
            ? processCourseFilteringFormInput(filterValue)
            : null,
        })
        .then((res) => res.data)
  );

  const isFocused = useIsFocused();

  useEffect(() => {
    const subscribe = Keyboard.addListener("keyboardDidHide", (keyEvent) => {
      if (!isBlank(searchQuery) && isFocused) {
        navigation.navigate("AllCourses", { filterText: searchQuery });
      }
    });
    return () => subscribe?.remove();
  }, [navigation, searchQuery, isFocused]);

  useFocusEffect(
    React.useCallback(() => {
      mutate();
      const recommendeds =
        data &&
        data
          .filter((course) => {
            const endTime = parseISO(`${course?.toDate} ${course?.endTime}`);
            const isOutTime = endTime.getTime() < new Date().getTime();
            return (
              course.playerAppliedStatus === PlayerAppliedStatus.Null &&
              !isOutTime
            );
          })
          ?.sort(() => 0.5 - Math.random())
          ?.slice(0, 3);
      setRecommendedThree(recommendeds || []);
    }, [data, mutate])
  );

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

  const courseList = data;
  const appliedCourses = courseList
    ?.sort((a, b) => {
      return new Date(b.fromDate).getTime() - new Date(a.fromDate).getTime();
    })
    ?.filter((val) => {
      const endTime = parseISO(`${val?.toDate} ${val?.endTime}`);
      const isOutTime = endTime.getTime() < new Date().getTime();
      return (
        val.playerAppliedStatus === PlayerAppliedStatus.Applied && !isOutTime
      );
    });
  const happeningCourses = courseList
    ?.sort((a, b) => {
      return new Date(b.fromDate).getTime() - new Date(a.fromDate).getTime();
    })
    ?.filter((val) => {
      const endTime = parseISO(`${val?.toDate} ${val?.endTime}`);
      const isOutTime = endTime.getTime() < new Date().getTime();
      return (
        val.playerAppliedStatus === PlayerAppliedStatus.Accepted && !isOutTime
      );
    });
  const finishedCourses = courseList
    ?.sort((a, b) => {
      return new Date(b.fromDate).getTime() - new Date(a.fromDate).getTime();
    })
    ?.filter((val) => {
      if (val?.toDate && val?.endTime) {
        const endTime = parseISO(`${val?.toDate} ${val?.endTime}`);
        const isOutTime = endTime.getTime() < new Date().getTime();
        return (
          isOutTime && val.playerAppliedStatus === PlayerAppliedStatus.Accepted
        );
      }
      return val.playerAppliedStatus === PlayerAppliedStatus.Accepted;
    });
  const availableTabs = [
    `${t(ActiveTab.Pending)} (${appliedCourses?.length || 0})`,
    `${t(ActiveTab.Upcoming)} (${happeningCourses?.length || 0})`,
    `${t(ActiveTab.Completed)} (${finishedCourses?.length || 0})`,
  ];

  const theme = useTheme();
  const [isCourseViewAll, setViewAll] = useState(false);

  const recommendedCourse =
    data &&
    data.filter((course) => {
      const endTime = parseISO(`${course?.toDate} ${course?.endTime}`);
      const isOutTime = endTime.getTime() < new Date().getTime();
      return (
        course.playerAppliedStatus === PlayerAppliedStatus.Null && !isOutTime
      );
    })[0];

  const availableCourses =
    data &&
    data.filter((course) => {
      const endTime = parseISO(`${course?.toDate} ${course?.endTime}`);
      const isOutTime = endTime.getTime() < new Date().getTime();
      return (
        course.playerAppliedStatus === PlayerAppliedStatus.Null && !isOutTime
      );
    });

  const dataList: readonly any[] =
    activeTabIndex === 0 && !error && appliedCourses
      ? appliedCourses
      : activeTabIndex === 1 && !error && happeningCourses
      ? happeningCourses
      : activeTabIndex === 2 && !error && finishedCourses
      ? finishedCourses
      : [];

  const headerComponent = (
    <VStack space="4" mx="defaultLayoutSpacing">
      <HStack alignItems="center" space="3">
        <FormInput
          label={t("Search")}
          controllerProps={{
            name: "search",
            control,
          }}
          isBorderEnabled={false}
          containerProps={{
            flex: 1,
            bg: "rs.grey",
            borderRadius: "2xl",
            bgColor: "rs.grey",
            borderColor: "rs.grey",
            borderWidth: 0,
            shadow: "none",
          }}
          inputProps={{
            InputRightElement: (
              <Pressable
                onPress={() => {
                  setSearchWords(searchQuery);
                }}
              >
                <MagnifyingGlassIcon flex={1} size="lg" mr="4" />
              </Pressable>
            ),
            bgColor: "rs.grey",
            borderColor: "rs.grey",
            borderWidth: "0",
            shadow: "none",
            _focus: { borderColor: "rs.grey" },
          }}
        />

        <Pressable
          p={4}
          borderRadius="2xl"
          bg="#F6F6F6"
          alignItems="center"
          justifyContent="center"
          onPress={() => {
            navigation.navigate("PlayerCourseFiltering", { filterValue });
          }}
        >
          <FilterIconV2 />
        </Pressable>
      </HStack>
      <HStack justifyContent="space-between">
        <Heading>
          {isCourseViewAll
            ? t("All available courses")
            : t("Recommended Course")}
        </Heading>
        <Pressable
          onPress={() => {
            navigation.navigate("AllCourses");
          }}
        >
          <Text color="rs.primary_purple">
            {isCourseViewAll ? t("Collapse") : t("View all")}
          </Text>
        </Pressable>
      </HStack>
      {recommendedCourse && !isCourseViewAll && (
        <WrapCardSlider>
          {recommendedThree?.length > 0 &&
            recommendedThree.map((course) => (
              <CourseCard
                key={uniqueId()}
                boxProps={{
                  width: SCREEN_WIDTH - 32,
                  shadow: 0,
                  _pressed: { opacity: 1 },
                }}
                onPress={() => {
                  navigation.navigate("PlayerCourseDetails", {
                    course,
                  });
                }}
                course={course}
              />
            ))}
        </WrapCardSlider>
      )}
      <GhostTabbar
        items={availableTabs}
        onPress={(item: string, index: number) => {
          LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
          setActiveTabIndex(index);
        }}
        defaultIndex={activeTabIndex}
        activateColor={theme.colors.rs.primary_purple}
        unActivateColor={theme.colors.rs.inputLabel_grey}
        tabProps={{ fontSize: 16 }}
      />
      <VStack space="4" />
    </VStack>
  );
  const emptyOrloading = () => {
    return (
      <VStack>
        {error && <ErrorMessage />}
        {!error &&
          activeTabIndex === 0 &&
          (!appliedCourses ||
            (appliedCourses && appliedCourses.length === 0)) && (
            <NoDataComponent />
          )}
        {!error &&
          activeTabIndex === 1 &&
          (!happeningCourses ||
            (happeningCourses && happeningCourses.length === 0)) && (
            <NoDataComponent />
          )}
        {!error &&
          activeTabIndex === 2 &&
          (!finishedCourses ||
            (finishedCourses && finishedCourses.length === 0)) && (
            <NoDataComponent />
          )}
      </VStack>
    );
  };

  if (isValidating) {
    return <Loading />;
  }
  return (
    <FlashListLayout
      headerProps={{
        title: t("Course"),
        containerStyle: { marginHorizontal: 4 },
        hasBackButton: false,
      }}
      isSticky
      flashListProps={{
        data: dataList,
        renderItem: ({ item }) => (
          <VStack space="4" mx="defaultLayoutSpacing">
            <VStack space="4" mb="5">
              <CourseCard
                onPress={() => {
                  navigation.navigate("PlayerCourseDetails", {
                    course: item,
                  });
                }}
                key={`${item.id}`}
                course={item}
              />
            </VStack>
          </VStack>
        ),
        keyExtractor: (item) => `${item.id}`,
        ListHeaderComponent: headerComponent,
        ListEmptyComponent: emptyOrloading(),
      }}
      supportPullToRefresh
      onRefresh={() => {
        mutate();
      }}
    />
  );
}
