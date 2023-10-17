import { RouteProp } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import React from "react";
import SuccessMessage from "../../../components/Feedback/SuccessMessage";
import { MainStackNavigatorParamList } from "../../../routers/Types";
import { getTranslation } from "../../../utils/translation";

const t = getTranslation("screen.ClubScreens.UpdateVenueSuccess");

export type UpdateVenueSuccessNavigationProp = NativeStackNavigationProp<
  MainStackNavigatorParamList,
  "ClubUpdateVenueSuccess"
>;

export type UpdateVenueSuccessRouteProp = RouteProp<
  MainStackNavigatorParamList,
  "ClubUpdateVenueSuccess"
>;

interface UpdateVenueSuccessProps {
  navigation: UpdateVenueSuccessNavigationProp;
  route: UpdateVenueSuccessRouteProp;
}

export default function UpdateVenueSuccess({ route }: UpdateVenueSuccessProps) {
  return (
    <SuccessMessage
      mx="defaultLayoutSpacing"
      destination="ClubNavigator"
      nestedDestination="ClubVenueList"
      headerLabel={t("Updated a venue")}
      buttonLabel={t("Back")}
    />
  );
}
