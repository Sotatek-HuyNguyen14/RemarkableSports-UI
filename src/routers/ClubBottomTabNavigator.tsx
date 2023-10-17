/* eslint-disable react/no-unstable-nested-components */
import React from "react";
import {
  BottomTabScreenProps,
  createBottomTabNavigator,
} from "@react-navigation/bottom-tabs";

import { Toast, Box, Icon, Circle } from "native-base";
import { ClubBottomTabNavigatorParamList } from "./Types";
import TabBar from "../components/TabBar";
import ClubHome from "../screens/ClubScreens/Home";
import ProfileScreen from "../screens/ProfileScreen";
import ManageScreen from "../screens/ClubScreens/Manage";
import CalendarScreen from "../screens/ClubScreens/ClubCalendar";
import HomeIcon from "../components/Icons/HomeIcon";
import ManageIcon from "../components/Icons/ManageIcon";
import CalendarIcon from "../components/Icons/CalendarIcon";
import ProfileIcon from "../components/Icons/ProfileIcon";
import { getTranslation } from "../utils/translation";
import { useAuth } from "../hooks/UseAuth";
import { ClubStaff } from "../models/User";
import MessageToast, {
  MesssageToastType,
} from "../components/Toast/MessageToast";
import { ClubStatusType } from "../models/requests/Club";
import ContentScreen from "../screens/ContentScreen";
import ContentIcon from "../components/Icons/ContentIcon";
import MeetupButton from "../components/StaffMeetupButton";
import EventList from "../screens/EventList";
import LeagueScreen from "../screens/LeagueScreen";
import PlayerCalendar from "../screens/PlayerScreens/Calendar";
import CourseList from "../screens/CourseList";
import VenueList from "../screens/ClubScreens/VenueList";
import ReportScreen from "../screens/ClubScreens/ClubReportScreen";
import {
  CALENDAR_TAB_TEST_ID,
  CONTENT_TAB_TEST_ID,
  HOME_TAB_TEST_ID,
  PROFILE_TAB_TEST_ID,
} from "../../e2e/helpers";
import LeagueScreenV2 from "../screens/LeagueV2/LeagueScreenV2";

const Tab = createBottomTabNavigator<ClubBottomTabNavigatorParamList>();

const t = getTranslation("component.ClubBottomTabNavigator");

export default function ClubBottomTabNavigator({
  route,
  navigation,
}: BottomTabScreenProps<ClubBottomTabNavigatorParamList>) {
  const { user } = useAuth();
  const staff = user as ClubStaff;
  const appliedStatus = staff?.applyClubStatus || staff?.club?.approvalStatus;
  const isAbleToUseClubFeatures =
    staff?.club !== null && appliedStatus === ClubStatusType.Approved;

  return (
    <Tab.Navigator
      initialRouteName="ClubHome"
      tabBar={(props) => <TabBar {...props} />}
      screenOptions={{ headerShown: false }}
    >
      <Tab.Screen
        name="ClubHome"
        component={ClubHome}
        options={{
          tabBarIcon: ({ focused }) => {
            return (
              <Icon
                testID={HOME_TAB_TEST_ID}
                as={<Circle />}
                size="44"
                bg={focused ? "rs.GPP_lightBlue" : null}
                alignItems="center"
                justifyContent="center"
              >
                <HomeIcon isFocus={focused} />
              </Icon>
            );
          },
          tabBarLabel: t("Home"),
        }}
      />
      <Tab.Screen
        name="ClubContent"
        component={ContentScreen}
        options={{
          tabBarIcon: ({ focused }) => {
            return (
              <Icon
                testID={CONTENT_TAB_TEST_ID}
                as={<Circle />}
                size="44"
                bg={focused ? "rs.GPP_lightBlue" : null}
                alignItems="center"
                justifyContent="center"
              >
                <ContentIcon isFocus={focused} />
              </Icon>
            );
          },
          tabBarLabel: t("Content"),
        }}
      />
      <Tab.Screen
        name="StaffMeetUp"
        component={Box}
        options={{
          tabBarIcon: () => {
            return <MeetupButton route={route} navigation={navigation} />;
          },
          tabBarLabel: "Meetup",
        }}
      />
      {/* <Tab.Screen
        name="ClubManage"
        component={ManageScreen}
        options={{
          tabBarIcon: ({ focused }) => {
            return (
              <Icon
                as={<Circle />}
                size="44"
                bg={focused ? "rs.GPP_lightBlue" : null}
                alignItems="center"
                justifyContent="center"
              >
                <ManageIcon isFocus={focused} />
              </Icon>
            );
          },
          tabBarLabel: t("Manage"),
        }}
        listeners={{
          tabPress: (e) => {
            // Prevent default action
            if (!isAbleToUseClubFeatures) {
              e.preventDefault();
              Toast.show({
                id: "navigateFailure",
                duration: 2000,
                placement: "top",
                render: () => {
                  return (
                    <MessageToast
                      type={MesssageToastType.Reminder}
                      title={t("Reminder")}
                      body={t(
                        "Please join or create a club before further actions"
                      )}
                    />
                  );
                },
              });
            }
          },
        }}
      /> */}
      {/* <Tab.Screen
        name="ClubCalendar"
        component={CalendarScreen}
        options={{
          tabBarIcon: ({ focused }) => {
            return <CalendarIcon props={{ size: "lg" }} isFocus={focused} />;
          },
          tabBarLabel: t("Calendar"),
        }}
        listeners={{
          tabPress: (e) => {
            // Prevent default action
            if (!isAbleToUseClubFeatures) {
              e.preventDefault();
              Toast.show({
                id: "navigateFailure",
                duration: 2000,
                placement: "top",
                render: () => {
                  return (
                    <MessageToast
                      type={MesssageToastType.Reminder}
                      title={t("Reminder")}
                      body={t(
                        "Please join or create a club before further actions"
                      )}
                    />
                  );
                },
              });
            }
          },
        }}
        
      /> */}

      <Tab.Screen
        name="ClubCalendar"
        component={CalendarScreen}
        options={{
          tabBarIcon: ({ focused }) => {
            return (
              <Icon
                testID={CALENDAR_TAB_TEST_ID}
                as={<Circle />}
                size="44"
                bg={focused ? "rs.GPP_lightBlue" : null}
                alignItems="center"
                justifyContent="center"
              >
                <CalendarIcon props={{ size: "lg" }} isFocus={focused} />
              </Icon>
            );
          },
          tabBarLabel: t("Calendar"),
        }}
      />

      <Tab.Screen
        name="ClubProfile"
        component={ProfileScreen}
        options={{
          tabBarIcon: ({ focused }) => {
            return (
              <Icon
                testID={PROFILE_TAB_TEST_ID}
                as={<Circle />}
                size="44"
                bg={focused ? "rs.GPP_lightBlue" : null}
                alignItems="center"
                justifyContent="center"
              >
                <ProfileIcon isFocus={focused} />
              </Icon>
            );
          },
          tabBarLabel: t("Profile"),
        }}
      />

      {/* club by the sequence of buttons in Meetup button */}
      <Tab.Screen name="EventList" component={EventList} />
      <Tab.Screen name="ClubLeague" component={LeagueScreenV2} />
      <Tab.Screen name="ClubCourseList" component={CourseList} />
      <Tab.Screen name="ClubVenueList" component={VenueList} />
      <Tab.Screen name="ClubReportScreen" component={ReportScreen} />
    </Tab.Navigator>
  );
}
