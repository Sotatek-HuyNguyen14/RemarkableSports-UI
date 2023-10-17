import React from "react";
import { Button, Heading, HStack, Text, VStack } from "native-base";
import Card from "./Card";
import LocationIcon from "../Icons/LocationIcon";
import { getTranslation } from "../../utils/translation";
import { FixtureResponse } from "../../models/responses/League";

const t = getTranslation(["component.Card.FixtureCard", "constant.button"]);
export default function FixtureCard({
  fixture,
  isShowSubmit,
  onPress,
}: {
  fixture: FixtureResponse;
  isShowSubmit?: boolean;
  onPress?: () => void;
}) {
  // 3day 259200000 ms reminder UpComing
  const isShowUpComing =
    new Date(`${fixture.date} ${fixture.time}`).getTime() - 259200000 <
      new Date().getTime() &&
    new Date(`${fixture.date} ${fixture.time}`).getTime() >
      new Date().getTime();

  return (
    <Card
      body={
        <VStack>
          {isShowUpComing && (
            <Heading mb="2" textAlign="center" color="rs.primary_purple">
              {t("My team up-coming match")}
            </Heading>
          )}
          <Text mb={1} textAlign="center">
            {fixture.date}
          </Text>
          <HStack justifyContent="space-between" alignItems="center">
            <Heading
              fontSize={14}
              flex={2}
              numberOfLines={3}
              flexWrap="wrap"
              lineHeight={20}
              textAlign="center"
            >
              {fixture.homeTeam.name}
            </Heading>
            <Heading fontSize={24} flex={1.5} textAlign="center">
              {fixture?.time?.substring(-1, 5)}
            </Heading>
            <Heading
              fontSize={14}
              flex={2}
              numberOfLines={3}
              textAlign="center"
              flexWrap="wrap"
              lineHeight={20}
            >
              {fixture.awayTeam.name}
            </Heading>
          </HStack>
          <HStack alignItems="center" justifyContent="center" space="2" mt={4}>
            <LocationIcon />
            <Text
              textAlign="center"
              color="rs_secondary.grey"
              numberOfLines={2}
            >
              {fixture.venue}
            </Text>
          </HStack>
          {isShowSubmit && (
            <HStack alignItems="center" mt="2">
              <Button flex={1} p="2" onPress={onPress}>
                {t("Submit")}
              </Button>
            </HStack>
          )}
        </VStack>
      }
    />
  );
}
