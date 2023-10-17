import React, { useState } from "react";
import {
  Divider,
  IScrollViewProps,
  ITextProps,
  Pressable,
  ScrollView,
  Text,
  VStack,
} from "native-base";
import { StyleProp, ViewStyle } from "react-native";
import { createRandomString } from "../../utils/strings";

export interface GhostTabbarProps {
  items: string[];
  onPress: (item: string, index: number) => void;
  tabProps?: ITextProps;
  activateColor?: string;
  unActivateColor?: string;
  defaultIndex?: number;
  isShowBottomLine?: boolean;
  isFlex?: boolean;
  boxProps?: IScrollViewProps;
}
function GhostTabbar({
  items,
  onPress,
  tabProps,
  activateColor,
  unActivateColor,
  defaultIndex,
  isFlex,
  isShowBottomLine,
  boxProps,
}: GhostTabbarProps) {
  const currentIndex = defaultIndex || 0;
  return (
    <ScrollView
      bounces={false}
      horizontal
      showsHorizontalScrollIndicator={false}
      contentContainerStyle={{ flex: isFlex ? 1 : 0 }}
      {...boxProps}
    >
      {items.map((item, index) => {
        return (
          <VStack
            space={4}
            flex={isFlex ? 1 : 0}
            key={`section_${item}_${createRandomString(8)}`}
          >
            <Pressable
              ml={index !== 0 && !isFlex ? "4" : null}
              onPress={() => {
                onPress(item, index);
              }}
            >
              <Text
                fontSize="md"
                fontWeight={index === currentIndex ? "bold" : null}
                color={
                  index === currentIndex
                    ? activateColor ?? "rs.black"
                    : unActivateColor ?? "rs.button_grey"
                }
                {...tabProps}
              >
                {item}
              </Text>
            </Pressable>
            {isShowBottomLine && index === currentIndex && (
              <Divider h="2px" bg={activateColor} />
            )}
            {isShowBottomLine && index !== currentIndex && (
              <Divider h="1px" bg="rs.lightGrey" />
            )}
          </VStack>
        );
      })}
    </ScrollView>
  );
}
export default GhostTabbar;
