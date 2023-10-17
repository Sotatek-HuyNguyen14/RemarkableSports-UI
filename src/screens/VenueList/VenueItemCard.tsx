import React from "react";
import { Pressable, HStack, VStack, Text, Image } from "native-base";
import { Venue } from "../../models/requests/Venue";
import ClockIcon from "../../components/Icons/ClockIcon";
import LocationIcon from "../../components/Icons/LocationIcon";
import ImageDirectory from "../../assets";
import { SCREEN_WIDTH } from "../../constants/constants";
import RoundedCurrencyIcon from "../../components/Icons/RoundedCurrencyIcon";
import CalendarIcon from "../../components/Icons/CalendarIcon";
import Card from "../../components/Card/Card";
import { format24HTo12H, formatUtcToLocalDate } from "../../utils/date";
import { getTranslation } from "../../utils/translation";
import { formatFileUrl } from "../../services/ServiceUtil";

interface VenueItemCardProps {
  venue: Venue;
  onPressVenueCard?: (venue: Venue) => void;
  footer?: React.ReactNode;
}

const t = getTranslation([
  "constant.district",
  "screen.PlayerScreens.VenueItemCard",
]);

function VenueItemCard({
  venue,
  onPressVenueCard,
  footer,
}: VenueItemCardProps) {
  const venueDate =
    Array.isArray(venue.availableTimeSlots) &&
    venue.availableTimeSlots.length > 0 &&
    venue.availableTimeSlots[0].fromTime;

  let imageSource = ImageDirectory.VENUE;
  if (venue.imageUrl) {
    imageSource = {
      uri: formatFileUrl(venue.imageUrl),
    };
  }

  return (
    <Pressable
      onPress={() => {
        onPressVenueCard?.(venue);
      }}
    >
      <Card
        onPress={() => {
          onPressVenueCard?.(venue);
        }}
        body={
          <VStack>
            <Image
              alt="Venue Image"
              source={imageSource}
              style={{
                flex: 1,
                // backgroundColor: "red",
                alignSelf: "center",
                width: SCREEN_WIDTH * 0.85,
                height: 170,
                borderRadius: 16,
              }}
              resizeMode="cover"
            />
            <Text fontWeight="700" fontSize="lg" mt="2" numberOfLines={2}>
              {venue.name}
            </Text>
            <HStack mt="4">
              {venueDate && (
                <HStack alignItems="center">
                  <CalendarIcon />
                  <Text fontWeight="400" fontSize="sm" ml="2">
                    {formatUtcToLocalDate(venueDate)}
                  </Text>
                </HStack>
              )}

              <HStack alignItems="center" ml={venueDate ? "6" : "0"}>
                <ClockIcon />
                <Text fontWeight="400" fontSize="sm" ml="2">
                  {`${format24HTo12H(venue.openingTime)} - ${format24HTo12H(
                    venue.closingTime
                  )}`}
                </Text>
              </HStack>
            </HStack>

            <HStack alignItems="center">
              <HStack alignItems="center" mt="4">
                <LocationIcon />
                <Text fontWeight="400" fontSize="sm" ml="2">
                  {t(venue.district)}
                </Text>
              </HStack>

              <HStack alignItems="center" mt="4" ml="6">
                <RoundedCurrencyIcon />
                <Text fontWeight="400" fontSize="sm" ml="2">
                  {`${venue.fee} ${t("hkd")}`}
                </Text>
              </HStack>
            </HStack>
          </VStack>
        }
        footer={footer}
      />
    </Pressable>
  );
}

export default VenueItemCard;
