import React from "react";
import { Center, Text } from "native-base";
import { getTranslation } from "../../utils/translation";

const t = getTranslation("component.ErrorMessage");

export default function ErrorMessage() {
  return (
    <Center flex="1">
      <Text>{t("Error occured")}</Text>
    </Center>
  );
}
