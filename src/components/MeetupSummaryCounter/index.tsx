import React from "react";
import {
  Center,
  Heading,
  HStack,
  Text,
  VStack,
  StyledProps,
} from "native-base";
import { getTranslation } from "../../utils/translation";

export interface MeetupSummaryCounterProps {
  pending: number;
  onGoing: number;
  past: number;
  noShow: number;
  boxStyleProps?: StyledProps;
  bottomTextFontSize?: number | string;
  topTextFontSize?: number | string;
}

const t = getTranslation("component.MeetupSummaryCounter");

export default function MeetupSummaryCounter({
  pending,
  onGoing,
  past,
  noShow,
  boxStyleProps,
  bottomTextFontSize = 14,
  topTextFontSize = 24,
}: MeetupSummaryCounterProps) {
  return (
    <HStack justifyContent="center" alignItems="center" {...boxStyleProps}>
      <VStack flex={1}>
        <Center>
          <Heading mb="2" fontSize={topTextFontSize}>
            {pending}
          </Heading>
          <Text fontSize={bottomTextFontSize}>{t("Pending")}</Text>
        </Center>
      </VStack>
      <VStack flex={1}>
        <Center>
          <Heading mb="2" fontSize={topTextFontSize}>
            {onGoing}
          </Heading>
          <Text fontSize={bottomTextFontSize}>{t("On-going")}</Text>
        </Center>
      </VStack>
      <VStack flex={1}>
        <Center>
          <Heading mb="2" fontSize={topTextFontSize}>
            {past}
          </Heading>
          <Text fontSize={bottomTextFontSize}>{t("Past")}</Text>
        </Center>
      </VStack>
      <VStack flex={1}>
        <Center>
          <Heading mb="2" fontSize={topTextFontSize}>
            {noShow}
          </Heading>
          <Text fontSize={bottomTextFontSize}>{t("No show")}</Text>
        </Center>
      </VStack>
    </HStack>
  );
}
