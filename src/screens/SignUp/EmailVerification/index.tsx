/* eslint-disable react-hooks/exhaustive-deps */
import { NativeStackScreenProps } from "@react-navigation/native-stack";
import { Button, useTheme } from "native-base";
import React, { useEffect, useRef, useState } from "react";
import {
  View,
  Image,
  Text,
  SafeAreaView,
  TouchableOpacity,
  AppState,
} from "react-native";
import ImageDirectory from "../../../assets/index";
import { SCREEN_WIDTH } from "../../../constants/constants";
import { useAuth } from "../../../hooks/UseAuth";
import useNotification from "../../../hooks/UseNotification";
import { MainStackNavigatorParamList } from "../../../routers/Types";
import {
  login,
  ERROR_INVALID_CREDENTIAL,
  resendConfirmEmail,
} from "../../../services/AuthServices";
import { createOnboardingWorkflow } from "../../../services/WorkflowService";
import { getTranslation } from "../../../utils/translation";

const RESEND_INTERVAL = 300000;
const RE_CHECK_INTERVAL = 15000;
const COUNT_DOWN_INTERVAL = 1000;
const COUNT_DOWN = 300;

function formatTimer(timer: number) {
  const minutes = Math.floor(timer / 60);
  const seconds = timer % 60;
  return `${minutes}m ${seconds}s`;
}

const t = getTranslation([
  "screen.SignUp.EmailVerification",
  "constant.button",
]);

export default function EmailVerifications({
  route,
  navigation,
}: NativeStackScreenProps<MainStackNavigatorParamList, "EmailVerification">) {
  const { email, password } = route.params;

  const auth = useAuth();

  const [isResent, setIsResent] = useState(false);
  const [timer, setTimer] = useState(COUNT_DOWN);
  const resentInterval = useRef<NodeJS.Timer>();
  const timerInterval = useRef<NodeJS.Timer>();
  const getTokenInterval = useRef<NodeJS.Timer>();
  const appState = useRef(AppState.currentState);
  const { updateNotification } = useNotification();
  const { colors } = useTheme();

  async function getToken() {
    const result = await login({ email, password });

    const { success, data } = await login({ email, password });
    if (success) {
      const { token, refreshToken, expiresIn } = data;
      auth.login(token!, refreshToken!, expiresIn!);
      await createOnboardingWorkflow();
      try {
        await updateNotification();
      } catch (error) {
        console.log("Update noti error", error);
      }
    } else {
      switch (data.error) {
        case ERROR_INVALID_CREDENTIAL:
          alert(t("Invalid email and/or password"));
          break;
        default:
          throw new Error(t("Email not confirmed"));
      }
    }
  }

  // Initial set up for retrieving access token
  useEffect(() => {
    if (email && password) {
      const get = async () => {
        try {
          await getToken();
        } catch (e) {
          getTokenInterval.current = setInterval(async () => {
            try {
              await getToken();
            } catch (err) {
              console.log(err);
            }
          }, RE_CHECK_INTERVAL);
        }
      };
      get();
    } else {
      navigation.navigate("LogIn");
    }
  }, [navigation, route.params]);

  // Re-check email confirmation when app come to the foreground
  useEffect(() => {
    const subscription = AppState.addEventListener("change", (nextAppState) => {
      if (
        appState.current.match(/inactive|background/) &&
        nextAppState === "active"
      ) {
        const get = async () => {
          try {
            await getToken();
          } catch (e) {
            console.log(e);
          }
        };
        get();
      }
      appState.current = nextAppState;
    });
    return () => {
      subscription.remove();
    };
  }, []);

  // Subsequent check if email confirmed, if so clear all the intervals
  useEffect(() => {
    if (auth.loggedIn) {
      clearInterval(getTokenInterval.current);
      clearInterval(resentInterval.current);
      clearInterval(timerInterval.current);
    }
  }, [auth.loggedIn]);

  // Check if resend button clicked, if so re-send confirm email and disable button for 5 mins
  useEffect(() => {
    if (isResent) {
      resendConfirmEmail({ email });
      resentInterval.current = setInterval(() => {
        setIsResent(false);
      }, RESEND_INTERVAL);
      if (!timerInterval.current) {
        timerInterval.current = setInterval(() => {
          setTimer((prev) => prev - 1);
        }, COUNT_DOWN_INTERVAL);
      }
    } else clearInterval(resentInterval.current);
  }, [isResent]);

  // Check if COUNT_DOWN timer reach 0, if so then re-enable resend button
  useEffect(() => {
    if (timer === 0) {
      setTimer(COUNT_DOWN);
    }
  }, [timer]);

  return (
    <SafeAreaView
      style={{
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
      }}
    >
      <View style={{ flex: 1, alignItems: "center", marginTop: 38 }}>
        <Image
          source={ImageDirectory.LOGO_SPLASH}
          style={{ width: 145, height: 145 }}
        />
        <Text
          style={{
            fontWeight: "700",
            fontSize: 32,
            marginTop: 67,
            textAlign: "center",
          }}
        >
          {auth.loggedIn
            ? t("Registration confirmed")
            : t("Thank you for registration")}
        </Text>
        <Text
          style={{
            fontWeight: "400",
            fontSize: 16,
            padding: 30,
            textAlign: "center",
          }}
        >
          {auth.loggedIn
            ? t(
                "Thank you for your patient Please continue the onboarding process"
              )
            : t(
                "You will soon receive a confirmation email then you can continue the onboarding process"
              )}
        </Text>
        {!auth.loggedIn && (
          <View style={{ flexDirection: "row" }}>
            <Text>{t("Not yet receive any email? ")}</Text>
            <TouchableOpacity
              onPress={() => {
                setIsResent(true);
              }}
              disabled={isResent}
            >
              <Text
                style={{
                  color: isResent ? "#D7D7D7" : "rs.primary_purple",
                  textDecorationLine: isResent ? "none" : "underline",
                }}
              >
                {isResent ? formatTimer(timer) : t("Resend email")}
              </Text>
            </TouchableOpacity>
          </View>
        )}
        <TouchableOpacity
          onPress={() => {
            navigation.reset({
              index: 0,
              routes: [{ name: "OnboardingBasicInfo" }],
            });
          }}
          disabled={!auth.loggedIn}
          style={{
            alignItems: "center",
            justifyContent: "center",
            backgroundColor: auth.loggedIn
              ? colors.rs.primary_purple
              : "#D7D7D7",
            padding: 16,
            borderRadius: 16,
            width: SCREEN_WIDTH * 0.8,
            position: "absolute",
            bottom: 10,
          }}
        >
          <Text
            style={{
              color: "#fff",
              fontWeight: "700",
              lineHeight: 21,
              fontSize: 18,
            }}
          >
            {t("Continue")}
          </Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}
