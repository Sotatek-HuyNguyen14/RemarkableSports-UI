import { HStack, Pressable, Text, VStack } from "native-base";
import React from "react";
import { icon } from "../../../../app.config";

export interface FunctionalButtonModel {
  title: string;
  description: string;
  icon: () => JSX.Element;
  onPress: () => void;
}

interface FunctionalButtonsProp {
  buttons: FunctionalButtonModel[];
}

export default function FunctionalButtons({ buttons }: FunctionalButtonsProp) {
  const buttonView = (button: FunctionalButtonModel) => {
    return (
      <Pressable
        onPress={() => {
          button.onPress();
        }}
        key={`${button.description}_${button.title}`}
        m="2"
        bg="#F6F6F6"
        borderRadius="xl"
        w="45%"
        p="4"
      >
        <VStack space="2">
          <HStack
            justifyContent="center"
            alignItems="center"
            w="10"
            h="10"
            borderRadius="full"
            bg="rs.primary_purple"
          >
            {button.icon()}
          </HStack>
          <Text fontWeight="bold" fontSize="md">
            {button.title}
          </Text>
          <Text>{button.description}</Text>
        </VStack>
      </Pressable>
    );
  };
  return (
    <HStack
      width="100%"
      flexWrap="wrap"
      justifyContent="center"
      alignItems="center"
    >
      {buttons.map((button) => {
        return buttonView(button);
      })}
    </HStack>
  );
}
