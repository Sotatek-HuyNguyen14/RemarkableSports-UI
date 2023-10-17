import React, { useState } from "react";
import { Button, Heading, HStack, Image, Text, VStack } from "native-base";
import { NativeStackScreenProps } from "@react-navigation/native-stack";

import HeaderLayout from "../../../components/Layout/HeaderLayout";
import { MainStackNavigatorParamList } from "../../../routers/Types";
import ImageDirectory from "../../../assets";
import { format24HTo12H } from "../../../utils/date";
import { getTranslation } from "../../../utils/translation";
import DaysOfWeek from "../../../constants/DaysOfWeek";
import { formatFileUrl } from "../../../services/ServiceUtil";

export type VenueDetailsScreenProps = NativeStackScreenProps<
  MainStackNavigatorParamList,
  "ClubVenueDetails"
>;

const t = getTranslation([
  "screen.ClubScreens.VenueDetails",
  "screen.ClubScreens.Venue",
  "constant.area",
  "constant.button",
]);

export default function VenueDetails({
  navigation,
  route,
}: VenueDetailsScreenProps) {
  const { venue } = route.params;

  const imageSource = venue?.imageUrl
    ? { uri: formatFileUrl(venue?.imageUrl) }
    : ImageDirectory.VENUE;

  return (
    <HeaderLayout
      isSticky
      headerProps={{
        title: t("Venue details"),
      }}
    >
      <VStack m="defaultLayoutSpacing" flex={1} alignItems="center" space={3}>
        <Image
          alt="venue image"
          width="100%"
          source={imageSource}
          style={{
            flex: 1,
            alignSelf: "center",
            width: "100%",
            height: 160,
            borderRadius: 16,
          }}
        />
        <Heading size="md" alignSelf="flex-start">
          {venue?.name}
        </Heading>
        <VStack width="100%" flex={1} alignItems="flex-start" space={2}>
          <VStack space={1}>
            <Heading size="sm">{t("Venue address")}</Heading>
            <Text>{venue?.address}</Text>
          </VStack>
          <VStack space={1}>
            <Heading size="sm">{t("Enquiry Phone no")}</Heading>
            <Text>{venue?.phoneNo}</Text>
          </VStack>
          <VStack space={1}>
            <Heading size="sm">{t("Opening hours")}</Heading>
            <VStack width="100%">
              {venue?.sameForEveryDay
                ? DaysOfWeek.map((day) => (
                    <HStack key={day} width="100%">
                      <Text flex={0.2}>{day.slice(0, 3).toUpperCase()}</Text>
                      <Text flex={0.8}>
                        {format24HTo12H(venue?.openingTime)} -{" "}
                        {format24HTo12H(venue?.closingTime)}
                      </Text>
                    </HStack>
                  ))
                : DaysOfWeek.map((day, idx) => (
                    <HStack key={day} width="100%">
                      <Text flex={0.2}>{day.slice(0, 3).toUpperCase()}</Text>
                      <Text flex={0.8}>
                        {format24HTo12H(
                          venue?.listVenueOpeningHours[idx]
                            .openingTime as string
                        )}{" "}
                        -{" "}
                        {format24HTo12H(
                          venue?.listVenueOpeningHours[idx]
                            .closingTime as string
                        )}
                      </Text>
                    </HStack>
                  ))}
            </VStack>
          </VStack>
        </VStack>
        <VStack space={3} width="100%">
          <Button
            onPress={() => {
              navigation.navigate("BookingSchedules", { venue });
            }}
          >
            Booking Schedule
          </Button>
          <Button
            variant="outline"
            onPress={() => {
              navigation.navigate("ClubUpdateVenue", { venue });
            }}
          >
            Edit
          </Button>
        </VStack>
      </VStack>
      {/* <ConfirmationModal
        alertType="Fail"
        confirmText={t("Yes, delete")}
        cancelText={t("Cancel")}
        isOpen={isDeleteWindowOpen}
        onCancel={() => {
          setModalOpen(false);
        }}
        title={t("Are you sure to delete this venue you created?")}
        description={t(
          "Once the venue delete participants are not longer to reach this venue"
        )}
        onConfirm={async () => {
          setModalOpen(false);
          if (deleteVenueId) {
            try {
              await deleteVenue(deleteVenueId);
              if (!Toast.isActive("deleteSuccess"))
                Toast.show({
                  id: "deleteSuccess",
                  duration: 2000,
                  render: () => {
                    return (
                      <MessageToast
                        type={MesssageToastType.Success}
                        title={t("Your venue is deleted")}
                      />
                    );
                  },
                });
              mutateVenueBookings();
            } catch (error) {
              showApiToastError(error);
            }
          }
        }}
      /> */}
    </HeaderLayout>
  );
}
