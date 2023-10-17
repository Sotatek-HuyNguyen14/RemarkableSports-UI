import React, { useEffect } from "react";
import { NativeStackScreenProps } from "@react-navigation/native-stack";

import { MainStackNavigatorParamList } from "../../../routers/Types";
import SuccessMessage from "../../../components/Feedback/SuccessMessage";
import { getTranslation } from "../../../utils/translation";
import { useAuth } from "../../../hooks/UseAuth";

const t = getTranslation("screen.SignUp.SignUpSuccess");

export default function SignUpSuccess({
  navigation,
  route,
}: NativeStackScreenProps<MainStackNavigatorParamList, "SignUpSuccess">) {
  const { logout } = useAuth();

  useEffect(() => {
    return () => {
      logout();
    };
  }, [logout]);

  return (
    <SuccessMessage
      mx="defaultLayoutSpacing"
      destination="LogIn"
      headerLabel={t("Successful")}
      bodyLabel={t("Admin will soon to approve your application Thank you")}
      buttonLabel={t("OK")}
    />
  );
}
