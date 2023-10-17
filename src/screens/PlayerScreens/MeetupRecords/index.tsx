/* eslint-disable no-case-declarations */
import { BottomTabScreenProps } from "@react-navigation/bottom-tabs";
import { CompositeScreenProps, useFocusEffect } from "@react-navigation/native";
import { NativeStackScreenProps } from "@react-navigation/native-stack";
import { Box, Center, Heading, Pressable, Text, VStack } from "native-base";
import React, { useEffect, useMemo, useState } from "react";
import { LayoutAnimation } from "react-native";
import useSWR from "swr";
import CalendarListItem from "../../../components/CalendarListItem";
import ErrorMessage from "../../../components/ErrorMessage";
import GhostTabbar from "../../../components/GhostTabBar";
import HeaderLayout from "../../../components/Layout/HeaderLayout";
import Loading from "../../../components/Loading";
import MeetupSummaryCounter from "../../../components/MeetupSummaryCounter";
import { ActivityType } from "../../../models/Request";
import {
  CalendarResponse,
  formatId,
  summaryCount,
} from "../../../models/responses/Calendar";
import {
  MainStackNavigatorParamList,
  PlayerBottomTabNavigatorParamList,
} from "../../../routers/Types";
import getCalendarRecords from "../../../services/CalendarServices";
import { getMeetupSummaryRequest } from "../../../services/O3Services";
import {
  formatCoreUrl,
  formatMeetupApiUrl,
} from "../../../services/ServiceUtil";
import { getTranslation } from "../../../utils/translation";
import {
  getLeagueById,
  getdivisionById,
} from "../../../services/LeagueServices";
import { LeagueFlow } from "../../LeagueV2/LeagueScreenV2";

export type MeetupRecordsProps = CompositeScreenProps<
  NativeStackScreenProps<MainStackNavigatorParamList>,
  BottomTabScreenProps<PlayerBottomTabNavigatorParamList, "MeetupRecords">
>;

const t = getTranslation("screen.PlayerScreens.MeetupRecords");

const MeetupType = {
  All: t("All"),
  Coaching: t("Coaching"),
  Course: t("Course"),
  Venue: t("Venue"),
};

const tabItems = [
  MeetupType.All,
  MeetupType.Coaching,
  MeetupType.Course,
  MeetupType.Venue,
];

export default function MeetupRecords({ navigation }: MeetupRecordsProps) {
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [selectedData, setSelectedData] = useState<CalendarResponse[]>([]);
  const [coachingData, setCoachingData] = useState<CalendarResponse[]>([]);
  const [courseData, setCourseData] = useState<CalendarResponse[]>([]);
  const [venueata, setVenueData] = useState<CalendarResponse[]>([]);
  const [selectedSummary, setSelectedSummary] = useState<summaryCount>();

  const {
    data: meetupList,
    error: recordsError,
    isValidating: recordsIsValidating,
    mutate: meetupMutate,
  } = useSWR(formatCoreUrl("/calendar"), (p) => getCalendarRecords());

  const {
    data: summaryList,
    error: summaryError,
    isValidating: summaryIsValidating,
    mutate: summaryMutate,
  } = useSWR(formatMeetupApiUrl("/summary"), getMeetupSummaryRequest);

  useFocusEffect(
    React.useCallback(() => {
      meetupMutate();
      summaryMutate();
    }, [meetupMutate, summaryMutate])
  );

  useEffect(() => {
    if (meetupList?.length) {
      const courseList = meetupList.filter(
        (item) => item.meetupType === ActivityType.Course
      );
      const coachingList = meetupList.filter(
        (item) => item.meetupType === ActivityType.O3Coach
      );
      const venueList = meetupList.filter(
        (item) => item.meetupType === ActivityType.Venue
      );
      setCourseData(courseList);
      setCoachingData(coachingList);
      setVenueData(venueList);
    } else {
      setCourseData([]);
      setCoachingData([]);
      setVenueData([]);
    }
  }, [meetupList]);

  useEffect(() => {
    switch (selectedIndex) {
      case 0:
        setSelectedData(meetupList || []);
        break;
      case 1:
        setSelectedData(coachingData);
        break;
      case 2:
        setSelectedData(courseData);
        break;
      case 3:
        setSelectedData(venueata);
        break;
      default:
        break;
    }
  }, [selectedIndex, coachingData, meetupList, venueata, courseData]);

  useEffect(() => {
    if (summaryList) {
      switch (selectedIndex) {
        case 0:
          setSelectedSummary(summaryList?.total);
          break;
        case 1:
          setSelectedSummary(summaryList?.o3Coach);
          break;
        case 2:
          setSelectedSummary(summaryList?.course);
          break;
        case 3:
          setSelectedSummary(summaryList?.venue);
          break;
        default:
          break;
      }
    }
  }, [summaryList, selectedIndex]);
  const onPressItem = async (val: CalendarResponse) => {
    switch (val.meetupType) {
      case ActivityType.Course:
        navigation.navigate("PlayerCourseDetails", {
          courseId: val.extra.courseId,
        });
        break;
      case ActivityType.O3Coach:
        navigation.navigate("PlayerO3AppliedCoachDetails", {
          o3CoachId: val.extra.o3CoachId,
          isForceBackToPlayerMeetupList: false,
        });
        break;
      case ActivityType.Venue:
        navigation.navigate("VenueBookingDetail", {
          venueBookingId: val.extra?.venueBookingId,
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
  };

  return (
    <HeaderLayout
      KeyboardAwareScrollViewProps={{
        bounces: false,
      }}
      headerProps={{
        hasBackButton: false,
        title: t("Meetup Records"),
        containerStyle: { marginHorizontal: 0 },
      }}
      isSticky
    >
      {/* GhostTabbar */}
      <VStack space="6" m="defaultLayoutSpacing">
        <GhostTabbar
          items={tabItems}
          onPress={(item: string, index: number) => {
            LayoutAnimation.configureNext(
              LayoutAnimation.Presets.easeInEaseOut
            );
            setSelectedIndex(index);
          }}
          defaultIndex={selectedIndex}
        />
        <MeetupSummaryCounter
          pending={selectedSummary?.pending || 0}
          onGoing={selectedSummary?.onGoing || 0}
          past={selectedSummary?.past || 0}
          noShow={selectedSummary?.noShow || 0}
        />
        <Heading>{t("Recent")}</Heading>

        {(recordsIsValidating || summaryIsValidating) && <Loading />}
        {((!recordsIsValidating && recordsError) ||
          (!summaryIsValidating && summaryError)) && <ErrorMessage />}
        {!recordsIsValidating && Array.isArray(selectedData)
          ? selectedData
              ?.filter((val) => val.status !== "Pending")
              .map((val) => (
                <Pressable
                  key={formatId(val)}
                  onPress={async () => {
                    await onPressItem(val);
                  }}
                >
                  <CalendarListItem
                    data={val}
                    isShowDate
                    stackProps={{ ml: 0 }}
                  />
                </Pressable>
              ))
          : null}
      </VStack>
    </HeaderLayout>
  );
}
