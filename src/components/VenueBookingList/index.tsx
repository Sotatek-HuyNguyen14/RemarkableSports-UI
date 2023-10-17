import { VStack, Pressable, Button, HStack } from "native-base";
import React from "react";
import { VenueBooking } from "../../models/Booking";
import { isEventFinished } from "../../services/EventServices";
import { getTranslation } from "../../utils/translation";
import VenueBookingCard from "../Card/VenueBookingCard";

interface VenueBookingCardListProps {
  venueBookings: VenueBooking[];
  onPressBookingCard: (booking: VenueBooking) => void;
  onPressQuickApprove: (booking: VenueBooking) => void;
}

const t = getTranslation([
  "component.Card.VenueBookingCard",
  "constant.button",
]);

export default function VenueBookingList({
  venueBookings,
  onPressBookingCard,
  onPressQuickApprove,
}: VenueBookingCardListProps) {
  const isVenueBookingFinished = (venueBooking: VenueBooking) => {
    if (venueBooking.toTime) {
      const isOutTime = venueBooking.toTime.getTime() < new Date().getTime();
      return !isOutTime;
    }
    return false;
  };

  const localVenueBookings = venueBookings.filter((val) =>
    isVenueBookingFinished(val)
  );

  return (
    <VStack>
      {Array.isArray(localVenueBookings) &&
        localVenueBookings.map((booking) => {
          return (
            <Pressable
              key={booking.id}
              mb="5"
              onPress={() => onPressBookingCard(booking)}
            >
              <VenueBookingCard
                venueBooking={booking}
                footer={
                  <Button
                    w="40"
                    h="12"
                    borderRadius="16"
                    py="1"
                    onPress={() => onPressQuickApprove(booking)}
                  >
                    {t("Quick Approve")}
                  </Button>
                }
              />
            </Pressable>
          );
        })}
    </VStack>
  );
}
