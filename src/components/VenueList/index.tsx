import React from "react";
import { VStack, Button, HStack, Text } from "native-base";
import { useNavigation } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";

import { Venue } from "../../models/requests/Venue";
import { getTranslation } from "../../utils/translation";
import VenueManageCard from "../Card/VenueManageCard";
import { MainStackNavigatorParamList } from "../../routers/Types";

interface VenueCardListProps {
  venues: Venue[];
}

const t = getTranslation("constant.button");

export default function VenueList({ venues }: VenueCardListProps) {
  return (
    <VStack space="4">
      {Array.isArray(venues) &&
        venues.map((venue) => {
          return <VenueManageCard key={venue.id} venue={venue} />;
        })}
    </VStack>
  );
}
