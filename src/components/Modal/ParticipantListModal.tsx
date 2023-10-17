import { Avatar, Box, Heading, HStack, Modal, Text, VStack } from "native-base";
import React, { useState } from "react";
import {
  EventApplication,
  EventApplicationStatus,
  PaymentStatus,
} from "../../models/responses/Event";
import { formatFileUrl } from "../../services/ServiceUtil";
import { getTranslation } from "../../utils/translation";

export interface ParticipantListModalProps {
  isOpen: boolean;
  onClose?: () => void;
  modalType?: "Single" | "Double" | "Team";
  options?: EventApplication[];
}

const t = getTranslation([
  "component.Modal.ParticipantListModal",
  "constant.eventType",
]);

export default function ParticipantListModal({
  isOpen,
  onClose,
  modalType,
  options,
}: ParticipantListModalProps) {
  const waitingList = options?.filter(
    (val) => val.eventApplicationStatus === EventApplicationStatus.WaitingList
  );

  const memberList = options?.filter(
    (val) => val.eventApplicationStatus === EventApplicationStatus.Approved
  );

  const noDataComponent = <Text flex={1}>{t("No participant")}</Text>;

  const renderSingleOrDouble = (
    <Box>
      <Box justifyContent="center" pt="4">
        {modalType ? (
          <Text fontSize="lg" fontWeight="bold" marginBottom="4">
            {modalType === "Single" ? t("Single") : t("Double")}
          </Text>
        ) : (
          <Text fontSize="lg" fontWeight="bold" marginBottom="4">
            {t("Member list")}
          </Text>
        )}
      </Box>
      {memberList?.map((item, index) => (
        <HStack key={`${item.id}`} py="2" space={3} alignItems="center">
          <Avatar
            size="sm"
            source={
              item.applicant.profilePicture
                ? { uri: formatFileUrl(item.applicant.profilePicture) }
                : undefined
            }
          >
            {`${item.applicant.firstName?.charAt(
              0
            )}${item.applicant.lastName?.charAt(0)}`}
          </Avatar>
          {item.eventParticipants?.map((single) => (
            <Text key={single.id} color="rs.black">
              {single.participantName}
            </Text>
          ))}
        </HStack>
      ))}
      {(!memberList || !memberList?.length) && noDataComponent}
      <Box justifyContent="center" pt="2">
        <Text fontSize="lg" fontWeight="bold" marginBottom="4">
          {t("Waiting list")}
        </Text>
      </Box>
      {waitingList?.map((item, index) => (
        <HStack key={`${item.id}`} py="2" space={3} alignItems="center">
          <Avatar
            size="sm"
            source={
              item.applicant.profilePicture
                ? { uri: formatFileUrl(item.applicant.profilePicture) }
                : undefined
            }
          >
            {`${item.applicant.firstName?.charAt(
              0
            )}${item.applicant.lastName?.charAt(0)}`}
          </Avatar>
          {item.eventParticipants?.map((single) => (
            <Text key={single.id} color="rs.black">
              {single.participantName}
            </Text>
          ))}
        </HStack>
      ))}
      {(!waitingList || !waitingList?.length) && noDataComponent}
    </Box>
  );

  const renderTeam = (
    <Box>
      <Box justifyContent="center" pt="4">
        <Text fontSize="lg" fontWeight="bold" marginBottom="4">
          {t("Team")}
        </Text>
      </Box>
      {memberList?.map((item, index) => (
        <VStack key={`${item.id}`}>
          <HStack space={3} alignItems="center">
            <Avatar
              size="sm"
              source={
                item.applicant.profilePicture
                  ? { uri: formatFileUrl(item.applicant.profilePicture) }
                  : undefined
              }
            >
              {`${item.applicant.firstName?.charAt(
                0
              )}${item.applicant.lastName?.charAt(0)}`}
            </Avatar>
            <Text color="rs.black">{item.teamName}</Text>
          </HStack>
          {item.eventParticipants?.map((val, jIndex) => {
            if (jIndex % 2 !== 0) {
              return (
                <HStack ml="46" flexWrap="wrap" space={2} key={`${val.id}`}>
                  <Text
                    key={`${item.eventParticipants[jIndex - 1].id}`}
                    flex={1}
                    color="rs_secondary.grey"
                  >
                    {item.eventParticipants[jIndex - 1].participantName}
                  </Text>
                  <Text key={`${val.id}`} flex={1} color="rs_secondary.grey">
                    {val.participantName}
                  </Text>
                </HStack>
              );
            }
            if (jIndex === item.eventParticipants.length - 1) {
              return (
                <HStack ml="46" flexWrap="wrap" space={2} key={`${val.id}`}>
                  <Text key={`${val.id}`} flex={1} color="rs_secondary.grey">
                    {val.participantName}
                  </Text>
                </HStack>
              );
            }
          })}
        </VStack>
      ))}
      {(!memberList || !memberList?.length) && noDataComponent}
      <Box justifyContent="center" pt="4">
        <Text fontSize="lg" fontWeight="bold" marginBottom="4">
          {t("Waiting list")}
        </Text>
      </Box>

      {waitingList?.map((item, index) => (
        <VStack key={`${item.id}`}>
          <HStack space={3} alignItems="center">
            <Avatar
              size="sm"
              source={
                item.applicant.profilePicture
                  ? { uri: formatFileUrl(item.applicant.profilePicture) }
                  : undefined
              }
            >
              {`${item.applicant.firstName?.charAt(
                0
              )}${item.applicant.lastName?.charAt(0)}`}
            </Avatar>
            <Text color="rs.black">{item.teamName}</Text>
          </HStack>

          {item.eventParticipants?.map((val, jIndex) => {
            if (jIndex % 2 !== 0) {
              return (
                <HStack key={`${val.id}`} ml="46" flexWrap="wrap" space={2}>
                  <Text
                    key={`${item.eventParticipants[jIndex - 1].id}`}
                    flex={1}
                    color="rs_secondary.grey"
                  >
                    {item.eventParticipants[jIndex - 1].participantName}
                  </Text>
                  <Text key={`${val.id}`} flex={1} color="rs_secondary.grey">
                    {val.participantName}
                  </Text>
                </HStack>
              );
            }
            if (jIndex === item.eventParticipants.length - 1) {
              return (
                <HStack ml="46" flexWrap="wrap" space={2} key={`${val.id}`}>
                  <Text key={`${val.id}`} flex={1} color="rs_secondary.grey">
                    {val.participantName}
                  </Text>
                </HStack>
              );
            }
          })}
        </VStack>
      ))}
      {(!waitingList || !waitingList?.length) && noDataComponent}
    </Box>
  );

  return (
    <Modal
      size="full"
      isOpen={isOpen}
      onClose={() => {
        onClose?.();
      }}
    >
      <Modal.Content mt="auto" px="4" pb="4">
        <Modal.CloseButton mt="3" />
        <Box justifyContent="center" pt="6">
          <Heading lineHeight={28}>{t("participant list")}</Heading>
        </Box>
        <Modal.Body px="0">
          <VStack flex="1">
            {modalType !== "Team" && renderSingleOrDouble}
          </VStack>
          <VStack flex="1">{modalType === "Team" && renderTeam}</VStack>
        </Modal.Body>
      </Modal.Content>
    </Modal>
  );
}
