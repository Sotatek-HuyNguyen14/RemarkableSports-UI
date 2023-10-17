import React, { useCallback, useEffect, useRef, useState } from "react";
import { Animated } from "react-native";
import { Box } from "native-base";
import { BottomTabScreenProps } from "@react-navigation/bottom-tabs";

import { ClubBottomTabNavigatorParamList } from "../../routers/Types";
import RacketBatIcon from "../Icons/RacketBatIcon";
import MapIcon from "../Icons/EventIcon";
import TabNavigatorIcon from "../Icons/TabNavigatorIcon";
import BoxIcon from "../Icons/BoxIcon";
import LocationIcon from "../Icons/LocationIcon";
import BoardIcon from "../Icons/BoardIcon";
import FlagIcon from "../Icons/FlagIcon";
import CrossIcon from "../Icons/CrossIcon";
import { SCREEN_HEIGHT, SCREEN_WIDTH } from "../../constants/constants";
import { getTranslation } from "../../utils/translation";
import CalendarIcon from "../Icons/CalendarIcon";
import LeagueIcon from "../Icons/LeagueIcon";
import ReportIcon from "../Icons/ReportIcon";
import {
  COURSE_ROUTE_TEST_ID,
  EVENT_ROUTE_TEST_ID,
  LEAGUE_ROUTE_TEST_ID,
  MEET_BUTTON_TEST_ID,
  REPORT_ROUTE_TEST_ID,
  VENUE_ROUTE_TEST_ID,
} from "../../../e2e/helpers";

type IconType =
  | "Event"
  | "ClubCalendar"
  | "Meet"
  | "League"
  | "Course"
  | "Venue"
  | "Report"
  | "Cross";

export type StaffMeetupButtonProps =
  BottomTabScreenProps<ClubBottomTabNavigatorParamList>;

const t = getTranslation("component.StaffMeetupButton");

function renderIcon(iconName: IconType) {
  switch (iconName) {
    case "Meet":
      return <RacketBatIcon />;
    case "Event":
      return <MapIcon />;
    case "League":
      return <LeagueIcon size="lg" />;
    case "Course":
      return <FlagIcon />;
    case "Venue":
      return <LocationIcon size="xl" color="#000000" />;
    case "Report":
      return <ReportIcon />;
    default:
      return <CrossIcon />;
  }
}

