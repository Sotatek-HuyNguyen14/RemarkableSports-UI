import React, { useCallback, useEffect } from "react";
import { Dimensions } from "react-native";
import { ScaledSheet } from "react-native-size-matters";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { Center, Image } from "native-base";
import ImageDirectory from "../../assets/index";
import { MainStackNavigatorParamList } from "../../routers/Types";
import { useAuth } from "../../hooks/UseAuth";
import { Role } from "../../models/User";
import { getOnboardingData } from "../../services/WorkflowService";
import {
  OnboardingStatus,
  OnboardingStepId,
} from "../../models/responses/Onboarding";

export type SplashScreenNavigationProp = NativeStackNavigationProp<
  MainStackNavigatorParamList,
  "Splash"
>;

export type SplashScreenProps = {
  navigation: SplashScreenNavigationProp;
};

function SplashScreen({ navigation }: SplashScreenProps) {
  const { initialized, init, loggedIn, user } = useAuth();

  // only run once
  useEffect(() => {
    init();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const initPage = useCallback(
    (name: keyof MainStackNavigatorParamList, params?: object) => {
      navigation.reset({
        index: 0,
        routes: [{ name, params }],
      });
    },
    [navigation]
  );

  useEffect(() => {
    if (!initialized) return;

    if (!loggedIn) {
      initPage("LogIn");
    } else if (user) {
      if (user.role.some((r) => r === Role.Admin)) {
        initPage("AdminNavigator");
      } else {
        getOnboardingData().then(({ process, pendingStep }) => {
          if (process.status === OnboardingStatus.Complete) {
            const routeName = `${process.data.userType}Navigator`;
            initPage(routeName as keyof MainStackNavigatorParamList);
          } else if (!pendingStep) {
            initPage("SignUpSuccess");
          } else {
            const { stepId } = pendingStep;
            switch (stepId) {
              case OnboardingStepId.BasicInfo:
                initPage("OnboardingBasicInfo");
                break;
              case OnboardingStepId.UserRole:
                initPage("OnboardingUserType");
                break;
              case OnboardingStepId.PlayerInfo:
                initPage("OnboardingPlayerInfo");
                break;
              case OnboardingStepId.CoachInfo:
                initPage("OnboardingCoachInfo");
                break;
              case OnboardingStepId.ClubInfo:
                initPage("OnboardingClubStaffInfo");
                break;
              default:
            }
          }
        });
      }
    }
  }, [initialized, loggedIn, user, initPage]);

  const { height } = Dimensions.get("window");

  return (
    <Center backgroundColor="white">
      <Center height={height}>
        <Image
          style={styles.image}
          source={ImageDirectory.LOGO_SPLASH}
          alt="splash image"
        />
      </Center>
    </Center>
  );
}

const styles = ScaledSheet.create({
  image: {
    width: Dimensions.get("window").width * 0.25,
    height: Dimensions.get("window").width * 0.25,
  },
});

export default SplashScreen;
