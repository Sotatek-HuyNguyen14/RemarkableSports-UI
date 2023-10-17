import React, { ReactNode, useState } from "react";
import {
  Button,
  Heading,
  HStack,
  Pressable,
  Text,
  VStack,
  useTheme,
} from "native-base";
import { NativeStackScreenProps } from "@react-navigation/native-stack";

import HeaderLayout from "../../../components/Layout/HeaderLayout";
import { getTranslation } from "../../../utils/translation";
import PlayerIcon from "../../../components/Icons/PlayerIcon";
import CoachIcon from "../../../components/Icons/CoachIcon";
import ClubStaffIcon from "../../../components/Icons/ClubStaffIcon";
import { UserType } from "../../../models/User";
import { MainStackNavigatorParamList } from "../../../routers/Types";
import { processWorkflowStep } from "../../../services/WorkflowService";
import { OnboardingStepId } from "../../../models/responses/Onboarding";
import { showApiToastError } from "../../../components/ApiToastError";

export type UserTypeScreenProps = NativeStackScreenProps<
  MainStackNavigatorParamList,
  "OnboardingUserType"
>;

function CheckType(
  type: UserType | undefined,
  playerValue: ReactNode,
  coachValue: ReactNode,
  clubStaffValue: ReactNode
) {
  switch (type) {
    case UserType.Player:
      return playerValue;
    case UserType.Coach:
      return coachValue;
    case UserType.ClubStaff:
      return clubStaffValue;
    default:
      return null;
  }
}

const t = getTranslation(["screen.SignUp.UserType", "constant.button"]);

export default function UserTypes({ navigation }: UserTypeScreenProps) {
  const { space } = useTheme();
  const [type, setType] = useState<UserType>();
  const renderOptions = (a: UserType) => (
    <Pressable onPress={() => setType(a)}>
      <HStack
        p="6"
        space="5"
        alignItems="center"
        borderWidth="2"
        borderRadius="2xl"
        bgColor="rs.white"
        borderColor={a === type ? "#66CEE1" : "rs.grey"}
        opacity={a === type ? 1 : 0.5}
      >
        {CheckType(a, <PlayerIcon />, <CoachIcon />, <ClubStaffIcon />)}
        <Text fontSize="xl" fontWeight="bold">
          {CheckType(a, t("I'm player"), t("I'm coach"), t("I'm club stuff"))}
        </Text>
      </HStack>
    </Pressable>
  );

  return (
    <HeaderLayout
      headerProps={{
        title: t("Getting Started"),
      }}
      containerProps={{
        marginHorizontal: space.defaultLayoutSpacing,
      }}
    >
      <Heading my="8" size="lg">
        {t("What is your role?")}
      </Heading>
      <VStack space="6">
        {renderOptions(UserType.Player)}
        {renderOptions(UserType.Coach)}
        {renderOptions(UserType.ClubStaff)}
        <Button
          isDisabled={!type}
          onPress={async () => {
            try {
              await processWorkflowStep(OnboardingStepId.UserRole, {
                userRole: type,
              });
              navigation.reset({
                index: 0,
                routes: [
                  {
                    name: CheckType(
                      type,
                      "OnboardingPlayerInfo",
                      "OnboardingCoachInfo",
                      "SignUpSuccess"
                    ) as keyof MainStackNavigatorParamList,
                  },
                ],
              });
            } catch (e) {
              showApiToastError(e);
            }
          }}
        >
          {t("Next")}
        </Button>
      </VStack>
    </HeaderLayout>
  );
}
