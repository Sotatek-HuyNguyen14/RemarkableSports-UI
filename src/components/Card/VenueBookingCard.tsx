import React, { ReactNode } from "react";
import { HStack, VStack, Avatar, Heading, Text, Button } from "native-base";
import { VenueBooking } from "../../models/Booking";
import ClockIcon from "../Icons/ClockIcon";
import CalendarIcon from "../Icons/CalendarIcon";
import Card from "./Card";
import { getTranslation } from "../../utils/translation";
import { formatUtcToLocalDate, formatUtcToLocalTime } from "../../utils/date";
import { formatFileUrl } from "../../services/ServiceUtil";
import { formatName, getUserName } from "../../utils/name";

const t = getTranslation("constant.button");

interface VenueBookingCardProps {
  venueBooking: VenueBooking;
  footer?: ReactNode;
}

export default function VenueBookingCard({
  venueBooking,
  footer,
}: VenueBookingCardProps) {
  return (
    <Card
      key={venueBooking.id}
      body={
        <VStack>
          {venueBooking.bookerInfo && (
            <HStack space="3">
              <Avatar
                source={
                  venueBooking.bookerInfo.profilePicture
                    ? {
                        uri: formatFileUrl(
                          venueBooking.bookerInfo.profilePicture
                        ),
                      }
                    : undefined
                }
              >
                {venueBooking.bookerInfo.firstName}
              </Avatar>

              <Heading mt="3">{getUserName(venueBooking.bookerInfo)}</Heading>
            </HStack>
          )}
          <HStack flexWrap="wrap" my="3">
            <Text>{venueBooking.venue.address}</Text>
          </HStack>
          <HStack>
            <HStack alignItems="center" space="3">
              <CalendarIcon />
              <Text>{formatUtcToLocalDate(venueBooking.fromTime)}</Text>
            </HStack>

            <HStack ml="10" alignItems="center" space="3">
              <ClockIcon />
              <Text>
                {formatUtcToLocalTime(venueBooking.fromTime)} -{" "}
                {formatUtcToLocalTime(venueBooking.toTime)}
              </Text>
            </HStack>
          </HStack>
        </VStack>
      }
      footer={footer}
      iconProps={
        venueBooking.bookerInfo?.profilePicture
          ? {
              source: {
                uri: formatFileUrl(venueBooking.bookerInfo?.profilePicture),
              },
            }
          : undefined
      }
    />
  );
}
