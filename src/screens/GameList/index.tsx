import { Text, HStack, Badge, Box, VStack, Heading, Center } from "native-base";
import React, { useRef, useState } from "react";
import { useForm } from "react-hook-form";
import { NativeStackScreenProps } from "@react-navigation/native-stack";
import HeaderLayout from "../../components/Layout/HeaderLayout";
import { getTranslation } from "../../utils/translation";
import { PlayerBottomTabNavigatorParamList } from "../../routers/Types";
import { useAuth } from "../../hooks/UseAuth";
import MagnifyingGlassIcon from "../../components/Icons/MagnifyingGlassIcon";
import FormInput from "../../components/FormInput/FormInput";

export type ProfileScreenProps = NativeStackScreenProps<
  PlayerBottomTabNavigatorParamList,
  "GameList"
>;

const t = getTranslation("screen.GameList");

function GameList({ navigation }: ProfileScreenProps) {
  return (
    <HeaderLayout
      KeyboardAwareScrollViewProps={{
        bounces: false,
      }}
      headerProps={{
        hasBackButton: false,
        title: t("Game"),
      }}
      isSticky
    >
      <Center flex={1}>
        <Heading>{t("Game Screen")}</Heading>
        <Heading>{t("Coming soon!")}</Heading>
      </Center>
    </HeaderLayout>
  );
}
export default GameList;
