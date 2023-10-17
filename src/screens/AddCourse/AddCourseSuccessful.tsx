import React from "react";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { Box, Button, Center, Heading, Text, VStack } from "native-base";

import { RouteProp } from "@react-navigation/native";
import { MainStackNavigatorParamList } from "../../routers/Types";
import { getTranslation } from "../../utils/translation";

import CheckIcon from "../../components/Icons/CheckIcon";
import { useAuth } from "../../hooks/UseAuth";
import { UserType } from "../../models/User";

export type AddCourseSuccessfulPropsNavigationProp = NativeStackNavigationProp<
  MainStackNavigatorParamList,
  "AddCourseSuccessful"
>;

type AddCourseSuccessfulPropsBaseProps = RouteProp<
  MainStackNavigatorParamList,
  "AddCourseSuccessful"
>;

export interface AddCourseSuccessfulProps
  extends AddCourseSuccessfulPropsBaseProps {
  route: AddCourseSuccessfulPropsBaseProps;
  navigation: AddCourseSuccessfulPropsNavigationProp;
}
const t = getTranslation(["screen.ClubScreens.Course", "constant.button"]);

export default function AddCourseSuccessful({
  navigation,
  route,
}: AddCourseSuccessfulProps) {
  const { user } = useAuth();
  const { courseId } = route.params;
  const nextDestination =
    user?.userType === UserType.ClubStaff ? "ClubNavigator" : "CoachNavigator";
  const nextScreen =
    user?.userType === UserType.ClubStaff
      ? "ClubCourseList"
      : "CoachCourseList";

  return (
    <Box safeArea flex={1} p="defaultLayoutSpacing">
      <Heading fontSize="16" textAlign="center">
        {t("Course creating")}
      </Heading>
      <VStack mt="20" flex={1} justifyContent="center" space="4">
        <Center>
          <CheckIcon mt="auto" mb="1" />
          <Heading mb="1" textAlign="center" fontSize="3xl">
            {t("Create successful")}
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
            navigation.navigate("AddCourse", {
              isReset: true,
            });
          }}
        >
          {t("Create another course")}
        </Button>
        <Button
          variant="outline"
          onPress={() => {
            navigation.reset({
              index: 0,
              routes: [
                {
                  name: nextDestination,
                  params: {
                    screen: nextScreen,
                  },
                },
              ],
            });
          }}
        >
          {t("Manage create course")}
        </Button>
      </VStack>
    </Box>
  );
}
