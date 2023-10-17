/* eslint-disable react/no-unstable-nested-components */
import React from "react";
import {
  BottomTabScreenProps,
  createBottomTabNavigator,
} from "@react-navigation/bottom-tabs";
import { Box } from "native-base";

import { OrganizerBottomTabNavigatorParamList } from "./Types";
import TabBar from "../components/TabBar";
import ManageIcon from "../components/Icons/ManageIcon";
import { getTranslation } from "../utils/translation";
import AdminHomeScreen from "../screens/AdminScreens/AdminHome";
import HomeIcon from "../components/Icons/HomeIcon";
import AdminClubScreen from "../screens/AdminScreens/AdminClub";
import ContentIcon from "../components/Icons/ContentIcon";
import ContentScreen from "../screens/ContentScreen";
import AdminPermission from "../screens/AdminScreens/AdminPermission";
import LeagueHome from "../screens/OrganizerScreens/LeagueScreen";
import ProfileIcon from "../components/Icons/ProfileIcon";
import OrganizerProfile from "../screens/OrganizerScreens/OrganizerProfile";

const Tab = createBottomTabNavigator<OrganizerBottomTabNavigatorParamList>();

const t = getTranslation([
  "component.OrganizerBottomTabNavigator",
  "screen.ProfileScreen.ProfileScreen",
]);

export default function OrganizerBottomTabNavigator({
  route,
}: BottomTabScreenProps<OrganizerBottomTabNavigatorParamList>) {
  return (
    <Tab.Navigator
      initialRouteName="LeagueHome"
      tabBar={(props) => <TabBar {...props} />}
      screenOptions={{ headerShown: false }}
    >
      <Tab.Screen
        name="LeagueHome"
        component={LeagueHome}
        options={{
          tabBarIcon: ({ focused }) => {
            return <HomeIcon isFocus={focused} />;
          },
          tabBarLabel: t("League"),
        }}
      />
      <Tab.Screen
        name="OrganizerProfile"
        component={OrganizerProfile}
        options={{
          tabBarIcon: ({ focused }) => {
            return <ProfileIcon isFocus={focused} />;
          },
          tabBarLabel: t("Profile"),
        }}
      />
    </Tab.Navigator>
  );
}
