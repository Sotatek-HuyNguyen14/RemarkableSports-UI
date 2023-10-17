import React, { useCallback, useRef, useState, useEffect } from "react";
import { Animated } from "react-native";
import { Box } from "native-base";
import { BottomTabScreenProps } from "@react-navigation/bottom-tabs";
import { CoachBottomTabNavigatorParamList } from "../../routers/Types";
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
import LeagueIcon from "../Icons/LeagueIcon";
import {
  COURSE_ROUTE_TEST_ID,
  EVENT_ROUTE_TEST_ID,
  MEET_BUTTON_TEST_ID,
  O3_ROUTE_TEST_ID,
  VENUE_ROUTE_TEST_ID,
} from "../../../e2e/helpers";

type IconType =
  | "Meet"
  | "Event"
  | "Course"
  | "Coach"
  | "Venue"
  | "Game"
  | "Cross"
  | "League";
export type CoachMeetupButtonProps =
  BottomTabScreenProps<CoachBottomTabNavigatorParamList>;
const t = getTranslation("component.CoachMeetupButton");
function renderIcon(iconName: IconType) {
  switch (iconName) {
    case "Meet":
      return <RacketBatIcon />;
    case "Event":
      return <MapIcon />;
    case "Course":
      return <FlagIcon />;
    case "Coach":
      return <BoardIcon />;
    case "Venue":
      return <LocationIcon size="xl" color="#000000" />;
    case "Game":
      return <BoxIcon />;
    case "League":
      return <LeagueIcon size="lg" />;
    default:
      return <CrossIcon />;
  }
}
export default function CoachMeetupButton({
  navigation,
}: CoachMeetupButtonProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [icon, setIcon] = useState<{
    previous: IconType;
    current: IconType;
  }>({
    previous: "Meet",
    current: "Meet",
  });
  const { current: animation } = useRef(new Animated.Value(0));
  const [currentRoute, setCurrentRoute] =
    useState<keyof CoachBottomTabNavigatorParamList>("CoachHome");
  useEffect(() => {
    const unsubscribe = navigation.addListener("state", (e) => {
      setCurrentRoute(
        e.data.state.routes[0].state?.routes[
          e.data.state.routes[0].state?.index || 0
        ].name as keyof CoachBottomTabNavigatorParamList
      );
    });
    return unsubscribe;
  }, [navigation]);

  useEffect(() => {
    switch (currentRoute) {
      case "CoachRequestList":
        setIcon((prev) => ({ previous: prev.current, current: "Coach" }));
        break;
      case "VenueList":
        setIcon((prev) => ({ previous: prev.current, current: "Venue" }));
        break;
      case "EventList":
        setIcon((prev) => ({ previous: prev.current, current: "Event" }));
        break;
      case "GameList":
        setIcon((prev) => ({ previous: prev.current, current: "Game" }));
        break;
      case "CoachCourseList":
        setIcon((prev) => ({ previous: prev.current, current: "Course" }));
        break;
      case "CoachLeague":
        setIcon((prev) => ({ previous: prev.current, current: "League" }));
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
    outputRange: [20, -122],
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
  // Coach animation
  const coachX = animation.interpolate({
    inputRange: [0, 1],
    outputRange: [20, 12],
  });
  const coachY = animation.interpolate({
    inputRange: [0, 1],
    outputRange: [0, -110],
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
  // Game animation
  const gameX = animation.interpolate({
    inputRange: [0, 1],
    outputRange: [20, 150],
  });
  const gameY = animation.interpolate({
    inputRange: [0, 1],
    outputRange: [0, -50],
  });
  // Opacity animation for all buttons
  const opacity = animation.interpolate({
    inputRange: [0, 1],
    outputRange: [0, 1],
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
            navigation.navigate("CoachCourseList");
            setIcon((prev) => ({ previous: prev.current, current: "Course" }));
          }}
        >
          {renderIcon("Course")}
        </TabNavigatorIcon>
      </Animated.View>
      <Animated.View
        style={{
          position: "absolute",
          left: coachX,
          top: coachY,
          opacity,
        }}
      >
        <TabNavigatorIcon
          testID={O3_ROUTE_TEST_ID}
          label={t("Coach")}
          textProps={{ color: "rs.white" }}
          onPress={() => {
            triggerAnimation();
            navigation.navigate("CoachRequestList");
            setIcon((prev) => ({ previous: prev.current, current: "Coach" }));
          }}
        >
          {renderIcon("Coach")}
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
            navigation.navigate("VenueList");
            setIcon((prev) => ({ previous: prev.current, current: "Venue" }));
          }}
        >
          {renderIcon("Venue")}
        </TabNavigatorIcon>
      </Animated.View>
      {/* <Animated.View
        style={{
          position: "absolute",
          left: gameX,
          top: gameY,
          opacity,
        }}
      >
        <TabNavigatorIcon
          label={t("Game")}
          textProps={{ color: "rs.white" }}
          onPress={() => {
            triggerAnimation();
            navigation.navigate("GameList");
          }}
        >
          {renderIcon("Game")}
        </TabNavigatorIcon>
      </Animated.View> */}
      <Animated.View
        style={{
          position: "absolute",
          left: gameX,
          top: gameY,
          opacity,
        }}
      >
        <TabNavigatorIcon
          label={t("League")}
          textProps={{ color: "rs.white" }}
          onPress={() => {
            triggerAnimation();
            navigation.navigate("CoachLeague");
            setIcon((prev) => ({ previous: prev.current, current: "League" }));
          }}
        >
          {renderIcon("League")}
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
