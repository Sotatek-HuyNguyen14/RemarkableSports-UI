import React, { useCallback, useEffect, useRef, useState } from "react";
import { Box, Circle, HStack, Pressable, useTheme, VStack } from "native-base";
import { Keyboard } from "react-native";
import { useForm } from "react-hook-form";
import axios from "axios";
import useSWR from "swr";
import { parseISO } from "date-fns";
import { NativeStackScreenProps } from "@react-navigation/native-stack";
import { uniqueId } from "lodash";
import HeaderLayout from "../../../components/Layout/HeaderLayout";
import { getTranslation } from "../../../utils/translation";
import { MainStackNavigatorParamList } from "../../../routers/Types";
import FormInput from "../../../components/FormInput/FormInput";
import MagnifyingGlassIcon from "../../../components/Icons/MagnifyingGlassIcon";
import { CourseResponse } from "../../../models/responses/Course";
import { formatCoreUrl } from "../../../services/ServiceUtil";
import { PlayerAppliedStatus } from "../../../models/Response";
import Loading from "../../../components/Loading";
import ErrorMessage from "../../../components/ErrorMessage";
import CourseListComponent from "../../../components/CourseList";
import processCourseFilteringFormInput from "../../../utils/formInputProcesser";
import NoDataComponent from "../../../components/NoDataComponent";
import CrossIcon from "../../../components/Icons/RoundedCrossIcon";
import FlashListLayout from "../../../components/Layout/FlashListLayout";
import CourseCard from "../../../components/Card/CourseCard";
import { isBlank } from "../../../utils/strings";

const t = getTranslation([
  "constant.area",
  "constant.district",
  "constant.profile",
  "screen.PlayerScreens.SearchCourse",
  "constant.button",
  "validation",
  "formInput",
]);

export type SearchCourseScreenProps = NativeStackScreenProps<
  MainStackNavigatorParamList,
  "PlayerSearchCourse"
>;

interface FormValue {
  search: string;
}

export default function SearchCourse({
  route,
  navigation,
}: SearchCourseScreenProps) {
  const { control, watch } = useForm({
    mode: "onChange",
    defaultValues: {
      search: "",
    },
  });
  const filterValue = watch("search");

  const [searchWords, setSearchWords] = useState(filterValue);
  const { data, error, isValidating, mutate } = useSWR<CourseResponse[]>(
    formatCoreUrl("/course"),
    () =>
      axios.get(formatCoreUrl("/course")).then((res) => {
        return res.data;
      })
  );

  const availableCourses =
    data &&
    data.filter((course) => {
      const endTime = parseISO(`${course?.toDate} ${course?.endTime}`);
      const isOutTime = endTime.getTime() < new Date().getTime();
      return (
        course.playerAppliedStatus === PlayerAppliedStatus.Null && !isOutTime
      );
    });

  const courses = availableCourses
    ? availableCourses.filter((course) => {
        if (isBlank(searchWords)) {
          return true;
        }
        return course.name.toLowerCase().includes(searchWords.toLowerCase());
      })
    : [];

  useEffect(() => {
    const subscribe = Keyboard.addListener("keyboardDidHide", (keyEvent) => {
      //  keyboard Did Hide to search
      setSearchWords(filterValue);
    });
    return () => subscribe?.remove();
  }, [filterValue]);

  const emptyComponent =
    (isValidating && <Loading />) ||
    (!isValidating && (
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
    ));

  const headerComponent = (
    <VStack space="4" flex={1} mb="4">
      <HStack alignItems="center">
        <FormInput
          label={t("Search")}
          controllerProps={{
            name: "search",
            control,
          }}
          containerProps={{ px: "defaultLayoutSpacing", flex: 1 }}
          inputProps={{
            InputRightElement: (
              <Pressable
                onPress={() => {
                  setSearchWords(filterValue);
                }}
              >
                <MagnifyingGlassIcon flex={1} size="lg" mr="4" />
              </Pressable>
            ),
            bgColor: "rs.grey",
          }}
        />
      </HStack>
      {error && <ErrorMessage />}
    </VStack>
  );

  if (isValidating) {
    return <Loading />;
  }

  return (
    <FlashListLayout
      headerProps={{
        title: t("Search Course"),
        containerStyle: {
          marginHorizontal: 0,
        },
      }}
      isSticky
      flashListProps={{
        data: courses,
        renderItem: ({ item }) => (
          <VStack space="4" mx="defaultLayoutSpacing" flex={1}>
            <VStack space="4" mb="5">
              <CourseCard
                onPress={() => {
                  navigation.navigate("PlayerCourseDetails", {
                    course: item,
                  });
                }}
                key={`${item.id}${item.district}`}
                course={item}
              />
            </VStack>
          </VStack>
        ),
        keyExtractor: (item) => `${item.id}${item.district}`,
        ListHeaderComponent: headerComponent,
        ListEmptyComponent: Loading,
      }}
      supportPullToRefresh
      onRefresh={() => {
        mutate();
      }}
    />
    // <HeaderLayout
    //   headerProps={{
    //     title: t("Search Course"),
    //     containerStyle: {
    //       marginHorizontal: 0,
    //     },
    //   }}
    //   isSticky
    //   supportPullToRefresh
    //   onRefresh={() => {
    //     mutate();
    //   }}
    // >
    //   {headerComponent}
    //   {courses && courses.length === 0 && emptyComponent}
    //   {courses &&
    //     courses.length > 0 &&
    //     courses.map((item) => {
    //       return (
    //         <VStack space="4" mx="defaultLayoutSpacing" flex={1}>
    //           <VStack space="4" mb="5">
    //             <CourseCard
    //               onPress={() => {
    //                 navigation.navigate("PlayerCourseDetails", {
    //                   course: item,
    //                 });
    //               }}
    //               key={`${item.id}${item.district}`}
    //               course={item}
    //             />
    //           </VStack>
    //         </VStack>
    //       );
    //     })}
    // </HeaderLayout>
  );
}
