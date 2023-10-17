import {
  Box,
  Heading,
  HStack,
  ScrollView,
  Text,
  useTheme,
  VStack,
} from "native-base";
import React, { useRef } from "react";
import { Animated, Pressable, View } from "react-native";
import { SCREEN_WIDTH } from "../../constants/constants";
import { ActivityType } from "../../models/Request";
import { CalendarResponse, formatId } from "../../models/responses/Calendar";
import {
  format12HTo24H,
  formatDateToCalendar,
  formatUtcToLocalTime,
} from "../../utils/date";
import { getTranslation } from "../../utils/translation";
import FeatureCard from "../Card/FeatureCard";
import FeaturePlaceholderCard from "../Card/FeaturePlaceholderCard";
import CalendarIcon from "../Icons/CalendarIcon";
import ClockIcon from "../Icons/ClockIcon";
import LocationIcon from "../Icons/LocationIcon";

export interface ScrollableFeatureCardListProps {
  meetupData: CalendarResponse[];
  placeholderOnPress?: () => void;
  onPress?: (data: CalendarResponse) => void;
}

const t = getTranslation("component.FeatureCardSlider");

export default function FeatureCardSlider({
  meetupData,
  placeholderOnPress,
  onPress,
}: ScrollableFeatureCardListProps) {
  const scrollX = useRef(new Animated.Value(0)).current;
  const { colors } = useTheme();

  return (
    <VStack>
      {Array.isArray(meetupData) && meetupData.length > 0 && (
        <>
          <ScrollView
            horizontal
            pagingEnabled
            showsHorizontalScrollIndicator={false}
            scrollEventThrottle={1} // Can lead to performance issue
            onScroll={Animated.event(
              [
                {
                  nativeEvent: {
                    contentOffset: {
                      x: scrollX,
                    },
                  },
                },
              ],
              { useNativeDriver: false }
            )}
          >
            {meetupData.map((item, index) => {
              const bg =
                item.meetupType === ActivityType.O3Coach
                  ? colors.rs.primary_purple
                  : item.meetupType === ActivityType.Event
                  ? "#66CEE1"
                  : item.meetupType === ActivityType.Course
                  ? "#FF9900"
                  : colors.rs.primary_purple;
              const meetupTitle =
                item.meetupType === ActivityType.O3Coach
                  ? t("Meetup")
                  : item.meetupType === ActivityType.Event
                  ? t("Event")
                  : item.meetupType === ActivityType.Course
                  ? t("Course")
                  : "";

              return (
                <VStack
                  w={SCREEN_WIDTH}
                  p="4"
                  borderBottomRadius="2xl"
                  key={formatId(item)}
                >
                  <View
                    style={{
                      height: 40,
                      width: "100%",
                      backgroundColor: bg,
                      paddingHorizontal: 16,
                      paddingVertical: 10,
                      borderTopLeftRadius: 15,
                      borderTopRightRadius: 15,
                    }}
                  >
                    <Text
                      style={{ fontSize: 16 }}
                      fontWeight="bold"
                      color="white"
                    >
                      {meetupTitle}
                    </Text>
                  </View>
                  <Pressable
                    onPress={() => {
                      if (onPress) {
                        onPress?.(item);
                      } else {
                        placeholderOnPress?.();
                      }
                    }}
                  >
                    <VStack
                      space="4"
                      bg="#F6F6F6"
                      p="4"
                      borderBottomRadius="2xl"
                    >
                      <Heading fontSize="md">{item.name}</Heading>
                      <HStack space="2" alignItems="center">
                        <CalendarIcon />
                        <Text>{formatDateToCalendar(item.startTime)}</Text>
                      </HStack>
                      <HStack space="2" alignItems="center">
                        <ClockIcon />
                        <Text>{`${formatUtcToLocalTime(
                          item.startTime
                        )} - ${formatUtcToLocalTime(item.endTime)}`}</Text>
                      </HStack>
                      <HStack space="2" alignItems="center">
                        <LocationIcon />
                        <Text>{`${item.location}`}</Text>
                      </HStack>
                    </VStack>
                  </Pressable>
                </VStack>
              );
            })}
          </ScrollView>
          <Box
            flexDirection="row"
            alignSelf="center"
            position="absolute"
            bottom="-16"
          >
            {meetupData.map((item, index) => {
              const selected = scrollX.interpolate({
                inputRange: [
                  SCREEN_WIDTH * (index - 1),
                  SCREEN_WIDTH * index,
                  SCREEN_WIDTH * (index + 1),
                ],
                outputRange: ["#D9D9D9", "#31095E", "#D9D9D9"],
                extrapolate: "clamp",
              });
              return (
                <Animated.View
                  key={formatId(item)}
                  style={[
                    {
                      width: 10,
                      height: 10,
                      borderRadius: 5,
                      backgroundColor: selected,
                      marginHorizontal: 4,
                    },
                  ]}
                />
              );
            })}
          </Box>
        </>
      )}
    </VStack>
  );
}
