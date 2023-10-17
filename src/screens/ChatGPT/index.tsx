import React from "react";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";

import {
  Box,
  Button,
  Center,
  Heading,
  HStack,
  Pressable,
  Text,
  VStack,
} from "native-base";
import { RouteProp } from "@react-navigation/native";
import { MainStackNavigatorParamList } from "../../routers/Types";
import { getTranslation } from "../../utils/translation";

import CheckIcon from "../../components/Icons/CheckIcon";
import { useAuth } from "../../hooks/UseAuth";
import { UserType } from "../../models/User";
import HeaderLayout from "../../components/Layout/HeaderLayout";
import ReminderIcon from "../../components/Icons/ReminderIcon";
import ExclaimationIcon from "../../components/Icons/ExclaimationIcon";
import { CHAT_GPT_TOPICS_OPTIONS } from "../../models/responses/ChatGPT";

export type ChatGPTPropsNavigationProp = NativeStackNavigationProp<
  MainStackNavigatorParamList,
  "ChatGPT"
>;

type ChatGPTPropsBaseProps = RouteProp<MainStackNavigatorParamList, "ChatGPT">;

export interface ChatGPTProps extends ChatGPTPropsBaseProps {
  route: ChatGPTPropsBaseProps;
  navigation: ChatGPTPropsNavigationProp;
}
const t = getTranslation([
  "screen.ChatGPT",
  "constant.eventType",
  "constant.ChatGPT",
  "constant.button",
  "formInput",
  "toastMessage",
]);

export default function ChatGPT({ navigation, route }: ChatGPTProps) {
  const options = CHAT_GPT_TOPICS_OPTIONS;
  const chatOptions = () => {
    return (
      <VStack width="100%" space="3" flex="1">
        {options.map((option) => {
          return (
            <Pressable
              key={`${option.value}_chat_gpt_topic`}
              justifyContent="center"
              alignItems="center"
              w="100%"
              borderRadius="2xl"
              borderWidth="1"
              borderColor="rs.primary_purple"
              p="4"
              bg="rs.white"
              onPress={() => {
                navigation.navigate("ChatGPTWithSelectedTopic", {
                  topic: option.value,
                });
              }}
            >
              <Text fontSize="lg" fontWeight="bold" color="rs.primary_purple">
                {t(option.label)}
              </Text>
            </Pressable>
          );
        })}
      </VStack>
    );
  };

  const chatBanner = () => {
    return (
      <HStack
        justifyContent="flex-start"
        alignItems="flex-start"
        bg="#66CEE11A"
        p="4"
        space="3"
      >
        <ExclaimationIcon
          props={{
            customFill: "#66CEE1",
            size: "3xl",
            alignSelf: "flex-start",
          }}
        />
        <VStack space="1" flex="1">
          <Heading fontSize="lg">{t("Select a topic")}</Heading>
          <Text flexWrap="wrap" fontSize="md">
            {t(
              "ChatPingpong covers different topic related to table tennis, select one of them and explore with ChatPingPong"
            )}
          </Text>
        </VStack>
      </HStack>
    );
  };

  return (
    <HeaderLayout
      headerProps={{
        title: t("ChatPingPong"),
      }}
    >
      <VStack flex="1" mt="3" justifyContent="flex-start">
        {chatBanner()}
        <VStack mt="3" flex="1" space="4" mx="defaultLayoutSpacing">
          {chatOptions()}
        </VStack>
      </VStack>
    </HeaderLayout>
  );
}
