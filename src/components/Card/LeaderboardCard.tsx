import React from "react";
import { Heading, HStack, Text, Pressable, Circle, Box } from "native-base";
import RightArrowIcon from "../Icons/RightArrowIcon";
import VectorIcon from "../Icons/VectorIcon";

export interface LeagueCardProps {
  title: string;
  onPress?: () => void;
}

export default function LeaderboardCard({ title, onPress }: LeagueCardProps) {
  return (
    <Pressable
      onPress={() => {
        onPress?.();
      }}
    >
      <HStack
        flex={1}
        justifyContent="space-between"
        bg="rs_secondary.orange"
        alignItems="center"
        px="4"
        h={20}
        borderRadius="2xl"
      >
        <HStack space={4} alignItems="center" justifyContent="center">
          <Box
            bg="rgba(254,241,4,0.15)"
            borderRadius="full"
            w="10"
            h="10"
            alignItems="center"
            justifyContent="center"
          >
            <VectorIcon size="md" />
          </Box>
          <Text fontSize={20} color="rs.white" lineHeight={28}>
            {title || "N/A"}
          </Text>
        </HStack>
        <Pressable
          _pressed={{ opacity: 0.5 }}
          onPress={() => {
            onPress?.();
          }}
        >
          <RightArrowIcon size="sm" color="white" />
        </Pressable>
      </HStack>
    </Pressable>
  );
}
