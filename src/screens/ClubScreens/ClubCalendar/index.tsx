/* eslint-disable no-case-declarations */
import React, { useEffect, useMemo, useState } from "react";
import { Button, Modal, Pressable, useTheme, VStack } from "native-base";
import { CompositeScreenProps, useFocusEffect } from "@react-navigation/native";
import { NativeStackScreenProps } from "@react-navigation/native-stack";
import { BottomTabScreenProps } from "@react-navigation/bottom-tabs";
import { Swipeable } from "react-native-gesture-handler";
import useSWR from "swr";
import { parseISO } from "date-fns";

import { LayoutAnimation } from "react-native";
import Calendar from "../../../components/Calendar";
import HeaderLayout from "../../../components/Layout/HeaderLayout";
import { CalendarResponse, formatId } from "../../../models/responses/Calendar";
import {
  MainStackNavigatorParamList,
  ClubBottomTabNavigatorParamList,
} from "../../../routers/Types";
import BinIcon from "../../../components/Icons/BinIcon";
import CalendarListItem from "../../../components/CalendarListItem";
import { formatDateToCalendar } from "../../../utils/date";
import { formatCoreUrl } from "../../../services/ServiceUtil";
import { ActivityType } from "../../../models/Request";
import { deleteCourseApplication } from "../../../services/CourseApplicationServices";
import { deleteVenueBooking } from "../../../services/VenueBookingServices";
import { deleteMeetCoachO3Request } from "../../../services/MeetCoachO3Services";
import { getTranslation } from "../../../utils/translation";
import getCalendarRecords, {
  getClubCalendarRecords,
} from "../../../services/CalendarServices";
import Loading from "../../../components/Loading";
import ErrorMessage from "../../../components/ErrorMessage";
import { showApiToastError } from "../../../components/ApiToastError";
import GhostTabbar from "../../../components/GhostTabBar";
import { useAuth } from "../../../hooks/UseAuth";
import { ClubStaff } from "../../../models/User";
import { ClubStatusType } from "../../../models/requests/Club";
import {
  getLeagueById,
  getdivisionById,
} from "../../../services/LeagueServices";
import { LeagueFlow } from "../../LeagueV2/LeagueScreenV2";

type PlayerCourseListScreenProps = CompositeScreenProps<
  NativeStackScreenProps<MainStackNavigatorParamList>,
  BottomTabScreenProps<ClubBottomTabNavigatorParamList, "ClubCalendar">
>;

const t = getTranslation("screen.ClubScreens.Calendar");

