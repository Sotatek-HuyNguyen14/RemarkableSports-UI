import React from "react";
import { Badge, Box, HStack, useTheme } from "native-base";
import { ActivityType } from "../../models/Request";

interface HeaderBadgeProps {
  type:
    | Omit<ActivityType, ActivityType.Venue | ActivityType.O3Coach>
    | undefined
    | null;
  badgeText?: string;
  rightComponent?: React.ReactNode;
  leftComponent?: React.ReactNode;
}

export default function BadgeHeader({
  type,
  badgeText,
  rightComponent,
  leftComponent,
}: HeaderBadgeProps) {
  const { colors } = useTheme();

  let color = colors.rs.primary_purple;
  switch (type) {
    case ActivityType.Course:
      color = colors.rs_secondary.orange;
      break;
    case ActivityType.Fixture:
      color = colors.rs_secondary.purple;
      break;
    case ActivityType.Venue:
      color = colors.rs_secondary.green;
      break;
    case ActivityType.Event:
      color = colors.rs_secondary.purple;
      break;
    case ActivityType.Division:
      color = colors.rs.primary_purple;
      break;
    default:
      break;
  }

  return (
    <HStack justifyContent="space-between">
      {leftComponent}
      {type && badgeText ? <Badge bgColor={color}>{badgeText}</Badge> : <Box />}
      {rightComponent}
    </HStack>
  );
}
