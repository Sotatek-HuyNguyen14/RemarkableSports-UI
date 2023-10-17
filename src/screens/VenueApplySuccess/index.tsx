/* eslint-disable no-param-reassign */
import React from "react";
import { Heading, HStack, Image, Text, VStack } from "native-base";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { RouteProp } from "@react-navigation/native";
import { MainStackNavigatorParamList } from "../../routers/Types";
import ImageDirectory from "../../assets";
import LocationIcon from "../../components/Icons/LocationIcon";
import Card from "../../components/Card/Card";
import CalendarIcon from "../../components/Icons/CalendarIcon";
import ClockIcon from "../../components/Icons/ClockIcon";
import SuccessMessage from "../../components/Feedback/SuccessMessage";
import MoneyIcon from "../../components/Icons/MoneyIcon";
import {
  format24HTo12H,
  formatUtcToLocalDate,
  formatUtcToLocalTime,
} from "../../utils/date";
import { getTranslation } from "../../utils/translation";
import { formatFileUrl } from "../../services/ServiceUtil";
import { isBlank } from "../../utils/strings";

const t = getTranslation([
  "constant.area",
  "screen.PlayerScreens.VenueApplySuccess",
]);

export type VenueApplySuccessScreenNavigationProp = NativeStackNavigationProp<
  MainStackNavigatorParamList,
  "VenueApplySuccess"
>;

export type VenueApplySuccessRouteProp = RouteProp<
  MainStackNavigatorParamList,
  "VenueApplySuccess"
>;

interface VenueApplySuccessScreenProps {
  navigation: VenueApplySuccessScreenNavigationProp;
  route: VenueApplySuccessRouteProp;
}

export default function VenueApplySuccess({
  route,
}: VenueApplySuccessScreenProps) {
  const {
    name,
    area,
    openingTime,
    closingTime,
    address,
    fee,
    availableTimeSlots,
    imageUrl,
  } = route.params.venue;
  const { appliedFromTime, appliedToTime } = route.params;

  const fromTime = availableTimeSlots?.[0].fromTime;
  const toTime = availableTimeSlots?.[0].toTime;

  let imageSource = ImageDirectory.VENUE;
  if (imageUrl) {
    imageSource = {
      uri: formatFileUrl(imageUrl),
    };
  }

  return (
    <SuccessMessage
      mx="defaultLayoutSpacing"
      headerLabel={t("Successful Applied")}
      buttonLabel={t("OK")}
      destination="PlayerNavigator"
      nestedDestination="VenueList"
    >
      <Heading mb="5">{t("Applied details")}</Heading>
      <Card
        body={
          <>
            <Image
              borderRadius="2xl"
              w="100%"
              h={170}
              alt="Venue Image"
              source={imageSource}
              alignSelf="center"
            />
            <Text fontWeight="700" fontSize="lg">
              {name}
            </Text>
            <HStack>
              <LocationIcon />
              <VStack
                ml="3"
                mr="5"
                alignItems="flex-start"
                justifyContent="flex-start"
              >
                <Text>{t(area)}</Text>
                <Text>{address}</Text>
              </VStack>
            </HStack>

            <HStack>
              <MoneyIcon />
              <VStack
                ml="3"
                alignItems="flex-start"
                justifyContent="flex-start"
              >
                <Text>{`${fee} ${t("hkd/hour")}`}</Text>
              </VStack>
            </HStack>
          </>
        }
        footer={
          <>
            <Text fontWeight="700" fontSize="md">
              {t("Selected date")}
            </Text>
            <HStack alignItems="center">
              <CalendarIcon />
              <Text ml="3">
                {fromTime ? formatUtcToLocalDate(fromTime) : ""}
              </Text>
            </HStack>
            <Text fontWeight="700" fontSize="md">
              {t("Selected time")}
            </Text>
            {!isBlank(appliedFromTime) && !isBlank(appliedToTime) && (
              <HStack alignItems="center">
                <ClockIcon />
                <Text ml="3">{`${appliedFromTime} - ${appliedToTime}`}</Text>
              </HStack>
            )}
          </>
        }
      />
    </SuccessMessage>
  );
}
