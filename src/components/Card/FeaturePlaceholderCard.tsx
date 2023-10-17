import { Heading, Pressable, Text } from "native-base";
import React from "react";
import HighlightCard, { HighlightCardProps } from "./HighlightCard";
import { getTranslation } from "../../utils/translation";

const t = getTranslation("component.Card.FeaturePlaceholderCard");

export interface FeaturePlaceholderCardProps
  extends Pick<HighlightCardProps, "containerProps"> {
  onPress?: () => void;
}
export default function FeaturePlaceholderCard({
  onPress,
  ...otherProps
}: FeaturePlaceholderCardProps) {
  return (
    <Pressable onPress={() => onPress?.()}>
      <HighlightCard {...otherProps}>
        <Heading size="xl" color="rs.white">
          {t("Enjoy matching coach anytime")}
        </Heading>
        <Text color="rs.white">
          {t(
            "Encourage user to match coach, and this card will be direct user to find coach"
          )}
        </Text>
      </HighlightCard>
    </Pressable>
  );
}
