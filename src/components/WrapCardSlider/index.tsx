import { Box, HStack, ScrollView, VStack, Pressable } from "native-base";
import React, { useRef } from "react";
import { uniqueId } from "lodash";
import { Animated, View } from "react-native";
import { SCREEN_WIDTH } from "../../constants/constants";
import { CalendarResponse } from "../../models/responses/Calendar";

export interface WrapCardSliderProps {
  placeholderOnPress?: () => void;
  onPress?: (data: CalendarResponse) => void;
  children?: JSX.Element[] | false;
}

export default function WrapCardSlider({ children }: WrapCardSliderProps) {
  const scrollX = useRef(new Animated.Value(0)).current;

  return (
    <VStack space="4">
      <HStack
        shadow="9"
        style={{
          shadowOffset: {
            width: 5,
            height: 5,
          },
          shadowOpacity: 0.1,
        }}
        borderRadius="3xl"
      >
        <ScrollView
          horizontal
          borderRadius="3xl"
          pagingEnabled
          showsHorizontalScrollIndicator={false}
          scrollEventThrottle={1}
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
          {children}
        </ScrollView>
      </HStack>
      <Box flexDirection="row" alignSelf="center">
        {children &&
          children.length > 0 &&
          children?.map((item, index) => {
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
                key={uniqueId()}
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
    </VStack>
  );
}
