/* eslint-disable react/no-unstable-nested-components */
import React from "react";
import {
  BottomTabScreenProps,
  createBottomTabNavigator,
} from "@react-navigation/bottom-tabs";
import { Box } from "native-base";

import { AdminBottomTabNavigatorParamList } from "./Types";
import TabBar from "../components/TabBar";
import ManageIcon from "../components/Icons/ManageIcon";
import { getTranslation } from "../utils/translation";
import AdminHomeScreen from "../screens/AdminScreens/AdminHome";
import HomeIcon from "../components/Icons/HomeIcon";
import AdminClubScreen from "../screens/AdminScreens/AdminClub";
import ContentIcon from "../components/Icons/ContentIcon";
import ContentScreen from "../screens/ContentScreen";
import AdminPermission from "../screens/AdminScreens/AdminPermission";

const Tab = createBottomTabNavigator<AdminBottomTabNavigatorParamList>();

const t = getTranslation("component.AdminBottomTabNavigator");

export default function AdminBottomTabNavigator({
  route,
}: BottomTabScreenProps<AdminBottomTabNavigatorParamList>) {
  return (
    <Tab.Navigator
      initialRouteName="AdminUser"
      tabBar={(props) => <TabBar {...props} />}
      screenOptions={{ headerShown: false }}
    >
      <Tab.Screen
        name="AdminUser"
        component={AdminHomeScreen}
        options={{
          tabBarIcon: ({ focused }) => {
            return <HomeIcon isFocus={focused} />;
          },
          tabBarLabel: t("User"),
        }}
      />
      <Tab.Screen
        name="AdminContent"
        component={ContentScreen}
        options={{
          tabBarIcon: ({ focused }) => {
            return <ContentIcon isFocus={focused} />;
          },
          tabBarLabel: t("Content"),
        }}
      />
      <Tab.Screen
        name="AdminPermission"
        component={AdminPermission}
        options={{
          tabBarIcon: ({ focused }) => {
            return <ManageIcon isFocus={focused} />;
          },
          tabBarLabel: t("Permission"),
        }}
      />
      <Tab.Screen
        name="AdminClub"
        component={AdminClubScreen}
        options={{
          tabBarIcon: ({ focused }) => {
            return <ManageIcon isFocus={focused} />;
          },
          tabBarLabel: t("Club"),
        }}
      />
    </Tab.Navigator>
  );
}
