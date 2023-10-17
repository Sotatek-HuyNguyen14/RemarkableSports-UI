import { Badge, Pressable } from "native-base";
import React from "react";

export interface FilterBadgeProps {
  label: string;
  isActive: boolean;
  onPress: () => void;
}

export default function FilterBadge({
  label,
  isActive,
  onPress,
}: FilterBadgeProps) {
  return (
    <Pressable onPress={onPress}>
      <Badge
        bgColor={isActive ? "rs.primary_purple" : "rs.white"}
        px="4"
        py="2"
        shadow="9"
        borderRadius="2xl"
        ml="2"
        style={{
          shadowOffset: {
            width: 5,
            height: 5,
          },
          shadowOpacity: 0.1,
          elevation: 3,
        }}
        _text={{
          color: isActive ? "rs.white" : "rs.primary_purple",
          fontWeight: "semibold",
          fontSize: "md",
        }}
      >
        {label}
      </Badge>
    </Pressable>
  );
}
