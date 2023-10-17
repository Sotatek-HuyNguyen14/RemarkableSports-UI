import { Text, HStack, Heading, Button } from "native-base";
import React from "react";
import Card from "../../../components/Card/Card";
import CalendarIcon from "../../../components/Icons/CalendarIcon";
import ClockIcon from "../../../components/Icons/ClockIcon";
import LocationIcon from "../../../components/Icons/LocationIcon";
import { formatDDMMYYY, formatHourMinute } from "../../../utils/date";
import { formatName, getUserName } from "../../../utils/name";

const DEFAULT_AVT =
  "https://images.unsplash.com/photo-1494790108377-be9c29b29330?ixlib=rb-1.2.1&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=687&q=80";

function CoachRequestsCell({
  request,
  onPressCell,
}: {
  onPressCell: (coach: any) => void;
  request: any;
}): JSX.Element {
  const { playerInfo, area, fromTime, endTime } = request;
  return (
    <Card
      header={<Heading>{getUserName(playerInfo)}</Heading>}
      body={
        <>
          <HStack>
            <HStack mt="1" alignItems="center">
              <LocationIcon />
              <Text fontSize="sm" fontWeight="400" ml="3">
                {area}
              </Text>
            </HStack>
          </HStack>
          <HStack mt="1" alignItems="center">
            <CalendarIcon />
            <Text fontSize="sm" fontWeight="400" ml="3">
              {formatDDMMYYY(new Date(fromTime))}
            </Text>
          </HStack>
          <HStack mt="1" alignItems="center">
            <ClockIcon />
            <Text fontSize="sm" fontWeight="400" ml="3">
              {formatHourMinute(new Date(fromTime))}
              {" - "}
              {formatHourMinute(new Date(endTime))}
            </Text>
          </HStack>
        </>
      }
      footer={
        <Button
          onPress={() => {
            if (onPressCell) {
              onPressCell(request);
            }
          }}
          w="40"
        >
          View
        </Button>
      }
      iconProps={{ source: { uri: DEFAULT_AVT } }}
      iconLabel={getUserName(playerInfo) as string}
    />
  );
}

export default CoachRequestsCell;
