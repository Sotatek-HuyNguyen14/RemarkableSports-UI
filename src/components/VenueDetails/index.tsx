import React from "react";
import { VStack, Image, HStack, Heading, Text } from "native-base";
import { format } from "date-fns";
import { Venue } from "../../models/requests/Venue";
import Card from "../Card/Card";
import LocationIcon from "../Icons/LocationIcon";
import RoundedCurrencyIcon from "../Icons/RoundedCurrencyIcon";
import { FORMAT_DATE_RESPONSE } from "../../utils/date";
import ImageDirectory from "../../assets";
import { formatFileUrl } from "../../services/ServiceUtil";
import { getTranslation } from "../../utils/translation";

export interface VenueDetailsProps {
  venue: Venue;
  shouldShowAllInfo?: boolean;
}

const t = getTranslation(["component.VenueDetails", "constant.area"]);

export function VenueDetails({
  venue,
  shouldShowAllInfo = true,
}: VenueDetailsProps) {
  let imageSource = ImageDirectory.VENUE;
  if (venue.imageUrl) {
    imageSource = {
      uri: formatFileUrl(venue.imageUrl),
    };
  }

  return (
    <VStack>
      <VStack space="4" p="2">
        <Image
          borderRadius="xl"
          w="100%"
          height={170}
          alt="Venue Image"
          source={imageSource}
          alignSelf="center"
        />
        <Text fontWeight="700" fontSize="lg">
          {venue.name}
        </Text>

        {/* Info */}
        <HStack>
          <LocationIcon />
          <VStack ml="3" alignItems="flex-start" justifyContent="flex-start">
            <Text>{t(venue.area)}</Text>
            <Text>{venue.address}</Text>
          </VStack>
        </HStack>

        <HStack>
          <RoundedCurrencyIcon />
          <VStack ml="3" alignItems="flex-start" justifyContent="flex-start">
            <Text>{`${venue.fee} ${t("hkd/hour")}`}</Text>
          </VStack>
        </HStack>
      </VStack>

      {shouldShowAllInfo && (
        <>
          {/* Date */}
          {venue.availableTimeSlots && venue.availableTimeSlots[0].fromTime && (
            <>
              <Heading mt="4" mb="4">
                {t("Date")}
              </Heading>
              <Card
                containerProps={{ style: { borderRadius: 16, marginTop: 4 } }}
                body={
                  <Text>
                    {format(
                      venue.availableTimeSlots[0].fromTime,
                      FORMAT_DATE_RESPONSE
                    )}
                  </Text>
                }
              />
            </>
          )}
          {/* Description */}
          {venue.description && (
            <>
              <Heading mt="4" mb="2">
                {t("Description")}
              </Heading>
              <Text>{venue.description}</Text>
            </>
          )}
          {/* Phone Number */}
          <Heading mt="2" mb="2">
            {t("Phone Number")}
          </Heading>
          <Text>{venue.phoneNo}</Text>
          {/* Number of tables */}
          <Heading mt="4" mb="2">
            {t("Number of tables")}
          </Heading>
          <Text>{venue.numberOfTables}</Text>
        </>
      )}
    </VStack>
  );
}
