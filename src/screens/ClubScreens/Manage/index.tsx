import { useFocusEffect } from "@react-navigation/native";
import { NativeStackScreenProps } from "@react-navigation/native-stack";
import axios from "axios";
import {
  Button,
  Heading,
  HStack,
  Pressable,
  Spinner,
  Toast,
  VStack,
} from "native-base";
import React, { useEffect, useState } from "react";
import useSWR from "swr";
import { showApiToastError } from "../../../components/ApiToastError";
import BannerButton from "../../../components/BannerButton";
import CourseBookingCard from "../../../components/Card/CourseBookingCard";
import HeaderLayout from "../../../components/Layout/HeaderLayout";
import MessageToast, {
  MesssageToastType,
} from "../../../components/Toast/MessageToast";
import VenueBookingList from "../../../components/VenueBookingList";
import { VenueBooking, VenueBookingStatus } from "../../../models/Booking";
import {
  Action,
  CourseBookingResponse,
  CourseBookingStatus,
} from "../../../models/Response";
import { MainStackNavigatorParamList } from "../../../routers/Types";
import {
  MEET_UP_COURSE,
  updateCourseBooking,
} from "../../../services/CourseBookingServices";
import { formatMeetupApiUrl } from "../../../services/ServiceUtil";
import { approveVenueBooking } from "../../../services/VenueBooking";
import { getTranslation } from "../../../utils/translation";

const t = getTranslation("screen.ClubScreens.Manage");

export type ManageScreenNavigationProps = NativeStackScreenProps<
  MainStackNavigatorParamList,
  "ClubNavigator"
>;

enum ActiveTab {
  Course = "Course",
  Venue = "Venue",
}

const availableTabs = [ActiveTab.Course, ActiveTab.Venue];

export default function Manage({ navigation }: ManageScreenNavigationProps) {
  const [activeTab, setActiveTab] = useState("Course");
  const {
    data: pendingVenueBookings,
    isValidating: isValidatingVenueBookings,
    mutate: mutateVenueBookings,
  } = useSWR<VenueBooking[]>(formatMeetupApiUrl("/venue/"), (path) =>
    axios
      .get(path)
      .then((res) =>
        Array.isArray(res.data)
          ? res.data.filter((d) => d.status === VenueBookingStatus.Pending)
          : []
      )
  );

  /* Course booking */
  const {
    data: pendingCourseBooking,
    isValidating: isCourseFetching,
    mutate: mutateCourseBookings,
  } = useSWR<CourseBookingResponse[]>(
    formatMeetupApiUrl(MEET_UP_COURSE),
    (path) => {
      return axios
        .get(path, {
          params: {
            status: CourseBookingStatus.Pending,
          },
        })
        .then((res) => res.data);
    }
  );

  // refresh the list when focus
  useFocusEffect(
    React.useCallback(() => {
      mutateCourseBookings();
      mutateVenueBookings();
    }, [mutateCourseBookings, mutateVenueBookings])
  );

  const onPressQuickApprove = async (course: CourseBookingResponse) => {
    const { id } = course;
    try {
      await updateCourseBooking({
        action: Action.Approve,
        id,
        parameters: {
          reasonReject: "",
        },
      });
      navigation.reset({
        index: 0,
        routes: [
          {
            name: "ClubApprovedCourseBooking",
            params: {
              destination: "ClubNavigator",
              nestedDestination: "ClubHome",
              course,
            },
          },
        ],
      });
    } catch (error) {
      showApiToastError(error);
    }
  };

  const onPressCourseCard = (course: CourseBookingResponse) => {
    navigation.navigate("ClubCourseBookingDetails", { course });
  };

  const renderCourseBookingRequests = () => {
    if (isCourseFetching) {
      <Spinner />;
    }

    if (Array.isArray(pendingCourseBooking) && pendingCourseBooking.length) {
      return (
        <VStack space="4">
          <BannerButton
            headerLabel={t("Create Course")}
            description={t(
              "Tap here to create a new event and have fun with other player"
            )}
            onPress={() => {
              navigation.navigate("AddCourse");
            }}
          />
          {pendingCourseBooking.length > 0 &&
            pendingCourseBooking.map((request) => {
              return (
                <CourseBookingCard
                  key={`course_card_${request.id}`}
                  onPressCourseCard={onPressCourseCard}
                  onPressQuickApprove={onPressQuickApprove}
                  meetUpCourse={request}
                />
              );
            })}
        </VStack>
      );
    }
  };

  const tabs = () => {
    return (
      <HStack my="3" space="3">
        {availableTabs.map((tab) => {
          return (
            <Pressable key={tab} onPress={() => setActiveTab(tab)}>
              <Heading color={activeTab === tab ? "#000" : "#b3b3b3"}>
                {t(tab)}
              </Heading>
            </Pressable>
          );
        })}
      </HStack>
    );
  };

  const renderVenueBookingRequests = () => {
    if (isValidatingVenueBookings) {
      return <Spinner />;
    }

    return VenueBookingList({
      venueBookings: pendingVenueBookings ?? [],
      onPressBookingCard: (booking) =>
        navigation.navigate("ClubVenueBookingDetails", {
          venueBooking: booking,
          flow: "default",
        }),
      onPressQuickApprove: (booking) => {
        approveVenueBooking({ venueId: booking.id })
          .then(() => {
            Toast.show({
              id: "venueApproved",
              duration: 2000,
              placement: "top",
              render: () => {
                return (
                  <MessageToast
                    type={MesssageToastType.Success}
                    title={t("Venue booking is approved")}
                  />
                );
              },
            });
            mutateVenueBookings();
          })
          .catch((e) => console.log(JSON.stringify(e)));
      },
    });
  };

  return (
    <HeaderLayout
      headerProps={{
        title: t("Remarkable Sports"),
        hasBackButton: false,
        headerLabelStyle: { fontSize: 24 },
        headerLabelContainerStyle: { alignItems: "flex-start" },
      }}
    >
      <HStack mt={2} mb={5} space={3} mx="defaultLayoutSpacing">
        <Button
          size="sm"
          onPress={() => {
            navigation.navigate("CourseList");
          }}
        >
          {t("Course List")}
        </Button>
        <Button
          size="sm"
          onPress={() => {
            navigation.navigate("ClubVenueList");
          }}
        >
          {t("Venue List")}
        </Button>
      </HStack>

      <Heading size="lg" mx="defaultLayoutSpacing">
        {t("Request")}
      </Heading>
      <VStack space="4" mx="4">
        {tabs()}
        {activeTab === ActiveTab.Venue && renderVenueBookingRequests()}
        {activeTab === ActiveTab.Course && renderCourseBookingRequests()}
      </VStack>
    </HeaderLayout>
  );
}
