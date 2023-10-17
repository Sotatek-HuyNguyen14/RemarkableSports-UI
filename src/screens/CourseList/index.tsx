import React from "react";
import { NativeStackScreenProps } from "@react-navigation/native-stack";
import { Button, HStack, Toast, useTheme, VStack } from "native-base";
import { LayoutAnimation } from "react-native";
import useSWR from "swr";
import { parseISO } from "date-fns";
import { useFocusEffect } from "@react-navigation/native";
import { MainStackNavigatorParamList } from "../../routers/Types";
import HeaderLayout from "../../components/Layout/HeaderLayout";
import { formatCoreUrl } from "../../services/ServiceUtil";
import { deleteCoursesById, getCourses } from "../../services/CourseServices";
import Loading from "../../components/Loading";
import ErrorMessage from "../../components/ErrorMessage";
import ConfirmationModal from "../../components/ConfirmationModal/ConfirmationModal";
import { getTranslation } from "../../utils/translation";
import GhostTabbar from "../../components/GhostTabBar";
import MessageToast, {
  MesssageToastType,
} from "../../components/Toast/MessageToast";
import BannerButton from "../../components/BannerButton";
import { showApiToastError } from "../../components/ApiToastError";
import CourseCard from "../../components/Card/CourseCard";
import NoDataComponent from "../../components/NoDataComponent";
import FlashListLayout from "../../components/Layout/FlashListLayout";

type CourseListProps = NativeStackScreenProps<
  MainStackNavigatorParamList,
  "CourseList"
>;

enum ActiveTab {
  Existing = "Existing",
  Past = "Past",
}
export const ACTION_TYPE = {
  edit: "Edit",
  delete: "Delete",
};
const DELETE_SUCCESSFUL_TOAST = "deleteSuccessful";
const COURSE_SESSION_ERROR = "course_session_error";
const t = getTranslation([
  "screen.ClubScreens.CourseList",
  "constant.button",
  "constant.tabType",
]);
// remove the use of isValidating
// Since useSWR already cached the course data, UI can draw the cards based on the current cache, and when there is update on data later on, rendering can update again
export default function CourseList({ navigation }: CourseListProps) {
  const {
    data: courseList,
    isValidating: courseValidating,
    error: courseError,
    mutate: courseMutate,
  } = useSWR(formatCoreUrl("/course"), getCourses);

  const [activeTabIndex, setActiveTabIndex] = React.useState(0);
  const theme = useTheme();
  useFocusEffect(
    React.useCallback(() => {
      courseMutate();
    }, [courseMutate])
  );
  const happeningCourses = courseList
    ?.sort((a, b) => {
      return new Date(b.fromDate).getTime() - new Date(a.fromDate).getTime();
    })
    ?.filter((val) => {
      if (val?.toDate && val?.endTime) {
        const endTime = parseISO(`${val?.toDate} ${val?.endTime}`);
        const isOutTime = endTime.getTime() < new Date().getTime();
        if (!isOutTime) {
          return val;
        }
      } else {
        return val;
      }
    });
  const finishedCourses = courseList
    ?.sort((a, b) => {
      return new Date(b.fromDate).getTime() - new Date(a.fromDate).getTime();
    })
    ?.filter((val) => {
      if (val?.toDate && val?.endTime) {
        const endTime = parseISO(`${val?.toDate} ${val?.endTime}`);
        const isOutTime = endTime.getTime() < new Date().getTime();
        if (isOutTime) {
          return val;
        }
      } else {
        return val;
      }
    });
  const availableTabs = [
    `${t(ActiveTab.Existing)} (${happeningCourses?.length || 0})`,
    `${t(ActiveTab.Past)} (${finishedCourses?.length || 0})`,
  ];

  const dataList: readonly any[] =
    activeTabIndex === 0 && !courseError && happeningCourses
      ? happeningCourses
      : activeTabIndex === 1 && !courseError && finishedCourses
      ? finishedCourses
      : [];

  const shouldShowEdit =
    activeTabIndex === 0 && !courseError && happeningCourses;

  const shouldShowManage = true;
  const headerComponent = (
    <VStack space="4" mb="2">
      <BannerButton
        headerLabel={t("Create Course")}
        description={t(
          "Tap here to create a new event and have fun with other player"
        )}
        onPress={() => {
          navigation.navigate("AddCourse");
        }}
      />
      <GhostTabbar
        boxProps={{ marginX: "defaultLayoutSpacing" }}
        items={availableTabs}
        onPress={(item: string, index: number) => {
          LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
          setActiveTabIndex(index);
        }}
        activateColor={theme.colors.rs.primary_purple}
        unActivateColor={theme.colors.rs.inputLabel_grey}
        tabProps={{ fontSize: 16 }}
        defaultIndex={activeTabIndex}
      />
      {courseList && courseError && <ErrorMessage />}
    </VStack>
  );
  const emptyOrloading = () => {
    return (
      <VStack>
        {courseError && <ErrorMessage />}
        {!courseError &&
          activeTabIndex === 0 &&
          (!courseList || (courseList && courseList.length === 0)) && (
            <NoDataComponent />
          )}
        {!courseError &&
          activeTabIndex === 1 &&
          (!happeningCourses ||
            (happeningCourses && happeningCourses.length === 0)) && (
            <NoDataComponent />
          )}
        {!courseError &&
          activeTabIndex === 2 &&
          (!finishedCourses ||
            (finishedCourses && finishedCourses.length === 0)) && (
            <NoDataComponent />
          )}
      </VStack>
    );
  };

  if (courseValidating) {
    return <Loading />;
  }

  return (
    <FlashListLayout
      headerProps={{
        title: t("CourseList"),
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
                course={item}
                footer={
                  <HStack space={3}>
                    <Button
                      py="2"
                      flex={1}
                      onPress={() => {
                        navigation.navigate("ManageCourse", {
                          course: item,
                        });
                      }}
                      _text={{ fontSize: 14 }}
                    >
                      {t("Manage")}
                    </Button>
                    {shouldShowEdit && (
                      <Button
                        py="2"
                        _text={{ fontSize: 14, color: "rs.primary_purple" }}
                        flex={1}
                        variant="outline"
                        onPress={() => {
                          navigation.navigate("UpdateCourse", {
                            course: item,
                          });
                        }}
                      >
                        {t("Edit")}
                      </Button>
                    )}
                  </HStack>
                }
              />
            </VStack>
          </VStack>
        ),
        keyExtractor: (item) => `${item.id}`,
        ListHeaderComponent: headerComponent,
        ListEmptyComponent: emptyOrloading,
      }}
      supportPullToRefresh
      onRefresh={() => {
        courseMutate();
      }}
    />
  );
}
