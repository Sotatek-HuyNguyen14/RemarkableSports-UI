import React from "react";
import {
  Center,
  Circle,
  Heading,
  HStack,
  Pressable,
  Text,
  VStack,
} from "native-base";
import MagnifyingGlassIcon from "../Icons/MagnifyingGlassIcon";
import Card from "./Card";
import RightArrowIcon from "../Icons/RightArrowIcon";
import { getTranslation } from "../../utils/translation";

const t = getTranslation("component.Card.FindCoachCard");

export default function FindCoachCard({ onPress }: { onPress: () => void }) {
  return (
    <Pressable onPress={onPress}>
      <Card
        onPress={onPress}
        containerProps={{ p: "4" }}
        body={
          <HStack space="3">
            <Center>
              <Circle bgColor="rs.GPP_lightBlue">
                <MagnifyingGlassIcon size="xl" m="2" />
              </Circle>
            </Center>
            <VStack flex="1" space="3">
              <Heading>{t("Find Coach")}</Heading>
              <Text>
                {t(
                  "Enter your preference to find the most suitable coach to you !"
                )}
              </Text>
            </VStack>
            <RightArrowIcon alignSelf="center" />
          </HStack>
        }
      />
    </Pressable>
  );
}