export default function ClubCalendar({
  navigation,
}: PlayerCourseListScreenProps) {
  const [selectedDate, setSelectedDate] = useState(
    formatDateToCalendar(new Date())
  );

  const { user } = useAuth();
  const [tabIndex, setSelectedTabIndex] = useState(0);
  const clubId = user ? (user as ClubStaff).club?.id : "";

  const appliedStatus =
    (user && (user as ClubStaff).applyClubStatus) ||
    (user && (user as ClubStaff).club?.approvalStatus);
  const shouldHideGhostTabBar = appliedStatus !== ClubStatusType.Approved;

  const {
    data: meetupList,
    error,
    isValidating,
    mutate,
  } = useSWR(
    [
      tabIndex === 1
        ? formatCoreUrl("/calendar")
        : formatCoreUrl(`/calendar/club/${clubId}`),
      selectedDate,
    ],
    ([p, dateQuery]) => {
      if (tabIndex === 1) {
        return getCalendarRecords(new Date(dateQuery));
      }

      if (clubId) {
        return getClubCalendarRecords(clubId, new Date(dateQuery));
      }
    },
    {
      errorRetryCount: 0,
      onErrorRetry: () => {},
      errorRetryInterval: 0,
      shouldRetryOnError: false,
    }
  );

  useFocusEffect(
    React.useCallback(() => {
      mutate();
    }, [mutate])
  );

  const [modalData, setModalData] = useState<{
    isOpen: boolean;
    isLoading: boolean;
    data?: CalendarResponse;
  }>({
    isOpen: false,
    isLoading: false,
  });

  const currentActivities = useMemo(
    () =>
      meetupList?.filter(
        (element) => formatDateToCalendar(element.startTime) === selectedDate
      ),
    [meetupList, selectedDate]
  );

  const removeCard = async () => {
    if (!modalData.data) return;

    try {
      switch (modalData.data.meetupType) {
        case ActivityType.O3Coach:
          await deleteMeetCoachO3Request(modalData.data.extra.o3CoachId || 0);
          break;
        case ActivityType.Course:
          await deleteCourseApplication(
            modalData.data.extra.courseApplicationId || 0
          );
          break;
        case ActivityType.Venue:
          await deleteVenueBooking(modalData.data.extra.venueBookingId || 0);
          break;
        default:
      }
      mutate((data) =>
        data?.filter(
          (element) => formatId(element) !== formatId(modalData.data!)
        )
      );
      setModalData({ isOpen: false, isLoading: false });
    } catch (e) {
      console.log(e);
      showApiToastError(e);
    }
  };
  const onPressItem = async (val: CalendarResponse) => {
    if (val.extra) {
      switch (val.meetupType) {
        case ActivityType.Course:
          navigation.navigate("ManageCourse", { courseId: val.extra.courseId });
          break;
        case ActivityType.O3Coach:
          navigation.navigate("PlayerO3AppliedCoachDetails", {
            o3CoachId: val.extra.o3CoachId,
            isForceBackToPlayerMeetupList: false,
          });
          break;
        case ActivityType.Venue:
          navigation.navigate("VenueBookingDetail", {
            venueBookingId: val.extra.venueBookingId,
          });
          break;
        case ActivityType.Event:
          navigation.navigate("PlayerEventDetails", {
            eventId: val.extra?.eventId,
          });
          break;
        case ActivityType.Fixture:
          const divisionId = val.extra?.divisionId;
          const leagueId = val.extra?.leagueId;
          if (divisionId && leagueId) {
            const league = await getLeagueById(leagueId);
            navigation.navigate("LeagueViewAllFixtureV2", {
              flow: LeagueFlow.player,
              divisionId,
              league,
            });
          }
          break;
        default:
          break;
      }
    }
  };

  // Tab bar
  const tabItems = [t("Club"), t("Personal")];
  const { colors } = useTheme();
  return (
    <HeaderLayout
      isSticky
      headerProps={{ title: t("Calendar"), hasBackButton: false }}
    >
      {isValidating && <Loading />}
      {!isValidating && (
        <VStack mx="defaultLayoutSpacing" space="3">
          <VStack mx="defaultLayoutSpacing">
            {!shouldHideGhostTabBar && (
              <GhostTabbar
                isShowBottomLine
                isFlex
                defaultIndex={tabIndex}
                items={tabItems}
                onPress={(item: string, index: number) => {
                  LayoutAnimation.configureNext(
                    LayoutAnimation.Presets.easeInEaseOut
                  );
                  setSelectedTabIndex(index);
                }}
                activateColor={colors.rs.primary_purple}
                unActivateColor={colors.rs.inputLabel_grey}
                tabProps={{
                  fontSize: 16,
                  textAlign: "center",
                  flex: 1,
                }}
              />
            )}
          </VStack>
          <Calendar
            onMonthChange={(value) => {
              setSelectedDate(value);
              mutate();
            }}
            selectedDate={selectedDate}
            onPress={(val) => {
              setSelectedDate(val);
            }}
            meetupData={meetupList}
          />
        </VStack>
      )}
      {!isValidating && Array.isArray(meetupList) && (
        <>
          <VStack space="4" mb="4">
            {currentActivities?.map((val) => (
              <Swipeable
                key={formatId(val)}
                renderRightActions={() => {
                  if (
                    val?.endTime &&
                    val?.endTime?.getTime() < new Date().getTime()
                  ) {
                    return null;
                  }
                  return (
                    <Pressable
                      my="3"
                      backgroundColor="rs.lightGrey"
                      justifyContent="center"
                      alignItems="center"
                      px="8"
                      onPress={() =>
                        setModalData({
                          isOpen: true,
                          isLoading: false,
                          data: val,
                        })
                      }
                    >
                      <BinIcon />
                    </Pressable>
                  );
                }}
              >
                <Pressable
                  onPress={async () => {
                    await onPressItem(val);
                  }}
                >
                  <CalendarListItem data={val} />
                </Pressable>
              </Swipeable>
            ))}
          </VStack>
          <Modal
            isOpen={modalData.isOpen}
            onClose={() => setModalData({ isOpen: false, isLoading: false })}
          >
            <Modal.Content>
              <Modal.Header>
                {t("Confirm to delete this activity?")}
              </Modal.Header>
              <Modal.Body>
                {t("The activity will be deleted permanently in the calendar")}
              </Modal.Body>
              <Modal.Footer>
                <Button
                  flex="1"
                  onPress={async () => {
                    setModalData((prev) => ({ ...prev, isLoading: true }));
                    await removeCard();
                  }}
                >
                  {t("Yes, confirm")}
                </Button>
              </Modal.Footer>
            </Modal.Content>
          </Modal>
        </>
      )}
    </HeaderLayout>
  );
}
