import { Text, HStack, Badge, Box, VStack } from "native-base";
import React from "react";
import { Pressable, TouchableOpacity } from "react-native";
import { NativeStackScreenProps } from "@react-navigation/native-stack";
import HeaderLayout from "../../../components/Layout/HeaderLayout";
import SettingIcon from "../../../components/Icons/SettingIcon";
import { getTranslation } from "../../../utils/translation";
import { MainStackNavigatorParamList } from "../../../routers/Types";

export type OrganizerProfileProps = NativeStackScreenProps<
  MainStackNavigatorParamList,
  "OrganizerNavigator"
>;

const t = getTranslation("screen.ProfileScreen.ProfileScreen");

function OrganizerProfile({ navigation }: OrganizerProfileProps) {
  return (
    <HeaderLayout
      KeyboardAwareScrollViewProps={{
        bounces: false,
      }}
      headerProps={{
        hasBackButton: false,
        title: t("Profile"),
        rightComponent: (
          <HStack space="4" alignItems="center">
            <TouchableOpacity
              onPress={() => {
                navigation.navigate("SettingsScreen");
              }}
            >
              <SettingIcon color="white" alignSelf="center" />
            </TouchableOpacity>
          </HStack>
        ),
      }}
      isSticky
    >
      <VStack
        mx="defaultLayoutSpacing"
        justifyContent="center"
        alignItems="center"
      >
        <Text>{t("Will be updated later")}</Text>
      </VStack>
    </HeaderLayout>
  );
}

export default OrganizerProfile;
