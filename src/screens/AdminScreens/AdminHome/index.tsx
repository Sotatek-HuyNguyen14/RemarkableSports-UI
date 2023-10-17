import { NativeStackScreenProps } from "@react-navigation/native-stack";
import axios from "axios";
import useSWR from "swr";
import { VStack, Text, Pressable, Box, Button, HStack } from "native-base";
import React from "react";
import HeaderLayout from "../../../components/Layout/HeaderLayout";
import { useAuth } from "../../../hooks/UseAuth";
import { OnboardingResponse } from "../../../models/responses/Onboarding";
import { MainStackNavigatorParamList } from "../../../routers/Types";
import { formatWorkflowUrl } from "../../../services/ServiceUtil";
import { getTranslation } from "../../../utils/translation";
import CoachShortProfile from "../../../components/CoachShortProfile";
import Loading from "../../../components/Loading";
import ErrorMessage from "../../../components/ErrorMessage";
import LogoutIcon from "../../../components/Icons/LogoutIcon";
import useNotification from "../../../hooks/UseNotification";

const t = getTranslation("screen.AdminScreens.AdminHome");

export default function AdminHome({
  navigation,
}: NativeStackScreenProps<MainStackNavigatorParamList, "AdminNavigator">) {
  const { logout } = useAuth();

  const { data, error, mutate, isValidating } = useSWR<OnboardingResponse>(
    formatWorkflowUrl("/approval"),
    (path) => axios.get(path).then((res) => res.data),
    {
      errorRetryCount: 0,
    }
  );
  const { cleanUpNotifications } = useNotification();

  return (
    <HeaderLayout
      headerProps={{
        title: t("Remarkable Sports"),
        headerLabelContainerStyle: {
          alignItems: "flex-start",
        },
        rightComponent: (
          <HStack space="4" justifyContent="center" alignItems="center">
            <Pressable
              isDisabled={isValidating}
              onPress={async () => {
                await mutate();
              }}
            >
              <Text>{t("refresh")}</Text>
            </Pressable>
            <VStack w="0.5" h="8" bgColor="rs.black" />
            <Pressable
              onPress={async () => {
                try {
                  await cleanUpNotifications();
                } catch (cleanError: any) {
                  console.log(cleanError);
                }
                await logout();
                navigation.reset({ index: 0, routes: [{ name: "LogIn" }] });
              }}
            >
              <HStack justifyContent="center" alignItems="center">
                <LogoutIcon />
                <Text ml="2">{t("Logout")}</Text>
              </HStack>
            </Pressable>
          </HStack>
        ),
      }}
      isSticky
    >
      {isValidating && <Loading />}
      {!isValidating && error && <ErrorMessage />}
      {!isValidating && !error && Array.isArray(data) && (
        <VStack mx="defaultLayoutSpacing" space="4">
          {data.length > 0 ? (
            data.map((value) => {
              return (
                <Box
                  bgColor="blueGray.100"
                  p="4"
                  shadow="6"
                  borderRadius="10"
                  mb="4"
                  key={value.id}
                >
                  <Pressable
                    key={value.id}
                    onPress={() => {
                      navigation.navigate("ReviewCoachOnboardingInfo", {
                        onboardResponse: value,
                        isAdminView: true,
                      });
                    }}
                  >
                    <CoachShortProfile key={value.id} coach={value.data} />
                  </Pressable>
                </Box>
              );
            })
          ) : (
            <Text mt="10" fontSize="md" alignSelf="center">
              {t("No pending onboarding requests")}
            </Text>
          )}
        </VStack>
      )}
    </HeaderLayout>
  );
}
