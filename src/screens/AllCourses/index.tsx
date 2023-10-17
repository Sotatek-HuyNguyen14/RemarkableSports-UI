import React, { useCallback, useEffect, useRef, useState } from "react";
import { Box, Circle, Text, HStack, Pressable, VStack } from "native-base";
import { useForm } from "react-hook-form";
import useSWR from "swr";
import axios from "axios";
import { useFocusEffect } from "@react-navigation/native";
import { NativeStackScreenProps } from "@react-navigation/native-stack";
import { parseISO } from "date-fns";
import { uniqueId } from "lodash";
import { Keyboard } from "react-native";
import { FilterBadgeProps } from "../../components/Badge/FilterBadge";
import FilterBadge from "../../components/FilterList";
import FormInput from "../../components/FormInput/FormInput";
import MagnifyingGlassIcon from "../../components/Icons/MagnifyingGlassIcon";
import HeaderLayout from "../../components/Layout/HeaderLayout";
import { CourseFilteringFormValues } from "../PlayerScreens/CourseFiltering/index";
import { MainStackNavigatorParamList } from "../../routers/Types";
import { formatCoreUrl } from "../../services/ServiceUtil";
import processCourseFilteringFormInput from "../../utils/formInputProcesser";
import Loading from "../../components/Loading";
import ErrorMessage from "../../components/ErrorMessage";
import { getTranslation } from "../../utils/translation";
import { CourseResponse } from "../../models/responses/Course";
import CourseListComponent from "../../components/CourseList";
import { PlayerAppliedStatus } from "../../models/Response";
import FilterIconV2 from "../../components/Icons/FilterIconV2";
import NoDataComponent from "../../components/NoDataComponent";
import TipDialogIcon from "../../components/Icons/TipDialogIcon";
import TipSuccessIcon from "../../components/Icons/TipSuccessIcon";
import CrossIcon from "../../components/Icons/RoundedCrossIcon";
import CourseCard from "../../components/Card/CourseCard";
import FlashListLayout from "../../components/Layout/FlashListLayout";
import { isBlank } from "../../utils/strings";
import CustomInput from "../../components/FormInput/CustomInput";

const t = getTranslation([
  "screen.PlayerScreens.CourseList",
  "constant.button",
  "constant.weekLong",
  "screen.PlayerScreens.CourseFiltering",
  "formInput",
]);

interface FormValue {
  search: string;
}

export type AllCoursesProps = NativeStackScreenProps<
  MainStackNavigatorParamList,
  "AllCourses"
>;

