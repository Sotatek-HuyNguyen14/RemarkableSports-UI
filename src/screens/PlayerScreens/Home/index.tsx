/* eslint-disable no-case-declarations */
/* eslint-disable react/no-unstable-nested-components */
import React, { useCallback, useState } from "react";
import {
  Box,
  Heading,
  HStack,
  IconButton,
  Pressable,
  Text,
  VStack,
} from "native-base";
import useSWR from "swr";
import { addMonths, isAfter, isPast } from "date-fns";
import { BottomTabScreenProps } from "@react-navigation/bottom-tabs";
import { CompositeScreenProps, useFocusEffect } from "@react-navigation/native";
import { NativeStackScreenProps } from "@react-navigation/native-stack";
import HeaderLayout from "../../../components/Layout/HeaderLayout";
import {
  MainStackNavigatorParamList,
  PlayerBottomTabNavigatorParamList,
} from "../../../routers/Types";
import { getTranslation } from "../../../utils/translation";
import FeatureCardSlider from "../../../components/FeatureCardSlider";
import { formatCoreUrl } from "../../../services/ServiceUtil";
import getCalendarRecords from "../../../services/CalendarServices";
import Loading from "../../../components/Loading";
import { CalendarResponse } from "../../../models/responses/Calendar";
import { ActivityType } from "../../../models/Request";
import NotificationBellIcon from "../../../components/Icons/NotificationBellIcon";
import useNotification from "../../../hooks/UseNotification";
import { getAllpostContent } from "../../../services/ContentServices";
import ContentCard from "../../../components/Card/ContentCard";
import FunctionalButtons, {
  FunctionalButtonModel,
} from "../../../components/v2/FunctionalButtons";
import BoardIcon from "../../../components/Icons/BoardIcon";
import FlagIcon from "../../../components/Icons/FlagIcon";
import LeagueIcon from "../../../components/Icons/LeagueIcon";
import MapIcon from "../../../components/Icons/EventIcon";
import NoRecord from "../../ContentScreen/NoRecord";
import ChatBotIcon from "../../../components/Icons/ChatBotIcon";
import ConfirmationModal from "../../../components/ConfirmationModal/ConfirmationModal";
import { useAuth } from "../../../hooks/UseAuth";
import {
  getLeagueById,
  getdivisionById,
} from "../../../services/LeagueServices";
import { LeagueFlow } from "../../LeagueV2/LeagueScreenV2";

const t = getTranslation([
  "screen.PlayerScreens.Home",
  "constant.district",
  "component.PlayerMeetupButton",
  "constant.button",
  "constant.dummyUser",
]);

type PlayerHomeScreenProps = CompositeScreenProps<
  NativeStackScreenProps<MainStackNavigatorParamList>,
  BottomTabScreenProps<PlayerBottomTabNavigatorParamList, "PlayerHome">
>;

let IS_NOTI_SET_UP = false;

