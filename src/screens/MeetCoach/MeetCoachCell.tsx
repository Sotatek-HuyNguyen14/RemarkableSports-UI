import { Text, VStack, HStack, Heading, Button } from "native-base";
import React from "react";
import { StyleSheet } from "react-native";
import ImageDirectory from "../../assets";
import Card from "../../components/Card/Card";
import CalendarIcon from "../../components/Icons/CalendarIcon";
import ClockIcon from "../../components/Icons/ClockIcon";
import LocationIcon from "../../components/Icons/LocationIcon";
import RoundedCurrencyIcon from "../../components/Icons/RoundedCurrencyIcon";
import TextButton from "../../components/TextButton/TextButton";

const DEFAULT_AVT =
  "https://images.unsplash.com/photo-1494790108377-be9c29b29330?ixlib=rb-1.2.1&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=687&q=80";
function MeetCoachCell({
  coach,
  onPressCell,
}: {
  onPressCell: (coach: any) => void;
  coach: {
    name: string;
    location: string;
    rate: string;
    time: string;
    date: string;
  };
}): JSX.Element {
  const { name, location, rate, date, time } = coach;
  return (
    <Card
      header={<Heading>{`${name}`}</Heading>}
      body={
        <>
          <HStack>
            <HStack mt="3" alignItems="center">
              <LocationIcon />
              <Text fontSize="sm" fontWeight="400" ml="3">
                {location}
              </Text>
            </HStack>
            <HStack mt="3" alignItems="center" ml="4">
              <RoundedCurrencyIcon />
              <Text fontSize="sm" fontWeight="400" ml="3">
                {rate}
              </Text>
            </HStack>
          </HStack>
          <HStack mt="3" alignItems="center">
            <CalendarIcon />
            <Text fontSize="sm" fontWeight="400" ml="3">
              {date}
            </Text>
          </HStack>
          <HStack mt="3" alignItems="center">
            <ClockIcon />
            <Text fontSize="sm" fontWeight="400" ml="3">
              {time}
            </Text>
          </HStack>
        </>
      }
      footer={
        <Button
          onPress={() => {
            if (onPressCell) {
              onPressCell(coach);
            }
          }}
          w="40"
        >
          View
        </Button>
      }
      iconProps={{ source: { uri: DEFAULT_AVT } }}
      iconLabel={name}
    />
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 16,
    marginTop: 16,
    shadowOffset: { width: 5, height: 5 },
    shadowColor: "#0000001a",
    shadowOpacity: 1,
    shadowRadius: 2,
    borderColor: "#0000001a",
    backgroundColor: "white",
    borderRadius: 16,
    elevation: 3,
  },
  viewBtn: { width: 200, borderRadius: 70 },
});
export default MeetCoachCell;
