import React, { useState } from "react";
import { BottomTabNavigationProp } from "@react-navigation/bottom-tabs";
import {
  CompositeNavigationProp,
  RouteProp,
  useFocusEffect,
} from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import {
  Avatar,
  Badge,
  Box,
  Button,
  Circle,
  Divider,
  Heading,
  HStack,
  Pressable,
  QuestionIcon,
  Text,
  VStack,
} from "native-base";
import axios from "axios";
import useSWR from "swr";
import FindCoachCard from "../../../components/Card/FindCoachCard";
import HeaderLayout from "../../../components/Layout/HeaderLayout";
import {
  MainStackNavigatorParamList,
  PlayerBottomTabNavigatorParamList,
} from "../../../routers/Types";
import RoundedRedCrossIcon from "../../../components/Icons/RoundedRedCrossIcon";
import {
  O3MeetupStatus,
  O3Response,
} from "../../../models/responses/O3Response";
import {
  formatCoreUrl,
  formatFileUrl,
  formatMeetupApiUrl,
} from "../../../services/ServiceUtil";
import { getTranslation } from "../../../utils/translation";
import AppliedCoachCard from "../../../components/Card/AppliedCoachCard";
import {
  formatUtcToLocalDate,
  formatUtcToLocalTime,
} from "../../../utils/date";
import ClockIcon from "../../../components/Icons/ClockIcon";
import CalendarIcon from "../../../components/Icons/CalendarIcon";
import LocationIcon from "../../../components/Icons/LocationIcon";
import MoneyIcon from "../../../components/Icons/MoneyIcon";
import Loading from "../../../components/Loading";
import ErrorMessage from "../../../components/ErrorMessage";
import {
  cancelMeetCoachO3Request,
  O3CoachingStatus,
  queryO3CoachMeetups,
} from "../../../services/O3Services";
import CoachShortProfile from "../../../components/CoachShortProfile";
import ConfirmationModal from "../../../components/ConfirmationModal/ConfirmationModal";
import FindCoachTipCard from "../../../components/Card/FindCoachTipCard";
import { Coach, UserType } from "../../../models/User";
import MagnifyingGlassIcon from "../../../components/Icons/MagnifyingGlassIcon";
import RightArrowIcon from "../../../components/Icons/RightArrowIcon";
import RefreshIconV2 from "../../../components/Icons/RefreshIconV2";
import { formatName, getUserName } from "../../../utils/name";
import FlagIcon from "../../../components/Icons/FlagIcon";
import {
  FlagIconV2,
  SelectedFlagIconV2,
} from "../../../components/Icons/FlagIconV2";
import ClockArrowIcon from "../../../components/Icons/ClockArrowIcon";

const t = getTranslation([
  "screen.PlayerScreens.PlayerMeetupRecords",
  "constant.district",
  "component.Coach.CoachProfile",
  "constant.profile",
]);

export type PlayerMeetupRecordsNavigationProp = CompositeNavigationProp<
  BottomTabNavigationProp<MainStackNavigatorParamList, "PlayerMeetupRecords">,
  NativeStackNavigationProp<MainStackNavigatorParamList>
>;

export type PlayerMeetupRecordsRouteProp = RouteProp<
  MainStackNavigatorParamList,
  "PlayerMeetupRecords"
>;

interface PlayerMeetupRecordsScreenProps {
  navigation: PlayerMeetupRecordsNavigationProp;
  route: PlayerMeetupRecordsRouteProp;
}

