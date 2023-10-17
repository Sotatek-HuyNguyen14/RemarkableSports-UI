import React, { useCallback, useEffect, useRef } from "react";
import {
  KeyboardAvoidingView,
  VStack,
  Image,
  Box,
  Button,
  Text,
  ScrollView,
  Heading,
} from "native-base";
import { Animated, Platform, Alert, Linking } from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useForm } from "react-hook-form";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import * as LocalAuthentication from "expo-local-authentication";
import ImageDirectory from "../../assets/index";
import FormInput from "../../components/FormInput/FormInput";
import { SCREEN_HEIGHT, SCREEN_WIDTH } from "../../constants/constants";
import {
  ERROR_INVALID_CREDENTIAL,
  ERROR_NEED_VERIFICATION,
  login,
} from "../../services/AuthServices";
import { useAuth } from "../../hooks/UseAuth";
import { MainStackNavigatorParamList } from "../../routers/Types";
import { Role } from "../../models/User";
import { getOnboardingData } from "../../services/WorkflowService";
import { getTranslation } from "../../utils/translation";
import {
  OnboardingStatus,
  OnboardingStepId,
} from "../../models/responses/Onboarding";
import {
  aesDecrypt,
  aesEncrypt,
  biometricalStorageModel,
  DEVICE_OS,
  saveAccountStorage,
  saveAccountStore,
} from "../../utils/crypto";
import ConfirmationModal from "../../components/ConfirmationModal/ConfirmationModal";
import BiometricIcon from "../../components/Icons/BiometricIcon";
import useNotification from "../../hooks/UseNotification";
import { APP_SCROLL_VIEW_TEST_ID } from "../../../e2e/helpers";

export type LogInScreenNavigationProp = NativeStackNavigationProp<
  MainStackNavigatorParamList,
  "LogIn"
>;

interface LogInScreenProps {
  navigation: LogInScreenNavigationProp;
}
interface storageModel {
  username: string;
  password: string;
  biometricalType?: string;
}
interface FormValues {
  email: string;
  password: string;
  biometricalType?: string;
}
const t = getTranslation(["screen.LogIn", "validation", "constant.button"]);

