import React from "react";
import { Heading, HStack, Text, VStack } from "native-base";
import { Pressable } from "react-native";
import Card from "./Card";
import BadgeHeader from "./BadgeHeader";
import { ActivityType } from "../../models/Request";
import { getTranslation } from "../../utils/translation";

export interface DivisionCardProps {
  divisionName: string;
  tier: string;
  onPress?: () => void;
}

const t = getTranslation(["component.Card.DivisionCard"]);

export default function DivisionCard({
  divisionName,
  tier,
  onPress,
}: DivisionCardProps) {
  return (
    <Pressable onPress={onPress}>
      <Card
        onPress={onPress}
        body={
          <HStack flexWrap="wrap" space={4} p={4}>
            <BadgeHeader
              type={ActivityType.Division}
              badgeText={`${t("Tier")} ${tier}`}
            />
            <Heading>{divisionName}</Heading>
          </HStack>
        }
      />
    </Pressable>
  );
}
