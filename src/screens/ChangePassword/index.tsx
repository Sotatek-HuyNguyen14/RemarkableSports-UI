import React, { useRef, useState } from "react";
import { Box, Button, Heading, Text, Toast, VStack } from "native-base";
import { NativeStackScreenProps } from "@react-navigation/native-stack";
import { useForm } from "react-hook-form";

import HeaderLayout from "../../components/Layout/HeaderLayout";
import { MainStackNavigatorParamList } from "../../routers/Types";
import FormInput from "../../components/FormInput/FormInput";
import { changePassword } from "../../services/AuthServices";
import { getTranslation } from "../../utils/translation";
import { isValidPassword } from "../../utils/validations";
import MessageToast, {
  MesssageToastType,
} from "../../components/Toast/MessageToast";
import { showApiToastError } from "../../components/ApiToastError";

export type ChangePasswordProps = NativeStackScreenProps<
  MainStackNavigatorParamList,
  "ChangePassword"
>;

interface FormValues {
  currentPassword: string;
  newPassword: string;
  confirmPassword: string;
}

const t = getTranslation([
  "screen.ChangePassword",
  "constant.button",
  "validation",
]);

const CHANGE_PASSWORD_TOAST = "CHANGE_PASSWORD_TOAST";
const ERROR_TOAST = "ERROR_TOAST";

export default function ChangePassword({ navigation }: ChangePasswordProps) {
  const {
    control,
    handleSubmit,
    formState: { isValid, isSubmitting },
  } = useForm({
    mode: "onChange",
  });

  const onChangePassword = async (val: FormValues) => {
    try {
      await changePassword(val);
      if (navigation.canGoBack()) {
        if (!Toast.isActive(CHANGE_PASSWORD_TOAST)) {
          Toast.show({
            id: CHANGE_PASSWORD_TOAST,
            duration: 2000,
            placement: "top",
            render: () => {
              return (
                <MessageToast
                  type={MesssageToastType.Success}
                  title={t("Password changed")}
                />
              );
            },
          });
        }
        navigation.goBack();
      }
    } catch (error: any) {
      // format response data errors {ConfirmPassword:[' '] newPassword:[' '] currentPassword:[' '] }
      showApiToastError(error);
      console.log("error-changePassword", error);
    }
  };

  return (
    <HeaderLayout
      KeyboardAwareScrollViewProps={{
        bounces: false,
      }}
      headerProps={{
        title: t("Change password"),
        containerStyle: { marginHorizontal: 0 },
      }}
    >
      <VStack
        p="defaultLayoutSpacing"
        mt="defaultLayoutSpacing"
        space={4}
        flex={1}
      >
        <Heading fontSize={16}>
          {t("Please consider the rules for your new password")}
        </Heading>
        <Text fontSize={14} mr="2">
          {t(
            "at least 1 Uppercase, 1 Lowercase, 1 number, at least 8 characters"
          )}
        </Text>
        <FormInput
          label={t("Current password")}
          controllerProps={{
            control,
            name: "currentPassword",
            rules: {
              required: `${t("Current password")} ${t("is required")}`,
            },
          }}
          inputProps={{
            type: "password",
            maxLength: 25,
          }}
        />
        <FormInput
          label={t("New password")}
          controllerProps={{
            control,
            name: "newPassword",
            rules: {
              required: `${t("New password")} ${t("is required")}`,
              validate: {
                withInRange: (v) => {
                  if (v) {
                    return (
                      isValidPassword(v) ||
                      t(
                        "at least 1 Uppercase, 1 Lowercase, 1 number, at least 8 characters"
                      )
                    );
                  }
                },
              },
            },
          }}
          inputProps={{
            type: "password",
            maxLength: 25,
          }}
        />
        <FormInput
          label={t("Confirm password")}
          controllerProps={{
            control,
            name: "confirmPassword",
            rules: {
              required: `${t("Confirm password")} ${t("is required")}`,
              validate: {
                withInRange: (v) => {
                  if (v) {
                    return (
                      isValidPassword(v) ||
                      t(
                        "at least 1 Uppercase, 1 Lowercase, 1 number, at least 8 characters"
                      )
                    );
                  }
                },
              },
            },
          }}
          inputProps={{
            type: "password",
            maxLength: 25,
          }}
        />
        <Button
          style={{
            position: "absolute",
            bottom: 17,
            width: 343,
            alignSelf: "center",
          }}
          isDisabled={!isValid}
          isLoading={isSubmitting}
          isLoadingText={t("Loading")}
          onPress={handleSubmit((val) => onChangePassword(val as FormValues))}
        >
          {t("Done")}
        </Button>
      </VStack>
    </HeaderLayout>
  );
}
