import React from "react";
import { Heading, HStack, Text, VStack } from "native-base";
import { format } from "date-fns";

import Card from "./Card";
import CalendarIcon from "../Icons/CalendarIcon";
import ClockIcon from "../Icons/ClockIcon";
import LocationIcon from "../Icons/LocationIcon";

import { GameResponse } from "../../models/Response";
import BadgeHeader from "./BadgeHeader";
import { ActivityType } from "../../models/Request";
import { FORMAT_DATE_REQUEST } from "../../utils/date";
import { getTranslation } from "../../utils/translation";

const t = getTranslation(["component.Card.GameCard", "constant.district"]);

export default function GameCard({ game }: { game: GameResponse }) {
  return (
    <Card
      header={
        <VStack space="2">
          <BadgeHeader type={ActivityType.Game} badgeText={game.level} />
          <Heading>{game.name}</Heading>
        </VStack>
      }
      body={
        <>
          <HStack flexWrap="wrap">
            <HStack flex="1" alignItems="center" space="2">
              <CalendarIcon />
              <Text>{format(game.date, FORMAT_DATE_REQUEST)}</Text>
            </HStack>
            <HStack flex="1" alignItems="center" space="2">
              <ClockIcon />
              <Text>
                {game.fromTime} - {game.toTime}
              </Text>
            </HStack>
          </HStack>
          <HStack alignItems="center" space="2">
            <LocationIcon />
            <Text flex="1" numberOfLines={2}>
              {t(game.district)}
            </Text>
          </HStack>
        </>
      }
    />
  );
}
