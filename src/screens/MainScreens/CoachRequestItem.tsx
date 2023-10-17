import { Pressable, Text, VStack, HStack } from "native-base";
import React from "react";
import { StyleSheet } from "react-native";
import CalendarIcon from "../../components/Icons/CalendarIcon";
import ClockIcon from "../../components/Icons/ClockIcon";
import LocationIcon from "../../components/Icons/LocationIcon";
import RoundedCurrencyIcon from "../../components/Icons/RoundedCurrencyIcon";
import { CoachRequest } from "../../models/Request";

function CoachRequestItem({
  request,
  navigation,
}: {
  navigation: any;
  request: {
    name: string;
    location: string;
    date: string;
    time: string;
    rate: string;
  };
}): JSX.Element {
  const { name, location, date, time, rate } = request;
  return (
    <Pressable
      style={styles.requestContainer}
      onPress={() => {
        navigation.navigate(RouteName.REQUEST_DETAILS);
      }}
    >
      <VStack
        width={50}
        height={50}
        borderRadius="full"
        backgroundColor="#D9D9D9"
      />
      <Text fontSize="lg" fontWeight="700" mt="1">
        {name}
      </Text>
      <VStack flex="1">
        <HStack mt="3">
          <LocationIcon />
          <Text fontSize="xs" fontWeight="400" ml="2">
            {location}
          </Text>
        </HStack>
        <HStack mt="3">
          <CalendarIcon />
          <Text fontSize="xs" fontWeight="400" ml="2">
            {date}
          </Text>
        </HStack>
        <HStack mt="3">
          <ClockIcon />
          <Text fontSize="xs" fontWeight="400" ml="2">
            {time}
          </Text>
        </HStack>
        <HStack mt="3">
          <RoundedCurrencyIcon />
          <Text fontSize="xs" fontWeight="400" ml="2">
            {rate}
          </Text>
        </HStack>
      </VStack>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  requestInfo: {
    marginLeft: 7,
    fontWeight: "400",
    fontSize: 12,
  },
  requestContainer: {
    minWidth: 140,
    minHeight: 200,
    marginLeft: 16,
    alignItems: "center",

    justifyContent: "flex-start",
    alignContent: "center",
    padding: 16,
    borderRadius: 16,
    shadowOffset: { width: 5, height: 5 },
    shadowColor: "#0000001a",
    shadowOpacity: 1,
    shadowRadius: 2,
    borderColor: "#0000001a",
    backgroundColor: "white",
    elevation: 3,
  },
  infoText: { marginLeft: 7, fontWeight: "400", fontSize: 12 },
});

export default CoachRequestItem;
