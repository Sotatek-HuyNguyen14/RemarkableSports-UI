/* eslint-disable react/no-unstable-nested-components */
import React from "react";
import {
  BottomTabScreenProps,
  createBottomTabNavigator,
} from "@react-navigation/bottom-tabs";
import { Box, Icon, Circle } from "native-base";

import TabBar from "../components/TabBar";
import HomeIcon from "../components/Icons/HomeIcon";
import HistoryIcon from "../components/Icons/HistoryIcon";
import CalendarIcon from "../components/Icons/CalendarIcon";
import CalendarScreen from "../screens/PlayerScreens/Calendar";
import ProfileIcon from "../components/Icons/ProfileIcon";
import MeetupButton from "../components/CoachMeetupButton";
import CoachHome from "../screens/CoachScreens/Home";
import { CoachBottomTabNavigatorParamList } from "./Types";
import CoachRequestList from "../screens/CoachScreens/RequestList";
import ProfileScreen from "../screens/ProfileScreen";
import { getTranslation } from "../utils/translation";
import MeetupRecords from "../screens/PlayerScreens/MeetupRecords";
import VenueList from "../screens/VenueList";
import GameList from "../screens/GameList";
import EventList from "../screens/EventList";
import CourseList from "../screens/CourseList";
import ContentIcon from "../components/Icons/ContentIcon";
import ContentScreen from "../screens/ContentScreen";
import LeagueScreen from "../screens/LeagueScreen";
import {
  CALENDAR_TAB_TEST_ID,
  CONTENT_TAB_TEST_ID,
  HOME_TAB_TEST_ID,
  PROFILE_TAB_TEST_ID,
} from "../../e2e/helpers";
import LeagueScreenV2 from "../screens/LeagueV2/LeagueScreenV2";

const Tab = createBottomTabNavigator<CoachBottomTabNavigatorParamList>();

const t = getTranslation("component.CoachBottomTabNavigator");

export default function PlayerBottomTabNavigator({
  route,
  navigation,
}: BottomTabScreenProps<CoachBottomTabNavigatorParamList>) {
  return (
    <Tab.Navigator
      initialRouteName="CoachHome"
      tabBar={(props) => <TabBar {...props} />}
      screenOptions={{ headerShown: false }}
    >
      <Tab.Screen
        name="CoachHome"
        component={CoachHome}
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
        name="CoachContent"
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
      {/* <Tab.Screen
        name="CoachHistory"
        component={MeetupRecords}
        options={{
          tabBarIcon: ({ focused }) => {
            return <HistoryIcon isFocus={focused} />;
          },
          tabBarLabel: t("History"),
        }}
      /> */}
      <Tab.Screen
        name="CoachMeetUp"
        component={Box}
        options={{
          tabBarIcon: () => {
            return <MeetupButton route={route} navigation={navigation} />;
          },
          tabBarLabel: "Meetup",
        }}
      />
      <Tab.Screen
        name="CoachCalendar"
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
        name="CoachProfile"
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

      {/* Placing by the sequence of buttons in Meetup button */}
      <Tab.Screen name="CoachRequestList" component={CoachRequestList} />
      <Tab.Screen name="VenueList" component={VenueList} />
      <Tab.Screen name="GameList" component={GameList} />
      <Tab.Screen name="EventList" component={EventList} />
      <Tab.Screen name="CoachCourseList" component={CourseList} />
      <Tab.Screen name="CoachLeague" component={LeagueScreenV2} />
    </Tab.Navigator>
  );
}
