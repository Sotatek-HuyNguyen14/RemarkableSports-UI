import React from "react";
import { Box, Heading, HStack, Image, Text, VStack } from "native-base";
import { getTranslation } from "../utils/translation";
import ImageDirectory from "../assets";

const t = getTranslation("component.ComingSoon");

export default function ComingSoon() {
  return (
    <VStack flex={1} alignItems="center" justifyContent="center">
      <Image source={ImageDirectory.COMING_SOON} />
      <Text fontSize={24} fontWeight={700} mt={-3}>
        {t("Coming Soon")}
      </Text>
      <Text fontSize={16} textAlign="center">
        {t("We’re developing the report feature, stay tuned for updates")}
      </Text>
    </VStack>
  );
}
