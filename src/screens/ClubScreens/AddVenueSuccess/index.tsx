import React from "react";
import { CompositeNavigationProp, RouteProp } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { Box, Center, Heading, VStack, Text, Button } from "native-base";
import useSWR from "swr";
import axios, { AxiosError } from "axios";

import HeaderLayout from "../../../components/Layout/HeaderLayout";
import {
  ClubBottomTabNavigatorParamList,
  MainStackNavigatorParamList,
} from "../../../routers/Types";
import { getTranslation } from "../../../utils/translation";
import CheckIcon from "../../../components/Icons/CheckIcon";
import { Venue } from "../../../models/requests/Venue";
import { AreaCode } from "../../../models/Districts";
import { format12HTo24H } from "../../../utils/date";
import { showApiToastError } from "../../../components/ApiToastError";
import { getVenueById } from "../../../services/VenueServices";
import { formatCoreUrl } from "../../../services/ServiceUtil";
import Loading from "../../../components/Loading";

export type AddVenueSuccessNavigationProp = CompositeNavigationProp<
  NativeStackNavigationProp<MainStackNavigatorParamList, "ClubAddVenueSuccess">,
  NativeStackNavigationProp<ClubBottomTabNavigatorParamList>
>;

export type AddVenueSuccessRouteProp = RouteProp<
  MainStackNavigatorParamList,
  "ClubAddVenueSuccess"
>;

interface AddVenueSuccessProps {
  navigation: AddVenueSuccessNavigationProp;
  route: AddVenueSuccessRouteProp;
}

const t = getTranslation([
  "screen.ClubScreens.Venue",
  "screen.ClubScreens.AddVenueSuccess",
]);

export default function AddVenueSuccess({
  route,
  navigation,
}: AddVenueSuccessProps) {
  const { venueId, venueSubmittedDetails } = route.params;
  const { data: venue, isLoading } = useSWR(
    formatCoreUrl(`/venue/${venueId}`),
    (url) => axios.get(url).then((res) => res.data)
  );

  if (isLoading) {
    return <Loading />;
  }

  return (
    <Box safeArea flex={1} p="defaultLayoutSpacing" alignItems="center">
      <Heading size="sm">{t("AddVenue")}</Heading>
      <VStack flex={1} justifyContent="center" alignItems="center" space="4">
        <CheckIcon />
        <Heading size="lg">{t("Created a venue")}</Heading>
        <Text textAlign="center">
          Other users will be able to view and book your venue from now on
        </Text>
      </VStack>
      <VStack space={4} mb="5" width="100%">
        <Button
          onPress={() => {
            navigation.navigate("ClubVenueList");
          }}
        >
          Done
        </Button>
        <Button
          variant="outline"
          onPress={() => {
            console.log(venue);
            // navigation.navigate("")
            navigation.reset({
              index: 0,
              routes: [
                { name: "ClubNavigator" },
                { name: "ClubVenueDetails", params: { venue } },
              ],
            });
          }}
        >
          View Venue Details
        </Button>
      </VStack>
    </Box>
    // <HeaderLayout isSticky headerProps={{ title: t("AddVenue") }}>
    //   <SuccessMessage
    //     mx="defaultLayoutSpacing"
    //     destination="ClubNavigator"
    //     headerLabel={t("Created a venue")}
    //     bodyLabel="Other users will be able to view and book your venue from now on"
    //     buttonLabel={t("Back")}
    //   />
    // </HeaderLayout>
  );
}
