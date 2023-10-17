/* eslint-disable no-case-declarations */
import React, { useCallback, useState } from "react";
import {
  HStack,
  Heading,
  Box,
  Circle,
  IconButton,
  VStack,
  Pressable,
  Text,
  Badge,
  Avatar,
  QuestionIcon,
} from "native-base";
import { NativeStackScreenProps } from "@react-navigation/native-stack";
import { CompositeScreenProps, useFocusEffect } from "@react-navigation/native";
import { BottomTabScreenProps } from "@react-navigation/bottom-tabs";
import useSWR from "swr";
import { addMonths, isAfter, isPast } from "date-fns";
import { useForm } from "react-hook-form";
import { View } from "react-native";
import {
  CoachBottomTabNavigatorParamList,
  MainStackNavigatorParamList,
} from "../../../routers/Types";
import HeaderLayout from "../../../components/Layout/HeaderLayout";
import { O3Response } from "../../../models/responses/O3Response";
import {
  O3CoachingStatus,
  queryO3CoachMeetups,
} from "../../../services/O3Services";
import {
  formatCoreUrl,
  formatFileUrl,
  formatMeetupApiUrl,
} from "../../../services/ServiceUtil";
import getCalendarRecords from "../../../services/CalendarServices";
import FeatureCardSlider from "../../../components/FeatureCardSlider";
import Loading from "../../../components/Loading";
import ErrorMessage from "../../../components/ErrorMessage";
import { getTranslation } from "../../../utils/translation";
import { CalendarResponse } from "../../../models/responses/Calendar";
import { ActivityType } from "../../../models/Request";
import BannerButton from "../../../components/BannerButton";
import SingleSelectModal from "../../../components/Modal/SingleSelectModal";
import NotificationBellIcon from "../../../components/Icons/NotificationBellIcon";
import useNotification from "../../../hooks/UseNotification";
import { getUserName } from "../../../utils/name";
import CalendarIcon from "../../../components/Icons/CalendarIcon";
import {
  formatUtcToLocalDate,
  formatUtcToLocalTime,
} from "../../../utils/date";
import ClockIcon from "../../../components/Icons/ClockIcon";
import LocationIcon from "../../../components/Icons/LocationIcon";
import ChatBotIcon from "../../../components/Icons/ChatBotIcon";
import ConfirmationModal from "../../../components/ConfirmationModal/ConfirmationModal";
import { useAuth } from "../../../hooks/UseAuth";
import {
  getLeagueById,
  getdivisionById,
} from "../../../services/LeagueServices";
import { LeagueFlow } from "../../LeagueV2/LeagueScreenV2";

export type CoachHomeScreenNavigationProps = CompositeScreenProps<
  BottomTabScreenProps<CoachBottomTabNavigatorParamList, "CoachHome">,
  NativeStackScreenProps<MainStackNavigatorParamList>
>;

const t = getTranslation([
  "screen.CoachScreens.Home",
  "screen.PlayerScreens.O3AppliedCoach",
  "constant.button",
  "constant.district",
  "constant.dummyUser",
]);

let IS_NOTI_SET_UP = false;

