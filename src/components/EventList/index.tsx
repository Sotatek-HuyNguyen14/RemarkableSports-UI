import { parseISO } from "date-fns";
import { Box, HStack, Pressable, VStack, Text } from "native-base";
import React from "react";
import { EventResponse } from "../../models/responses/Event";
import { getTranslation } from "../../utils/translation";
import EventCard from "../Card/EventCard";

export interface EventListProps {
  eventList: EventResponse[];
  onPressEvent?: (event: EventResponse) => void;
  onEdit?: (event: EventResponse) => void;
  onDelete?: (event: EventResponse) => void;
  onRollCall?: (event: EventResponse) => void;
  onManage?: (event: EventResponse) => void;
}

const t = getTranslation(["component.EventList", "constant.button"]);

export default function EventList({
  eventList,
  onPressEvent,
  onEdit,
  onDelete,
  onRollCall,
  onManage,
}: EventListProps) {
  return (
    <VStack space="4" mb="5">
      {eventList.map((item) => {
        const shouldShowEdit = onEdit;
        const shouldShowDelete = onDelete;
        const shouldShowRollCall = onRollCall;
        const shouldShowManage = onManage;

        return (
          <Pressable
            key={`${item.id}${item.district}`}
            onPress={() => {
              onPressEvent?.(item);
            }}
          >
            <EventCard
              onPress={() => {
                onPressEvent?.(item);
              }}
              event={item}
              footer={
                <HStack space={3}>
                  {shouldShowManage && (
                    <Pressable
                      style={{ flex: 1 }}
                      onPress={() => {
                        onManage?.(item);
                      }}
                    >
                      <Box
                        bg="rs.primary_purple"
                        h="10"
                        flex={1}
                        borderRadius={16}
                        alignItems="center"
                        justifyContent="center"
                      >
                        <Text fontSize="md" textAlign="center" color="rs.white">
                          {t("Manage")}
                        </Text>
                      </Box>
                    </Pressable>
                  )}
                  {shouldShowEdit && (
                    <Pressable
                      style={{ flex: 1 }}
                      onPress={() => {
                        onEdit?.(item);
                      }}
                    >
                      <Box
                        bg="rs.white"
                        h="10"
                        flex={1}
                        borderWidth={0.5}
                        borderColor="rs.primary_purple"
                        borderRadius={16}
                        alignItems="center"
                        justifyContent="center"
                      >
                        <Text
                          fontSize="md"
                          textAlign="center"
                          color="rs.primary_purple"
                        >
                          {t("Edit")}
                        </Text>
                      </Box>
                    </Pressable>
                  )}
                </HStack>
              }
            />
          </Pressable>
        );
      })}
    </VStack>
  );
}
