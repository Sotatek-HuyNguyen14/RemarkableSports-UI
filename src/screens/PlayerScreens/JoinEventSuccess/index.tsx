import React from "react";
import {
  Heading,
  HStack,
  VStack,
  Text,
  Center,
  Box,
  Button,
} from "native-base";
import { NativeStackScreenProps } from "@react-navigation/native-stack";
import { MainStackNavigatorParamList } from "../../../routers/Types";
import { getTranslation } from "../../../utils/translation";
import HeaderLayout from "../../../components/Layout/HeaderLayout";
import SuccessMessage from "../../../components/Feedback/SuccessMessage";
import CheckIcon from "../../../components/Icons/CheckIcon";

const t = getTranslation("screen.PlayerScreens.JoinEventSuccess");

export default function JoinEventSuccess({
  navigation,
  route,
}: NativeStackScreenProps<
  MainStackNavigatorParamList,
  "PlayerJoinEventSuccess"
>) {
  const { destination, nestedDestination, eventId } = route.params;

  return (
    <HeaderLayout
      KeyboardAwareScrollViewProps={{
        bounces: false,
      }}
      headerProps={{
        hasBackButton: true,
        headerLabelStyle: { fontSize: 16 },
        containerStyle: {
          alignItems: "center",
          marginLeft: 0,
          marginRight: 16,
        },
      }}
      containerProps={{ marginHorizontal: 16 }}
      isSticky
    >
      <VStack space={2} alignItems="center" flex={1}>
        <CheckIcon mt="auto" />
        <Heading textAlign="center" fontSize="3xl">
          {t("Join successful!")}
        </Heading>
        <Text fontSize="md" textAlign="center">
          {t(
            "Please upload the payment evidence once your application is approved"
          )}
        </Text>
      </VStack>
      <VStack space={4} flex={1} justifyContent="flex-end">
        <Button
          mx="defaultLayoutSpacing"
          onPress={() => {
            if (nestedDestination)
              navigation.reset({
                index: 0,
                routes: [
                  {
                    name: destination,
                    params: { screen: nestedDestination },
                  },
                ],
              });
            else
              navigation.reset({
                index: 0,
                routes: [{ name: destination }],
              });
          }}
        >
          {t("Join another event")}
        </Button>
        <Button
          mx="defaultLayoutSpacing"
          variant="outline"
          onPress={() => {
            // navigation.navigate("PlayerEventDetails", { eventId });
            if (nestedDestination)
              navigation.reset({
                index: 0,
                routes: [
                  {
                    name: destination,
                    params: { screen: nestedDestination },
                  },
                  {
                    name: "PlayerEventDetails",
                    params: { eventId },
                  },
                ],
              });
            else
              navigation.reset({
                index: 0,
                routes: [{ name: destination }],
              });
          }}
        >
          {t("view join event")}
        </Button>
      </VStack>
    </HeaderLayout>
  );
}
