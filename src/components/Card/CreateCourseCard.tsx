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
import Card from "./Card";
import RightArrowIcon from "../Icons/RightArrowIcon";
import PlusIcon from "../Icons/PlusIcon";

export default function CreateCourseCard({ onPress }: { onPress: () => void }) {
  return (
    <Pressable onPress={onPress}>
      <Card
        onPress={onPress}
        containerProps={{ p: "4" }}
        body={
          <HStack space="3">
            <Center>
              <Circle bgColor="rs_secondary.green">
                <PlusIcon m="4" />
              </Circle>
            </Center>
            <VStack flex="1" space="3">
              <Heading>Create Course</Heading>
              <Text>
                Tap here to create a new event and have fun with other player.
              </Text>
            </VStack>
            <RightArrowIcon alignSelf="center" />
          </HStack>
        }
      />
    </Pressable>
  );
}
