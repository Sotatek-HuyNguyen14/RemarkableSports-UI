/* eslint-disable no-lonely-if */
/* eslint-disable prefer-destructuring */
import { NativeStackScreenProps } from "@react-navigation/native-stack";
import useSWR from "swr";
import {
  VStack,
  HStack,
  Text,
  ScrollView,
  Pressable,
  FlatList,
  Button,
} from "native-base";
import React, { useContext, useEffect, useState } from "react";
import { useFocusEffect } from "@react-navigation/native";
import { AxiosError } from "axios";
import * as Notifications from "expo-notifications";
import { SafeAreaView } from "react-native";
import HeaderLayout from "../../components/Layout/HeaderLayout";
import { MainStackNavigatorParamList } from "../../routers/Types";
import { formatCoreUrl } from "../../services/ServiceUtil";
import { getTranslation } from "../../utils/translation";
import {
  NotificationItem,
  NotificationResourceType,
  NotificationType,
} from "../../models/requests/Notification";
import {
  getAllNotifications,
  markAllNotificationsAsRead,
  markNotificationAsRead,
} from "../../services/notificationServices";
import Loading from "../../components/Loading";
import ErrorMessage from "../../components/ErrorMessage";
import NotificationCentreItem from "../../components/NotificationCentreItem";
import { useAuth } from "../../hooks/UseAuth";
import { UserType } from "../../models/User";
import useNotification, { notiContext } from "../../hooks/UseNotification";
import { getEventById, isCreatorForEvent } from "../../services/EventServices";
import {
  getCourseById,
  isCreatorForCourse,
} from "../../services/CourseServices";
import {
  getdivisionById,
  getLeagueById,
  getMatchResultById,
} from "../../services/LeagueServices";
import { isBlank } from "../../utils/strings";
import { SCREEN_HEIGHT } from "../../constants/constants";
import { showApiToastError } from "../../components/ApiToastError";
import Header from "../../components/Header/Header";
import { DivisionMatchResultStatus } from "../../models/responses/League";
import { LeagueFlow } from "../LeagueV2/LeagueScreenV2";

const t = getTranslation("screen.NotificationCentre");

