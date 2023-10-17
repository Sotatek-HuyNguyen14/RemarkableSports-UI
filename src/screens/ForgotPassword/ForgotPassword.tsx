import React, { useState } from "react";
import { Button, useTheme, VStack } from "native-base";
import { useForm } from "react-hook-form";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import FormInput from "../../components/FormInput/FormInput";
import { MainStackNavigatorParamList } from "../../routers/Types";
import { getTranslation } from "../../utils/translation";
import HeaderLayout from "../../components/Layout/HeaderLayout";
import ConfirmationModal from "../../components/ConfirmationModal/ConfirmationModal";
import { forgotPassword } from "../../services/AuthServices";
import { showApiToastError } from "../../components/ApiToastError";

export type ForgotPasswordScreenNavigationProp = NativeStackNavigationProp<
  MainStackNavigatorParamList,
  "ForgotPassword"
>;

interface ForgotPasswordScreenProps {
  navigation: ForgotPasswordScreenNavigationProp;
}

interface FormValues {
  email: string;
}
const t = getTranslation([
  "screen.ForgotPassword.ForgotPassword",
  "validation",
  "constant.button",
]);

export default function ForgotPasswordScreen({
  navigation,
}: ForgotPasswordScreenProps): JSX.Element {
  const {
    control,
    handleSubmit,
    formState: { isValid, isSubmitting },
  } = useForm({
    mode: "onChange",
  });

  const [isModalOpen, setModalOpen] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const resetPassword = async (formValues: FormValues) => {
    const { email } = formValues;
    try {
      await forgotPassword({ email });
      setError(null);
      setModalOpen(true);
    } catch (e) {
      setError(true);
      showApiToastError(e);
      // setModalOpen(true);
    }
  };

  return (
    <HeaderLayout
      headerProps={{
        title: t("Forgot Password"),
        headerLabelContainerStyle: {
          justifyContent: "center",
        },
      }}
      isSticky
    >
      <VStack my="4" space="4" mx="defaultLayoutSpacing">
        <FormInput
          label={t("Email")}
          controllerProps={{
            control,
            name: "email",
            rules: { required: t("is required") },
          }}
          inputProps={{ keyboardType: "email-address" }}
        />
        <Button
          isDisabled={!isValid}
          isLoading={isSubmitting}
          isLoadingText={t("Loading")}
          onPress={handleSubmit(resetPassword)}
        >
          {t("Send reset password email")}
        </Button>
      </VStack>
      <ConfirmationModal
        alertType={error !== null ? "Fail" : "Success"}
        confirmText={t("OK")}
        isOpen={isModalOpen}
        title={error !== null ? t("Error") : t("Success")}
        description={error !== null ? error : t("ResetSuccess")}
        onConfirm={() => {
          setModalOpen(false);
        }}
      />
    </HeaderLayout>
  );
}
