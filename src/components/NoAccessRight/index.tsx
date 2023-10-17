import { Text, VStack } from "native-base";
import React from "react";
import { getTranslation } from "../../utils/translation";
import RoundedRedCrossIcon from "../Icons/RoundedRedCrossIcon";

const t = getTranslation("component.NoAccessRight");

export default function NoAccessRight({
  title,
  description,
}: {
  title?: string;
  description?: string;
}) {
  return (
    <VStack flex="1" space="2" justifyContent="center" alignItems="center">
      <RoundedRedCrossIcon />
      <Text textAlign="center" fontWeight="bold" fontSize="md">
        {title || t("No Access Right")}
      </Text>
      <Text textAlign="center">
        {description || t("You do not have the right to access this function")}
      </Text>
    </VStack>
  );
}