function processFilteringForm(
  filterValue: CourseFilteringFormValues | null,
  navigation: any
) {
  if (!filterValue) {
    return [];
  }

  const filterList = [];
  if (filterValue.daysOfWeek) {
    const sorter = {
      monday: 1,
      tuesday: 2,
      wednesday: 3,
      thursday: 4,
      friday: 5,
      saturday: 6,
      sunday: 7,
    };
    filterList.push({
      label:
        filterValue.daysOfWeek
          .sort((a, b) => {
            const day1 = a.toLowerCase();
            const day2 = b.toLowerCase();
            return sorter[day1] - sorter[day2];
          })
          .map((d) => {
            return t(d.slice(0, 3));
          })
          .join(", ") || t("Day of week"),
      isActive: !!filterValue?.daysOfWeek,
      onPress: () =>
        navigation.navigate("PlayerCourseFiltering", { filterValue }),
    });
  }
  if (filterValue?.clubName) {
    filterList.push({
      label: filterValue?.clubName || t("Club Name"),
      isActive: !!filterValue?.clubName,
      onPress: () =>
        navigation.navigate("PlayerCourseFiltering", { filterValue }),
    });
  }
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

export default function AllCourses({ route, navigation }: AllCoursesProps) {
  let filterValue: CourseFilteringFormValues | null = null;
  let filterText: string | undefined = "";
  if (route.params) ({ filterValue, filterText } = route.params);

  const filteredBadgeOptions = useRef<FilterBadgeProps[]>(
    processFilteringForm(filterValue, navigation)
  );

  const { control, watch } = useForm<FormValue>({
    mode: "onChange",
    defaultValues: {
      search: !isBlank(filterText) ? filterText : undefined,
    },
  });
  const [searchWords, setSearchWords] = useState(
    !isBlank(filterText) ? filterText : ""
  );
  const searchQuery = watch("search");
  const [badgeOptions, setBadgeOptions] = useState<FilterBadgeProps[]>(
    filteredBadgeOptions.current
  );

  useEffect(() => {
    const subscribe = Keyboard.addListener("keyboardDidHide", (keyEvent) => {
      //  keyboard Did Hide to search
      setSearchWords(searchQuery);
    });
    return () => subscribe?.remove();
  }, [searchQuery]);

  const { data, error, isValidating, mutate } = useSWR<CourseResponse[]>(
    [formatCoreUrl("/course"), filterValue],
    (path, value) => {
      if (
        filterValue &&
        filterValue.daysOfWeek &&
        filterValue.daysOfWeek.length > 0
      ) {
        return axios
          .get(
            `${formatCoreUrl(
              "/course"
            )}?daysOfWeek=${filterValue?.daysOfWeek.join(",")}`,
            {
              params: filterValue
                ? processCourseFilteringFormInput(filterValue)
                : null,
            }
          )
          .then((res) => res.data);
      }
      return axios
        .get(`${formatCoreUrl("/course")}`, {
          params: filterValue
            ? processCourseFilteringFormInput(filterValue)
            : null,
        })
        .then((res) => res.data);
    }
  );

  // useFocusEffect(
  //   React.useCallback(() => {
  //     mutate();
  //   }, [mutate])
  // );

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

  const availableCourses =
    data &&
    data
      .filter((course) => {
        const endTime = parseISO(`${course?.toDate} ${course?.endTime}`);
        const isOutTime = endTime.getTime() < new Date().getTime();
        return (
          course.playerAppliedStatus === PlayerAppliedStatus.Null && !isOutTime
        );
      })
      .filter((course) => {
        if (searchWords && !isBlank(searchWords)) {
          return course.name.toLowerCase().includes(searchWords.toLowerCase());
        }
        return true;
      });

  const emptyComponent = (
    <NoDataComponent
      logoIcon={
        <Circle
          size={12}
          alignItems="center"
          justifyContent="center"
          bg="rgba(233,16,16,0.15)"
        >
          <CrossIcon />
        </Circle>
      }
      title={t("No result found")}
      content={t("We cannot find any course matching your search yet")}
    />
  );
  const headerComponent = (
    <VStack space="4">
      <HStack alignItems="center" mx="defaultLayoutSpacing" space="3">
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
      <FilterBadge options={badgeOptions} />
      <VStack space="4" />
    </VStack>
  );

  const renderItem = useCallback(
    ({ item }: any) => (
      <VStack space="4" mx="defaultLayoutSpacing">
        {error && <ErrorMessage />}
        <VStack space="4" mb="5">
          <Pressable
            key={`${item.id}${item.district}`}
            onPress={() => {
              navigation.navigate("PlayerCourseDetails", {
                course: item,
              });
            }}
          >
            <CourseCard
              onPress={() => {
                navigation.navigate("PlayerCourseDetails", {
                  course: item,
                });
              }}
              key={`${item.id}${item.district}`}
              course={item}
            />
          </Pressable>
        </VStack>
      </VStack>
    ),
    [navigation, error]
  );

  if (isValidating) {
    return <Loading />;
  }
  return (
    <FlashListLayout
      headerProps={{
        title: t("All available courses"),
        containerStyle: { marginHorizontal: 4 },
      }}
      isSticky
      flashListProps={{
        data: availableCourses,
        renderItem: ({ item }) => (
          <VStack space="4" mx="defaultLayoutSpacing">
            {error && <ErrorMessage />}
            <VStack space="4" mb="5">
              <CourseCard
                onPress={() => {
                  navigation.navigate("PlayerCourseDetails", {
                    course: item,
                  });
                }}
                course={item}
              />
            </VStack>
          </VStack>
        ),
        keyExtractor: (item) => `${item.id}${item.district}`,
        ListHeaderComponent: headerComponent,
        ListEmptyComponent: emptyComponent,
      }}
      supportPullToRefresh
      onRefresh={() => {
        mutate();
      }}
    />
  );
}
