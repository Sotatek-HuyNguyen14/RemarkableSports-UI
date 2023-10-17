import React from "react";
import { Platform } from "react-native";
import { Badge, Box, Circle, Heading, HStack, VStack, Text } from "native-base";
import CoffeeIcon from "../../components/Icons/CoffeeIcon";
import { getTranslation } from "../../utils/translation";
import TipsIcon from "../../components/Icons/TipsIcon";

const t = getTranslation("screen.ContentScreen");

export default function NoRecord({ isAll }: { isAll?: boolean }) {
  return (
    <Box flex={1}>
      {isAll ? (
        <VStack flex={1} space={2} alignItems="center" pt="260">
          <Circle
            mb={2}
            size={12}
            bg="rgba(5, 105, 225, 0.15)"
            alignItems="center"
            justifyContent="center"
          >
            <TipsIcon color="#0569FF" props={{ size: "lg" }} />
          </Circle>
          <Text
            fontSize={16}
            lineHeight={24}
            textAlign="center"
            fontWeight={700}
          >
            {t("No content yet")}
          </Text>
          <Text fontSize={16} lineHeight={24} textAlign="center">
            {t("Please wait for a moment")}
          </Text>
        </VStack>
      ) : (
        <HStack
          space={3}
          alignItems="center"
          bg="rgba(226, 239, 241, 0.8)"
          borderRadius="lg"
          p="4"
        >
          <Circle
            size={10}
            bg="rgba(196, 229, 236, 1)"
            alignItems="center"
            justifyContent="center"
          >
            <TipsIcon color="#66CEE1" props={{ size: "lg" }} />
          </Circle>
          <Heading>{t("No record now")}</Heading>
        </HStack>
      )}
    </Box>
  );
}