export default function NotificationCentre({
  navigation,
}: NativeStackScreenProps<MainStackNavigatorParamList, "NotificationCentre">) {
  const {
    data: notifications,
    error,
    mutate: mutateNotifications,
    isValidating,
  } = useSWR<NotificationItem[]>(
    formatCoreUrl("/notification"),
    getAllNotifications
  );

  const { user } = useAuth();

  useFocusEffect(
    React.useCallback(() => {
      mutateNotifications();
    }, [mutateNotifications])
  );

  const [isLoading, setLoading] = useState(false);
  const { cleanUpNotifications } = useNotification();

  const context = useContext(notiContext);

  const handleContentNotification = async (item: NotificationItem) => {
    const { data } = item;
    const jsonData = JSON.parse(data);
    if (jsonData && jsonData.contentId) {
      const contentId = jsonData.contentId;
      navigation.navigate("ContentDetails", {
        contentId,
      });
    }
  };

  const handleEventNotification = async (item: NotificationItem) => {
    const userId = user?.id;
    if (userId) {
      const { data } = item;
      const jsonData = JSON.parse(data);
      // Notification Type === Cancellation && empty event ID means the event is deleted
      if (
        item.notificationType === NotificationType.Cancellation &&
        (!jsonData.eventId || isBlank(jsonData.eventId))
      ) {
        navigation.navigate("EventList");
        return;
      }

      if (jsonData && jsonData.eventId) {
        const eventId = jsonData.eventId;

        const event = await getEventById(eventId);
        const isEventCreator = isCreatorForEvent(user, event);

        // If receiver is event Creator
        // -> If we see ApplicationId then navigate to Payment Evidence or Payment Status
        // ---> When ApplicationId && Noti type is Request => Go to Payment Evidence. Otherwise go to Payment Status
        // -> Otherwise navigate to ManageEvent
        // If receiver is event participant
        // -> When event deleted -> noti type == Cancellation => No need navigation
        // -> Otherwise, Navigate to EventDetails

        if (isEventCreator) {
          const applicationId = jsonData.applicationId;
          if (applicationId) {
            const selectedApplication = event.eventApplications.filter(
              (application) => application.id === applicationId
            )[0];
            if (selectedApplication) {
              if (item.notificationType === NotificationType.Request) {
                navigation.navigate("PaymentEvidence", {
                  application: selectedApplication,
                });
              } else {
                navigation.navigate("PaymentStatus", {
                  event,
                  eventId: event.id,
                });
              }
            }
          } else {
            navigation.navigate("ManageEvent", { eventId });
          }
        } else {
          // As participant, when event deleted -> noti type == Cancellation => No need navigation
          if (item.notificationType !== NotificationType.Cancellation) {
            navigation.navigate("PlayerEventDetails", { event });
          }
        }
      }
    }
  };

  const handleLeagueNotification = async (item: NotificationItem) => {
    // If current user is Organizer -> Navigate to ManageDivision
    // Else go to DivisionScreen
    const userId = user?.id;
    if (userId) {
      const { data } = item;
      const jsonData = JSON.parse(data);
      if (user.userType === UserType.Organizer) {
        if (jsonData && jsonData.leagueId && jsonData.divisionId) {
          const leagueId = jsonData.leagueId;
          const divisionId = jsonData.divisionId;
          const league = await getLeagueById(leagueId);
          const division = await getdivisionById(divisionId);
          navigation.navigate("ManageDivision", { league, division });
        }
      } else {
        // If notification type === Cancelation -> Join team request is rejected -> go to Division screen
        // Eles go to Team Management
        if (jsonData && jsonData.divisionId && jsonData.teamId) {
          const divisionId = jsonData.divisionId;
          const teamId = jsonData.teamId;
          const leagueId = jsonData.leagueId;
          if (item.notificationType === NotificationType.Cancellation) {
            const league = await getLeagueById(leagueId);
            const division = await getdivisionById(divisionId);
            navigation.navigate("LeaguePlayerDivision", { division, league });
          } else {
            navigation.navigate("LeagueTeamManagement", { teamId, divisionId });
          }
        }
      }
    }
  };

  const handleMatchResultNotification = async (item: NotificationItem) => {
    // Navigate to MatchResult details screen
    const userId = user?.id;
    if (userId) {
      const { data } = item;
      const jsonData = JSON.parse(data);
      if (jsonData && jsonData.resultId) {
        const resultId = jsonData.resultId;
        const matchResult = await getMatchResultById(resultId);
        const myTeam = matchResult.fixture.homeTeam.members.find(
          (player) => player.userId === user?.sub
        )
          ? matchResult.fixture.homeTeam
          : matchResult.fixture.awayTeam;
        const isShowApproval =
          matchResult.status === DivisionMatchResultStatus.Pending &&
          matchResult.submitted &&
          matchResult.fixture.awayTeam.id === myTeam?.id;
        navigation.navigate("MatchResult", {
          matchResult,
          matchResultId: resultId,
          isShowApproval: !!isShowApproval,
        });
      }
    }
  };

  const handleFixtureNotification = async (item: NotificationItem) => {
    // Organizer won't receive this
    // Should navigate to DivisionScreen with default tab is 1
    // If Organizer receive this on purpose then go to Manage division
    const userId = user?.id;
    if (userId) {
      const { data } = item;
      const jsonData = JSON.parse(data);
      if (jsonData && jsonData.divisionId) {
        const divisionId = jsonData.divisionId;
        const division = await getdivisionById(divisionId);
        const leagueId = jsonData.leagueId;
        const league = await getLeagueById(leagueId);
        if (user.userType === UserType.Organizer) {
          navigation.navigate("ManageDivision", { league, division });
        } else {
          navigation.navigate("LeagueViewAllFixtureV2", {
            flow: LeagueFlow.player,
            divisionId,
            league,
          });
        }
      }
    }
  };

  const handleCourseNotification = async (item: NotificationItem) => {
    const userId = user?.id;
    if (userId) {
      const { data } = item;
      const jsonData = JSON.parse(data);
      // If data includes originalDateTime && newDateTime => Move session notification
      if (jsonData && jsonData.originalDateTime && jsonData.newDateTime) {
        const newDateTime = new Date(jsonData.newDateTime);
        navigation.navigate("PlayerCalendar", {
          defaultDateParam: newDateTime,
        });
        return;
      }
      if (jsonData && jsonData.courseId) {
        const courseId = jsonData.courseId;
        const course = await getCourseById(courseId);
        const isCourseCreator = isCreatorForCourse(userId, course);

        // If receiver is course Creator
        // -> Go to manage course
        // If receiver is course Participants
        // -> Go to course details

        if (isCourseCreator) {
          navigation.navigate("ManageCourse", { course });
        } else {
          navigation.navigate("PlayerCourseDetails", { course });
        }
      }
    }
  };

  const handleVenueNotification = async (item: NotificationItem) => {
    const { data } = item;
    const jsonData = JSON.parse(data);
    if (user) {
      if (
        user.userType === UserType.Player ||
        user.userType === UserType.Coach
      ) {
        if (item.notificationType === NotificationType.Cancellation) {
          if (jsonData.venueId) {
            navigation.navigate("VenueDetail", { venueId: jsonData.venueId });
          }
        } else {
          navigation.navigate("VenueBookingDetail", {
            venueBookingId: jsonData.venueBookingId,
          });
        }
      } else {
        if (jsonData.venueBookingId) {
          navigation.navigate("ClubVenueBookingDetails", {
            venueBookingId: jsonData.venueBookingId,
            flow: "default",
          });
        }
      }
    }
  };

  const handleNavigateForPlayer = async (item: NotificationItem) => {
    const { data } = item;
    const jsonData = JSON.parse(data);
    switch (item.resourceType) {
      case NotificationResourceType.O3Coach:
        if (jsonData && jsonData.O3Id) {
          const appliedCoachId = jsonData.appliedCoachId;
          if (appliedCoachId) {
            navigation.navigate("PlayerO3AppliedCoachDetails", {
              o3CoachId: jsonData.O3Id,
              appliedCoachId,
              isForceBackToPlayerMeetupList: false,
            });
          }
        }
        break;
      case NotificationResourceType.CourseApplication:
        await handleCourseNotification(item);
        break;
      case NotificationResourceType.CourseReminder:
        await handleCourseNotification(item);
        break;
      case NotificationResourceType.VenueBooking:
        await handleVenueNotification(item);
        break;
      case NotificationResourceType.VenueReminder:
        await handleVenueNotification(item);
        break;
      case NotificationResourceType.EventApplication:
        await handleEventNotification(item);
        break;
      case NotificationResourceType.PostContent:
        await handleContentNotification(item);
        break;
      case NotificationResourceType.Event:
        await handleEventNotification(item);
        break;
      case NotificationResourceType.TeamApplication:
        await handleLeagueNotification(item);
        break;
      case NotificationResourceType.MatchResult:
        await handleMatchResultNotification(item);
        break;
      case NotificationResourceType.Fixture:
        await handleFixtureNotification(item);
        break;
      default:
        break;
    }
  };

  const handleNotificationForOrganizer = async (item: NotificationItem) => {
    switch (item.resourceType) {
      case NotificationResourceType.TeamApplication:
        await handleLeagueNotification(item);
        break;
      case NotificationResourceType.MatchResult:
        await handleMatchResultNotification(item);
        break;
      case NotificationResourceType.Fixture:
        await handleFixtureNotification(item);
        break;
      default:
        break;
    }
  };

  const handleNavigateForCoach = async (item: NotificationItem) => {
    const { data } = item;
    const jsonData = JSON.parse(data);

    switch (item.resourceType) {
      case NotificationResourceType.O3Coach:
        if (jsonData && jsonData.O3Id) {
          // If coach receive a Matched Successful noti -> Go to CoachO3Details to see details and maybe cancel
          // If coach receive a o3 request noti -> Go to CoachO3ApplyRequest to see details and maybe apply
          const nextRoute =
            item.notificationType === NotificationType.Successful
              ? "CoachO3Details"
              : "CoachO3ApplyRequest";
          navigation.navigate(nextRoute, {
            o3Id: jsonData.O3Id,
          });
        }
        break;
      case NotificationResourceType.VenueBooking:
        await handleVenueNotification(item);
        break;
      case NotificationResourceType.VenueReminder:
        await handleVenueNotification(item);
        break;
      case NotificationResourceType.CourseApplication:
        await handleCourseNotification(item);
        break;
      case NotificationResourceType.CourseReminder:
        await handleCourseNotification(item);
        break;
      case NotificationResourceType.EventApplication:
        await handleEventNotification(item);
        break;
      case NotificationResourceType.PostContent:
        await handleContentNotification(item);
        break;
      case NotificationResourceType.Event:
        await handleEventNotification(item);
        break;
      case NotificationResourceType.TeamApplication:
        await handleLeagueNotification(item);
        break;
      case NotificationResourceType.MatchResult:
        await handleMatchResultNotification(item);
        break;
      case NotificationResourceType.Fixture:
        await handleFixtureNotification(item);
        break;
      default:
        break;
    }
  };

  const handleNavigationForClubStaff = async (item: NotificationItem) => {
    const { data } = item;
    const jsonData = JSON.parse(data);
    switch (item.resourceType) {
      case NotificationResourceType.CourseApplication:
        await handleCourseNotification(item);
        break;
      case NotificationResourceType.CourseReminder:
        await handleCourseNotification(item);
        break;
      case NotificationResourceType.VenueBooking:
        await handleVenueNotification(item);
        break;
      case NotificationResourceType.VenueReminder:
        await handleVenueNotification(item);
        break;
      case NotificationResourceType.EventApplication:
        await handleEventNotification(item);
        break;
      case NotificationResourceType.Event:
        await handleEventNotification(item);
        break;
      case NotificationResourceType.PostContent:
        await handleContentNotification(item);
        break;
      case NotificationResourceType.TeamApplication:
        await handleLeagueNotification(item);
        break;
      case NotificationResourceType.MatchResult:
        await handleMatchResultNotification(item);
        break;
      case NotificationResourceType.Fixture:
        await handleFixtureNotification(item);
        break;
      default:
        break;
    }
  };

  const onPressNotificationItem = async (item: NotificationItem) => {
    if (user) {
      const { userType } = user;
      setLoading(true);
      context?.onPressNotification(item.id, !item.readAt);
      // mutateNotifications();
      try {
        switch (userType) {
          case UserType.Player:
            await handleNavigateForPlayer(item);
            break;
          case UserType.Coach:
            await handleNavigateForCoach(item);
            break;
          case UserType.ClubStaff:
            await handleNavigationForClubStaff(item);
            break;
          case UserType.Organizer:
            await handleNotificationForOrganizer(item);
            break;
          default:
            break;
        }
        setLoading(false);
      } catch (settingError) {
        console.log("Setting error", settingError);
        setLoading(false);
      }
    }
  };

  const shouldShowLoading = isValidating || isLoading;
  return (
    <SafeAreaView
      style={{
        flex: 1,
        marginBottom: 10,
      }}
    >
      <Header
        // containerStyle={{ marginHorizontal: " }}
        headerLabelStyle={{ fontWeight: "700", fontSize: 16 }}
        title={t("Notification")}
      />
      {shouldShowLoading && <Loading />}

      {!shouldShowLoading && error && <ErrorMessage />}

      {!shouldShowLoading &&
        !error &&
        notifications &&
        notifications.length === 0 && (
          <Text fontSize="md" alignSelf="center" mt="10">
            {t("No Notifications")}
          </Text>
        )}
      <VStack space="3" flex="1">
        {!shouldShowLoading &&
          !error &&
          notifications &&
          Array.isArray(notifications) &&
          notifications.length > 0 && (
            <FlatList
              data={notifications}
              renderItem={(info) => {
                const { index, item: value } = info;
                return (
                  <VStack
                    key={`notification_container_${value.id}`}
                    space="4"
                    py="2"
                  >
                    <NotificationCentreItem
                      onPress={async () => {
                        await onPressNotificationItem(value);
                      }}
                      key={`notification_item_${value.id}`}
                      type={value.notificationType}
                      title={value.title}
                      body={value.body}
                      createdAt={value.pushedAt}
                      readAt={value.readAt}
                    />
                    {index !== notifications.length - 1 && (
                      <HStack
                        key={`notification_item_divider_${value.id}`}
                        mx="4"
                        style={{ height: 1 }}
                        bgColor="rs.grey"
                      />
                    )}
                  </VStack>
                );
              }}
              keyExtractor={(item) => item.id.toString()}
            />
          )}
      </VStack>
      {!shouldShowLoading &&
        !error &&
        notifications &&
        Array.isArray(notifications) &&
        notifications.length > 0 && (
          <Button
            isLoading={isLoading}
            onPress={async () => {
              try {
                setLoading(true);
                await markAllNotificationsAsRead();
                cleanUpNotifications();
                mutateNotifications();
                setLoading(false);
              } catch (markAllReadError) {
                setLoading(false);
                showApiToastError(markAllReadError);
              }
            }}
            mx="defaultLayoutSpacing"
            variant="outline"
          >
            {t("Mark all as read")}
          </Button>
        )}
    </SafeAreaView>
  );
}
