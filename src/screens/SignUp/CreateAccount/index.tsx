import React, { useState } from "react";
import {
  KeyboardAvoidingView,
  VStack,
  Image,
  Box,
  Button,
  Text,
  ScrollView,
  Heading,
  Toast,
} from "native-base";
import { Keyboard, Platform, TouchableWithoutFeedback } from "react-native";
import { useForm } from "react-hook-form";
import { NativeStackScreenProps } from "@react-navigation/native-stack";
import { uniqueId } from "lodash";

import { AxiosError } from "axios";
import ImageDirectory from "../../../assets/index";
import FormInput from "../../../components/FormInput/FormInput";
import { SCREEN_HEIGHT, SCREEN_WIDTH } from "../../../constants/constants";
import { MainStackNavigatorParamList } from "../../../routers/Types";
import { getTranslation } from "../../../utils/translation";
import { signUp } from "../../../services/AuthServices";
import ConfirmationModal from "../../../components/ConfirmationModal/ConfirmationModal";
import {
  ApiErrorResponse,
  showApiToastError,
  showCommonToastError,
} from "../../../components/ApiToastError";
import MessageToast, {
  MesssageToastType,
} from "../../../components/Toast/MessageToast";

export type LogInScreenProps = NativeStackScreenProps<
  MainStackNavigatorParamList,
  "CreateAccount"
>;

export interface CreateAccountForm {
  email: string;
  password: string;
}

const t = getTranslation([
  "screen.SignUp.CreateAccount",
  "validation",
  "constant.button",
]);

export default function CreateAccount({
  navigation,
}: LogInScreenProps): JSX.Element {
  const {
    control,
    handleSubmit,
    formState: { isValid, isSubmitting },
  } = useForm<CreateAccountForm>({
    mode: "onChange",
  });
  const [createAccountError, setCreateAccountError] = useState<string | null>(
    null
  );

  return (
    <KeyboardAvoidingView
      flex="1"
      behavior={Platform.OS === "ios" ? "padding" : "height"}
    >
      <ScrollView bgColor="rs.grey">
        <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
          <VStack flex="1" justifyContent="flex-end">
            <Image
              source={require("../../../assets/intro/login_bg.png")}
              alt="Login background"
              w={SCREEN_WIDTH}
              h={SCREEN_WIDTH * 1.28}
              resizeMethod="resize"
              resizeMode="contain"
              mt={-SCREEN_HEIGHT * 0.2}
            />
            <Box safeArea position="absolute" top="0" left="5">
              <Image
                source={ImageDirectory.LOGIN_TEXT}
                alt="Logo"
                mt="4"
                mb="4"
              />
              <Text mt="8" fontSize="md" color="rs.white">
                {t("You will recieve an confirmation email later")}
              </Text>
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
              />
              <FormInput
                label={t("Password")}
                controllerProps={{
                  control,
                  name: "password",
                  rules: { required: t("is required") },
                }}
              />
              <Heading fontSize={16}>
                {t("Please consider the rules for your new password")}
              </Heading>
              <Text fontSize={14} mr="2">
                {t(
                  "at least 1 Uppercase, 1 Lowercase, 1 number, at least 8 characters"
                )}
              </Text>
              <Button
                isDisabled={!isValid}
                isLoading={isSubmitting}
                isLoadingText={t("Loading")}
                onPress={handleSubmit(async (val) => {
                  try {
                    await signUp({ email: val.email, password: val.password });
                    navigation.reset({
                      index: 0,
                      routes: [
                        {
                          name: "EmailVerification",
                          params: {
                            email: val.email,
                            password: val.password,
                          },
                        },
                      ],
                    });
                  } catch (error: AxiosError | any) {
                    if (
                      !error.response?.data?.errors &&
                      error.response?.data.status !== 409
                    ) {
                      showApiToastError(error);
                    } else {
                      showCommonToastError(error);
                    }
                  }
                })}
              >
                {t("Register")}
              </Button>
            </VStack>
          </VStack>
        </TouchableWithoutFeedback>

        <ConfirmationModal
          alertType="Fail"
          title={t("Error")}
          isOpen={createAccountError != null}
          description={createAccountError}
          confirmText={t("Ok, got it")}
          onConfirm={() => setCreateAccountError(null)}
        />
      </ScrollView>
    </KeyboardAvoidingView>
  );
}
