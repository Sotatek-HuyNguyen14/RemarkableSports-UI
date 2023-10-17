import React from "react";
import {
  Heading,
  HStack,
  Text,
  Pressable,
  VStack,
  IStackProps,
} from "native-base";
import DownArrowIcon from "../Icons/DownArrowIcon";

export interface LeagueCardProps {
  leagueName: string;
  onPress?: () => void;
  boxProps?: IStackProps;
  topTitle?: string;
  bgColor?: string;
}

export default function LeagueCard({
  leagueName,
  onPress,
  topTitle,
  boxProps,
  bgColor,
}: LeagueCardProps) {
  return (
    <Pressable
      onPress={() => {
        onPress?.();
      }}
    >
      <VStack flex={1} p="4" borderRadius="2xl" bg={bgColor ?? "rs.lightGrey"}>
        {topTitle && (
          <Text fontSize={12} color="rs.inputLabel_grey">
            {topTitle}
          </Text>
        )}
        <HStack
          justifyContent="space-between"
          alignItems="center"
          {...boxProps}
        >
          <Text fontSize={16}>{leagueName || "N/A"}</Text>
          <Pressable
            _pressed={{ opacity: 0.5 }}
            pt="2"
            onPress={() => {
              onPress?.();
            }}
          >
            <DownArrowIcon size="sm" />
          </Pressable>
        </HStack>
      </VStack>
    </Pressable>
  );
}
