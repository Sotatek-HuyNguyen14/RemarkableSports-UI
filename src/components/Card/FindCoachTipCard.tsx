import React from "react";
import {
  Box,
  Center,
  Circle,
  Heading,
  HStack,
  IBoxProps,
  Text,
} from "native-base";
import MagnifyingGlassIcon from "../Icons/MagnifyingGlassIcon";
import { getTranslation } from "../../utils/translation";

const t = getTranslation("component.Card.FindCoachTipCard");

export default function FindCoachTipCard({
  containerProps,
}: {
  containerProps?: IBoxProps;
}) {
  return (
    <Box {...containerProps}>
      <HStack space="3" alignItems="center">
        <Center>
          <Circle bgColor="rs.GPP_lightBlue">
            <MagnifyingGlassIcon size="xl" m="2" />
          </Circle>
        </Center>
        <Heading>{t("Finding Coach")}</Heading>
      </HStack>
      <Text mt="4" fontSize={16} color="rs_secondary.grey">
        {t("Contacting the coach Please wait for a while")}
      </Text>
    </Box>
  );
}
