import { Pressable, Text, VStack, HStack } from "native-base";
import React from "react";
import Card from "../../../components/Card/Card";
import CalendarIcon from "../../../components/Icons/CalendarIcon";
import ClockIcon from "../../../components/Icons/ClockIcon";
import LocationIcon from "../../../components/Icons/LocationIcon";
import { formatDDMMYYY, formatHourMinute } from "../../../utils/date";
import { formatName, getUserName } from "../../../utils/name";

function CoachRequestItem({
  request,
  onPress,
}: {
  request: any;
  onPress: () => void;
}): JSX.Element {
  const { playerInfo, area, fromTime, endTime } = request;
  return (
    <Pressable onPress={onPress}>
      <Card
        onPress={onPress}
        header={
          <VStack alignItems="center" justifyContent="center">
            <VStack
              width="50"
              height="50"
              borderRadius="full"
              backgroundColor="#D9D9D9"
            />
            <Text fontSize="lg" fontWeight="bold" mt="1">
              {getUserName(playerInfo)}
            </Text>
          </VStack>
        }
        body={
          <VStack alignItems="center" justifyContent="center">
            <VStack flex="1">
              <HStack mt="3" alignItems="center">
                <LocationIcon />
                <Text fontSize="xs" fontWeight="normal" ml="2">
                  {`${area}`}
                </Text>
              </HStack>
              <HStack mt="3" alignItems="center">
                <CalendarIcon />
                <Text fontSize="xs" fontWeight="normal" ml="2">
                  {`${formatDDMMYYY(new Date(fromTime))}`}
                </Text>
              </HStack>
              <HStack mt="3" alignItems="center">
                <ClockIcon />
                <Text fontSize="xs" fontWeight="normal" ml="2">
                  {formatHourMinute(new Date(fromTime))}
                  {" - "}
                  {formatHourMinute(new Date(endTime))}
                </Text>
              </HStack>
            </VStack>
          </VStack>
        }
      />
    </Pressable>
  );
}

export default CoachRequestItem;
