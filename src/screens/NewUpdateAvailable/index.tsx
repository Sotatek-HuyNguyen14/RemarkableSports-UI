/* eslint-disable no-lonely-if */
/* eslint-disable prefer-destructuring */

import { VStack, Text, Button, Image, Heading } from "native-base";
import React from "react";
import { Platform, Linking } from "react-native";
import { androidId } from "expo-application";
import HeaderLayout from "../../components/Layout/HeaderLayout";
import { getTranslation } from "../../utils/translation";
import ImageDirectory from "../../assets";

const t = getTranslation(["screen.NewUpdateAvailable", "constant.buton"]);

const APP_STORE_URL =
  "https://itunes.apple.com/app/apple-store/id1633573074?mt=8";
const GOOGLE_PLAY_STORE_URL = `https://play.google.com/store/apps/details?id=com.remarkablesports`;

export default function NewUpdateAvailable() {
  const openStore = () => {
    const url = Platform.OS === "ios" ? APP_STORE_URL : GOOGLE_PLAY_STORE_URL;
    Linking.openURL(url);
  };

  return (
    <HeaderLayout>
      <VStack
        space="3"
        flex="1"
        justifyContent="center"
        alignItems="center"
        mx="defaultLayoutSpacing"
      >
        <Image
          style={{ marginLeft: -30 }}
          source={ImageDirectory.APP_SHOULD_UPDATE}
        />
        <Heading textAlign="center">{t("DISCOVER NEW VERSION")}</Heading>
        <Text
          fontWeight="medium"
          textAlign="center"
          style={{ paddingHorizontal: 39 }}
        >
          {t("We added new features")}
        </Text>
      </VStack>
      <Button
        onPress={() => {
          openStore();
        }}
        mx="defaultLayoutSpacing"
        mt="auto"
      >
        {t("Update")}
      </Button>
    </HeaderLayout>
  );
}