export default function PlayerHome({ navigation }: PlayerHomeScreenProps) {
  const {
    data: meetupList,
    error: meetupError,
    isValidating: meetupIsValidating,
    mutate: meetupMutate,
  } = useSWR(formatCoreUrl("/calendar"), (p) => getCalendarRecords());

  const {
    data: unexpiredList,
    error: unexpiredError,
    isValidating: unexpiredIsValidating,
    mutate: unexpiredMutate,
  } = useSWR(formatCoreUrl("/post?isExpired=false"), () =>
    getAllpostContent("?isExpired=false")
  );

  const { user } = useAuth();
  const isTrial = user?.is_trial;
  const { updateNotification } = useNotification();
  const [verifyModalOpen, setVerifyModalOpenl] = useState(isTrial);
  const [profileModalOpen, setProfileModalOpen] = useState(false);
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

  const handleOnPress = useCallback(
    async (data: CalendarResponse) => {
      switch (data.meetupType) {
        case ActivityType.O3Coach:
          navigation.navigate("PlayerO3AppliedCoachDetails", {
            o3CoachId: data.extra.o3CoachId,
            isForceBackToPlayerMeetupList: false,
          });
          break;
        case ActivityType.Course:
          navigation.navigate("PlayerCourseDetails", {
            courseId: data.extra.courseId,
          });
          break;
        case ActivityType.Venue:
          navigation.navigate("VenueBookingDetail", {
            venueBookingId: data.extra.venueBookingId,
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
      }
    },
    [navigation]
  );

  useFocusEffect(
    React.useCallback(() => {
      meetupMutate();
      unexpiredMutate();
    }, [meetupMutate, unexpiredMutate])
  );

  const latestContents = () => {
    return (
      <VStack space="4" mx="defaultLayoutSpacing">
        <HStack alignItems="center" justifyContent="space-between">
          <Heading fontSize="lg"> {t("Latest Content")}</Heading>
          <Pressable
            onPress={async () => {
              navigation.navigate("ContentList", {
                contents: unexpiredList?.length ? unexpiredList : [],
              });
            }}
          >
            <Text fontSize="md" fontWeight="normal" color="rs.primary_purple">
              {t("View all")}
            </Text>
          </Pressable>
        </HStack>
        {(unexpiredError ||
          !unexpiredList ||
          !Array.isArray(unexpiredList) ||
          unexpiredList.length === 0) && <NoRecord />}
        {Array.isArray(unexpiredList) &&
          unexpiredList.length > 0 &&
          unexpiredList
            .sort(
              (lhs, rhs) => rhs.createdAt.valueOf() - lhs.createdAt.valueOf()
            )
            .slice(0, 3)
            .map((val) => (
              <ContentCard
                key={val.id}
                content={val}
                onPressContentCard={(content) =>
                  navigation.navigate("ContentDetails", {
                    content,
                  })
                }
              />
            ))}
      </VStack>
    );
  };
  const functonalButtons = () => {
    const ftBtns: FunctionalButtonModel[] = [
      {
        title: t("Coach"),
        description: t("Looking for the right coach"),
        icon: () => {
          return <BoardIcon fillColor="white" size="md" />;
        },
        onPress: () => {
          navigation.navigate("PlayerO3AppliedCoach");
        },
      },
      {
        title: t("Course"),
        description: t("Check for availability now"),
        icon: () => {
          return <FlagIcon fillColor="white" size="md" />;
        },
        onPress: () => {
          navigation.navigate("PlayerCourseList");
        },
      },
      {
        title: t("Event"),
        description: t("Check for availability now"),
        icon: () => {
          return <MapIcon size="md" fillColor="white" />;
        },
        onPress: () => {
          navigation.navigate("EventList");
        },
      },
      {
        title: t("League"),
        description: t("Check for availability now"),
        icon: () => {
          return <LeagueIcon strokeColor="white" color="#31095E" />;
        },
        onPress: () => {
          navigation.navigate("PlayerLeague");
        },
      },
    ];

    return <FunctionalButtons buttons={ftBtns} />;
  };

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

  return (
    <HeaderLayout
      headerProps={{
        title: t("Remarkable Sports"),
        rightComponent: (
          <IconButton
            onPress={() => {
              navigation.navigate("NotificationCentre");
            }}
            icon={<NotificationBellIcon />}
          />
        ),
        headerLabelStyle: { fontSize: 24 },
        hasBackButton: false,
        headerLabelContainerStyle: { alignItems: "flex-start" },
      }}
    >
      {!meetupIsValidating && !meetupError && (
        <VStack space="4" mb="5">
          {Array.isArray(meetupList) && (
            <FeatureCardSlider
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
              onPress={handleOnPress}
              placeholderOnPress={() =>
                navigation.navigate("PlayerO3SubmitRequest", {
                  selectedCoachId: null,
                  isSubmitO3RequestWithSelectedCoach: false,
                })
              }
            />
          )}
          <Box mt="3">{chatBotSection()}</Box>
          <Box mt="-2">{functonalButtons()}</Box>
          {latestContents()}
        </VStack>
      )}
      {(meetupIsValidating || unexpiredIsValidating) && <Loading />}
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
