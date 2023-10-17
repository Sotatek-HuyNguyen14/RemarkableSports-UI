import React from "react";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";

import { Box, Button, Center, Heading, Text, VStack } from "native-base";
import { RouteProp } from "@react-navigation/native";
import { MainStackNavigatorParamList } from "../../routers/Types";
import { getTranslation } from "../../utils/translation";

import CheckIcon from "../../components/Icons/CheckIcon";
import { useAuth } from "../../hooks/UseAuth";
import { UserType } from "../../models/User";

export type AddEventSuccessfulPropsNavigationProp = NativeStackNavigationProp<
  MainStackNavigatorParamList,
  "AddEventSuccessful"
>;

type AddEventSuccessfulPropsBaseProps = RouteProp<
  MainStackNavigatorParamList,
  "AddEventSuccessful"
>;

export interface AddEventSuccessfulProps
  extends AddEventSuccessfulPropsBaseProps {
  route: AddEventSuccessfulPropsBaseProps;
  navigation: AddEventSuccessfulPropsNavigationProp;
}
const t = getTranslation([
  "screen.Event",
  "constant.eventType",
  "constant.button",
  "formInput",
  "toastMessage",
]);

export default function AddEventSuccessful({
  navigation,
  route,
}: AddEventSuccessfulProps) {
  const { user } = useAuth();
  const { eventId, isUpdating } = route.params;
  const nextDestination =
    user?.userType === UserType.Player
      ? "PlayerNavigator"
      : user?.userType === UserType.ClubStaff
      ? "ClubNavigator"
      : "CoachNavigator";
  return (
    <Box safeArea flex={1} p="defaultLayoutSpacing">
      <Heading fontSize="16" textAlign="center">
        {!isUpdating ? t("CreateEvent") : t("UpdateEvent")}
      </Heading>
      <VStack mt="20" flex={1} justifyContent="center" space="4">
        <Center>
          <CheckIcon mt="auto" mb="1" />
          <Heading mb="1" textAlign="center" fontSize="3xl">
            {!isUpdating
              ? `${t("Create")}${t("Successful")}`
              : `${t("Update")}${t("Successful")}`}
          </Heading>
          <Text fontSize="md" textAlign="center">
            {t(
              "You can check the created event in Manage tab you can edit delete the event afterward"
            )}
          </Text>
        </Center>
      </VStack>
      <VStack space="4" mb="5">
        <Button
          onPress={() => {
            navigation.reset({
              index: 0,
              routes: [
                {
                  name: nextDestination,
                },
              ],
            });
          }}
        >
          {t("Done")}
        </Button>
        <Button
          variant="outline"
          onPress={() => {
            if (eventId) {
              // navigation.navigate("ManageEvent", { eventId });
              navigation.reset({
                index: 0,
                routes: [
                  {
                    name: nextDestination,
                  },
                  {
                    name: "ManageEvent",
                    params: { eventId },
                  },
                ],
              });
            } else {
              navigation.reset({
                index: 0,
                routes: [
                  {
                    name: nextDestination,
                  },
                ],
              });
            }
          }}
        >
          {t("Manage created event")}
        </Button>
      </VStack>
    </Box>
  );
}
