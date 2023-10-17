import React, { PropsWithChildren } from "react";
import {
  Button,
  VStack,
  Text,
  Center,
  Heading,
  ScrollView,
  Box,
} from "native-base";
import { useNavigation } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { InterfaceVStackProps } from "native-base/lib/typescript/components/primitives/Stack/VStack";

import {
  ClubBottomTabNavigatorParamList,
  CoachBottomTabNavigatorParamList,
  MainStackNavigatorParamList,
  PlayerBottomTabNavigatorParamList,
} from "../../routers/Types";
import CheckIcon from "../Icons/CheckIcon";

interface SuccessMessageProps extends Omit<InterfaceVStackProps, "children"> {
  headerLabel: string;
  bodyLabel?: string;
  buttonLabel: string;
  destination: keyof MainStackNavigatorParamList;
  nestedDestination?:
    | keyof PlayerBottomTabNavigatorParamList
    | keyof ClubBottomTabNavigatorParamList
    | keyof CoachBottomTabNavigatorParamList;
}

export default function SuccessMessage({
  headerLabel,
  bodyLabel,
  buttonLabel,
  destination,
  nestedDestination,
  children,
  ...containerProps
}: PropsWithChildren<SuccessMessageProps>) {
  const navigation =
    useNavigation<NativeStackNavigationProp<MainStackNavigatorParamList>>();
  return (
    <Box flex={1} safeArea py="2.5">
      <ScrollView>
        <VStack mb="10" justifyContent="center" {...containerProps}>
          <Center h="200">
            <CheckIcon mt={children ? "0" : "auto"} mb="2" />
            <Heading textAlign="center" fontSize="3xl">
              {headerLabel}
            </Heading>
            <Text fontSize="md" textAlign="center">
              {bodyLabel}
            </Text>
          </Center>
          {children}
        </VStack>
      </ScrollView>
      <Box>
        <Button
          mx="defaultLayoutSpacing"
          onPress={() => {
            if (nestedDestination)
              navigation.reset({
                index: 0,
                routes: [
                  { name: destination, params: { screen: nestedDestination } },
                ],
              });
            else
              navigation.reset({
                index: 0,
                routes: [{ name: destination }],
              });
          }}
        >
          {buttonLabel}
        </Button>
      </Box>
    </Box>
  );
}