export default function StaffMeetupButton({
  navigation,
}: StaffMeetupButtonProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [icon, setIcon] = useState<{
    previous: IconType;
    current: IconType;
  }>({
    previous: "Meet",
    current: "Meet",
  });
  const [currentRoute, setCurrentRoute] =
    useState<keyof ClubBottomTabNavigatorParamList>("ClubHome");
  const { current: animation } = useRef(new Animated.Value(0));
  useEffect(() => {
    const unsubscribe = navigation.addListener("state", (e) => {
      setCurrentRoute(
        e.data.state.routes[0].state?.routes[
          e.data.state.routes[0].state?.index || 0
        ].name as keyof ClubBottomTabNavigatorParamList
      );
    });
    return unsubscribe;
  }, [navigation]);

  useEffect(() => {
    switch (currentRoute) {
      case "EventList":
        setIcon((prev) => ({ previous: prev.current, current: "Event" }));
        break;
      case "ClubLeague":
        setIcon((prev) => ({ previous: prev.current, current: "League" }));
        break;
      case "ClubVenueList":
        setIcon((prev) => ({ previous: prev.current, current: "Venue" }));
        break;
      case "ClubCourseList":
        setIcon((prev) => ({ previous: prev.current, current: "Course" }));
        break;
      case "ClubReportScreen":
        setIcon((prev) => ({ previous: prev.current, current: "Report" }));
        break;
      default:
        setIcon((prev) => ({ previous: prev.current, current: "Meet" }));
    }
  }, [currentRoute]);

  const triggerAnimation = useCallback(() => {
    setIsOpen((prev) => !prev);
    Animated.timing(animation, {
      toValue: isOpen ? 0 : 1,
      duration: 300,
      useNativeDriver: false,
    }).start();
  }, [animation, isOpen]);
  // Event animation
  const eventX = animation.interpolate({
    inputRange: [0, 1],
    outputRange: [20, -130],
  });
  const eventY = animation.interpolate({
    inputRange: [0, 1],
    outputRange: [0, -50],
  });

  // Course animation
  const courseX = animation.interpolate({
    inputRange: [0, 1],
    outputRange: [20, -60],
  });
  const courseY = animation.interpolate({
    inputRange: [0, 1],
    outputRange: [0, -85],
  });

  // League animation
  const leagueX = animation.interpolate({
    inputRange: [0, 1],
    outputRange: [20, 10],
  });
  const leagueY = animation.interpolate({
    inputRange: [0, 1],
    outputRange: [0, -110],
  });

  // Opacity animation for all buttons
  const opacity = animation.interpolate({
    inputRange: [0, 1],
    outputRange: [0, 1],
  });
  // Venue animation
  const venueX = animation.interpolate({
    inputRange: [0, 1],
    outputRange: [20, 85],
  });
  const venueY = animation.interpolate({
    inputRange: [0, 1],
    outputRange: [0, -85],
  });

  // Report animation
  const reportX = animation.interpolate({
    inputRange: [0, 1],
    outputRange: [20, 150],
  });
  const reportY = animation.interpolate({
    inputRange: [0, 1],
    outputRange: [0, -50],
  });

  return (
    <Box justifyContent="center" alignItems="center">
      {isOpen && (
        <Animated.View
          style={{
            position: "absolute",
            opacity,
          }}
        >
          <Box
            w={SCREEN_WIDTH}
            h={SCREEN_HEIGHT * 2}
            bgColor="rs.black"
            opacity="0.6"
          />
        </Animated.View>
      )}
      <Animated.View
        style={{
          position: "absolute",
          left: eventX,
          top: eventY,
          opacity,
        }}
      >
        <TabNavigatorIcon
          testID={EVENT_ROUTE_TEST_ID}
          label={t("Event")}
          textProps={{ color: "rs.white" }}
          onPress={() => {
            triggerAnimation();
            navigation.navigate("EventList");
            setIcon((prev) => ({ previous: prev.current, current: "Event" }));
          }}
        >
          {renderIcon("Event")}
        </TabNavigatorIcon>
      </Animated.View>

      <Animated.View
        style={{
          position: "absolute",
          left: courseX,
          top: courseY,
          opacity,
        }}
      >
        <TabNavigatorIcon
          testID={COURSE_ROUTE_TEST_ID}
          label={t("Course")}
          textProps={{ color: "rs.white" }}
          onPress={() => {
            triggerAnimation();
            navigation.navigate("ClubCourseList");
            setIcon((prev) => ({ previous: prev.current, current: "Course" }));
          }}
        >
          {renderIcon("Course")}
        </TabNavigatorIcon>
      </Animated.View>
      <Animated.View
        style={{
          position: "absolute",
          left: leagueX,
          top: leagueY,
          opacity,
        }}
      >
        <TabNavigatorIcon
          testID={LEAGUE_ROUTE_TEST_ID}
          label={t("League")}
          textProps={{ color: "rs.white" }}
          onPress={() => {
            triggerAnimation();
            navigation.navigate("ClubLeague");
            setIcon((prev) => ({ previous: prev.current, current: "League" }));
          }}
        >
          {renderIcon("League")}
        </TabNavigatorIcon>
      </Animated.View>
      <Animated.View
        style={{
          position: "absolute",
          left: venueX,
          top: venueY,
          opacity,
        }}
      >
        <TabNavigatorIcon
          testID={VENUE_ROUTE_TEST_ID}
          label={t("Venue")}
          textProps={{ color: "rs.white" }}
          onPress={() => {
            triggerAnimation();
            navigation.navigate("ClubVenueList");
            setIcon((prev) => ({ previous: prev.current, current: "Venue" }));
          }}
        >
          {renderIcon("Venue")}
        </TabNavigatorIcon>
      </Animated.View>

      <Animated.View
        style={{
          position: "absolute",
          left: reportX,
          top: reportY,
          opacity,
        }}
      >
        <TabNavigatorIcon
          testID={REPORT_ROUTE_TEST_ID}
          label={t("Report")}
          textProps={{ color: "rs.white" }}
          onPress={() => {
            triggerAnimation();
            navigation.navigate("ClubReportScreen");
            setIcon((prev) => ({ previous: prev.current, current: "Report" }));
          }}
        >
          {renderIcon("Report")}
        </TabNavigatorIcon>
      </Animated.View>

      <TabNavigatorIcon
        testID={MEET_BUTTON_TEST_ID}
        label={t(icon.current === "Cross" ? "Cancel" : icon.current)}
        textProps={{ color: isOpen ? "rs.white" : "rs.black" }}
        bgColor={
          isOpen
            ? "rs.lightGrey"
            : icon.current !== "Meet"
            ? "rs.GPP_lightBlue"
            : "rs.lightGrey"
        }
        onPress={() => {
          triggerAnimation();
          setIcon((prev) => {
            if (prev.current === "Cross") {
              return { previous: prev.current, current: prev.previous };
            }
            if (prev.current === "Meet") {
              return { previous: prev.current, current: "Meet" };
            }
            return { previous: prev.current, current: "Cross" };
          });
        }}
      >
        {renderIcon(icon.current)}
      </TabNavigatorIcon>
    </Box>
  );
}