export default function LogInScreen({
  navigation,
}: LogInScreenProps): JSX.Element {
  const {
    control,
    handleSubmit,
    formState: { isValid, isSubmitting, isDirty },
  } = useForm({
    mode: "onChange",
  });
  const [storageAccount, setStorageAccount] = React.useState<storageModel>();
  const auth = useAuth();
  const [isShowBio, setIsShowBio] = React.useState("");
  const { current: animation } = useRef(new Animated.Value(0));
  const [isOpenAlert, setIsOpenAlert] = React.useState(false);
  const [isLoggingIn, setIsLoggingIn] = React.useState(false);

  const opacity = animation.interpolate({
    inputRange: [-1, 0],
    outputRange: [0, 1],
  });
  const marginTop = animation.interpolate({
    inputRange: [-1, 0],
    outputRange: [-SCREEN_HEIGHT * 0.35, 0],
  });
  const onFocus = () => {
    if (parseInt(JSON.stringify(animation), 10) === -1) return;
    Animated.timing(animation, {
      toValue: -1,
      duration: 500,
      useNativeDriver: false,
    }).start();
  };

  const onBlur = () => {
    if (isDirty || parseInt(JSON.stringify(animation), 10) === -1) return;
    Animated.timing(animation, {
      toValue: 0,
      duration: 500,
      useNativeDriver: false,
    }).start();
  };
  const { updateNotification, cleanUpNotifications } = useNotification();

  const onPressLogin = async (formValues: FormValues) => {
    setIsLoggingIn(true);

    const { email, password, biometricalType } = formValues;
    const { success, data } = await login({ email, password });
    if (success) {
      const { token, refreshToken, expiresIn } = data;
      auth.login(token!, refreshToken!, expiresIn!);
      if (biometricalType) {
        saveAccountStore(email, password, biometricalType);
      } else if (aesEncrypt(email) === storageAccount?.username) {
        saveAccountStore(
          email,
          password,
          storageAccount?.biometricalType || ""
        );
      } else {
        saveAccountStore(email, password, biometricalType || "");
        await saveAccountStorage(email, password, biometricalType || "");
      }
      try {
        await updateNotification();
      } catch (error) {
        console.log("Update noti error", error);
      }
    } else {
      setIsLoggingIn(false);
      try {
        await cleanUpNotifications();
      } catch (error) {
        console.log("Clean up noti error", error);
      }

      const { error } = data;
      switch (error) {
        case ERROR_NEED_VERIFICATION:
          navigation.navigate("EmailVerification", {
            email,
            password,
          });
          break;
        case ERROR_INVALID_CREDENTIAL:
          Alert.alert(t("Invalid email and/or password"));
          break;
        default:
          Alert.alert(t("There is an error logging user in Please try again"));
          break;
      }
    }
  };

  const onBiometricalLogin = async () => {
    try {
      const result = await LocalAuthentication.getEnrolledLevelAsync();
      if (result === LocalAuthentication.SecurityLevel.BIOMETRIC) {
        // BIOMETRIC enable login
        const authentication = await LocalAuthentication.authenticateAsync({
          cancelLabel: t("Cancel"),
          disableDeviceFallback: true,
          fallbackLabel: t("Fallback"),
          promptMessage: t("Authenticate"),
        });
        if (
          authentication.success &&
          storageAccount?.username &&
          storageAccount?.password &&
          storageAccount?.biometricalType
        ) {
          const decryptUsername = aesDecrypt(storageAccount?.username);
          const decryptPassword = aesDecrypt(storageAccount?.password);
          if (decryptPassword && decryptUsername) {
            onPressLogin({
              email: decryptUsername,
              password: decryptPassword,
              biometricalType: storageAccount?.biometricalType,
            });
          }
        }
      } else {
        setIsOpenAlert(true);
      }
    } catch (error) {
      console.error(error);
    }
  };

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
    // Check role
    if (!auth.user) return;
    if (auth.user?.role.some((r) => r === Role.Admin)) {
      initPage("AdminNavigator");
      return;
    }
    if (auth.user?.role.some((r) => r === Role.Organizer)) {
      initPage("OrganizerNavigator");
      return;
    }
    getOnboardingData()
      .then(({ process, pendingStep }) => {
        setIsLoggingIn(false);
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
      })
      .catch((e) => {
        console.error(e);
        setIsLoggingIn(false);
      });
  }, [auth.user, initPage]);

  useEffect(() => {
    const getStorage = async () => {
      try {
        const biometrics = await AsyncStorage.getItem(DEVICE_OS);
        if (biometrics) {
          const obj: biometricalStorageModel = JSON.parse(biometrics);
          if (obj && obj.username && obj.password) {
            setStorageAccount({
              username: obj.username,
              password: obj.password,
              biometricalType: obj.biometricalType,
            });
            if (obj.biometricalType) {
              setIsShowBio(obj.biometricalType);
            }
          }
        }
      } catch (error) {
        console.error(error);
      }
    };

    getStorage();
  }, []);

  return (
    <KeyboardAvoidingView
      flex="1"
      behavior={Platform.OS === "ios" ? "padding" : "height"}
    >
      <ScrollView testID={APP_SCROLL_VIEW_TEST_ID} bgColor="rs.grey">
        <VStack flex="1" justifyContent="flex-end">
          <Animated.View
            style={{
              flex: 1,
              marginTop,
            }}
          >
            <Image
              source={require("../../assets/intro/login_bg.png")}
              alt="Login background"
              w={SCREEN_WIDTH}
              h={SCREEN_WIDTH * 1.28}
              resizeMethod="resize"
              resizeMode="contain"
            />
          </Animated.View>
          <Box safeArea position="absolute" top="0" left="5">
            <Image
              source={ImageDirectory.LOGIN_TEXT}
              alt="Logo"
              mt="4"
              mb="4"
            />
            <Animated.View
              style={{
                opacity,
              }}
            >
              <Heading color="rs.white" fontSize="4xl">
                {t("Unleash\nyour potential")}
              </Heading>
              <Heading color="rs.primary_purple" fontSize="4xl">
                {t("Dream bigger")}
              </Heading>
              <Text mt="8" fontSize="md" color="rs.white">
                {t(
                  "Professional table tennis training\ncourses throughout Hong Kong"
                )}
              </Text>
            </Animated.View>
          </Box>
          <VStack flex="1" mt="4" mx="4" space="4">
            <FormInput
              label={t("Email")}
              controllerProps={{
                control,
                name: "email",
                rules: { required: t("is required") },
              }}
              inputProps={{ keyboardType: "email-address" }}
              onFocus={onFocus}
              onBlur={onBlur}
              testID="Email"
            />
            <FormInput
              label={t("Password")}
              controllerProps={{
                control,
                name: "password",
                rules: { required: t("is required") },
              }}
              inputProps={{
                type: "password",
              }}
              onFocus={onFocus}
              onBlur={onBlur}
              testID="Password"
            />
            <Button
              isDisabled={!isValid}
              isLoading={isLoggingIn}
              isLoadingText={t("Loading")}
              onPress={handleSubmit((val) => onPressLogin(val as FormValues))}
              testID="Login"
            >
              {t("Login")}
            </Button>

            {isShowBio ? (
              <Button
                _pressed={{
                  _icon: {
                    color: "#FFFFFF",
                  },
                }}
                leftIcon={<BiometricIcon mr="1" />}
                variant="outline"
                onPress={onBiometricalLogin}
              >
                {t("Biometric Login")}
              </Button>
            ) : null}
            <Text
              fontSize="md"
              textDecorationLine="underline"
              color="rs.primary_purple"
              textDecorationColor="rs.primary_purple"
              onPress={() => {
                navigation.navigate("CreateAccount");
              }}
            >
              {t("Don’t have an account? Register Now")}
            </Text>
            <Text
              fontSize="md"
              textDecorationLine="underline"
              color="rs.primary_purple"
              textDecorationColor="rs.primary_purple"
              onPress={() => {
                navigation.navigate("ForgotPassword");
              }}
            >
              {t("Forgot your password?")}
            </Text>
          </VStack>
        </VStack>
      </ScrollView>
      <ConfirmationModal
        isOpen={isOpenAlert}
        title={`${t(
          'You need to add biometric login in "Settings" of the local system before you can use this function'
        )}`}
        confirmText={t("Yes")}
        onConfirm={async () => {
          setIsOpenAlert(false);
          if (DEVICE_OS === "android") {
            Linking.sendIntent("android.settings.SETTINGS");
          } else {
            Linking.openSettings();
          }
        }}
        cancelText={t("Cancel")}
        onCancel={() => setIsOpenAlert(false)}
      />
    </KeyboardAvoidingView>
  );
}
