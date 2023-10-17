import React from "react";
import {
  Heading,
  HStack,
  Text,
  Pressable,
  Circle,
  Box,
  VStack,
} from "native-base";
import RightArrowIcon from "../Icons/RightArrowIcon";
import VectorIcon from "../Icons/VectorIcon";
import ClubCradIcon from "../Icons/ClubCradIcon";

export interface LeagueCardProps {
  title: string;
  description: string;
  onPress?: () => void;
  type?: "create" | "join";
}

export default function CreateJoinClubCard({
  title,
  description,
  onPress,
  type = "create",
}: LeagueCardProps) {
  return (
    <Pressable
      onPress={() => {
        onPress?.();
      }}
    >
      <HStack
        flex={1}
        justifyContent="space-between"
        bg={type === "create" ? "rs.primary_purple" : "rs.grey"}
        alignItems="center"
        p="4"
        borderRadius="xl"
      >
        <HStack space={4} alignItems="center" justifyContent="center">
          <Circle
            size={9}
            bg={type === "create" ? "rs.white" : "rs.primary_purple"}
          >
            <ClubCradIcon
              color={type === "create" ? "rs.primary_purple" : "rs.white"}
            />
          </Circle>
          <VStack>
            <Text
              fontSize={20}
              color={type === "create" ? "rs.white" : "rs.primary_purple"}
              fontWeight={700}
              lineHeight={28}
            >
              {title || "N/A"}
            </Text>

            <Text color={type === "create" ? "rs.white" : "rs.primary_purple"}>
              {description || "N/A"}
            </Text>
          </VStack>
        </HStack>
        <Pressable
          _pressed={{ opacity: 0.5 }}
          onPress={() => {
            onPress?.();
          }}
        >
          <RightArrowIcon
            size="sm"
            color={type === "create" ? "white" : "black"}
          />
        </Pressable>
      </HStack>
    </Pressable>
  );
}