export default function CoachHome({
  navigation,
}: CoachHomeScreenNavigationProps): JSX.Element {
  const CREATE_BUTTON_LIST = [
    { label: t("Course"), value: "Course", id: 0 },
    { label: t("Event"), value: "Event", id: 1 },
  ];

  const {
    data: meetupList,
    error: meetupError,
    isValidating: isFetchingMeetupList,
    mutate: meetupMutate,
  } = useSWR(formatCoreUrl("/calendar"), () => getCalendarRecords());
  const {
    data: coachRequests,
    error: coachRequestsError,
    isValidating: isFetchingCoachRequests,
    mutate: coachRequestsMutate,
  } = useSWR<O3Response[]>(formatMeetupApiUrl("/1on1"), () =>
    queryO3CoachMeetups(O3CoachingStatus.Available)
  );
  const { user } = useAuth();
  const isTrial = user?.is_trial;
  const [verifyModalOpen, setVerifyModalOpenl] = useState(isTrial);
  const [profileModalOpen, setProfileModalOpen] = useState(false);
  const [isOpenModal, setIsOpenModal] = useState(false);
  const { control } = useForm({ mode: "onChange" });

  const { updateNotification } = useNotification();

  const setUpNotificationPostLogin = async () => {
    try {
      await updateNotification();
    } catch (error) {
      console.log("Ignored", error);
    }
  };

  if (!IS_NOTI_SET_UP) {
    IS_NOTI_SET_UP = true;
    setUpNotificationPostLogin();
  }

  useFocusEffect(
    React.useCallback(() => {
      meetupMutate();
      coachRequestsMutate();
    }, [meetupMutate, coachRequestsMutate])
  );

  const handleOnPress = useCallback(
    async (data: CalendarResponse) => {
      switch (data.meetupType) {
        case ActivityType.O3Coach:
          navigation.navigate("CoachO3Details", {
            o3Id: data.extra.o3CoachId,
          });
          break;
        case ActivityType.Event:
          navigation.navigate("PlayerEventDetails", {
            eventId: data.extra?.eventId,
          });
          break;
        case ActivityType.Fixture:
          const divisionId = data.extra?.divisionId;
          const leagueId = data.extra?.leagueId;
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
    },
    [navigation]
  );

  const chatBotSection = () => {
    return (
      <Pressable
        onPress={() => {
          navigation.navigate("ChatGPT");
        }}
      >
        <HStack
          mx="defaultLayoutSpacing"
          bg="#66CEE180"
          space="2"
          p="4"
          justifyContent="center"
          alignItems="center"
          borderRadius="xl"
        >
          <ChatBotIcon />
          <Text fontSize="md" fontWeight="bold">
            {t("Talk with \nChatPingPong")}
          </Text>
        </HStack>
      </Pressable>
    );
  };

  const recommendedMeetups = coachRequests
    ? coachRequests.filter(
        (req) => (!req.isOthers && req.isByAI) || (!req.isOthers && !req.isByAI)
      )
    : [];
  const otherMeetups = coachRequests
    ? coachRequests.filter((req) => req.isOthers)
    : [];

  // Tab selectors
  const [activeTabIndex, setActiveTabIndex] = useState(0);
  const ActiveTabs = [
    {
      label: `${t("Recommended")} (${recommendedMeetups.length})`,
      value: "Recommendation",
    },
    { label: `${t("Other")} (${otherMeetups.length})`, value: "Favourite" },
  ];
  const tabSelectors = () => {
    const tabItem = ({ label, index }: { label: string; index: number }) => {
      const isSelected = activeTabIndex === index;
      const color = isSelected ? "#31095E" : "#B3B6B8";
      const fontWeight = isSelected ? "bold" : "normal";

      return (
        <Pressable
          key={`${label}_${index}`}
          onPress={() => {
            setActiveTabIndex(index);
          }}
          justifyContent="center"
          alignItems="center"
          borderColor={color}
        >
          <Text fontSize="md" color={color} fontWeight={fontWeight}>
            {label}
          </Text>
        </Pressable>
      );
    };

    return (
      <HStack w="100%" space="6" mx="defaultLayoutSpacing">
        {ActiveTabs.map((tab, index) => {
          return tabItem({ label: tab.label, index });
        })}
      </HStack>
    );
  };

  const meetupCard = (meetup: O3Response) => {
    const { playerInfo, fromTime, endTime } = meetup;
    const { profilePicture, firstName } = playerInfo;
    const isRecommendedByAI = !meetup.isOthers && meetup.isByAI;

    return (
      <Pressable
        _pressed={{ opacity: 0.5 }}
        key={meetup.id}
        onPress={() =>
          navigation.navigate("CoachO3ApplyRequest", {
            o3: meetup,
          })
        }
      >
        <VStack
          bgColor="rs.white"
          p="4"
          space="5"
          shadow="9"
          borderRadius="3xl"
          style={{
            shadowOffset: {
              width: 5,
              height: 5,
            },
            shadowOpacity: 0.1,
          }}
          mx="defaultLayoutSpacing"
          overflow="hidden"
        >
          {isRecommendedByAI && (
            <View
              style={{
                position: "absolute",
                right: -100,
                width: 300,
                top: 60,
                backgroundColor: "#66CEE1",
                paddingVertical: 10,
                paddingHorizontal: 20,
                justifyContent: "center",
                overflow: "hidden",
                transform: [
                  {
                    rotate: "40deg",
                  },
                ],
              }}
            >
              <Text
                style={{ marginLeft: -60 }}
                alignSelf="center"
                flex="1"
                fontSize="sm"
                fontWeight="bold"
              >
                {t("Recommended by AI")}
              </Text>
            </View>
          )}
          <VStack space="3">
            <Badge
              borderColor="#66CEE1"
              variant="outline"
              bg="rs.white"
              _text={{ color: "#66CEE1", fontSize: 14 }}
              p="1"
              px="2"
              borderRadius="full"
              maxW="40"
            >
              {t(meetup.district)}
            </Badge>
            <HStack alignItems="center" space="3">
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
              <Heading>{getUserName(playerInfo)}</Heading>
            </HStack>
            <HStack space="2" alignItems="center">
              <CalendarIcon />
              <Text fontSize="xs" fontWeight="normal">
                {`${formatUtcToLocalDate(fromTime)}`}
              </Text>
            </HStack>
            <HStack space="2" alignItems="center">
              <ClockIcon />
              <Text fontSize="xs" fontWeight="normal">
                {formatUtcToLocalTime(fromTime)}
                {" - "}
                {formatUtcToLocalTime(endTime)}
              </Text>
            </HStack>
            {meetup.venue && (
              <HStack space="2" alignItems="center">
                <LocationIcon />
                <Text fontSize="xs" fontWeight="normal">
                  {meetup.venue}
                </Text>
              </HStack>
            )}
            {!meetup.venue && (
              <HStack flex="1" alignItems="center" space="2">
                <QuestionIcon />
                <Text>{t("Venue is missing")}</Text>
              </HStack>
            )}
            <Pressable
              _pressed={{ opacity: 0.5 }}
              justifyContent="center"
              alignItems="center"
              borderRadius="full"
              bg="#31095E"
              onPress={() =>
                navigation.navigate("CoachO3ApplyRequest", {
                  o3: meetup,
                })
              }
              p="2"
            >
              <Text fontWeight="bold" fontSize="md" color="rs.white">
                {t("View")}
              </Text>
            </Pressable>
          </VStack>
        </VStack>
      </Pressable>
    );
  };

  const meetupListComponent = (data: O3Response[]) => {
    if (data.length === 0) {
      return (
        <VStack mt="3" flex="1" justifyContent="center" alignItems="center">
          <Text fontSize="md" fontWeight="bold">
            {t("There is no related meetup")}
          </Text>
        </VStack>
      );
    }
    return (
      <VStack space="3" mt="4">
        {data.length > 0 && data.map((o3) => meetupCard(o3))}
      </VStack>
    );
  };

  return (
    <HeaderLayout
      headerProps={{
        title: t("Remarkable Sports"),
        hasBackButton: false,
        rightComponent: (
          <IconButton
            onPress={() => {
              navigation.navigate("NotificationCentre");
            }}
            icon={<NotificationBellIcon />}
          />
        ),
        headerLabelContainerStyle: { alignItems: "flex-start" },
        headerLabelStyle: { fontSize: 24 },
      }}
    >
      {(isFetchingMeetupList || isFetchingCoachRequests) && <Loading />}

      {((!isFetchingMeetupList && meetupError) ||
        (!isFetchingCoachRequests && coachRequestsError)) && <ErrorMessage />}

      {!isFetchingMeetupList &&
        !isFetchingCoachRequests &&
        (!meetupError || !coachRequestsError) && (
          <>
            {Array.isArray(meetupList) && (
              <FeatureCardSlider
                onPress={handleOnPress}
                meetupData={meetupList
                  .filter(
                    (val) =>
                      val.status === "Confirmed" &&
                      !isPast(val.startTime) &&
                      isAfter(
                        addMonths(val.startTime, 2),
                        addMonths(new Date(), 2)
                      )
                  )
                  .filter(
                    (val) =>
                      val.meetupType === ActivityType.Course ||
                      val.meetupType === ActivityType.Event ||
                      val.meetupType === ActivityType.O3Coach
                  )
                  .sort(function (a, b) {
                    return a.startTime.getTime() - b.startTime.getTime();
                  })
                  .slice(0, 3)}
              />
            )}
            <VStack mt="10" mb="4">
              <BannerButton
                headerLabel={t("Create")}
                description={t("Courses and events")}
                onPress={() => {
                  setIsOpenModal(true);
                }}
              />
            </VStack>
            <Box my="2">{chatBotSection()}</Box>
            <HStack my="5" mx="defaultLayoutSpacing" alignItems="center">
              <Heading>{t("Requests")} </Heading>
              <Circle size="7" backgroundColor="rs.GPP_lightBlue">
                {coachRequests?.length ?? 0}
              </Circle>
            </HStack>
            {tabSelectors()}
            {activeTabIndex === 0
              ? meetupListComponent(recommendedMeetups)
              : meetupListComponent(otherMeetups)}
          </>
        )}

      <SingleSelectModal
        title={t("I want to create")}
        showSelectedIcon={false}
        options={CREATE_BUTTON_LIST}
        defaultIndex={0}
        controllerProps={{
          name: "bottomNavigationRoute",
          control,
        }}
        isOpen={isOpenModal}
        onClose={() => {
          setIsOpenModal(false);
        }}
        onPressItem={(item) => {
          switch (item.value) {
            case "Course":
              setIsOpenModal(false);
              navigation.navigate("AddCourse");
              break;
            case "Event":
              setIsOpenModal(false);
              navigation.navigate("AddEvent");
              break;
            default:
              break;
          }
        }}
      />
      {isTrial && (
        <ConfirmationModal
          alertType="Alert"
          confirmText={t("Verify")}
          cancelText={t("Skip")}
          isOpen={verifyModalOpen}
          onCancel={() => {
            setVerifyModalOpenl(false);
          }}
          title={t("Trial Account")}
          description={t(
            "Click Verify to convert your trial account to a verified account"
          )}
          onConfirm={() => {
            setVerifyModalOpenl(false);
            navigation.navigate("ChangeEmail");
          }}
        />
      )}
      {isTrial && (
        <ConfirmationModal
          alertType="Alert"
          confirmText={t("Update")}
          cancelText={t("Skip")}
          isOpen={profileModalOpen}
          onCancel={() => {
            setProfileModalOpen(false);
          }}
          title={t("Getting Started")}
          description={t(
            "Update your profile to connect with other players, coaches and clubs"
          )}
          onConfirm={() => {
            // to do
          }}
        />
      )}
    </HeaderLayout>
  );
}
