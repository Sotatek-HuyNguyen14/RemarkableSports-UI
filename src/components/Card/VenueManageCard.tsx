import React from "react";
import { HStack, VStack, Text, Image, Heading, Button } from "native-base";
import { useNavigation } from "@react-navigation/native";
import {
  NativeStackNavigationProp,
  NativeStackScreenProps,
} from "@react-navigation/native-stack";

import { getTranslation } from "../../utils/translation";
import { Venue } from "../../models/requests/Venue";
import ImageDirectory from "../../assets";
import { formatFileUrl } from "../../services/ServiceUtil";
import { MainStackNavigatorParamList } from "../../routers/Types";

const t = getTranslation([
  "component.Card.VenueManageCard",
  "constant.district",
  "constant.profile",
  "constant.week",
  "constant.button",
]);

export interface VenueManageCardProps {
  venue: Venue;
}

export default function VenueManageCard({ venue }: VenueManageCardProps) {
  const navigation =
    useNavigation<NativeStackNavigationProp<MainStackNavigatorParamList>>();

  const imageSource = venue.imageUrl
    ? { uri: formatFileUrl(venue.imageUrl) }
    : ImageDirectory.VENUE;

  return (
    <VStack shadow="9" bgColor="rs.white" borderRadius="xl">
      <Image
        alt="Venue Image"
        source={imageSource}
        borderTopLeftRadius="xl"
        borderTopRightRadius="xl"
        style={{
          flex: 1,
          alignSelf: "center",
          width: "100%",
          height: 170,
        }}
        resizeMode="cover"
      />
      <VStack p={4} space={0}>
        <Heading>{venue.name}</Heading>
        <Text>{venue.address}</Text>
        <HStack space={2} mt={3}>
          <Button
            h="12"
            borderRadius="18"
            py="1"
            onPress={() => {
              navigation.navigate("ManageBookings", { venue });
            }}
            _text={{ fontSize: "sm" }}
          >
            Manage Bookings
          </Button>
          <Button
            flex={1}
            variant="outline"
            h="12"
            borderRadius="18"
            py="1"
            onPress={() => {
              navigation.navigate("ClubVenueDetails", { venue });
            }}
            _text={{ fontSize: "sm", color: "rs.primary_purple" }}
          >
            Details
          </Button>
        </HStack>
      </VStack>
    </VStack>

    // <Card
    //   onPress={() => {
    //     onPressVenueCard?.(venue);
    //   }}
    //   body={
    //     <VStack space={3}>

    //       <VStack>
    //         <Heading size="md" numberOfLines={2}>
    //           {venue.name}
    //         </Heading>
    //         <Text numberOfLines={2}>{venue.address}</Text>
    //       </VStack>
    //     </VStack>
    //   }
    //   footer={footer}
    // />
  );
}