export default function PlayerMeetupRecords({
  navigation,
}: PlayerMeetupRecordsScreenProps) {
  const {
    data: coachRequests,
    error: coachRequestsError,
    isValidating: isFetchingCoachRequests,
    mutate: coachRequestsMutate,
  } = useSWR<O3Response[]>(formatCoreUrl("/1on1"), () =>
    queryO3CoachMeetups(O3CoachingStatus.Available)
  );
  useFocusEffect(
    React.useCallback(() => {
      coachRequestsMutate();
    }, [coachRequestsMutate])
  );

  const allMeetups = coachRequests
    ? coachRequests
        .sort((a, b) => b.endTime.getTime() - a.endTime.getTime())
        .filter((meetup) => {
          const appliedCoachWithPickedCoachId =
            meetup &&
            meetup.pickedCoachId &&
            meetup.appliedCoachs.filter(
              (applied) => applied.coachInfo.id === meetup.pickedCoachId
            )[0];
          return (
            (meetup.status !== O3MeetupStatus.Pending &&
              appliedCoachWithPickedCoachId) ||
            meetup.status === O3MeetupStatus.Rejected
          );
        })
    : [];

  const upcommingMeetup = allMeetups.filter((meetup) => {
    const isFinished =
      meetup.endTime.getTime() < new Date().getTime() ||
      meetup.status === O3MeetupStatus.Completed ||
      meetup.status === O3MeetupStatus.Cancelled ||
      meetup.status === O3MeetupStatus.LateCancelled ||
      meetup.status === O3MeetupStatus.Rejected;
    return meetup.fromTime.getTime() > new Date().getTime() && !isFinished;
  });

  const completedMeetup = allMeetups.filter((meetup) => {
    return (
      meetup.endTime.getTime() < new Date().getTime() ||
      meetup.status === O3MeetupStatus.Completed
    );
  });

  const meetupCard = (meetup: O3Response) => {
    const appliedCoachWithPickedCoachId =
      meetup &&
      meetup.pickedCoachId &&
      meetup.appliedCoachs.filter(
        (applied) => applied.coachInfo.id === meetup.pickedCoachId
      )[0];
    if (appliedCoachWithPickedCoachId) {
      const { coachInfo } = appliedCoachWithPickedCoachId;
      const { profilePicture, firstName, lastName } = coachInfo;
      const isFinished =
        meetup.endTime.getTime() < new Date().getTime() ||
        meetup.status === O3MeetupStatus.Completed;
      const isCanceled =
        (meetup.status === O3MeetupStatus.Cancelled ||
          meetup.status === O3MeetupStatus.LateCancelled) &&
        meetup.pickedCoachId !== null;
      const isRejected = meetup.status === O3MeetupStatus.Rejected;
      const status = isFinished
        ? t("Completed")
        : isCanceled
        ? t("Cancelled")
        : isRejected
        ? t("Rejected")
        : t("Upcoming");

      const color = isFinished
        ? "#66CEE1"
        : isCanceled
        ? "#959595"
        : isRejected
        ? "#E71010"
        : "#00B812";
      return (
        <HStack
          key={`card_${meetup.id}`}
          bgColor="rs.white"
          shadow="9"
          borderRadius="3xl"
          p="4"
          style={{
            shadowOffset: {
              width: 5,
              height: 5,
            },
            shadowOpacity: 0.1,
          }}
          justifyContent="space-between"
        >
          <VStack space="2" flex={3.2}>
            <HStack space="3">
              <Avatar
                size="sm"
                source={
                  profilePicture
                    ? { uri: formatFileUrl(profilePicture) }
                    : undefined
                }
              >
                {firstName}
              </Avatar>
              <Heading flex={1} numberOfLines={2} isTruncated>
                {getUserName(coachInfo)}
              </Heading>
            </HStack>

            <HStack pl="2" justifyContent="space-between">
              <VStack space="2">
                <HStack space="3">
                  <CalendarIcon />
                  <Text isTruncated>
                    {formatUtcToLocalDate(meetup.fromTime)}
                  </Text>
                </HStack>

                <HStack flex="1" alignItems="center" space="2">
                  <ClockIcon />
                  <Text>
                    {formatUtcToLocalTime(meetup.fromTime)} -{" "}
                    {formatUtcToLocalTime(meetup.endTime)}
                  </Text>
                </HStack>

                {meetup.venue && (
                  <HStack flex="1" alignItems="flex-start" space="2">
                    <LocationIcon />
                    <Text>{meetup.venue}</Text>
                  </HStack>
                )}
              </VStack>
            </HStack>
          </VStack>
          <Text flex={1} fontWeight="bold" color={color} alignSelf="center">
            {status}
          </Text>
        </HStack>
      );
    }
  };

  const meetupList = (meetups: O3Response[]) => {
    console.log(meetups.length);
    if (meetups.length === 0) {
      return (
        <VStack flex="1" justifyContent="center" alignItems="center">
          <Text>{t("There is no related meetup")}</Text>
        </VStack>
      );
    }

    return (
      <VStack flex="1" space="3">
        {meetups.map((meetup) => {
          return (
            <Pressable
              key={`meetup_${meetup.id}`}
              width="100%"
              onPress={() => {
                navigation.navigate("PlayerO3AppliedCoachDetails", {
                  o3: meetup,
                  isForceBackToPlayerMeetupList: false,
                });
              }}
            >
              {meetupCard(meetup)}
            </Pressable>
          );
        })}
      </VStack>
    );
  };

  // Tab selectors
  const [activeTabIndex, setActiveTabIndex] = useState(0);
  const ActiveTabs = [
    { label: `${t("All")} (${allMeetups.length})`, value: "Recommendation" },
    {
      label: `${t("Upcoming")} (${upcommingMeetup.length})`,
      value: "Upcoming",
    },
    {
      label: `${t("Completed")} (${completedMeetup.length})`,
      value: "Completed",
    },
  ];
  const tabSelectors = () => {
    const tabItem = ({ label, index }: { label: string; index: number }) => {
      const isSelected = activeTabIndex === index;
      const color = isSelected ? "#31095E" : "#B3B6B8";
      const fontWeight = isSelected ? "bold" : "normal";

      return (
        <Pressable
          onPress={() => {
            setActiveTabIndex(index);
          }}
        >
          <Text fontSize="md" color={color} fontWeight={fontWeight}>
            {label}
          </Text>
        </Pressable>
      );
    };

    return (
      <HStack space="4" flex="1">
        {ActiveTabs.map((tab, index) => {
          return tabItem({ label: tab.label, index });
        })}
      </HStack>
    );
  };

  if (isFetchingCoachRequests) {
    return <Loading />;
  }
  return (
    <HeaderLayout
      headerProps={{
        title: t("Meetup Records"),
        containerStyle: { marginHorizontal: 0 },
      }}
    >
      <VStack space="4" mx="4">
        {tabSelectors()}
        {activeTabIndex === 0 && meetupList(allMeetups)}
        {activeTabIndex === 1 && meetupList(upcommingMeetup)}
        {activeTabIndex === 2 && meetupList(completedMeetup)}
      </VStack>
    </HeaderLayout>
  );
}
