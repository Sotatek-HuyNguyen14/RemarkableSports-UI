/* eslint-disable no-unreachable-loop */
/* eslint-disable guard-for-in */
/* eslint-disable no-restricted-syntax */
import React from "react";
import {
  Avatar,
  Heading,
  HStack,
  VStack,
  useTheme,
  Badge,
  Text,
  Box,
} from "native-base";
import { OnboardingResponse } from "../../models/responses/Onboarding";
import LocationIcon from "../Icons/LocationIcon";
import MoneyIcon from "../Icons/MoneyIcon";
import MedalIcon from "../Icons/MedalIcon";
import { Coach } from "../../models/User";
import { formatFileUrl } from "../../services/ServiceUtil";
import { formatName, getUserName } from "../../utils/name";

function renderDistrict(district: string[]) {
  const result = [];
  const { length } = district;
  let value: string;
  for (let i = 0; i < length; i += 1) {
    value = district[i];
    if (i !== length - 1) value += " | ";
    result.push(value);
  }
  return result;
}

function renderAllProperties(user: OnboardingResponse) {
  const content = [];
  for (const property in user.data) {
    content.push(`${property}: ${(user.data as any)[property]}`);
  }
  return content;
}

export default function CoachDetails({
  user,
  isAdminView = false,
}: {
  user: OnboardingResponse;
  isAdminView?: boolean;
}) {
  const theme = useTheme();
  const coach = user.data as Coach;
  return (
    <VStack flex="1" space="8">
      {/* Top general info */}
      <HStack mt="10" space="2">
        <Avatar
          source={
            coach.profilePicture
              ? { uri: formatFileUrl(coach.profilePicture) }
              : undefined
          }
        >
          {coach.firstName}
        </Avatar>
        <VStack space="2" flex="1">
          <Heading>{getUserName(coach)}</Heading>
          <Badge bg={theme.colors.rs.GPP_lightBlue} alignSelf="flex-start">
            {`Rank ${coach.ranking}`}
          </Badge>
          <Text>{renderDistrict(coach.districts)}</Text>
        </VStack>
      </HStack>
      {/* Four boxes info */}
      <HStack space="4">
        <VStack alignItems="center" flex="1">
          <Heading mb="4">{coach.handUsed}</Heading>
          <Text alignSelf="center">hand</Text>
        </VStack>
        <VStack alignItems="center" flex="1">
          <Heading mb="2">
            {new Date().getFullYear() - coach.startYearAsPlayer}
          </Heading>
          <Text textAlign="center">Years</Text>
          <Text textAlign="center">as player</Text>
        </VStack>
        <VStack alignItems="center" flex="1">
          <Heading mb="2">
            {new Date().getFullYear() - coach.startYearAsCoach}
          </Heading>
          <Text textAlign="center">Years</Text>
          <Text textAlign="center">as coach</Text>
        </VStack>
        <VStack alignItems="center" flex="1">
          <Heading mb="4"> </Heading>
          <Text textAlign="center">HKD/hour</Text>
        </VStack>
      </HStack>
      {/* For admin screen only, to be remove later */}
      {isAdminView && <Box>{renderAllProperties(user)}</Box>}
      {/* Icon info */}
      <HStack space="2" maxW="2/3">
        <LocationIcon />
        <Text>Central</Text>
        <MoneyIcon />
        <Text>{` hkd/hour`}</Text>
      </HStack>
      <HStack space="2" maxW="2/3">
        <MedalIcon />
        <Text numberOfLines={2}>{coach.achievements}</Text>
      </HStack>
      {/* Body info */}
      <VStack>
        <Heading mb="2">Description</Heading>
        <Text> </Text>
      </VStack>
      <VStack>
        <Heading mb="2">Achievement</Heading>
        {coach.achievements?.map((value) => {
          return <Text key={value}>· {value}</Text>;
        })}
      </VStack>
      <VStack>
        <Heading mb="2">Qualification</Heading>
        <Text>HKTTA ID: {coach.hkttaId}</Text>
        <Text>License: {coach.licenseNumber}</Text>
      </VStack>
    </VStack>
  );
}
