import React from "react";
import { HStack, Text, Pressable } from "native-base";
import FilterIconV2 from "../Icons/FilterIconV2";
import { getTranslation } from "../../utils/translation";

const t = getTranslation(["constant.button", "formInput"]);

export interface FilterComponentProps {
  onPress?: () => void;
}

export default function FilterComponent({ onPress }: FilterComponentProps) {
  return (
    <HStack alignItems="center" space="3">
      <Pressable flex="1" onPress={onPress} borderRadius="2xl" bg="#F6F6F6">
        <HStack
          alignItems="center"
          justifyContent="space-between"
          px="4"
          py="4"
        >
          <Text fontSize="md">{t("Filter")}</Text>
          <FilterIconV2 />
        </HStack>
      </Pressable>
    </HStack>
  );
}
