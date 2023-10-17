import React, { useRef, useState } from "react";
import { Box, Button, Heading, Text, Toast, VStack } from "native-base";
import { NativeStackScreenProps } from "@react-navigation/native-stack";
import { useForm } from "react-hook-form";
import HeaderLayout from "../../components/Layout/HeaderLayout";
import { MainStackNavigatorParamList } from "../../routers/Types";
import FormInput from "../../components/FormInput/FormInput";
import { changeEmail } from "../../services/AuthServices";
import { getTranslation } from "../../utils/translation";
import { showApiToastError } from "../../components/ApiToastError";
import { useAuth } from "../../hooks/UseAuth";
import ConfirmationModal from "../../components/ConfirmationModal/ConfirmationModal";
import { showApiToastSuccess } from "../../components/ApiToastSuccess";
import { isValidEmail } from "../../utils/validations";

export type ChangeEmailProps = NativeStackScreenProps<
  MainStackNavigatorParamList,
  "ChangeEmail"
>;

interface FormValues {
  newEmail: string;
  confirmEmail: string;
}

const t = getTranslation([
  "screen.ChangeEmail",
  "constant.button",
  "validation",
]);

export default function ChangeEmail({ navigation }: ChangeEmailProps) {
  const {
    control,
    handleSubmit,
    formState: { isValid, isSubmitting },
    watch,
    trigger,
  } = useForm<FormValues>({
    mode: "onChange",
  });

  const { user, logout } = useAuth();
  const [isOpen, setIsOpen] = useState(false);
  const newEmail = watch("newEmail");

  const processSubmit = async (formValue: FormValues) => {
    setIsOpen(false);
    if (user?.email) {
      const formatValue = {
        oldEmail: user?.email,
        newEmail: formValue.newEmail,
      };

      try {
        await changeEmail(formatValue);
        showApiToastSuccess({ title: t("Email Changed") });
        await logout();
        navigation.reset({ index: 0, routes: [{ name: "LogIn" }] });
      } catch (error: any) {
        showApiToastError(error);
      }
    }
  };
  return (
    <HeaderLayout
      KeyboardAwareScrollViewProps={{
        bounces: false,
      }}
      headerProps={{
        title: t("Change Email"),
        containerStyle: { marginHorizontal: 0 },
      }}
    >
      <VStack space="5" flex="1" p="defaultLayoutSpacing">
        <VStack space="4" mb="4">
          <Heading>{t("Current Email Address:")}</Heading>
          <Text>{user?.email}</Text>
        </VStack>
        <Heading>{t("New Email Address:")}</Heading>
        <FormInput
          label={t("Email address")}
          isShowWords
          controllerProps={{
            name: "newEmail",
            control,
            rules: {
              required: t("is required"),
              validate: {
                withInRange: (v) => {
                  if (v) {
                    return (
                      isValidEmail(v) || t("Please enter a valid email address")
                    );
                  }
                },
              },
            },
          }}
        />

        <FormInput
          label={t("Confirm Email address")}
          isShowWords
          controllerProps={{
            name: "confirmEmail",
            control,
            rules: {
              required: t("is required"),
              validate: {
                withInRange: (v) => {
                  if (v) {
                    return v === newEmail || t("Email does not match");
                  }
                },
              },
            },
          }}
        />

        <Button
          mt="auto"
          isDisabled={!isValid}
          isLoading={isSubmitting}
          isLoadingText={t("Loading")}
          onPress={handleSubmit(() => setIsOpen(true))}
        >
          {t("Next")}
        </Button>
      </VStack>
      <ConfirmationModal
        alertType="Success"
        confirmText={t("Confirm")}
        cancelText={t("Cancel")}
        isOpen={isOpen}
        onCancel={() => {
          setIsOpen(false);
        }}
        title={t("Confirm to change email")}
        description={newEmail}
        onConfirm={handleSubmit(processSubmit)}
      />
    </HeaderLayout>
  );
}
